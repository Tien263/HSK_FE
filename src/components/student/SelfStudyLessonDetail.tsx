"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bookmark, BookOpen, Check, CheckCircle2, Dumbbell, PenTool, Sparkles } from "lucide-react";
import LessonCover from "./LessonCover";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { lessonKnowledge, studySections, wholeLessonItem, type StudySection, type KnowledgeItem } from "@/lib/self-study-knowledge";
import { isKnowledgeSaved, lessonKey, toggleKnowledge, updateLibrary, useLessonLibrary } from "@/lib/use-lesson-library";
import KnowledgeDetails, { AudioButton } from "./KnowledgeDetails";
import KnowledgeNoteEditor from "./KnowledgeNoteEditor";
import s from "./SelfStudyLessonDetail.module.css";
type Props = { lesson: Hsk1FullLesson; level: number; studentId?: string; onPractice: () => void; onNotes: () => void; onEtymology: () => void; onComplete: () => void; onArchive: () => void };
export default function SelfStudyLessonDetail({ lesson, level, studentId, onPractice, onNotes, onEtymology, onComplete, onArchive }: Props) {
  const store = useLessonLibrary(studentId), lessonId = lessonKey(level, lesson.number);
  const items = useMemo(() => lessonKnowledge(lesson, level), [lesson, level]);
  const [tab, setTab] = useState<StudySection>(() => studySections.some(section => section.id === store.reading[lessonId]?.tab) ? store.reading[lessonId].tab as StudySection : "vocab");
  const [selectedId, setSelectedId] = useState(store.reading[lessonId]?.itemId || "");
  const [message, setMessage] = useState(""), [noteOpen, setNoteOpen] = useState(false);
  const sectionItems = items.filter(item => item.section === tab);
  const current = sectionItems.find(item => item.id === selectedId) || sectionItems[0];
  const completed = items.filter(item => store.completed.includes(item.id)).length;
  const allDone = items.length > 0 && completed === items.length;
  const percent = items.length ? Math.round(completed / items.length * 100) : 0;
  const whole = wholeLessonItem(lesson, level);
  const remember = useCallback((section: string, itemId?: string) => {
    updateLibrary(studentId, value => ({ ...value, resume: { ...value.resume, [level]: lesson.number }, reading: { ...value.reading, [lessonId]: { ...value.reading[lessonId], tab: section, itemId, viewed: [...new Set([...(value.reading[lessonId]?.viewed || []), section])], updatedAt: new Date().toISOString() } } }));
  }, [studentId, level, lesson.number, lessonId]);
  useEffect(() => { remember(tab, current?.id); }, [tab, current?.id, remember]);
  function save(item: KnowledgeItem) { setMessage(toggleKnowledge(studentId, item) ? isKnowledgeSaved(store, item) ? "Đã bỏ lưu nội dung." : "Đã lưu vào Kho lưu trữ." : "Chưa lưu được. Kiểm tra quyền lưu trữ của trình duyệt."); }
  function saveButton(item: KnowledgeItem, text = false) { const saved = isKnowledgeSaved(store, item); return <button className={s.bookmark} aria-label={`${saved ? "Bỏ lưu" : "Lưu"} ${item.kind === "lesson" ? "bài học" : item.title}`} aria-pressed={saved} onClick={() => save(item)}><Bookmark size={18} fill={saved ? "currentColor" : "none"}/>{text && (saved ? "Đã lưu" : item.kind === "lesson" ? "Lưu bài học" : "Lưu nội dung")}</button>; }
  return <div className={s.layout} data-lesson-detail>
    <main className={s.main}>
      <header className={s.hero}><div className={s.heroArt} aria-hidden="true"><LessonCover lessonNumber={lesson.number}/></div><div><small>HSK {level} · BÀI {lesson.number}</small><h2 lang="zh-CN">{lesson.titleZh}</h2><p className={s.pinyin}>{lesson.pinyin}</p><p>{lesson.titleVi}</p><div className={s.buttons}>{saveButton(whole, true)}<button className={s.outline} onClick={onArchive}><BookOpen size={16}/>Kho lưu trữ</button></div></div></header>
      {message && <p role="status" className={s.notice}>{message}</p>}
      <nav className={s.tabs} role="tablist" aria-label="Nội dung bài học">{studySections.map((section, index) => <button key={section.id} id={`study-tab-${section.id}`} role="tab" aria-selected={tab === section.id} aria-controls="study-content-panel" tabIndex={tab === section.id ? 0 : -1} onClick={() => { setTab(section.id); setNoteOpen(false); }} onKeyDown={event => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? studySections.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + studySections.length) % studySections.length; setTab(studySections[next].id); document.getElementById(`study-tab-${studySections[next].id}`)?.focus(); }}><span>{section.label}</span><small>({items.filter(item => item.section === section.id).length})</small></button>)}</nav>
      <div id="study-content-panel" className={s.explorer} role="tabpanel" aria-labelledby={`study-tab-${tab}`}>
        {sectionItems.length ? <><nav className={s.itemList} aria-label={`Danh sách ${studySections.find(section => section.id === tab)?.label}`}>{sectionItems.map((item, index) => <article key={item.id} data-selected={current?.id === item.id}><button className={s.itemSelect} aria-current={current?.id === item.id ? "true" : undefined} aria-label={`Xem chi tiết ${item.title}`} onClick={() => { setSelectedId(item.id); setNoteOpen(false); }}><small>{String(index + 1).padStart(2,"0")}</small><span lang="zh-CN">{item.title}</span>{store.completed.includes(item.id) && <Check size={14}/>}</button><div>{item.kind === "vocab" && <AudioButton text={item.title}/>} {saveButton(item)}</div></article>)}</nav>
        <article className={s.detail} aria-label="Chi tiết kiến thức"><div className={s.detailTools}>{saveButton(current, true)}<button className={s.outline} onClick={() => setNoteOpen(!noteOpen)}><PenTool size={15}/>Ghi chú mục này</button></div><KnowledgeDetails item={current}/>{noteOpen && <KnowledgeNoteEditor key={current.id} studentId={studentId} note={store.notes.find(note => note.sourceId === current.id)} sourceId={current.id} title={current.title} onClose={() => setNoteOpen(false)}/>}<button className={store.completed.includes(current.id) ? s.doneButton : s.primary} aria-pressed={store.completed.includes(current.id)} onClick={() => { const ok = updateLibrary(studentId, value => ({ ...value, completed: value.completed.includes(current.id) ? value.completed.filter(id => id !== current.id) : [...value.completed, current.id] })); setMessage(ok ? store.completed.includes(current.id) ? "Đã bỏ đánh dấu hoàn thành." : "Đã ghi nhận nội dung hoàn thành." : "Chưa lưu được tiến độ trên trình duyệt."); }}><CheckCircle2 size={17}/>{store.completed.includes(current.id) ? "Đã học xong · Bỏ đánh dấu" : "Đánh dấu đã học xong"}</button></article></> : <div className={s.empty}>Giáo trình chưa có nội dung {studySections.find(section => section.id === tab)?.label.toLowerCase()} cho bài này.</div>}
      </div>
    </main>
    <aside className={s.sidebar}><section className={s.progress} aria-label="Tiến độ bài học"><h2><BookOpen size={19}/>Tiến độ bài học</h2><div className={s.progressMeter}><progress max={100} value={percent} aria-label="Tiến độ nội dung hoàn thành"/><strong>{percent}%</strong></div><p>Đã hoàn thành {completed} / {items.length} nội dung</p><ul>{studySections.map(section => { const group = items.filter(item => item.section === section.id), done = group.filter(item => store.completed.includes(item.id)).length; return <li key={section.id}><button onClick={() => setTab(section.id)}>{section.label}<small>{group.length ? `${done}/${group.length}` : "Chưa có"}</small><span data-done={group.length > 0 && done === group.length}>{group.length > 0 && done === group.length && <Check size={14}/>}</span></button></li>; })}</ul><p className={s.hint}>Chỉ tính nội dung bạn đánh dấu đã học xong. Việc xem hoặc lưu mục không làm tăng tiến độ. Tiến độ chi tiết lưu trên trình duyệt này.</p><button className={s.primary} disabled={!allDone} onClick={onComplete}><CheckCircle2 size={16}/>Hoàn thành bài học</button></section><section className={s.quick} aria-label="Hành động nhanh"><h2><Sparkles size={20}/>Hành động nhanh</h2><button className={s.primary} onClick={onPractice}><Dumbbell size={17}/>Luyện bài này</button><button className={s.outline} onClick={onNotes}><PenTool size={17}/>Ghi chép</button><button className={s.outline} onClick={onEtymology}><Sparkles size={17}/>Chiết tự</button></section></aside>
  </div>;
}
