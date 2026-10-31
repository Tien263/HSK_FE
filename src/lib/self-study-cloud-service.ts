/**
 * Self-Study Cloud Synchronization Service
 * Provides offline-first synchronization for student self-study progress,
 * lesson unlocks, XP awards, and ancient calligraphy notes.
 */

export interface CloudProgressResult {
  success: boolean;
  unlockedLessons: number[];
  xpReward?: number;
  newTotalXp?: number;
}

export function getLocalUnlockedLessons(level: number, studentId: string = "guest"): number[] {
  if (typeof window === "undefined") return [1, 2];
  try {
    const raw = localStorage.getItem(`hsk_self_unlocked_lvl_${level}_${studentId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(new Set([1, 2, ...parsed])).sort((a, b) => a - b);
      }
    }
  } catch {}
  return [1, 2];
}

export function setLocalUnlockedLessons(level: number, unlocked: number[], studentId: string = "guest"): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = Array.from(new Set([1, 2, ...unlocked])).sort((a, b) => a - b);
    localStorage.setItem(`hsk_self_unlocked_lvl_${level}_${studentId}`, JSON.stringify(normalized));
  } catch {}
}

/**
 * Fetch progress from backend cloud and merge with local storage
 */
export async function fetchCloudProgress(level: number, studentId: string = "guest"): Promise<number[]> {
  const local = getLocalUnlockedLessons(level, studentId);
  if (typeof window === "undefined") return local;

  try {
    const res = await fetch(`/api/v1/my/self-study/progress?level=${level}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.unlockedLessons)) {
        const merged = Array.from(new Set([...local, ...data.unlockedLessons])).sort((a, b) => a - b);
        setLocalUnlockedLessons(level, merged, studentId);
        return merged;
      }
    }
  } catch (err) {
    // Silent fallback to local storage
  }

  return local;
}

/**
 * Save completed lesson, unlock next lesson, award XP and sync to Cloud
 */
export async function saveCloudPass(params: {
  level: number;
  completedLessonNumber: number;
  nextLessonNumber: number;
  currentUnlocked: number[];
  studentId?: string;
  xpReward?: number;
}): Promise<CloudProgressResult> {
  const { level, completedLessonNumber, nextLessonNumber, currentUnlocked, studentId = "guest", xpReward = 50 } = params;

  // 1. Update local storage immediately for zero latency
  const merged = Array.from(
    new Set([...currentUnlocked, completedLessonNumber, nextLessonNumber, 1, 2])
  ).sort((a, b) => a - b);
  setLocalUnlockedLessons(level, merged, studentId);

  // 2. Dispatch client event so other tabs and components update seamlessly
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("self-study-progress-updated", {
        detail: {
          level,
          completedLessonNumber,
          nextLessonNumber,
          unlockedLessons: merged,
          xpReward,
        },
      })
    );
  }

  // 3. Post to backend cloud
  try {
    const res = await fetch("/api/v1/my/self-study/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        completedLessonNumber,
        nextLessonNumber,
        unlockedLessons: merged,
        xpReward,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        unlockedLessons: Array.isArray(data.unlockedLessons) ? data.unlockedLessons : merged,
        xpReward,
        newTotalXp: data.newTotalXp,
      };
    }
  } catch (err) {
    // Offline resilience: progress is already recorded locally
  }

  return {
    success: true,
    unlockedLessons: merged,
    xpReward,
  };
}

/**
 * Sync calligraphy notes between LocalStorage and Cloud
 */
export async function syncCloudNotes(studentId: string = "default"): Promise<any[]> {
  const localKey = `hsk_ancient_notes_${studentId}`;
  let localNotes: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localNotes = JSON.parse(raw);
      if (!Array.isArray(localNotes)) localNotes = [];
    } catch {}
  }

  try {
    const res = await fetch("/api/v1/my/self-study/notes", { credentials: "same-origin" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.notes)) {
        // Merge notes: combine cloud and local notes by ID
        const map = new Map<string, any>();
        for (const n of json.notes) {
          if (n?.id) map.set(n.id, n);
        }
        for (const n of localNotes) {
          if (n?.id) map.set(n.id, n);
        }
        const merged = Array.from(map.values());
        if (typeof window !== "undefined") {
          localStorage.setItem(localKey, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch {}

  return localNotes;
}

/**
 * Save single calligraphy note to Cloud
 */
export async function saveCloudNote(note: any): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/my/self-study/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
