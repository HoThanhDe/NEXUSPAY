import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sliders,
  Check,
  Save,
  RefreshCw,
  Clock,
  Layers,
  Fuel,
  Activity,
  Sparkles,
  Info,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CryptoSymbol, CryptoNetwork, NetworkFeeConfig } from '../../types';

interface NetworkFeeManagementDeskProps {
  onRefreshAll?: () => void;
}

export const NetworkFeeManagementDesk: React.FC<NetworkFeeManagementDeskProps> = ({ onRefreshAll }) => {
  const { rates, setRates, selectedRate, setSelectedRate, addNotification, language } = useApp();

  // Selected for Direct Editing
  const [selectedToken, setSelectedToken] = useState<CryptoSymbol>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
  
  const [feeVNDInput, setFeeVNDInput] = useState<number>(30500);
  const [feeUSDInput, setFeeUSDInput] = useState<number>(1.2);
  const [estimatedSecInput, setEstimatedSecInput] = useState<number>(30);
  const [networkStatus, setNetworkStatus] = useState<'active' | 'suspended'>('active');
  const [gasPriority, setGasPriority] = useState<'standard' | 'fast' | 'instant'>('standard');
  const [congestionLevel, setCongestionLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [applyToAllTokensWithNetwork, setApplyToAllTokensWithNetwork] = useState<boolean>(false);

  // Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live simulation calculator
  const [simToken, setSimToken] = useState<CryptoSymbol>('USDT');
  const [simAmount, setSimAmount] = useState<number>(100);

  // Available networks for selected token
  const currentTokenRate = rates.find(r => r.symbol === selectedToken) || rates[0];
  const availableNetworks = currentTokenRate?.networks || [];

  // When selectedToken or selectedNetwork changes, populate input form
  useEffect(() => {
    const netConfig = availableNetworks.find(n => n.network === selectedNetwork) || availableNetworks[0];
    if (netConfig) {
      if (netConfig.network !== selectedNetwork) {
        setSelectedNetwork(netConfig.network);
      }
      setFeeVNDInput(netConfig.feeVND);
      setFeeUSDInput(netConfig.feeUSD);
      setEstimatedSecInput(netConfig.estimatedSeconds);
      setNetworkStatus(netConfig.status || 'active');
      setGasPriority(netConfig.gasPriority || 'standard');
      setCongestionLevel(netConfig.congestionLevel || 'low');
    }
  }, [selectedToken, selectedNetwork, rates]);

  // Handle Save Single/Batch Network Fee
  const handleSaveNetworkFee = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaveSuccess(false);

    if (feeVNDInput < 0) {
      setErrorMessage('Phí mạng VND không được nhỏ hơn 0 ₫.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.updateNetworkFee({
        symbol: applyToAllTokensWithNetwork ? 'ALL' : selectedToken,
        network: selectedNetwork,
        feeVND: Number(feeVNDInput),
        feeUSD: Number(feeUSDInput),
        estimatedSeconds: Number(estimatedSecInput),
        status: networkStatus,
        gasPriority,
        congestionLevel
      });

      if (res.success) {
        if (res.rates) {
          setRates(res.rates);
          const updatedSel = res.rates.find(r => r.symbol === selectedRate.symbol);
          if (updatedSel) setSelectedRate(updatedSel);
        }
        setSaveSuccess(true);
        setSuccessMessage(res.message);
        addNotification(
          'security_alert',
          'Đã cập nhật phí mạng lưới on-chain',
          `Mạng ${selectedNetwork} ${applyToAllTokensWithNetwork ? '(Toàn sàn)' : `(${selectedToken})`}: ${feeVNDInput.toLocaleString('vi-VN')} ₫ (~$${feeUSDInput}) | Xác nhận ~${estimatedSecInput}s.`,
          undefined,
          'admin'
        );
        if (onRefreshAll) onRefreshAll();
        setTimeout(() => {
          setSaveSuccess(false);
          setSuccessMessage(null);
        }, 3500);
      } else {
        setErrorMessage(res.error || 'Cập nhật phí mạng thất bại.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Apply Preset (Eco, Standard, Fast, Free Promo, Reset)
  const handleApplyPreset = async (preset: 'eco' | 'standard' | 'fast' | 'free_promo' | 'reset') => {
    setIsApplyingPreset(preset);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.applyNetworkFeePreset(preset);
      if (res.success) {
        if (res.rates) {
          setRates(res.rates);
          const updatedSel = res.rates.find(r => r.symbol === selectedRate.symbol);
          if (updatedSel) setSelectedRate(updatedSel);
        }
        setSuccessMessage(res.message);
        addNotification(
          'security_alert',
          'Đã kích hoạt cấu hình gói phí mạng',
          res.message,
          undefined,
          'admin'
        );
        if (onRefreshAll) onRefreshAll();
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể áp dụng gói phí.');
    } finally {
      setIsApplyingPreset(null);
    }
  };

  const getNetworkBadgeColor = (net: CryptoNetwork) => {
    switch (net) {
      case 'TRC20': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'BEP20': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ERC20': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'SOLANA': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'POLYGON': return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Simulation calculation
  const simRateObj = rates.find(r => r.symbol === simToken) || rates[0];
  const simNetworks = simRateObj?.networks || [];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner with Quick Presets */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Điều Chỉnh Phí Mạng Lưới On-Chain (Network & Gas Fees)</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  REAL-TIME GAS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tùy chỉnh phí mạng VND/USD, thời gian xử lý và trạng thái cho từng chuỗi (TRC20, BEP20, ERC20, SOLANA, POLYGON).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleApplyPreset('reset')}
              disabled={!!isApplyingPreset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors disabled:opacity-50"
              title="Đặt lại mức phí đề xuất chuẩn on-chain"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isApplyingPreset === 'reset' ? 'animate-spin' : ''}`} />
              <span>Đặt Lại Mặc Định</span>
            </button>
          </div>
        </div>

        {/* 5 One-Click Strategy Presets */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gói Cấu Hình Phí Nhanh Toàn Sàn (1-Click Presets):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleApplyPreset('eco')}
              disabled={!!isApplyingPreset}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                isApplyingPreset === 'eco'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Tiết Kiệm Gas</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold">-30% Phí</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Phí thấp hấp dẫn khách hàng, chấp nhận thời gian xác nhận vừa phải.</p>
            </button>

            <button
              onClick={() => handleApplyPreset('standard')}
              disabled={!!isApplyingPreset}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                isApplyingPreset === 'standard'
                  ? 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Tiêu Chuẩn</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">Chuẩn On-Chain</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Mức phí cân bằng tối ưu giữa tốc độ khớp và chi phí giao dịch.</p>
            </button>

            <button
              onClick={() => handleApplyPreset('fast')}
              disabled={!!isApplyingPreset}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                isApplyingPreset === 'fast'
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Ưu Tiên Cao</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">+40% Gas</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Gas cao bảo đảm đi lệnh tức thì trong 10-15s, chống nghẽn mạng.</p>
            </button>

            <button
              onClick={() => handleApplyPreset('free_promo')}
              disabled={!!isApplyingPreset}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                isApplyingPreset === 'free_promo'
                  ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Khuyến Mại 0₫</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-bold">0 VND Phí</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">NEXUS tài trợ 100% phí mạng, kích thích khối lượng mua lớn.</p>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Left 7 Cols (Detail Editor) + Right 5 Cols (Live Matrix & Simulation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Detailed Fee Configuration Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Chỉnh Sửa Chi Tiết Theo Mạng & Token
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              {selectedToken} / {selectedNetwork}
            </span>
          </div>

          {/* Token Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold">1. Chọn Đồng Tiền Crypto:</label>
            <div className="grid grid-cols-4 gap-2">
              {rates.map(r => (
                <button
                  key={r.symbol}
                  type="button"
                  onClick={() => setSelectedToken(r.symbol)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    selectedToken === r.symbol
                      ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500 text-amber-300 font-bold shadow-lg shadow-amber-950/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{r.symbol}</span>
                  <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{r.networks?.length || 0} mạng</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold">2. Chọn Mạng Chuỗi Khối (Blockchain Network):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableNetworks.map(net => (
                <button
                  key={net.network}
                  type="button"
                  onClick={() => setSelectedNetwork(net.network)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    selectedNetwork === net.network
                      ? 'bg-gradient-to-br from-purple-950/60 to-slate-900 border-purple-500 text-white font-bold ring-2 ring-purple-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getNetworkBadgeColor(net.network)}`}>
                      {net.network}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {net.feeVND.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>~${net.feeUSD}</span>
                    <span>{net.estimatedSeconds}s</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Input Fields */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            {/* Fee VND Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold">
                  Phí Mạng Lưới Thu Từ Khách (VND):
                </label>
                <span className="text-[11px] font-mono text-amber-300 font-bold">
                  {feeVNDInput.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Quick VND presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[0, 5000, 12000, 25000, 30500, 50000, 100000, 150000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setFeeVNDInput(val);
                      setFeeUSDInput(Number((val / (currentTokenRate?.baseP2PVND || 25420)).toFixed(2)));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      feeVNDInput === val
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {val === 0 ? 'Miễn phí (0₫)' : `${val.toLocaleString('vi-VN')}₫`}
                  </button>
                ))}
              </div>

              <div className="relative pt-1">
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={feeVNDInput}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFeeVNDInput(val);
                    setFeeUSDInput(Number((val / (currentTokenRate?.baseP2PVND || 25420)).toFixed(2)));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 pr-14"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">
                  VND
                </span>
              </div>
            </div>

            {/* Fee USD & Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Quy Đổi USD (Tham Khảo):</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.05}
                    value={feeUSDInput}
                    onChange={e => setFeeUSDInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">
                    USD
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Thời Gian Xác Nhận Ước Tính (Giây):</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={600}
                    step={5}
                    value={estimatedSecInput}
                    onChange={e => setEstimatedSecInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">
                    Giây
                  </span>
                </div>
              </div>
            </div>

            {/* Network Status & Gas Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Trạng Thái Mạng:</label>
                <select
                  value={networkStatus}
                  onChange={e => setNetworkStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="active">🟢 Đang Hoạt Động (Cho Phép Giao Dịch)</option>
                  <option value="suspended">🔴 Tạm Dừng / Bảo Trì Mạng</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Mức Ưu Tiên Gas:</label>
                <select
                  value={gasPriority}
                  onChange={e => setGasPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="standard">Tiêu Chuẩn (Standard Gas)</option>
                  <option value="fast">Nhanh (Fast Priority Gas)</option>
                  <option value="instant">Siêu Tốc (Instant Miner Tip)</option>
                </select>
              </div>
            </div>

            {/* Batch apply checkbox */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
              <input
                type="checkbox"
                id="apply-all-checkbox"
                checked={applyToAllTokensWithNetwork}
                onChange={e => setApplyToAllTokensWithNetwork(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <label htmlFor="apply-all-checkbox" className="text-xs text-slate-300 cursor-pointer">
                Đồng thời áp dụng mức phí này cho mạng <strong className="text-amber-300">{selectedNetwork}</strong> trên tất cả token khác (USDT, BTC, ETH, SOL)
              </label>
            </div>
          </div>

          {/* Submit Save Button */}
          <button
            id="save-network-fee-desk-btn"
            disabled={isSaving}
            onClick={handleSaveNetworkFee}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
            <span>
              {saveSuccess 
                ? 'Đã áp dụng phí mạng thành công!' 
                : isSaving 
                  ? 'Đang lưu cài đặt...' 
                  : `Lưu & Áp Dụng Phí Mạng ${selectedNetwork} (${feeVNDInput.toLocaleString('vi-VN')} ₫)`}
            </span>
          </button>
        </div>

        {/* Right Column: Live Network Matrix & Order Simulation */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* Matrix Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Bảng Ma Trận Phí Toàn Hệ Thống
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Đồng bộ tức thời</span>
            </div>

            <div className="space-y-3">
              {rates.map(r => (
                <div key={r.symbol} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{r.name} ({r.symbol})</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {r.networks.length} mạng lưới
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {r.networks.map(n => (
                      <button
                        key={n.network}
                        type="button"
                        onClick={() => {
                          setSelectedToken(r.symbol);
                          setSelectedNetwork(n.network);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedToken === r.symbol && selectedNetwork === n.network
                            ? 'bg-amber-950/40 border-amber-500/60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${getNetworkBadgeColor(n.network)}`}>
                          {n.network}
                        </span>
                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-emerald-300 block">
                            {n.feeVND === 0 ? '0₫' : `${n.feeVND.toLocaleString('vi-VN')}₫`}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block">
                            ~{n.estimatedSeconds}s
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Order Simulation Calculator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mô Phỏng Trực Quan Khi Khách Mua Crypto
                </h5>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">Live Preview</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[11px]">Thử Mua:</span>
                <input
                  type="number"
                  value={simAmount}
                  onChange={e => setSimAmount(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs text-center"
                />
                <select
                  value={simToken}
                  onChange={e => setSimToken(e.target.value as any)}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold"
                >
                  {rates.map(r => (
                    <option key={r.symbol} value={r.symbol}>{r.symbol}</option>
                  ))}
                </select>
              </div>

              {/* Breakdown Table */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5 font-mono text-[11px]">
                {simNetworks.map(net => {
                  const fiatVND = Math.round(simAmount * simRateObj.buyPriceVND);
                  const gatewayFeeVND = Math.round(fiatVND * 0.015);
                  const totalVND = fiatVND + net.feeVND + gatewayFeeVND;

                  return (
                    <div key={net.network} className="py-1 border-b border-slate-900 last:border-0 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${getNetworkBadgeColor(net.network)}`}>
                          {net.network}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          +Phí Mạng: <strong className="text-amber-300">{net.feeVND.toLocaleString('vi-VN')}₫</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">
                          {totalVND.toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="block text-[9px] text-slate-500">
                          (Bao gồm hàng + phí mạng + phí cổng)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
