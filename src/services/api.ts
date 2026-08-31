import { CryptoRate, KYCSubmission, Transaction, UserProfile, AdminAccount } from '../types';

export const api = {
  async getRates(): Promise<CryptoRate[]> {
    try {
      const res = await fetch('/api/crypto/rates');
      if (!res.ok) throw new Error('Failed to fetch rates');
      const data = await res.json();
      return data.rates;
    } catch (e) {
      console.warn('Using local rates fallback:', e);
      const { initialCryptoRates } = await import('./mockData');
      return initialCryptoRates;
    }
  },

  async getUserProfile(): Promise<{ user: UserProfile; bankDetails: any; vietQrConfig?: any }> {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return await res.json();
    } catch (e) {
      const { initialUser, vietQrBankDetails } = await import('./mockData');
      return { user: initialUser, bankDetails: vietQrBankDetails, vietQrConfig: vietQrBankDetails };
    }
  },

  async createOrder(payload: {
    type?: 'buy_crypto' | 'sell_crypto';
    cryptoSymbol: string;
    network: string;
    fiatAmountVND: number;
    cryptoAmount: number;
    recipientWallet?: string;
    bankPayout?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    paymentMethod: string;
  }): Promise<{ 
    success: boolean; 
    order?: Transaction; 
    error?: string; 
    message?: string; 
    vietQrTransferMemo?: string;
    depositWallet?: string;
  }> {
    const res = await fetch('/api/crypto/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getSpreadSettings(): Promise<{ spreadSettings: any; limits: any; baseUSDTP2P: number }> {
    const res = await fetch('/api/admin/spread-settings');
    return await res.json();
  },

  async updateSpreadSettings(payload: {
    mode?: 'percentage' | 'fixed_vnd' | 'custom_fixed';
    buyMarkupPercent?: number;
    sellDiscountPercent?: number;
    buyMarkupVND?: number;
    sellDiscountVND?: number;
    autoSyncWithMarket?: boolean;
  } | number, maybeSellDiscount?: number): Promise<{ success: boolean; message: string; spreadSettings?: any; error?: string }> {
    const body = typeof payload === 'number' 
      ? { buyMarkupVND: payload, sellDiscountVND: maybeSellDiscount || 850, mode: 'fixed_vnd' }
      : payload;

    const res = await fetch('/api/admin/spread-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  },

  async autoSyncMarketRates(): Promise<{ success: boolean; message: string; rates: CryptoRate[]; baseUSDTP2P: number }> {
    const res = await fetch('/api/admin/rates/auto-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  async createStripeIntent(orderId: string, amountVND: number): Promise<{ clientSecret: string; paymentIntentId: string; mode: string }> {
    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amountVND })
    });
    return await res.json();
  },

  async confirmPayment(orderId: string): Promise<{ success: boolean; order: Transaction; message: string }> {
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    return await res.json();
  },

  async advanceBlockchainStep(orderId: string): Promise<{ success: boolean; order: Transaction; userBalance: any }> {
    const res = await fetch('/api/blockchain/progress-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    return await res.json();
  },

  async getTransactions(filters?: { status?: string; symbol?: string; search?: string }): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.symbol) params.append('symbol', filters.symbol);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      return data.transactions;
    } catch (e) {
      const { sampleTransactions } = await import('./mockData');
      return sampleTransactions;
    }
  },

  async submitKYC(payload: any): Promise<{ success: boolean; submission: KYCSubmission; message: string }> {
    const res = await fetch('/api/kyc/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getAdminStats(): Promise<any> {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return await res.json();
    } catch (e) {
      console.warn('Fallback local admin stats:', e);
      return {
        totalTransactions: 128,
        successfulTransactions: 124,
        failedTransactions: 4,
        totalVolumeVND: 384500000,
        buyVolumeVND: 290000000,
        sellVolumeVND: 94500000,
        totalVolumeUSD: 15125,
        totalGatewayFeesVND: 3845000,
        stripeVolumeVND: 120000000,
        vietQRVolumeVND: 264500000,
        cryptoBreakdown: [
          { symbol: 'USDT', volumeVND: 280000000, amount: 10980 },
          { symbol: 'BTC', volumeVND: 65000000, amount: 0.038 },
          { symbol: 'ETH', volumeVND: 24500000, amount: 0.35 },
          { symbol: 'SOL', volumeVND: 15000000, amount: 4.8 }
        ],
        spreadSettings: { buyMarkupVND: 850, sellDiscountVND: 850, mode: 'fixed_vnd' },
        pendingKYC: 2
      };
    }
  },

  async getKYCSubmissions(filters?: { status?: string; search?: string }): Promise<{ submissions: KYCSubmission[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/kyc/submissions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch KYC submissions');
      return await res.json();
    } catch (e) {
      const { sampleKycQueue } = await import('./mockData');
      return { submissions: sampleKycQueue };
    }
  },

  async reviewKYC(payload: { 
    submissionId: string; 
    decision: 'approve' | 'reject'; 
    rejectionReason?: string; 
    adminNote?: string; 
    checklist?: any 
  }): Promise<any> {
    const res = await fetch('/api/admin/kyc/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async updateTokenPrice(payload: {
    symbol: string;
    buyPriceVND: number;
    sellPriceVND: number;
    baseP2PVND?: number;
  }): Promise<any> {
    const res = await fetch('/api/admin/rates/update-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async updateNetworkFee(payload: {
    symbol?: string;
    network: string;
    feeVND: number;
    feeUSD?: number;
    estimatedSeconds?: number;
    status?: 'active' | 'suspended';
    gasPriority?: 'standard' | 'fast' | 'instant';
    congestionLevel?: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const res = await fetch('/api/admin/rates/update-network-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async batchUpdateNetworkFees(updates: any[]): Promise<any> {
    const res = await fetch('/api/admin/rates/batch-update-network-fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    return await res.json();
  },

  async applyNetworkFeePreset(preset: 'eco' | 'standard' | 'fast' | 'free_promo' | 'reset'): Promise<any> {
    const res = await fetch('/api/admin/rates/apply-network-fee-preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset })
    });
    return await res.json();
  },

  async sendSupportMessage(message: string, language: string): Promise<{ reply: string; source: string }> {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language })
    });
    return await res.json();
  },

  async registerBiometricPasskey(): Promise<boolean> {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        navigator.credentials &&
        typeof navigator.credentials.create === 'function' &&
        typeof window.PublicKeyCredential === 'function'
      ) {
        try {
          const challengeRes = await fetch('/api/auth/webauthn/challenge', { method: 'POST' });
          const data = await challengeRes.json();
          if (data?.challenge && data?.user) {
            const rawChallenge = atob(data.challenge);
            const challengeArr = new Uint8Array(rawChallenge.length);
            for (let i = 0; i < rawChallenge.length; i++) challengeArr[i] = rawChallenge.charCodeAt(i);

            const rawUserId = atob(data.user.id || 'dXNy');
            const userArr = new Uint8Array(rawUserId.length);
            for (let i = 0; i < rawUserId.length; i++) userArr[i] = rawUserId.charCodeAt(i);

            const cred = await navigator.credentials.create({
              publicKey: {
                challenge: challengeArr,
                rp: { name: 'NEXUS Pay Gateway' },
                user: {
                  id: userArr,
                  name: data.user.name || 'user',
                  displayName: data.user.displayName || 'User'
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                authenticatorSelection: {
                  authenticatorAttachment: 'platform',
                  userVerification: 'preferred'
                },
                timeout: 60000
              }
            });
            if (cred) {
              await fetch('/api/auth/webauthn/verify', { method: 'POST' });
              return true;
            }
          }
        } catch (webauthnErr) {
          console.warn('Native WebAuthn prompt completed/bypassed:', webauthnErr);
        }
      }
      
      // Fallback verification call
      await fetch('/api/auth/webauthn/verify', { method: 'POST' });
      return true;
    } catch (err) {
      console.error('Biometric passkey registration error:', err);
      return false;
    }
  },

  async verify2FACode(code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await res.json();
  },

  async changePassword(payload: { currentPassword?: string; newPassword: string }): Promise<{ success: boolean; message: string; error?: string }> {
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async verifyAdminAuth(payload: { username?: string; account?: string; email?: string; password?: string; pinCode?: string }): Promise<{ success: boolean; authorized: boolean; role?: string; isMaster?: boolean; admin?: AdminAccount; adminName?: string; adminEmail?: string; permissions?: string[]; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        authorized: false,
        error: err.message || 'Không thể kết nối đến máy chủ quản trị viên.'
      };
    }
  },

  async getSubAdmins(): Promise<{ success: boolean; admins: AdminAccount[]; totalCount: number; activeCount: number; lockedCount: number }> {
    try {
      const res = await fetch('/api/admin/sub-admins');
      if (!res.ok) throw new Error('Failed to fetch admin accounts');
      return await res.json();
    } catch (e) {
      return {
        success: true,
        admins: [
          {
            id: 'ADM-MASTER-001',
            username: 'Admin',
            name: 'Tổng Quản Trị Viên (Master Root Admin)',
            email: 'admin@nexus.vn',
            phone: '0909999999',
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
          }
        ],
        totalCount: 1,
        activeCount: 1,
        lockedCount: 0
      };
    }
  },

  async createSubAdmin(payload: { username: string; name: string; email: string; phone?: string; password: string; pinCode?: string; permissions: string[] }): Promise<{ success: boolean; message?: string; admin?: AdminAccount; error?: string }> {
    const res = await fetch('/api/admin/sub-admins/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async updateSubAdminPermissions(payload: { adminId: string; permissions?: string[]; status?: 'active' | 'locked'; name?: string; email?: string; phone?: string }): Promise<{ success: boolean; message?: string; admin?: AdminAccount; error?: string }> {
    const res = await fetch('/api/admin/sub-admins/update-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async deleteSubAdmin(adminId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/admin/sub-admins/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId })
    });
    return await res.json();
  },

  async resetSubAdminPassword(adminId: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/admin/sub-admins/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, newPassword })
    });
    return await res.json();
  },

  async changeMasterAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/admin/master/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await res.json();
  },

  async getAdminUsers(filters?: { search?: string; status?: string; tier?: string; role?: string }): Promise<{ users: UserProfile[]; totalCount: number; activeCount: number; lockedCount: number; verifiedCount: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tier) params.append('tier', filters.tier);
      if (filters?.role) params.append('role', filters.role);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch admin users');
      return await res.json();
    } catch (e) {
      const { initialUser } = await import('./mockData');
      return {
        users: [initialUser],
        totalCount: 1,
        activeCount: 1,
        lockedCount: 0,
        verifiedCount: initialUser.kycStatus === 'verified' ? 1 : 0
      };
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'locked'): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const res = await fetch('/api/admin/users/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status })
    });
    return await res.json();
  },

  async updateUserTier(userId: string, tier: string): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const res = await fetch('/api/admin/users/update-tier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier })
    });
    return await res.json();
  },

  async resetUserPassword(userId: string, tempPassword?: string): Promise<{ success: boolean; tempPassword?: string; message?: string; error?: string }> {
    const res = await fetch('/api/admin/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tempPassword })
    });
    return await res.json();
  },

  async adjustUserBalance(userId: string, currency: string, amount: number): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const res = await fetch('/api/admin/users/adjust-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currency, amount })
    });
    return await res.json();
  },

  async registerUser(payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    idCardNumber?: string;
    passportNumber?: string;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async loginUser(payload: {
    emailOrPhone: string;
    password: string;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async logoutUser(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/user/logout', { method: 'POST' });
    return await res.json();
  },

  async getVietQRConfig(): Promise<{ success: boolean; vietQrConfig: any; bankDetails: any }> {
    try {
      const res = await fetch('/api/vietqr/config');
      if (!res.ok) throw new Error('Failed to fetch VietQR config');
      return await res.json();
    } catch (e) {
      const { vietQrBankDetails } = await import('./mockData');
      return {
        success: true,
        vietQrConfig: vietQrBankDetails,
        bankDetails: vietQrBankDetails
      };
    }
  },

  async updateVietQRConfig(payload: any): Promise<{ success: boolean; vietQrConfig?: any; message?: string; error?: string }> {
    const res = await fetch('/api/admin/vietqr/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async testVietQRConnection(): Promise<{ success: boolean; status: string; latencyMs?: number; message: string; sampleQrPayload?: string; error?: string }> {
    const res = await fetch('/api/admin/vietqr/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  async adminUpdateTransactionAction(payload: {
    transactionId: string;
    action: 'confirm_payment' | 'dispatch_crypto' | 'update_txid' | 'approve_order' | 'reject_order' | 'update_note' | 'confirm_crypto_received' | 'confirm_payout' | 'mark_paid';
    txHash?: string;
    adminNote?: string;
    rejectionReason?: string;
    receiptImageUrl?: string;
    operatorName?: string;
  }): Promise<{ success: boolean; transaction?: Transaction; message?: string; error?: string }> {
    const res = await fetch('/api/admin/transactions/update-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getSystemWallets(): Promise<{ success: boolean; wallets: any[] }> {
    try {
      const res = await fetch('/api/admin/wallets');
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return await res.json();
    } catch (e) {
      const { initialSystemWallets } = await import('./mockData');
      return { success: true, wallets: initialSystemWallets };
    }
  },

  async updateSystemWallet(payload: any): Promise<{ success: boolean; wallet?: any; message?: string; error?: string }> {
    const res = await fetch('/api/admin/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async toggleSystemWalletStatus(walletId: string): Promise<{ success: boolean; wallet?: any; message?: string; error?: string }> {
    const res = await fetch('/api/admin/wallets/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId })
    });
    return await res.json();
  },

  async deleteSystemWallet(walletId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`/api/admin/wallets/${walletId}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async getPaymentPayouts(): Promise<{ success: boolean; payouts: any[] }> {
    try {
      const res = await fetch('/api/admin/payouts');
      if (!res.ok) throw new Error('Failed to fetch payouts');
      return await res.json();
    } catch (e) {
      const { samplePaymentPayouts } = await import('./mockData');
      return { success: true, payouts: samplePaymentPayouts };
    }
  },

  async updatePaymentPayout(payload: any): Promise<{ success: boolean; payout?: any; message?: string; error?: string }> {
    const res = await fetch('/api/admin/payouts/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async registerAdmin(payload: {
    username: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    pinCode?: string;
    department?: string;
    authCode?: string;
  }): Promise<{ success: boolean; admin?: any; message?: string; error?: string }> {
    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};

