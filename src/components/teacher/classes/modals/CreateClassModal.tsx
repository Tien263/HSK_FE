"use client";

import React, { useState } from "react";
import { X, BookOpen, User, CheckCircle2, KeyRound } from "lucide-react";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    level: number;
    track: "HSK" | "TOPIC" | "MAJOR";
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  loading: boolean;
  teacherName?: string;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  teacherName,
}: CreateClassModalProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [track, setTrack] = useState<"HSK" | "TOPIC" | "MAJOR">("HSK");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên lớp học.");
      return;
    }
    setError("");
    await onSubmit({
      name: name.trim(),
      level: Number(level) || 1,
      track,
      startDate,
      endDate,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E5DFD0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F513F]/10 text-[#1F513F] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17382F]">
                Tạo lớp học mới
              </h3>
              <p className="text-[11px] text-[#6B766D]">
                Khởi tạo lộ trình 15 bài học và mã mời tham gia tự động
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Thông tin giáo viên & trạng thái */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F7F5EE] border border-[#E5DFD0] text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#1F513F] shrink-0" />
              <div>
                <span className="text-[10px] text-[#6B766D] block">Giáo viên phụ trách</span>
                <span className="font-bold text-[#17382F]">{teacherName || "Tài khoản hiện tại"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-[#6B766D] block">Trạng thái lớp</span>
                <span className="font-bold text-emerald-700">Đang hoạt động</span>
              </div>
            </div>
          </div>

          {/* Tên lớp */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Tên lớp học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: HSK1_0001, HSK2_ChieuThu3..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3.5 py-2 text-xs text-[#17382F] focus:outline-hidden"
              required
            />
          </div>

          {/* Cấp độ & Hệ đào tạo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17382F] block">
                Cấp độ HSK
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:outline-hidden cursor-pointer"
              >
                <option value={1}>HSK 1 (Khung 3.0)</option>
                <option value={2}>HSK 2 (Khung 3.0)</option>
                <option value={3}>HSK 3 (Khung 3.0)</option>
                <option value={4}>HSK 4 (Khung 3.0)</option>
                <option value={5}>HSK 5 (Khung 3.0)</option>
                <option value={6}>HSK 6 (Khung 3.0)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17382F] block">
                Hệ tiêu chuẩn
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:outline-hidden cursor-pointer"
              >
                <option value="HSK">Khung HSK 3.0 (Chuẩn quốc tế)</option>
                <option value="TOPIC">Giao tiếp theo chủ đề</option>
                <option value="MAJOR">Tiếng Trung chuyên ngành</option>
              </select>
            </div>
          </div>

          {/* Mã tham gia thông báo */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong>Mã tham gia lớp:</strong> Hệ thống tự động sinh mã duy nhất sau khi nhấn Tạo lớp. Học sinh dùng mã này để vào lớp.
            </div>
          </div>

          {/* Ngày bắt đầu & kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17382F] block">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3 py-1.5 text-xs text-[#17382F] focus:outline-hidden"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17382F] block">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3 py-1.5 text-xs text-[#17382F] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Mô tả lớp */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Mô tả lớp học
            </label>
            <textarea
              rows={3}
              placeholder="Mục tiêu khóa học, thời gian học hoặc ghi chú cho học viên..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#E5DFD0] rounded-xl p-3 text-xs text-[#17382F] focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-[#E5DFD0] bg-white text-xs font-semibold text-[#17382F] hover:bg-[#FAF7F0] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-bold hover:bg-[#17382F] transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? "Đang khởi tạo lớp..." : "Tạo lớp học ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
