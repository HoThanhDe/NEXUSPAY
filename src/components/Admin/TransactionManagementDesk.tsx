import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  Eye,
  ShieldCheck,
  Zap,
  RotateCcw,
  Check,
  X,
  Send,
  AlertCircle,
  Copy,
  FileText,
  Building2,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3
} from 'lucide-react';
import { Transaction } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const TransactionManagementDesk: React.FC = () => {
  const { addNotification } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'buy_orders' | 'sell_orders'>('buy_orders');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coinFilter, setCoinFilter] = useState('all');
  
  // Modals state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txidModalTx, setTxidModalTx] = useState<Transaction | null>(null);
  const [txidInput, setTxidInput] = useState('');
  
  const [rejectModalTx, setRejectModalTx] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [noteModalTx, setNoteModalTx] = useState<Transaction | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const [payoutModalTx, setPayoutModalTx] = useState<Transaction | null>(null);
  const [receiptUrlInput, setReceiptUrlInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const txs = await api.getTransactions();
      setTransactions(txs);
    } catch (e) {
      console.error('Failed to load transaction desk data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('info', 'Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
  };

  // Admin Actions for Buy Crypto (VND -> Crypto)
  const handleConfirmPayment = async (txId: string) => {
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: txId,
        action: 'confirm_payment'
      });
      if (res.success) {
        addNotification('order_success', 'Xác nhận đã nhận tiền', `Đơn #${txId} đã chuyển sang trạng thái: Đã thanh toán.`);
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleDispatchCrypto = async (txId: string) => {
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: txId,
        action: 'dispatch_crypto'
      });
      if (res.success) {
        addNotification('order_success', 'Gửi Crypto thành công', `Đơn #${txId} đã phát hành token trên blockchain và cập nhật TxHash.`);
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleApproveBuyOrder = async (txId: string) => {
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: txId,
        action: 'approve_order'
      });
      if (res.success) {
        addNotification('order_success', 'Duyệt giao dịch hoàn thành', `Đơn #${txId} đã hoàn tất và kết sổ.`);
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleSaveTxid = async () => {
    if (!txidModalTx) return;
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: txidModalTx.id,
        action: 'update_txid',
        txHash: txidInput.trim()
      });
      if (res.success) {
        addNotification('order_success', 'Cập nhật TXID thành công', `Đã lưu TxHash cho đơn #${txidModalTx.id}`);
        setTxidModalTx(null);
        setTxidInput('');
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi lưu TXID', err.message);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectModalTx) return;
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: rejectModalTx.id,
        action: 'reject_order',
        rejectionReason: rejectionReason.trim() || 'Hủy đơn do vi phạm quy định hoặc quá hạn chuyển tiền'
      });
      if (res.success) {
        addNotification('security_alert', 'Đã từ chối đơn hàng', `Đơn #${rejectModalTx.id} đã bị từ chối.`);
        setRejectModalTx(null);
        setRejectionReason('');
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!noteModalTx) return;
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: noteModalTx.id,
        action: 'update_note',
        adminNote: noteInput.trim()
      });
      if (res.success) {
        addNotification('info', 'Lưu ghi chú thành công', `Đã cập nhật ghi chú admin cho đơn #${noteModalTx.id}`);
        setNoteModalTx(null);
        setNoteInput('');
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi lưu ghi chú', err.message);
    }
  };

  // Admin Actions for Sell Crypto (Crypto -> VND)
  const handleConfirmCryptoReceived = async (txId: string) => {
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: txId,
        action: 'confirm_crypto_received'
      });
      if (res.success) {
        addNotification('order_success', 'Xác nhận đã nhận Crypto', `Đã xác nhận tiền Crypto vào ví ký quỹ cho đơn #${txId}`);
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleConfirmPayout = async () => {
    if (!payoutModalTx) return;
    try {
      const res = await api.adminUpdateTransactionAction({
        transactionId: payoutModalTx.id,
        action: 'confirm_payout',
        receiptImageUrl: receiptUrlInput.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        operatorName: 'Tổng Quản Trị Viên (Master Admin)'
      });
      if (res.success) {
        addNotification('order_success', 'Đã xác nhận thanh toán VND', `Đã hoàn tất chuyển khoản ${payoutModalTx.totalVND.toLocaleString('vi-VN')} ₫ vào tài khoản ${payoutModalTx.bankPayout?.bankName} cho khách.`);
        setPayoutModalTx(null);
        setReceiptUrlInput('');
        await loadData();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi chuyển khoản', err.message);
    }
  };

  // Filter datasets
  const buyTransactions = transactions.filter(t => t.type === 'buy_crypto');
  const sellTransactions = transactions.filter(t => t.type === 'sell_crypto');

  const currentDataset = activeSubTab === 'buy_orders' ? buyTransactions : sellTransactions;

  const filteredTransactions = currentDataset.filter(tx => {
    if (coinFilter !== 'all' && tx.cryptoSymbol !== coinFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed' && tx.status !== 'completed') return false;
      if (statusFilter === 'pending' && (tx.status === 'completed' || tx.status === 'failed')) return false;
      if (statusFilter === 'failed' && tx.status !== 'failed') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        (tx.userName && tx.userName.toLowerCase().includes(q)) ||
        (tx.userEmail && tx.userEmail.toLowerCase().includes(q)) ||
        (tx.phone && tx.phone.includes(q)) ||
        (tx.recipientWallet && tx.recipientWallet.toLowerCase().includes(q)) ||
        (tx.depositWallet && tx.depositWallet.toLowerCase().includes(q)) ||
        (tx.txHash && tx.txHash.toLowerCase().includes(q)) ||
        (tx.clientTxHash && tx.clientTxHash.toLowerCase().includes(q)) ||
        (tx.transferMemo && tx.transferMemo.toLowerCase().includes(q)) ||
        (tx.bankPayout?.accountNumber && tx.bankPayout.accountNumber.includes(q)) ||
        (tx.bankPayout?.accountName && tx.bankPayout.accountName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCSV = () => {
    const isBuy = activeSubTab === 'buy_orders';
    let headers = '';
    let rows = '';

    if (isBuy) {
      headers = 'Mã giao dịch,Thời gian tạo,Tên người dùng,Họ tên,Email/SĐT,Coin,Blockchain,Ví nhận khách,Số lượng Crypto,Số tiền VND,Tỷ giá,Mã thanh toán,Nội dung CK,Trạng thái thanh toán,Trạng thái xử lý,TXID,Thời gian hoàn tất,Ghi chú Admin\n';
      rows = buyTransactions.map(t => 
        `"${t.id}","${t.createdAt}","${t.userName || ''}","${t.fullName || ''}","${t.userEmail} / ${t.phone || ''}","${t.cryptoSymbol}","${t.network}","${t.recipientWallet || ''}",${t.cryptoAmount},${t.totalVND},${t.exchangeRate || t.p2pBenchmarkRate || ''},"${t.paymentCode || t.receiptNumber || ''}","${t.transferMemo || ''}","${t.paymentStatus || (t.status === 'completed' ? 'paid' : 'pending')}","${t.processingStatus || t.status}","${t.txHash || ''}","${t.completedAt || ''}","${t.adminNote || ''}"`
      ).join('\n');
    } else {
      headers = 'Mã giao dịch,Thời gian,Người dùng,Coin,Blockchain,Số lượng Crypto,Wallet nhận sàn,TXID khách,Trạng thái nhận Crypto,Số tiền VND thanh toán,Ngân hàng nhận,Chủ tài khoản,Số tài khoản,Nội dung thanh toán,Trạng thái,Thời gian thanh toán,Ghi chú Admin\n';
      rows = sellTransactions.map(t => 
        `"${t.id}","${t.createdAt}","${t.userName || t.userEmail}","${t.cryptoSymbol}","${t.network}",${t.cryptoAmount},"${t.depositWallet || ''}","${t.clientTxHash || t.txHash || ''}","${t.cryptoReceiveStatus || (t.status === 'completed' ? 'crypto_received' : 'pending_crypto')}",${t.totalVND},"${t.bankPayout?.bankName || ''}","${t.bankPayout?.accountName || ''}","${t.bankPayout?.accountNumber || ''}","${t.bankPayout?.payoutMemo || t.transferMemo || ''}","${t.status}","${t.completedAt || t.bankPayout?.payoutTime || ''}","${t.adminNote || ''}"`
      ).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NEXUS_${activeSubTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('info', 'Xuất báo cáo thành công', 'File CSV sổ lệnh đã được tải về.');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs: 2.1 vs 2.2 */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('buy_orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'buy_orders'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-cyan-300" />
            <span>2.1. Lịch sử Mua Crypto (VND → Crypto)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-cyan-300 font-mono">
              {buyTransactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sell_orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'sell_orders'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            <span>2.2. Lịch sử Bán Crypto (Crypto → VND)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-emerald-300 font-mono">
              {sellTransactions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              {activeSubTab === 'buy_orders' ? (
                <>
                  <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                  <span>Danh Sách Lệnh Mua Crypto Của Khách Hàng (VND → Crypto)</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  <span>Danh Sách Lệnh Bán Crypto Nhận Tiền Ngân Hàng (Crypto → VND)</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi đầy đủ trạng thái thanh toán VietQR Napas, xác nhận Crypto on-chain và ủy nhiệm chi ngân hàng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, tên, SĐT, ví, TXID..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
              />
            </div>

            <select
              value={coinFilter}
              onChange={e => setCoinFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Tất cả Coin</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang xử lý / Chờ thanh toán</option>
              <option value="completed">Đã hoàn tất</option>
              <option value="failed">Từ chối / Thất bại</option>
            </select>
          </div>
        </div>

        {/* 2.1 BUY CRYPTO TABLE */}
        {activeSubTab === 'buy_orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                  <th className="py-3 px-2">Mã GD & Thời Gian</th>
                  <th className="py-3 px-2">Khách Hàng (Tên/SĐT/Email)</th>
                  <th className="py-3 px-2">Coin & Mạng Lưới</th>
                  <th className="py-3 px-2">Ví Nhận Khách Hàng</th>
                  <th className="py-3 px-2">Số Tiền VND</th>
                  <th className="py-3 px-2">Mã TT & Nội Dung CK</th>
                  <th className="py-3 px-2">TT Thanh Toán</th>
                  <th className="py-3 px-2">TT Xử Lý</th>
                  <th className="py-3 px-2">Blockchain TXID</th>
                  <th className="py-3 px-2 text-right">Chức Năng Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 text-slate-300 transition-colors">
                    {/* Mã GD & Thời Gian */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-white">{tx.id}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{new Date(tx.createdAt).toLocaleString('vi-VN')}</div>
                    </td>

                    {/* Khách hàng */}
                    <td className="py-3 px-2 font-sans">
                      <div className="font-semibold text-slate-200">{tx.userName || tx.fullName || 'Khách Vãng Lai'}</div>
                      <div className="text-[11px] text-slate-400">{tx.phone || 'SĐT: Chưa cập nhật'}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{tx.userEmail}</div>
                    </td>

                    {/* Coin & Mạng */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-cyan-400">{tx.cryptoAmount} {tx.cryptoSymbol}</div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700">
                        {tx.network}
                      </span>
                    </td>

                    {/* Ví nhận */}
                    <td className="py-3 px-2">
                      <div 
                        onClick={() => tx.recipientWallet && copyToClipboard(tx.recipientWallet, 'Địa chỉ ví')}
                        className="cursor-pointer text-slate-300 hover:text-cyan-400 truncate max-w-[110px] flex items-center space-x-1"
                        title={tx.recipientWallet}
                      >
                        <span>{tx.recipientWallet ? `${tx.recipientWallet.slice(0, 6)}...${tx.recipientWallet.slice(-4)}` : 'Chưa có'}</span>
                        <Copy className="w-3 h-3 text-slate-500" />
                      </div>
                    </td>

                    {/* Số tiền VND & Tỷ giá */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-white">{tx.totalVND.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-[10px] text-slate-400 font-sans">Tỷ giá: {(tx.exchangeRate || tx.p2pBenchmarkRate || 26070).toLocaleString('vi-VN')} ₫</div>
                    </td>

                    {/* Mã TT & Nội dung CK */}
                    <td className="py-3 px-2 font-sans">
                      <div className="text-cyan-300 font-mono font-bold text-[11px]">{tx.paymentCode || tx.receiptNumber}</div>
                      <div 
                        onClick={() => tx.transferMemo && copyToClipboard(tx.transferMemo, 'Nội dung chuyển khoản')}
                        className="cursor-pointer text-[10px] text-slate-400 hover:text-white truncate max-w-[120px] flex items-center space-x-0.5"
                        title={tx.transferMemo}
                      >
                        <span>{tx.transferMemo || `NEXUSPAY ${tx.id}`}</span>
                        <Copy className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                    </td>

                    {/* Trạng thái thanh toán */}
                    <td className="py-3 px-2 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                        tx.status === 'completed' || tx.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tx.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tx.status === 'completed' || tx.paymentStatus === 'paid' ? 'Đã thanh toán' : tx.status === 'failed' ? 'Hết hạn' : 'Chờ thanh toán'}
                      </span>
                    </td>

                    {/* Trạng thái xử lý */}
                    <td className="py-3 px-2 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                        tx.status === 'completed' || tx.processingStatus === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tx.status === 'crypto_dispatched' || tx.processingStatus === 'crypto_dispatched'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : tx.status === 'failed' || tx.processingStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {tx.status === 'completed' || tx.processingStatus === 'completed' ? 'Hoàn thành' :
                         tx.status === 'crypto_dispatched' || tx.processingStatus === 'crypto_dispatched' ? 'Đã gửi Crypto' :
                         tx.status === 'failed' || tx.processingStatus === 'rejected' ? 'Từ chối' :
                         tx.status === 'payment_successful' ? 'Đang xử lý' : 'Chờ duyệt'}
                      </span>
                    </td>

                    {/* TXID */}
                    <td className="py-3 px-2">
                      {tx.txHash ? (
                        <div 
                          onClick={() => copyToClipboard(tx.txHash!, 'TXID Blockchain')}
                          className="cursor-pointer text-[11px] text-cyan-400 hover:text-cyan-300 truncate max-w-[100px] flex items-center space-x-1"
                          title={tx.txHash}
                        >
                          <span>{tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-500" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Chưa có TXID</span>
                      )}
                    </td>

                    {/* Chức năng Admin */}
                    <td className="py-3 px-2 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Xem chi tiết giao dịch"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Xác nhận đã nhận tiền */}
                        {tx.status === 'pending_payment' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmPayment(tx.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold"
                            title="Xác nhận đã nhận tiền VND"
                          >
                            Nhận tiền
                          </button>
                        )}

                        {/* Gửi Crypto */}
                        {(tx.status === 'payment_successful' || tx.status === 'pending_payment') && tx.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleDispatchCrypto(tx.id)}
                            className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold"
                            title="Gửi Crypto on-chain"
                          >
                            Gửi Crypto
                          </button>
                        )}

                        {/* Nhập TXID */}
                        <button
                          type="button"
                          onClick={() => {
                            setTxidModalTx(tx);
                            setTxidInput(tx.txHash || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Nhập/Sửa TXID Blockchain"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Duyệt hoàn tất */}
                        {tx.status !== 'completed' && tx.status !== 'failed' && (
                          <button
                            type="button"
                            onClick={() => handleApproveBuyOrder(tx.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                            title="Duyệt hoàn tất giao dịch"
                          >
                            Duyệt
                          </button>
                        )}

                        {/* Từ chối */}
                        {tx.status !== 'completed' && tx.status !== 'failed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalTx(tx);
                              setRejectionReason('');
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Từ chối giao dịch"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Ghi chú */}
                        <button
                          type="button"
                          onClick={() => {
                            setNoteModalTx(tx);
                            setNoteInput(tx.adminNote || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Thêm/Sửa ghi chú của Admin"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* 2.2 SELL CRYPTO TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                  <th className="py-3 px-2">Mã GD & Thời Gian</th>
                  <th className="py-3 px-2">Người Dùng</th>
                  <th className="py-3 px-2">Coin & Blockchain</th>
                  <th className="py-3 px-2">Ví Nhận Sàn & TXID Khách</th>
                  <th className="py-3 px-2">TT Nhận Crypto</th>
                  <th className="py-3 px-2">Số Tiền VND Thanh Toán</th>
                  <th className="py-3 px-2">Tài Khoản Ngân Hàng Khách</th>
                  <th className="py-3 px-2">Trạng Thái Tổng</th>
                  <th className="py-3 px-2 text-right">Chức Năng Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 text-slate-300 transition-colors">
                    {/* Mã GD & Thời gian */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-white">{tx.id}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{new Date(tx.createdAt).toLocaleString('vi-VN')}</div>
                    </td>

                    {/* Người dùng */}
                    <td className="py-3 px-2 font-sans">
                      <div className="font-semibold text-slate-200">{tx.userName || tx.userEmail}</div>
                      <div className="text-[11px] text-slate-400">{tx.phone || tx.userEmail}</div>
                    </td>

                    {/* Coin & Mạng */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-emerald-400">{tx.cryptoAmount} {tx.cryptoSymbol}</div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700">
                        {tx.network}
                      </span>
                    </td>

                    {/* Ví nhận sàn & TXID khách */}
                    <td className="py-3 px-2">
                      <div 
                        onClick={() => tx.depositWallet && copyToClipboard(tx.depositWallet, 'Ví ký quỹ sàn')}
                        className="cursor-pointer text-slate-300 hover:text-cyan-400 truncate max-w-[110px] flex items-center space-x-1"
                        title={tx.depositWallet}
                      >
                        <span>{tx.depositWallet ? `${tx.depositWallet.slice(0, 6)}...${tx.depositWallet.slice(-4)}` : 'Hot Wallet'}</span>
                        <Copy className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[110px]" title={tx.clientTxHash || tx.txHash}>
                        TXID: {tx.clientTxHash ? `${tx.clientTxHash.slice(0, 6)}...` : 'Chờ khách...'}
                      </div>
                    </td>

                    {/* Trạng thái nhận Crypto */}
                    <td className="py-3 px-2 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                        tx.cryptoReceiveStatus === 'crypto_received' || tx.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tx.cryptoReceiveStatus === 'crypto_received' || tx.status === 'completed' ? 'Đã nhận Crypto' : 'Chờ chuyển Crypto'}
                      </span>
                    </td>

                    {/* Số tiền VND cần thanh toán */}
                    <td className="py-3 px-2">
                      <div className="font-bold text-emerald-300">{tx.totalVND.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-[10px] text-slate-400 font-sans">Tỷ giá: {(tx.exchangeRate || tx.p2pBenchmarkRate || 24570).toLocaleString('vi-VN')} ₫</div>
                    </td>

                    {/* Ngân hàng nhận, Chủ TK, Số TK */}
                    <td className="py-3 px-2 font-sans">
                      <div className="font-bold text-slate-200">{tx.bankPayout?.bankName || 'Ngân hàng nhận'}</div>
                      <div className="text-[11px] font-mono text-cyan-300">{tx.bankPayout?.accountNumber || 'Chưa cập nhật'}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{tx.bankPayout?.accountName || 'Chủ tài khoản'}</div>
                    </td>

                    {/* Trạng thái tổng */}
                    <td className="py-3 px-2 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tx.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : tx.cryptoReceiveStatus === 'crypto_received'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tx.status === 'completed' ? 'Hoàn thành' :
                         tx.status === 'failed' ? 'Từ chối' :
                         tx.paymentStatus === 'paid' ? 'Đã thanh toán' :
                         tx.cryptoReceiveStatus === 'crypto_received' ? 'Chờ thanh toán VND' : 'Chờ chuyển Crypto'}
                      </span>
                    </td>

                    {/* Chức năng Admin Bán Crypto */}
                    <td className="py-3 px-2 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Xem chi tiết đơn bán"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Xác nhận đã nhận Crypto */}
                        {tx.cryptoReceiveStatus !== 'crypto_received' && tx.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmCryptoReceived(tx.id)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold"
                            title="Xác nhận đã nhận Crypto từ khách"
                          >
                            Đã nhận Crypto
                          </button>
                        )}

                        {/* Chuyển khoản VND / Mở Modal VietQR Payout */}
                        {tx.status !== 'completed' && tx.status !== 'failed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayoutModalTx(tx);
                              setReceiptUrlInput(tx.bankPayout?.receiptImageUrl || '');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center space-x-1"
                            title="Chuyển khoản VND & Đánh dấu đã thanh toán"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Chuyển VND</span>
                          </button>
                        )}

                        {/* Nhập/Sửa TXID */}
                        <button
                          type="button"
                          onClick={() => {
                            setTxidModalTx(tx);
                            setTxidInput(tx.clientTxHash || tx.txHash || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Kiểm tra / Nhập TXID"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Từ chối */}
                        {tx.status !== 'completed' && tx.status !== 'failed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalTx(tx);
                              setRejectionReason('');
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Từ chối đơn bán"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Ghi chú */}
                        <button
                          type="button"
                          onClick={() => {
                            setNoteModalTx(tx);
                            setNoteInput(tx.adminNote || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Thêm/Sửa ghi chú"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. TRANSACTION DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Chi Tiết Giao Dịch #{selectedTx.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông Tin Khách Hàng</div>
                <div className="flex justify-between"><span className="text-slate-400">Tên người dùng:</span><span className="font-semibold text-white">{selectedTx.userName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Họ và tên:</span><span className="font-semibold text-white">{selectedTx.fullName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="text-slate-200">{selectedTx.userEmail}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Số điện thoại:</span><span className="text-slate-200">{selectedTx.phone || 'Chưa cập nhật'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cấp độ KYC:</span><span className="text-emerald-400 font-bold uppercase">{selectedTx.kycTierAtTransaction}</span></div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chi Tiết Thanh Toán & Giá Trị</div>
                <div className="flex justify-between"><span className="text-slate-400">Loại lệnh:</span><span className="font-bold text-cyan-400">{selectedTx.type === 'buy_crypto' ? 'Mua Crypto (VND → Crypto)' : 'Bán Crypto (Crypto → VND)'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tổng tiền VND:</span><span className="font-bold text-emerald-400 font-mono text-sm">{selectedTx.totalVND.toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Lượng Crypto:</span><span className="font-bold text-cyan-300 font-mono">{selectedTx.cryptoAmount} {selectedTx.cryptoSymbol}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Mạng Blockchain:</span><span className="font-semibold text-white">{selectedTx.network}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tỷ giá áp dụng:</span><span className="font-mono text-slate-200">{(selectedTx.exchangeRate || selectedTx.p2pBenchmarkRate || 25420).toLocaleString('vi-VN')} ₫</span></div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông Tin Đối Soát & Chuỗi Khối</div>
              <div className="flex justify-between"><span className="text-slate-400">Mã thanh toán:</span><span className="font-mono text-cyan-300">{selectedTx.paymentCode || selectedTx.receiptNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Nội dung chuyển khoản:</span><span className="font-mono text-white">{selectedTx.transferMemo || `NEXUSPAY ${selectedTx.id}`}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Địa chỉ ví nhận:</span><span className="font-mono text-slate-200 break-all">{selectedTx.recipientWallet || selectedTx.depositWallet || 'Chưa cung cấp'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Blockchain TXID:</span><span className="font-mono text-cyan-400 break-all">{selectedTx.txHash || selectedTx.clientTxHash || 'Chưa phát sinh'}</span></div>
              {selectedTx.bankPayout && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Tài khoản thụ hưởng:</div>
                  <div className="text-white font-mono">{selectedTx.bankPayout.bankName} - {selectedTx.bankPayout.accountNumber} ({selectedTx.bankPayout.accountName})</div>
                </div>
              )}
              {selectedTx.adminNote && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-amber-400 font-semibold">Ghi chú của Admin: </span>
                  <span className="text-slate-300">{selectedTx.adminNote}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TXID INPUT MODAL */}
      {txidModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Cập Nhật TXID Blockchain #{txidModalTx.id}</h3>
              <button type="button" onClick={() => setTxidModalTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Nhập mã giao dịch chuỗi khối (TXID / TxHash):</label>
              <textarea
                value={txidInput}
                onChange={e => setTxidInput(e.target.value)}
                placeholder="0x8f3a9bc4123de67a421eef098bca91209341829a21b34c890123efd981245abc..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setTxidModalTx(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTxid}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30"
              >
                Lưu TXID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REJECT ORDER MODAL */}
      {rejectModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Từ Chối Đơn Giao Dịch #{rejectModalTx.id}</span>
              </h3>
              <button type="button" onClick={() => setRejectModalTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Lý do từ chối giao dịch:</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ví dụ: Chưa nhận được chuyển khoản sau 30 phút, hoặc địa chỉ ví không hợp lệ..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejectModalTx(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRejectOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADMIN NOTE MODAL */}
      {noteModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Ghi Chú Admin #{noteModalTx.id}</span>
              </h3>
              <button type="button" onClick={() => setNoteModalTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Nội dung ghi chú quản trị:</label>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Nhập ghi chú nội bộ cho quản trị viên..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setNoteModalTx(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAdminNote}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30"
              >
                Lưu Ghi Chú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIETQR PAYOUT & RECEIPT MODAL (Sell Crypto Payout) */}
      {payoutModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Ủy Nhiệm Chi & Giải Ngân VND #{payoutModalTx.id}</h3>
              </div>
              <button type="button" onClick={() => setPayoutModalTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bank details preview */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold text-slate-400 uppercase font-sans">Thông Tin Tài Khoản Thụ Hưởng Khách Hàng</div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Ngân hàng:</span><span className="font-bold text-white">{payoutModalTx.bankPayout?.bankName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Số tài khoản:</span><span className="font-bold text-cyan-300 text-sm">{payoutModalTx.bankPayout?.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Chủ tài khoản:</span><span className="font-bold text-white uppercase">{payoutModalTx.bankPayout?.accountName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Số tiền cần chuyển:</span><span className="font-bold text-emerald-400 text-base">{payoutModalTx.totalVND.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-sans">Nội dung chuyển khoản:</span><span className="text-amber-300">{payoutModalTx.bankPayout?.payoutMemo || `NEXUS PAYOUT ${payoutModalTx.id}`}</span></div>
            </div>

            {/* Quick VietQR Payout Generator for Admin banking app */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-slate-300">Quét Mã VietQR Từ App Ngân Hàng Của Admin Để Chuyển Khoản Nhanh:</div>
              <div className="flex justify-center p-2 bg-white rounded-xl w-fit mx-auto shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `24/7_NAPAS_${payoutModalTx.bankPayout?.bankName}_${payoutModalTx.bankPayout?.accountNumber}_${payoutModalTx.totalVND}_NEXUS_PAYOUT_${payoutModalTx.id}`
                  )}`}
                  alt="VietQR Payout"
                  className="w-36 h-36"
                />
              </div>
              <div className="text-[11px] text-slate-400 font-sans">Đúng số tiền và nội dung chuyển khoản tự động khớp lệnh</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Ảnh biên lai ủy nhiệm chi (Link ảnh hoặc tải lên):</label>
              <input
                type="text"
                value={receiptUrlInput}
                onChange={e => setReceiptUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... hoặc link ảnh biên lai"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Đã Chuyển Tiền</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
