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
    case "vocab": {
      const hanzi = String(row.hanzi || row.word || "").trim();
      if (!hanzi) throw new CurriculumFormatError(`${path}: thiếu chữ Hán (hanzi).`);
      const pinyin = String(row.pinyin || row.py || "").trim();
      if (!pinyin) throw new CurriculumFormatError(`${path}: từ "${hanzi}" thiếu phiên âm pinyin.`);
      const meaning = String(row.meaningVi || row.meaning || row.vi || "").trim();
      if (!meaning) throw new CurriculumFormatError(`${path}: từ "${hanzi}" thiếu nghĩa tiếng Việt.`);

      let examples: { zh: string; pinyin: string; vi: string }[] = [];
      if (Array.isArray(row.examples)) {
        examples = row.examples.map((ex: any) => ({
          zh: String(ex?.zh || ex?.exampleZh || "").trim(),
          pinyin: String(ex?.pinyin || ex?.py || ex?.examplePy || "").trim(),
          vi: String(ex?.vi || ex?.meaningVi || ex?.exampleVi || "").trim(),
        })).filter((ex: any) => ex.zh);
      }
      if (examples.length === 0 && (row.exampleZh || row.example)) {
        examples.push({
          zh: String(row.exampleZh || row.example || "").trim(),
          pinyin: String(row.examplePy || "").trim(),
          vi: String(row.exampleVi || "").trim(),
        });
      }

      let usagePatterns: string[] = [];
      if (Array.isArray(row.usagePatterns)) {
        usagePatterns = row.usagePatterns.map(p => String(p).trim()).filter(Boolean);
      } else if (typeof row.usagePatterns === "string" && row.usagePatterns.trim()) {
        usagePatterns = row.usagePatterns.split(/[,;|]/).map(p => p.trim()).filter(Boolean);
      }

      let commonMistakes: { incorrect: string; correct: string; explanation: string }[] = [];
      if (Array.isArray(row.commonMistakes)) {
        commonMistakes = row.commonMistakes.map((m: any) => {
          if (typeof m === "string") return { incorrect: m, correct: "", explanation: "" };
          return {
            incorrect: String(m?.incorrect || m?.wrong || m?.zhWrong || "").trim(),
            correct: String(m?.correct || m?.right || m?.zhCorrect || "").trim(),
            explanation: String(m?.explanation || m?.explanationVi || m?.reason || "").trim(),
          };
        }).filter(m => m.incorrect || m.correct || m.explanation);
      } else if (typeof row.commonMistakes === "string" && row.commonMistakes.trim()) {
        commonMistakes = [{ incorrect: row.commonMistakes.trim(), correct: "", explanation: "" }];
      }

      return {
        ...(row.id ? { id: String(row.id) } : {}),
        hanzi,
        pinyin,
        meaning,
        meaningVi: String(row.meaningVi || meaning),
        usageExplanation: String(row.usageExplanation || row.usage || row.usageNote || "").trim(),
        usagePatterns,
        examples,
        commonMistakes,
        type: String(row.type || row.wordType || "Từ vựng"),
        exampleZh: examples[0]?.zh || String(row.exampleZh || row.example || ""),
        examplePy: examples[0]?.pinyin || String(row.examplePy || ""),
        exampleVi: examples[0]?.vi || String(row.exampleVi || ""),
      };
    }
    case "grammar": {
      const title = String(row.title || row.titleZh || row.name || "").trim();
      if (!title) throw new CurriculumFormatError(`${path}: điểm ngữ pháp thiếu tiêu đề (title).`);
      const titleZh = String(row.titleZh || "").trim();
      const structure = String(row.structure || row.pattern || title).trim();
      const summary = String(row.summary || row.desc || "").trim();
      const usageExplanation = String(row.usageExplanation || row.explanation || row.meaningVi || summary).trim();

      let examples: { zh: string; pinyin: string; vi: string; explanationVi?: string }[] = [];
      if (Array.isArray(row.examples)) {
        examples = row.examples.map((ex: any) => {
          if (typeof ex === "string") return { zh: ex, pinyin: "", vi: "", explanationVi: "" };
          return {
            zh: String(ex?.zh || ex?.example || "").trim(),
            pinyin: String(ex?.pinyin || ex?.py || "").trim(),
            vi: String(ex?.vi || ex?.meaningVi || "").trim(),
            explanationVi: String(ex?.explanationVi || ex?.explanation || "").trim(),
          };
        }).filter((ex: any) => ex.zh);
      }
      if (examples.length === 0 && row.example) {
        examples.push({
          zh: String(row.example).trim(),
          pinyin: "",
          vi: "",
          explanationVi: "",
        });
      }

      let usageSteps: string[] = [];
      if (Array.isArray(row.usageSteps)) {
        usageSteps = row.usageSteps.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof row.usageSteps === "string" && row.usageSteps.trim()) {
        usageSteps = row.usageSteps.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);
      }

      let usageContexts: string[] = [];
      if (Array.isArray(row.usageContexts)) {
        usageContexts = row.usageContexts.map(c => String(c).trim()).filter(Boolean);
      } else if (typeof row.usageContexts === "string" && row.usageContexts.trim()) {
        usageContexts = row.usageContexts.split(/\r?\n|;/).map(c => c.trim()).filter(Boolean);
      }

      let commonMistakes: any[] = [];
      if (Array.isArray(row.commonMistakes)) {
        commonMistakes = row.commonMistakes.map((m: any) => {
          if (typeof m === "string") return { incorrect: m, correct: "", explanation: "" };
          return {
            incorrect: String(m?.incorrect || m?.wrong || "").trim(),
            correct: String(m?.correct || m?.right || "").trim(),
            explanation: String(m?.explanation || m?.explanationVi || "").trim(),
          };
        });
      } else if (typeof row.commonMistakes === "string" && row.commonMistakes.trim()) {
        commonMistakes = [{ incorrect: row.commonMistakes.trim(), correct: "", explanation: "" }];
      }

      return {
        ...(row.id ? { id: String(row.id) } : {}),
        title,
        titleZh,
        summary: summary || usageExplanation,
        structure,
        usageExplanation,
        usageSteps,
        examples,
        usageContexts,
        comparison: String(row.comparison || "").trim(),
        commonMistakes,
        example: examples[0]?.zh || String(row.example || title),
        explanation: usageExplanation,
        notes: String(row.notes || ""),
        memo: String(row.memo || ""),
        usage: String(row.usage || usageExplanation),
      };
    }
    case "dialogue": {
      // Hỗ trợ cả trường hợp câu thoại là string đơn thuần (vd: "A: 你好 (nǐ hǎo) - Xin chào")
      if (typeof row === "string") {
        const text = (row as string).trim();
        const colonIdx = text.search(/[:：]/);
        let spk = "Người nói";
        let rest = text;
        if (colonIdx > 0 && colonIdx < 15) {
          spk = text.slice(0, colonIdx).trim();
          rest = text.slice(colonIdx + 1).trim();
        }
        return {
          speaker: spk || "A",
          zh: rest || text,
          pinyin: "",
          vi: rest || text,
        };
      }

      // Hỗ trợ các trường tên đa dạng: zh, content, text, chinese, hanzi, sentence, cn
      const zh = String(
        row.zh ||
        row.content ||
        row.text ||
        row.chinese ||
        row.hanzi ||
        row.sentence ||
        row.cn ||
        row.original ||
        ""
      ).trim();

      if (!zh) throw new CurriculumFormatError(`${path}: câu hội thoại thiếu nội dung tiếng Trung (zh / text / content).`);

      const speaker = String(
        row.speaker ||
        row.role ||
        row.name ||
        row.person ||
        row.author ||
        "A"
      ).trim();

      const pinyin = String(row.pinyin || row.py || "").trim();

      const vi = String(
        row.vi ||
        row.meaningVi ||
        row.meaning ||
        row.translation ||
        row.vietnamese ||
        row.dich ||
        zh
      ).trim();

      return {
        speaker: speaker || "A",
        zh,
        pinyin,
        vi,
      };
    }
    case "phonetics": {
      return {
        title: String(row.title || ""),
        rule: String(row.rule || ""),
        examples: Array.isArray(row.examples)
          ? row.examples.map(v => typeof v === "string" ? v : JSON.stringify(v))
          : typeof row.examples === "string"
            ? (row.examples as string).split("|").map(s => s.trim()).filter(Boolean)
            : [],
      };
    }
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
    const titleZh = String(row.titleZh || "").trim();
    const titleVi = String(row.titleVi || "").trim();
    const finalTitleZh = titleZh || `第${number}课`;
    const finalTitleVi = titleVi || `Bài ${number}`;
    const id = string(row, "id", path, false, 150) || base.id;
    if (ids.has(id)) throw new CurriculumFormatError(`${path}: mã bài bị trùng.`); ids.add(id);
    const durationMin = Number(row.durationMin ?? 45);
    if (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 1440) throw new CurriculumFormatError(`${path}.durationMin: cần số phút từ 1 đến 1440.`);
    if (row.isUnlockedDefault !== undefined && typeof row.isUnlockedDefault !== "boolean") throw new CurriculumFormatError(`${path}.isUnlockedDefault: phải là true hoặc false.`);
    const vocabList = array(row.vocabList ?? [], path + ".vocabList").map((v, i) => sectionItem("vocab", v, `${path}.vocabList[${i + 1}]`));
    const grammarList = array(row.grammarList ?? [], path + ".grammarList").map((v, i) => sectionItem("grammar", v, `${path}.grammarList[${i + 1}]`));
    const dialogue = array(row.dialogue ?? [], path + ".dialogue").map((v, i) => sectionItem("dialogue", v, `${path}.dialogue[${i + 1}]`));
    return { ...base, id, number, titleZh: finalTitleZh, titleVi: finalTitleVi, durationMin, pinyin: string(row, "pinyin", path), desc: string(row, "desc", path), vocabList, grammarList, dialogue, vocabCount: vocabList.length, grammarCount: grammarList.length, isUnlockedDefault: row.isUnlockedDefault !== false, unlockedScheduleText: string(row, "unlockedScheduleText", path) || base.unlockedScheduleText, phonetics: sectionItem("phonetics", row.phonetics ?? base.phonetics, path + ".phonetics"), culture: string(row, "culture", path), grammarExercises: Array.isArray(row.grammarExercises) ? row.grammarExercises : [], reading: normalizeReading(row.reading,id), culturalNote: normalizeCulturalNote(row.culturalNote,string(row,"culture",path)) } as unknown as Hsk1FullLesson;
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
  if (scope === "lessons") {
    return {
      level,
      scope,
      lessons: [{
        ...blankLesson(level, number),
        titleZh: "你好",
        titleVi: "Xin chào",
        pinyin: "nǐ hǎo",
        vocabList: [{
          hanzi: "你好",
          pinyin: "nǐ hǎo",
          meaningVi: "Xin chào",
          meaning: "Xin chào",
          usageExplanation: "Dùng để chào hỏi thông thường giữa bạn bè, người cùng trang lứa.",
          usagePatterns: ["Chào + Người: 你好！", "Chào số nhiều: 你们好！"],
          examples: [
            { zh: "你好，很高兴认识你！", pinyin: "Nǐ hǎo, hěn gāoxìng rènshí nǐ!", vi: "Xin chào, rất vui được làm quen với bạn!" },
            { zh: "老师，你好！", pinyin: "Lǎoshī, nǐ hǎo!", vi: "Em chào thầy/cô ạ!" }
          ],
          commonMistakes: [
            {
              incorrect: "你好吗？ (dùng làm lời chào khi mới gặp lần đầu)",
              correct: "你好！",
              explanation: "'你好吗？' có nghĩa là 'Bạn có khỏe không?', chỉ dùng với người quen đã lâu không gặp chứ không dùng như lời chào mở đầu."
            },
            {
              incorrect: "您好 (dùng cho bạn bè cùng trang lứa)",
              correct: "你好",
              explanation: "'您好' là kính ngữ dành cho người lớn tuổi, thầy cô hoặc cấp trên; không dùng với bạn bè cùng lứa."
            }
          ]
        }],
        grammarList: [{
          titleZh: "判断句“是”",
          title: "Câu khẳng định phán đoán với 是 (shì)",
          summary: "Dùng '是' nối giữa chủ ngữ và tân ngữ để biểu thị sự phán đoán hoặc khẳng định danh tính/tính chất.",
          structure: "Chủ ngữ (S) + 是 (shì) + Tân ngữ (O)",
          usageExplanation: "Từ '是' tương đương với từ 'là' trong tiếng Việt, dùng để xác định người hoặc sự vật thuộc về một định danh nào đó.",
          usageSteps: [
            "Bước 1: Xác định chủ ngữ (người hoặc vật cần giới thiệu).",
            "Bước 2: Thêm động từ phán đoán '是'.",
            "Bước 3: Đặt danh từ hoặc ngữ danh từ làm vị ngữ/tân ngữ phía sau."
          ],
          examples: [
            {
              zh: "我是学生。",
              pinyin: "Wǒ shì xuésheng.",
              vi: "Tôi là học sinh.",
              explanationVi: "Xác định danh tính của người nói là học sinh."
            },
            {
              zh: "他是中国人。",
              pinyin: "Tā shì Zhōngguó rén.",
              vi: "Anh ấy là người Trung Quốc.",
              explanationVi: "Khẳng định quốc tịch của chủ ngữ 'anh ấy'."
            }
          ],
          usageContexts: [
            "Giới thiệu nghề nghiệp, thân phận khi làm quen.",
            "Xác nhận đồ vật thuộc chủng loại nào trong cuộc sống."
          ],
          comparison: "Phân biệt với tiếng Việt: Trong tiếng Trung, trước tính từ không dùng '是' (Ví dụ: 'Tôi rất bận' là '我很忙', KHÔNG nói '我是很忙').",
          commonMistakes: [
            {
              incorrect: "我是很高兴。",
              correct: "我很高兴。",
              explanation: "Trước tính từ chỉ trạng thái biểu cảm không dùng động từ '是', mà dùng phó từ chỉ mức độ như '很'."
            }
          ]
        }],
        reading: {
          id: `hsk${level}-01-reading`,
          titleZh: "我的新同学",
          titleVi: "Bạn học mới của tôi",
          originalText: "今天班里来了一位新同学。他叫大卫，来自美国。大卫很热情，也很喜欢学中文。老师请他坐在我旁边。下课后，我们一起去食堂吃饭。我帮他点了中国菜，他说中国菜非常好吃。我们很快成为了好朋友。",
          translation: "Hôm nay lớp có một bạn học mới đến. Cậu ấy tên là David, đến từ nước Mỹ. David rất nhiệt tình và cũng rất thích học tiếng Trung. Cô giáo mời cậu ấy ngồi cạnh tôi. Sau giờ học, chúng tôi cùng nhau đến căng tin ăn cơm. Tôi giúp cậu ấy gọi món ăn Trung Quốc, cậu ấy khen đồ ăn Trung Quốc rất ngon. Chúng tôi nhanh chóng trở thành bạn tốt của nhau.",
          analysisExplanation: "Đoạn văn kể về trải nghiệm làm quen với bạn học quốc tế mới trong ngày đầu tiên đến lớp, sử dụng cấu trúc câu miêu tả tính cách, sở thích và các hoạt động thường ngày.",
          mainEvent: "Làm quen, giúp đỡ và kết bạn với bạn học mới người Mỹ (David) trong buổi học.",
          keywords: ["新同学 (bạn mới)", "热情 (nhiệt tình)", "学中文 (học tiếng Trung)", "食堂 (căng tin)", "好朋友 (bạn tốt)"],
          keySentence: "我们很快成为了好朋友。",
          evidenceExplanation: "Sau khi cùng nhau đi ăn cơm ở căng tin và hỗ trợ gọi món, sự gắn kết giúp hai bạn nhanh chóng trở thành bạn thân thiết.",
          mainIdea: "Tình bạn chân thành và sự giúp đỡ nhiệt tình giữa những người bạn học mới gặp.",
          mainIdeaExplanation: "Đoạn văn nhấn mạnh sự cởi mở, lòng hiếu khách và niềm vui khi cùng nhau học tập và chia sẻ văn hóa.",
          secondaryDetails: [
            "David là học sinh đến từ nước Mỹ.",
            "David ngồi cạnh nhân vật 'tôi' trong lớp học.",
            "Nhân vật 'tôi' đã giúp David gọi các món ăn Trung Quốc tại nhà ăn."
          ],
          commonTrap: "Bẫy câu hỏi chi tiết: Đề thi có thể hỏi 'David tự gọi món hay có người giúp?', thí sinh cần chú ý từ '帮' (tôi giúp cậu ấy) để không chọn nhầm.",
          readingTip: "Định vị nhanh các mốc thời gian (今天, 下课后) và hành động chính của từng nhân vật để nắm bắt mạch truyện một cách chính xác."
        }
      }]
    };
  }
  const samples: Record<string, Row> = {
    vocab: {
      hanzi: "你好",
      pinyin: "nǐ hǎo",
      meaningVi: "xin chào",
      meaning: "xin chào",
      usageExplanation: "Dùng để chào hỏi thông thường giữa bạn bè, người cùng trang lứa.",
      usagePatterns: ["Chào + Người: 你好！", "Chào số nhiều: 你们好！"],
      examples: [
        { zh: "你好，很高兴认识你！", pinyin: "Nǐ hǎo, hěn gāoxìng rènshí nǐ!", vi: "Xin chào, rất vui được làm quen với bạn!" },
        { zh: "老师，你好！", pinyin: "Lǎoshī, nǐ hǎo!", vi: "Em chào thầy/cô ạ!" }
      ],
      commonMistakes: [
        {
          incorrect: "你好吗？ (dùng làm câu chào lần đầu gặp)",
          correct: "你好！",
          explanation: "'你好吗？' mang nghĩa 'Bạn có khỏe không?', chỉ dùng với người quen đã lâu không gặp chứ không dùng như câu chào mở đầu."
        },
        {
          incorrect: "您好 (dùng cho bạn bè cùng trang lứa)",
          correct: "你好",
          explanation: "'您好' là kính ngữ dành cho người lớn tuổi, thầy cô hoặc cấp trên; không dùng với bạn bè thân thiết."
        }
      ],
      type: "Lời chào",
      exampleZh: "你好，很高兴认识你！",
      examplePy: "Nǐ hǎo, hěn gāoxìng rènshí nǐ!",
      exampleVi: "Xin chào, rất vui được làm quen với bạn!"
    },
    grammar: {
      titleZh: "判断句“是”",
      title: "Câu với 是",
      summary: "Dùng '是' nối giữa chủ ngữ và tân ngữ để biểu thị sự phán đoán hoặc khẳng định.",
      structure: "S + 是 + N",
      usageExplanation: "Giới thiệu người hoặc sự vật, tương đương với 'là' trong tiếng Việt.",
      usageSteps: [
        "Bước 1: Xác định chủ ngữ (người hoặc vật).",
        "Bước 2: Thêm động từ '是'.",
        "Bước 3: Đặt danh từ vị ngữ phía sau."
      ],
      examples: [
        {
          zh: "我是学生。",
          pinyin: "Wǒ shì xuésheng.",
          vi: "Tôi là học sinh.",
          explanationVi: "Khẳng định danh tính người nói là học sinh."
        }
      ],
      usageContexts: ["Giới thiệu bản thân", "Xác nhận danh tính đồ vật"],
      comparison: "Không dùng '是' trước tính từ biểu cảm (dùng '我很忙', không dùng '我是很忙').",
      commonMistakes: [
        {
          incorrect: "我是很高兴。",
          correct: "我很高兴。",
          explanation: "Trước tính từ không dùng '是', mà dùng phó từ chỉ mức độ như '很'."
        }
      ],
      example: "我是学生。",
      explanation: "Giới thiệu người hoặc sự vật."
    },
    dialogue: { speaker: "A", zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" },
    phonetics: { title: "Thanh điệu", rule: "Đọc đúng bốn thanh.", examples: ["mā", "má", "mǎ", "mà"] },
    culture: { culture: "Chào hỏi lịch sự với thầy cô." }
  };
  return { level, scope, items: [{ lessonNumber: number, ...samples[scope] }] };
}
export function curriculumTemplateCsv(scope: CurriculumScope, level: number, number = 1) {
  const sample = curriculumTemplate(scope, level, number);
  const rows = ("lessons" in sample ? sample.lessons : sample.items) ?? [];
  const columns = curriculumScopes.find(item => item.id === scope)!.columns;
  const cell = (value: unknown) => `"${String(Array.isArray(value) ? value.join("|") : value ?? "").replaceAll('"', '""')}"`;
  return "\uFEFF" + [columns.join(","), ...rows.map(row => columns.map(key => cell((row as unknown as Row)[key])).join(","))].join("\r\n");
}
