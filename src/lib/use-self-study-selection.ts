"use client";

import { useSyncExternalStore } from "react";

type Selection = { level: number; lessonNumber: number };
const eventName = "hanyu-self-study-selection";
const memory = new Map<string, string>();
function subscribe(notify: () => void) {
  window.addEventListener(eventName, notify);
  window.addEventListener("storage", notify);
  return () => { window.removeEventListener(eventName, notify); window.removeEventListener("storage", notify); };
}
function parse(raw: string, fallbackLevel: number): Selection {
  try {
    const value = JSON.parse(raw);
    if (Number.isInteger(value.level) && value.level >= 1 && value.level <= 9 && Number.isInteger(value.lessonNumber) && value.lessonNumber > 0) return value;
  } catch { /* A missing or older selection starts at the current HSK level. */ }
  return { level: fallbackLevel || 1, lessonNumber: 1 };
}

/** Shared UI context only; lesson permissions and progression keep their existing source. */
export function useSelfStudySelection(studentId?: string, fallbackLevel = 1) {
  const key = `hanyu_self_study_selection_${studentId || "guest"}`;
  function snapshot() {
    try { return memory.get(key) || localStorage.getItem(key) || ""; }
    catch { return memory.get(key) || ""; }
  }
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const selection = parse(raw, fallbackLevel);
  function select(next: Selection) {
    const value = JSON.stringify(next);
    try { localStorage.setItem(key, value); memory.delete(key); } catch { memory.set(key, value); }
    window.dispatchEvent(new Event(eventName));
  }
  return { ...selection, select };
}
