import React, { useState, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint, 
  Sparkles,
  ArrowRight,
  FileCheck,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { KYCTier } from '../../types';
import { api } from '../../services/api';

export const KYCCenterModal: React.FC = () => {
  const { 
    t, 
    user, 
    isKYCModalOpen, 
    setIsKYCModalOpen, 
    refreshUser,
    addNotification
  } = useApp();

  const [selectedTargetTier, setSelectedTargetTier] = useState<KYCTier>('tier2_advanced');
  const [fullName, setFullName] = useState('NGUYEN VAN AN');
  const [dob, setDob] = useState('1994-08-15');
  const [idCardNumber, setIdCardNumber] = useState('079094012345');
  const [passportNumber, setPassportNumber] = useState('B8291039');
  const [address, setAddress] = useState('123 Nguyen Hue, Quan 1, TP. Ho Chi Minh');
  const [frontImage, setFrontImage] = useState<string | null>('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');
  const [backImage, setBackImage] = useState<string | null>('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');
  
  // Biometric scanner state
  const [isScanningLiveness, setIsScanningLiveness] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isKYCModalOpen) return null;

  const startBiometricLivenessScan = () => {
    setIsScanningLiveness(true);
    setLivenessProgress(0);
    setLivenessPassed(false);

    const interval = setInterval(() => {
      setLivenessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningLiveness(false);
          setLivenessPassed(true);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.submitKYC({
        targetTier: selectedTargetTier,
        fullName,
        dob,
        idCardNumber,
        passportNumber,
        address,
        idCardFrontUrl: frontImage,
        idCardBackUrl: backImage,
        biometricLivenessPassed: livenessPassed
      });

      if (res.success) {
        setSuccessMessage('Hồ sơ KYC đã được gửi xét duyệt thành công! Quản trị viên sẽ xử lý trong vòng 1-5 phút.');
        refreshUser();
        addNotification(
          'kyc_update',
          'Đã nộp hồ sơ KYC',
          `Hồ sơ nâng hạng ${selectedTargetTier === 'tier2_advanced' ? 'Cấp 2 (300M)' : 'Cấp 1 (10M)'} của bạn đang được hệ thống đối soát.`
        );

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('KYC submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            setIsKYCModalOpen(false);
            setSuccessMessage(null);
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t('kycTitle')}</h3>
            <p className="text-xs text-slate-400">{t('kycSubtitle')}</p>
          </div>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Gửi Hồ Sơ Thành Công!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">{successMessage}</p>
            <button
              onClick={() => {
                setIsKYCModalOpen(false);
                setSuccessMessage(null);
              }}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitKYC} className="mt-5 space-y-5">
            {/* Tier Selection Cards */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Chọn cấp bậc xác thực mong muốn:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tier 1 */}
                <div
                  onClick={() => setSelectedTargetTier('tier1_basic')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTargetTier === 'tier1_basic'
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-amber-400">{t('tier1')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">10.000.000 ₫/tháng</span>
                  </div>
                  <p className="text-xs text-slate-300">{t('tier1Desc')}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">Yêu cầu: CCCD / CMND 2 mặt</span>
                </div>

                {/* Tier 2 */}
                <div
                  onClick={() => setSelectedTargetTier('tier2_advanced')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTargetTier === 'tier2_advanced'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-emerald-400">{t('tier2')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">300.000.000 ₫/tháng</span>
                  </div>
                  <p className="text-xs text-slate-300">{t('tier2Desc')}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">Yêu cầu: Hộ chiếu + Quét Face ID Liveness</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">{t('fullName')}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">{t('dateOfBirth')}</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">{t('idCardNumber')}</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={e => setIdCardNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {selectedTargetTier === 'tier2_advanced' && (
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">{t('passportNumber')}</label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={e => setPassportNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Document Uploads Preview */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Ảnh chụp giấy tờ tùy thân:</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-500 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-200">{t('uploadIdFront')}</span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center">
                    <FileCheck className="w-3 h-3 mr-1" /> Đã tải lên (Mặt trước)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-500 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-200">{t('uploadIdBack')}</span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center">
                    <FileCheck className="w-3 h-3 mr-1" /> Đã tải lên (Mặt sau)
                  </span>
                </div>
              </div>
            </div>

            {/* Biometric Face ID Liveness Scanner (Tier 2 requirement) */}
            {selectedTargetTier === 'tier2_advanced' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">{t('biometricScan')}</span>
                  </div>
                  {livenessPassed && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('livenessPassed')} (98.6%)</span>
                    </span>
                  )}
                </div>

                {isScanningLiveness ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-cyan-400 animate-spin mx-auto flex items-center justify-center">
                      <Fingerprint className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-xs text-cyan-300 font-mono">Đang quét sinh trắc học khuôn mặt 3D... {livenessProgress}%</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startBiometricLivenessScan}
                    className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      livenessPassed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{livenessPassed ? 'Quét lại sinh trắc học khuôn mặt' : 'Bắt đầu quét khuôn mặt AI (Face Liveness)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isSubmitting ? 'Đang gửi hồ sơ...' : t('submitKyc')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
