import { CryptoRate, Transaction, UserProfile, KYCSubmission, P2PExchangeRate, P2PSpreadSettings, SystemWallet, PaymentPayoutRecord } from '../types';

export const defaultP2PSpreadSettings: P2PSpreadSettings = {
  mode: 'percentage', // 'percentage' | 'fixed_vnd' | 'custom_fixed'
  buyMarkupPercent: 2.56, // ~650 VND on 25,420 VND (~ +2.56%)
  sellDiscountPercent: 3.34, // ~850 VND on 25,420 VND (~ -3.34%)
  buyMarkupVND: 650, // Flexible VND amount (no 1000đ limit)
  sellDiscountVND: 850, // Flexible VND amount (no 1300đ limit)
  autoSyncWithMarket: true,
  lastUpdated: new Date().toISOString()
};

export function computeP2PExchanges(baseP2P: number, buyMarkup: number, sellDiscount: number): P2PExchangeRate[] {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const nexusBuy = baseP2P + buyMarkup;
  const nexusSell = baseP2P - sellDiscount;

  return [
    {
      exchange: 'Binance P2P',
      shortName: 'Binance',
      p2pBuyVND: baseP2P + 10,
      p2pSellVND: baseP2P - 40,
      diffBuyVND: nexusBuy - (baseP2P + 10),
      diffSellVND: (baseP2P - 40) - nexusSell,
      liquidity: 'very_high',
      paymentMethods: ['Vietcombank', 'Techcombank', 'MB Bank', 'Momo'],
      updatedAt: now
    },
    {
      exchange: 'Bybit P2P',
      shortName: 'Bybit',
      p2pBuyVND: baseP2P - 5,
      p2pSellVND: baseP2P - 55,
      diffBuyVND: nexusBuy - (baseP2P - 5),
      diffSellVND: (baseP2P - 55) - nexusSell,
      liquidity: 'high',
      paymentMethods: ['Napas 247', 'ACB', 'VPBank', 'ZaloPay'],
      updatedAt: now
    },
    {
      exchange: 'OKX P2P',
      shortName: 'OKX',
      p2pBuyVND: baseP2P + 15,
      p2pSellVND: baseP2P - 35,
      diffBuyVND: nexusBuy - (baseP2P + 15),
      diffSellVND: (baseP2P - 35) - nexusSell,
      liquidity: 'very_high',
      paymentMethods: ['VietinBank', 'BIDV', 'Techcombank'],
      updatedAt: now
    },
    {
      exchange: 'MEXC P2P',
      shortName: 'MEXC',
      p2pBuyVND: baseP2P - 15,
      p2pSellVND: baseP2P - 65,
      diffBuyVND: nexusBuy - (baseP2P - 15),
      diffSellVND: (baseP2P - 65) - nexusSell,
      liquidity: 'medium',
      paymentMethods: ['Chuyển khoản 247', 'MB Bank', 'TPBank'],
      updatedAt: now
    },
    {
      exchange: 'Bitget P2P',
      shortName: 'Bitget',
      p2pBuyVND: baseP2P,
      p2pSellVND: baseP2P - 50,
      diffBuyVND: nexusBuy - baseP2P,
      diffSellVND: (baseP2P - 50) - nexusSell,
      liquidity: 'high',
      paymentMethods: ['Vietcombank', 'Techcombank', 'Sacombank'],
      updatedAt: now
    }
  ];
}

const baseUSDT_P2P = 25420;
const defaultBuyMarkup = 650; // +650 VND (+200 -> +1000 VND)
const defaultSellDiscount = 850; // -850 VND (-500 -> -1300 VND)

