import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "./hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "./hsk2-full-lessons";

export function getLessonsByHskLevel(level: number = 1): Hsk1FullLesson[] {
  const lvl = Number(level) || 1;
  let baseLessons: Hsk1FullLesson[] = [];
  if (lvl === 1) {
    baseLessons = [...OFFICIAL_HSK1_15_LESSONS];
  } else if (lvl === 2) {
    baseLessons = [...OFFICIAL_HSK2_15_LESSONS];
  } else {
    baseLessons = [];
  }

  // Nếu Admin đã tùy biến hoặc bổ sung bài học trong kho chung
  if (typeof window !== "undefined") {
    try {
      const savedRaw = localStorage.getItem(`hsk_admin_custom_curriculum_level_${lvl}`);
      if (savedRaw) {
        const customLessons: Hsk1FullLesson[] = JSON.parse(savedRaw);
        if (Array.isArray(customLessons) && customLessons.length > 0) {
          const lessonMap = new Map<number, Hsk1FullLesson>();
          // Đưa base vào trước
          baseLessons.forEach((l) => lessonMap.set(l.number, l));
          // Đè hoặc bổ sung custom của Admin vào
          customLessons.forEach((l) => lessonMap.set(l.number, l));
          return Array.from(lessonMap.values()).sort((a, b) => a.number - b.number);
        }
      }
    } catch (e) {
      console.warn("Failed to parse custom admin curriculum from storage:", e);
    }
  }

  return baseLessons;
}

export function getLessonByNumber(level: number = 1, num: number): Hsk1FullLesson | undefined {
  const lessons = getLessonsByHskLevel(level);
  return lessons.find((l) => l.number === num);
}
