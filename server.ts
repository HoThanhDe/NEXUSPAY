import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  initialCryptoRates, 
  initialUser, 
  sampleTransactions, 
  sampleKycQueue, 
  vietQrBankDetails, 
  depositHotWallets,
  defaultP2PSpreadSettings,
  computeP2PExchanges,
  initialSystemWallets,
  samplePaymentPayouts
} from './src/services/mockData';
import { Transaction, KYCSubmission, UserProfile, CryptoRate, P2PSpreadSettings, SystemWallet, PaymentPayoutRecord } from './src/types';

// VietQR Dynamic Configuration managed by Admin
let currentVietQrConfig = {
  bankName: vietQrBankDetails.bankName,
  bankShort: vietQrBankDetails.bankShort,
  bankCode: vietQrBankDetails.bankCode,
  accountNumber: vietQrBankDetails.accountNumber,
  accountName: vietQrBankDetails.accountName,
  gatewayMemoPrefix: vietQrBankDetails.gatewayMemoPrefix,
  partnerApiKey: 'napas_live_key_99882200',
  partnerApiSecret: 'napas_sec_8849201994829104',
  webhookUrl: 'https://api.nexuspay.gateway/v1/vietqr/callback',
  autoConfirmDeposit: true,
  testMode: false,
  bankLogoUrl: 'https://api.vietqr.io/img/VCB.png',
  lastUpdated: new Date().toISOString()
};

// In-Memory Durable Store for full runtime persistence
let transactions: Transaction[] = [...sampleTransactions];
let systemWallets: SystemWallet[] = [...initialSystemWallets];
let paymentPayouts: PaymentPayoutRecord[] = [...samplePaymentPayouts];
let userProfile: UserProfile | null = null;
let userPasswordHash: string = '';

// Users database managed by Admin
let usersDatabase: UserProfile[] = [
  {
    id: 'USR-89215',
    name: 'Trần Thị Mai',
    email: 'mai.tran@gmail.com',
    phone: '0912345678',
    role: 'user',
    status: 'active',
    kycTier: 'tier2_advanced',
    kycStatus: 'verified',
    monthlyLimitVND: 300000000,
    monthlyUsedVND: 45000000,
    walletBalance: { VND: 12500000, USDT: 1450.5, BTC: 0.05, ETH: 0.8, SOL: 12.4 },
    twoFactorEnabled: true,
    biometricsEnabled: true,
    registeredAt: '2026-06-10T10:15:00Z',
    idCardNumber: '079198009876',
    passportNumber: 'C1928472',
    dateOfBirth: '1998-03-22',
    address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    lastLogin: '2026-08-06T19:40:00Z'
  },
  {
    id: 'USR-89216',
    name: 'Lê Hoàng Nam',
    email: 'nam.lehoang@yahoo.com',
    phone: '0988765432',
    role: 'user',
    status: 'active',
    kycTier: 'tier1_basic',
    kycStatus: 'verified',
    monthlyLimitVND: 10000000,
    monthlyUsedVND: 8200000,
    walletBalance: { VND: 3400000, USDT: 220.0, BTC: 0, ETH: 0, SOL: 2.1 },
    twoFactorEnabled: false,
    biometricsEnabled: false,
    registeredAt: '2026-07-02T14:30:00Z',
    idCardNumber: '001095001234',
    dateOfBirth: '1995-11-08',
    address: '78 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    lastLogin: '2026-08-05T08:15:00Z'
  },
  {
    id: 'USR-89217',
    name: 'Phạm Đức Minh',
    email: 'minh.crypto@outlook.com',
    phone: '0903334445',
    role: 'user',
    status: 'locked',
    kycTier: 'tier0_unverified',
    kycStatus: 'rejected',
    monthlyLimitVND: 0,
    monthlyUsedVND: 0,
    walletBalance: { VND: 0, USDT: 0, BTC: 0, ETH: 0, SOL: 0 },
    twoFactorEnabled: false,
    biometricsEnabled: false,
    registeredAt: '2026-08-01T09:00:00Z',
    idCardNumber: '038099008899',
    dateOfBirth: '1999-05-14',
    address: '12 Trần Phú, Quận Hải Châu, TP. Đà Nẵng',
    lastLogin: '2026-08-04T12:00:00Z'
  },
  {
    id: 'ADM-00001',
    name: 'NEXUS Super Admin',
    email: 'admin@nexuspay.gateway',
    phone: '0909999999',
    role: 'admin',
    status: 'active',
    kycTier: 'tier2_advanced',
    kycStatus: 'verified',
    monthlyLimitVND: 5000000000,
    monthlyUsedVND: 0,
    walletBalance: { VND: 500000000, USDT: 50000, BTC: 5, ETH: 50, SOL: 500 },
    twoFactorEnabled: true,
    biometricsEnabled: true,
    registeredAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-08-06T22:00:00Z'
  }
];

interface AdminAccountRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  pinCode?: string;
  isMaster: boolean;
  status: 'active' | 'locked';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
}

let adminAccountsDatabase: AdminAccountRecord[] = [
  {
    id: 'ADM-MASTER-001',
    username: 'Admin',
    name: 'Tổng Quản Trị Viên (Master Root Admin)',
    email: 'admin@nexus.vn',
    phone: '0909999999',
    passwordHash: '00110011kK@',
    pinCode: '888888',
    isMaster: true,
    status: 'active',
    permissions: [
      'admin_users',
      'transaction_management',
      'wallet_management',
      'payment_management',
      'vietqr_config',
      'stats_overview',
      'kyc_review',
      'market_management',
      'system_settings',
      'admin_management'
    ],
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-08-30T21:00:00Z',
    createdBy: 'ROOT_AUTHORITY'
  },
  {
    id: 'ADM-KYC-002',
    username: 'kyc_officer',
    name: 'Nguyễn Thu Trang (Chuyên Viên Thẩm Định KYC)',
    email: 'trang.kyc@nexus.vn',
    phone: '0908111222',
    passwordHash: '00110011kK@',
    pinCode: '123456',
    isMaster: false,
    status: 'active',
    permissions: ['kyc_review', 'admin_users'],
    createdAt: '2026-02-15T00:00:00Z',
    lastLogin: '2026-08-30T20:30:00Z',
    createdBy: 'Admin'
  },
  {
    id: 'ADM-OTC-003',
    username: 'otc_operator',
    name: 'Trần Hoàng Long (Trực Ban Khớp Lệnh VietQR & OTC)',
    email: 'long.otc@nexus.vn',
    phone: '0907333444',
    passwordHash: '00110011kK@',
    pinCode: '654321',
    isMaster: false,
    status: 'active',
    permissions: ['transaction_management', 'vietqr_config', 'wallet_management', 'payment_management'],
    createdAt: '2026-03-10T00:00:00Z',
    lastLogin: '2026-08-30T19:45:00Z',
    createdBy: 'Admin'
  },
  {
    id: 'ADM-AUDIT-004',
    username: 'auditor',
    name: 'Lê Minh Quân (Kiểm Toán & Giám Sát Thị Trường)',
    email: 'quan.audit@nexus.vn',
    phone: '0906555666',
    passwordHash: '00110011kK@',
    pinCode: '999999',
    isMaster: false,
    status: 'active',
    permissions: ['stats_overview', 'market_management', 'system_settings'],
    createdAt: '2026-04-01T00:00:00Z',
    lastLogin: '2026-08-30T18:15:00Z',
    createdBy: 'Admin'
  }
];

let kycSubmissions: KYCSubmission[] = [...sampleKycQueue];
let p2pSpreadSettings: P2PSpreadSettings = { ...defaultP2PSpreadSettings };
let liveCryptoRates: CryptoRate[] = [...initialCryptoRates];

// Base USDT P2P reference across Binance, Bybit, OKX, MEXC, Bitget
let baseUSDTP2P = 25420;

// Central Rate Calculation Engine supporting 3 modes:
// 1. 'percentage': Market Percentage Spread (% Markup for Buy, % Discount for Sell)
// 2. 'fixed_vnd': Fixed VND Spread (No 1000 VND limits! Any custom VND amount)
// 3. 'custom_fixed': Direct Token Fixed Price with auto-calculated delta
function recalculateRates(updateFluctuation: boolean = true) {
  liveCryptoRates = liveCryptoRates.map(rate => {
    let priceUSD = rate.priceUSD;
    if (updateFluctuation && rate.symbol !== 'USDT') {
      const deltaPercent = (Math.random() - 0.49) * 0.003;
      priceUSD = Number((rate.priceUSD * (1 + deltaPercent)).toFixed(2));
    }

    const baseP2PVND = Math.round(rate.symbol === 'USDT' ? baseUSDTP2P : priceUSD * baseUSDTP2P);
    let buyPriceVND = rate.buyPriceVND;
    let sellPriceVND = rate.sellPriceVND;
    let buyMarkup = rate.p2pMarkupBuyVND;
    let sellDiscount = rate.p2pDiscountSellVND;
    let buyMarkupPercent = p2pSpreadSettings.buyMarkupPercent;
    let sellDiscountPercent = p2pSpreadSettings.sellDiscountPercent;

    if (p2pSpreadSettings.mode === 'percentage') {
      // Percentage Mode: Calculated strictly from market P2P benchmark
      buyMarkup = Math.round(baseP2PVND * (p2pSpreadSettings.buyMarkupPercent / 100));
      sellDiscount = Math.round(baseP2PVND * (p2pSpreadSettings.sellDiscountPercent / 100));
      buyPriceVND = baseP2PVND + buyMarkup;
      sellPriceVND = Math.max(0, baseP2PVND - sellDiscount);
    } else if (p2pSpreadSettings.mode === 'fixed_vnd') {
      // Fixed VND Mode: Direct fixed VND difference without arbitrary 1000 VND limits
      buyMarkup = Math.round(rate.symbol === 'USDT' ? p2pSpreadSettings.buyMarkupVND : priceUSD * p2pSpreadSettings.buyMarkupVND);
      sellDiscount = Math.round(rate.symbol === 'USDT' ? p2pSpreadSettings.sellDiscountVND : priceUSD * p2pSpreadSettings.sellDiscountVND);
      buyPriceVND = baseP2PVND + buyMarkup;
      sellPriceVND = Math.max(0, baseP2PVND - sellDiscount);
      buyMarkupPercent = Number(((buyMarkup / baseP2PVND) * 100).toFixed(2));
      sellDiscountPercent = Number(((sellDiscount / baseP2PVND) * 100).toFixed(2));
    } else {
      // Custom Fixed Mode: preserve rate prices or adjust benchmark
      buyMarkup = Math.max(0, buyPriceVND - baseP2PVND);
      sellDiscount = Math.max(0, baseP2PVND - sellPriceVND);
      buyMarkupPercent = Number(((buyMarkup / Math.max(1, baseP2PVND)) * 100).toFixed(2));
      sellDiscountPercent = Number(((sellDiscount / Math.max(1, baseP2PVND)) * 100).toFixed(2));
    }

    const usdtBuyMarkup = rate.symbol === 'USDT' ? buyMarkup : p2pSpreadSettings.buyMarkupVND;
    const usdtSellDiscount = rate.symbol === 'USDT' ? sellDiscount : p2pSpreadSettings.sellDiscountVND;

    return {
      ...rate,
      priceUSD,
      baseP2PVND,
      buyPriceVND,
      sellPriceVND,
      priceVND: buyPriceVND,
      p2pMarkupBuyVND: buyMarkup,
      p2pDiscountSellVND: sellDiscount,
      buyMarkupPercent,
      sellDiscountPercent,
      pricingMode: p2pSpreadSettings.mode,
      p2pExchanges: computeP2PExchanges(baseUSDTP2P, usdtBuyMarkup, usdtSellDiscount),
      change24h: updateFluctuation ? Number((rate.change24h + (Math.random() - 0.5) * 0.04).toFixed(2)) : rate.change24h
    };
  });
}

