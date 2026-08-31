import React, { useState, useEffect } from 'react';
import { 
  ArrowDownUp, 
  CreditCard, 
  QrCode, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Copy, 
  ChevronDown, 
  Info,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  LogIn,
  LogOut,
  UserCheck,
  Lock,
  User,
  Fuel,
  Receipt,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoNetwork, PaymentMethod } from '../../types';
import { api } from '../../services/api';

export const ExchangeWidget: React.FC = () => {
  const { 
    t, 
    user, 
    refreshUser,
    rates, 
    selectedRate, 
    setSelectedRate, 
    setIsStripeModalOpen, 
    setIsVietQRModalOpen, 
    setActiveOrder, 
    setIsOrderConfirmOpen,
    setIsKYCModalOpen,
    isUserLoggedIn,
    logoutUserAccount,
    setIsUserAuthModalOpen,
    setIsAdminUnlocked,
    setActiveTab,
    addNotification
  } = useApp();

  // Exchange trade mode: 'buy' (VND -> Crypto) | 'sell' (Crypto -> VND)
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  
  // Amounts
  const [fiatAmountVND, setFiatAmountVND] = useState<number>(2607000); // ~100 USDT
  const [cryptoAmount, setCryptoAmount] = useState<number>(100);
  
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
  const [recipientWallet, setRecipientWallet] = useState<string>('');
  
  // Bank Payout details for 'sell' mode
  const [bankName, setBankName] = useState<string>(user.bankAccount?.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(user.bankAccount?.accountNumber || '');
  const [accountName, setAccountName] = useState<string>(user.bankAccount?.accountName || '');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [lockTimer, setLockTimer] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showP2PComparison, setShowP2PComparison] = useState(false);

  // Transaction Summary Modal state
  const [isTransactionSummaryOpen, setIsTransactionSummaryOpen] = useState(false);
  const [walletCopiedInModal, setWalletCopiedInModal] = useState(false);

  // Sync bank details if user logs in with saved bank details
  useEffect(() => {
    if (user.bankAccount?.bankName && !bankName) {
      setBankName(user.bankAccount.bankName);
    }
    if (user.bankAccount?.accountNumber && !accountNumber) {
      setAccountNumber(user.bankAccount.accountNumber);
    }
    if (user.bankAccount?.accountName && !accountName) {
      setAccountName(user.bankAccount.accountName);
    }
  }, [user]);

  // Rate lock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimer(prev => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected network when crypto rate changes
  useEffect(() => {
    if (selectedRate.networks && selectedRate.networks.length > 0) {
      setSelectedNetwork(selectedRate.networks[0].network);
    }
  }, [selectedRate.symbol]);

  // Active rate depending on buy vs sell - always read from latest rates
  const currentRate = rates.find(r => r.symbol === selectedRate.symbol) || selectedRate;
  const activeRateVND = tradeMode === 'buy' ? currentRate.buyPriceVND : currentRate.sellPriceVND;
  const activeNetworkConfig = currentRate.networks?.find(n => n.network === selectedNetwork) || currentRate.networks?.[0];
  const networkFeeVND = tradeMode === 'buy' ? (activeNetworkConfig?.feeVND ?? 0) : 0;
  const gatewayFeeVND = (tradeMode === 'buy' && paymentMethod.startsWith('stripe')) ? Math.round(fiatAmountVND * 0.01) : 0;
  const totalPaymentVND = tradeMode === 'buy' ? (fiatAmountVND + networkFeeVND + gatewayFeeVND) : fiatAmountVND;

  // Handle fiat input change
  const handleFiatChange = (val: number) => {
    setFiatAmountVND(val);
    if (activeRateVND > 0) {
      const calculated = val / activeRateVND;
      setCryptoAmount(Number(calculated < 0.001 ? calculated.toFixed(6) : calculated < 1 ? calculated.toFixed(4) : calculated.toFixed(2)));
    }
  };

  // Handle crypto input change
  const handleCryptoChange = (val: number) => {
    setCryptoAmount(val);
    if (activeRateVND > 0) {
      setFiatAmountVND(Math.round(val * activeRateVND));
    }
  };

  // Sync crypto amount when rate or tradeMode toggles
  useEffect(() => {
    if (activeRateVND > 0 && fiatAmountVND > 0) {
      const calculated = fiatAmountVND / activeRateVND;
      setCryptoAmount(Number(calculated < 0.001 ? calculated.toFixed(6) : calculated < 1 ? calculated.toFixed(4) : calculated.toFixed(2)));
    }
  }, [activeRateVND, tradeMode]);

  // KYC validation
  const isKycApproved = user.kycStatus === 'verified' || user.kycTier === 'tier1_basic' || user.kycTier === 'tier2_advanced';
  const isKycPending = user.kycStatus === 'pending';
  const isKycUnsubmitted = user.kycStatus === 'unsubmitted' || (!isKycApproved && !isKycPending);
  const remainingQuota = Math.max(0, user.monthlyLimitVND - user.monthlyUsedVND);
  const isTier0 = user.kycTier === 'tier0_unverified';
  const isExceedingQuota = (user.monthlyUsedVND + fiatAmountVND) > user.monthlyLimitVND;

  const quickAmounts = [
    { label: '500.000 ₫', value: 500000 },
    { label: '2.607.000 ₫ (100$)', value: 2607000 },
    { label: '5.000.000 ₫', value: 5000000 },
    { label: '10.000.000 ₫', value: 10000000 },
  ];

  const handleProceed = () => {
    setOrderError(null);

    // STEP 1 & 2: User must be registered & logged in
    if (!isUserLoggedIn || !user || !user.email) {
      setOrderError('Bạn cần Đăng ký tài khoản và Đăng nhập trước khi thực hiện Mua hoặc Bán Crypto.');
      setIsUserAuthModalOpen(true);
      return;
    }

    // STEP 3 & 4: User must have KYC approved by Admin
    if (!isKycApproved || user.monthlyLimitVND <= 0) {
      setOrderError(
        isKycPending 
          ? 'Hồ sơ KYC của bạn đã được gửi và đang chờ Quản trị viên phê duyệt. Sau khi Quản trị viên duyệt, quyền Mua & Bán sẽ tự động kích hoạt!'
          : 'Quy định pháp lý: Bạn cần nộp CCCD/Hộ chiếu và được Quản trị viên phê duyệt KYC để mở quyền Mua & Bán Crypto.'
      );
      if (isKycUnsubmitted) {
        setIsKYCModalOpen(true);
      }
      return;
    }

    if (tradeMode === 'buy') {
      if (isExceedingQuota) {
        setOrderError(t('exceedLimit'));
        return;
      }

      if (!recipientWallet.trim()) {
        setOrderError('Vui lòng nhập địa chỉ ví nhận crypto!');
        return;
      }
    } else {
      // Sell Mode Validation
      if (!accountNumber.trim() || !bankName.trim() || !accountName.trim()) {
        setOrderError('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng nhận tiền VND!');
        return;
      }
    }

    // Open Transparent Transaction Summary Modal for User Confirmation
    setIsTransactionSummaryOpen(true);
  };

  const executeOrderCreation = async () => {
    setIsSubmitting(true);
    setOrderError(null);

    try {
      if (tradeMode === 'buy') {
        const res = await api.createOrder({
          type: 'buy_crypto',
          cryptoSymbol: selectedRate.symbol,
          network: selectedNetwork,
          fiatAmountVND,
          cryptoAmount,
          recipientWallet: recipientWallet.trim(),
          paymentMethod
        });

        if (res.success && res.order) {
          setActiveOrder(res.order);
          setIsTransactionSummaryOpen(false);
          if (paymentMethod.startsWith('stripe')) {
            setIsStripeModalOpen(true);
          } else {
            setIsVietQRModalOpen(true);
          }
        } else {
          setOrderError(res.message || res.error || 'Tạo đơn hàng không thành công');
        }
      } else {
        // Sell Mode
        const res = await api.createOrder({
          type: 'sell_crypto',
          cryptoSymbol: selectedRate.symbol,
          network: selectedNetwork,
          fiatAmountVND,
          cryptoAmount,
          bankPayout: {
            bankName,
            accountNumber,
            accountName
          },
          paymentMethod: 'crypto_deposit'
        });

        if (res.success && res.order) {
          setActiveOrder(res.order);
          setIsTransactionSummaryOpen(false);
          setIsOrderConfirmOpen(true);
          addNotification(
            'crypto_sent',
            'Đơn bán Crypto đã khởi tạo!',
            `Vui lòng chuyển ${cryptoAmount} ${selectedRate.symbol} (${selectedNetwork}) vào ví ký quỹ để nhận ${fiatAmountVND.toLocaleString('vi-VN')} VND về ngân hàng.`
          );
        } else {
          setOrderError(res.message || res.error || 'Tạo đơn bán không thành công');
        }
      }
    } catch (err: any) {
      setOrderError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* 5-Step Trading Compliance Workflow (Chỉ hiển thị cho người dùng mới đăng ký/chưa KYC; khi KYC thành công sẽ tự động ẩn đi) */}
      {!isKycApproved && (
        <div className="w-full bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>Quy Trình 5 Bước Bắt Buộc Để Mua & Bán Crypto</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Pháp Lý & An Toàn
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Đăng ký → Đăng nhập → Nộp KYC → Ban Quản Trị duyệt → Mua & Bán tức thì
                </p>
              </div>
            </div>
          </div>

          {/* 5 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {/* Step 1: Register */}
            <div className={`p-2.5 rounded-xl border text-xs transition-all ${
              isUserLoggedIn && user && user.email 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1 text-[11px]">
                <span>1. Đăng Ký</span>
                {isUserLoggedIn && user && user.email ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                {isUserLoggedIn && user && user.email ? user.email : 'Tạo tài khoản mới'}
              </p>
              {(!isUserLoggedIn || !user || !user.email) && (
                <button
                  onClick={() => setIsUserAuthModalOpen(true)}
                  className="w-full py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-[10px] font-bold border border-cyan-500/40 transition-colors"
                >
                  Đăng Ký Ngay
                </button>
              )}
            </div>

            {/* Step 2: Login */}
            <div className={`p-2.5 rounded-xl border text-xs transition-all ${
              isUserLoggedIn && user && user.email 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1 text-[11px]">
                <span>2. Đăng Nhập</span>
                {isUserLoggedIn && user && user.email ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                {isUserLoggedIn && user && user.email ? user.name : 'Đăng nhập trader'}
              </p>
              {(!isUserLoggedIn || !user || !user.email) ? (
                <button
                  onClick={() => setIsUserAuthModalOpen(true)}
                  className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors"
                >
                  Đăng Nhập
                </button>
              ) : (
                <button
                  onClick={logoutUserAccount}
                  className="w-full py-0.5 bg-slate-900/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 rounded text-[9px] font-medium border border-slate-800 transition-colors"
                >
                  Đăng Xuất
                </button>
              )}
            </div>

            {/* Step 3: KYC Submission */}
            <div className={`p-2.5 rounded-xl border text-xs transition-all ${
              isKycApproved
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : isKycPending
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1 text-[11px]">
                <span>3. Nộp KYC</span>
                {isKycApproved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isKycPending ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                {isKycApproved ? 'Đã nộp CCCD' : isKycPending ? 'Đã gửi hồ sơ' : 'Chưa nộp CCCD'}
              </p>
              {isKycUnsubmitted && (
                <button
                  onClick={() => setIsKYCModalOpen(true)}
                  className="w-full py-1 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[10px] font-bold border border-amber-500/40 transition-colors"
                >
                  Nộp KYC Ngay
                </button>
              )}
            </div>

            {/* Step 4: Admin Approval */}
            <div className={`p-2.5 rounded-xl border text-xs transition-all ${
              isKycApproved
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : isKycPending
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1 text-[11px]">
                <span>4. Ban Quản Trị Duyệt</span>
                {isKycApproved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isKycPending ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                {isKycApproved 
                  ? (user.kycTier === 'tier2_advanced' ? 'Đã duyệt Cấp 2' : 'Đã duyệt Cấp 1') 
                  : isKycPending 
                  ? 'Đang chờ duyệt (1-5p)' 
                  : 'Chờ xét duyệt'}
              </p>
              <div className="text-[9px] text-slate-500 text-center py-0.5">
                {isKycApproved ? '✓ Đã sẵn sàng' : isKycPending ? 'Đang thẩm định...' : 'Cần nộp CCCD'}
              </div>
            </div>

            {/* Step 5: Buy & Sell */}
            <div className={`p-2.5 rounded-xl border text-xs transition-all ${
              isKycApproved
                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/80 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1 text-[11px]">
                <span>5. Mua & Bán</span>
                {isKycApproved ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <p className="text-[10px] line-clamp-1">
                {isKycApproved ? '🟢 ĐÃ MỞ KHÓA' : '🔒 ĐANG KHÓA'}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                {isKycApproved ? 'Giao dịch 24/7' : 'Cần Admin duyệt'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Exchange Card */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-950/80 backdrop-blur-xl relative">
        {/* Background ambient glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Trade Mode Toggle Tabs (Mua Crypto vs Bán Crypto) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
          <button
            id="tab-buy-crypto"
            onClick={() => setTradeMode('buy')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              tradeMode === 'buy'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cyan-300" />
            <span>{t('buyCryptoTab')}</span>
          </button>

          <button
            id="tab-sell-crypto"
            onClick={() => setTradeMode('sell')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              tradeMode === 'sell'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-emerald-300" />
            <span>{t('sellCryptoTab')}</span>
          </button>
        </div>

        {/* Live Exchange Rate Status Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center space-x-2">
                <span>{tradeMode === 'buy' ? 'Tỷ giá MUA (NEXUS bán cho bạn)' : 'Tỷ giá BÁN (NEXUS thu mua từ bạn)'}</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                  tradeMode === 'buy' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  1 {selectedRate.symbol} = {activeRateVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Xử lý thanh toán tự động 24/7 • Giao dịch chuỗi khối bảo đảm không qua trung gian
              </p>
            </div>
          </div>

          <button
            id="toggle-p2p-comparison-btn"
            onClick={() => setShowP2PComparison(!showP2PComparison)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-slate-700 whitespace-nowrap transition-colors flex items-center space-x-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showP2PComparison ? 'Ẩn so sánh thị trường' : 'So sánh tỷ giá thị trường'}</span>
          </button>
        </div>

        {/* KYC Limit Status / Guidance */}
        {!isKycApproved ? (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-amber-200">
                    {isKycPending ? 'Hồ Sơ KYC Đang Được Ban Quản Trị Thẩm Định' : 'Yêu Cầu Nộp Hồ Sơ KYC Để Mua & Bán Crypto'}
                  </h4>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold border border-amber-500/40">
                    {isKycPending ? 'Đang duyệt' : 'Chưa KYC'}
                  </span>
                </div>
                <p className="text-amber-300/80 mt-1 leading-relaxed">
                  {isKycPending 
                    ? 'Bạn đã nộp ảnh CCCD/Hộ chiếu. Ban Quản Trị đang kiểm tra hồ sơ và sẽ duyệt trong vòng 1-5 phút.'
                    : 'Theo quy định an toàn tài chính, bạn cần đăng ký, đăng nhập và nộp hồ sơ CCCD để được cấp hạn mức giao dịch.'}
                </p>
              </div>
            </div>

            {/* Customer Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
              {(!isUserLoggedIn || !user || !user.email) ? (
                <button 
                  type="button"
                  onClick={() => setIsUserAuthModalOpen(true)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>1. Đăng Ký / Đăng Nhập Tài Khoản</span>
                </button>
              ) : isKycUnsubmitted ? (
                <button 
                  type="button"
                  id="upgrade-kyc-banner-btn"
                  onClick={() => setIsKYCModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>2. Nộp Hồ Sơ KYC (CCCD/Passport)</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-amber-300 text-[11px] font-medium py-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Hồ sơ đang chờ duyệt. Bạn có thể liên hệ Hỗ Trợ 24/7 nếu cần hỗ trợ khẩn cấp.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-bold">
                ✓ Tài khoản đã xác thực: {user.kycTier === 'tier2_advanced' ? 'KYC Cấp 2 (Hạn mức 300M)' : 'KYC Cấp 1 (Hạn mức 10M)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">{t('remainingQuota')}: </span>
              <span className="text-emerald-400 font-bold font-mono">{remainingQuota.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        )}

        {/* Input / Output Form Body */}
        <div className="space-y-4">
          {/* Box 1: Fiat VND */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>{tradeMode === 'buy' ? t('youPay') : 'Số tiền VND bạn nhận'}</span>
              <span>Số dư: {user.walletBalance.VND.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                id="fiat-amount-input"
                type="number"
                value={fiatAmountVND ?? ''}
                onChange={e => handleFiatChange(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none"
              />
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-sm font-bold text-slate-200 whitespace-nowrap">
                <span>🇻🇳 VND</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="flex items-center space-x-2 mt-3 overflow-x-auto scrollbar-none">
              {quickAmounts.map(q => (
                <button
                  key={q.value}
                  onClick={() => handleFiatChange(q.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                    fiatAmountVND === q.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Divider */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={() => setTradeMode(prev => prev === 'buy' ? 'sell' : 'buy')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-cyan-400 shadow-md transition-transform hover:rotate-180"
              title="Đổi chiều Mua/Bán"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* Box 2: Crypto Amount & Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>{tradeMode === 'buy' ? t('youReceive') : 'Số lượng Crypto bạn bán'}</span>
              <span>
                1 {selectedRate.symbol} = {activeRateVND.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="crypto-amount-input"
                type="number"
                value={cryptoAmount ?? ''}
                onChange={e => handleCryptoChange(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className={`w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono focus:outline-none ${
                  tradeMode === 'buy' ? 'text-emerald-400' : 'text-cyan-400'
                }`}
              />

              {/* Crypto Symbol Picker */}
              <div className="relative">
                <select
                  id="crypto-symbol-select"
                  value={selectedRate.symbol}
                  onChange={e => {
                    const found = rates.find(r => r.symbol === e.target.value);
                    if (found) setSelectedRate(found);
                  }}
                  className="appearance-none bg-gradient-to-r from-cyan-900/60 to-indigo-900/60 border border-cyan-500/40 text-white font-bold text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none cursor-pointer shadow-lg shadow-cyan-950/40"
                >
                  {rates.map(r => (
                    <option key={r.symbol} value={r.symbol} className="bg-slate-900 text-white">
                      {r.symbol} - {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Network Selector */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                <span>{t('selectNetwork')}</span>
                <span className="text-cyan-400 font-mono">Xác thực: ~{activeNetworkConfig?.estimatedSeconds || 30}s</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentRate.networks || selectedRate.networks || []).map(net => {
                  const isSuspended = net.status === 'suspended';
                  return (
                    <button
                      key={net.network}
                      type="button"
                      disabled={isSuspended}
                      onClick={() => !isSuspended && setSelectedNetwork(net.network)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isSuspended
                          ? 'bg-slate-900/60 text-slate-500 border border-slate-800 opacity-60 cursor-not-allowed'
                          : selectedNetwork === net.network
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                      }`}
                    >
                      <span>{net.network}</span>
                      {isSuspended ? (
                        <span className="text-[10px] text-rose-400 font-bold">(Bảo trì)</span>
                      ) : (
                        <span className="text-[10px] opacity-80 font-mono">
                          ({net.feeVND === 0 ? '0₫' : `${net.feeVND.toLocaleString('vi-VN')}₫`})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conditional Step 3: Destination Configuration */}
          {tradeMode === 'buy' ? (
            /* Buy Mode: Recipient Crypto Wallet Address */
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <label className="text-xs text-slate-400 font-medium block mb-1.5 flex items-center justify-between">
                <span>{t('recipientAddress')} ({selectedNetwork})</span>
                <span className="text-cyan-400">Chuyển tự động 24/7</span>
              </label>
              <div className="relative">
                <input
                  id="recipient-wallet-input"
                  type="text"
                  value={recipientWallet || ''}
                  onChange={e => setRecipientWallet(e.target.value)}
                  placeholder={t('recipientAddressPlaceholder')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-20"
                />
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) setRecipientWallet(text);
                    } catch (e) {
                      setRecipientWallet(selectedNetwork === 'TRC20' ? 'TYDzsYbm7xXG7xKvZ1Rmqw76sXb484X9Jk' : '0x71C8A3B2eF90041284A2938491823901238491A2');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold rounded-lg transition-colors"
                >
                  Dán (Paste)
                </button>
              </div>
            </div>
          ) : (
            /* Sell Mode: User's VND Bank Payout Details */
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('bankPayoutInfo')}</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Nhận tiền trong 30s</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tên ngân hàng</label>
                  <input
                    type="text"
                    value={bankName || ''}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="VD: Vietcombank, Techcombank..."
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Số tài khoản</label>
                  <input
                    type="text"
                    value={accountNumber || ''}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    placeholder="10188992233"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  value={accountName || ''}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  placeholder="NGUYEN VAN AN"
                />
              </div>
            </div>
          )}

          {/* Payment Method Selector (Only for Buy Mode) */}
          {tradeMode === 'buy' && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block mb-2.5">Hình thức thanh toán:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Stripe Card */}
                <button
                  id="paymethod-stripe-btn"
                  onClick={() => setPaymentMethod('stripe_card')}
                  className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    paymentMethod === 'stripe_card'
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>Thẻ Quốc Tế / Stripe</span>
                      <span className="text-[10px] px-1.5 rounded bg-indigo-500/30 text-indigo-300 font-normal">Instant</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Visa, Master, JCB, Apple Pay</p>
                  </div>
                </button>

                {/* VietQR Bank Transfer */}
                <button
                  id="paymethod-vietqr-btn"
                  onClick={() => setPaymentMethod('vietqr_bank')}
                  className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    paymentMethod === 'vietqr_bank'
                      ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>Chuyển khoản VietQR</span>
                      <span className="text-[10px] px-1.5 rounded bg-emerald-500/30 text-emerald-300 font-normal">24/7</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Quét QR mọi App ngân hàng</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Fee & Rate Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>{t('currentNexusRate')}:</span>
              <span className="font-mono text-slate-200">1 {currentRate.symbol} = {activeRateVND.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>{t('p2pBenchmarkLabel')} (Binance/Bybit):</span>
              <span className="font-mono text-cyan-400">{currentRate.baseP2PVND.toLocaleString('vi-VN')} ₫</span>
            </div>
            {tradeMode === 'buy' ? (
              <>
                <div className="flex justify-between items-center">
                  <span>{t('networkFee')} ({selectedNetwork}):</span>
                  {networkFeeVND === 0 ? (
                    <span className="font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                      <span>0 ₫</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal border border-emerald-500/30">
                        Miễn phí
                      </span>
                    </span>
                  ) : (
                    <span className="font-mono text-slate-200">{networkFeeVND.toLocaleString('vi-VN')} ₫</span>
                  )}
                </div>
                {gatewayFeeVND > 0 && (
                  <div className="flex justify-between">
                    <span>{t('gatewayFee')} (1% Stripe):</span>
                    <span className="font-mono text-slate-200">{gatewayFeeVND.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span>Phí xử lý giao dịch:</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span>0 ₫</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal border border-emerald-500/30">
                    Miễn phí
                  </span>
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-slate-800 font-bold text-sm">
              <span className="text-white">{tradeMode === 'buy' ? t('totalPayment') : 'Tổng VND nhận về tài khoản'}:</span>
              <span className={`font-mono ${tradeMode === 'buy' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {totalPaymentVND.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {orderError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center space-x-2 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          {/* Submit Button with Strict Auth & KYC Flow Status */}
          <button
            id="proceed-payment-submit-btn"
            disabled={isSubmitting || fiatAmountVND <= 0}
            onClick={handleProceed}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-white ${
              !isUserLoggedIn || !user || !user.email
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-cyan-600/30'
                : !isKycApproved || user.monthlyLimitVND <= 0
                ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-slate-800 hover:from-amber-600 hover:to-slate-700 shadow-amber-700/20'
                : tradeMode === 'buy'
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-emerald-400 shadow-cyan-600/30'
                : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-400 shadow-emerald-600/30'
            }`}
          >
            {!isUserLoggedIn || !user || !user.email ? (
              <>
                <LogIn className="w-5 h-5 text-amber-300" />
                <span>1. Đăng Ký & Đăng Nhập Để Mua/Bán Crypto</span>
                <ArrowRight className="w-5 h-5 text-amber-300" />
              </>
            ) : !isKycApproved || user.monthlyLimitVND <= 0 ? (
              <>
                <Lock className="w-5 h-5 text-amber-300" />
                <span>🔒 Cần Quản Trị Viên Phê Duyệt KYC Mới Mua & Bán Được</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>
                  {isSubmitting 
                    ? 'Đang khởi tạo đơn hàng...' 
                    : tradeMode === 'buy' 
                      ? t('proceedToPay') 
                      : `Xác nhận bán ${cryptoAmount} ${selectedRate.symbol}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* P2P Benchmark Comparison Matrix Drawer */}
      {showP2PComparison && (
        <div className="w-full bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">So sánh tỷ giá trực tiếp với 5 sàn P2P hàng đầu</h3>
            </div>
            <span className="text-[11px] text-slate-400">Cập nhật theo thời gian thực</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="py-2.5 font-medium">Sàn giao dịch</th>
                  <th className="py-2.5 font-medium">Tỷ giá Mua (VND)</th>
                  <th className="py-2.5 font-medium">Tỷ giá Bán (VND)</th>
                  <th className="py-2.5 font-medium">Tốc độ thanh toán</th>
                  <th className="py-2.5 font-medium">Phương thức</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {/* NEXUS ACTIVE ROW */}
                <tr className="bg-cyan-950/40 text-cyan-200 font-bold border-l-2 border-cyan-400">
                  <td className="py-2.5 pl-2 flex items-center space-x-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>NEXUS GATEWAY</span>
                  </td>
                  <td className="py-2.5 text-indigo-300">{selectedRate.buyPriceVND.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-2.5 text-emerald-300">{selectedRate.sellPriceVND.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-2.5 font-sans">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">Tức thì (15-30s)</span>
                  </td>
                  <td className="py-2.5 text-slate-300 text-[11px] font-sans">Stripe Card / VietQR 247</td>
                </tr>

                {selectedRate.p2pExchanges?.map(ex => (
                  <tr key={ex.exchange} className="hover:bg-slate-850/60 text-slate-300">
                    <td className="py-2.5 font-sans font-medium text-white">{ex.exchange}</td>
                    <td className="py-2.5">{ex.p2pBuyVND.toLocaleString('vi-VN')} ₫</td>
                    <td className="py-2.5">{ex.p2pSellVND.toLocaleString('vi-VN')} ₫</td>
                    <td className="py-2.5 font-sans text-slate-400">3 - 15 phút (Chờ người bán)</td>
                    <td className="py-2.5 text-[11px] font-sans text-slate-400">{ex.paymentMethods.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Tại sao chọn NEXUS Gateway thay vì P2P sàn?</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
              <li>100% tự động qua Hợp đồng thông minh & Ngân hàng chính chủ, tuyệt đối không bị khóa tài khoản ngân hàng do dòng tiền bẩn.</li>
              <li>Thanh toán thẻ Visa/Mastercard toàn cầu qua Stripe hoặc VietQR Napas247 tức thì trong 15-30 giây.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Transparent Transaction Summary Modal */}
      {isTransactionSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsTransactionSummaryOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
              title="Đóng bảng tóm tắt"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Tóm Tắt Giao Dịch & Bóc Tách Chi Phí</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                    Minh Bạch 100%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Vui lòng kiểm tra chi tiết bóc tách chi phí và phí mạng trước khi thanh toán
                </p>
              </div>
            </div>

            {/* Asset Headline Card */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {tradeMode === 'buy' ? 'Khối lượng Crypto nhận:' : 'Khối lượng Crypto bán:'}
                </span>
                <span className="text-lg font-black text-white font-mono flex items-center space-x-1.5 mt-0.5">
                  <span className={tradeMode === 'buy' ? 'text-emerald-400' : 'text-cyan-400'}>
                    {tradeMode === 'buy' ? '+' : '-'}{cryptoAmount} {currentRate.symbol}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-normal border border-slate-700">
                    {selectedNetwork}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Tỷ giá P2P áp dụng</span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  1 {currentRate.symbol} = {activeRateVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Transparent Cost Breakdown Table */}
            <div className="space-y-2.5 text-xs">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 px-0.5">
                <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bảng phân tích chi phí giao dịch chi tiết:</span>
              </div>

              {/* 1. Base Asset Amount */}
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">1. Tiền mua Token gốc (Base Amount):</span>
                  <span className="text-slate-200 text-xs font-semibold">
                    {cryptoAmount} {currentRate.symbol} × {activeRateVND.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-sm">
                  {fiatAmountVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* 2. Network Fee (Transparent Breakdown) */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                networkFeeVND === 0 
                  ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/20' 
                  : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Fuel className={`w-4 h-4 ${networkFeeVND === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="font-semibold text-slate-200">2. Phí mạng lưới On-Chain ({selectedNetwork}):</span>
                  </div>
                  <div className="text-right">
                    {networkFeeVND === 0 ? (
                      <span className="font-mono text-base font-black text-emerald-400 flex items-center space-x-1.5">
                        <span>0 ₫</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          ✨ Miễn phí
                        </span>
                      </span>
                    ) : (
                      <span className="font-mono text-base font-bold text-amber-400 flex items-center space-x-1.5">
                        <span>{networkFeeVND.toLocaleString('vi-VN')} ₫</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                          ~${activeNetworkConfig?.feeUSD ?? 1.2} USD
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation text */}
                <div className={`text-[11px] p-2 rounded-xl border leading-relaxed ${
                  networkFeeVND === 0 
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30' 
                    : 'bg-slate-900/90 text-slate-400 border-slate-800'
                }`}>
                  {networkFeeVND === 0 ? (
                    <div className="flex items-start space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Chính sách 0đ phí Gas:</strong> Quản trị viên đã kích hoạt gói tài trợ 100% chi phí Gas on-chain cho mạng <strong>{selectedNetwork}</strong>. Quý khách nhận đủ trọn vẹn số Token mà không chịu thêm bất kỳ đồng phí mạng nào!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        Phí thợ đào / Gas On-chain chuyển token trực tiếp qua giao thức mạng <strong>{selectedNetwork}</strong> (Thời gian xử lý: ~{activeNetworkConfig?.estimatedSeconds || 30}s).
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Gateway Fee */}
              {tradeMode === 'buy' && (
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      3. Phí Cổng Thanh Toán ({paymentMethod === 'stripe_card' ? 'Thẻ Quốc Tế Stripe' : 'VietQR NAPAS 24/7'}):
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {paymentMethod === 'stripe_card' ? '1% phí xử lý thẻ VISA / Mastercard' : 'Chuyển khoản liên ngân hàng 24/7 hoàn toàn miễn phí'}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${gatewayFeeVND === 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {gatewayFeeVND === 0 ? '0 ₫ (Miễn phí)' : `${gatewayFeeVND.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              )}

              {/* 4. Final Total Payment Box */}
              <div className="p-3.5 bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/40 rounded-2xl flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-slate-300 block text-xs font-bold">
                    {tradeMode === 'buy' ? 'Tổng Số Tiền Cần Thanh Toán:' : 'Tổng Số Tiền Nhận Về Ngân Hàng:'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tradeMode === 'buy' 
                      ? `= Giá Token (${fiatAmountVND.toLocaleString('vi-VN')}₫) + Phí Mạng (${networkFeeVND === 0 ? '0₫' : `${networkFeeVND.toLocaleString('vi-VN')}₫`}) + Phí Cổng (${gatewayFeeVND}₫)` 
                      : 'Không phụ phí ẩn, nhận đủ 100% tiền về ngân hàng'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                    {totalPaymentVND.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Destination Address / Bank Confirmation */}
              {tradeMode === 'buy' ? (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">
                    Địa chỉ ví nhận {currentRate.symbol} ({selectedNetwork}):
                  </span>
                  <div className="flex items-center justify-between space-x-2">
                    <span className="font-mono text-xs text-white truncate max-w-[280px]">
                      {recipientWallet}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(recipientWallet);
                        setWalletCopiedInModal(true);
                        setTimeout(() => setWalletCopiedInModal(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                    >
                      {walletCopiedInModal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{walletCopiedInModal ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">Tài khoản ngân hàng nhận tiền VND:</span>
                  <div className="text-xs text-slate-200 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
                    <span>{bankName}</span> • <span className="font-mono text-white">{accountNumber}</span> • <span className="uppercase text-emerald-300">{accountName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message inside Modal */}
            {orderError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center space-x-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-5 flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsTransactionSummaryOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Quay lại chỉnh sửa
              </button>

              <button
                type="button"
                onClick={executeOrderCreation}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang khởi tạo đơn...</span>
                ) : (
                  <>
                    <span>Xác nhận & Thanh toán ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
