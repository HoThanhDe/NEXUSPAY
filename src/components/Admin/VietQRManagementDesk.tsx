import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  QrCode, 
  Key, 
  Webhook, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Radio, 
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { QRCode } from '../../utils/qrcode';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { VietQRConfig } from '../../types';

const POPULAR_BANKS = [
  { name: 'Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)', short: 'VCB', code: '970436', logo: 'VCB' },
  { name: 'MB Bank (Ngân hàng TMCP Quân đội)', short: 'MB', code: '970422', logo: 'MB' },
  { name: 'Techcombank (Ngân hàng Kỹ thương Việt Nam)', short: 'TCB', code: '970407', logo: 'TCB' },
  { name: 'ACB (Ngân hàng TMCP Á Châu)', short: 'ACB', code: '970416', logo: 'ACB' },
  { name: 'VPBank (Ngân hàng TMCP Việt Nam Thịnh Vượng)', short: 'VPB', code: '970432', logo: 'VPB' },
  { name: 'TPBank (Ngân hàng TMCP Tiên Phong)', short: 'TPB', code: '970423', logo: 'TPB' },
  { name: 'BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)', short: 'BIDV', code: '970418', logo: 'BIDV' },
  { name: 'Agribank (Ngân hàng Nông nghiệp và Phát triển Nông thôn)', short: 'VBA', code: '970405', logo: 'VBA' },
  { name: 'Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)', short: 'STB', code: '970403', logo: 'STB' }
];

