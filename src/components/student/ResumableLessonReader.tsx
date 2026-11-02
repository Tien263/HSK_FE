"use client";
import { useCallback } from "react";
import LessonStudyContent from "../learning/LessonStudyContent";
import { lessonKey, updateLibrary, useLessonLibrary } from "@/lib/use-lesson-library";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
export default function ResumableLessonReader({ lesson, level, studentId }: { lesson: Hsk1FullLesson; level: number; studentId?: string }) {
  const store = useLessonLibrary(studentId);
  const id = lessonKey(level, lesson.number);
  const remember = useCallback((tab: string) => {
    updateLibrary(studentId, current => ({ ...current, resume: { ...current.resume, [level]: lesson.number }, reading: { ...current.reading, [id]: { tab, viewed: [...new Set([...(current.reading[id]?.viewed || []), tab])], updatedAt: new Date().toISOString() } } }));
  }, [studentId, level, lesson.number, id]);
  return <LessonStudyContent lesson={lesson} initialTab={store.reading[id]?.tab} onSectionChange={remember}/>;
}
