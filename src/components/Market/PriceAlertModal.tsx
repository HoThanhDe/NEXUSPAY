import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  TrendingUp,
  TrendingDown,
  Mail,
  Volume2,
  Globe,
  Sparkles,
  Check,
  AlertCircle,
  Percent,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CryptoSymbol, PriceAlert } from '../../types';
import { playAlertChime } from '../../utils/sound';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: CryptoSymbol;
  currentPriceVND: number;
  onSaveAlert: (alertData: {
    symbol: CryptoSymbol;
    targetPriceVND: number;
    condition: 'above' | 'below';
    notifyBrowser: boolean;
    notifyEmail: boolean;
    emailAddress?: string;
    initialPriceVND: number;
  }) => void;
  userEmail?: string;
  cryptoRates: { symbol: CryptoSymbol; name: string; buyPriceVND: number }[];
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  selectedSymbol,
  currentPriceVND,
  onSaveAlert,
  userEmail,
  cryptoRates
}) => {
  const [symbol, setSymbol] = useState<CryptoSymbol>(selectedSymbol);
  const [activePrice, setActivePrice] = useState<number>(currentPriceVND);
  const [targetPrice, setTargetPrice] = useState<number>(currentPriceVND);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  
  // Channels
  const [notifyBrowser, setNotifyBrowser] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [emailAddress, setEmailAddress] = useState<string>(userEmail || '');
  const [playAudio, setPlayAudio] = useState<boolean>(true);
  const [browserPermStatus, setBrowserPermStatus] = useState<NotificationPermission>('default');

  // Sync with current symbol price
  useEffect(() => {
    setSymbol(selectedSymbol);
    const rate = cryptoRates.find(r => r.symbol === selectedSymbol);
    const basePrice = rate ? rate.buyPriceVND : currentPriceVND;
    setActivePrice(basePrice);
    setTargetPrice(Math.round(basePrice * (condition === 'above' ? 1.03 : 0.97)));
  }, [selectedSymbol, currentPriceVND, cryptoRates]);

  useEffect(() => {
    if (userEmail && !emailAddress) {
      setEmailAddress(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermStatus(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSymbolChange = (newSym: CryptoSymbol) => {
    setSymbol(newSym);
    const rate = cryptoRates.find(r => r.symbol === newSym);
    if (rate) {
      setActivePrice(rate.buyPriceVND);
      setTargetPrice(Math.round(rate.buyPriceVND * (condition === 'above' ? 1.03 : 0.97)));
    }
  };

  const applyPercentDelta = (percent: number) => {
    const newPrice = Math.round(activePrice * (1 + percent / 100));
    setTargetPrice(newPrice);
    setCondition(percent >= 0 ? 'above' : 'below');
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermStatus(perm);
        if (perm === 'granted') {
          setNotifyBrowser(true);
          new Notification('NEXUS Crypto Alert', {
            body: 'Thông báo đẩy trình duyệt đã được bật thành công!',
            icon: '/favicon.ico'
          });
        }
      } catch (e) {
        console.error('Notification permission error', e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;
    if (notifyEmail && !emailAddress.trim()) {
      alert('Vui lòng nhập địa chỉ email nhận thông báo cảnh báo.');
      return;
    }

    if (playAudio) {
      playAlertChime();
    }

    onSaveAlert({
      symbol,
      targetPriceVND: targetPrice,
      condition,
      notifyBrowser,
      notifyEmail,
      emailAddress: notifyEmail ? emailAddress.trim() : undefined,
      initialPriceVND: activePrice
    });

    onClose();
  };

  const diffPercent = activePrice > 0 
    ? (((targetPrice - activePrice) / activePrice) * 100).toFixed(2) 
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pb-3.5 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Tạo Cảnh Báo Giá Real-Time</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                Live 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Nhận thông báo tự động qua Trình duyệt hoặc Email khi giá chạm mục tiêu
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Asset Selection & Live Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Tài sản Crypto</label>
              <select
                value={symbol}
                onChange={e => handleSymbolChange(e.target.value as CryptoSymbol)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
              >
                {cryptoRates.map(r => (
                  <option key={r.symbol} value={r.symbol}>
                    {r.symbol} ({r.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Tỷ giá hiện tại (Live)</label>
              <div className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-cyan-400 font-mono font-bold flex items-center justify-between">
                <span>{activePrice.toLocaleString('vi-VN')} ₫</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </div>

          {/* Alert Trigger Condition */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">Điều kiện kích hoạt cảnh báo</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCondition('above');
                  if (targetPrice <= activePrice) {
                    setTargetPrice(Math.round(activePrice * 1.03));
                  }
                }}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
                  condition === 'above'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${condition === 'above' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Vượt lên trên (≥)</div>
                  <div className="text-[10px] opacity-80">Khi giá tăng đạt hoặc vượt</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCondition('below');
                  if (targetPrice >= activePrice) {
                    setTargetPrice(Math.round(activePrice * 0.97));
                  }
                }}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
                  condition === 'below'
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 ring-1 ring-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${condition === 'below' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-500'}`}>
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Rớt xuống dưới (≤)</div>
                  <div className="text-[10px] opacity-80">Khi giá giảm chạm hoặc rớt</div>
                </div>
              </button>
            </div>
          </div>

          {/* Target Price Input & Quick Percent Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">
                Mức giá mục tiêu (VND)
              </label>
              <span className={`font-mono text-xs font-bold ${Number(diffPercent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(diffPercent) >= 0 ? `+${diffPercent}%` : `${diffPercent}%`} so với hiện tại
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                required
                min={1}
                value={targetPrice}
                onChange={e => setTargetPrice(Number(e.target.value))}
                placeholder="Nhập mức giá VND mong muốn"
                className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/40 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">
                ₫ / {symbol}
              </span>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center">
                <Percent className="w-3 h-3 mr-0.5" /> Nhanh:
              </span>
              {[
                { label: '+1%', val: 1 },
                { label: '+3%', val: 3 },
                { label: '+5%', val: 5 },
                { label: '+10%', val: 10 },
                { label: '-1%', val: -1 },
                { label: '-3%', val: -3 },
                { label: '-5%', val: -5 },
                { label: '-10%', val: -10 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPercentDelta(p.val)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                    p.val > 0 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60' 
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Kênh nhận thông báo:</span>

            {/* 1. Browser Push Notification */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <Globe className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Thông báo đẩy Trình duyệt (Browser Push)</div>
                  <div className="text-[10px] text-slate-400">
                    Hiển thị popup thông báo góc màn hình ngay lập tức khi mở tab
                  </div>
                  {browserPermStatus !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestBrowserPermission}
                      className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center space-x-1"
                    >
                      <span>⚡ Nhấn để cấp quyền nhận thông báo trình duyệt</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyBrowser}
                onChange={e => {
                  setNotifyBrowser(e.target.checked);
                  if (e.target.checked && browserPermStatus !== 'granted') {
                    requestBrowserPermission();
                  }
                }}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer mt-1"
              />
            </div>

            {/* 2. Email Notification */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">Gửi Email Cảnh Báo (Real-time Email)</div>
                    <div className="text-[10px] text-slate-400">
                      Gửi thư thông báo chi tiết tỷ giá & nút mua bán nhanh vào hộp thư
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700 cursor-pointer mt-1"
                />
              </div>

              {notifyEmail && (
                <div className="mt-2 pl-6">
                  <input
                    type="email"
                    required={notifyEmail}
                    value={emailAddress}
                    onChange={e => setEmailAddress(e.target.value)}
                    placeholder="Nhập địa chỉ email nhận thông báo (ví dụ: ban@gmail.com)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-medium"
                  />
                </div>
              )}
            </div>

            {/* 3. Audio Chime */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Phát âm thanh chuông báo động (Chime)</span>
              </div>
              <input
                type="checkbox"
                checked={playAudio}
                onChange={e => setPlayAudio(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Bật Cảnh Báo Giá</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
