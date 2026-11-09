"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, Check, ChartNoAxesColumnIncreasing, LockKeyhole, Play, Search } from "lucide-react";
import LessonCover from "./LessonCover";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { lessonKey, toggleKnowledge, useLessonLibrary } from "@/lib/use-lesson-library";
import { completionPercent, wholeLessonItem } from "@/lib/self-study-knowledge";
import { saveLessonItem, isLessonSaved } from "@/lib/saved-knowledge-service";
import styles from "./SelfStudyLessonCatalog.module.css";

type DayActivity = {
  date: string;
  levelCount: number;
  totalCount: number;
  levels: number[];
  isToday: boolean;
};

type Stats = {
  level: number;
  today?: string;
  completed: { number: number; date: string }[];
  days: string[];
  weeklyActivity?: DayActivity[];
  totalWeeklyLessons?: number;
  levelWeeklyLessons?: number;
};

type Props = { lessons: Hsk1FullLesson[]; level: number; studentId?: string; selected: number; unlocked: number[]; savedOnly: boolean; onSavedOnly: (value: boolean) => void; onOpen: (number: number) => void };
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
export default function SelfStudyLessonCatalog({ lessons, level, studentId, selected, unlocked, savedOnly, onSavedOnly, onOpen }: Props) {
  const store = useLessonLibrary(studentId);
  const [snapshot, setSnapshot] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(""), [filter, setFilter] = useState("all"), [message, setMessage] = useState("");
  const stats = snapshot?.level === level ? snapshot : null;
  useEffect(() => {
    const controller = new AbortController(); let requestId = 0;
    async function load() {
      const id = ++requestId;
      try {
        const res = await fetch(`/api/v1/my/self-study/library?level=${level}`, { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!res.ok || !data.success || data.level !== level || !Array.isArray(data.completed) || !Array.isArray(data.days)) throw new Error();
        if (!controller.signal.aborted && id === requestId) { setSnapshot(data); setFailed(false); }
      } catch { if (!controller.signal.aborted && id === requestId) { setSnapshot(null); setFailed(true); } }
    }
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    void load(); window.addEventListener("focus", refresh); window.addEventListener("self-study-progress-updated", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); window.removeEventListener("self-study-progress-updated", refresh); };
  }, [level, retry, studentId]);
  const completed = new Set(stats?.completed.map(item => item.number));
  const validIds = new Set(lessons.map(lesson => lesson.number));
  const week = stats?.completed.filter(item => validIds.has(item.number) && stats.days.includes(item.date)) || [];
  const totalWeekly = stats?.totalWeeklyLessons ?? week.length;
  const levelWeekly = stats?.levelWeeklyLessons ?? week.length;
  const unfinished = lessons.filter(lesson => unlocked.includes(lesson.number) && !completed.has(lesson.number));
  const lastUnfinished = unfinished.filter(lesson => store.reading[lessonKey(level, lesson.number)]).sort((a, b) => (store.reading[lessonKey(level, b.number)].updatedAt || "").localeCompare(store.reading[lessonKey(level, a.number)].updatedAt || ""))[0];
  const resume = unfinished.find(lesson => lesson.number === store.resume[level]) || lastUnfinished || unfinished.find(lesson => lesson.number === selected) || unfinished[0] || lessons.find(lesson => unlocked.includes(lesson.number));
  const results = lessons.filter(lesson => (!savedOnly || store.saved.includes(lessonKey(level, lesson.number))) && (filter === "all" || (filter === "open" ? unlocked.includes(lesson.number) : !unlocked.includes(lesson.number))) && normalize(`${lesson.number} ${lesson.titleZh} ${lesson.pinyin} ${lesson.titleVi}`).includes(normalize(query.trim())));
  function save(number: number) {
    const id = lessonKey(level, number);
    const lesson = lessons.find((l) => l.number === number);
    if (!lesson) return;

    // Lưu vào thư phòng library cũ
    toggleKnowledge(studentId, wholeLessonItem(lesson, level));

    // Lưu vào kho lưu trữ trung tâm của học sinh (saved-knowledge-service)
    const isNowSaved = saveLessonItem(studentId, {
      id,
      level,
      lessonNumber: number,
      titleZh: lesson.titleZh,
      titleVi: lesson.titleVi,
      pinyin: lesson.pinyin,
      vocabCount: lesson.vocabList?.length || 0,
      grammarCount: lesson.grammarList?.length || 0,
    });

    setMessage(
      isNowSaved
        ? "🔖 Đã lưu bài học vào Kho lưu trữ / Kiến thức đã lưu!"
        : "Đã bỏ lưu bài học khỏi Kho lưu trữ."
    );
  }
  function percent(lesson: Hsk1FullLesson) { return completed.has(lesson.number) ? 100 : completionPercent(lesson, level, store.completed); }
  function saveButton(number: number, label = false) {
    const saved = store.saved.includes(lessonKey(level, number)) || isLessonSaved(studentId, level, number);
    return (
      <button
        type="button"
        className={`${styles.save} ${saved ? styles.saved : ""}`}
        aria-label={`${saved ? "Bỏ lưu" : "Lưu"} bài ${number}`}
        aria-pressed={saved}
        onClick={(e) => {
          e.stopPropagation();
          save(number);
        }}
        title={saved ? "Bỏ lưu bài học này" : "Lưu bài học này vào Kho lưu trữ"}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-amber-600 fill-amber-600" : ""} />
        {label && (saved ? "Đã lưu bài" : "Lưu bài học")}
      </button>
    );
  }
  function card(lesson: Hsk1FullLesson) {
    const open = unlocked.includes(lesson.number), entry = store.reading[lessonKey(level, lesson.number)];
    return <article className={styles.card} key={lesson.number}>
      <div className={styles.cardArt} aria-hidden="true"><LessonCover lessonNumber={lesson.number}/></div>
      <div className={styles.cardBody}><span className={styles.badge}>{completed.has(lesson.number) ? "Đã hoàn thành" : !open ? "Chưa mở" : entry ? "Đang học" : "Đã mở"}</span><small>HSK {level} · BÀI {String(lesson.number).padStart(2, "0")}</small><button className={styles.cardOpen} disabled={!open} aria-label={`Mở bài ${lesson.number}`} onClick={() => onOpen(lesson.number)}><h3 lang="zh-CN">{lesson.titleZh}</h3><p>{lesson.titleVi}</p></button><p className={styles.pinyin}>{lesson.pinyin}</p><div className={styles.meter}><progress max={100} value={percent(lesson)} aria-label={`Nội dung hoàn thành bài ${lesson.number}`}/><span>{percent(lesson)}%</span></div>{!open && <span className={styles.locked}><LockKeyhole size={11}/>Hoàn thành bài trước để mở</span>}</div>{saveButton(lesson.number)}
    </article>;
  }
  return <div className={styles.page} data-lesson-catalog>
    {message && <p role="status" className={styles.notice}>{message}</p>}
    {!savedOnly && <>
      <section aria-label="Tiếp tục học"><h2 className={styles.heading}><span/>Tiếp tục học</h2><div className={styles.top}>
        {resume ? <article className={styles.resume}><div className={styles.resumeArt} aria-hidden="true"><LessonCover lessonNumber={resume.number}/></div><div className={styles.resumeBody}><small>HSK {level} · BÀI {String(resume.number).padStart(2, "0")}</small><h3 lang="zh-CN">{resume.titleZh}</h3><p className={styles.pinyin}>{resume.pinyin}</p><p className={styles.meaning}>{resume.titleVi}</p><p className={styles.meta}><BookOpen size={14}/>{resume.vocabList.length} từ vựng <span>·</span>{resume.grammarList.length} ngữ pháp</p><div className={styles.meter}><progress max={100} value={percent(resume)} aria-label="Nội dung hoàn thành của bài tiếp tục học"/><span>{percent(resume)}%</span></div><p className={styles.source}>{completed.has(resume.number) ? "Đã hoàn thành bài học" : "Nội dung hoàn thành · theo mục đã đánh dấu học xong"}</p></div><div className={styles.resumeActions}><button className={styles.primary} onClick={() => onOpen(resume.number)}><Play size={15}/>Tiếp tục học</button>{saveButton(resume.number, true)}<button className={styles.outline} onClick={() => onOpen(resume.number)}><BookOpen size={15}/>Xem bài học</button></div></article> : <div className={styles.empty}>Chưa có bài đã mở ở HSK {level} để tiếp tục học.</div>}
        <aside className={styles.week} aria-label="Tiến độ tuần này">
          <h2><ChartNoAxesColumnIncreasing size={19}/>Tiến độ tuần này</h2>
          <strong>{stats ? levelWeekly : "—"}<small> bài học</small></strong>
          <p className={styles.weekSubtitle}>
            Đã hoàn thành · HSK {level}
            {stats && totalWeekly > levelWeekly && (
              <span className={styles.totalWeekNote}> · Tổng {totalWeekly} bài tuần này</span>
            )}
          </p>
          {stats ? (
            <div className={styles.days}>
              {stats.days.map((day, i) => {
                const act = stats.weeklyActivity?.find(item => item.date === day);
                const countThisLevel = act ? act.levelCount : week.filter(item => item.date === day).length;
                const totalCount = act ? act.totalCount : countThisLevel;
                const isToday = act?.isToday ?? (stats.today === day);
                const isPast = stats.today ? day < stats.today : false;
                const isFuture = stats.today ? day > stats.today : false;
                const isCompleted = countThisLevel > 0 || totalCount > 0;
                const otherLevelOnly = countThisLevel === 0 && totalCount > 0;
                const dayLabel = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i];
                const fullDayName = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"][i];
                const dateParts = day.split("-");
                const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : day;

                let tooltip = `${fullDayName} (${formattedDate})`;
                if (isToday) tooltip += " · Hôm nay";
                if (countThisLevel > 0) {
                  tooltip += `: Đã hoàn thành ${countThisLevel} bài học HSK ${level}`;
                  if (totalCount > countThisLevel) tooltip += ` (Tổng ${totalCount} bài các cấp)`;
                } else if (totalCount > 0) {
                  const lvlsStr = act?.levels?.length ? ` (HSK ${act.levels.join(", ")})` : "";
                  tooltip += `: Đã hoàn thành ${totalCount} bài học cấp khác${lvlsStr}`;
                } else if (isToday) {
                  tooltip += ": Hôm nay chưa có bài hoàn thành mới";
                } else if (isPast) {
                  tooltip += ": Chưa học bài";
                } else {
                  tooltip += ": Sắp tới";
                }

                return (
                  <div
                    key={day}
                    className={styles.dayCol}
                    data-today={isToday}
                    data-future={isFuture}
                    data-past={isPast}
                    title={tooltip}
                  >
                    <span
                      className={styles.dayDot}
                      data-checked={isCompleted}
                      data-other={otherLevelOnly}
                      data-today={isToday}
                      data-future={isFuture}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={2.6} />
                      ) : isToday ? (
                        <span className={styles.todayPulseDot} />
                      ) : null}
                    </span>
                    <small className={styles.dayLabel}>
                      {dayLabel}
                      {isToday && <span className={styles.todayTag}>Nay</span>}
                    </small>
                    {isCompleted && (
                      <span className={styles.dayBadge}>
                        {countThisLevel > 0 ? countThisLevel : totalCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.source}>{failed ? "Chưa tải được lịch sử hoàn thành." : "Đang tải lịch sử…"}</p>
          )}
          {failed && <button className={styles.retry} onClick={() => setRetry(n => n + 1)}>Thử lại</button>}
          <p className={styles.source}>Mỗi bài chỉ tính lần hoàn thành đầu tiên. Tuần từ thứ Hai đến Chủ nhật (giờ Việt Nam).</p>
        </aside>
      </div></section>
    </>}
    <section id="catalog-all-lessons" aria-label={savedOnly ? "Kho lưu trữ bài học" : "Toàn bộ bài học"}>
      <div className={styles.sectionHeader}><h2 className={styles.heading}>{savedOnly ? "Kho lưu trữ" : "Tất cả bài học"}<small>HSK {level}</small></h2><button onClick={() => onSavedOnly(!savedOnly)}>{savedOnly ? "Về kho bài học" : "Xem bài đã lưu"}<ArrowRight size={14}/></button></div>
      {savedOnly && <p className={styles.source}>Bài đã lưu theo tài khoản trên trình duyệt này. Chọn cấp HSK phía trên để xem bài lưu ở cấp khác.</p>}
      <div className={styles.tools}><label><Search size={17}/><input aria-label="Tìm bài học" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên bài, chữ Hán, Pinyin…"/></label><div>{[{ id: "all", label: "Tất cả" }, { id: "open", label: "Đã mở" }, { id: "locked", label: "Chưa mở" }].map(item => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div><span role="status">{results.length} bài học</span></div>
      <div className={styles.grid}>{results.map(card)}</div>{!results.length && <div className={styles.empty}><Bookmark size={25}/><h3>{savedOnly ? "Chưa có bài đã lưu phù hợp" : "Chưa tìm thấy bài phù hợp"}</h3><p>{savedOnly ? "Dùng nút đánh dấu trên card bài học để lưu vào đây." : "Thử tìm bằng tên tiếng Trung, Pinyin hoặc nghĩa Việt."}</p>{(query || filter !== "all") && <button onClick={() => { setQuery(""); setFilter("all"); }}>Xóa bộ lọc</button>}</div>}
    </section>
  </div>;
}
