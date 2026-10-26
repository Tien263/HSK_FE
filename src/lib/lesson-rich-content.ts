import type {ReadingItem, CulturalNoteItem} from "./lesson-data";

function text(value: unknown, label: string, max = 30000): string {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max) throw new Error(`${label}: văn bản không hợp lệ.`);
  return value.trim();
}
function list(value: unknown): unknown[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 300) throw new Error("Danh sách nội dung không hợp lệ.");
  return value;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Cấu trúc học liệu không hợp lệ.");
  return value as Record<string, unknown>;
}
export function normalizeReading(value: unknown, lessonId: string): ReadingItem | undefined {
  if (value == null) return undefined;
  const row = record(value);
  return {
    id: text(row.id, "Mã bài đọc") || `${lessonId}-reading`,
    titleZh: text(row.titleZh, "Tên Trung"), titleVi: text(row.titleVi, "Tên Việt"),
    contentZh: text(row.contentZh, "Bài đọc"), contentPy: text(row.contentPy, "Pinyin"), contentVi: text(row.contentVi, "Bản dịch"),
    wordCount: [...text(row.contentZh, "Bài đọc").matchAll(/\p{Script=Han}/gu)].length,
    extraVocabs: list(row.extraVocabs).map((value, index) => {
      const word = record(value);
      return {id: text(word.id, "Mã từ") || `${lessonId}-reading-word-${index}`, hanzi: text(word.hanzi, "Chữ Hán"), pinyin: text(word.pinyin, "Pinyin"), meaningVi: text(word.meaningVi ?? word.meaning, "Nghĩa Việt"), exampleZh: text(word.exampleZh, "Ví dụ"), examplePy: text(word.examplePy, "Pinyin ví dụ"), exampleVi: text(word.exampleVi, "Dịch ví dụ"), tag: text(word.tag, "Nhãn")};
    }),
  };
}
export function normalizeCulturalNote(value: unknown, legacy = ""): CulturalNoteItem {
  if (value == null) return splitLegacyCulture(legacy);
  const row = record(value);
  const expressions = (key: string) => list(row[key]).map(value => {const item = record(value); return {zh: text(item.zh, key), py: text(item.py, key), vi: text(item.vi, key), usage: text(item.usage, key), note: text(item.note, key)};});
  return {context: text(row.context, "Bối cảnh", 1200), targetAudience: text(row.targetAudience, "Đối tượng"), naturalExpressions: expressions("naturalExpressions"), politeExpressions: expressions("politeExpressions"), cautionNotes: list(row.cautionNotes).map(value => text(value, "Lưu ý")), comparisonNote: text(row.comparisonNote, "Ngữ dụng"), practiceScenario: text(row.practiceScenario, "Thực hành")};
}
// Legacy prose is kept as culture, never merged with phonetics or invented as a reading.
export function splitLegacyCulture(value: string): CulturalNoteItem {
  const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const result: CulturalNoteItem = {naturalExpressions: [], politeExpressions: [], cautionNotes: []};
  if (!value.trim()) return result;
  if (!/Nhóm\s*\d/i.test(value)) {
    result.cautionNotes = lines;
    return result;
  }
  for (const line of lines) {
    const match = line.match(/Nhóm\s*\d+\s*:\s*([^:]+):\s*(.+)/i);
    if (!match) continue;
    for (const part of match[2].split(/;\s*/).map(item => item.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean)) {
      const phrase = part.match(/^([\p{Script=Han}，。！？、\s]+)[–—-]\s*(.+)$/u);
      if (phrase && /mẫu câu|lịch sự|tôn trọng/i.test(match[1])) {
        const item = {zh: phrase[1].trim(), py: "", vi: "", usage: phrase[2], note: phrase[2]};
        if (/lịch sự|tôn trọng/i.test(match[1])) result.politeExpressions!.push(item);
        else result.naturalExpressions!.push(item);
      } else result.cautionNotes!.push(part);
    }
  }
  if (!result.naturalExpressions!.length && !result.politeExpressions!.length && !result.cautionNotes!.length) result.cautionNotes = lines;
  return result;
}
