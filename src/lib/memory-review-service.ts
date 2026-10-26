/**
 * Memory & Spaced Repetition Service for Vocab & Knowledge items
 * Quản lý trạng thái ghi nhớ: 'MASTERED' (Đã nhớ), 'REVIEW_NEEDED' (Cần ôn), 'NOT_REMEMBERED' (Chưa nhớ)
 * Quản lý Thời Gian Học Thực Tế ĐỘNG: Trong Ngày & Trong Tuần (Không fix cứng)
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
const DAILY_TIME_PREFIX = "hsk_study_time_daily";

// Helper lấy ngày hiện tại định dạng YYYY-MM-DD
function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

// =========================================================================
// HỆ THỐNG ĐO THỜI GIAN HỌC THỰC TẾ (HÔM NAY & TRONG TUẦN) - ĐỘNG 100%
// =========================================================================

/**
 * Ghi nhận số giây học thực tế (Cộng dồn vào hôm nay và tuần này)
 */
export function recordStudyTime(seconds: number, studentId?: string) {
  if (typeof window === "undefined" || seconds <= 0) return;
  try {
    const todayStr = getTodayDateStr();
    const sid = studentId || "default";

    // 1. Lưu thời gian hôm nay
    const dailyKey = `${DAILY_TIME_PREFIX}_${sid}_${todayStr}`;
    const curDaily = Number(localStorage.getItem(dailyKey) || "0");
    localStorage.setItem(dailyKey, String(curDaily + seconds));

    // 2. Lưu tổng thời gian trong tuần
    const weeklyKey = `${TIME_SPENT_KEY}_${sid}`;
    const curWeekly = Number(localStorage.getItem(weeklyKey) || "0");
    localStorage.setItem(weeklyKey, String(curWeekly + seconds));
  } catch (e) {
    console.warn("Error recording study time:", e);
  }
}

// Tương thích ngược với hàm cũ
export function recordWeeklyStudyTime(seconds: number, studentId?: string) {
  recordStudyTime(seconds, studentId);
}

/**
 * Lấy số giây học trong ngày hôm nay
 */
export function getTodayStudySeconds(studentId?: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const todayStr = getTodayDateStr();
    const sid = studentId || "default";
    const dailyKey = `${DAILY_TIME_PREFIX}_${sid}_${todayStr}`;
    const val = Number(localStorage.getItem(dailyKey) || "0");
    return Math.max(0, val);
  } catch {
    return 0;
  }
}

/**
 * Lấy số giây học trong tuần này (tính theo 7 ngày gần nhất hoặc tuần hiện tại)
 */
export function getWeeklyStudySeconds(studentId?: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const sid = studentId || "default";
    const weeklyKey = `${TIME_SPENT_KEY}_${sid}`;
    const val = Number(localStorage.getItem(weeklyKey) || "0");
    if (val > 0) return val;

    // Fallback tính tổng 7 ngày gần nhất
    let sum = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${DAILY_TIME_PREFIX}_${sid}_${y}-${m}-${day}`;
      sum += Number(localStorage.getItem(key) || "0");
    }
    return sum;
  } catch {
    return 0;
  }
}

/**
 * Lấy số phút học trong tuần (động 100%)
 */
export function getWeeklyStudyMinutes(studentId?: string): number {
  const seconds = getWeeklyStudySeconds(studentId);
  return Math.round(seconds / 60);
}

/**
 * Lấy số phút học trong ngày hôm nay (động 100%)
 */
export function getTodayStudyMinutes(studentId?: string): number {
  const seconds = getTodayStudySeconds(studentId);
  return Math.round(seconds / 60);
}

/**
 * Format thời gian thân thiện tiếng Việt: ví dụ "28 phút", "1 giờ 15 phút", "< 1 phút"
 */
export function formatStudyTimeVi(seconds: number): string {
  if (seconds <= 0) return "0 phút";
  if (seconds < 60) return "< 1 phút";
  const m = Math.round(seconds / 60);
  if (m < 60) {
    return `${m} phút`;
  }
  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;
  if (remainingMins === 0) {
    return `${hours} giờ`;
  }
  return `${hours} giờ ${remainingMins} phút`;
}

/**
 * Format đồng hồ dạng MM:SS hoặc HH:MM:SS (ví dụ "28:15" hoặc "01:15:30")
 */
export function formatTimerMMSS(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
