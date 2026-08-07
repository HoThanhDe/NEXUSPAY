import React, { useState } from 'react';
import { ShieldAlert, Lock, KeyRound, CheckCircle2, AlertCircle, X, Sparkles, UserCheck } from 'lucide-react';
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

  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAdminAuthModalOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyAdminAuth({
        password,
        pinCode
      });

      if (res.authorized) {
        setIsAdminUnlocked(true);
        setIsAdminAuthModalOpen(false);
        setActiveTab('admin');
        addNotification('security_alert', 'Xác Thực Quản Trị Viên Thành Công', 'Toàn bộ quyền quản trị dữ liệu quan trọng đã được mở khóa.');
      } else {
        setErrorMsg(res.error || 'Mật khẩu quản trị hoặc mã PIN không đúng.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xác thực hệ thống.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickDemoAdminLogin = () => {
    setPassword('nexus2026');
    setPinCode('8888');
    setIsAdminUnlocked(true);
    setIsAdminAuthModalOpen(false);
    setActiveTab('admin');
    addNotification('security_alert', 'Đăng Nhập Quản Trị Viên Demo', 'Đã mở khóa phiên làm việc Quản Trị Viên cấp cao.');
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setIsAdminAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Khu Vực Quản Trị Viên Tối Cao</h3>
            <p className="text-xs text-purple-300">Yêu cầu xác thực bảo mật trước khi truy cập dữ liệu quan trọng</p>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <p className="font-semibold text-slate-200">Bảo Vệ Dữ Liệu Quan Trọng (Admin-Only Guard):</p>
          <p className="text-slate-400 text-[11px]">Người dùng thông thường không có quyền truy cập, chỉnh sửa tỷ giá thị trường, duyệt KYC hoặc thay đổi trạng thái tài khoản.</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Mật khẩu Admin</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu Admin (mặc định: nexus2026 hoặc admin123)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Hoặc Mã PIN Quản Trị Cấp Tốc</label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={e => setPinCode(e.target.value)}
              placeholder="PIN: 8888 hoặc 1234"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest text-sm"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Đang Kiểm Tra Quyền Quản Trị...' : 'Mở Khóa Bảng Quản Trị (Unlock Admin)'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-purple-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Đăng Nhập Nhanh Quyền Quản Trị Viên (Demo)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