export const initialCryptoRates: CryptoRate[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    priceUSD: 1.00,
    baseP2PVND: baseUSDT_P2P,
    buyPriceVND: baseUSDT_P2P + defaultBuyMarkup, // 26,070 VND (+650đ vs P2P)
    sellPriceVND: baseUSDT_P2P - defaultSellDiscount, // 24,570 VND (-850đ vs P2P)
    priceVND: baseUSDT_P2P + defaultBuyMarkup,
    p2pMarkupBuyVND: defaultBuyMarkup,
    p2pDiscountSellVND: defaultSellDiscount,
    change24h: 0.12,
    high24h: 26150,
    low24h: 24500,
    volume24hVND: 142850000000,
    p2pExchanges: computeP2PExchanges(baseUSDT_P2P, defaultBuyMarkup, defaultSellDiscount),
    networks: [
      { network: 'TRC20', feeUSD: 1.2, feeVND: 30500, estimatedSeconds: 30 },
      { network: 'BEP20', feeUSD: 0.5, feeVND: 12700, estimatedSeconds: 15 },
      { network: 'ERC20', feeUSD: 4.5, feeVND: 114400, estimatedSeconds: 90 },
      { network: 'SOLANA', feeUSD: 0.3, feeVND: 7600, estimatedSeconds: 10 },
      { network: 'POLYGON', feeUSD: 0.2, feeVND: 5100, estimatedSeconds: 20 },
    ]
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    priceUSD: 91420,
    baseP2PVND: Math.round(91420 * baseUSDT_P2P),
    buyPriceVND: Math.round(91420 * (baseUSDT_P2P + defaultBuyMarkup)),
    sellPriceVND: Math.round(91420 * (baseUSDT_P2P - defaultSellDiscount)),
    priceVND: Math.round(91420 * (baseUSDT_P2P + defaultBuyMarkup)),
    p2pMarkupBuyVND: Math.round(91420 * defaultBuyMarkup),
    p2pDiscountSellVND: Math.round(91420 * defaultSellDiscount),
    change24h: 2.84,
    high24h: 2390000000,
    low24h: 2240000000,
    volume24hVND: 980400000000,
    p2pExchanges: computeP2PExchanges(baseUSDT_P2P, defaultBuyMarkup, defaultSellDiscount),
    networks: [
      { network: 'BEP20', feeUSD: 1.5, feeVND: 38100, estimatedSeconds: 20 },
      { network: 'ERC20', feeUSD: 8.0, feeVND: 203300, estimatedSeconds: 120 },
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    priceUSD: 3340,
    baseP2PVND: Math.round(3340 * baseUSDT_P2P),
    buyPriceVND: Math.round(3340 * (baseUSDT_P2P + defaultBuyMarkup)),
    sellPriceVND: Math.round(3340 * (baseUSDT_P2P - defaultSellDiscount)),
    priceVND: Math.round(3340 * (baseUSDT_P2P + defaultBuyMarkup)),
    p2pMarkupBuyVND: Math.round(3340 * defaultBuyMarkup),
    p2pDiscountSellVND: Math.round(3340 * defaultSellDiscount),
    change24h: -1.25,
    high24h: 88500000,
    low24h: 81800000,
    volume24hVND: 412000000000,
    p2pExchanges: computeP2PExchanges(baseUSDT_P2P, defaultBuyMarkup, defaultSellDiscount),
    networks: [
      { network: 'ERC20', feeUSD: 5.0, feeVND: 127100, estimatedSeconds: 60 },
      { network: 'BEP20', feeUSD: 0.8, feeVND: 20300, estimatedSeconds: 20 },
      { network: 'POLYGON', feeUSD: 0.3, feeVND: 7600, estimatedSeconds: 25 },
    ]
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    priceUSD: 184.5,
    baseP2PVND: Math.round(184.5 * baseUSDT_P2P),
    buyPriceVND: Math.round(184.5 * (baseUSDT_P2P + defaultBuyMarkup)),
    sellPriceVND: Math.round(184.5 * (baseUSDT_P2P - defaultSellDiscount)),
    priceVND: Math.round(184.5 * (baseUSDT_P2P + defaultBuyMarkup)),
    p2pMarkupBuyVND: Math.round(184.5 * defaultBuyMarkup),
    p2pDiscountSellVND: Math.round(184.5 * defaultSellDiscount),
    change24h: 4.62,
    high24h: 4950000,
    low24h: 4420000,
    volume24hVND: 265000000000,
    p2pExchanges: computeP2PExchanges(baseUSDT_P2P, defaultBuyMarkup, defaultSellDiscount),
    networks: [
      { network: 'SOLANA', feeUSD: 0.25, feeVND: 6350, estimatedSeconds: 8 },
      { network: 'BEP20', feeUSD: 0.6, feeVND: 15250, estimatedSeconds: 20 },
    ]
  }
];

