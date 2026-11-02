"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, Clock3, Compass, Dumbbell, Layers, LockKeyhole, PenTool, RefreshCw } from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import styles from "./SelfStudyRoadmapPage.module.css";

type Progress = { level: number; numbers: number[] | null; source: "server" | "cached" | "unavailable" };
type Level = { level: number; count: number | null };
type Props = {
  level: number; maxLevel: number; lessons: Hsk1FullLesson[]; loading: boolean; error: string;
  selectedLesson: number; studentId?: string;
  onLevelChange: (level: number) => void; onOpenLesson: (number: number) => void;
  onPractice: (number: number) => void; onNotes: (number: number) => void;
  onProgressLoaded: (numbers: number[]) => void; onCatalog: () => void;
};
const isNumbers = (value: unknown): value is number[] => Array.isArray(value) && value.every(n => Number.isInteger(n) && n > 0);

export default function SelfStudyRoadmapPage({ level, maxLevel, lessons, loading, error, selectedLesson, studentId, onLevelChange, onOpenLesson, onPractice, onNotes, onProgressLoaded, onCatalog }: Props) {
  const [catalog, setCatalog] = useState<{ levels: Level[]; loading: boolean; error: boolean }>({ levels: [], loading: true, error: false });
  const [progress, setProgress] = useState<Progress | null>(null);
  const [retry, setRetry] = useState(0), [filter, setFilter] = useState("all");
  const storageKey = `hsk_self_unlocked_lvl_${level}_${studentId || "guest"}`;

  useEffect(() => {
    const controller = new AbortController();
    let requestId = 0;
    function loadCatalog() {
      const currentRequest = ++requestId;
      void fetch("/api/v1/curriculum", { cache: "no-store", signal: controller.signal }).then(async res => {
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.levels)) throw new Error();
      const levels = data.levels.filter((item: { level: number; items?: unknown[]; isDeleted?: boolean }) => Number.isInteger(item.level) && !item.isDeleted && Array.isArray(item.items) && item.items.length > 0).map((item: { level: number; items: unknown[] }) => ({ level: item.level, count: item.items.length })).sort((a: Level, b: Level) => a.level - b.level);
        if (!controller.signal.aborted && currentRequest === requestId) setCatalog({ levels, loading: false, error: false });
      }).catch(() => { if (!controller.signal.aborted && currentRequest === requestId) setCatalog({ levels: [], loading: false, error: true }); });
    }
    const refresh = () => { if (document.visibilityState === "visible") loadCatalog(); };
    loadCatalog(); window.addEventListener("focus", refresh); window.addEventListener("curriculum-updated", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); window.removeEventListener("curriculum-updated", refresh); };
  }, [retry]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let requestId = 0;
    async function loadProgress() {
      const currentRequest = ++requestId;
      try {
        const res = await fetch(`/api/v1/my/self-study/progress?level=${level}`, { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!res.ok || !data.success || !isNumbers(data.unlockedLessons)) throw new Error();
        if (!active || currentRequest !== requestId) return;
        const numbers = [...new Set<number>(data.unlockedLessons)];
        try { localStorage.setItem(storageKey, JSON.stringify(numbers)); } catch { /* The server snapshot remains usable when caching is unavailable. */ }
        setProgress({ level, numbers, source: "server" }); onProgressLoaded(numbers);
      } catch {
        if (!active || controller.signal.aborted || currentRequest !== requestId) return;
        let cached: number[] | null = null;
        try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "null"); if (isNumbers(value)) cached = [...new Set(value)]; } catch { /* No usable cached progress. */ }
        setProgress({ level, numbers: cached, source: cached ? "cached" : "unavailable" });
        onProgressLoaded(cached || []);
      }
    }
    const refresh = () => { if (document.visibilityState === "visible") void loadProgress(); };
    void loadProgress(); window.addEventListener("focus", refresh);
    return () => { active = false; controller.abort(); window.removeEventListener("focus", refresh); };
  }, [level, storageKey, retry, onProgressLoaded]);

  const activeProgress = progress?.level === level ? progress : null;
  const progressKnown = !!activeProgress && activeProgress.numbers !== null;
  const unlocked = useMemo(() => new Set(activeProgress?.numbers || []), [activeProgress]);
  const ordered = useMemo(() => [...lessons].sort((a, b) => a.number - b.number), [lessons]);
  const openLessons = ordered.filter(lesson => unlocked.has(lesson.number));
  const current = ordered.find(lesson => lesson.number === selectedLesson) || openLessons[0] || ordered[0];
  const canStudy = !!current && progressKnown && unlocked.has(current.number);
  const totals = ordered.reduce((acc, lesson) => ({ vocab: acc.vocab + lesson.vocabList.length, grammar: acc.grammar + lesson.grammarList.length }), { vocab: 0, grammar: 0 });
  const filtered = ordered.filter(lesson => filter === "all" || (filter === "open" ? unlocked.has(lesson.number) : !unlocked.has(lesson.number)));
  const visibleLevels = catalog.levels.some(item => item.level === level) ? catalog.levels : [...catalog.levels, { level, count: loading || error ? null : lessons.length }].sort((a, b) => a.level - b.level);

  return <div className={styles.page} data-roadmap-page="true">
    <nav className={styles.levels} aria-label="Cấp HSK trong giáo trình"><span><Layers size={15}/>Giáo trình của bạn</span><div>{visibleLevels.map(item => <button key={item.level} aria-pressed={item.level === level} aria-label={`Xem lộ trình HSK ${item.level}`} onClick={() => onLevelChange(item.level)}>HSK {item.level}{item.level > maxLevel && <LockKeyhole size={12}/>}<small>{catalog.loading || (item.level === level && loading) ? "…" : item.count === null ? "Chưa tải" : `${item.level === level && !error ? ordered.length : item.count} bài`}</small></button>)}</div></nav>
    {catalog.error && <p className={styles.connection} role="status">Chưa tải được danh sách cấp HSK. <button onClick={() => setRetry(n => n + 1)}>Thử lại</button></p>}
    {loading ? <div className={styles.empty} role="status"><BookOpen size={26}/><h2>Đang mở lộ trình HSK {level}…</h2></div> : error ? <div className={styles.empty} role="alert"><h2>Chưa tải được giáo trình</h2><p>{error}</p><button className={styles.secondary} onClick={() => window.dispatchEvent(new Event("curriculum-updated"))}>Thử tải lại</button></div> : !ordered.length ? <div className={styles.empty}><BookOpen size={28}/><h2>HSK {level} chưa có bài học</h2><p>Lộ trình sẽ hiển thị khi giáo trình có nội dung.</p></div> : <>
      {activeProgress?.source === "cached" && <p className={styles.connection} role="status">Đang hiển thị tiến trình đã lưu trên trình duyệt. <button onClick={() => setRetry(n => n + 1)}>Đồng bộ lại</button></p>}
      {activeProgress?.source === "unavailable" && <p className={styles.connection} role="status">Chưa có dữ liệu tiến trình để xác định bài đã mở. <button onClick={() => setRetry(n => n + 1)}>Thử tải lại</button></p>}
      <div className={styles.overview}>
        <section className={styles.resume} aria-label="Điểm dừng trên lộ trình"><div className={styles.seal} aria-hidden="true">行<br/>程</div><div><p className={styles.eyebrow}>ĐIỂM DỪNG HIỆN TẠI · HSK {level}</p><h2>{current.titleVi || current.titleZh}</h2><p className={styles.chinese} lang="zh-CN">Bài {current.number} · {current.titleZh}</p><p className={styles.pinyin}>{current.pinyin}</p><p className={styles.description}>{current.desc}</p><div className={styles.actions}><button className={styles.primary} disabled={!canStudy} onClick={() => onOpenLesson(current.number)}><BookOpen size={16}/>Tiếp tục học bài {current.number}</button><button className={styles.secondary} disabled={!canStudy} onClick={() => onPractice(current.number)}><Dumbbell size={16}/>Luyện bài này</button><button className={styles.secondary} disabled={!canStudy} onClick={() => onNotes(current.number)}><PenTool size={16}/>Ghi chép</button></div>{!canStudy && <p className={styles.hint}>{progressKnown ? "Bài đang chọn chưa mở. Chọn một bài đã mở trong hành trình bên dưới." : "Các thao tác học sẽ sẵn sàng khi tải được tiến trình."}</p>}</div></section>
        <section className={styles.summary} aria-label="Tiến trình mở bài"><div className={styles.summaryTitle}><Compass size={20}/><h2>Lộ trình HSK {level}</h2></div><div className={styles.fraction}><strong>{progressKnown ? openLessons.length : "—"}</strong><span>/ {ordered.length} bài đã mở</span></div>{progressKnown ? <progress value={openLessons.length} max={ordered.length} aria-label="Số bài đã mở trong giáo trình"/> : <p className={styles.hint}>{activeProgress ? "Chưa có tiến trình" : "Đang tải tiến trình…"}</p>}<div className={styles.contentTotals}><span><strong>{totals.vocab}</strong>Từ vựng trong giáo trình</span><span><strong>{totals.grammar}</strong>Điểm ngữ pháp</span></div><p className={styles.summaryNote}>Trạng thái mở bài được lấy từ tiến trình học. Số bài đã mở chưa thể hiện số bài đã hoàn thành.</p></section>
      </div>
      <section className={styles.journey} aria-label="Hành trình theo bài học"><header className={styles.journeyHeader}><div><p className={styles.eyebrow}>THEO TỪNG TRANG GIÁO TRÌNH</p><h2>Hành trình HSK {level}</h2><p>{ordered.length} bài học · Sắp xếp theo thứ tự trong kho giáo trình</p></div><div className={styles.filters} aria-label="Lọc trạng thái lộ trình">{[{ id: "all", label: "Tất cả" }, { id: "open", label: "Đã mở" }, { id: "locked", label: "Chưa mở" }].map(item => <button key={item.id} disabled={!progressKnown && item.id !== "all"} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></header>
        <ol className={styles.timeline}>{filtered.map(lesson => { const open = progressKnown && unlocked.has(lesson.number), selected = current.number === lesson.number; return <li key={`${level}-${lesson.number}`} data-selected={selected} data-open={open}>
          <span className={styles.station} aria-hidden="true">{progressKnown && !open ? <LockKeyhole size={16}/> : lesson.number}</span>
          <details className={styles.lesson} open={selected || undefined}><summary aria-label={`Chi tiết bài ${lesson.number}`}><div className={styles.lessonTitle}><small>BÀI {lesson.number}</small><h3>{lesson.titleVi || lesson.titleZh}</h3><p lang="zh-CN">{lesson.titleZh}</p></div><span className={styles.state}>{!progressKnown ? "Chưa có tiến trình" : selected && open ? "Đang chọn · Đã mở" : open ? "Đã mở" : "Chưa mở"}</span><ChevronDown size={17}/></summary><div className={styles.lessonBody}><p>{lesson.desc}</p><div className={styles.lessonMeta}><span><BookOpen size={14}/>{lesson.vocabList.length} từ vựng</span><span>{lesson.grammarList.length} ngữ pháp</span>{Number.isFinite(lesson.durationMin) && lesson.durationMin > 0 && <span><Clock3 size={14}/>{lesson.durationMin} phút dự kiến</span>}</div>{open ? <div className={styles.rowActions}><button onClick={() => onOpenLesson(lesson.number)}>Học bài {lesson.number}<ArrowRight size={15}/></button><button onClick={() => onPractice(lesson.number)}>Luyện bài này</button><button onClick={() => onNotes(lesson.number)}>Ghi chép</button></div> : <p className={styles.hint}>{progressKnown ? "Tiếp tục các bài đã mở để đi tiếp lộ trình." : "Tải tiến trình để xem trạng thái của bài này."}</p>}</div></details>
        </li>; })}</ol>
        {!filtered.length && <p className={styles.noResults}>Không có bài thuộc trạng thái này trong HSK {level}.</p>}
      </section>
      <footer className={styles.footer}><p><RefreshCw size={14}/>Danh sách và nội dung bài học được lấy từ kho giáo trình hiện tại.</p><button onClick={onCatalog}>Mở kho bài học<ArrowRight size={15}/></button></footer>
    </>}
  </div>;
}
