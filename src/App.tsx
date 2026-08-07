/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
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
import { UserProfileView } from './components/User/UserProfileView';
import { SupportChatModal } from './components/Support/SupportChatModal';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Headphones, 
  ArrowRight, 
  Sparkles,
  Globe2,
  CheckCircle2
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, t, setIsSupportOpen, setIsKYCModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'exchange' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Trust Badges Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cổng Thanh Toán Trực Tuyến & Mua Bán Crypto Tự Động</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Chuyển đổi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">VND sang USDT / Crypto</span> tức thì
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Bảo mật thẻ quốc tế Stripe SSL 256-bit, chuyển khoản VietQR 24/7, xác minh KYC linh hoạt và tự động giải ngân trên chuỗi khối.
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
                <h4 className="font-bold text-sm text-white mb-1">Cổng Stripe & VietQR</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tích hợp thẻ Visa, MasterCard, JCB và quét mã VietQR tự động khớp lệnh chỉ trong 5-15 giây.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Phân Cấp KYC Linh Hoạt</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cơ bản 10.000.000 ₫/tháng với CCCD; Nâng cao 300.000.000 ₫/tháng với Quét sinh trắc học Face ID AI.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Xác Thực Chuỗi Khối & Email</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smart Contract tự động chuyển token ngay khi thanh toán hoàn tất, kèm biên lai email điện tử tức thì.
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

      {/* Global Modals */}
      <StripePaymentModal />
      <VietQRPaymentModal />
      <OrderConfirmationModal />
      <KYCCenterModal />
      <SecuritySettingsModal />
      <SupportChatModal />
      <AdminAuthModal />

      {/* Floating 24/7 AI Support Trigger */}
      <button
        id="floating-support-btn"
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95 border border-cyan-400/30"
      >
        <Headphones className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">Hỗ Trợ 24/7 AI</span>
      </button>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-slate-400">NEXUS Pay & Crypto Gateway © 2026</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PCI-DSS Level 1 & SOC2 Compliant</span>
            </span>
            <span>Stripe Verified</span>
            <span>VietQR 24/7 Certified</span>
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
