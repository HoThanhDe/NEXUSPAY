import React, { useState } from 'react';
import { ShieldAlert, Lock, KeyRound, CheckCircle2, AlertCircle, X, Sparkles, UserCheck, Eye, EyeOff, ShieldCheck, User, Terminal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    setIsAdminAuthModalOpen, 
    setIsAdminUnlocked, 
    setActiveTab, 
    addNotification 
  } = useApp();

  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('admin888');
  const [pinCode, setPinCode] = useState('8888');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAdminAuthModalOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyAdminAuth({
        account,
        username: account,
        email: account,
        password,
        pinCode
      });

      if (res.authorized) {
        setIsAdminUnlocked(true);
        setIsAdminAuthModalOpen(false);
        setActiveTab('admin');
        addNotification(
          'security_alert',
          'Xác Thực Quản Trị Viên Thành Công',
          'Chào mừng Tổng Quản Trị Viên! Quyền duyệt KYC khách hàng, quản lý người dùng và cấu hình tỷ giá đã được kích hoạt.'
        );
      } else {
        setErrorMsg(res.error || 'Tài khoản, mật khẩu hoặc mã PIN Quản trị viên không chính xác.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xác thực hệ thống.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickDemoAdminLogin = () => {
    setAccount('admin');
    setPassword('admin888');
    setPinCode('8888');
    setIsAdminUnlocked(true);
    setIsAdminAuthModalOpen(false);
    setActiveTab('admin');
    addNotification(
      'security_alert',
      'Đăng Nhập Quản Trị Viên Thành Công',
      'Đã mở khóa Bàn làm việc Quản trị viên tối cao (Master Desk).'
    );
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-100 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setIsAdminAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">Cổng Đăng Nhập Quản Trị Viên</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-0.5">
              Yêu cầu tài khoản & mật khẩu đặc quyền để phê duyệt yêu cầu khách hàng
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-purple-300 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Phân Quyền Phê Duyệt Khách Hàng (Admin Authority):</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Chỉ quản trị viên đã đăng nhập mới có quyền phê duyệt hồ sơ KYC, cấp hạn mức giao dịch, điều chỉnh số dư ví, duyệt lệnh và chỉnh sửa tỷ giá thị trường.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3.5 text-xs">
          {/* Admin Account / Username */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              Tài Khoản / Email Quản Trị Viên <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={account || ''}
                onChange={e => setAccount(e.target.value)}
                placeholder="admin hoặc admin@nexus.vn"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              Mật Khẩu Quản Trị Viên <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password || ''}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (admin888 hoặc nexus2026)"
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional PIN Code */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
              <span>Mã PIN Bảo Mật (Tùy chọn)</span>
              <span className="text-[10px] text-purple-400">PIN: 8888</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                maxLength={6}
                value={pinCode || ''}
                onChange={e => setPinCode(e.target.value)}
                placeholder="Mã PIN 4 số (8888 hoặc 1234)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest text-sm"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xl shadow-purple-600/30 disabled:opacity-50 transition-all"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Xác Thực & Đăng Nhập Quản Trị Viên</span>
                </>
              )}
            </button>

            {/* Quick Demo 1-click Admin Shortcut */}
            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-purple-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Đăng Nhập Nhanh Quản Trị Viên (admin / admin888)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
