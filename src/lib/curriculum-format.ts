import {normalizeReading,normalizeCulturalNote} from "./lesson-rich-content";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";

export type CurriculumScope = "lessons" | "vocab" | "grammar" | "dialogue" | "phonetics" | "culture";
export const curriculumScopes: { id: CurriculumScope; label: string; columns: string[] }[] = [
  { id: "lessons", label: "Bài học", columns: ["number", "titleZh", "titleVi", "pinyin", "desc", "durationMin"] },
  { id: "vocab", label: "Từ vựng", columns: ["lessonNumber", "hanzi", "pinyin", "meaning", "type", "exampleZh", "examplePy", "exampleVi"] },
  { id: "grammar", label: "Ngữ pháp", columns: ["lessonNumber", "title", "structure", "example", "explanation"] },
  { id: "dialogue", label: "Hội thoại", columns: ["lessonNumber", "speaker", "zh", "pinyin", "vi"] },
  { id: "phonetics", label: "Phát âm", columns: ["lessonNumber", "title", "rule", "examples"] },
  { id: "culture", label: "Văn hóa", columns: ["lessonNumber", "culture"] },
];
export class CurriculumFormatError extends Error {}
type Row = Record<string, unknown>;
function object(value: unknown, path: string): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CurriculumFormatError(`${path}: cần một đối tượng JSON.`);
  return value as Row;
}
function string(row: Row, key: string, path: string, required = false, max = 20000) {
  const value = row[key] ?? "";
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new CurriculumFormatError(`${path}.${key}: ${required ? "không được trống, " : ""}phải là văn bản tối đa ${max} ký tự.`);
  return value.trim();
}
function array(value: unknown, path: string, max = 2000): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) throw new CurriculumFormatError(`${path}: phải là danh sách tối đa ${max} mục.`);
  return value;
}
export function blankLesson(level: number, number: number): Hsk1FullLesson {
  return { id: `hsk${level}-${String(number).padStart(2, "0")}`, number, titleZh: "", titleVi: "", pinyin: "", desc: "", durationMin: 45, vocabCount: 0, grammarCount: 0, isUnlockedDefault: true, unlockedScheduleText: "Đã mở", vocabList: [], grammarList: [], dialogue: [], phonetics: { title: "", rule: "", examples: [] }, culture: "" };
}
function sectionItem(scope: Exclude<CurriculumScope, "lessons">, value: unknown, path: string): Row {
  const row = object(value, path);
  const field = (key: string, required = false) => string(row, key, path, required);
  switch (scope) {
    case "vocab": return { ...(row.id ? { id: field("id") } : {}), hanzi: field("hanzi", true), pinyin: field("pinyin", true), meaning: field("meaning", true), type: field("type"), exampleZh: field("exampleZh"), examplePy: field("examplePy"), exampleVi: field("exampleVi") };
    case "grammar": return { title: field("title", true), structure: field("structure", true), example: field("example", true), explanation: field("explanation") };
    case "dialogue": return { speaker: field("speaker", true), zh: field("zh", true), pinyin: field("pinyin"), vi: field("vi", true) };
    case "phonetics": return { title: field("title"), rule: field("rule"), examples: array(row.examples, path + ".examples", 200).map((value, index) => { if (typeof value !== "string") throw new CurriculumFormatError(`${path}.examples[${index}]: phải là văn bản.`); return value; }) };
    case "culture": return { culture: field("culture") };
  }
}
export function normalizeLessons(value: unknown, level: number): Hsk1FullLesson[] {
  const numbers = new Set<number>(); const ids = new Set<string>();
  return array(value, "lessons", 500).map((value, index) => {
    const path = `Bài ở dòng ${index + 1}`; const row = object(value, path);
    const number = Number(row.number);
    if (!Number.isSafeInteger(number) || number < 1 || number > 9999 || numbers.has(number)) throw new CurriculumFormatError(`${path}: số bài phải từ 1 đến 9999 và không được trùng.`);
    numbers.add(number);
    const base = blankLesson(level, number);
    const titleZh = string(row, "titleZh", path); const titleVi = string(row, "titleVi", path);
    if (!titleZh && !titleVi) throw new CurriculumFormatError(`${path}: cần tiêu đề tiếng Trung hoặc tiếng Việt.`);
    const id = string(row, "id", path, false, 150) || base.id;
    if (ids.has(id)) throw new CurriculumFormatError(`${path}: mã bài bị trùng.`); ids.add(id);
    const durationMin = Number(row.durationMin ?? 45);
    if (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 1440) throw new CurriculumFormatError(`${path}.durationMin: cần số phút từ 1 đến 1440.`);
    if (row.isUnlockedDefault !== undefined && typeof row.isUnlockedDefault !== "boolean") throw new CurriculumFormatError(`${path}.isUnlockedDefault: phải là true hoặc false.`);
    const vocabList = array(row.vocabList, path + ".vocabList").map((v, i) => sectionItem("vocab", v, `${path}.vocabList[${i + 1}]`));
    const grammarList = array(row.grammarList, path + ".grammarList").map((v, i) => sectionItem("grammar", v, `${path}.grammarList[${i + 1}]`));
    const dialogue = array(row.dialogue, path + ".dialogue").map((v, i) => sectionItem("dialogue", v, `${path}.dialogue[${i + 1}]`));
    return { ...base, id, number, titleZh, titleVi, durationMin, pinyin: string(row, "pinyin", path), desc: string(row, "desc", path), vocabList, grammarList, dialogue, vocabCount: vocabList.length, grammarCount: grammarList.length, isUnlockedDefault: row.isUnlockedDefault !== false, unlockedScheduleText: string(row, "unlockedScheduleText", path) || base.unlockedScheduleText, phonetics: sectionItem("phonetics", row.phonetics ?? base.phonetics, path + ".phonetics"), culture: string(row, "culture", path), grammarExercises: Array.isArray(row.grammarExercises) ? row.grammarExercises : [], reading: normalizeReading(row.reading,id), culturalNote: normalizeCulturalNote(row.culturalNote,string(row,"culture",path)) } as unknown as Hsk1FullLesson;
  }).sort((a, b) => a.number - b.number);
}

