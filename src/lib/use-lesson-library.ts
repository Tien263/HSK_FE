"use client";
import { useMemo, useSyncExternalStore } from "react";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";
export type ReadingEntry = { tab: string; viewed: string[]; updatedAt: string };
type Store = { saved: string[]; reading: Record<string, ReadingEntry>; resume: Record<string, number> };
const empty: Store = { saved: [], reading: {}, resume: {} };
const event = "hanyu-library-updated";
const key = (studentId?: string) => `hanyu_library_${studentId || "guest"}`;
export const lessonKey = (level: number, number: number) => `${level}:${number}`;
function parse(raw: string): Store {
  try {
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.saved) && data.reading && data.resume) {
      const reading: Record<string, ReadingEntry> = {};
      for (const [id, entry] of Object.entries(data.reading)) {
        const value = entry as ReadingEntry;
        if (value && typeof value.tab === "string" && Array.isArray(value.viewed) && value.viewed.every(item => typeof item === "string")) reading[id] = value;
      }
      const resume: Record<string, number> = {};
      for (const [level, number] of Object.entries(data.resume)) if (Number.isInteger(number) && Number(number) > 0) resume[level] = Number(number);
      return { saved: data.saved.filter((id: unknown) => typeof id === "string"), reading, resume };
    }
  } catch { /* An unavailable browser store starts empty. */ }
  return { saved: [], reading: {}, resume: {} };
}
function read(studentId?: string): Store {
  try { return parse(localStorage.getItem(key(studentId)) || ""); } catch { return empty; }
}
export function updateLibrary(studentId: string | undefined, update: (store: Store) => Store): boolean {
  try { localStorage.setItem(key(studentId), JSON.stringify(update(read(studentId)))); window.dispatchEvent(new Event(event)); return true; }
  catch { return false; }
}
function subscribe(notify: () => void) {
  window.addEventListener(event, notify); window.addEventListener("storage", notify);
  return () => { window.removeEventListener(event, notify); window.removeEventListener("storage", notify); };
}
export function useLessonLibrary(studentId?: string) {
  const raw = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key(studentId)) || ""; } catch { return ""; } }, () => "");
  return useMemo(() => parse(raw), [raw]);
}
export function lessonSections(lesson: Hsk1FullLesson): string[] {
  return [lesson.vocabList.length && "vocab", lesson.grammarList.length && "grammar", lesson.dialogue.length && "dialogue", (lesson.reading?.contentZh || lesson.reading?.originalText) && "reading", (lesson.culturalNote || lesson.culture) && "culture_detail", (lesson.phonetics.title || lesson.phonetics.rule || lesson.phonetics.examples.length) && "phonetics"].filter((id): id is string => typeof id === "string" && !!id);
}
export function viewedPercent(lesson: Hsk1FullLesson, entry?: ReadingEntry) {
  const sections = lessonSections(lesson);
  return sections.length ? Math.round(sections.filter(id => entry?.viewed.includes(id)).length / sections.length * 100) : 0;
}
