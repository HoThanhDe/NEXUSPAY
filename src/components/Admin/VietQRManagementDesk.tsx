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
  Sparkles,
  Layers,
  Search,
  Code
} from 'lucide-react';
import { 
  VIETNAM_BANKS, 
  buildVietQREMVCo, 
  buildVietQRImageUrl, 
  generateVietQRDataURL, 
  findBank,
  VietQRBank 
} from '../../utils/vietqr';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { VietQRConfig } from '../../types';

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

  // Search bank filter
  const [bankSearch, setBankSearch] = useState('');

  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [previewQrUrl, setPreviewQrUrl] = useState('');
  const [previewEmvco, setPreviewEmvco] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'card' | 'pure_emvco'>('card');

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
    const cleanBin = bankCode || '970436';
    const memo = `${gatewayMemoPrefix}_PREVIEW`;
    const emvco = buildVietQREMVCo({
      bankBin: cleanBin,
      accountNumber,
      amount: 1000000,
      memo
    });
    setPreviewEmvco(emvco);

    generateVietQRDataURL({
      bankBin: cleanBin,
      accountNumber,
      accountName,
      amount: 1000000,
      memo
    }, 280)
    .then(url => setPreviewQrUrl(url))
    .catch(err => console.error('QR preview error:', err));
  }, [bankCode, bankShort, accountNumber, accountName, gatewayMemoPrefix]);

  const handleSelectBank = (bank: VietQRBank) => {
    setBankName(bank.name);
    setBankShort(bank.shortName);
    setBankCode(bank.bin);
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
          'Cập nhật VietQR chuẩn quốc gia thành công',
          `Hệ thống đã đồng bộ số tài khoản nhận tiền: ${bankShort} - ${accountNumber} (BIN: ${bankCode}) cho toàn bộ cổng thanh toán.`
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
        addNotification('order_success', 'Kiểm tra API VietQR Chuẩn', res.message);
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

  const filteredBanks = VIETNAM_BANKS.filter(b => 
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.bin.includes(bankSearch)
  );

  const previewCardUrl = buildVietQRImageUrl({
    bankBin: bankCode || '970436',
    accountNumber,
    accountName,
    amount: 1000000,
    memo: `${gatewayMemoPrefix}_PREVIEW`,
    template: 'compact2'
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Quản Trị Cổng VietQR Chuẩn Quốc Gia (Napas 24/7 • EMVCo)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Chuẩn VietQR.vn / PayOS / SePay
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động tạo mã QR EMVCo theo chuẩn Ngân Hàng Nhà Nước Việt Nam & NAPAS, hỗ trợ quét mã từ tất cả app ngân hàng (VCB, MB, TCB, VPB, ACB...)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Đang Test API...' : 'Kiểm Tra Kết Nối Napas API'}</span>
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
                Độ trễ phản hồi: <strong className="text-white">{testResult.latencyMs}ms</strong> • Mã BIN: <strong className="text-white">{testResult.bankShort || bankCode}</strong> • Tên chủ TK: <strong className="text-white">{testResult.accountName || accountName}</strong>
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
            {/* Quick Bank Selector with Search */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 block">
                  1. Chọn Ngân Hàng Nhận Tiền Thụ Hưởng (Toàn bộ 40+ Ngân Hàng Việt Nam)
                </label>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên/BIN..."
                    value={bankSearch || ''}
                    onChange={e => setBankSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                {filteredBanks.map(b => (
                  <button
                    key={b.bin}
                    type="button"
                    onClick={() => handleSelectBank(b)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      bankCode === b.bin 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 text-xs'
                    }`}
                  >
                    <span className="block font-bold text-xs">{b.shortName}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">BIN: {b.bin}</span>
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
                  value={bankName || ''}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mã Ngân Hàng (Napas BIN 6 Số) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankCode || ''}
                  onChange={e => setBankCode(e.target.value)}
                  placeholder="970436"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
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
                  value={accountNumber || ''}
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
                  value={accountName || ''}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  placeholder="NEXUS GATEWAY GLOBAL TECH JSC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Memo Prefix */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tiền Tố Nội Dung Chuyển Khoản (Gateway Memo Prefix)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  required
                  value={gatewayMemoPrefix || ''}
                  onChange={e => setGatewayMemoPrefix(e.target.value.toUpperCase())}
                  placeholder="NEXUSPAY"
                  className="w-48 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400">
                  Ví dụ: <strong className="text-emerald-400 font-mono">{gatewayMemoPrefix} TXN-5829-VND</strong> (Khớp lệnh tự động)
                </span>
              </div>
            </div>

            {/* API Partner & Webhook Configuration */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Cấu Hình Tích Hợp API VietQR / PayOS / SePay Gateway
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Partner Client / API Key
                  </label>
                  <input
                    type="text"
                    value={partnerApiKey || ''}
                    onChange={e => setPartnerApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Partner Secret Token / Checksum Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={partnerApiSecret || ''}
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
                    value={webhookUrl || ''}
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
                    <span className="text-[10px] text-slate-400">Tự động kích hoạt Smart Contract phát hành USDT/Crypto</span>
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
                    <span className="text-[10px] text-slate-400">Môi trường kiểm thử độc lập không trừ tiền thật</span>
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
                  <span>Lưu Cấu Hình VietQR Chuẩn Quốc Gia Ngay</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Live QR Generator Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Mã VietQR Sinh Thời Gian Thực
              </h4>
            </div>

            {/* Preview Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  previewMode === 'card' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Thẻ Napas 24/7
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('pure_emvco')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  previewMode === 'pure_emvco' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mã EMVCo Thuần
              </button>
            </div>

            {/* QR Box */}
            <div className="p-2 bg-white rounded-2xl shadow-2xl inline-block mb-3 max-w-full">
              {previewMode === 'card' ? (
                <img 
                  src={previewCardUrl} 
                  alt="VietQR Card Preview" 
                  onError={(e) => {
                    if (previewQrUrl) (e.target as HTMLImageElement).src = previewQrUrl;
                  }}
                  className="w-52 h-auto rounded-xl object-contain" 
                />
              ) : (
                <div className="p-2">
                  {previewQrUrl ? (
                    <img src={previewQrUrl} alt="VietQR Preview" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg" />
                  )}
                  <div className="mt-1 text-[9px] font-bold text-slate-800">
                    EMVCo • BIN {bankCode}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-2 text-left text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Ngân hàng:</span>
                <strong className="text-white">{bankShort} (BIN: {bankCode})</strong>
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

            {/* EMVCo Payload Box */}
            <div className="w-full mt-3 text-left">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Chuỗi Payload chuẩn EMVCo:</span>
                <button 
                  onClick={() => copyText(previewEmvco, 'preview_emvco')}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'preview_emvco' ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[9px] font-mono text-slate-400 break-all leading-tight">
                {previewEmvco}
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl text-xs space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Building2 className="w-4 h-4" />
              <span>Tiêu chuẩn Napas 24/7 & VietQR</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Mã QR tuân thủ nghiêm ngặt chuẩn EMVCo của Ngân Hàng Nhà Nước Việt Nam. Cho phép khách hàng mở bất kỳ ứng dụng ngân hàng nào để quét mã thanh toán tức thì với số tiền và nội dung tự động điền chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
