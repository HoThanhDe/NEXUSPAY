/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminHeader } from './components/Admin/AdminHeader';
import { AdminPortalGate } from './components/Admin/AdminPortalGate';
import { ExchangeWidget } from './components/Exchange/ExchangeWidget';
import { StripePaymentModal } from './components/Exchange/StripePaymentModal';
import { VietQRPaymentModal } from './components/Exchange/VietQRPaymentModal';
import { OrderConfirmationModal } from './components/Exchange/OrderConfirmationModal';
import { MarketChart } from './components/Market/MarketChart';
import { TransactionHistory } from './components/History/TransactionHistory';
import { KYCCenterModal } from './components/KYC/KYCCenterModal';
import { SecuritySettingsModal } from './components/Security/SecuritySettingsModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { UserAuthModal } from './components/Auth/UserAuthModal';
import { UserProfileView } from './components/User/UserProfileView';
import { SupportChatModal } from './components/Support/SupportChatModal';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  Zap, 
  Headphones, 
  ArrowRight, 
  Sparkles,
  Globe2,
  CheckCircle2,
  Server,
  Activity
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentPortal, 
    setCurrentPortal, 
    isAdminUnlocked, 
    setIsAdminAuthModalOpen,
    t, 
    language,
    setIsSupportOpen, 
    setIsKYCModalOpen 
  } = useApp();

  // If in Admin Portal Mode: Render Dedicated Admin Platform
  if (currentPortal === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white font-sans">
        {/* Dedicated Master Admin Header */}
        <AdminHeader />

        {/* Master Admin Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isAdminUnlocked ? (
            <AdminDashboard />
          ) : (
            <AdminPortalGate />
          )}
        </main>

        {/* Dedicated Admin Platform Footer */}
        <footer className="mt-auto border-t border-purple-950/60 bg-slate-950 py-5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                A
              </div>
              <span className="font-semibold text-slate-400">NEXUS OTC Master Operations Station © 2026</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px] text-purple-300/80">
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero-Trust Admin Session Active</span>
              </span>
              <span>256-Bit Ledger Sync</span>
              <span>Audit Logging ON</span>
            </div>
          </div>
        </footer>

        {/* Global Modals for admin support/actions if needed */}
        <AdminAuthModal />
        <SupportChatModal />
        <SecuritySettingsModal />
      </div>
    );
  }

  // Otherwise: Render Dedicated Client / Trader Website Portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Client Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'exchange' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Trust Badges Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'vi' ? 'Cổng Thanh Toán Trực Tuyến & Mua Bán Crypto Tự Động' : 'Automated Online Payment & Crypto Exchange Gateway'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {language === 'vi' ? (
                  <>Chuyển đổi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">VND sang USDT / Crypto</span> tức thì</>
                ) : (
                  <>Instant Conversion <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">VND to USDT / Crypto</span></>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {language === 'vi'
                  ? 'Bảo mật thẻ quốc tế Stripe SSL 256-bit, chuyển khoản VietQR 24/7, xác minh KYC linh hoạt và tự động giải ngân trên chuỗi khối.'
                  : 'Stripe 256-bit SSL international cards, 24/7 VietQR instant transfers, tiered KYC and automated blockchain settlement.'}
              </p>
            </div>

            {/* Exchange Widget */}
            <ExchangeWidget />

            {/* Feature Highlights Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  {language === 'vi' ? 'Cổng Stripe & VietQR' : 'Stripe & VietQR Gateway'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi' 
                    ? 'Tích hợp thẻ Visa, MasterCard, JCB và quét mã VietQR tự động khớp lệnh chỉ trong 5-15 giây.'
                    : 'Integrated Visa, MasterCard, JCB and instant VietQR QR payment auto-matching in 5-15 seconds.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  {language === 'vi' ? 'Phân Cấp KYC Linh Hoạt' : 'Flexible Tiered KYC'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Cơ bản 10.000.000 ₫/tháng với CCCD; Nâng cao 300.000.000 ₫/tháng với Quét sinh trắc học Face ID AI.'
                    : 'Basic 10,000,000 ₫/mo with ID card; Advanced 300,000,000 ₫/mo with AI Face biometric scanning.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  {language === 'vi' ? 'Xác Thực Chuỗi Khối & Email' : 'Blockchain & Email Settlement'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Smart Contract tự động chuyển token ngay khi thanh toán hoàn tất, kèm biên lai email điện tử tức thì.'
                    : 'Smart Contract auto-releases crypto upon payment completion with instant electronic email receipts.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="animate-fade-in">
            <MarketChart />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <TransactionHistory />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <UserProfileView />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Global Client Modals */}
      <StripePaymentModal />
      <VietQRPaymentModal />
      <OrderConfirmationModal />
      <KYCCenterModal />
      <SecuritySettingsModal />
      <SupportChatModal />
      <AdminAuthModal />
      <UserAuthModal />

      {/* Floating 24/7 AI Support Trigger */}
      <button
        id="floating-support-btn"
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95 border border-cyan-400/30"
      >
        <Headphones className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">{t('support')}</span>
      </button>

      {/* Client Website Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-slate-400">NEXUS Pay & Crypto Gateway © 2026</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PCI-DSS Level 1 & SOC2 Compliant</span>
            </span>
            <span>Stripe Verified</span>
            <span>VietQR 24/7 Certified</span>
            <button
              type="button"
              id="footer-admin-portal-btn"
              onClick={() => {
                if (isAdminUnlocked) {
                  setCurrentPortal('admin');
                  setActiveTab('admin');
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors font-semibold px-2 py-0.5 rounded-md hover:bg-purple-950/40 border border-purple-500/20"
              title="Cổng Đăng Nhập Quản Trị Viên (Admin Portal)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Cổng Admin' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
