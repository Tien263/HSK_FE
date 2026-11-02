/**
 * BẢNG ÁNH XẠ ÂM HÁN VIỆT ĐA ÂM VÀ CHUYỂN ĐỔI PINYIN CHUẨN XÁC
 * Hệ thống tự động nhận biết thanh điệu và ngữ cảnh đọc để chọn chính xác âm Hán Việt chuẩn,
 * ví dụ:
 * - 好: hǎo (thanh 3) -> "Hảo" (tốt, đẹp); hào (thanh 4) -> "Háo" (háo sắc, hiếu kỳ)
 * - 搞: gǎo (thanh 3) -> "Cảo" (làm, tiến hành, sáng tác)
 * - 您: nín (thanh 2) -> "Nễ" (ông, ngài, đại từ tôn kính)
 * - 行: xíng -> "Hành"; háng -> "Hàng"
 */

export interface SinoVietnameseMapping {
  [tone: string]: string;
}

export const SINO_VIETNAMESE_TONE_MAP: Record<string, SinoVietnameseMapping> = {
  // 好: thanh 3 -> Hảo; thanh 4 -> Háo
  好: {
    3: "Hảo",
    4: "Háo",
    hǎo: "Hảo",
    hào: "Háo",
    default: "Hảo",
  },
  // 搞: gǎo (thanh 3) -> Cảo
  搞: {
    3: "Cảo",
    gǎo: "Cảo",
    default: "Cảo",
  },
  // 您: nín (thanh 2) -> Nễ
  您: {
    2: "Nễ",
    nín: "Nễ",
    default: "Nễ",
  },
  // 行: xíng (thanh 2) -> Hành; háng (thanh 2) -> Hàng
  行: {
    xíng: "Hành",
    háng: "Hàng",
    xìng: "Hạnh",
    héng: "Hoành",
    default: "Hành",
  },
  // 会: huì (thanh 4) -> Hội; kuài (thanh 4) -> Khoái (kế toán)
  会: {
    huì: "Hội",
    kuài: "Khoái",
    default: "Hội",
  },
  // 乐: lè (thanh 4) -> Lạc (vui); yuè (thanh 4) -> Nhạc (âm nhạc)
  乐: {
    lè: "Lạc",
    yuè: "Nhạc",
    default: "Lạc / Nhạc",
  },
  // 得: de (thanh nhẹ), dé (thanh 2) -> Đắc; děi (thanh 3) -> Đắc (phải)
  得: {
    dé: "Đắc",
    děi: "Đắc",
    de: "Đắc",
    default: "Đắc",
  },
  // 地: de (thanh nhẹ) -> Địa; dì (thanh 4) -> Địa
  地: {
    dì: "Địa",
    de: "Địa",
    default: "Địa",
  },
  // 重: chóng (thanh 2) -> Trùng (lặp lại); zhòng (thanh 4) -> Trọng (nặng, quan trọng)
  重: {
    chóng: "Trùng",
    zhòng: "Trọng",
    default: "Trọng / Trùng",
  },
  // 长: cháng (thanh 2) -> Trường (dài); zhǎng (thanh 3) -> Trưởng (lớn lên, hiệu trưởng)
  长: {
    cháng: "Trường",
    zhǎng: "Trưởng",
    default: "Trường / Trưởng",
  },
  // 少: shǎo (thanh 3) -> Thiểu (ít); shào (thanh 4) -> Thiếu (thiếu niên)
  少: {
    3: "Thiểu",
    4: "Thiếu",
    shǎo: "Thiểu",
    shào: "Thiếu",
    default: "Thiểu / Thiếu",
  },
  // 觉: jué (thanh 2) -> Giác (cảm giác); jiào (thanh 4) -> Giác (ngủ: shuìjiào)
  觉: {
    jué: "Giác",
    jiào: "Giác",
    default: "Giác",
  },
  // 便: biàn (thanh 4) -> Tiện; pián (thanh 2) -> Tiện
  便: {
    biàn: "Tiện",
    pián: "Tiện",
    default: "Tiện",
  },
  // 还: hái (thanh 2) -> Hoàn (vẫn, còn); huán (thanh 2) -> Hoàn (trả)
  还: {
    hái: "Hoàn",
    huán: "Hoàn",
    default: "Hoàn",
  },
  // 没: méi (thanh 2) -> Một (không có); mò (thanh 4) -> Một (chìm, tịch thu)
  没: {
    méi: "Một",
    mò: "Một",
    default: "Một",
  },
  // 只: zhǐ (thanh 3) -> Chỉ; zhī (thanh 1) -> Chích
  只: {
    3: "Chỉ",
    1: "Chích",
    zhǐ: "Chỉ",
    zhī: "Chích",
    default: "Chỉ / Chích",
  },
  // 系: xì (thanh 4) -> Hệ; jì (thanh 4) -> Hệ (thắt, buộc)
  系: {
    xì: "Hệ",
    jì: "Hệ",
    default: "Hệ",
  },
  // 着: zhe (thanh nhẹ) -> Trước; zháo (thanh 2) -> Trước (cháy, trúng); zhuó (thanh 2) -> Trước
  着: {
    zhe: "Trước",
    zháo: "Trước",
    zhuó: "Trước",
    default: "Trước",
  },
  // 教: jiāo (thanh 1) -> Giáo (dạy); jiào (thanh 4) -> Giáo (giáo dục)
  教: {
    1: "Giáo",
    4: "Giáo",
    default: "Giáo",
  },
  // 都: dōu (thanh 1) -> Đô (đều); dū (thanh 1) -> Đô (thủ đô)
  都: {
    dōu: "Đô",
    dū: "Đô",
    default: "Đô",
  },
  // 为: wèi (thanh 4) -> Vị (vì, cho); wéi (thanh 2) -> Vi (làm)
  为: {
    4: "Vị",
    2: "Vi",
    wèi: "Vị",
    wéi: "Vi",
    default: "Vị / Vi",
  },
  // 给: gěi (thanh 3) -> Cấp (cho); jǐ (thanh 3) -> Cấp (cung cấp)
  给: {
    3: "Cấp",
    default: "Cấp",
  },
};

