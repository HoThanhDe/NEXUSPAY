import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  Wallet, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  UserX, 
  UserCheck, 
  FileText, 
  Maximize2, 
  X,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';

export const AdminUsersManagementDesk: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Action Modals state
  const [resetPassModal, setResetPassModal] = useState<{ open: boolean; user?: UserProfile; tempPass?: string }>({ open: false });
  const [adjustBalanceModal, setAdjustBalanceModal] = useState<{ open: boolean; user?: UserProfile; currency: string; amount: number }>({ open: false, currency: 'VND', amount: 5000000 });
  const [enlargedDoc, setEnlargedDoc] = useState<{ url: string; title: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({
        search,
        status: statusFilter,
        tier: tierFilter
      });
      setUsers(res.users);
    } catch (err: any) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, tierFilter]);

  // Lock / Unlock user account
  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    try {
      const res = await api.updateUserStatus(user.id, nextStatus);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Cập nhật trạng thái người dùng thành công!' });
        fetchUsers();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Change Tier Directly
  const handleChangeTier = async (userId: string, tier: string) => {
    try {
      const res = await api.updateUserTier(userId, tier);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Đã đổi cấp bậc KYC thành công!' });
        fetchUsers();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Reset User Password
  const handleResetPassword = async (userId: string) => {
    const tempPass = 'nexus' + Math.floor(100000 + Math.random() * 900000);
    try {
      const res = await api.resetUserPassword(userId, tempPass);
      if (res.success) {
        setResetPassModal({ open: true, user: users.find(u => u.id === userId), tempPass });
        setActionMessage({ type: 'success', text: `Đã đặt lại mật khẩu tạm: ${tempPass}` });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Adjust Wallet Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBalanceModal.user) return;
    try {
      const res = await api.adjustUserBalance(
        adjustBalanceModal.user.id,
        adjustBalanceModal.currency,
        adjustBalanceModal.amount
      );
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Đã điều chỉnh số dư thành công!' });
        setAdjustBalanceModal({ open: false, currency: 'VND', amount: 0 });
        fetchUsers();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Lightbox Modal for enlarged document */}
      {enlargedDoc && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sm text-cyan-300">{enlargedDoc.title}</span>
              <button
                onClick={() => setEnlargedDoc(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img src={enlargedDoc.url} alt={enlargedDoc.title} className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {resetPassModal.open && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <KeyRound className="w-5 h-5" />
              <span>Đã Đặt Lại Mật Khẩu Tạm Thời</span>
            </div>
            <p className="text-xs text-slate-300">
              Mật khẩu mới cho tài khoản <strong className="text-white">{resetPassModal.user?.name}</strong> ({resetPassModal.user?.email}) là:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-base font-bold text-amber-300 select-all">
              {resetPassModal.tempPass}
            </div>
            <p className="text-[11px] text-slate-400">Người dùng có thể đăng nhập bằng mật khẩu này và vào trang cá nhân để đổi lại mật khẩu.</p>
            <button
              onClick={() => setResetPassModal({ open: false })}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"
            >
              Đã Ghi Nhận
            </button>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {adjustBalanceModal.open && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustBalance} className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Wallet className="w-5 h-5" />
                <span>Nạp / Điều Chỉnh Số Dư Người Dùng</span>
              </div>
              <button
                type="button"
                onClick={() => setAdjustBalanceModal({ open: false, currency: 'VND', amount: 0 })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Cộng / điều chỉnh số dư cho <strong className="text-white">{adjustBalanceModal.user?.name}</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Loại Tiền Tệ</label>
                <select
                  value={adjustBalanceModal.currency}
                  onChange={e => setAdjustBalanceModal({ ...adjustBalanceModal, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                >
                  <option value="VND">Việt Nam Đồng (VND)</option>
                  <option value="USDT">Tether USD (USDT)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Số lượng cộng thêm</label>
                <input
                  type="number"
                  step="any"
                  value={adjustBalanceModal.amount ?? 0}
                  onChange={e => setAdjustBalanceModal({ ...adjustBalanceModal, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustBalanceModal({ open: false, currency: 'VND', amount: 0 })}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Xác Nhận Nạp Tiền
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header Overview Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Trung Tâm Quản Trị Người Dùng & Hồ Sơ KYC</h2>
              <p className="text-xs text-slate-400">Đặc quyền Quản Trị Viên: Khóa/mở tài khoản, đặt lại mật khẩu, duyệt cấp KYC, xem hồ sơ CCCD/Hộ chiếu</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Danh Sách</span>
        </button>
      </div>

      {actionMessage && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
          actionMessage.type === 'success' ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search || ''}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, UID, CCCD, SĐT..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả trạng thái tài khoản</option>
            <option value="active">Đang hoạt động (Active)</option>
            <option value="locked">Đã bị khóa (Locked)</option>
          </select>
        </div>

        <div>
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả cấp độ KYC</option>
            <option value="tier2_advanced">Cấp 2 (Nâng cao 300M)</option>
            <option value="tier1_basic">Cấp 1 (Cơ bản 10M)</option>
            <option value="tier0_unverified">Cấp 0 (Chưa KYC)</option>
          </select>
        </div>
      </div>

      {/* Users List Cards */}
      <div className="space-y-4">
        {users.map(u => (
          <div 
            key={u.id}
            className={`p-5 rounded-3xl border transition-all ${
              u.status === 'locked' 
                ? 'bg-rose-950/20 border-rose-500/30' 
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: User Info & Avatar */}
              <div className="flex items-start space-x-4">
                <div className="relative shrink-0">
                  {u.portraitUrl ? (
                    <img 
                      src={u.portraitUrl} 
                      alt={u.name} 
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                    u.status === 'locked' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}>
                    {u.status === 'locked' ? <Lock className="w-2.5 h-2.5 text-white" /> : <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">{u.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      u.status === 'locked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {u.status === 'locked' ? 'Tài Khoản Đã Khóa' : 'Đang Hoạt Động'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.email}</span>
                    </span>
                    {u.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{u.phone}</span>
                      </span>
                    )}
                    <span>UID: {u.id}</span>
                  </div>

                  {/* ID Card / Passport Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                    {u.idCardNumber && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        CCCD: <strong className="text-cyan-300">{u.idCardNumber}</strong>
                      </span>
                    )}
                    {u.passportNumber && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Passport: <strong className="text-indigo-300">{u.passportNumber}</strong>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Hạn mức: <strong className="text-amber-300">{(u.monthlyLimitVND || 0).toLocaleString('vi-VN')} ₫/tháng</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Balances */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 min-w-[200px]">
                <div className="text-slate-500 text-[10px] uppercase font-sans font-bold">Số dư ví hiện tại</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VND:</span>
                  <span className="font-bold text-emerald-400">{(u.walletBalance.VND || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USDT:</span>
                  <span className="font-bold text-cyan-300">{u.walletBalance.USDT || 0} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BTC:</span>
                  <span className="font-bold text-amber-300">{u.walletBalance.BTC || 0} BTC</span>
                </div>
              </div>

              {/* Right: Admin Action Buttons */}
              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                {/* Lock / Unlock Toggle */}
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    u.status === 'locked'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                  }`}
                >
                  {u.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{u.status === 'locked' ? 'Mở Khóa User' : 'Khóa Tài Khoản'}</span>
                </button>

                {/* Reset Password */}
                <button
                  onClick={() => handleResetPassword(u.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đặt Lại Mật Khẩu</span>
                </button>

                {/* Adjust Balance */}
                <button
                  onClick={() => setAdjustBalanceModal({ open: true, user: u, currency: 'VND', amount: 5000000 })}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 border border-emerald-500/30"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nạp / Sửa Số Dư</span>
                </button>

                {/* Quick Tier Select */}
                <select
                  value={u.kycTier}
                  onChange={e => handleChangeTier(u.id, e.target.value)}
                  className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-semibold"
                >
                  <option value="tier0_unverified">Đổi KYC: Cấp 0 (0đ)</option>
                  <option value="tier1_basic">Đổi KYC: Cấp 1 (10 Triệu)</option>
                  <option value="tier2_advanced">Đổi KYC: Cấp 2 (300 Triệu)</option>
                </select>
              </div>
            </div>

            {/* Document Photos Inspector Tray (if user uploaded images) */}
            {(u.idCardFrontUrl || u.idCardBackUrl || u.portraitUrl) && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Giấy tờ tùy thân CCCD / Hộ chiếu thực tế đã tải lên:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {u.idCardFrontUrl && (
                    <div 
                      onClick={() => setEnlargedDoc({ url: u.idCardFrontUrl!, title: `Mặt trước CCCD của ${u.name}` })}
                      className="relative h-16 rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group"
                    >
                      <img src={u.idCardFrontUrl} alt="Mặt trước" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="absolute bottom-0.5 left-1 text-[8px] bg-black/80 px-1 rounded text-slate-200">Mặt Trước</span>
                    </div>
                  )}

                  {u.idCardBackUrl && (
                    <div 
                      onClick={() => setEnlargedDoc({ url: u.idCardBackUrl!, title: `Mặt sau CCCD của ${u.name}` })}
                      className="relative h-16 rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group"
                    >
                      <img src={u.idCardBackUrl} alt="Mặt sau" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="absolute bottom-0.5 left-1 text-[8px] bg-black/80 px-1 rounded text-slate-200">Mặt Sau</span>
                    </div>
                  )}

                  {u.portraitUrl && (
                    <div 
                      onClick={() => setEnlargedDoc({ url: u.portraitUrl!, title: `Ảnh chân dung Face ID của ${u.name}` })}
                      className="relative h-16 rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group"
                    >
                      <img src={u.portraitUrl} alt="Chân dung" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="absolute bottom-0.5 left-1 text-[8px] bg-black/80 px-1 rounded text-slate-200">Face ID</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
