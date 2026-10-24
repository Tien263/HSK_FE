"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import HanziPracticeModal from "./HanziPracticeModal";
import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
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
} from "lucide-react";

interface StudentLessonsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
}

export default function StudentLessonsWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
}: StudentLessonsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHsk, setSelectedHsk] = useState(1);
  const [selectedLessonModal, setSelectedLessonModal] = useState<Hsk1FullLesson | null>(null);
  const [lessonModalTab, setLessonModalTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE" | "PHONETICS" | "CULTURE">("VOCAB");
  const [practiceWord, setPracticeWord] = useState<{ hanzi: string; pinyin: string; meaning: string } | null>(null);
  const [lockedNotification, setLockedNotification] = useState<string | null>(null);

  // Student class IDs & names memo
  const studentClassIds = useMemo(() => {
    const ids: string[] = [];
    if (Array.isArray(myClasses)) {
      myClasses.forEach((c) => {
        if (c.id) ids.push(c.id);
        if (c.code) ids.push(c.code);
      });
    }
    if (typeof window !== "undefined") {
      try {
        const profRaw = localStorage.getItem("hanyu_study_profile");
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          if (prof.classInfo?.id) ids.push(prof.classInfo.id);
          if (prof.classInfo?.code) ids.push(prof.classInfo.code);
        }
        const enrolledRaw = localStorage.getItem("hanyu_student_enrolled_classes");
        if (enrolledRaw) {
          const enrolled = JSON.parse(enrolledRaw);
          if (Array.isArray(enrolled)) {
            enrolled.forEach((c: any) => {
              if (c.id) ids.push(c.id);
              if (c.code) ids.push(c.code);
            });
          }
        }
      } catch {}
    }
    return Array.from(new Set(ids));
  }, [myClasses]);

  const studentClassNames = useMemo(() => {
    const names: string[] = [];
    if (Array.isArray(myClasses)) {
      myClasses.forEach((c) => {
        if (c.name) names.push(c.name);
      });
    }
    if (typeof window !== "undefined") {
      try {
        const profRaw = localStorage.getItem("hanyu_study_profile");
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          if (prof.classInfo?.name) names.push(prof.classInfo.name);
        }
        const enrolledRaw = localStorage.getItem("hanyu_student_enrolled_classes");
        if (enrolledRaw) {
          const enrolled = JSON.parse(enrolledRaw);
          if (Array.isArray(enrolled)) {
            enrolled.forEach((c: any) => {
              if (c.name) names.push(c.name);
            });
          }
        }
      } catch {}
    }
    return Array.from(new Set(names));
  }, [myClasses]);

  // Helper to load sanitized assigned lessons (filter out old mock Lesson 5 assign-sample-1)
  const getSanitizedAssigned = useCallback(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("hanyu_assigned_lessons");
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(
          (a: any) =>
            a.id !== "assign-sample-1" &&
            !(a.id?.startsWith("assign-mock-") || (a.titleZh === "今天我休息" && a.id?.includes("sample")))
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem("hanyu_assigned_lessons", JSON.stringify(filtered));
        }
        return filtered;
      }
    } catch (e) {}
    return [];
  }, []);

  // Danh sách bài học đã hoàn thành thực tế của học sinh
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_student_completed_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Danh sách bài học giáo viên đã mở / giao cho lớp
  const [assignedLessonList, setAssignedLessonList] = useState<any[]>(() => {
    return getSanitizedAssigned();
  });

  useEffect(() => {
    const handleSyncAssigned = () => {
      setAssignedLessonList(getSanitizedAssigned());
    };
    window.addEventListener("storage", handleSyncAssigned);
    window.addEventListener("hanyu_lesson_assigned", handleSyncAssigned);
    return () => {
      window.removeEventListener("storage", handleSyncAssigned);
      window.removeEventListener("hanyu_lesson_assigned", handleSyncAssigned);
    };
  }, [getSanitizedAssigned]);

  // Strict check whether an assignment applies to lesson ls AND belongs to student's enrolled class
  const checkLessonAssigned = useCallback(
    (a: any, ls: Hsk1FullLesson) => {
      if (!a) return false;
      // 1. Strict match with lesson
      const isLessonMatch =
        a.lessonId === ls.id ||
        a.lessonId === `hsk1-b${String(ls.number).padStart(2, "0")}` ||
        a.lessonId === `hsk1-b${ls.number}` ||
        a.lessonId === `hsk1-l${ls.number}` ||
        a.lessonId === ls.number ||
        a.lessonId === String(ls.number) ||
        (a.titleZh && a.titleZh.trim() === ls.titleZh.trim());

      if (!isLessonMatch) return false;

      // 2. Strict match with student's enrolled classes
      if (studentClassIds.length === 0 && studentClassNames.length === 0) {
        return false;
      }

      const matchesClassId =
        Array.isArray(a.classIds) &&
        a.classIds.some((cid: string) => studentClassIds.includes(cid));

      const matchesClassName =
        Array.isArray(a.classNames) &&
        a.classNames.some((cn: string) =>
          studentClassNames.some(
            (scn) =>
              scn.toLowerCase().includes(cn.toLowerCase()) ||
              cn.toLowerCase().includes(scn.toLowerCase())
          )
        );

      return matchesClassId || matchesClassName;
    },
    [studentClassIds, studentClassNames]
  );

  // Use the 15 official HSK 1 lessons
  const allLessons = OFFICIAL_HSK1_15_LESSONS;

  // Filter lessons by search query
  const filteredLessons = allLessons.filter((ls) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      ls.titleZh.toLowerCase().includes(query) ||
      ls.titleVi.toLowerCase().includes(query) ||
      ls.pinyin.toLowerCase().includes(query) ||
      ls.desc.toLowerCase().includes(query) ||
      `bài ${ls.number}`.includes(query)
    );
  });

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Open lesson modal with exact teacher-selected items applied
  const openLessonDetail = (ls: Hsk1FullLesson) => {
    const latestAssigned = getSanitizedAssigned();
    const matchingAssignment = latestAssigned.find((a: any) => checkLessonAssigned(a, ls));

    const effectiveLesson: Hsk1FullLesson = { ...ls };

    if (matchingAssignment) {
      // 1. Lọc từ vựng: chỉ giữ lại đúng các từ giáo viên đã tích chọn giao
      if (
        Array.isArray(matchingAssignment.selectedVocabs) &&
        matchingAssignment.selectedVocabs.length > 0
      ) {
        effectiveLesson.vocabList = ls.vocabList.filter((v) =>
          matchingAssignment.selectedVocabs.some(
            (sv: any) => sv.hanzi === v.hanzi
          )
        );
      }

      // 2. Lọc ngữ pháp: chỉ giữ lại các điểm ngữ pháp giáo viên tích chọn
      if (
        Array.isArray(matchingAssignment.selectedGrammars) &&
        matchingAssignment.selectedGrammars.length > 0
      ) {
        effectiveLesson.grammarList = ls.grammarList.filter((g) =>
          matchingAssignment.selectedGrammars.some(
            (sg: any) =>
              (sg.title || sg.name || "").includes(g.title) ||
              g.title.includes(sg.title || sg.name || "")
          )
        );
      }

      // 3. Hội thoại: nếu giáo viên bỏ chọn thì ẩn
      if (matchingAssignment.hasDialogue === false) {
        effectiveLesson.dialogue = [];
      }

      // 4. Văn hóa giao tiếp: nạp đúng các mục giáo viên chọn giao
      if (
        Array.isArray(matchingAssignment.selectedCulturalItems) &&
        matchingAssignment.selectedCulturalItems.length > 0
      ) {
        effectiveLesson.culture = matchingAssignment.selectedCulturalItems.map((ci: any) => ({
          title: ci.categoryLabel || ci.title || "Văn hóa giao tiếp",
          content:
            ci.content ||
            (ci.zh
              ? `${ci.zh} (${ci.py || ""}): ${ci.vi || ""}${ci.note ? ` · Lưu ý: ${ci.note}` : ""}`
              : ""),
          tags: [ci.categoryLabel || "Văn hóa"],
        }));
      }
      (effectiveLesson as any).teacherNote = matchingAssignment.teacherNote;
      (effectiveLesson as any).dueDate = matchingAssignment.dueDate;
    }

    setSelectedLessonModal(effectiveLesson);
    setLessonModalTab("VOCAB");
  };

  if (classesCount === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <BookOpen className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Kho bài học lớp học chưa được mở khóa
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Toàn bộ 15 bài học HSK 1 chuẩn cùng giáo trình, audio phát âm và bài giảng được đồng bộ theo lớp học của bạn. Hãy nhập mã mời của lớp để mở khóa kho bài học ngay nhé!
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

  const handleGoToPractice = (lesson: Hsk1FullLesson) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("hanyu_practice_target_lesson", JSON.stringify({
          number: lesson.number,
          titleZh: lesson.titleZh,
          titleVi: lesson.titleVi,
          vocabList: lesson.vocabList,
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setSelectedLessonModal(null);
    onNavigateToTab?.("practice");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Kho bài học Chuẩn HSK 1
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              15 Bài học chính thức
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Đồng bộ theo lịch giảng dạy của giáo viên. Mỗi bài học gồm 5 phần chuẩn: Từ vựng, Ngữ pháp, Hội thoại, Ngữ âm và Góc văn hóa.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8ea394] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bài học (VD: Lý Văn, số điện thoại, AI...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#204434] focus:outline-hidden w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid bài học */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((ls) => {
          const matchingAss = assignedLessonList.find((a: any) => checkLessonAssigned(a, ls));
          const isAssigned = !!matchingAss;
          const isDone = completedLessonIds.includes(ls.number);
          // Bài học chỉ mở khóa khi giáo viên đã giao cho lớp của học sinh này hoặc học sinh đã hoàn thành
          const isUnlocked = isAssigned || isDone;
          const isCurrent = isAssigned && !isDone;

          const effectiveVocabCount = matchingAss?.selectedVocabs?.length ?? matchingAss?.vocabCount ?? ls.vocabCount;
          const effectiveGrammarCount = matchingAss?.selectedGrammars?.length ?? matchingAss?.grammarCount ?? ls.grammarCount;

          return (
            <div
              key={ls.id}
              onClick={() => {
                if (!isUnlocked) {
                  setLockedNotification(`Bài học ${ls.number} (${ls.titleVi}) chưa được giáo viên mở khóa cho lớp của bạn. Hãy theo dõi thông báo và dặn dò của giáo viên nhé!`);
                  setTimeout(() => setLockedNotification(null), 4000);
                  return;
                }
                openLessonDetail(ls);
              }}
              className={`p-5 rounded-3xl border shadow-2xs transition cursor-pointer flex flex-col justify-between space-y-3 group ${
                isUnlocked
                  ? "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#204434] hover:shadow-md"
                  : "bg-[#F8F5ED]/70 border-[#E5DEC9]/60 opacity-80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                    Bài {String(ls.number).padStart(2, "0")} · HSK {selectedHsk}
                  </span>

                  {isDone ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã học</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                      Được giao
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Chưa học
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF7F0] text-[#8ea394] border border-[#E5DEC9]/80 flex items-center gap-1">
                      <span>🔒</span>
                      <span>Chờ giáo viên mở</span>
                    </span>
                  )}
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
                  <span>{effectiveVocabCount} từ</span>
                  <span>•</span>
                  <span>{effectiveGrammarCount} ngữ pháp</span>
                  <span>•</span>
                  <span>{ls.durationMin}p</span>
                </div>

                <span className="text-xs font-bold text-[#204434] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Mở 5 phần</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="p-8 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9]">
          Không tìm thấy bài học nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
        </div>
      )}

      {/* Modal xem chi tiết 5 phần của bài học */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-3xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[92vh] overflow-y-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#8F6D3B]">
                  Bài {String(selectedLessonModal.number).padStart(2, "0")} · Giáo trình HSK 1 Chuẩn
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#204434] mt-0.5 flex items-baseline gap-2">
                  <span>{selectedLessonModal.titleZh}</span>
                  <span className="text-sm font-sans font-normal text-[#8F6D3B]">
                    {selectedLessonModal.pinyin}
                  </span>
                </h3>
                <p className="text-xs font-semibold text-[#315E48]">{selectedLessonModal.titleVi}</p>
                <p className="text-xs text-[#315E48]/80 mt-1">{selectedLessonModal.desc}</p>

                {(selectedLessonModal as any).teacherNote && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <Bookmark className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950 block">Dặn dò của giáo viên phụ trách:</span>
                      <p className="mt-0.5 text-amber-800 leading-relaxed">{(selectedLessonModal as any).teacherNote}</p>
                      {(selectedLessonModal as any).dueDate && (
                        <span className="text-[11px] font-semibold text-amber-700 mt-1 block">
                          Hạn hoàn thành: {(selectedLessonModal as any).dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedLessonModal(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Tabs chuẩn trong bài học */}
            <div className="flex items-center gap-1.5 border-b border-[#E5DEC9] pb-2 overflow-x-auto">
              {[
                { id: "VOCAB", label: `1. Từ vựng (${selectedLessonModal.vocabList.length})`, icon: BookOpen },
                { id: "GRAMMAR", label: `2. Ngữ pháp (${selectedLessonModal.grammarList.length})`, icon: Sparkles },
                { id: "DIALOGUE", label: "3. Bài đọc & Hội thoại", icon: Headphones },
                { id: "PHONETICS", label: "4. Ngữ âm & Phát âm", icon: Mic },
                { id: "CULTURE", label: "5. Văn hóa & Hoạt động", icon: Globe },
              ].map((t) => {
                const IconComp = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setLessonModalTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      lessonModalTab === t.id
                        ? "bg-[#204434] text-white shadow-xs"
                        : "text-[#315E48] hover:bg-[#FAF7F0] hover:text-[#204434]"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Từ vựng */}
            {lessonModalTab === "VOCAB" && (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {selectedLessonModal.vocabList.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#204434]/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleSpeak(v.hanzi)}
                        className="w-8 h-8 rounded-full bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white transition flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-lg text-[#204434]">
                            {v.hanzi}
                          </span>
                          <span className="text-xs font-mono font-semibold text-[#8F6D3B]">{v.pinyin}</span>
                        </div>
                        <p className="text-xs font-medium text-[#204434]">{v.meaning}</p>
                        {v.exampleZh && (
                          <div className="text-[11px] text-[#315E48] pt-1">
                            <span className="font-serif font-bold text-[#204434]">{v.exampleZh}</span>
                            <span className="text-[#8F6D3B] ml-1.5 font-mono">({v.examplePy})</span>:
                            <span className="ml-1 text-[#315E48]/90">{v.exampleVi}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setPracticeWord(v)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#204434] hover:text-white text-[#204434] text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0 self-end sm:self-auto"
                      title="Luyện viết nét bút & Micro AI"
                    >
                      <PenTool className="w-3 h-3 text-[#BC9B6B]" />
                      <span>Tập viết & Nói</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Ngữ pháp */}
            {lessonModalTab === "GRAMMAR" && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {selectedLessonModal.grammarList.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#204434] text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="font-bold text-sm text-[#204434]">{g.title}</h5>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9]/80 font-mono text-emerald-950 font-bold text-xs">
                      {g.structure}
                    </div>
                    <div className="text-[#315E48] font-medium">
                      <span className="font-bold text-[#204434]">Ví dụ mẫu: </span>
                      {g.example}
                    </div>
                    {g.explanation && (
                      <p className="text-[11px] text-[#315E48]/80 italic bg-[#FAF7F0] p-2 rounded-lg border border-[#E5DEC9]/50">
                        {g.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Bài đọc & Hội thoại */}
            {lessonModalTab === "DIALOGUE" && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Hội thoại chuẩn bài giảng (Bấm loa để nghe từng câu)</span>
                  <button
                    onClick={() => {
                      const fullText = selectedLessonModal.dialogue.map(d => d.zh).join("。");
                      handleSpeak(fullText);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nghe cả đoạn</span>
                  </button>
                </div>

                {selectedLessonModal.dialogue.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#204434] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {d.speaker}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-base text-[#204434]">{d.zh}</span>
                        <button
                          onClick={() => handleSpeak(d.zh)}
                          className="p-1 rounded-lg hover:bg-white text-[#204434] cursor-pointer"
                          title="Nghe câu này"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#315E48]" />
                        </button>
                      </div>
                      <p className="text-xs text-[#8F6D3B] font-mono font-medium">{d.pinyin}</p>
                      <p className="text-xs text-[#315E48] font-medium">{d.vi}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Ngữ âm & Phát âm */}
            {lessonModalTab === "PHONETICS" && (
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-[#8F6D3B] uppercase">Quy tắc ngữ âm bài học</span>
                  <h4 className="font-serif font-bold text-base text-[#204434]">
                    {selectedLessonModal.phonetics.title}
                  </h4>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    {selectedLessonModal.phonetics.rule}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-[#204434] block mb-2">Các cặp từ luyện ngữ âm chuẩn:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedLessonModal.phonetics.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-between text-xs"
                      >
                        <span className="font-mono font-bold text-[#204434]">{ex}</span>
                        <button
                          onClick={() => handleSpeak(ex.split(" ")[0])}
                          className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#315E48] cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Góc văn hóa */}
            {lessonModalTab === "CULTURE" && (
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#315E48] leading-relaxed space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏮</span>
                  <h4 className="font-serif font-bold text-base text-[#204434]">
                    Góc văn hóa & Ứng xử Trung Hoa
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] leading-relaxed space-y-2">
                  <p>{selectedLessonModal.culture}</p>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const num = selectedLessonModal.number;
                    let next: number[];
                    if (completedLessonIds.includes(num)) {
                      next = completedLessonIds.filter((id) => id !== num);
                    } else {
                      next = [...completedLessonIds, num];
                    }
                    setCompletedLessonIds(next);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("hanyu_student_completed_lessons", JSON.stringify(next));
                    }
                  }}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    completedLessonIds.includes(selectedLessonModal.number)
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                      : "bg-[#FAF7F0] text-[#204434] border border-[#BC9B6B] hover:bg-[#F3EEDD]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    {completedLessonIds.includes(selectedLessonModal.number)
                      ? "✓ Đã hoàn thành bài học"
                      : "Đánh dấu đã học xong bài này"}
                  </span>
                </button>

                <button
                  onClick={() => handleGoToPractice(selectedLessonModal)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#204434] to-[#315E48] text-white text-xs font-bold hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Zap className="w-4 h-4 text-[#BC9B6B]" />
                  <span>⚡ Luyện phản xạ</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedLessonModal(null);
                  onNavigateToTab?.("assignments");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                <span>Làm bài tập củng cố</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tập viết nét chữ & Khẩu ngữ Micro AI */}
      {practiceWord && (
        <HanziPracticeModal
          isOpen={true}
          onClose={() => setPracticeWord(null)}
          initialHanzi={practiceWord.hanzi}
          initialPinyin={practiceWord.pinyin}
          initialMeaning={practiceWord.meaning}
        />
      )}

      {/* Floating Notification for Locked Lesson */}
      {lockedNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#204434] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#BC9B6B]/40 animate-slideUp">
          <Lock className="w-5 h-5 text-[#BC9B6B] shrink-0" />
          <span className="text-xs leading-relaxed">{lockedNotification}</span>
          <button
            type="button"
            onClick={() => setLockedNotification(null)}
            className="ml-auto text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
