"use client";
import {useState} from "react";
import Image from "next/image";
import {ArrowLeft,Plus} from "lucide-react";
import {hskArtwork} from "@/lib/hsk-theme";
import InkHero from "./InkHero";
import StudentLearningWorkspace from "./StudentLearningWorkspace";
import TeachingMaterialsWorkspace from "./TeachingMaterialsWorkspace";
import ReportsWorkspace from "./ReportsWorkspace";
import ScheduleWorkspace from "./ScheduleWorkspace";
import {usePortalData} from "./use-portal-data";
import styles from "./Ink.module.css";
type Classroom={id:string;name:string;level:number;description:string;teacherName:string;isPendingApproval?:boolean;enrollmentStatus?:string};
export default function StudentClassroom({onOpenJoinModal,onNavigateToTab}:{currentUser?:unknown;onOpenJoinModal?:()=>void;onNavigateToTab?:(tab:string)=>void}){
 const {data,error,loading}=usePortalData<{items:Classroom[]}>("/api/v1/classes");const [id,setId]=useState<string|null>(null),[tab,setTab]=useState("curriculum");const current=data?.items.find(item=>item.id===id);const pending=current?.isPendingApproval||current?.enrollmentStatus==="PENDING";
 return <div className={`${styles.workspace} ${styles.stack}`}><InkHero level={current?.level} eyebrow="Lớp học của tôi" title={current?.name||"Cùng học, cùng tiến bộ."} description={current?.description||"Bài học, tài liệu và lịch học được giáo viên cập nhật riêng cho từng lớp."}/>{error&&<p className={styles.error}>{error}</p>}{loading&&<p className={styles.empty}>Đang tải lớp học…</p>}
 {current?<><button className={styles.muted} onClick={()=>setId(null)}><span className="inline-flex items-center gap-2"><ArrowLeft size={14}/>Về danh sách lớp</span></button>{pending?<p className={styles.notice}>Yêu cầu tham gia đang chờ giáo viên duyệt.</p>:<><nav className={styles.tabs}>{[["curriculum","Lộ trình bài học"],["materials","Tài liệu lớp"],["schedule","Lịch học"],["reports","Tiến độ của tôi"]].map(([value,label])=><button key={value} className={tab===value?styles.tabActive:styles.tab} onClick={()=>setTab(value)}>{label}</button>)}</nav>{tab==="curriculum"&&<StudentLearningWorkspace myClasses={[current]} compact/>}{tab==="materials"&&<TeachingMaterialsWorkspace classId={current.id} readOnly/>}{tab==="schedule"&&<ScheduleWorkspace classId={current.id} readOnly compact/>}{tab==="reports"&&<ReportsWorkspace student classId={current.id} compact/>}<button className={`${styles.button} ${styles.secondary}`} onClick={()=>onNavigateToTab?.("assignments")}>Mở danh sách bài tập của tôi</button></>}</>:<><div className={styles.actions}>{onOpenJoinModal&&<button className={styles.button} onClick={onOpenJoinModal}><Plus size={14}/>Tham gia lớp học</button>}</div><div className={styles.grid}>{data?.items.map(item=><button key={item.id} className={styles.card} onClick={()=>{setId(item.id);setTab("curriculum");}}><div className={styles.cardArt}><Image src={hskArtwork(item.level)} alt="" fill sizes="400px"/></div><div className={styles.cardBody}><span className={styles.tag}>HSK {item.level}</span><h3>{item.name}</h3><p className={styles.muted}>Giáo viên: {item.teacherName}</p><p className={styles.meaning}>{item.isPendingApproval||item.enrollmentStatus==="PENDING"?"Đang chờ duyệt":"Vào lớp học →"}</p></div></button>)}</div>{data&&!data.items.length&&<p className={styles.empty}>Bạn chưa tham gia lớp nào.</p>}</>}
 </div>;
}
