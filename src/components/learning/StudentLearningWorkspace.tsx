"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowDown, ArrowUp, BookOpen, Lock, Sparkles, Moon, PenTool } from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import AncientScrollPathway from "@/components/student/AncientScrollPathway";
import AncientStationeryNotesModal from "@/components/student/AncientStationeryNotesModal";
import VirtualStudyRoomModal from "@/components/student/VirtualStudyRoomModal";
import { usePortalData } from "./use-portal-data";
import InkHero from "./InkHero";
import LessonStudyContent from "./LessonStudyContent";
import styles from "./Ink.module.css";

type Classroom = {
  id: string;
  name?: string;
  level?: number;
  isPendingApproval?: boolean;
  enrollmentStatus?: string;
  status?: string;
};

export interface StudentLearningProps {
  currentUser?: any;
  myClasses?: Classroom[];
  classesCount?: number;
  activeHskLevel?: number;
  onNavigateToTab?: (tab: string) => void;
  onOpenJoinModal?: () => void;
  compact?: boolean;
}

type ClassLesson = {
  id: string;
  lessonNumber: number;
  titleZh: string;
  titleVi: string;
  pinyin: string;
  status: string;
  isPublished: boolean;
  content?: Hsk1FullLesson;
  teacherNote?: string;
  dueDate?: string;
};

