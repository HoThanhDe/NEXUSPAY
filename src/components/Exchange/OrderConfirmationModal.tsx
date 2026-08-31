import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Mail, 
  Download, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ArrowRight,
  FileText,
  QrCode,
  Building2,
  Wallet,
  Fuel
} from 'lucide-react';
import confetti from '../../utils/confetti';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const OrderConfirmationModal: React.FC = () => {
  const { 
    t, 
    activeOrder, 
    isOrderConfirmOpen, 
    setIsOrderConfirmOpen, 
    setActiveOrder, 
    updateUserBalance,
    addNotification,
    refreshUser
  } = useApp();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedDepositWallet, setCopiedDepositWallet] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Blockchain confirmation stepper loop
  useEffect(() => {
    if (!isOrderConfirmOpen || !activeOrder) return;
    if (activeOrder.status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.advanceBlockchainStep(activeOrder.id);
        if (res.success && res.order) {
          setActiveOrder(res.order);
          if (res.order.status === 'completed') {
            if (res.order.type === 'buy_crypto') {
              updateUserBalance(res.order.cryptoSymbol, res.order.cryptoAmount);
            }
            refreshUser();

            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.5 }
              });
            } catch (e) {}

            const notifMsg = res.order.type === 'buy_crypto'
              ? `Giao dịch chuỗi khối #${res.order.id} hoàn tất. Đã chuyển ${res.order.cryptoAmount} ${res.order.cryptoSymbol} vào ví của bạn.`
              : `Giao dịch bán #${res.order.id} hoàn tất. Đã chuyển khoản ${res.order.totalVND.toLocaleString('vi-VN')} VND vào tài khoản ${res.order.bankPayout?.bankName} (${res.order.bankPayout?.accountNumber}).`;

            addNotification(
              'crypto_sent',
              res.order.type === 'buy_crypto' ? 'Crypto đã chuyển vào ví!' : 'Đã nhận tiền VND về ngân hàng!',
              notifMsg
            );
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('Error advancing blockchain step:', e);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isOrderConfirmOpen, activeOrder?.status]);

  if (!isOrderConfirmOpen || !activeOrder) return null;

  const copyTxHash = () => {
    if (activeOrder.txHash) {
      navigator.clipboard.writeText(activeOrder.txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const copyDeposit = () => {
    if (activeOrder.depositWallet) {
      navigator.clipboard.writeText(activeOrder.depositWallet);
      setCopiedDepositWallet(true);
      setTimeout(() => setCopiedDepositWallet(false), 2000);
    }
  };

  const isDone = activeOrder.status === 'completed';
  const progressPercent = Math.min(100, Math.round((activeOrder.blockConfirmations / activeOrder.requiredConfirmations) * 100));

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsOrderConfirmOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xl ${
            isDone 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
          }`}>
            {isDone ? <Sparkles className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isDone 
              ? (activeOrder.type === 'buy_crypto' ? t('cryptoDispatchedSuccess') : 'Tiền VND đã chuyển thành công vào ngân hàng của bạn!') 
              : (activeOrder.type === 'buy_crypto' ? t('orderConfirmed') : 'Đang chờ nhận Crypto & Chuyển tiền VND')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400 inline" />
            <span>{t('autoEmailNotice')}</span>
          </p>
        </div>

        {/* For Sell Crypto: Deposit instructions */}
        {activeOrder.type === 'sell_crypto' && !isDone && (
          <div className="my-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-200">Địa chỉ ví ký quỹ sàn nhận {activeOrder.cryptoSymbol}:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">{activeOrder.network}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between space-x-2">
              <span className="font-mono text-xs text-cyan-400 truncate">{activeOrder.depositWallet}</span>
              <button
                onClick={copyDeposit}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center space-x-1"
              >
                {copiedDepositWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDepositWallet ? 'Đã chép' : 'Chép ví'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Vui lòng chuyển đúng <strong className="text-white">{activeOrder.cryptoAmount} {activeOrder.cryptoSymbol} ({activeOrder.network})</strong>. Hệ thống tự động chuyển khoản VND ngay khi có đủ xác nhận khối.
            </p>
          </div>
        )}

        {/* Blockchain Progress Bar */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{t('blockProgress')}</span>
            </span>
            <span className="font-mono text-cyan-400">
              {activeOrder.blockConfirmations} / {activeOrder.requiredConfirmations} Khối ({progressPercent}%)
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isDone 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-center font-medium text-slate-400">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
              <span>{activeOrder.type === 'buy_crypto' ? 'Thanh toán' : 'Khởi tạo'}</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className={`w-3.5 h-3.5 ${activeOrder.blockConfirmations >= 6 ? 'text-emerald-400' : 'text-slate-600'} mb-0.5`} />
              <span>Xác thực khối</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400' : 'text-slate-600'} mb-0.5`} />
              <span>{activeOrder.type === 'buy_crypto' ? 'Chuyển vào ví' : 'Chuyển tiền VND'}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details Box */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-white">{activeOrder.id}</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400">{t('receiptNumber')}</span>
            <span className="font-mono font-bold text-cyan-300">{activeOrder.receiptNumber}</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400">{activeOrder.type === 'buy_crypto' ? 'Số lượng Crypto nhận:' : 'Số lượng Crypto bán:'}</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {activeOrder.type === 'buy_crypto' ? '+' : '-'}{activeOrder.cryptoAmount} {activeOrder.cryptoSymbol} ({activeOrder.network})
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phí mạng lưới ({activeOrder.network}):</span>
            </span>
            {activeOrder.networkFeeVND === 0 ? (
              <span className="font-mono text-emerald-400 font-bold flex items-center space-x-1">
                <span>0 ₫</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  ✨ Miễn phí
                </span>
              </span>
            ) : (
              <span className="font-mono font-bold text-amber-400">
                {(activeOrder.networkFeeVND || 0).toLocaleString('vi-VN')} ₫
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400">{activeOrder.type === 'buy_crypto' ? 'Tổng thanh toán:' : 'Số tiền VND nhận:'}</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">
              {activeOrder.totalVND.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          {activeOrder.type === 'buy_crypto' ? (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
              <span className="text-slate-400">Ví thụ hưởng:</span>
              <span className="font-mono text-slate-300 truncate max-w-[220px]">
                {activeOrder.recipientWallet}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center">
              <span className="text-slate-400">Tài khoản nhận tiền:</span>
              <span className="font-mono text-emerald-300 text-right">
                {activeOrder.bankPayout?.bankName} - {activeOrder.bankPayout?.accountNumber} ({activeOrder.bankPayout?.accountName})
              </span>
            </div>
          )}

          {/* TxHash Display */}
          {activeOrder.txHash && (
            <div className="p-3 bg-slate-950/80 border border-cyan-500/30 rounded-2xl">
              <span className="text-slate-400 block mb-1 text-[11px] font-medium">{t('txHash')}</span>
              <div className="flex items-center justify-between space-x-2">
                <span className="font-mono text-cyan-400 text-xs truncate">
                  {activeOrder.txHash}
                </span>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={copyTxHash}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://tronscan.org/#/transaction/${activeOrder.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 transition-colors"
                    title={t('viewOnExplorer')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Receipt Preview Trigger & Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => setShowReceiptPreview(!showReceiptPreview)}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{showReceiptPreview ? 'Ẩn hóa đơn' : t('downloadReceipt')}</span>
          </button>

          <button
            onClick={() => setIsOrderConfirmOpen(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{t('close')}</span>
          </button>
        </div>

        {/* Printable Receipt Preview Modal Drawer */}
        {showReceiptPreview && (
          <div className="mt-4 p-5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 animate-fade-in text-left">
            <div className="flex justify-between items-start border-b pb-3 mb-3">
              <div>
                <h4 className="font-black text-base text-slate-950">NEXUS GATEWAY JSC</h4>
                <p className="text-[11px] text-slate-500">Hóa đơn điện tử giao dịch Crypto (AML Compliant)</p>
              </div>
              <div className="text-right text-[11px]">
                <span className="font-bold text-slate-800">{activeOrder.receiptNumber}</span>
                <p className="text-slate-500">{new Date(activeOrder.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 mb-4">
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-semibold">{activeOrder.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Loại giao dịch:</span>
                <span className="font-semibold">{activeOrder.type === 'buy_crypto' ? 'Mua Crypto (VND → Token)' : 'Bán Crypto (Token → VND)'}</span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span className="font-semibold">{activeOrder.paymentMethod === 'stripe_card' ? 'Thẻ Quốc Tế (Stripe)' : activeOrder.paymentMethod === 'vietqr_bank' ? 'VietQR Bank Transfer' : 'Crypto Escrow Deposit'}</span>
              </div>
              <div className="flex justify-between">
                <span>Khối lượng:</span>
                <span className="font-semibold">{activeOrder.cryptoAmount} {activeOrder.cryptoSymbol} ({activeOrder.network})</span>
              </div>
              <div className="flex justify-between">
                <span>Phí mạng lưới ({activeOrder.network}):</span>
                <span className="font-semibold">{activeOrder.networkFeeVND === 0 ? '0 ₫ (Miễn phí)' : `${(activeOrder.networkFeeVND || 0).toLocaleString('vi-VN')} ₫`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t">
                <span>Tổng tiền VND:</span>
                <span className="text-indigo-600">{activeOrder.totalVND.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handlePrintReceipt}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>In / Lưu PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
