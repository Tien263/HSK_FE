"use client";

import React, { useState } from "react";
import {
  X,
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Volume2,
  Award,
  Layers,
} from "lucide-react";

interface AiWritingCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  lessonNumber?: number;
  hskLevel?: number;
  samplePrompt?: string;
}

export default function AiWritingCheckerModal({
  isOpen,
  onClose,
  lessonTitle = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  samplePrompt,
}: AiWritingCheckerModalProps) {
  const [inputText, setInputText] = useState<string>("");
  const [checking, setChecking] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Câu mẫu gợi ý luyện viết
  const sampleSuggestions = [
    "今天我休息，我和朋友一起去学校看书。",
    "王老师，您好！我是新来的学生，我叫李文。",
    "这儿的苹果真便宜，我想买两个苹果。",
    "我晚上六点半下班，你什么时候有空？",
  ];

  // Phát âm câu văn
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheckWriting = async () => {
    if (!inputText.trim()) {
      alert("Vui lòng nhập câu hoặc đoạn văn tiếng Trung để AI kiểm tra.");
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/ai/check-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          lessonNumber,
          hskLevel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || "Có lỗi xảy ra khi kiểm tra bài viết.");
      }
    } catch (e) {
      console.warn("handleCheckWriting error:", e);
      alert("Không kết nối được dịch vụ kiểm tra bài viết.");
    } finally {
      setChecking(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[94vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-[#BC9B6B] flex items-center justify-center shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
                  Sửa Lỗi Ngữ Pháp & Chấm Đoạn Văn AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                  Đối chiếu Từ Điển CSDL
                </span>
              </div>
              <p className="text-xs text-[#315E48]">
                {lessonTitle} · Bắt lỗi trật tự từ, lượng từ, trợ từ và gợi ý văn phong chuẩn bản xứ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Khung nhập liệu văn bản */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#315E48]">
            <label>Nhập câu hoặc đoạn văn tiếng Trung của bạn:</label>
            <span className="font-mono text-[#8F6D3B]">
              {inputText.length} ký tự
            </span>
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ví dụ: 我去学校明天，我想买两苹果。(Thử nhập một câu có lỗi để xem AI bắt lỗi và sửa nhé!)"
            className="w-full p-3.5 rounded-2xl border border-[#E5DEC9] bg-white text-[#204434] text-sm font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#204434]/20 resize-none shadow-inner"
          />

          {/* Gợi ý mẫu câu nhanh */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#8F6D3B] font-bold">Mẫu thử nhanh:</span>
            {sampleSuggestions.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(sample)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] text-[#204434] font-serif transition cursor-pointer truncate max-w-[200px]"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Nút Kiểm Tra */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCheckWriting}
              disabled={checking || !inputText.trim()}
              className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
              <span>{checking ? "AI đang phân tích từ điển & ngữ pháp..." : "Kiểm tra ngữ pháp & Chấm điểm AI"}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* KẾT QUẢ PHÂN TÍCH NGỮ PHÁP & KHO TỪ ĐIỂN                            */}
        {/* =================================================================== */}
        {result && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* Thẻ Điểm Số & Nhận Xét Sư Phạm */}
            <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#204434] text-white flex flex-col items-center justify-center font-serif shadow-xs">
                  <span className="text-xl font-bold">{result.score}</span>
                  <span className="text-[9px] text-[#BC9B6B]">ĐIỂM</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#204434]">
                    {result.score >= 90
                      ? "🌟 Xuất sắc! Câu văn rất tự nhiên và chuẩn ngữ pháp"
                      : result.score >= 75
                      ? "👍 Khá tốt! Câu văn rõ nghĩa, có vài điểm ngữ pháp cần lưu ý"
                      : "⚠️ Cần chú ý trật tự từ và quy tắc ngữ pháp tiếng Trung"}
                  </h4>
                  <p className="text-xs text-[#315E48] mt-0.5 leading-relaxed">
                    {result.pedagogicalComment}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#8F6D3B] shrink-0">
                Phát hiện {result.issuesCount} điểm lưu ý
              </span>
            </div>

            {/* Danh sách lỗi ngữ pháp phát hiện được */}
            {result.issues && result.issues.length > 0 && (
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-2.5">
                <span className="text-xs font-bold text-red-900 block flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-700" />
                  <span>Các điểm ngữ pháp cần điều chỉnh:</span>
                </span>
                <div className="space-y-2">
                  {result.issues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-red-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-red-700">{issue.original}</strong>
                        <span className="text-emerald-700 font-bold">➡️ Sửa thành: {issue.suggestion}</span>
                      </div>
                      <p className="text-[#315E48] text-[11px] leading-relaxed">{issue.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bản Sửa Lỗi Chuẩn Ngữ Pháp & Bản Trau Chuốt Bản Xứ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bản sửa lỗi */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bản sửa đúng chuẩn ngữ pháp:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakText(result.correctedText)}
                      className="p-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(result.correctedText)}
                      className="p-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                      title="Sao chép"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="font-serif font-bold text-base text-emerald-950 leading-relaxed">
                  {result.correctedText}
                </p>
              </div>

              {/* Bản trau chuốt chuẩn bản xứ */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Bản trau chuốt tự nhiên (Bản xứ):</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakText(result.nativePolish)}
                      className="p-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(result.nativePolish)}
                      className="p-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 cursor-pointer"
                      title="Sao chép"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="font-serif font-bold text-base text-amber-950 leading-relaxed">
                  {result.nativePolish}
                </p>
              </div>
            </div>

            {/* Bóc tách Từ vựng qua Kho Từ Điển CSDL */}
            {result.vocabBreakdown && result.vocabBreakdown.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] space-y-2 text-xs">
                <span className="font-bold text-[#8F6D3B] block">
                  Từ vựng tra cứu được trong câu từ Kho Từ Điển ({result.vocabBreakdown.length} từ):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {result.vocabBreakdown.map((item: any, vIdx: number) => (
                    <div
                      key={vIdx}
                      className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-serif text-[#204434] text-sm">{item.hanzi}</strong>
                        <span className="font-mono text-[#8F6D3B] text-[10px]">{item.pinyin}</span>
                      </div>
                      <p className="text-[10px] text-[#315E48] truncate">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
          <span className="text-xs text-[#315E48]">
            HSK {hskLevel} · Bài {lessonNumber} · Rèn luyện kỹ năng viết tiếng Trung
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
