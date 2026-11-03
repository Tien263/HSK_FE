"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Eye,
  Layers,
} from "lucide-react";
import { PlacementQuestion, DEFAULT_PLACEMENT_TESTS } from "@/lib/placement-test-types";

export default function AdminPlacementTestSettings() {
  const [activeLevel, setActiveLevel] = useState<"hsk1_3" | "hsk4_6">("hsk1_3");
  const [hsk1_3, setHsk1_3] = useState<PlacementQuestion[]>(DEFAULT_PLACEMENT_TESTS.hsk1_3);
  const [hsk4_6, setHsk4_6] = useState<PlacementQuestion[]>(DEFAULT_PLACEMENT_TESTS.hsk4_6);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/placement-tests");
      const data = await res.json();
      if (data.success && data.config) {
        if (Array.isArray(data.config.hsk1_3)) setHsk1_3(data.config.hsk1_3);
        if (Array.isArray(data.config.hsk4_6)) setHsk4_6(data.config.hsk4_6);
      }
    } catch {
      setMessage({ type: "error", text: "Không thể tải đề kiểm tra từ máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/placement-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hsk1_3, hsk4_6 }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Đã lưu bộ đề khảo sát năng lực thành công!" });
        if (data.config) {
          setHsk1_3(data.config.hsk1_3);
          setHsk4_6(data.config.hsk4_6);
        }
      } else {
        setMessage({ type: "error", text: data.message || "Lỗi khi lưu đề." });
      }
    } catch {
      setMessage({ type: "error", text: "Mất kết nối máy chủ khi lưu đề." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục bộ câu hỏi khảo sát chuẩn mặc định của hệ thống?")) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/placement-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setHsk1_3(data.config.hsk1_3);
        setHsk4_6(data.config.hsk4_6);
        setMessage({ type: "success", text: "Đã khôi phục toàn bộ câu hỏi khảo sát mặc định thành công!" });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối khi khôi phục đề." });
    } finally {
      setSaving(false);
    }
  };

  const currentQuestions = activeLevel === "hsk1_3" ? hsk1_3 : hsk4_6;
  const setCurrentQuestions = (updated: PlacementQuestion[]) => {
    if (activeLevel === "hsk1_3") setHsk1_3(updated);
    else setHsk4_6(updated);
  };

  const updateQuestion = (index: number, patch: Partial<PlacementQuestion>) => {
    const next = [...currentQuestions];
    next[index] = { ...next[index], ...patch };
    setCurrentQuestions(next);
  };

  const updateOption = (qIndex: number, optIndex: number, val: string) => {
    const next = [...currentQuestions];
    const newOptions = [...next[qIndex].options];
    newOptions[optIndex] = val;
    next[qIndex] = { ...next[qIndex], options: newOptions };
    setCurrentQuestions(next);
  };

  const addQuestion = () => {
    const newQ: PlacementQuestion = {
      id: currentQuestions.length + 1,
      questionZh: "请在横线处填入正确的词语：______",
      pinyin: "Qǐng zài héngxiàn chù tiánrù zhèngquè de cíyǔ: ______",
      questionVi: "Xin vui lòng điền từ chính xác vào chỗ trống: ______",
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correctIndex: 0,
      explanation: "Giải thích đáp án chi tiết...",
    };
    setCurrentQuestions([...currentQuestions, newQ]);
  };

  const removeQuestion = (index: number) => {
    if (currentQuestions.length <= 1) {
      alert("Đề khảo sát cần tối thiểu ít nhất 1 câu hỏi!");
      return;
    }
    const next = currentQuestions.filter((_, idx) => idx !== index).map((q, idx) => ({ ...q, id: idx + 1 }));
    setCurrentQuestions(next);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#204434]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#315E48]" />
        <p className="text-sm font-medium">Đang tải đề kiểm tra năng lực đầu vào...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BC9B6B]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#204434]" />
            <h2 className="text-xl font-bold text-[#204434]">Quản lý Đề Khảo sát Đầu vào (Onboarding Test)</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#204434]/10 text-[#204434]">
              {currentQuestions.length} câu hỏi
            </span>
          </div>
          <p className="text-xs text-[#315E48]/80 mt-1">
            Chỉnh sửa câu hỏi chữ Hán, Pinyin, nghĩa tiếng Việt, 4 đáp án và đáp án đúng cho bài kiểm tra trình độ khi học viên mới vào hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục đề gốc</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-md shadow-[#204434]/20 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Đang lưu..." : "Lưu đề khảo sát"}</span>
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Level Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveLevel("hsk1_3")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeLevel === "hsk1_3"
              ? "bg-[#204434] text-white shadow-md shadow-[#204434]/20"
              : "bg-white text-[#315E48] hover:bg-[#204434]/5 border border-[#BC9B6B]/20"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Khảo sát HSK 1 – HSK 3 ({hsk1_3.length} câu)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLevel("hsk4_6")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeLevel === "hsk4_6"
              ? "bg-[#204434] text-white shadow-md shadow-[#204434]/20"
              : "bg-white text-[#315E48] hover:bg-[#204434]/5 border border-[#BC9B6B]/20"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Khảo sát HSK 4 – HSK 6 ({hsk4_6.length} câu)</span>
        </button>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-4">
        {currentQuestions.map((q, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#BC9B6B]/25 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#BC9B6B]/15 pb-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#204434]/10 text-[#204434] font-bold text-xs">
                Câu hỏi {idx + 1}
              </span>

              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Xóa câu hỏi này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chữ Hán */}
            <div>
              <label className="block text-[11px] font-semibold text-[#204434] mb-1">
                Nội dung câu hỏi (Tiếng Trung)
              </label>
              <input
                type="text"
                value={q.questionZh}
                onChange={(e) => updateQuestion(idx, { questionZh: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50 font-serif text-sm"
              />
            </div>

            {/* Pinyin & Nghĩa tiếng Việt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#204434] mb-1">
                  Phiên âm Pinyin
                </label>
                <input
                  type="text"
                  value={q.pinyin}
                  onChange={(e) => updateQuestion(idx, { pinyin: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#204434] mb-1">
                  Dịch nghĩa tiếng Việt
                </label>
                <input
                  type="text"
                  value={q.questionVi}
                  onChange={(e) => updateQuestion(idx, { questionVi: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
                />
              </div>
            </div>

            {/* 4 Phương án lựa chọn & Chọn đáp án đúng */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-[#204434] mb-2">
                4 Lựa chọn trả lời & Đáp án đúng (Tích vào hình tròn để chọn đáp án đúng):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {["A", "B", "C", "D"].map((letter, optIdx) => (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition ${
                      q.correctIndex === optIdx
                        ? "border-[#204434] bg-emerald-50/70 shadow-xs"
                        : "border-[#BC9B6B]/25 bg-white"
                    }`}
                  >
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name={`correct_${activeLevel}_${idx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() => updateQuestion(idx, { correctIndex: optIdx })}
                        className="w-4 h-4 text-[#204434] accent-[#204434] cursor-pointer"
                      />
                      <span className="font-bold text-xs text-[#204434]">{letter}:</span>
                    </label>

                    <input
                      type="text"
                      value={q.options[optIdx] || ""}
                      onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                      placeholder={`Nội dung lựa chọn ${letter}...`}
                      className="w-full text-xs bg-transparent outline-none text-[#204434]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lời giải thích */}
            <div>
              <label className="block text-[11px] font-semibold text-[#204434] mb-1">
                Lời giải thích ngữ pháp / từ vựng (hiển thị khi học viên làm xong):
              </label>
              <input
                type="text"
                value={q.explanation}
                onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                placeholder="Giải thích vì sao đáp án này đúng..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
              />
            </div>
          </div>
        ))}

        {/* Nút thêm câu hỏi */}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#BC9B6B]/40 hover:border-[#204434] bg-[#FAF7EE]/60 text-xs font-bold text-[#204434] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới vào đề {activeLevel === "hsk1_3" ? "HSK 1-3" : "HSK 4-6"}</span>
        </button>
      </div>
    </div>
  );
}
