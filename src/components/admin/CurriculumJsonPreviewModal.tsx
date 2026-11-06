"use client";

import { playChineseSpeech } from "@/lib/chinese-speech-player";
import React, { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  BookOpen,
  Layers,
  Sparkles,
  MessageSquare,
  Globe2,
  BookMarked,
  Volume2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Upload,
} from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

import { applyCurriculumImport, type CurriculumLessonRow } from "@/lib/curriculum-format";

interface CurriculumJsonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  incomingLessons: Hsk1FullLesson[];
  incomingRows: CurriculumLessonRow[];
  currentLessons: Hsk1FullLesson[];
  level: number;
  onConfirmApply: (appliedLessons: Hsk1FullLesson[]) => Promise<boolean>;
}

export default function CurriculumJsonPreviewModal({
  isOpen,
  onClose,
  fileName,
  incomingLessons,
  incomingRows,
  currentLessons,
  level,
  onConfirmApply,
}: CurriculumJsonPreviewModalProps) {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "vocab" | "grammar" | "dialogue" | "phonetics" | "culture" | "reading"
  >("vocab");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !incomingLessons || incomingLessons.length === 0) return null;

  const currentLesson = incomingLessons[selectedLessonIdx] || incomingLessons[0];
  const incomingNumbers = new Set(incomingLessons.map((lesson) => lesson.number));
  const removed = currentLessons.filter((lesson) => !incomingNumbers.has(lesson.number)).length;
  const mergedCount = removed + incomingNumbers.size;

  // Tổng hợp thống kê nhanh toàn bộ file vừa nạp
  const totalVocab = incomingLessons.reduce(
    (acc, l) => acc + (l.vocabList?.length || 0),
    0
  );
  const totalGrammar = incomingLessons.reduce(
    (acc, l) => acc + (l.grammarList?.length || 0),
    0
  );
  const totalDialogue = incomingLessons.reduce(
    (acc, l) => acc + (l.dialogue?.length || 0),
    0
  );
  const totalReading = incomingLessons.filter(
    (l) => l.reading?.contentZh || (l as any).readingItem?.contentZh
  ).length;
  const totalCulture = incomingLessons.filter(
    (l) => l.culture || l.culturalNote?.context
  ).length;

  const handleSpeak = (text: string) => {
    void playChineseSpeech(text);
  };

  const handleApply = async () => {
    if (applying) return;
    if (importMode === "replace" && !confirm(
      `Thay toàn bộ giáo trình HSK ${level}? ${removed} bài không có trong file sẽ bị xóa.`
    )) return;
    setApplying(true);
    setError("");
    try {
      const applied = applyCurriculumImport(currentLessons, incomingRows, level, "lessons", importMode);
      if (await onConfirmApply(applied)) onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể áp dụng file giáo trình.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        
        {error && <p role="alert" className="shrink-0 bg-red-50 px-5 py-2 text-sm text-red-800">{error}</p>}
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shrink-0">
              审
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold">
                  Xem trước giáo trình JSON: {fileName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px]">
                  HSK {level}
                </span>
              </div>
              <p className="text-xs text-[#BC9B6B]">
                Giáo viên có thể duyệt trực quan từng bài trước khi quyết định đưa vào kho học liệu chính thức.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={applying} onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Statistics Strip */}
        <div className="px-5 py-3 bg-[#F8F5ED] border-b border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] font-bold text-[#204434] shadow-2xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>{incomingLessons.length} bài học</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] font-bold text-[#204434] shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>{totalVocab} từ vựng</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] font-bold text-[#204434] shadow-2xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>{totalGrammar} ngữ pháp</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] font-bold text-[#204434] shadow-2xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>{totalDialogue} câu thoại</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] font-bold text-[#204434] shadow-2xs flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>{totalReading} bài đọc hiểu</span>
            </span>
          </div>

          {/* Merge Mode Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8F6D3B] font-bold">Chế độ áp dụng:</span>
            <div className="flex rounded-xl bg-white p-1 border border-[#E5DEC9] shadow-2xs">
              <button
                type="button"
                onClick={() => setImportMode("merge")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                  importMode === "merge"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "text-[#526c50] hover:bg-[#204434]/10"
                }`}
                title="Giữ nguyên bài cũ, chỉ thêm bài mới hoặc cập nhật bài trùng số"
              >
                <span>➕ Ghép thêm ({mergedCount} bài)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode("replace")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                  importMode === "replace"
                    ? "bg-[#9D493E] text-white shadow-2xs"
                    : "text-[#526c50] hover:bg-[#9D493E]/10"
                }`}
                title="Xóa toàn bộ bài cũ, chỉ lấy các bài trong file mới"
              >
                <span>🔄 Ghi đè ({incomingLessons.length} bài)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Two columns layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Lesson Selector */}
          <div className="w-64 sm:w-72 border-r border-[#E5DEC9] bg-[#FAF7F0] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#E5DEC9] text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">
              Danh sách bài trong file ({incomingLessons.length})
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {incomingLessons.map((les, idx) => {
                const isSelected = idx === selectedLessonIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedLessonIdx(idx)}
                    className={`w-full text-left p-2.5 rounded-2xl transition cursor-pointer flex flex-col gap-1 border ${
                      isSelected
                        ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                        : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#204434]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">
                        Bài {les.number}: {les.titleZh}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#FAF7F0] text-[#8F6D3B]"
                      }`}>
                        #{les.number}
                      </span>
                    </div>
                    <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[#526c50]"}`}>
                      {les.titleVi || "Chưa có tiêu đề tiếng Việt"}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-80 pt-0.5">
                      <span>{les.vocabList?.length || 0} từ</span>
                      <span>•</span>
                      <span>{les.grammarList?.length || 0} ngữ pháp</span>
                      <span>•</span>
                      <span>{les.dialogue?.length || 0} thoại</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Lesson Detail Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Lesson Title Box */}
            <div className="p-4 bg-gradient-to-b from-[#FAF7F0] to-white border-b border-[#E5DEC9] shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">
                      Bài {currentLesson.number}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="font-mono text-xs text-[#8F6D3B]">
                      {currentLesson.pinyin || ""}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#204434] mt-0.5">
                    {currentLesson.titleZh} — {currentLesson.titleVi}
                  </h4>
                  {currentLesson.desc && (
                    <p className="text-xs text-[#526c50] mt-1 line-clamp-2">
                      {currentLesson.desc}
                    </p>
                  )}
                </div>
              </div>

              {/* Sub-Tabs for 6 sections */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#E5DEC9]/60 overflow-x-auto text-xs">
                {[
                  { id: "vocab", label: `Từ vựng (${currentLesson.vocabList?.length || 0})`, icon: Sparkles },
                  { id: "grammar", label: `Ngữ pháp (${currentLesson.grammarList?.length || 0})`, icon: Layers },
                  { id: "dialogue", label: `Hội thoại (${currentLesson.dialogue?.length || 0})`, icon: MessageSquare },
                  { id: "phonetics", label: "Ngữ âm", icon: Volume2 },
                  { id: "culture", label: "Văn hóa", icon: Globe2 },
                  { id: "reading", label: "Đọc hiểu", icon: BookMarked },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? "bg-[#204434] text-white shadow-2xs"
                          : "text-[#526c50] hover:bg-[#FAF7F0]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* TAB 1: VOCABULARY */}
              {activeTab === "vocab" && (
                <div className="space-y-3">
                  {(!currentLesson.vocabList || currentLesson.vocabList.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#FAF7F0] rounded-2xl">
                      Bài này chưa có từ vựng nào trong file JSON.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentLesson.vocabList.map((v, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F0]/40 space-y-2 hover:border-[#BC9B6B] transition shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-lg text-[#204434]">
                                {v.hanzi}
                              </span>
                              <span className="font-mono text-xs text-[#8F6D3B]">
                                {v.pinyin}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpeak(v.hanzi)}
                                className="p-1 text-[#8F6D3B] hover:text-[#204434] cursor-pointer"
                                title="Nghe từ"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5DEC9] text-[#204434]">
                              {v.type || v.wordType || "Từ vựng"}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-[#204434]">
                            {v.meaningVi || v.meaning}
                          </div>

                          {v.usageExplanation && (
                            <p className="text-[11px] text-[#526c50] italic line-clamp-2">
                              {v.usageExplanation}
                            </p>
                          )}

                          {v.exampleZh && (
                            <div className="pt-1.5 border-t border-[#E5DEC9]/60 text-[11px] space-y-0.5">
                              <div className="font-serif font-bold text-[#204434]">
                                {v.exampleZh}
                              </div>
                              <div className="text-[#526c50]">
                                {v.exampleVi}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GRAMMAR */}
              {activeTab === "grammar" && (
                <div className="space-y-4">
                  {(!currentLesson.grammarList || currentLesson.grammarList.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#FAF7F0] rounded-2xl">
                      Bài này chưa có điểm ngữ pháp nào trong file JSON.
                    </div>
                  ) : (
                    currentLesson.grammarList.map((g, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F0]/30 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif font-bold text-sm text-[#204434]">
                            {g.title} {g.titleZh && <span className="font-normal font-sans text-xs text-[#8F6D3B]">({g.titleZh})</span>}
                          </h5>
                          <span className="text-[10px] font-mono text-[#8F6D3B] px-2 py-0.5 bg-white border border-[#E5DEC9] rounded-md">
                            Điểm #{i + 1}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] font-mono text-xs font-bold text-[#8F6D3B]">
                          Cấu trúc: {g.structure}
                        </div>

                        {(g.explanation || g.usageExplanation) && (
                          <p className="text-xs text-[#526c50] leading-relaxed">
                            {g.explanation || g.usageExplanation}
                          </p>
                        )}

                        {g.example && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                              Ví dụ mẫu:
                            </span>
                            <p className="font-serif font-bold text-[#204434]">{g.example}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: DIALOGUE */}
              {activeTab === "dialogue" && (
                <div className="space-y-3">
                  {(!currentLesson.dialogue || currentLesson.dialogue.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#FAF7F0] rounded-2xl">
                      Bài này chưa có câu thoại nào trong file JSON.
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FAF7F0]/30 border border-[#E5DEC9] space-y-3">
                      {currentLesson.dialogue.map((d, i) => {
                        const isEven = i % 2 === 0;
                        return (
                          <div
                            key={i}
                            className={`flex flex-col ${isEven ? "items-start" : "items-end"} gap-1`}
                          >
                            <span className="text-[10px] font-bold text-[#8F6D3B] px-1">
                              {d.speaker}
                            </span>
                            <div
                              className={`p-3 rounded-2xl max-w-[85%] border shadow-2xs ${
                                isEven
                                  ? "bg-white border-[#E5DEC9] text-[#204434] rounded-tl-xs"
                                  : "bg-[#204434] border-[#204434] text-white rounded-tr-xs"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div>
                                  <div className={`font-serif font-bold text-sm ${isEven ? "text-[#204434]" : "text-amber-100"}`}>
                                    {d.zh}
                                  </div>
                                  <div className={`text-[11px] font-mono mt-0.5 ${isEven ? "text-[#8F6D3B]" : "text-amber-200/90"}`}>
                                    {d.pinyin}
                                  </div>
                                  <div className={`text-xs mt-1 ${isEven ? "text-[#526c50]" : "text-white/80"}`}>
                                    {d.vi}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSpeak(d.zh)}
                                  className={`p-1 rounded-lg shrink-0 ${
                                    isEven ? "text-[#8F6D3B] hover:bg-[#FAF7F0]" : "text-amber-200 hover:bg-white/10"
                                  }`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PHONETICS */}
              {activeTab === "phonetics" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F0]/40 border border-[#E5DEC9] space-y-3">
                    <h5 className="font-serif font-bold text-sm text-[#204434]">
                      {currentLesson.phonetics?.title || "Chưa có tiêu đề ngữ âm"}
                    </h5>
                    <p className="text-xs text-[#526c50] leading-relaxed">
                      {currentLesson.phonetics?.rule || "Chưa có quy tắc phát âm"}
                    </p>
                    {Array.isArray(currentLesson.phonetics?.examples) && currentLesson.phonetics.examples.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentLesson.phonetics.examples.map((ex, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E5DEC9] font-mono text-xs text-[#8F6D3B] font-bold"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CULTURE */}
              {activeTab === "culture" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F0]/40 border border-[#E5DEC9] space-y-3">
                    <h5 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4 text-[#8F6D3B]" />
                      <span>Kiến thức văn hóa Trung Hoa thực tế</span>
                    </h5>
                    <p className="text-xs text-[#526c50] leading-relaxed whitespace-pre-line">
                      {currentLesson.culture || currentLesson.culturalNote?.context || "Chưa có ghi chú văn hóa."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 6: READING */}
              {activeTab === "reading" && (
                <div className="space-y-4">
                  {currentLesson.reading?.contentZh ? (
                    <div className="p-4 rounded-2xl bg-[#FAF7F0]/40 border border-[#E5DEC9] space-y-3">
                      <h5 className="font-serif font-bold text-sm text-[#204434]">
                        {currentLesson.reading.titleZh} — {currentLesson.reading.titleVi}
                      </h5>
                      <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] font-serif text-sm leading-relaxed text-[#204434]">
                        {currentLesson.reading.contentZh}
                      </div>
                      <div className="font-mono text-xs text-[#8F6D3B] leading-relaxed">
                        {currentLesson.reading.contentPy}
                      </div>
                      <div className="text-xs text-[#526c50] leading-relaxed pt-2 border-t border-[#E5DEC9]/60">
                        {currentLesson.reading.contentVi}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#FAF7F0] rounded-2xl">
                      Bài này chưa có bài đọc hiểu mở rộng trong file JSON.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#F8F5ED] border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#8F6D3B]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {importMode === "merge"
                ? `Sau khi ghép, giáo trình HSK ${level} sẽ có tổng cộng ${mergedCount} bài học.`
                : `Sau khi ghi đè, giáo trình HSK ${level} sẽ được thay thế hoàn toàn bởi ${incomingLessons.length} bài học mới.`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={applying} onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-bold hover:bg-white transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={applying} onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>Xác nhận áp dụng vào giáo trình</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
