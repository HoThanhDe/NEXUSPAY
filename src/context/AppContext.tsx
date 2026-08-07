import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CryptoRate, InAppNotification, Language, Transaction, UserProfile } from '../types';
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
  activeTab: 'exchange' | 'market' | 'history' | 'kyc' | 'security' | 'admin';
  setActiveTab: (tab: 'exchange' | 'market' | 'history' | 'kyc' | 'security' | 'admin') => void;
  notifications: InAppNotification[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  addNotification: (type: InAppNotification['type'], title: string, message: string, linkId?: string) => void;
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
  const [activeTab, setActiveTab] = useState<'exchange' | 'market' | 'history' | 'kyc' | 'security' | 'admin'>('exchange');

  // Modals state
  const [activeOrder, setActiveOrder] = useState<Transaction | null>(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // In-app Push Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      type: 'security_alert',
      title: 'Bảo mật tài khoản',
      message: 'Tính năng đăng nhập sinh trắc học và 2FA đã sẵn sàng kích hoạt.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      type: 'kyc_update',
      title: 'Hạn mức KYC',
      message: 'Bạn đang ở Cấp 1 (Cơ bản). Hạn mức mua crypto là 10.000.000 ₫/tháng.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['vi']?.[key] || key;
  };

  const refreshUser = async () => {
    try {
      const data = await api.getUserProfile();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
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
    fetchRates();
    const interval = setInterval(fetchRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (type: InAppNotification['type'], title: string, message: string, linkId?: string) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      linkId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
        notifications,
        unreadCount,
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
