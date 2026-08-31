import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Key, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Sliders, 
  Search, 
  RefreshCw, 
  Sparkles,
  Crown,
  KeyRound,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AdminAccount, AdminDeskPermission } from '../../types';

export const ALL_ADMIN_PERMISSIONS: { id: AdminDeskPermission; labelVi: string; labelEn: string; descVi: string }[] = [
  {
    id: 'admin_users',
    labelVi: 'Quản Lý Người Dùng',
    labelEn: 'User Management',
    descVi: 'Xem danh sách, khóa/mở tài khoản, cấp hạn mức và số dư người dùng'
  },
  {
    id: 'transaction_management',
    labelVi: 'Duyệt Giao Dịch OTC 2 Chiều',
    labelEn: 'OTC Order Processing',
    descVi: 'Xử lý, duyệt thành công hoặc hủy các lệnh mua bán crypto OTC'
  },
  {
    id: 'wallet_management',
    labelVi: 'Quản Lý Ví Ký Quỹ Sàn',
    labelEn: 'Custody Wallets',
    descVi: 'Quản lý số dư, tạo địa chỉ ví nhận và nạp/rút quỹ sàn'
  },
  {
    id: 'payment_management',
    labelVi: 'Quản Lý Cổng Thanh Toán',
    labelEn: 'Payment Gateway',
    descVi: 'Kiểm soát tài khoản ngân hàng, cổng Stripe và lệnh chi trả tiền'
  },
  {
    id: 'vietqr_config',
    labelVi: 'Tùy Chỉnh VietQR 24/7',
    labelEn: 'VietQR Configuration',
    descVi: 'Thay đổi STK nhận tiền, ngân hàng, cú pháp chuyển khoản và mã QR động'
  },
  {
    id: 'stats_overview',
    labelVi: 'Xem Báo Cáo & Thống Kê',
    labelEn: 'Financial Statistics',
    descVi: 'Theo dõi tổng doanh thu, biểu đồ giao dịch và khối lượng 24h'
  },
  {
    id: 'kyc_review',
    labelVi: 'Thẩm Định & Duyệt KYC',
    labelEn: 'KYC Document Review',
    descVi: 'Xem ảnh CCCD/Hộ chiếu khách hàng và phê duyệt cấp bậc xác minh'
  },
  {
    id: 'market_management',
    labelVi: 'Cài Đặt Tỷ Giá & Phí Mạng',
    labelEn: 'Market Rates & Network Fees',
    descVi: 'Điều chỉnh tỷ giá mua/bán, spread chênh lệch và cấu hình phí mạng lưới on-chain'
  },
  {
    id: 'system_settings',
    labelVi: 'Cài Đặt Tham Số Hệ Thống',
    labelEn: 'System Parameters',
    descVi: 'Cấu hình bảo mật, hạn mức giao dịch, chế độ bảo trì và nhật ký'
  },
  {
    id: 'admin_management',
    labelVi: 'Quản Trị Viên & Phân Quyền',
    labelEn: 'Admin Accounts & RBAC',
    descVi: 'Thêm, xóa và điều chỉnh phân quyền cho các tài khoản quản trị viên khác'
  }
];

