export const examExplanationExample =
  "Giải thích đáp án: Vì sao chọn đáp án này?\nGiải thích từ vựng: 苹果 nghĩa là quả táo.\nGiải thích ngữ pháp: Mẫu 比 dùng để so sánh.";

export function examExplanationTopics(explanation: string) {
  const topics = { grammar: [] as string[], vocabulary: [] as string[], answer: [] as string[] };
  const text = explanation.replace(/\r\n?/g, "\n");
  const headings = [...text.matchAll(
    /^[ \t]*giải[ \t]+thích[ \t]+(ngữ[ \t]+pháp|từ[ \t]+v[ựụ]ng|đáp[ \t]+án)[ \t]*(?:[:：][ \t]*|(?=\n|$))/gim,
  )];
  if (headings.length) {
    const intro = text.slice(0, headings[0].index).trim();
    if (intro) topics.answer.push(intro);
  }
  for (const [index, heading] of headings.entries()) {
    const body = text.slice(heading.index + heading[0].length, headings[index + 1]?.index).trim();
    if (body) topics[/^ngữ/i.test(heading[1]) ? "grammar" : /^từ/i.test(heading[1]) ? "vocabulary" : "answer"].push(body);
  }
  return headings.length ? topics : null;
}
