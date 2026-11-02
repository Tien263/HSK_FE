import { getLessonsByHskLevel, getLessonByNumber } from "./hsk-lessons-resolver";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";
import { getVocabSentenceFallback } from "./hsk2-vocab-examples";

export type SentenceSourceCategory = "dialogue" | "vocab" | "grammar" | "reading";

export interface LessonSentenceItem {
  id: string;
  hskLevel: number;
  lessonNumber: number;
  lessonTitleZh: string;
  lessonTitleVi: string;
  sourceCategory: SentenceSourceCategory;
  categoryLabel: string;
  detailTag: string; // e.g. "Nhân vật A", "Từ: 搞", "Cấu trúc: 把"
  zh: string;
  pinyin: string;
  vi: string;
  tip?: string;
}

export interface LessonSummaryMeta {
  number: number;
  titleZh: string;
  pinyin: string;
  titleVi: string;
  totalSentences: number;
  dialogueCount: number;
  vocabCount: number;
  grammarCount: number;
  readingCount: number;
}

/**
 * Trích xuất toàn bộ câu luyện (Bài khóa, Từ vựng, Ngữ pháp, Bài đọc) từ một bài học cụ thể
 */
export function extractSentencesFromLesson(lesson: Hsk1FullLesson, hskLevel: number): LessonSentenceItem[] {
  const result: LessonSentenceItem[] = [];
  const seenZh = new Set<string>();

  // 1. Bài khóa / Đoạn hội thoại (dialogue)
  if (Array.isArray(lesson.dialogue)) {
    lesson.dialogue.forEach((line, idx) => {
      const zh = (line.zh || "").trim();
      if (!zh || seenZh.has(zh)) return;
      seenZh.add(zh);

      const speakerLabel = line.speaker ? `Nhân vật ${line.speaker}` : `Thoại ${idx + 1}`;
      result.push({
        id: `hsk${hskLevel}-l${lesson.number}-dlg-${idx}`,
        hskLevel,
        lessonNumber: lesson.number,
        lessonTitleZh: lesson.titleZh,
        lessonTitleVi: lesson.titleVi,
        sourceCategory: "dialogue",
        categoryLabel: "Bài khóa · Hội thoại",
        detailTag: speakerLabel,
        zh,
        pinyin: line.pinyin || "",
        vi: line.vi || "",
        tip: `Ngữ cảnh hội thoại bài ${lesson.number}. Giữ cao độ tự nhiên như người bản xứ.`,
      });
    });
  }

  // 2. Bài đọc / Đoạn văn bài khóa (reading)
  if (lesson.reading && lesson.reading.contentZh) {
    const raw = lesson.reading.contentZh;
    // Tách theo dấu câu tiếng Trung (。！？)
    const rawParts = raw.split(/(?<=[。！？])/).map((s) => s.trim()).filter((s) => s.length > 2);
    rawParts.forEach((partZh, idx) => {
      if (seenZh.has(partZh)) return;
      seenZh.add(partZh);
      result.push({
        id: `hsk${hskLevel}-l${lesson.number}-read-${idx}`,
        hskLevel,
        lessonNumber: lesson.number,
        lessonTitleZh: lesson.titleZh,
        lessonTitleVi: lesson.titleVi,
        sourceCategory: "reading",
        categoryLabel: "Bài khóa · Bài đọc",
        detailTag: `Câu văn ${idx + 1}`,
        zh: partZh,
        pinyin: "",
        vi: lesson.reading?.translation || lesson.reading?.contentVi || "Đoạn văn đọc hiểu bài khóa",
        tip: "Luyện đọc diễn cảm, chú ý ngắt nhịp đúng cụm ngữ pháp.",
      });
    });
  }

  // 3. Kho câu ví dụ Từ vựng (vocabList)
  if (Array.isArray(lesson.vocabList)) {
    lesson.vocabList.forEach((v, vIdx) => {
      const word = v.hanzi;
      const wordPy = v.pinyin;
      const wordVi = v.meaningVi || v.meaning;

      if (Array.isArray(v.examples) && v.examples.length > 0) {
        v.examples.forEach((ex, exIdx) => {
          const zh = (ex.zh || "").trim();
          if (!zh || seenZh.has(zh)) return;
          seenZh.add(zh);

          result.push({
            id: `hsk${hskLevel}-l${lesson.number}-voc-${vIdx}-${exIdx}`,
            hskLevel,
            lessonNumber: lesson.number,
            lessonTitleZh: lesson.titleZh,
            lessonTitleVi: lesson.titleVi,
            sourceCategory: "vocab",
            categoryLabel: "Ví dụ Từ vựng",
            detailTag: `${word} (${wordPy})`,
            zh,
            pinyin: ex.pinyin || "",
            vi: ex.vi || "",
            tip: v.usageExplanation
              ? `${v.usageExplanation}`
              : `Ứng dụng từ '${word}' (${wordVi}). Chú ý vị trí trong câu.`,
          });
        });
      } else if (v.exampleZh) {
        const zh = v.exampleZh.trim();
        if (zh && !seenZh.has(zh)) {
          seenZh.add(zh);
          result.push({
            id: `hsk${hskLevel}-l${lesson.number}-voc-${vIdx}-0`,
            hskLevel,
            lessonNumber: lesson.number,
            lessonTitleZh: lesson.titleZh,
            lessonTitleVi: lesson.titleVi,
            sourceCategory: "vocab",
            categoryLabel: "Ví dụ Từ vựng",
            detailTag: `${word} (${wordPy})`,
            zh,
            pinyin: v.examplePy || "",
            vi: v.exampleVi || "",
            tip: `Ứng dụng từ '${word}' (${wordVi}). Chú ý vị trí trong câu.`,
          });
        }
      } else {
        // Tự động đối chiếu hoặc tạo câu ví dụ chuẩn mực cho từ vựng bài học
        const fallback = getVocabSentenceFallback(word, wordPy, wordVi, hskLevel);
        const zh = (fallback.zh || "").trim();
        if (zh && !seenZh.has(zh)) {
          seenZh.add(zh);
          result.push({
            id: `hsk${hskLevel}-l${lesson.number}-voc-${vIdx}-fb`,
            hskLevel,
            lessonNumber: lesson.number,
            lessonTitleZh: lesson.titleZh,
            lessonTitleVi: lesson.titleVi,
            sourceCategory: "vocab",
            categoryLabel: "Ví dụ Từ vựng",
            detailTag: `${word} (${wordPy})`,
            zh,
            pinyin: fallback.pinyin || "",
            vi: fallback.vi || "",
            tip: fallback.tip || `Ứng dụng từ '${word}' (${wordVi}).`,
          });
        }
      }
    });
  }

  // 4. Kho câu ví dụ Ngữ pháp (grammarList / grammar)
  const grammarItems = lesson.grammarList || (lesson as any).grammar || [];
  if (Array.isArray(grammarItems)) {
    grammarItems.forEach((g, gIdx) => {
      const gTitle = g.titleZh || g.title || `Ngữ pháp ${gIdx + 1}`;
      if (Array.isArray(g.examples) && g.examples.length > 0) {
        g.examples.forEach((ex, exIdx) => {
          const zh = (ex.zh || "").trim();
          if (!zh || seenZh.has(zh)) return;
          seenZh.add(zh);

          result.push({
            id: `hsk${hskLevel}-l${lesson.number}-grm-${gIdx}-${exIdx}`,
            hskLevel,
            lessonNumber: lesson.number,
            lessonTitleZh: lesson.titleZh,
            lessonTitleVi: lesson.titleVi,
            sourceCategory: "grammar",
            categoryLabel: "Ví dụ Ngữ pháp",
            detailTag: gTitle,
            zh,
            pinyin: ex.pinyin || ex.py || "",
            vi: ex.vi || "",
            tip: ex.explanationVi || g.structure || g.summary || "Điểm ngữ pháp trọng tâm của bài.",
          });
        });
      } else if (g.example) {
        const zh = g.example.trim();
        if (zh && !seenZh.has(zh)) {
          seenZh.add(zh);
          result.push({
            id: `hsk${hskLevel}-l${lesson.number}-grm-${gIdx}-0`,
            hskLevel,
            lessonNumber: lesson.number,
            lessonTitleZh: lesson.titleZh,
            lessonTitleVi: lesson.titleVi,
            sourceCategory: "grammar",
            categoryLabel: "Ví dụ Ngữ pháp",
            detailTag: gTitle,
            zh,
            pinyin: "",
            vi: g.explanation || "",
            tip: g.structure || "Điểm ngữ pháp trọng tâm của bài.",
          });
        }
      }
    });
  }

  return result;
}

