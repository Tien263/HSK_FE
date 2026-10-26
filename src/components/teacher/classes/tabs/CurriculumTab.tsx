"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  FileText,
  Volume2,
  Calendar,
  Layers,
  RotateCcw,
} from "lucide-react";
import { ClassDetailItem } from "../types";
import { useCurriculumLessons } from "@/lib/use-curriculum";

interface CurriculumTabProps {
  currentClass: ClassDetailItem;
  curriculumLessons: any[];
  loadingCurriculum: boolean;
  onOpenCustomizeLesson: (lessonNumber: number) => void;
  onRevokeLesson?: (lessonNumber: number) => void;
}

export default function CurriculumTab({
  currentClass,
  curriculumLessons,
  loadingCurriculum,
  onOpenCustomizeLesson,
  onRevokeLesson,
}: CurriculumTabProps) {
  const classLevel = currentClass.level || 1;
  const { lessons: sourceLessons } = useCurriculumLessons(classLevel);
  const baseLessons=[...sourceLessons,...curriculumLessons.filter(item=>item.content&&!sourceLessons.some(lesson=>lesson.number===item.lessonNumber)).map(item=>item.content)].sort((a,b)=>a.number-b.number);
  const publishedCount = curriculumLessons.filter(
    (l) => l.status === "PUBLISHED" || l.isPublished
  ).length;

  return (
    <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD0]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-serif font-bold text-[#17382F]">
              Lộ trình bài học lớp {currentClass.name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1F513F]/10 text-[#1F513F] text-xs font-semibold">
              Khung HSK 3.0 (Cấp {classLevel})
            </span>
          </div>
          <p className="text-xs text-[#6B766D] mt-1">
            Quản lý và phân phối chính xác nội dung học cho lớp. Chỉ những từ vựng, ngữ pháp cô/thầy tích chọn mới được chuyển đến học sinh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1F513F] bg-[#1F513F]/10 px-3 py-1.5 rounded-xl">
            Đã công bố: {publishedCount} / {baseLessons.length} bài
          </span>
        </div>
      </div>

      {loadingCurriculum ? (
        <div className="py-12 text-center text-xs text-[#6B766D]">
          <div className="w-6 h-6 border-2 border-[#1F513F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Đang đồng bộ lộ trình bài học của lớp...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {baseLessons.map((ls) => {
            const cl = curriculumLessons.find((c) => c.lessonNumber === ls.number);
            const isPublished = cl?.status === "PUBLISHED" || cl?.isPublished;
            const isDraft = cl?.status === "DRAFT";

            const effectiveVocabCount =
              cl?.vocabCount ?? (cl?.selectedVocabs?.length || ls.vocabCount);
            const effectiveGrammarCount =
              cl?.grammarCount ?? (cl?.selectedGrammars?.length || ls.grammarCount);

            return (
              <div
                key={ls.number}
                className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3 transition ${
                  isPublished
                    ? "bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-500/10"
                    : isDraft
                    ? "bg-[#FFFDF7] border-amber-300 shadow-2xs"
                    : "bg-[#FBF9F2]/70 border-[#E5DFD0]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#8F6D3B] bg-[#F7F5EE] px-2 py-0.5 rounded-md border border-[#E5DFD0]">
                      Bài {String(ls.number).padStart(2, "0")}
                    </span>

                    {isPublished ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã công bố</span>
                      </span>
                    ) : isDraft ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Bản nháp</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-gray-500" />
                        <span>Khóa (Chưa giao)</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#17382F] leading-snug">
                      {ls.titleZh}
                    </h4>
                    <p className="text-[11px] text-[#6B766D] font-mono mt-0.5">
                      {ls.pinyin}
                    </p>
                    <p className="text-xs text-[#17382F]/80 mt-1 line-clamp-1">
                      {ls.titleVi}
                    </p>
                  </div>

                  {/* Summary of assigned contents */}
                  <div className="pt-2 border-t border-[#E5DFD0]/60 grid grid-cols-2 gap-2 text-[11px] text-[#6B766D]">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#BC9B6B]" />
                      <span>{effectiveVocabCount} từ vựng</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#1F513F]" />
                      <span>{effectiveGrammarCount} ngữ pháp</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B766D]"><span>{(cl?.content||ls).dialogue.length} lượt hội thoại</span><span>{((cl?.content||ls).phonetics.rule||(cl?.content||ls).culture)?"Có ngữ âm / văn hóa":"Chưa có ngữ âm / văn hóa"}</span></div>
                  {cl?.teacherNote && (
                    <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200 line-clamp-2">
                      <strong>Ghi chú:</strong> {cl.teacherNote}
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenCustomizeLesson(ls.number)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                      isPublished
                        ? "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        : isDraft
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-[#1F513F] hover:bg-[#17382F] text-white"
                    }`}
                  >
                    <span>
                      {isPublished
                        ? "Chỉnh sửa bài đã công bố"
                        : isDraft
                        ? "Tiếp tục chỉnh sửa & Công bố"
                        : "Tùy chỉnh & Công bố bài này"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {(isPublished || isDraft) && onRevokeLesson && (
                    <button
                      type="button"
                      title="Thu hồi / Khóa lại bài học này"
                      onClick={() => onRevokeLesson(ls.number)}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-red-600 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
