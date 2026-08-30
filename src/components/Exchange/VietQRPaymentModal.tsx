import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Download,
  Share2,
  Smartphone,
  FileText,
  Eye,
  Info,
  ExternalLink,
  Code,
  Layers
} from 'lucide-react';
import { 
  buildVietQREMVCo, 
  buildVietQRImageUrl, 
  generateVietQRDataURL, 
  findBank, 
  getBankOrDefault,
  VIETNAM_BANKS 
} from '../../utils/vietqr';
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
  const [emvcoString, setEmvcoString] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [qrDisplayMode, setQrDisplayMode] = useState<'standard_card' | 'pure_emvco'>('standard_card');
  const [showEmvcoInspector, setShowEmvcoInspector] = useState<boolean>(false);

  // Bank metadata lookup
  const currentBankInfo = findBank(activeBank.bankCode || activeBank.bankShort) || getBankOrDefault(activeBank.bankShort);
  const memoContent = `${activeBank.gatewayMemoPrefix || 'NEXUSPAY'} ${activeOrder?.id || ''}`.trim();

  // Generate official EMVCo string and QR Code data URL when order changes
  useEffect(() => {
    if (activeOrder && isVietQRModalOpen) {
      const bankBin = activeBank.bankCode || currentBankInfo.bin || '970436';
      
      // 1. Build official State Bank of Vietnam & NAPAS EMVCo specification string
      const emvco = buildVietQREMVCo({
        bankBin,
        accountNumber: activeBank.accountNumber,
        amount: activeOrder.totalVND,
        memo: memoContent
      });
      setEmvcoString(emvco);

      // 2. Generate pure vector/canvas QR Code from standard EMVCo string
      generateVietQRDataURL({
        bankBin,
        accountNumber: activeBank.accountNumber,
        accountName: activeBank.accountName,
        amount: activeOrder.totalVND,
        memo: memoContent
      }, 400)
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error('VietQR generation error:', err);
        // Fallback to standard VietQR CDN URL
        setQrDataUrl(buildVietQRImageUrl({
          bankBin,
          accountNumber: activeBank.accountNumber,
          accountName: activeBank.accountName,
          amount: activeOrder.totalVND,
          memo: memoContent,
          template: 'compact2'
        }));
      });
    }
  }, [activeOrder, isVietQRModalOpen, activeBank, memoContent, currentBankInfo]);

  // Countdown timer
  useEffect(() => {
    if (!isVietQRModalOpen) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isVietQRModalOpen]);

  if (!isVietQRModalOpen || !activeOrder) return null;

  const copyToClipboard = (text: string, fieldName: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    if (label) {
      addNotification('info', 'Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
    }
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllDetails = () => {
    const fullText = [
      `=== THÔNG TIN THANH TOÁN VIETQR CHUẨN NAPAS 24/7 ===`,
      `Ngân hàng: ${activeBank.bankName} (BIN: ${activeBank.bankCode || currentBankInfo.bin})`,
      `Số tài khoản: ${activeBank.accountNumber}`,
      `Chủ tài khoản: ${activeBank.accountName}`,
      `Số tiền chính xác: ${activeOrder.totalVND.toLocaleString('vi-VN')} VND`,
      `Nội dung chuyển khoản (Memo): ${memoContent}`,
      `Mã đơn hàng: #${activeOrder.id}`,
      `Chuỗi EMVCo Quốc Gia: ${emvcoString}`,
      `==================================================`
    ].join('\n');

    copyToClipboard(fullText, 'all', 'toàn bộ thông tin chuyển khoản');
  };

  /**
   * Generates a high-definition branded VietQR payment card on an off-screen HTML5 canvas.
   */
  const generatePaymentCardBlob = async (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const width = 680;
        const height = 960;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');

        // 1. Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0a0f1d');
        bgGrad.addColorStop(0.5, '#040711');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Decorative Outer Border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(16, 16, width - 32, height - 32);

        // Accent top glow line
        const accentGrad = ctx.createLinearGradient(16, 16, width - 16, 16);
        accentGrad.addColorStop(0, '#06b6d4');
        accentGrad.addColorStop(0.5, '#10b981');
        accentGrad.addColorStop(1, '#6366f1');
        ctx.strokeStyle = accentGrad;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(24, 16);
        ctx.lineTo(width - 24, 16);
        ctx.stroke();

        // 3. Header Branding
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VIETQR • CHUYỂN KHOẢN TỨC THÌ 24/7 (NAPAS)', width / 2, 56);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('CỔNG THANH TOÁN TỰ ĐỘNG NEXUS PAY', width / 2, 86);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText(`Mã đơn: #${activeOrder.id} • Mua: ${activeOrder.cryptoAmount} ${activeOrder.cryptoSymbol}`, width / 2, 108);

        // 4. White QR Container
        const qrBoxWidth = 350;
        const qrBoxHeight = 350;
        const qrX = (width - qrBoxWidth) / 2;
        const qrY = 126;

        ctx.fillStyle = '#ffffff';
        roundRect(ctx, qrX, qrY, qrBoxWidth, qrBoxHeight, 20);
        ctx.fill();

        // Draw QR Image
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          qrImg.src = qrDataUrl;
          await new Promise((res, rej) => {
            qrImg.onload = res;
            qrImg.onerror = rej;
          });
          ctx.drawImage(qrImg, qrX + 15, qrY + 15, qrBoxWidth - 30, qrBoxHeight - 30);
        }

        // Subtitle below QR
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Quét bằng App mọi Ngân hàng tại Việt Nam (VCB, MB, TCB, VPB, ACB...)', width / 2, 500);

        // 5. Details Section Box
        const detailX = 36;
        const detailY = 520;
        const detailW = width - 72;
        const detailH = 340;

        ctx.fillStyle = '#0f172a';
        roundRect(ctx, detailX, detailY, detailW, detailH, 18);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw detail lines
        ctx.textAlign = 'left';

        // Row 1: Amount
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('Số tiền thanh toán:', detailX + 24, detailY + 38);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`${activeOrder.totalVND.toLocaleString('vi-VN')} VND`, detailX + 24, detailY + 68);

        // Divider
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(detailX + 20, detailY + 86);
        ctx.lineTo(detailX + detailW - 20, detailY + 86);
        ctx.stroke();

        // Row 2: Bank
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('Ngân hàng thụ hưởng:', detailX + 24, detailY + 115);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`${activeBank.bankName} (BIN: ${activeBank.bankCode || currentBankInfo.bin})`, detailX + 24, detailY + 136);

        // Row 3: Account Number & Name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('Số tài khoản:', detailX + 24, detailY + 172);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 19px monospace';
        ctx.fillText(activeBank.accountNumber, detailX + 24, detailY + 195);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('Chủ tài khoản:', detailX + detailW / 2 + 10, detailY + 172);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(activeBank.accountName, detailX + detailW / 2 + 10, detailY + 195);

        // Row 4: Memo
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Nội dung chuyển khoản (Bắt buộc):', detailX + 24, detailY + 235);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 19px monospace';
        ctx.fillText(memoContent, detailX + 24, detailY + 262);

        // Row 5: Security notice
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('*Hệ thống tự động khớp lệnh phát hành Crypto trong 5-15 giây sau khi nhận tiền', width / 2, detailY + 310);

        // 6. Footer
        ctx.fillStyle = '#475569';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Chuẩn VietQR EMVCo NAPAS 24/7 • ${new Date().toLocaleString('vi-VN')}`, width / 2, height - 30);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    });
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Handle Save / Download QR Image
  const handleSaveQRImage = async () => {
    setIsGeneratingImage(true);
    try {
      const blob = await generatePaymentCardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VietQR_NAPAS_${activeOrder.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification(
        'order_success',
        'Đã lưu ảnh thẻ VietQR chuẩn quốc gia',
        'Thẻ thanh toán VietQR chất lượng cao đã lưu vào máy. Bạn có thể mở App ngân hàng chọn "Quét ảnh QR từ thư viện".'
      );
    } catch (err) {
      console.error('Failed to save QR image:', err);
      if (qrDataUrl) {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `VietQR_EMVCo_${activeOrder.id}.png`;
        link.click();
        addNotification('info', 'Đã tải mã QR', 'Mã QR đã được lưu về thiết bị.');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle Share QR Code
  const handleShareQRCode = async () => {
    setIsSharing(true);
    try {
      const blob = await generatePaymentCardBlob();
      const file = new File([blob], `VietQR_NEXUS_${activeOrder.id}.png`, { type: 'image/png' });
      
      const shareData = {
        title: `Thanh toán VietQR đơn hàng #${activeOrder.id}`,
        text: `Chuyển khoản ${activeOrder.totalVND.toLocaleString('vi-VN')} VND tới ${activeBank.bankName} (STK: ${activeBank.accountNumber}, Tên: ${activeBank.accountName}). Nội dung: ${memoContent}`,
        files: [file]
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
        addNotification('info', 'Chia sẻ thành công', 'Đã mở menu chia sẻ mã thanh toán VietQR.');
      } else if (navigator.share) {
        await navigator.share({
          title: `Thanh toán VietQR đơn hàng #${activeOrder.id}`,
          text: `Chuyển khoản ${activeOrder.totalVND.toLocaleString('vi-VN')} VND tới ${activeBank.bankName} (STK: ${activeBank.accountNumber}, Tên: ${activeBank.accountName}). Nội dung: ${memoContent}`
        });
      } else {
        copyAllDetails();
        handleSaveQRImage();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        copyAllDetails();
      }
    } finally {
      setIsSharing(false);
    }
  };

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
          'Khớp lệnh thanh toán VietQR thành công',
          `Hệ thống đã nhận đủ ${res.order.totalVND.toLocaleString('vi-VN')} ₫ qua VietQR NAPAS. Đang tự động giải ngân ${res.order.cryptoAmount} ${res.order.cryptoSymbol} vào ví.`
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

  // VietQR Official CDN image URL
  const vietQrCdnImageUrl = buildVietQRImageUrl({
    bankBin: activeBank.bankCode || currentBankInfo.bin || '970436',
    accountNumber: activeBank.accountNumber,
    accountName: activeBank.accountName,
    amount: activeOrder.totalVND,
    memo: memoContent,
    template: 'compact2'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-200 max-h-[94vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsVietQRModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">{t('vietqrTitle')}</h3>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                Chuẩn Quốc Gia
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tương thích mọi App Ngân hàng Việt Nam (VCB, MB, TCB, ACB, VPB, MoMo...)
            </p>
          </div>
        </div>

        {/* Display Mode Segmented Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-2xl mb-3 shadow-inner">
          <button
            type="button"
            onClick={() => setQrDisplayMode('standard_card')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              qrDisplayMode === 'standard_card'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ VietQR Chuẩn</span>
          </button>

          <button
            type="button"
            onClick={() => setQrDisplayMode('pure_emvco')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              qrDisplayMode === 'pure_emvco'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR EMVCo Thuần</span>
          </button>
        </div>

        {/* Dynamic QR Box */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 text-center flex flex-col items-center shadow-inner relative overflow-hidden">
          
          {/* Main QR Display */}
          {qrDisplayMode === 'standard_card' ? (
            <div className="p-2 bg-white rounded-2xl shadow-2xl inline-block mb-3 max-w-full">
              <img 
                src={vietQrCdnImageUrl} 
                alt="VietQR Standard National Payment Card" 
                onError={(e) => {
                  // If CDN is unreachable, fallback to pure vector QR
                  if (qrDataUrl) (e.target as HTMLImageElement).src = qrDataUrl;
                }}
                className="w-56 h-auto sm:w-64 rounded-xl object-contain" 
              />
            </div>
          ) : (
            <div className="p-3 bg-white rounded-2xl shadow-2xl inline-block mb-3">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Pure EMVCo QR Code" 
                  className="w-48 h-48 sm:w-52 sm:h-52 rounded-lg object-contain" 
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 bg-slate-200 animate-pulse rounded-lg" />
              )}
              <div className="mt-1 text-[10px] font-bold text-slate-800 tracking-wider font-mono">
                EMVCo • NAPAS 24/7
              </div>
            </div>
          )}

          {/* Quick QR Action Buttons: Save Image & Share Directly */}
          <div className="flex items-center justify-center gap-2 mb-3 w-full max-w-xs">
            <button
              type="button"
              onClick={handleSaveQRImage}
              disabled={isGeneratingImage}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-750 hover:border-emerald-500/50 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              title="Tải ảnh thẻ thanh toán VietQR về máy để quét từ thư viện ảnh"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isGeneratingImage ? 'Đang tạo...' : 'Lưu ảnh QR'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareQRCode}
              disabled={isSharing}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-750 hover:border-cyan-500/50 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              title="Chia sẻ mã QR qua Zalo, Messenger hoặc App khác"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSharing ? 'Đang gửi...' : 'Chia sẻ QR'}</span>
            </button>
          </div>

          {/* Timer Remaining */}
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{t('timeRemaining')} <strong className="text-white font-bold">{formatTime(countdown)}</strong></span>
          </div>
        </div>

        {/* Bank Transfer Details Table */}
        <div className="mt-4 space-y-2.5 text-xs">
          {/* Amount */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Số tiền thanh toán chính xác:</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {activeOrder.totalVND.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(String(activeOrder.totalVND), 'amount', 'Số tiền')}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
              title="Sao chép số tiền"
            >
              {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Bank Name */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">{t('bankName')}:</span>
            <div className="flex items-center space-x-1.5 font-semibold text-slate-200 text-right">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeBank.bankName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                BIN: {activeBank.bankCode || currentBankInfo.bin}
              </span>
            </div>
          </div>

          {/* Account Number */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">{t('accountNumber')}:</span>
              <span className="font-mono font-bold text-white text-sm sm:text-base tracking-wider">{activeBank.accountNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(activeBank.accountNumber, 'acc', 'Số tài khoản')}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
              title="Sao chép số tài khoản"
            >
              {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Account Name */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-slate-400">{t('accountName')}:</span>
            <span className="font-bold text-slate-200 uppercase tracking-wide">{activeBank.accountName}</span>
          </div>

          {/* Transfer Memo */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-emerald-300 font-semibold block text-[11px]">{t('transferContent')} (Quan trọng):</span>
              <span className="font-mono font-bold text-amber-300 text-sm sm:text-base">{memoContent}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(memoContent, 'memo', 'Nội dung chuyển khoản')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center space-x-1 transition-colors shadow-md shadow-emerald-600/20"
              title="Sao chép nội dung chuyển khoản"
            >
              {copiedField === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'memo' ? t('copied') : t('copy')}</span>
            </button>
          </div>

          {/* Bottom Tool Links: Copy All & EMVCo Inspector */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowEmvcoInspector(!showEmvcoInspector)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
            >
              <Code className="w-3 h-3" />
              <span>{showEmvcoInspector ? 'Ẩn chuỗi EMVCo' : 'Xem chuỗi EMVCo Quốc Gia'}</span>
            </button>

            <button
              type="button"
              onClick={copyAllDetails}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline underline-offset-2 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{copiedField === 'all' ? 'Đã sao chép tất cả!' : 'Sao chép toàn bộ thông tin'}</span>
            </button>
          </div>

          {/* Collapsible EMVCo Payload Inspector */}
          {showEmvcoInspector && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 animate-fade-in">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Chuỗi Payload chuẩn NAPAS (CRC16-CCITT):</span>
                <button 
                  onClick={() => copyToClipboard(emvcoString, 'emvco', 'Chuỗi EMVCo')}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Sao chép</span>
                </button>
              </div>
              <p className="text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800/80 leading-relaxed text-[10px]">
                {emvcoString}
              </p>
            </div>
          )}
        </div>

        {/* Verification Action */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleVerifyBankPayment}
            disabled={isVerifying}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVerifying ? 'Đang kiểm tra biến động số dư...' : 'Tôi đã chuyển khoản xong (Xác nhận ngay)'}</span>
          </button>
          
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cổng thanh toán tự động khớp lệnh & phát hành Crypto trong 5-15 giây</span>
          </div>
        </div>
      </div>
    </div>
  );
};
