"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Zap,
  Lock,
  Flame,
  Award,
} from "lucide-react";
import { PackageItem, UserSubscription } from "@/lib/sepay-types";

interface UpgradePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (sub: UserSubscription) => void;
}

export default function UpgradePackageModal({ isOpen, onClose, onSuccess }: UpgradePackageModalProps) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Checkout State
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [orderData, setOrderData] = useState<{
    orderCode: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    transferContent: string;
    qrUrl: string;
  } | null>(null);

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch packages & current user subscription
  const fetchPackagesData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/packages");
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
        setCurrentSub(data.currentSubscription || null);
      }
    } catch (err) {
      console.error("Fetch packages error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPackagesData();
      setIsSuccess(false);
      setOrderData(null);
      setSelectedPackage(null);
      setErrorMessage(null);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen]);

  // Create payment order
  const handleSelectPackage = async (pkg: PackageItem) => {
    try {
      setSelectedPackage(pkg);
      setCreatingOrder(true);
      setErrorMessage(null);

      const res = await fetch("/api/v1/sepay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data.order);
        // Start polling payment status every 3s
        startPolling(data.order.orderCode);
      } else {
        setErrorMessage(data.error || "Không thể tạo mã thanh toán, vui lòng thử lại sau");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối");
    } finally {
      setCreatingOrder(false);
    }
  };

  // Start polling
  const startPolling = (orderCode: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/sepay/check-status?orderCode=${encodeURIComponent(orderCode)}`);
        const data = await res.json();
        if (data.success && data.isPaid) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsSuccess(true);
          if (data.subscription && onSuccess) {
            onSuccess(data.subscription);
          }
        }
      } catch (e) {
        // Continue polling
      }
    }, 3000);
  };

  // Manual Check Now
  const handleManualCheck = async () => {
    if (!orderData) return;
    try {
      setCheckingStatus(true);
      const res = await fetch(`/api/v1/sepay/check-status?orderCode=${encodeURIComponent(orderData.orderCode)}`);
      const data = await res.json();
      if (data.success && data.isPaid) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsSuccess(true);
        if (data.subscription && onSuccess) {
          onSuccess(data.subscription);
        }
      } else {
        alert("Hệ thống chưa nhận được tín hiệu tiền về từ ngân hàng. Nếu bạn vừa chuyển khoản, vui lòng đợi 5-10 giây để SePay đồng bộ nhé!");
      }
    } catch (e: any) {
      alert("Lỗi kiểm tra trạng thái: " + e.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#D7C9AB] bg-[#FAF7F0] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D7C9AB]/60 bg-[#FFFCF6]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A3D2F]">
                {isSuccess
                  ? "Kích Hoạt Thành Công!"
                  : orderData
                  ? "Quét Mã QR Thanh Toán (VietQR)"
                  : "Mở Khóa Gói Học & Quyền Lợi VIP"}
              </h2>
              <p className="text-xs text-[#526c50]">
                {orderData
                  ? "Chuyển khoản ngân hàng tự động qua SePay 24/7"
                  : "Nâng tầm trải nghiệm tiếng Trung với AI Doubao & Lộ trình chuẩn quốc tế"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Current Subscription Banner */}
          {currentSub && currentSub.isActive && !orderData && (
            <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-700" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Bạn đang sử dụng: <span className="underline">{currentSub.packageName}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {currentSub.isLifetime
                      ? "Quyền lợi VIP Vĩnh viễn (Trọn đời)"
                      : `Hạn dùng đến: ${new Date(currentSub.expiresAt).toLocaleDateString("vi-VN")}`}{" "}
                    • AI Quota: {currentSub.dailyAiQuota >= 9999 ? "Không giới hạn" : `${currentSub.dailyAiQuota} lượt/ngày`}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs">
                VIP Active
              </span>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-bounce">
                <CheckCircle2 size={44} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A3D2F]">
                Chúc Mừng Bạn Đã Nâng Cấp Thành Công!
              </h3>
              <p className="mx-auto max-w-md text-xs text-[#526c50] leading-relaxed">
                Hệ thống đã nhận được tiền và kích hoạt toàn bộ đặc quyền gói{" "}
                <strong className="text-[#204434] font-bold">{selectedPackage?.name}</strong>. Giờ đây bạn có thể
                đàm thoại AI Doubao thỏa thích và học tập không giới hạn!
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="rounded-2xl bg-[#204434] px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-[#2c5a45] transition cursor-pointer"
                >
                  Bắt Đầu Học Ngay 🎉
                </button>
              </div>
            </div>
          ) : orderData ? (
            /* CHECKOUT SCREEN WITH VIETQR */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: QR Code Card */}
              <div className="md:col-span-6 flex flex-col items-center justify-center rounded-3xl border border-[#D7C9AB] bg-white p-6 shadow-sm text-center">
                <span className="text-[11px] font-bold text-[#8F6D3B] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <QrCode size={14} /> Quét mã để thanh toán tự động
                </span>

                <div className="relative p-2 rounded-2xl border-2 border-emerald-600/30 bg-white shadow-md max-w-[260px] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={orderData.qrUrl}
                    alt="VietQR SePay"
                    className="w-full h-auto rounded-lg object-contain"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#204434] animate-pulse">
                  <RefreshCw size={13} className="animate-spin text-emerald-700" />
                  Đang chờ ngân hàng xác nhận giao dịch...
                </div>
                <span className="mt-1 text-[10px] text-[#526c50]">
                  (Hệ thống tự động kích hoạt ngay trong 3-10 giây)
                </span>
              </div>

              {/* Right: Transfer Details */}
              <div className="md:col-span-6 rounded-3xl border border-[#D7C9AB]/80 bg-[#FFFCF6] p-6 shadow-sm space-y-4">
                <div className="border-b border-[#D7C9AB]/40 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC9B6B]">Đơn Hàng</span>
                  <h4 className="font-serif text-lg font-bold text-[#1A3D2F]">{selectedPackage?.name}</h4>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1">
                    {orderData.amount.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Bank */}
                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#D7C9AB]/40">
                    <div>
                      <span className="text-[10px] text-[#526c50] block">Ngân hàng:</span>
                      <span className="font-bold text-[#1A3D2F]">{orderData.bankCode}</span>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#D7C9AB]/40">
                    <div>
                      <span className="text-[10px] text-[#526c50] block">Số tài khoản:</span>
                      <span className="font-mono font-bold text-base text-[#1A3D2F]">{orderData.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderData.accountNumber, "acc")}
                      className="flex items-center gap-1 rounded-lg bg-[#204434]/10 hover:bg-[#204434]/20 px-2.5 py-1 text-[11px] font-bold text-[#204434] transition"
                    >
                      {copiedField === "acc" ? <Check size={13} /> : <Copy size={13} />}
                      {copiedField === "acc" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>

                  {/* Account Holder */}
                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#D7C9AB]/40">
                    <div>
                      <span className="text-[10px] text-[#526c50] block">Chủ tài khoản:</span>
                      <span className="font-bold text-[#1A3D2F]">{orderData.accountHolder}</span>
                    </div>
                  </div>

                  {/* Transfer Syntax (Crucial!) */}
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 p-2.5 border border-amber-300 ring-1 ring-amber-300">
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 block">
                        Nội dung chuyển khoản (Bắt buộc đúng):
                      </span>
                      <span className="font-mono font-extrabold text-base text-amber-800">
                        {orderData.transferContent}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderData.transferContent, "content")}
                      className="flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[11px] font-bold text-white transition shadow-2xs"
                    >
                      {copiedField === "content" ? <Check size={13} /> : <Copy size={13} />}
                      {copiedField === "content" ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleManualCheck}
                    disabled={checkingStatus}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#204434] py-2.5 text-xs font-bold text-white hover:bg-[#2c5a45] transition shadow-xs cursor-pointer"
                  >
                    <RefreshCw size={13} className={checkingStatus ? "animate-spin" : ""} />
                    {checkingStatus ? "Đang đối soát..." : "Tôi đã chuyển khoản"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pollingRef.current) clearInterval(pollingRef.current);
                      setOrderData(null);
                    }}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Chọn gói khác
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PACKAGES SELECTION CARDS */
            <div className="space-y-6">
              {loading ? (
                <div className="py-12 text-center text-xs text-[#526c50] flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Đang tải danh sách gói học...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col justify-between rounded-3xl border p-6 transition shadow-sm bg-[#FFFCF6] ${
                        pkg.recommended
                          ? "border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]"
                          : "border-[#D7C9AB]/80 hover:border-[#BC9B6B]"
                      }`}
                    >
                      {pkg.recommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          Khuyên Dùng Nhất ⭐
                        </span>
                      )}

                      <div>
                        <span className="text-[11px] font-bold text-[#BC9B6B] uppercase tracking-wider">
                          {pkg.levelRange}
                        </span>
                        <h3 className="mt-1 font-serif text-lg font-bold text-[#1A3D2F]">{pkg.name}</h3>
                        <p className="mt-1 text-xs text-[#526c50] leading-relaxed">{pkg.tagline}</p>

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

                      <div className="mt-6 pt-4 border-t border-[#D7C9AB]/40">
                        <button
                          type="button"
                          onClick={() => handleSelectPackage(pkg)}
                          disabled={creatingOrder}
                          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition shadow-xs cursor-pointer ${
                            pkg.recommended
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20"
                              : "bg-[#204434] text-white hover:bg-[#2c5a45]"
                          }`}
                        >
                          <QrCode size={15} />
                          Quét Mã QR Mua Ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
