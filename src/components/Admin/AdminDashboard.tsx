import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  QrCode, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  FileSpreadsheet, 
  Printer, 
  RefreshCw,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Save,
  Check,
  ExternalLink,
  FileText,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Transaction } from '../../types';
import { KYCDocumentReviewDesk } from './KYCDocumentReviewDesk';
import { PriceManagementDesk } from './PriceManagementDesk';

export const AdminDashboard: React.FC = () => {
  const { t, refreshUser, addNotification } = useApp();
  
  // Admin Navigation Active Tab
  const [adminTab, setAdminTab] = useState<'kyc_review' | 'price_management' | 'revenue_reports'>('kyc_review');

  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [isExporting, setIsExporting] = useState(false);
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('all');

  const loadData = async () => {
    try {
      const s = await api.getAdminStats();
      setStats(s);
      const txs = await api.getTransactions();
      setTransactions(txs);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const exportCSVReport = () => {
    setIsExporting(true);
    const headers = 'ID,Type,UserEmail,FiatVND,CryptoAmount,Symbol,Network,PaymentMethod,Status,CreatedAt,TxHash\n';
    const rows = transactions
      .map(t => `"${t.id}","${t.type || 'buy_crypto'}","${t.userEmail}",${t.totalVND},${t.cryptoAmount},"${t.cryptoSymbol}","${t.network}","${t.paymentMethod}","${t.status}","${t.createdAt}","${t.txHash || ''}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NEXUS_Revenue_Report_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  const exportJSONReport = () => {
    const reportData = {
      period: reportPeriod,
      generatedAt: new Date().toISOString(),
      summaryStats: stats,
      transactionsCount: transactions.length,
      transactions
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NEXUS_Audit_Report_${reportPeriod}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartVolumeData = stats?.cryptoBreakdown || [
    { symbol: 'USDT', volumeVND: 125000000 },
    { symbol: 'BTC', volumeVND: 45000000 },
    { symbol: 'ETH', volumeVND: 35000000 },
    { symbol: 'SOL', volumeVND: 18000000 }
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false;
    if (txSearchQuery) {
      const q = txSearchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.userEmail.toLowerCase().includes(q) ||
        tx.cryptoSymbol.toLowerCase().includes(q) ||
        (tx.txHash && tx.txHash.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Main Sub-Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t('adminDashboard')}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Quản Trị Viên Toàn Quyền
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Thẩm định đối chiếu giấy tờ KYC • Quản lý giá mua bán nền tảng • Doanh thu & Sổ lệnh đối soát
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Admin Tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold gap-1">
          <button
            id="admin-tab-kyc-btn"
            onClick={() => setAdminTab('kyc_review')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              adminTab === 'kyc_review'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Duyệt Giấy Tờ KYC</span>
            {stats?.pendingKYC > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                adminTab === 'kyc_review' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {stats.pendingKYC}
              </span>
            )}
          </button>

          <button
            id="admin-tab-price-btn"
            onClick={() => setAdminTab('price_management')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              adminTab === 'price_management'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Quản Lý Giá Mua / Bán</span>
          </button>

          <button
            id="admin-tab-revenue-btn"
            onClick={() => setAdminTab('revenue_reports')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              adminTab === 'revenue_reports'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Doanh Thu & Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Render Active Workspace Tab */}
      {adminTab === 'kyc_review' && (
        <KYCDocumentReviewDesk onRefreshStats={loadData} />
      )}

      {adminTab === 'price_management' && (
        <PriceManagementDesk onRefreshAll={loadData} />
      )}

      {adminTab === 'revenue_reports' && (
        <div className="space-y-6">
          {/* Periodic Export Action Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Xuất Báo Cáo Định Kỳ:</span>
              <select
                value={reportPeriod}
                onChange={e => setReportPeriod(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="today">Hôm nay (Hàng ngày)</option>
                <option value="week">Tuần này (Hàng tuần)</option>
                <option value="month">Tháng này (Hàng tháng)</option>
                <option value="all">Toàn thời gian</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="export-csv-btn"
                onClick={exportCSVReport}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Xuất CSV</span>
              </button>

              <button
                id="export-json-btn"
                onClick={exportJSONReport}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>JSON Audit</span>
              </button>

              <button
                id="print-report-btn"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>In Báo Cáo</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Volume */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{t('totalRevenue')}</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {stats ? (stats.totalVolumeVND / 1000000).toFixed(1) : '0'}M ₫
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                Mua: {(stats?.buyVolumeVND ? stats.buyVolumeVND / 1000000 : 0).toFixed(1)}M | Bán: {(stats?.sellVolumeVND ? stats.sellVolumeVND / 1000000 : 0).toFixed(1)}M
              </span>
            </div>

            {/* Metric 2: Gateway Fees */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Doanh thu Phí Cổng</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
                {stats ? (stats.totalGatewayFeesVND / 1000).toLocaleString('vi-VN') : '0'}k ₫
              </div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Tỉ lệ thanh toán thành công: 99.8%</span>
            </div>

            {/* Metric 3: Stripe Volume */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Cổng Thẻ Quốc Tế (Stripe)</span>
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-300">
                {stats ? (stats.stripeVolumeVND / 1000000).toFixed(1) : '0'}M ₫
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">Visa / MasterCard / Apple Pay</span>
            </div>

            {/* Metric 4: VietQR Volume */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Chuyển khoản VietQR</span>
                <QrCode className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-teal-300">
                {stats ? (stats.vietQRVolumeVND / 1000000).toFixed(1) : '0'}M ₫
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">NAPAS 24/7 tức thì</span>
            </div>
          </div>

          {/* Revenue Distribution Chart */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <span>Doanh số giao dịch phân bổ theo loại Token (VND)</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="symbol" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickFormatter={v => `${(v / 1000000).toFixed(0)}M`}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Doanh số']}
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="volumeVND" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Order Registry Table */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Sổ lệnh giao dịch & Đối soát hóa đơn chuỗi khối</h4>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txSearchQuery}
                    onChange={e => setTxSearchQuery(e.target.value)}
                    placeholder="Lọc mã đơn, email, TxHash..."
                    className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
                  />
                </div>

                <select
                  value={txStatusFilter}
                  onChange={e => setTxStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1 focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="completed">Đã hoàn tất</option>
                  <option value="processing">Đang xử lý</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                    <th className="py-2.5">Mã đơn</th>
                    <th className="py-2.5">Loại</th>
                    <th className="py-2.5">Khách hàng</th>
                    <th className="py-2.5">Số tiền VND</th>
                    <th className="py-2.5">Crypto</th>
                    <th className="py-2.5">Mạng lưới</th>
                    <th className="py-2.5">Cổng</th>
                    <th className="py-2.5">Trạng thái</th>
                    <th className="py-2.5">TxHash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-850/50 text-slate-300">
                      <td className="py-3 font-bold text-white">{tx.id}</td>
                      <td className="py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'sell_crypto' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {tx.type === 'sell_crypto' ? 'Bán Crypto' : 'Mua Crypto'}
                        </span>
                      </td>
                      <td className="py-3 font-sans text-slate-400">{tx.userEmail}</td>
                      <td className="py-3 font-bold text-cyan-300">{tx.totalVND.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-3 text-emerald-400">{tx.cryptoAmount} {tx.cryptoSymbol}</td>
                      <td className="py-3 text-slate-400">{tx.network}</td>
                      <td className="py-3 font-sans text-slate-300">
                        {tx.paymentMethod === 'stripe_card' ? 'Stripe Card' : tx.paymentMethod === 'vietqr_bank' ? 'VietQR' : 'Escrow Deposit'}
                      </td>
                      <td className="py-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                          {tx.status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-cyan-400 truncate max-w-[120px]">
                        {tx.txHash ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