export const initialUser: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  kycTier: 'tier0_unverified',
  kycStatus: 'unsubmitted',
  monthlyLimitVND: 0,
  monthlyUsedVND: 0,
  walletBalance: {
    VND: 0,
    USDT: 0,
    BTC: 0,
    ETH: 0,
    SOL: 0,
  },
  twoFactorEnabled: false,
  biometricsEnabled: false,
  registeredAt: ''
};

export const initialSystemWallets: SystemWallet[] = [
  {
    id: 'WAL-USDT-TRC20',
    coin: 'USDT',
    network: 'TRC20',
    address: 'TXb9Qy7Vp1MnZrt5XkL98QweRtyuP239Xp',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=tron:TXb9Qy7Vp1MnZrt5XkL98QweRtyuP239Xp',
    status: 'active',
    label: 'Ví Ký Quỹ USDT TRON Chính (Hot Wallet 01)',
    receivedCount: 142,
    balance: 85400.5,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'WAL-USDT-BEP20',
    coin: 'USDT',
    network: 'BEP20',
    address: '0x889A74E3C12bF24b0F7945d7d3E9a34988F932cB',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ethereum:0x889A74E3C12bF24b0F7945d7d3E9a34988F932cB',
    status: 'active',
    label: 'Ví Ký Quỹ USDT BNB Smart Chain (Hot Wallet 02)',
    receivedCount: 98,
    balance: 42350.0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'WAL-USDT-ERC20',
    coin: 'USDT',
    network: 'ERC20',
    address: '0x71C949A2d87e07aFE82BFE6B6aB9fFbcf559D65B',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ethereum:0x71C949A2d87e07aFE82BFE6B6aB9fFbcf559D65B',
    status: 'active',
    label: 'Ví Ký Quỹ USDT Ethereum (Cold Vault OTC)',
    receivedCount: 35,
    balance: 150000.0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'WAL-BTC-NATIVE',
    coin: 'BTC',
    network: 'BEP20',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    status: 'active',
    label: 'Ví Ký Quỹ Bitcoin SegWit (Hot Vault)',
    receivedCount: 22,
    balance: 4.85,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'WAL-ETH-ERC20',
    coin: 'ETH',
    network: 'ERC20',
    address: '0x71C949A2d87e07aFE82BFE6B6aB9fFbcf559D65B',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ethereum:0x71C949A2d87e07aFE82BFE6B6aB9fFbcf559D65B',
    status: 'active',
    label: 'Ví Ký Quỹ Ethereum (Multi-Sig Vault)',
    receivedCount: 45,
    balance: 28.6,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'WAL-SOL-NATIVE',
    coin: 'SOL',
    network: 'SOLANA',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    status: 'active',
    label: 'Ví Ký Quỹ Solana Fast Settlement',
    receivedCount: 68,
    balance: 142.3,
    updatedAt: new Date().toISOString()
  }
];

