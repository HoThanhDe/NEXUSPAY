import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
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
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateChartData } from '../../services/mockData';

export const MarketChart: React.FC = () => {
  const { t, rates, selectedRate, setSelectedRate, setActiveTab, addNotification } = useApp();
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H');
  const [chartData, setChartData] = useState<any[]>([]);
  const [targetAlertPrice, setTargetAlertPrice] = useState<number>(selectedRate.buyPriceVND);
  const [isAlertSet, setIsAlertSet] = useState<boolean>(false);

  useEffect(() => {
    const data = generateChartData(
      selectedRate.symbol, 
      selectedRate.buyPriceVND, 
      timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : 30
    );
    setChartData(data);
    setTargetAlertPrice(selectedRate.buyPriceVND);
  }, [selectedRate.symbol, timeframe, selectedRate.buyPriceVND]);

  const handleSetPriceAlert = () => {
    setIsAlertSet(true);
    addNotification(
      'price_alert',
      `Đã tạo cảnh báo giá cho ${selectedRate.symbol}`,
      `Hệ thống sẽ gửi thông báo đẩy ngay khi ${selectedRate.symbol} đạt mức ${targetAlertPrice.toLocaleString('vi-VN')} ₫.`
    );
    setTimeout(() => setIsAlertSet(false), 3000);
  };

  // Mock Order Book with live buy/sell rates
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
      {/* Top Asset Switcher Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rates.map(r => {
          const isSelected = r.symbol === selectedRate.symbol;
          return (
            <button
              key={r.symbol}
              onClick={() => setSelectedRate(r)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white">{r.symbol}</span>
                  <span className="text-[11px] text-slate-400">({r.name})</span>
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
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
          {/* Chart Header */}
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

            {/* Timeframe selector */}
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

          {/* Quick Trade CTA & Price Alert Box */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300 w-full sm:w-auto">
              <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t('priceAlert')}:</span>
              <input
                type="number"
                value={targetAlertPrice}
                onChange={e => setTargetAlertPrice(Number(e.target.value))}
                className="w-32 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSetPriceAlert}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all whitespace-nowrap"
              >
                {isAlertSet ? 'Đã cài!' : 'Đặt báo'}
              </button>
            </div>

            <button
              onClick={() => setActiveTab('exchange')}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center space-x-1.5"
            >
              <span>Giao dịch {selectedRate.symbol} ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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

          {/* 24h Volume Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
            <span>{t('volume24h')}:</span>
            <span className="font-bold text-white font-mono">
              {(selectedRate.volume24hVND / 1000000000).toFixed(2)} Tỷ ₫
            </span>
          </div>
        </div>
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
    </div>
  );
};
