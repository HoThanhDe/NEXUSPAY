import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  Sparkles
} from 'lucide-react';
import { QRCode } from '../../utils/qrcode';
import confetti from '../../utils/confetti';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { vietQrBankDetails } from '../../services/mockData';

export const VietQRPaymentModal: React.FC = () => {
  const { 
    t, 
    activeOrder, 
    isVietQRModalOpen, 
    setIsVietQRModalOpen, 
    setIsOrderConfirmOpen, 
    setActiveOrder,
    addNotification,
    refreshUser,
    vietQrConfig
  } = useApp();

  const activeBank = vietQrConfig || vietQrBankDetails;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (activeOrder && isVietQRModalOpen) {
      // Build VietQR formatted payload string using dynamic admin configuration
      const payload = `24/7_NAPAS_${activeBank.bankShort || 'VCB'}_${activeBank.accountNumber}_${activeOrder.totalVND}_${activeBank.gatewayMemoPrefix || 'NEXUSPAY'}_${activeOrder.id}`;
      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
    }
  }, [activeOrder, isVietQRModalOpen, activeBank]);

  // Countdown timer
  useEffect(() => {
    if (!isVietQRModalOpen) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isVietQRModalOpen]);

  if (!isVietQRModalOpen || !activeOrder) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const memoContent = `${activeBank.gatewayMemoPrefix || 'NEXUSPAY'} ${activeOrder.id}`;

  const handleVerifyBankPayment = async () => {
    setIsVerifying(true);
    try {
      const res = await api.confirmPayment(activeOrder.id);
      if (res.success && res.order) {
        setActiveOrder(res.order);
        setIsVietQRModalOpen(false);
        setIsOrderConfirmOpen(true);
        refreshUser();

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        addNotification(
          'order_success',
          'Nhận chuyển khoản VietQR thành công',
          `Hệ thống đã nhận đủ ${res.order.totalVND.toLocaleString('vi-VN')} ₫ qua VietQR. Đang kích hoạt Smart Contract phát hành ${res.order.cryptoAmount} ${res.order.cryptoSymbol}.`
        );
      }
    } catch (err: any) {
      console.error('VietQR verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsVietQRModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{t('vietqrTitle')}</h3>
            <p className="text-[11px] text-slate-400">Tự động nhận diện thanh toán 24/7 tức thì</p>
          </div>
        </div>

        {/* Dynamic QR Box */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 text-center flex flex-col items-center">
          <div className="p-2.5 bg-white rounded-2xl shadow-xl inline-block mb-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="VietQR Payment Code" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-lg" />
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <Clock className="w-4 h-4 animate-spin" />
            <span>{t('timeRemaining')} <strong className="text-white">{formatTime(countdown)}</strong></span>
          </div>
        </div>

        {/* Bank Transfer Details Table */}
        <div className="mt-4 space-y-2.5 text-xs">
          {/* Amount */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">Số tiền chính xác:</span>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold font-mono text-emerald-400">
                {activeOrder.totalVND.toLocaleString('vi-VN')} ₫
              </span>
              <button
                onClick={() => copyToClipboard(String(activeOrder.totalVND), 'amount')}
                className="p-1 text-slate-400 hover:text-white"
              >
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Bank Name */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">{t('bankName')}:</span>
            <span className="font-semibold text-slate-200 text-right">{activeBank.bankName}</span>
          </div>

          {/* Account Number */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">{t('accountNumber')}:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-white text-sm">{activeBank.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(activeBank.accountNumber, 'acc')}
                className="p-1 text-slate-400 hover:text-white"
              >
                {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">{t('accountName')}:</span>
            <span className="font-semibold text-slate-200">{activeBank.accountName}</span>
          </div>

          {/* Transfer Memo */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-emerald-300 font-semibold block">{t('transferContent')}:</span>
              <span className="font-mono font-bold text-white text-sm">{memoContent}</span>
            </div>
            <button
              onClick={() => copyToClipboard(memoContent, 'memo')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center space-x-1 transition-colors"
            >
              {copiedField === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'memo' ? t('copied') : t('copy')}</span>
            </button>
          </div>
        </div>

        {/* Verification Action */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleVerifyBankPayment}
            disabled={isVerifying}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVerifying ? 'Đang kiểm tra biến động số dư...' : 'Tôi đã chuyển khoản xong (Xác nhận ngay)'}</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Hệ thống ngân hàng tự động kết nối và xử lý trong vòng 5 - 15 giây.
          </p>
        </div>
      </div>
    </div>
  );
};
