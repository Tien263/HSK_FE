/**
 * Memory & Spaced Repetition Service for Vocab & Knowledge items
 * Quản lý trạng thái ghi nhớ: 'MASTERED' (Đã nhớ), 'REVIEW_NEEDED' (Cần ôn), 'NOT_REMEMBERED' (Chưa nhớ)
 */

export type MemoryStatus = "MASTERED" | "REVIEW_NEEDED" | "NOT_REMEMBERED";

export interface VocabMemoryRecord {
  id: string; // hanzi or unique id
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  hskLevel: number;
  lessonNumber: number;
  status: MemoryStatus;
  consecutiveRight: number;
  lastReviewedAt: string; // ISO date
  nextReviewAt: string; // ISO date
  reviewCount: number;
}

const STORAGE_KEY = "hsk_vocab_memory_records";
const TIME_SPENT_KEY = "hsk_practice_weekly_time_seconds";

export function getMemoryRecords(studentId?: string): VocabMemoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const key = studentId ? `${STORAGE_KEY}_${studentId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading memory records:", e);
    return [];
  }
}

export function saveMemoryRecord(
  item: {
    id?: string;
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    hskLevel: number;
    lessonNumber: number;
  },
  status: MemoryStatus,
  studentId?: string
): VocabMemoryRecord {
  if (typeof window === "undefined") {
    return {
      id: item.id || item.hanzi,
      ...item,
      status,
      consecutiveRight: status === "MASTERED" ? 1 : 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      reviewCount: 1,
    };
  }

  const records = getMemoryRecords(studentId);
  const existingIdx = records.findIndex((r) => r.hanzi === item.hanzi);

  const now = new Date();
  let nextDays = 1;
  let consecutive = 0;

  if (status === "MASTERED") {
    consecutive = existingIdx >= 0 ? records[existingIdx].consecutiveRight + 1 : 1;
    // Spaced repetition interval: 1, 3, 7, 14, 30 days
    const intervals = [1, 3, 7, 14, 30];
    const idx = Math.min(consecutive - 1, intervals.length - 1);
    nextDays = intervals[idx] || 7;
  } else if (status === "REVIEW_NEEDED") {
    nextDays = 1; // review tomorrow
    consecutive = 0;
  } else {
    nextDays = 0; // review today / immediately
    consecutive = 0;
  }

  const nextDate = new Date();
  nextDate.setDate(now.getDate() + nextDays);

  const updatedRecord: VocabMemoryRecord = {
    id: item.id || item.hanzi,
    hanzi: item.hanzi,
    pinyin: item.pinyin,
    meaningVi: item.meaningVi,
    hskLevel: item.hskLevel,
    lessonNumber: item.lessonNumber,
    status,
    consecutiveRight: consecutive,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextDate.toISOString(),
    reviewCount: (existingIdx >= 0 ? records[existingIdx].reviewCount : 0) + 1,
  };

  if (existingIdx >= 0) {
    records[existingIdx] = updatedRecord;
  } else {
    records.push(updatedRecord);
  }

  try {
    const key = studentId ? `${STORAGE_KEY}_${studentId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(records));
  } catch (e) {
    console.warn("Storage quota or error saving memory record:", e);
  }

  return updatedRecord;
}

export function getMemoryStats(studentId?: string) {
  const records = getMemoryRecords(studentId);
  const now = new Date();

  const mastered = records.filter((r) => r.status === "MASTERED");
  const reviewNeeded = records.filter(
    (r) => r.status === "REVIEW_NEEDED" || (r.status === "MASTERED" && new Date(r.nextReviewAt) <= now)
  );
  const notRemembered = records.filter((r) => r.status === "NOT_REMEMBERED");

  return {
    totalEvaluated: records.length,
    masteredCount: mastered.length,
    reviewNeededCount: reviewNeeded.length,
    notRememberedCount: notRemembered.length,
    dueTodayCount: reviewNeeded.length + notRemembered.length,
    masteryPercentage: records.length > 0 ? Math.round((mastered.length / records.length) * 100) : 0,
    records,
  };
}

export function recordWeeklyStudyTime(seconds: number, studentId?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = studentId ? `${TIME_SPENT_KEY}_${studentId}` : TIME_SPENT_KEY;
    const current = Number(localStorage.getItem(key) || "0");
    localStorage.setItem(key, String(current + seconds));
  } catch {}
}

export function getWeeklyStudyMinutes(studentId?: string): number {
  if (typeof window === "undefined") return 45; // default fallback 45m
  try {
    const key = studentId ? `${TIME_SPENT_KEY}_${studentId}` : TIME_SPENT_KEY;
    const current = Number(localStorage.getItem(key) || "0");
    return Math.max(35, Math.round(current / 60));
  } catch {
    return 45;
  }
}
