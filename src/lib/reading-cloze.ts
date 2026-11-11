export const WORD_BANK = "reading_word_bank";
export const CLOZE_PASSAGE = "reading_cloze_passage";
export const CLOZE_CODES = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export function isReadingCloze(type: unknown) {
  return type === WORD_BANK || type === CLOZE_PASSAGE;
}

export function passageParts(passage: string) {
  return passage.split(/(\[blank[1-9]\d*\])/g).filter(Boolean).map(part => {
    const match = /^\[(blank[1-9]\d*)\]$/.exec(part);
    return match ? { blankId: match[1] } : { text: part };
  });
}

export function wordSentenceParts(sentence: string) {
  return sentence.split("[blank]");
}

type Choice = { id: string; text: string; pinyin?: string };
type ClozeQuestion = { content: string; correctAnswer: string; blankId?: string; options?: unknown[] };

export function clozeChoice(option: unknown): option is Choice {
  if (!option || typeof option !== "object") return false;
  const item = option as Partial<Choice>;
  return typeof item.id === "string" && typeof item.text === "string" &&
    (item.pinyin === undefined || typeof item.pinyin === "string");
}

function validChoices(options: unknown[], min: number) {
  return options.length >= min && options.length <= CLOZE_CODES.length &&
    options.every(option => clozeChoice(option) && CLOZE_CODES.includes(option.id) && /\p{Script=Han}/u.test(option.text)) &&
    new Set(options.map(option => (option as Choice).id)).size === options.length;
}

export function repeatedWordAnswer(questions: readonly ClozeQuestion[]) {
  const answers = questions.map(q => q.correctAnswer).filter(Boolean);
  return new Set(answers).size !== answers.length;
}

export function readingClozeIssues(
  type: typeof WORD_BANK | typeof CLOZE_PASSAGE,
  group: { words?: Choice[]; passage?: string; custom?: boolean },
  questions: readonly ClozeQuestion[],
) {
  const issues: string[] = [];
  if (type === WORD_BANK) {
    const words = group.words || [];
    if (!validChoices(words, 2)) issues.push("Nhập ít nhất hai từ chữ Hán có mã lựa chọn riêng.");
    if (!group.custom && (questions.length !== 5 || words.length !== 6 ||
      !CLOZE_CODES.slice(0, 6).every(code => words.some(word => word.id === code)))) {
      issues.push("Đề HSK chuẩn cần 5 câu và 6 từ A–F.");
    }
    if (questions.some(q => wordSentenceParts(q.content).length !== 2 || /\[blank[^\]]*\]/.test(q.content.replace("[blank]", "")) || !/\p{Script=Han}/u.test(q.content))) {
      issues.push("Mỗi câu cần nội dung chữ Hán và đúng một mã [blank].");
    }
    if (questions.some(q => !words.some(word => word.id === q.correctAnswer))) {
      issues.push("Chọn một đáp án đúng từ ngân hàng cho từng câu.");
    }
    if (!group.custom && repeatedWordAnswer(questions)) {
      issues.push("Đề HSK chuẩn cần dùng mỗi đáp án tối đa một lần và có một từ thừa.");
    }
    return issues;
  }

  const passage = group.passage || "";
  const markers = passageParts(passage).flatMap(part => part.blankId ? [part.blankId] : []);
  const ids = questions.map(q => q.blankId || "");
  if (!/\p{Script=Han}/u.test(passage) || !markers.length) issues.push("Nhập đoạn văn chữ Hán có mã [blank1], [blank2]…");
  if (new Set(markers).size !== markers.length || new Set(ids).size !== ids.length ||
    markers.length !== ids.length || ids.some(id => !markers.includes(id)) ||
    /\[blank[^\]]*\]/.test(passage.replace(/\[blank[1-9]\d*\]/g, ""))) {
    issues.push("Mỗi mã chỗ trống trong đoạn văn cần xuất hiện một lần và liên kết với đúng một câu hỏi.");
  }
  if (questions.some(q => !validChoices(q.options || [], 2))) issues.push("Mỗi chỗ trống cần ít nhất hai lựa chọn chữ Hán có mã riêng.");
  if (questions.some(q => !q.options?.some(option => clozeChoice(option) && option.id === q.correctAnswer))) {
    issues.push("Chọn đáp án đúng cho từng chỗ trống.");
  }
  return issues;
}

export const PASSAGE_CHOICE = "reading_passage_choice";
export const PASSAGE_JUDGEMENT = "reading_passage_judgement";
export const JUDGEMENT_SECTION = "reading_judgement_section";
export const JUDGEMENT_OPTIONS = [{id:"true",text:"√ Đúng"},{id:"false",text:"× Sai"}];
export function isReadingPassage(type: unknown): type is typeof PASSAGE_CHOICE | typeof PASSAGE_JUDGEMENT {
  return type === PASSAGE_CHOICE || type === PASSAGE_JUDGEMENT;
}
export const PASSAGE_SECTION = "reading_passage_section";
export const CLOZE_SECTION = "reading_cloze_section";

export function isReadingSection(type: unknown): type is typeof PASSAGE_SECTION | typeof CLOZE_SECTION | typeof JUDGEMENT_SECTION {
  return type === PASSAGE_SECTION || type === CLOZE_SECTION || type === JUDGEMENT_SECTION;
}

export function passageChoiceIssues(passage: string, questions: readonly {
  content: string;
  options: unknown[];
  correctAnswer: string;
}[]) {
  const issues: string[] = [];
  if (!/\p{Script=Han}/u.test(passage)) issues.push("Nhập đoạn văn chữ Hán.");
  if (!questions.length || questions.some(q => !/\p{Script=Han}/u.test(q.content))) {
    issues.push("Nhập nội dung chữ Hán cho từng câu hỏi nhỏ.");
  }
  if (questions.some(q => q.options.length !== 4 || !["A", "B", "C", "D"].every(id =>
    q.options.some(option => clozeChoice(option) && option.id === id && option.text.trim())
  ))) issues.push("Mỗi câu cần đủ bốn lựa chọn A, B, C, D.");
  if (questions.some(q => !["A", "B", "C", "D"].includes(q.correctAnswer))) {
    issues.push("Chọn đáp án đúng cho từng câu hỏi nhỏ.");
  }
  return issues;
}

export function passageJudgementIssues(passage: string, questions: readonly {
  content: string;
  correctAnswer: string;
  evidence?: string;
}[]) {
  const issues: string[] = [];
  if (!/\p{Script=Han}/u.test(passage)) issues.push("Nhập đoạn văn chữ Hán.");
  if (!questions.length || questions.some(question => !/\p{Script=Han}/u.test(question.content))) {
    issues.push("Nhập phát biểu chữ Hán cho từng câu hỏi nhỏ.");
  }
  if (questions.some(question => !JUDGEMENT_OPTIONS.some(option => option.id === question.correctAnswer))) {
    issues.push("Chọn √ Đúng hoặc × Sai cho từng phát biểu.");
  }
  if (questions.some(question => question.evidence?.trim() && !passage.includes(question.evidence.trim()))) {
    issues.push("Căn cứ cần là một đoạn trích nguyên văn có trong bài đọc.");
  }
  return issues;
}
