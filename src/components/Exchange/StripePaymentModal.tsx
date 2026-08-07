import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const StripePaymentModal: React.FC = () => {
  const { 
    t, 
    activeOrder, 
    isStripeModalOpen, 
    setIsStripeModalOpen, 
    setIsOrderConfirmOpen, 
    setActiveOrder, 
    addNotification,
    refreshUser
  } = useApp();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState('NGUYEN VAN AN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [is3DSecureStep, setIs3DSecureStep] = useState(false);
  const [otpCode, setOtpCode] = useState('789012');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isStripeModalOpen || !activeOrder) return null;

  const handleQuickFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardHolder('NGUYEN VAN AN');
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Số thẻ không hợp lệ (cần đủ 16 chữ số).');
      return;
    }

    // Trigger 3D Secure Verification
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIs3DSecureStep(true);
    }, 1200);
  };

  const handleConfirm3DSecure = async () => {
    setIsProcessing(true);
    try {
      // Call confirm payment API on server
      const res = await api.confirmPayment(activeOrder.id);
      if (res.success && res.order) {
        setActiveOrder(res.order);
        setIsStripeModalOpen(false);
        setIs3DSecureStep(false);
        setIsOrderConfirmOpen(true);
        refreshUser();

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        addNotification(
          'order_success',
          'Thanh toán Stripe thành công',
          `Đơn hàng #${res.order.id} trị giá ${res.order.totalVND.toLocaleString('vi-VN')} ₫ đã được thanh toán. Đang phát hành ${res.order.cryptoAmount} ${res.order.cryptoSymbol} trên chuỗi khối.`
        );
      } else {
        setErrorMessage('Xác thực thanh toán thất bại.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xử lý Stripe.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-200">
        {/* Close button */}
        <button
          onClick={() => {
            setIsStripeModalOpen(false);
            setIs3DSecureStep(false);
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{t('stripeCheckoutTitle')}</h3>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-400 inline mr-1" />
              SSL 256-bit Stripe Encrypted
            </p>
          </div>
        </div>

        {/* 3D Secure Step */}
        {is3DSecureStep ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-center">
              <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-2 animate-bounce" />
              <h4 className="font-bold text-white text-sm">Xác thực 3D Secure / OTP Ngân hàng</h4>
              <p className="text-xs text-slate-300 mt-1">
                Mã xác thực OTP đã được gửi đến số điện thoại đăng ký thẻ.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Nhập mã OTP 6 số:</label>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3 bg-slate-950 border border-indigo-500/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs text-slate-400 text-center">
              Số tiền thanh toán: <span className="font-bold text-white font-mono">{activeOrder.totalVND.toLocaleString('vi-VN')} ₫</span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleConfirm3DSecure}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isProcessing ? 'Đang xác thực bảo mật...' : 'Xác thực & Hoàn tất'}</span>
            </button>
          </div>
        ) : (
          /* Normal Stripe Card Form */
          <form onSubmit={handleInitiatePayment} className="space-y-4">
            {/* Amount Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Đơn hàng #{activeOrder.id}</span>
                <span className="text-xs font-semibold text-slate-200">
                  Mua {activeOrder.cryptoAmount} {activeOrder.cryptoSymbol} ({activeOrder.network})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Tổng tiền</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {activeOrder.totalVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Test Card Fill Helper */}
            <button
              type="button"
              onClick={handleQuickFillTestCard}
              className="w-full py-2 px-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('testCardPrompt')}</span>
            </button>

            {/* Cardholder Name */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">{t('cardHolder')}</label>
              <input
                type="text"
                value={cardHolder}
                onChange={e => setCardHolder(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN AN"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">{t('cardNumber')}</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500 pl-10"
                />
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Expiry & CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">{t('cardExpiry')}</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">{t('cardCvc')}</label>
                <input
                  type="password"
                  value={cardCvc}
                  onChange={e => setCardCvc(e.target.value)}
                  placeholder="CVC"
                  maxLength={4}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? t('processingPayment') : `${t('payNow')} • ${activeOrder.totalVND.toLocaleString('vi-VN')} ₫`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
