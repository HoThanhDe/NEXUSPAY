import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  FileText, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Wallet, 
  Calendar, 
  MapPin, 
  Maximize2, 
  X,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const UserProfileView: React.FC = () => {
  const { 
    t, 
    user, 
    refreshUser, 
    setActiveTab, 
    setIsKYCModalOpen, 
    addNotification 
  } = useApp();

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Document Lightbox Modal for enlarged view
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; title: string } | null>(null);

  // Quick Currency Formatter
  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' ₫';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPassMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addNotification('security_alert', 'Đổi Mật Khẩu Thành Công', 'Mật khẩu tài khoản của bạn vừa được cập nhật.');
        refreshUser();
      } else {
        setPassMessage({ type: 'error', text: res.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.' });
      }
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 max-w-6xl mx-auto pb-12">
      {/* Lightbox Enlarged Image Modal */}
      {enlargedImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sm text-cyan-300 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>{enlargedImage.title}</span>
              </span>
              <button
                onClick={() => setEnlargedImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              <img src={enlargedImage.url} alt={enlargedImage.title} className="max-h-[70vh] w-auto object-contain" />
            </div>
            <div className="text-center text-xs text-slate-400">
              Giấy tờ tùy thân bảo mật được mã hóa theo chuẩn bảo vệ người dùng NEXUS.
            </div>
          </div>
        </div>
      )}

      {/* Hero User Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.portraitUrl ? (
                <img 
                  src={user.portraitUrl} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Tài khoản đang hoạt động">
                <CheckCircle2 className="w-3 h-3 text-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{user.name}</h1>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.role === 'admin' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {user.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="text-slate-600">•</span>
                <span>UID: {user.id}</span>
              </div>
            </div>
          </div>

          {/* Action Shortcut to Buy/Sell Crypto */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('exchange')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>VÀO SÀN MUA BÁN CRYPTO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Overview: Wallets & KYC Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Wallet Balances Card */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Wallet className="w-4 h-4" />
              <span>Số Dư Ví Tài Khoản</span>
            </div>
            <button 
              onClick={() => setActiveTab('exchange')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center"
            >
              Giao Dịch <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-sans">Tiền Đồng Việt Nam (VND)</span>
              <span className="font-bold text-emerald-400">{formatVND(user.walletBalance.VND || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-sans">Tether USD (USDT)</span>
              <span className="font-bold text-cyan-300">{(user.walletBalance.USDT || 0).toLocaleString()} USDT</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-sans">Bitcoin (BTC)</span>
              <span className="font-bold text-amber-300">{user.walletBalance.BTC || 0} BTC</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-sans">Ethereum (ETH)</span>
              <span className="font-bold text-indigo-300">{user.walletBalance.ETH || 0} ETH</span>
            </div>
          </div>
        </div>

        {/* KYC Limit Status Card */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Hạn Mức & Cấp Độ Xác Thực KYC</span>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              user.kycStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              user.kycStatus === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-slate-800 text-slate-400'
            }`}>
              {user.kycStatus === 'verified' ? 'Đã Xác Thực' : user.kycStatus === 'pending' ? 'Đang Chờ Duyệt' : 'Chưa Nộp KYC'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400">Cấp độ hiện tại</div>
              <div className="text-base font-bold text-white">
                {user.kycTier === 'tier2_advanced' ? 'Cấp 2 (Nâng Cao - 300 Triệu)' :
                 user.kycTier === 'tier1_basic' ? 'Cấp 1 (Cơ Bản - 10 Triệu)' :
                 'Cấp 0 (Chưa xác thực)'}
              </div>
              <div className="text-[11px] text-slate-500">
                Hạn mức tối đa: {formatVND(user.monthlyLimitVND)} / tháng
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Đã giao dịch tháng này:</span>
                <span className="font-mono font-bold text-amber-300">{formatVND(user.monthlyUsedVND)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (user.monthlyUsedVND / Math.max(1, user.monthlyLimitVND)) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                Còn lại: {formatVND(Math.max(0, user.monthlyLimitVND - user.monthlyUsedVND))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Cần nâng thêm hạn mức giao dịch lên 300 triệu đồng?</span>
            <button
              onClick={() => setIsKYCModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nộp / Cập Nhật Hồ Sơ KYC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Change Password & View KYC Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. ĐỔI MẬT KHẨU TÀI KHOẢN (Password Manager) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Đổi Mật Khẩu Tài Khoản</h3>
              <p className="text-xs text-slate-400">Cập nhật mật khẩu định kỳ để tăng cường an toàn số dư ví</p>
            </div>
          </div>

          {passMessage && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
              passMessage.type === 'success' 
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}>
              {passMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{passMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại (hoặc để trống nếu mặc định)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Mật khẩu mới</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Tối thiểu 6 ký tự (kết hợp chữ và số)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Xác nhận mật khẩu mới</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isChangingPass ? 'Đang Cập Nhật Mật Khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. XEM THÔNG TIN KYC & ẢNH GIẤY TỜ TÙY THÂN (KYC Inspector) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Thông Tin Giấy Tờ Tùy Thân</h3>
                <p className="text-xs text-slate-400">Hồ sơ CCCD / Hộ chiếu đã xác thực trên hệ thống</p>
              </div>
            </div>

            <button
              onClick={() => setIsKYCModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1"
              title="Chỉnh sửa ảnh giấy tờ"
            >
              <span>Chụp/Tải Lại</span>
            </button>
          </div>

          {/* User ID Meta info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Họ và tên trên CCCD:</span>
              <span className="font-bold text-white uppercase">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Số CCCD / CMND:</span>
              <span className="font-bold text-cyan-300">{user.idCardNumber || '079094012345'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Số Hộ Chiếu (Passport):</span>
              <span className="font-bold text-indigo-300">{user.passportNumber || 'B8291039'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Ngày sinh:</span>
              <span className="font-bold text-white">{user.dateOfBirth || '15/08/1994'}</span>
            </div>
            <div className="col-span-2 border-t border-slate-800 pt-2 font-sans">
              <span className="text-slate-500 text-[10px] block">Địa chỉ thường trú:</span>
              <span className="text-slate-300 text-[11px]">{user.address || '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'}</span>
            </div>
          </div>

          {/* Visual ID Document Photos (Front, Back, Portrait) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Hình ảnh thực tế giấy tờ đã tải lên / chụp qua Camera:</label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Front Photo */}
              <div 
                onClick={() => user.idCardFrontUrl && setEnlargedImage({ url: user.idCardFrontUrl, title: 'Mặt Trước CCCD / Hộ Chiếu' })}
                className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group hover:border-cyan-400 transition-all"
              >
                {user.idCardFrontUrl ? (
                  <>
                    <img src={user.idCardFrontUrl} alt="Mặt trước" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-200">Mặt Trước</span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500">
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Back Photo */}
              <div 
                onClick={() => user.idCardBackUrl && setEnlargedImage({ url: user.idCardBackUrl, title: 'Mặt Sau CCCD' })}
                className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group hover:border-cyan-400 transition-all"
              >
                {user.idCardBackUrl ? (
                  <>
                    <img src={user.idCardBackUrl} alt="Mặt sau" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-200">Mặt Sau</span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500">
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Portrait Photo */}
              <div 
                onClick={() => user.portraitUrl && setEnlargedImage({ url: user.portraitUrl, title: 'Ảnh Chân Dung / Sinh Trắc Học Face ID' })}
                className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black cursor-pointer group hover:border-cyan-400 transition-all"
              >
                {user.portraitUrl ? (
                  <>
                    <img src={user.portraitUrl} alt="Chân dung" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-200">Chân Dung</span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500">
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">Nhấp vào từng ảnh để phóng to và kiểm tra độ sắc nét của giấy tờ.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