export const VietQRManagementDesk: React.FC = () => {
  const { addNotification, refreshVietQrConfig } = useApp();

  const [bankName, setBankName] = useState('Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)');
  const [bankShort, setBankShort] = useState('VCB');
  const [bankCode, setBankCode] = useState('970436');
  const [accountNumber, setAccountNumber] = useState('998825420001');
  const [accountName, setAccountName] = useState('NEXUS GATEWAY GLOBAL TECH JSC');
  const [gatewayMemoPrefix, setGatewayMemoPrefix] = useState('NEXUSPAY');

  // API Credentials & Webhook Settings
  const [partnerApiKey, setPartnerApiKey] = useState('napas_live_key_99882200');
  const [partnerApiSecret, setPartnerApiSecret] = useState('napas_sec_8849201994829104');
  const [webhookUrl, setWebhookUrl] = useState('https://api.nexuspay.gateway/v1/vietqr/callback');
  const [autoConfirmDeposit, setAutoConfirmDeposit] = useState(true);
  const [testMode, setTestMode] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [previewQrUrl, setPreviewQrUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load existing configuration from API
  const loadConfig = async () => {
    try {
      const res = await api.getVietQRConfig();
      if (res.vietQrConfig) {
        const c = res.vietQrConfig;
        if (c.bankName) setBankName(c.bankName);
        if (c.bankShort) setBankShort(c.bankShort);
        if (c.bankCode) setBankCode(c.bankCode);
        if (c.accountNumber) setAccountNumber(c.accountNumber);
        if (c.accountName) setAccountName(c.accountName);
        if (c.gatewayMemoPrefix) setGatewayMemoPrefix(c.gatewayMemoPrefix);
        if (c.partnerApiKey) setPartnerApiKey(c.partnerApiKey);
        if (c.partnerApiSecret) setPartnerApiSecret(c.partnerApiSecret);
        if (c.webhookUrl) setWebhookUrl(c.webhookUrl);
        if (c.autoConfirmDeposit !== undefined) setAutoConfirmDeposit(c.autoConfirmDeposit);
        if (c.testMode !== undefined) setTestMode(c.testMode);
      }
    } catch (e) {
      console.warn('Failed to load VietQR config:', e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Update dynamic QR Preview whenever bank details change
  useEffect(() => {
    const payload = `24/7_NAPAS_${bankShort}_${accountNumber}_1000000_${gatewayMemoPrefix}_PREVIEW`;
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
    .then(url => setPreviewQrUrl(url))
    .catch(err => console.error('QR preview error:', err));
  }, [bankShort, accountNumber, gatewayMemoPrefix]);

  const handleSelectPopularBank = (bank: typeof POPULAR_BANKS[0]) => {
    setBankName(bank.name);
    setBankShort(bank.short);
    setBankCode(bank.code);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await api.updateVietQRConfig({
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
        testMode
      });

      if (res.success) {
        setSaveSuccessMsg(res.message || 'Đã lưu cấu hình VietQR thành công!');
        await refreshVietQrConfig();
        addNotification(
          'order_success',
          'Cập nhật VietQR thành công',
          `Hệ thống đã cập nhật số tài khoản nhận tiền: ${bankShort} - ${accountNumber} (${accountName}).`
        );
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testVietQRConnection();
      setTestResult(res);
      if (res.success) {
        addNotification('order_success', 'Kiểm tra API VietQR', res.message);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Lỗi kết nối API ngân hàng.' });
    } finally {
      setIsTesting(false);
    }
  };

  const copyText = (txt: string, keyName: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Cấu Hình VietQR & Kết Nối API Ngân Hàng Napas
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chỉnh sửa số tài khoản nhận tiền, tên ngân hàng thụ hưởng, tiền tố chuyển khoản và API đối tác VietQR 24/7
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Đang Test API...' : 'Kiểm Tra Kết Nối API'}</span>
          </button>
        </div>
      </div>

      {/* Test Connection Banner */}
      {testResult && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
          testResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold">{testResult.message}</div>
            {testResult.latencyMs && (
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Độ trễ phản hồi: <strong className="text-white">{testResult.latencyMs}ms</strong> • Mã ngân hàng: <strong className="text-white">{testResult.bankShort}</strong> • Tên chủ TK: <strong className="text-white">{testResult.accountName}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Left + Live QR Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
            {/* Quick Bank Selector */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                1. Chọn nhanh Ngân Hàng Nhận Tiền Thụ Hưởng
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {POPULAR_BANKS.map(b => (
                  <button
                    key={b.short}
                    type="button"
                    onClick={() => handleSelectPopularBank(b)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      bankShort === b.short 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 text-xs'
                    }`}
                  >
                    <span className="block font-bold text-sm">{b.short}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{b.name.split('(')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Name & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tên Đầy Đủ Ngân Hàng
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mã Ngân Hàng (Napas BIN)
                </label>
                <input
                  type="text"
                  required
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  placeholder="970436"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Account Number & Account Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Số Tài Khoản Nhận Tiền <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="998825420001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tên Chủ Tài Khoản (In Hoa Không Dấu) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  placeholder="NEXUS GATEWAY TECH JSC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Memo Prefix */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tiền Tố Nội Dung Chuyển Khoản (Gateway Memo Prefix)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  value={gatewayMemoPrefix}
                  onChange={e => setGatewayMemoPrefix(e.target.value.toUpperCase())}
                  placeholder="NEXUSPAY"
                  className="w-48 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400">
                  Ví dụ: <strong className="text-emerald-400 font-mono">{gatewayMemoPrefix} TXN-5829-VND</strong> (Hệ thống dựa vào tiền tố này để tự động cộng tiền cho khách)
                </span>
              </div>
            </div>

            {/* API Partner & Webhook Configuration */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Cấu Hình Kết Nối API Đối Tác VietQR / Napas Gateway
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Partner API Key
                  </label>
                  <input
                    type="text"
                    value={partnerApiKey}
                    onChange={e => setPartnerApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Partner Secret Token
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={partnerApiSecret}
                      onChange={e => setPartnerApiSecret(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Webhook URL (Nhận biến động số dư tự động qua IPN)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://api.domain.com/v1/vietqr/callback"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(webhookUrl, 'webhook')}
                    className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-300 text-xs flex items-center space-x-1"
                  >
                    {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'webhook' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center space-x-3 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoConfirmDeposit}
                    onChange={e => setAutoConfirmDeposit(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Tự động khớp lệnh khi tiền về</span>
                    <span className="text-[10px] text-slate-400">Tự động kích hoạt Smart Contract phát hành USDT</span>
                  </div>
                </label>

                <label className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center space-x-3 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={e => setTestMode(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Chế độ Sandbox / Testnet</span>
                    <span className="text-[10px] text-slate-400">Sử dụng môi trường kiểm thử không trừ tiền thật</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình VietQR & Cổng Ngân Hàng Ngay</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Live QR Generator Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Xem Trước Mã VietQR Sinh Thời Gian Thực
              </h4>
            </div>

            {/* QR Box */}
            <div className="p-3 bg-white rounded-3xl shadow-2xl inline-block mb-4">
              {previewQrUrl ? (
                <img src={previewQrUrl} alt="VietQR Preview" className="w-48 h-48 rounded-xl" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="w-full space-y-2 text-left text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Ngân hàng:</span>
                <strong className="text-white">{bankShort} - {bankCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số tài khoản:</span>
                <strong className="text-emerald-400 font-mono">{accountNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <strong className="text-slate-200">{accountName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền tố memo:</span>
                <strong className="text-cyan-400 font-mono">{gatewayMemoPrefix}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Mã QR này sẽ lập tức được hiển thị cho tất cả khách hàng khi họ chọn phương thức thanh toán VietQR Napas trên trang Mua Crypto.
            </p>
          </div>

          {/* Quick API Documentation Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl text-xs space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Building2 className="w-4 h-4" />
              <span>Tiêu chuẩn Napas 24/7 VietQR</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Chuẩn Napas VietQR định dạng EMVCo hỗ trợ quét mã từ hơn 40 ứng dụng ngân hàng tại Việt Nam (VCB Digibank, MB Bank, Techcombank Mobile, Cake, Timo, v.v.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
