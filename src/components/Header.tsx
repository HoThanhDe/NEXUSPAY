import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Shield,
  CreditCard,
  QrCode
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
    currentPortal,
    setCurrentPortal,
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
    setIsSecurityModalOpen,
    addNotification
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMoreLangOpen, setIsMoreLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langNames: Record<Language, { label: string; flag: string }> = {
    vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
    en: { label: 'English', flag: '🇺🇸' },
    ja: { label: '日本語', flag: '🇯🇵' },
    zh: { label: '中文', flag: '🇨🇳' }
  };

  const remainingQuota = Math.max(0, user.monthlyLimitVND - user.monthlyUsedVND);
  const quotaPercent = Math.min(100, Math.round((user.monthlyUsedVND / user.monthlyLimitVND) * 100));

  const handleToggleLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setIsMoreLangOpen(false);
    addNotification(
      'info',
      newLang === 'en' ? 'Language Switched' : 'Đã đổi ngôn ngữ',
      newLang === 'en' ? 'Interface language set to English' : 'Giao diện đã chuyển sang Tiếng Việt'
    );
  };

  const handleSwitchToAdmin = () => {
    setIsMobileMenuOpen(false);
    if (isAdminUnlocked) {
      setCurrentPortal('admin');
      setActiveTab('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  // Close menus on tab change
  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/40">
      {/* Top Utility Bar: Live Market Tickers & High-Level System Controls */}
      <div className="border-b border-slate-800/50 bg-slate-900/70 text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Live Market Ticker Strip (Scrollable & Responsive) */}
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-0.5 max-w-[55%] sm:max-w-[70%] flex-shrink">
            <div className="flex items-center text-emerald-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              <span className="hidden sm:inline">LIVE OTC:</span>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              {rates.slice(0, 4).map(r => (
                <div key={r.symbol} className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-[11px] bg-slate-950/40 px-2 py-0.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-300 font-semibold">{r.symbol}:</span>
                  <span className="text-white font-mono font-bold">{r.priceVND.toLocaleString('vi-VN')}₫</span>
                  <span className={`font-mono text-[9px] sm:text-[10px] ${r.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {r.change24h >= 0 ? '+' : ''}{r.change24h}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Top Status & Admin Portal Fast-Switch Button */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Direct Switch to Admin Website Portal */}
            <button
              type="button"
              id="top-switch-admin-btn"
              onClick={handleSwitchToAdmin}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-all shadow-sm ${
                isAdminUnlocked
                  ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200'
                  : 'bg-slate-850 hover:bg-purple-950/60 border border-slate-750 hover:border-purple-500/40 text-slate-300 hover:text-purple-300'
              }`}
              title={isAdminUnlocked ? 'Vào Website Quản Trị Hệ Thống' : 'Đăng nhập vào Website Quản Trị Hệ Thống'}
            >
              <LayoutDashboard className="w-3 h-3 text-purple-400" />
              <span>{isAdminUnlocked ? 'Website Admin' : 'Cổng Admin'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdminUnlocked ? 'bg-emerald-400' : 'bg-purple-400'}`} />
            </button>

            {/* Quick 2FA / Passkey Status Pill on Desktop */}
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="hidden lg:flex items-center space-x-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors px-2 py-0.5 rounded-md hover:bg-slate-800"
              title="Quản lý thiết bị và bảo mật 2FA"
            >
              <Fingerprint className={`w-3.5 h-3.5 ${user.biometricsEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{user.biometricsEnabled ? 'Passkey' : '2FA'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Platform Title */}
        <div 
          onClick={() => navigateTo('exchange')}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">NEXUS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OTC
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none hidden xs:block">
              {language === 'vi' ? 'Cổng Mua Bán Crypto 24/7' : 'Crypto Exchange & Gateway'}
            </p>
          </div>
        </div>

        {/* Desktop Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            id="nav-exchange-btn"
            onClick={() => navigateTo('exchange')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'exchange'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t('exchange')}</span>
          </button>

          <button
            id="nav-market-btn"
            onClick={() => navigateTo('market')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'market'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
            <span>{t('market')}</span>
          </button>

          <button
            id="nav-history-btn"
            onClick={() => navigateTo('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('history')}</span>
          </button>

          <button
            id="nav-kyc-btn"
            onClick={() => setIsKYCModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/20 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('kyc')}</span>
          </button>

          {isUserLoggedIn ? (
            <button
              id="nav-profile-btn"
              onClick={() => navigateTo('profile')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('profile')}</span>
            </button>
          ) : (
            <button
              id="nav-guest-auth-btn"
              onClick={() => setIsUserAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('login')}</span>
            </button>
          )}
        </nav>

        {/* Right Utility Group: Language Toggle, Notifications, Account & Support */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          
          {/* Streamlined Language Toggle Segment: [ 🇻🇳 VI | 🇺🇸 EN ] + Dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl shadow-inner relative">
            <button
              type="button"
              id="lang-vi-btn"
              onClick={() => handleToggleLanguage('vi')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                language === 'vi'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tiếng Việt (Vietnamese)"
            >
              <span>🇻🇳</span>
              <span className="text-[10px] sm:text-[11px]">VI</span>
            </button>

            <button
              type="button"
              id="lang-en-btn"
              onClick={() => handleToggleLanguage('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                language === 'en'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              <span>🇺🇸</span>
              <span className="text-[10px] sm:text-[11px]">EN</span>
            </button>

            <button
              type="button"
              id="lang-more-toggle-btn"
              onClick={() => setIsMoreLangOpen(!isMoreLangOpen)}
              className="px-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Ngôn ngữ khác (JA / ZH)"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {isMoreLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1">
                {(['vi', 'en', 'ja', 'zh'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => handleToggleLanguage(l)}
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

          {/* Notifications Center with Polished Card Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              className="relative p-2 sm:p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4 text-cyan-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-auto mt-2 w-[85vw] max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('notifications')}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                    {notifications.length} tin
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 py-2.5 scrollbar-none">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 space-y-1.5">
                      <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Không có thông báo mới.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800/80 text-xs transition-colors">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                          {n.type === 'order_success' || n.type === 'crypto_sent' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : n.type === 'security_alert' ? (
                            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                          <span className="truncate">{n.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1.5 block font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth Profile Trigger */}
          {isUserLoggedIn ? (
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
              <button
                id="header-user-profile-btn"
                type="button"
                onClick={() => navigateTo('profile')}
                className="flex items-center space-x-2 px-2 py-1 text-xs text-slate-200 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
                title="Hồ sơ tài khoản & Hạn mức"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight hidden md:block">
                  <span className="max-w-[85px] truncate text-slate-200 font-bold block text-xs">
                    {user.name}
                  </span>
                  <span className={`text-[9px] font-semibold block ${user.kycTier === 'tier2_advanced' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {user.kycTier === 'tier2_advanced' ? 'KYC Cấp 2' : 'KYC Cấp 1'}
                  </span>
                </div>
              </button>

              <button
                id="header-logout-btn"
                type="button"
                onClick={logoutUserAccount}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 transition-all"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5">
              <button
                id="header-login-btn"
                onClick={() => setIsUserAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
                title={t('login')}
              >
                {t('login')}
              </button>
              <button
                id="header-register-btn"
                onClick={() => setIsUserAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                title={t('register')}
              >
                {t('register')}
              </button>
            </div>
          )}

          {/* AI Support Button (Desktop) */}
          <button
            id="support-chat-btn"
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            title="Trợ lý AI Hỗ trợ trực tuyến 24/7"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 AI</span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Mở menu điều hướng"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer / Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 p-4 space-y-4 animate-fade-in backdrop-blur-xl shadow-2xl">
          
          {/* User Status Card on Mobile */}
          {isUserLoggedIn ? (
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logoutUserAccount}
                className="px-2.5 py-1 bg-rose-950/60 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/40"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsUserAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl bg-slate-900 text-cyan-300 border border-slate-750 text-xs font-bold"
              >
                {t('login')}
              </button>
              <button
                onClick={() => {
                  setIsUserAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold"
              >
                {t('register')}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigateTo('exchange')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2 font-semibold ${
                activeTab === 'exchange'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span>{t('exchange')}</span>
            </button>

            <button
              onClick={() => navigateTo('market')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2 font-semibold ${
                activeTab === 'market'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>{t('market')}</span>
            </button>

            <button
              onClick={() => navigateTo('history')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2 font-semibold ${
                activeTab === 'history'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>{t('history')}</span>
            </button>

            <button
              onClick={() => {
                setIsKYCModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl border bg-slate-900 border-amber-500/30 text-amber-300 text-left flex items-center space-x-2 font-semibold"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{t('kyc')}</span>
            </button>
          </div>

          {/* Direct Switch to Admin Website Button (Mobile) */}
          <div className="pt-1">
            <button
              onClick={handleSwitchToAdmin}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>{language === 'vi' ? 'Chuyển sang Website Quản Trị (Admin)' : 'Switch to Admin Portal'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {isAdminUnlocked ? 'ĐÃ MỞ' : 'CẦN PIN'}
              </span>
            </button>
          </div>

          {/* 24/7 AI Support on Mobile */}
          <button
            onClick={() => {
              setIsSupportOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center space-x-2"
          >
            <Headphones className="w-4 h-4" />
            <span>Hỗ Trợ Khách Hàng 24/7 AI</span>
          </button>
        </div>
      )}

      {/* Modern Mobile Bottom Navigation Dock (High touch-target standard) */}
      <div className="lg:hidden flex items-center justify-around py-2 px-3 bg-slate-950/95 border-t border-slate-800 text-[10px] font-semibold backdrop-blur-lg">
        <button
          onClick={() => navigateTo('exchange')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all min-h-[44px] justify-center ${
            activeTab === 'exchange' ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 mb-0.5" />
          <span>{t('exchange')}</span>
        </button>

        <button
          onClick={() => navigateTo('market')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all min-h-[44px] justify-center ${
            activeTab === 'market' ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>{t('market')}</span>
        </button>

        <button
          onClick={() => navigateTo('history')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all min-h-[44px] justify-center ${
            activeTab === 'history' ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span>{t('history')}</span>
        </button>

        <button
          onClick={() => {
            setIsKYCModalOpen(true);
          }}
          className="flex flex-col items-center py-1 px-3 rounded-xl transition-all min-h-[44px] justify-center text-amber-400"
        >
          <UserCheck className="w-4 h-4 mb-0.5" />
          <span>{t('kyc')}</span>
        </button>

        <button
          onClick={handleSwitchToAdmin}
          className="flex flex-col items-center py-1 px-3 rounded-xl transition-all min-h-[44px] justify-center text-purple-400"
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
