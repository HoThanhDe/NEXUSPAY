import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  Save, 
  Check, 
  RefreshCw, 
  Lock, 
  KeyRound, 
  Server, 
  Cpu, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  Database, 
  Globe 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SystemSettingsDesk: React.FC = () => {
  const { addNotification } = useApp();

  const [settings, setSettings] = useState({
    tier0LimitVND: 0,
    tier1LimitVND: 10000000,
    tier2LimitVND: 300000000,
    maintenanceMode: false,
    require2FAForWithdrawal: true,
    requirePasskeyForAdmin: true,
    ethereumGasBufferGwei: 25,
    solanaPriorityFeeMicroLamports: 5000,
    tronBandwidthReserve: 1500,
    autoApproveUnder10M: true,
    stripeWebhookSecret: 'whsec_99482710492817263547281',
    vietqrAutoReconciliationIntervalSec: 5,
    nodeClusterStatus: 'Healthy (Asia-Southeast1 Singapore & Hanoi Edge)'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Đã lưu cấu hình cài đặt hệ thống thành công!');
      addNotification('security_alert', 'Cập Nhật Cài Đặt Hệ Thống', 'Các tham số hạn mức KYC và thông số bảo mật đã được áp dụng toàn sàn.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Cài Đặt Hệ Thống & Kiểm Soát Rủi Ro</h3>
            <p className="text-xs text-slate-400">
              Quản lý hạn mức giao dịch KYC theo tháng, cơ chế bảo mật Passkey/2FA và buffer phí mạng chuỗi khối
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hệ Thống Trực Tuyến 99.99%</span>
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: KYC Tier Monthly Limits */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Hạn Mức Giao Dịch Tháng Theo Cấp Độ KYC</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Cấp 0 (Chưa KYC / Khách Vãng Lai):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.tier0LimitVND}
                  onChange={e => setSettings({ ...settings, tier0LimitVND: Number(e.target.value) })}
                  className="w-full pl-3 pr-12 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-bold">VND</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Yêu cầu hoàn tất KYC để bắt đầu mua bán crypto.</p>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Cấp 1 - KYC Cơ Bản (CCCD / Hộ Chiếu):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.tier1LimitVND}
                  onChange={e => setSettings({ ...settings, tier1LimitVND: Number(e.target.value) })}
                  className="w-full pl-3 pr-12 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-[11px] font-bold">VND</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Mặc định: 10.000.000 ₫/tháng sau khi đối chiếu giấy tờ tùy thân.</p>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Cấp 2 - KYC Nâng Cao (Sinh Trắc Học AI Face ID):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.tier2LimitVND}
                  onChange={e => setSettings({ ...settings, tier2LimitVND: Number(e.target.value) })}
                  className="w-full pl-3 pr-12 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-[11px] font-bold">VND</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Mặc định: 300.000.000 ₫/tháng sau khi xác thực video selfie & tài liệu cư trú.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Authentication Policy */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Chính Sách Bảo Mật & Xác Thực 2FA</span>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Bắt Buộc 2FA Khi Rút Tiền / Bán Crypto</span>
                <span className="text-slate-500 text-[11px]">Yêu cầu nhập mã OTP TOTP 6 số trước khi giải ngân VND về tài khoản</span>
              </div>
              <input
                type="checkbox"
                checked={settings.require2FAForWithdrawal}
                onChange={e => setSettings({ ...settings, require2FAForWithdrawal: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Bảo Mật Bàn Quản Trị Bằng Passkey Sinh Trắc Học</span>
                <span className="text-slate-500 text-[11px]">Yêu cầu vân tay / Face ID FIDO2 khi đăng nhập tài khoản quản trị viên</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requirePasskeyForAdmin}
                onChange={e => setSettings({ ...settings, requirePasskeyForAdmin: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-rose-950/30 rounded-2xl border border-rose-900/40 cursor-pointer">
              <div>
                <span className="font-semibold text-rose-300 block">Chế Độ Bảo Trì Hệ Thống Toàn Sàn</span>
                <span className="text-rose-400/80 text-[11px]">Tạm dừng nhận lệnh mua/bán mới khi nâng cấp máy chủ hoặc Smart Contract</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Blockchain Gas Buffer Settings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Buffer Gas Fee & Thông Số Chuỗi Khối (On-Chain)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Ethereum / Arbitrum Gas Buffer:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.ethereumGasBufferGwei}
                  onChange={e => setSettings({ ...settings, ethereumGasBufferGwei: Number(e.target.value) })}
                  className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-bold">GWEI</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Solana Priority Fee:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.solanaPriorityFeeMicroLamports}
                  onChange={e => setSettings({ ...settings, solanaPriorityFeeMicroLamports: Number(e.target.value) })}
                  className="w-full pl-3 pr-24 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-bold">µLamports</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                TRON Energy / Bandwidth Buffer (TRC-20):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.tronBandwidthReserve}
                  onChange={e => setSettings({ ...settings, tronBandwidthReserve: Number(e.target.value) })}
                  className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-bold">SUN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Webhooks & Reconciliation Engine */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Động Cơ Đối Soát Tự Động & API Webhooks</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Chu Kỳ Quét Ngân Hàng VietQR 24/7 (Giây):
              </label>
              <input
                type="number"
                value={settings.vietqrAutoReconciliationIntervalSec}
                onChange={e => setSettings({ ...settings, vietqrAutoReconciliationIntervalSec: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Stripe Webhook Secret (SSL Ingress):
              </label>
              <input
                type="password"
                value={settings.stripeWebhookSecret}
                onChange={e => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Cụm Máy Chủ Đám Mây:
              </label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[11px] flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{settings.nodeClusterStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-cyan-500/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu & Cập Nhật Cài Đặt Hệ Thống</span>
          </button>
        </div>
      </form>
    </div>
  );
};
