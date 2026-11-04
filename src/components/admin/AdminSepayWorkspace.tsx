"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  CreditCard,
  QrCode,
  Package,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  DollarSign,
  Search,
  Eye,
} from "lucide-react";
import { VIETQR_BANKS, PackageItem, TransactionRecord } from "@/lib/sepay-types";

export default function AdminSepayWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState<"config" | "packages" | "transactions">("config");

  // Config State
  const [config, setConfig] = useState({
    enabled: true,
    bankCode: "MBBank",
    accountNumber: "0987654321",
    accountHolder: "CONG TY TNHH HSK EDU",
    apiToken: "",
    transferPrefix: "HSK",
    qrTemplate: "compact" as "compact" | "compact2" | "qr_only" | "print",
    placements: {
      showInStudentSidebar: false,
      showInStudentHomeQuickActions: false,
      showInStudentLessonCatalog: false,
      showOnAiQuotaExceeded: false,
    },
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Packages State
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch SePay Config
  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch("/api/v1/admin/sepay");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig((prev) => ({
          ...prev,
          ...data.config,
          placements: {
            ...prev.placements,
            ...(data.config.placements || {}),
          },
          apiToken: data.config.apiTokenMasked || "",
        }));
        setWebhookUrl(data.webhookUrl || "");
      }
    } catch (err) {
      console.error("Fetch config failed:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Fetch Packages
  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const res = await fetch("/api/v1/admin/packages");
      const data = await res.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Fetch packages failed:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch("/api/v1/admin/transactions");
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Fetch transactions failed:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchPackages();
    fetchTransactions();
  }, []);

  // Save SePay Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      setConfigMsg(null);
      const res = await fetch("/api/v1/admin/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConfigMsg({ text: "Lưu cấu hình SePay thành công!", type: "success" });
      } else {
        setConfigMsg({ text: data.error || "Không thể lưu cấu hình", type: "error" });
      }
    } catch (err: any) {
      setConfigMsg({ text: err.message || "Lỗi kết nối", type: "error" });
    } finally {
      setSavingConfig(false);
    }
  };

  // Copy Webhook Link
  const handleCopyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Save / Update Package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      const action = isCreatingPackage ? "create" : "update";
      const res = await fetch("/api/v1/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, packageData: editingPackage }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingPackage(null);
        setIsCreatingPackage(false);
        fetchPackages();
      } else {
        alert(data.error || "Lỗi lưu gói học");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối");
    }
  };

  // Delete Package
  const handleDeletePackage = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gói học này không?")) return;
    try {
      const res = await fetch("/api/v1/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", packageId: id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPackages();
      }
    } catch (err) {
      console.error("Delete package error:", err);
    }
  };

  // Manual Activate Transaction
  const handleManualActivate = async (transactionId: string) => {
    if (!confirm("Xác nhận kích hoạt thủ công gói học này cho học viên?")) return;
    try {
      setActionLoadingId(transactionId);
      const res = await fetch("/api/v1/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual_activate", transactionId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchTransactions();
      } else {
        alert(data.error || "Không thể kích hoạt");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered transactions
  const filteredTxs = transactions.filter((t) => {
    if (!txSearch) return true;
    const s = txSearch.toLowerCase();
    return (
      t.orderCode.toLowerCase().includes(s) ||
      t.userName.toLowerCase().includes(s) ||
      t.packageName.toLowerCase().includes(s)
    );
  });

  // Sample live preview QR URL
  const previewQrUrl = `https://qr.sepay.vn/img?acc=${config.accountNumber || "0987654321"}&bank=${
    config.bankCode || "MBBank"
  }&amount=10000&des=${config.transferPrefix || "HSK"}TEST&template=${config.qrTemplate || "compact"}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D7C9AB]/80 bg-[#FFFCF6] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                Cổng Thanh Toán Tự Động SePay (VietQR)
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold text-amber-800">
                Thương Mại HSK
              </span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[#1A3D2F]">
              Quản Trị Thanh Toán & Gói Học Thương Mại
            </h2>
            <p className="mt-1 text-xs text-[#526c50] max-w-2xl leading-relaxed">
              Tích hợp mã QR ngân hàng VietQR qua SePay. Khi học viên chuyển tiền vào số tài khoản, hệ thống tự động
              quét và kích hoạt khóa học, nâng cấp quyền lợi VIP & hạn mức AI ngay lập tức!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchConfig();
                fetchPackages();
                fetchTransactions();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs font-semibold text-[#1A3D2F] hover:bg-[#FAF7F0] transition shadow-xs"
            >
              <RefreshCw size={14} className={loadingConfig || loadingPackages ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#D7C9AB]/40 pt-4">
          <button
            onClick={() => setActiveSubTab("config")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "config"
                ? "bg-[#204434] text-white shadow-sm"
                : "bg-white text-[#526c50] hover:bg-[#FAF7F0] border border-[#D7C9AB]/50"
            }`}
          >
            <QrCode size={15} />
            Cấu hình Tài khoản SePay & VietQR
          </button>
          <button
            onClick={() => setActiveSubTab("packages")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "packages"
                ? "bg-[#204434] text-white shadow-sm"
                : "bg-white text-[#526c50] hover:bg-[#FAF7F0] border border-[#D7C9AB]/50"
            }`}
          >
            <Package size={15} />
            Quản lý Gói học & Đơn giá ({packages.length})
          </button>
          <button
            onClick={() => setActiveSubTab("transactions")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === "transactions"
                ? "bg-[#204434] text-white shadow-sm"
                : "bg-white text-[#526c50] hover:bg-[#FAF7F0] border border-[#D7C9AB]/50"
            }`}
          >
            <History size={15} />
            Lịch sử Giao dịch ({transactions.length})
          </button>
        </div>
      </div>

      {/* 1. SEPAY CONFIG SUBTAB */}
      {activeSubTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Setup */}
          <div className="lg:col-span-7 rounded-3xl border border-[#D7C9AB]/80 bg-[#FFFCF6] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#D7C9AB]/40 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="text-[#BC9B6B]" size={20} />
                <h3 className="font-serif text-lg font-bold text-[#1A3D2F]">Thông tin Tài khoản Ngân hàng (SePay)</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[#204434]">
                  {config.enabled ? "Đang Bật Thanh Toán" : "Tạm Tắt"}
                </span>
              </label>
            </div>

            {configMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  configMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                    : "bg-rose-50 border border-rose-300 text-rose-800"
                }`}
              >
                {configMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {configMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                  Ngân hàng thụ hưởng (VietQR) *
                </label>
                <select
                  value={config.bankCode}
                  onChange={(e) => setConfig({ ...config, bankCode: e.target.value })}
                  className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                >
                  {VIETQR_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                    Số tài khoản ngân hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.accountNumber}
                    onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                    placeholder="VD: 0987654321"
                    className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                    Tên chủ tài khoản (In hoa không dấu) *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.accountHolder}
                    onChange={(e) => setConfig({ ...config, accountHolder: e.target.value.toUpperCase() })}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                    Tiền tố cú pháp chuyển khoản
                  </label>
                  <input
                    type="text"
                    value={config.transferPrefix}
                    onChange={(e) => setConfig({ ...config, transferPrefix: e.target.value.toUpperCase() })}
                    placeholder="VD: HSK"
                    className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                  />
                  <span className="text-[10px] text-[#526c50] mt-0.5 block">
                    Cú pháp tạo tự động: {config.transferPrefix || "HSK"}123456
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                    Mẫu hiển thị VietQR
                  </label>
                  <select
                    value={config.qrTemplate}
                    onChange={(e) => setConfig({ ...config, qrTemplate: e.target.value as any })}
                    className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                  >
                    <option value="compact">Gọn đẹp (compact - Khuyên dùng)</option>
                    <option value="compact2">Gọn có thông tin người nhận (compact2)</option>
                    <option value="qr_only">Chỉ hiện mã QR (qr_only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                  SePay Webhook Token / API Key
                </label>
                <input
                  type="text"
                  value={config.apiToken}
                  onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                  placeholder="Dán API Key hoặc Webhook Token lấy trên trang SePay.vn"
                  className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                />
                <span className="text-[10px] text-[#526c50] mt-0.5 block">
                  Dùng để xác thực webhook tự động khi tiền về tài khoản.
                </span>
              </div>

              {/* Webhook Endpoint */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-600" />
                    Webhook URL cấu hình trên SePay:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 transition"
                  >
                    {copiedWebhook ? <Check size={13} /> : <Copy size={13} />}
                    {copiedWebhook ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
                <div className="rounded-xl bg-white/90 border border-amber-300 p-2.5 text-[11px] font-mono text-emerald-950 break-all select-all">
                  {webhookUrl || "Đang tạo URL..."}
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  📌 <strong>Cách kết nối:</strong> Đăng nhập tài khoản trên{" "}
                  <a href="https://my.sepay.vn" target="_blank" rel="noreferrer" className="underline font-bold">
                    SePay.vn
                  </a>{" "}
                  &gt; Cấu hình Webhook &gt; Dán đường link trên vào &gt; Chọn kiểu xác thực Bearer Token (dùng Token ở trên).
                </p>
              </div>

              {/* Vị trí hiển thị do Admin quyết định */}
              <div className="rounded-2xl border border-[#D7C9AB]/80 bg-[#FAF7F0] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#8F6D3B]" />
                  <h4 className="font-bold text-xs text-[#1A3D2F]">
                    Vị Trí Hiển Thị Nút Nâng Cấp & Mã QR (Admin tự chọn)
                  </h4>
                </div>
                <p className="text-[11px] text-[#526c50] leading-relaxed">
                  Chỉ khi bạn tích chọn vị trí nào thì nút/khung Nâng cấp gói học mới hiển thị tại vị trí đó trên giao diện học viên. Mặc định sẽ không hiện ở đâu nếu bạn chưa bật.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#D7C9AB]/50 cursor-pointer hover:border-[#204434] transition">
                    <input
                      type="checkbox"
                      checked={config.placements?.showInStudentSidebar || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          placements: { ...config.placements, showInStudentSidebar: e.target.checked },
                        })
                      }
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#1A3D2F]">
                      Menu bên trái (Sidebar) học viên
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#D7C9AB]/50 cursor-pointer hover:border-[#204434] transition">
                    <input
                      type="checkbox"
                      checked={config.placements?.showInStudentHomeQuickActions || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          placements: { ...config.placements, showInStudentHomeQuickActions: e.target.checked },
                        })
                      }
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#1A3D2F]">
                      Khung thao tác nhanh Trang chủ học viên
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#D7C9AB]/50 cursor-pointer hover:border-[#204434] transition">
                    <input
                      type="checkbox"
                      checked={config.placements?.showInStudentLessonCatalog || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          placements: { ...config.placements, showInStudentLessonCatalog: e.target.checked },
                        })
                      }
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#1A3D2F]">
                      Banner trong Kho bài học & Khám phá
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#D7C9AB]/50 cursor-pointer hover:border-[#204434] transition">
                    <input
                      type="checkbox"
                      checked={config.placements?.showOnAiQuotaExceeded || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          placements: { ...config.placements, showOnAiQuotaExceeded: e.target.checked },
                        })
                      }
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#1A3D2F]">
                      Gợi ý nâng cấp khi dùng hết hạn mức AI
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex items-center gap-2 rounded-xl bg-[#204434] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2c5a45] transition cursor-pointer"
                >
                  {savingConfig ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Lưu Cấu Hình SePay
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview VietQR */}
          <div className="lg:col-span-5 rounded-3xl border border-[#D7C9AB]/80 bg-[#FFFCF6] p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">
              <Eye size={14} />
              Xem trước Mã VietQR thời gian thực
            </div>

            <div className="relative p-4 rounded-2xl bg-white border border-[#D7C9AB] shadow-md max-w-[280px] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewQrUrl}
                alt="VietQR SePay Preview"
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>

            <div className="w-full text-left bg-white/80 rounded-2xl border border-[#D7C9AB]/50 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#526c50]">Ngân hàng:</span>
                <span className="font-bold text-[#1A3D2F]">{config.bankCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526c50]">Số tài khoản:</span>
                <span className="font-bold text-[#1A3D2F]">{config.accountNumber || "Chưa nhập"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526c50]">Chủ tài khoản:</span>
                <span className="font-bold text-[#1A3D2F]">{config.accountHolder || "Chưa nhập"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526c50]">Cú pháp mẫu:</span>
                <span className="font-mono font-bold text-amber-700">{config.transferPrefix || "HSK"}123456</span>
              </div>
            </div>

            <p className="text-[11px] text-[#526c50] leading-relaxed">
              💡 Đây là ảnh mã QR tạo tự động theo chuẩn VietQR NAPAS 247. Học viên chỉ cần mở ứng dụng ngân hàng bất kỳ để quét là thông tin và số tiền sẽ được tự động điền chính xác.
            </p>
          </div>
        </div>
      )}

      {/* 2. PACKAGES MANAGEMENT SUBTAB */}
      {activeSubTab === "packages" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#1A3D2F]">
              Danh Sách Gói Học & Đơn Giá ({packages.length})
            </h3>
            <button
              onClick={() => {
                setEditingPackage({
                  id: `pkg_${Date.now()}`,
                  name: "Gói học HSK mới",
                  tagline: "Mô tả ngắn gọn về lợi ích gói học",
                  levelRange: "HSK 1 - 3",
                  price: 299000,
                  originalPrice: 599000,
                  durationDays: 90,
                  dailyAiQuota: 50,
                  features: ["Mở khóa toàn bộ bài học", "AI đàm thoại Doubao chuẩn bản xứ"],
                  recommended: false,
                  isActive: true,
                  order: packages.length + 1,
                });
                setIsCreatingPackage(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#204434] px-4 py-2 text-xs font-bold text-white hover:bg-[#2c5a45] transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              Thêm Gói Học Mới
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition shadow-sm bg-[#FFFCF6] ${
                  pkg.recommended
                    ? "border-amber-400 ring-2 ring-amber-400/30"
                    : "border-[#D7C9AB]/80 hover:border-[#BC9B6B]"
                }`}
              >
                {pkg.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    Gợi ý nhiều nhất
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#BC9B6B] uppercase tracking-wider">
                      {pkg.levelRange}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        pkg.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {pkg.isActive ? "Đang mở bán" : "Đã ẩn"}
                    </span>
                  </div>

                  <h4 className="mt-2 font-serif text-lg font-bold text-[#1A3D2F]">{pkg.name}</h4>
                  <p className="mt-1 text-xs text-[#526c50] line-clamp-2">{pkg.tagline}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[#204434]">
                      {pkg.price.toLocaleString("vi-VN")} đ
                    </span>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-zinc-400 line-through">
                        {pkg.originalPrice.toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-[11px] text-[#8F6D3B] font-semibold">
                    Thời hạn: {pkg.durationDays >= 9999 ? "Trọn đời vĩnh viễn" : `${pkg.durationDays} ngày`} • Lượt AI:{" "}
                    {pkg.dailyAiQuota >= 9999 ? "Không giới hạn" : `${pkg.dailyAiQuota} lượt/ngày`}
                  </div>

                  <div className="mt-5 border-t border-[#D7C9AB]/40 pt-4 space-y-2">
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#1A3D2F]">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#D7C9AB]/40 pt-4">
                  <button
                    onClick={() => {
                      setEditingPackage({ ...pkg });
                      setIsCreatingPackage(false);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A3D2F] hover:bg-[#FAF7F0] transition"
                  >
                    <Edit2 size={13} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 size={13} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Edit / Create Package */}
          {editingPackage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#D7C9AB] bg-[#FFFCF6] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#D7C9AB]/40 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#1A3D2F]">
                    {isCreatingPackage ? "Thêm Gói Học Mới" : "Chỉnh Sửa Gói Học"}
                  </h3>
                  <button
                    onClick={() => setEditingPackage(null)}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePackage} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Tên gói học *</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.name}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Mô tả / Khẩu hiệu</label>
                    <input
                      type="text"
                      value={editingPackage.tagline}
                      onChange={(e) => setEditingPackage({ ...editingPackage, tagline: e.target.value })}
                      className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Phạm vi cấp độ HSK</label>
                      <input
                        type="text"
                        value={editingPackage.levelRange}
                        onChange={(e) => setEditingPackage({ ...editingPackage, levelRange: e.target.value })}
                        placeholder="VD: HSK 1 - 3"
                        className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Thời hạn (ngày)</label>
                      <input
                        type="number"
                        value={editingPackage.durationDays}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, durationDays: Number(e.target.value) })
                        }
                        placeholder="90 hoặc 9999 (Trọn đời)"
                        className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Giá bán (VND) *</label>
                      <input
                        type="number"
                        required
                        value={editingPackage.price}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, price: Number(e.target.value) })
                        }
                        placeholder="VD: 399000"
                        className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1A3D2F] mb-1">Giá gốc gạch ngang (VND)</label>
                      <input
                        type="number"
                        value={editingPackage.originalPrice || ""}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, originalPrice: Number(e.target.value) })
                        }
                        placeholder="VD: 799000"
                        className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                      Hạn mức AI mỗi ngày (Daily Quota)
                    </label>
                    <input
                      type="number"
                      value={editingPackage.dailyAiQuota}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, dailyAiQuota: Number(e.target.value) })
                      }
                      placeholder="VD: 100 hoặc 9999 (Không giới hạn)"
                      className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#204434]"
                    />
                  </div>

                  {/* Features list */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
                      Danh sách quyền lợi / tính năng ({editingPackage.features.length})
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {editingPackage.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#D7C9AB]/40 text-xs">
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingPackage.features.filter((_, i) => i !== idx);
                              setEditingPackage({ ...editingPackage, features: updated });
                            }}
                            className="text-rose-500 hover:text-rose-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        placeholder="Nhập quyền lợi mới rồi bấm Thêm..."
                        className="flex-1 rounded-xl border border-[#BC9B6B]/40 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#204434]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFeatureInput.trim()) return;
                          setEditingPackage({
                            ...editingPackage,
                            features: [...editingPackage.features, newFeatureInput.trim()],
                          });
                          setNewFeatureInput("");
                        }}
                        className="rounded-xl bg-[#204434] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2c5a45]"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPackage.recommended}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, recommended: e.target.checked })
                        }
                        className="rounded border-amber-500 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#1A3D2F]">Đánh dấu là gói Khuyên dùng</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPackage.isActive}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, isActive: e.target.checked })
                        }
                        className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#1A3D2F]">Mở bán ngay</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-[#D7C9AB]/40 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#204434] px-5 py-2 text-xs font-bold text-white hover:bg-[#2c5a45] shadow-xs"
                    >
                      Lưu Gói Học
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TRANSACTIONS LOG SUBTAB */}
      {activeSubTab === "transactions" && (
        <div className="rounded-3xl border border-[#D7C9AB]/80 bg-[#FFFCF6] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-serif text-lg font-bold text-[#1A3D2F]">
              Nhật Ký Quét Mã & Giao Dịch SePay ({transactions.length})
            </h3>
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526c50]" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên học viên..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white pl-8 pr-3 py-1.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D7C9AB]/50 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-[#8F6D3B] border-b border-[#D7C9AB]/50">
                <tr>
                  <th className="px-4 py-3">Mã Đơn / Cú Pháp</th>
                  <th className="px-4 py-3">Học Viên</th>
                  <th className="px-4 py-3">Gói Học</th>
                  <th className="px-4 py-3">Số Tiền</th>
                  <th className="px-4 py-3">Thời Gian</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7C9AB]/30">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#526c50]">
                      Chưa có giao dịch nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FAF7F0]/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#204434]">{tx.orderCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1A3D2F]">{tx.userName}</div>
                        <div className="text-[10px] text-[#526c50]">{tx.userEmail || tx.userId}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1A3D2F]">{tx.packageName}</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">
                        {tx.amount.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-3 text-[#526c50]">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        {tx.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 size={11} /> Đã thanh toán
                          </span>
                        ) : tx.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <RefreshCw size={11} className="animate-spin" /> Đang đợi tiền về
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600">
                            {tx.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {tx.status !== "PAID" && (
                          <button
                            onClick={() => handleManualActivate(tx.id)}
                            disabled={actionLoadingId === tx.id}
                            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                            title="Kích hoạt thủ công cho học viên nếu chuyển tiền đúng nhưng sai cú pháp"
                          >
                            {actionLoadingId === tx.id ? "Đang xử lý..." : "Kích hoạt"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
