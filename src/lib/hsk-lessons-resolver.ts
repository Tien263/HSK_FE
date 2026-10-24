import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "./hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "./hsk2-full-lessons";

export function getLessonsByHskLevel(level: number = 1): Hsk1FullLesson[] {
  const lvl = Number(level) || 1;
  if (lvl === 2) {
    return OFFICIAL_HSK2_15_LESSONS;
  }
  // Default to HSK 1
  return OFFICIAL_HSK1_15_LESSONS;
}

export function getLessonByNumber(level: number = 1, num: number): Hsk1FullLesson | undefined {
  const lessons = getLessonsByHskLevel(level);
  return lessons.find((l) => l.number === num);
}
