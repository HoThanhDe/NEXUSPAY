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
  Eye, 
  EyeOff, 
  Gift
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserAuthModal: React.FC = () => {
  const { 
    t, 
    isUserAuthModalOpen, 
    setIsUserAuthModalOpen, 
    loginUserAccount, 
    registerUserAccount, 
    setActiveTab
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [accountType, setAccountType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  // Form Fields - Strictly Empty (Forced Manual Typing Every Time)
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields - Strictly Empty
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

    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUserAccount(emailOrPhone.trim(), password.trim());
      if (res.success) {
        setSuccessMessage(res.message || 'Đăng nhập thành công!');
        setTimeout(() => {
          setIsUserAuthModalOpen(false);
          setActiveTab('exchange');
          setEmailOrPhone('');
          setPassword('');
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

    if (!fullName.trim() || (!regEmail.trim() && !regPhone.trim()) || !regPassword.trim()) {
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
        fullName: fullName.trim(),
        email: regEmail.trim() || `${regPhone.trim()}@nexus.vn`,
        phone: regPhone.trim(),
        password: regPassword.trim(),
        idCardNumber: regIdCardNumber.trim(),
        referralCode: referralCode.trim()
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Đăng ký tài khoản thành công! Vui lòng nhập lại thông tin để đăng nhập.');
        setFullName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegIdCardNumber('');
        
        setTimeout(() => {
          setAuthMode('login');
          setEmailOrPhone('');
          setPassword('');
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
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

        {/* Brand & Exchange Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0c1017] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'login' ? 'Đăng Nhập Khách Hàng' : 'Đăng Ký Tài Khoản Mới'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                NEXUS OTC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Giao dịch Mua & Bán Crypto trực tuyến qua VietQR và Thẻ quốc tế 24/7
            </p>
          </div>
        </div>

        {/* Main Tab Switcher: Login vs Register */}
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
            <span>Đăng Ký Mới</span>
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
            Sử dụng Email
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
            Sử dụng Số Điện Thoại
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

        {/* ================= LOGIN FORM ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {accountType === 'email' ? 'Địa chỉ Email đăng nhập' : 'Số Điện Thoại (+84)'}
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
                  placeholder={accountType === 'email' ? 'Nhập email của bạn...' : '0912345678'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
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

            {/* Anti-bot Security Indicator */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-slate-300 font-medium">Bảo Mật Xác Thực Giao Dịch:</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-500/30">
                SSL 256-Bit
              </span>
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
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Họ và Tên Đầy Đủ <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="VD: NGUYỄN VĂN A (như trên CCCD)"
                autoComplete="off"
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
                  placeholder="email@gmail.com"
                  autoComplete="off"
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
                  placeholder="0933xxxxxx"
                  autoComplete="off"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
                autoComplete="off"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Optional Referral Code */}
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
                    placeholder="VD: NEXUS888"
                    autoComplete="off"
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
                Tôi đã đọc và đồng ý với <span className="text-emerald-400 hover:underline">Điều Khoản Dịch Vụ</span> và <span className="text-emerald-400 hover:underline">Chính Sách Bảo Mật</span> của Sàn NEXUS OTC.
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
      </div>
    </div>
  );
};