export const sampleTransactions: Transaction[] = [
  {
    id: 'TXN-9481-VND',
    userId: 'usr_vn_9988',
    userEmail: 'trader.otc@nexus.vn',
    userName: 'Trần Quang Huy',
    fullName: 'TRẦN QUANG HUY',
    phone: '0987654321',
    type: 'buy_crypto',
    fiatAmount: 2607000,
    fiatCurrency: 'VND',
    cryptoAmount: 100,
    cryptoSymbol: 'USDT',
    network: 'TRC20',
    recipientWallet: 'TYDzsYbm7xXG7xKvZ1Rmqw76sXb484X9Jk',
    paymentMethod: 'vietqr_bank',
    paymentCode: 'VQR-9481',
    transferMemo: 'NEXUSPAY TXN-9481-VND',
    paymentStatus: 'paid',
    processingStatus: 'completed',
    status: 'completed',
    txHash: '0x8f3a9bc4123de67a421eef098bca91209341829a21b34c890123efd981245abc',
    p2pBenchmarkRate: 25420,
    p2pSpreadDelta: 650,
    exchangeRate: 26070,
    blockConfirmations: 12,
    requiredConfirmations: 12,
    networkFeeVND: 30500,
    gatewayFeeVND: 0,
    totalVND: 2637500,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2 + 45000).toISOString(),
    emailSent: true,
    receiptNumber: 'REC-2026-0806-0091',
    kycTierAtTransaction: 'tier1_basic',
    adminNote: 'Đã nhận chuyển khoản VietQR tự động và gửi 100 USDT on-chain thành công'
  },
  {
    id: 'TXN-9480-VND',
    userId: 'usr_vn_9988',
    userEmail: 'trader.otc@nexus.vn',
    userName: 'Trần Quang Huy',
    fullName: 'TRẦN QUANG HUY',
    phone: '0987654321',
    type: 'sell_crypto',
    fiatAmount: 2457000,
    fiatCurrency: 'VND',
    cryptoAmount: 100,
    cryptoSymbol: 'USDT',
    network: 'BEP20',
    depositWallet: '0x889A74E3C12bF24b0F7945d7d3E9a34988F932cB',
    clientTxHash: '0x321faec7651098234125bca9812903124859012384aef01923840129384bcda',
    bankPayout: {
      bankName: 'Vietcombank (VCB)',
      accountNumber: '10188992233',
      accountName: 'NGUYEN VAN AN',
      payoutMemo: 'NEXUS PAYOUT TXN-9480',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      payoutTime: new Date(Date.now() - 86400000 * 1).toISOString(),
      operatorName: 'Admin Master'
    },
    paymentMethod: 'crypto_deposit',
    paymentStatus: 'paid',
    processingStatus: 'completed',
    cryptoReceiveStatus: 'crypto_received',
    status: 'completed',
    txHash: '0x321faec7651098234125bca9812903124859012384aef01923840129384bcda',
    p2pBenchmarkRate: 25420,
    p2pSpreadDelta: -850,
    exchangeRate: 24570,
    blockConfirmations: 15,
    requiredConfirmations: 15,
    networkFeeVND: 0,
    gatewayFeeVND: 0,
    totalVND: 2457000,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1 + 30000).toISOString(),
    emailSent: true,
    receiptNumber: 'REC-2026-0805-0043',
    kycTierAtTransaction: 'tier1_basic',
    adminNote: 'Đã nhận đủ 100 USDT qua BEP20 và ủy nhiệm chi 2.457.000đ vào Vietcombank của khách'
  },
  {
    id: 'TXN-9479-VND',
    userId: 'usr_vn_2210',
    userEmail: 'tran.v.hung@gmail.com',
    userName: 'Trần Văn Hùng',
    fullName: 'TRẦN VĂN HÙNG',
    phone: '0912345678',
    type: 'buy_crypto',
    fiatAmount: 52140000,
    fiatCurrency: 'VND',
    cryptoAmount: 2000,
    cryptoSymbol: 'USDT',
    network: 'TRC20',
    recipientWallet: 'TPLv8bMkdY23984mznqwe89762134klda',
    paymentMethod: 'vietqr_bank',
    paymentCode: 'VQR-9479',
    transferMemo: 'NEXUSPAY TXN-9479-VND',
    paymentStatus: 'paid',
    processingStatus: 'completed',
    status: 'completed',
    stripePaymentIntentId: 'pi_3MtwK7LkdIwHu7ix0snM110x',
    txHash: '0x1290384aef981230491283401928340912834019283401928340192834019283',
    p2pBenchmarkRate: 25420,
    p2pSpreadDelta: 650,
    exchangeRate: 26070,
    blockConfirmations: 12,
    requiredConfirmations: 12,
    networkFeeVND: 30500,
    gatewayFeeVND: 0,
    totalVND: 52170500,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
    emailSent: true,
    receiptNumber: 'REC-2026-0804-0182',
    kycTierAtTransaction: 'tier2_advanced',
    adminNote: 'Lệnh mua số lượng lớn 2,000 USDT đã hoàn tất kiểm tra KYC Tier 2'
  },
  {
    id: 'TXN-9478-VND',
    userId: 'usr_vn_3321',
    userEmail: 'hoang.minh@yahoo.com',
    userName: 'Hoàng Văn Minh',
    fullName: 'HOÀNG VĂN MINH',
    phone: '0908123456',
    type: 'buy_crypto',
    fiatAmount: 13035000,
    fiatCurrency: 'VND',
    cryptoAmount: 500,
    cryptoSymbol: 'USDT',
    network: 'TRC20',
    recipientWallet: 'TJ89xKLnmqP23vRt56QwErTy123456789a',
    paymentMethod: 'vietqr_bank',
    paymentCode: 'VQR-9478',
    transferMemo: 'NEXUSPAY TXN-9478-VND',
    paymentStatus: 'pending_payment',
    processingStatus: 'pending_review',
    status: 'pending_payment',
    p2pBenchmarkRate: 25420,
    p2pSpreadDelta: 650,
    exchangeRate: 26070,
    blockConfirmations: 0,
    requiredConfirmations: 12,
    networkFeeVND: 30500,
    gatewayFeeVND: 0,
    totalVND: 13065500,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    emailSent: false,
    receiptNumber: 'REC-2026-0807-0012',
    kycTierAtTransaction: 'tier1_basic',
    adminNote: 'Khách hàng vừa tạo lệnh mua 500 USDT, đang chờ quét mã VietQR Napas'
  },
  {
    id: 'TXN-9477-VND',
    userId: 'usr_vn_5541',
    userEmail: 'le.thanh.tam@outlook.com',
    userName: 'Lê Thanh Tâm',
    fullName: 'LÊ THANH TÂM',
    phone: '0933987654',
    type: 'sell_crypto',
    fiatAmount: 12285000,
    fiatCurrency: 'VND',
    cryptoAmount: 500,
    cryptoSymbol: 'USDT',
    network: 'TRC20',
    depositWallet: 'TXb9Qy7Vp1MnZrt5XkL98QweRtyuP239Xp',
    clientTxHash: '0x992384aef01923840129384bcda321faec7651098234125bca9812903124859',
    bankPayout: {
      bankName: 'Techcombank (TCB)',
      accountNumber: '19034567890123',
      accountName: 'LE THANH TAM',
      payoutMemo: 'NEXUS PAYOUT TXN-9477'
    },
    paymentMethod: 'crypto_deposit',
    paymentStatus: 'pending_payment',
    processingStatus: 'processing',
    cryptoReceiveStatus: 'crypto_received',
    status: 'blockchain_verifying',
    p2pBenchmarkRate: 25420,
    p2pSpreadDelta: -850,
    exchangeRate: 24570,
    blockConfirmations: 8,
    requiredConfirmations: 12,
    networkFeeVND: 0,
    gatewayFeeVND: 0,
    totalVND: 12285000,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    emailSent: false,
    receiptNumber: 'REC-2026-0807-0008',
    kycTierAtTransaction: 'tier2_advanced',
    adminNote: 'Đã nhận 500 USDT vào ví TRC20, đang chờ admin giải ngân 12.285.000đ về Techcombank'
  },
  {
    id: 'TXN-9476-VND',
    userId: 'usr_vn_7712',
    userEmail: 'nguyen.h.nam@gmail.com',
    userName: 'Nguyễn Hoài Nam',
    fullName: 'NGUYỄN HOÀI NAM',
    phone: '0977112233',
    type: 'buy_crypto',
    fiatAmount: 23688000,
    fiatCurrency: 'VND',
    cryptoAmount: 0.01,
    cryptoSymbol: 'BTC',
    network: 'BEP20',
    recipientWallet: '0x3344556677889900112233445566778899aabbcc',
    paymentMethod: 'vietqr_bank',
    paymentCode: 'VQR-9476',
    transferMemo: 'NEXUSPAY TXN-9476-VND',
    paymentStatus: 'paid',
    processingStatus: 'crypto_dispatched',
    status: 'crypto_dispatched',
    txHash: '0x55aa66bb77cc88dd99ee0011223344556677889900aabbccddeeff0011223344',
    p2pBenchmarkRate: 2323868400,
    p2pSpreadDelta: 59423000,
    exchangeRate: 2368800000,
    blockConfirmations: 6,
    requiredConfirmations: 15,
    networkFeeVND: 38100,
    gatewayFeeVND: 0,
    totalVND: 23726100,
    createdAt: new Date(Date.now() - 4500000).toISOString(),
    emailSent: true,
    receiptNumber: 'REC-2026-0807-0002',
    kycTierAtTransaction: 'tier2_advanced',
    adminNote: 'Đã dispatch 0.01 BTC qua BEP20, đang chờ 15 block confirmations'
  }
];

