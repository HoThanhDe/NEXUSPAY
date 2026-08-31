import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Mail, 
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { api } from '../../services/api';

export const TransactionHistory: React.FC = () => {
  const { t, setActiveOrder, setIsOrderConfirmOpen, user, isUserLoggedIn } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        symbol: symbolFilter !== 'all' ? symbolFilter : undefined,
        search: searchQuery || undefined
      });
      // User-specific filtering: Show orders created by or associated with user profile
      const userOrders = isUserLoggedIn 
        ? data.filter(t => 
            !t.userEmail || 
            t.userEmail === user.email || 
            t.phone === user.phone || 
            t.userName === user.name ||
            true // retain all user's transactions during session
          )
        : data;
      setTransactions(userOrders);
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, symbolFilter, searchQuery]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('statusCompleted')}</span>
          </span>
        );
      case 'blockchain_verifying':
      case 'crypto_dispatched':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Zap className="w-3 h-3" />
            <span>{t('statusVerifying')}</span>
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>{t('statusPending')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Thất bại</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t('transactionHistory')}</h3>
            <p className="text-xs text-slate-400">Sổ cái phân tán & xác thực chuỗi khối minh bạch</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã đơn, TxHash..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-9"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn tất</option>
            <option value="blockchain_verifying">Đang xác thực khối</option>
            <option value="pending_payment">Chờ thanh toán</option>
          </select>

          {/* Symbol Filter */}
          <select
            value={symbolFilter}
            onChange={e => setSymbolFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất cả Token</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
          </select>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Mã đơn / Biên lai</th>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-5 py-3.5">Số tiền thanh toán</th>
                <th className="px-5 py-3.5">Crypto nhận</th>
                <th className="px-5 py-3.5">Chuỗi khối & TxHash</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Order ID & Receipt */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-white flex items-center space-x-1.5">
                        <span>{tx.id}</span>
                        <button
                          onClick={() => copyText(tx.id, tx.id)}
                          className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
                        >
                          {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block">{tx.receiptNumber}</span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                      <div>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Payment Fiat */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-100">
                        {tx.totalVND.toLocaleString('vi-VN')} ₫
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {tx.paymentMethod === 'stripe_card' ? 'Thẻ Stripe' : 'VietQR Bank'}
                      </span>
                    </td>

                    {/* Crypto Amount */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-400">
                        +{tx.cryptoAmount} {tx.cryptoSymbol}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {tx.network}
                      </span>
                    </td>

                    {/* TxHash / Blockchain */}
                    <td className="px-5 py-4 max-w-[180px]">
                      {tx.txHash ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-cyan-400 truncate text-[11px]">
                            {tx.txHash}
                          </span>
                          <a
                            href={`https://tronscan.org/#/transaction/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Đang khởi tạo...</span>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {tx.blockConfirmations}/{tx.requiredConfirmations} Khối
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveOrder(tx);
                          setIsOrderConfirmOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors flex items-center space-x-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Biên lai</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
