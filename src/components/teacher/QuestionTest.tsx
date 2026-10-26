"use client";
import {useState} from "react";
import {gradeQuestion,prepareQuestion,type QuestionDraft} from "@/lib/question-content";
import {hydrated} from "./SharedQuestionEditor";
import QuestionInteraction from "./QuestionInteraction";
export default function QuestionTest({question,onClose}:{question:QuestionDraft;onClose:()=>void}) {
 const [value,setValue]=useState(""),[feedback,setFeedback]=useState("");const q=hydrated(question);
 return <div role="dialog" aria-label="Thử câu hỏi" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-auto rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] p-6 text-[#204434]"><div className="flex justify-between gap-4"><h3 className="font-serif text-xl font-bold">Mô phỏng học viên</h3><button onClick={onClose}>Đóng</button></div><QuestionInteraction question={q} value={value} onChange={next=>{setValue(next);setFeedback("");}}/><button className="rounded-xl bg-[#204434] px-4 py-3 text-sm text-white" onClick={()=>{if(q.type==="flashcard"){setFeedback("Đã ghi nhận tự đánh giá ôn tập, không tự tính điểm.");return;}const result=gradeQuestion(prepareQuestion({...q,status:"DRAFT"}),value);setFeedback(result.manual?"Đây là câu chấm tay. Giáo viên cần đánh giá bài làm theo rubric.":result.correct?"Trả lời chính xác.":"Chưa chính xác. Hãy kiểm tra lại đáp án.");}}>Kiểm tra đáp án</button>{feedback&&<p role="status">{feedback}</p>}</div></div>;
}