export const samplePaymentPayouts: PaymentPayoutRecord[] = [
  {
    id: 'PAY-9480',
    transactionId: 'TXN-9480-VND',
    customerName: 'TRẦN QUANG HUY',
    customerEmail: 'trader.otc@nexus.vn',
    customerPhone: '0987654321',
    bankName: 'Vietcombank (VCB)',
    bankShort: 'VCB',
    accountNumber: '10188992233',
    accountName: 'TRAN QUANG HUY',
    amountVND: 2457000,
    transferMemo: 'NEXUS PAYOUT TXN-9480',
    receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    transferTime: new Date(Date.now() - 86400000 * 1).toISOString(),
    operatorName: 'Tổng Quản Trị Viên (Master Admin)',
    status: 'paid',
    adminNote: 'Ủy nhiệm chi tự động 24/7 qua VietQR Napas thành công'
  },
  {
    id: 'PAY-9477',
    transactionId: 'TXN-9477-VND',
    customerName: 'LÊ THANH TÂM',
    customerEmail: 'le.thanh.tam@outlook.com',
    customerPhone: '0933987654',
    bankName: 'Techcombank (TCB)',
    bankShort: 'TCB',
    accountNumber: '19034567890123',
    accountName: 'LE THANH TAM',
    amountVND: 12285000,
    transferMemo: 'NEXUS PAYOUT TXN-9477',
    status: 'pending_payment',
    adminNote: 'Khách đã chuyển 500 USDT, đang chờ admin bấm Xác nhận chuyển khoản & tạo VietQR Payout'
  }
];

