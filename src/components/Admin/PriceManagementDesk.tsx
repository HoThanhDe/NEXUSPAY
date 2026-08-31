import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sliders,
  Save,
  Check,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck,
  Building2,
  Percent,
  Calculator,
  Layers,
  Fuel,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CryptoRate, P2PSpreadSettings, PricingMode } from '../../types';
import { NetworkFeeManagementDesk } from './NetworkFeeManagementDesk';

interface PriceManagementDeskProps {
  onRefreshAll: () => void;
}

export const PriceManagementDesk: React.FC<PriceManagementDeskProps> = ({ onRefreshAll }) => {
  const { rates, setRates, selectedRate, setSelectedRate, addNotification } = useApp();

  // Sub-tab: 'pricing' (Định Giá & Tỷ Giá P2P) | 'network_fees' (Phí Mạng Lưới On-Chain)
  const [subTab, setSubTab] = useState<'pricing' | 'network_fees'>('pricing');

  // Pricing Mode: 'percentage' (Theo Thị Trường Tính %) or 'fixed_vnd' (Cố Định Tự Nhận Linh Hoạt)
  const [pricingMode, setPricingMode] = useState<PricingMode>('percentage');

  // Selected token for direct price editing
  const [editingToken, setEditingToken] = useState<string>('USDT');
  const [buyPriceInput, setBuyPriceInput] = useState<number>(26070);
  const [sellPriceInput, setSellPriceInput] = useState<number>(24570);
  const [baseP2PInput, setBaseP2PInput] = useState<number>(25420);

  // Percentage Mode State
  const [buyMarkupPercent, setBuyMarkupPercent] = useState<number>(2.56);
  const [sellDiscountPercent, setSellDiscountPercent] = useState<number>(3.34);

  // Fixed VND Mode State (No 1000 VND limit!)
  const [buyMarkupVND, setBuyMarkupVND] = useState<number>(650);
  const [sellDiscountVND, setSellDiscountVND] = useState<number>(850);
  const [autoSyncWithMarket, setAutoSyncWithMarket] = useState<boolean>(true);

  // UI state
  const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);
  const [isSavingSpread, setIsSavingSpread] = useState<boolean>(false);
  const [isSyncingMarket, setIsSyncingMarket] = useState<boolean>(false);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState<boolean>(false);
  const [spreadSaveSuccess, setSpreadSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state when editingToken changes or rates load
  useEffect(() => {
    const current = rates.find(r => r.symbol === editingToken) || rates[0];
    if (current) {
      setBuyPriceInput(current.buyPriceVND || 26070);
      setSellPriceInput(current.sellPriceVND || 24570);
      setBaseP2PInput(current.baseP2PVND || 25420);
    }
  }, [editingToken, rates]);

  // Load spread settings from server
  useEffect(() => {
    const fetchSpread = async () => {
      try {
        const res = await api.getSpreadSettings();
        if (res.spreadSettings) {
          setPricingMode(res.spreadSettings.mode || 'percentage');
          setBuyMarkupPercent(res.spreadSettings.buyMarkupPercent ?? 2.56);
          setSellDiscountPercent(res.spreadSettings.sellDiscountPercent ?? 3.34);
          setBuyMarkupVND(res.spreadSettings.buyMarkupVND ?? 650);
          setSellDiscountVND(res.spreadSettings.sellDiscountVND ?? 850);
          setAutoSyncWithMarket(res.spreadSettings.autoSyncWithMarket !== false);
        }
        if (res.baseUSDTP2P) {
          setBaseP2PInput(res.baseUSDTP2P);
        }
      } catch (e) {
        console.error('Failed to load spread settings:', e);
      }
    };
    fetchSpread();
  }, []);

  const currentRateObj = rates.find(r => r.symbol === editingToken) || rates[0];
  const usdtBaseP2P = rates.find(r => r.symbol === 'USDT')?.baseP2PVND || baseP2PInput || 25420;

  // Calculated Preview Values
  const previewBuyVND = pricingMode === 'percentage'
    ? Math.round(usdtBaseP2P * (buyMarkupPercent / 100))
    : buyMarkupVND;
  const previewSellVND = pricingMode === 'percentage'
    ? Math.round(usdtBaseP2P * (sellDiscountPercent / 100))
    : sellDiscountVND;

  const previewBuyPriceUSDT = usdtBaseP2P + previewBuyVND;
  const previewSellPriceUSDT = Math.max(0, usdtBaseP2P - previewSellVND);

  // Handle Save Spread / Pricing Policy
  const handleSaveSpread = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSpreadSaveSuccess(false);

    if (pricingMode === 'percentage') {
      if (buyMarkupPercent < 0 || sellDiscountPercent < 0) {
        setErrorMessage('Tỷ lệ phần trăm biên độ phải lớn hơn hoặc bằng 0%.');
        return;
      }
    } else {
      if (buyMarkupVND < 0 || sellDiscountVND < 0) {
        setErrorMessage('Giá trị biên độ VND cố định phải lớn hơn hoặc bằng 0 ₫.');
        return;
      }
    }

    setIsSavingSpread(true);
    try {
      const res = await api.updateSpreadSettings({
        mode: pricingMode,
        buyMarkupPercent: Number(buyMarkupPercent),
        sellDiscountPercent: Number(sellDiscountPercent),
        buyMarkupVND: Number(buyMarkupVND),
        sellDiscountVND: Number(sellDiscountVND),
        autoSyncWithMarket
      });

      if (res.success) {
        setSpreadSaveSuccess(true);
        setSuccessMessage(res.message);
        addNotification(
          'security_alert',
          'Đã cập nhật cơ chế định giá tỷ giá',
          pricingMode === 'percentage'
            ? `Chế độ: Theo Thị Trường % | Mua: +${buyMarkupPercent}% (~+${previewBuyVND.toLocaleString('vi-VN')}₫) | Bán: -${sellDiscountPercent}% (~-${previewSellVND.toLocaleString('vi-VN')}₫).`
            : `Chế độ: Cố Định Tự Nhận VND | Mua: +${buyMarkupVND.toLocaleString('vi-VN')}₫ | Bán: -${sellDiscountVND.toLocaleString('vi-VN')}₫ (Không giới hạn).`
        );
        onRefreshAll();
        setTimeout(() => {
          setSpreadSaveSuccess(false);
          setSuccessMessage(null);
        }, 3500);
      } else {
        setErrorMessage(res.message || res.error || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSavingSpread(false);
    }
  };

  // Handle Direct Price Update for a specific Token
  const handleSaveDirectPrice = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPriceSaveSuccess(false);

    if (buyPriceInput <= 0 || sellPriceInput <= 0) {
      setErrorMessage('Giá Mua và Giá Bán phải lớn hơn 0.');
      return;
    }

    if (buyPriceInput < sellPriceInput) {
      setErrorMessage('Giá Mua (NEXUS bán cho khách) phải cao hơn hoặc bằng Giá Bán (NEXUS thu mua từ khách).');
      return;
    }

    setIsSavingPrice(true);
    try {
      const res = await api.updateTokenPrice({
        symbol: editingToken,
        buyPriceVND: Number(buyPriceInput),
        sellPriceVND: Number(sellPriceInput),
        baseP2PVND: Number(baseP2PInput)
      });

      if (res.success) {
        setPriceSaveSuccess(true);
        setSuccessMessage(res.message || `Đã cập nhật giá ${editingToken} thành công!`);
        addNotification(
          'security_alert',
          `Đã cập nhật giá niêm yết ${editingToken}`,
          `Giá Mua: ${buyPriceInput.toLocaleString('vi-VN')} ₫ | Giá Bán: ${sellPriceInput.toLocaleString('vi-VN')} ₫.`
        );
        onRefreshAll();
        setTimeout(() => {
          setPriceSaveSuccess(false);
          setSuccessMessage(null);
        }, 3500);
      } else {
        setErrorMessage(res.error || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSavingPrice(false);
    }
  };

  // Auto-sync with live 5 P2P Exchanges
  const handleAutoSyncMarket = async () => {
    setIsSyncingMarket(true);
    setErrorMessage(null);
    try {
      const res = await api.autoSyncMarketRates();
      if (res.success) {
        if (res.rates) setRates(res.rates);
        addNotification(
          'security_alert',
          'Đã tự động nhận giá thị trường P2P',
          'Tỷ giá 5 sàn quốc tế (Binance, Bybit, OKX, MEXC, Bitget) đã được đồng bộ tức thời.'
        );
        onRefreshAll();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSyncingMarket(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Desk Sub-Navigation Tabs */}
      <div className="p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-1.5 shadow-xl">
        <button
          type="button"
          onClick={() => setSubTab('pricing')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            subTab === 'pricing'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Quản Lý Tỷ Giá & Biên Độ P2P</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('network_fees')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            subTab === 'network_fees'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/40 border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>2. Điều Chỉnh Phí Mạng Lưới On-Chain (Network Fees)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 ml-1 border border-amber-400/30">
            Mới & Real-Time Gas
          </span>
        </button>
      </div>

      {subTab === 'network_fees' ? (
        <NetworkFeeManagementDesk onRefreshAll={onRefreshAll} />
      ) : (
        <>
          {/* Top Banner with Quick Actions */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Quản Lý & Cấu Hình Cơ Chế Giá Mua / Bán</h3>
              <p className="text-xs text-slate-400">
                Hỗ trợ 2 kiểu định giá: <strong className="text-cyan-300">Theo Thị Trường Tính Phần Trăm (%)</strong> và <strong className="text-indigo-300">Biên Độ Cố Định Tự Nhận (Không giới hạn 1.000đ)</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handleAutoSyncMarket}
            disabled={isSyncingMarket}
            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 border border-cyan-500/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSyncingMarket ? 'animate-spin' : ''}`} />
            <span>{isSyncingMarket ? 'Đang nhận giá P2P...' : 'Tự Động Nhận Giá Thị Trường'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-1.5">
        <button
          onClick={() => setPricingMode('percentage')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all ${
            pricingMode === 'percentage'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Kiểu 1: Theo Thị Trường Tính Phần Trăm (%)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white ml-1">Tự Động Biến Thiên</span>
        </button>

        <button
          onClick={() => setPricingMode('fixed_vnd')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all ${
            pricingMode === 'fixed_vnd'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Kiểu 2: Biên Độ Cố Định Tự Nhận (VND Linh Hoạt)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white ml-1">Không Giới Hạn 1.000₫</span>
        </button>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section (7 Cols): Global Spread & Algorithm Controls */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {pricingMode === 'percentage'
                  ? 'Cấu Hình Định Giá Theo Thị Trường Tính %'
                  : 'Cấu Hình Biên Độ Cố Định Linh Hoạt'}
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              P2P Index: {usdtBaseP2P.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          {/* MODE 1: PERCENTAGE MODE */}
          {pricingMode === 'percentage' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5 text-cyan-300">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Công thức tính giá theo % thị trường:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-cyan-900/50">
                    <span className="text-indigo-300 block font-bold">Giá Mua Khách Trả:</span>
                    <span>= Giá P2P + (Giá P2P × +{buyMarkupPercent}%)</span>
                    <span className="block text-indigo-400 font-bold mt-1">≈ {previewBuyPriceUSDT.toLocaleString('vi-VN')} ₫ (+{previewBuyVND.toLocaleString('vi-VN')}₫)</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-cyan-900/50">
                    <span className="text-emerald-300 block font-bold">Giá Bán Khách Nhận:</span>
                    <span>= Giá P2P - (Giá P2P × -{sellDiscountPercent}%)</span>
                    <span className="block text-emerald-400 font-bold mt-1">≈ {previewSellPriceUSDT.toLocaleString('vi-VN')} ₫ (-{previewSellVND.toLocaleString('vi-VN')}₫)</span>
                  </div>
                </div>
              </div>

              {/* Buy Markup Percent Input */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Phần Trăm Mua Vào (Markup %)</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    +{buyMarkupPercent}% (≈ +{previewBuyVND.toLocaleString('vi-VN')} ₫)
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setBuyMarkupPercent(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        buyMarkupPercent === val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      +{val}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={buyMarkupPercent ?? 2.5}
                    onChange={e => setBuyMarkupPercent(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.1}
                      value={buyMarkupPercent ?? 0}
                      onChange={e => setBuyMarkupPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-indigo-500 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
              </div>

              {/* Sell Discount Percent Input */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span>Phần Trăm Bán Ra (Discount %)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    -{sellDiscountPercent}% (≈ -{previewSellVND.toLocaleString('vi-VN')} ₫)
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[1.0, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 7.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setSellDiscountPercent(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        sellDiscountPercent === val
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      -{val}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={sellDiscountPercent ?? 3.3}
                    onChange={e => setSellDiscountPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.1}
                      value={sellDiscountPercent ?? 0}
                      onChange={e => setSellDiscountPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-emerald-500 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: FIXED VND MODE (NO 1000 VND RESTRICTION!) */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5 text-indigo-300">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Biên độ cố định tự nhận (Không giới hạn mức 1.000₫):</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Bạn có thể nhập tự do mọi giá trị chênh lệch (ví dụ: +500₫, +1.500₫, +3.000₫, +10.000₫, v.v.). Hệ thống tự động nhận và cộng/trừ trực tiếp vào chỉ số P2P sàn.
                </p>
              </div>

              {/* Fixed Buy Markup VND Input */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Biên Độ Mua Cố Định (VND / 1 USDT)</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    +{buyMarkupVND.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[200, 500, 800, 1200, 1500, 2000, 3000, 5000].map(val => (
                    <button
                      key={val}
                      onClick={() => setBuyMarkupVND(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        buyMarkupVND === val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      +{val.toLocaleString('vi-VN')}₫
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={buyMarkupVND ?? 0}
                    onChange={e => setBuyMarkupVND(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 pr-16"
                  />
                  <span className="absolute right-3.5 top-1/2 translate-y-[-20%] text-xs text-slate-400 font-mono">₫ / USDT</span>
                </div>
              </div>

              {/* Fixed Sell Discount VND Input */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span>Biên Độ Bán Cố Định (VND / 1 USDT)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    -{sellDiscountVND.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[500, 850, 1200, 1500, 2000, 3000, 5000, 10000].map(val => (
                    <button
                      key={val}
                      onClick={() => setSellDiscountVND(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        sellDiscountVND === val
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      -{val.toLocaleString('vi-VN')}₫
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={sellDiscountVND ?? 0}
                    onChange={e => setSellDiscountVND(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 pr-16"
                  />
                  <span className="absolute right-3.5 top-1/2 translate-y-[-20%] text-xs text-slate-400 font-mono">₫ / USDT</span>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Sync Market Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <input
                type="checkbox"
                id="auto-sync-checkbox"
                checked={autoSyncWithMarket}
                onChange={e => setAutoSyncWithMarket(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="auto-sync-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                Tự động nhận biến động thời gian thực từ 5 sàn P2P quốc tế
              </label>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              Live Feed
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="save-p2p-spread-desk-btn"
              disabled={isSavingSpread}
              onClick={handleSaveSpread}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {spreadSaveSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{spreadSaveSuccess ? 'Đã áp dụng định giá thành công!' : isSavingSpread ? 'Đang lưu cài đặt...' : `Lưu & Kích Hoạt Định Giá (${pricingMode === 'percentage' ? 'Theo % Thị Trường' : 'Cố Định Linh Hoạt'})`}</span>
            </button>
          </div>
        </div>

        {/* Right Section (5 Cols): Direct Token Price & P2P Real-Time Live Feed */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Chỉnh Sửa Trực Tiếp Theo Token</h4>
              </div>
              <span className="text-[11px] text-slate-400">Tùy biến nhanh</span>
            </div>

            {/* Token Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rates.map(r => (
                <button
                  key={r.symbol}
                  onClick={() => setEditingToken(r.symbol)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    editingToken === r.symbol
                      ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{r.symbol}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono font-bold text-cyan-300">
                    {r.buyPriceVND ? (r.buyPriceVND > 1000000 ? `${(r.buyPriceVND / 1000000).toFixed(1)}M` : `${r.buyPriceVND.toLocaleString('vi-VN')}₫`) : ''}
                  </div>
                </button>
              ))}
            </div>

            {/* Direct Inputs */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-indigo-300 font-semibold flex justify-between">
                  <span>Giá Mua Niêm Yết ({editingToken})</span>
                  <span className="text-[11px] font-mono text-slate-400">NEXUS bán</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={buyPriceInput ?? 0}
                    onChange={e => setBuyPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">₫</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-emerald-300 font-semibold flex justify-between">
                  <span>Giá Bán Niêm Yết ({editingToken})</span>
                  <span className="text-[11px] font-mono text-slate-400">NEXUS thu mua</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sellPriceInput ?? 0}
                    onChange={e => setSellPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">₫</span>
                </div>
              </div>

              <button
                id="save-direct-token-price-btn"
                disabled={isSavingPrice}
                onClick={handleSaveDirectPrice}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                {priceSaveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{priceSaveSuccess ? 'Đã lưu giá token!' : `Cập nhật riêng ${editingToken}`}</span>
              </button>
            </div>

            {/* Real-time 5 P2P Exchange Comparison Matrix */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Bảng Đối Soát 5 Sàn Quốc Tế:</span>
                <span className="text-[10px] text-cyan-400 font-mono">Cập nhật mỗi 4s</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                {currentRateObj.p2pExchanges?.map(ex => (
                  <div key={ex.exchange} className="flex justify-between items-center text-slate-400 py-1 border-b border-slate-850/80">
                    <span className="font-sans font-semibold text-slate-300">{ex.shortName}:</span>
                    <div className="space-x-2">
                      <span className="text-indigo-300">Mua {ex.p2pBuyVND.toLocaleString('vi-VN')}₫</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-300">Bán {ex.p2pSellVND.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
