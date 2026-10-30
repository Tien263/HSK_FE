"use client";
import { useEffect,useRef,useState } from "react";
import { ArrowDown,ArrowUp,BookOpen,Lock } from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { OFFICIAL_HSK1_15_LESSONS } from "@/lib/hsk1-full-lessons";
import { usePortalData } from "./use-portal-data";
import InkHero from "./InkHero";
import LessonStudyContent from "./LessonStudyContent";
import styles from "./Ink.module.css";
type Classroom={id:string;name?:string;level?:number;isPendingApproval?:boolean;enrollmentStatus?:string;status?:string};
export interface StudentLearningProps{currentUser?:unknown;myClasses?:Classroom[];classesCount?:number;activeHskLevel?:number;onNavigateToTab?:(tab:string)=>void;onOpenJoinModal?:()=>void;compact?:boolean;}
type ClassLesson={id:string;lessonNumber:number;titleZh:string;titleVi:string;pinyin:string;status:string;isPublished:boolean;content?:Hsk1FullLesson;teacherNote?:string;dueDate?:string};
export default function StudentLearningWorkspace({myClasses=[],activeHskLevel,onOpenJoinModal,compact=false}:StudentLearningProps){
  const [classId,setClassId]=useState("");const [selected,setSelected]=useState<string|null>(null);const listRef=useRef<HTMLDivElement>(null),detailRef=useRef<HTMLDivElement>(null);
  const classroom=myClasses.find(item=>item.id===classId)||myClasses.find(item=>item.level===activeHskLevel)||myClasses[0];
  const pending=classroom?.isPendingApproval||classroom?.enrollmentStatus==="PENDING";
  const {data,error,loading,reload}=usePortalData<{lessons:ClassLesson[]}>(classroom&&!pending?`/api/v1/classes/${classroom.id}/lessons`:null);
  const lessons=data?.lessons||[];const published=lessons.filter(item=>item.status==="PUBLISHED"||item.isPublished);const current=published.find(item=>item.id===selected);
  useEffect(()=>{if(current)detailRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});},[current]);
  if (!classroom) {
    const currentSelfLesson = OFFICIAL_HSK1_15_LESSONS.find((item: Hsk1FullLesson) => item.id === selected) || (selected ? null : OFFICIAL_HSK1_15_LESSONS[0]);
    return (
      <div className={`${styles.workspace} ${styles.stack}`}>
        {!compact && (
          <InkHero
            level={1}
            eyebrow="Lộ trình Tự học Chuẩn · HSK 1"
            title="Khởi đầu vững chắc, chinh phục HSK 1."
            description="15 bài học tự học chuẩn Hanban CTI với đầy đủ Từ vựng, Ngữ pháp, Hội thoại song ngữ, Ngữ âm và Văn hóa. Tự do học tập không cần mã lớp."
          />
        )}
        <div className={styles.row}>
          <span className={styles.tag}>Chế độ Tự học: 15 / 15 bài đã mở hoàn toàn</span>
          {onOpenJoinModal && (
            <button className={`${styles.button} ${styles.secondary}`} onClick={onOpenJoinModal}>
              + Tôi có mã lớp của Giáo viên
            </button>
          )}
        </div>
        <div ref={listRef} className={styles.grid}>
          {OFFICIAL_HSK1_15_LESSONS.map((lesson: Hsk1FullLesson) => {
            return (
              <button
                key={lesson.id}
                onClick={() => setSelected(lesson.id)}
                className={`${styles.card} ${currentSelfLesson?.id === lesson.id ? styles.cardActive : ""}`}
                aria-label={`Mở bài ${lesson.number}`}
              >
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span className={styles.tag}>Bài {lesson.number}</span>
                    <ArrowDown size={15} />
                  </div>
                  <h3 lang="zh-CN">{lesson.titleZh}</h3>
                  <p className={styles.pinyin}>{lesson.pinyin}</p>
                  <p className={styles.meaning}>{lesson.titleVi}</p>
                  <p className={`${styles.muted} mt-4`}>Xem đủ nội dung bài học</p>
                </div>
              </button>
            );
          })}
        </div>
        {currentSelfLesson && (
          <div ref={detailRef} className={`${styles.stack} ${styles.sectionAnchor}`}>
            <InkHero
              level={1}
              eyebrow={`Nội dung Bài ${currentSelfLesson.number}`}
              title={currentSelfLesson.titleVi || currentSelfLesson.titleZh}
              description={currentSelfLesson.pinyin}
            >
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <ArrowUp size={13} />
                Về danh sách bài
              </button>
            </InkHero>
            <LessonStudyContent key={currentSelfLesson.id} lesson={currentSelfLesson} />
          </div>
        )}
      </div>
    );
  }
  return <div className={`${styles.workspace} ${styles.stack}`}>
    {!compact&&<InkHero level={classroom.level} eyebrow={`Lộ trình học · HSK ${classroom.level||1}`} title="Từng bài học, một bước tiến." description="Chọn bài để đọc nội dung ngay bên dưới: từ vựng, ngữ pháp, hội thoại, ngữ âm và văn hóa."/>}
    <div className={styles.row}><label className={styles.label}>Lớp học<select className={styles.input} aria-label="Lớp học của tôi" value={classroom.id} onChange={event=>{setClassId(event.target.value);setSelected(null);}}>{myClasses.map(item=><option key={item.id} value={item.id}>{item.name||item.id} · HSK {item.level||1}</option>)}</select></label><span className={styles.tag}>{published.length} / {lessons.length} bài đã công bố</span></div>
    {pending?<p className={styles.notice}>Yêu cầu tham gia lớp đang chờ giáo viên duyệt.</p>:error?<div role="alert" className={styles.error}>{error}<button className={`${styles.button} ${styles.secondary} ml-3`} onClick={reload}>Tải lại</button></div>:loading?<p className={styles.empty}>Đang tải lộ trình của lớp…</p>:<>
      <div ref={listRef} className={styles.grid}>{lessons.map(lesson=>{const open=lesson.status==="PUBLISHED"||lesson.isPublished;return <button key={lesson.id} disabled={!open} onClick={()=>setSelected(lesson.id)} className={`${styles.card} ${current?.id===lesson.id?styles.cardActive:""}`} aria-label={`Mở bài ${lesson.lessonNumber}`}><div className={styles.cardBody}><div className={styles.row}><span className={styles.tag}>Bài {lesson.lessonNumber}</span>{open?<ArrowDown size={15}/>:<Lock size={14}/>}</div><h3 lang="zh-CN">{lesson.titleZh}</h3><p className={styles.pinyin}>{lesson.pinyin}</p><p className={styles.meaning}>{lesson.titleVi}</p><p className={`${styles.muted} mt-4`}>{open?"Xem đủ nội dung bài học":"Giáo viên chưa công bố"}</p></div></button>;})}</div>
      {!lessons.length&&<p className={styles.empty}>Lớp chưa có bài học trong lộ trình.</p>}
      {current&&<div ref={detailRef} className={`${styles.stack} ${styles.sectionAnchor}`}><InkHero level={classroom.level} eyebrow={`Nội dung Bài ${current.lessonNumber}`} title={current.titleVi||current.titleZh} description={current.pinyin}><button className={`${styles.button} ${styles.secondary}`} onClick={()=>listRef.current?.scrollIntoView({behavior:"smooth",block:"start"})}><ArrowUp size={13}/>Về danh sách bài</button></InkHero>{current.teacherNote&&<p className={styles.notice}>Ghi chú giáo viên: {current.teacherNote}</p>}{current.content?<LessonStudyContent key={current.id} lesson={current.content}/>:<p className={styles.empty}>Bài học chưa có nội dung chi tiết. Hãy liên hệ giáo viên để cập nhật.</p>}</div>}
    </>}
  </div>;
}
