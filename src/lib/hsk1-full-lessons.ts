import type {ReadingItem, CulturalNoteItem} from "./lesson-data";
export interface VocabExample {
  zh: string;
  pinyin?: string;
  vi: string;
}

export interface VocabCommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface VocabExample {
  zh: string;
  pinyin?: string;
  vi: string;
}

export interface VocabCommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface VocabExample {
  zh: string;
  pinyin?: string;
  vi: string;
}

export interface VocabCommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface LessonVocabItem {
  id?: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  meaningVi?: string;
  usageExplanation?: string;
  usagePatterns?: string[];
  examples?: VocabExample[];
  commonMistakes?: VocabCommonMistake[];
  type?: string;
  wordType?: string;
  exampleZh?: string;
  examplePy?: string;
  exampleVi?: string;
}

export interface GrammarExample {
  zh: string;
  pinyin?: string;
  vi: string;
  explanationVi?: string;
}

export interface GrammarCommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface LessonGrammarItem {
  id?: string;
  title: string;
  titleZh?: string;
  summary?: string;
  structure: string;
  usageExplanation?: string;
  usageSteps?: string[];
  examples?: GrammarExample[];
  usageContexts?: string[];
  comparison?: string;
  commonMistakes?: GrammarCommonMistake[] | string[];
  example: string;
  explanation?: string;
  notes?: string;
  memo?: string;
  usage?: string;
}

export interface LessonDialogueLine {
  speaker: string;
  zh: string;
  pinyin: string;
  vi: string;
}

export interface LessonPhoneticGuide {
  title: string;
  rule: string;
  examples: string[];
}

export type GrammarExerciseMode =
  | "choose_correct" // Chọn câu đúng ngữ pháp
  | "listen_dialogue" // Nghe hiểu hội thoại ngắn
  | "fill_blank" // Điền từ vào chỗ trống
  | "reorder" // Sắp xếp từ thành câu
  | "correct_mistake"; // Sửa câu sai thành đúng

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string;
  prompt: string;
  meaningVi?: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  audioText?: string;
  sentence?: string;
  pinyin?: string;
  scrambledWords?: string[];
  wrongSentence?: string;
  wrongSentencePinyin?: string;
  explanation: string;
}

export interface Hsk1FullLesson {
  id: string;
  number: number;
  titleZh: string;
  pinyin: string;
  titleVi: string;
  desc: string;
  durationMin: number;
  vocabCount: number;
  grammarCount: number;
  isUnlockedDefault: boolean;
  unlockedScheduleText: string;
  vocabList: LessonVocabItem[];
  grammarList: LessonGrammarItem[];
  dialogue: LessonDialogueLine[];
  phonetics: LessonPhoneticGuide;
  culture: string;
  reading?: ReadingItem;
  culturalNote?: CulturalNoteItem;
  grammarExercises?: GrammarExerciseItem[];
}

