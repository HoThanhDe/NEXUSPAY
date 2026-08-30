import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  User, 
  Terminal, 
  ArrowLeft,
  Server,
  Activity,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AdminPortalGate: React.FC = () => {
  const { 
    setIsAdminUnlocked, 
    setCurrentPortal, 
    setActiveTab, 
    addNotification, 
    t, 
    language 
  } = useApp();

  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('admin888');
  const [pinCode, setPinCode] = useState('8888');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setCurrentPortal('admin');
        setActiveTab('admin');
        addNotification(
          'security_alert',
          language === 'vi' ? 'Xác Thực Quản Trị Viên Thành Công' : 'Admin Authentication Successful',
          language === 'vi' 
            ? 'Chào mừng Quản Trị Viên! Quyền quản lý người dùng, giao dịch 2 chiều và duyệt KYC đã được kích hoạt.'
            : 'Welcome Admin! User management, 2-way transactions, and KYC review access unlocked.'
        );
      } else {
        setErrorMsg(res.error || (language === 'vi' ? 'Tài khoản, mật khẩu hoặc mã PIN Quản trị viên không chính xác.' : 'Invalid admin account credentials or security PIN.'));
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
    setCurrentPortal('admin');
    setActiveTab('admin');
    addNotification(
      'security_alert',
      language === 'vi' ? 'Đăng Nhập Quản Trị Viên Thành Công' : 'Admin Login Successful',
      language === 'vi' ? 'Đã mở khóa Bàn làm việc Quản trị viên tối cao (Master Desk).' : 'Master Operations Desk Unlocked.'
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-4 sm:p-8 space-y-6 animate-fade-in">
      {/* Top Breadcrumb Back to Client Website */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setCurrentPortal('user');
            setActiveTab('exchange');
          }}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? '← Quay về Website Khách Hàng (Client Portal)' : '← Return to Client Portal'}</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-purple-400 font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>PORTAL_SECURITY_LEVEL: MAX</span>
        </div>
      </div>

      {/* Main Admin Lock Card */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-purple-600/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {language === 'vi' ? 'Website Quản Trị Hệ Thống' : 'Master Admin Operations Desk'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-1">
              {language === 'vi' 
                ? 'Khu vực quản lý cấp cao dành riêng cho Quản trị viên OTC & Cổng thanh toán' 
                : 'Restricted administrative portal for OTC Operations, Users & KYC Review'}
            </p>
          </div>
        </div>

        {/* Feature Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-900/30 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">{language === 'vi' ? 'Quản Trị Người Dùng & KYC' : 'User & KYC Management'}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{language === 'vi' ? 'Phê duyệt hồ sơ CCCD, mở hạn mức và khóa tài khoản.' : 'Review ID documents, adjust quotas and manage user states.'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-900/30 flex items-start space-x-2.5">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">{language === 'vi' ? 'Giao Dịch 2 Chiều & VietQR' : '2-Way OTC & VietQR'}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{language === 'vi' ? 'Xử lý mua/bán crypto, cấu hình VietQR 24/7 và ví ký quỹ.' : 'Approve orders, configure VietQR 24/7 gateway and wallet pools.'}</div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              {language === 'vi' ? 'Tài Khoản / Email Quản Trị Viên' : 'Admin Username / Email'} <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={account || ''}
                onChange={e => setAccount(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              {language === 'vi' ? 'Mật Khẩu Quản Trị Viên' : 'Admin Password'} <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password || ''}
                onChange={e => setPassword(e.target.value)}
                placeholder="admin888"
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

          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
              <span>{language === 'vi' ? 'Mã PIN Bảo Mật (Tùy chọn)' : 'Security PIN (Optional)'}</span>
              <span className="text-[10px] text-purple-400 font-mono">PIN: 8888</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                maxLength={6}
                value={pinCode || ''}
                onChange={e => setPinCode(e.target.value)}
                placeholder="8888"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest text-sm"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
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
                  <span>{language === 'vi' ? 'Xác Thực & Mở Khóa Website Quản Trị' : 'Authenticate & Unlock Admin Portal'}</span>
                </>
              )}
            </button>

            {/* Quick Demo 1-click Admin Shortcut */}
            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-purple-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ {language === 'vi' ? 'Đăng Nhập Nhanh Quản Trị Viên (admin / admin888)' : 'Quick Demo Admin Login (admin / admin888)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