/**
 * Trích xuất thanh điệu (1, 2, 3, 4, 5/0) từ chuỗi Pinyin
 */
export function extractToneNumber(pinyinStr: string): number {
  if (!pinyinStr) return 0;
  // Kiểm tra nếu pinyin kết thúc bằng số (ví dụ: hao3, nin2)
  const numMatch = pinyinStr.match(/(\d)$/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    return n >= 1 && n <= 5 ? n : 0;
  }
  // Nếu có dấu thanh tiếng Trung
  if (/[āēīōūǖĀĒĪŌŪǕ]/.test(pinyinStr)) return 1;
  if (/[áéíóúǘÁÉÍÓÚǗ]/.test(pinyinStr)) return 2;
  if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(pinyinStr)) return 3;
  if (/[àèìòùǜÀÈÌÒÙǛ]/.test(pinyinStr)) return 4;
  return 5; // thanh nhẹ
}

/**
 * Khắc phục triệt để lỗi dấu Pinyin bị tách rời hoặc dùng ký hiệu thanh điệu rời rạc
 * (Ví dụ: yoˇu -> yǒu, koˇu -> kǒu, nüˇ'ér -> nǚ'ér, aˇ -> ǎ, oˉ -> ō, oˊ -> ó, oˋ -> ò)
 */
