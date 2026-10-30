"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  ArrowDown,
  ArrowUp,
  Lock,
  Sparkles,
  Moon,
  PenTool,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import { useCurriculumLessons } from "@/lib/use-curriculum";
import AncientScrollPathway from "./AncientScrollPathway";
import AncientSideDrawerNotes from "./AncientSideDrawerNotes";
import VirtualStudyRoomModal from "./VirtualStudyRoomModal";
import LessonStudyContent from "../learning/LessonStudyContent";
import styles from "../learning/Ink.module.css";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

export interface StudentSelfStudyWorkspaceProps {
  currentUser?: any;
  activeHskLevel?: number;
  onNavigateToTab?: (tab: string) => void;
  onOpenJoinModal?: () => void;
}

export default function StudentSelfStudyWorkspace({
  currentUser,
  activeHskLevel = 1,
  onNavigateToTab,
  onOpenJoinModal,
}: StudentSelfStudyWorkspaceProps) {
  // Lấy kết quả từ bài test năng lực Onboarding
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<number>(activeHskLevel || 1);
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(1);
  const [unlockedLessons, setUnlockedLessons] = useState<number[]>([1, 2]);

  // Modals & Side Drawer
  const [showSideNotes, setShowSideNotes] = useState(false);
  const [showStudyRoom, setShowStudyRoom] = useState(false);
  const [lockedLevelNotice, setLockedLevelNotice] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Đọc kết quả test từ Onboarding / Profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProfile = localStorage.getItem("hanyu_study_profile");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          const testedLevel = Number(parsed.currentHskLevel) || 1;
          setMaxUnlockedLevel(Math.max(testedLevel, 1));
          setCurrentLevel(testedLevel);
        } else if (currentUser?.currentHskLevel) {
          const userLevel = Number(currentUser.currentHskLevel) || 1;
          setMaxUnlockedLevel(Math.max(userLevel, 1));
          setCurrentLevel(userLevel);
        }
      } catch {}
    }
  }, [currentUser?.currentHskLevel]);

  // Đọc tiến trình mở khóa bài học của cấp HSK hiện tại
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const key = `hsk_self_unlocked_lvl_${currentLevel}_${currentUser?.id || "guest"}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          setUnlockedLessons(JSON.parse(stored));
        } else {
          // Mặc định mở bài 1 & 2
          setUnlockedLessons([1, 2]);
        }
      } catch {}
    }
  }, [currentLevel, currentUser?.id]);

  // TẢI GIÁO TRÌNH TỪ KHO ADMIN (useCurriculumLessons -> /api/v1/curriculum?level=X)
  const { lessons: adminLessons, loading, error } = useCurriculumLessons(currentLevel);

  // Bài học đang chọn
  const currentLesson: Hsk1FullLesson | undefined = useMemo(() => {
    if (!adminLessons || adminLessons.length === 0) return undefined;
    return adminLessons.find((l) => l.number === selectedLessonNum) || adminLessons[0];
  }, [adminLessons, selectedLessonNum]);

  // Khi chọn bài thì cuộn mượt xuống nội dung bài
  const handleSelectLesson = (num: number) => {
    setSelectedLessonNum(num);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }, 100);
  };

  // Mở khóa bài tiếp theo khi hoàn thành
  const handleCompleteCurrentLesson = () => {
    if (!unlockedLessons.includes(selectedLessonNum + 1)) {
      const updated = [...unlockedLessons, selectedLessonNum + 1];
      setUnlockedLessons(updated);
      if (typeof window !== "undefined") {
        const key = `hsk_self_unlocked_lvl_${currentLevel}_${currentUser?.id || "guest"}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  return (
    <div className={`${styles.workspace} ${styles.stack} relative`}>
      {/* 1. Header Lộ Trình Tự Học Cổ Phong */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#BC9B6B]/30">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#8F6D3B] font-bold flex items-center gap-2">
            <span>Lộ trình Tự học HSK 3.0 · Chuẩn Hanban CTI</span>
            <span className="px-2 py-0.5 rounded-full bg-[#204434] text-[#BC9B6B] text-[10px] font-mono">
              Kho Giáo Trình Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] mt-0.5">
            Sơn Hà Thư Viện · Chinh Phục HSK {currentLevel}
          </h1>
          <p className="text-xs text-[#315E48] mt-1 max-w-2xl">
            Toàn bộ học liệu được đồng bộ trực tiếp từ Kho Giáo Trình của nhà trường. Học sinh tự do luyện tập vượt ải từng bài học.
          </p>
        </div>

        {/* Thanh Công Cụ Nhanh: Phòng Học Ảo & Bút Giấy Cổ */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowStudyRoom(true)}
            className="px-3.5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#BC9B6B] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Moon className="w-4 h-4 text-[#BC9B6B]" />
            <span>🏮 Vân Tự Tập Thất</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSideNotes(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-[#8F6D3B]" />
            <span>📜 Bút Ký Bên Cạnh</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Chọn Cấp Độ HSK với Gating Theo Bài Test Đầu Vào */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#204434] mr-1">Cấp độ HSK:</span>
            {[1, 2, 3, 4, 5, 6].map((lvl) => {
              const isLocked = lvl > maxUnlockedLevel;
              const isSelected = currentLevel === lvl;

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      setLockedLevelNotice(
                        `Cấp độ HSK ${lvl} đang bị khóa. Bạn cần hoàn thành HSK ${lvl - 1} hoặc đạt điểm bài kiểm tra đầu vào để mở khóa cấp này!`
                      );
                      setTimeout(() => setLockedLevelNotice(null), 4000);
                      return;
                    }
                    setCurrentLevel(lvl);
                    setSelectedLessonNum(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-[#204434] text-white shadow-xs"
                      : isLocked
                      ? "bg-[#EAE4D3]/60 text-slate-400 opacity-70 border border-dashed border-[#BC9B6B]/40"
                      : "bg-[#FAF7F0] hover:bg-[#F0EBE1] text-[#315E48]"
                  }`}
                >
                  <span>HSK {lvl}</span>
                  {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/s/mock-exam?level=${currentLevel}`}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-700" />
              <span>🏛️ Thi Thử HSK {currentLevel}</span>
            </Link>
          </div>
        </div>

        {/* Cảnh báo khóa cấp độ */}
        {lockedLevelNotice && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium animate-fadeIn flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{lockedLevelNotice}</span>
          </div>
        )}
      </div>

      {/* 3. BĂNG THƯ CUỘN CHIẾU CHỈ SƠN HÀ (AncientScrollPathway) */}
      <AncientScrollPathway
        lessons={adminLessons}
        selectedLesson={selectedLessonNum}
        unlockedLessons={unlockedLessons}
        onSelectLesson={handleSelectLesson}
        hskLevel={currentLevel}
      />

      {/* Trạng thái tải bài từ kho Admin */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#315E48]">
          <div className="w-8 h-8 rounded-full border-2 border-[#204434] border-t-transparent animate-spin mx-auto mb-2" />
          <span>Đang tải học liệu HSK {currentLevel} từ Kho Giáo Trình Admin…</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center space-y-2">
          <p>{error}</p>
        </div>
      ) : adminLessons.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#315E48] bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9]">
          <BookOpen className="w-10 h-10 text-[#BC9B6B] mx-auto mb-2 opacity-60" />
          <h3 className="font-bold font-serif text-base text-[#204434]">
            Chưa có bài học nào trong Kho HSK {currentLevel}
          </h3>
          <p className="mt-1">
            Quản trị viên / Giáo viên chưa cập nhật bài học cho cấp độ này trong Kho Giáo Trình.
          </p>
        </div>
      ) : (
        <>
          {/* 4. Grid Danh Sách Bài Học */}
          <div ref={listRef} className={styles.grid}>
            {adminLessons.map((lesson) => {
              const isUnlocked = unlockedLessons.includes(lesson.number);
              const isCurrent = currentLesson?.number === lesson.number;

              return (
                <button
                  key={lesson.id || lesson.number}
                  disabled={!isUnlocked}
                  onClick={() => handleSelectLesson(lesson.number)}
                  className={`${styles.card} ${isCurrent ? styles.cardActive : ""} ${
                    !isUnlocked ? "opacity-60 cursor-not-allowed border-dashed" : ""
                  }`}
                  aria-label={`Mở bài ${lesson.number}`}
                >
                  <div className={styles.cardBody}>
                    <div className={styles.row}>
                      <span className={styles.tag}>Bài {lesson.number}</span>
                      {isUnlocked ? <ArrowDown size={15} /> : <Lock size={14} className="text-slate-400" />}
                    </div>
                    <h3 lang="zh-CN">{lesson.titleZh}</h3>
                    <p className={styles.pinyin}>{lesson.pinyin}</p>
                    <p className={styles.meaning}>{lesson.titleVi}</p>
                    <p className={`${styles.muted} mt-4`}>
                      {isUnlocked ? "Xem nội dung bài học →" : "Hoàn thành bài trước để mở khóa"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 5. Khung Chi Tiết Bài Học + Nút Bật Sổ Tay Ghi Chú Bên Cạnh */}
          {currentLesson && (
            <div ref={detailRef} className={`${styles.stack} ${styles.sectionAnchor}`}>
              {/* Thanh Điều Khiển Học Liệu */}
              <div className="p-5 rounded-3xl bg-[#FFFCF6] border-2 border-[#BC9B6B]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#204434] text-[#BC9B6B]">
                    Bài {currentLesson.number} · HSK {currentLevel}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#204434] mt-2">
                    {currentLesson.titleVi || currentLesson.titleZh}
                  </h2>
                  <p className="text-sm text-[#8F6D3B] font-mono mt-0.5">{currentLesson.pinyin}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Nút Mở Bút Ký Bên Cạnh */}
                  <button
                    type="button"
                    onClick={() => setShowSideNotes(!showSideNotes)}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <PenTool className="w-4 h-4 text-[#8F6D3B]" />
                    <span>{showSideNotes ? "Đóng Bút Ký" : "Mở Bút Ký Bên Cạnh 📜"}</span>
                  </button>

                  {/* Nút Hoàn Thành Bài */}
                  <button
                    type="button"
                    onClick={handleCompleteCurrentLesson}
                    className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Đánh dấu thông quan</span>
                  </button>
                </div>
              </div>

              {/* Nội dung bài học (Từ vựng, Ngữ pháp, Hội thoại song ngữ, Ngữ âm & Văn hóa) */}
              <LessonStudyContent key={currentLesson.id || currentLesson.number} lesson={currentLesson} />
            </div>
          )}
        </>
      )}

      {/* 6. SIDE DRAWER TAKE NOTE: NẰM BÊN CẠNH ĐỂ HỌC SINH VỪA ĐỌC VỪA GHI CHÚ */}
      <AncientSideDrawerNotes
        isOpen={showSideNotes}
        onClose={() => setShowSideNotes(false)}
        lessonNumber={currentLesson?.number || selectedLessonNum}
        hskLevel={currentLevel}
        studentId={currentUser?.id}
        lessonTitle={currentLesson?.titleVi || currentLesson?.titleZh}
      />

      {/* 7. VÂN TỰ TẬP THẤT: PHÒNG HỌC ẢO POMODORO */}
      <VirtualStudyRoomModal
        isOpen={showStudyRoom}
        onClose={() => setShowStudyRoom(false)}
        studentName={currentUser?.name || "Bạn"}
      />
    </div>
  );
}
