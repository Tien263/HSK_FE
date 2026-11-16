"use client";

import { useEffect, useState } from "react";
import type { attemptForOwner } from "@/lib/exam-center-core";
import { attemptApi } from "./exam-client";
import HskkExamPlayer from "./HskkExamPlayer";
import ExamResult from "./ExamResult";
import s from "./ExamResult.module.css";

type Attempt = ReturnType<typeof attemptForOwner>;

export default function HskkRoom({ id, onBack, onHistory }: { id: string; onBack: () => void; onHistory: () => void }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState("");
  const [showRecording, setShowRecording] = useState(false);

  useEffect(() => {
    let active = true;
    attemptApi<Attempt>(id).then(data => {
      if (active) setAttempt(data);
    }).catch((err: Error) => {
      if (active) setError(err.message);
    });
    return () => { active = false; };
  }, [id]);

  const gradingPending = attempt?.hskkResult?.status === "NEEDS_GRADING";
  useEffect(() => {
    if (!gradingPending) return;
    let active = true;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      void attemptApi<Attempt>(id).then(data => {
        if (active) setAttempt(data);
      }).catch(() => {});
    }, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [gradingPending, id]);

  if (attempt?.hskkExam && attempt.status !== "IN_PROGRESS") {
    if (attempt.hskkResult && !showRecording) {
      return <ExamResult attempt={attempt} error={error} onlyHskk onReview={() => setShowRecording(true)}
        onBack={onBack} onHistory={onHistory} />;
    }
    return <HskkExamPlayer exam={attempt.hskkExam} parentAttemptId={id} parentPaperTitle={attempt.title}
      submittedAttempt={attempt.hskkSubmittedAt ? attempt : null} onSubmitted={setAttempt}
      onClose={showRecording ? () => setShowRecording(false) : onBack} />;
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
