import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BarChart3, 
  QrCode, 
  Sliders, 
  Settings, 
  Lock, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  DollarSign,
  Wallet,
  Building2,
  PieChart as PieIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AdminUsersManagementDesk } from './AdminUsersManagementDesk';
import { KYCDocumentReviewDesk } from './KYCDocumentReviewDesk';
import { TransactionManagementDesk } from './TransactionManagementDesk';
import { WalletManagementDesk } from './WalletManagementDesk';
import { PaymentManagementDesk } from './PaymentManagementDesk';
import { AdminStatsDesk } from './AdminStatsDesk';
import { PriceManagementDesk } from './PriceManagementDesk';
import { SystemSettingsDesk } from './SystemSettingsDesk';
import { VietQRManagementDesk } from './VietQRManagementDesk';

export const AdminDashboard: React.FC = () => {
  const { t, addNotification, lockAdminSession, setActiveTab } = useApp();
  
  // Core Admin Desks matching the system structure:
  // 1. Quản lý người dùng
  // 2. Quản lý giao dịch (2.1 Mua Crypto & 2.2 Bán Crypto)
  // 3. Quản lý Ví nhận
  // 4. Quản lý thanh toán
  // 5. Dashboard thống kê
  // 6. Quản lý KYC
  // 7. Quản lý thị trường
  // 8. Cài đặt hệ thống
  const [adminTab, setAdminTab] = useState<
    'admin_users' | 'transaction_management' | 'wallet_management' | 'payment_management' | 'stats_overview' | 'kyc_review' | 'market_management' | 'system_settings'
  >('admin_users');

  const [stats, setStats] = useState<any>(null);

  const loadData = async () => {
    try {
      const s = await api.getAdminStats();
      setStats(s);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner & Admin Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Dashboard Admin</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Quản Trị Toàn Quyền OTC / Exchange
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống quản lý OTC Gateway: Người dùng, Giao dịch 2 chiều, Ví nhận Crypto, Thanh toán VND, Thống kê & Cài đặt
            </p>
          </div>
        </div>

        {/* Lock & Exit Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              lockAdminSession();
              setActiveTab('exchange');
              addNotification('info', 'Đã khóa bàn làm việc quản trị viên an toàn.');
            }}
            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            title="Khóa bàn làm việc và trở về giao diện khách hàng"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Khóa & Thoát Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold gap-1 w-full">
          {/* 1. Quản lý người dùng */}
          <button
            id="admin-tab-users-btn"
            type="button"
            onClick={() => setAdminTab('admin_users')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'admin_users'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>1. Quản Lý Người Dùng</span>
          </button>

          {/* 2. Quản lý giao dịch */}
          <button
            id="admin-tab-transactions-btn"
            type="button"
            onClick={() => setAdminTab('transaction_management')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'transaction_management'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>2. Quản Lý Giao Dịch</span>
          </button>

          {/* 3. Quản lý Ví nhận */}
          <button
            id="admin-tab-wallets-btn"
            type="button"
            onClick={() => setAdminTab('wallet_management')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'wallet_management'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>3. Quản Lý Ví Nhận</span>
          </button>

          {/* 4. Quản lý thanh toán */}
          <button
            id="admin-tab-payments-btn"
            type="button"
            onClick={() => setAdminTab('payment_management')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'payment_management'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>4. Quản Lý Thanh Toán</span>
          </button>

          {/* 5. Dashboard thống kê */}
          <button
            id="admin-tab-stats-btn"
            type="button"
            onClick={() => setAdminTab('stats_overview')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'stats_overview'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-4 h-4 text-teal-400" />
            <span>5. Dashboard Thống Kê</span>
          </button>

          {/* 6. Quản lý KYC */}
          <button
            id="admin-tab-kyc-btn"
            type="button"
            onClick={() => setAdminTab('kyc_review')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'kyc_review'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>6. Quản Lý KYC</span>
            {stats?.pendingKYC > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                {stats.pendingKYC}
              </span>
            )}
          </button>

          {/* 7. Quản lý thị trường */}
          <button
            id="admin-tab-market-btn"
            type="button"
            onClick={() => setAdminTab('market_management')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'market_management'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>7. Quản Lý Thị Trường</span>
          </button>

          {/* 8. Cài đặt hệ thống */}
          <button
            id="admin-tab-settings-btn"
            type="button"
            onClick={() => setAdminTab('system_settings')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              adminTab === 'system_settings'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>8. Cài Đặt Hệ Thống</span>
          </button>
        </div>
      </div>

      {/* Render Active Workspace Desk */}
      <div className="animate-fade-in">
        {adminTab === 'admin_users' && (
          <AdminUsersManagementDesk />
        )}

        {adminTab === 'transaction_management' && (
          <TransactionManagementDesk />
        )}

        {adminTab === 'wallet_management' && (
          <WalletManagementDesk />
        )}

        {adminTab === 'payment_management' && (
          <PaymentManagementDesk />
        )}

        {adminTab === 'stats_overview' && (
          <AdminStatsDesk />
        )}

        {adminTab === 'kyc_review' && (
          <KYCDocumentReviewDesk onRefreshStats={loadData} />
        )}

        {adminTab === 'market_management' && (
          <PriceManagementDesk onRefreshAll={loadData} />
        )}

        {adminTab === 'system_settings' && (
          <div className="space-y-6">
            <SystemSettingsDesk />
            <VietQRManagementDesk />
          </div>
        )}
      </div>
    </div>
  );
};