export const sampleKycQueue: KYCSubmission[] = [
  {
    id: 'KYC-REQ-8815',
    userId: 'usr_vn_5541',
    userEmail: 'le.thanh.tam@outlook.com',
    userName: 'Lê Thanh Tâm',
    targetTier: 'tier2_advanced',
    status: 'pending',
    submittedAt: new Date(Date.now() - 900000).toISOString(),
    documentType: 'passport',
    fullName: 'LÊ THANH TÂM',
    idCardNumber: '079194002381',
    passportNumber: 'C9812349',
    dateOfBirth: '1994-04-12',
    gender: 'Nữ',
    nationality: 'Việt Nam',
    issueDate: '2023-05-18',
    expiryDate: '2033-05-18',
    issuePlace: 'Cục Quản lý Xuất nhập cảnh',
    address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    portraitPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    proofOfAddressUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    checklist: {
      nameMatches: true,
      idNumberMatches: true,
      docNotExpired: true,
      photoClearAndOriginal: true
    }
  },
  {
    id: 'KYC-REQ-8812',
    userId: 'usr_vn_3321',
    userEmail: 'hoang.minh@yahoo.com',
    userName: 'Hoàng Văn Minh',
    targetTier: 'tier1_basic',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    documentType: 'cccd',
    fullName: 'HOÀNG VĂN MINH',
    idCardNumber: '079201009841',
    dateOfBirth: '1995-10-14',
    gender: 'Nam',
    nationality: 'Việt Nam',
    issueDate: '2022-08-20',
    expiryDate: '2035-10-14',
    issuePlace: 'Cục Cảnh sát QLHC về TTXH',
    address: 'Số 45 Đường số 8, Phường Linh Tây, TP. Thủ Đức, TP. Hồ Chí Minh',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    portraitPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    checklist: {
      nameMatches: true,
      idNumberMatches: true,
      docNotExpired: true,
      photoClearAndOriginal: true
    }
  },
  {
    id: 'KYC-REQ-8809',
    userId: 'usr_vn_9988',
    userEmail: 'trader.otc@nexus.vn',
    userName: 'Trần Quang Huy',
    targetTier: 'tier1_basic',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    documentType: 'cccd',
    fullName: 'TRẦN QUANG HUY',
    idCardNumber: '001094018294',
    dateOfBirth: '1994-08-15',
    gender: 'Nam',
    nationality: 'Việt Nam',
    issueDate: '2021-06-10',
    expiryDate: '2034-08-15',
    issuePlace: 'Cục Cảnh sát QLHC về TTXH',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    portraitPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    adminNote: 'Đã đối chiếu khớp thông tin CCCD gắn chip và tài khoản ngân hàng VCB',
    checklist: {
      nameMatches: true,
      idNumberMatches: true,
      docNotExpired: true,
      photoClearAndOriginal: true
    }
  },
  {
    id: 'KYC-REQ-8804',
    userId: 'usr_vn_1190',
    userEmail: 'pham.quang.vinh@gmail.com',
    userName: 'Phạm Quang Vinh',
    targetTier: 'tier1_basic',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
    rejectionReason: 'Ảnh chụp mặt trước CCCD bị lóa sáng che mất số định danh cá nhân và ngày sinh. Vui lòng chụp lại rõ nét.',
    documentType: 'cccd',
    fullName: 'PHẠM QUANG VINH',
    idCardNumber: '038092001928',
    dateOfBirth: '1992-03-22',
    gender: 'Nam',
    nationality: 'Việt Nam',
    idCardFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    adminNote: 'Ảnh mờ không đọc được 4 số cuối CCCD.'
  }
];

