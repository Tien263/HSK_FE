/**
 * Self-Study Progression & Imperial Exam Scholar Ranks
 * Manages level gating, study time tracking, mock exam score validation,
 * and promotion between HSK levels (HSK 1 -> HSK 6).
 */

export interface ScholarRank {
  level: number;
  titleZh: string;
  titleVi: string;
  examName: string;
  description: string;
  color: string;
}

export const SCHOLAR_RANKS: Record<number, ScholarRank> = {
  1: {
    level: 1,
    titleZh: "童生",
    titleVi: "Đồng Sinh",
    examName: "Nhập Môn Bút Nghiên",
    description: "Mới bước chân vào cửa Khổng sân Trình, đặt nền móng 150 chữ Hán đầu tiên.",
    color: "#2B4837",
  },
  2: {
    level: 2,
    titleZh: "秀才",
    titleVi: "Tú Tài",
    examName: "Viện Thí (Thi Viện)",
    description: "Vượt qua kỳ thi cấp huyện/viện, nắm vững ngữ pháp và giao tiếp sinh hoạt căn bản.",
    color: "#3E5F48",
  },
  3: {
    level: 3,
    titleZh: "举人",
    titleVi: "Cử Nhân",
    examName: "Hương Thí (Thi Hương)",
    description: "Đỗ kỳ thi cấp tỉnh, tự tin giao tiếp thương mại, du lịch và đời sống xã hội.",
    color: "#8C6A34",
  },
  4: {
    level: 4,
    titleZh: "贡士",
    titleVi: "Cống Sĩ",
    examName: "Hội Thí (Thi Hội)",
    description: "Vượt kỳ thi toàn quốc tại kinh đô, đọc báo chí và thảo luận các chủ đề chuyên sâu.",
    color: "#A24C3D",
  },
  5: {
    level: 5,
    titleZh: "探花 · 榜眼",
    titleVi: "Bảng Nhãn / Thám Hoa",
    examName: "Đình Thí (Thi Đình)",
    description: "Bước vào kỳ thi tuyển chọn cận thần của hoàng đế, vốn từ phong phú trên 2500 từ.",
    color: "#7B241C",
  },
  6: {
    level: 6,
    titleZh: "状元",
    titleVi: "Trạng Nguyên",
    examName: "Điện Thí Kim Bảng",
    description: "Đệ nhất giáp bảng vàng, thông thạo HSK quốc tế như người bản xứ.",
    color: "#B7860B",
  },
};

export interface LevelAdvancementStatus {
  currentLevel: number;
  maxUnlockedLevel: number;
  canAdvance: boolean;
  lessonsCompleted: number;
  totalLessons: number;
  isLessonsQualified: boolean;
  studyMinutes: number;
  targetMinutes: number;
  isTimeQualified: boolean;
  examScore: number | null;
  targetScore: number;
  isExamQualified: boolean;
  currentRank: ScholarRank;
  nextRank?: ScholarRank;
}

const TARGET_MINUTES_BY_LEVEL: Record<number, number> = {
  1: 30,  // 30 phút rèn luyện
  2: 45,  // 45 phút rèn luyện
  3: 60,  // 60 phút
  4: 90,
  5: 120,
  6: 150,
};

/**
 * Get the maximum unlocked HSK level for the student.
 * Prioritizes user profile and local storage. Minimum is 1.
 */
export function getMaxUnlockedHskLevel(currentUser?: any): number {
  if (typeof window === "undefined") return currentUser?.currentHskLevel || 1;

  try {
    // 1. From currentUser object
    const userLvl = Number(currentUser?.currentHskLevel);
    if (userLvl >= 1 && userLvl <= 6) return userLvl;

    // 2. From hanyu_study_profile
    const profileRaw = localStorage.getItem("hanyu_study_profile");
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const profileLvl = Number(profile.currentHskLevel);
      if (profileLvl >= 1 && profileLvl <= 6) return profileLvl;
    }

    // 3. From generic unlocked key
    const genericKey = `hsk_max_unlocked_level_${currentUser?.id || "guest"}`;
    const stored = Number(localStorage.getItem(genericKey));
    if (stored >= 1 && stored <= 6) return stored;
  } catch {}

  return 1;
}

/**
 * Get total study minutes logged for an HSK level.
 */
export function getLevelStudyMinutes(level: number, studentId: string = "guest"): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = `hsk_study_minutes_lvl_${level}_${studentId}`;
    const stored = localStorage.getItem(key);
    if (stored) return Number(stored) || 0;

    // Fallback: estimate from today/weekly study seconds
    const todaySecKey = `hsk_today_study_sec_${studentId}`;
    const todaySec = Number(localStorage.getItem(todaySecKey)) || 0;
    return Math.floor(todaySec / 60);
  } catch {
    return 0;
  }
}

/**
 * Add study minutes to level accumulator
 */
export function addLevelStudyMinutes(level: number, minutes: number, studentId: string = "guest"): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = `hsk_study_minutes_lvl_${level}_${studentId}`;
    const current = getLevelStudyMinutes(level, studentId);
    const updated = current + minutes;
    localStorage.setItem(key, String(updated));
    return updated;
  } catch {
    return 0;
  }
}

