import type { CSSProperties } from "react";
import { lessonOrdinal } from "@/lib/lesson-ordinal";
import s from "./LessonCover.module.css";
export default function LessonCover({ lessonNumber }: { lessonNumber: number }) {
  const label = lessonOrdinal(lessonNumber);
  return <div className={s.cover} data-lesson-cover={lessonNumber} aria-hidden="true"><span className={s.label} lang="zh-CN" style={{ "--cover-label-length": label.length } as CSSProperties}>{label}</span></div>;
}
