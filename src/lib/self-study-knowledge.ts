import type { Hsk1FullLesson } from "./hsk1-full-lessons";
export const studySections = [
  { id: "vocab", label: "Từ vựng" }, { id: "grammar", label: "Ngữ pháp" },
  { id: "dialogue", label: "Hội thoại" }, { id: "reading", label: "Đọc hiểu" },
  { id: "culture_detail", label: "Văn hóa giao tiếp" }, { id: "phonetics", label: "Ngữ âm" },
] as const;
export type StudySection = typeof studySections[number]["id"];
export type KnowledgeKind = "lesson" | "vocab" | "grammar" | "dialogue" | "reading" | "culture" | "phonetics";
export type KnowledgeItem = { id: string; kind: KnowledgeKind; section: StudySection; level: number; lessonNumber: number; lessonTitle: string; title: string; subtitle: string; data: Record<string, unknown> };
export type PersonalNote = { id: string; title: string; body: string; hanzi: string; pinyin: string; meaning: string; sourceId?: string; updatedAt: string };
function hash(value: string) { let result = 2166136261; for (let i = 0; i < value.length; i++) { result ^= value.charCodeAt(i); result = Math.imul(result, 16777619); } return (result >>> 0).toString(36); }
export function lessonKnowledge(lesson: Hsk1FullLesson, level: number): KnowledgeItem[] {
  const item = (kind: KnowledgeKind, section: StudySection, title: string, subtitle: string, value: unknown): KnowledgeItem => {
    const data = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    return { id: `${level}:${lesson.number}:${kind}:${hash(JSON.stringify(data))}`, kind, section, level, lessonNumber: lesson.number, lessonTitle: lesson.titleZh, title, subtitle, data };
  };
  const result: KnowledgeItem[] = [
    ...lesson.vocabList.map(word => item("vocab", "vocab", word.hanzi, word.pinyin, word)),
    ...lesson.grammarList.map(rule => item("grammar", "grammar", rule.titleZh || rule.title, rule.summary || rule.structure, rule)),
  ];
  if (lesson.dialogue.length) result.push(item("dialogue", "dialogue", "Hội thoại · " + lesson.titleZh, lesson.titleVi, { lines: lesson.dialogue }));
  if (lesson.reading && (lesson.reading.contentZh || lesson.reading.originalText)) result.push(item("reading", "reading", lesson.reading.titleZh || lesson.titleZh, lesson.reading.titleVi || lesson.titleVi, lesson.reading));
  if (lesson.culture || Object.values(lesson.culturalNote || {}).some(value => typeof value === "string" ? !!value.trim() : Array.isArray(value) && value.length > 0)) result.push(item("culture", "culture_detail", "Văn hóa · " + lesson.titleZh, lesson.titleVi, { ...lesson.culturalNote, ...(lesson.culture ? { culture: lesson.culture } : {}) }));
  if (lesson.phonetics.title || lesson.phonetics.rule || lesson.phonetics.examples.length) result.push(item("phonetics", "phonetics", lesson.phonetics.title || "Ngữ âm", lesson.titleVi, lesson.phonetics));
  return [...new Map(result.map(entry => [entry.id, entry])).values()];
}
export function wholeLessonItem(lesson: Hsk1FullLesson, level: number): KnowledgeItem {
  return { id: `${level}:${lesson.number}`, kind: "lesson", section: "vocab", level, lessonNumber: lesson.number, lessonTitle: lesson.titleZh, title: lesson.titleZh, subtitle: lesson.titleVi, data: JSON.parse(JSON.stringify(lesson)) };
}
export function completionPercent(lesson: Hsk1FullLesson, level: number, completed: string[]) {
  const items = lessonKnowledge(lesson, level);
  return items.length ? Math.round(items.filter(item => completed.includes(item.id)).length / items.length * 100) : 0;
}
