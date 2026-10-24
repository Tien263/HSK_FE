"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Award,
  AlertCircle,
  X,
  Volume2,
  Clock,
} from "lucide-react";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

interface StudentRoadmapWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
  activeHskLevel?: number;
}

export default function StudentRoadmapWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
  activeHskLevel,
}: StudentRoadmapWorkspaceProps) {
  const activeClass = myClasses[0] || null;
  const currentLevelFromClass = activeHskLevel || activeClass?.level || 1;
  const [selectedHskLevel, setSelectedHskLevel] = useState<number>(currentLevelFromClass);

  useEffect(() => {
    if (activeClass?.level) {
      setSelectedHskLevel(activeClass.level);
    } else if (activeHskLevel) {
      setSelectedHskLevel(activeHskLevel);
    }
  }, [activeClass?.level, activeHskLevel]);

  // Lessons for the active level
  const officialLessons = useMemo(() => {
    return getLessonsByHskLevel(selectedHskLevel);
  }, [selectedHskLevel]);

  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE">("VOCAB");
  const [lockedNoticeLesson, setLockedNoticeLesson] = useState<any | null>(null);

  // Fetch real PostgreSQL database class lessons
  const [dbClassLessons, setDbClassLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const isPendingApproval =
    activeClass?.isPendingApproval === true ||
    activeClass?.enrollmentStatus === "PENDING" ||
    activeClass?.statusText === "Chờ duyệt";

  const fetchDbLessons = useCallback(async () => {
    if (!activeClass?.id || isPendingApproval) {
      setDbClassLessons([]);
      return;
    }
    try {
      setLoadingLessons(true);
      const res = await fetch(
        `/api/v1/classes/${activeClass.id}/lessons?studentId=${currentUser?.id || ""}`,
        {
          headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.lessons)) {
          setDbClassLessons(data.lessons);
          return;
        }
      }
      setDbClassLessons([]);
    } catch (e) {
      console.warn("fetchDbLessons error:", e);
      setDbClassLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  }, [activeClass?.id, currentUser?.id, isPendingApproval]);

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

  // 1. Empty state if student is not enrolled in any class
  if (!activeClass || myClasses.length === 0) {
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
            Lộ trình học tập 15 bài học được phân phối và mở khóa trực tiếp bởi giáo viên phụ trách lớp. Hãy tham gia lớp học để mở khóa lộ trình học tập!
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

  // 2. Pending Approval State: Student has requested to join but teacher hasn't approved yet!
  if (isPendingApproval) {
    return (
      <div className="bg-[#FFFCF6] border border-amber-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto shadow-2xs">
          <Clock className="w-8 h-8 text-amber-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
            Đang chờ duyệt vào lớp
          </span>
          <h3 className="font-serif font-bold text-xl text-[#17382F] mt-2">
            Yêu cầu vào {activeClass.name} đang chờ cô giáo duyệt
          </h3>
          <p className="text-xs text-[#6B766D] leading-relaxed max-w-md mx-auto">
            Bạn đã gửi yêu cầu tham gia lớp học thành công. Sau khi cô giáo phụ trách kiểm tra và phê duyệt, toàn bộ lộ trình 15 bài học và bài tập sẽ tự động mở khóa nhé!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigateToTab?.("classes")}
            className="px-6 py-2.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Xem danh sách lớp của tôi
          </button>
        </div>
      </div>
    );
  }

  // Count unlocked/published lessons
  const publishedCount = officialLessons.filter((ls) => {
    const dbLesson = dbClassLessons.find((dl) => dl.lessonNumber === ls.number);
    return dbLesson?.status === "PUBLISHED" || dbLesson?.isPublished === true;
  }).length;

  const displayClassName = activeClass.name.startsWith("Lớp")
    ? activeClass.name
    : `Lớp ${activeClass.name}`;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Lộ trình 15 Bài học HSK {selectedHskLevel}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              15 Bài học chính thức
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            <strong>{displayClassName}</strong> • Lộ trình 15 bài học theo khung tiêu chuẩn HSK 3.0. Nội dung được mở khóa trực tiếp bởi giáo viên phụ trách.
          </p>
        </div>

        {/* Cấp độ HSK cố định theo lớp (Không hiển thị thanh chuyển đổi) */}
        <div className="px-3.5 py-1.5 rounded-xl bg-[#204434]/10 border border-[#204434]/20 text-[#204434] text-xs font-bold shrink-0">
          Cấp độ HSK {selectedHskLevel}.0
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white font-serif font-bold flex flex-col items-center justify-center text-xs shadow-xs">
              <span>HSK</span>
              <span>{selectedHskLevel}</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#204434]">
                Tiến độ cấp độ HSK {selectedHskLevel} ({publishedCount}/15 bài học mở khóa)
              </h3>
              <p className="text-[11px] text-[#315E48]/80">
                Đã mở khóa {publishedCount}/15 bài • Các bài học chưa công bố sẽ ở trạng thái khóa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              🎯 Mục tiêu: Đạt 190+/200 điểm HSK {selectedHskLevel}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#315E48]">
            <span>Tổng tiến độ mở bài</span>
            <span className="font-bold">{Math.round((publishedCount / 15) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-[#E5DEC9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#204434] rounded-full transition-all duration-300"
              style={{ width: `${Math.round((publishedCount / 15) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 15 Lessons List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#315E48] font-bold">
          <span>DANH SÁCH BÀI HỌC HSK {selectedHskLevel}</span>
          <span>{publishedCount} bài đã được giáo viên công bố</span>
        </div>

        {publishedCount === 0 ? (
          <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F0] flex items-center justify-center mx-auto text-[#315E48]">
              <Compass className="w-6 h-6 opacity-60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#204434]">
                Lớp học hiện chưa có bài học nào được công bố
              </p>
              <p className="text-xs text-[#315E48]/70 max-w-sm mx-auto">
                Giáo viên phụ trách lớp <strong>{displayClassName}</strong> chưa mở khóa bài học nào. Bạn sẽ thấy lộ trình và nội dung bài học tại đây ngay khi giáo viên công bố.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialLessons
              .filter((ls) => {
                const dbLesson = dbClassLessons.find((dl) => dl.lessonNumber === ls.number);
                return dbLesson?.status === "PUBLISHED" || dbLesson?.isPublished === true;
              })
              .map((ls) => {
                const dbLesson = dbClassLessons.find((dl) => dl.lessonNumber === ls.number);

                return (
                  <div
                    key={ls.id}
                    onClick={() => {
                      setSelectedLessonModal({
                        ...ls,
                        vocabList: Array.isArray(dbLesson?.selectedVocabs) && dbLesson.selectedVocabs.length > 0
                          ? dbLesson.selectedVocabs
                          : ls.vocabList,
                        grammarList: Array.isArray(dbLesson?.selectedGrammars) && dbLesson.selectedGrammars.length > 0
                          ? dbLesson.selectedGrammars
                          : ls.grammarList,
                        teacherNote: dbLesson?.teacherNote || "",
                      });
                    }}
                    className="p-5 rounded-3xl border shadow-2xs transition cursor-pointer flex flex-col justify-between space-y-3 bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#204434] hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                          Bài {String(ls.number).padStart(2, "0")}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã mở</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#204434] flex items-baseline gap-2">
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
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Đã công bố nội dung
                      </span>
                      <span className="text-xs font-bold text-[#204434] flex items-center gap-1">
                        <span>Xem bài học</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Locked Lesson Notice Modal */}
      {lockedNoticeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#204434]">
              Bài {lockedNoticeLesson.number} đang khóa
            </h3>
            <p className="text-xs text-[#315E48] leading-relaxed">
              Bài học <strong>{lockedNoticeLesson.titleVi}</strong> chưa được giáo viên công bố cho lớp của bạn. Hãy đợi thông báo từ giáo viên nhé!
            </p>
            <div className="pt-2">
              <button
                onClick={() => setLockedNoticeLesson(null)}
                className="w-full py-2 bg-[#204434] text-white rounded-xl text-xs font-bold hover:bg-[#163024] transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8F6D3B] font-bold">
                  Bài {selectedLessonModal.number} · HSK {selectedHskLevel}
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
                  onClick={() => setModalTab(tb.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    modalTab === tb.id
                      ? "bg-[#204434] text-white"
                      : "text-[#315E48] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Vocabs View */}
            {modalTab === "VOCAB" && (
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
            {modalTab === "GRAMMAR" && (
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
