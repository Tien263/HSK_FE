import { OFFICIAL_HSK1_15_LESSONS, type Hsk1FullLesson } from "./hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "./hsk2-full-lessons";

export function getDefaultLessons(level: number): Hsk1FullLesson[] {
  return level === 1 ? [...OFFICIAL_HSK1_15_LESSONS] : level === 2 ? [...OFFICIAL_HSK2_15_LESSONS] : [];
}
