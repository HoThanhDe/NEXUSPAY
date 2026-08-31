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
  Server, 
  Activity, 
  Cpu, 
  UserPlus, 
  ArrowRight,
  Shield,
  Layers,
  LockKeyhole
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AdminPortalGate: React.FC = () => {
  const { 
    setIsAdminUnlocked, 
    setCurrentAdmin,
    setCurrentPortal, 
    setActiveTab, 
    addNotification, 
    language 
  } = useApp();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form Fields - Strictly Empty by default (Forced Manual Entry, No Memory)
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLocked, setIsCapsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register Form Fields - Strictly Empty by default
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPinCode, setRegPinCode] = useState('');
  const [regDepartment, setRegDepartment] = useState<'kyc' | 'otc' | 'audit' | 'all'>('otc');
  const [regAuthCode, setRegAuthCode] = useState('');

  // Detect Caps Lock
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLocked(e.getModifierState('CapsLock'));
  };

  // Perform Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanAccount = account.trim();
    const cleanPassword = password.trim();
    const cleanPin = pinCode.trim();

    if (!cleanAccount || !cleanPassword) {
      setErrorMsg(language === 'vi' 
        ? 'Vui lòng nhập đầy đủ Tên đăng nhập/Email và Mật khẩu quản trị.' 
        : 'Please enter admin account and password.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await api.verifyAdminAuth({
        account: cleanAccount,
        username: cleanAccount,
        email: cleanAccount,
        password: cleanPassword,
        pinCode: cleanPin || undefined
      });

      if (res.authorized) {
        if (res.admin) {
          setCurrentAdmin(res.admin);
        } else {
          setCurrentAdmin({
            id: 'ADM-ACTIVE',
            username: cleanAccount,
            name: res.adminName || 'Quản Trị Viên',
            email: res.adminEmail || '',
            isMaster: res.isMaster ?? false,
            status: 'active',
            permissions: res.permissions || ['admin_users', 'transaction_management', 'kyc_review'],
            createdAt: new Date().toISOString()
          });
        }

        setIsAdminUnlocked(true);
        setCurrentPortal('admin');
        setActiveTab('admin');

        // Do not store passwords or credentials in localStorage
        sessionStorage.setItem('nexus_admin_session_active', 'true');

        addNotification(
          'security_alert',
          language === 'vi' ? 'Xác Thực Quản Trị Viên Thành Công' : 'Admin Authentication Successful',
          res.message || (language === 'vi' 
            ? `Phiên làm việc quản trị [${res.adminName || cleanAccount}] đã mở khóa an toàn.`
            : 'Welcome Admin! System operations console unlocked.'),
          undefined,
          'admin'
        );
      } else {
        setErrorMsg(res.error || (language === 'vi' 
          ? 'Đăng nhập thất bại. Tài khoản, mật khẩu hoặc mã PIN không chính xác.' 
          : 'Invalid administrative credentials.'));
      }
    } catch (err: any) {
      setErrorMsg(language === 'vi' 
        ? 'Lỗi kết nối máy chủ quản trị. Vui lòng thử lại.' 
        : 'Server error during administrative authentication.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Perform Admin Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = regUsername.trim();
    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();
    const cleanPin = regPinCode.trim();

    if (!cleanUsername || !cleanName || !cleanEmail || !cleanPass) {
      setErrorMsg('Vui lòng điền đầy đủ Tên đăng nhập, Họ tên, Email công vụ và Mật khẩu.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Mật khẩu quản trị phải có tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await api.registerAdmin({
        username: cleanUsername,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPass,
        pinCode: cleanPin || '888888',
        department: regDepartment,
        authCode: regAuthCode.trim()
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Đăng ký tài khoản Quản Trị Viên thành công! Vui lòng nhập lại thông tin để đăng nhập.');
        // Reset form fields to force manual entry
        setRegUsername('');
        setRegFullName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegPinCode('');
        setRegAuthCode('');
        
        // Auto switch to login tab after 1.5s
        setTimeout(() => {
          setAuthMode('login');
          setAccount('');
          setPassword('');
          setPinCode('');
        }, 1500);

        addNotification(
          'system_alert',
          'Đăng Ký Tài Khoản Quản Trị Thành Công',
          `Tài khoản @${cleanUsername} đã được khởi tạo trong cơ sở dữ liệu quản trị.`,
          undefined,
          'admin'
        );
      } else {
        setErrorMsg(res.error || 'Đăng ký tài khoản quản trị thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xử lý tạo tài khoản quản trị.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 animate-fade-in space-y-6">
      
      {/* Platform Title Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg shadow-purple-950/40">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>HỆ THỐNG XÁC THỰC QUẢN TRỊ VIÊN CẤP CAO (ZERO-TRUST)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cổng Đăng Nhập & Đăng Ký Quản Trị
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Khu vực phân quyền riêng biệt dành cho Ban Quản Lý, Thẩm Định Viên và Kiểm Toán Sàn NEXUS OTC.
        </p>
      </div>

      {/* Main Administrative Container */}
      <div className="bg-slate-900/95 border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 backdrop-blur-xl relative overflow-hidden">
        
        {/* Subtle Decorative Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Tabs: Đăng Nhập vs Tạo Tài Khoản Mới */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 border border-purple-950 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Đăng Nhập Quản Trị</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Tài Khoản Admin Mới</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-start space-x-3 text-xs text-rose-300 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-start space-x-3 text-xs text-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-medium">{successMsg}</div>
          </div>
        )}

        {/* 1. LOGIN TAB (Strictly Manual Entry, No Pre-fill, No Remember Creds) */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center justify-between">
                <span>Tên Đăng Nhập / Email Quản Trị</span>
                <span className="text-[10px] text-purple-400 font-mono">Bắt buộc nhập tay</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  onKeyUp={handleKeyUp}
                  placeholder="Nhập tên đăng nhập hoặc email quản trị..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center justify-between">
                <span>Mật Khẩu Quản Trị</span>
                {isCapsLocked && (
                  <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                    ⚠️ Caps Lock Đang Bật
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyUp={handleKeyUp}
                  placeholder="Nhập mật khẩu quản trị bảo mật..."
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center justify-between">
                <span>Mã PIN Bảo Mật Cấp 2 (6 Số)</span>
                <span className="text-[10px] text-slate-500 font-mono">Bảo mật giao dịch</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập mã PIN 6 số (VD: 888888)..."
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-3 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                />
                <KeyRound className="w-4 h-4 text-amber-500/70 absolute right-4 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Xác Thực & Mở Khóa Bàn Làm Việc Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-500">
              <span>Hệ thống áp dụng chính sách Zero-Trust: Mỗi lần đăng nhập bắt buộc phải nhập lại thông tin xác thực để bảo vệ an ninh sàn.</span>
            </div>
          </form>
        )}

        {/* 2. REGISTER NEW ADMIN ACCOUNT TAB */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Tên Đăng Nhập Quản Trị (Username) *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="VD: ke_toan_truong, kyc_lead..."
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Họ và Tên Cán Bộ Quản Trị *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Email Công Vụ Quản Trị *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="admin@nexus.vn"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Số Điện Thoại Trực Ban
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="0988xxxxxx"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mật Khẩu Quản Trị Cấp Cao *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự..."
                  autoComplete="new-password"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Xác Nhận Mật Khẩu *
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu..."
                  autoComplete="new-password"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Bộ Phận & Quyền Hạn Phân Công *
                </label>
                <select
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value as any)}
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="otc">Trực Ban OTC & Khớp Lệnh VietQR</option>
                  <option value="kyc">Chuyên Viên Thẩm Định Hồ Sơ KYC</option>
                  <option value="audit">Kế Toán, Báo Cáo & Kiểm Toán Tài Chính</option>
                  <option value="all">Quản Trị Toàn Quyền (Master Operations)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mã PIN Bảo Mật Cấp 2 (6 Số)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={regPinCode}
                  onChange={e => setRegPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 888888"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-purple-950 rounded-2xl px-4 py-2.5 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-900/40 rounded-2xl text-[11px] text-purple-300">
              <span className="font-bold block mb-0.5">ℹ️ Lưu ý bảo mật quản trị:</span>
              <span>Sau khi tạo tài khoản thành công, hệ thống sẽ yêu cầu bạn nhập lại tên đăng nhập và mật khẩu tại tab Đăng Nhập để khởi tạo phiên làm việc an toàn.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Khởi Tạo & Kích Hoạt Tài Khoản Quản Trị Viên</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Security Infrastructure Footer Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
        <div className="flex items-center space-x-1.5">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Core Vault: Active</span>
        </div>
        <span>•</span>
        <div className="flex items-center space-x-1.5">
          <LockKeyhole className="w-3.5 h-3.5 text-purple-400" />
          <span>256-Bit Ledger Sync</span>
        </div>
        <span>•</span>
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero Memory Token Isolation</span>
        </div>
      </div>

    </div>
  );
};
