"use client";
import {useState} from "react";
import Link from "next/link";
import InkHero from "./InkHero";
import {useRouter} from "next/navigation";
import {portalFetch,usePortalData} from "./use-portal-data";
import styles from "./Ink.module.css";
type Assignment={id:string;title:string;className:string;dueAt:string;openAt:string;status:string;totalQuestions:number;durationMin:number;hasAttempted:boolean;latestScore:number|null;totalPoints:number;attemptId:string|null};
export default function StudentAssignments(_props:{currentUser?:unknown;onNavigateToTab?:(tab:string)=>void;classesCount?:number;myClasses?:unknown[];onOpenJoinModal?:()=>void}){const router=useRouter();const [message,setMessage]=useState("");const {data,error,loading,reload}=usePortalData<{items:Assignment[]}>("/api/v1/assignments");return <div className={`${styles.workspace} ${styles.stack}`}><InkHero eyebrow="Bài tập của tôi" title="Vững vàng qua từng bài luyện." description="Những bài tập được giáo viên giao cho lớp bạn. Điểm và kết quả được lưu trên hệ thống."/>{message&&<p className={styles.error}>{message}</p>}{error&&<p className={styles.error}>{error}<button onClick={reload}>Tải lại</button></p>}{loading&&<p className={styles.empty}>Đang tải bài tập…</p>}<div className={styles.grid2}>{data?.items.map(item=>{const closed=item.status==="CLOSED"||new Date(item.dueAt)<new Date()||new Date(item.openAt)>new Date();return <article key={item.id} className={styles.panel}><span className={styles.tag}>{item.className}</span><h3 className="mt-4 font-serif text-xl font-bold">{item.title}</h3><p className={styles.muted}>{item.totalQuestions} câu hỏi · {item.durationMin} phút</p><p className={styles.muted}>Hạn nộp: {new Date(item.dueAt).toLocaleString("vi-VN")}</p>{item.latestScore!==null&&<p className={styles.meaning}>Điểm: {item.latestScore} / {item.totalPoints}</p>}<div className={`${styles.actions} mt-4`}>{!closed&&<button className={styles.button} onClick={async()=>{try{const result=await portalFetch<{attemptId:string}>("/api/v1/assignments/"+item.id+"/start",{method:"POST"});router.push("/s/attempts/"+result.attemptId);}catch(error){setMessage((error as Error).message);}}}>{item.hasAttempted?"Tiếp tục / làm lại":"Làm bài"}</button>}{closed&&<span className={styles.muted}>Bài chưa mở hoặc đã đóng / hết hạn.</span>}{item.attemptId&&item.latestScore!==null&&<Link className={`${styles.button} ${styles.secondary}`} href={`/s/attempts/${item.attemptId}/result`}>Xem kết quả</Link>}</div></article>;})}</div>{data&&!data.items.length&&(
  <div className="p-8 text-center bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] shadow-xs space-y-3 max-w-md mx-auto my-6">
    <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mx-auto text-xl font-serif">
      练
    </div>
    <h3 className="font-serif font-bold text-lg text-[#204434]">Chưa có bài tập được giao</h3>
    <p className="text-xs text-[#315E48] leading-relaxed">
      Bạn đang ở Chế độ Tự học HSK độc lập. Hãy vào Phòng luyện tập để làm đề thi thử, luyện từ vựng, ngữ pháp và khẩu ngữ nhé!
    </p>
    <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
      <button
        type="button"
        onClick={() => _props.onNavigateToTab?.("practice")}
        className={`${styles.button}`}
      >
        Vào Phòng Luyện tập Tự do &rarr;
      </button>
      {_props.onOpenJoinModal && (
        <button
          type="button"
          onClick={_props.onOpenJoinModal}
          className={`${styles.button} ${styles.secondary}`}
        >
          Nhập mã lớp nếu có
        </button>
      )}
    </div>
  </div>
)}</div>;}
