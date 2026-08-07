import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  QrCode, 
  Upload, 
  Building2, 
  Download, 
  Copy, 
  ExternalLink,
  Edit3,
  X,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PaymentPayoutRecord } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const PaymentManagementDesk: React.FC = () => {
  const { addNotification } = useApp();
  const [payouts, setPayouts] = useState<PaymentPayoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [selectedPayout, setSelectedPayout] = useState<PaymentPayoutRecord | null>(null);
  const [bigReceiptModal, setBigReceiptModal] = useState<PaymentPayoutRecord | null>(null);
  const [qrPayoutModal, setQrPayoutModal] = useState<PaymentPayoutRecord | null>(null);
  
  const [updateStatusModal, setUpdateStatusModal] = useState<PaymentPayoutRecord | null>(null);
  const [receiptUrlInput, setReceiptUrlInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [operatorInput, setOperatorInput] = useState('Admin Master (Kế Toán Trưởng)');

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await api.getPaymentPayouts();
      if (res.success && res.payouts) {
        setPayouts(res.payouts);
      }
    } catch (err) {
      console.error('Failed to load payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('info', 'Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
  };

  const handleMarkPaid = async (payout: PaymentPayoutRecord) => {
    try {
      const res = await api.updatePaymentPayout({
        payoutId: payout.id,
        status: 'paid',
        receiptImageUrl: receiptUrlInput.trim() || payout.receiptImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        adminNote: adminNoteInput.trim() || 'Ủy nhiệm chi ngân hàng hoàn tất',
        operatorName: operatorInput.trim() || 'Admin Master'
      });
      if (res.success) {
        addNotification('order_success', 'Xác nhận thanh toán thành công', `Lệnh chi #${payout.id} đã chuyển sang trạng thái: Đã thanh toán.`);
        setUpdateStatusModal(null);
        await loadPayouts();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thanh toán', err.message);
    }
  };

  const exportCSV = () => {
    const headers = 'Mã giao dịch,Khách hàng,Email,SĐT,Ngân hàng nhận,Chủ tài khoản,Số tài khoản,Số tiền VND,Nội dung CK,Thời gian chuyển,Người thực hiện,Trạng thái,Ghi chú\n';
    const rows = payouts.map(p => 
      `"${p.transactionId}","${p.customerName}","${p.customerEmail || ''}","${p.customerPhone || ''}","${p.bankName}","${p.accountName}","${p.accountNumber}",${p.amountVND},"${p.transferMemo}","${p.transferTime || ''}","${p.operatorName || ''}","${p.status}","${p.adminNote || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NEXUS_Payment_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('info', 'Xuất báo cáo thành công', 'File CSV sổ chi tiền đã được tải về.');
  };

  const filteredPayouts = payouts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(q)) ||
        (p.customerPhone && p.customerPhone.includes(q)) ||
        p.bankName.toLowerCase().includes(q) ||
        p.accountNumber.includes(q) ||
        p.accountName.toLowerCase().includes(q) ||
        p.transferMemo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amountVND, 0);
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amountVND, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">4. Quản Lý Thanh Toán (Payment & Payout Management)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi việc chuyển tiền VND cho khách hàng, quản lý biên lai ủy nhiệm chi và xác nhận giao dịch ngân hàng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã lệnh, tên khách, STK, ngân hàng..."
              className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={loadPayouts}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Làm mới dữ liệu thanh toán"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Báo Cáo Chi Tiền</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Tổng Đã Giải Ngân VND</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {totalPaid.toLocaleString('vi-VN')} ₫
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {payouts.filter(p => p.status === 'paid').length} lệnh chuyển thành công
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Đang Chờ Chuyển Tiền</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {totalPending.toLocaleString('vi-VN')} ₫
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block font-mono">
            {payouts.filter(p => p.status === 'pending').length} lệnh cần kế toán xử lý
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Cổng VietQR Napas 24/7</span>
            <QrCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            Trực Tuyến 24/7
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
            Tự động tạo QR Napas cho kế toán
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white">
              Sổ Lệnh Chi Tiền & Đối Soát Ủy Nhiệm Chi ({filteredPayouts.length} lệnh)
            </h4>
            <p className="text-xs text-slate-400">
              Quản lý chi tiết từng khoản chuyển tiền cho khách hàng khi khách bán Crypto
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                <th className="py-3 px-2">Mã Giao Dịch</th>
                <th className="py-3 px-2">Khách Hàng (Họ tên / Email / SĐT)</th>
                <th className="py-3 px-2">Ngân Hàng & Chủ TK</th>
                <th className="py-3 px-2">Số Tài Khoản</th>
                <th className="py-3 px-2">Số Tiền VND</th>
                <th className="py-3 px-2">Nội Dung Chuyển Khoản</th>
                <th className="py-3 px-2">Ảnh Biên Lai</th>
                <th className="py-3 px-2">Thời Gian & Người Thực Hiện</th>
                <th className="py-3 px-2">Trạng Thái</th>
                <th className="py-3 px-2 text-right">Chức Năng Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPayouts.map(p => (
                <tr key={p.id} className="hover:bg-slate-850/50 text-slate-300 transition-colors">
                  {/* Mã giao dịch */}
                  <td className="py-3 px-2">
                    <div className="font-bold text-white">{p.transactionId}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{p.id}</div>
                  </td>

                  {/* Khách hàng */}
                  <td className="py-3 px-2 font-sans">
                    <div className="font-semibold text-slate-200">{p.customerName}</div>
                    <div className="text-[11px] text-slate-400">{p.customerPhone || 'SĐT: N/A'}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{p.customerEmail}</div>
                  </td>

                  {/* Ngân hàng & Chủ TK */}
                  <td className="py-3 px-2 font-sans">
                    <div className="font-bold text-slate-200">{p.bankName}</div>
                    <div className="text-[11px] font-semibold text-cyan-300 uppercase">{p.accountName}</div>
                  </td>

                  {/* Số tài khoản */}
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {p.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.accountNumber, 'Số tài khoản')}
                        className="p-1 text-slate-400 hover:text-cyan-300 rounded bg-slate-800 hover:bg-slate-700"
                        title="Sao chép số tài khoản"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Số tiền VND */}
                  <td className="py-3 px-2">
                    <div className="font-bold text-emerald-400 text-sm font-mono">{p.amountVND.toLocaleString('vi-VN')} ₫</div>
                  </td>

                  {/* Nội dung chuyển khoản */}
                  <td className="py-3 px-2 font-sans">
                    <div 
                      onClick={() => copyToClipboard(p.transferMemo, 'Nội dung chuyển khoản')}
                      className="cursor-pointer text-amber-300 hover:underline truncate max-w-[130px] flex items-center space-x-1 text-xs font-mono"
                      title={p.transferMemo}
                    >
                      <span>{p.transferMemo}</span>
                      <Copy className="w-2.5 h-2.5 text-slate-500" />
                    </div>
                  </td>

                  {/* Ảnh biên lai */}
                  <td className="py-3 px-2 font-sans">
                    {p.receiptImageUrl ? (
                      <div 
                        onClick={() => setBigReceiptModal(p)}
                        className="cursor-pointer p-0.5 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 w-fit transition-colors"
                        title="Click để phóng to ảnh biên lai"
                      >
                        <img
                          src={p.receiptImageUrl}
                          alt="Biên lai"
                          className="w-10 h-10 object-cover rounded"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Chưa đính kèm</span>
                    )}
                  </td>

                  {/* Thời gian chuyển & Người thực hiện */}
                  <td className="py-3 px-2 font-sans">
                    <div className="text-slate-300 text-[11px] font-mono">
                      {p.transferTime ? new Date(p.transferTime).toLocaleString('vi-VN') : 'Đang chờ duyệt'}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-semibold">{p.operatorName || 'Chưa thực hiện'}</div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-2 font-sans">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                      p.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status === 'paid' ? 'Đã thanh toán' : p.status === 'failed' ? 'Thất bại' : 'Chờ thanh toán'}
                    </span>
                  </td>

                  {/* Chức năng Admin */}
                  <td className="py-3 px-2 text-right font-sans">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Xem chi tiết */}
                      <button
                        type="button"
                        onClick={() => setSelectedPayout(p)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Xem chi tiết lệnh chi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Tạo VietQR Payout chuyển tiền nhanh */}
                      <button
                        type="button"
                        onClick={() => setQrPayoutModal(p)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Tạo mã VietQR Payout chuyển khoản nhanh"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Đánh dấu đã thanh toán / Đính kèm biên lai */}
                      <button
                        type="button"
                        onClick={() => {
                          setUpdateStatusModal(p);
                          setReceiptUrlInput(p.receiptImageUrl || '');
                          setAdminNoteInput(p.adminNote || '');
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 ${
                          p.status === 'paid'
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        }`}
                        title="Đánh dấu đã thanh toán & đính kèm biên lai"
                      >
                        <Check className="w-3 h-3" />
                        <span>{p.status === 'paid' ? 'Cập nhật' : 'Duyệt Chi'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. DETAIL MODAL */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Chi Tiết Lệnh Chi #{selectedPayout.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Mã giao dịch gốc:</span><span className="font-bold text-white">{selectedPayout.transactionId}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Khách hàng:</span><span className="font-semibold text-white font-sans">{selectedPayout.customerName} ({selectedPayout.customerEmail})</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Ngân hàng nhận:</span><span className="font-bold text-white font-sans">{selectedPayout.bankName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Số tài khoản:</span><span className="font-bold text-cyan-300">{selectedPayout.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Chủ tài khoản:</span><span className="font-bold text-white uppercase font-sans">{selectedPayout.accountName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Số tiền VND:</span><span className="font-bold text-emerald-400 text-sm">{selectedPayout.amountVND.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Nội dung CK:</span><span className="text-amber-300">{selectedPayout.transferMemo}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Người thực hiện:</span><span className="text-cyan-400 font-sans">{selectedPayout.operatorName || 'Chưa thực hiện'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Thời gian chuyển:</span><span className="text-slate-200">{selectedPayout.transferTime || 'Đang xử lý'}</span></div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIG RECEIPT PREVIEW MODAL */}
      {bigReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                Biên Lai Ủy Nhiệm Chi #{bigReceiptModal.id} ({bigReceiptModal.amountVND.toLocaleString('vi-VN')} ₫)
              </h3>
              <button
                type="button"
                onClick={() => setBigReceiptModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800">
              <img
                src={bigReceiptModal.receiptImageUrl}
                alt="Biên lai ngân hàng"
                className="w-full h-auto max-h-[60vh] object-contain rounded-xl mx-auto"
              />
            </div>

            <div className="flex justify-center space-x-3">
              <a
                href={bigReceiptModal.receiptImageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh gốc</span>
              </a>
              <button
                type="button"
                onClick={() => setBigReceiptModal(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIETQR PAYOUT SCAN MODAL */}
      {qrPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                Mã VietQR Chuyển Tiền #{qrPayoutModal.id}
              </h3>
              <button
                type="button"
                onClick={() => setQrPayoutModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-2xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `24/7_NAPAS_${qrPayoutModal.bankName}_${qrPayoutModal.accountNumber}_${qrPayoutModal.amountVND}_${qrPayoutModal.transferMemo}`
                )}`}
                alt="VietQR Payout"
                className="w-52 h-52"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-1">
              <div><span className="text-slate-400 font-sans">Số tiền: </span><span className="font-bold text-emerald-400">{qrPayoutModal.amountVND.toLocaleString('vi-VN')} ₫</span></div>
              <div><span className="text-slate-400 font-sans">STK: </span><span className="font-bold text-cyan-300">{qrPayoutModal.accountNumber}</span></div>
              <div><span className="text-slate-400 font-sans">Tên: </span><span className="font-bold text-white uppercase font-sans">{qrPayoutModal.accountName}</span></div>
            </div>

            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setQrPayoutModal(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Đã Quét & Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MARK PAID & ATTACH RECEIPT MODAL */}
      {updateStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Xác Nhận Đã Chuyển Tiền #{updateStatusModal.id}</span>
              </h3>
              <button type="button" onClick={() => setUpdateStatusModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Link ảnh biên lai ủy nhiệm chi:</label>
                <input
                  type="text"
                  value={receiptUrlInput}
                  onChange={e => setReceiptUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... hoặc paste link ảnh biên lai"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tên người thực hiện lệnh chi (Operator):</label>
                <input
                  type="text"
                  value={operatorInput}
                  onChange={e => setOperatorInput(e.target.value)}
                  placeholder="Ví dụ: Kế Toán Trưởng - Nguyễn Văn B"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Ghi chú kế toán:</label>
                <textarea
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  placeholder="Ghi chú đối soát hoặc số tham chiếu ngân hàng..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUpdateStatusModal(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleMarkPaid(updateStatusModal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Xác Nhận Đã Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
