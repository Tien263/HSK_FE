/**
 * Robust Answer Matcher for HSK Mock Exams
 * Handles exact matches, letter prefixes (A, B, C, D), content without prefixes,
 * and options index matching.
 */
export function isMockAnswerCorrect(
  userAns: string | undefined | null,
  correctAns: string | undefined | null,
  options?: string[]
): boolean {
  if (!userAns || !correctAns) return false;

  const u = String(userAns).trim();
  const c = String(correctAns).trim();

  // 1. Khớp nguyên vẹn (không phân biệt hoa/thường)
  if (u.toLowerCase() === c.toLowerCase()) return true;

  // Trích xuất chữ cái đại diện A, B, C, D, E, F nếu có
  const getLetter = (s: string): string | null => {
    const trimmed = s.trim();
    if (/^[A-Fa-f]$/.test(trimmed)) return trimmed.toUpperCase();
    const match = trimmed.match(/^([A-Fa-f])[.:)）\s]/);
    if (match) return match[1].toUpperCase();
    return null;
  };

  // Trích xuất nội dung sau khi loại bỏ tiền tố A., B., C.
  const cleanContent = (s: string): string => {
    return s
      .replace(/^[A-Fa-f0-9]+[.:)）\s]+/, "")
      .replace(/^[•\-\*]\s*/, "")
      .trim()
      .toLowerCase();
  };

  const uLetter = getLetter(u);
  const cLetter = getLetter(c);

  // 2. Cùng chữ cái đại diện (ví dụ: userAns = "A. 你好", correctAns = "A")
  if (uLetter && cLetter && uLetter === cLetter) return true;

  // 3. Khớp nội dung sau khi bỏ tiền tố chữ cái
  const uContent = cleanContent(u);
  const cContent = cleanContent(c);
  if (uContent && cContent && uContent === cContent) return true;

  // 4. Đối chiếu vị trí trong mảng options
  if (Array.isArray(options) && options.length > 0) {
    const letters = ["A", "B", "C", "D", "E", "F"];

    // Tìm index của câu trả lời học sinh trong options
    const uIdx = options.findIndex((opt) => {
      const o = String(opt).trim();
      return (
        o.toLowerCase() === u.toLowerCase() ||
        (cleanContent(o) && cleanContent(o) === uContent) ||
        (getLetter(o) && getLetter(o) === uLetter)
      );
    });

    // Tìm index của đáp án chuẩn trong options
    const cIdx = options.findIndex((opt) => {
      const o = String(opt).trim();
      return (
        o.toLowerCase() === c.toLowerCase() ||
        (cleanContent(o) && cleanContent(o) === cContent) ||
        (getLetter(o) && getLetter(o) === cLetter)
      );
    });

    // Nếu đáp án chuẩn là chữ cái "A", "B", "C", "D"
    if (cLetter) {
      const targetIdx = letters.indexOf(cLetter);
      if (targetIdx !== -1 && (uIdx === targetIdx || uLetter === cLetter)) {
        return true;
      }
    }

    // Nếu học sinh chọn chữ cái "A", "B", "C", "D" và đáp án chuẩn là nội dung
    if (uLetter) {
      const studentIdx = letters.indexOf(uLetter);
      if (studentIdx !== -1 && (cIdx === studentIdx || uLetter === cLetter)) {
        return true;
      }
    }

    // Nếu đáp án chuẩn là chỉ số số ("0", "1", "2")
    if (/^\d+$/.test(c)) {
      const numIdx = parseInt(c, 10);
      if (uIdx === numIdx) return true;
    }

    // Cùng trỏ đến một lựa chọn
    if (uIdx !== -1 && cIdx !== -1 && uIdx === cIdx) {
      return true;
    }
  }

  return false;
}
