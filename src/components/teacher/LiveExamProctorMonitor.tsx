"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Smartphone,
  Users,
  Volume2,
  Clock,
  Eye,
  AlertTriangle,
  RotateCcw,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Camera,
  Play,
  Trash2,
} from "lucide-react";

export interface ProctorViolationItem {
  id: string;
  createdAt: string;
  studentId: string;
  studentName: string;
  examTitle: string;
  classId?: string | null;
  violationType: string;
  details: string;
  count: number;
  snapshot?: string | null;
}

interface LiveExamProctorMonitorProps {
  currentUser?: any;
  classesList?: any[];
  showToast?: (msg: string) => void;
}

export default function LiveExamProctorMonitor({
  currentUser,
  classesList = [],
  showToast,
}: LiveExamProctorMonitorProps) {
  const [violations, setViolations] = useState<ProctorViolationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSnapshot, setViewingSnapshot] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const lastFetchedIdRef = useRef<string | null>(null);

  const fetchViolations = async () => {
    try {
      const url = `/api/v1/proctor/violation${selectedClass !== "ALL" ? `?classId=${selectedClass}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.violations)) {
        setViolations(json.violations);
        lastFetchedIdRef.current = json.violations[0]?.id || null;
      }
    } catch (err) {
      console.warn("Lỗi tải nhật ký giám thị:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [selectedClass]);

  // Polling tự động mỗi 4 giây để nhận cảnh báo theo thời gian thực
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(fetchViolations, 4000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, selectedClass]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const handleDeleteViolation = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi vi phạm này để giải phóng dung lượng?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/proctor/violation?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setViolations((prev) => prev.filter((v) => v.id !== id));
        if (showToast) showToast("Đã xóa bản ghi vi phạm thành công!");
      } else {
        alert(data.message || "Không thể xóa vi phạm.");
      }
    } catch (e: any) {
      alert("Lỗi kết nối máy chủ: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllViolations = async () => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn dọn dẹp và xóa TOÀN BỘ ảnh bằng chứng & nhật ký vi phạm để tiết kiệm dung lượng lưu trữ?")) return;
    setClearingAll(true);
    try {
      const res = await fetch("/api/v1/proctor/violation?action=CLEAR_ALL", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setViolations([]);
        if (showToast) showToast(data.message || "Đã dọn dẹp toàn bộ dữ liệu giám thị!");
      } else {
        alert(data.message || "Không thể dọn dẹp dữ liệu.");
      }
    } catch (e: any) {
      alert("Lỗi kết nối máy chủ: " + e.message);
    } finally {
      setClearingAll(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        timeStyle: "medium",
        dateStyle: "short",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getViolationBadge = (type: string) => {
    switch (type) {
      case "CELL_PHONE_DETECTED":
        return {
          label: "📱 Phát hiện điện thoại",
          color: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
          isCritical: true,
        };
      case "MULTIPLE_PEOPLE_DETECTED":
        return {
          label: "👥 Có người thứ 2",
          color: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
          isCritical: true,
        };
      case "NO_FACE_DETECTED":
        return {
          label: "👤 Vắng mặt / Rời vị trí",
          color: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
          isCritical: false,
        };
      case "AUDIO_SUSPICIOUS":
        return {
          label: "🔊 Tiếng ồn / Nói chuyện",
          color: "bg-purple-100 text-purple-900 border-purple-300 font-semibold",
          isCritical: false,
        };
      case "TAB_SWITCH":
        return {
          label: "🔀 Rời tab làm bài",
          color: "bg-blue-100 text-blue-900 border-blue-300 font-semibold",
          isCritical: false,
        };
      case "APP_SWITCH":
        return {
          label: "💻 Chuyển ứng dụng ngoài",
          color: "bg-orange-100 text-orange-900 border-orange-300 font-semibold",
          isCritical: false,
        };
      default:
        return {
          label: type,
          color: "bg-slate-100 text-slate-800 border-slate-300",
          isCritical: false,
        };
    }
  };

  const filteredViolations = violations.filter((v) => {
    if (filterType === "CRITICAL" && v.violationType !== "CELL_PHONE_DETECTED" && v.violationType !== "MULTIPLE_PEOPLE_DETECTED") return false;
    if (filterType !== "ALL" && filterType !== "CRITICAL" && v.violationType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.studentName.toLowerCase().includes(q) ||
        v.examTitle.toLowerCase().includes(q) ||
        v.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = violations.filter(
    (v) => v.violationType === "CELL_PHONE_DETECTED" || v.violationType === "MULTIPLE_PEOPLE_DETECTED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Dashboard */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#204434] to-[#142C21] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                Trung Tâm Giám Sát Thi Trực Tuyến & Cảnh Báo AI
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>AI Live Proctoring</span>
              </span>
            </div>
            <p className="text-xs text-[#BC9B6B] mt-1 leading-relaxed">
              Theo dõi trực tiếp mọi hành vi cử động, thêm người, sử dụng điện thoại, rời tab hoặc tiếng ồn của thí sinh theo thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isAutoRefresh
                ? "bg-emerald-600/30 text-emerald-200 border-emerald-400/50"
                : "bg-white/10 text-white/70 border-white/20"
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAutoRefresh ? "animate-spin" : ""}`} />
            <span>{isAutoRefresh ? "Tự làm mới (4s)" : "Đã tạm dừng"}</span>
          </button>

          <button
            type="button"
            onClick={fetchViolations}
            className="px-4 py-2 rounded-xl bg-white text-[#204434] hover:bg-[#FAF7F0] text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới ngay</span>
          </button>

          <button
            type="button"
            disabled={clearingAll || violations.length === 0}
            onClick={handleClearAllViolations}
            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-400/40 text-red-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Dọn dẹp và giải phóng dung lượng ảnh bằng chứng vi phạm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearingAll ? "Đang dọn dẹp..." : "Dọn dẹp nhật ký"}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8F6D3B] uppercase tracking-wider block">
            Tổng lượt cảnh báo
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-serif font-bold text-[#204434]">
              {violations.length}
            </span>
            <span className="text-xs text-[#526c50]">sự vụ</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Phát hiện điện thoại / Thêm người</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-serif font-bold text-rose-700">
              {criticalCount}
            </span>
            <span className="text-xs text-rose-600">bằng chứng ảnh</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Cảnh báo âm thanh</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-serif font-bold text-purple-700">
              {violations.filter((v) => v.violationType === "AUDIO_SUSPICIOUS").length}
            </span>
            <span className="text-xs text-purple-600">lần nói chuyện</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Rời tab / Cửa sổ phụ
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-serif font-bold text-blue-700">
              {violations.filter((v) => v.violationType === "TAB_SWITCH" || v.violationType === "APP_SWITCH").length}
            </span>
            <span className="text-xs text-blue-600">lần thoát</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#8F6D3B] font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc cảnh báo:
          </span>
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "CRITICAL", label: "🚨 Điện thoại & Người (Nghiêm trọng)" },
            { id: "CELL_PHONE_DETECTED", label: "📱 Điện thoại" },
            { id: "MULTIPLE_PEOPLE_DETECTED", label: "👥 Thêm người" },
            { id: "AUDIO_SUSPICIOUS", label: "🔊 Tiếng ồn" },
            { id: "TAB_SWITCH", label: "🔀 Rời tab" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                filterType === cat.id
                  ? "bg-[#204434] text-white border-[#204434] shadow-2xs"
                  : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {classesList.length > 0 && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold text-[#204434] outline-none"
            >
              <option value="ALL">Tất cả lớp học</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên học sinh, bài thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-xs text-[#204434] outline-none w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Real-time Violation Feed Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-[#E5DEC9]">
            Đang tải dữ liệu giám sát trực tuyến...
          </div>
        ) : filteredViolations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5DEC9] space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-base text-[#204434]">
              Không có vi phạm nào được ghi nhận trong danh mục này!
            </h4>
            <p className="text-xs text-[#526c50]">
              Tất cả các phòng thi đang diễn ra nghiêm túc, không phát hiện thiết bị hoặc âm thanh bất thường.
            </p>
          </div>
        ) : (
          filteredViolations.map((v) => {
            const badge = getViolationBadge(v.violationType);

            return (
              <div
                key={v.id}
                className={`p-4 rounded-3xl border transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  badge.isCritical ? "bg-rose-50/50 border-rose-200" : "bg-white border-[#E5DEC9]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ảnh Snapshot bằng chứng */}
                  {v.snapshot ? (
                    <button
                      type="button"
                      onClick={() => setViewingSnapshot(v.snapshot!)}
                      className="relative w-28 h-20 rounded-2xl overflow-hidden border-2 border-[#BC9B6B]/40 shrink-0 shadow-sm cursor-pointer group"
                      title="Bấm để xem ảnh kích thước lớn"
                    >
                      <img
                        src={v.snapshot}
                        alt="Ảnh bằng chứng vi phạm"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem ảnh</span>
                      </div>
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  {/* Thông tin vi phạm */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#204434]">
                        {v.studentName}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-[#FAF7F0] text-[#8F6D3B] border border-[#E5DEC9]">
                        Lần vi phạm: {v.count}/3
                      </span>
                    </div>

                    <p className="text-xs text-[#204434] font-medium leading-relaxed">
                      {v.details}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#526c50]">
                      <span className="font-semibold text-[#8F6D3B]">
                        Bài thi: {v.examTitle}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(v.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Các nút hành động của giáo viên */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (showToast) showToast(`Đã gửi cảnh báo trực tiếp tới màn hình của ${v.studentName}!`);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gửi nhắc nhở</span>
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === v.id}
                    onClick={() => handleDeleteViolation(v.id)}
                    className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="Xóa bản ghi vi phạm này để tiết kiệm dung lượng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {v.count >= 3 && (
                    <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Đã đình chỉ bài thi</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal phóng to ảnh bằng chứng vi phạm */}
      {viewingSnapshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setViewingSnapshot(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#FFFCF6] rounded-3xl p-4 border border-[#BC9B6B]/40 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
              <h4 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Ảnh chụp bằng chứng AI tại thời điểm vi phạm</span>
              </h4>
              <button
                type="button"
                onClick={() => setViewingSnapshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={viewingSnapshot}
              alt="Ảnh bằng chứng vi phạm"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-black/10 bg-black/5"
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => setViewingSnapshot(null)}
                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
