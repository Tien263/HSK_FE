"use client";

import { useId, useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import styles from "./ScrollPathway.module.css";

interface AncientScrollPathwayProps {
  lessons: Array<{ number: number; titleZh: string; titleVi?: string; pinyin?: string }>;
  selectedLesson: number;
  unlockedLessons: number[];
  onSelectLesson: (lessonNumber: number) => void;
  hskLevel: number;
}

export default function AncientScrollPathway({ lessons, selectedLesson, unlockedLessons, onSelectLesson, hskLevel }: AncientScrollPathwayProps) {
  const [expanded, setExpanded] = useState(true);
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  function scrollLessons(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * .75, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  const available = Array.isArray(lessons) ? lessons : [];
  const unlocked = Array.isArray(unlockedLessons) ? unlockedLessons : [];
  const openCount = available.filter(lesson => unlocked.includes(lesson.number)).length;
  return <section className={styles.pathway} aria-label={`Lộ trình tự học HSK ${hskLevel}`}>
    <header className={styles.header}>
      <div className={styles.identity}><span className={styles.seal} aria-hidden="true">学</span><div><p className={styles.eyebrow}>HÀNH TRÌNH HSK {hskLevel}</p><h3>Từng trang học, từng bước tiến</h3></div></div>
      <button className={styles.toggle} aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>{expanded ? "Cuộn thư lại" : "Mở cuộn thư"}<ChevronDown size={15} className={expanded ? styles.chevronOpen : ""}/></button>
    </header>
    <div className={styles.scroll}>
      <div className={styles.rollerLeft} aria-hidden="true"/><div className={styles.rollerRight} aria-hidden="true"/>
      <div className={styles.paper} id={id} hidden={!expanded}>
        <div className={styles.paperTop}><span>千里之行，始于足下</span><small>{openCount} / {available.length} bài đã mở</small></div>
        <div ref={trackRef} className={styles.track} role="group" aria-label="Chọn bài học">{available.map(lesson => {
          const isOpen = unlocked.includes(lesson.number), current = selectedLesson === lesson.number;
          return <button key={lesson.number} className={styles.lesson} title={`${lesson.titleZh} · ${lesson.titleVi || `Bài ${lesson.number}`}`} disabled={!isOpen} aria-current={current ? "step" : undefined} aria-label={`Bài ${lesson.number}: ${lesson.titleVi || lesson.titleZh}${isOpen ? "" : ", chưa mở"}`} onClick={() => onSelectLesson(lesson.number)}>
            <span className={styles.number}>{isOpen ? String(lesson.number).padStart(2, "0") : <Lock size={16}/>}</span>
            <span className={styles.chinese} lang="zh-CN">{lesson.titleZh}</span><span className={styles.translation}>{lesson.titleVi || `Bài ${lesson.number}`}</span>
            <span className={styles.state}>{current && isOpen ? <><BookOpen size={11}/> Đang chọn</> : isOpen ? "Có thể học" : "Chưa mở khóa"}</span>
          </button>;
        })}</div>
        {!available.length && <p className={styles.empty}>Bài học sẽ xuất hiện tại đây khi giáo trình được tải.</p>}
        <div className={styles.paperBottom}><div className={styles.scrollControls}><button type="button" aria-label="Xem các bài phía trước" onClick={() => scrollLessons(-1)}><ChevronLeft size={16}/></button><button type="button" aria-label="Xem các bài tiếp theo" onClick={() => scrollLessons(1)}><ChevronRight size={16}/></button></div><span>Kéo ngang hoặc dùng mũi tên để xem các bài</span></div>
      </div>
      {!expanded && <div className={styles.closed}><span>书卷常开 · Tri thức luôn chờ bạn</span></div>}
    </div>
  </section>;
}
