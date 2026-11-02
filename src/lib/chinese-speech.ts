export function cleanChineseForSpeech(raw: string): string {
  if (!raw) return "";
  const text = raw.trim();

  // 1. Khối chữ Hán đứng đầu trước các ký tự ngăn cách —, –, -, :, ：, (, （, [, 【 hoặc khoảng trắng kèm pinyin/tiếng Việt
  const matchWithSeparator = text.match(/^([\u4e00-\u9fa5]+)\s*(?:[—–\-:：(（\[【]|\s+[a-zA-Zà-ỹÀ-Ỹ])/);
  if (matchWithSeparator && matchWithSeparator[1]) {
    return matchWithSeparator[1].trim();
  }

  // 2. Câu tiếng Trung có ký hiệu ngắt nhịp như '//' hoặc '|' nhưng toàn bộ là chữ Hán
  const textWithoutSlashes = text.replace(/[\/\/\s|]+/g, "");
  if (/^[\u4e00-\u9fa5，。！？、]+$/.test(textWithoutSlashes)) {
    return textWithoutSlashes;
  }

  // 3. Khối chữ Hán đầu tiên
  const hanziStart = text.match(/^[\u4e00-\u9fa5]+/);
  if (hanziStart && hanziStart[0]) {
    return hanziStart[0];
  }

  // 4. Nếu toàn chữ Hán sau khi loại bỏ dấu cách và ký tự lạ
  const pureHanzi = text.replace(/[^\u4e00-\u9fa5]/g, "");
  if (pureHanzi.length > 0) {
    return pureHanzi;
  }

  // 5. Nếu là âm tiết Pinyin thuần (như mā, má, nǐ...)
  const pinyinWord = text.split(/[\s—–\-:：(（\[【]/)[0]?.trim();
  return pinyinWord || text;
}
