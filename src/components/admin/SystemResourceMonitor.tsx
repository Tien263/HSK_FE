"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Flame,
  HelpCircle,
  KeyRound,
  RefreshCw,
  Server,
  ShieldAlert,
  Sparkles,
  Volume2,
  Mail,
  HardDrive,
  Clock,
} from "lucide-react";
import type { MonitoredResource } from "@/app/api/v1/admin/monitoring/route";

export default function SystemResourceMonitor() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MonitoredResource[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/monitoring", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        setData(json.items);
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
      } else {
        setError("Không lấy được dữ liệu trạng thái.");
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Tự động làm mới mỗi 60 giây
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = data.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const criticalCount = data.filter((i) => i.status === "critical").length;
  const warningCount = data.filter((i) => i.status === "warning").length;
  const healthyCount = data.filter((i) => i.status === "healthy").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#F4EEDC] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#204434] text-[#FAF7F0]">
                <Activity size={13} className="animate-pulse" /> Giám sát thời gian thực
              </span>
              {lastUpdated && (
                <span className="text-xs text-[#6A6458] flex items-center gap-1 font-mono">
                  <Clock size={12} /> Cập nhật lúc {lastUpdated}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A3D2F]">
              Bảng Giám Sát Hạn Mức & Hạ Tầng AI
            </h2>
            <p className="mt-1 text-xs text-[#526c50] max-w-2xl leading-relaxed">
              Theo dõi trực quan dung lượng đã dùng của Database và các dịch vụ AI dưới dạng thanh ngang.
              Hệ thống tự động phát hiện và cảnh báo đổi màu khi dịch vụ gần chạm trần quota.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#204434] hover:bg-[#163325] active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Đang quét..." : "Quét tình trạng ngay"}
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E5DEC9]/80">
          <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E5DEC9]">
            <p className="text-[11px] font-bold text-[#6A6458] uppercase">Tổng tài nguyên</p>
            <p className="text-xl font-bold text-[#1A3D2F] mt-0.5">{data.length} Dịch vụ</p>
          </div>
          <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Hoạt động tốt</p>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{healthyCount} Dịch vụ</p>
          </div>
          <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-amber-800 uppercase">Cảnh báo sắp hết</p>
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{warningCount} Dịch vụ</p>
          </div>
          <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-rose-200">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-rose-800 uppercase">Hết hạn / Lỗi</p>
              <ShieldAlert size={16} className="text-rose-600" />
            </div>
            <p className="text-xl font-bold text-rose-700 mt-0.5">{criticalCount} Dịch vụ</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DEC9] pb-3">
        {[
          { id: "all", label: "Tất cả dịch vụ" },
          { id: "database", label: "Cơ sở dữ liệu", icon: Database },
          { id: "ai", label: "Mô hình AI", icon: Sparkles },
          { id: "email", label: "Email OTP", icon: Mail },
          { id: "voice", label: "Giọng đọc Voice", icon: Volume2 },
          { id: "storage", label: "Lưu trữ Media", icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                active
                  ? "bg-[#204434] text-[#FAF7F0] shadow-xs"
                  : "bg-white text-[#526c50] hover:bg-[#F3EFE6] border border-[#E5DEC9]"
              }`}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Horizontal Resource Bars */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isCritical = item.status === "critical";
          const isWarning = item.status === "warning";
          const isHealthy = item.status === "healthy";

          // Dynamic colors for the progress bar
          let barGradient = "from-emerald-500 to-teal-600";
          let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
          let cardBorder = "border-[#E5DEC9]";

          if (isCritical) {
            barGradient = "from-rose-500 to-red-600";
            badgeBg = "bg-rose-100 text-rose-800 border-rose-300 animate-pulse";
            cardBorder = "border-rose-300 ring-2 ring-rose-200/50";
          } else if (isWarning) {
            barGradient = "from-amber-500 to-orange-500";
            badgeBg = "bg-amber-100 text-amber-800 border-amber-300";
            cardBorder = "border-amber-300 ring-1 ring-amber-200";
          }

          return (
            <div
              key={item.id}
              className={`rounded-2xl bg-white p-5 border ${cardBorder} shadow-2xs transition-all hover:shadow-xs`}
            >
              {/* Row 1: Title, Provider, Latency, Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === "database"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.category === "ai"
                        ? "bg-purple-100 text-purple-800"
                        : item.category === "email"
                        ? "bg-blue-100 text-blue-800"
                        : item.category === "voice"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {item.category === "database" && <Database size={18} />}
                    {item.category === "ai" && <Sparkles size={18} />}
                    {item.category === "email" && <Mail size={18} />}
                    {item.category === "voice" && <Volume2 size={18} />}
                    {item.category === "storage" && <HardDrive size={18} />}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#1A3D2F] flex items-center gap-2">
                      {item.name}
                      {item.latencyMs !== null && item.latencyMs !== undefined && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#6A6458]">
                          {item.latencyMs}ms
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#6A6458] font-medium">{item.provider}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}
                  >
                    {isHealthy && <CheckCircle2 size={13} />}
                    {isWarning && <AlertTriangle size={13} />}
                    {isCritical && <ShieldAlert size={13} />}
                    {item.statusText}
                  </span>
                </div>
              </div>

              {/* Row 2: Thanh đo hàng ngang (Horizontal Bar) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#526c50]">
                    Đã dùng:{" "}
                    <strong className="text-[#1A3D2F]">
                      {item.used.toLocaleString()} {item.unit}
                    </strong>{" "}
                    / Hạn mức: {item.limit.toLocaleString()} {item.unit}
                  </span>
                  <span className="font-mono font-bold text-sm text-[#1A3D2F]">
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-4 rounded-full bg-[#EAE4D2] overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.max(3, item.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Row 3: Ghi chú & Nút thao tác khi gần hết hoặc lỗi */}
              <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <p className="text-[#6A6458] leading-relaxed flex items-center gap-1.5">
                  <HelpCircle size={13} className="shrink-0 text-[#8F6D3B]" />
                  {item.note}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  {item.upgradeUrl && (
                    <a
                      href={item.upgradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                        isCritical
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : isWarning
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-[#FAF7F0] text-[#204434] border border-[#BC9B6B]/40 hover:bg-[#E5DEC9]"
                      }`}
                    >
                      <ExternalLink size={12} />
                      {isCritical ? "Khắc phục / Đổi ngay" : isWarning ? "Chuẩn bị nâng cấp" : "Chi tiết dịch vụ"}
                    </a>
                  )}
                </div>
              </div>

              {/* Warning Banner if threshold exceeded */}
              {(isWarning || isCritical) && (
                <div
                  className={`mt-3 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                    isCritical
                      ? "bg-rose-50 text-rose-900 border-rose-200"
                      : "bg-amber-50 text-amber-900 border-amber-200"
                  }`}
                >
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    <strong>Cảnh báo quản trị viên:</strong> Tài nguyên này đã chạm mức{" "}
                    <strong>{item.percentage}%</strong>. Nếu không bổ sung hoặc thay thế key, học sinh có
                    thể bị gián đoạn tính năng tương ứng.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
