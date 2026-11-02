"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, CalendarDays, Check, Flame, Headphones, MessageCircle, Moon, PenTool, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import LessonCover from "./LessonCover";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { getTodayStudyMinutes } from "@/lib/memory-review-service";
import styles from "./SelfStudyWorkspace.module.css";

type Task = { id: string; text: string; done: boolean };
type Props = {
  lesson: Hsk1FullLesson; level: number; totalLessons: number; openCount: number;
  studentId?: string; actions: ReactNode; canStudy: boolean;
  onRead: () => void; onVocab: () => void; onDialogue: () => void;
  onMistakes: () => void; onFocus: () => void; onWriting: () => void;
};

export default function InkStudyDashboard({ lesson, level, totalLessons, openCount, studentId, actions, canStudy, onRead, onVocab, onDialogue, onMistakes, onFocus, onWriting }: Props) {
  const [facts, setFacts] = useState<{ streak: number | null; due: number | null }>({ streak: null, due: null });
  const [minutes, setMinutes] = useState(0), [target, setTarget] = useState(30);
  const [tasks, setTasks] = useState<Task[]>([]), [draft, setDraft] = useState("");
  const [planReady, setPlanReady] = useState(false), [planError, setPlanError] = useState("");
  const storageKey = `hanyu-study-plan-${studentId || "guest"}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/my/summary", { cache: "no-store", signal: controller.signal }).then(res => res.json()).then(data => {
      if (data.success) setFacts({ streak: typeof data.data?.student?.streakDays === "number" ? data.data.student.streakDays : null, due: typeof data.data?.counts?.dueVocabs === "number" ? data.data.counts.dueVocabs : null });
    }).catch(() => {});
    return () => controller.abort();
  }, [studentId]);

  /* eslint-disable react-hooks/set-state-in-effect -- Read the existing local study timer and the student's personal checklist after hydration. */
  useEffect(() => {
    const refresh = () => setMinutes(getTodayStudyMinutes(studentId));
    refresh();
    try { const profile = JSON.parse(localStorage.getItem("hanyu_study_profile") || "null"); if ([15, 30, 60].includes(profile?.dailyTime)) setTarget(profile.dailyTime); } catch { /* Use the existing 30 minute default. */ }
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [studentId]);
  useEffect(() => {
    setPlanReady(false); setPlanError(""); setDraft("");
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(saved) || !saved.every(item => item && typeof item.id === "string" && typeof item.text === "string" && typeof item.done === "boolean")) throw new Error();
      setTasks(saved); setPlanReady(true);
    } catch { setTasks([]); setPlanError("Chưa đọc được kế hoạch đã lưu trên trình duyệt này."); }
  }, [storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function saveTasks(next: Task[]) {
    if (!planReady) return false;
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setTasks(next); setPlanError(""); return true; }
    catch { setPlanError("Chưa lưu được kế hoạch. Hãy kiểm tra bộ nhớ trình duyệt rồi thử lại."); return false; }
  }
  const accessPercent = totalLessons ? Math.round(openCount / totalLessons * 100) : 0;
  const dailyPercent = Math.min(100, Math.round(minutes / target * 100));
  const tools = [
    { label: "Ôn từ vựng", hint: "Thất Nhật Ôn Tập", Icon: BookOpen, action: onVocab },
    { label: "AI đối thoại", hint: "Luyện nói mỗi ngày", Icon: MessageCircle, action: onDialogue },
    { label: "Ôn câu sai", hint: "Giải Độc Ngữ Pháp", Icon: Headphones, action: onMistakes },
    { label: "Luyện viết", hint: "Từng nét chữ Hán", Icon: PenTool, action: onWriting },
    { label: "Tập trung", hint: "Một phiên yên tĩnh", Icon: Moon, action: onFocus },
  ];

  return <>
    <div className={styles.dashboardTop}>
      <section className={styles.resume} aria-label="Tiếp tục học">
        <div className={styles.resumeArt} aria-hidden="true"><LessonCover lessonNumber={lesson.number}/></div>
        <div className={styles.resumeBody}><p className={styles.eyebrow}>BÀI ĐANG HỌC · BÀI {String(lesson.number).padStart(2, "0")}</p><h2 lang="zh-CN">{lesson.titleZh}</h2><p className={styles.cardMeaning}>{lesson.titleVi}</p><p className={styles.lessonDescription}>{lesson.desc}</p><div className={styles.meta}><span><BookOpen size={13}/>{lesson.vocabList.length} từ vựng</span><span>{lesson.grammarList.length} ngữ pháp</span><span>{lesson.durationMin} phút dự kiến</span></div>{actions}{!canStudy && <p className={styles.hint}>Chọn một bài đã mở trong cuộn thư để bắt đầu.</p>}</div>
      </section>
      <section className={styles.progressPanel} aria-label="Tổng quan tự học">
        <div className={styles.panelHeading}><h2><TrendingUp size={19}/>Nhịp học của bạn</h2><span>HSK {level}</span></div>
        <div className={styles.studyMetrics}>
          <div><Flame size={21}/><strong>{facts.streak ?? "—"}</strong><span>Ngày liên tiếp</span></div>
          <div><Check size={21}/><strong>{openCount}<small>/{totalLessons}</small></strong><span>Bài đã mở</span></div>
          <div><BookOpen size={21}/><strong>{lesson.vocabList.length}</strong><span>Từ trong bài</span></div>
          <div><PenTool size={21}/><strong>{lesson.grammarList.length}</strong><span>Ngữ pháp trong bài</span></div>
        </div>
        <div className={styles.accessProgress}><span>Lộ trình đã mở <strong>{accessPercent}%</strong></span><progress value={openCount} max={Math.max(1, totalLessons)} aria-label="Tỷ lệ bài đã mở"/></div>
        <p className={styles.encouragement}><span aria-hidden="true">✦</span>{facts.due ? `Có ${facts.due} từ đến hạn ôn. Dành một chút thời gian củng cố trước khi học bài mới nhé.` : "Học chậm một chút, hiểu sâu một chút. Mỗi ngày một trang sách, hành trình sẽ dài thêm."}</p>
      </section>
    </div>

    <div className={styles.dashboardMiddle}>
      <section className={styles.toolsPanel} aria-label="Công cụ học tập"><h2><span aria-hidden="true">✦</span>Công cụ học tập</h2><div className={styles.studyTools}>{tools.map(({ label, hint, Icon, action }) => <button key={label} aria-label={label} onClick={action}><Icon size={24}/><strong>{label}</strong><small>{hint}</small></button>)}</div></section>
      <section className={styles.suggestions} aria-label="Gợi ý học hôm nay"><h2><Target size={19}/>Gợi ý hôm nay</h2><button disabled={!canStudy} onClick={onRead}><BookOpen size={15}/><span>Học Bài {String(lesson.number).padStart(2, "0")}<small>{lesson.titleVi}</small></span><ArrowRight size={14}/></button><button onClick={onVocab}><Check size={15}/><span>{facts.due ? `Ôn ${facts.due} từ đến hạn` : "Ôn từ vựng đã lưu"}</span><ArrowRight size={14}/></button><button onClick={onDialogue}><MessageCircle size={15}/><span>Luyện một đoạn hội thoại</span><ArrowRight size={14}/></button></section>
      <section className={styles.dailyGoal} aria-label="Mục tiêu học hôm nay"><h2><Target size={19}/>Mục tiêu hôm nay</h2><strong>{minutes}<small> / {target} phút</small></strong><progress value={dailyPercent} max={100} aria-label="Tiến độ thời gian học hôm nay"/><small className={styles.timeSource}>Thời gian luyện tập trên trình duyệt</small><p>{minutes >= target ? "Bạn đã đạt thời gian học hôm nay." : `Thêm ${Math.max(0, target - minutes)} phút để giữ nhịp học.`}</p><button onClick={onFocus}>Vào phòng tập trung <ArrowRight size={14}/></button></section>
      <section className={styles.planPanel} aria-label="Kế hoạch học tập cá nhân"><h2><CalendarDays size={19}/>Kế hoạch của tôi</h2><div className={styles.taskList}>{tasks.length ? tasks.map(task => <div key={task.id}><label><input type="checkbox" checked={task.done} onChange={() => saveTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}/><span className={task.done ? styles.taskDone : ""}>{task.text}</span></label><button aria-label={`Xóa kế hoạch ${task.text}`} onClick={() => saveTasks(tasks.filter(t => t.id !== task.id))}><Trash2 size={13}/></button></div>) : <p>Viết một mục tiêu nhỏ cho buổi học hôm nay.</p>}</div><form onSubmit={event => { event.preventDefault(); if (draft.trim() && tasks.length < 20) { const next = [...tasks, { id: crypto.randomUUID(), text: draft.trim(), done: false }]; if (saveTasks(next)) setDraft(""); } }}><input aria-label="Nội dung kế hoạch mới" placeholder="Thêm một kế hoạch…" maxLength={120} value={draft} disabled={!planReady || tasks.length >= 20} onChange={e => setDraft(e.target.value)}/><button type="submit" aria-label="Thêm kế hoạch" disabled={!planReady || !draft.trim() || tasks.length >= 20}><Plus size={17}/></button></form><small>Lưu trên trình duyệt này</small>{planError && <p className={styles.planError} role="status">{planError}</p>}</section>
    </div>
  </>;
}
