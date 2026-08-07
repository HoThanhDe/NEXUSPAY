import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  PieChart as PieIcon,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AdminStatsDesk: React.FC = () => {
  const { addNotification } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  const cryptoBreakdown = stats?.cryptoBreakdown || [
    { symbol: 'USDT', volumeVND: 425000000, percentage: 65 },
    { symbol: 'BTC', volumeVND: 120000000, percentage: 18 },
    { symbol: 'ETH', volumeVND: 65000000, percentage: 10 },
    { symbol: 'SOL', volumeVND: 45000000, percentage: 7 }
  ];

  const areaRevenueTrend = [
    { date: '01/08', revenue: 1250000, volume: 45000000 },
    { date: '02/08', revenue: 1850000, volume: 62000000 },
    { date: '03/08', revenue: 1420000, volume: 51000000 },
    { date: '04/08', revenue: 2150000, volume: 78000000 },
    { date: '05/08', revenue: 2680000, volume: 95000000 },
    { date: '06/08', revenue: 3100000, volume: 110000000 },
    { date: '07/08', revenue: 2950000, volume: 105000000 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">5. Dashboard Thống Kê (System Analytics)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp dữ liệu doanh số khớp lệnh, doanh thu spread P2P, tỷ trọng giao dịch và phân bổ khách hàng
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="today">Hôm nay (24 giờ qua)</option>
            <option value="7d">7 Ngày gần nhất</option>
            <option value="30d">30 Ngày gần nhất</option>
            <option value="all">Toàn bộ thời gian</option>
          </select>

          <button
            type="button"
            onClick={loadStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Core Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Tổng người dùng */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng Số Người Dùng</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.registeredUsersCount || 128} <span className="text-xs font-sans text-slate-400 font-normal">Tài khoản</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <span>{stats?.verifiedUsersCount || 105} tài khoản đã KYC xác thực</span>
          </div>
        </div>

        {/* 2. Tổng GD Mua */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng Giao Dịch Mua (VND → Crypto)</span>
            <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {stats?.buyCount || 42} <span className="text-xs font-sans text-slate-400 font-normal">Lệnh khớp</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Doanh số: {((stats?.buyVolumeVND || 380000000) / 1000000).toFixed(1)}M ₫
          </div>
        </div>

        {/* 3. Tổng GD Bán */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng Giao Dịch Bán (Crypto → VND)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {stats?.sellCount || 26} <span className="text-xs font-sans text-slate-400 font-normal">Lệnh khớp</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Doanh số: {((stats?.sellVolumeVND || 240000000) / 1000000).toFixed(1)}M ₫
          </div>
        </div>

        {/* 4. Giao dịch chờ duyệt */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Giao Dịch Chờ Duyệt</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {stats?.pendingTransactionsCount || 3} <span className="text-xs font-sans text-slate-400 font-normal">Đang xử lý</span>
          </div>
          <div className="text-[11px] text-amber-400/80">
            Cần đối soát VietQR và phát hành Crypto
          </div>
        </div>

        {/* 5. Giao dịch hoàn thành */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Giao Dịch Hoàn Thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {stats?.completedTransactionsCount || 65} <span className="text-xs font-sans text-slate-400 font-normal">Đã kết sổ</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            Tỉ lệ thành công 99.8%
          </div>
        </div>

        {/* 6. Doanh thu Spread & Phí */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doanh Thu Chênh Lệch (P2P Spread)</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">
            {(stats?.totalGatewayFeesVND || 18450000).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-teal-400/80">
            Lợi nhuận ròng từ biên độ Mua / Bán
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Biểu Đồ Doanh Thu & Khối Lượng Giao Dịch Theo Thời Gian</span>
            </h4>
            <span className="text-xs font-mono text-emerald-400">Đơn vị: VNĐ</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaRevenueTrend}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Giá trị']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" name="Khối lượng GD" />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu Spread" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coin Breakdown Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <span>Tỷ Trọng Đồng Coin Giao Dịch</span>
          </h4>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cryptoBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="volumeVND"
                >
                  {cryptoBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Doanh số']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {cryptoBreakdown.map((c: any, i: number) => (
              <div key={c.symbol} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-semibold text-white">{c.symbol}</span>
                </div>
                <span className="font-mono text-slate-300">{(c.volumeVND / 1000000).toFixed(1)}M ₫</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
