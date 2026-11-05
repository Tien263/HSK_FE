"use client";
import { useEffect, useState, useCallback } from "react";
import QuestionAnswerField from "./QuestionAnswerField";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import InkHero from "./InkHero";
import { portalFetch, usePortalData } from "./use-portal-data";
import ExamAntiCheatProctor from "@/components/common/ExamAntiCheatProctor";
import styles from "./Ink.module.css";

type Question = {
  schemaVersion?: number;
  [key: string]: any;
  matchingLeft?: string[];
  matchingRight?: string[];
  tokens?: string[];
  flashcard?: { front: string; backPinyin?: string; backVi?: string; exampleZh?: string };
  handwritingCount?: number;
  rubric?: string;
  id: string;
  content: string;
  type: string;
  pinyinPrompt?: string;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  options: unknown;
};

type Attempt = {
  attemptId: string;
  assignment: { title: string; durationMin: number; classId?: string; proctorEnabled?: boolean };
  questions: Question[];
  status: string;
  startedAt: string;
};

export default function StudentAttempt() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, loading } = usePortalData<Attempt>("/api/v1/attempts/" + id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const left = data
    ? Math.max(0, Math.floor((new Date(data.startedAt).getTime() + data.assignment.durationMin * 60000 - now) / 1000))
    : 0;

  const handleSubmit = useCallback(
    async (isForce = false, reason = "") => {
      setBusy(true);
      setMessage(isForce ? `Bài thi bị nộp cưỡng chế do: ${reason}` : "");
      try {
        await portalFetch("/api/v1/attempts/" + id + "/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, isForce, reason }),
        });
        router.push("/s/attempts/" + id + "/result");
      } catch (err) {
        setMessage((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [answers, id, router]
  );

  return (
    <main className="min-h-screen bg-[#F7F5EE] p-4 sm:p-8">
      {/* Giám thị AI Chống Gian Lận (Chỉ kích hoạt khi Giáo viên / Admin bật tính năng này) */}
      {data && data.status === "IN_PROGRESS" && data.assignment.proctorEnabled !== false && (
        <ExamAntiCheatProctor
          examTitle={data.assignment.title}
          classId={data.assignment.classId}
          maxViolations={3}
          onForceSubmit={(reason) => handleSubmit(true, reason)}
        />
      )}

      <div className={`${styles.workspace} ${styles.stack} mx-auto max-w-4xl`}>
        <Link href="/s/home?tab=assignments" className={styles.muted}>
          ← Bài tập của tôi
        </Link>
        <InkHero
          eyebrow="Làm bài thi & Kiểm tra"
          title={data?.assignment.title || "Bài tập"}
          description={
            data
              ? `${data.questions.length} câu hỏi · ${data.assignment.durationMin} phút · ${
                  data.assignment.proctorEnabled !== false
                    ? "🛡️ Có Giám thị AI giám sát"
                    : "🛡️ Chế độ thi tự do (Giáo viên tắt Giám thị AI)"
                }`
              : undefined
          }
        />
        {data && data.status === "IN_PROGRESS" && data.assignment.proctorEnabled === false && (
          <div style={{ padding: "10px 16px", borderRadius: 12, background: "#E8F5E9", border: "1px solid #C8E6C9", color: "#2E7D32", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🛡️</span>
            <span><strong>Chế độ làm bài tự do:</strong> Giáo viên đã tắt tính năng Giám thị AI (Camera & Micro) cho bài thi này. Thí sinh làm bài tự nhiên không bị giới hạn.</span>
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.empty}>Đang tải đề…</p>}

        {data && data.status !== "IN_PROGRESS" ? (
          <section className={styles.panel}>
            <p>Bài đã được nộp.</p>
            <Link href={`/s/attempts/${id}/result`} className={`${styles.button} mt-4`}>
              Xem kết quả
            </Link>
          </section>
        ) : (
          data && (
            <form
              className={styles.stack}
              onSubmit={async (event) => {
                event.preventDefault();
                if (!confirm("Nộp bài với các câu trả lời hiện tại?")) return;
                handleSubmit(false);
              }}
            >
              <div className={`${styles.notice} sticky top-3 z-20 flex items-center justify-between gap-4`}>
                <span>
                  Đã trả lời {Object.values(answers).filter(Boolean).length}/{data.questions.length} câu
                </span>
                <time aria-live="off">
                  Còn {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                </time>
              </div>

              {data.questions.map((question, index) => {
                const raw = Array.isArray(question.options)
                  ? question.options
                  : question.type === "true_false"
                  ? [{ id: "true", text: "Đúng" }, { id: "false", text: "Sai" }]
                  : [];
                const options = raw.map((value, i) =>
                  typeof value === "string" ? { id: String.fromCharCode(65 + i), text: value } : (value as { id?: string; text?: string; label?: string; value?: string })
                );

                return (
                  <section key={question.id} className={styles.panel}>
                    <span className={styles.tag}>
                      Câu {index + 1} · {Math.round(question.points * 100) / 100} điểm
                    </span>
                    {question.schemaVersion !== 2 && (
                      <h3 className="mt-4 text-lg font-semibold leading-9">{question.content}</h3>
                    )}
                    {question.pinyinPrompt && <p className={styles.pinyin}>{question.pinyinPrompt}</p>}
                    {question.schemaVersion !== 2 && question.audioUrl && (
                      <audio controls src={question.audioUrl} className="mt-3 w-full" />
                    )}
                    {question.imageUrl && (
                      <img src={question.imageUrl} alt="Hình câu hỏi" className="mt-3 max-h-72 rounded-xl" />
                    )}
                    {question.schemaVersion !== 2 && options.length ? (
                      <div className="mt-5 space-y-3">
                        {options.map((option, i) => {
                          const key = option.id || option.value || String.fromCharCode(65 + i);
                          return (
                            <label key={key} className={`${styles.contentItem} flex cursor-pointer gap-3 text-sm`}>
                              <input
                                type="radio"
                                name={question.id}
                                value={key}
                                checked={answers[question.id] === key}
                                onChange={() => setAnswers({ ...answers, [question.id]: key })}
                              />
                              {option.text || option.label || option.value || key}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <QuestionAnswerField
                        question={question}
                        value={answers[question.id] || ""}
                        onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                      />
                    )}
                  </section>
                );
              })}

              {message && (
                <p role="alert" className={styles.error}>
                  {message}
                </p>
              )}
              {!left && (
                <p className={styles.error}>
                  Đã hết thời gian làm bài. Vui lòng nộp ngay nếu vẫn trong thời gian cho phép.
                </p>
              )}
              <button disabled={busy} className={styles.button}>
                {busy ? "Đang nộp…" : "Nộp bài"}
              </button>
            </form>
          )
        )}
      </div>
    </main>
  );
}
