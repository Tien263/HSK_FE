import { ArrowRight, History, Mic, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { levelLabel, type attemptForOwner } from "@/lib/exam-center-core";
import { dateText, skillNames } from "./exam-client";
import { hskkLevelLabel } from "./hskk-templates";
import s from "./ExamResult.module.css";

type Attempt = ReturnType<typeof attemptForOwner>;
type Question = Attempt["questions"][number];
type Section = { id: string; title: string; count: number; score: number; max: number; pending: boolean };
type Result = {
  kind: "HSK" | "HSKK";
  title: string;
  level: string;
  score: number | null;
  max: number;
  pending: boolean;
  target?: number | null;
  submittedAt: string | null;
  sections: Section[];
};

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("vi-VN", { style: "percent", maximumFractionDigits: 1 });

function section(id: string, title: string, questions: Question[], scale = 1): Section {
  return {
    id, title, count: questions.length,
    score: questions.reduce((sum, question) => sum + (question.result?.earned ?? 0), 0) * scale,
    max: questions.reduce((sum, question) => sum + question.points, 0) * scale,
    pending: questions.some(question => question.result?.earned == null),
  };
}

function resultCards(attempt: Attempt): Result[] {
  const questions = attempt.questions.filter(question => !question.hskkQuestionId);
  const weight = questions.reduce((sum, question) => sum + question.points, 0);
  const scale = weight > 0 ? attempt.maxScore / weight : 1;
  const cards: Result[] = questions.length ? [{
    kind: "HSK", title: attempt.title, level: levelLabel(attempt.level),
    score: attempt.score, max: attempt.maxScore, pending: attempt.status === "NEEDS_GRADING",
    target: attempt.passScore, submittedAt: attempt.submittedAt,
    sections: attempt.skills.map(skill => section(skill, skillNames[skill], questions.filter(question => question.skill === skill), scale)),
  }] : [];

  const { hskkResult, hskkExam } = attempt;
  if (hskkResult && hskkExam) {
    const completed = new Map(attempt.questions.filter(question => question.hskkQuestionId)
      .map(question => [question.hskkQuestionId, question]));
    cards.push({
      kind: "HSKK", title: hskkResult.title, level: hskkLevelLabel(hskkResult.level),
      score: hskkResult.score, max: hskkResult.maxScore, pending: hskkResult.status === "NEEDS_GRADING",
      target: hskkExam.passScore, submittedAt: hskkResult.submittedAt,
      sections: hskkExam.groups.filter(group => group.questions.length).map(group =>
        section(group.id, group.title, group.questions.flatMap(question => {
          const result = completed.get(question.id);
          return result ? [result] : [];
        }))),
    });
  }
  return cards;
}

function ScoreCard({ result }: { result: Result }) {
  const rate = result.max > 0 && result.score !== null ? result.score / result.max : null;
  return (
    <section className={s.resultCard} aria-label={`Kết quả ${result.kind}`}>
      <div className={s.resultHeader}>
        <div><h2>Kết quả {result.kind}</h2><p>{result.title}</p></div>
        <strong>{result.level}</strong>
      </div>
      <div className={s.scoreTop}>
        <Trophy className={s.trophy} aria-hidden="true" />
        <div className={s.points}>{result.score === null ? "—" : number.format(result.score)} <small>/ {number.format(result.max)}</small></div>
        <span className={s.status}>{result.pending ? "Chờ chấm" : "Đã chấm"}</span>
      </div>
      {rate !== null && <div className={s.progress}>
        <meter aria-label={`Tỷ lệ điểm ${result.kind}`} min={0} max={1} value={rate} />
        <strong>{percent.format(rate)}</strong>
      </div>}
      {result.pending && <p className={s.note}>Điểm tạm tính</p>}
      {result.target != null && <p className={s.target}><Target size={18} /> Mục tiêu ≥ {number.format(result.target)} điểm</p>}
      <ul className={s.resultSections}>{result.sections.map(part => <li key={part.id}>{part.title} · {part.count} câu</li>)}</ul>
      {result.submittedAt && <p className={s.note}>Nộp bài {dateText(result.submittedAt)}</p>}
    </section>
  );
}

function ScoreTable({ result }: { result: Result }) {
  return (
    <section className={`${s.resultCard} ${s.detail}`}>
      <h2>Bảng điểm {result.kind}</h2>
      <div className={s.tableWrap}>
        <table>
          <thead><tr><th>Phần thi</th><th>Số câu</th><th>Điểm đạt</th><th>Điểm tối đa</th><th>Trạng thái</th></tr></thead>
          <tbody>{result.sections.map(part => <tr key={part.id}>
            <th scope="row">{part.title}</th><td>{part.count}</td>
            <td>{part.pending ? "—" : number.format(part.score)}</td>
            <td>{number.format(part.max)}</td><td>{part.pending ? "Chờ chấm" : "Đã chấm"}</td>
          </tr>)}</tbody>
          <tfoot><tr>
            <th scope="row">Tổng điểm {result.kind}</th><td>{result.sections.reduce((sum, part) => sum + part.count, 0)}</td>
            <td>{result.score === null ? "—" : number.format(result.score)}</td>
            <td>{number.format(result.max)}</td><td>{result.pending ? "Chờ chấm" : "Đã chấm"}</td>
          </tr></tfoot>
        </table>
      </div>
    </section>
  );
}

export default function ExamResult({ attempt, error, onReview, onBack, onRetake, onHistory, onSpeaking, onlyHskk = false, onlyHsk = false }: {
  attempt: Attempt;
  error: string;
  onReview: () => void;
  onBack: () => void;
  onRetake?: () => Promise<void>;
  onHistory?: () => void;
  onSpeaking?: () => void;
  onlyHskk?: boolean;
  onlyHsk?: boolean;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const results = resultCards(attempt).filter(result => (!onlyHskk || result.kind === "HSKK") && (!onlyHsk || result.kind === "HSK"));
  async function retake() {
    if (!onRetake || retrying) return;
    setRetrying(true);
    setRetryError("");
    try { await onRetake(); }
    catch (err) { setRetryError((err as Error).message); }
    finally { setRetrying(false); }
  }
  return (
    <main className={s.page}>
      <div className={s.content}>
        <nav aria-label="Điều hướng kết quả" className={s.breadcrumb}>
          <button onClick={onBack}>{onlyHskk ? "Kết quả HSK" : "Phòng thi"}</button>
          {onHistory && <button onClick={onHistory}>Bảng thành tích</button>}
        </nav>
        <header className={s.heading}><h1>{onlyHskk ? "Kết quả thi HSKK" : onlyHsk ? "Kết quả thi HSK" : "Kết quả lượt thi"}</h1></header>
        {(error || retryError) && <p role="alert" className={s.error}>{retryError || error}</p>}
        <div className={`${s.resultLayout} ${results.length === 1 ? s.singleResult : ""}`}>
          {results.map(result => <ScoreCard key={result.kind} result={result} />)}
          {results.map(result => <ScoreTable key={result.kind} result={result} />)}
        </div>
        <div className={s.actions}>
          <button className={s.primary} onClick={onReview}>{onlyHskk ? "Xem bản ghi và nhận xét" : "Xem phân tích chi tiết HSK"} <ArrowRight size={17} /></button>
          {attempt.hskkExam && onSpeaking && <button onClick={onSpeaking}><Mic size={17} /> {attempt.hskkSubmittedAt ? "Xem chi tiết HSKK" : "Mở phần thi HSKK"}</button>}
          {onRetake && <button disabled={retrying} onClick={() => void retake()}>{retrying ? "Đang mở đề…" : "Làm lại đề này"}</button>}
          {onHistory && <button onClick={onHistory}><History size={16} /> Xem bảng thành tích</button>}
        </div>
      </div>
    </main>
  );
}
