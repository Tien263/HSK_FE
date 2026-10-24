"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import HanziPracticeModal from "./HanziPracticeModal";
import { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Play,
  Volume2,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  FileCheck2,
  X,
  Bookmark,
  PenTool,
  Mic,
  Zap,
  HelpCircle,
  Headphones,
  Globe,
  Award,
  Lock,
  AlertCircle,
} from "lucide-react";

interface StudentLessonsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
  activeHskLevel?: number;
}

export default function StudentLessonsWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
  activeHskLevel,
}: StudentLessonsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const activeClass = myClasses[0] || null;
  const currentLevel = activeHskLevel || activeClass?.level || 1;
  const [selectedHsk, setSelectedHsk] = useState(currentLevel);

  useEffect(() => {
    if (activeClass?.level) {
      setSelectedHsk(activeClass.level);
    } else if (activeHskLevel) {
      setSelectedHsk(activeHskLevel);
    }
  }, [activeClass?.level, activeHskLevel]);

  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [lessonModalTab, setLessonModalTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE" | "PHONETICS" | "CULTURE">("VOCAB");
  const [practiceWord, setPracticeWord] = useState<{ hanzi: string; pinyin: string; meaning: string } | null>(null);

  // DB class lessons (Single Source of Truth: PostgreSQL via REST API)
  const [dbClassLessons, setDbClassLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDbLessons = useCallback(async () => {
    if (!activeClass?.id) {
      setDbClassLessons([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/classes/${activeClass.id}/lessons`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.lessons)) {
          // Only show lessons published by the teacher
          const published = data.lessons.filter(
            (l: any) => l.status === "PUBLISHED" || l.isPublished === true
          );
          setDbClassLessons(published);
          return;
        }
      }
      setDbClassLessons([]);
    } catch (e) {
      console.warn("fetchDbLessons error:", e);
      setDbClassLessons([]);
    } finally {
      setLoading(false);
    }
  }, [activeClass?.id]);

  useEffect(() => {
    fetchDbLessons();
  }, [fetchDbLessons]);

  // Chinese TTS
  const speakChinese = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  // Base curriculum lessons for the current level
  const baseLessons = useMemo(() => {
    return getLessonsByHskLevel(selectedHsk);
  }, [selectedHsk]);

  // Combine DB published lessons with curriculum metadata
  const publishedLessons = useMemo(() => {
    if (!activeClass || dbClassLessons.length === 0) return [];
    
    return dbClassLessons.map((dbL) => {
      const base = baseLessons.find((b) => b.number === dbL.lessonNumber) || {
        number: dbL.lessonNumber,
        titleZh: dbL.titleZh || `第${dbL.lessonNumber}课`,
        titleVi: dbL.titleVi || `Bài ${dbL.lessonNumber}`,
        pinyin: dbL.pinyin || "",
        desc: dbL.desc || "Nội dung bài học do giáo viên phụ trách biên soạn.",
        durationMin: 35,
        vocabList: [],
        grammarList: [],
        dialogue: [],
      };

      return {
        ...base,
        id: `pub-ls-${dbL.lessonNumber}`,
        number: dbL.lessonNumber,
        titleZh: dbL.titleZh || base.titleZh,
        titleVi: dbL.titleVi || base.titleVi,
        pinyin: dbL.pinyin || base.pinyin,
        vocabList: Array.isArray(dbL.selectedVocabs) && dbL.selectedVocabs.length > 0
          ? dbL.selectedVocabs
          : base.vocabList,
        grammarList: Array.isArray(dbL.selectedGrammars) && dbL.selectedGrammars.length > 0
          ? dbL.selectedGrammars
          : base.grammarList,
        teacherNote: dbL.teacherNote || "",
        dueDate: dbL.dueDate || "",
        isPublished: true,
      };
    });
  }, [activeClass, dbClassLessons, baseLessons]);

  // Filter by search query
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return publishedLessons;
    const q = searchQuery.toLowerCase();
    return publishedLessons.filter(
      (ls) =>
        ls.titleZh.toLowerCase().includes(q) ||
        ls.titleVi.toLowerCase().includes(q) ||
        ls.pinyin.toLowerCase().includes(q)
    );
  }, [publishedLessons, searchQuery]);

  // 1. Empty State if student is not enrolled in any class
  if (!activeClass || myClasses.length === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <BookOpen className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Bạn chưa tham gia lớp học nào
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Kho bài học & Khám phá được đồng bộ trực tiếp theo lịch phân phối của giáo viên phụ trách lớp. Hãy nhập mã tham gia lớp học để bắt đầu!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => (onOpenJoinModal ? onOpenJoinModal() : onNavigateToTab?.("classes"))}
            className="px-6 py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Tham gia lớp học ngay</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Kho bài học Chuẩn HSK {selectedHsk}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              Lớp {activeClass.name}
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Đồng bộ theo lịch giảng dạy thực tế của giáo viên. Chỉ hiển thị các bài học đã được giáo viên công bố mở khóa.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8ea394] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bài học (VD: Lý Văn, số điện thoại...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#204434] focus:outline-hidden w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9]">
          <div className="w-6 h-6 border-2 border-[#204434]/20 border-t-[#204434] rounded-full animate-spin mx-auto mb-2" />
          Đang tải bài học từ giáo viên...
        </div>
      ) : filteredLessons.length === 0 ? (
        /* Empty state when NO lessons published yet */
        <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] flex items-center justify-center mx-auto text-[#315E48]">
            <BookOpen className="w-6 h-6 opacity-60" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#204434]">
              Lớp học hiện chưa có bài học nào được công bố
            </p>
            <p className="text-xs text-[#315E48]/70 max-w-sm mx-auto">
              Giáo viên phụ trách lớp <strong>{activeClass.name}</strong> chưa mở khóa bài học nào. Bạn sẽ thấy bài học xuất hiện tại đây ngay khi giáo viên công bố.
            </p>
          </div>
        </div>
      ) : (
        /* Grid of PUBLISHED lessons only */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((ls) => (
            <div
              key={ls.id}
              onClick={() => setSelectedLessonModal(ls)}
              className="p-5 rounded-3xl border shadow-2xs transition cursor-pointer flex flex-col justify-between space-y-3 group bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#204434] hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                    Bài {String(ls.number).padStart(2, "0")} · HSK {selectedHsk}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Đã mở</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434] group-hover:text-emerald-900 transition flex items-baseline gap-2">
                    <span>{ls.titleZh}</span>
                  </h3>
                  <div className="text-xs font-sans font-semibold text-[#8F6D3B]">
                    {ls.pinyin}
                  </div>
                  <p className="text-xs font-medium text-[#204434] mt-0.5">
                    {ls.titleVi}
                  </p>
                  <p className="text-xs text-[#315E48]/85 mt-1.5 line-clamp-2 leading-relaxed">
                    {ls.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
                <div className="flex items-center gap-2 text-[11px]">
                  <span>{ls.vocabList?.length || 0} từ</span>
                  <span>•</span>
                  <span>{ls.grammarList?.length || 0} ngữ pháp</span>
                  <span>•</span>
                  <span>{ls.durationMin || 35}p</span>
                </div>

                <span className="text-xs font-bold text-[#204434] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Vào học</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8F6D3B] font-bold">
                  Bài {selectedLessonModal.number} · HSK {selectedHsk}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#204434]">
                  {selectedLessonModal.titleZh} ({selectedLessonModal.titleVi})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLessonModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2 text-xs font-bold">
              {[
                { id: "VOCAB", label: `Từ vựng (${selectedLessonModal.vocabList?.length || 0})` },
                { id: "GRAMMAR", label: `Ngữ pháp (${selectedLessonModal.grammarList?.length || 0})` },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setLessonModalTab(tb.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    lessonModalTab === tb.id
                      ? "bg-[#204434] text-white"
                      : "text-[#315E48] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Vocabs View */}
            {lessonModalTab === "VOCAB" && (
              <div className="space-y-2">
                {selectedLessonModal.vocabList?.map((v: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#204434]">{v.hanzi}</span>
                        <span className="text-xs font-medium text-[#8F6D3B]">{v.pinyin}</span>
                      </div>
                      <p className="text-[11px] text-[#315E48]">{v.meaningVi || v.meaning}</p>
                    </div>
                    <button
                      onClick={() => speakChinese(v.hanzi)}
                      className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#204434] border border-[#E5DEC9]"
                      title="Phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Grammar View */}
            {lessonModalTab === "GRAMMAR" && (
              <div className="space-y-3">
                {selectedLessonModal.grammarList?.map((g: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5 text-xs"
                  >
                    <span className="font-bold text-[#204434] block text-sm">
                      {g.title || g.name}
                    </span>
                    {g.structure && (
                      <p className="text-[11px] font-mono text-[#8F6D3B] bg-[#FAF7F0] p-1.5 rounded-lg border border-[#E5DEC9]/60">
                        Cấu trúc: {g.structure}
                      </p>
                    )}
                    <p className="text-[11px] text-[#315E48]">
                      {g.desc || g.explanation}
                    </p>
                    {g.example && (
                      <p className="text-[11px] italic text-[#204434]">
                        Ví dụ: {g.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