export function cleanMalformedPinyin(str: string): string {
  if (!str) return "";

  // 1. Thay thế các cặp [nguyên âm + ký tự thanh điệu rời rạc U+02C7, U+030C, U+02C9, U+02CA, U+02CB, ...]
  const replacements: Record<string, string> = {
    // Thanh 3 (Caron / Hacek: \u02C7, combining \u030C)
    "a[\\u02C7\\u030C]": "ǎ", "A[\\u02C7\\u030C]": "Ǎ",
    "e[\\u02C7\\u030C]": "ě", "E[\\u02C7\\u030C]": "Ě",
    "o[\\u02C7\\u030C]": "ǒ", "O[\\u02C7\\u030C]": "Ǒ",
    "i[\\u02C7\\u030C]": "ǐ", "I[\\u02C7\\u030C]": "Ǐ",
    "u[\\u02C7\\u030C]": "ǔ", "U[\\u02C7\\u030C]": "Ǔ",
    "ü[\\u02C7\\u030C]": "ǚ", "Ü[\\u02C7\\u030C]": "Ǚ",
    "v[\\u02C7\\u030C]": "ǚ", "V[\\u02C7\\u030C]": "Ǚ",

    // Thanh 1 (Macron / Flat: \u02C9, \u00AF, combining \u0304)
    "a[\\u02C9\\u00AF\\u0304]": "ā", "A[\\u02C9\\u00AF\\u0304]": "Ā",
    "e[\\u02C9\\u00AF\\u0304]": "ē", "E[\\u02C9\\u00AF\\u0304]": "Ē",
    "o[\\u02C9\\u00AF\\u0304]": "ō", "O[\\u02C9\\u00AF\\u0304]": "Ō",
    "i[\\u02C9\\u00AF\\u0304]": "ī", "I[\\u02C9\\u00AF\\u0304]": "Ī",
    "u[\\u02C9\\u00AF\\u0304]": "ū", "U[\\u02C9\\u00AF\\u0304]": "Ū",
    "ü[\\u02C9\\u00AF\\u0304]": "ǖ", "Ü[\\u02C9\\u00AF\\u0304]": "Ǖ",
    "v[\\u02C9\\u00AF\\u0304]": "ǖ", "V[\\u02C9\\u00AF\\u0304]": "Ǖ",

    // Thanh 2 (Acute: \u02CA, \u00B4, combining \u0301)
    "a[\\u02CA\\u00B4\\u0301]": "á", "A[\\u02CA\\u00B4\\u0301]": "Á",
    "e[\\u02CA\\u00B4\\u0301]": "é", "E[\\u02CA\\u00B4\\u0301]": "É",
    "o[\\u02CA\\u00B4\\u0301]": "ó", "O[\\u02CA\\u00B4\\u0301]": "Ó",
    "i[\\u02CA\\u00B4\\u0301]": "í", "I[\\u02CA\\u00B4\\u0301]": "Í",
    "u[\\u02CA\\u00B4\\u0301]": "ú", "U[\\u02CA\\u00B4\\u0301]": "Ú",
    "ü[\\u02CA\\u00B4\\u0301]": "ǘ", "Ü[\\u02CA\\u00B4\\u0301]": "Ǘ",
    "v[\\u02CA\\u00B4\\u0301]": "ǘ", "V[\\u02CA\\u00B4\\u0301]": "Ǘ",

    // Thanh 4 (Grave: \u02CB, \u0060, combining \u0300)
    "a[\\u02CB\\u0060\\u0300]": "à", "A[\\u02CB\\u0060\\u0300]": "À",
    "e[\\u02CB\\u0060\\u0300]": "è", "E[\\u02CB\\u0060\\u0300]": "È",
    "o[\\u02CB\\u0060\\u0300]": "ò", "O[\\u02CB\\u0060\\u0300]": "Ò",
    "i[\\u02CB\\u0060\\u0300]": "ì", "I[\\u02CB\\u0060\\u0300]": "Ì",
    "u[\\u02CB\\u0060\\u0300]": "ù", "U[\\u02CB\\u0060\\u0300]": "Ù",
    "ü[\\u02CB\\u0060\\u0300]": "ǜ", "Ü[\\u02CB\\u0060\\u0300]": "Ǜ",
    "v[\\u02CB\\u0060\\u0300]": "ǜ", "V[\\u02CB\\u0060\\u0300]": "Ǜ",
  };

  let res = str;
  for (const [pattern, rep] of Object.entries(replacements)) {
    res = res.replace(new RegExp(pattern, "g"), rep);
  }

  // 2. Chuyển đổi pinyin số nếu có
  res = normalizePinyinNumbers(res);

  // 3. Chuẩn hóa sang dạng kết hợp Unicode chuẩn (NFC)
  try {
    res = res.normalize("NFC");
  } catch {}

  return res;
}