export const AdminSubAdminsManagementDesk: React.FC = () => {
  const { language, addNotification, currentAdmin, isMasterAdmin } = useApp();

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditPermsModalOpen, setIsEditPermsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isChangeMasterPassModalOpen, setIsChangeMasterPassModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  // Form State for Creating Sub-Admin
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'admin_users',
    'transaction_management',
    'kyc_review',
    'vietqr_config'
  ]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Editing Permissions
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'active' | 'locked'>('active');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Reset Password State
  const [resetNewPass, setResetNewPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  // Master Admin Change Password State
  const [currentMasterPass, setCurrentMasterPass] = useState('');
  const [newMasterPass, setNewMasterPass] = useState('');
  const [confirmMasterPass, setConfirmMasterPass] = useState('');
  const [showMasterPass, setShowMasterPass] = useState(false);
  const [masterPassError, setMasterPassError] = useState<string | null>(null);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSubAdmins();
      if (res.success) {
        setAdmins(res.admins);
      }
    } catch (e) {
      console.error('Failed to load admin accounts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newUsername.trim() || !newName.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (newPassword.length < 6) {
      setCreateError('Mật khẩu quản trị viên phải có độ dài từ 6 ký tự trở lên.');
      return;
    }

    if (newPermissions.length === 0) {
      setCreateError('Vui lòng cấp ít nhất 1 quyền hạn sử dụng cho tài khoản này.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createSubAdmin({
        username: newUsername.trim(),
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        password: newPassword,
        pinCode: newPinCode.trim() || undefined,
        permissions: newPermissions
      });

      if (res.success) {
        addNotification('info', 'Tạo Tài Khoản Quản Trị Thành Công', `Đã tạo tài khoản quản trị [${newUsername}] với ${newPermissions.length} quyền hạn.`);
        setIsCreateModalOpen(false);
        // Reset form
        setNewUsername('');
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('');
        setNewPinCode('');
        setNewPermissions(['admin_users', 'transaction_management', 'kyc_review', 'vietqr_config']);
        loadAdmins();
      } else {
        setCreateError(res.error || 'Không thể tạo tài khoản quản trị viên.');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditPerms = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setEditPermissions([...admin.permissions]);
    setEditStatus(admin.status);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditPhone(admin.phone || '');
    setIsEditPermsModalOpen(true);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setIsSubmitting(true);
    try {
      const res = await api.updateSubAdminPermissions({
        adminId: selectedAdmin.id,
        permissions: editPermissions,
        status: editStatus,
        name: editName,
        email: editEmail,
        phone: editPhone
      });

      if (res.success) {
        addNotification('info', 'Cập Nhật Quyền Hạn Thành Công', `Đã lưu các quyền hạn mới cho [${selectedAdmin.username}].`);
        setIsEditPermsModalOpen(false);
        loadAdmins();
      } else {
        alert(res.error || 'Cập nhật thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubAdmin = async () => {
    if (!selectedAdmin) return;
    if (selectedAdmin.isMaster) {
      alert('Không thể xóa tài khoản Quản trị viên Tối cao (Master Admin).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.deleteSubAdmin(selectedAdmin.id);
      if (res.success) {
        addNotification('security_alert', 'Đã Xóa Tài Khoản Quản Trị', `Đã thu hồi toàn bộ quyền và xóa tài khoản [${selectedAdmin.username}].`);
        setIsDeleteConfirmOpen(false);
        setSelectedAdmin(null);
        loadAdmins();
      } else {
        alert(res.error || 'Không thể xóa tài khoản.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubAdminPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !resetNewPass) return;

    if (resetNewPass.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetSubAdminPassword(selectedAdmin.id, resetNewPass);
      if (res.success) {
        addNotification('security_alert', 'Đổi Mật Khẩu Thành Công', `Đã cập nhật mật khẩu mới cho [${selectedAdmin.username}].`);
        setIsResetPasswordModalOpen(false);
        setResetNewPass('');
      } else {
        alert(res.error || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeMasterPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPassError(null);

    if (!currentMasterPass || !newMasterPass) {
      setMasterPassError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newMasterPass !== confirmMasterPass) {
      setMasterPassError('Mật khẩu mới nhập lại không khớp.');
      return;
    }

    if (newMasterPass.length < 8) {
      setMasterPassError('Mật khẩu Master Admin tối thiểu 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changeMasterAdminPassword(currentMasterPass, newMasterPass);
      if (res.success) {
        addNotification('security_alert', 'Đổi Mật Khẩu Master Admin Thành Công', 'Mật khẩu vận hành cốt lõi đã được lưu trữ an toàn.');
        setIsChangeMasterPassModalOpen(false);
        setCurrentMasterPass('');
        setNewMasterPass('');
        setConfirmMasterPass('');
      } else {
        setMasterPassError(res.error || 'Mật khẩu hiện tại không chính xác.');
      }
    } catch (err: any) {
      setMasterPassError(err.message || 'Lỗi cập nhật mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNewPermission = (permId: string) => {
    setNewPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleEditPermission = (permId: string) => {
    setEditPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const filteredAdmins = admins.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.username.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Top Banner & Security Status */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-purple-600/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {language === 'vi' ? 'Quản Trị Viên & Phân Quyền Vận Hành (RBAC)' : 'Admin Accounts & RBAC Authority'}
                </h3>
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>MASTER ROOT SECURITY</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {language === 'vi'
                  ? 'Bảo mật tối đa cho tài khoản Master Admin cốt lõi. Thêm tài khoản quản trị mới, cấp quyền từng bàn làm việc (OTC, VietQR, KYC, Người dùng) và xóa tài khoản theo quyết định của Admin đầu tiên.'
                  : 'Enterprise multi-admin management with granular desk permissions, audit controls, and Master Root account protection.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsChangeMasterPassModalOpen(true)}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-purple-500/30 text-purple-300 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
              title="Đổi mật khẩu tài khoản Master Admin"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{language === 'vi' ? 'Đổi Mật Khẩu Master Admin' : 'Change Master Password'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'vi' ? '+ Thêm Quản Trị Viên Mới' : '+ Add Sub-Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Accounts Table & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'vi' ? 'Danh Sách Tài Khoản Quản Trị Hệ Thống' : 'System Administrators List'}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
              {admins.length} {language === 'vi' ? 'tài khoản' : 'accounts'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'vi' ? 'Tìm tài khoản, tên, email...' : 'Search admin...'}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <button
              type="button"
              onClick={loadAdmins}
              className={`p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors ${
                isLoading ? 'animate-spin text-purple-400' : ''
              }`}
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Admins */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredAdmins.map(admin => {
            const isMaster = admin.isMaster;
            return (
              <div 
                key={admin.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isMaster 
                    ? 'bg-gradient-to-r from-purple-950/50 via-slate-950 to-amber-950/40 border-amber-500/40 shadow-lg' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isMaster 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md' 
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {isMaster ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-white text-sm tracking-tight">{admin.name}</span>
                        <span className="text-xs text-purple-300 font-mono bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          @{admin.username}
                        </span>
                        {isMaster ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/40 uppercase tracking-wider">
                            👑 Master Root Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                            Sub-Admin
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          admin.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {admin.status === 'active' ? '● Hoạt Động' : '● Đã Khóa'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{admin.email}</span>
                        </span>
                        {admin.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{admin.phone}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Khởi tạo: {new Date(admin.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPerms(admin)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition-colors"
                      title="Điều chỉnh phân quyền sử dụng"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>{language === 'vi' ? 'Phân Quyền' : 'Permissions'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsResetPasswordModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition-colors"
                      title="Đổi mật khẩu cho tài khoản này"
                    >
                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'vi' ? 'Đặt Mật Khẩu' : 'Password'}</span>
                    </button>

                    {!isMaster && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded-xl border border-rose-500/30 transition-colors"
                        title="Xóa tài khoản quản trị viên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">
                    {language === 'vi' ? 'Các quyền hạn được phép sử dụng:' : 'Granted Permissions:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ADMIN_PERMISSIONS.map(p => {
                      const isGranted = isMaster || admin.permissions.includes(p.id);
                      return (
                        <span
                          key={p.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center space-x-1 transition-all ${
                            isGranted
                              ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40 shadow-xs'
                              : 'bg-slate-900/50 text-slate-600 border border-slate-800/60 line-through opacity-60'
                          }`}
                          title={p.descVi}
                        >
                          {isGranted ? <Check className="w-2.5 h-2.5 text-purple-400" /> : <X className="w-2.5 h-2.5 text-slate-600" />}
                          <span>{language === 'vi' ? p.labelVi : p.labelEn}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE SUB-ADMIN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-5 scrollbar-none">
            
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Thêm Tài Khoản Quản Trị Viên Mới</h3>
                <p className="text-xs text-purple-300/80">Khởi tạo và phân quyền hạn vận hành do Master Admin ủy nhiệm</p>
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tên Đăng Nhập / Tài Khoản <span className="text-purple-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="ví dụ: admin_support, admin_otc..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Họ Và Tên Quản Trị Viên <span className="text-purple-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="ví dụ: Nguyễn Văn A (Phụ trách OTC)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Email Liên Hệ <span className="text-purple-400">*</span></label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="admin@nexus.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Mật Khẩu Đăng Nhập <span className="text-purple-400">*</span></label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Mã PIN Bảo Mật (Tùy chọn)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPinCode}
                    onChange={e => setNewPinCode(e.target.value)}
                    placeholder="Mã PIN 4-6 số"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              {/* Permission Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Thiết Lập Quyền Hạn Được Phép Sử Dụng:</span>
                  </label>
                  <span className="text-[11px] text-purple-400 font-mono">Đã chọn: {newPermissions.length} quyền</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {ALL_ADMIN_PERMISSIONS.filter(p => p.id !== 'admin_management').map(p => {
                    const isChecked = newPermissions.includes(p.id);
                    return (
                      <label 
                        key={p.id}
                        onClick={() => toggleNewPermission(p.id)}
                        className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-purple-950/60 border-purple-500/50 text-white' 
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-purple-600 text-white' : 'border border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">{p.labelVi}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.descVi}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang Tạo...' : 'Tạo Quản Trị Viên'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {isEditPermsModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-5 scrollbar-none">
            
            <button
              onClick={() => setIsEditPermsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Điều Chỉnh Quyền Hạn Quản Trị</h3>
                <p className="text-xs text-purple-300/80">Tài khoản: <strong className="text-white font-mono">@{selectedAdmin.username}</strong> ({selectedAdmin.name})</p>
              </div>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Họ Và Tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Trạng Thái Tài Khoản</label>
                  <select
                    value={editStatus}
                    disabled={selectedAdmin.isMaster}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="active">Hoạt Động (Active)</option>
                    <option value="locked">Tạm Khóa (Locked)</option>
                  </select>
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white">Phân Quyền Các Bàn Làm Việc:</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {ALL_ADMIN_PERMISSIONS.map(p => {
                    const isChecked = selectedAdmin.isMaster || editPermissions.includes(p.id);
                    return (
                      <label 
                        key={p.id}
                        onClick={() => !selectedAdmin.isMaster && toggleEditPermission(p.id)}
                        className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-purple-950/60 border-purple-500/50 text-white' 
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-purple-600 text-white' : 'border border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">{p.labelVi}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.descVi}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditPermsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RESET SUB-ADMIN PASSWORD MODAL */}
      {isResetPasswordModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4">
            
            <button
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Đặt Lại Mật Khẩu Admin</h3>
                <p className="text-xs text-slate-400 font-mono">@{selectedAdmin.username}</p>
              </div>
            </div>

            <form onSubmit={handleResetSubAdminPass} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Mật Khẩu Mới</label>
                <div className="relative">
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    required
                    value={resetNewPass}
                    onChange={e => setResetNewPass(e.target.value)}
                    placeholder="Nhập mật khẩu mới cho admin"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Đang Đặt Lại...' : 'Xác Nhận Đổi'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CHANGE MASTER ADMIN PASSWORD MODAL */}
      {isChangeMasterPassModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4">
            
            <button
              onClick={() => setIsChangeMasterPassModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Đổi Mật Khẩu Master Admin</h3>
                <p className="text-xs text-amber-300/80">Tài khoản cốt lõi: <strong>Admin</strong></p>
              </div>
            </div>

            {masterPassError && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{masterPassError}</span>
              </div>
            )}

            <form onSubmit={handleChangeMasterPass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Mật Khẩu Hiện Tại</label>
                <input
                  type={showMasterPass ? 'text' : 'password'}
                  required
                  value={currentMasterPass}
                  onChange={e => setCurrentMasterPass(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Mật Khẩu Mới</label>
                <input
                  type={showMasterPass ? 'text' : 'password'}
                  required
                  value={newMasterPass}
                  onChange={e => setNewMasterPass(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nhập Lại Mật Khẩu Mới</label>
                <input
                  type={showMasterPass ? 'text' : 'password'}
                  required
                  value={confirmMasterPass}
                  onChange={e => setConfirmMasterPass(e.target.value)}
                  placeholder="Nhập lại chính xác mật khẩu mới"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowMasterPass(!showMasterPass)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {showMasterPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showMasterPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsChangeMasterPassModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                  >
                    {isSubmitting ? 'Đang Lưu...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE SUB-ADMIN CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && selectedAdmin && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Xác Nhận Xóa Tài Khoản Quản Trị?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tài khoản <strong className="text-rose-300 font-mono">@{selectedAdmin.username}</strong> ({selectedAdmin.name}) sẽ bị xóa và thu hồi toàn bộ quyền truy cập hệ thống.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubAdmin}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang Xóa...' : 'Xác Nhận Xóa Vĩnh Viễn'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
