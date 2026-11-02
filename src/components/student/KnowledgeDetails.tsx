"use client";
import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { KnowledgeItem } from "@/lib/self-study-knowledge";
import { cleanChineseForSpeech } from "@/lib/chinese-speech";
import s from "./SelfStudyLessonDetail.module.css";
const labels: Record<string, string> = {
  meaning: "Nghĩa tiếng Việt", meaningVi: "Nghĩa tiếng Việt", usageExplanation: "Cách dùng", usagePatterns: "Cấu trúc & Mẫu dùng", examples: "Ví dụ minh họa", comparison: "So sánh", commonMistakes: "Lỗi sai thường gặp", type: "Từ loại", wordType: "Từ loại", exampleZh: "Câu ví dụ", examplePy: "Pinyin ví dụ", exampleVi: "Dịch ví dụ", structure: "Cấu trúc", summary: "Tổng quan", usageSteps: "Các bước sử dụng", usageContexts: "Bối cảnh sử dụng", example: "Ví dụ", explanation: "Giải thích", notes: "Lưu ý", memo: "Ghi nhớ", usage: "Cách sử dụng", title: "Tiêu đề", titleZh: "Tiêu đề tiếng Trung", titleVi: "Tiêu đề tiếng Việt", zh: "Tiếng Trung", vi: "Nghĩa tiếng Việt", py: "Pinyin", pinyin: "Pinyin", incorrect: "Cách dùng sai", correct: "Cách dùng đúng", speaker: "Nhân vật", lines: "Nội dung hội thoại", contentZh: "Nguyên văn tiếng Trung", originalText: "Nguyên văn", contentPy: "Pinyin bài đọc", contentVi: "Bản dịch", translation: "Bản dịch", analysisExplanation: "Phân tích tổng quan", mainEvent: "Diễn biến chính", keywords: "Từ khóa", keySentence: "Câu then chốt", evidenceExplanation: "Dẫn chứng & Cơ sở", mainIdea: "Ý chính", mainIdeaExplanation: "Giải thích ý chính", secondaryDetails: "Chi tiết bổ trợ", commonTrap: "Bẫy thường gặp", readingTip: "Mẹo đọc hiểu", wordCount: "Số từ", extraVocabs: "Từ vựng mở rộng", hanzi: "Chữ Hán", tag: "Phân loại", context: "Bối cảnh giao tiếp", targetAudience: "Đối tượng giao tiếp", naturalExpressions: "Cách nói thường dùng", politeExpressions: "Cách nói lịch sự", cautionNotes: "Lưu ý văn hóa", comparisonNote: "So sánh khẩu ngữ & Trang trọng", practiceScenario: "Tình huống thực hành", note: "Ghi chú", culture: "Kiến thức văn hóa", rule: "Quy tắc ngữ âm", explanationVi: "Giải thích ví dụ", desc: "Giới thiệu", durationMin: "Thời lượng dự kiến (phút)", vocabList: "Từ vựng", grammarList: "Ngữ pháp", dialogue: "Hội thoại", phonetics: "Ngữ âm", reading: "Đọc hiểu", culturalNote: "Văn hóa giao tiếp",
};
const hidden = new Set(["id", "number", "vocabCount", "grammarCount", "isUnlockedDefault", "unlockedScheduleText"]);
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
function present(value: unknown) { return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0); }
function Fields({ data, phonetic = false, depth = 0 }: { data: unknown; phonetic?: boolean; depth?: number }) {
  if (!present(data)) return null;
  if (typeof data === "string" || typeof data === "number") return <p className={s.prose}>{String(data)}{phonetic && typeof data === "string" && <AudioButton text={data} phonetic/>}</p>;
  if (Array.isArray(data)) return <div className={s.fieldList}>{data.map((value, index) => <article key={index} className={s.example}><Fields data={value} phonetic={phonetic} depth={depth + 1}/></article>)}</div>;
  if (typeof data !== "object" || !data) return null;
  const object = data as Record<string, unknown>;
  const speech = object.zh || object.exampleZh || object.contentZh || object.originalText;
  return <div className={s.fields}>{typeof speech === "string" && <div className={s.audioRow}><AudioButton text={speech}/></div>}{Object.entries(object).filter(([key, value]) => !hidden.has(key) && present(value) && !(key === "meaning" && object.meaningVi === value) && !(key === "originalText" && object.contentZh === value) && !(key === "translation" && object.contentVi === value)).map(([key, value]) => <section key={key} className={s.field} data-field={key}><h4>{labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2")}</h4>{typeof value === "string" && ["zh", "hanzi", "exampleZh", "contentZh", "originalText", "keySentence", "structure"].includes(key) ? <p className={s.chinese} lang="zh-CN">{value}</p> : <Fields data={value} phonetic={phonetic && key === "examples"} depth={depth + 1}/>}</section>)}</div>;
}
export default function KnowledgeDetails({ item }: { item: KnowledgeItem }) {
  const data = item.data;
  const examples = Array.isArray(data.examples) ? data.examples : data.exampleZh ? [data.exampleZh] : [];
  return <div className={s.knowledge} data-knowledge-detail={item.id} data-knowledge-kind={item.kind}><header className={s.knowledgeHeading}><div><h3 lang="zh-CN">{item.title}</h3><p>{item.subtitle}</p></div>{item.kind === "vocab" && <AudioButton text={String(data.hanzi || item.title)}/>}</header><Fields data={Object.fromEntries(Object.entries(data).filter(([key]) => !(item.kind === "vocab" && ["hanzi", "pinyin"].includes(key))))} phonetic={item.kind === "phonetics"}/>{item.kind === "vocab" && examples.length < 2 && <p className={s.hint}>Giáo trình hiện có {examples.length} ví dụ cho từ này; chưa có đủ hai câu ví dụ.</p>}</div>;
}