export const vietQrBankDetails = {
  bankName: 'Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)',
  bankShort: 'VCB',
  bankCode: '970436',
  accountNumber: '998825420001',
  accountName: 'NEXUS GATEWAY GLOBAL TECH JSC',
  gatewayMemoPrefix: 'NEXUSPAY'
};

export const depositHotWallets: Record<string, string> = {
  'TRC20': 'TXb9Qy7Vp1MnZrt5XkL98QweRtyuP239Xp',
  'BEP20': '0x889A74E3C12bF24b0F7945d7d3E9a34988F932cB',
  'ERC20': '0x71C949A2d87e07aFE82BFE6B6aB9fFbcf559D65B',
  'SOLANA': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'POLYGON': '0x992B9741e974E6F4e1eA7b115456f910A3FaB5D2'
};

// Generate realistic chart history for 24h / 7d
export function generateChartData(symbol: string, basePriceVND: number, points = 30) {
  const data = [];
  let current = basePriceVND * 0.98;
  const now = Date.now();
  const stepMs = (24 * 3600 * 1000) / points;

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - i) * stepMs);
    const variance = (Math.random() - 0.48) * (basePriceVND * 0.012);
    current = Math.max(basePriceVND * 0.9, current + variance);
    const open = current;
    const close = current + (Math.random() - 0.48) * (basePriceVND * 0.006);
    const high = Math.max(open, close) + Math.random() * (basePriceVND * 0.004);
    const low = Math.min(open, close) - Math.random() * (basePriceVND * 0.004);
    const volume = Math.floor(Math.random() * 500000000 + 100000000);

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: time.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      price: Math.round(close),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume
    });
  }
  return data;
}
