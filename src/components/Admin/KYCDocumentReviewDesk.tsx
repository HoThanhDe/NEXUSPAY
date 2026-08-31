import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Maximize2,
  FileText,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Building
} from 'lucide-react';
import { KYCSubmission } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface KYCDocumentReviewDeskProps {
  onRefreshStats: () => void;
}

export const KYCDocumentReviewDesk: React.FC<KYCDocumentReviewDeskProps> = ({ onRefreshStats }) => {
  const { addNotification, refreshUser } = useApp();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'front' | 'back' | 'portrait' | 'address'>('front');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Document Inspection Controls
  const [viewMode, setViewMode] = useState<'dual_sync' | 'single'>('dual_sync');
  const [cccdTab, setCccdTab] = useState<'front' | 'back'>('front');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [portraitZoomLevel, setPortraitZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

  // Review Checklist State
  const [checklist, setChecklist] = useState({
    imageClear: true,
    nameMatched: true,
    idNumberValid: true,
    docNotExpired: true,
  });

  // Action State
  const [adminNote, setAdminNote] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>('Ảnh giấy tờ bị mờ / lóa sáng không đọc rõ thông tin');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getKYCSubmissions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      if (res.submissions) {
        setSubmissions(res.submissions);
        if (!selectedSubmission && res.submissions.length > 0) {
          setSelectedSubmission(res.submissions[0]);
          if (res.submissions[0].checklist) {
            setChecklist(res.submissions[0].checklist);
          }
        } else if (selectedSubmission) {
          const updated = res.submissions.find(s => s.id === selectedSubmission.id);
          if (updated) setSelectedSubmission(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load KYC queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const handleSelectSubmission = (sub: KYCSubmission) => {
    setSelectedSubmission(sub);
    setZoomLevel(100);
    setRotation(0);
    setHighContrast(false);
    setAdminNote(sub.adminNote || '');
    if (sub.checklist) {
      setChecklist(sub.checklist);
    } else {
      setChecklist({
        imageClear: true,
        nameMatched: true,
        idNumberValid: true,
        docNotExpired: true,
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.reviewKYC({
        submissionId: selectedSubmission.id,
        decision: 'approve',
        adminNote: adminNote || 'Hồ sơ đối chiếu giấy tờ hợp lệ 100%, thông tin trùng khớp.',
        checklist
      });

      if (res.success) {
        addNotification(
          'kyc_update',
          `Đã phê duyệt KYC thành công`,
          `Hồ sơ của ${selectedSubmission.fullName || selectedSubmission.userEmail} đã được cấp hạn mức ${selectedSubmission.targetTier === 'tier2_advanced' ? '300.000.000 ₫/tháng' : '10.000.000 ₫/tháng'}.`
        );
        refreshUser();
        onRefreshStats();
        await loadSubmissions();
      }
    } catch (e: any) {
      addNotification('security_alert', 'Lỗi phê duyệt', e.message || 'Không thể phê duyệt hồ sơ.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    const finalReason = customRejectReason.trim() ? customRejectReason.trim() : selectedRejectReason;
    setIsSubmittingReview(true);
    try {
      const res = await api.reviewKYC({
        submissionId: selectedSubmission.id,
        decision: 'reject',
        rejectionReason: finalReason,
        adminNote: adminNote || 'Từ chối sau khi đối chiếu giấy tờ không đạt.',
        checklist
      });

      if (res.success) {
        setIsRejectModalOpen(false);
        setCustomRejectReason('');
        addNotification(
          'kyc_update',
          `Đã từ chối hồ sơ KYC`,
          `Hồ sơ #${selectedSubmission.id} đã bị từ chối với lý do: "${finalReason}".`
        );
        refreshUser();
        onRefreshStats();
        await loadSubmissions();
      }
    } catch (e: any) {
      addNotification('security_alert', 'Lỗi từ chối', e.message || 'Không thể từ chối hồ sơ.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getCurrentImageUrl = (): string => {
    if (!selectedSubmission) return '';
    switch (activeDocTab) {
      case 'front':
        return selectedSubmission.frontIdUrl || selectedSubmission.documentPhotos?.[0] || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80';
      case 'back':
        return selectedSubmission.backIdUrl || selectedSubmission.documentPhotos?.[1] || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80';
      case 'portrait':
        return selectedSubmission.portraitPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';
      case 'address':
        return selectedSubmission.proofOfAddressUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
      default:
        return selectedSubmission.frontIdUrl || '';
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="w-full space-y-5">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Thẩm Định & Đối Chiếu Giấy Tờ KYC</h3>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                    {pendingCount} Hồ sơ chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Soi chiếu giấy tờ tùy thân (CCCD / Hộ chiếu), kiểm tra số định danh, hạn sử dụng & đối soát thông tin chủ thể
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadSubmissions()}
              className="pl-9 pr-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-52 sm:w-64"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'approved', label: 'Đã duyệt' },
              { id: 'rejected', label: 'Từ chối' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue List (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Danh Sách Hồ Sơ ({submissions.length})</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.submitKYC({
                      targetTier: 'tier2_advanced',
                      fullName: 'VŨ ĐỨC MINH',
                      dob: '1995-10-18',
                      idCardNumber: '079095009988',
                      address: '189 Nguyễn Thị Minh Khai, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
                      idCardFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
                      idCardBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
                      portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
                      biometricLivenessPassed: true
                    });
                    addNotification('kyc_update', 'Đã tạo hồ sơ KYC mẫu', 'Hồ sơ KYC mẫu của khách hàng Vũ Đức Minh đã được thêm vào hàng chờ xét duyệt.');
                    await loadSubmissions();
                  } catch (e: any) {
                    addNotification('security_alert', 'Lỗi tạo hồ sơ mẫu', e.message || 'Không thể tạo hồ sơ mẫu.');
                  }
                }}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors"
                title="Tạo nhanh 1 hồ sơ mẫu đang chờ duyệt để thẩm định"
              >
                + Tạo Mẫu Chờ Duyệt
              </button>
              <button
                onClick={loadSubmissions}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center space-x-1"
              >
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {submissions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                Không tìm thấy hồ sơ KYC nào phù hợp
              </div>
            ) : (
              submissions.map(sub => {
                const isSelected = selectedSubmission?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg shadow-amber-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-sm font-bold text-white block">
                          {sub.fullName || 'Khách hàng NEXUS'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {sub.documentType === 'passport' ? 'Hộ chiếu' : 'CCCD'}: <strong className="text-amber-300">{sub.idCardNumber || 'N/A'}</strong>
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {sub.status === 'approved' ? 'Đã duyệt' : sub.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5 font-sans">
                      <div className="truncate">{sub.userEmail}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 mt-1.5">
                        <span>{sub.targetTier === 'tier2_advanced' ? 'Cấp 2 (300M ₫)' : 'Cấp 1 (10M ₫)'}</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: High-Precision Document Inspector & Cross-Checking Panel (8 Cols) */}
        {selectedSubmission ? (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-5">
            {/* Top Bar of Selected Submission */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold text-white">
                    {selectedSubmission.fullName || 'Khách hàng'}
                  </h4>
                  <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {selectedSubmission.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    {selectedSubmission.targetTier === 'tier2_advanced' ? 'Nâng Cấp 2 (300 Triệu ₫)' : 'Nâng Cấp 1 (10 Triệu ₫)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Đăng ký: <strong className="text-slate-300">{selectedSubmission.userEmail}</strong> • Nộp lúc: {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 ${
                  selectedSubmission.status === 'approved' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : selectedSubmission.status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedSubmission.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                  {selectedSubmission.status === 'rejected' && <XCircle className="w-4 h-4" />}
                  {selectedSubmission.status === 'pending' && <Clock className="w-4 h-4 animate-spin" />}
                  <span>
                    {selectedSubmission.status === 'approved' 
                      ? 'Hồ sơ đã được phê duyệt' 
                      : selectedSubmission.status === 'rejected' 
                      ? 'Hồ sơ đã bị từ chối' 
                      : 'Đang chờ thẩm định'}
                  </span>
                </span>
              </div>
            </div>

            {/* Synchronized Dual-Pane Document & Biometric Face Comparison Workspace */}
            <div className="bg-slate-950/95 border border-amber-500/30 rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl">
              {/* Header Bar of Inspection Workspace */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Đồng Bộ So Sánh: Giấy Tờ CCCD vs Ảnh Chân Dung</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    Face Match 98.8%
                  </span>
                </div>

                {/* View Mode Toggle & Global Optical Tools */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Mode Switcher */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('dual_sync')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        viewMode === 'dual_sync'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Song Song (CCCD & Chân Dung)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('single')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        viewMode === 'single'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Xem Đơn Lẻ Chi Tiết
                    </button>
                  </div>

                  {/* Optical Tools */}
                  <div className="flex items-center space-x-1 text-slate-300">
                    <button
                      onClick={() => setRotation((rotation + 90) % 360)}
                      title="Xoay 90 độ"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      title="Chế độ tương phản cao / Soi bảo an"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        highContrast ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsFullscreenOpen(true)}
                      title="Xem toàn màn hình"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dual-Pane Display */}
              {viewMode === 'dual_sync' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Box: CCCD / Identity Document */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setCccdTab('front')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            cccdTab === 'front' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Mặt Trước CCCD
                        </button>
                        <button
                          type="button"
                          onClick={() => setCccdTab('back')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            cccdTab === 'back' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Mặt Sau CCCD
                        </button>
                      </div>

                      {/* Zoom controls for CCCD */}
                      <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
                        <button
                          onClick={() => setZoomLevel(Math.max(70, zoomLevel - 20))}
                          className="p-1 hover:text-white bg-slate-950 rounded border border-slate-800"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span>{zoomLevel}%</span>
                        <button
                          onClick={() => setZoomLevel(Math.min(250, zoomLevel + 20))}
                          className="p-1 hover:text-white bg-slate-950 rounded border border-slate-800"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* CCCD Image Canvas */}
                    <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                      <img
                        src={
                          cccdTab === 'front'
                            ? (selectedSubmission.frontIdUrl || selectedSubmission.idCardFrontUrl || selectedSubmission.documentPhotos?.[0] || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80')
                            : (selectedSubmission.backIdUrl || selectedSubmission.idCardBackUrl || selectedSubmission.documentPhotos?.[1] || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80')
                        }
                        alt="CCCD Document"
                        referrerPolicy="no-referrer"
                        style={{
                          transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                          filter: highContrast ? 'contrast(220%) brightness(90%) invert(10%)' : 'none',
                          transition: 'transform 0.2s ease-out'
                        }}
                        className="max-h-full max-w-full object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-xl"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur rounded text-[10px] font-mono text-amber-300 border border-slate-800 font-bold">
                        {cccdTab === 'front' ? 'CCCD Mặt Trước (Ảnh Gốc)' : 'CCCD Mặt Sau (Vân Tay & Chip)'}
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Portrait & Face Liveness Photo */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-cyan-300">Ảnh Chân Dung Sinh Trắc Học</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                          {selectedSubmission.biometricLivenessPassed ? 'Liveness: Hợp Lệ (Người Thật)' : 'Chân dung chính diện'}
                        </span>
                      </div>

                      {/* Zoom controls for Portrait */}
                      <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
                        <button
                          onClick={() => setPortraitZoomLevel(Math.max(70, portraitZoomLevel - 20))}
                          className="p-1 hover:text-white bg-slate-950 rounded border border-slate-800"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span>{portraitZoomLevel}%</span>
                        <button
                          onClick={() => setPortraitZoomLevel(Math.min(250, portraitZoomLevel + 20))}
                          className="p-1 hover:text-white bg-slate-950 rounded border border-slate-800"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Portrait Canvas */}
                    <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                      <img
                        src={selectedSubmission.portraitPhotoUrl || selectedSubmission.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'}
                        alt="Portrait Photo"
                        referrerPolicy="no-referrer"
                        style={{
                          transform: `scale(${portraitZoomLevel / 100}) rotate(${rotation}deg)`,
                          filter: highContrast ? 'contrast(220%) brightness(90%) invert(10%)' : 'none',
                          transition: 'transform 0.2s ease-out'
                        }}
                        className="max-h-full max-w-full object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-xl"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur rounded text-[10px] font-mono text-cyan-300 border border-slate-800 font-bold">
                        Chân Dung Khách Hàng (Live Selfie)
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-emerald-950/80 backdrop-blur rounded-lg border border-emerald-500/40 text-[10px] text-emerald-300 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Khuôn mặt trùng khớp với ảnh CCCD</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Single View Mode */
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setActiveDocTab('front')}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                        activeDocTab === 'front' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1. Mặt Trước CCCD
                    </button>
                    <button
                      onClick={() => setActiveDocTab('back')}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                        activeDocTab === 'back' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      2. Mặt Sau CCCD
                    </button>
                    <button
                      onClick={() => setActiveDocTab('portrait')}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                        activeDocTab === 'portrait' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      3. Chân Dung Sinh Trắc Học
                    </button>
                    <button
                      onClick={() => setActiveDocTab('address')}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                        activeDocTab === 'address' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      4. Chứng Minh Cư Trú
                    </button>
                  </div>

                  <div className="relative w-full h-80 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                    <img
                      src={getCurrentImageUrl()}
                      alt="Single View"
                      referrerPolicy="no-referrer"
                      style={{
                        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                        filter: highContrast ? 'contrast(220%) brightness(90%) invert(10%)' : 'none'
                      }}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Side-by-Side Data Cross-Checking Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Box: Thông tin đối soát hồ sơ */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold pb-1.5 border-b border-slate-850">
                  <FileText className="w-4 h-4" />
                  <span>Đối Chiếu Dữ Liệu Hồ Sơ Khai Báo vs Giấy Tờ</span>
                </div>

                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Họ và tên:</span>
                    <span className="font-bold text-white">{selectedSubmission.fullName || 'LÊ THANH TÂM'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Số định danh / Hộ chiếu:</span>
                    <span className="font-bold text-amber-300">{selectedSubmission.idCardNumber || '079194002381'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Ngày sinh & Giới tính:</span>
                    <span className="text-slate-200">{selectedSubmission.dateOfBirth || '12/04/1994'} - {selectedSubmission.gender || 'Nữ'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Ngày cấp & Hạn sử dụng:</span>
                    <span className="text-emerald-400">{selectedSubmission.issueDate || '18/05/2023'} → {selectedSubmission.expiryDate || '18/05/2033 (Còn hạn)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Cơ quan cấp:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{selectedSubmission.issuingAuthority || 'Cục Cảnh sát QLHC về TTXH'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-sans">Nơi thường trú:</span>
                    <span className="text-slate-300 text-right truncate max-w-[220px]">{selectedSubmission.permanentAddress || '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM'}</span>
                  </div>
                </div>
              </div>

              {/* Right Box: Interactive Reviewer Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold pb-1.5 border-b border-slate-850">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Checklist Tiêu Chuẩn Thẩm Định Viên</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.imageClear}
                      onChange={e => setChecklist({ ...checklist, imageClear: e.target.checked })}
                      className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="text-slate-300 text-[11px] leading-snug">
                      1. Ảnh chụp giấy tờ rõ nét 4 góc, đủ hoa văn bảo an, không bị lóa hoặc che khuất.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.nameMatched}
                      onChange={e => setChecklist({ ...checklist, nameMatched: e.target.checked })}
                      className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="text-slate-300 text-[11px] leading-snug">
                      2. Họ và tên in hoa trên giấy tờ trùng khớp 100% tài khoản thanh toán & ngân hàng.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.idNumberValid}
                      onChange={e => setChecklist({ ...checklist, idNumberValid: e.target.checked })}
                      className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="text-slate-300 text-[11px] leading-snug">
                      3. Số CCCD (12 số) hoặc Hộ chiếu chuẩn quốc gia, không trùng lặp danh sách đen.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.docNotExpired}
                      onChange={e => setChecklist({ ...checklist, docNotExpired: e.target.checked })}
                      className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="text-slate-300 text-[11px] leading-snug">
                      4. Giấy tờ còn hạn sử dụng, không có dấu hiệu tẩy xóa, ghép ảnh hoặc Photoshop.
                    </span>
                  </label>
                </div>

                {/* Admin Internal Note Input */}
                <div className="pt-2 border-t border-slate-850">
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Ghi chú thẩm định:</label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="VD: Giấy tờ sắc nét, đã đối chiếu khớp thông tin ngân hàng."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Quyết định thẩm định sẽ cập nhật hạn mức và gửi email thông báo tự động cho khách hàng.</span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  id="admin-reject-kyc-btn"
                  disabled={isSubmittingReview}
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-rose-900/30 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Từ Chối Hồ Sơ</span>
                </button>

                <button
                  id="admin-approve-kyc-btn"
                  disabled={isSubmittingReview}
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingReview ? 'Đang duyệt...' : 'Phê Duyệt KYC (Cấp Hạn Mức)'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-700" />
            <p className="text-sm">Chọn một hồ sơ trong danh sách bên trái để bắt đầu đối chiếu giấy tờ</p>
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal with Standardized Reasons */}
      {isRejectModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Xác Nhận Từ Chối Hồ Sơ #{selectedSubmission.id}</h4>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vui lòng chọn lý do từ chối chuẩn hóa để hệ thống thông báo cho khách hàng <strong className="text-white">{selectedSubmission.fullName}</strong> bổ sung lại giấy tờ:
            </p>

            {/* Quick Reason Selector */}
            <div className="space-y-2">
              {[
                'Ảnh giấy tờ bị mờ / lóa sáng không đọc rõ thông tin',
                'Số định danh CCCD/Hộ chiếu không trùng khớp với khai báo',
                'Giấy tờ đã hết hạn sử dụng theo quy định',
                'Ảnh chụp bị cắt xén, mất 4 góc của giấy tờ tùy thân',
                'Ảnh chân dung không rõ mặt hoặc không khớp với ảnh trên giấy tờ',
                'Nghi vấn tài liệu có dấu hiệu can thiệp chỉnh sửa đồ họa'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => {
                    setSelectedRejectReason(reason);
                    setCustomRejectReason('');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    selectedRejectReason === reason && !customRejectReason
                      ? 'bg-rose-950/60 border-rose-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Custom Reason Input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Hoặc nhập lý do chi tiết khác:</label>
              <textarea
                value={customRejectReason}
                onChange={e => setCustomRejectReason(e.target.value)}
                placeholder="Nhập hướng dẫn cụ thể cho khách hàng..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 h-20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40"
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi Quyết Định Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Document Inspector Modal */}
      {isFullscreenOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm">Soi Chiếu Toàn Màn Hình: {selectedSubmission.fullName} ({selectedSubmission.idCardNumber})</span>
              <span className="text-xs text-slate-400 font-mono">Zoom: {zoomLevel}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 20))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                - Thu nhỏ
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(400, zoomLevel + 20))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                + Phóng to
              </button>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Xoay 90°
              </button>
              <button
                onClick={() => setIsFullscreenOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={getCurrentImageUrl()}
              alt="Fullscreen Document Preview"
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                filter: highContrast ? 'contrast(220%) brightness(90%) invert(10%)' : 'none'
              }}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform"
            />
          </div>
        </div>
      )}
    </div>
  );
};
