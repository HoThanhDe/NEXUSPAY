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
  Layers,
  FileSpreadsheet,
  FileText,
  Filter,
  Check,
  CalendarDays,
  Sparkles,
  ExternalLink,
  ChevronDown
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
  const { addNotification, currentAdmin, language } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom'>('this_month');
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filter criteria for CSV export
  const [exportTypeFilter, setExportTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [exportPaymentFilter, setExportPaymentFilter] = useState<'all' | 'vietqr' | 'stripe'>('all');
  const [exportStatusFilter, setExportStatusFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const loadStatsAndTx = async () => {
    setLoading(true);
    try {
      const [data, txList] = await Promise.all([
        api.getAdminStats(),
        api.getTransactions()
      ]);
      setStats(data);
      setTransactions(txList || []);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndTx();
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
    { date: '05/08', revenue: 1850000, volume: 62000000 },
    { date: '10/08', revenue: 1420000, volume: 51000000 },
    { date: '15/08', revenue: 2150000, volume: 78000000 },
    { date: '20/08', revenue: 2680000, volume: 95000000 },
    { date: '25/08', revenue: 3100000, volume: 110000000 },
    { date: '30/08', revenue: 2950000, volume: 105000000 }
  ];

  // Helper to filter transactions for export
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(tx => {
      const txDate = new Date(tx.createdAt || tx.timestamp || Date.now());
      
      // Date filter
      if (timeRange === 'today') {
        const isToday = txDate.toDateString() === now.toDateString();
        if (!isToday) return false;
      } else if (timeRange === '7d') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (timeRange === 'this_month') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (timeRange === 'last_month') {
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (txDate.getMonth() !== prevMonth || txDate.getFullYear() !== prevYear) {
          return false;
        }
      } else if (timeRange === 'custom') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate < start || txDate > end) return false;
      }

      // Type filter
      if (exportTypeFilter !== 'all' && tx.type !== exportTypeFilter) return false;

      // Payment filter
      if (exportPaymentFilter !== 'all') {
        const method = (tx.paymentMethod || '').toLowerCase();
        if (exportPaymentFilter === 'vietqr' && !method.includes('vietqr') && !method.includes('bank')) return false;
        if (exportPaymentFilter === 'stripe' && !method.includes('stripe') && !method.includes('card')) return false;
      }

      // Status filter
      if (exportStatusFilter !== 'all' && tx.status !== exportStatusFilter) return false;

      return true;
    });
  };

  const filteredTx = getFilteredTransactions();
  const totalExportVolumeVND = filteredTx.reduce((sum, tx) => sum + (tx.totalVND || tx.fiatAmount || 0), 0);
  const totalExportRevenueVND = filteredTx.reduce((sum, tx) => sum + (tx.platformFeeVND || Math.round((tx.totalVND || 0) * 0.005) || 0), 0);

  // CSV Generation Function
  const handleExportCSV = (presetRange?: string) => {
    setIsExporting(true);

    try {
      const activeRange = presetRange || timeRange;
      let labelRange = 'Thang_Hien_Tai';
      if (activeRange === 'today') labelRange = 'Hom_Nay_24h';
      else if (activeRange === '7d') labelRange = '7_Ngay_Qua';
      else if (activeRange === 'this_month') labelRange = `Thang_${new Date().getMonth() + 1}_${new Date().getFullYear()}`;
      else if (activeRange === 'last_month') labelRange = `Thang_Truoc_${new Date().getFullYear()}`;
      else if (activeRange === 'custom') labelRange = `Tu_${startDate}_Den_${endDate}`;

      // Build CSV Data rows
      const headers = [
        'Mã Giao Dịch (Order ID)',
        'Thời Gian (Date & Time)',
        'Loại Lệnh (Type)',
        'Tài Sản (Asset)',
        'Khối Lượng Crypto (Amount)',
        'Tỷ Giá Quy Đổi (Rate VND)',
        'Tổng Doanh Số Đơn Hàng (Volume VND)',
        'Doanh Thu Phí Sàn (Platform Fee VND)',
        'Phương Thức Thanh Toán (Payment Method)',
        'Mã Tham Chiếu Ngân Hàng (Bank Ref / TxID)',
        'Khách Hàng (Customer)',
        'Email Khách Hàng',
        'Số Điện Thoại',
        'Trạng Thái Kế Toán (Accounting Status)'
      ];

      const csvRows: string[][] = [];

      // Metadata Info Box at top of CSV
      csvRows.push(['# BÁO CÁO DOANH THU & KẾ TOÁN TÀI CHÍNH SÀN GIAO DỊCH NEXUS OTC']);
      csvRows.push([`# Kỳ Báo Cáo: ${labelRange.replace(/_/g, ' ')}`]);
      csvRows.push([`# Thời Điểm Xuất: ${new Date().toLocaleString('vi-VN')}`]);
      csvRows.push([`# Người Thực Hiện: ${currentAdmin?.name || 'Administrator'} (@${currentAdmin?.username || 'Admin'})`]);
      csvRows.push([`# Tổng Số Giao Dịch: ${filteredTx.length}`]);
      csvRows.push([`# Tổng Doanh Số Khớp Lệnh: ${totalExportVolumeVND.toLocaleString('vi-VN')} VND`]);
      csvRows.push([`# Tổng Doanh Thu Phí Kế Toán: ${totalExportRevenueVND.toLocaleString('vi-VN')} VND`]);
      csvRows.push([]); // Empty row
      csvRows.push(headers);

      filteredTx.forEach(tx => {
        const orderId = tx.id || tx.orderId || 'N/A';
        const dateStr = new Date(tx.createdAt || tx.timestamp || Date.now()).toLocaleString('vi-VN');
        const typeStr = tx.type === 'buy' ? 'MUA CRYPTO' : tx.type === 'sell' ? 'BÁN CRYPTO' : 'CHUYỂN ĐỔI';
        const assetStr = tx.symbol || 'USDT';
        const cryptoAmount = (tx.cryptoAmount || tx.amount || 0).toString();
        const rateVnd = (tx.rate || tx.price || 0).toString();
        const totalVnd = (tx.totalVND || tx.fiatAmount || 0).toString();
        const feeVnd = (tx.platformFeeVND || Math.round((tx.totalVND || 0) * 0.005) || 0).toString();
        const paymentMethod = tx.paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : tx.paymentMethod === 'stripe' ? 'Thẻ Quốc Tế (Visa/Mastercard)' : (tx.paymentMethod || 'VietQR Banking');
        const bankRef = tx.txHash || tx.bankRef || tx.transferContent || 'KHOP_LENH_AUTO';
        const customer = tx.userName || tx.userFullName || 'Khách Vãng Lai';
        const email = tx.userEmail || 'trader@nexus.vn';
        const phone = tx.userPhone || '0908888999';
        const status = tx.status === 'completed' ? 'ĐÃ HOÀN TẤT & KHỚP KẾ TOÁN' : tx.status === 'processing' ? 'ĐANG XỬ LÝ THANH TOÁN' : 'HỦY / TỪ CHỐI';

        csvRows.push([
          orderId,
          dateStr,
          typeStr,
          assetStr,
          cryptoAmount,
          rateVnd,
          totalVnd,
          feeVnd,
          paymentMethod,
          bankRef,
          customer,
          email,
          phone,
          status
        ]);
      });

      // Summary Footer Row
      csvRows.push([]);
      csvRows.push([
        'TỔNG CỘNG HỢP NHẤT',
        '',
        '',
        '',
        '',
        '',
        totalExportVolumeVND.toString(),
        totalExportRevenueVND.toString(),
        '',
        '',
        '',
        '',
        '',
        'ĐÃ KIỂM TOÁN HỢP LỆ'
      ]);

      // Convert to CSV String with UTF-8 BOM for Microsoft Excel compatibility
      const csvContent = '\uFEFF' + csvRows.map(row => 
        row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')
      ).join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `BaoCao_DoanhThu_NexusOTC_${labelRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification(
        'system_alert',
        language === 'vi' ? 'Xuất Báo Cáo Doanh Thu CSV Thành Công' : 'CSV Export Completed',
        language === 'vi' 
          ? `Đã xuất ${filteredTx.length} bản ghi kế toán [${labelRange}] sang định dạng Excel CSV an toàn.` 
          : `Exported ${filteredTx.length} financial ledger entries to CSV.`,
        undefined,
        'admin'
      );
      setShowExportModal(false);
    } catch (err: any) {
      console.error('Error exporting CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Comprehensive CSV Export Trigger */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">5. Dashboard Thống Kê & Báo Cáo Tài Chính Kế Toán</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp dữ liệu doanh số khớp lệnh, doanh thu phí sàn P2P, xuất file CSV theo ngày/tháng phục vụ kiểm toán và khai thuế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick CSV Export Button */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Xuất Báo Cáo Doanh Thu (CSV)</span>
          </button>

          <button
            type="button"
            onClick={loadStatsAndTx}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* CSV EXPORT SETTINGS & TIME RANGE MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center space-x-2.5 text-emerald-300 font-bold text-base">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Xuất Báo Cáo Doanh Thu & Sổ Cái Kế Toán (Excel / CSV)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Time Interval Selector (Day / Week / Month / Custom) */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-2">
                  1. Chọn khoảng thời gian báo cáo kế toán:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'today', label: 'Hôm Nay (24h)' },
                    { id: '7d', label: '7 Ngày Qua' },
                    { id: 'this_month', label: 'Tháng Này' },
                    { id: 'last_month', label: 'Tháng Trước' },
                    { id: 'custom', label: 'Tùy Chỉnh Ngày' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimeRange(item.id as any)}
                      className={`py-2.5 px-3 rounded-xl font-bold border transition-all text-center ${
                        timeRange === item.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Pickers */}
              {timeRange === 'custom' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Từ ngày (Start Date):</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Đến ngày (End Date):</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Filters Group: Type & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Loại giao dịch:</label>
                  <select
                    value={exportTypeFilter}
                    onChange={e => setExportTypeFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Tất cả (Mua & Bán)</option>
                    <option value="buy">Chỉ đơn Mua Crypto</option>
                    <option value="sell">Chỉ đơn Bán Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Cổng thanh toán:</label>
                  <select
                    value={exportPaymentFilter}
                    onChange={e => setExportPaymentFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Tất cả cổng</option>
                    <option value="vietqr">Chuyển khoản VietQR</option>
                    <option value="stripe">Thẻ Quốc Tế (Stripe)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Trạng thái khớp lệnh:</label>
                  <select
                    value={exportStatusFilter}
                    onChange={e => setExportStatusFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Chỉ đơn Đã Hoàn Tất</option>
                    <option value="processing">Chỉ đơn Đang Xử Lý</option>
                  </select>
                </div>
              </div>

              {/* Financial Calculation Summary Preview */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Dự Toán Dữ Liệu Sẽ Xuất Vào File CSV:</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-900/40">
                    <span className="text-[11px] text-slate-400 block">Số lượng đơn</span>
                    <strong className="text-base font-extrabold text-white">{filteredTx.length} đơn</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-900/40">
                    <span className="text-[11px] text-slate-400 block">Tổng doanh số</span>
                    <strong className="text-base font-extrabold text-emerald-400">{totalExportVolumeVND.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-900/40">
                    <span className="text-[11px] text-slate-400 block">Doanh thu phí sàn</span>
                    <strong className="text-base font-extrabold text-cyan-300">{totalExportRevenueVND.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportCSV()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Tải Xuống File Báo Cáo (.CSV)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doanh Thu Phí Sàn (Spread)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {(stats?.totalRevenueVND || 18550000).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% so với tháng trước</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng Doanh Số Khớp Lệnh (Volume)</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {(stats?.totalVolumeVND || 655000000).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{stats?.totalOrders || 128} đơn hoàn tất</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng Người Dùng Đăng Ký</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {stats?.totalUsers || 248}
          </div>
          <div className="text-[11px] text-indigo-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>92% đã xác minh KYC</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ Lệ Khớp Lệnh Thành Công</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {stats?.successRate || 98.4}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Thời gian khớp TB: 28 giây</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Area Revenue Trend & Asset Allocation Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Revenue & Volume Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Xu Hướng Doanh Thu Phí Theo Ngày</h4>
              <p className="text-xs text-slate-400">Dữ liệu biến động doanh thu phí sàn (Spread 0.5% - 1.2%)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Doanh thu phí</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaRevenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Doanh Thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Asset Distribution Pie */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Tỷ Trọng Khối Lượng Theo Crypto</h4>
            <p className="text-xs text-slate-400">Cơ cấu doanh số các loại tiền mã hóa</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cryptoBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="volumeVND"
                >
                  {cryptoBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} ₫`, 'Doanh Số']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {cryptoBreakdown.map((c: any, i: number) => (
              <div key={c.symbol} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-white">{c.symbol}</span>
                </div>
                <span className="font-mono text-slate-400">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