export function parseCurriculumCsv(text: string): Row[] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') { if (quoted && input[i + 1] === '"') { cell += '"'; i++; } else if (quoted || !cell) quoted = !quoted; else throw new CurriculumFormatError("CSV: dấu ngoặc kép không hợp lệ."); }
    else if (!quoted && (char === "," || char === "\n" || char === "\r")) {
      row.push(cell); cell = "";
      if (char !== ",") { if (row.some(value => value.trim())) rows.push(row); row = []; if (char === "\r" && input[i + 1] === "\n") i++; }
    } else cell += char;
  }
  if (quoted) throw new CurriculumFormatError("CSV: chưa đóng dấu ngoặc kép.");
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  const headers = rows.shift()?.map(value => value.trim());
  if (!headers?.length || new Set(headers).size !== headers.length || headers.some(value => !value)) throw new CurriculumFormatError("CSV: thiếu hoặc trùng tên cột.");
  return rows.map((values, index) => { if (values.length !== headers.length) throw new CurriculumFormatError(`CSV dòng ${index + 2}: số cột không khớp với tiêu đề.`); return Object.fromEntries(headers.map((key, i) => [key, values[i]])); });
}

export function applyCurriculumImport(current: Hsk1FullLesson[], input: unknown, level: number, scope: CurriculumScope, mode: "merge" | "replace", target?: number) {
  const envelope = !Array.isArray(input) ? object(input, "File") : null;
  if (envelope?.level !== undefined && Number(envelope.level) !== level) throw new CurriculumFormatError(`File dành cho HSK ${envelope.level}, đang chọn HSK ${level}.`);
  if (envelope?.scope && envelope.scope !== scope) throw new CurriculumFormatError("Loại dữ liệu trong file khác loại nhập đang chọn.");
  const raw = Array.isArray(input) ? input : envelope?.items ?? envelope?.lessons ?? (envelope?.lesson ? [envelope.lesson] : [envelope]);
  const rows = array(raw, "items");
  const next = structuredClone(current);
  if (scope === "lessons") {
    const imported = normalizeLessons(rows, level);
    if (target !== undefined && imported.some(lesson => lesson.number !== target)) throw new CurriculumFormatError(`Chỉ nhập Bài ${target} trong phạm vi đang chọn.`);
    if (mode === "replace") return target === undefined ? imported : normalizeLessons([...next.filter(lesson => lesson.number !== target), ...imported], level);
    for (const lesson of imported) { const index = next.findIndex(item => item.number === lesson.number);
      if (index < 0) next.push(lesson);
      else {
        // A metadata-only CSV/JSON row must not erase the lesson's other sections.
        const rawRow = rows.find(value => Number((value as Row).number) === lesson.number) as Row;
        const updated = { ...next[index], ...lesson, id: next[index].id };
        for (const key of Object.keys(next[index]) as (keyof Hsk1FullLesson)[]) if (!(key in rawRow)) Object.assign(updated, { [key]: next[index][key] });
        next[index] = updated;
      }
    }
  } else {
    const grouped = new Map<number, Row[]>();
    rows.forEach((value, index) => {
      const row = object(value, `Dòng ${index + 1}`); const number = Number(row.lessonNumber || target);
      if (!Number.isInteger(number) || !next.some(lesson => lesson.number === number)) throw new CurriculumFormatError(`Dòng ${index + 1}: lessonNumber phải trỏ đến bài đã có trong HSK ${level}.`);
      if (target !== undefined && number !== target) throw new CurriculumFormatError(`Dòng ${index + 1}: file thuộc Bài ${number}, đang chọn Bài ${target}.`);
      const candidate = scope === "phonetics" && typeof row.examples === "string" ? { ...row, examples: row.examples.split("|").map(v => v.trim()).filter(Boolean) } : row;
      const item = sectionItem(scope, candidate, `Dòng ${index + 1}`); grouped.set(number, [...(grouped.get(number) || []), item]);
    });
    if (!rows.length && mode === "replace" && target) grouped.set(target, []);
    for (const [number, items] of grouped) {
      const lesson = next.find(lesson => lesson.number === number)!;
      if (scope === "culture") { if (items.length > 1) throw new CurriculumFormatError(`Bài ${number}: văn hóa chỉ có một mục.`); lesson.culture = String(items[0]?.culture ?? ""); }
      else if (scope === "phonetics") { if (items.length > 1) throw new CurriculumFormatError(`Bài ${number}: phát âm chỉ có một mục.`); lesson.phonetics = (items[0] ?? blankLesson(level, number).phonetics) as unknown as Hsk1FullLesson["phonetics"]; }
      else {
        const key = scope === "vocab" ? "vocabList" : scope === "grammar" ? "grammarList" : "dialogue";
        const identity = (row: Row) => scope === "vocab" ? `${row.hanzi}\0${row.pinyin}` : scope === "grammar" ? `${row.title}\0${row.structure}` : `${row.speaker}\0${row.zh}`;
        const merged = new Map((mode === "replace" ? [] : lesson[key] as unknown as Row[]).map(row => [identity(row), row]));
        for (const item of items) merged.set(identity(item), { ...merged.get(identity(item)), ...item });
        Object.assign(lesson, { [key]: [...merged.values()] });
      }
    }
  }
  return normalizeLessons(next, level);
}