/**
 * Lấy danh sách thống kê các bài học của một cấp HSK kèm số lượng câu có thể luyện
 */
export function getLessonSummariesForHsk(hskLevel: number): LessonSummaryMeta[] {
  const lessons = getLessonsByHskLevel(hskLevel);
  return lessons.map((l) => {
    const sentences = extractSentencesFromLesson(l, hskLevel);
    const dialogueCount = sentences.filter((s) => s.sourceCategory === "dialogue").length;
    const vocabCount = sentences.filter((s) => s.sourceCategory === "vocab").length;
    const grammarCount = sentences.filter((s) => s.sourceCategory === "grammar").length;
    const readingCount = sentences.filter((s) => s.sourceCategory === "reading").length;

    return {
      number: l.number,
      titleZh: l.titleZh,
      pinyin: l.pinyin,
      titleVi: l.titleVi,
      totalSentences: sentences.length,
      dialogueCount,
      vocabCount,
      grammarCount,
      readingCount,
    };
  });
}

/**
 * Lấy toàn bộ câu luyện của một bài học theo cấp HSK và số thứ tự bài
 */
export function getSentencesByHskAndLesson(hskLevel: number, lessonNumber: number): LessonSentenceItem[] {
  const lesson = getLessonByNumber(hskLevel, lessonNumber);
  if (!lesson) return [];
  return extractSentencesFromLesson(lesson, hskLevel);
}
