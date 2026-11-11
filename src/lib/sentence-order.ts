export interface SentenceToken {
  id: string;
  text: string;
  pinyin?: string;
}

export function createSentenceToken(text: string, pinyin?: string): SentenceToken {
  return {
    id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    text: text.trim(),
    ...(pinyin ? { pinyin: pinyin.trim() } : {}),
  };
}

/**
 * Tách câu tiếng Trung thành các từ/cụm từ có ý nghĩa (2-4 chữ Hán giữ liền khối).
 * Không tách rời từng chữ Hán.
 */
export function segmentChineseSentence(sentence: string): SentenceToken[] {
  const trimmed = sentence.trim();
  if (!trimmed) return [];

  // 1. Nếu giáo viên chủ động dùng dấu phân cách / hoặc | hoặc khoảng trắng giữa các cụm
  if (trimmed.includes("/") || trimmed.includes("|") || /\s+/.test(trimmed)) {
    const rawParts = trimmed.split(/[/|\s]+/).map(p => p.trim()).filter(Boolean);
    if (rawParts.length > 1) {
      const tokens: SentenceToken[] = [];
      for (const part of rawParts) {
        // Nếu phần tử cuối kết thúc bằng dấu chấm/dấu câu, tách dấu câu thành thẻ riêng
        const match = /^(.*?)([。！？!?.])$/.exec(part);
        if (match && match[1]) {
          tokens.push(createSentenceToken(match[1]));
          tokens.push(createSentenceToken(match[2] === "." ? "。" : match[2]));
        } else {
          tokens.push(createSentenceToken(part));
        }
      }
      return tokens;
    }
  }

  // 2. Dùng Intl.Segmenter chuẩn zh-CN với granularity: "word"
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("zh-CN", { granularity: "word" });
      const rawSegments = [...segmenter.segment(trimmed)]
        .map((s: any) => String(s.segment).trim())
        .filter(Boolean);

      if (rawSegments.length > 0) {
        return rawSegments.map(word => createSentenceToken(word === "." ? "。" : word));
      }
    } catch {}
  }

  // 3. Fallback: nếu câu kết thúc bằng dấu câu, tách câu và dấu câu
  const match = /^(.*?)([。！？!?.])$/.exec(trimmed);
  if (match && match[1]) {
    return [createSentenceToken(match[1]), createSentenceToken(match[2] === "." ? "。" : match[2])];
  }

  return [createSentenceToken(trimmed)];
}

/**
 * Chuẩn hóa câu để so khớp: NFC, bỏ khoảng trắng thừa, chuẩn hóa dấu chấm.
 */
export function normalizeSentence(text: string): string {
  return String(text || "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, "")
    .replace(/\./g, "。")
    .replace(/!/g, "！")
    .replace(/\?/g, "？");
}

/**
 * Kiểm tra xem câu có dấu chấm/kết thúc hợp lệ hay không.
 */
export function hasEndingPunctuation(text: string): boolean {
  return /[。.!?！？]$/.test(text.trim());
}

/**
 * Chấm điểm câu sắp xếp:
 * - So sánh thứ tự/nội dung với đáp án chuẩn và các đáp án thay thế.
 * - BẮT BUỘC câu phải có dấu chấm/kết thúc mới được tính là đúng nếu đáp án chuẩn có dấu chấm.
 */
export function gradeSentenceOrder(
  userAnswer: string,
  correctAnswer: string,
  tokens?: { id: string; text: string }[],
  acceptedAnswers?: string | string[],
): { correct: boolean; reason?: string; assembled?: string } {
  let assembled = "";

  // 1. Phân giải câu trả lời của học sinh:
  // Nếu là mảng JSON của token IDs -> ghép các từ lại theo đúng thứ tự
  if (userAnswer.startsWith("[") && userAnswer.endsWith("]")) {
    try {
      const ids = JSON.parse(userAnswer);
      if (Array.isArray(ids)) {
        if (tokens && tokens.length > 0) {
          const map = new Map(tokens.map(t => [t.id, t.text]));
          assembled = ids.map(id => {
            if (map.has(id)) return map.get(id) || "";
            if (id === "tok_punct_period" || id === "。" || id === ".") return "。";
            if (id === "tok_punct_question" || id === "？" || id === "?") return "？";
            if (id === "tok_punct_exclamation" || id === "！" || id === "!") return "！";
            return "";
          }).join("");
        } else {
          assembled = ids.join("");
        }
      }
    } catch {
      assembled = userAnswer;
    }
  } else {
    assembled = userAnswer.trim();
  }

  if (!assembled) {
    return { correct: false, reason: "Chưa nhập hoặc ghép câu trả lời.", assembled: "" };
  }

  // 2. Kiểm tra dấu chấm câu bắt buộc:
  // Nếu câu đáp án chuẩn có dấu chấm (hoặc dấu câu kết thúc), câu của học sinh cũng phải có
  const expectedPunctuation = hasEndingPunctuation(correctAnswer);
  const userPunctuation = hasEndingPunctuation(assembled);

  if (expectedPunctuation && !userPunctuation) {
    return {
      correct: false,
      reason: "Câu trả lời thiếu dấu chấm câu (。) ở cuối câu.",
      assembled,
    };
  }

  // 3. Chuẩn hóa để so sánh
  const normUser = normalizeSentence(assembled);

  const targets: string[] = [correctAnswer];
  if (Array.isArray(acceptedAnswers)) {
    targets.push(...acceptedAnswers);
  } else if (typeof acceptedAnswers === "string" && acceptedAnswers.trim()) {
    targets.push(...acceptedAnswers.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean));
  }

  const isMatch = targets.some(target => {
    if (!target) return false;
    return normUser === normalizeSentence(target);
  });

  return {
    correct: isMatch,
    reason: isMatch ? undefined : "Thứ tự từ hoặc cấu trúc câu chưa chính xác.",
    assembled,
  };
}