export function curriculumTemplate(scope: CurriculumScope, level: number, number = 1) {
  if (scope === "lessons") return { level, scope, lessons: [{ ...blankLesson(level, number), titleZh: "你好", titleVi: "Xin chào", pinyin: "nǐ hǎo" }] };
  const samples: Record<string, Row> = { vocab: { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "xin chào", type: "Lời chào", exampleZh: "你好，老师！", examplePy: "Nǐ hǎo, lǎoshī!", exampleVi: "Em chào cô!" }, grammar: { title: "Câu với 是", structure: "S + 是 + N", example: "我是学生。", explanation: "Giới thiệu người hoặc sự vật." }, dialogue: { speaker: "A", zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" }, phonetics: { title: "Thanh điệu", rule: "Đọc đúng bốn thanh.", examples: ["mā", "má", "mǎ", "mà"] }, culture: { culture: "Chào hỏi lịch sự với thầy cô." } };
  return { level, scope, items: [{ lessonNumber: number, ...samples[scope] }] };
}
export function curriculumTemplateCsv(scope: CurriculumScope, level: number, number = 1) {
  const sample = curriculumTemplate(scope, level, number);
  const rows = ("lessons" in sample ? sample.lessons : sample.items) ?? [];
  const columns = curriculumScopes.find(item => item.id === scope)!.columns;
  const cell = (value: unknown) => `"${String(Array.isArray(value) ? value.join("|") : value ?? "").replaceAll('"', '""')}"`;
  return "\uFEFF" + [columns.join(","), ...rows.map(row => columns.map(key => cell((row as unknown as Row)[key])).join(","))].join("\r\n");
}
