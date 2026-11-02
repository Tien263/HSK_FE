"use client";
import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { KnowledgeItem } from "@/lib/self-study-knowledge";
import { compactKnowledgeData } from "@/lib/knowledge-presentation";
import { cleanChineseForSpeech } from "@/lib/chinese-speech";
import s from "./SelfStudyLessonDetail.module.css";
const labels: Record<string, string> = {
  meaning: "Nghĩa tiếng Việt", meaningVi: "Nghĩa tiếng Việt", usageExplanation: "Cách dùng", usagePatterns: "Cấu trúc & Mẫu dùng", examples: "Ví dụ minh họa", comparison: "So sánh", commonMistakes: "Lỗi sai thường gặp", type: "Từ loại", wordType: "Từ loại", exampleZh: "Câu ví dụ", examplePy: "Pinyin ví dụ", exampleVi: "Dịch ví dụ", structure: "Cấu trúc", summary: "Tổng quan", usageSteps: "Các bước sử dụng", usageContexts: "Bối cảnh sử dụng", example: "Ví dụ", explanation: "Giải thích", notes: "Lưu ý", memo: "Ghi nhớ", usage: "Cách sử dụng", title: "Tiêu đề", titleZh: "Tiêu đề tiếng Trung", titleVi: "Tiêu đề tiếng Việt", zh: "Tiếng Trung", vi: "Nghĩa tiếng Việt", py: "Pinyin", pinyin: "Pinyin", incorrect: "Cách dùng sai", correct: "Cách dùng đúng", speaker: "Nhân vật", lines: "Nội dung hội thoại", contentZh: "Nguyên văn tiếng Trung", originalText: "Nguyên văn", contentPy: "Pinyin bài đọc", contentVi: "Bản dịch", translation: "Bản dịch", analysisExplanation: "Phân tích tổng quan", mainEvent: "Diễn biến chính", keywords: "Từ khóa", keySentence: "Câu then chốt", evidenceExplanation: "Dẫn chứng & Cơ sở", mainIdea: "Ý chính", mainIdeaExplanation: "Giải thích ý chính", secondaryDetails: "Chi tiết bổ trợ", commonTrap: "Bẫy thường gặp", readingTip: "Mẹo đọc hiểu", wordCount: "Số từ", extraVocabs: "Từ vựng mở rộng", hanzi: "Chữ Hán", tag: "Phân loại", context: "Bối cảnh giao tiếp", targetAudience: "Đối tượng giao tiếp", naturalExpressions: "Cách nói thường dùng", politeExpressions: "Cách nói lịch sự", cautionNotes: "Lưu ý văn hóa", comparisonNote: "So sánh khẩu ngữ & Trang trọng", practiceScenario: "Tình huống thực hành", note: "Ghi chú", culture: "Kiến thức văn hóa", rule: "Quy tắc ngữ âm", explanationVi: "Giải thích ví dụ", desc: "Giới thiệu", durationMin: "Thời lượng dự kiến (phút)", vocabList: "Từ vựng", grammarList: "Ngữ pháp", dialogue: "Hội thoại", phonetics: "Ngữ âm", reading: "Đọc hiểu", culturalNote: "Văn hóa giao tiếp",
};
const hidden = new Set(["id", "number", "vocabCount", "grammarCount", "isUnlockedDefault", "unlockedScheduleText", "lessonNumber", "level"]);
export function AudioButton({ text, phonetic = false }: { text: string; phonetic?: boolean }) {
  const [status, setStatus] = useState("");
  function play() {
    if (!("speechSynthesis" in window)) { setStatus("Trình duyệt chưa hỗ trợ phát âm."); return; }
    const target = phonetic ? cleanChineseForSpeech(text) : text;
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(target); utterance.lang = "zh-CN";
    utterance.onerror = () => setStatus("Chưa phát được âm thanh. Vui lòng thử lại."); setStatus(""); window.speechSynthesis.speak(utterance);
  }
  return <span className={s.audio}><button type="button" aria-label={`Nghe ${text}`} onClick={play}><Volume2 size={17}/></button>{status && <small role="status">{status}</small>}</span>;
}
function present(value: unknown) {
  return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0) && (typeof value !== "object" || !value || Object.keys(value).length > 0);
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
function ExampleRow({ value, index, phonetic }: { value: unknown; index: number; phonetic: boolean }) {
  if (!record(value)) return <p className={s.prose}>{String(value)}</p>;
  const { zh, pinyin, vi, speaker, ...extra } = value;
  return <article className={s.compactExample}><span className={s.exampleIndex}>{index + 1}</span><div>{!!speaker && <strong className={s.speaker}>{String(speaker)}</strong>}{!!zh && <p className={s.exampleChinese} lang="zh-CN">{String(zh)}</p>}{!!pinyin && <p className={s.pinyin}>{String(pinyin)}</p>}{!!vi && vi !== zh && <p className={s.exampleMeaning}>{String(vi)}</p>}<Fields data={extra} phonetic={phonetic}/></div>{typeof zh === "string" && <AudioButton text={zh} phonetic={phonetic}/>}</article>;
}
function Fields({ data, phonetic = false }: { data: unknown; phonetic?: boolean }) {
  if (!present(data)) return null;
  if (["string", "number", "boolean"].includes(typeof data)) return <p className={s.prose}>{typeof data === "boolean" ? data ? "Có" : "Không" : String(data)}</p>;
  if (Array.isArray(data)) return <div className={s.fieldList}>{data.map((value, index) => <Fields key={index} data={value} phonetic={phonetic}/>)}</div>;
  if (!record(data)) return null;
  return <div className={s.fields}>{Object.entries(data).filter(([key,value]) => !hidden.has(key) && present(value)).map(([key, value]) => {
    const rows = Array.isArray(value) ? value : [value];
    const examples = ["examples", "lines", "naturalExpressions", "politeExpressions"].includes(key);
    return <section key={key} className={s.field} data-field={key}><h4>{labels[key] || key.replace(/([a-z])([A-Z])/g,"$1 $2")}{examples && <small> ({rows.length})</small>}</h4>{examples ? <div className={s.exampleRows}>{rows.map((row,index) => <ExampleRow key={index} value={row} index={index} phonetic={phonetic}/>)}</div> : key === "commonMistakes" ? <div className={s.mistakeList}>{rows.map((row,index) => <article className={s.mistake} key={index}>{record(row) ? <>{!!row.incorrect && <p><strong>Cách dùng sai: </strong>{String(row.incorrect)}</p>}{!!row.correct && <p><strong>Cách dùng đúng: </strong>{String(row.correct)}</p>}{!!row.usageExplanation && <p><strong>Giải thích: </strong>{String(row.usageExplanation)}</p>}<Fields data={Object.fromEntries(Object.entries(row).filter(([field])=>!["incorrect","correct","usageExplanation"].includes(field)))}/></> : <p>{String(row)}</p>}</article>)}</div> : Array.isArray(value) && value.every(item => typeof item === "string") ? <div className={s.tagList}>{value.map((text,index) => <span key={index}>{text}</span>)}</div> : typeof value === "string" && ["zh","hanzi","exampleZh","contentZh","originalText","keySentence","structure"].includes(key) ? <div className={s.readingText}><p className={s.chinese} lang="zh-CN">{value}</p>{["contentZh","originalText"].includes(key) && <AudioButton text={value}/>}</div> : <Fields data={value} phonetic={phonetic}/>}</section>;
  })}</div>;
}
export default function KnowledgeDetails({ item }: { item: KnowledgeItem }) {
  const subtitle = item.kind === "vocab" ? String(item.data.pinyin || item.subtitle) : item.kind === "reading" ? String(item.data.titleVi || item.subtitle) : item.kind === "dialogue" ? item.subtitle : "";
  const data = compactKnowledgeData(item.data, [item.title, subtitle]);
  if (item.kind === "vocab") { delete data.hanzi; delete data.pinyin; }
  const examples = Array.isArray(data.examples) ? data.examples : [];
  return <div className={s.knowledge} data-knowledge-detail={item.id} data-knowledge-kind={item.kind}><header className={s.knowledgeHeading}><div><h3 lang="zh-CN">{item.title}</h3>{subtitle && <p>{subtitle}</p>}</div>{item.kind === "vocab" && <AudioButton text={String(item.data.hanzi || item.title)}/>}</header><Fields data={data} phonetic={item.kind === "phonetics"}/>{item.kind === "vocab" && examples.length < 2 && <p className={s.hint}>Giáo trình hiện có {examples.length} ví dụ cho từ này; chưa có đủ hai câu ví dụ.</p>}</div>;
}
