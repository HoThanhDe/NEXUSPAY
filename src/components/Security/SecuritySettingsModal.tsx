import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const SecuritySettingsModal: React.FC = () => {
  const { 
    t, 
    user, 
    isSecurityModalOpen, 
    setIsSecurityModalOpen, 
    refreshUser,
    addNotification
  } = useApp();

  const [copiedKey, setCopiedKey] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isSecurityModalOpen) return null;

  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleEnablePasskey = async () => {
    setIsRegisteringPasskey(true);
    setFeedback(null);
    try {
      const success = await api.registerBiometricPasskey();
      if (success) {
        setFeedback({ type: 'success', text: 'Đã kích hoạt Passkey / Sinh trắc học thành công trên thiết bị này!' });
        refreshUser();
        addNotification(
          'security_alert',
          'Passkey đã được kích hoạt',
          'Bạn có thể sử dụng Face ID / Touch ID để xác thực mọi giao dịch thanh toán và đổi mật khẩu.'
        );

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: 'Không thể đăng ký Passkey: ' + e.message });
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleVerify2FA = async () => {
    if (totpCode.length !== 6) {
      setFeedback({ type: 'error', text: 'Vui lòng nhập đủ 6 chữ số OTP.' });
      return;
    }

    setIsVerifying2FA(true);
    setFeedback(null);
    try {
      const res = await api.verify2FACode(totpCode);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Đã kích hoạt bảo mật 2 lớp 2FA (Google Authenticator) thành công!' });
        refreshUser();
        addNotification(
          'security_alert',
          '2FA đã kích hoạt',
          'Tài khoản của bạn hiện được bảo vệ với xác thực hai yếu tố TOTP.'
        );

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else {
        setFeedback({ type: 'error', text: res.message || 'Mã xác thực không đúng.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Lỗi xác thực 2FA.' });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSecurityModalOpen(false);
            setFeedback(null);
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t('security')} & Xác thực</h3>
            <p className="text-xs text-slate-400">Bảo vệ tài sản bằng Passkeys & Google Authenticator</p>
          </div>
        </div>

        {feedback && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/50 border border-rose-500/50 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-5">
          {/* 1. Biometric Passkey */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-white">{t('biometrics')}</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                user.biometricsEnabled 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {user.biometricsEnabled ? 'Đã kích hoạt' : 'Chưa bật'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{t('biometricsDesc')}</p>

            <button
              onClick={handleEnablePasskey}
              disabled={isRegisteringPasskey}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isRegisteringPasskey ? 'Đang kích hoạt...' : user.biometricsEnabled ? 'Kiểm tra lại Passkey' : 'Bật Đăng nhập Sinh trắc học'}</span>
            </button>
          </div>

          {/* 2. 2FA TOTP Authenticator */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">{t('twoFactorAuth')}</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                user.twoFactorEnabled 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {user.twoFactorEnabled ? 'Đang bảo vệ' : 'Tắt'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{t('twoFactorDesc')}</p>

            {/* Secret key copy box */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mb-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Khóa bí mật TOTP:</span>
                <span className="font-mono font-bold text-cyan-300">{secretKey}</span>
              </div>
              <button
                onClick={handleCopySecret}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* 6-digit OTP code input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                placeholder="Nhập 6 số OTP (VD: 123456)"
                maxLength={6}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-center tracking-widest font-bold"
              />
              <button
                onClick={handleVerify2FA}
                disabled={isVerifying2FA}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 whitespace-nowrap"
              >
                {isVerifying2FA ? 'Đang kiểm tra...' : 'Xác thực'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
