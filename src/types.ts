export type Language = 'vi' | 'en' | 'ja' | 'zh';

export type KYCTier = 'tier0_unverified' | 'tier1_basic' | 'tier2_advanced';

export type AdminDeskPermission = 
  | 'admin_users'
  | 'transaction_management'
  | 'wallet_management'
  | 'payment_management'
  | 'vietqr_config'
  | 'stats_overview'
  | 'kyc_review'
  | 'market_management'
  | 'system_settings'
  | 'admin_management';

export interface AdminAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  isMaster: boolean;
  status: 'active' | 'locked';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'locked';
  kycTier: KYCTier;
  kycStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  kycRejectionReason?: string;
  kycReviewedAt?: string;
  kycSubmittedAt?: string;
  kycTargetTier?: 'tier1_basic' | 'tier2_advanced';
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
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  portraitUrl?: string;
  idCardNumber?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  address?: string;
  lastLogin?: string;
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

export interface NetworkFeeConfig {
  network: CryptoNetwork;
  feeUSD: number;
  feeVND: number;
  estimatedSeconds: number;
  status?: 'active' | 'suspended';
  gasPriority?: 'standard' | 'fast' | 'instant';
  congestionLevel?: 'low' | 'medium' | 'high';
  memoRequired?: boolean;
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
  networks: NetworkFeeConfig[];
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

export type PaymentStatus = 'pending_payment' | 'paid' | 'expired';
export type ProcessingStatus = 'pending_review' | 'processing' | 'crypto_dispatched' | 'completed' | 'rejected';
export type CryptoReceiveStatus = 'pending_crypto' | 'crypto_received';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  fullName?: string;
  phone?: string;
  type: 'buy_crypto' | 'sell_crypto' | 'fiat_checkout';
  fiatAmount: number;
  fiatCurrency: FiatSymbol;
  cryptoAmount: number;
  cryptoSymbol: CryptoSymbol;
  network: CryptoNetwork;
  recipientWallet?: string;
  depositWallet?: string; // For sell crypto (system wallet)
  clientTxHash?: string; // TXID sent by customer when selling crypto
  bankPayout?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    payoutMemo?: string;
    receiptImageUrl?: string;
    payoutTime?: string;
    operatorName?: string;
  };
  paymentMethod: PaymentMethod;
  paymentCode?: string;
  transferMemo?: string;
  paymentStatus?: PaymentStatus;
  processingStatus?: ProcessingStatus;
  cryptoReceiveStatus?: CryptoReceiveStatus;
  adminNote?: string;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  txHash?: string;
  p2pBenchmarkRate?: number;
  p2pSpreadDelta?: number;
  exchangeRate?: number;
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

export interface SystemWallet {
  id: string;
  coin: CryptoSymbol;
  network: CryptoNetwork;
  address: string;
  qrCodeUrl?: string;
  status: 'active' | 'suspended';
  label?: string;
  receivedCount?: number;
  balance?: number;
  updatedAt: string;
}

export interface PaymentPayoutRecord {
  id: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bankName: string;
  bankShort?: string;
  accountNumber: string;
  accountName: string;
  amountVND: number;
  transferMemo: string;
  receiptImageUrl?: string;
  transferTime?: string;
  operatorName?: string;
  status: 'pending_payment' | 'paid' | 'failed';
  adminNote?: string;
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
  portraitUrl?: string;
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
  type: 'order_success' | 'crypto_sent' | 'kyc_update' | 'security_alert' | 'price_alert' | 'admin_action' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkId?: string;
  target?: 'user' | 'admin' | 'both';
  userId?: string;
  adminUsername?: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface VietQRConfig {
  bankName: string;
  bankShort: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  gatewayMemoPrefix: string;
  partnerApiKey?: string;
  partnerApiSecret?: string;
  webhookUrl?: string;
  autoConfirmDeposit?: boolean;
  testMode?: boolean;
  bankLogoUrl?: string;
  lastUpdated?: string;
}

export interface PriceAlert {
  id: string;
  symbol: CryptoSymbol;
  targetPriceVND: number;
  condition: 'above' | 'below';
  notifyBrowser: boolean;
  notifyEmail: boolean;
  emailAddress?: string;
  status: 'active' | 'triggered' | 'paused';
  createdAt: string;
  triggeredAt?: string;
  initialPriceVND: number;
}

export interface UserAuthResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
  error?: string;
  token?: string;
}
