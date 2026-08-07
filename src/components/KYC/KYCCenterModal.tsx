import React, { useState, useRef, useEffect } from 'react';
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
  UserCheck,
  RefreshCw,
  Trash2,
  Maximize2,
  SwitchCamera,
  Eye
} from 'lucide-react';
import confetti from '../../utils/confetti';
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
  const [fullName, setFullName] = useState(user.name || 'NGUYEN VAN AN');
  const [dob, setDob] = useState(user.dateOfBirth || '1994-08-15');
  const [idCardNumber, setIdCardNumber] = useState(user.idCardNumber || '079094012345');
  const [passportNumber, setPassportNumber] = useState(user.passportNumber || 'B8291039');
  const [address, setAddress] = useState(user.address || '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh');
  
  // Real Images State (Supports both File Upload & Live Camera Capture)
  const [frontImage, setFrontImage] = useState<string | null>(user.idCardFrontUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80');
  const [backImage, setBackImage] = useState<string | null>(user.idCardBackUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80');
  const [portraitImage, setPortraitImage] = useState<string | null>(user.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80');
  
  // Live Camera State
  const [cameraActiveFor, setCameraActiveFor] = useState<'front' | 'back' | 'portrait' | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tempCapturedImage, setTempCapturedImage] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Hidden File Inputs
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const portraitFileInputRef = useRef<HTMLInputElement>(null);

  // Camera video & canvas refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Biometric scanner state
  const [isScanningLiveness, setIsScanningLiveness] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(user.kycTier === 'tier2_advanced');
  const [livenessProgress, setLivenessProgress] = useState(user.kycTier === 'tier2_advanced' ? 100 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stop camera stream cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActiveFor(null);
    setTempCapturedImage(null);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  if (!isKYCModalOpen) return null;

  // Handle File Upload from Local Device (Phone / PC)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'portrait'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addNotification('security_alert', 'Ảnh quá lớn', 'Kích thước ảnh không được vượt quá 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'front') setFrontImage(result);
      else if (type === 'back') setBackImage(result);
      else if (type === 'portrait') setPortraitImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Start Live Device Camera
  const startCamera = async (targetType: 'front' | 'back' | 'portrait') => {
    stopCameraStream();
    setCameraActiveFor(targetType);
    setTempCapturedImage(null);
    setCameraError(null);
    setIsCameraLoading(true);

    const facing = targetType === 'portrait' ? 'user' : cameraFacing;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt hoặc thiết bị của bạn chưa hỗ trợ MediaDevices Camera API.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt hoặc sử dụng tính năng "Tải ảnh từ máy".'
          : `Không thể mở Camera thiết bị: ${err.message || 'Thiết bị không có sẵn'}. Vui lòng dùng nút "Tải tệp ảnh lên".`
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Flip Camera between Front and Back
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraActiveFor) {
      await startCamera(cameraActiveFor);
    }
  };

  // Capture current video frame to Canvas
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setTempCapturedImage(dataUrl);
  };

  // Confirm and accept captured photo
  const acceptCapturedPhoto = () => {
    if (!tempCapturedImage || !cameraActiveFor) return;
    if (cameraActiveFor === 'front') setFrontImage(tempCapturedImage);
    else if (cameraActiveFor === 'back') setBackImage(tempCapturedImage);
    else if (cameraActiveFor === 'portrait') {
      setPortraitImage(tempCapturedImage);
      setLivenessPassed(true);
      setLivenessProgress(100);
    }
    stopCameraStream();
  };

  // Biometric Liveness Scanner simulation
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
    }, 350);
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage) {
      addNotification('security_alert', 'Thiếu ảnh giấy tờ', 'Vui lòng tải lên hoặc chụp ảnh CCCD / Hộ chiếu mặt trước.');
      return;
    }
    if (selectedTargetTier === 'tier1_basic' && !backImage) {
      addNotification('security_alert', 'Thiếu ảnh giấy tờ', 'Vui lòng tải lên hoặc chụp ảnh CCCD mặt sau.');
      return;
    }

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
        portraitUrl: portraitImage,
        biometricLivenessPassed: livenessPassed
      });

      if (res.success) {
        setSuccessMessage('Hồ sơ KYC kèm toàn bộ ảnh chụp giấy tờ thực tế đã được nộp thành công! Quản trị viên sẽ thẩm định trong vòng 1-5 phút.');
        refreshUser();
        addNotification(
          'kyc_update',
          'Đã nộp hồ sơ KYC',
          `Hồ sơ nâng hạng ${selectedTargetTier === 'tier2_advanced' ? 'Cấp 2 (300M)' : 'Cấp 1 (10M)'} của bạn đang được hệ thống đối soát.`
        );

        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('KYC submit error:', err);
      addNotification('security_alert', 'Lỗi nộp hồ sơ', err.message || 'Không thể kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Hidden Canvas for Camera Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Inputs */}
        <input 
          ref={frontFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileUpload(e, 'front')}
        />
        <input 
          ref={backFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileUpload(e, 'back')}
        />
        <input 
          ref={portraitFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileUpload(e, 'portrait')}
        />

        {/* Close button */}
        <button
          onClick={() => {
            stopCameraStream();
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
            <p className="text-xs text-slate-400">Tải ảnh từ máy hoặc bật Camera chụp trực tiếp giấy tờ tùy thân CCCD / Hộ chiếu</p>
          </div>
        </div>

        {/* Camera Live Modal Overlay */}
        {cameraActiveFor && (
          <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-sm text-white">
                    {cameraActiveFor === 'front' && 'Chụp Mặt Trước CCCD / Hộ Chiếu'}
                    {cameraActiveFor === 'back' && 'Chụp Mặt Sau CCCD'}
                    {cameraActiveFor === 'portrait' && 'Chụp Ảnh Chân Dung Selfie / Face ID'}
                  </span>
                </div>
                <button
                  onClick={stopCameraStream}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cameraError ? (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-rose-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>Lỗi Camera</span>
                  </div>
                  <p>{cameraError}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const target = cameraActiveFor;
                        stopCameraStream();
                        if (target === 'front') frontFileInputRef.current?.click();
                        else if (target === 'back') backFileInputRef.current?.click();
                        else if (target === 'portrait') portraitFileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn Ảnh Từ Thiết Bị Thay Thế</span>
                    </button>
                  </div>
                </div>
              ) : tempCapturedImage ? (
                /* Review captured photo */
                <div className="space-y-4 text-center">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video flex items-center justify-center">
                    <img 
                      src={tempCapturedImage} 
                      alt="Captured Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold">
                      Đã Chụp Thành Công
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setTempCapturedImage(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Chụp Lại</span>
                    </button>
                    <button
                      onClick={acceptCapturedPhoto}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác Nhận & Sử Dụng Ảnh Này</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Camera Feed */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/60 bg-black aspect-video flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Visual Card/Face Guide Overlay */}
                    {cameraActiveFor === 'portrait' ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                        <div className="w-full h-full max-w-sm rounded-xl border-2 border-dashed border-cyan-400/80 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          <span className="text-[11px] font-bold text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-lg">
                            Đặt giấy tờ khớp vào khung
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-md">
                      Live Video HD 720p
                    </div>
                  </div>

                  {/* Camera Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <SwitchCamera className="w-4 h-4" />
                      <span className="hidden sm:inline">Đổi Camera ({cameraFacing === 'environment' ? 'Sau' : 'Trước'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>BẤM CHỤP ẢNH NGAY</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                  <span className="text-[10px] text-slate-500 mt-2 block">Yêu cầu: Hộ chiếu / CCCD + Quét Face ID Liveness</span>
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

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1 font-medium">Địa chỉ thường trú / Nơi cư trú</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Document Uploads & Live Camera Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ảnh chụp giấy tờ tùy thân & Chân dung:</span>
                </label>
                <span className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP hoặc Bật Camera chụp trực tiếp</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Front ID Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-center flex flex-col items-center justify-between space-y-2.5">
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">1. {t('uploadIdFront')}</span>
                    {frontImage ? (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã có ảnh
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-semibold">Chưa có ảnh</span>
                    )}
                  </div>

                  {frontImage ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-700 group bg-black">
                      <img src={frontImage} alt="Mặt trước" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold"
                          title="Tải lại"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startCamera('front')}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold"
                          title="Chụp lại"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrontImage(null)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center p-2 text-slate-400">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-[11px]">Chưa tải ảnh mặt trước CCCD</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => frontFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
                    >
                      <Upload className="w-3 h-3 text-cyan-400" />
                      <span>Tải Từ Máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera('front')}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 text-[11px] font-semibold flex items-center justify-center space-x-1 border border-indigo-500/40 transition-colors"
                    >
                      <Camera className="w-3 h-3 text-indigo-400" />
                      <span>Bật Camera</span>
                    </button>
                  </div>
                </div>

                {/* 2. Back ID Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-center flex flex-col items-center justify-between space-y-2.5">
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">2. {t('uploadIdBack')}</span>
                    {backImage ? (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã có ảnh
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-semibold">Chưa có ảnh</span>
                    )}
                  </div>

                  {backImage ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-700 group bg-black">
                      <img src={backImage} alt="Mặt sau" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startCamera('back')}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBackImage(null)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center p-2 text-slate-400">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-[11px]">Chưa tải ảnh mặt sau CCCD</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => backFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition-colors"
                    >
                      <Upload className="w-3 h-3 text-cyan-400" />
                      <span>Tải Từ Máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera('back')}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 text-[11px] font-semibold flex items-center justify-center space-x-1 border border-indigo-500/40 transition-colors"
                    >
                      <Camera className="w-3 h-3 text-indigo-400" />
                      <span>Bật Camera</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Biometric Face ID Liveness Scanner (Tier 2 requirement) */}
            {selectedTargetTier === 'tier2_advanced' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">{t('biometricScan')} (Face ID Liveness)</span>
                  </div>
                  {livenessPassed && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('livenessPassed')} (98.6%)</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="flex items-center space-x-3">
                    {portraitImage ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md">
                        <img src={portraitImage} alt="Portrait" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-dashed border-indigo-500/40 flex items-center justify-center text-indigo-400">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div className="text-xs">
                      <div className="font-semibold text-slate-200">Ảnh Chân Dung Sinh Trắc Học</div>
                      <p className="text-[11px] text-slate-400">Yêu cầu chụp chính diện, không đeo kính râm hoặc khẩu trang.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera('portrait')}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Bật Camera Chụp Selfie</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => portraitFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1 border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tải File</span>
                    </button>
                  </div>
                </div>

                {isScanningLiveness ? (
                  <div className="text-center py-3 space-y-2 border-t border-slate-800/80">
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-cyan-400 animate-spin mx-auto flex items-center justify-center">
                      <Fingerprint className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-xs text-cyan-300 font-mono">Đang quét sinh trắc học khuôn mặt 3D... {livenessProgress}%</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startBiometricLivenessScan}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      livenessPassed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span>{livenessPassed ? 'Quét lại kiểm tra Liveness AI' : 'Bắt đầu quét thuật toán khuôn mặt AI (Face Liveness)'}</span>
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
              <span>{isSubmitting ? 'Đang gửi hồ sơ & ảnh...' : t('submitKyc')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
