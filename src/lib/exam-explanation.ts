export const examExplanationExample =
  "Giải thích từ vựng: 苹果 nghĩa là quả táo.\nGiải thích ngữ pháp: Mẫu 比 dùng để so sánh.";

export function examExplanationTopics(explanation: string) {
  const topics = { grammar: [] as string[], vocabulary: [] as string[] };
  const text = explanation.normalize("NFC").replace(/\r\n?/g, "\n");
  const headings = [...text.matchAll(
    /^[ \t]*giải[ \t]+thích[ \t]+(ngữ[ \t]+pháp|từ[ \t]+vựng)[ \t]*(?:[:：][ \t]*|(?=\n|$))/gim,
  )];
  for (const [index, heading] of headings.entries()) {
    const body = text.slice(heading.index + heading[0].length, headings[index + 1]?.index).trim();
    if (body) topics[/^ngữ/i.test(heading[1]) ? "grammar" : "vocabulary"].push(body);
  }
  return headings.length ? topics : null;
}
