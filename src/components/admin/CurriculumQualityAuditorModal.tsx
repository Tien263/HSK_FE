"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  MessageSquare,
  Globe2,
  BookMarked,
  ArrowRight,
  Filter,
} from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

interface AuditIssue {
  id: string;
  lessonNumber: number;
  lessonTitle: string;
  category: "vocab" | "grammar" | "dialogue" | "phonetics" | "culture" | "reading";
  severity: "critical" | "warning";
  itemName: string;
  description: string;
  targetTab: "vocab" | "grammar" | "dialogue" | "phonetics" | "richcontent";
}

interface CurriculumQualityAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Hsk1FullLesson[];
  level: number;
  onSelectLessonForEdit: (lesson: Hsk1FullLesson, tab: any) => void;
}

export default function CurriculumQualityAuditorModal({
  isOpen,
  onClose,
  lessons,
  level,
  onSelectLessonForEdit,
}: CurriculumQualityAuditorModalProps) {
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "critical" | "warning">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const issues = useMemo(() => {
    const list: AuditIssue[] = [];

    lessons.forEach((les) => {
      const lesTitle = `Bài ${les.number}: ${les.titleZh || "Chưa có tiêu đề"}`;

      // 1. Quét từ vựng
      if (!les.vocabList || les.vocabList.length === 0) {
        list.push({
          id: `les-${les.number}-novocab`,
          lessonNumber: les.number,
          lessonTitle: lesTitle,
          category: "vocab",
          severity: "critical",
          itemName: "Toàn bài",
          description: "Bài học chưa có bất kỳ từ vựng nào trong danh sách.",
          targetTab: "vocab",
        });
      } else {
        les.vocabList.forEach((v, idx) => {
          if (!v.hanzi?.trim()) {
            list.push({
              id: `les-${les.number}-v-${idx}-nohanzi`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "vocab",
              severity: "critical",
              itemName: `Từ #${idx + 1}`,
              description: "Hán tự bị để trống.",
              targetTab: "vocab",
            });
          }
          if (!v.pinyin?.trim()) {
            list.push({
              id: `les-${les.number}-v-${idx}-nopy`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "vocab",
              severity: "critical",
              itemName: v.hanzi || `Từ #${idx + 1}`,
              description: "Chưa có phiên âm Pinyin.",
              targetTab: "vocab",
            });
          }
          if (!v.meaningVi?.trim() && !v.meaning?.trim()) {
            list.push({
              id: `les-${les.number}-v-${idx}-nomeaning`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "vocab",
              severity: "critical",
              itemName: v.hanzi || `Từ #${idx + 1}`,
              description: "Chưa có bản dịch nghĩa tiếng Việt.",
              targetTab: "vocab",
            });
          }
          if (!v.exampleZh?.trim() && (!v.examples || v.examples.length === 0)) {
            list.push({
              id: `les-${les.number}-v-${idx}-noexample`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "vocab",
              severity: "warning",
              itemName: v.hanzi || `Từ #${idx + 1}`,
              description: "Chưa có câu ví dụ minh họa ngữ cảnh sử dụng.",
              targetTab: "vocab",
            });
          }
        });
      }

      // 2. Quét ngữ pháp
      if (!les.grammarList || les.grammarList.length === 0) {
        list.push({
          id: `les-${les.number}-nogrammar`,
          lessonNumber: les.number,
          lessonTitle: lesTitle,
          category: "grammar",
          severity: "warning",
          itemName: "Toàn bài",
          description: "Bài học chưa có điểm ngữ pháp nào.",
          targetTab: "grammar",
        });
      } else {
        les.grammarList.forEach((g, idx) => {
          if (!g.title?.trim()) {
            list.push({
              id: `les-${les.number}-g-${idx}-notitle`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "grammar",
              severity: "critical",
              itemName: `Điểm ngữ pháp #${idx + 1}`,
              description: "Thiếu tiêu đề điểm ngữ pháp.",
              targetTab: "grammar",
            });
          }
          if (!g.structure?.trim()) {
            list.push({
              id: `les-${les.number}-g-${idx}-nostruct`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "grammar",
              severity: "critical",
              itemName: g.title || `Điểm #${idx + 1}`,
              description: "Thiếu công thức / cấu trúc ngữ pháp.",
              targetTab: "grammar",
            });
          }
          if (!g.example?.trim() && (!g.examples || g.examples.length === 0)) {
            list.push({
              id: `les-${les.number}-g-${idx}-noex`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "grammar",
              severity: "warning",
              itemName: g.title || `Điểm #${idx + 1}`,
              description: "Chưa có câu ví dụ thực tế.",
              targetTab: "grammar",
            });
          }
        });
      }

      // 3. Quét hội thoại
      if (!les.dialogue || les.dialogue.length === 0) {
        list.push({
          id: `les-${les.number}-nodial`,
          lessonNumber: les.number,
          lessonTitle: lesTitle,
          category: "dialogue",
          severity: "warning",
          itemName: "Toàn bài",
          description: "Bài học chưa có đoạn hội thoại giao tiếp.",
          targetTab: "dialogue",
        });
      } else {
        les.dialogue.forEach((d, idx) => {
          if (!d.zh?.trim()) {
            list.push({
              id: `les-${les.number}-d-${idx}-nozh`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "dialogue",
              severity: "critical",
              itemName: `Câu thoại #${idx + 1}`,
              description: "Nội dung câu tiếng Trung bị rỗng.",
              targetTab: "dialogue",
            });
          }
          if (!d.vi?.trim()) {
            list.push({
              id: `les-${les.number}-d-${idx}-novi`,
              lessonNumber: les.number,
              lessonTitle: lesTitle,
              category: "dialogue",
              severity: "warning",
              itemName: `Câu thoại #${idx + 1} (${d.speaker || "Người nói"})`,
              description: "Chưa có bản dịch nghĩa tiếng Việt.",
              targetTab: "dialogue",
            });
          }
        });
      }

      // 4. Quét đọc hiểu & văn hóa
      if (!les.reading?.contentZh) {
        list.push({
          id: `les-${les.number}-noreading`,
          lessonNumber: les.number,
          lessonTitle: lesTitle,
          category: "reading",
          severity: "warning",
          itemName: "Bài đọc hiểu",
          description: "Chưa có bài đọc hiểu mở rộng.",
          targetTab: "richcontent",
        });
      }
      if (!les.culture?.trim() && !les.culturalNote?.context?.trim()) {
        list.push({
          id: `les-${les.number}-noculture`,
          lessonNumber: les.number,
          lessonTitle: lesTitle,
          category: "culture",
          severity: "warning",
          itemName: "Góc văn hóa",
          description: "Chưa có ghi chú văn hóa thực tế.",
          targetTab: "richcontent",
        });
      }
    });

    return list;
  }, [lessons]);

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  // Tính điểm chất lượng giáo trình (thang điểm 100)
  const totalItemsAudited = lessons.reduce((acc, l) => acc + (l.vocabList?.length || 0) + (l.grammarList?.length || 0) + (l.dialogue?.length || 0) + 2, 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - (criticalCount * 5 + warningCount * 1.5))));

  const filteredIssues = issues.filter((i) => {
    if (severityFilter !== "ALL" && i.severity !== severityFilter) return false;
    if (categoryFilter !== "ALL" && i.category !== categoryFilter) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold">
                  Quét lỗi & Kiểm định chất lượng giáo trình HSK {level}
                </h3>
              </div>
              <p className="text-xs text-[#BC9B6B]">
                Tự động kiểm tra thiếu sót Pinyin, nghĩa tiếng Việt, câu ví dụ và cấu trúc ngữ pháp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Metrics Banner */}
        <div className="p-4 sm:p-5 bg-[#FAF7F0] border-b border-[#E5DEC9] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm border ${
                score >= 85
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : score >= 60
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}>
                <span className="text-xl font-serif">{score}</span>
                <span className="text-[10px] uppercase tracking-wider">/ 100 đ</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#204434]">
                  {score >= 90
                    ? "Giáo trình đạt tiêu chuẩn Xuất sắc 🌟"
                    : score >= 75
                    ? "Giáo trình đạt chất lượng Tốt 👍"
                    : score >= 50
                    ? "Cần hoàn thiện thêm thông tin ⚠️"
                    : "Cần bổ sung nhiều mục học liệu còn thiếu 🚨"}
                </span>
              </div>
              <p className="text-xs text-[#526c50] mt-0.5">
                Đã quét {lessons.length} bài học ({totalItemsAudited} mục học liệu). Tìm thấy <strong>{criticalCount}</strong> lỗi cần sửa ngay và <strong>{warningCount}</strong> khuyến nghị bổ sung.
              </p>
            </div>
          </div>

          {/* Quick Filter buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSeverityFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                severityFilter === "ALL"
                  ? "bg-[#204434] text-white border-[#204434]"
                  : "bg-white text-[#204434] border-[#E5DEC9]"
              }`}
            >
              Tất cả ({issues.length})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter("critical")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                severityFilter === "critical"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              Lỗi cần sửa ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter("warning")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                severityFilter === "warning"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              Cảnh báo ({warningCount})
            </button>
          </div>
        </div>

        {/* Filter by Category bar */}
        <div className="px-5 py-2.5 bg-white border-b border-[#E5DEC9] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[#8F6D3B] font-bold shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc theo loại:
          </span>
          {[
            { id: "ALL", label: "Toàn bộ" },
            { id: "vocab", label: "Từ vựng" },
            { id: "grammar", label: "Ngữ pháp" },
            { id: "dialogue", label: "Hội thoại" },
            { id: "reading", label: "Đọc hiểu" },
            { id: "culture", label: "Văn hóa" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                categoryFilter === cat.id
                  ? "bg-[#204434]/15 text-[#204434]"
                  : "text-[#526c50] hover:bg-[#FAF7F0]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Issues List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#204434]">
                Tuyệt vời! Không tìm thấy vấn đề nào trong danh mục này.
              </h4>
              <p className="text-xs text-[#526c50]">
                Tất cả các mục học liệu đều đã được điền đầy đủ và đúng chuẩn.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const targetLesson = lessons.find((l) => l.number === issue.lessonNumber);
              const isCritical = issue.severity === "critical";

              return (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-2xl border transition shadow-2xs flex items-center justify-between gap-3 ${
                    isCritical
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-[#FAF7F0]/60 border-[#E5DEC9]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCritical ? (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#204434]">
                          {issue.lessonTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                          isCritical ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"
                        }`}>
                          {issue.category === "vocab"
                            ? "Từ vựng"
                            : issue.category === "grammar"
                            ? "Ngữ pháp"
                            : issue.category === "dialogue"
                            ? "Hội thoại"
                            : issue.category === "reading"
                            ? "Đọc hiểu"
                            : "Văn hóa"}
                        </span>
                        <span className="text-xs text-[#8F6D3B] font-serif font-bold">
                          [{issue.itemName}]
                        </span>
                      </div>
                      <p className="text-xs text-[#526c50] mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {targetLesson && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLessonForEdit(targetLesson, issue.targetTab);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    >
                      <span>Sửa ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8F6D3B]">
            * Nhấn &quot;Sửa ngay&quot; để nhảy trực tiếp vào đúng bài học và tab tương ứng.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold"
          >
            Đóng bảng kiểm định
          </button>
        </div>

      </div>
    </div>
  );
}
