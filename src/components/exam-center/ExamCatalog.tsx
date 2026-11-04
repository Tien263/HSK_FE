"use client";

import { useState } from "react";
import { ArrowRight, ChartNoAxesColumnIncreasing, CheckCircle2, Clock, FileCheck2, Headphones, Home, Layers, Settings2, Sparkles, Target, Trophy } from "lucide-react";
import type { dashboard, reviewData } from "@/lib/exam-center-service";
import { levelGroup, levelLabel } from "@/lib/exam-center-core";
import { dateText, resultNames, skillNames, typeNames } from "./exam-client";
import ExamRulesLobby from "./ExamRulesLobby";
import s from "./ExamCenter.module.css";

type Dashboard = Awaited<ReturnType<typeof dashboard>>;
type Review = Awaited<ReturnType<typeof reviewData>>;
type Paper = Dashboard["papers"][number];
type History = (Dashboard["attempts"][number] | Dashboard["legacy"][number])[];
type Navigate = (view: string, options?: Record<string, string | number>) => void;

export default function ExamCatalog({ data, review, level, search, source, go, levelSelect }: {
  data: Dashboard; review: Review | null; level: number; search: string; source: string;
  go: Navigate; levelSelect: React.ReactNode;
}) {
  const [filter, setFilter] = useState(source === "CUSTOM" ? "custom" : "all");
  const [sort, setSort] = useState("newest");
  const [skill, setSkill] = useState("all");
  const blueprint = data.blueprints.find(row => row.level === level);
  const stats = data.statistics.find(row => row.level === level)!;
  const own = [...data.attempts, ...data.legacy];
  const prior = (id: string) => own.filter(row => row.paperId === id).sort((a, b) => Date.parse(b.submittedAt || b.startedAt) - Date.parse(a.submittedAt || a.startedAt));
  const running = (id: string) => data.attempts.find(row => row.paperId === id && row.status === "IN_PROGRESS");
  const done = (id: string) => prior(id).find(row => row.status !== "IN_PROGRESS");
  const best = (id: string) => Math.max(-1, ...prior(id).filter(row => row.status === "GRADED" && row.score !== null && row.maxScore > 0).map(row => Number(row.score) / row.maxScore));
  const inLevel = data.papers.filter(paper => !level || levelGroup(paper.level) === level);
  const ordinals = new Map<string, number>();
  for (const kind of ["OFFICIAL", "CUSTOM"]) {
    const levels = [...new Set(inLevel.map(paper => levelGroup(paper.level)))];
    for (const group of levels) inLevel.filter(paper => paper.source === kind && levelGroup(paper.level) === group)
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "") || a.id.localeCompare(b.id))
      .forEach((paper, i) => ordinals.set(paper.id, i + 1));
  }
  const papers = inLevel.filter(paper => paper.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (skill === "all" || paper.skills.includes(skill as typeof paper.skills[number])))
    .filter(paper => filter === "all" || filter === "official" && paper.source === "OFFICIAL" || filter === "custom" && paper.source === "CUSTOM" || filter === "new" && !prior(paper.id).length || filter === "active" && !!running(paper.id) || filter === "done" && !!done(paper.id) && !running(paper.id))
    .sort((a, b) => (sort === "score" ? best(b.id) - best(a.id) : sort === "unseen" ? Number(!!prior(a.id).length) - Number(!!prior(b.id).length) : 0) ||
      (sort === "oldest" ? (a.createdAt || "").localeCompare(b.createdAt || "") : (b.createdAt || "").localeCompare(a.createdAt || "")) || a.id.localeCompare(b.id));
  const recommendation = data.recommendations.find(row => row.level === level)?.recommendation;
  const next = data.papers.find(paper => paper.id === recommendation?.paperId);
  const levelWrong = review?.wrong.filter(row => !level || levelGroup(row.level) === level) || [];
  const history: History = own.filter(row => row.status !== "IN_PROGRESS" && (!level || levelGroup(row.level) === level));
  const openResult = (id: string) => id.startsWith("legacy:") ? go("history", { level }) : go("attempt", { id, level });

  return <>
    <div className={s.breadcrumb}><button onClick={() => go("home")}><Home size={15} /> Phòng luyện thi</button><span>›</span><strong>{level ? levelLabel(level) : "Tất cả cấp độ"}</strong></div>
    <section className={s.catalogHero} aria-label="Thông tin cấp thi">
      <div><h1>{level ? `${levelLabel(level)} · Danh sách đề thi` : "Danh sách đề thi"}</h1><p lang="zh-CN">模拟试卷 · 循序渐进</p><p>Chọn đề phù hợp để luyện tập, tiếp tục bài đang làm và theo dõi kết quả theo cấp độ.</p></div>
      <div className={s.blueprintCard}><div className={s.sectionHeading}><h2>{level ? levelLabel(level) : "Cấp độ thi"}</h2>{levelSelect}</div>
        <div className={s.blueprintFacts}><span><FileCheck2 />{inLevel.filter(p => p.source === "OFFICIAL").length} đề thi</span><span><Clock />{blueprint ? `${blueprint.durationMin} phút` : "Theo từng đề"}</span><span><Layers />{blueprint ? `${blueprint.questionCount} câu` : "Theo từng đề"}</span><span><Trophy />{blueprint?.maxScore ? `${blueprint.maxScore} điểm` : blueprint ? "Phân loại trình độ" : "Theo từng đề"}</span></div>
        {blueprint && <><p><Headphones size={16} />{blueprint.skills.length} kỹ năng: {blueprint.skills.map(key => skillNames[key]).join(" · ")}</p><p><Target size={17} />{blueprint.resultMode === "CLASSIFICATION" ? "HSK 7–9: phân loại theo quy tắc riêng" : `Mốc mục tiêu: ≥ ${blueprint.targetScore} / ${blueprint.maxScore}`}</p></>}
      </div>
    </section>
    <div className={s.catalogToolbar}><div className={s.catalogTabs} aria-label="Bộ lọc đề thi">{[{ id: "all", text: "Tất cả" }, { id: "new", text: "Chưa thi" }, { id: "active", text: "Đang làm" }, { id: "done", text: "Hoàn thành" }, { id: "official", text: "Đề mô phỏng" }, { id: "custom", text: "Đề tùy chỉnh" }].map(item => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.text}</button>)}</div>
      <div className={s.catalogSort}><select aria-label="Sắp xếp đề thi" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="score">Điểm cao</option><option value="unseen">Chưa làm trước</option></select><select aria-label="Lọc kỹ năng" value={skill} onChange={e => setSkill(e.target.value)}><option value="all">Tất cả kỹ năng</option>{Object.entries(skillNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></div>
    </div>
    <div className={s.catalogColumns}><section className={s.examList} aria-label="Danh sách đề thi">
      <div className={s.listCaption}><span>{papers.length} đề phù hợp</span><button className={s.textButton} onClick={() => go("create", { level: level || 1 })}><Settings2 size={15} /> Tự tạo đề</button></div>
      {papers.map(paper => {
        const active = running(paper.id), finished = done(paper.id);
        return <article key={paper.id} className={s.examRow} data-paper-id={paper.id}>
          <div className={s.examIdentity}><div className={s.examIcon}><FileCheck2 size={28} /></div><div><small>{paper.source === "CUSTOM" ? "ĐỀ TÙY CHỈNH" : "MÔ PHỎNG CHUẨN"} · {levelLabel(paper.level)} · Đề {String(ordinals.get(paper.id)).padStart(2, "0")}</small><h2>{paper.title}</h2><div className={s.paperMeta}><span><Layers size={14} />{paper.questionsCount} câu</span><span><Clock size={14} />{paper.durationMin ? `${paper.durationMin} phút` : "Chưa đặt thời gian"}</span><span><Trophy size={14} />{paper.maxScore} điểm</span></div></div></div>
          <div className={s.examState}>{active ? <><strong><Clock size={16} />Đang làm</strong><small>Đã làm {active.answered}/{active.questionsCount} câu</small><div className={s.inlineProgress}><progress max={100} value={active.progress} /><span>{active.progress}%</span></div></> : finished ? <><strong><CheckCircle2 size={17} />{finished.status === "GRADED" ? "Hoàn thành" : "Đã nộp · Chờ chấm"}</strong><div className={s.rowScore}>{finished.score !== null && <span>{finished.score}<small> / {finished.maxScore}</small></span>}<span className={s.status} data-result={finished.result}>{("classificationLabel" in finished && finished.classificationLabel) || resultNames[finished.result]}</span></div></> : <span className={s.notStarted}>○ Chưa làm</span>}</div>
          <div className={s.examActions}>{!finished || active ? <><button className={s.textButton} onClick={() => go("intro", { id: paper.id, level })}>Xem chi tiết <ArrowRight size={14} /></button><button className={s.primary} disabled={!active && !paper.available} onClick={() => active ? go("attempt", { id: active.id, level }) : go("intro", { id: paper.id, level })}>{active ? "Tiếp tục" : paper.source === "CUSTOM" ? "Làm ngay" : "Bắt đầu thi"}<ArrowRight size={16} /></button></> : <><button className={s.secondary} onClick={() => openResult(finished.id)}>Xem kết quả <ArrowRight size={15} /></button><button className={s.textButton} onClick={() => go("intro", { id: paper.id, level })}>Xem đề / Thi lại</button></>}</div>
          {!paper.available && !active && <p className={s.rowWarning}>Đề cần Admin hoàn tất dữ liệu câu hỏi trước khi mở thi.</p>}
        </article>;
      })}
      {!papers.length && <div className={s.empty}>Chưa có đề phù hợp với bộ lọc. Đề sẽ xuất hiện khi Admin xuất bản hoặc bạn tạo đề cá nhân.</div>}
    </section><aside className={s.catalogAside}>
      <section className={`${s.panel} ${s.sidePanel}`} aria-label="Tiến độ cá nhân"><h2><Settings2 size={20} />Tiến độ cá nhân <small>学习进度</small></h2><div className={s.personalStats}><div className={s.ring} style={{ background: `conic-gradient(#70964f ${stats.completionPercent}%,#e5eadf 0)` }}><div><strong>{stats.total ? `${stats.completionPercent}%` : "—"}</strong><small>Hoàn thành</small></div></div><div className={s.personalNumbers}><p>Điểm trung bình</p>{stats.averages.length ? stats.averages.map(row => <div key={`${row.level}:${row.maxScore}`}><strong>{row.average}<small> / {row.maxScore}</small></strong><small>HSK {row.level} · {row.count} lượt</small></div>) : <small>Chưa có bài đã chấm</small>}<p>Đã hoàn thành</p><strong>{stats.done}<small> / {stats.total} đề</small></strong></div></div><button className={s.textButton} onClick={() => go("stats", { level })}>Thống kê chi tiết <ArrowRight size={15} /></button></section>
      <section className={`${s.panel} ${s.sidePanel}`}><h2><Sparkles size={20} />Gợi ý đề tiếp theo</h2>{next && recommendation ? <><h3>{next.title}</h3><p>{recommendation.reason}</p>{!!recommendation.weakSkills.length && <p>Ưu tiên: {recommendation.weakSkills.map(key => skillNames[key]).join(" · ")}</p>}<button className={s.primary} onClick={() => go("intro", { id: next.id, level })}>Làm ngay <ArrowRight size={16} /></button></> : <p>Chưa có đề mới phù hợp. Bạn có thể tiếp tục bài đang làm hoặc xem lại kết quả.</p>}</section>
      <section className={`${s.panel} ${s.sidePanel}`}><h2><Target size={20} />Ôn tập trước khi thi</h2><div className={s.skills}>{stats.skills.filter(row => row.count > 0).map(row => <div key={row.skill}><span>{skillNames[row.skill]}</span><progress max={100} value={row.percent || 0} /><small>{row.percent}%</small></div>)}</div><div className={s.reviewLinks}>{[{ tab: "all", text: "Câu sai", count: levelWrong.length }, { tab: "grammar", text: "Ngữ pháp", count: review?.grammar.filter(row => !level || levelGroup(row.level) === level).length || 0 }, { tab: "vocabulary", text: "Từ vựng", count: review?.vocabulary.filter(row => !level || levelGroup(row.level) === level).length || 0 }].map(item => <button key={item.tab} className={s.secondary} onClick={() => go("review", { level, tab: item.tab })}>{item.text}<strong>{item.count}</strong></button>)}</div><small className={s.hint}>Các mục cần ôn trong cấp đang chọn.</small></section>
    </aside></div>
    <span className={s.srOnly}>{history.length} lượt đã nộp ở cấp đang chọn.</span>
  </>;
}

export function ExamIntroduction({
  paper,
  onStart,
  onBack,
  busy,
  blueprint,
  activeAttempt,
  onContinueAttempt,
}: {
  paper: Paper;
  onStart: () => void;
  onBack: () => void;
  busy: boolean;
  blueprint?: Dashboard["blueprints"][number];
  activeAttempt?: Dashboard["attempts"][number] | null;
  onContinueAttempt?: (attemptId: string) => void;
}) {
  return (
    <ExamRulesLobby
      paper={paper}
      blueprint={blueprint}
      activeAttempt={activeAttempt}
      onStart={onStart}
      onContinueAttempt={onContinueAttempt}
      onBack={onBack}
      busy={busy}
    />
  );
}

export function ScoreTrend({ history }: { history: History }) {
  const groups = new Map<string, History>();
  for (const row of history.filter(row => row.status === "GRADED" && row.score !== null && Number.isFinite(row.score) && row.score >= 0 && row.score <= row.maxScore && row.maxScore > 0).sort((a, b) => Date.parse(a.submittedAt || a.startedAt) - Date.parse(b.submittedAt || b.startedAt))) {
    const key = `HSK ${row.level} · Thang ${row.maxScore}`; groups.set(key, [...(groups.get(key) || []), row]);
  }
  return <section className={s.panel} aria-label="Biểu đồ thay đổi điểm"><h2><ChartNoAxesColumnIncreasing size={21} />Điểm qua từng lần thi</h2><p>Mỗi biểu đồ giữ riêng cấp HSK và thang điểm. Bài chờ chấm chưa được đưa vào biểu đồ.</p>{[...groups].map(([key, rows]) => {
    const point = (i: number) => ({ x: rows.length === 1 ? 320 : 48 + i * 544 / (rows.length - 1), y: 190 - Number(rows[i].score) / rows[i].maxScore * 150 });
    return <div key={key} className={s.trend}><h3>{key}</h3><svg viewBox="0 0 640 230" role="img" aria-label={`Điểm thi ${key}`}><line x1="48" y1="40" x2="48" y2="190" stroke="#cbd4c1" /><line x1="48" y1="190" x2="592" y2="190" stroke="#cbd4c1" /><line x1="48" y1="115" x2="592" y2="115" stroke="#e6eadf" strokeDasharray="4" /><text x="38" y="44" textAnchor="end">{rows[0].maxScore}</text><text x="38" y="194" textAnchor="end">0</text><polyline fill="none" stroke="#6d8f4f" strokeWidth="3" points={rows.map((_, i) => `${point(i).x},${point(i).y}`).join(" ")} />{rows.map((row, i) => <g key={row.id}><circle cx={point(i).x} cy={point(i).y} r="5" fill="#4c743d"><title>{row.title}: {row.score}/{row.maxScore} · {dateText(row.submittedAt || row.startedAt)}</title></circle>{(rows.length <= 12 || i === 0 || i === rows.length - 1) && <><text x={point(i).x} y={point(i).y - 12} textAnchor="middle">{row.score}</text><text x={point(i).x} y="216" textAnchor="middle">Lượt {i + 1}</text></>}</g>)}</svg><details><summary>Xem số liệu từng lượt</summary><ol>{rows.map(row => <li key={row.id}>{dateText(row.submittedAt || row.startedAt)} · {row.title}: {row.score}/{row.maxScore}</li>)}</ol></details></div>;
  })}{!groups.size && <p className={s.empty}>Chưa có lượt thi đã chấm để vẽ biểu đồ.</p>}</section>;
}
