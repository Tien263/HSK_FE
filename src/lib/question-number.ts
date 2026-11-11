type NumberedQuestion = { questionNumber?: unknown; questionNo?: unknown };

export function normalizeQuestionNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : undefined;
  }
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/^(?:câu|c)\s*/i, "");
    if (!/^\d+$/.test(cleaned)) return undefined;
    const number = Number(cleaned);
    return Number.isSafeInteger(number) && number > 0 ? number : undefined;
  }
  return undefined;
}

export function getQuestionNumber(question: NumberedQuestion): number | undefined {
  if (question.questionNumber !== undefined && question.questionNumber !== null) {
    return normalizeQuestionNumber(question.questionNumber);
  }
  const legacy = typeof question.questionNo === "string"
    ? question.questionNo.trim().replace(/^(?:câu|c)\s*/i, "")
    : question.questionNo;
  return normalizeQuestionNumber(legacy);
}

export function displayQuestionNumber(question: NumberedQuestion, fallback: number): number | string {
  return getQuestionNumber(question) ?? (typeof question.questionNo === "string" && question.questionNo.trim()
    ? question.questionNo.trim().replace(/^(?:câu|c)\s*/i, "")
    : fallback);
}

export function duplicateQuestionNumbers(questions: readonly NumberedQuestion[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const question of questions) {
    const number = getQuestionNumber(question);
    if (number === undefined) continue;
    if (seen.has(number)) duplicates.add(number);
    seen.add(number);
  }
  return [...duplicates].sort((a, b) => a - b);
}

export function nextQuestionNumber(questions: readonly NumberedQuestion[]): number {
  return questions.reduce((max, question) => Math.max(max, getQuestionNumber(question) || 0), 0) + 1;
}

export function suggestQuestionNumbers(questions: readonly NumberedQuestion[], start?: number): number[] {
  const used = new Set<number>();
  for (const q of questions) {
    const num = getQuestionNumber(q);
    if (num !== undefined) used.add(num);
  }
  let next = start !== undefined ? start : (used.size > 0 ? nextQuestionNumber(questions) : 1);
  return questions.map(question => {
    const number = getQuestionNumber(question);
    if (number !== undefined) return number;
    while (used.has(next)) next++;
    const assigned = next++;
    used.add(assigned);
    return assigned;
  });
}