export default function StudentLearningWorkspace({
  currentUser,
  myClasses = [],
  activeHskLevel = 1,
  onNavigateToTab,
  onOpenJoinModal,
  compact = false,
}: StudentLearningProps) {
  const [classId, setClassId] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selfHskLevel, setSelfHskLevel] = useState<number>(activeHskLevel || 1);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showStudyRoomModal, setShowStudyRoomModal] = useState(false);

  // Unlocked lessons storage
  const [unlockedLessons, setUnlockedLessons] = useState<number[]>([1, 2]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hsk_self_unlocked_lvl_${selfHskLevel}_${currentUser?.id || "guest"}`);
        if (stored) {
          setUnlockedLessons(JSON.parse(stored));
        } else {
          setUnlockedLessons([1, 2]);
        }
      } catch {}
    }
  }, [selfHskLevel, currentUser?.id]);

  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const classroom =
    myClasses.find((item) => item.id === classId) ||
    myClasses.find((item) => item.level === activeHskLevel) ||
    myClasses[0];

  const pending = classroom?.isPendingApproval || classroom?.enrollmentStatus === "PENDING";
  const { data, error, loading, reload } = usePortalData<{ lessons: ClassLesson[] }>(
    classroom && !pending ? `/api/v1/classes/${classroom.id}/lessons` : null
  );

  const lessons = data?.lessons || [];
  const published = lessons.filter((item) => item.status === "PUBLISHED" || item.isPublished);
  const current = published.find((item) => item.id === selected);

  useEffect(() => {
    if (current) {
      detailRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [current]);

  // Self-study lessons resolved dynamically
  const selfLessons = useMemo(() => {
    return getLessonsByHskLevel(selfHskLevel);
  }, [selfHskLevel]);

  // If no classroom or user is studying in self-study mode
  if (!classroom) {
    const currentSelfLesson =
      selfLessons.find((item) => item.id === selected) ||
      (selected ? null : selfLessons[0]);

    return (
      <div className={`${styles.workspace} ${styles.stack}`}>
        {!compact && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#BC9B6B]/30">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#8F6D3B] font-bold">
                Lộ trình Tự học Chuẩn Hanban CTI · HSK 3.0
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] mt-0.5">
                Kho bài học & Giáo trình HSK {selfHskLevel}
              </h1>
              <p className="text-xs text-[#315E48] mt-1 max-w-2xl">
                Trọn bộ 15 bài học chuẩn hóa gồm Từ vựng, Ngữ pháp, Hội thoại song ngữ, Ngữ âm và Văn hóa. Tự do học tập, không bắt buộc tham gia lớp.
              </p>
            </div>

            {/* Quick Action Buttons: Vân Tự Tập Thất & Bút Giấy Cổ */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowStudyRoomModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#BC9B6B] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Moon className="w-4 h-4 text-[#BC9B6B]" />
                <span>🏮 Vân Tự Tập Thất</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNotesModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-[#8F6D3B]" />
                <span>📜 Bút Giấy Cổ</span>
              </button>
            </div>
          </div>
        )}

        {/* HSK Level Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#204434] mr-2">Chọn cấp độ HSK:</span>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelfHskLevel(lvl);
                  setSelected(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selfHskLevel === lvl
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-[#FAF7F0] hover:bg-[#F0EBE1] text-[#315E48]"
                }`}
              >
                HSK {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-[#8F6D3B]">
              {selfLessons.length} bài học mở tự do
            </span>
            {onOpenJoinModal && (
              <button
                type="button"
                className="text-xs text-[#204434] hover:underline font-semibold cursor-pointer"
                onClick={onOpenJoinModal}
              >
                + Nhập mã lớp (nếu có)
              </button>
            )}
          </div>
        </div>

        {/* BĂNG THƯ CUỘN CHIẾU CHỈ SƠN HÀ (AncientScrollPathway) */}
        <AncientScrollPathway
          lessons={selfLessons}
          selectedLesson={currentSelfLesson?.number || 1}
          unlockedLessons={unlockedLessons}
          onSelectLesson={(lessonNumber) => {
            const found = selfLessons.find((l) => l.number === lessonNumber);
            if (found) {
              setSelected(found.id);
            }
          }}
          hskLevel={selfHskLevel}
        />

        {/* Grid danh sách bài học */}
        <div ref={listRef} className={styles.grid}>
          {selfLessons.map((lesson) => {
            return (
              <button
                key={lesson.id}
                onClick={() => setSelected(lesson.id)}
                className={`${styles.card} ${currentSelfLesson?.id === lesson.id ? styles.cardActive : ""}`}
                aria-label={`Mở bài ${lesson.number}`}
              >
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span className={styles.tag}>Bài {lesson.number}</span>
                    <ArrowDown size={15} />
                  </div>
                  <h3 lang="zh-CN">{lesson.titleZh}</h3>
                  <p className={styles.pinyin}>{lesson.pinyin}</p>
                  <p className={styles.meaning}>{lesson.titleVi}</p>
                  <p className={`${styles.muted} mt-4`}>Xem đủ nội dung bài học →</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chi tiết nội dung bài học inline */}
        {currentSelfLesson && (
          <div ref={detailRef} className={`${styles.stack} ${styles.sectionAnchor}`}>
            <div className="p-6 rounded-3xl bg-[#FFFCF6] border-2 border-[#BC9B6B]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#204434] text-[#BC9B6B]">
                  Bài {currentSelfLesson.number} · HSK {selfHskLevel}
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#204434] mt-2">
                  {currentSelfLesson.titleVi || currentSelfLesson.titleZh}
                </h2>
                <p className="text-sm text-[#8F6D3B] font-mono mt-0.5">{currentSelfLesson.pinyin}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotesModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#8F6D3B]" />
                  <span>Ghi chú bài này</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#204434] text-white hover:bg-[#183629] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <ArrowUp size={13} />
                  <span>Lên danh sách</span>
                </button>
              </div>
            </div>

            <LessonStudyContent key={currentSelfLesson.id} lesson={currentSelfLesson} />
          </div>
        )}

        {/* MODAL 1: BÚT GIẤY CỔ PHONG */}
        <AncientStationeryNotesModal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          lessonNumber={currentSelfLesson?.number || 1}
          hskLevel={selfHskLevel}
          studentId={currentUser?.id}
        />

        {/* MODAL 2: VÂN TỰ TẬP THẤT */}
        <VirtualStudyRoomModal
          isOpen={showStudyRoomModal}
          onClose={() => setShowStudyRoomModal(false)}
          studentName={currentUser?.name || "Bạn"}
        />
      </div>
    );
  }

  // If student has classroom
  return (
    <div className={`${styles.workspace} ${styles.stack}`}>
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#BC9B6B]/30">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#8F6D3B] font-bold">
              Lớp học của tôi · HSK {classroom.level || 1}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] mt-0.5">
              {classroom.name || "Lộ trình bài học của lớp"}
            </h1>
            <p className="text-xs text-[#315E48] mt-1 max-w-2xl">
              Từng bài học được phân phối theo tiến độ giảng dạy của giáo viên. Đầy đủ Từ vựng, Ngữ pháp, Hội thoại, Ngữ âm và Văn hóa.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowStudyRoomModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#BC9B6B] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Moon className="w-4 h-4 text-[#BC9B6B]" />
              <span>🏮 Vân Tự Tập Thất</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <PenTool className="w-4 h-4 text-[#8F6D3B]" />
              <span>📜 Bút Giấy Cổ</span>
            </button>
          </div>
        </div>
      )}

      <div className={styles.row}>
        <label className={styles.label}>
          Lớp học:
          <select
            className={styles.input}
            aria-label="Lớp học của tôi"
            value={classroom.id}
            onChange={(event) => {
              setClassId(event.target.value);
              setSelected(null);
            }}
          >
            {myClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || item.id} · HSK {item.level || 1}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.tag}>
          {published.length} / {lessons.length} bài đã công bố
        </span>
      </div>

      {pending ? (
        <p className={styles.notice}>Yêu cầu tham gia lớp đang chờ giáo viên duyệt.</p>
      ) : error ? (
        <div role="alert" className={styles.error}>
          {error}
          <button className={`${styles.button} ${styles.secondary} ml-3`} onClick={reload}>
            Tải lại
          </button>
        </div>
      ) : loading ? (
        <p className={styles.empty}>Đang tải lộ trình của lớp…</p>
      ) : (
        <>
          <div ref={listRef} className={styles.grid}>
            {lessons.map((lesson) => {
              const open = lesson.status === "PUBLISHED" || lesson.isPublished;
              return (
                <button
                  key={lesson.id}
                  disabled={!open}
                  onClick={() => setSelected(lesson.id)}
                  className={`${styles.card} ${current?.id === lesson.id ? styles.cardActive : ""}`}
                  aria-label={`Mở bài ${lesson.lessonNumber}`}
                >
                  <div className={styles.cardBody}>
                    <div className={styles.row}>
                      <span className={styles.tag}>Bài {lesson.lessonNumber}</span>
                      {open ? <ArrowDown size={15} /> : <Lock size={14} />}
                    </div>
                    <h3 lang="zh-CN">{lesson.titleZh}</h3>
                    <p className={styles.pinyin}>{lesson.pinyin}</p>
                    <p className={styles.meaning}>{lesson.titleVi}</p>
                    <p className={`${styles.muted} mt-4`}>
                      {open ? "Xem đủ nội dung bài học" : "Giáo viên chưa công bố"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {!lessons.length && <p className={styles.empty}>Lớp chưa có bài học trong lộ trình.</p>}

          {current && (
            <div ref={detailRef} className={`${styles.stack} ${styles.sectionAnchor}`}>
              <InkHero
                level={classroom.level}
                eyebrow={`Nội dung Bài ${current.lessonNumber}`}
                title={current.titleVi || current.titleZh}
                description={current.pinyin}
              >
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <ArrowUp size={13} />
                  Về danh sách bài
                </button>
              </InkHero>
              {current.teacherNote && (
                <p className={styles.notice}>Ghi chú giáo viên: {current.teacherNote}</p>
              )}
              {current.content ? (
                <LessonStudyContent key={current.id} lesson={current.content} />
              ) : (
                <p className={styles.empty}>
                  Bài học chưa có nội dung chi tiết. Hãy liên hệ giáo viên để cập nhật.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      <AncientStationeryNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        lessonNumber={current?.lessonNumber || 1}
        hskLevel={classroom.level || 1}
        studentId={currentUser?.id}
      />
      <VirtualStudyRoomModal
        isOpen={showStudyRoomModal}
        onClose={() => setShowStudyRoomModal(false)}
        studentName={currentUser?.name || "Bạn"}
      />
    </div>
  );
}
