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
  PieChart as PieIcon,
  ChevronRight
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
  const { t, language, addNotification, lockAdminSession, setActiveTab, setCurrentPortal } = useApp();
  
  // Core Admin Desks matching operational areas:
  const [adminTab, setAdminTab] = useState<
    'admin_users' | 'transaction_management' | 'wallet_management' | 'payment_management' | 'vietqr_config' | 'stats_overview' | 'kyc_review' | 'market_management' | 'system_settings'
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

  const adminDesks = [
    {
      id: 'admin_users' as const,
      label: language === 'vi' ? '1. Người Dùng' : '1. Users',
      icon: Users,
      color: 'purple',
      badge: null
    },
    {
      id: 'transaction_management' as const,
      label: language === 'vi' ? '2. Giao Dịch OTC' : '2. OTC Trades',
      icon: BarChart3,
      color: 'cyan',
      badge: stats?.pendingOrders > 0 ? stats.pendingOrders : null
    },
    {
      id: 'wallet_management' as const,
      label: language === 'vi' ? '3. Ví Ký Quỹ' : '3. Wallets',
      icon: Wallet,
      color: 'amber',
      badge: null
    },
    {
      id: 'payment_management' as const,
      label: language === 'vi' ? '4. Thanh Toán' : '4. Payments',
      icon: Building2,
      color: 'emerald',
      badge: null
    },
    {
      id: 'vietqr_config' as const,
      label: language === 'vi' ? '5. Tùy Chỉnh VietQR' : '5. VietQR Config',
      icon: QrCode,
      color: 'emerald',
      badge: null
    },
    {
      id: 'stats_overview' as const,
      label: language === 'vi' ? '6. Thống Kê' : '6. Statistics',
      icon: PieIcon,
      color: 'teal',
      badge: null
    },
    {
      id: 'kyc_review' as const,
      label: language === 'vi' ? '7. Duyệt KYC' : '7. KYC Review',
      icon: UserCheck,
      color: 'blue',
      badge: stats?.pendingKYC > 0 ? stats.pendingKYC : null
    },
    {
      id: 'market_management' as const,
      label: language === 'vi' ? '8. Thị Trường' : '8. Market & Rates',
      icon: Sliders,
      color: 'indigo',
      badge: null
    },
    {
      id: 'system_settings' as const,
      label: language === 'vi' ? '9. Cài Đặt' : '9. Settings',
      icon: Settings,
      color: 'rose',
      badge: null
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-fade-in px-1 sm:px-0">
      
      {/* Top Banner & Fast Management Control Panel */}
      <div className="bg-slate-900/90 border border-purple-950/70 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                {language === 'vi' ? 'Bàn Làm Việc Quản Trị Viên' : 'Master Operations Console'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-500/30">
                Toàn Quyền 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
              {language === 'vi' 
                ? 'Kiểm soát người dùng, duyệt KYC, khớp đơn VietQR & Stripe, quản lý ví ký quỹ và cấu hình tỷ giá OTC.'
                : 'Control users, approve KYC, match VietQR & Stripe orders, manage custody wallets and OTC spread.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              lockAdminSession();
              setCurrentPortal('user');
              setActiveTab('exchange');
              addNotification('info', 'Đã khóa bàn làm việc quản trị viên an toàn.');
            }}
            className="px-3 py-2 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            title="Khóa bàn làm việc và trở về website khách hàng"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Khóa Admin</span>
          </button>
        </div>
      </div>

      {/* 8 Admin Management Desks Navigation Bar (Responsive Scrolling & Clean Grid) */}
      <div className="bg-slate-900/90 border border-slate-800/90 p-1.5 sm:p-2 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-1.5">
          {adminDesks.map(desk => {
            const Icon = desk.icon;
            const isActive = adminTab === desk.id;
            return (
              <button
                key={desk.id}
                id={`admin-tab-${desk.id}-btn`}
                type="button"
                onClick={() => setAdminTab(desk.id)}
                className={`shrink-0 sm:shrink px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 min-h-[44px] ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span className="whitespace-nowrap truncate">{desk.label}</span>
                {desk.badge !== null && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 shrink-0">
                    {desk.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Desk Component */}
      <div className="animate-fade-in pb-12">
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

        {adminTab === 'vietqr_config' && (
          <VietQRManagementDesk />
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
          <SystemSettingsDesk />
        )}
      </div>
    </div>
  );
};
