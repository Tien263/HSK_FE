/**
 * Trích xuất phần tiếng Trung thuần túy để AI và công cụ phát âm đọc chính xác tiếng Trung:
 * - Tự động loại bỏ chú thích tiếng Việt, mũi tên biến điệu (-> ní yoˇu khi nói), pinyin kèm theo, dấu ngoặc.
 * - Hỗ trợ ghép các chữ Hán tách rời trong bài luyện ngữ âm (ví dụ "你 有" -> "你有", "几 口" -> "几口").
 * - Hỗ trợ danh sách từ ngữ luyện tập (ví dụ "爸爸 · 妈妈 · 哥哥" -> "爸爸，妈妈，哥哥").
 */
export function cleanChineseForSpeech(raw: string): string {
  if (!raw) return "";
  const text = raw.trim();

  // 1. Nếu văn bản đã là câu tiếng Trung thuần (chỉ chứa chữ Hán và dấu câu tiếng Trung)
  const stripped = text.replace(/[\s\/\_|\-]+/g, "");
  if (/^[\u4e00-\u9fa5，。！？、：；“”‘’《》（）]+$/.test(stripped)) {
    return text.replace(/[\/\/\s|]+/g, "");
  }

  // 2. Loại bỏ các mệnh đề giải nghĩa tiếng Việt, chú thích biến điệu, dấu ngoặc giải thích
  const cleaned = text
    .replace(/(?:—|–|--)\s*[^;；]+/g, "")
    .replace(/\([^\)]*[\u00C0-\u024F\u1EA0-\u1EF9][^\)]*\)/g, "")
    .replace(/（[^）]*[\u00C0-\u024F\u1EA0-\u1EF9][^）]*）/g, "")
    .replace(/->\s*[a-zA-Z\s\u00C0-\u024F\u1EA0-\u1EF9]+/g, "")
    .replace(/(?:khi nói|luyện âm|phân biệt|âm thứ|chú ý|nghĩa là|trước thanh)[^;；]*/gi, "");

  // 3. Trích xuất tất cả các khối chữ Hán
  const hanziMatches = cleaned.match(/[\u4e00-\u9fa5]+/g);
  if (hanziMatches && hanziMatches.length > 0) {
    // Nếu là 2 chữ Hán đứng tách nhau bằng khoảng trắng (như bài luyện biến điệu "你 有" hay "几 口") -> ghép liền thành 1 từ
    if (
      hanziMatches.length === 2 &&
      hanziMatches[0].length === 1 &&
      hanziMatches[1].length === 1 &&
      /[\u4e00-\u9fa5]\s+[\u4e00-\u9fa5]/.test(cleaned)
    ) {
      return hanziMatches.join("");
    }
    // Nếu có nhiều cụm từ (ví dụ: 爸爸 · 妈妈 · 哥哥 · 妹妹) -> ngăn cách bằng dấu phẩy tiếng Trung để đọc ngắt nhịp tự nhiên
    return hanziMatches.join("，");
  }

  // 4. Nếu toàn chữ Hán sau khi lọc ký tự lạ
  const pureHanzi = text.replace(/[^\u4e00-\u9fa5]/g, "");
  if (pureHanzi.length > 0) {
    return pureHanzi;
  }

  // 5. Nếu là âm tiết Pinyin thuần (như mā, má, nǐ, bō...)
  const pinyinWord = text.split(/[\s—–\-:：(（\[【]/)[0]?.trim();
  return pinyinWord || text;
}
