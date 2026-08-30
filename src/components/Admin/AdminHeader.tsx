import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Globe, 
  Bell, 
  RefreshCw, 
  LayoutDashboard,
  Server,
  Activity,
  UserCheck,
  Zap,
  TrendingUp,
  Sliders,
  DollarSign,
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
    isAdminUnlocked,
    setActiveTab,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    addNotification
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const langNames: Record<Language, { label: string; flag: string }> = {
    vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
    en: { label: 'English', flag: '🇺🇸' },
    ja: { label: '日本語', flag: '🇯🇵' },
    zh: { label: '中文', flag: '🇨🇳' }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshData) onRefreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification('info', 'Đã cập nhật dữ liệu', 'Dữ liệu giao dịch, KYC và thị trường đã được làm mới.');
    }, 600);
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

          {/* Quick Exit to Client Website Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              id="admin-return-client-btn"
              onClick={() => {
                setCurrentPortal('user');
                setActiveTab('exchange');
              }}
              className="flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-bold transition-all shadow-sm"
              title="Quay lại giao diện người dùng mua bán crypto"
            >
              <ArrowLeft className="w-3 h-3 text-cyan-400" />
              <span>{language === 'vi' ? 'Website Khách Hàng' : 'Client Website'}</span>
            </button>
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
              {language === 'vi' ? 'Hệ Thống Quản Trị Toàn Quyền OTC & Gateway' : 'Master Management & Operations Desk'}
            </p>
          </div>
        </div>

        {/* Center Portal Switcher Pill (Desktop) */}
        <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-purple-900/40 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setCurrentPortal('user');
              setActiveTab('exchange');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('clientPortal')}</span>
          </button>
          
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30">
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('adminPortal')}</span>
          </div>
        </div>

        {/* Right Tools: Refresh, Language, Notifications, Lock Admin */}
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
              className="relative p-2 sm:p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              title="Thông báo quản trị"
            >
              <Bell className="w-4 h-4 text-purple-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[85vw] max-w-sm bg-slate-900 border border-purple-900/50 rounded-2xl shadow-2xl z-50 p-3 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thông Báo Hệ Thống</h4>
                  <span className="text-[10px] text-purple-400 font-mono">{notifications.length} tin</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 py-2 scrollbar-none">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Không có thông báo mới.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        <div className="flex items-center space-x-1.5 font-bold text-purple-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{n.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lock Session Button */}
          <button
            type="button"
            id="admin-lock-session-btn"
            onClick={() => {
              lockAdminSession();
              setCurrentPortal('user');
              setActiveTab('exchange');
              addNotification('info', 'Đã khóa phiên quản trị an toàn', 'Đã chuyển về Website Khách Hàng.');
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Khóa quyền quản trị và chuyển về Website Khách Hàng"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Khóa Admin</span>
          </button>

        </div>
      </div>
    </header>
  );
};
