import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CryptoRate, InAppNotification, Language, Transaction, UserProfile, AdminAccount } from '../types';
import { translations } from '../i18n/translations';
import { api } from '../services/api';
import { initialCryptoRates, initialUser } from '../services/mockData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  user: UserProfile;
  refreshUser: () => Promise<void>;
  rates: CryptoRate[];
  selectedRate: CryptoRate;
  setSelectedRate: (rate: CryptoRate) => void;
  activeTab: 'exchange' | 'market' | 'history' | 'profile' | 'kyc' | 'security' | 'admin';
  setActiveTab: (tab: 'exchange' | 'market' | 'history' | 'profile' | 'kyc' | 'security' | 'admin') => void;
  currentPortal: 'user' | 'admin';
  setCurrentPortal: (portal: 'user' | 'admin') => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  currentAdmin: AdminAccount | null;
  setCurrentAdmin: (admin: AdminAccount | null) => void;
  isMasterAdmin: boolean;
  activeAdminPermissions: string[];
  lockAdminSession: () => void;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  isUserAuthModalOpen: boolean;
  setIsUserAuthModalOpen: (open: boolean) => void;
  isUserLoggedIn: boolean;
  loginUserAccount: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  registerUserAccount: (payload: any) => Promise<{ success: boolean; error?: string; message?: string }>;
  logoutUserAccount: () => Promise<void>;
  vietQrConfig: any;
  refreshVietQrConfig: () => Promise<void>;
  notifications: InAppNotification[];
  userNotifications: InAppNotification[];
  adminNotifications: InAppNotification[];
  unreadCount: number;
  unreadAdminCount: number;
  markNotificationsAsRead: (scope?: 'user' | 'admin') => void;
  addNotification: (
    type: InAppNotification['type'], 
    title: string, 
    message: string, 
    linkId?: string, 
    target?: 'user' | 'admin' | 'both'
  ) => void;
  activeOrder: Transaction | null;
  setActiveOrder: (order: Transaction | null) => void;
  isStripeModalOpen: boolean;
  setIsStripeModalOpen: (open: boolean) => void;
  isVietQRModalOpen: boolean;
  setIsVietQRModalOpen: (open: boolean) => void;
  isOrderConfirmOpen: boolean;
  setIsOrderConfirmOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isKYCModalOpen: boolean;
  setIsKYCModalOpen: (open: boolean) => void;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  updateUserBalance: (cryptoSymbol: string, amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [rates, setRates] = useState<CryptoRate[]>(initialCryptoRates);
  const [selectedRate, setSelectedRate] = useState<CryptoRate>(initialCryptoRates[0]);
  const [activeTab, setActiveTab] = useState<'exchange' | 'market' | 'history' | 'profile' | 'kyc' | 'security' | 'admin'>('exchange');
  const [currentPortal, setCurrentPortal] = useState<'user' | 'admin'>('user');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [vietQrConfig, setVietQrConfig] = useState<any>(null);

  // Modals state
  const [activeOrder, setActiveOrder] = useState<Transaction | null>(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // In-app User Notifications
  const [userNotifications, setUserNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-user-1',
      type: 'security_alert',
      title: 'Bảo mật tài khoản',
      message: 'Tính năng đăng nhập sinh trắc học và 2FA đã sẵn sàng kích hoạt.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      target: 'user'
    },
    {
      id: 'notif-user-2',
      type: 'kyc_update',
      title: 'Hạn mức KYC',
      message: 'Bạn đang ở Cấp 1 (Cơ bản). Hạn mức mua crypto là 10.000.000 ₫/tháng.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      target: 'user'
    }
  ]);

  // Admin Operational Notifications
  const [adminNotifications, setAdminNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-admin-1',
      type: 'admin_action',
      title: 'Khởi tạo Bàn Làm Việc Quản Trị',
      message: 'Hệ thống phân quyền RBAC và kiểm soát rủi ro OTC đã được đồng bộ an toàn.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      target: 'admin'
    }
  ]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['vi']?.[key] || key;
  };

  const refreshUser = async () => {
    try {
      const data = await api.getUserProfile();
      if (data?.user && data.user.id && data.user.email) {
        setUser(data.user);
        setIsUserLoggedIn(true);
      } else {
        setUser(initialUser);
        setIsUserLoggedIn(false);
      }
      if (data?.vietQrConfig) {
        setVietQrConfig(data.vietQrConfig);
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
      setUser(initialUser);
      setIsUserLoggedIn(false);
    }
  };

  const refreshVietQrConfig = async () => {
    try {
      const data = await api.getVietQRConfig();
      if (data?.vietQrConfig) {
        setVietQrConfig(data.vietQrConfig);
      }
    } catch (e) {
      console.warn('Failed to refresh VietQR config:', e);
    }
  };

  const loginUserAccount = async (emailOrPhone: string, pass: string) => {
    try {
      const res = await api.loginUser({ emailOrPhone, password: pass });
      if (res.success && res.user) {
        setUser(res.user);
        setIsUserLoggedIn(true);
        setIsUserAuthModalOpen(false);
        addNotification('security_alert', 'Đăng nhập thành công', `Chào mừng ${res.user.name} trở lại sàn giao dịch.`);
        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || 'Đăng nhập không thành công.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ.' };
    }
  };

  const registerUserAccount = async (payload: any) => {
    try {
      const res = await api.registerUser(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setIsUserLoggedIn(true);
        setIsUserAuthModalOpen(false);
        addNotification('kyc_update', 'Tạo tài khoản thành công', `Chào mừng ${res.user.name}! Bạn có thể nộp CCCD/Passport để mở hạn mức.`);
        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || 'Đăng ký không thành công.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ.' };
    }
  };

  const logoutUserAccount = async () => {
    try {
      await api.logoutUser();
      setIsUserLoggedIn(false);
      setUser(initialUser);
      setIsAdminUnlocked(false);
      setActiveTab('exchange');
      addNotification('security_alert', 'Đăng xuất thành công', 'Bạn đã đăng xuất tài khoản an toàn.');
    } catch (e) {
      setIsUserLoggedIn(false);
      setUser(initialUser);
    }
  };

  const fetchRates = async () => {
    try {
      const liveRates = await api.getRates();
      if (liveRates && liveRates.length > 0) {
        setRates(liveRates);
        setSelectedRate(prev => liveRates.find(r => r.symbol === prev.symbol) || liveRates[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch live rates:', e);
    }
  };

  useEffect(() => {
    refreshUser();
    refreshVietQrConfig();
    fetchRates();
    const interval = setInterval(fetchRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (
    type: InAppNotification['type'], 
    title: string, 
    message: string, 
    linkId?: string,
    target?: 'user' | 'admin' | 'both'
  ) => {
    const determinedTarget = target || (currentPortal === 'admin' ? 'admin' : 'user');
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      linkId,
      target: determinedTarget
    };

    if (determinedTarget === 'user' || determinedTarget === 'both') {
      setUserNotifications(prev => [newNotif, ...prev]);
    }
    if (determinedTarget === 'admin' || determinedTarget === 'both') {
      setAdminNotifications(prev => [newNotif, ...prev]);
    }
  };

  const markNotificationsAsRead = (scope?: 'user' | 'admin') => {
    const targetScope = scope || (currentPortal === 'admin' ? 'admin' : 'user');
    if (targetScope === 'user') {
      setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } else {
      setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const updateUserBalance = (cryptoSymbol: string, amount: number) => {
    setUser(prev => {
      const current = prev.walletBalance[cryptoSymbol as keyof typeof prev.walletBalance] || 0;
      return {
        ...prev,
        walletBalance: {
          ...prev.walletBalance,
          [cryptoSymbol]: Number((current + amount).toFixed(6))
        }
      };
    });
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;
  const unreadAdminCount = adminNotifications.filter(n => !n.read).length;

  const isMasterAdmin = currentAdmin?.isMaster ?? false;
  const activeAdminPermissions = currentAdmin?.permissions || (isAdminUnlocked ? ['admin_users', 'transaction_management', 'wallet_management', 'payment_management', 'vietqr_config', 'stats_overview', 'kyc_review', 'market_management', 'system_settings', 'admin_management'] : []);

  const lockAdminSession = () => {
    setIsAdminUnlocked(false);
    setCurrentAdmin(null);
    setActiveTab('exchange');
    setCurrentPortal('user');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        refreshUser,
        rates,
        selectedRate,
        setSelectedRate,
        activeTab,
        setActiveTab,
        currentPortal,
        setCurrentPortal,
        isAdminUnlocked,
        setIsAdminUnlocked,
        currentAdmin,
        setCurrentAdmin,
        isMasterAdmin,
        activeAdminPermissions,
        lockAdminSession,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        isUserAuthModalOpen,
        setIsUserAuthModalOpen,
        isUserLoggedIn,
        loginUserAccount,
        registerUserAccount,
        logoutUserAccount,
        vietQrConfig,
        refreshVietQrConfig,
        notifications: userNotifications,
        userNotifications,
        adminNotifications,
        unreadCount,
        unreadAdminCount,
        markNotificationsAsRead,
        addNotification,
        activeOrder,
        setActiveOrder,
        isStripeModalOpen,
        setIsStripeModalOpen,
        isVietQRModalOpen,
        setIsVietQRModalOpen,
        isOrderConfirmOpen,
        setIsOrderConfirmOpen,
        isSupportOpen,
        setIsSupportOpen,
        isKYCModalOpen,
        setIsKYCModalOpen,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        updateUserBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