/**
 * Xử lý Pinyin có số (nin2 -> nín, hao3 -> hǎo)
 */
function normalizePinyinNumbers(input: string): string {
  if (!input) return "";
  if (!/\d/.test(input)) return input;

  const toneMap: Record<string, string[]> = {
    a: ["ā", "á", "ǎ", "à"],
    e: ["ē", "é", "ě", "è"],
    o: ["ō", "ó", "ǒ", "ò"],
    i: ["ī", "í", "ǐ", "ì"],
    u: ["ū", "ú", "ǔ", "ù"],
    v: ["ǖ", "ǘ", "ǚ", "ǜ"],
    ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
  };

  const convertSingleSyllable = (syllable: string, toneNum: number) => {
    if (toneNum === 5 || toneNum === 0) return syllable.replace(/v/g, "ü");
    const s = syllable.toLowerCase();
    const tIdx = toneNum - 1;

    let res = s;
    if (s.includes("a")) res = s.replace("a", toneMap.a[tIdx]);
    else if (s.includes("e")) res = s.replace("e", toneMap.e[tIdx]);
    else if (s.includes("ou")) res = s.replace("o", toneMap.o[tIdx]);
    else {
      for (let i = s.length - 1; i >= 0; i--) {
        const char = s[i];
        if (toneMap[char]) {
          res = s.slice(0, i) + toneMap[char][tIdx] + s.slice(i + 1);
          break;
        }
      }
    }
    if (syllable[0] === syllable[0].toUpperCase() && syllable[0] !== syllable[0].toLowerCase()) {
      res = res.charAt(0).toUpperCase() + res.slice(1);
    }
    return res;
  };

  try {
    return input.replace(/([a-zA-Z:üÜ]+)([0-5])/g, (_match, syl, tone) => {
      return convertSingleSyllable(syl, parseInt(tone, 10));
    });
  } catch {
    return input;
  }
}

/**
 * Chuẩn hóa Pinyin toàn diện (hỗ trợ cả pinyin số và pinyin có ký tự rời rạc)
 */
export function normalizePinyinTone(input: string): string {
  return cleanMalformedPinyin(input);
}

/**
 * Tìm âm Hán Việt chuẩn xác theo chữ Hán và Pinyin đang đọc
 */
export function resolveSinoVietnamese(
  char: string,
  pinyinStr: string,
  dbHanViet?: string | null
): string {
  if (!char) return "Hán tự";
  const cleanChar = [...char.trim()][0] || char;

  // 1. Kiểm tra bảng ánh xạ đa âm thông minh
  const toneMap = SINO_VIETNAMESE_TONE_MAP[cleanChar];
  if (toneMap) {
    const tone = extractToneNumber(pinyinStr);
    const cleanPy = pinyinStr.toLowerCase().trim();

    // Khớp theo pinyin chính xác (ví dụ xíng vs háng)
    if (toneMap[cleanPy]) return toneMap[cleanPy];

    // Khớp theo thanh điệu (1, 2, 3, 4)
    if (tone && toneMap[tone]) return toneMap[tone];

    // Khớp theo default
    if (toneMap.default) return toneMap.default;
  }

  // 2. Nếu có bản dịch từ CSDL
  if (dbHanViet && dbHanViet.trim()) {
    return dbHanViet.trim();
  }

  return "Hán tự";
}