export const OFFICIAL_HSK1_15_LESSONS: Hsk1FullLesson[] = [
  {
    id: "hsk1-01",
    number: 1,
    titleZh: "AI小语，你好！",
    pinyin: "AI Xiǎoyǔ, nǐ hǎo!",
    titleVi: "Xin chào AI Tiểu Ngữ!",
    desc: "Làm quen với AI trợ giảng Tiểu Ngữ, các cách chào hỏi cơ bản, phân biệt 你 và 您, hậu tố số nhiều 们 cùng văn hóa giao tiếp Trung Hoa.",
    durationMin: 30,
    vocabCount: 12,
    grammarCount: 3,
    isUnlockedDefault: true,
    unlockedScheduleText: "Đã mở theo lịch giảng dạy",
    vocabList: [
      {
        hanzi: "你好",
        pinyin: "nǐ hǎo",
        meaning: "Xin chào",
        exampleZh: "你好，小语！",
        examplePy: "Nǐ hǎo, Xiǎoyǔ!",
        exampleVi: "Chào Tiểu Ngữ! (Lưu ý: Hai thanh 3 đứng liền nhau, 你好 thường được phát âm thành ní hǎo)",
      },
      {
        hanzi: "大家",
        pinyin: "dàjiā",
        meaning: "Mọi người",
        exampleZh: "大家好！",
        examplePy: "Dàjiā hǎo!",
        exampleVi: "Chào mọi người!",
      },
      {
        hanzi: "好",
        pinyin: "hǎo",
        meaning: "Tốt, khỏe",
        exampleZh: "你好！",
        examplePy: "Nǐ hǎo!",
        exampleVi: "Xin chào!",
      },
      {
        hanzi: "学生",
        pinyin: "xuésheng",
        meaning: "Học sinh, sinh viên",
        exampleZh: "学生们，你们好！",
        examplePy: "Xuéshengmen, nǐmen hǎo!",
        exampleVi: "Chào các em học sinh!",
      },
      {
        hanzi: "们",
        pinyin: "men",
        meaning: "Hậu tố chỉ số nhiều",
        exampleZh: "你们好！",
        examplePy: "Nǐmen hǎo!",
        exampleVi: "Chào các bạn!",
      },
      {
        hanzi: "老师",
        pinyin: "lǎoshī",
        meaning: "Thầy giáo, cô giáo",
        exampleZh: "老师，您好！",
        examplePy: "Lǎoshī, nín hǎo!",
        exampleVi: "Em chào thầy/cô ạ!",
      },
      {
        hanzi: "您",
        pinyin: "nín",
        meaning: "Đại từ kính trọng",
        exampleZh: "王老师，您好！",
        examplePy: "Wáng lǎoshī, nín hǎo!",
        exampleVi: "Em chào thầy/cô Vương ạ!",
      },
      {
        hanzi: "你们",
        pinyin: "nǐmen",
        meaning: "Các bạn (ngôi 2 số nhiều)",
        exampleZh: "你们好！",
        examplePy: "Nǐmen hǎo!",
        exampleVi: "Chào các bạn!",
      },
      {
        hanzi: "谢谢",
        pinyin: "xièxie",
        meaning: "Cảm ơn",
        exampleZh: "谢谢老师！",
        examplePy: "Xièxie lǎoshī!",
        exampleVi: "Em cảm ơn thầy/cô!",
      },
      {
        hanzi: "不客气",
        pinyin: "bú kèqi",
        meaning: "Không có gì",
        exampleZh: "不客气！",
        examplePy: "Bú kèqi!",
        exampleVi: "Không có gì!",
      },
      {
        hanzi: "同学",
        pinyin: "tóngxué",
        meaning: "Bạn học",
        exampleZh: "同学们，再见！",
        examplePy: "Tóngxuémen, zàijiàn!",
        exampleVi: "Tạm biệt các bạn học!",
      },
      {
        hanzi: "再见",
        pinyin: "zàijiàn",
        meaning: "Tạm biệt",
        exampleZh: "老师，再见！",
        examplePy: "Lǎoshī, zàijiàn!",
        exampleVi: "Tạm biệt thầy/cô ạ!",
      },
    ],
    grammarList: [
      {
        title: "Ngữ pháp 1: Cấu trúc chào hỏi với 好",
        structure: "Đối tượng được chào + 好！",
        example: "你好！(Xin chào!) · 您好！(Xin chào ạ!) · 大家好！(Chào mọi người!) · 你们好！(Chào các bạn!) · 老师好！(Chào thầy/cô ạ!)",
        explanation: "Trong tiếng Trung, có thể kết hợp đại từ nhân xưng hoặc danh xưng với 好 để hình thành câu chào. Lưu ý phát âm: 你好 viết nǐ hǎo nhưng khi đọc thông thường biến điệu thành ní hǎo.",
      },
      {
        title: "Ngữ pháp 2: Phân biệt 你 và 您",
        structure: "你 (giao tiếp thông thường) vs 您 (đại từ kính trọng)",
        example: "小语，你好！ (Chào Tiểu Ngữ!) · 王老师，您好！ (Em chào thầy/cô Vương ạ!)",
        explanation: "你 (nǐ): Bạn, sử dụng trong giao tiếp thông thường. 您 (nín): Đại từ kính trọng, sử dụng khi giao tiếp lịch sự với thầy cô, người lớn tuổi hoặc người cần thể hiện sự tôn trọng. Sự khác biệt nằm ở mức độ trang trọng và quan hệ giữa người nói với người nghe.",
      },
      {
        title: "Ngữ pháp 3: Hậu tố số nhiều 们",
        structure: "Đại từ nhân xưng / danh từ chỉ người + 们",
        example: "你 + 们 = 你们 (Các bạn) · 我 + 们 = 我们 (Chúng tôi) · 同学 + 们 = 同学们 (Các bạn học) · 你们好！ · 同学们，再见！",
        explanation: "Đặt sau đại từ nhân xưng hoặc danh từ chỉ người để biểu thị số nhiều. Lưu ý: Không thêm 们 ngay sau một danh từ đã có số lượng cụ thể như 三个学生.",
      },
    ],
    dialogue: [
      { speaker: "王老师", zh: "同学们好！", pinyin: "Tóngxuémen hǎo!", vi: "Chào các em học sinh!" },
      { speaker: "学生们", zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Chúng em chào thầy ạ!" },
      { speaker: "王老师", zh: "欢迎大家来到中文课！", pinyin: "Huānyíng dàjiā lái dào zhōngwén kè!", vi: "Chào mừng mọi người đến với lớp học tiếng Trung!" },
      { speaker: "小语", zh: "老师，您好！我是小语。", pinyin: "Lǎoshī, nín hǎo! Wǒ shì Xiǎoyǔ.", vi: "Em chào thầy ạ! Em là Tiểu Ngữ." },
      { speaker: "王老师", zh: "你好，小语！", pinyin: "Nǐ hǎo, Xiǎoyǔ!", vi: "Chào em, Tiểu Ngữ!" },
      { speaker: "学生们", zh: "谢谢老师！", pinyin: "Xièxie lǎoshī!", vi: "Cảm ơn thầy ạ!" },
      { speaker: "王老师", zh: "不客气！", pinyin: "Bú kèqi!", vi: "Không có gì!" },
      { speaker: "王老师", zh: "同学们，再见！", pinyin: "Tóngxuémen, zàijiàn!", vi: "Tạm biệt các em học sinh!" },
    ],
    phonetics: {
      title: "Luyện đọc hiểu & Ngữ cảnh: 第一天上课",
      rule: "Đoạn văn ngắn: 今天是第一天上课。王老师走进教室，对大家说：“同学们好！”学生们很高兴，一起说：“老师好！”小语也说：“王老师，您好！”下课了，老师说：“同学们，再见！”大家说：“老师，再见！谢谢老师！”",
      examples: [
        "今天 (jīntiān): Hôm nay [Từ vựng mở rộng]",
        "第一天 (dì-yī tiān): Ngày đầu tiên [Từ vựng mở rộng]",
        "上课 (shàngkè): Vào học, đi học [Từ vựng mở rộng]",
        "说 (shuō): Nói [Từ vựng mở rộng]",
        "下课 (xiàkè): Tan học [Từ vựng mở rộng]",
      ],
    },
    culture: "8 Học liệu Văn hóa giao tiếp thực tế:\n• Nhóm 1: Mẫu câu vàng khuyên dùng: 1. 你好！– Lời chào phổ biến nhất khi gặp gỡ; 2. 老师好！– Lời chào thể hiện sự kính trọng dành cho giáo viên\n• Nhóm 2: Cách nói lịch sự & tôn trọng: 3. 您好！– Dùng cho người lớn tuổi, thầy cô, đối tác; 4. 谢谢！– Thể hiện lòng biết ơn chân thành; 5. 不客气！– Lời đáp nhã nhặn khiêm tốn\n• Nhóm 3: Lưu ý & Cấm kỵ văn hóa: 6. Không gọi thẳng tên giáo viên (Họ + 老师); 7. Biến điệu của 你好 (nǐ hǎo -> ní hǎo); 8. Tránh dùng 您 với bạn bè đồng trang lứa.",
    grammarExercises: [
      {
        id: "hsk1-01-ex-01",
        mode: "choose_correct",
        grammarRule: "Quy tắc chào hỏi lịch sự & xưng hô",
        prompt: "Chọn câu chào hỏi thầy giáo Vương đúng trật tự và lịch sự nhất:",
        options: [
          "A. 好王老师！",
          "B. 王老师，您好！",
          "C. 王老师，你好们！",
          "D. 您好王老师是！"
        ],
        correctAnswer: "B",
        explanation: "Quy tắc chào hỏi: Danh từ/Chức danh + 您好 (王老师，您好！). Dùng '您' để thể hiện sự tôn trọng với thầy cô, không đảo '好' lên trước danh xưng."
      },
      {
        id: "hsk1-01-ex-02",
        mode: "choose_correct",
        grammarRule: "Phân biệt đại từ 你 và 您",
        prompt: "Khi gặp người lớn tuổi hoặc thầy cô giáo, ta nên dùng đại từ nào để xưng hô lịch sự?",
        options: [
          "A. 你 (nǐ)",
          "B. 您 (nín)",
          "C. 你们 (nǐmen)",
          "D. 他 (tā)"
        ],
        correctAnswer: "B",
        explanation: "'您' (nín) là đại từ nhân xưng ngôi thứ hai dạng kính trọng, dùng cho người lớn tuổi, thầy cô giáo hoặc đối tác tôn kính."
      },
      {
        id: "hsk1-01-ex-03",
        mode: "choose_correct",
        grammarRule: "Hậu tố số nhiều 们",
        prompt: "Chọn câu dùng hậu tố số nhiều '们' đúng quy tắc ngữ pháp:",
        options: [
          "A. 同学们，你们好！",
          "B. 三个学生们好！",
          "C. 老师们好一个！",
          "D. 你们两个们好！"
        ],
        correctAnswer: "A",
        explanation: "Hậu tố '们' đứng sau đại từ hoặc danh từ chỉ người (同学们, 你们). Lưu ý: Khi đã có số lượng từ cụ thể (như 三个) thì tuyệt đối KHÔNG thêm '们'."
      },
      {
        id: "hsk1-01-ex-04",
        mode: "fill_blank",
        grammarRule: "Đại từ kính trọng 您",
        prompt: "Điền từ thích hợp vào chỗ trống: 小语遇见王老师，礼貌地说：“王老师，____ 好！”",
        options: ["A. 您", "B. 们", "C. 谁", "D. 吗"],
        correctAnswer: "A",
        explanation: "Chào thầy cô cần dùng '您好' (Nín hǎo) để thể hiện sự lễ phép và tôn kính."
      },
      {
        id: "hsk1-01-ex-05",
        mode: "fill_blank",
        grammarRule: "Hậu tố số nhiều 们",
        prompt: "Điền từ thích hợp vào chỗ trống: 老师走进教室，对全班说：“____ 好！”",
        options: ["A. 同学们", "B. 老师", "C. 一个同学", "D. 您"],
        correctAnswer: "A",
        explanation: "Giáo viên chào cả lớp gồm nhiều học sinh nên dùng '同学们好！' (Chào các em học sinh!)."
      },
      {
        id: "hsk1-01-ex-06",
        mode: "reorder",
        grammarRule: "Trật tự câu chào hỏi",
        prompt: "Sắp xếp các từ sau thành câu chào hỏi chuẩn xác: [您好] [王老师] [，] [！]",
        scrambledWords: ["您好", "，", "王老师", "！"],
        correctAnswer: "王老师，您好！",
        explanation: "Trật tự chào hỏi tiếng Trung: Danh xưng/Tên người + Dấu phẩy + Lời chào (王老师，您好！)."
      },
      {
        id: "hsk1-01-ex-07",
        mode: "reorder",
        grammarRule: "Hậu tố số nhiều 们 & Chào hỏi",
        prompt: "Sắp xếp các từ sau thành câu chào: [好] [同学们] [！]",
        scrambledWords: ["好", "同学们", "！"],
        correctAnswer: "同学们好！",
        explanation: "Đối tượng được chào (同学们) đứng trước tính từ '好' (同学们好！)."
      },
      {
        id: "hsk1-01-ex-08",
        mode: "correct_mistake",
        grammarRule: "Lỗi dùng 们 sau số từ cụ thể",
        prompt: "Tìm và sửa lỗi sai trong câu: '教室里有五个学生们。'",
        wrongSentence: "教室里有五个学生们。",
        options: [
          "A. Bỏ '们', sửa thành: 教室里有五个学生。",
          "B. Đổi '五个' thành '两'",
          "C. Thêm '好' vào cuối câu",
          "D. Câu trên hoàn toàn đúng"
        ],
        correctAnswer: "A",
        explanation: "Trong tiếng Trung, danh từ chỉ người khi đã có số từ và lượng từ xác định phía trước (五个) thì KHÔNG được thêm hậu tố '们'. Viết đúng là: 五个学生."
      },
      {
        id: "hsk1-01-ex-09",
        mode: "correct_mistake",
        grammarRule: "Lỗi đảo vị trí trong câu chào",
        prompt: "Sửa câu chào sai trật tự từ: '好王老师！'",
        wrongSentence: "好王老师！",
        options: [
          "A. Sửa thành: 王老师好！ hoặc 王老师，您好！",
          "B. Sửa thành: 王老师是好！",
          "C. Sửa thành: 老师好王！",
          "D. Sửa thành: 好老师王！"
        ],
        correctAnswer: "A",
        explanation: "Không được dịch từng từ từ tiếng Việt hay tiếng Anh sang đặt '好' lên đầu. Phải đặt danh từ gọi trước: 王老师好！"
      },
      {
        id: "hsk1-01-ex-10",
        mode: "listen_dialogue",
        grammarRule: "Nghe hiểu hội thoại chào hỏi",
        prompt: "Nghe đoạn thoại ngắn giữa Tiểu Ngữ và thầy Vương, trả lời câu hỏi:",
        dialogueLines: [
          { speaker: "小语", zh: "王老师，您好！我是小语。", pinyin: "Wáng lǎoshī, nín hǎo! Wǒ shì Xiǎoyǔ.", vi: "Em chào thầy Vương ạ! Em là Tiểu Ngữ." },
          { speaker: "王老师", zh: "你好，小语！欢迎来到中文课。", pinyin: "Nǐ hǎo, Xiǎoyǔ! Huānyíng lái dào zhōngwén kè.", vi: "Chào Tiểu Ngữ! Chào mừng em đến lớp tiếng Trung." }
        ],
        audioText: "小语：王老师，您好！我是小语。王老师：你好，小语！欢迎来到中文课。",
        options: [
          "A. Tiểu Ngữ dùng '您' vì thầy Vương là giáo viên, cần thể hiện sự kính trọng",
          "B. Tiểu Ngữ dùng '您' vì thầy Vương là bạn học cùng lớp",
          "C. Thầy Vương dùng '您' để chào Tiểu Ngữ",
          "D. Tiểu Ngữ và thầy Vương không quen biết nhau"
        ],
        correctAnswer: "A",
        explanation: "Học sinh chào giáo viên cần dùng đại từ '您' để bày tỏ sự lễ phép và tôn kính đối với thầy cô giáo."
      }
    ],
  },
  {
    id: "hsk1-02",
    number: 2,
    titleZh: "我叫李文",
    pinyin: "Wǒ jiào Lǐ Wén",
    titleVi: "Mình tên là Lý Văn",
    desc: "Cách hỏi và giới thiệu họ tên, làm quen bạn mới với động từ 叫 (jiào) và đại từ nghi vấn 什么 (shénme).",
    durationMin: 35,
    vocabCount: 8,
    grammarCount: 2,
    isUnlockedDefault: true,
    unlockedScheduleText: "Đã mở theo lịch giảng dạy",
    vocabList: [
      { hanzi: "叫", pinyin: "jiào", meaning: "Gọi là, tên là", exampleZh: "我叫李文。", examplePy: "Wǒ jiào Lǐ Wén.", exampleVi: "Tôi tên là Lý Văn." },
      { hanzi: "什么", pinyin: "shénme", meaning: "Cái gì, gì (đại từ hỏi)", exampleZh: "这是什么？", examplePy: "Zhè shì shénme?", exampleVi: "Đây là cái gì?" },
      { hanzi: "名字", pinyin: "míngzi", meaning: "Tên", exampleZh: "你叫什么名字？", examplePy: "Nǐ jiào shénme míngzi?", exampleVi: "Bạn tên là gì?" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi, mình, em (ngôi thứ 1)", exampleZh: "我是学生。", examplePy: "Wǒ shì xuésheng.", exampleVi: "Tôi là học sinh." },
      { hanzi: "是", pinyin: "shì", meaning: "Là (động từ 是)", exampleZh: "他是老师。", examplePy: "Tā shì lǎoshī.", exampleVi: "Thầy ấy là giáo viên." },
      { hanzi: "人", pinyin: "rén", meaning: "Người", exampleZh: "中国人", examplePy: "Zhōngguó rén", exampleVi: "Người Trung Quốc" },
      { hanzi: "李文", pinyin: "Lǐ Wén", meaning: "Lý Văn (tên người)", exampleZh: "李文是我的好朋友。", examplePy: "Lǐ Wén shì wǒ de hǎo péngyou.", exampleVi: "Lý Văn là bạn tốt của tôi." },
      { hanzi: "高兴", pinyin: "gāoxìng", meaning: "Vui mừng, phấn khởi", exampleZh: "很高兴认识你！", examplePy: "Hěn gāoxìng rènshi nǐ!", exampleVi: "Rất vui được quen biết bạn!" },
    ],
    grammarList: [
      {
        title: "Hỏi và trả lời tên với động từ 叫 (Jiào)",
        structure: "Chủ ngữ + 叫 + 什么 + 名字？ ➔ Chủ ngữ + 叫 + [Tên].",
        example: "你叫什么名字？ ➔ 我叫李文。",
        explanation: "Trong tiếng Trung, họ luôn đứng trước tên (ví dụ: Họ Lý + Tên Văn ➔ 李文).",
      },
      {
        title: "Câu phán đoán khẳng định và phủ định với 是",
        structure: "A + 是 + B / A + 不是 + B",
        example: "我是学生。(Tôi là học sinh.) · 我不是老师。(Tôi không phải giáo viên.)",
        explanation: "Phó từ '不' đọc thành 'bú' khi đứng trước từ mang thanh 4 như 是 (shì).",
      },
    ],
    dialogue: [
      { speaker: "王明", zh: "你好！请问你叫什么名字？", pinyin: "Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?", vi: "Chào bạn! Cho mình hỏi bạn tên là gì?" },
      { speaker: "李文", zh: "你好！我叫李文。你呢？", pinyin: "Nǐ hǎo! Wǒ jiào Lǐ Wén. Nǐ ne?", vi: "Chào bạn! Mình tên là Lý Văn. Còn bạn thì sao?" },
      { speaker: "王明", zh: "我叫王明。很高兴认识你！", pinyin: "Wǒ jiào Wáng Míng. Hěn gāoxìng rènshi nǐ!", vi: "Mình tên là Vương Minh. Rất vui được làm quen với bạn!" },
      { speaker: "李文", zh: "认识你我也很高兴！", pinyin: "Rènshi nǐ wǒ yě hěn gāoxìng!", vi: "Làm quen với bạn mình cũng rất vui!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 2: Thanh mẫu đầu lưỡi d, t, n, l",
      rule: "Phân biệt âm tắc vô thanh không bật hơi [d] và có bật hơi mạnh [t].",
      examples: ["dà (lớn)", "tā (anh ấy)", "nǐ (bạn)", "lì (sức lực)"],
    },
    culture: "Quy tắc đặt tên truyền thống Trung Hoa: Người Trung Quốc coi trọng ý nghĩa tên gọi, thường gửi gắm phẩm đức, trí tuệ hoặc vẻ đẹp thiên nhiên vào tên con.",
  },
  {
    id: "hsk1-03",
    number: 3,
    titleZh: "我是中国人",
    pinyin: "Wǒ shì Zhōngguó rén",
    titleVi: "Mình là người Trung Quốc",
    desc: "Nói về quốc tịch, quê hương với cấu trúc Tên nước + 人 và trợ từ nghi vấn 吗 (ma).",
    durationMin: 35,
    vocabCount: 9,
    grammarCount: 2,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần tới của giáo viên",
    vocabList: [
      { hanzi: "中国", pinyin: "Zhōngguó", meaning: "Trung Quốc", exampleZh: "中国很大。", examplePy: "Zhōngguó hěn dà.", exampleVi: "Trung Quốc rất rộng lớn." },
      { hanzi: "越南", pinyin: "Yuènán", meaning: "Việt Nam", exampleZh: "我是越南人。", examplePy: "Wǒ shì Yuènán rén.", exampleVi: "Tôi là người Việt Nam." },
      { hanzi: "美国", pinyin: "Měiguó", meaning: "Mỹ, Hoa Kỳ", exampleZh: "美国人", examplePy: "Měiguó rén", exampleVi: "Người Mỹ" },
      { hanzi: "吗", pinyin: "ma", meaning: "Không, phải không (trợ từ hỏi)", exampleZh: "你是中国人吗？", examplePy: "Nǐ shì Zhōngguó rén ma?", exampleVi: "Bạn là người Trung Quốc phải không?" },
      { hanzi: "不", pinyin: "bù", meaning: "Không (phó từ phủ định)", exampleZh: "不是", examplePy: "bú shì", exampleVi: "Không phải" },
      { hanzi: "老师", pinyin: "lǎoshī", meaning: "Thầy/cô giáo", exampleZh: "王老师", examplePy: "Wáng lǎoshī", exampleVi: "Thầy Vương" },
      { hanzi: "学生", pinyin: "xuésheng", meaning: "Học sinh, sinh viên", exampleZh: "我们都是学生。", examplePy: "Wǒmen dōu shì xuésheng.", exampleVi: "Chúng tôi đều là học sinh." },
      { hanzi: "也", pinyin: "yě", meaning: "Cũng", exampleZh: "我也是中国人。", examplePy: "Wǒ yě shì Zhōngguó rén.", exampleVi: "Tôi cũng là người Trung Quốc." },
      { hanzi: "哪", pinyin: "nǎ", meaning: "Nào (đại từ nghi vấn)", exampleZh: "你是哪国人？", examplePy: "Nǐ shì nǎ guó rén?", exampleVi: "Bạn là người nước nào?" },
    ],
    grammarList: [
      {
        title: "Hỏi và nói về quốc tịch",
        structure: "Chủ ngữ + 是 + 哪国人？ ➔ Chủ ngữ + 是 + [Tên quốc gia] + 人。",
        example: "你是哪国人？ ➔ 我是中国人 / 我是越南人。",
      },
      {
        title: "Câu hỏi nghi vấn Yes/No với trợ từ 吗 (Ma)",
        structure: "Câu trần thuật + 吗？",
        example: "你是学生吗？ ➔ 是，我是学生。 / 不是，我是老师。",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "大卫，你是哪国人？", pinyin: "Dàwèi, nǐ shì nǎ guó rén?", vi: "David, bạn là người nước nào?" },
      { speaker: "大卫", zh: "我是美国人。李文，你是哪国人？", pinyin: "Wǒ shì Měiguó rén. Lǐ Wén, nǐ shì nǎ guó rén?", vi: "Mình là người Mỹ. Lý Văn, bạn là người nước nào?" },
      { speaker: "李文", zh: "我是中国人。你是老师吗？", pinyin: "Wǒ shì Zhōngguó rén. Nǐ shì lǎoshī ma?", vi: "Mình là người Trung Quốc. Bạn là giáo viên à?" },
      { speaker: "大卫", zh: "我不是老师，我是学生。", pinyin: "Wǒ bú shì lǎoshī, wǒ shì xuésheng.", vi: "Mình không phải giáo viên, mình là học sinh." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 3: Thanh mẫu cuống lưỡi g, k, h",
      rule: "Phát âm tại vị trí cuống lưỡi nâng lên chạm vào ngạc mềm. Âm [k] cần đẩy hơi bật mạnh dứt khoát.",
      examples: ["gēge (anh trai)", "kǎoshì (thi cử)", "hǎokàn (đẹp mắt)"],
    },
    culture: "Cách người Trung Quốc dùng tên địa danh và quốc gia: Nước đông dân và có nền văn hóa lâu đời, luôn đề cao tinh thần hữu nghị quốc tế.",
  },
  {
    id: "hsk1-04",
    number: 4,
    titleZh: "我有两个孩子",
    pinyin: "Wǒ yǒu liǎng gè háizi",
    titleVi: "Chị có hai con",
    desc: "Nói về các thành viên gia đình, biểu đạt số lượng với 有 (có), lượng từ 个 (gè) và phân biệt 二 với 两.",
    durationMin: 40,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 2 của giáo viên",
    vocabList: [
      { hanzi: "家", pinyin: "jiā", meaning: "Nhà, gia đình", exampleZh: "我家在北京。", examplePy: "Wǒ jiā zài Běijīng.", exampleVi: "Nhà tôi ở Bắc Kinh." },
      { hanzi: "有", pinyin: "yǒu", meaning: "Có", exampleZh: "我有两个孩子。", examplePy: "Wǒ yǒu liǎng gè háizi.", exampleVi: "Chị có hai con." },
      { hanzi: "口", pinyin: "kǒu", meaning: "Lượng từ chỉ số nhân khẩu gia đình", exampleZh: "三口人", examplePy: "sān kǒu rén", exampleVi: "3 miệng ăn, 3 người" },
      { hanzi: "个", pinyin: "gè", meaning: "Cái, chiếc (lượng từ thông dụng nhất)", exampleZh: "两个人", examplePy: "liǎng gè rén", exampleVi: "hai người" },
      { hanzi: "两", pinyin: "liǎng", meaning: "Hai (dùng trước lượng từ)", exampleZh: "两个", examplePy: "liǎng gè", exampleVi: "hai cái" },
      { hanzi: "孩子", pinyin: "háizi", meaning: "Đứa con, trẻ em", exampleZh: "我的孩子", examplePy: "wǒ de háizi", exampleVi: "con của tôi" },
      { hanzi: "爸爸", pinyin: "bàba", meaning: "Bố, ba", exampleZh: "我爸爸", examplePy: "wǒ bàba", exampleVi: "bố tôi" },
      { hanzi: "妈妈", pinyin: "māma", meaning: "Mẹ, má", exampleZh: "我妈妈是医生。", examplePy: "Wǒ māma shì yīshēng.", exampleVi: "Mẹ tôi là bác sĩ." },
      { hanzi: "女儿", pinyin: "nǚ'ér", meaning: "Con gái", exampleZh: "她有一个女儿。", examplePy: "Tā yǒu yí gè nǚ'ér.", exampleVi: "Chị ấy có một cô con gái." },
    ],
    grammarList: [
      {
        title: "Biểu đạt sự sở hữu với động từ 有 (Yǒu) và phủ định 没有",
        structure: "Chủ ngữ + 有 + Tân ngữ / Chủ ngữ + 没有 + Tân ngữ",
        example: "我有两个孩子。(Chị có hai con.) · 我没有女儿。(Tôi không có con gái.)",
      },
      {
        title: "Quy tắc dùng 两 (Liǎng) thay vì 二 (Èr) trước lượng từ",
        structure: "两 + Lượng từ + Danh từ (KHÔNG DÙNG: 二 + Lượng từ)",
        example: "两个孩子 (Hai đứa con) · 两口人 (Hai người trong nhà)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "张老师，你家有几口人？", pinyin: "Zhāng lǎoshī, nǐ jiā yǒu jǐ kǒu rén?", vi: "Thầy Trương, nhà thầy có mấy người ạ?" },
      { speaker: "张老师", zh: "我家有四口人：我、我妻子和两个孩子。", pinyin: "Wǒ jiā yǒu sì kǒu rén: wǒ, wǒ qīzi hé liǎng gè háizi.", vi: "Nhà thầy có bốn người: thầy, vợ thầy và hai đứa con." },
      { speaker: "李文", zh: "你孩子多大了？", pinyin: "Nǐ háizi duō dà le?", vi: "Các cháu nhà thầy bao nhiêu tuổi rồi ạ?" },
      { speaker: "张老师", zh: "儿子八岁，女儿五岁。", pinyin: "Érzi bā suì, nǚ'ér wǔ suì.", vi: "Con trai tám tuổi, con gái năm tuổi." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 4: Thanh nhẹ (Khinh thanh) trong từ xưng hô gia đình",
      rule: "Âm tiết thứ hai trong các từ xưng hô lặp lại phát âm nhẹ và ngắn: bàba, māma, gēge, mèimei.",
      examples: ["bàba", "māma", "dìdi", "jiějie"],
    },
    culture: "Quan niệm gia đình truyền thống Trung Hoa: Coi trọng chữ Hiếu và sự sum vầy 'Đoàn viên' (团圆) trong các dịp lễ tết.",
  },
  {
    id: "hsk1-05",
    number: 5,
    titleZh: "今天我休息",
    pinyin: "Jīntiān wǒ xiūxi",
    titleVi: "Hôm nay anh được nghỉ",
    desc: "Nói về thứ ngày trong tuần, sinh hoạt nghỉ ngơi, hẹn hò rủ rê bạn bè với trợ từ ngữ khí 吧 (ba).",
    durationMin: 35,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 2 của giáo viên",
    vocabList: [
      { hanzi: "今天", pinyin: "jīntiān", meaning: "Hôm nay", exampleZh: "今天我休息。", examplePy: "Jīntiān wǒ xiūxi.", exampleVi: "Hôm nay anh được nghỉ." },
      { hanzi: "明天", pinyin: "míngtiān", meaning: "Ngày mai", exampleZh: "明天见！", examplePy: "Míngtiān jiàn!", exampleVi: "Ngày mai gặp nhé!" },
      { hanzi: "昨天", pinyin: "zuótiān", meaning: "Hôm qua", exampleZh: "昨天我很忙。", examplePy: "Zuótiān wǒ hěn máng.", exampleVi: "Hôm qua mình rất bận." },
      { hanzi: "星期", pinyin: "xīngqī", meaning: "Thứ, tuần lễ", exampleZh: "星期天", examplePy: "xīngqītiān", exampleVi: "Chủ nhật" },
      { hanzi: "休息", pinyin: "xiūxi", meaning: "Nghỉ ngơi, được nghỉ", exampleZh: "今天你休息吗？", examplePy: "Jīntiān nǐ xiūxi ma?", exampleVi: "Hôm nay bạn có được nghỉ không?" },
      { hanzi: "喝", pinyin: "hē", meaning: "Uống", exampleZh: "喝茶", examplePy: "hē chá", exampleVi: "Uống trà" },
      { hanzi: "茶", pinyin: "chá", meaning: "Trà", exampleZh: "喝中国茶", examplePy: "hē Zhōngguó chá", exampleVi: "Uống trà Trung Quốc" },
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "Cà phê", exampleZh: "喝咖啡", examplePy: "hē kāfēi", exampleVi: "Uống cà phê" },
      { hanzi: "吧", pinyin: "ba", meaning: "Đi, nhé (trợ từ ngữ khí rủ rê)", exampleZh: "我们去喝咖啡吧！", examplePy: "Wǒmen qù hē kāfēi ba!", exampleVi: "Chúng mình đi uống cà phê đi!" },
    ],
    grammarList: [
      {
        title: "Cách nói thứ ngày trong tuần",
        structure: "星期 + Số từ (1, 2, 3, 4, 5, 6) / 星期天 (Chủ nhật)",
        example: "星期一 (Thứ 2) · 星期六 (Thứ 7) · 星期天 / 星期日 (Chủ nhật)",
      },
      {
        title: "Trợ từ ngữ khí đề xuất 吧 (Ba)",
        structure: "Mệnh đề + 吧！",
        example: "我们去喝茶吧！(Chúng mình đi uống trà đi!)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "今天星期几？", pinyin: "Jīntiān xīngqī jǐ?", vi: "Hôm nay là thứ mấy thế?" },
      { speaker: "王明", zh: "今天星期天。你上班吗？", pinyin: "Jīntiān xīngqītiān. Nǐ shàngbān ma?", vi: "Hôm nay là Chủ nhật. Bạn có đi làm không?" },
      { speaker: "李文", zh: "今天我休息！我们一起去喝咖啡吧。", pinyin: "Jīntiān wǒ xiūxi! Wǒmen yìqǐ qù hē kāfēi ba.", vi: "Hôm nay anh được nghỉ! Chúng mình cùng đi uống cà phê đi." },
      { speaker: "王明", zh: "太好了，走吧！", pinyin: "Tài hǎo le, zǒu ba!", vi: "Tuyệt quá, đi thôi!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 5: Vận mẫu kép ai, ei, ao, ou",
      rule: "Chuyển động môi mượt mà từ âm chính sang âm phụ, giữ trường độ âm đầu dài hơn âm sau.",
      examples: ["bái (trắng)", "měi (đẹp)", "gāo (cao)", "dǒu (đấu)"],
    },
    culture: "Văn hóa uống trà và giao lưu ngày nghỉ ở Trung Quốc: Quán trà truyền thống là không gian thư giãn, đàm đạo tao nhã sau chuỗi ngày làm việc.",
  },
  {
    id: "hsk1-06",
    number: 6,
    titleZh: "你的手机号是多少？",
    pinyin: "Nǐ de shǒujī hào shì duōshao?",
    titleVi: "Số điện thoại của bạn là bao nhiêu?",
    desc: "Đọc số đếm từ 0 đến 100, cách hỏi số điện thoại với 多少 (duōshao) và cách đọc số 1 là 'yāo'.",
    durationMin: 35,
    vocabCount: 10,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 3 của giáo viên",
    vocabList: [
      { hanzi: "电话", pinyin: "diànhuà", meaning: "Điện thoại", exampleZh: "打电话", examplePy: "dǎ diànhuà", exampleVi: "Gọi điện thoại" },
      { hanzi: "手机", pinyin: "shǒujī", meaning: "Điện thoại di động", exampleZh: "我的手机", examplePy: "wǒ de shǒujī", exampleVi: "Điện thoại của tôi" },
      { hanzi: "号", pinyin: "hào", meaning: "Số, ngày", exampleZh: "手机号", examplePy: "shǒujī hào", exampleVi: "Số điện thoại" },
      { hanzi: "多少", pinyin: "duōshao", meaning: "Bao nhiêu (đại từ hỏi số lượng > 10)", exampleZh: "多少钱？", examplePy: "Duōshao qián?", exampleVi: "Bao nhiêu tiền?" },
      { hanzi: "零", pinyin: "líng", meaning: "Số 0", exampleZh: "零点", examplePy: "líng diǎn", exampleVi: "0 giờ" },
      { hanzi: "一", pinyin: "yī / yāo", meaning: "Số 1 (đọc yāo trong dãy số)", exampleZh: "138", examplePy: "yāo sān bā", exampleVi: "một ba tám" },
      { hanzi: "百", pinyin: "bǎi", meaning: "Trăm (100)", exampleZh: "一百", examplePy: "yì bǎi", exampleVi: "Một trăm" },
      { hanzi: "给", pinyin: "gěi", meaning: "Cho, gọi cho", exampleZh: "给我打电话", examplePy: "gěi wǒ dǎ diànhuà", exampleVi: "Gọi điện thoại cho tôi" },
    ],
    grammarList: [
      {
        title: "Hỏi số lượng lớn hoặc thông tin số với 多少 (Duōshao)",
        structure: "Chủ ngữ + 是 + 多少？",
        example: "你的手机号是多少？ (Số điện thoại của bạn là bao nhiêu?)",
      },
      {
        title: "Quy tắc đọc số 1 là 'Yāo' trong số điện thoại và phòng ốc",
        structure: "Khi đọc dãy số thứ tự, đọc số 1 là yāo để tránh nhầm với số 7 (qī)",
        example: "13812345678 ➔ yāo sān bā yāo èr sān sì wǔ liù qī bā",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "小明，你的手机号是多少？", pinyin: "Xiǎomíng, nǐ de shǒujī hào shì duōshao?", vi: "Tiểu Minh, số điện thoại của bạn là bao nhiêu?" },
      { speaker: "小明", zh: "我的手机号是139-1234-5678。", pinyin: "Wǒ de shǒujī hào shì yāo sān jiǔ, yāo èr sān sì, wǔ liù qī bā.", vi: "Số điện thoại của mình là 139-1234-5678." },
      { speaker: "李文", zh: "好的，晚上我给你打电话。", pinyin: "Hǎo de, wǎnshang wǒ gěi nǐ dǎ diànhuà.", vi: "Được rồi, tối nay mình sẽ gọi cho bạn." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 6: Thanh mẫu mặt lưỡi j, q, x",
      rule: "Mặt lưỡi áp sát ngạc cứng. Âm [q] bật hơi mạnh. j, q, x chỉ đi với nguyên âm i và ü (viết là u bỏ dấu 2 chấm).",
      examples: ["jī (gà)", "qī (bảy)", "xī (tây)"],
    },
    culture: "Ý nghĩa phong thủy của các con số ở Trung Quốc: Số 8 (Bát - 发) tượng trưng cho phát tài phát lộc; số 6 (Lục - 流) tượng trưng cho mọi sự hanh thông thuận lợi.",
  },
  {
    id: "hsk1-07",
    number: 7,
    titleZh: "我晚上六点半下班",
    pinyin: "Wǒ wǎnshang liù diǎn bàn xiàbān",
    titleVi: "Em tan làm lúc 6 rưỡi tối",
    desc: "Biểu đạt thời gian, giờ giấc trong ngày (sáng, trưa, tối), cấu trúc Điểm + Phút + 半 (rưỡi).",
    durationMin: 40,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 3 của giáo viên",
    vocabList: [
      { hanzi: "点", pinyin: "diǎn", meaning: "Giờ (thời điểm)", exampleZh: "六点", examplePy: "liù diǎn", exampleVi: "6 giờ" },
      { hanzi: "分", pinyin: "fēn", meaning: "Phút", exampleZh: "十分", examplePy: "shí fēn", exampleVi: "10 phút" },
      { hanzi: "半", pinyin: "bàn", meaning: "Nửa, rưỡi (30 phút)", exampleZh: "六点半", examplePy: "liù diǎn bàn", exampleVi: "6 rưỡi" },
      { hanzi: "早上", pinyin: "zǎoshang", meaning: "Sáng sớm", exampleZh: "早上好！", examplePy: "Zǎoshang hǎo!", exampleVi: "Chào buổi sáng!" },
      { hanzi: "上午", pinyin: "shàngwǔ", meaning: "Buổi sáng (9h-11h)", exampleZh: "上午上课", examplePy: "shàngwǔ shàngkè", exampleVi: "Buổi sáng lên lớp" },
      { hanzi: "中午", pinyin: "zhōngwǔ", meaning: "Buổi trưa", exampleZh: "中午吃饭", examplePy: "zhōngwǔ chīfàn", exampleVi: "Buổi trưa ăn cơm" },
      { hanzi: "下午", pinyin: "xiàwǔ", meaning: "Buổi chiều", exampleZh: "下午开会", examplePy: "xiàwǔ kāihuì", exampleVi: "Buổi chiều họp" },
      { hanzi: "晚上", pinyin: "wǎnshang", meaning: "Buổi tối", exampleZh: "晚上六点", examplePy: "wǎnshang liù diǎn", exampleVi: "6 giờ tối" },
      { hanzi: "下班", pinyin: "xiàbān", meaning: "Tan làm, hết ca", exampleZh: "我下班了。", examplePy: "Wǒ xiàbān le.", exampleVi: "Tôi tan làm rồi." },
    ],
    grammarList: [
      {
        title: "Quy tắc trật tự thời gian từ lớn đến nhỏ trong tiếng Trung",
        structure: "Buổi trong ngày + Giờ + Phút / 半",
        example: "晚上六点半 (6 giờ rưỡi tối) · 上午八点十分 (8 giờ 10 phút sáng)",
      },
      {
        title: "Trạng ngữ chỉ thời gian đứng trước hoặc sau chủ ngữ",
        structure: "Chủ ngữ + Thời gian + Động từ (hoặc: Thời gian + Chủ ngữ + Động từ)",
        example: "我晚上六点半下班。(Em tan làm lúc 6 rưỡi tối.)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "王芳，你今天几点下班？", pinyin: "Wáng Fāng, nǐ jīntiān jǐ diǎn xiàbān?", vi: "Vương Phương, hôm nay mấy giờ bạn tan làm?" },
      { speaker: "王芳", zh: "我晚上六点半下班。怎么了？", pinyin: "Wǒ wǎnshang liù diǎn bàn xiàbān. Zěnme le?", vi: "Em tan làm lúc 6 rưỡi tối. Có việc gì thế anh?" },
      { speaker: "李文", zh: "七点我们一起吃晚饭，好吗？", pinyin: "Qī diǎn wǒmen yìqǐ chī wǎnfàn, hǎo ma?", vi: "Bảy giờ tụi mình cùng đi ăn tối nhé, được không?" },
      { speaker: "王芳", zh: "太好了，七点见！", pinyin: "Tài hǎo le, qī diǎn jiàn!", vi: "Tuyệt quá, 7 giờ gặp anh nhé!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 7: Âm uốn lưỡi zh, ch, sh, r",
      rule: "Đầu lưỡi cong lên chạm vào vòm họng ngạc cứng. Âm [ch] bật hơi mạnh. Âm [r] rung nhẹ.",
      examples: ["zhōng (trung)", "chī (ăn)", "shàng (lên)", "rì (ngày)"],
    },
    culture: "Thói quen sinh hoạt và nghỉ trưa (午休) của người Trung Quốc: Giờ nghỉ trưa rất được coi trọng để nạp lại năng lượng cho buổi chiều làm việc hiệu quả.",
  },
  {
    id: "hsk1-08",
    number: 8,
    titleZh: "我爸爸也在医院工作",
    pinyin: "Wǒ bàba yě zài yīyuàn gōngzuò",
    titleVi: "Bố em cũng làm việc ở bệnh viện",
    desc: "Nói về nơi chốn và địa điểm làm việc với giới từ 在 (zài), các nghề nghiệp phổ biến như bác sĩ, giáo viên.",
    durationMin: 40,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 4 của giáo viên",
    vocabList: [
      { hanzi: "在", pinyin: "zài", meaning: "Ở, tại (giới từ chỉ địa điểm)", exampleZh: "他在北京。", examplePy: "Tā zài Běijīng.", exampleVi: "Anh ấy ở Bắc Kinh." },
      { hanzi: "医院", pinyin: "yīyuàn", meaning: "Bệnh viện", exampleZh: "去医院", examplePy: "qù yīyuàn", exampleVi: "Đi bệnh viện" },
      { hanzi: "医生", pinyin: "yīshēng", meaning: "Bác sĩ", exampleZh: "我是医生。", examplePy: "Wǒ shì yīshēng.", exampleVi: "Tôi là bác sĩ." },
      { hanzi: "学校", pinyin: "xuéxiào", meaning: "Trường học", exampleZh: "在学校学习", examplePy: "zài xuéxiào xuéxí", exampleVi: "Học ở trường" },
      { hanzi: "工作", pinyin: "gōngzuò", meaning: "Làm việc, công việc", exampleZh: "你在哪儿工作？", examplePy: "Nǐ zài nǎr gōngzuò?", exampleVi: "Bạn làm việc ở đâu?" },
      { hanzi: "哪儿", pinyin: "nǎr", meaning: "Ở đâu, chỗ nào", exampleZh: "你去哪儿？", examplePy: "Nǐ qù nǎr?", exampleVi: "Bạn đi đâu?" },
      { hanzi: "公司", pinyin: "gōngsī", meaning: "Công ty", exampleZh: "在公司上班", examplePy: "zài gōngsī shàngbān", exampleVi: "Làm việc tại công ty" },
      { hanzi: "爸爸", pinyin: "bàba", meaning: "Bố", exampleZh: "我爸爸", examplePy: "wǒ bàba", exampleVi: "Bố tôi" },
    ],
    grammarList: [
      {
        title: "Cấu trúc giới từ chỉ nơi chốn hành động với 在 (Zài)",
        structure: "Chủ ngữ + 在 + Nơi chốn + Động từ + Tân ngữ",
        example: "我爸爸在医院工作。(Bố em làm việc ở bệnh viện.)",
        explanation: "Chú ý: Trong tiếng Trung, cụm giới từ chỉ địa điểm luôn đứng TRƯỚC động từ chính.",
      },
      {
        title: "Hỏi nơi chốn với đại từ 在哪儿 (Zài nǎr)",
        structure: "Chủ ngữ + 在哪儿 + Động từ？",
        example: "你在哪儿工作？ ➔ 我在学校工作。",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "张婷，你妈妈是医生吗？", pinyin: "Zhāng Tíng, nǐ māma shì yīshēng ma?", vi: "Trương Đình, mẹ bạn là bác sĩ à?" },
      { speaker: "张婷", zh: "对，她在北京第一医院工作。", pinyin: "Duì, tā zài Běijīng Dì-yī Yīyuàn gōngzuò.", vi: "Đúng rồi, bà ấy làm việc ở Bệnh viện số 1 Bắc Kinh." },
      { speaker: "李文", zh: "真巧！我爸爸也在医院工作，他也是医生。", pinyin: "Zhēn qiǎo! Wǒ bàba yě zài yīyuàn gōngzuò, tā yě shì yīshēng.", vi: "Trùng hợp thật! Bố em cũng làm việc ở bệnh viện, ông ấy cũng là bác sĩ." },
      { speaker: "张婷", zh: "太好了！", pinyin: "Tài hǎo le!", vi: "Tuyệt quá!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 8: Âm đầu lưỡi trước z, c, s",
      rule: "Đầu lưỡi đặt phẳng chạm vào mặt sau của răng cửa trên. Âm [c] bật hơi mạnh.",
      examples: ["zài (ở)", "cài (món ăn)", "sān (ba)"],
    },
    culture: "Nghề thầy thuốc và y đức trong văn hóa truyền thống Trung Hoa: Tôn vinh danh xưng 'Lương y như từ mẫu' và sự kết hợp hài hòa giữa Đông y và Tây y hiện đại.",
  },
  {
    id: "hsk1-09",
    number: 9,
    titleZh: "我明天上午在学校学习",
    pinyin: "Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí",
    titleVi: "Sáng mai mình học ở trường",
    desc: "Cấu trúc câu hoàn chỉnh kết hợp Thời gian + Địa điểm + Hành động; các môn học và hoạt động học đường.",
    durationMin: 35,
    vocabCount: 8,
    grammarCount: 2,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 4 của giáo viên",
    vocabList: [
      { hanzi: "学习", pinyin: "xuéxí", meaning: "Học tập, học", exampleZh: "学习汉语", examplePy: "xuéxí hànyǔ", exampleVi: "Học tiếng Trung" },
      { hanzi: "汉语", pinyin: "hànyǔ", meaning: "Tiếng Hán, tiếng Trung", exampleZh: "说汉语", examplePy: "shuō hànyǔ", exampleVi: "Nói tiếng Trung" },
      { hanzi: "看书", pinyin: "kànshū", meaning: "Đọc sách", exampleZh: "在图书馆看书", examplePy: "zài túshūguǎn kànshū", exampleVi: "Đọc sách ở thư viện" },
      { hanzi: "写", pinyin: "xiě", meaning: "Viết", exampleZh: "写汉字", examplePy: "xiě hànzì", exampleVi: "Viết chữ Hán" },
      { hanzi: "汉字", pinyin: "hànzì", meaning: "Chữ Hán", exampleZh: "汉字很有意思。", examplePy: "Hànzì hěn yǒu yìsi.", exampleVi: "Chữ Hán rất thú vị." },
      { hanzi: "做", pinyin: "zuò", meaning: "Làm", exampleZh: "你做什么？", examplePy: "Nǐ zuò shénme?", exampleVi: "Bạn làm gì?" },
      { hanzi: "作业", pinyin: "zuòyè", meaning: "Bài tập về nhà", exampleZh: "做作业", examplePy: "zuò zuòyè", exampleVi: "Làm bài tập" },
    ],
    grammarList: [
      {
        title: "Trật tự câu đa thành phần chuẩn mực trong tiếng Trung",
        structure: "Chủ ngữ + [Thời gian] + [Địa điểm: 在...] + Động từ + Tân ngữ",
        example: "我明天上午在学校学习汉语。(Sáng mai tôi học tiếng Trung ở trường.)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "明天上午你有空吗？", pinyin: "Míngtiān shàngwǔ nǐ yǒu kòng ma?", vi: "Sáng mai bạn có rảnh không?" },
      { speaker: "大卫", zh: "明天上午我在学校学习汉语，下午有空。", pinyin: "Míngtiān shàngwǔ wǒ zài xuéxiào xuéxí hànyǔ, xiàwǔ yǒu kòng.", vi: "Sáng mai mình học tiếng Trung ở trường, buổi chiều thì rảnh." },
      { speaker: "李文", zh: "那下午我们一起做作业吧！", pinyin: "Nà xiàwǔ wǒmen yìqǐ zuò zuòyè ba!", vi: "Vậy chiều tụi mình cùng làm bài tập nhé!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 9: Vận mẫu mũi trước an, en, in, ün",
      rule: "Đầu lưỡi nâng lên chạm ngạc cứng chặn luồng hơi, âm vang qua khoang mũi.",
      examples: ["shān (núi)", "mén (cửa)", "xīn (tim)", "yún (mây)"],
    },
    culture: "Truyền thống tôn sư trọng đạo và tinh thần hiếu học: 'Học như thuyền đi ngược dòng nước, không tiến ắt sẽ lùi'.",
  },
  {
    id: "hsk1-10",
    number: 10,
    titleZh: "这儿的苹果真便宜！",
    pinyin: "Zhèr de píngguǒ zhēn piányi!",
    titleVi: "Táo ở đây rẻ thật!",
    desc: "Mua sắm, hỏi giá cả hàng hóa, khen ngợi với phó từ 真 (zhēn) và đơn vị tiền tệ Trung Quốc (块/元).",
    durationMin: 40,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 5 của giáo viên",
    vocabList: [
      { hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo", exampleZh: "买苹果", examplePy: "mǎi píngguǒ", exampleVi: "Mua táo" },
      { hanzi: "这儿", pinyin: "zhèr", meaning: "Ở đây, chỗ này", exampleZh: "这儿很漂亮。", examplePy: "Zhèr hěn piàoliang.", exampleVi: "Ở đây đẹp thật." },
      { hanzi: "真", pinyin: "zhēn", meaning: "Thật là, thật sự", exampleZh: "真好吃！", examplePy: "Zhēn hǎochī!", exampleVi: "Ngon thật đấy!" },
      { hanzi: "便宜", pinyin: "piányi", meaning: "Rẻ", exampleZh: "很便宜", examplePy: "hěn piányi", exampleVi: "Rất rẻ" },
      { hanzi: "贵", pinyin: "guì", meaning: "Đắt, quý", exampleZh: "太贵了！", examplePy: "Tài guì le!", exampleVi: "Đắt quá rồi!" },
      { hanzi: "买", pinyin: "mǎi", meaning: "Mua", exampleZh: "你想买什么？", examplePy: "Nǐ xiǎng mǎi shénme?", exampleVi: "Bạn muốn mua gì?" },
      { hanzi: "块", pinyin: "kuài", meaning: "Đồng, tệ (khẩu ngữ tiền tệ)", exampleZh: "五块钱", examplePy: "wǔ kuài qián", exampleVi: "Năm tệ" },
      { hanzi: "斤", pinyin: "jīn", meaning: "Cân Trung Quốc (= 500 gram)", exampleZh: "一斤苹果", examplePy: "yì jīn píngguǒ", exampleVi: "Một cân táo (500g)" },
    ],
    grammarList: [
      {
        title: "Câu cảm thán với phó từ 真 (Zhēn)",
        structure: "Chủ ngữ + 真 + Tính từ！",
        example: "这儿的苹果真便宜！(Táo ở đây rẻ thật!) · 这件衣服真漂亮！(Bộ đồ này đẹp quá!)",
      },
      {
        title: "Hỏi giá tiền với 多少钱 (Duōshao qián)",
        structure: "Danh từ + 多少钱 + (一斤 / 一个)？",
        example: "苹果多少钱一斤？ ➔ 三块钱一斤。(Táo bao nhiêu một cân? ➔ 3 tệ một cân.)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "老板，苹果多少钱一斤？", pinyin: "Lǎobǎn, píngguǒ duōshao qián yì jīn?", vi: "Ông chủ ơi, táo bao nhiêu tiền một cân (500g) thế?" },
      { speaker: "老板", zh: "三块五一斤。很甜的！", pinyin: "Sān kuài wǔ yì jīn. Hěn tián de!", vi: "Ba tệ rưỡi một cân. Ngọt lắm đấy!" },
      { speaker: "李文", zh: "这儿的苹果真便宜！给我来三斤。", pinyin: "Zhèr de píngguǒ zhēn piányi! Gěi wǒ lái sān jīn.", vi: "Táo ở đây rẻ thật! Cho tôi ba cân nhé." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 10: Vận mẫu mũi sau ang, eng, ing, ong",
      rule: "Cuống lưỡi nâng lên chạm ngạc mềm, luồng khí hoàn toàn thoát qua mũi tạo âm trầm vang.",
      examples: ["bāng (giúp)", "péng (bạn)", "míng (tên)", "hóng (đỏ)"],
    },
    culture: "Thanh toán di động (移动支付) tại Trung Quốc: WeChat Pay và Alipay là phương thức mua sắm phổ biến không cần dùng tiền mặt kể cả ở chợ dân sinh.",
  },
  {
    id: "hsk1-11",
    number: 11,
    titleZh: "我读大学呢",
    pinyin: "Wǒ dú dàxué ne",
    titleVi: "Em đang học đại học",
    desc: "Biểu đạt hành động đang tiếp diễn với trợ từ 呢 (ne), nói về trường lớp và các bậc học.",
    durationMin: 35,
    vocabCount: 8,
    grammarCount: 2,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 5 của giáo viên",
    vocabList: [
      { hanzi: "读", pinyin: "dú", meaning: "Đọc, theo học", exampleZh: "读书", examplePy: "dúshū", exampleVi: "Đi học, đọc sách" },
      { hanzi: "大学", pinyin: "dàxué", meaning: "Trường đại học", exampleZh: "北京大学", examplePy: "Běijīng Dàxué", exampleVi: "Đại học Bắc Kinh" },
      { hanzi: "中学", pinyin: "zhōngxué", meaning: "Trường trung học", exampleZh: "中学生", examplePy: "zhōngxuéshēng", exampleVi: "Học sinh cấp 2-3" },
      { hanzi: "小学", pinyin: "xiǎoxué", meaning: "Trường tiểu học", exampleZh: "小学生", examplePy: "xiǎoxuéshēng", exampleVi: "Học sinh tiểu học" },
      { hanzi: "呢", pinyin: "ne", meaning: "Đang (trợ từ biểu thị tiếp diễn / ngữ khí)", exampleZh: "他在看书呢。", examplePy: "Tā zài kànshū ne.", exampleVi: "Anh ấy đang đọc sách đấy." },
      { hanzi: "同屋", pinyin: "tóngwū", meaning: "Bạn cùng phòng (ký túc xá)", exampleZh: "我的同屋", examplePy: "wǒ de tóngwū", exampleVi: "Bạn cùng phòng của tôi" },
      { hanzi: "朋友", pinyin: "péngyou", meaning: "Bạn bè", exampleZh: "好朋友", examplePy: "hǎo péngyou", exampleVi: "Bạn tốt" },
    ],
    grammarList: [
      {
        title: "Biểu đạt hành động đang tiếp diễn với trợ từ 呢 (Ne)",
        structure: "Chủ ngữ + (在 / 正在) + Động từ + (Tân ngữ) + 呢",
        example: "我读大学呢。(Em đang học đại học đấy.) · 他睡觉呢。(Cậu ấy đang ngủ.)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "小语，你在做什么呢？", pinyin: "Xiǎoyǔ, nǐ zài zuò shénme ne?", vi: "Tiểu Ngữ, bạn đang làm gì đấy?" },
      { speaker: "AI小语", zh: "我在准备明天的汉语课呢。你妹妹现在做什么？", pinyin: "Wǒ zài zhǔnbèi míngtiān de hànyǔ kè ne. Nǐ mèimei xiànzài zuò shénme?", vi: "Mình đang chuẩn bị bài giảng tiếng Trung ngày mai đây. Em gái bạn giờ làm gì rồi?" },
      { speaker: "李文", zh: "她读大学呢，天天都很用功。", pinyin: "Tā dú dàxué ne, tiāntiān dōu hěn yònggōng.", vi: "Em ấy đang học đại học, ngày nào cũng rất chăm chỉ." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 11: Biến điệu của '一' (Yī)",
      rule: "Yī đọc thanh 4 trước từ thanh 1, 2, 3 (yí gè, yí bēi); đọc thanh 2 trước từ thanh 4 (yí kuài, yí dìng).",
      examples: ["yì tiān (thanh 4)", "yí piàn (thanh 2)"],
    },
    culture: "Đời sống sinh viên đại học ở Trung Quốc: Ký túc xá sinh viên là nơi gắn kết tình bạn sâu sắc 'Tình đồng học' (同学情) suốt cả cuộc đời.",
  },
  {
    id: "hsk1-12",
    number: 12,
    titleZh: "昨天下雪了",
    pinyin: "Zuótiān xiàxuě le",
    titleVi: "Hôm qua tuyết rơi rồi",
    desc: "Nói về thời tiết, khí hậu (mưa, tuyết, lạnh, nóng) và trợ từ ngữ khí biểu thị sự thay đổi 了 (le).",
    durationMin: 35,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 6 của giáo viên",
    vocabList: [
      { hanzi: "天气", pinyin: "tiānqì", meaning: "Thời tiết", exampleZh: "今天天气很好。", examplePy: "Jīntiān tiānqì hěn hǎo.", exampleVi: "Hôm nay thời tiết rất đẹp." },
      { hanzi: "下雨", pinyin: "xiàyǔ", meaning: "Mưa, trời mưa", exampleZh: "外面下雨了。", examplePy: "Wàimiàn xiàyǔ le.", exampleVi: "Bên ngoài trời mưa rồi." },
      { hanzi: "下雪", pinyin: "xiàxuě", meaning: "Tuyết rơi", exampleZh: "昨天下雪了。", examplePy: "Zuótiān xiàxuě le.", exampleVi: "Hôm qua tuyết rơi rồi." },
      { hanzi: "冷", pinyin: "lěng", meaning: "Lạnh", exampleZh: "今天太冷了！", examplePy: "Jīntiān tài lěng le!", exampleVi: "Hôm nay lạnh quá!" },
      { hanzi: "热", pinyin: "rè", meaning: "Nóng", exampleZh: "天气很热。", examplePy: "Tiānqì hěn rè.", exampleVi: "Thời tiết rất nóng." },
      { hanzi: "了", pinyin: "le", meaning: "Rồi (trợ từ biểu thị sự thay đổi hoặc hoàn thành)", exampleZh: "下雪了", examplePy: "xiàxuě le", exampleVi: "Rơi tuyết rồi" },
      { hanzi: "怎么样", pinyin: "zěnmeyàng", meaning: "Thế nào, ra sao", exampleZh: "天气怎么样？", examplePy: "Tiānqì zěnmeyàng?", exampleVi: "Thời tiết thế nào?" },
    ],
    grammarList: [
      {
        title: "Trợ từ ngữ khí 了 biểu thị sự xuất hiện tình huống mới hoặc thay đổi",
        structure: "Câu / Vị ngữ + 了",
        example: "昨天下雪了。(Hôm qua tuyết rơi rồi - trước đó chưa rơi).",
      },
      {
        title: "Cấu trúc quá mức với 太...了 (Tài... le)",
        structure: "太 + Tính từ + 了",
        example: "今天太冷了！(Hôm nay lạnh quá!) · 太好了！(Tuyệt vời quá!)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "大卫，昨天北京的天气怎么样？", pinyin: "Dàwèi, zuótiān Běijīng de tiānqì zěnmeyàng?", vi: "David, thời tiết Bắc Kinh hôm qua thế nào?" },
      { speaker: "大卫", zh: "昨天下雪了！天气太冷了。", pinyin: "Zuótiān xiàxuě le! Tiānqì tài lěng le.", vi: "Hôm qua tuyết rơi rồi! Thời tiết lạnh quá." },
      { speaker: "李文", zh: "今天还下雪吗？", pinyin: "Jīntiān hái xiàxuě ma?", vi: "Hôm nay còn tuyết rơi nữa không?" },
      { speaker: "大卫", zh: "今天不下雪了，但是风很大。", pinyin: "Jīntiān bú xiàxuě le, dànshì fēng hěn dà.", vi: "Hôm nay không rơi tuyết nữa rồi, nhưng gió rất to." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 12: Biến điệu của '不' (Bù)",
      rule: "Đọc 'bù' mang thanh 4 trước thanh 1, 2, 3 (bù lěng, bù rè); đọc 'bú' mang thanh 2 trước từ thanh 4 (bú xiè, bú shì).",
      examples: ["bù lěng", "bú duì"],
    },
    culture: "Bốn mùa và vẻ đẹp mùa đông ở miền Bắc Trung Quốc: Mùa đông Bắc Kinh với tuyết trắng phủ lên mái ngói vàng Tử Cấm Thành là cảnh tượng kỳ vĩ đậm chất thơ.",
  },
  {
    id: "hsk1-13",
    number: 13,
    titleZh: "请给我一杯茶",
    pinyin: "Qǐng gěi wǒ yì bēi chá",
    titleVi: "Cho tôi một cốc trà",
    desc: "Cách yêu cầu, thỉnh cầu lịch sự với 请 (qǐng), gọi đồ ăn thức uống tại nhà hàng và lượng từ 杯 (bēi).",
    durationMin: 35,
    vocabCount: 9,
    grammarCount: 2,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 6 của giáo viên",
    vocabList: [
      { hanzi: "请", pinyin: "qǐng", meaning: "Xin mời, làm ơn", exampleZh: "请坐", examplePy: "qǐng zuò", exampleVi: "Xin mời ngồi" },
      { hanzi: "给", pinyin: "gěi", meaning: "Đưa, cho", exampleZh: "给我", examplePy: "gěi wǒ", exampleVi: "Đưa cho tôi" },
      { hanzi: "杯", pinyin: "bēi", meaning: "Cốc, ly (lượng từ)", exampleZh: "一杯茶", examplePy: "yì bēi chá", exampleVi: "Một cốc trà" },
      { hanzi: "水", pinyin: "shuǐ", meaning: "Nước", exampleZh: "喝水", examplePy: "hē shuǐ", exampleVi: "Uống nước" },
      { hanzi: "米饭", pinyin: "mǐfàn", meaning: "Cơm trắng", exampleZh: "吃米饭", examplePy: "chī mǐfàn", exampleVi: "Ăn cơm" },
      { hanzi: "菜", pinyin: "cài", meaning: "Món ăn, rau", exampleZh: "中国菜", examplePy: "Zhōngguó cài", exampleVi: "Món ăn Trung Quốc" },
      { hanzi: "想", pinyin: "xiǎng", meaning: "Muốn, nhớ, nghĩ", exampleZh: "我想吃中国菜。", examplePy: "Wǒ xiǎng chī Zhōngguó cài.", exampleVi: "Tôi muốn ăn món Trung Quốc." },
    ],
    grammarList: [
      {
        title: "Câu cầu khiến lịch sự với 请 (Qǐng)",
        structure: "请 + Động từ + Tân ngữ",
        example: "请给我一杯茶。(Làm ơn cho tôi một cốc trà.) · 请进！(Xin mời vào!)",
      },
      {
        title: "Động từ năng nguyện 想 (Xiǎng) biểu thị mong muốn",
        structure: "Chủ ngữ + 想 + Động từ + Tân ngữ",
        example: "我想喝一杯热茶。(Tôi muốn uống một cốc trà nóng.)",
      },
    ],
    dialogue: [
      { speaker: "服务员", zh: "您好！请问您想喝点什么？", pinyin: "Nín hǎo! Qǐngwèn nín xiǎng hē diǎn shénme?", vi: "Kính chào quý khách! Xin hỏi quý khách muốn dùng đồ uống gì ạ?" },
      { speaker: "李文", zh: "请给我一杯茶，谢谢。", pinyin: "Qǐng gěi wǒ yì bēi chá, xièxie.", vi: "Làm ơn cho tôi một cốc trà, cảm ơn bạn." },
      { speaker: "服务员", zh: "好的，请稍等！", pinyin: "Hǎo de, qǐng shāoděng!", vi: "Dạ được, xin vui lòng đợi một lát ạ!" },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 13: Âm uốn lưỡi Nhi hóa (儿化音)",
      rule: "Đuôi từ có âm r uốn lưỡi: zhèr (ở đây), nǎr (ở đâu), yìdiǎnr (một chút).",
      examples: ["yìdiǎnr", "zhèr", "nǎr"],
    },
    culture: "Nghệ thuật Trà đạo Trung Hoa: Khách đến nhà rót trà kính mời là nét đẹp lễ nghĩa hiếu khách ngàn đời.",
  },
  {
    id: "hsk1-14",
    number: 14,
    titleZh: "我看了一个电影",
    pinyin: "Wǒ kànle yí gè diànyǐng",
    titleVi: "Mình đã xem một bộ phim",
    desc: "Biểu đạt hành động đã hoàn thành trong quá khứ với trợ từ động thái 了 (le) sau động từ.",
    durationMin: 40,
    vocabCount: 9,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 7 của giáo viên",
    vocabList: [
      { hanzi: "看", pinyin: "kàn", meaning: "Xem, nhìn, đọc", exampleZh: "看电影", examplePy: "kàn diànyǐng", exampleVi: "Xem phim" },
      { hanzi: "电影", pinyin: "diànyǐng", meaning: "Bộ phim điện ảnh", exampleZh: "中国电影", examplePy: "Zhōngguó diànyǐng", exampleVi: "Phim Trung Quốc" },
      { hanzi: "听", pinyin: "tīng", meaning: "Nghe", exampleZh: "听音乐", examplePy: "tīng yīnyuè", exampleVi: "Nghe nhạc" },
      { hanzi: "音乐", pinyin: "yīnyuè", meaning: "Âm nhạc", exampleZh: "好听的音乐", examplePy: "hǎotīng de yīnyuè", exampleVi: "Âm nhạc hay" },
      { hanzi: "买了", pinyin: "mǎi le", meaning: "Đã mua", exampleZh: "我买了一本书。", examplePy: "Wǒ mǎi le yì běn shū.", exampleVi: "Tôi đã mua một cuốn sách." },
      { hanzi: "去", pinyin: "qù", meaning: "Đi", exampleZh: "去商店", examplePy: "qù shāngdiàn", exampleVi: "Đi cửa hàng" },
      { hanzi: "商店", pinyin: "shāngdiàn", meaning: "Cửa hàng, tiệm buôn", exampleZh: "在商店买东西", examplePy: "zài shāngdiàn mǎi dōngxi", exampleVi: "Mua đồ ở cửa hàng" },
    ],
    grammarList: [
      {
        title: "Trợ từ động thái 了 biểu thị hành động đã hoàn thành",
        structure: "Chủ ngữ + Động từ + 了 + Số lượng + Tân ngữ",
        example: "我看了一个电影。(Mình đã xem một bộ phim.) · 我买了一件衣服。(Tôi đã mua một chiếc áo.)",
      },
    ],
    dialogue: [
      { speaker: "王明", zh: "昨天晚上你做什么了？", pinyin: "Zuótiān wǎnshang nǐ zuò shénme le?", vi: "Tối hôm qua bạn đã làm gì thế?" },
      { speaker: "李文", zh: "我看了一个中国电影，很有意思！", pinyin: "Wǒ kànle yí gè Zhōngguó diànyǐng, hěn yǒu yìsi!", vi: "Mình đã xem một bộ phim Trung Quốc, rất hay và thú vị!" },
      { speaker: "王明", zh: "叫什么名字？我也想看。", pinyin: "Jiào shénme míngzi? Wǒ yě xiǎng kàn.", vi: "Phim tên là gì thế? Mình cũng muốn xem." },
    ],
    phonetics: {
      title: "Luyện ngữ âm bài 14: Nhịp điệu và ngữ điệu câu trần thuật",
      rule: "Câu trần thuật tiếng Trung có ngữ điệu xuống dần ở cuối câu; ngắt hơi tự nhiên giữa cụm chủ vị và cụm động tân.",
      examples: ["Wǒ kànle / yí gè diànyǐng."],
    },
    culture: "Điện ảnh Trung Quốc đương đại: Các tác phẩm hoạt hình và phim lịch sử hiện đại đem tiếng Hán lan tỏa ra khắp thế giới.",
  },
  {
    id: "hsk1-15",
    number: 15,
    titleZh: "大兴机场见！",
    pinyin: "Dàxīng jīchǎng jiàn!",
    titleVi: "Hẹn gặp ở sân bay Đại Hưng!",
    desc: "Phương tiện giao thông (máy bay, taxi), địa điểm sân bay, chào tạm biệt và hẹn gặp lại với 见 (jiàn).",
    durationMin: 45,
    vocabCount: 10,
    grammarCount: 3,
    isUnlockedDefault: false,
    unlockedScheduleText: "Mở theo lịch tuần 7 của giáo viên",
    vocabList: [
      { hanzi: "飞机", pinyin: "fēijī", meaning: "Máy bay", exampleZh: "坐飞机", examplePy: "zuò fēijī", exampleVi: "Đi máy bay" },
      { hanzi: "机场", pinyin: "jīchǎng", meaning: "Sân bay, phi trường", exampleZh: "去机场", examplePy: "qù jīchǎng", exampleVi: "Đi sân bay" },
      { hanzi: "大兴", pinyin: "Dàxīng", meaning: "Đại Hưng (sân bay quốc tế lớn của Bắc Kinh)", exampleZh: "大兴机场", examplePy: "Dàxīng Jīchǎng", exampleVi: "Sân bay Đại Hưng" },
      { hanzi: "坐", pinyin: "zuò", meaning: "Ngồi, đi (phương tiện)", exampleZh: "坐出租车", examplePy: "zuò chūzūchē", exampleVi: "Đi taxi" },
      { hanzi: "出租车", pinyin: "chūzūchē", meaning: "Xe taxi", exampleZh: "叫出租车", examplePy: "jiào chūzūchē", exampleVi: "Gọi xe taxi" },
      { hanzi: "见", pinyin: "jiàn", meaning: "Gặp, thấy", exampleZh: "明天见", examplePy: "míngtiān jiàn", exampleVi: "Ngày mai gặp" },
      { hanzi: "什么时候", pinyin: "shénme shíhou", meaning: "Khi nào, lúc nào", exampleZh: "你什么时候去？", examplePy: "Nǐ shénme shíhou qù?", exampleVi: "Khi nào bạn đi?" },
    ],
    grammarList: [
      {
        title: "Cấu trúc đi bằng phương tiện với 坐 (Zuò)",
        structure: "Chủ ngữ + 坐 + Phương tiện + 去 + Nơi chốn",
        example: "我坐出租车去大兴机场。(Tôi đi taxi ra sân bay Đại Hưng.)",
      },
      {
        title: "Lời chào hẹn gặp tại địa điểm hoặc thời gian",
        structure: "Thời gian / Địa điểm + 见！",
        example: "大兴机场见！(Hẹn gặp ở sân bay Đại Hưng!) · 明天见！(Ngày mai gặp!)",
      },
    ],
    dialogue: [
      { speaker: "李文", zh: "小语，你什么时候去机场？", pinyin: "Xiǎoyǔ, nǐ shénme shíhou qù jīchǎng?", vi: "Tiểu Ngữ, khi nào bạn ra sân bay thế?" },
      { speaker: "AI小语", zh: "我下午三点坐出租车去。我们大兴机场见！", pinyin: "Wǒ xiàwǔ sān diǎn zuò chūzūchē qù. Wǒmen Dàxīng Jīchǎng jiàn!", vi: "Mình đi taxi ra lúc 3 giờ chiều. Chúng mình hẹn gặp ở sân bay Đại Hưng nhé!" },
      { speaker: "李文", zh: "太好了，一路平安，大兴机场见！", pinyin: "Tài hǎo le, yílù píng'ān, Dàxīng jīchǎng jiàn!", vi: "Tuyệt quá, chúc bạn lên đường bình an, hẹn gặp ở sân bay Đại Hưng!" },
    ],
    phonetics: {
      title: "Tổng kết toàn bộ hệ thống phát âm HSK 1",
      rule: "Ôn tập 21 thanh mẫu, 36 vận mẫu, 4 thanh điệu chuẩn và cách biến âm trong giao tiếp thực tế.",
      examples: ["Nǐ hǎo", "Xièxie", "Zàijiàn", "Dàxīng jīchǎng jiàn!"],
    },
    culture: "Sân bay Quốc tế Đại Hưng Bắc Kinh (PKX): Kỳ quan kiến trúc hình hoa hải đường lộng lẫy do kiến trúc sư Zaha Hadid thiết kế, biểu tượng cho sự hội nhập hiện đại của Trung Hoa.",
  },
];
