import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Bell, 
  RefreshCw, 
  LayoutDashboard,
  Server,
  Activity,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

interface AdminHeaderProps {
  onRefreshData?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onRefreshData }) => {
  const { 
    language, 
    setLanguage, 
    t, 
    setCurrentPortal, 
    lockAdminSession, 
    setActiveTab,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    addNotification,
    currentAdmin,
    isMasterAdmin
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshData) onRefreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification('info', 'Đã cập nhật dữ liệu', 'Dữ liệu giao dịch, KYC và thị trường đã được làm mới.', undefined, 'admin');
    }, 600);
  };

  const handleAdminLogout = () => {
    lockAdminSession();
    setCurrentPortal('user');
    setActiveTab('exchange');
    addNotification('system_alert', 'Đã đăng xuất', 'Phiên làm việc quản trị đã kết thúc.', undefined, 'admin');
  };

  return (
    <header className="w-full border-b border-purple-900/50 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-purple-950/20">
      
      {/* Top Admin Operational Ribbon */}
      <div className="border-b border-purple-900/30 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-3 text-purple-300 font-medium overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-white text-[11px]">NEXUS MASTER ADMIN CORE</span>
            </div>
            <span className="text-purple-400/40 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center space-x-1 text-slate-300 text-[11px] shrink-0">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gateway: <strong className="text-emerald-400">99.99% Online</strong></span>
            </div>
            <span className="text-purple-400/40 hidden md:inline">|</span>
            <div className="hidden md:flex items-center space-x-1 text-slate-300 text-[11px] shrink-0">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>P2P Ledger: <strong className="text-purple-300">Synchronized</strong></span>
            </div>
          </div>

          {/* Admin Identity Status */}
          <div className="flex items-center space-x-2 shrink-0 text-[11px]">
            <span className="text-slate-400">Tài khoản:</span>
            <span className="font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/60">
              @{currentAdmin?.username || 'Admin'}
            </span>
          </div>

        </div>
      </div>

      {/* Main Admin Navigation Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Admin Brand Logo & Workspace Tag */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">NEXUS</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                ADMIN DESK
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-purple-300/70 font-medium leading-none hidden sm:block">
              {language === 'vi' ? 'Hệ Thống Quản Trị Phân Quyền & Báo Cáo Kế Toán' : 'Administrative Operations & Accounting Desk'}
            </p>
          </div>
        </div>

        {/* Center Admin Badge Indicator */}
        <div className="hidden md:flex items-center bg-slate-900/90 px-4 py-2 rounded-2xl border border-purple-900/40 shadow-inner space-x-2">
          <LayoutDashboard className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white">Bảng Điều Khiển Quản Trị Hệ Thống</span>
          {isMasterAdmin && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Master Admin
            </span>
          )}
        </div>

        {/* Right Tools: Refresh, Language, Notifications, Logout */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Refresh Real-time Data Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-purple-300 transition-colors ${
              isRefreshing ? 'animate-spin text-purple-400' : ''
            }`}
            title="Làm mới dữ liệu toàn hệ thống"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Simple Language Switcher: [ VI | EN ] */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl shadow-inner">
            <button
              type="button"
              id="admin-lang-vi-btn"
              onClick={() => setLanguage('vi')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                language === 'vi'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chuyển sang Tiếng Việt"
            >
              <span>🇻🇳</span>
              <span className="text-[10px] sm:text-[11px]">VI</span>
            </button>

            <button
              type="button"
              id="admin-lang-en-btn"
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to English"
            >
              <span>🇺🇸</span>
              <span className="text-[10px] sm:text-[11px]">EN</span>
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-purple-300 transition-colors relative"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-purple-900/60 shadow-2xl p-4 z-50 animate-fade-in text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    <span>Thông Báo Quản Trị</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">{notifications.length} bản ghi</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">Chưa có thông báo nào</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-purple-300 font-semibold">{n.title}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Safe Admin Logout Button */}
          <button
            type="button"
            onClick={handleAdminLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all shadow-sm"
            title="Đăng xuất khỏi phiên quản trị"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </button>

        </div>
      </div>
    </header>
  );
};