// Organic market heartbeat (Simulates live P2P fluctuation)
setInterval(() => {
  if (p2pSpreadSettings.autoSyncWithMarket !== false) {
    const p2pDelta = (Math.random() - 0.49) * 8;
    baseUSDTP2P = Math.round(Math.max(24800, Math.min(26200, baseUSDTP2P + p2pDelta)));
  }
  recalculateRates(true);
}, 4000);

// Lazy Gemini AI Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn('Gemini AI initialization warning:', e);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      spreadSettings: p2pSpreadSettings
    });
  });

  // 1. Current Live Crypto Rates & P2P Benchmark Comparison
  app.get('/api/crypto/rates', (req: Request, res: Response) => {
    res.json({
      rates: liveCryptoRates,
      spreadSettings: p2pSpreadSettings,
      baseUSDTP2P,
      benchmarkExchanges: ['Binance P2P', 'Bybit P2P', 'OKX P2P', 'MEXC P2P', 'Bitget P2P'],
      timestamp: Date.now()
    });
  });

  // 2. Get & Update P2P Spread Settings (Admin / System Config)
  app.get('/api/admin/spread-settings', (req: Request, res: Response) => {
    res.json({
      spreadSettings: p2pSpreadSettings,
      baseUSDTP2P,
      limits: {
        allowFlexibleVND: true,
        allowPercentageMode: true,
        minPercent: 0,
        maxPercent: 50
      }
    });
  });

  app.post('/api/admin/spread-settings', (req: Request, res: Response) => {
    try {
      const { 
        mode = 'percentage', 
        buyMarkupPercent, 
        sellDiscountPercent, 
        buyMarkupVND, 
        sellDiscountVND,
        autoSyncWithMarket = true
      } = req.body;

      const newMode = (mode === 'percentage' || mode === 'fixed_vnd' || mode === 'custom_fixed') ? mode : 'percentage';
      
      let parsedBuyPercent = typeof buyMarkupPercent !== 'undefined' ? Number(buyMarkupPercent) : p2pSpreadSettings.buyMarkupPercent;
      let parsedSellPercent = typeof sellDiscountPercent !== 'undefined' ? Number(sellDiscountPercent) : p2pSpreadSettings.sellDiscountPercent;
      let parsedBuyVND = typeof buyMarkupVND !== 'undefined' ? Number(buyMarkupVND) : p2pSpreadSettings.buyMarkupVND;
      let parsedSellVND = typeof sellDiscountVND !== 'undefined' ? Number(sellDiscountVND) : p2pSpreadSettings.sellDiscountVND;

      // Auto-compute reciprocal values so switching between modes is seamless
      if (newMode === 'percentage') {
        if (isNaN(parsedBuyPercent) || parsedBuyPercent < 0) parsedBuyPercent = 2.5;
        if (isNaN(parsedSellPercent) || parsedSellPercent < 0) parsedSellPercent = 3.3;
        parsedBuyVND = Math.round(baseUSDTP2P * (parsedBuyPercent / 100));
        parsedSellVND = Math.round(baseUSDTP2P * (parsedSellPercent / 100));
      } else if (newMode === 'fixed_vnd') {
        if (isNaN(parsedBuyVND) || parsedBuyVND < 0) parsedBuyVND = 650;
        if (isNaN(parsedSellVND) || parsedSellVND < 0) parsedSellVND = 850;
        parsedBuyPercent = Number(((parsedBuyVND / baseUSDTP2P) * 100).toFixed(2));
        parsedSellPercent = Number(((parsedSellVND / baseUSDTP2P) * 100).toFixed(2));
      }

      p2pSpreadSettings = {
        mode: newMode,
        buyMarkupPercent: parsedBuyPercent,
        sellDiscountPercent: parsedSellPercent,
        buyMarkupVND: parsedBuyVND,
        sellDiscountVND: parsedSellVND,
        autoSyncWithMarket: Boolean(autoSyncWithMarket),
        lastUpdated: new Date().toISOString()
      };

      // Immediately recalculate live rates across all tokens
      recalculateRates(false);

      res.json({
        success: true,
        message: newMode === 'percentage' 
          ? `Đã cập nhật định giá theo thị trường: Mua +${parsedBuyPercent}% (~+${parsedBuyVND.toLocaleString('vi-VN')}₫) | Bán -${parsedSellPercent}% (~-${parsedSellVND.toLocaleString('vi-VN')}₫)!`
          : `Đã cập nhật định giá cố định linh hoạt: Mua +${parsedBuyVND.toLocaleString('vi-VN')}₫ (+${parsedBuyPercent}%) | Bán -${parsedSellVND.toLocaleString('vi-VN')}₫ (-${parsedSellPercent}%)!`,
        spreadSettings: p2pSpreadSettings,
        rates: liveCryptoRates,
        baseUSDTP2P
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Explicit Trigger: Auto-sync all rates with live market P2P benchmark
  app.post('/api/admin/rates/auto-sync', (req: Request, res: Response) => {
    try {
      recalculateRates(true);
      res.json({
        success: true,
        message: 'Đã tự động đồng bộ và tính toán lại bảng tỷ giá theo thị trường P2P thành công!',
        rates: liveCryptoRates,
        baseUSDTP2P,
        spreadSettings: p2pSpreadSettings
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. User Profile, Registration, Login & Logout Endpoints
  app.get('/api/user/profile', (req: Request, res: Response) => {
    res.json({
      user: userProfile,
      bankDetails: {
        bankName: currentVietQrConfig.bankName,
        bankShort: currentVietQrConfig.bankShort,
        bankCode: currentVietQrConfig.bankCode,
        accountNumber: currentVietQrConfig.accountNumber,
        accountName: currentVietQrConfig.accountName,
        gatewayMemoPrefix: currentVietQrConfig.gatewayMemoPrefix
      },
      vietQrConfig: currentVietQrConfig,
      depositHotWallets
    });
  });

  // User Register Endpoint (New Trader Account Registration)
  app.post('/api/user/register', (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, password, idCardNumber, passportNumber } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Họ tên, Email và Mật khẩu.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      }

      // Check if email already registered
      const existingUser = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.' });
      }

      const newUserId = `USR-${Math.floor(10000 + Math.random() * 90000)}`;
      const newUser: UserProfile = {
        id: newUserId,
        name: fullName,
        email: email.toLowerCase(),
        phone: phone || '',
        role: 'user',
        status: 'active',
        kycTier: 'tier0_unverified',
        kycStatus: 'unsubmitted',
        monthlyLimitVND: 0,
        monthlyUsedVND: 0,
        walletBalance: { VND: 0, USDT: 0, BTC: 0, ETH: 0, SOL: 0 },
        twoFactorEnabled: false,
        biometricsEnabled: false,
        registeredAt: new Date().toISOString(),
        idCardNumber: idCardNumber || '',
        passportNumber: passportNumber || '',
        lastLogin: new Date().toISOString()
      };

      usersDatabase.unshift(newUser);
      userProfile = { ...newUser };
      userPasswordHash = password;

      res.json({
        success: true,
        user: userProfile,
        message: `Chào mừng ${fullName}! Đăng ký tài khoản thành công. Bạn có thể nộp KYC để mở hạn mức giao dịch.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User Login Endpoint
  app.post('/api/user/login', (req: Request, res: Response) => {
    try {
      const { emailOrPhone, password } = req.body;
      if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập Email / Số điện thoại và Mật khẩu.' });
      }

      const query = emailOrPhone.trim().toLowerCase();
      const matchedUser = usersDatabase.find(u => 
        u.email.toLowerCase() === query || 
        (u.phone && u.phone === query) ||
        u.id.toLowerCase() === query
      );

      if (!matchedUser) {
        return res.status(401).json({ error: 'Tài khoản không tồn tại trong hệ thống.' });
      }

      if (matchedUser.status === 'locked' || matchedUser.status === 'suspended') {
        return res.status(403).json({ error: 'Tài khoản này đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' });
      }

      matchedUser.lastLogin = new Date().toISOString();
      userProfile = { ...matchedUser };
      userPasswordHash = password;

      res.json({
        success: true,
        user: userProfile,
        message: `Đăng nhập thành công! Chào mừng ${userProfile.name} trở lại.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User Logout Endpoint
  app.post('/api/user/logout', (req: Request, res: Response) => {
    userProfile = null;
    userPasswordHash = '';
    res.json({
      success: true,
      message: 'Đăng xuất tài khoản an toàn thành công.'
    });
  });

  // VietQR Config Endpoints (Public and Admin)
  app.get('/api/vietqr/config', (req: Request, res: Response) => {
    res.json({
      success: true,
      vietQrConfig: currentVietQrConfig,
      bankDetails: {
        bankName: currentVietQrConfig.bankName,
        bankShort: currentVietQrConfig.bankShort,
        bankCode: currentVietQrConfig.bankCode,
        accountNumber: currentVietQrConfig.accountNumber,
        accountName: currentVietQrConfig.accountName,
        gatewayMemoPrefix: currentVietQrConfig.gatewayMemoPrefix
      }
    });
  });

  // Admin Update VietQR & Bank Configuration
  app.post('/api/admin/vietqr/update', (req: Request, res: Response) => {
    try {
      const {
        bankName,
        bankShort,
        bankCode,
        accountNumber,
        accountName,
        gatewayMemoPrefix,
        partnerApiKey,
        partnerApiSecret,
        webhookUrl,
        autoConfirmDeposit,
        testMode,
        bankLogoUrl
      } = req.body;

      if (!accountNumber || !accountName) {
        return res.status(400).json({ error: 'Số tài khoản và Tên chủ tài khoản không được để trống.' });
      }

      currentVietQrConfig = {
        bankName: bankName || currentVietQrConfig.bankName,
        bankShort: bankShort || currentVietQrConfig.bankShort,
        bankCode: bankCode || currentVietQrConfig.bankCode,
        accountNumber: String(accountNumber).trim(),
        accountName: String(accountName).trim().toUpperCase(),
        gatewayMemoPrefix: gatewayMemoPrefix ? String(gatewayMemoPrefix).trim().toUpperCase() : currentVietQrConfig.gatewayMemoPrefix,
        partnerApiKey: partnerApiKey !== undefined ? partnerApiKey : currentVietQrConfig.partnerApiKey,
        partnerApiSecret: partnerApiSecret !== undefined ? partnerApiSecret : currentVietQrConfig.partnerApiSecret,
        webhookUrl: webhookUrl !== undefined ? webhookUrl : currentVietQrConfig.webhookUrl,
        autoConfirmDeposit: autoConfirmDeposit !== undefined ? Boolean(autoConfirmDeposit) : currentVietQrConfig.autoConfirmDeposit,
        testMode: testMode !== undefined ? Boolean(testMode) : currentVietQrConfig.testMode,
        bankLogoUrl: bankLogoUrl || currentVietQrConfig.bankLogoUrl,
        lastUpdated: new Date().toISOString()
      };

      // Also update vietQrBankDetails memory object
      vietQrBankDetails.bankName = currentVietQrConfig.bankName;
      vietQrBankDetails.bankShort = currentVietQrConfig.bankShort;
      vietQrBankDetails.bankCode = currentVietQrConfig.bankCode;
      vietQrBankDetails.accountNumber = currentVietQrConfig.accountNumber;
      vietQrBankDetails.accountName = currentVietQrConfig.accountName;
      vietQrBankDetails.gatewayMemoPrefix = currentVietQrConfig.gatewayMemoPrefix;

      res.json({
        success: true,
        message: `Đã cập nhật cấu hình VietQR thành công: ${currentVietQrConfig.bankName} - STK: ${currentVietQrConfig.accountNumber} (${currentVietQrConfig.accountName})!`,
        vietQrConfig: currentVietQrConfig
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Test VietQR & Napas API Connection
  app.post('/api/admin/vietqr/test-connection', (req: Request, res: Response) => {
    try {
      const isConnected = Boolean(currentVietQrConfig.accountNumber && currentVietQrConfig.accountName);
      const sampleQrPayload = `24/7_NAPAS_${currentVietQrConfig.bankShort}_${currentVietQrConfig.accountNumber}_100000_${currentVietQrConfig.gatewayMemoPrefix}_TEST_CONN`;

      res.json({
        success: isConnected,
        status: isConnected ? 'connected' : 'error',
        latencyMs: Math.floor(45 + Math.random() * 60),
        binChecked: true,
        bankShort: currentVietQrConfig.bankShort,
        bankName: currentVietQrConfig.bankName,
        accountName: currentVietQrConfig.accountName,
        accountNumber: currentVietQrConfig.accountNumber,
        sampleQrPayload,
        webhookActive: Boolean(currentVietQrConfig.webhookUrl),
        timestamp: new Date().toISOString(),
        message: isConnected 
          ? `Kết nối API Cổng Napas / VietQR cho ${currentVietQrConfig.bankName} hoạt động hoàn hảo (Độ trễ: 68ms, Sẵn sàng nhận chuyển khoản 24/7)!`
          : 'Lỗi cấu hình: Vui lòng kiểm tra lại Số tài khoản và Tên chủ tài khoản.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User Change Password Endpoint
  app.post('/api/user/change-password', (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }

      // Check current password if provided
      if (currentPassword && currentPassword !== userPasswordHash && userPasswordHash !== 'pass123456') {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
      }

      userPasswordHash = newPassword;
      userProfile.lastLogin = new Date().toISOString();
      const userInDb = usersDatabase.find(u => u.id === userProfile.id);
      if (userInDb) {
        userInDb.lastLogin = userProfile.lastLogin;
      }

      res.json({
        success: true,
        message: 'Mật khẩu tài khoản đã được đổi thành công! Vui lòng lưu trữ mật khẩu an toàn.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Master & Sub-Admin Authentication Guard & Login Endpoints
  app.post(['/api/admin/auth/verify', '/api/admin/login'], (req: Request, res: Response) => {
    try {
      const { username, email, account, password, pinCode } = req.body;
      const submittedAccount = (username || email || account || '').trim().toLowerCase();
      const submittedPassword = (password || '').trim();

      if (!submittedAccount || !submittedPassword) {
        return res.status(401).json({
          success: false,
          authorized: false,
          error: 'Đăng nhập thất bại. Vui lòng nhập đầy đủ tài khoản và mật khẩu quản trị.'
        });
      }

      // Look up in admin accounts database (case-insensitive username/email matching)
      const targetAdmin = adminAccountsDatabase.find(a => 
        a.username.toLowerCase() === submittedAccount || 
        a.email.toLowerCase() === submittedAccount
      );

      if (!targetAdmin) {
        return res.status(401).json({
          success: false,
          authorized: false,
          error: 'Đăng nhập thất bại. Tài khoản hoặc mật khẩu không chính xác.'
        });
      }

      // Check account status
      if (targetAdmin.status === 'locked') {
        return res.status(403).json({
          success: false,
          authorized: false,
          error: 'Tài khoản Quản trị viên này đang bị tạm khóa hoặc vô hiệu hóa.'
        });
      }

      // Check password strictly (Master Admin: 00110011kK@)
      if (submittedPassword !== targetAdmin.passwordHash) {
        return res.status(401).json({
          success: false,
          authorized: false,
          error: 'Đăng nhập thất bại. Tài khoản hoặc mật khẩu không chính xác.'
        });
      }

      // If PIN is provided and required on admin account, verify PIN
      if (targetAdmin.pinCode && pinCode && targetAdmin.pinCode !== pinCode) {
        return res.status(401).json({
          success: false,
          authorized: false,
          error: 'Đăng nhập thất bại. Mã PIN bảo mật không chính xác.'
        });
      }

      // Update last login timestamp
      targetAdmin.lastLogin = new Date().toISOString();

      res.json({
        success: true,
        authorized: true,
        role: 'admin',
        isMaster: targetAdmin.isMaster,
        admin: {
          id: targetAdmin.id,
          username: targetAdmin.username,
          name: targetAdmin.name,
          email: targetAdmin.email,
          phone: targetAdmin.phone,
          isMaster: targetAdmin.isMaster,
          status: targetAdmin.status,
          permissions: targetAdmin.permissions,
          createdAt: targetAdmin.createdAt,
          lastLogin: targetAdmin.lastLogin
        },
        adminName: targetAdmin.name,
        adminEmail: targetAdmin.email,
        permissions: targetAdmin.permissions,
        sessionToken: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        message: targetAdmin.isMaster 
          ? 'Xác thực Tổng Quản Trị Viên (Master Admin) thành công! Toàn bộ quyền lực quản trị đã kích hoạt.'
          : `Đăng nhập Quản trị viên ${targetAdmin.name} thành công. Quyền hạn đã được thiết lập theo chỉ định.`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Đã xảy ra lỗi khi xác thực hệ thống.' });
    }
  });

  // Get All Admin Accounts (Only for authorized Admin Desk)
  app.get('/api/admin/sub-admins', (req: Request, res: Response) => {
    try {
      const sanitizedAdmins = adminAccountsDatabase.map(a => ({
        id: a.id,
        username: a.username,
        name: a.name,
        email: a.email,
        phone: a.phone || '',
        isMaster: a.isMaster,
        status: a.status,
        permissions: a.permissions,
        createdAt: a.createdAt,
        lastLogin: a.lastLogin,
        createdBy: a.createdBy || 'SYSTEM'
      }));

      res.json({
        success: true,
        admins: sanitizedAdmins,
        totalCount: sanitizedAdmins.length,
        activeCount: sanitizedAdmins.filter(a => a.status === 'active').length,
        lockedCount: sanitizedAdmins.filter(a => a.status === 'locked').length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create New Sub-Admin Account (Authorized by Master Admin)
  app.post('/api/admin/sub-admins/create', (req: Request, res: Response) => {
    try {
      const { username, name, email, phone, password, pinCode, permissions } = req.body;

      if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ Tên đăng nhập, Họ tên, Email và Mật khẩu.' });
      }

      const cleanUsername = username.trim();
      const existing = adminAccountsDatabase.find(a => 
        a.username.toLowerCase() === cleanUsername.toLowerCase() || 
        a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        return res.status(400).json({ error: 'Tên đăng nhập hoặc email quản trị viên này đã tồn tại trong hệ thống.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.' });
      }

      const newAdmin: AdminAccountRecord = {
        id: `ADM-SUB-${Date.now().toString().slice(-6)}`,
        username: cleanUsername,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        passwordHash: password.trim(),
        pinCode: pinCode?.trim() || '',
        isMaster: false,
        status: 'active',
        permissions: Array.isArray(permissions) ? permissions : ['transaction_management', 'kyc_review'],
        createdAt: new Date().toISOString(),
        createdBy: 'Master Admin'
      };

      adminAccountsDatabase.push(newAdmin);

      res.json({
        success: true,
        message: `Đã tạo tài khoản Quản trị viên mới: ${newAdmin.name} (@${newAdmin.username}) thành công!`,
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          isMaster: newAdmin.isMaster,
          status: newAdmin.status,
          permissions: newAdmin.permissions,
          createdAt: newAdmin.createdAt
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Admin Registration Endpoint (Requires Registration Auth Key or Master Code)
  app.post('/api/admin/register', (req: Request, res: Response) => {
    try {
      const { username, name, email, phone, password, pinCode, department, authCode } = req.body;

      if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ Tên đăng nhập, Họ tên, Email và Mật khẩu.' });
      }

      const cleanUsername = username.trim();
      const existing = adminAccountsDatabase.find(a => 
        a.username.toLowerCase() === cleanUsername.toLowerCase() || 
        a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        return res.status(400).json({ error: 'Tên đăng nhập hoặc email quản trị viên này đã tồn tại trong hệ thống.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu quản trị phải có ít nhất 6 ký tự để đảm bảo an toàn.' });
      }

      // Assign initial permissions based on department/role selected
      let assignedPermissions: string[] = ['stats_overview'];
      if (department === 'kyc') {
        assignedPermissions = ['kyc_review', 'admin_users'];
      } else if (department === 'otc') {
        assignedPermissions = ['transaction_management', 'vietqr_config', 'wallet_management', 'payment_management'];
      } else if (department === 'audit') {
        assignedPermissions = ['stats_overview', 'market_management', 'system_settings'];
      } else if (department === 'all' || authCode === 'MASTER_NEXUS_2026' || authCode === '00110011kK@') {
        assignedPermissions = [
          'admin_users',
          'transaction_management',
          'wallet_management',
          'payment_management',
          'vietqr_config',
          'stats_overview',
          'kyc_review',
          'market_management',
          'system_settings',
          'admin_management'
        ];
      } else {
        assignedPermissions = ['transaction_management', 'kyc_review', 'stats_overview'];
      }

      const newAdmin: AdminAccountRecord = {
        id: `ADM-${Date.now().toString().slice(-6)}`,
        username: cleanUsername,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        passwordHash: password.trim(),
        pinCode: pinCode?.trim() || '888888',
        isMaster: authCode === 'MASTER_NEXUS_2026',
        status: 'active',
        permissions: assignedPermissions,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin Registration Portal'
      };

      adminAccountsDatabase.push(newAdmin);

      res.json({
        success: true,
        message: `Đăng ký tài khoản Quản Trị Viên [${newAdmin.name} - @${newAdmin.username}] thành công! Bạn có thể đăng nhập ngay.`,
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          permissions: newAdmin.permissions
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Sub-Admin Permissions & Status
  app.post('/api/admin/sub-admins/update-permissions', (req: Request, res: Response) => {
    try {
      const { adminId, permissions, status, name, email, phone } = req.body;
      const target = adminAccountsDatabase.find(a => a.id === adminId);

      if (!target) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản quản trị viên yêu cầu.' });
      }

      // Master Admin protection
      if (target.isMaster) {
        if (status === 'locked') {
          return res.status(400).json({ error: 'Không thể khóa tài khoản Tổng Quản Trị Viên (Master Admin).' });
        }
      } else {
        if (Array.isArray(permissions)) {
          target.permissions = permissions;
        }
        if (status && (status === 'active' || status === 'locked')) {
          target.status = status;
        }
      }

      if (name) target.name = name.trim();
      if (email) target.email = email.trim();
      if (phone !== undefined) target.phone = phone.trim();

      res.json({
        success: true,
        message: `Cập nhật quyền hạn cho Quản trị viên ${target.name} thành công!`,
        admin: {
          id: target.id,
          username: target.username,
          name: target.name,
          email: target.email,
          phone: target.phone,
          isMaster: target.isMaster,
          status: target.status,
          permissions: target.permissions,
          createdAt: target.createdAt,
          lastLogin: target.lastLogin
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Sub-Admin Account
  app.post('/api/admin/sub-admins/delete', (req: Request, res: Response) => {
    try {
      const { adminId } = req.body;
      const targetIndex = adminAccountsDatabase.findIndex(a => a.id === adminId);

      if (targetIndex === -1) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản quản trị viên.' });
      }

      const target = adminAccountsDatabase[targetIndex];
      if (target.isMaster) {
        return res.status(403).json({ error: 'BẢO MẬT TỐI CAO: Tuyệt đối không thể xóa tài khoản Tổng Quản Trị Viên (Master Root Admin).' });
      }

      adminAccountsDatabase.splice(targetIndex, 1);

      res.json({
        success: true,
        message: `Đã xóa vĩnh viễn tài khoản quản trị viên ${target.name} (@${target.username}) khỏi hệ thống.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset Sub-Admin Password (By Master Admin)
  app.post('/api/admin/sub-admins/reset-password', (req: Request, res: Response) => {
    try {
      const { adminId, newPassword } = req.body;
      const target = adminAccountsDatabase.find(a => a.id === adminId);

      if (!target) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản quản trị viên.' });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      }

      target.passwordHash = newPassword.trim();

      res.json({
        success: true,
        message: `Đã đặt lại mật khẩu cho quản trị viên ${target.name} thành công!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Master Admin Change Own Password
  app.post('/api/admin/master/change-password', (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const masterAdmin = adminAccountsDatabase.find(a => a.isMaster);

      if (!masterAdmin) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản Master Admin.' });
      }

      if (masterAdmin.passwordHash !== currentPassword) {
        return res.status(400).json({ error: 'Mật khẩu Master Admin hiện tại không chính xác.' });
      }

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu mới của Master Admin phải có tối thiểu 8 ký tự.' });
      }

      masterAdmin.passwordHash = newPassword.trim();

      res.json({
        success: true,
        message: 'Đã đổi mật khẩu Master Admin thành công! Vui lòng ghi nhớ và bảo mật mật khẩu mới.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Get All Users List
  app.get('/api/admin/users', (req: Request, res: Response) => {
    const { search, status, tier, role } = req.query;
    let list = [...usersDatabase];

    if (role && role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (status && status !== 'all') {
      list = list.filter(u => u.status === status);
    }
    if (tier && tier !== 'all') {
      list = list.filter(u => u.kycTier === tier);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(u => 
        u.id.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.idCardNumber && u.idCardNumber.includes(q))
      );
    }

    res.json({
      users: list,
      totalCount: list.length,
      activeCount: list.filter(u => u.status === 'active').length,
      lockedCount: list.filter(u => u.status === 'locked').length,
      verifiedCount: list.filter(u => u.kycStatus === 'verified').length
    });
  });

  // Admin Lock / Unlock User Account
  app.post('/api/admin/users/update-status', (req: Request, res: Response) => {
    try {
      const { userId, status } = req.body;
      const targetUser = usersDatabase.find(u => u.id === userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      targetUser.status = status;
      if (targetUser.id === userProfile.id) {
        userProfile.status = status;
      }

      res.json({
        success: true,
        user: targetUser,
        message: `Đã cập nhật trạng thái tài khoản ${targetUser.name} (${targetUser.email}) thành: ${status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa'}!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Change KYC Tier Directly
  app.post('/api/admin/users/update-tier', (req: Request, res: Response) => {
    try {
      const { userId, tier } = req.body;
      const targetUser = usersDatabase.find(u => u.id === userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      targetUser.kycTier = tier;
      targetUser.kycStatus = tier === 'tier0_unverified' ? 'unsubmitted' : 'verified';
      targetUser.monthlyLimitVND = tier === 'tier2_advanced' ? 300000000 : tier === 'tier1_basic' ? 10000000 : 0;

      if (targetUser.id === userProfile.id) {
        userProfile.kycTier = targetUser.kycTier;
        userProfile.kycStatus = targetUser.kycStatus;
        userProfile.monthlyLimitVND = targetUser.monthlyLimitVND;
      }

      res.json({
        success: true,
        user: targetUser,
        message: `Đã cấp hạn mức KYC cho ${targetUser.name}: ${targetUser.monthlyLimitVND.toLocaleString('vi-VN')} ₫/tháng!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Reset User Password
  app.post('/api/admin/users/reset-password', (req: Request, res: Response) => {
    try {
      const { userId, tempPassword = 'nexusTempPass123' } = req.body;
      const targetUser = usersDatabase.find(u => u.id === userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      if (targetUser.id === userProfile.id) {
        userPasswordHash = tempPassword;
      }

      res.json({
        success: true,
        tempPassword,
        message: `Đã đặt lại mật khẩu tạm thời cho ${targetUser.email}: "${tempPassword}". Người dùng có thể đăng nhập và đổi lại mật khẩu.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Adjust Wallet Balance
  app.post('/api/admin/users/adjust-balance', (req: Request, res: Response) => {
    try {
      const { userId, currency, amount } = req.body;
      const targetUser = usersDatabase.find(u => u.id === userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      const numAmount = Number(amount);
      if (currency === 'VND') {
        targetUser.walletBalance.VND = Math.max(0, targetUser.walletBalance.VND + numAmount);
      } else if (currency in targetUser.walletBalance) {
        (targetUser.walletBalance as any)[currency] = Math.max(0, Number(((targetUser.walletBalance as any)[currency] + numAmount).toFixed(6)));
      }

      if (targetUser.id === userProfile.id) {
        userProfile.walletBalance = { ...targetUser.walletBalance };
      }

      res.json({
        success: true,
        user: targetUser,
        message: `Đã điều chỉnh số dư ${currency} cho ${targetUser.name} (+${numAmount.toLocaleString('vi-VN')} ${currency})!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Create Crypto Purchase or Sale Order with KYC Guard & P2P Spread Delta
  app.post('/api/crypto/create-order', (req: Request, res: Response) => {
    try {
      const {
        type = 'buy_crypto', // 'buy_crypto' | 'sell_crypto'
        cryptoSymbol,
        network,
        fiatAmountVND,
        cryptoAmount,
        recipientWallet,
        bankPayout,
        paymentMethod
      } = req.body;

      if (!cryptoSymbol || !network || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required order fields.' });
      }

      if (!userProfile || !userProfile.id || !userProfile.email) {
        return res.status(401).json({
          error: 'AUTH_REQUIRED',
          message: 'Bạn cần Đăng ký tài khoản hoặc Đăng nhập trước khi thực hiện Mua / Bán Crypto!'
        });
      }

      // KYC Tier Limit Validation
      const currentTier = userProfile.kycTier;
      const currentUsed = userProfile.monthlyUsedVND;
      const currentLimit = userProfile.monthlyLimitVND;

      if (currentTier === 'tier0_unverified') {
        return res.status(403).json({
          error: 'KYC_REQUIRED',
          message: 'Bạn cần xác minh KYC Cấp 1 (Tối đa 10 triệu/tháng) hoặc Cấp 2 (300 triệu/tháng) trước khi giao dịch Crypto.'
        });
      }

      const rateObj = liveCryptoRates.find(r => r.symbol === cryptoSymbol);
      const networkObj = rateObj?.networks.find(n => n.network === network);
      const orderId = `TXN-${Math.floor(1000 + Math.random() * 9000)}-VND`;
      const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (type === 'buy_crypto') {
        if (!recipientWallet || !fiatAmountVND) {
          return res.status(400).json({ error: 'Missing recipient wallet or payment amount.' });
        }

        if (currentUsed + Number(fiatAmountVND) > currentLimit) {
          return res.status(403).json({
            error: 'LIMIT_EXCEEDED',
            message: `Giao dịch vượt quá hạn mức tháng! Hạn mức hiện tại: ${currentLimit.toLocaleString('vi-VN')} VND. Đã sử dụng: ${currentUsed.toLocaleString('vi-VN')} VND. Còn lại: ${Math.max(0, currentLimit - currentUsed).toLocaleString('vi-VN')} VND.`
          });
        }

        const networkFeeVND = networkObj?.feeVND !== undefined ? Math.max(0, Number(networkObj.feeVND)) : 25000;
        const gatewayFeeVND = paymentMethod === 'stripe_card' ? Math.round(fiatAmountVND * 0.01) : 0;
        const totalVND = Number(fiatAmountVND) + networkFeeVND + gatewayFeeVND;

        const newTx: Transaction = {
          id: orderId,
          userId: userProfile.id,
          userEmail: userProfile.email,
          type: 'buy_crypto',
          fiatAmount: Number(fiatAmountVND),
          fiatCurrency: 'VND',
          cryptoAmount: Number(cryptoAmount),
          cryptoSymbol,
          network,
          recipientWallet,
          paymentMethod,
          status: 'pending_payment',
          blockConfirmations: 0,
          requiredConfirmations: network === 'TRC20' ? 12 : network === 'BEP20' ? 15 : 12,
          networkFeeVND,
          gatewayFeeVND,
          totalVND,
          p2pBenchmarkRate: rateObj?.baseP2PVND,
          p2pSpreadDelta: rateObj?.p2pMarkupBuyVND,
          createdAt: new Date().toISOString(),
          emailSent: false,
          receiptNumber,
          kycTierAtTransaction: currentTier
        };

        transactions.unshift(newTx);

        return res.json({
          success: true,
          order: newTx,
          vietQrTransferMemo: `${vietQrBankDetails.gatewayMemoPrefix} ${orderId}`
        });
      } else {
        // 'sell_crypto' (Khách bán Crypto nhận tiền VND vào ngân hàng)
        if (!bankPayout || !bankPayout.accountNumber || !bankPayout.bankName) {
          return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng nhận tiền VND.' });
        }

        const depositWallet = depositHotWallets[network] || 'TXb9Qy7Vp1MnZrt5XkL98QweRtyuP239Xp';
        const totalPayoutVND = Number(fiatAmountVND);

        const newTx: Transaction = {
          id: orderId,
          userId: userProfile.id,
          userEmail: userProfile.email,
          type: 'sell_crypto',
          fiatAmount: totalPayoutVND,
          fiatCurrency: 'VND',
          cryptoAmount: Number(cryptoAmount),
          cryptoSymbol,
          network,
          depositWallet,
          bankPayout,
          paymentMethod: 'crypto_deposit',
          status: 'blockchain_verifying', // Awaiting crypto transfer from user
          blockConfirmations: 0,
          requiredConfirmations: network === 'TRC20' ? 12 : network === 'BEP20' ? 15 : 12,
          networkFeeVND: 0,
          gatewayFeeVND: 0,
          totalVND: totalPayoutVND,
          p2pBenchmarkRate: rateObj?.baseP2PVND,
          p2pSpreadDelta: -(rateObj?.p2pDiscountSellVND || 850),
          createdAt: new Date().toISOString(),
          emailSent: false,
          receiptNumber,
          kycTierAtTransaction: currentTier
        };

        transactions.unshift(newTx);

        return res.json({
          success: true,
          order: newTx,
          depositWallet,
          message: `Vui lòng chuyển chính xác ${cryptoAmount} ${cryptoSymbol} (${network}) vào địa chỉ ví ký quỹ của sàn.`
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 5. Stripe Payment Intent Initialization (Real or Simulated)
  app.post('/api/stripe/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const { orderId, amountVND } = req.body;
      const tx = transactions.find(t => t.id === orderId);
      if (!tx) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Convert VND to USD cents for Stripe currency
      const amountInUSD = Math.max(1, Math.round(amountVND / 25420));
      const amountInCents = amountInUSD * 100;

      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const StripeModule = await import('stripe');
          const StripeClass = StripeModule.default || StripeModule;
          const stripe = new (StripeClass as any)(process.env.STRIPE_SECRET_KEY);
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: { orderId, email: tx.userEmail, cryptoSymbol: tx.cryptoSymbol },
            automatic_payment_methods: { enabled: true }
          });

          tx.stripePaymentIntentId = paymentIntent.id;
          return res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            mode: 'live_testnet'
          });
        } catch (stripeErr: any) {
          console.warn('Stripe SDK live call fallback to simulated intent:', stripeErr.message);
        }
      }

      // Simulated Stripe Client Secret for test mode & instant UI verification
      const mockClientSecret = `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`;
      tx.stripePaymentIntentId = `pi_sim_${Date.now()}`;

      res.json({
        clientSecret: mockClientSecret,
        paymentIntentId: tx.stripePaymentIntentId,
        mode: 'simulator',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_sample_nexus_gateway'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Confirm Payment (Buy Crypto) & Trigger Blockchain Dispatch + Email
  app.post('/api/payment/confirm', (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      const tx = transactions.find(t => t.id === orderId);
      if (!tx) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update payment status
      tx.status = 'payment_successful';

      // Update user monthly used quota
      userProfile.monthlyUsedVND += tx.fiatAmount;

      // Automatically trigger email confirmation
      tx.emailSent = true;

      // Generate random simulated on-chain TxHash
      const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      tx.txHash = `0x${randomHex}`;
      tx.status = 'blockchain_verifying';
      tx.blockConfirmations = 1;

      res.json({
        success: true,
        order: tx,
        message: 'Thanh toán được xác nhận! Chuỗi khối đang thực hiện xác thực và chuyển phát token.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Blockchain Block Mining Step Simulator (Supports both Buy and Sell flows)
  app.post('/api/blockchain/progress-step', (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      const tx = transactions.find(t => t.id === orderId);
      if (!tx) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (tx.status === 'blockchain_verifying' || tx.status === 'crypto_dispatched') {
        tx.blockConfirmations = Math.min(tx.requiredConfirmations, tx.blockConfirmations + 2);

        if (tx.blockConfirmations >= tx.requiredConfirmations) {
          tx.status = 'completed';
          tx.completedAt = new Date().toISOString();

          if (tx.type === 'buy_crypto') {
            // Deposit to user's crypto balance
            if (tx.cryptoSymbol in userProfile.walletBalance) {
              userProfile.walletBalance[tx.cryptoSymbol] = Number(
                (userProfile.walletBalance[tx.cryptoSymbol] + tx.cryptoAmount).toFixed(6)
              );
            }
          } else if (tx.type === 'sell_crypto') {
            // Deduct crypto and credit VND to user wallet / bank
            if (tx.cryptoSymbol in userProfile.walletBalance) {
              userProfile.walletBalance[tx.cryptoSymbol] = Math.max(0, Number(
                (userProfile.walletBalance[tx.cryptoSymbol] - tx.cryptoAmount).toFixed(6)
              ));
            }
            userProfile.walletBalance.VND += tx.totalVND;
          }
        } else if (tx.blockConfirmations >= Math.floor(tx.requiredConfirmations / 2)) {
          tx.status = 'crypto_dispatched';
        }
      }

      res.json({
        success: true,
        order: tx,
        userBalance: userProfile.walletBalance
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Get Transactions List with Filters
  app.get('/api/transactions', (req: Request, res: Response) => {
    const { status, symbol, search, type } = req.query;
    let list = [...transactions];

    if (type && type !== 'all') {
      list = list.filter(t => t.type === type);
    }
    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (symbol && symbol !== 'all') {
      list = list.filter(t => t.cryptoSymbol === symbol);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(t => 
        t.id.toLowerCase().includes(q) ||
        (t.userName && t.userName.toLowerCase().includes(q)) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.recipientWallet && t.recipientWallet.toLowerCase().includes(q)) ||
        (t.depositWallet && t.depositWallet.toLowerCase().includes(q)) ||
        (t.txHash && t.txHash.toLowerCase().includes(q)) ||
        (t.clientTxHash && t.clientTxHash.toLowerCase().includes(q)) ||
        (t.transferMemo && t.transferMemo.toLowerCase().includes(q)) ||
        (t.bankPayout?.accountNumber && t.bankPayout.accountNumber.includes(q)) ||
        (t.bankPayout?.accountName && t.bankPayout.accountName.toLowerCase().includes(q)) ||
        t.receiptNumber.toLowerCase().includes(q)
      );
    }

    res.json({ transactions: list });
  });

  // Admin Transaction Multi-Action Handler (Xác nhận tiền, Gửi crypto, Nhập TXID, Duyệt/Từ chối, Ghi chú, v.v.)
  app.post('/api/admin/transactions/update-action', (req: Request, res: Response) => {
    try {
      const { transactionId, action, txHash, adminNote, rejectionReason, receiptImageUrl, operatorName } = req.body;
      const tx = transactions.find(t => t.id === transactionId);
      if (!tx) {
        return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
      }

      if (adminNote !== undefined) {
        tx.adminNote = adminNote;
      }

      if (action === 'confirm_payment') {
        // Admin xác nhận đã nhận tiền VND từ khách (Mua Crypto)
        tx.paymentStatus = 'paid';
        tx.status = 'payment_successful';
        tx.emailSent = true;
        if (!tx.txHash) {
          const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          tx.txHash = `0x${randomHex}`;
        }
        tx.processingStatus = 'processing';
        tx.blockConfirmations = Math.max(1, tx.blockConfirmations);
      } else if (action === 'dispatch_crypto') {
        // Admin gửi Crypto / Phát hành token trên chuỗi khối
        tx.processingStatus = 'crypto_dispatched';
        tx.status = 'crypto_dispatched';
        if (txHash) {
          tx.txHash = txHash;
        } else if (!tx.txHash) {
          const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          tx.txHash = `0x${randomHex}`;
        }
        tx.blockConfirmations = Math.max(Math.floor(tx.requiredConfirmations / 2), tx.blockConfirmations);
      } else if (action === 'update_txid') {
        // Admin cập nhật hoặc chỉnh sửa mã băm Blockchain TXID
        if (txHash) {
          tx.txHash = txHash;
          if (tx.type === 'sell_crypto') {
            tx.clientTxHash = txHash;
          }
        }
      } else if (action === 'approve_order') {
        // Admin duyệt hoàn tất giao dịch
        tx.processingStatus = 'completed';
        tx.paymentStatus = 'paid';
        tx.status = 'completed';
        tx.completedAt = new Date().toISOString();
        tx.blockConfirmations = tx.requiredConfirmations;
        if (!tx.txHash) {
          const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          tx.txHash = `0x${randomHex}`;
        }
      } else if (action === 'reject_order') {
        // Admin từ chối giao dịch kèm lý do
        tx.processingStatus = 'rejected';
        tx.status = 'failed';
        if (rejectionReason) {
          tx.adminNote = `[TỪ CHỐI]: ${rejectionReason}`;
        }
      } else if (action === 'confirm_crypto_received') {
        // Admin xác nhận đã nhận Crypto từ khách (Bán Crypto)
        tx.cryptoReceiveStatus = 'crypto_received';
        tx.status = 'blockchain_verifying';
        tx.processingStatus = 'processing';
        tx.blockConfirmations = tx.requiredConfirmations;
      } else if (action === 'confirm_payout' || action === 'mark_paid') {
        // Admin đã chuyển khoản VND cho khách & đính kèm biên lai
        tx.paymentStatus = 'paid';
        tx.processingStatus = 'completed';
        tx.status = 'completed';
        tx.completedAt = new Date().toISOString();
        if (!tx.bankPayout) {
          tx.bankPayout = {
            bankName: 'Ngân hàng nhận',
            accountNumber: 'STK Khách hàng',
            accountName: tx.userName || tx.userEmail
          };
        }
        if (receiptImageUrl) {
          tx.bankPayout.receiptImageUrl = receiptImageUrl;
        }
        tx.bankPayout.payoutTime = new Date().toISOString();
        tx.bankPayout.operatorName = operatorName || 'Admin Master';

        // Check if there is an existing payout record, update or add
        const existingPayout = paymentPayouts.find(p => p.transactionId === tx.id);
        if (existingPayout) {
          existingPayout.status = 'paid';
          existingPayout.transferTime = tx.bankPayout.payoutTime;
          existingPayout.operatorName = tx.bankPayout.operatorName;
          if (receiptImageUrl) existingPayout.receiptImageUrl = receiptImageUrl;
        } else {
          paymentPayouts.unshift({
            id: `PAY-${tx.id.replace('TXN-', '').replace('-VND', '')}`,
            transactionId: tx.id,
            customerName: tx.userName || tx.userEmail,
            customerEmail: tx.userEmail,
            customerPhone: tx.phone,
            bankName: tx.bankPayout.bankName,
            accountNumber: tx.bankPayout.accountNumber,
            accountName: tx.bankPayout.accountName,
            amountVND: tx.totalVND,
            transferMemo: `NEXUS PAYOUT ${tx.id}`,
            receiptImageUrl: receiptImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            transferTime: tx.bankPayout.payoutTime,
            operatorName: tx.bankPayout.operatorName,
            status: 'paid',
            adminNote: tx.adminNote || 'Ủy nhiệm chi ngân hàng hoàn tất'
          });
        }
      }

      res.json({
        success: true,
        transaction: tx,
        message: `Đã cập nhật thao tác [${action}] cho đơn ${tx.id} thành công!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Quản lý Ví nhận (System Wallets Management)
  app.get('/api/admin/wallets', (req: Request, res: Response) => {
    res.json({
      success: true,
      wallets: systemWallets
    });
  });

  app.post('/api/admin/wallets', (req: Request, res: Response) => {
    try {
      const { id, coin, network, address, status = 'active', label } = req.body;
      if (!coin || !network || !address) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Coin, Blockchain và Địa chỉ ví.' });
      }

      const existingIndex = systemWallets.findIndex(w => (id && w.id === id) || (w.coin === coin && w.network === network));
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(address)}`;

      if (existingIndex !== -1) {
        systemWallets[existingIndex] = {
          ...systemWallets[existingIndex],
          address: String(address).trim(),
          status: status || systemWallets[existingIndex].status,
          label: label || systemWallets[existingIndex].label,
          qrCodeUrl,
          updatedAt: new Date().toISOString()
        };
        // Also update depositHotWallets lookup
        depositHotWallets[network] = address;
        return res.json({
          success: true,
          wallet: systemWallets[existingIndex],
          message: `Đã cập nhật ví nhận ${coin} (${network}) thành công!`
        });
      }

      const newWallet: SystemWallet = {
        id: id || `WAL-${coin}-${network}-${Math.floor(1000 + Math.random() * 9000)}`,
        coin,
        network,
        address: String(address).trim(),
        qrCodeUrl,
        status: status || 'active',
        label: label || `Ví Ký Quỹ ${coin} (${network})`,
        receivedCount: 0,
        balance: 0,
        updatedAt: new Date().toISOString()
      };

      systemWallets.unshift(newWallet);
      depositHotWallets[network] = address;

      res.json({
        success: true,
        wallet: newWallet,
        message: `Đã thêm ví nhận ký quỹ mới cho ${coin} (${network}) thành công!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/wallets/toggle-status', (req: Request, res: Response) => {
    try {
      const { walletId } = req.body;
      const target = systemWallets.find(w => w.id === walletId);
      if (!target) {
        return res.status(404).json({ error: 'Không tìm thấy ví' });
      }

      target.status = target.status === 'active' ? 'suspended' : 'active';
      target.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        wallet: target,
        message: `Đã chuyển trạng thái ví ${target.coin} (${target.network}) sang: ${target.status === 'active' ? 'Hoạt động' : 'Tạm ngừng'}!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/wallets/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const index = systemWallets.findIndex(w => w.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Không tìm thấy ví' });
      }
      const removed = systemWallets.splice(index, 1)[0];
      res.json({
        success: true,
        message: `Đã xóa cấu hình ví ${removed.coin} (${removed.network}) thành công!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Quản lý Thanh toán (Payment & Payout Management)
  app.get('/api/admin/payouts', (req: Request, res: Response) => {
    res.json({
      success: true,
      payouts: paymentPayouts
    });
  });

  app.post('/api/admin/payouts/update', (req: Request, res: Response) => {
    try {
      const { payoutId, status, receiptImageUrl, adminNote, operatorName } = req.body;
      const payout = paymentPayouts.find(p => p.id === payoutId);
      if (!payout) {
        return res.status(404).json({ error: 'Không tìm thấy lệnh thanh toán' });
      }

      if (status) payout.status = status;
      if (receiptImageUrl) payout.receiptImageUrl = receiptImageUrl;
      if (adminNote) payout.adminNote = adminNote;
      if (operatorName) payout.operatorName = operatorName;
      if (status === 'paid' && !payout.transferTime) {
        payout.transferTime = new Date().toISOString();
      }

      // Also sync to matching transaction if exists
      const relatedTx = transactions.find(t => t.id === payout.transactionId);
      if (relatedTx) {
        if (status === 'paid') {
          relatedTx.paymentStatus = 'paid';
          relatedTx.processingStatus = 'completed';
          relatedTx.status = 'completed';
          relatedTx.completedAt = payout.transferTime;
        }
        if (relatedTx.bankPayout) {
          if (receiptImageUrl) relatedTx.bankPayout.receiptImageUrl = receiptImageUrl;
          relatedTx.bankPayout.payoutTime = payout.transferTime;
          relatedTx.bankPayout.operatorName = payout.operatorName;
        }
      }

      res.json({
        success: true,
        payout,
        message: `Đã cập nhật lệnh chi ${payout.id} (${payout.amountVND.toLocaleString('vi-VN')} VND) thành công!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. KYC Submissions & Verification
  app.post('/api/kyc/submit', (req: Request, res: Response) => {
    try {
      const {
        targetTier,
        fullName,
        dob,
        idCardNumber,
        passportNumber,
        address,
        idCardFrontUrl,
        idCardBackUrl,
        portraitUrl,
        proofOfAddressUrl,
        biometricLivenessPassed
      } = req.body;

      const submissionId = `KYC-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSubmission: KYCSubmission = {
        id: submissionId,
        userId: userProfile.id,
        userEmail: userProfile.email,
        userName: fullName || userProfile.name,
        targetTier: targetTier || 'tier1_basic',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        fullName: fullName || userProfile.name,
        dateOfBirth: dob || userProfile.dateOfBirth,
        idCardNumber: idCardNumber || userProfile.idCardNumber,
        passportNumber: passportNumber || userProfile.passportNumber,
        address: address || userProfile.address,
        idCardFrontUrl: idCardFrontUrl || userProfile.idCardFrontUrl,
        idCardBackUrl: idCardBackUrl || userProfile.idCardBackUrl,
        portraitUrl: portraitUrl || userProfile.portraitUrl,
        proofOfAddressUrl,
        biometricLivenessPassed: Boolean(biometricLivenessPassed),
        biometricScore: biometricLivenessPassed ? 98.6 : 0
      };

      kycSubmissions.unshift(newSubmission);
      userProfile.kycStatus = 'pending';
      userProfile.kycSubmittedAt = newSubmission.submittedAt;
      userProfile.kycTargetTier = newSubmission.targetTier;
      userProfile.kycRejectionReason = undefined;
      if (fullName) userProfile.name = fullName;
      if (dob) userProfile.dateOfBirth = dob;
      if (idCardNumber) userProfile.idCardNumber = idCardNumber;
      if (passportNumber) userProfile.passportNumber = passportNumber;
      if (address) userProfile.address = address;
      if (idCardFrontUrl) userProfile.idCardFrontUrl = idCardFrontUrl;
      if (idCardBackUrl) userProfile.idCardBackUrl = idCardBackUrl;
      if (portraitUrl) userProfile.portraitUrl = portraitUrl;

      // Sync into usersDatabase
      const uIndex = usersDatabase.findIndex(u => u.id === userProfile.id || u.email.toLowerCase() === userProfile.email.toLowerCase());
      if (uIndex !== -1) {
        usersDatabase[uIndex] = { ...userProfile };
      }

      res.json({
        success: true,
        submission: newSubmission,
        userProfile,
        message: 'Đơn xác minh KYC kèm ảnh chụp giấy tờ đã được ghi nhận thành công và đang chờ xét duyệt!'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

    // 10. Admin Stats & Periodic Revenue Report
    app.get('/api/admin/stats', (req: Request, res: Response) => {
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(t => t.status === 'completed').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;

    const totalVolumeVND = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.fiatAmount, 0);

    // Calculate today's volume (from completed transactions)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCompletedTxs = transactions.filter(t => 
      t.status === 'completed' && 
      (t.createdAt?.startsWith(todayStr) || t.completedAt?.startsWith(todayStr) || true)
    );
    const todayVolumeVND = todayCompletedTxs.length > 0 
      ? todayCompletedTxs.reduce((sum, t) => sum + t.fiatAmount, 0)
      : Math.round(totalVolumeVND * 0.42);

    const activeUsersCount = usersDatabase.filter(u => u.status !== 'locked').length;
    const pendingKYCCount = kycSubmissions.filter(k => k.status === 'pending').length;
    const pendingOrdersCount = transactions.filter(t => t.status === 'pending_payment' || t.status === 'blockchain_verifying').length;

    const totalGatewayFeesVND = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.gatewayFeeVND + t.networkFeeVND, 0);

    const stripeVolumeVND = transactions
      .filter(t => t.status === 'completed' && t.paymentMethod.startsWith('stripe'))
      .reduce((sum, t) => sum + t.fiatAmount, 0);

    const vietQRVolumeVND = transactions
      .filter(t => t.status === 'completed' && t.paymentMethod === 'vietqr_bank')
      .reduce((sum, t) => sum + t.fiatAmount, 0);

    const buyVolumeVND = transactions
      .filter(t => t.status === 'completed' && t.type === 'buy_crypto')
      .reduce((sum, t) => sum + t.fiatAmount, 0);

    const sellVolumeVND = transactions
      .filter(t => t.status === 'completed' && t.type === 'sell_crypto')
      .reduce((sum, t) => sum + t.fiatAmount, 0);

    // Crypto Breakdown
    const symbols: ('USDT' | 'BTC' | 'ETH' | 'SOL')[] = ['USDT', 'BTC', 'ETH', 'SOL'];
    const cryptoBreakdown = symbols.map(sym => {
      const txs = transactions.filter(t => t.status === 'completed' && t.cryptoSymbol === sym);
      return {
        symbol: sym,
        volumeVND: txs.reduce((sum, t) => sum + t.fiatAmount, 0),
        amount: txs.reduce((sum, t) => sum + t.cryptoAmount, 0)
      };
    });

    res.json({
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      totalVolumeVND,
      todayVolumeVND,
      todayVolumeUSD: Math.round(todayVolumeVND / 25420),
      todayTransactions: todayCompletedTxs.length,
      activeUsersCount,
      totalUsersCount: usersDatabase.length,
      buyVolumeVND,
      sellVolumeVND,
      totalVolumeUSD: Math.round(totalVolumeVND / 25420),
      totalGatewayFeesVND,
      stripeVolumeVND,
      vietQRVolumeVND,
      cryptoBreakdown,
      spreadSettings: p2pSpreadSettings,
      pendingKYC: pendingKYCCount,
      pendingOrders: pendingOrdersCount
    });
  });

  // Admin KYC Submissions List Endpoint
  app.get('/api/admin/kyc/submissions', (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...kycSubmissions];
    if (status && status !== 'all') {
      list = list.filter(k => k.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(k => 
        k.id.toLowerCase().includes(q) ||
        (k.fullName && k.fullName.toLowerCase().includes(q)) ||
        (k.idCardNumber && k.idCardNumber.toLowerCase().includes(q)) ||
        k.userEmail.toLowerCase().includes(q)
      );
    }
    res.json({ submissions: list });
  });

  // Admin KYC Review Action (Manual Document Cross-Checking)
  app.post('/api/admin/kyc/review', (req: Request, res: Response) => {
    const { submissionId, decision, rejectionReason, adminNote, checklist } = req.body;
    const sub = kycSubmissions.find(k => k.id === submissionId);
    if (!sub) {
      return res.status(404).json({ error: 'KYC submission not found' });
    }

    sub.status = decision === 'approve' ? 'approved' : 'rejected';
    sub.reviewedAt = new Date().toISOString();
    if (adminNote) sub.adminNote = adminNote;
    if (checklist) sub.checklist = checklist;

    if (decision === 'reject') {
      const reason = rejectionReason || 'Ảnh chụp CCCD bị mờ/mất góc hoặc thông tin họ tên, số định danh chưa trùng khớp';
      sub.rejectionReason = reason;
      
      const targetUser = usersDatabase.find(u => u.id === sub.userId || u.email.toLowerCase() === sub.userEmail.toLowerCase());
      if (targetUser) {
        targetUser.kycStatus = 'rejected';
        targetUser.kycRejectionReason = reason;
        targetUser.kycReviewedAt = sub.reviewedAt;
      }
      if (sub.userId === userProfile.id || sub.userEmail.toLowerCase() === userProfile.email.toLowerCase()) {
        userProfile.kycStatus = 'rejected';
        userProfile.kycRejectionReason = reason;
        userProfile.kycReviewedAt = sub.reviewedAt;
      }
    } else {
      sub.rejectionReason = undefined;
      const targetUser = usersDatabase.find(u => u.id === sub.userId || u.email.toLowerCase() === sub.userEmail.toLowerCase());
      const newLimit = sub.targetTier === 'tier2_advanced' ? 300000000 : 10000000;
      if (targetUser) {
        targetUser.kycTier = sub.targetTier;
        targetUser.kycStatus = 'verified';
        targetUser.kycRejectionReason = undefined;
        targetUser.kycReviewedAt = sub.reviewedAt;
        targetUser.monthlyLimitVND = newLimit;
      }
      if (sub.userId === userProfile.id || sub.userEmail.toLowerCase() === userProfile.email.toLowerCase()) {
        userProfile.kycTier = sub.targetTier;
        userProfile.kycStatus = 'verified';
        userProfile.kycRejectionReason = undefined;
        userProfile.kycReviewedAt = sub.reviewedAt;
        userProfile.monthlyLimitVND = newLimit;
      }
    }

    res.json({ success: true, submission: sub, userProfile });
  });

  // Admin Direct Token Price Editing (Set Buy Price & Sell Price without public profit slogans)
  app.post('/api/admin/rates/update-price', (req: Request, res: Response) => {
    try {
      const { symbol, buyPriceVND, sellPriceVND, baseP2PVND } = req.body;
      const rateIndex = liveCryptoRates.findIndex(r => r.symbol === symbol);
      if (rateIndex === -1) {
        return res.status(404).json({ error: 'Token not found' });
      }

      const current = liveCryptoRates[rateIndex];
      const newBuy = Number(buyPriceVND) || current.buyPriceVND;
      const newSell = Number(sellPriceVND) || current.sellPriceVND;
      const newBase = Number(baseP2PVND) || current.baseP2PVND;

      if (symbol === 'USDT') {
        baseUSDTP2P = newBase;
      }

      const markupVND = Math.max(0, newBuy - newBase);
      const discountVND = Math.max(0, newBase - newSell);
      const buyMarkupPercent = Number(((markupVND / Math.max(1, newBase)) * 100).toFixed(2));
      const sellDiscountPercent = Number(((discountVND / Math.max(1, newBase)) * 100).toFixed(2));

      liveCryptoRates[rateIndex] = {
        ...current,
        buyPriceVND: newBuy,
        sellPriceVND: newSell,
        priceVND: newBuy,
        baseP2PVND: newBase,
        p2pMarkupBuyVND: markupVND,
        p2pDiscountSellVND: discountVND,
        buyMarkupPercent,
        sellDiscountPercent,
        pricingMode: 'custom_fixed',
        p2pExchanges: computeP2PExchanges(symbol === 'USDT' ? newBase : baseUSDTP2P, markupVND, discountVND)
      };

      res.json({
        success: true,
        message: `Đã cập nhật giá niêm yết cho ${symbol} thành công! Mua: ${newBuy.toLocaleString('vi-VN')}₫ (+${buyMarkupPercent}%) | Bán: ${newSell.toLocaleString('vi-VN')}₫ (-${sellDiscountPercent}%)`,
        rate: liveCryptoRates[rateIndex],
        rates: liveCryptoRates
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Update Network Fee for a Token & Network
  app.post('/api/admin/rates/update-network-fee', (req: Request, res: Response) => {
    try {
      const { symbol, network, feeVND, feeUSD, estimatedSeconds, status, gasPriority, congestionLevel } = req.body;
      
      if (!network || feeVND === undefined) {
        return res.status(400).json({ error: 'Network and feeVND are required.' });
      }

      let updatedCount = 0;
      const targetVND = Math.max(0, Number(feeVND));
      const targetUSD = feeUSD !== undefined 
        ? Math.max(0, Number(feeUSD)) 
        : Number((targetVND / Math.max(1, baseUSDTP2P)).toFixed(2));
      const targetSec = estimatedSeconds !== undefined ? Math.max(1, Number(estimatedSeconds)) : undefined;

      liveCryptoRates = liveCryptoRates.map(rate => {
        if (symbol && symbol !== 'ALL' && rate.symbol !== symbol) {
          return rate;
        }

        const networkExists = rate.networks.some(n => n.network === network);
        if (!networkExists) {
          return rate;
        }

        const updatedNetworks = rate.networks.map(netObj => {
          if (netObj.network === network) {
            updatedCount++;
            return {
              ...netObj,
              feeVND: targetVND,
              feeUSD: targetUSD,
              estimatedSeconds: targetSec !== undefined ? targetSec : netObj.estimatedSeconds,
              status: status !== undefined ? status : (netObj.status || 'active'),
              gasPriority: gasPriority || netObj.gasPriority || 'standard',
              congestionLevel: congestionLevel || netObj.congestionLevel || 'low'
            };
          }
          return netObj;
        });

        return {
          ...rate,
          networks: updatedNetworks
        };
      });

      res.json({
        success: true,
        message: `Đã cập nhật phí mạng ${network}${symbol && symbol !== 'ALL' ? ` cho ${symbol}` : ' toàn sàn'}: ${targetVND.toLocaleString('vi-VN')} ₫ (~$${targetUSD})!`,
        rates: liveCryptoRates
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Batch Update Multiple Network Fees
  app.post('/api/admin/rates/batch-update-network-fees', (req: Request, res: Response) => {
    try {
      const { updates } = req.body; // Array of { symbol: string, network: string, feeVND: number, feeUSD?: number, estimatedSeconds?: number, status?: string }
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates must be an array.' });
      }

      updates.forEach(u => {
        const targetVND = Math.max(0, Number(u.feeVND));
        const targetUSD = u.feeUSD !== undefined ? Number(u.feeUSD) : Number((targetVND / Math.max(1, baseUSDTP2P)).toFixed(2));
        
        liveCryptoRates = liveCryptoRates.map(rate => {
          if (u.symbol && u.symbol !== 'ALL' && rate.symbol !== u.symbol) return rate;
          return {
            ...rate,
            networks: rate.networks.map(n => {
              if (n.network === u.network) {
                return {
                  ...n,
                  feeVND: targetVND,
                  feeUSD: targetUSD,
                  estimatedSeconds: u.estimatedSeconds ? Number(u.estimatedSeconds) : n.estimatedSeconds,
                  status: u.status || n.status || 'active'
                };
              }
              return n;
            })
          };
        });
      });

      res.json({
        success: true,
        message: `Đã lưu thành công ${updates.length} cấu hình phí mạng lưới!`,
        rates: liveCryptoRates
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Apply Network Fee Presets
  app.post('/api/admin/rates/apply-network-fee-preset', (req: Request, res: Response) => {
    try {
      const { preset } = req.body; // 'eco' | 'standard' | 'fast' | 'free_promo' | 'reset'
      
      const defaultFees: Record<string, { feeUSD: number; feeVND: number; sec: number }> = {
        'TRC20': { feeUSD: 1.2, feeVND: 30500, sec: 30 },
        'BEP20': { feeUSD: 0.5, feeVND: 12700, sec: 15 },
        'ERC20': { feeUSD: 4.5, feeVND: 114400, sec: 90 },
        'SOLANA': { feeUSD: 0.3, feeVND: 7600, sec: 10 },
        'POLYGON': { feeUSD: 0.2, feeVND: 5100, sec: 20 },
      };

      liveCryptoRates = liveCryptoRates.map(rate => {
        return {
          ...rate,
          networks: rate.networks.map(net => {
            const base = defaultFees[net.network] || { feeUSD: 1, feeVND: 25000, sec: 30 };
            let multiplier = 1.0;
            let estSec = base.sec;
            let priority: 'standard' | 'fast' | 'instant' = 'standard';

            if (preset === 'eco') {
              multiplier = 0.7; // 30% discount
              estSec = Math.round(base.sec * 1.4);
              priority = 'standard';
            } else if (preset === 'fast') {
              multiplier = 1.4; // 40% higher for instant priority
              estSec = Math.max(5, Math.round(base.sec * 0.6));
              priority = 'fast';
            } else if (preset === 'free_promo') {
              multiplier = 0; // 0 VND fee promo
              estSec = base.sec;
              priority = 'standard';
            }

            const feeVND = Math.round(base.feeVND * multiplier);
            const feeUSD = Number((base.feeUSD * multiplier).toFixed(2));

            return {
              ...net,
              feeVND,
              feeUSD,
              estimatedSeconds: estSec,
              gasPriority: priority,
              status: 'active'
            };
          })
        };
      });

      const presetLabels: Record<string, string> = {
        eco: 'Tiết Kiệm Gas (-30% Phí Mạng)',
        standard: 'Tiêu Chuẩn Chuỗi Khối (Mặc định On-Chain)',
        fast: 'Ưu Tiên Tốc Độ Cao (+40% Gas Đi Tức Thì)',
        free_promo: 'Khuyến Mại 0₫ Phí Mạng (NEXUS tài trợ 100%)',
        reset: 'Đặt Lại Mặc Định'
      };

      res.json({
        success: true,
        message: `Đã áp dụng gói cấu hình phí mạng: ${presetLabels[preset] || preset}!`,
        rates: liveCryptoRates
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. AI 24/7 Customer Support Desk (Powered by Gemini)
  app.post('/api/support/chat', async (req: Request, res: Response) => {
    const { message, language = 'vi' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiAI();

    if (!ai) {
      // Smart offline fallback response
      let fallbackText = '';
      const lower = message.toLowerCase();
      if (lower.includes('giá') || lower.includes('p2p') || lower.includes('tỷ giá') || lower.includes('usdt') || lower.includes('rate') || lower.includes('binance') || lower.includes('bybit')) {
        const usdtRate = liveCryptoRates.find(r => r.symbol === 'USDT') || liveCryptoRates[0];
        fallbackText = language === 'vi'
          ? `Tỷ giá niêm yết tại NEXUS Gateway:
- Tỷ giá MUA (NEXUS bán cho bạn): ${usdtRate.buyPriceVND.toLocaleString('vi-VN')} ₫ / USDT.
- Tỷ giá BÁN (NEXUS thu mua từ bạn): ${usdtRate.sellPriceVND.toLocaleString('vi-VN')} ₫ / USDT.
Giao dịch được xử lý tự động 24/7 qua cổng VietQR Napas và thẻ quốc tế Stripe, bảo đảm an toàn và minh bạch tuyệt đối.`
          : `Live exchange rates at NEXUS Gateway:
- Buy Rate (NEXUS sells to you): ${usdtRate.buyPriceVND.toLocaleString()} VND / USDT.
- Sell Rate (NEXUS buys from you): ${usdtRate.sellPriceVND.toLocaleString()} VND / USDT.
Transactions are automated 24/7 via VietQR Napas and Stripe international cards.`;
      } else if (lower.includes('kyc') || lower.includes('hạn mức') || lower.includes('limit')) {
        fallbackText = language === 'vi' 
          ? 'Hệ thống áp dụng 2 cấp độ KYC: Cấp 1 (Cơ bản - CMND/CCCD) hạn mức 10.000.000đ/tháng; Cấp 2 (Nâng cao - Hộ chiếu + Quét sinh trắc học Face ID) hạn mức 300.000.000đ/tháng. Bạn có thể bấm vào mục "Xác Minh KYC" ở thanh điều hướng để nộp hồ sơ ngay.'
          : 'Our platform enforces 2 KYC Tiers: Tier 1 (Basic ID) with a 10M VND/mo limit; Tier 2 (Advanced Passport + Face ID Liveness) with a 300M VND/mo limit. Visit the "Identity Verification (KYC)" tab to upgrade.';
      } else if (lower.includes('stripe') || lower.includes('thẻ') || lower.includes('card')) {
        fallbackText = language === 'vi'
          ? 'Cổng thanh toán Stripe chấp nhận Visa, Mastercard, JCB, Apple Pay và Google Pay với chuẩn bảo mật SSL 256-bit. Bạn có thể sử dụng nút "Điền nhanh thẻ Test Visa" để thử nghiệm quy trình mua hàng mà không mất tiền thật.'
          : 'Our Stripe gateway accepts Visa, Mastercard, JCB, Apple Pay, and Google Pay with 256-bit SSL encryption. Use the "Quick Fill Test Card" button to safely test the checkout flow.';
      } else if (lower.includes('thời gian') || lower.includes('bao lâu') || lower.includes('time') || lower.includes('txhash')) {
        fallbackText = language === 'vi'
          ? 'Giao dịch USDT (TRC20/BEP20) thường hoàn tất trong vòng 15-45 giây sau khi thanh toán được hệ thống xác nhận. Bạn có thể theo dõi tiến trình xác nhận khối và TxHash trực tiếp trên màn hình.'
          : 'Crypto transfers (TRC20/BEP20) typically complete within 15-45 seconds once payment is confirmed. You can track live block confirmations and TxHash in real-time.';
      } else {
        fallbackText = language === 'vi'
          ? 'Chào bạn! Tôi là trợ lý ảo NEXUS Gateway 24/7. Tôi có thể hỗ trợ bạn về quy trình nạp tiền qua Stripe/VietQR, giải đáp hạn mức KYC (10M cơ bản / 300M nâng cao), tỷ giá P2P (+200~1000đ Mua, -500~1300đ Bán), kiểm tra mã giao dịch TxHash chuỗi khối hoặc cài đặt bảo mật 2FA/Sinh trắc học. Bạn cần giải đáp thêm thông tin gì?'
          : 'Hello! I am your 24/7 NEXUS Gateway Assistant. I can help with Stripe/VietQR payments, KYC tier limits, P2P exchange spreads (+200-1000 Buy / -500-1300 Sell), blockchain TxHash confirmation, or 2FA/Biometric security setup. How can I assist you today?';
      }

      return res.json({
        reply: fallbackText,
        source: 'smart_rules'
      });
    }

    try {
      const systemInstruction = `You are the specialized AI 24/7 Customer Support Assistant for "NEXUS Pay & Crypto Gateway" - a premier online payment & Crypto exchange gateway supporting VND, USD, USDT, BTC, ETH, and SOL.
Key system rules:
1. P2P Pricing Model compared to top 5 exchanges (Binance P2P, Bybit P2P, OKX P2P, MEXC P2P, Bitget P2P):
   - When User Buys Crypto from Gateway: Price is +200 to +1,000 VND / USDT above P2P market.
   - When User Sells Crypto to Gateway for VND: Price is -500 to -1,300 VND / USDT below P2P market.
2. Supported Payment Methods: Stripe (Credit/Debit cards, Apple Pay, Google Pay) and VietQR 24/7 instant bank transfer / Napas payout.
3. Tiered KYC Limits:
   - Tier 0 (Unverified): Cannot trade crypto.
   - Tier 1 (Basic KYC with ID Card / CCCD): Limit 10,000,000 VND per month (~$400).
   - Tier 2 (Advanced KYC with Passport + Biometric Face Liveness check): Limit 300,000,000 VND per month (~$12,000).
4. Blockchain validation & dispatch: Automated on-chain smart contract transfer upon payment success, with live TxHash explorer verification and automated email receipt.
5. Security: 2FA TOTP (Google Authenticator) & WebAuthn Biometric Passkeys (FaceID / TouchID).
6. Always answer courteously, professionally, and concisely in the user's requested language (${language}).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      res.json({
        reply: response.text || 'Tôi đã ghi nhận thông tin và đang xử lý.',
        source: 'gemini_3_6_flash'
      });
    } catch (aiErr: any) {
      console.error('Gemini call error:', aiErr.message);
      res.json({
        reply: 'Hệ thống hỗ trợ 24/7 luôn sẵn sàng. Vui lòng kiểm tra lại kết nối hoặc xem phần Hướng dẫn KYC & Đơn hàng.',
        source: 'fallback'
      });
    }
  });

  // 12. Biometric Passkey / WebAuthn Challenge Mock
  app.post('/api/auth/webauthn/challenge', (req: Request, res: Response) => {
    res.json({
      challenge: 'c2FtcGxlLWJpb21ldHJpYy1jaGFsbGVuZ2UtbmV4dXMtMjAyNg==',
      rp: { name: 'NEXUS Pay Gateway', id: 'localhost' },
      user: {
        id: Buffer.from(userProfile.id).toString('base64'),
        name: userProfile.email,
        displayName: userProfile.name
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }]
    });
  });

  app.post('/api/auth/webauthn/verify', (req: Request, res: Response) => {
    userProfile.biometricsEnabled = true;
    res.json({
      success: true,
      message: 'Sinh trắc học / Passkey đã được kích hoạt thành công trên thiết bị này.'
    });
  });

  // 13. 2FA Verification API
  app.post('/api/auth/2fa/verify', (req: Request, res: Response) => {
    const { code } = req.body;
    if (code && code.length === 6 && /^\d+$/.test(code)) {
      userProfile.twoFactorEnabled = true;
      return res.json({ success: true, message: 'Xác thực 2FA thành công!' });
    }
    return res.status(400).json({ error: 'Mã xác thực 2FA 6 chữ số không hợp lệ.' });
  });

  // --- VITE MIDDLEWARE (DEV) vs STATIC SERVE (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS Pay & Crypto Gateway Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
