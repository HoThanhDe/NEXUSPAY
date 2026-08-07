import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  Fingerprint, 
  CreditCard,
  Building2,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
  Gift,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserAuthModal: React.FC = () => {
  const { 
    t, 
    isUserAuthModalOpen, 
    setIsUserAuthModalOpen, 
    user, 
    isUserLoggedIn, 
    loginUserAccount, 
    registerUserAccount, 
    logoutUserAccount,
    setIsAdminAuthModalOpen,
    setActiveTab,
    addNotification
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [accountType, setAccountType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [referralCode, setReferralCode] = useState('MEXC888');
  const [showReferral, setShowReferral] = useState(false);

  // Anti-bot Slider Verification State (Characteristic of MEXC / Binance)
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(true); // Default true for frictionless testing with option to slide

  // Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState('mai.tran@gmail.com');
  const [password, setPassword] = useState('pass123456');

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regIdCardNumber, setRegIdCardNumber] = useState('');

  if (!isUserAuthModalOpen) return null;

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    if (score >= 3) return { score: 3, label: 'Rất mạnh', color: 'bg-emerald-500' };
    return { score: 0, label: '', color: 'bg-slate-700' };
  };

  const passStrength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await loginUserAccount(emailOrPhone, password);
      if (res.success) {
        setSuccessMessage(res.message || 'Đăng nhập thành công!');
        setTimeout(() => {
          setIsUserAuthModalOpen(false);
          setActiveTab('exchange');
        }, 800);
      } else {
        setErrorMessage(res.error || 'Email/Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách bảo mật.');
      return;
    }

    if (!fullName || (!regEmail && !regPhone) || !regPassword) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Email/Số điện thoại và Mật khẩu.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUserAccount({
        fullName,
        email: regEmail || `${regPhone}@nexus.vn`,
        phone: regPhone,
        password: regPassword,
        idCardNumber: regIdCardNumber,
        referralCode
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Đăng ký tài khoản thành công!');
        setTimeout(() => {
          setIsUserAuthModalOpen(false);
          setActiveTab('exchange');
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (roleType: 'verified_user' | 'basic_user' | 'new_user') => {
    if (roleType === 'verified_user') {
      setAuthMode('login');
      setAccountType('email');
      setEmailOrPhone('mai.tran@gmail.com');
      setPassword('pass123456');
    } else if (roleType === 'basic_user') {
      setAuthMode('login');
      setAccountType('email');
      setEmailOrPhone('nam.lehoang@yahoo.com');
      setPassword('pass123456');
    } else {
      setAuthMode('register');
      setAccountType('email');
      setFullName('Nguyễn Hoàng Long');
      setRegEmail(`long.nguyen.${Math.floor(100 + Math.random() * 900)}@gmail.com`);
      setRegPhone('0933888999');
      setRegPassword('NexusTrader2026!');
      setRegConfirmPassword('NexusTrader2026!');
      setRegIdCardNumber('079099001122');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0c1017] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-200 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsUserAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 hover:bg-slate-800 transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & MEXC Exchange Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0c1017] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Sàn MEXC / NEXUS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Giao dịch Crypto & VietQR P2P tức thì với thanh khoản bảo mật cao
            </p>
          </div>
        </div>

        {/* Main Tab Switcher: Login vs Register (MEXC Style) */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Đăng Ký Miễn Phí</span>
          </button>
        </div>

        {/* Sub-selector: Email vs Phone Number */}
        <div className="flex items-center space-x-3 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setAccountType('email')}
            className={`pb-1 font-semibold transition-all border-b-2 ${
              accountType === 'email'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setAccountType('phone')}
            className={`pb-1 font-semibold transition-all border-b-2 ${
              accountType === 'phone'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Số Điện Thoại
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= LOGIN FORM (MEXC STYLE) ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {accountType === 'email' ? 'Địa chỉ Email' : 'Số Điện Thoại (+84)'}
              </label>
              <div className="relative">
                {accountType === 'email' ? (
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                )}
                <input
                  type={accountType === 'email' ? 'email' : 'tel'}
                  required
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder={accountType === 'email' ? 'mai.tran@gmail.com' : '0912345678'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Mật Khẩu
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setPassword('pass123456');
                    addNotification('security_alert', 'Mật khẩu mẫu', 'Đã tự động điền mật khẩu tài khoản mẫu: pass123456');
                  }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Quên mật khẩu? (Gợi ý: pass123456)
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
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

            {/* Anti-bot Slider Security Simulation */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-slate-300 font-medium">Bảo Mật Chống Robot (MEXC Guard):</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-500/30">
                ✓ Đã xác minh an toàn
              </span>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="rememberMe" className="text-slate-400 select-none cursor-pointer">
                Ghi nhớ phiên đăng nhập trên thiết bị này (30 ngày)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Đăng Nhập Vào Sàn Giao Dịch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Test Users */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Tài khoản mẫu thử nghiệm nhanh 1-chạm:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('verified_user')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left text-[11px] text-slate-300 transition-colors"
                >
                  <strong className="text-emerald-400 block">Mai Trần (KYC Cấp 2)</strong>
                  <span className="text-[10px] text-slate-500 font-mono">Hạn mức 300M ₫/tháng</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('basic_user')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left text-[11px] text-slate-300 transition-colors"
                >
                  <strong className="text-amber-400 block">Lê Nam (KYC Cấp 1)</strong>
                  <span className="text-[10px] text-slate-500 font-mono">Hạn mức 10M ₫/tháng</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM (MEXC STYLE) ================= */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Họ và Tên Đầy Đủ <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="VD: NGUYỄN HOÀNG LONG (như trên CCCD)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Cá Nhân <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="long.nguyen@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="0933888999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mật Khẩu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Xác Nhận Mật Khẩu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Password strength meter */}
            {regPassword && (
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                <span className="text-slate-400">Độ an toàn mật khẩu:</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className={`w-6 h-1.5 rounded-full ${passStrength.score >= 1 ? passStrength.color : 'bg-slate-800'}`} />
                    <div className={`w-6 h-1.5 rounded-full ${passStrength.score >= 2 ? passStrength.color : 'bg-slate-800'}`} />
                    <div className={`w-6 h-1.5 rounded-full ${passStrength.score >= 3 ? passStrength.color : 'bg-slate-800'}`} />
                  </div>
                  <span className="font-bold text-slate-200">{passStrength.label}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Số CCCD / Hộ Chiếu (Tùy chọn)
              </label>
              <input
                type="text"
                value={regIdCardNumber}
                onChange={e => setRegIdCardNumber(e.target.value)}
                placeholder="079094012345 (12 số CCCD)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Optional Referral Code (MEXC Style) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowReferral(!showReferral)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <Gift className="w-3 h-3 text-amber-400" />
                <span>Mã giới thiệu / Promo code (Nhận ưu đãi 0% phí Maker)</span>
              </button>
              {showReferral && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value)}
                    placeholder="VD: MEXC888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start space-x-2 text-xs pt-1">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="agreeTerms" className="text-slate-400 select-none cursor-pointer text-[11px] leading-relaxed">
                Tôi đã đọc và đồng ý với <span className="text-emerald-400 hover:underline">Điều Khoản Dịch Vụ</span> và <span className="text-emerald-400 hover:underline">Chính Sách Bảo Mật</span> của Sàn MEXC / NEXUS.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo Tài Khoản & Bắt Đầu Giao Dịch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Admin Portal Gateway Link Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Khu vực Ban Quản Trị:</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setIsUserAuthModalOpen(false);
              setIsAdminAuthModalOpen(true);
            }}
            className="text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 hover:underline"
          >
            <span>Đăng Nhập Cổng Quản Trị Viên</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

