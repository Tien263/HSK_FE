import BrandMark from "@/components/common/BrandMark";
import { ArrowRight, BarChart3, CalendarDays, Clock3, FileText, History, Mic, RotateCcw, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { hasAnswer, levelLabel, type attemptForOwner } from "@/lib/exam-center-core";
import { dateText, resultNames, skillNames, timeText } from "./exam-client";
import s from "./ExamResult.module.css";

type Attempt = ReturnType<typeof attemptForOwner>;

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("vi-VN", { style: "percent", maximumFractionDigits: 1 });
const skillChinese: Record<string, string> = {
  LISTENING: "听力", READING: "阅读", WRITING: "书写", TRANSLATION: "翻译", SPEAKING: "口语",
};

export default function ExamResult({ attempt, error, onReview, onBack, onRetake, onHistory, onSpeaking }: {
  attempt: Attempt;
  error: string;
  onReview: () => void;
  onBack: () => void;
  onRetake?: () => Promise<void>;
  onHistory?: () => void;
  onSpeaking?: () => void;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const { hskkExam, hskkSubmittedAt } = attempt;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { questions, answers, submittedAt, startedAt } = attempt;
  const hskWeight = questions.reduce((sum, question) => sum + (question.hskkQuestionId ? 0 : question.points), 0);
  const scoreScale = hskWeight > 0 ? attempt.maxScore / hskWeight : 0;
  const points = (question: Attempt["questions"][number], value: number) =>
    value * (question.hskkQuestionId ? 1 : scoreScale);
  const hskkScore = attempt.hskkScore;
  const maxScore = attempt.maxScore + (hskkScore?.max ?? 0);
  const score = attempt.score === null ? null : attempt.score + (hskkScore?.earned ?? 0);
  const skillOrder = ["LISTENING", "READING", "WRITING", "SPEAKING"] as const;
  const skills = [...skillOrder, ...attempt.skills.filter(skill => skill === "TRANSLATION")].map(skill => {
    const rows = questions.filter(question => question.skill === skill);
    const max = rows.reduce((sum, question) => sum + points(question, question.points), 0);
    const earned = rows.reduce((sum, question) => sum + points(question, question.result?.earned ?? 0), 0);
    const awaitingHskk = skill === "SPEAKING" && !!hskkExam && !hskkSubmittedAt;
    return {
      skill, label: skill === "SPEAKING" && hskkExam ? "Nói (HSKK)" : skillNames[skill],
      count: rows.length, max, earned, awaitingHskk,
      rate: max > 0 ? earned / max : 0,
      correct: rows.filter(question => hasAnswer(answers[question.id]) && question.result?.correct === true).length,
      pending: rows.some(question => question.result?.earned == null),
    };
  });

  const total = questions.length;
  const blank = questions.filter(question => !hasAnswer(answers[question.id])).length;
  const correct = skills.reduce((sum, skill) => sum + skill.correct, 0);
  const pending = questions.filter(question => hasAnswer(answers[question.id]) && question.result?.earned == null).length;
  const distribution = [
    { label: "Đúng", count: correct, color: "#326a4b" },
    { label: "Sai hoặc chưa đủ điểm", count: total - blank - correct - pending, color: "#b0b9ad" },
    { label: "Bỏ trống", count: blank, color: "#dec887" },
    { label: "Chờ chấm", count: pending, color: "#8199ad" },
  ].filter(item => item.count > 0 || item.label !== "Chờ chấm");
  let offset = 0;
  const stops = distribution.map(item => {
    const from = offset;
    offset += total ? item.count / total * 100 : 0;
    return item.color + " " + from + "% " + offset + "%";
  });
  const rate = maxScore > 0 && score !== null ? score / maxScore : null;
  const elapsed = submittedAt ? Math.floor((Date.parse(submittedAt) - Date.parse(startedAt)) / 1000) : null;
  const status = attempt.classificationLabel || (attempt.result === "PASS" ? "Đạt mục tiêu" : resultNames[attempt.result]);

  async function retake() {
    if (!onRetake || retrying) return;
    setRetrying(true);
    setRetryError("");
    try {
      await onRetake();
    } catch (err) {
      setRetryError((err as Error).message);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <main className={s.page}>
      <div className={s.content}>
        <nav aria-label="Điều hướng kết quả" className={s.breadcrumb}>
          <button onClick={onBack}><BrandMark size={30} /> Phòng thi</button>
          {onHistory && <button onClick={onHistory}>Lịch sử thi</button>}
          <span aria-current="page">Kết quả thi</span>
        </nav>

        <header className={s.heading}>
          <span lang="zh">考试成绩</span>
          <h1>Kết quả thi HSK</h1>
        </header>

        {(error || retryError) && <p role="alert" className={s.error}>{retryError || error}</p>}
        <div className={s.grid}>
          <section className={s.paper} aria-label="Thông tin đề thi">
            <strong className={s.level}>{levelLabel(attempt.level)}</strong>
            <h2>{attempt.title}</h2>
            <dl className={s.metadata}>
              <div><CalendarDays /><dt>Ngày thi</dt><dd>{dateText(startedAt)}</dd></div>
              {elapsed !== null && <div><Clock3 /><dt>Thời gian làm bài</dt><dd>{timeText(elapsed)} <small>(phút:giây)</small></dd></div>}
              <div><FileText /><dt>Loại đề</dt><dd>{attempt.source === "CUSTOM" ? "Đề cá nhân" : "Đề chính thức"}</dd></div>
            </dl>
          </section>

          <section className={s.score}>
            <div className={s.scoreTop}>
              <Trophy className={s.trophy} aria-hidden="true" />
              <div>
                <h2>Kết quả chung</h2>
                <div className={s.points}>{score === null ? "—" : number.format(score)} <small>/ {number.format(maxScore)}</small></div>
              </div>
              {status && <span className={s.status}>{status}</span>}
            </div>
            {rate !== null && <div className={s.progress}>
              <meter aria-label="Tỷ lệ điểm" min={0} max={1} value={rate} />
              <strong>{percent.format(rate)}</strong>
            </div>}
            {hskkScore && <p className={s.note}>HSK {number.format(attempt.score ?? 0)} / {number.format(attempt.maxScore)} điểm · HSKK {number.format(hskkScore.earned)} / {number.format(hskkScore.max)} điểm</p>}
            {attempt.passScore !== null && <p className={s.target}><Target size={20} /> Mục tiêu HSK ≥ {number.format(attempt.passScore)} điểm</p>}
            {attempt.status === "NEEDS_GRADING" && <p className={s.note}>Điểm tạm tính, còn câu chờ chấm.</p>}
          </section>

          <section className={s.chart}>
            <h2>Tỷ lệ điểm theo kỹ năng</h2>
            {(() => {
              const point = (index: number, scale: number) => {
                const angle = index * 2 * Math.PI / skills.length - Math.PI / 2;
                return [140 + Math.cos(angle) * 66 * scale, 95 + Math.sin(angle) * 66 * scale] as const;
              };
              const polygon = (scale: (index: number) => number) => skills.map((_, index) => point(index, scale(index)).join(",")).join(" ");
              return <svg viewBox="0 0 280 190" aria-hidden="true">
                {[0.25, 0.5, 0.75, 1].map(scale => <polygon key={scale} points={polygon(() => scale)} fill="none" stroke="#b9cbb9" />)}
                {skills.map(({ skill }, index) => {
                  const [x, y] = point(index, 1);
                  return <line key={skill} x1={140} y1={95} x2={x} y2={y} stroke="#b9cbb9" />;
                })}
                <polygon points={polygon(index => skills[index].rate)} fill="#77ae83" fillOpacity=".55" stroke="#326a4b" strokeWidth="2" />
                {skills.map(({ skill, label, rate, max }, index) => {
                  const [x, y] = point(index, 1.27);
                  return <text key={skill} x={x} y={y} textAnchor="middle" fill="currentColor" fontSize="12">
                    {label}<tspan x={x} dy={14} fontWeight="700">{max > 0 ? percent.format(rate) : "—"}</tspan>
                  </text>;
                })}
              </svg>;
            })()}
          </section>

          <section className={s.detail}>
            <h2><BarChart3 size={22} /> Điểm chi tiết theo kỹ năng</h2>
            <div className={s.tableWrap}>
              <table>
                <thead><tr><th>Kỹ năng</th><th>Số câu</th><th>Đúng</th><th>Điểm</th><th>Tỷ lệ</th></tr></thead>
                <tbody>{skills.map(skill => <tr key={skill.skill}>
                  <th scope="row">{skill.label} <span lang="zh">({skillChinese[skill.skill]})</span></th>
                  <td>{skill.count}</td><td>{skill.correct}</td>
                  <td>{skill.count ? <>{number.format(skill.earned)} / {number.format(skill.max)}{skill.pending && <small> (tạm tính)</small>}</> : skill.awaitingHskk ? "Chưa thi" : "—"}</td>
                  <td>{skill.max > 0 ? percent.format(skill.rate) : "—"}</td>
                </tr>)}</tbody>
                <tfoot><tr><th scope="row">Tổng cộng</th><td>{total}</td><td>{correct}</td>
                  <td>{score === null ? "—" : number.format(score)} / {number.format(maxScore)}</td><td>{rate === null ? "—" : percent.format(rate)}</td></tr></tfoot>
              </table>
            </div>
          </section>

          <section className={s.analysis}>
            <h2>Phân tích nhanh</h2>
            <div className={s.distribution}>
              <div className={s.donut} aria-hidden="true" style={{ background: total > 0 ? "conic-gradient(" + stops.join(",") + ")" : undefined }}>
                <div><strong>{total}</strong><span>câu</span></div>
              </div>
              <ul>{distribution.map(item => <li key={item.label}>
                <i style={{ backgroundColor: item.color }} />
                <span>{item.label} <strong>{item.count}</strong> ({percent.format(total ? item.count / total : 0)})</span>
              </li>)}</ul>
            </div>
          </section>
        </div>

        <div className={s.actions}>
          <button className={s.primary} onClick={onReview}>Xem phân tích chi tiết <ArrowRight size={17} /></button>
          {hskkExam && onSpeaking && <button className={s.primary} onClick={onSpeaking}><Mic size={17} /> {hskkSubmittedAt ? "Xem bài làm HSKK" : "Mở phần thi HSKK"}</button>}
          {onRetake && <button disabled={retrying} onClick={() => void retake()}><RotateCcw size={16} /> {retrying ? "Đang mở đề…" : "Làm lại đề này"}</button>}
          <button onClick={onBack}><FileText size={16} /> Chọn đề khác</button>
          {onHistory && <button onClick={onHistory}><History size={16} /> Xem lịch sử thi</button>}
        </div>
      </div>
    </main>
  );
}
