export interface GivenWord {
  id: string;
  word: string;
  pinyin?: string;
  meaning?: string;
}

export function createGivenWord(word: string, pinyin?: string, meaning?: string): GivenWord {
  return {
    id: `gw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    word: word.trim(),
    ...(pinyin ? { pinyin: pinyin.trim() } : {}),
    ...(meaning ? { meaning: meaning.trim() } : {}),
  };
}

/**
 * Phân tích nhanh chuỗi văn bản do giáo viên nhập thành danh sách các từ bắt buộc.
 * Hỗ trợ dấu gạch chéo (/), dấu phẩy (,), dấu chấm phẩy (;), gạch đứng (|), xuống dòng.
 * Ví dụ: "虽然 / 下雨 / 但是" -> [虽然, 下雨, 但是]
 */
export function parseQuickGivenWords(rawText: string): GivenWord[] {
  if (!rawText || !rawText.trim()) return [];
  const parts = rawText
    .split(/[/|,\n\r，；;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.map((part) => {
    // Nếu có dạng: 词语(pinyin) hoặc 词语 (pinyin)
    const match = /^([^\s(（]+)\s*[(（]([^)）]+)[)）]/.exec(part);
    if (match) {
      return createGivenWord(match[1], match[2]);
    }
    return createGivenWord(part);
  });
}

/**
 * Đếm số chữ Hán thực tế trong đoạn văn bản
 */
export function countHanzi(text: string): number {
  if (!text || typeof text !== "string") return 0;
  const match = text.match(/[\u4e00-\u9fa5]/g);
  return match ? match.length : 0;
}

/**
 * Kiểm tra xem câu trả lời của học sinh đã dùng đủ các từ bắt buộc chưa
 */
export function checkGivenWordsUsage(
  answer: string,
  givenWords: GivenWord[]
): { missing: string[]; allUsed: boolean } {
  const normAnswer = (answer || "").toLowerCase().replace(/\s+/g, "");
  const missing: string[] = [];

  for (const item of givenWords) {
    if (!item.word || !item.word.trim()) continue;
    const cleanWord = item.word.trim().toLowerCase().replace(/\s+/g, "");
    if (cleanWord && !normAnswer.includes(cleanWord)) {
      missing.push(item.word.trim());
    }
  }

  return {
    missing,
    allUsed: missing.length === 0,
  };
}
