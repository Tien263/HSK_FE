"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Dumbbell, FileCheck2, Lock, Moon, PenTool, Search } from "lucide-react";
import { useCurriculumLessons } from "@/lib/use-curriculum";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import { useSelfStudySelection } from "@/lib/use-self-study-selection";
import type { RoadmapStage } from "@/lib/self-study-roadmap-constants";
import AncientScrollPathway from "./AncientScrollPathway";
import AncientSideDrawerNotes from "./AncientSideDrawerNotes";
import VirtualStudyRoomModal from "./VirtualStudyRoomModal";
import LessonStudyContent from "../learning/LessonStudyContent";
import styles from "./SelfStudyWorkspace.module.css";

export interface StudentSelfStudyWorkspaceProps {
  currentUser?: { id?: string; name?: string; currentHskLevel?: number };
  activeHskLevel?: number;
  onNavigateToTab?: (tab: string) => void;
  onOpenJoinModal?: () => void;
  view?: "roadmap" | "lessons";
  screen?: "catalog" | "reader";
  onScreenChange?: (screen: "catalog" | "reader") => void;
}
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

export default function StudentSelfStudyWorkspace({ currentUser, activeHskLevel = 1, onNavigateToTab, view = "roadmap", screen = "catalog", onScreenChange }: StudentSelfStudyWorkspaceProps) {
  const router = useRouter();
  const [maxLevel, setMaxLevel] = useState(currentUser?.currentHskLevel || activeHskLevel);
  const selection = useSelfStudySelection(currentUser?.id, maxLevel);
  const level = Math.min(selection.level, maxLevel);
  const [unlocked, setUnlocked] = useState<number[]>([1, 2]);
  const [stages, setStages] = useState<RoadmapStage[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const { lessons: apiLessons, loading, error } = useCurriculumLessons(level);
  const lessons = useMemo(() => apiLessons.length ? apiLessons : getLessonsByHskLevel(level), [apiLessons, level]);
  const current = lessons.find(lesson => lesson.number === selection.lessonNumber) || lessons[0];
  const canStudy = !!current && unlocked.includes(current.number);
  const reading = view === "lessons" && screen === "reader";
  const openCount = lessons.filter(lesson => unlocked.includes(lesson.number)).length;
  const results = lessons.filter(lesson => {
    const isOpen = unlocked.includes(lesson.number);
    return (filter === "all" || (filter === "open" ? isOpen : !isOpen)) && normalize(`${lesson.number} ${lesson.titleZh} ${lesson.titleVi} ${lesson.pinyin}`).includes(normalize(query.trim()));
  });

  /* eslint-disable react-hooks/set-state-in-effect -- Restore existing profile and unlock data from the browser after hydration. */
  useEffect(() => {
    try { const profile = JSON.parse(localStorage.getItem("hanyu_study_profile") || "null"); setMaxLevel(Math.max(Number(profile?.currentHskLevel || currentUser?.currentHskLevel || activeHskLevel) || 1, 1)); } catch { /* Keep the account level. */ }
  }, [currentUser?.currentHskLevel, activeHskLevel]);
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem(`hsk_self_unlocked_lvl_${level}_${currentUser?.id || "guest"}`) || "null"); setUnlocked(Array.isArray(stored) ? stored : [1, 2]); } catch { setUnlocked([1, 2]); }
  }, [level, currentUser?.id]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/self-study-roadmap", { signal: controller.signal }).then(res => res.json()).then(data => { if (data.success && Array.isArray(data.stages)) setStages(data.stages); }).catch(() => {});
    return () => controller.abort();
  }, []);

  function navigate(tab: string) { if (onNavigateToTab) onNavigateToTab(tab); else router.push(`/s/home?tab=${tab}`); }
  function rememberOpenLessons() {
    // Preserve the lessons already offered by the reader when handing off to practice.
    const key = `hsk_self_unlocked_lvl_${level}_${currentUser?.id || "guest"}`;
    try { if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(unlocked)); } catch { /* Keep the current in-memory permissions. */ }
  }
  function openLesson(number: number) {
    if (!unlocked.includes(number)) return;
    rememberOpenLessons();
    selection.select({ level, lessonNumber: number }); onScreenChange?.("reader"); navigate("lessons");
    topRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function changeLevel(next: number) {
    if (next > maxLevel) { setNotice(`HSK ${next} chưa mở. Hoàn thành cấp trước hoặc bài kiểm tra đầu vào để tiếp tục.`); return; }
    selection.select({ level: next, lessonNumber: 1 }); onScreenChange?.("catalog"); setQuery(""); setNotice("");
  }
  function practice() { if (!canStudy) return; rememberOpenLessons(); selection.select({ level, lessonNumber: current.number }); navigate("practice"); }
  function complete() {
    if (!current || !canStudy) return;
    const next = [...new Set([...unlocked, current.number + 1])];
    try { localStorage.setItem(`hsk_self_unlocked_lvl_${level}_${currentUser?.id || "guest"}`, JSON.stringify(next)); setUnlocked(next); setNotice(`Đã đánh dấu hoàn thành bài ${current.number}. Bạn có thể tiếp tục luyện tập hoặc chọn bài tiếp theo.`); }
    catch { setNotice("Chưa lưu được tiến trình trên trình duyệt. Vui lòng thử lại."); }
  }
  function openNotes() { if (canStudy) { selection.select({ level, lessonNumber: current.number }); setNotesOpen(true); } }
  const actions = <div className={styles.actions} aria-label="Thao tác với bài đang chọn">
    <button className={reading ? styles.secondary : styles.primary} disabled={!canStudy} onClick={() => openLesson(current.number)}><BookOpen size={16}/>{reading ? "Đang học bài" : "Học tiếp"}</button>
    <button className={styles.secondary} disabled={!canStudy} onClick={practice}><Dumbbell size={16}/>Luyện bài này</button>
    <button className={styles.secondary} disabled={!canStudy} onClick={openNotes}><PenTool size={16}/>Ghi chép</button>
  </div>;

  return <div ref={topRef} className={styles.workspace} data-self-study-view={view}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>HANYU · TỰ HỌC HSK {level}</p><h1>{reading ? "Một bài học, một bước tiến." : view === "roadmap" ? "Hành trình của riêng bạn." : "Mở kho sách, tìm điều muốn học."}</h1><p>{view === "roadmap" ? "Tiếp tục bài đang học và nhìn lại những chặng phía trước." : "Tìm bài theo tên, chữ Hán hoặc Pinyin. Học và luyện theo cùng một bài."}</p></div>
      <button className={styles.secondary} onClick={() => setRoomOpen(true)}><Moon size={16}/>Phòng tập trung</button>
    </header>
    <div className={styles.levels} aria-label="Chọn cấp độ HSK"><span>Cấp độ của bạn</span><div>{[1, 2, 3, 4, 5, 6].map(n => <button key={n} aria-pressed={level === n} onClick={() => changeLevel(n)}>HSK {n}{n > maxLevel && <Lock size={12}/>}</button>)}</div><Link href={`/s/mock-exam?level=${level}`}><FileCheck2 size={15}/>Thi thử HSK {level}</Link></div>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {loading ? <p className={styles.empty} role="status">Đang mở kho giáo trình HSK {level}…</p> : error ? <p role="alert" className={styles.empty}>{error}</p> : !lessons.length ? <p className={styles.empty}>Cấp độ này chưa có bài học.</p> : <>
      {view === "roadmap" ? <>
        <section className={styles.resume} aria-label="Tiếp tục học"><div className={styles.resumeArt} aria-hidden="true"><span>学<br/>而<br/>时<br/>习</span></div><div className={styles.resumeBody}><p className={styles.eyebrow}>BÀI ĐANG CHỌN · HSK {level} / BÀI {current.number}</p><h2>{current.titleVi || current.titleZh}</h2><p className={styles.chinese} lang="zh-CN">{current.titleZh}</p><p className={styles.pinyin}>{current.pinyin}</p><div className={styles.meta}><span>{current.vocabList.length} từ vựng</span><span>{current.grammarList.length} ngữ pháp</span><span>{current.durationMin} phút dự kiến</span></div>{actions}{!canStudy && <p className={styles.hint}>Bài này chưa mở. Chọn một bài đã mở trong cuộn thư bên dưới.</p>}</div></section>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TỪNG BƯỚC VỮNG VÀNG</p><h2>Các chặng học tập</h2></div><span>{openCount} / {lessons.length} bài đã mở</span></div>
        <div className={styles.stages}>{stages.map(stage => <article key={stage.step}><span className={styles.stageNumber}>{String(stage.step).padStart(2, "0")}</span><small>{stage.duration}</small><h3>{stage.title}</h3><p>{stage.desc}</p>{stage.badge && <span className={styles.stageBadge}>{stage.badge}</span>}</article>)}</div>
        <AncientScrollPathway lessons={lessons} selectedLesson={current.number} unlockedLessons={unlocked} onSelectLesson={openLesson} hskLevel={level}/>
        <button className={styles.catalogLink} onClick={() => { onScreenChange?.("catalog"); navigate("lessons"); }}>Khám phá toàn bộ kho bài học <ArrowRight size={16}/></button>
      </> : reading ? <>
        <div className={styles.readerNavigation}><button className={styles.textButton} onClick={() => onScreenChange?.("catalog")}><ArrowLeft size={15}/>Về kho bài học</button><span>HSK {level} · Bài {current.number}</span></div>
        <section className={styles.readerHeader}><div><p className={styles.eyebrow}>ĐỌC · HIỂU · THỰC HÀNH</p><h2>{current.titleVi || current.titleZh}</h2><p className={styles.pinyin}>{current.titleZh} · {current.pinyin}</p></div>{actions}</section>
        {canStudy ? <><div className={styles.lessonContent}><LessonStudyContent key={`${level}-${current.number}`} lesson={current}/></div><footer className={styles.readerFooter}><div><h3>Khép lại bài {current.number}</h3><p>Luyện thêm một lượt hoặc ghi lại điều bạn vừa hiểu.</p></div><div className={styles.actions}><button className={styles.secondary} onClick={practice}><Dumbbell size={16}/>Luyện bài này</button><button className={styles.primary} onClick={complete}><CheckCircle2 size={16}/>Hoàn thành bài học</button></div></footer></> : <p className={styles.empty}><Lock size={22}/>Bài này chưa mở. Hãy chọn một bài đã mở trong kho bài học.</p>}
      </> : <>
        <section className={styles.libraryTools} aria-label="Tìm và lọc bài học"><label className={styles.search}><Search size={18}/><input aria-label="Tìm bài học" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên bài, chữ Hán, Pinyin…"/></label><div className={styles.filters} aria-label="Trạng thái bài học">{[{ id: "all", label: "Tất cả" }, { id: "open", label: "Đã mở" }, { id: "locked", label: "Chưa mở" }].map(item => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div><span className={styles.resultCount} role="status">{results.length} bài học</span></section>
        <div className={styles.library} aria-label="Danh sách bài học">{results.map(lesson => { const available = unlocked.includes(lesson.number); return <button key={lesson.number} className={styles.lessonCard} disabled={!available} aria-label={`Mở bài ${lesson.number}`} onClick={() => openLesson(lesson.number)}><div className={styles.cardTop}><span>BÀI {String(lesson.number).padStart(2, "0")}</span>{available ? <BookOpen size={17}/> : <Lock size={16}/>}</div><h2 lang="zh-CN">{lesson.titleZh}</h2><p className={styles.pinyin}>{lesson.pinyin}</p><p className={styles.cardTitle}>{lesson.titleVi}</p><div className={styles.cardMeta}><span>{lesson.vocabList.length} từ · {lesson.grammarList.length} ngữ pháp</span><span>{available ? "Mở bài học →" : "Hoàn thành bài trước"}</span></div></button>; })}</div>
        {!results.length && <div className={styles.empty}><Search size={26}/><h2>Chưa tìm thấy bài phù hợp</h2><p>Thử một tên khác hoặc xem toàn bộ bài học.</p><button className={styles.secondary} onClick={() => { setQuery(""); setFilter("all"); }}>Xóa bộ lọc</button></div>}
      </>}
    </>}
    <AncientSideDrawerNotes isOpen={notesOpen} onClose={() => setNotesOpen(false)} lessonNumber={current?.number || selection.lessonNumber} hskLevel={level} studentId={currentUser?.id} lessonTitle={current?.titleVi || current?.titleZh} lesson={canStudy ? current : undefined}/>
    <VirtualStudyRoomModal isOpen={roomOpen} onClose={() => setRoomOpen(false)} studentName={currentUser?.name || "Bạn"}/>
  </div>;
}
