import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  Building2,
  ArrowRight,
  Mail,
  Globe,
  Volume2,
  Plus,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  Send,
  Sliders,
  Check,
  X,
  RefreshCw,
  Percent
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateChartData } from '../../services/mockData';
import { CryptoSymbol, PriceAlert } from '../../types';
import { PriceAlertModal } from './PriceAlertModal';
import { playAlertChime } from '../../utils/sound';

const STORAGE_KEY = 'nexus_crypto_price_alerts';

export const MarketChart: React.FC = () => {
  const { t, rates, selectedRate, setSelectedRate, setActiveTab, addNotification, userProfile } = useApp();
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // Quick bar inline alert target price & condition
  const [quickTargetPrice, setQuickTargetPrice] = useState<number>(selectedRate.buyPriceVND);
  const [quickCondition, setQuickCondition] = useState<'above' | 'below'>('above');
  const [quickBrowser, setQuickBrowser] = useState<boolean>(true);
  const [quickEmail, setQuickEmail] = useState<boolean>(true);
  const [quickEmailAddress, setQuickEmailAddress] = useState<string>(userProfile?.email || 'deho.20032021@gmail.com');

  // List of price alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved price alerts', e);
    }
    // Default initial demonstration alerts
    return [
      {
        id: 'ALERT-BTC-01',
        symbol: 'BTC',
        targetPriceVND: 2750000000,
        condition: 'above',
        notifyBrowser: true,
        notifyEmail: true,
        emailAddress: 'deho.20032021@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString(),
        initialPriceVND: 2600000000
      },
      {
        id: 'ALERT-USDT-01',
        symbol: 'USDT',
        targetPriceVND: 26200,
        condition: 'above',
        notifyBrowser: true,
        notifyEmail: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        initialPriceVND: 25950
      },
      {
        id: 'ALERT-ETH-01',
        symbol: 'ETH',
        targetPriceVND: 80000000,
        condition: 'below',
        notifyBrowser: true,
        notifyEmail: true,
        emailAddress: 'deho.20032021@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString(),
        initialPriceVND: 85000000
      }
    ];
  });

  // Filter for alerts list
  const [alertFilter, setAlertFilter] = useState<'all' | 'current' | 'active' | 'triggered'>('all');
  
  // Real-time triggered popup toast
  const [triggeredAlert, setTriggeredAlert] = useState<{
    alert: PriceAlert;
    currentPrice: number;
    dispatchedAt: string;
  } | null>(null);

  // Email dispatch feedback state
  const [emailDispatchLog, setEmailDispatchLog] = useState<{
    symbol: CryptoSymbol;
    targetEmail: string;
    price: number;
    time: string;
  } | null>(null);

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to persist price alerts', e);
    }
  }, [alerts]);

  // Update chart data and sync quick alert price when asset or timeframe changes
  useEffect(() => {
    const data = generateChartData(
      selectedRate.symbol, 
      selectedRate.buyPriceVND, 
      timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : 30
    );
    setChartData(data);
    setQuickTargetPrice(Math.round(selectedRate.buyPriceVND * 1.03));
  }, [selectedRate.symbol, timeframe, selectedRate.buyPriceVND]);

  // Sync quick email with userProfile
  useEffect(() => {
    if (userProfile?.email && !quickEmailAddress) {
      setQuickEmailAddress(userProfile.email);
    }
  }, [userProfile]);

  // Ref to prevent duplicate triggers in immediate ticks
  const triggeredSetRef = useRef<Set<string>>(new Set());

  // REAL-TIME PRICE ALERT MONITORING ENGINE
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.status !== 'active') return;
      if (triggeredSetRef.current.has(alert.id)) return;

      const currentRateObj = rates.find(r => r.symbol === alert.symbol);
      if (!currentRateObj) return;

      const livePrice = currentRateObj.buyPriceVND;
      let isMet = false;

      if (alert.condition === 'above' && livePrice >= alert.targetPriceVND) {
        isMet = true;
      } else if (alert.condition === 'below' && livePrice <= alert.targetPriceVND) {
        isMet = true;
      }

      if (isMet) {
        triggeredSetRef.current.add(alert.id);
        const triggerTime = new Date().toISOString();

        // 1. Update Alert Status to 'triggered'
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'triggered', triggeredAt: triggerTime } : a));

        // 2. Play Web Audio Chime
        playAlertChime();

        // 3. Dispatch Browser Push Notification (if permitted)
        if (alert.notifyBrowser && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              new Notification(`🚨 CẢNH BÁO GIÁ: ${alert.symbol} ĐẠT MỤC TIÊU!`, {
                body: `${alert.symbol} vừa chạm mức ${livePrice.toLocaleString('vi-VN')} ₫ (Mục tiêu: ${alert.targetPriceVND.toLocaleString('vi-VN')} ₫). Nhấn để giao dịch ngay!`,
                icon: '/favicon.ico',
                tag: alert.id
              });
            } catch (e) {
              console.error('Browser notification error', e);
            }
          }
        }

        // 4. Dispatch Email Simulation
        if (alert.notifyEmail && alert.emailAddress) {
          setEmailDispatchLog({
            symbol: alert.symbol,
            targetEmail: alert.emailAddress,
            price: livePrice,
            time: new Date().toLocaleTimeString('vi-VN')
          });
        }

        // 5. In-App Notification
        addNotification(
          'price_alert',
          `🎯 Cảnh Báo Giá ${alert.symbol} Đã Kích Hoạt!`,
          `${alert.symbol} đã ${alert.condition === 'above' ? 'vượt mức' : 'rớt xuống'} mục tiêu ${alert.targetPriceVND.toLocaleString('vi-VN')} ₫. Tỷ giá hiện tại: ${livePrice.toLocaleString('vi-VN')} ₫.`
        );

        // 6. Set interactive Toast
        setTriggeredAlert({
          alert,
          currentPrice: livePrice,
          dispatchedAt: new Date().toLocaleTimeString('vi-VN')
        });
      }
    });
  }, [rates, alerts, addNotification]);

  // Handler to add alert from modal
  const handleSaveModalAlert = (alertData: {
    symbol: CryptoSymbol;
    targetPriceVND: number;
    condition: 'above' | 'below';
    notifyBrowser: boolean;
    notifyEmail: boolean;
    emailAddress?: string;
    initialPriceVND: number;
  }) => {
    const newAlert: PriceAlert = {
      id: `ALERT-${alertData.symbol}-${Date.now().toString().slice(-6)}`,
      ...alertData,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);

    addNotification(
      'price_alert',
      `Đã Cài Đặt Cảnh Báo Giá ${newAlert.symbol}`,
      `Theo dõi khi giá ${newAlert.condition === 'above' ? '≥' : '≤'} ${newAlert.targetPriceVND.toLocaleString('vi-VN')} ₫ qua ${newAlert.notifyBrowser ? 'Trình duyệt' : ''} ${newAlert.notifyEmail ? `và Email (${newAlert.emailAddress})` : ''}.`
    );
  };

  // Handler for quick top bar alert
  const handleQuickCreateAlert = () => {
    if (quickTargetPrice <= 0) return;

    // Check notification permission if browser enabled
    if (quickBrowser && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const newAlert: PriceAlert = {
      id: `ALERT-${selectedRate.symbol}-${Date.now().toString().slice(-6)}`,
      symbol: selectedRate.symbol,
      targetPriceVND: quickTargetPrice,
      condition: quickCondition,
      notifyBrowser: quickBrowser,
      notifyEmail: quickEmail,
      emailAddress: quickEmail ? quickEmailAddress : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      initialPriceVND: selectedRate.buyPriceVND
    };

    setAlerts(prev => [newAlert, ...prev]);
    playAlertChime();

    addNotification(
      'price_alert',
      `Đã Cài Đặt Cảnh Báo ${selectedRate.symbol}`,
      `Hệ thống sẽ gửi thông báo khi giá ${quickCondition === 'above' ? '≥' : '≤'} ${quickTargetPrice.toLocaleString('vi-VN')} ₫.`
    );
  };

  const handleToggleAlertStatus = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const nextStatus = a.status === 'active' ? 'paused' : 'active';
        if (nextStatus === 'active') {
          triggeredSetRef.current.delete(alertId);
        }
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    triggeredSetRef.current.delete(alertId);
  };

  const handleTestTriggerAlert = (alert: PriceAlert) => {
    playAlertChime();
    
    if (alert.notifyBrowser && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`🧪 THỬ NGHIỆM: Cảnh báo giá ${alert.symbol}`, {
          body: `Mức giá mục tiêu: ${alert.targetPriceVND.toLocaleString('vi-VN')} ₫. Hệ thống phát tín hiệu bình thường!`,
          icon: '/favicon.ico'
        });
      } else {
        Notification.requestPermission();
      }
    }

    addNotification(
      'price_alert',
      `🧪 Đã Thử Nghiệm Chuông Báo ${alert.symbol}`,
      `Tín hiệu kiểm tra cho mức giá ${alert.targetPriceVND.toLocaleString('vi-VN')} ₫ qua các kênh đã bật.`
    );

    setTriggeredAlert({
      alert,
      currentPrice: alert.targetPriceVND,
      dispatchedAt: new Date().toLocaleTimeString('vi-VN')
    });
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'current') return a.symbol === selectedRate.symbol;
    if (alertFilter === 'active') return a.status === 'active';
    if (alertFilter === 'triggered') return a.status === 'triggered';
    return true;
  });

  // Find any active alert for current symbol to plot reference line on chart
  const activeSymbolAlert = alerts.find(a => a.symbol === selectedRate.symbol && a.status === 'active');

  // Quick percent offset helper for inline bar
  const applyQuickPercent = (pct: number) => {
    const newPrice = Math.round(selectedRate.buyPriceVND * (1 + pct / 100));
    setQuickTargetPrice(newPrice);
    setQuickCondition(pct >= 0 ? 'above' : 'below');
  };

  // Mock Order Book
  const bids = [
    { price: selectedRate.sellPriceVND - 10, amount: (Math.random() * 5000 + 1000).toFixed(1), total: 125000 },
    { price: selectedRate.sellPriceVND - 25, amount: (Math.random() * 8000 + 2000).toFixed(1), total: 245000 },
    { price: selectedRate.sellPriceVND - 40, amount: (Math.random() * 12000 + 5000).toFixed(1), total: 480000 },
    { price: selectedRate.sellPriceVND - 60, amount: (Math.random() * 20000 + 10000).toFixed(1), total: 890000 },
  ];

  const asks = [
    { price: selectedRate.buyPriceVND + 10, amount: (Math.random() * 4000 + 1000).toFixed(1), total: 98000 },
    { price: selectedRate.buyPriceVND + 25, amount: (Math.random() * 7500 + 2000).toFixed(1), total: 210000 },
    { price: selectedRate.buyPriceVND + 40, amount: (Math.random() * 11000 + 4000).toFixed(1), total: 430000 },
    { price: selectedRate.buyPriceVND + 60, amount: (Math.random() * 19000 + 8000).toFixed(1), total: 780000 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Top Asset Switcher Ribbon with Alert Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rates.map(r => {
          const isSelected = r.symbol === selectedRate.symbol;
          const symbolAlertsCount = alerts.filter(a => a.symbol === r.symbol && a.status === 'active').length;

          return (
            <button
              key={r.symbol}
              onClick={() => setSelectedRate(r)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white">{r.symbol}</span>
                  <span className="text-[11px] text-slate-400">({r.name})</span>
                  {symbolAlertsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center space-x-0.5">
                      <Bell className="w-2.5 h-2.5" />
                      <span>{symbolAlertsCount}</span>
                    </span>
                  )}
                </div>
                <span className={`text-xs font-mono font-semibold flex items-center ${
                  r.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {r.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {r.change24h}%
                </span>
              </div>

              {/* 2-Way Rate Display */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mua:</span>
                  <span className="font-bold text-indigo-300">{r.buyPriceVND.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Bán:</span>
                  <span className="font-bold text-emerald-300">{r.sellPriceVND.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart + Orderbook Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Price Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          
          {/* Chart Header */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {selectedRate.name} ({selectedRate.symbol}/VND)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/30">
                    Tỷ giá Trực Tiếp 24/7
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                  <span>Tỷ giá Thị Trường: <strong className="text-cyan-300">{selectedRate.baseP2PVND.toLocaleString('vi-VN')} ₫</strong></span>
                  <span>Giá Mua vào: <strong className="text-indigo-400">{selectedRate.buyPriceVND.toLocaleString('vi-VN')} ₫</strong></span>
                  <span>Giá Bán ra: <strong className="text-emerald-400">{selectedRate.sellPriceVND.toLocaleString('vi-VN')} ₫</strong></span>
                </div>
              </div>

              {/* Timeframe & Alert Trigger Button */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Cài Cảnh Báo Giá</span>
                </button>

                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                  {(['1H', '24H', '7D', '1M'] as ('1H' | '24H' | '7D' | '1M')[]).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        timeframe === tf
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Alert Reference Badge if set for this symbol */}
            {activeSymbolAlert && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center space-x-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>
                    Đang theo dõi mục tiêu: <strong>{activeSymbolAlert.targetPriceVND.toLocaleString('vi-VN')} ₫</strong> ({activeSymbolAlert.condition === 'above' ? 'Khi giá vượt lên ≥' : 'Khi giá rớt xuống ≤'})
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span>Kênh: {activeSymbolAlert.notifyBrowser ? '🔔 Trình duyệt' : ''} {activeSymbolAlert.notifyEmail ? '✉️ Email' : ''}</span>
                </div>
              </div>
            )}

            {/* Area Chart Container */}
            <div className="h-72 sm:h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    domain={['auto', 'auto']}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl text-xs">
                            <span className="text-slate-400 block mb-1">{data.date} {data.time}</span>
                            <span className="font-bold text-cyan-400 font-mono text-sm block">
                              {Number(data.price).toLocaleString('vi-VN')} ₫
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Khối lượng: {(data.volume / 1000000).toFixed(0)}M ₫
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {activeSymbolAlert && (
                    <ReferenceLine 
                      y={activeSymbolAlert.targetPriceVND} 
                      stroke="#f59e0b" 
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{ value: `Mục tiêu: ${(activeSymbolAlert.targetPriceVND / 1000).toFixed(0)}k ₫`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
                    />
                  )}
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#06b6d4" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#priceGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Real-Time Alert Bar */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Thiết lập nhanh cảnh báo giá cho {selectedRate.symbol}:</span>
              </div>
              <div className="flex items-center space-x-1">
                {[-5, -3, -1, 1, 3, 5].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyQuickPercent(pct)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                      pct > 0 
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50' 
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-900/50'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
              {/* Condition Toggle */}
              <div className="sm:col-span-3">
                <select
                  value={quickCondition}
                  onChange={e => setQuickCondition(e.target.value as 'above' | 'below')}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="above">📈 Vượt lên (≥)</option>
                  <option value="below">📉 Rớt xuống (≤)</option>
                </select>
              </div>

              {/* Target Price */}
              <div className="sm:col-span-4 relative">
                <input
                  type="number"
                  value={quickTargetPrice}
                  onChange={e => setQuickTargetPrice(Number(e.target.value))}
                  placeholder="Mức giá mục tiêu"
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/50 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-cyan-400 text-xs pr-10"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">₫</span>
              </div>

              {/* Notification Channels Checkboxes */}
              <div className="sm:col-span-3 flex items-center space-x-2 text-[11px] text-slate-300">
                <label className="flex items-center space-x-1 cursor-pointer" title="Thông báo Trình duyệt">
                  <input
                    type="checkbox"
                    checked={quickBrowser}
                    onChange={e => setQuickBrowser(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-cyan-500"
                  />
                  <span>🔔 Web</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer" title="Thông báo Email">
                  <input
                    type="checkbox"
                    checked={quickEmail}
                    onChange={e => setQuickEmail(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-500"
                  />
                  <span>✉️ Email</span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleQuickCreateAlert}
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bật Báo Giá</span>
                </button>
              </div>
            </div>

            {quickEmail && (
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>Gửi email tới:</span>
                <input
                  type="email"
                  value={quickEmailAddress}
                  onChange={e => setQuickEmailAddress(e.target.value)}
                  placeholder="email@example.com"
                  className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-white font-medium flex-1 max-w-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Order Book Depth */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>{t('orderBook')}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Độ sâu 20 cấp</span>
            </div>

            {/* Asks (Sell) */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                <span>{t('rate')} (VND)</span>
                <span>Số lượng ({selectedRate.symbol})</span>
              </div>
              {asks.reverse().map((a, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-mono relative py-0.5">
                  <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 rounded" style={{ width: `${(a.total / 1000000) * 100}%` }} />
                  <span className="text-rose-400 font-semibold z-10">{a.price.toLocaleString('vi-VN')}</span>
                  <span className="text-slate-300 z-10">{a.amount}</span>
                </div>
              ))}
            </div>

            {/* Middle Current Price */}
            <div className="py-2.5 px-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between my-2 font-mono">
              <div>
                <span className="text-xs text-slate-400 block">NEXUS Mua:</span>
                <span className="text-sm font-bold text-indigo-400">
                  {selectedRate.buyPriceVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">NEXUS Bán:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {selectedRate.sellPriceVND.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Bids (Buy) */}
            <div className="space-y-1.5 mt-3">
              {bids.map((b, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-mono relative py-0.5">
                  <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 rounded" style={{ width: `${(b.total / 1000000) * 100}%` }} />
                  <span className="text-emerald-400 font-semibold z-10">{b.price.toLocaleString('vi-VN')}</span>
                  <span className="text-slate-300 z-10">{b.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Trade Button */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
            <button
              onClick={() => setActiveTab('exchange')}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center space-x-1.5"
            >
              <span>Giao dịch {selectedRate.symbol} ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-xs text-slate-400 flex justify-between items-center font-mono">
              <span>{t('volume24h')}:</span>
              <span className="font-bold text-white">
                {(selectedRate.volume24hVND / 1000000000).toFixed(2)} Tỷ ₫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED REAL-TIME PRICE ALERTS MANAGEMENT DESK */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Header and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Bảng Quản Lý Cảnh Báo Giá Tự Động (Real-time Price Alerts)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                {alerts.filter(a => a.status === 'active').length} Đang chạy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống theo dõi liên tục từng giây và kích hoạt thông báo đẩy trình duyệt + Email khi tỷ giá chạm ngưỡng
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${alertFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Tất cả ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('current')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${alertFilter === 'current' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                {selectedRate.symbol} ({alerts.filter(a => a.symbol === selectedRate.symbol).length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${alertFilter === 'active' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Đang chờ ({alerts.filter(a => a.status === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('triggered')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${alertFilter === 'triggered' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Đã kích hoạt ({alerts.filter(a => a.status === 'triggered').length})
              </button>
            </div>

            {/* Add New Alert Button */}
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mới</span>
            </button>
          </div>
        </div>

        {/* Alerts Grid / Cards */}
        {filteredAlerts.length === 0 ? (
          <div className="py-10 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
            <p className="text-xs font-semibold">Chưa có cảnh báo giá nào phù hợp với bộ lọc.</p>
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Cảnh Báo Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAlerts.map(alert => {
              const rateObj = rates.find(r => r.symbol === alert.symbol);
              const currentPrice = rateObj ? rateObj.buyPriceVND : alert.initialPriceVND;
              const diffPercent = currentPrice > 0 
                ? (((alert.targetPriceVND - currentPrice) / currentPrice) * 100).toFixed(2)
                : '0';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    alert.status === 'triggered'
                      ? 'bg-gradient-to-br from-amber-950/30 to-slate-950 border-amber-500/50 shadow-md'
                      : alert.status === 'paused'
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Symbol & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-black text-sm text-white font-mono">
                          {alert.symbol}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                          alert.condition === 'above'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {alert.condition === 'above' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{alert.condition === 'above' ? 'Vượt lên ≥' : 'Rớt xuống ≤'}</span>
                        </span>
                      </div>

                      {/* Status Pill */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : alert.status === 'triggered'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.status === 'active' ? '● Đang chờ' : alert.status === 'triggered' ? '⚡ Đã kích hoạt' : '⏸ Tạm dừng'}
                      </span>
                    </div>

                    {/* Target Price Details */}
                    <div className="space-y-1 my-2.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-400 font-medium">Mục tiêu:</span>
                        <span className="text-base font-black text-white font-mono">
                          {alert.targetPriceVND.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                        <span>Giá hiện tại:</span>
                        <span className="text-cyan-300 font-semibold">{currentPrice.toLocaleString('vi-VN')} ₫</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-mono pt-1">
                        <span className="text-slate-500">Khoảng cách:</span>
                        <span className={Number(diffPercent) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {Number(diffPercent) >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Channels */}
                    <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 my-2 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center space-x-2">
                        {alert.notifyBrowser && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 flex items-center space-x-1 border border-cyan-500/20">
                            <Globe className="w-3 h-3" />
                            <span>Browser Push</span>
                          </span>
                        )}
                        {alert.notifyEmail && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 flex items-center space-x-1 border border-indigo-500/20" title={alert.emailAddress}>
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 flex items-center space-x-1 border border-emerald-500/20">
                          <Volume2 className="w-3 h-3" />
                          <span>Chime</span>
                        </span>
                      </div>
                      {alert.notifyEmail && alert.emailAddress && (
                        <div className="text-[10px] text-slate-400 truncate">
                          Đến: {alert.emailAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                    {/* Test alert trigger */}
                    <button
                      type="button"
                      onClick={() => handleTestTriggerAlert(alert)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 text-[11px] font-semibold border border-slate-800 flex items-center space-x-1 transition-colors"
                      title="Phát thử nghiệm âm thanh và thông báo"
                    >
                      <Play className="w-3 h-3" />
                      <span>Thử Chuông</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {/* Toggle Active / Pause */}
                      <button
                        type="button"
                        onClick={() => handleToggleAlertStatus(alert.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          alert.status === 'active'
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        }`}
                        title={alert.status === 'active' ? 'Tạm dừng cảnh báo' : 'Kích hoạt lại cảnh báo'}
                      >
                        {alert.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Xóa cảnh báo này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Live Email Dispatch Activity Notice */}
        {emailDispatchLog && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-center justify-between text-xs text-indigo-200 animate-fade-in">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                <strong>Email Real-time Dispatched:</strong> Đã phát thư cảnh báo giá {emailDispatchLog.symbol} ({emailDispatchLog.price.toLocaleString('vi-VN')}₫) tới <u>{emailDispatchLog.targetEmail}</u> lúc {emailDispatchLog.time}.
              </span>
            </div>
            <button
              onClick={() => setEmailDispatchLog(null)}
              className="text-indigo-400 hover:text-white text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Market Rates Comparison Board */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Bảng so sánh tỷ giá thị trường P2P các sàn quốc tế</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật trực tiếp từ Binance, Bybit, OKX, MEXC, Bitget - Tự động thanh toán 24/7
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap">
            Giao dịch tự động không qua trung gian
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80">
                <th className="py-3 font-semibold">Nền tảng giao dịch</th>
                <th className="py-3 font-semibold">Tỷ giá Mua (VND)</th>
                <th className="py-3 font-semibold">Tỷ giá Bán (VND)</th>
                <th className="py-3 font-semibold">Tốc độ xử lý</th>
                <th className="py-3 font-semibold">Phương thức thanh toán</th>
                <th className="py-3 font-semibold">Bảo đảm giao dịch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {/* NEXUS HIGHLIGHT ROW */}
              <tr className="bg-gradient-to-r from-cyan-950/60 to-slate-900 text-cyan-200 font-bold border-l-4 border-cyan-400">
                <td className="py-3.5 pl-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-sm text-white font-sans">NEXUS PAY GATEWAY</span>
                </td>
                <td className="py-3.5 text-indigo-300 text-sm">{selectedRate.buyPriceVND.toLocaleString('vi-VN')} ₫</td>
                <td className="py-3.5 text-emerald-300 text-sm">{selectedRate.sellPriceVND.toLocaleString('vi-VN')} ₫</td>
                <td className="py-3.5 font-sans">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
                    Tức thì (15 - 30 giây)
                  </span>
                </td>
                <td className="py-3.5 font-sans text-slate-200">Stripe Thẻ Quốc Tế / VietQR Napas 247</td>
                <td className="py-3.5 font-sans text-emerald-400">Hợp đồng thông minh & Ngân hàng chính chủ</td>
              </tr>

              {selectedRate.p2pExchanges?.map(ex => (
                <tr key={ex.exchange} className="hover:bg-slate-850/60 text-slate-300">
                  <td className="py-3 font-sans font-medium text-white pl-3">{ex.exchange}</td>
                  <td className="py-3">{ex.p2pBuyVND.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-3">{ex.p2pSellVND.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-3 font-sans text-slate-400">3 - 15 phút (Chờ duyệt thương nhân)</td>
                  <td className="py-3 font-sans text-slate-400 text-[11px]">{ex.paymentMethods.join(', ')}</td>
                  <td className="py-3 font-sans text-slate-400">Ký quỹ P2P (Có rủi ro khiếu nại tài khoản)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE PRICE ALERT */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        selectedSymbol={selectedRate.symbol}
        currentPriceVND={selectedRate.buyPriceVND}
        onSaveAlert={handleSaveModalAlert}
        userEmail={userProfile?.email}
        cryptoRates={rates.map(r => ({ symbol: r.symbol, name: r.name, buyPriceVND: r.buyPriceVND }))}
      />

      {/* REAL-TIME TRIGGERED POPUP NOTIFICATION TOAST */}
      {triggeredAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900/95 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl text-slate-100 backdrop-blur-xl animate-bounce-short">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/40">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 font-mono block">
                  🚨 CẢNH BÁO GIÁ KÍCH HOẠT
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {triggeredAlert.alert.symbol} Chạm Mức Mục Tiêu!
                </h4>
              </div>
            </div>
            <button
              onClick={() => setTriggeredAlert(null)}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Giá hiện tại:</span>
              <span className="text-cyan-400 font-bold">{triggeredAlert.currentPrice.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ngưỡng mục tiêu:</span>
              <span className="text-amber-400 font-bold">{triggeredAlert.alert.targetPriceVND.toLocaleString('vi-VN')} ₫</span>
            </div>
            {triggeredAlert.alert.notifyEmail && triggeredAlert.alert.emailAddress && (
              <div className="flex justify-between text-[10px] text-indigo-300 pt-1 border-t border-slate-800 font-sans">
                <span>Đã gửi thông báo Email:</span>
                <span className="truncate max-w-[180px]">{triggeredAlert.alert.emailAddress}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setTriggeredAlert(null);
                const rateObj = rates.find(r => r.symbol === triggeredAlert.alert.symbol);
                if (rateObj) setSelectedRate(rateObj);
                setActiveTab('exchange');
              }}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Vào Mua/Bán Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTriggeredAlert(null)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