/**
 * Get mock exam best score for a level
 */
export function getLevelMockExamScore(level: number, studentId: string = "guest"): number | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `hsk_mock_exam_best_score_lvl_${level}_${studentId}`;
    const stored = localStorage.getItem(key);
    if (stored !== null) return Number(stored);

    // Also check global mock attempts if stored in localStorage
    const attemptsRaw = localStorage.getItem(`hsk_mock_attempts_${studentId}`);
    if (attemptsRaw) {
      const attempts = JSON.parse(attemptsRaw);
      if (Array.isArray(attempts)) {
        const forLevel = attempts.filter((a: any) => a.level === level);
        if (forLevel.length > 0) {
          const maxScore = Math.max(...forLevel.map((a: any) => Number(a.score) || 0));
          return maxScore;
        }
      }
    }
  } catch {}
  return null;
}

/**
 * Record a mock exam score for level qualification
 */
export function recordLevelMockExamScore(level: number, score: number, studentId: string = "guest"): void {
  if (typeof window === "undefined") return;
  try {
    const key = `hsk_mock_exam_best_score_lvl_${level}_${studentId}`;
    const existing = getLevelMockExamScore(level, studentId) || 0;
    const best = Math.max(existing, score);
    localStorage.setItem(key, String(best));
  } catch {}
}

/**
 * Evaluate whether the student meets all 3 criteria to advance from currentLevel to currentLevel + 1
 */
export function evaluateLevelAdvancement(
  currentLevel: number,
  unlockedLessons: number[],
  totalLessonsInLevel: number,
  currentUser?: any
): LevelAdvancementStatus {
  const studentId = currentUser?.id || "guest";
  const maxUnlockedLevel = getMaxUnlockedHskLevel(currentUser);

  // 1. Lessons completed check
  const lessonsCompleted = unlockedLessons.length;
  // Qualified if all lessons in curriculum are unlocked or at least total - 1 completed
  const isLessonsQualified = lessonsCompleted >= Math.max(1, totalLessonsInLevel);

  // 2. Study time check
  const studyMinutes = getLevelStudyMinutes(currentLevel, studentId);
  const targetMinutes = TARGET_MINUTES_BY_LEVEL[currentLevel] || 30;
  const isTimeQualified = studyMinutes >= targetMinutes;

  // 3. Mock exam score check (>= 60%)
  const examScore = getLevelMockExamScore(currentLevel, studentId);
  const targetScore = 60; // 60/100 points
  const isExamQualified = examScore !== null && examScore >= targetScore;

  const canAdvance = isLessonsQualified && isTimeQualified && isExamQualified;

  return {
    currentLevel,
    maxUnlockedLevel,
    canAdvance,
    lessonsCompleted,
    totalLessons: totalLessonsInLevel,
    isLessonsQualified,
    studyMinutes,
    targetMinutes,
    isTimeQualified,
    examScore,
    targetScore,
    isExamQualified,
    currentRank: SCHOLAR_RANKS[currentLevel] || SCHOLAR_RANKS[1],
    nextRank: SCHOLAR_RANKS[currentLevel + 1],
  };
}

/**
 * Promotes the student to next HSK level when all requirements are met
 */
export async function promoteToNextHskLevel(
  currentLevel: number,
  currentUser?: any
): Promise<{ success: boolean; newLevel: number }> {
  const nextLevel = Math.min(6, currentLevel + 1);
  const studentId = currentUser?.id || "guest";

  if (typeof window !== "undefined") {
    // 1. Update localStorage max unlocked level
    localStorage.setItem(`hsk_max_unlocked_level_${studentId}`, String(nextLevel));

    // 2. Update hanyu_study_profile
    try {
      const profileRaw = localStorage.getItem("hanyu_study_profile");
      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      profile.currentHskLevel = nextLevel;
      localStorage.setItem("hanyu_study_profile", JSON.stringify(profile));
    } catch {}

    // 3. Update currentUser in localStorage
    try {
      const userRaw = localStorage.getItem("currentUser");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.currentHskLevel = nextLevel;
        localStorage.setItem("currentUser", JSON.stringify(u));
      }
    } catch {}

    // 4. Initialize unlocked lessons for new level: [1, 2]
    const nextLevelKey = `hsk_self_unlocked_lvl_${nextLevel}_${studentId}`;
    if (!localStorage.getItem(nextLevelKey)) {
      localStorage.setItem(nextLevelKey, JSON.stringify([1, 2]));
    }

    // 5. Fire global promotion event
    window.dispatchEvent(
      new CustomEvent("hsk-level-promoted", {
        detail: {
          previousLevel: currentLevel,
          newLevel: nextLevel,
          rank: SCHOLAR_RANKS[nextLevel],
        },
      })
    );
  }

  // 6. Sync to backend API
  try {
    await fetch("/api/v1/my/self-study/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: nextLevel,
        completedLessonNumber: 1,
        nextLessonNumber: 2,
        unlockedLessons: [1, 2],
        xpReward: 100, // Big XP bonus for advancing an entire HSK level!
      }),
    });
  } catch {}

  return { success: true, newLevel: nextLevel };
}
