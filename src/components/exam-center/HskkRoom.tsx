"use client";

import { useEffect, useState } from "react";
import type { attemptForOwner } from "@/lib/exam-center-core";
import { attemptApi } from "./exam-client";
import HskkExamPlayer from "./HskkExamPlayer";
import s from "./ExamResult.module.css";

type Attempt = ReturnType<typeof attemptForOwner>;

export default function HskkRoom({ id, onBack }: { id: string; onBack: () => void }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    attemptApi<Attempt>(id).then(data => {
      if (active) setAttempt(data);
    }).catch((err: Error) => {
      if (active) setError(err.message);
    });
    return () => { active = false; };
  }, [id]);

  if (attempt?.hskkExam && attempt.status !== "IN_PROGRESS") {
    return <HskkExamPlayer exam={attempt.hskkExam} parentAttemptId={id} parentPaperTitle={attempt.title}
      submittedAttempt={attempt.hskkSubmittedAt ? attempt : null} onClose={onBack} />;
  }

  return (
    <main className={s.room}>
      <h1>Phòng thi khẩu ngữ HSKK</h1>
      <p role={error ? "alert" : "status"}>
        {error || (attempt
          ? attempt.status === "IN_PROGRESS"
            ? "Hãy nộp bài HSK trước khi vào phòng thi khẩu ngữ."
            : "Đề HSK này chưa có bài thi khẩu ngữ đi kèm."
          : "Đang tải phòng thi khẩu ngữ…")}
      </p>
      <button type="button" onClick={onBack}>Quay lại bài thi HSK</button>
    </main>
  );
}
