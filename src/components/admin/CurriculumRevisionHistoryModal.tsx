"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Trash2,
  Calendar,
} from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { safeLocalStorageSet } from "@/lib/safe-storage";

export interface CurriculumSnapshot {
  id: string;
  timestamp: number;
  label: string;
  level: number;
  lessonCount: number;
  totalVocab: number;
  totalGrammar: number;
  totalExercises?: number;
  lessons: Hsk1FullLesson[];
}

const STORAGE_KEY_PREFIX = "hsk_curriculum_snapshots_level_";

/**
 * Lưu 1 snapshot phiên bản giáo trình vào localStorage (tối đa giữ 3 bản gần nhất để tránh tràn 5MB quota)
 */
export function saveCurriculumSnapshot(
  level: number,
  label: string,
  lessons: Hsk1FullLesson[]
) {
  if (typeof window === "undefined" || !lessons || lessons.length === 0) return;
  // Tuyệt đối không lưu snapshot nếu danh sách bài học chứa ID của cấp độ khác (chống rỉ dữ liệu chéo level)
  const hasMismatch = lessons.some((l) => l.id && !l.id.startsWith(`hsk${level}-`));
  if (hasMismatch) {
    console.warn(`[Snapshot] Bỏ qua lưu snapshot cho HSK ${level} vì dữ liệu bài học chứa ID của cấp độ khác!`);
    return;
  }
  try {
    const key = `${STORAGE_KEY_PREFIX}${level}`;
    const raw = localStorage.getItem(key);
    let list: CurriculumSnapshot[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {}
    }

    const totalVocab = lessons.reduce((acc, l) => acc + (l.vocabList?.length || 0), 0);
    const totalGrammar = lessons.reduce((acc, l) => acc + (l.grammarList?.length || 0), 0);
    const totalExercises = lessons.reduce((acc, l) => acc + (l.grammarExercises?.length || 0), 0);

    const newSnapshot: CurriculumSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      label,
      level,
      lessonCount: lessons.length,
      totalVocab,
      totalGrammar,
      totalExercises,
      lessons,
    };

    // Giữ tối đa 3 bản ghi gần nhất để tránh vượt quota trình duyệt
    const updatedList = [newSnapshot, ...list.slice(0, 2)];
    safeLocalStorageSet(key, JSON.stringify(updatedList));
  } catch (err) {
    console.warn("Could not save curriculum snapshot to localStorage:", err);
  }
}

/**
 * Lấy danh sách các snapshot phiên bản trước
 */
export function getCurriculumSnapshots(level: number): CurriculumSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const key = `${STORAGE_KEY_PREFIX}${level}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Chỉ trả về các snapshot thực sự thuộc cấp độ này
    return list.filter((s: CurriculumSnapshot) => {
      if (s.level !== level) return false;
      const snapLessons = Array.isArray(s.lessons) ? s.lessons : [];
      return snapLessons.length === 0 || snapLessons.every((l) => !l.id || l.id.startsWith(`hsk${level}-`));
    });
  } catch {
    return [];
  }
}

interface CurriculumRevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  onRestoreSnapshot: (lessons: Hsk1FullLesson[]) => void;
}

export default function CurriculumRevisionHistoryModal({
  isOpen,
  onClose,
  level,
  onRestoreSnapshot,
}: CurriculumRevisionHistoryModalProps) {
  const [snapshots, setSnapshots] = useState<CurriculumSnapshot[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(getCurriculumSnapshots(level));
    }
  }, [isOpen, level]);

  if (!isOpen) return null;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(d);
  };

  const timeAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const handleClearHistory = () => {
    if (!confirm(`Xóa toàn bộ lịch sử hoàn tác của cấp HSK ${level}?`)) return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${level}`);
    setSnapshots([]);
  };

  const handleRestore = (snap: CurriculumSnapshot) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn khôi phục giáo trình HSK ${level} về phiên bản "${snap.label}" (${formatDate(
          snap.timestamp
        )}) gồm ${snap.lessonCount} bài học không?`
      )
    ) {
      return;
    }
    onRestoreSnapshot(snap.lessons);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">
                Lịch sử phiên bản & Hoàn tác giáo trình (HSK {level})
              </h3>
              <p className="text-xs text-[#BC9B6B]">
                Hệ thống tự động lưu bản sao lưu an toàn trước mỗi lần chỉnh sửa hoặc nhập file.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {snapshots.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9] space-y-2">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-serif font-bold text-sm text-[#204434]">
                Chưa có bản lưu lịch sử nào cho HSK {level}.
              </h4>
              <p className="text-xs text-[#526c50]">
                Mỗi khi bạn lưu bài học, sửa từ vựng hoặc nạp file JSON, hệ thống sẽ tự động tạo điểm khôi phục tại đây.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs hover:border-[#BC9B6B] transition flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#204434]">
                      {snap.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#8F6D3B] px-2 py-0.2 rounded-md bg-[#FAF7F0] border border-[#E5DEC9]">
                      {timeAgo(snap.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#526c50] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#8F6D3B]" />
                      <span>{formatDate(snap.timestamp)}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#204434]">
                      {snap.lessonCount} bài học ({snap.totalVocab} từ, {snap.totalGrammar} ngữ pháp{typeof snap.totalExercises === "number" ? `, ${snap.totalExercises} bài tập` : ""})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(snap)}
                  className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>Khôi phục</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          {snapshots.length > 0 ? (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa hết lịch sử</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold text-[#204434] bg-white cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
