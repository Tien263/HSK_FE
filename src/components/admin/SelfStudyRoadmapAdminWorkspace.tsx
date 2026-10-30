"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Eye,
} from "lucide-react";
import {
  DEFAULT_SELF_STUDY_ROADMAP_STAGES,
  type RoadmapStage,
} from "@/lib/self-study-roadmap-constants";

export default function SelfStudyRoadmapAdminWorkspace() {
  const [stages, setStages] = useState<RoadmapStage[]>(DEFAULT_SELF_STUDY_ROADMAP_STAGES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  // Load existing stages from API
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/admin/self-study-roadmap");
        const data = await res.json();
        if (data.success && Array.isArray(data.stages) && data.stages.length > 0) {
          setStages(data.stages);
        }
      } catch (err) {
        console.warn("Failed to load self-study roadmap stages:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStageChange = (index: number, field: keyof RoadmapStage, value: any) => {
    setStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddStage = () => {
    const nextStep = stages.length + 1;
    setStages((prev) => [
      ...prev,
      {
        step: nextStep,
        title: `Giai đoạn ${nextStep}: Mục tiêu mới`,
        duration: "Dự kiến 3 tuần",
        desc: "Mô tả nội dung học tập và kỹ năng cần rèn luyện trong giai đoạn này.",
        badge: "🎯 Đạt chuẩn năng lực",
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      alert("Lộ trình cần tối thiểu 1 giai đoạn học tập.");
      return;
    }
    setStages((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((st, i) => ({ ...st, step: i + 1 }))
    );
  };

  const handleResetDefault = () => {
    if (confirm("Khôi phục toàn bộ 4 giai đoạn lộ trình chuẩn HSK 3.0?")) {
      setStages(DEFAULT_SELF_STUDY_ROADMAP_STAGES);
      setFeedback({
        type: "success",
        message: "Đã khôi phục lộ trình chuẩn HSK 3.0 (Nhớ bấm 'Lưu cấu hình' để áp dụng).",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      const res = await fetch("/api/v1/admin/self-study-roadmap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          message: "Đã lưu thành công cấu hình lộ trình tự học vào cơ sở dữ liệu!",
        });
        if (Array.isArray(data.stages)) {
          setStages(data.stages);
        }
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Lỗi lưu cấu hình lộ trình.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Lỗi kết nối máy chủ khi lưu.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#D4AF37] flex items-center justify-center font-serif text-xl font-bold shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#204434] flex items-center gap-2">
              <span>Thiết lập Lộ Trình Tự Học Cá Nhân Hóa (HSK 3.0)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-mono font-bold">
                {stages.length} Giai đoạn
              </span>
            </h2>
            <p className="text-xs text-[#315E48] mt-0.5">
              Admin cấu hình các giai đoạn lộ trình học tập độc lập. Thay đổi sẽ hiển thị trực tiếp cho học sinh tại Màn hình Onboarding và Không gian Tự học.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Chuyển chế độ Xem trước / Chỉnh sửa */}
          <div className="bg-[#FAF7F0] p-1 rounded-xl border border-[#BC9B6B]/30 flex items-center">
            <button
              type="button"
              onClick={() => setPreviewMode("edit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewMode === "edit"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                previewMode === "preview"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước học sinh</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#BC9B6B]/40 hover:bg-[#FAF7F0] text-xs font-bold text-[#8F6D3B] transition cursor-pointer flex items-center gap-1.5"
            title="Khôi phục 4 giai đoạn chuẩn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>{saving ? "Đang lưu..." : "Lưu cấu hình lộ trình"}</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[#8F6D3B] bg-white rounded-3xl border border-[#E5DEC9]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#204434]" />
          Đang tải dữ liệu cấu hình lộ trình từ hệ thống...
        </div>
      ) : previewMode === "preview" ? (
        /* CHẾ ĐỘ XEM TRƯỚC HỌC SINH (Student Preview) */
        <div className="bg-[#FAF7F0] p-6 rounded-3xl border-2 border-[#BC9B6B]/40 space-y-4">
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="text-[11px] px-3 py-1 rounded-full bg-[#204434]/10 text-[#204434] font-bold">
              Giao diện xem trước của học sinh (Màn hình 6 Onboarding)
            </span>
            <h3 className="font-serif font-bold text-2xl text-[#204434] mt-2">
              Lộ trình học tập dành riêng cho bạn
            </h3>
            <p className="text-xs text-[#315E48] mt-1">
              Dựa trên mục tiêu và thời gian học của bạn, Hanyu đã tối ưu lộ trình {stages.length} giai đoạn toàn diện.
            </p>
          </div>

          <div className="space-y-3.5 max-w-3xl mx-auto">
            {stages.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-white border border-[#BC9B6B]/30 shadow-2xs hover:shadow-xs transition space-y-2"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#204434] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {stage.step}
                    </span>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8F6D3B]">
                        GIAI ĐOẠN {stage.step} · {stage.duration}
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#204434]">
                        {stage.title}
                      </h4>
                      <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  </div>

                  {stage.badge && (
                    <span className="px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#BC9B6B]/40 text-xs font-semibold text-[#8F6D3B] shrink-0">
                      {stage.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ CHỈNH SỬA CHI TIẾT (Edit Mode) */
        <div className="space-y-4">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#BC9B6B]/30 p-5 shadow-2xs space-y-4 hover:border-[#204434]/40 transition"
            >
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="font-serif font-bold text-sm text-[#204434]">
                    Giai đoạn {idx + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStage(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Xóa giai đoạn này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Tiêu đề giai đoạn */}
                <div className="md:col-span-6 space-y-1">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider">
                    Tiêu đề giai đoạn
                  </label>
                  <input
                    type="text"
                    value={stage.title}
                    onChange={(e) => handleStageChange(idx, "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-[#FFFCF6] text-xs font-semibold text-[#204434] focus:outline-none focus:ring-2 focus:ring-[#204434]/30"
                    placeholder="VD: Khởi động & Ngữ âm chuẩn Pinyin"
                  />
                </div>

                {/* Thời lượng dự kiến */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Thời lượng</span>
                  </label>
                  <input
                    type="text"
                    value={stage.duration}
                    onChange={(e) => handleStageChange(idx, "duration", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-[#FFFCF6] text-xs text-[#204434] focus:outline-none focus:ring-2 focus:ring-[#204434]/30"
                    placeholder="VD: Dự kiến 2 tuần"
                  />
                </div>

                {/* Huy hiệu mục tiêu */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Huy hiệu mục tiêu</span>
                  </label>
                  <input
                    type="text"
                    value={stage.badge}
                    onChange={(e) => handleStageChange(idx, "badge", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-[#FFFCF6] text-xs text-[#204434] focus:outline-none focus:ring-2 focus:ring-[#204434]/30"
                    placeholder="VD: 🎯 Đạt chuẩn phát âm tự nhiên"
                  />
                </div>

                {/* Mô tả chi tiết nội dung */}
                <div className="md:col-span-12 space-y-1">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider">
                    Mô tả kiến thức & kỹ năng trọng tâm
                  </label>
                  <textarea
                    rows={2}
                    value={stage.desc}
                    onChange={(e) => handleStageChange(idx, "desc", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#BC9B6B]/40 bg-[#FFFCF6] text-xs text-[#204434] focus:outline-none focus:ring-2 focus:ring-[#204434]/30 leading-relaxed"
                    placeholder="Mô tả các nội dung học sinh sẽ tiếp thu trong giai đoạn này..."
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Nút Thêm Giai Đoạn */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleAddStage}
              className="px-4 py-2.5 rounded-2xl border-2 border-dashed border-[#BC9B6B] bg-[#FAF7F0] hover:bg-white text-xs font-bold text-[#204434] transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#BC9B6B]" />
              <span>+ Thêm giai đoạn học tập</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>{saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
