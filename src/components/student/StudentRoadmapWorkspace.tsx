"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Award,
  Clock,
  AlertCircle,
  X,
  Volume2,
} from "lucide-react";
import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

interface StudentRoadmapWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
}

export default function StudentRoadmapWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
}: StudentRoadmapWorkspaceProps) {
  const [selectedHskLevel, setSelectedHskLevel] = useState<number>(1);
  const [lockedNoticeLesson, setLockedNoticeLesson] = useState<Hsk1FullLesson | null>(null);
  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE">("VOCAB");

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

  const primaryClassName = studentClassNames[0] || (myClasses && myClasses[0]?.name) || "Lớp học của bạn";

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
  const [completedLessonIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_student_completed_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Đồng bộ danh sách bài học giáo viên đã mở / giao cho lớp
  const [assignedLessonList, setAssignedLessonList] = useState<any[]>(() => {
    return getSanitizedAssigned();
  });

  // Fetch real PostgreSQL database class lessons
  const [dbClassLessons, setDbClassLessons] = useState<any[]>([]);

  const fetchDbLessons = useCallback(async () => {
    const classId = studentClassIds[0];
    if (!classId) return;
    try {
      const res = await fetch(`/api/v1/classes/${classId}/lessons`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.lessons)) {
          setDbClassLessons(data.lessons);
        }
      }
    } catch (e) {
      console.warn("fetchDbLessons error:", e);
    }
  }, [studentClassIds]);

  useEffect(() => {
    fetchDbLessons();
  }, [fetchDbLessons]);

  useEffect(() => {
    const handleSync = () => {
      setAssignedLessonList(getSanitizedAssigned());
      fetchDbLessons();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("hanyu_lesson_assigned", handleSync);
    window.addEventListener("hanyu_class_enrolled", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("hanyu_lesson_assigned", handleSync);
      window.removeEventListener("hanyu_class_enrolled", handleSync);
    };
  }, [getSanitizedAssigned, fetchDbLessons]);

  if (classesCount === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <Compass className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Lộ trình học tập chưa được kích hoạt
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Lộ trình học tập 15 bài học HSK 1 được đồng bộ trực tiếp theo giáo trình của lớp bạn theo học. Hãy tham gia lớp học để mở khóa toàn bộ lộ trình học tập!
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

  // Helper check status of each of the 15 lessons
  const getLessonInfo = (ls: Hsk1FullLesson) => {
    const num = ls.number;
    const isCompleted = completedLessonIds.includes(num);

    const dbLesson = dbClassLessons.find((dl) => dl.lessonNumber === num);

    const localAssigned = assignedLessonList.find((a: any) => {
      const isNumMatch =
        a.lessonId === num ||
        a.lessonId === String(num) ||
        a.lessonId === `hsk1-b${String(num).padStart(2, "0")}` ||
        a.lessonId === `hsk1-b${num}` ||
        a.lessonId === `hsk1-l${num}` ||
        a.lessonId === `hsk1-${String(num).padStart(2, "0")}` ||
        (a.titleZh && a.titleZh.trim() === ls.titleZh.trim());
      if (!isNumMatch) return false;
      if (studentClassIds.length === 0 && studentClassNames.length === 0) return true;
      return (
        (!a.classIds || a.classIds.length === 0 || a.classIds.some((cid: string) => studentClassIds.includes(cid))) ||
        (a.classNames?.some((cn: string) =>
          studentClassNames.some(
            (scn) =>
              scn.toLowerCase().includes(cn.toLowerCase()) ||
              cn.toLowerCase().includes(scn.toLowerCase())
          )
        ))
      );
    });

    const isPublishedInDb = dbLesson?.status === "PUBLISHED" || dbLesson?.isPublished;
    const isDraftInDb = dbLesson?.status === "DRAFT";
    const isAssignedLocally = !!localAssigned;

    // Student can only access when published by teacher (not draft, not unassigned)
    const isUnlocked = isCompleted || isPublishedInDb || (isAssignedLocally && !isDraftInDb);

    const effectiveVocabs =
      dbLesson?.selectedVocabs && Array.isArray(dbLesson.selectedVocabs) && dbLesson.selectedVocabs.length > 0
        ? dbLesson.selectedVocabs
        : localAssigned?.selectedVocabs && Array.isArray(localAssigned.selectedVocabs) && localAssigned.selectedVocabs.length > 0
        ? localAssigned.selectedVocabs
        : ls.vocabList;

    const effectiveGrammars =
      dbLesson?.selectedGrammars && Array.isArray(dbLesson.selectedGrammars) && dbLesson.selectedGrammars.length > 0
        ? dbLesson.selectedGrammars
        : localAssigned?.selectedGrammars && Array.isArray(localAssigned.selectedGrammars) && localAssigned.selectedGrammars.length > 0
        ? localAssigned.selectedGrammars
        : ls.grammarList;

    const effectiveVocabCount =
      dbLesson?.vocabCount ??
      localAssigned?.vocabCount ??
      effectiveVocabs.length;

    const effectiveGrammarCount =
      dbLesson?.grammarCount ??
      localAssigned?.grammarCount ??
      effectiveGrammars.length;

    const teacherNote = dbLesson?.teacherNote || localAssigned?.teacherNote || "";

    return {
      isUnlocked,
      isCompleted,
      statusText: isCompleted
        ? "Đã hoàn thành"
        : isUnlocked
        ? "Đang học / Đã mở khóa"
        : "Khóa",
      effectiveVocabCount,
      effectiveGrammarCount,
      effectiveVocabs,
      effectiveGrammars,
      teacherNote,
    };
  };

  const unlockedCount = OFFICIAL_HSK1_15_LESSONS.filter((l) => getLessonInfo(l).isUnlocked).length;
  const completedCount = OFFICIAL_HSK1_15_LESSONS.filter((l) => getLessonInfo(l).isCompleted).length;
  const totalPercent = Math.min(100, Math.round((completedCount / 15) * 100));

  const handleOpenLesson = (ls: Hsk1FullLesson) => {
    const info = getLessonInfo(ls);
    if (!info.isUnlocked) {
      setLockedNoticeLesson(ls);
      return;
    }
    setSelectedLessonModal({
      ...ls,
      vocabList: info.effectiveVocabs,
      grammarList: info.effectiveGrammars,
      teacherNote: info.teacherNote,
      effectiveVocabCount: info.effectiveVocabCount,
      effectiveGrammarCount: info.effectiveGrammarCount,
    });
    setModalTab("VOCAB");
  };

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Lộ trình 15 Bài học HSK 1
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              15 Bài học liên tục
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Lớp <strong>{primaryClassName}</strong> • Lộ trình 15 bài học theo khung tiêu chuẩn HSK 3.0. Nội dung được mở khóa và phân phối trực tiếp bởi giáo viên phụ trách.
          </p>
        </div>

        {/* HSK Level Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FFFCF6] border border-[#E5DEC9] p-1 rounded-2xl shadow-2xs overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedHskLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedHskLevel === lvl
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
              }`}
            >
              HSK {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border border-[#BC9B6B]/60 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              HSK {selectedHskLevel}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Tiến độ cấp độ HSK {selectedHskLevel} ({completedCount}/15 bài học hoàn thành)
              </h3>
              <p className="text-xs text-[#315E48]">
                Đã mở khóa {unlockedCount} / 15 bài • Các bài học chưa công bố sẽ tự động khóa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
              🎯 Mục tiêu: Đạt 190+/200 điểm HSK 1
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#315E48]">
            <span>Tổng tiến độ hoàn thành</span>
            <span className="font-bold text-[#204434]">{totalPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#E5DEC9]/50 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#204434] to-[#315E48] rounded-full transition-all duration-700"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* NGHIỆP VỤ 2: LỘ TRÌNH 15 BÀI TRỰC TIẾP (BÀI 1 ĐẾN BÀI 15)        */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold font-serif text-[#204434] uppercase tracking-wide">
            Danh sách 15 Bài học HSK 1 (Bài 01 – Bài 15)
          </h2>
          <span className="text-xs text-[#315E48]">
            {unlockedCount} bài đã được giáo viên công bố
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_HSK1_15_LESSONS.map((ls) => {
            const info = getLessonInfo(ls);
            const isUnlocked = info.isUnlocked;
            const isCompleted = info.isCompleted;

            return (
              <div
                key={ls.number}
                onClick={() => handleOpenLesson(ls)}
                className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? "bg-[#FFFCF6] border-emerald-300 shadow-2xs hover:border-emerald-500"
                    : isUnlocked
                    ? "bg-[#FFFCF6] border-[#BC9B6B] ring-1 ring-[#BC9B6B]/30 shadow-2xs hover:shadow-md"
                    : "bg-[#FAF7F0]/60 border-[#E5DEC9] opacity-75 hover:opacity-90"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top row: Lesson Number & Status badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-xs font-mono font-bold text-[#8F6D3B]">
                      Bài {String(ls.number).padStart(2, "0")}
                    </span>

                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã học</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <Play className="w-3 h-3 text-amber-800 fill-amber-800" />
                        <span>Đã mở khóa</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span>Chưa mở</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Pinyin */}
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434] leading-snug">
                      {ls.titleZh}
                    </h3>
                    <p className="text-xs font-mono text-[#8F6D3B]">{ls.pinyin}</p>
                    <p className="text-xs text-[#315E48] font-medium mt-0.5">{ls.titleVi}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#315E48]/80 line-clamp-2 leading-relaxed">
                    {ls.desc}
                  </p>

                  {/* Meta items */}
                  <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between text-xs text-[#315E48]">
                    {isUnlocked ? (
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#204434]">
                        <span>{info.effectiveVocabCount} từ vựng</span>
                        <span>•</span>
                        <span>{info.effectiveGrammarCount} ngữ pháp</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Chờ giáo viên công bố</span>
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[#8F6D3B]">{ls.durationMin}p</span>
                  </div>

                  {info.teacherNote && isUnlocked && (
                    <div className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 text-[11px] text-[#204434] italic">
                      "Lời dặn: {info.teacherNote}"
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLesson(ls);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Vào học bài này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLockedNoticeLesson(ls);
                      }}
                      className="w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bài học đang khóa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODAL THÔNG BÁO BÀI HỌC ĐANG KHÓA (CHƯA CÔNG BỐ)                  */}
      {/* ================================================================== */}
      {lockedNoticeLesson && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Bài học chưa được công bố
                </h3>
                <p className="text-xs text-[#315E48] leading-relaxed">
                  Bài {lockedNoticeLesson.number}: <strong>{lockedNoticeLesson.titleZh}</strong> ({lockedNoticeLesson.titleVi}) hiện đang ở trạng thái khóa.
                </p>
                <p className="text-xs text-[#315E48]/80 leading-relaxed pt-1">
                  Giáo viên phụ trách lớp <strong>{primaryClassName}</strong> chưa phân phối nội dung bài học này. Vui lòng chờ giáo viên mở khóa hoặc liên hệ giáo viên của bạn!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLockedNoticeLesson(null)}
                className="px-5 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] transition cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL CHI TIẾT BÀI HỌC ĐÃ MỞ KHÓA (CHỈ HIỂN THỊ NỘI DUNG ĐƯỢC CHỌN) */}
      {/* ================================================================== */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434] text-xs font-mono font-bold">
                    Bài {String(selectedLessonModal.number).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">
                    {selectedLessonModal.titleZh}
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#8F6D3B] mt-0.5">{selectedLessonModal.pinyin}</p>
                <p className="text-xs text-[#315E48] font-medium">{selectedLessonModal.titleVi}</p>
                {selectedLessonModal.teacherNote && (
                  <div className="mt-2 p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#204434] italic">
                    "Lời dặn từ giáo viên: {selectedLessonModal.teacherNote}"
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtabs inside Lesson Modal */}
            <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2">
              <button
                type="button"
                onClick={() => setModalTab("VOCAB")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modalTab === "VOCAB"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-[#FAF7F0]"
                }`}
              >
                Từ vựng ({selectedLessonModal.vocabList?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("GRAMMAR")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modalTab === "GRAMMAR"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-[#FAF7F0]"
                }`}
              >
                Ngữ pháp ({selectedLessonModal.grammarList?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("DIALOGUE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modalTab === "DIALOGUE"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-[#FAF7F0]"
                }`}
              >
                Hội thoại
              </button>
            </div>

            {/* Tab: Vocab */}
            {modalTab === "VOCAB" && (
              <div className="space-y-2">
                <p className="text-[11px] text-[#315E48]">
                  Danh sách <strong>{selectedLessonModal.vocabList?.length || 0} từ vựng</strong> giáo viên đã phân phối cho lớp của bạn:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                  {selectedLessonModal.vocabList?.map((v: any) => (
                    <div
                      key={v.hanzi}
                      className="p-2.5 rounded-2xl bg-white border border-[#E5DEC9] flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-base text-[#204434]">{v.hanzi}</span>
                          <span className="text-xs font-mono text-[#8F6D3B]">{v.pinyin}</span>
                        </div>
                        <div className="text-xs text-[#315E48] truncate">{v.meaning}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(v.hanzi)}
                        className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Grammar */}
            {modalTab === "GRAMMAR" && (
              <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                {selectedLessonModal.grammarList?.map((g: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5"
                  >
                    <div className="font-serif font-bold text-sm text-[#204434]">
                      {g.title || g.name}
                    </div>
                    {g.structure && (
                      <div className="text-xs font-mono text-[#8F6D3B] bg-[#FAF7F0] p-1.5 rounded-lg border border-[#E5DEC9]/60">
                        Cấu trúc: {g.structure}
                      </div>
                    )}
                    {g.example && (
                      <div className="text-xs text-[#315E48]">
                        Ví dụ: <em>{g.example}</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Dialogue */}
            {modalTab === "DIALOGUE" && (
              <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                {Array.isArray(selectedLessonModal.dialogue) && selectedLessonModal.dialogue.length > 0 ? (
                  selectedLessonModal.dialogue.map((dl: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-[#E5DEC9] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8F6D3B]">{dl.speaker}</span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(dl.zh)}
                          className="p-1 text-[#204434] hover:bg-[#FAF7F0] rounded-lg cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-serif font-bold text-sm text-[#204434]">{dl.zh}</div>
                      <div className="text-xs font-mono text-[#8F6D3B]">{dl.pinyin}</div>
                      <div className="text-xs text-[#315E48]">{dl.vi}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#315E48] py-4 text-center">
                    Giáo viên không yêu cầu học hội thoại cho bài này.
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-semibold text-[#315E48] hover:bg-gray-50 cursor-pointer"
              >
                Đóng lại
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLessonModal(null);
                  onNavigateToTab?.("lessons");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Học bài học chi tiết & luyện viết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
