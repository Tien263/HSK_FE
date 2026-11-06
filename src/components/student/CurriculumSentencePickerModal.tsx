"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Volume2,
  BookOpen,
  MessageSquare,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import {
  LessonSentenceItem,
  SentenceSourceCategory,
  getLessonSummariesForHsk,
  getSentencesByHskAndLesson,
} from "@/lib/lesson-sentence-extractor";

import { useCurriculumLessons } from "@/lib/use-curriculum";

interface CurriculumSentencePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHskLevel: number;
  currentLessonNumber: number;
  onSelectSentence: (sentence: LessonSentenceItem) => void;
  onPreviewSpeak: (text: string) => void;
}

const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function CurriculumSentencePickerModal({
  isOpen,
  onClose,
  currentHskLevel = 1,
  currentLessonNumber = 1,
  onSelectSentence,
  onPreviewSpeak,
}: CurriculumSentencePickerModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentHskLevel);
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(currentLessonNumber);
  const [categoryFilter, setCategoryFilter] = useState<SentenceSourceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Đồng bộ cấp HSK và bài học khi modal được mở lại
  useEffect(() => {
    if (isOpen) {
      if (currentHskLevel) setSelectedLevel(currentHskLevel);
      if (currentLessonNumber) setSelectedLessonNum(currentLessonNumber);
    }
  }, [isOpen, currentHskLevel, currentLessonNumber]);

  const { lessons, loading, error } = useCurriculumLessons(selectedLevel);

  // Danh sách các bài học của cấp HSK đã chọn
  const lessonSummaries = useMemo(() => {
    return getLessonSummariesForHsk(lessons, selectedLevel);
  }, [lessons, selectedLevel]);

  // Đảm bảo bài được chọn hợp lệ trong cấp HSK hiện tại
  useEffect(() => {
    if (lessonSummaries.length > 0 && !lessonSummaries.some((l) => l.number === selectedLessonNum)) {
      setSelectedLessonNum(lessonSummaries[0].number);
    }
  }, [selectedLevel, lessonSummaries, selectedLessonNum]);

  // Lấy toàn bộ câu luyện của bài học đang chọn
  const allSentences = useMemo(() => {
    return getSentencesByHskAndLesson(lessons, selectedLevel, selectedLessonNum);
  }, [lessons, selectedLevel, selectedLessonNum]);

  // Đếm số lượng theo danh mục
  const counts = useMemo(() => {
    return {
      all: allSentences.length,
      dialogue: allSentences.filter((s) => s.sourceCategory === "dialogue").length,
      vocab: allSentences.filter((s) => s.sourceCategory === "vocab").length,
      grammar: allSentences.filter((s) => s.sourceCategory === "grammar").length,
      reading: allSentences.filter((s) => s.sourceCategory === "reading").length,
    };
  }, [allSentences]);

  // Lọc theo danh mục và từ khóa tìm kiếm
  const filteredSentences = useMemo(() => {
    let list = allSentences;
    if (categoryFilter !== "all") {
      list = list.filter((s) => s.sourceCategory === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.zh.toLowerCase().includes(q) ||
          s.pinyin.toLowerCase().includes(q) ||
          s.vi.toLowerCase().includes(q) ||
          s.detailTag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSentences, categoryFilter, searchQuery]);

  // Bài học hiện tại
  const currentLessonMeta = useMemo(() => {
    return lessonSummaries.find((l) => l.number === selectedLessonNum) || lessonSummaries[0];
  }, [lessonSummaries, selectedLessonNum]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0E1512] border-2 border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#EADBC3]">
        
        {/* HEADER CỔ PHONG */}
        <div className="p-4 sm:p-5 border-b border-[#BC9B6B]/30 bg-[#151F1B] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-base sm:text-lg text-[#F3EFE6] tracking-wide">
                  Kho Câu Giáo Trình HSK · Bài Khóa & Ví Dụ
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  Chuẩn HSK 1–6
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Chọn câu thoại trong bài khóa hoặc ví dụ từ vựng, ngữ pháp để nạp trực tiếp vào phòng luyện âm AI Shadowing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BỘ LỌC CẤP HSK & BÀI HỌC */}
        <div className="p-4 border-b border-[#BC9B6B]/20 bg-[#121A16] space-y-3">
          {/* Cấp độ HSK */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <span className="font-serif font-bold text-[#BC9B6B]">1. Chọn Cấp Độ HSK:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {HSK_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setSelectedLessonNum(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedLevel === lvl
                      ? "bg-[#D4AF37] text-black shadow-md border border-[#D4AF37]"
                      : "bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10"
                  }`}
                >
                  HSK {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Bài học trong cấp HSK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-serif font-bold text-[#BC9B6B]">
                2. Chọn Bài Học (HSK {selectedLevel}):
              </span>
              <span className="text-[11px] text-stone-400">
                Đang xem: <strong className="text-[#D4AF37]">Bài {selectedLessonNum}</strong> - {currentLessonMeta?.titleZh}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {lessonSummaries.map((l) => (
                <button
                  key={l.number}
                  type="button"
                  onClick={() => setSelectedLessonNum(l.number)}
                  className={`px-3 py-2 rounded-xl text-left border transition text-xs whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    selectedLessonNum === l.number
                      ? "bg-[#D4AF37] border-2 border-[#F6E3A1] text-stone-950 shadow-md ring-2 ring-[#D4AF37]/30"
                      : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                  }`}
                >
                  <div className={`text-[10px] font-mono ${selectedLessonNum === l.number ? "text-stone-900 font-bold" : "text-[#D4AF37]"}`}>
                    Bài {String(l.number).padStart(2, "0")}
                  </div>
                  <div className={`font-serif line-clamp-1 ${selectedLessonNum === l.number ? "text-stone-950 font-black" : "text-white font-bold"}`}>
                    {l.titleZh}
                  </div>
                  <div className={`text-[10px] font-mono ${selectedLessonNum === l.number ? "text-stone-900 font-semibold" : "text-stone-400"}`}>
                    {l.totalSentences} câu luyện
                  </div>
                </button>
              ))}
            </div>
          </div>

          {loading && <p role="status" className="px-5 pt-3 text-sm">Đang tải giáo trình HSK {selectedLevel}…</p>}
          {error && <p role="alert" className="px-5 pt-3 text-sm text-red-700">{error}</p>}
        {/* Bộ lọc loại câu & Tìm kiếm */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Tabs danh mục */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 rounded-lg font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-[#D4AF37] text-black"
                    : "bg-white/5 text-stone-300 hover:text-white"
                }`}
              >
                <span>Tất cả</span>
                <span className="text-[10px] opacity-75 font-mono">({counts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("dialogue")}
                className={`px-3 py-1 rounded-lg font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "dialogue"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-stone-300 hover:text-white"
                }`}
              >
                <span>💬 Bài khóa / Hội thoại</span>
                <span className="text-[10px] opacity-75 font-mono">({counts.dialogue})</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("vocab")}
                className={`px-3 py-1 rounded-lg font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "vocab"
                    ? "bg-amber-600 text-white"
                    : "bg-white/5 text-stone-300 hover:text-white"
                }`}
              >
                <span>📖 Ví dụ Từ vựng</span>
                <span className="text-[10px] opacity-75 font-mono">({counts.vocab})</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("grammar")}
                className={`px-3 py-1 rounded-lg font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "grammar"
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-stone-300 hover:text-white"
                }`}
              >
                <span>⚖️ Ví dụ Ngữ pháp</span>
                <span className="text-[10px] opacity-75 font-mono">({counts.grammar})</span>
              </button>

              {counts.reading > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter("reading")}
                  className={`px-3 py-1 rounded-lg font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                    categoryFilter === "reading"
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-stone-300 hover:text-white"
                  }`}
                >
                  <span>📑 Bài đọc</span>
                  <span className="text-[10px] opacity-75 font-mono">({counts.reading})</span>
                </button>
              )}
            </div>

            {/* Ô tìm kiếm câu */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chữ Hán, Pinyin, nghĩa..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F3EFE6] placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU ĐỂ CHỌN */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredSentences.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-3xl opacity-40">🍃</div>
              <p className="text-sm font-serif text-stone-300">Không tìm thấy câu nào phù hợp với bộ lọc</p>
              <p className="text-xs text-stone-500">Hãy thử đổi sang danh mục khác hoặc xóa từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSentences.map((item, idx) => {
                const categoryBadge =
                  item.sourceCategory === "dialogue"
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-600/40"
                    : item.sourceCategory === "vocab"
                    ? "bg-amber-950/80 text-amber-300 border-amber-600/40"
                    : item.sourceCategory === "grammar"
                    ? "bg-blue-950/80 text-blue-300 border-blue-600/40"
                    : "bg-purple-950/80 text-purple-300 border-purple-600/40";

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#141E1A]/90 border border-[#BC9B6B]/25 hover:border-[#D4AF37] transition flex flex-col justify-between gap-3 group relative shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-2">
                      {/* Badge nguồn và tag chi tiết */}
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${categoryBadge}`}>
                          {item.categoryLabel}
                        </span>
                        <span className="text-stone-400 text-[10px] truncate max-w-[180px]">
                          {item.detailTag}
                        </span>
                      </div>

                      {/* Phiên âm Pinyin */}
                      {item.pinyin && (
                        <div className="text-xs font-mono text-[#D4AF37] tracking-wide">
                          {item.pinyin}
                        </div>
                      )}

                      {/* Câu chữ Hán */}
                      <div className="font-serif font-black text-lg text-white group-hover:text-[#F3EFE6] leading-snug">
                        {item.zh}
                      </div>

                      {/* Bản dịch tiếng Việt */}
                      <div className="text-xs text-stone-300 leading-relaxed italic">
                        &quot;{item.vi}&quot;
                      </div>

                      {/* Tip phát âm nếu có */}
                      {item.tip && (
                        <div className="text-[11px] text-stone-400 bg-black/30 p-2 rounded-xl border border-white/5">
                          💡 <span className="italic">{item.tip}</span>
                        </div>
                      )}
                    </div>

                    {/* Hàng nút thao tác: Nghe thử AI & Chọn luyện câu */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewSpeak(item.zh)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs font-serif transition flex items-center gap-1.5 cursor-pointer"
                        title="Nghe thử AI phát âm câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Nghe thử</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSentence(item);
                          onClose();
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2b] text-[#0A100E] text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chọn luyện câu này</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 border-t border-[#BC9B6B]/30 bg-[#121A16] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div>
            <span>Đang hiển thị </span>
            <strong className="text-[#D4AF37]">{filteredSentences.length}</strong> / {allSentences.length} câu trong{" "}
            <strong>HSK {selectedLevel} · Bài {selectedLessonNum}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-serif transition cursor-pointer"
          >
            Đóng bảng chọn
          </button>
        </div>
      </div>
    </div>
  );
}
