import { pinyin } from "pinyin-pro";

/**
 * Bảng ánh xạ âm Hán Việt chuẩn xác theo thanh điệu / ngữ cảnh đọc.
 * Giải quyết triệt để lỗi đa âm (ví dụ: 好 thanh 3 = Hảo, thanh 4 = Háo).
 */
export const SINO_VIETNAMESE_TONE_MAP: Record<string, Record<number | string, string>> = {
  // 好: hǎo (thanh 3) -> Hảo; hào (thanh 4) -> Háo
  好: {
    3: "Hảo",
    4: "Háo",
    hǎo: "Hảo",
    hào: "Háo",
    default: "Hảo / Háo",
  },
  // 搞: gǎo (thanh 3) -> Cảo
  搞: {
    3: "Cảo",
    default: "Cảo",
  },
  // 您: nín (thanh 2) -> Nễ (kính ngữ của 你)
  您: {
    2: "Nễ",
    nín: "Nễ",
    default: "Nễ",
  },
  // 你: nǐ (thanh 3) -> Nễ / Nhĩ
  你: {
    3: "Nễ / Nhĩ",
    default: "Nễ / Nhĩ",
  },
  // 得: dé (thanh 2) -> Đắc; děi (thanh 3) -> Đắc (phải); de (thanh nhẹ) -> Đắc
  得: {
    2: "Đắc",
    3: "Đắc",
    0: "Đắc",
    5: "Đắc",
    default: "Đắc",
  },
  // 地: dì (thanh 4) -> Địa; de (thanh nhẹ) -> Địa
  地: {
    4: "Địa",
    0: "Địa",
    5: "Địa",
    default: "Địa",
  },
  // 行: xíng (thanh 2) -> Hành; háng (thanh 2) -> Hàng
  行: {
    xíng: "Hành",
    háng: "Hàng",
    default: "Hành / Hàng",
  },
  // 重: zhòng (thanh 4) -> Trọng; chóng (thanh 2) -> Trùng
  重: {
    zhòng: "Trọng",
    chóng: "Trùng",
    4: "Trọng",
    2: "Trùng",
    default: "Trọng / Trùng",
  },
  // 乐: lè (thanh 4) -> Lạc; yuè (thanh 4) -> Nhạc
  乐: {
    lè: "Lạc",
    yuè: "Nhạc",
    default: "Lạc / Nhạc",
  },
  // 长: cháng (thanh 2) -> Trường; zhǎng (thanh 3) -> Trưởng
  长: {
    cháng: "Trường",
    zhǎng: "Trưởng",
    2: "Trường",
    3: "Trưởng",
    default: "Trường / Trưởng",
  },
  // 少: shǎo (thanh 3) -> Thiểu; shào (thanh 4) -> Thiếu
  少: {
    3: "Thiểu",
    4: "Thiếu",
    shǎo: "Thiểu",
    shào: "Thiếu",
    default: "Thiểu / Thiếu",
  },
  // 会: huì (thanh 4) -> Hội; kuài (thanh 4) -> Khoái (kế toán)
  会: {
    huì: "Hội",
    kuài: "Khoái",
    default: "Hội",
  },
  // 觉: jué (thanh 2) -> Giác; jiào (thanh 4) -> Giác (ngủ)
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
 * Chuẩn hóa Pinyin số (như nin2, hao3, shi4) sang ký tự có dấu thanh chuẩn quốc tế (nín, hǎo, shì).
 */
export function normalizePinyinTone(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Nếu không chứa số thì giữ nguyên
  if (!/\d/.test(trimmed)) return trimmed;

  // Bảng đặt dấu thanh chuẩn: ưu tiên a, e; nếu ou thì đặt ở o; còn lại đặt ở nguyên âm cuối
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
    // Giữ nguyên viết hoa nếu ký tự đầu viết hoa
    if (syllable[0] === syllable[0].toUpperCase() && syllable[0] !== syllable[0].toLowerCase()) {
      res = res.charAt(0).toUpperCase() + res.slice(1);
    }
    return res;
  };

  try {
    return trimmed.replace(/([a-zA-Z:üÜ]+)([0-5])/g, (_match, syl, tone) => {
      return convertSingleSyllable(syl, parseInt(tone, 10));
    });
  } catch {
    return trimmed;
  }
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

  // 2. Tra cứu từ CSDL (charEntry.hanViet từ Unihan)
  if (dbHanViet && typeof dbHanViet === "string") {
    const rawOptions = dbHanViet
      .split(/[\s,/]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (rawOptions.length > 0) {
      // Nếu có nhiều âm trong CSDL, thử chọn âm phù hợp nhất với thanh điệu
      const tone = extractToneNumber(pinyinStr);
      let selected = rawOptions[0];

      if (rawOptions.length > 1) {
        if (tone === 3) {
          // Thanh 3 thường tương ứng dấu hỏi hoặc dấu ngã (ví dụ: Hảo, Tiểu, Nhĩ...)
          const found = rawOptions.find((w) => /[ảẻỉỏủỷãẽĩõũỹạẹịọụỵ]/.test(w.toLowerCase()));
          if (found) selected = found;
        } else if (tone === 4) {
          // Thanh 4 thường tương ứng dấu sắc hoặc nặng (ví dụ: Háo, Đại, Tác, Khán...)
          const found = rawOptions.find((w) => /[áéíóúýạẹịọụỵ]/.test(w.toLowerCase()));
          if (found) selected = found;
        } else if (tone === 1) {
          // Thanh 1 thường là thanh ngang không dấu (ví dụ: Cao, Thiên, Ba, Minh...)
          const found = rawOptions.find((w) => !/[àáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/.test(w.toLowerCase()));
          if (found) selected = found;
        } else if (tone === 2) {
          // Thanh 2 thường là thanh sắc hoặc huyền (ví dụ: Hành, Thần, Bình...)
          const found = rawOptions.find((w) => /[àèìòùỳáéíóúý]/.test(w.toLowerCase()));
          if (found) selected = found;
        }
      }

      // Viết hoa chữ cái đầu
      return selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase();
    }
  }

  return "Hán tự";
}
