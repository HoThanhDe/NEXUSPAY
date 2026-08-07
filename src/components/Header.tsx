import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Bell, 
  Globe, 
  Fingerprint, 
  TrendingUp, 
  ArrowLeftRight, 
  BarChart3, 
  History, 
  UserCheck, 
  Lock, 
  LayoutDashboard,
  Headphones,
  CheckCircle2,
  AlertCircle,
  User,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

export const Header: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    user, 
    rates, 
    activeTab, 
    setActiveTab, 
    isAdminUnlocked,
    setIsAdminAuthModalOpen,
    isUserAuthModalOpen,
    setIsUserAuthModalOpen,
    isUserLoggedIn,
    logoutUserAccount,
    notifications, 
    unreadCount, 
    markNotificationsAsRead,
    setIsSupportOpen,
    setIsKYCModalOpen,
    setIsSecurityModalOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const langNames: Record<Language, { label: string; flag: string }> = {
    vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
    en: { label: 'English', flag: '🇺🇸' },
    ja: { label: '日本語', flag: '🇯🇵' },
    zh: { label: '中文', flag: '🇨🇳' }
  };

  const remainingQuota = Math.max(0, user.monthlyLimitVND - user.monthlyUsedVND);
  const quotaPercent = Math.min(100, Math.round((user.monthlyUsedVND / user.monthlyLimitVND) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Live Ticker Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-slate-900/80 border-b border-slate-800/60 text-xs">
        <div className="flex items-center space-x-6 overflow-x-auto scrollbar-none">
          <span className="flex items-center text-emerald-400 font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
            Live Market:
          </span>
          {rates.map(r => (
            <div key={r.symbol} className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="text-slate-300 font-medium">{r.symbol}/VND:</span>
              <span className="text-white font-mono font-semibold">{r.priceVND.toLocaleString('vi-VN')} ₫</span>
              <span className={`font-mono text-[11px] ${r.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {r.change24h >= 0 ? '+' : ''}{r.change24h}%
              </span>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="flex items-center space-x-4 text-slate-400">
          <div 
            onClick={() => setIsSecurityModalOpen(true)}
            className="flex items-center space-x-1.5 cursor-pointer hover:text-cyan-400 transition-colors"
          >
            <Fingerprint className={`w-3.5 h-3.5 ${user.biometricsEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{user.biometricsEnabled ? 'Passkey Ready' : 'Enable Passkey'}</span>
          </div>
          <div 
            onClick={() => setIsSecurityModalOpen(true)}
            className="flex items-center space-x-1.5 cursor-pointer hover:text-emerald-400 transition-colors"
          >
            <Lock className={`w-3.5 h-3.5 ${user.twoFactorEnabled ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>2FA {user.twoFactorEnabled ? 'Active' : 'Off'}</span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('exchange')}
          className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">NEXUS</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">PAY</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">Crypto & Fiat Gateway</p>
          </div>
        </div>

        {/* Navigation Tabs - Dynamically adapted for Guest vs Logged-in User vs Admin */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {/* Mua Crypto */}
          <button
            id="nav-exchange-btn"
            onClick={() => setActiveTab('exchange')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'exchange'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Mua Crypto</span>
          </button>

          {/* Thị trường */}
          <button
            id="nav-market-btn"
            onClick={() => setActiveTab('market')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'market'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thị Trường</span>
          </button>

          {/* Lịch sử */}
          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử</span>
          </button>

          {/* If Logged in User: Show KYC & Hồ sơ */}
          {isUserLoggedIn ? (
            <>
              {/* KYC */}
              <button
                id="nav-kyc-btn"
                onClick={() => setIsKYCModalOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/20 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>KYC</span>
              </button>

              {/* Hồ sơ */}
              <button
                id="nav-profile-btn"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hồ Sơ</span>
              </button>
            </>
          ) : (
            /* If Guest (Chưa đăng nhập): Show Đăng nhập */
            <button
              id="nav-guest-auth-btn"
              onClick={() => setIsUserAuthModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Admin Desk Tab - Shown when admin is unlocked */}
          {isAdminUnlocked && (
            <button
              id="nav-admin-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/40'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Dashboard Admin</span>
            </button>
          )}
        </nav>

        {/* Right Actions: KYC Status, Wallet Balance, Admin Portal Entry, Language, Notifs */}
        <div className="flex items-center space-x-2.5">
          {/* Discreet Admin Lock/Portal Entry */}
          {!isAdminUnlocked ? (
            <button
              id="admin-discreet-portal-btn"
              onClick={() => setIsAdminAuthModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-400 hover:text-purple-300 transition-colors"
              title="Cổng Quản Trị Viên (Mật mã / PIN)"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-500/50 text-purple-300 hover:bg-purple-900/60 text-xs font-bold transition-all shadow-sm"
              title="Bàn làm việc Quản trị viên đang mở"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Admin Desk</span>
            </button>
          )}
          {/* KYC Meter Pill */}
          <div 
            id="kyc-status-pill"
            onClick={() => setIsKYCModalOpen(true)}
            className="hidden sm:flex flex-col items-start px-3 py-1 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${user.kycTier === 'tier2_advanced' ? 'bg-emerald-400' : user.kycTier === 'tier1_basic' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              <span className="font-semibold text-slate-200">
                {user.kycTier === 'tier2_advanced' ? 'KYC Cấp 2 (300M)' : user.kycTier === 'tier1_basic' ? 'KYC Cấp 1 (10M)' : 'Chưa KYC'}
              </span>
            </div>
            <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full ${quotaPercent > 80 ? 'bg-rose-500' : 'bg-cyan-400'}`} 
                style={{ width: `${quotaPercent}%` }} 
              />
            </div>
          </div>

          {/* Wallet Balance Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-slate-400 font-medium">USDT Balance</div>
              <div className="text-xs font-mono font-bold text-white">{user.walletBalance.USDT.toFixed(2)} USDT</div>
            </div>
          </div>

          {/* User Account / Trader Login & Register Buttons */}
          {user && user.email && isUserLoggedIn ? (
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
              <button
                id="header-user-profile-btn"
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-200 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Xem thông tin tài khoản và trạng thái KYC"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="max-w-[100px] truncate text-slate-200 font-semibold block text-xs">
                    {user.name}
                  </span>
                  <span className={`text-[9px] font-bold block ${
                    user.kycStatus === 'verified' ? 'text-emerald-400' : user.kycStatus === 'pending' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {user.kycStatus === 'verified' ? (user.kycTier === 'tier2_advanced' ? '✓ KYC Cấp 2' : '✓ KYC Cấp 1') : user.kycStatus === 'pending' ? '⏳ Chờ duyệt' : '⚠️ Chưa KYC'}
                  </span>
                </div>
              </button>

              <button
                id="header-logout-btn"
                type="button"
                onClick={logoutUserAccount}
                className="flex items-center space-x-1 px-2.5 py-1 text-slate-300 hover:text-rose-400 rounded-lg bg-slate-950/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-xs font-semibold transition-all shadow-sm"
                title="Đăng xuất tài khoản an toàn"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                id="header-register-btn"
                onClick={() => setIsUserAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                title="Đăng ký tài khoản trader mới"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng Ký</span>
              </button>

              <button
                id="header-login-btn"
                onClick={() => setIsUserAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-xs font-semibold transition-all"
                title="Đăng nhập tài khoản"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              id="language-switcher-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors"
            >
              <span>{langNames[language].flag}</span>
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1">
                {(['vi', 'en', 'ja', 'zh'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setLanguage(l);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-800 transition-colors ${
                      language === l ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>{langNames[l].flag}</span>
                    <span>{langNames[l].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              className="relative p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('notifications')}</h4>
                  <span className="text-[10px] text-cyan-400">{notifications.length} tin</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Không có thông báo mới.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-800 text-xs">
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                          {n.type === 'order_success' || n.type === 'crypto_sent' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 24/7 AI Support Trigger */}
          <button
            id="support-chat-btn"
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('support')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Tab */}
      <div className="lg:hidden flex items-center justify-around py-2 px-2 bg-slate-900 border-t border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'exchange' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Mua Crypto</span>
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'market' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Thị Trường</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'history' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử</span>
        </button>
        <button
          onClick={() => setIsKYCModalOpen(true)}
          className="flex flex-col items-center space-y-1 text-amber-400"
        >
          <UserCheck className="w-4 h-4" />
          <span>KYC</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Quản Trị</span>
        </button>
      </div>
    </header>
  );
};
