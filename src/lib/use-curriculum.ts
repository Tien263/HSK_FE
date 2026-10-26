"use client";
import { useEffect, useState } from "react";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";

type CurriculumSnapshot = { level: number; items: Hsk1FullLesson[]; isDeleted: boolean };
const EMPTY: Hsk1FullLesson[] = [];
export function useCurriculumLessons(level: number) {
  const [snapshot, setSnapshot] = useState<CurriculumSnapshot | null>(null);
  const [failure, setFailure] = useState<{ level: number; message: string } | null>(null);
  useEffect(() => {
    let active = true; let controller: AbortController | null = null;
    async function load() {
      controller?.abort(); controller = new AbortController();
      const signal = controller.signal;
      try {
        const response = await fetch(`/api/v1/curriculum?level=${level}`, { cache: "no-store", signal }); const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Chưa tải được giáo trình.");
        if (!active || signal.aborted) return;
        setSnapshot(data); setFailure(null);
      } catch (error) { if (active && !signal.aborted) setFailure({ level, message: error instanceof Error ? error.message : "Chưa tải được giáo trình." }); }
    }
    const onFocus = () => { if (document.visibilityState === "visible") void load(); };
    void load(); window.addEventListener("focus", onFocus); window.addEventListener("curriculum-updated", onFocus);
    return () => { active = false; controller?.abort(); window.removeEventListener("focus", onFocus); window.removeEventListener("curriculum-updated", onFocus); };
  }, [level]);
  return { lessons: snapshot?.level === level ? snapshot.items : EMPTY, error: failure?.level === level ? failure.message : "", loading: snapshot?.level !== level && failure?.level !== level };
}
