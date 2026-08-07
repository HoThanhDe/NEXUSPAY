export type Language = 'vi' | 'en' | 'ja' | 'zh';

export type KYCTier = 'tier0_unverified' | 'tier1_basic' | 'tier2_advanced';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kycTier: KYCTier;
  kycStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  monthlyLimitVND: number;
  monthlyUsedVND: number;
  walletBalance: {
    VND: number;
    USDT: number;
    BTC: number;
    ETH: number;
    SOL: number;
  };
  bankAccount?: {
    bankName: string;
    bankShort: string;
    accountNumber: string;
    accountName: string;
  };
  twoFactorEnabled: boolean;
  biometricsEnabled: boolean;
  registeredAt: string;
}

export type CryptoSymbol = 'USDT' | 'BTC' | 'ETH' | 'SOL';
export type FiatSymbol = 'VND' | 'USD';
export type CryptoNetwork = 'TRC20' | 'ERC20' | 'BEP20' | 'SOLANA' | 'POLYGON';

export type P2PExchangeName = 'Binance P2P' | 'Bybit P2P' | 'OKX P2P' | 'MEXC P2P' | 'Bitget P2P';

export type PricingMode = 'percentage' | 'fixed_vnd' | 'custom_fixed';

export interface P2PExchangeRate {
  exchange: P2PExchangeName;
  shortName: string;
  p2pBuyVND: number; // Giá thương nhân bán trên sàn P2P đó
  p2pSellVND: number; // Giá thương nhân thu mua trên sàn P2P đó
  diffBuyVND: number; // Chênh lệch so với giá NEXUS
  diffSellVND: number; // Chênh lệch so với giá NEXUS
  liquidity: 'high' | 'medium' | 'very_high';
  paymentMethods: string[];
  updatedAt: string;
}

export interface P2PSpreadSettings {
  mode: PricingMode;
  buyMarkupPercent: number; // e.g. 2.5% (tính theo %)
  sellDiscountPercent: number; // e.g. 3.3% (tính theo %)
  buyMarkupVND: number; // Giá trị VND cố định linh hoạt (không giới hạn 1000đ)
  sellDiscountVND: number; // Giá trị VND cố định linh hoạt (không giới hạn 1300đ)
  autoSyncWithMarket: boolean; // Tự động nhận biến động theo thị trường
  lastUpdated: string;
}

export interface CryptoRate {
  symbol: CryptoSymbol;
  name: string;
  priceUSD: number;
  baseP2PVND: number; // Giá trung bình P2P 5 sàn (Binance, Bybit, OKX, MEXC, Bitget)
  buyPriceVND: number; // Giá bán cho khách
  sellPriceVND: number; // Giá thu mua từ khách
  priceVND: number; // Default reference (buy price)
  p2pMarkupBuyVND: number; // Mức chênh lệch mua VND
  p2pDiscountSellVND: number; // Mức chênh lệch bán VND
  buyMarkupPercent?: number; // Mức chênh lệch mua %
  sellDiscountPercent?: number; // Mức chênh lệch bán %
  pricingMode?: PricingMode;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hVND: number;
  p2pExchanges: P2PExchangeRate[];
  networks: {
    network: CryptoNetwork;
    feeUSD: number;
    feeVND: number;
    estimatedSeconds: number;
  }[];
}

export type PaymentMethod = 'stripe_card' | 'stripe_applepay' | 'stripe_googlepay' | 'vietqr_bank' | 'crypto_deposit';

export type TransactionStatus = 
  | 'pending_payment'
  | 'payment_processing'
  | 'payment_successful'
  | 'blockchain_verifying'
  | 'crypto_dispatched'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'buy_crypto' | 'sell_crypto' | 'fiat_checkout';
  fiatAmount: number;
  fiatCurrency: FiatSymbol;
  cryptoAmount: number;
  cryptoSymbol: CryptoSymbol;
  network: CryptoNetwork;
  recipientWallet?: string;
  depositWallet?: string; // For sell crypto
  bankPayout?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  txHash?: string;
  p2pBenchmarkRate?: number;
  p2pSpreadDelta?: number;
  blockConfirmations: number;
  requiredConfirmations: number;
  networkFeeVND: number;
  gatewayFeeVND: number;
  totalVND: number;
  createdAt: string;
  completedAt?: string;
  emailSent: boolean;
  receiptNumber: string;
  kycTierAtTransaction: KYCTier;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  targetTier: 'tier1_basic' | 'tier2_advanced';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminNote?: string;
  
  // Document Identity Details for Manual Cross-Checking
  documentType?: 'cccd' | 'cmnd' | 'passport';
  fullName?: string;
  idCardNumber?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ';
  nationality?: string;
  issueDate?: string;
  expiryDate?: string;
  issuePlace?: string;
  issuingAuthority?: string;
  address?: string;
  permanentAddress?: string;
  
  // Document Photos for Visual Cross-Referencing
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  frontIdUrl?: string;
  backIdUrl?: string;
  portraitPhotoUrl?: string;
  proofOfAddressUrl?: string;
  documentPhotos?: string[];
  
  // Optional biometrics / historical flags
  biometricLivenessPassed?: boolean;
  biometricScore?: number;

  // Manual Verification Checklist
  checklist?: {
    imageClear?: boolean;
    nameMatched?: boolean;
    idNumberValid?: boolean;
    docNotExpired?: boolean;
    nameMatches?: boolean;
    idNumberMatches?: boolean;
    photoClearAndOriginal?: boolean;
  };
}

export interface RevenueReportData {
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolumeVND: number;
  totalVolumeUSD: number;
  totalGatewayFeesVND: number;
  stripeVolumeVND: number;
  vietQRVolumeVND: number;
  cryptoBreakdown: {
    symbol: CryptoSymbol;
    volumeVND: number;
    amount: number;
  }[];
  dailyTrends: {
    date: string;
    revenueVND: number;
    ordersCount: number;
  }[];
}

export interface InAppNotification {
  id: string;
  type: 'order_success' | 'crypto_sent' | 'kyc_update' | 'security_alert' | 'price_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkId?: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
