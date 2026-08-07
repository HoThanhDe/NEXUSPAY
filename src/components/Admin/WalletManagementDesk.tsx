import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  QrCode, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Power,
  X,
  Download
} from 'lucide-react';
import { SystemWallet } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const WalletManagementDesk: React.FC = () => {
  const { addNotification } = useApp();
  const [wallets, setWallets] = useState<SystemWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<SystemWallet | null>(null);
  const [coinInput, setCoinInput] = useState('USDT');
  const [networkInput, setNetworkInput] = useState('TRC20');
  const [addressInput, setAddressInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [statusInput, setStatusInput] = useState<'active' | 'suspended'>('active');

  // Big QR Code Preview Modal
  const [qrModalWallet, setQrModalWallet] = useState<SystemWallet | null>(null);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const res = await api.getSystemWallets();
      if (res.success && res.wallets) {
        setWallets(res.wallets);
      }
    } catch (err) {
      console.error('Failed to load system wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('info', 'Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
  };

  const handleOpenCreateModal = () => {
    setEditingWallet(null);
    setCoinInput('USDT');
    setNetworkInput('TRC20');
    setAddressInput('');
    setLabelInput('');
    setStatusInput('active');
    setShowModal(true);
  };

  const handleOpenEditModal = (w: SystemWallet) => {
    setEditingWallet(w);
    setCoinInput(w.coin);
    setNetworkInput(w.network);
    setAddressInput(w.address);
    setLabelInput(w.label || '');
    setStatusInput(w.status);
    setShowModal(true);
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      addNotification('security_alert', 'Thiếu thông tin', 'Vui lòng nhập địa chỉ ví nhận.');
      return;
    }

    try {
      const payload = {
        id: editingWallet ? editingWallet.id : undefined,
        coin: coinInput,
        network: networkInput,
        address: addressInput.trim(),
        label: labelInput.trim() || `Ví Ký Quỹ ${coinInput} (${networkInput})`,
        status: statusInput
      };

      const res = await api.updateSystemWallet(payload);
      if (res.success) {
        addNotification('order_success', editingWallet ? 'Cập nhật ví thành công' : 'Thêm ví mới thành công', res.message || 'Cấu hình ví đã được lưu vào hệ thống.');
        setShowModal(false);
        await loadWallets();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi lưu ví', err.message);
    }
  };

  const handleToggleStatus = async (walletId: string) => {
    try {
      const res = await api.toggleSystemWalletStatus(walletId);
      if (res.success) {
        addNotification('info', 'Thay đổi trạng thái', res.message || 'Trạng thái ví đã thay đổi.');
        await loadWallets();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi thao tác', err.message);
    }
  };

  const handleDeleteWallet = async (walletId: string, coin: string, network: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cấu hình ví nhận ${coin} (${network}) không?`)) {
      return;
    }
    try {
      const res = await api.deleteSystemWallet(walletId);
      if (res.success) {
        addNotification('info', 'Đã xóa ví', res.message || 'Đã xóa ví khỏi hệ thống.');
        await loadWallets();
      }
    } catch (err: any) {
      addNotification('security_alert', 'Lỗi xóa ví', err.message);
    }
  };

  const filteredWallets = wallets.filter(w => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        w.coin.toLowerCase().includes(q) ||
        w.network.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        (w.label && w.label.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">3. Quản Lý Ví Nhận (Wallet Management)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Admin cấu hình địa chỉ ví dùng để nhận Crypto từ khách hàng khi khách đặt lệnh Bán Crypto
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Coin, Network, Địa chỉ ví..."
              className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={loadWallets}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Làm mới danh sách ví"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ví Nhận Mới</span>
          </button>
        </div>
      </div>

      {/* Standard Table Layout requested by user */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-sm font-bold text-white">
            Danh Sách Cấu Hình Ví Ký Quỹ ({filteredWallets.length} ví)
          </div>
          <div className="text-xs text-slate-400">
            Tự động cập nhật vào QR Code nạp tiền cho khách hàng khi giao dịch
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                <th className="py-3 px-3">Coin</th>
                <th className="py-3 px-3">Blockchain (Network)</th>
                <th className="py-3 px-3">Wallet Address (Địa chỉ ví)</th>
                <th className="py-3 px-3">QR Code</th>
                <th className="py-3 px-3">Status (Trạng thái)</th>
                <th className="py-3 px-3 text-right">Actions (Thao tác)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredWallets.map(w => (
                <tr key={w.id} className="hover:bg-slate-850/50 text-slate-300 transition-colors">
                  {/* Coin */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                        {w.coin.slice(0, 1)}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">{w.coin}</div>
                        <div className="text-[10px] text-slate-400">{w.label}</div>
                      </div>
                    </div>
                  </td>

                  {/* Network */}
                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 font-bold text-[11px] border border-slate-700">
                      {w.network}
                    </span>
                  </td>

                  {/* Wallet Address */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono break-all text-xs bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                        {w.address}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(w.address, `Địa chỉ ví ${w.coin}`)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg bg-slate-800 hover:bg-slate-700"
                        title="Sao chép địa chỉ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* QR Code */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center space-x-2">
                      <div 
                        onClick={() => setQrModalWallet(w)}
                        className="cursor-pointer p-1 bg-white rounded-lg hover:scale-105 transition-transform"
                        title="Click để phóng to mã QR"
                      >
                        <img
                          src={w.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(w.address)}`}
                          alt={w.coin}
                          className="w-7 h-7"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setQrModalWallet(w)}
                        className="text-[11px] text-cyan-400 hover:underline font-semibold"
                      >
                        Xem QR
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 font-sans">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(w.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center space-x-1.5 transition-all ${
                        w.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title="Bấm để chuyển trạng thái"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{w.status === 'active' ? 'Hoạt động (Active)' : 'Tạm ngừng (Suspended)'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right font-sans">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(w)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Sửa địa chỉ ví"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(w.id)}
                        className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors ${
                          w.status === 'active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                        title={w.status === 'active' ? 'Tạm ngừng ví này' : 'Kích hoạt ví này'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWallet(w.id, w.coin, w.network)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Xóa cấu hình ví"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT WALLET MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingWallet ? `Sửa Cấu Hình Ví ${editingWallet.coin} (${editingWallet.network})` : 'Thêm Cấu Hình Ví Nhận Crypto Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Loại Đồng Coin:</label>
                  <select
                    value={coinInput}
                    onChange={e => setCoinInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="SOL">SOL (Solana)</option>
                    <option value="BNB">BNB (Binance Coin)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Blockchain (Network):</label>
                  <select
                    value={networkInput}
                    onChange={e => setNetworkInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="TRC20">TRC20 (Tron Network)</option>
                    <option value="BEP20">BEP20 (BNB Smart Chain)</option>
                    <option value="ERC20">ERC20 (Ethereum Mainnet)</option>
                    <option value="Bitcoin">Bitcoin (Native SegWit / Legacy)</option>
                    <option value="Solana">Solana (SPL)</option>
                    <option value="Polygon">Polygon (PoS)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Địa chỉ ví nhận (Wallet Address):</label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={e => setAddressInput(e.target.value)}
                  placeholder="Nhập chính xác địa chỉ ví chuỗi khối (ví dụ: T..., 0x..., bc1...)"
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nhãn mô tả / Tên ví:</label>
                <input
                  type="text"
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  placeholder="Ví dụ: Ví Ký Quỹ Lạnh Khách Bán USDT - Tron"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Trạng thái cấu hình:</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={statusInput === 'active'}
                      onChange={() => setStatusInput('active')}
                      className="accent-cyan-500"
                    />
                    <span className="text-emerald-400 font-semibold">Hoạt động (Active)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={statusInput === 'suspended'}
                      onChange={() => setStatusInput('suspended')}
                      className="accent-cyan-500"
                    />
                    <span className="text-rose-400 font-semibold">Tạm ngừng (Suspended)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30"
                >
                  {editingWallet ? 'Lưu Thay Đổi' : 'Thêm Ví Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIG QR MODAL */}
      {qrModalWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                Mã QR Ví {qrModalWallet.coin} ({qrModalWallet.network})
              </h3>
              <button
                type="button"
                onClick={() => setQrModalWallet(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-2xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrModalWallet.address)}`}
                alt={qrModalWallet.coin}
                className="w-52 h-52"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Địa chỉ ví nhận:</div>
              <div className="text-xs font-mono text-cyan-300 break-all">{qrModalWallet.address}</div>
            </div>

            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => copyToClipboard(qrModalWallet.address, `Địa chỉ ví ${qrModalWallet.coin}`)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </button>
              <button
                type="button"
                onClick={() => setQrModalWallet(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
