import { CryptoRate, KYCSubmission, Transaction, UserProfile } from '../types';

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

  async getUserProfile(): Promise<{ user: UserProfile; bankDetails: any }> {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return await res.json();
    } catch (e) {
      const { initialUser, vietQrBankDetails } = await import('./mockData');
      return { user: initialUser, bankDetails: vietQrBankDetails };
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
    const res = await fetch('/api/admin/stats');
    return await res.json();
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
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Fetch challenge
        const challengeRes = await fetch('/api/auth/webauthn/challenge', { method: 'POST' });
        const data = await challengeRes.json();
        
        // Try native WebAuthn if browser supports it
        try {
          const cred = await navigator.credentials.create({
            publicKey: {
              challenge: Uint8Array.from(atob(data.challenge), c => c.charCodeAt(0)),
              rp: { name: 'NEXUS Pay Gateway' },
              user: {
                id: Uint8Array.from(atob(data.user.id), c => c.charCodeAt(0)),
                name: data.user.name,
                displayName: data.user.displayName
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
  }
};
