"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Eye,
} from "lucide-react";
import {
  DEFAULT_STUDENT_STEPS,
  DEFAULT_TEACHER_STEPS,
  GuideStep,
} from "@/lib/guide-data";

export default function AdminGuideEditor() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [selectedStepIdx, setSelectedStepIdx] = useState(0);

  const [studentSteps, setStudentSteps] = useState<GuideStep[]>(DEFAULT_STUDENT_STEPS);
  const [teacherSteps, setTeacherSteps] = useState<GuideStep[]>(DEFAULT_TEACHER_STEPS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchGuideData();
  }, []);

  const fetchGuideData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/guide");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.studentSteps && json.data.studentSteps.length > 0) {
          setStudentSteps(json.data.studentSteps);
        }
        if (json.data.teacherSteps && json.data.teacherSteps.length > 0) {
          setTeacherSteps(json.data.teacherSteps);
        }
      }
    } catch (e) {
      console.error("Lỗi tải guide data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/admin/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentSteps, teacherSteps }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi lưu cẩm nang.");
      }
      setMessage({ type: "success", text: "Đã lưu cập nhật Cẩm nang Hướng dẫn thành công! Trang /guide đã được cập nhật." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không thể lưu dữ liệu." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục toàn bộ nội dung hướng dẫn về mặc định ban đầu không?")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/guide", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStudentSteps(DEFAULT_STUDENT_STEPS);
        setTeacherSteps(DEFAULT_TEACHER_STEPS);
        setMessage({ type: "success", text: "Đã khôi phục cẩm nang về trạng thái mặc định ban đầu." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi khôi phục." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    const newStepNumber = currentSteps.length + 1;
    const newStep: GuideStep = {
      id: `${role === "STUDENT" ? "s" : "t"}-step-${Date.now()}`,
      stepNumber: newStepNumber,
      title: `Bước ${newStepNumber}: Hướng dẫn tính năng mới`,
      subtitle: "Mô tả ngắn gọn về tính năng và lợi ích khi sử dụng",
      voiceText: `Bước ${newStepNumber}: Hướng dẫn cách sử dụng tính năng mới. Bạn bấm vào nút chức năng trên màn hình để bắt đầu trải nghiệm.`,
      tips: ["Thao tác cẩn thận theo từng bước.", "Liên hệ giáo viên nếu gặp khó khăn."],
      mockup: {
        title: `Mô phỏng Bước ${newStepNumber}`,
        description: "Màn hình giao diện thao tác",
        screenType: "custom",
        highlights: [
          {
            id: `h-${Date.now()}`,
            badge: "❶ Bấm vào đây",
            label: "Nút tính năng",
            description: "Bấm để mở bảng điều khiển tính năng mới.",
            color: "emerald",
          },
        ],
      },
    };

    if (role === "STUDENT") {
      setStudentSteps((prev) => [...prev, newStep]);
    } else {
      setTeacherSteps((prev) => [...prev, newStep]);
    }
    setSelectedStepIdx(currentSteps.length);
    setMessage({ type: "success", text: `Đã thêm Bước ${newStepNumber} mới! Hãy chỉnh sửa nội dung và bấm 'Lưu Cẩm nang'.` });
  };

  const handleDeleteStep = (index: number) => {
    if (currentSteps.length <= 1) {
      alert("Cẩm nang cần giữ lại ít nhất 1 bước!");
      return;
    }
    const stepToDelete = currentSteps[index];
    if (!confirm(`Bạn có chắc chắn muốn xóa Bước ${stepToDelete.stepNumber}: "${stepToDelete.title}" không?`)) {
      return;
    }

    const updater = (prev: GuideStep[]) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((st, i) => ({ ...st, stepNumber: i + 1 }));
    };

    if (role === "STUDENT") {
      setStudentSteps(updater);
    } else {
      setTeacherSteps(updater);
    }
    setSelectedStepIdx(Math.max(0, index - 1));
    setMessage({ type: "success", text: `Đã xóa bước thành công! Bấm 'Lưu Cẩm nang' để áp dụng.` });
  };

  const currentSteps = role === "STUDENT" ? studentSteps : teacherSteps;
  const currentStep = currentSteps[selectedStepIdx] || currentSteps[0];

  const updateCurrentStep = (updater: (s: GuideStep) => GuideStep) => {
    if (role === "STUDENT") {
      setStudentSteps((prev) => {
        const copy = [...prev];
        copy[selectedStepIdx] = updater({ ...copy[selectedStepIdx] });
        return copy;
      });
    } else {
      setTeacherSteps((prev) => {
        const copy = [...prev];
        copy[selectedStepIdx] = updater({ ...copy[selectedStepIdx] });
        return copy;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#526c50] flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-[#204434] border-t-transparent rounded-full animate-spin" />
        <span>Đang tải cấu hình cẩm nang hướng dẫn...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#204434]/10 text-xs font-bold text-[#204434] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Trình quản lý Nội dung Cẩm nang (Guide CMS)</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#204434]">
            Chỉnh sửa Nội dung Cẩm nang Hướng dẫn (/guide)
          </h2>
          <p className="text-xs text-[#526c50] mt-1 max-w-2xl leading-relaxed">
            Chỉnh sửa tiêu đề các bước, lời thoại thuyết minh giọng nói AI, mẹo làm bài và các ô khoanh hướng dẫn mà không cần can thiệp code.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/guide"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#BC9B6B]/40 bg-[#F8F5ED] hover:bg-white text-xs font-bold text-[#204434] transition"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xem trang /guide</span>
            <ExternalLink className="w-3 h-3 text-[#526c50]" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-300 hover:bg-red-50 text-xs font-semibold text-red-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu Cẩm nang"}</span>
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
              : "bg-red-50 text-red-900 border border-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Role Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRole("STUDENT");
              setSelectedStepIdx(0);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "STUDENT"
                ? "bg-[#204434] text-white shadow-sm"
                : "text-[#526c50] hover:bg-[#204434]/10"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Cẩm nang dành cho Học sinh (6 bước)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("TEACHER");
              setSelectedStepIdx(0);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "TEACHER"
                ? "bg-[#9D493E] text-white shadow-sm"
                : "text-[#526c50] hover:bg-[#9D493E]/10"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Cẩm nang dành cho Giáo viên (6 bước)</span>
          </button>
        </div>

        <span className="text-xs text-[#526c50] pr-2">
          Đang sửa: <strong>Bước {currentStep.stepNumber}</strong>
        </span>
      </div>

      {/* Steps Pill Selector & Add Step Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#204434]">
            Danh sách các bước (Tổng cộng {currentSteps.length} bước):
          </span>
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm bước hướng dẫn mới</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {currentSteps.map((st, i) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStepIdx(i)}
              className={`p-3 rounded-2xl text-left border transition cursor-pointer relative ${
                i === selectedStepIdx
                  ? role === "STUDENT"
                    ? "bg-[#204434] text-white border-[#204434] shadow-sm font-bold"
                    : "bg-[#9D493E] text-white border-[#9D493E] shadow-sm font-bold"
                  : "bg-[#FFFCF6] hover:bg-white text-[#204434] border-[#BC9B6B]/30"
              }`}
            >
              <div className="text-[10px] uppercase opacity-75">Bước {st.stepNumber}</div>
              <div className="text-xs truncate font-semibold mt-0.5">{st.title.split("&")[0].trim()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Form for Current Step */}
      <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/25">
          <div className="flex items-center gap-3">
            <h3 className="font-serif font-bold text-lg text-[#204434]">
              Chỉnh sửa Nội dung: Bước {currentStep.stepNumber}
            </h3>
            <span className="text-xs font-mono text-[#526c50]">ID: {currentStep.id}</span>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteStep(selectedStepIdx)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition cursor-pointer"
            title="Xóa bước hướng dẫn này"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa bước này</span>
          </button>
        </div>

        {/* Step Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1.5">
              Tiêu đề bước:
            </label>
            <input
              type="text"
              value={currentStep.title}
              onChange={(e) =>
                updateCurrentStep((s) => ({ ...s, title: e.target.value }))
              }
              className="w-full text-xs p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 font-semibold text-[#204434] outline-none focus:border-[#204434]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1.5">
              Mô tả phụ (Subtitle):
            </label>
            <input
              type="text"
              value={currentStep.subtitle}
              onChange={(e) =>
                updateCurrentStep((s) => ({ ...s, subtitle: e.target.value }))
              }
              className="w-full text-xs p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 text-[#204434] outline-none focus:border-[#204434]"
            />
          </div>
        </div>

        {/* Spoken Voiceover Text */}
        <div>
          <label className="block text-xs font-bold text-[#204434] mb-1.5 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#9D493E]" />
            <span>Lời thoại thuyết minh giọng nói (Hệ thống sẽ đọc to văn bản này khi bấm Loa):</span>
          </label>
          <textarea
            rows={4}
            value={currentStep.voiceText}
            onChange={(e) =>
              updateCurrentStep((s) => ({ ...s, voiceText: e.target.value }))
            }
            className="w-full text-xs p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 text-[#204434] leading-relaxed outline-none focus:border-[#204434]"
            placeholder="Nhập lời hướng dẫn tự động..."
          />
        </div>

        {/* Tips list */}
        <div>
          <label className="block text-xs font-bold text-[#204434] mb-2 flex items-center justify-between">
            <span>Danh sách Mẹo hữu ích (Tips):</span>
            <button
              type="button"
              onClick={() =>
                updateCurrentStep((s) => ({
                  ...s,
                  tips: [...s.tips, "Mẹo mới..."],
                }))
              }
              className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mẹo</span>
            </button>
          </label>

          <div className="space-y-2">
            {currentStep.tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => {
                    const newTips = [...currentStep.tips];
                    newTips[idx] = e.target.value;
                    updateCurrentStep((s) => ({ ...s, tips: newTips }));
                  }}
                  className="flex-1 text-xs p-2.5 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 text-[#204434] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTips = currentStep.tips.filter((_, i) => i !== idx);
                    updateCurrentStep((s) => ({ ...s, tips: newTips }));
                  }}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Xóa mẹo này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Checklist */}
        <div>
          <label className="block text-xs font-bold text-[#204434] mb-2">
            Các điểm cần thao tác trên màn hình (Highlights):
          </label>
          <div className="space-y-3">
            {currentStep.mockup.highlights.map((hl, hIdx) => (
              <div
                key={hl.id || hIdx}
                className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-3">
                  <span className="text-[10px] font-bold text-[#526c50] block mb-1">Badge (Ví dụ: ❶ Bấm chọn):</span>
                  <input
                    type="text"
                    value={hl.badge}
                    onChange={(e) => {
                      const newHl = [...currentStep.mockup.highlights];
                      newHl[hIdx].badge = e.target.value;
                      updateCurrentStep((s) => ({
                        ...s,
                        mockup: { ...s.mockup, highlights: newHl },
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#BC9B6B]/30 font-bold text-[#204434]"
                  />
                </div>

                <div className="md:col-span-4">
                  <span className="text-[10px] font-bold text-[#526c50] block mb-1">Tên thao tác:</span>
                  <input
                    type="text"
                    value={hl.label}
                    onChange={(e) => {
                      const newHl = [...currentStep.mockup.highlights];
                      newHl[hIdx].label = e.target.value;
                      updateCurrentStep((s) => ({
                        ...s,
                        mockup: { ...s.mockup, highlights: newHl },
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#BC9B6B]/30 font-semibold text-[#204434]"
                  />
                </div>

                <div className="md:col-span-5">
                  <span className="text-[10px] font-bold text-[#526c50] block mb-1">Mô tả tác vụ:</span>
                  <input
                    type="text"
                    value={hl.description}
                    onChange={(e) => {
                      const newHl = [...currentStep.mockup.highlights];
                      newHl[hIdx].description = e.target.value;
                      updateCurrentStep((s) => ({
                        ...s,
                        mockup: { ...s.mockup, highlights: newHl },
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#BC9B6B]/30 text-[#204434]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-[#BC9B6B]/20 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi Cẩm nang"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
