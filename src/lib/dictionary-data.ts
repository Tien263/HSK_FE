import { OFFICIAL_HSK1_15_LESSONS } from "./hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "./hsk2-full-lessons";

export interface DictionaryEntry {
  hanzi: string;
  pinyin: string;
  hanViet?: string;
  meaningVi: string;
  partOfSpeech?: string;
  radical?: string;
  strokes?: number;
  level?: string;
  source?: string;
  examples: { zh: string; pinyin: string; vi: string }[];
}

const COMMON_DICTIONARY_DB: DictionaryEntry[] = [
  {
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    hanViet: "Nễ Hảo",
    meaningVi: "Xin chào",
    partOfSpeech: "Thán từ / Lời chào",
    radical: "亻 (Nhân đứng)",
    strokes: 7,
    examples: [
      { zh: "你好！很高兴认识你。", pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ.", vi: "Xin chào! Rất vui được làm quen với bạn." },
      { zh: "老师，您好！", pinyin: "Lǎoshī, nín hǎo!", vi: "Em chào thầy/cô ạ!" },
    ],
  },
  {
    hanzi: "谢谢",
    pinyin: "xièxie",
    hanViet: "Tạ Tạ",
    meaningVi: "Cảm ơn",
    partOfSpeech: "Động từ",
    radical: "讠 (Ngôn)",
    strokes: 12,
    examples: [
      { zh: "太谢谢你了！", pinyin: "Tài xièxie nǐ le!", vi: "Cảm ơn bạn rất nhiều!" },
      { zh: "不用谢，不客气。", pinyin: "Bú yòng xiè, bú kèqi.", vi: "Không có chi, đừng khách sáo." },
    ],
  },
  {
    hanzi: "再见",
    pinyin: "zàijiàn",
    hanViet: "Tái Kiến",
    meaningVi: "Tạm biệt, hẹn gặp lại",
    partOfSpeech: "Động từ",
    radical: "冂 (Quynh)",
    strokes: 6,
    examples: [
      { zh: "明天再见！", pinyin: "Míngtiān zàijiàn!", vi: "Ngày mai gặp lại nhé!" },
    ],
  },
  {
    hanzi: "老师",
    pinyin: "lǎoshī",
    hanViet: "Lão Sư",
    meaningVi: "Thầy giáo, cô giáo, giáo viên",
    partOfSpeech: "Danh từ",
    radical: "耂 (Lão)",
    strokes: 6,
    examples: [
      { zh: "王老师是我们的中文老师。", pinyin: "Wáng lǎoshī shì wǒmen de zhōngwén lǎoshī.", vi: "Thầy Vương là giáo viên tiếng Trung của chúng tôi." },
    ],
  },
  {
    hanzi: "学生",
    pinyin: "xuésheng",
    hanViet: "Học Sinh",
    meaningVi: "Học sinh, sinh viên",
    partOfSpeech: "Danh từ",
    radical: "子 (Tử)",
    strokes: 8,
    examples: [
      { zh: "我是北京大学的学生。", pinyin: "Wǒ shì Běijīng Dàxué de xuésheng.", vi: "Tôi là sinh viên của trường Đại học Bắc Kinh." },
    ],
  },
  {
    hanzi: "学习",
    pinyin: "xuéxí",
    hanViet: "Học Tập",
    meaningVi: "Học tập, học hành, rèn luyện",
    partOfSpeech: "Động từ",
    radical: "子 (Tử)",
    strokes: 8,
    examples: [
      { zh: "我们都在努力学习汉语。", pinyin: "Wǒmen dōu zài nǔlì xuéxí Hànyǔ.", vi: "Chúng tôi đều đang nỗ lực học tập tiếng Hán." },
    ],
  },
  {
    hanzi: "汉语",
    pinyin: "Hànyǔ",
    hanViet: "Hán Ngữ",
    meaningVi: "Tiếng Hán, tiếng Trung Quốc",
    partOfSpeech: "Danh từ",
    radical: "氵 (Thủy)",
    strokes: 5,
    examples: [
      { zh: "汉语不难，汉字很有意思。", pinyin: "Hànyǔ bù nán, hànzì hěn yǒu yìsi.", vi: "Tiếng Hán không khó, chữ Hán rất thú vị." },
    ],
  },
  {
    hanzi: "中国",
    pinyin: "Zhōngguó",
    hanViet: "Trung Quốc",
    meaningVi: "Nước Trung Quốc",
    partOfSpeech: "Danh từ riêng",
    radical: "丨 (Cổn)",
    strokes: 4,
    examples: [
      { zh: "我想去中国旅游。", pinyin: "Wǒ xiǎng qù Zhōngguó lǚyóu.", vi: "Tôi muốn đi du lịch Trung Quốc." },
    ],
  },
  {
    hanzi: "朋友",
    pinyin: "péngyou",
    hanViet: "Bằng Hữu",
    meaningVi: "Bạn bè, bạn hữu",
    partOfSpeech: "Danh từ",
    radical: "月 (Nguyệt)",
    strokes: 4,
    examples: [
      { zh: "他是我的好朋友。", pinyin: "Tā shì wǒ de hǎo péngyou.", vi: "Anh ấy là bạn tốt của tôi." },
    ],
  },
  {
    hanzi: "名字",
    pinyin: "míngzi",
    hanViet: "Danh Tự",
    meaningVi: "Tên, tên gọi",
    partOfSpeech: "Danh từ",
    radical: "夕 (Tịch)",
    strokes: 6,
    examples: [
      { zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" },
    ],
  },
  {
    hanzi: "喜欢",
    pinyin: "xǐhuan",
    hanViet: "Hỉ Hoan",
    meaningVi: "Thích, yêu thích",
    partOfSpeech: "Động từ",
    radical: "口 (Khẩu)",
    strokes: 12,
    examples: [
      { zh: "我很喜欢喝中国茶。", pinyin: "Wǒ hěn xǐhuan hē Zhōngguó chá.", vi: "Tôi rất thích uống trà Trung Quốc." },
    ],
  },
  {
    hanzi: "天气",
    pinyin: "tiānqì",
    hanViet: "Thiên Khí",
    meaningVi: "Thời tiết",
    partOfSpeech: "Danh từ",
    radical: "大 (Đại)",
    strokes: 4,
    examples: [
      { zh: "今天天气真好！", pinyin: "Jīntiān tiānqì zhēn hǎo!", vi: "Hôm nay thời tiết thật đẹp!" },
    ],
  },
];



const entries = new Map<string, DictionaryEntry>(
  COMMON_DICTIONARY_DB.map((entry) => [entry.hanzi, { ...entry, source: "Kho từ cơ bản" }]),
);

for (const [level, lessons] of [
  ["HSK 1", OFFICIAL_HSK1_15_LESSONS],
  ["HSK 2", OFFICIAL_HSK2_15_LESSONS],
] as const) {
  for (const lesson of lessons) {
    for (const word of lesson.vocabList) {
      const existing = entries.get(word.hanzi);
      if (existing?.level) continue;
      const examples = word.exampleZh && word.exampleVi
        ? [{ zh: word.exampleZh, pinyin: word.examplePy || "", vi: word.exampleVi }]
        : existing?.examples || [];
      entries.set(word.hanzi, {
        ...existing,
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        meaningVi: word.meaning,
        partOfSpeech: word.type || existing?.partOfSpeech,
        level,
        source: `Bài ${lesson.number} · ${lesson.titleVi}`,
        examples,
      });
    }
  }
}

export const DICTIONARY_ENTRIES = Array.from(entries.values());
