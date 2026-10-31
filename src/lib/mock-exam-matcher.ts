/**
 * Robust Answer Matcher for HSK Mock Exams
 * Handles exact matches, letter prefixes (A, B, C, D), parentheses/brackets (e.g. (A), [A], 【A】),
 * content without prefixes, option indices (0-based and 1-based), and whitespace/punctuation variations.
 */
export function isMockAnswerCorrect(
  userAns: string | undefined | null,
  correctAns: string | undefined | null,
  options?: string[]
): boolean {
  if (userAns === undefined || userAns === null || correctAns === undefined || correctAns === null) {
    return false;
  }

  const u = String(userAns).trim();
  const c = String(correctAns).trim();

  if (!u || !c) return false;

  // 1. Khớp tuyệt đối không phân biệt hoa/thường
  if (u.toLowerCase() === c.toLowerCase()) return true;

  // Trích xuất chữ cái đại diện A, B, C, D, E, F (hỗ trợ cả (A), [A], 【A】, A., A:, Đáp án: A)
  const getLetter = (s: string): string | null => {
    const trimmed = s.trim();
    if (/^[A-Fa-f]$/.test(trimmed)) return trimmed.toUpperCase();
    
    // Khớp mẫu như "A.", "A:", "A)", "A、", "A "
    const directMatch = trimmed.match(/^([A-Fa-f])[.:)）\-、\s]/);
    if (directMatch) return directMatch[1].toUpperCase();

    // Khớp mẫu trong ngoặc như "(A)", "[A]", "【A】", "（A）"
    const bracketMatch = trimmed.match(/^[\(\[【（\s]*([A-Fa-f])[\)\]】）\s]/);
    if (bracketMatch) return bracketMatch[1].toUpperCase();

    // Khớp mẫu chữ cái đứng độc lập trong câu như "Đáp án A", "Chọn B"
    const isolatedMatch = trimmed.match(/(?:đáp án|chọn|câu|option)[\s:]*([A-Fa-f])\b/i);
    if (isolatedMatch) return isolatedMatch[1].toUpperCase();

    return null;
  };

  // Làm sạch chuỗi: bỏ tiền tố A., bỏ ngoặc, bỏ dấu câu và khoảng trắng thừa
  const cleanContent = (s: string): string => {
    return s
      .replace(/^[\(\[【（\s]*[A-Fa-f0-9]+[\)\]】）.:\-、\s]*/, "")
      .replace(/^[•\-\*]\s*/, "")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'，。！？、“”‘’]/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  };

  const uLetter = getLetter(u);
  const cLetter = getLetter(c);

  // 2. Cùng chữ cái đại diện (ví dụ: userAns = "A. 你好", correctAns = "A" hoặc "(A)")
  if (uLetter && cLetter && uLetter === cLetter) return true;

  // 3. Khớp nội dung sau khi làm sạch
  const uContent = cleanContent(u);
  const cContent = cleanContent(c);
  if (uContent && cContent && uContent === cContent) return true;

  // 4. Đối chiếu với danh sách lựa chọn options
  if (Array.isArray(options) && options.length > 0) {
    const letters = ["A", "B", "C", "D", "E", "F"];

    // Tìm index của câu trả lời học sinh trong options
    const uIdx = options.findIndex((opt, idx) => {
      const o = String(opt).trim();
      const oLetter = getLetter(o);
      const oContent = cleanContent(o);
      return (
        o.toLowerCase() === u.toLowerCase() ||
        (oContent && uContent && oContent === uContent) ||
        (oLetter && uLetter && oLetter === uLetter) ||
        (uLetter && letters.indexOf(uLetter) === idx) ||
        (oContent && u.toLowerCase() === o.toLowerCase())
      );
    });

    // Tìm index của đáp án chuẩn trong options
    const cIdx = options.findIndex((opt, idx) => {
      const o = String(opt).trim();
      const oLetter = getLetter(o);
      const oContent = cleanContent(o);
      return (
        o.toLowerCase() === c.toLowerCase() ||
        (oContent && cContent && oContent === cContent) ||
        (oLetter && cLetter && oLetter === cLetter) ||
        (cLetter && letters.indexOf(cLetter) === idx) ||
        (cContent && c.toLowerCase() === o.toLowerCase())
      );
    });

    // Nếu đáp án chuẩn là chữ cái "A", "B", "C", "D"
    if (cLetter) {
      const targetIdx = letters.indexOf(cLetter);
      if (targetIdx !== -1) {
        if (uIdx === targetIdx || uLetter === cLetter) return true;
      }
    }

    // Nếu học sinh chọn chữ cái "A", "B", "C", "D" và đáp án chuẩn là nội dung text
    if (uLetter) {
      const studentIdx = letters.indexOf(uLetter);
      if (studentIdx !== -1) {
        if (cIdx === studentIdx || uLetter === cLetter) return true;
      }
    }

    // Nếu đáp án chuẩn là chỉ số số ("0", "1", "2")
    if (/^\d+$/.test(c)) {
      const num = parseInt(c, 10);
      // Hỗ trợ cả 0-based index và 1-based index
      if (uIdx === num || uIdx === num - 1) return true;
    }

    // Nếu học sinh trả lời là chỉ số số ("0", "1", "2")
    if (/^\d+$/.test(u)) {
      const num = parseInt(u, 10);
      if (cIdx === num || cIdx === num - 1) return true;
    }

    // Hai đáp án cùng trỏ đến một index hợp lệ trong options
    if (uIdx !== -1 && cIdx !== -1 && uIdx === cIdx) {
      return true;
    }
  }

  // 5. Khớp chứa chuỗi nếu chuỗi đủ dài (ví dụ: một bên có dấu ngoặc giải thích thêm)
  if (uContent.length >= 4 && cContent.length >= 4) {
    if (uContent.includes(cContent) || cContent.includes(uContent)) {
      return true;
    }
  }

  return false;
}
