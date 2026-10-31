// Comprehensive Lesson Library Data Model & Seed Data
// Fully aligned with HSK 3.0 (with Dedicated Level Lesson Lists),
// Theo chủ đề (9 Major Topics, 72 Subtopics, 3 Level Filter: Sơ cấp/Trung cấp/Nâng cao, 5 Parts with Cultural/Communication),
// Đại học & Ngành (12 Faculties, 50 Majors, University -> Faculty -> Major -> Course -> Chapter -> Lesson)

export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleZh: string;
  examplePy: string;
  exampleVi: string;
  usageNote?: string;
  usageExplanation?: string;
  usagePatterns?: string[];
  examples?: {
    zh: string;
    pinyin?: string;
    py?: string;
    vi: string;
  }[];
  commonMistakes?: {
    incorrect: string;
    correct: string;
    explanation: string;
  }[] | string[];
  comparison?: string;
}

export interface GrammarItem {
  id: string;
  title: string;
  titleZh?: string;
  summary?: string;
  structure: string;
  explanation: string;
  usageExplanation?: string;
  usageSteps?: string[];
  usageContexts?: string[];
  comparison?: string;
  commonMistakes?: {
    incorrect: string;
    correct: string;
    explanation: string;
  }[] | string[];
  examples: {
    zh: string;
    py?: string;
    pinyin?: string;
    vi: string;
    explanationVi?: string;
  }[];
}

export interface DialogueLine {
  speaker: string;
  speakerRole?: string;
  avatar?: string;
  zh: string;
  py: string;
  vi: string;
}

export interface DialogueItem {
  id: string;
  title: string;
  situation: string;
  audioDuration: string;
  lines: DialogueLine[];
  memorableSentences?: { zh: string; py: string; vi: string }[];
}

export interface ReadingItem {
  id: string;
  titleZh: string;
  titleVi: string;
  contentZh: string;
  contentPy: string;
  contentVi: string;
  originalText?: string;
  translation?: string;
  analysisExplanation?: string;
  mainEvent?: string;
  keywords?: string[];
  keySentence?: string;
  evidenceExplanation?: string;
  mainIdea?: string;
  mainIdeaExplanation?: string;
  secondaryDetails?: string[];
  commonTrap?: string;
  readingTip?: string;
  wordCount: number;
  extraVocabs?: {
    id?: string;
    exampleZh?: string;
    examplePy?: string;
    exampleVi?: string;
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    tag?: string;
  }[];
}

export interface ListeningItem {
  id: string;
  title: string;
  audioDuration: string;
  scriptZh: string;
  scriptPy: string;
  scriptVi: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CulturalNoteItem {
  context?: string; // A. Bối cảnh giao tiếp
  targetAudience?: string; // B. Đối tượng giao tiếp
  naturalExpressions?: { zh: string; py: string; vi: string; usage?: string }[]; // C. Cách nói thường dùng
  politeExpressions?: { zh: string; py: string; vi: string; note?: string }[]; // D. Cách nói lịch sự
  cautionNotes?: string[]; // E. Cách nói cần lưu ý
  comparisonNote?: string; // F. So sánh khẩu ngữ và trang trọng
  practiceScenario?: string; // G. Tình huống thực hành
}

export interface CulturalSelectionItem {
  id: string;
  type: "CONTEXT" | "TARGET_AUDIENCE" | "PHRASE" | "POLITE" | "CAUTION" | "SCENARIO";
  categoryLabel: string;
  title: string;
  zh?: string;
  py?: string;
  vi?: string;
  content?: string;
  note?: string;
  audioUrl?: string;
}

export interface AcademicContentItem {
  terms: {
    zh: string;
    py: string;
    vi: string;
    definition: string;
    example: string;
  }[];
  theoryTitle: string;
  theoryContent: string;
  tableOrFormula?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  practicalCase?: {
    title: string;
    scenario: string;
    analysis: string;
  };
  academicLanguageNote?: string;
}

export type TopicDifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface LessonSummary {
  id: string;
  orderNumber: number;
  trackId: "hsk" | "topic" | "major";
  levelId: string;
  levelLabel: string;
  categoryLabel?: string;
  topicDifficulty?: TopicDifficultyLevel;
  titleZh: string;
  titlePy: string;
  titleVi: string;
  thumbnailArt: "lesson4" | "lesson5" | "lesson6" | "lesson7" | "lesson8";
  stats: {
    vocabCount: number;
    grammarCount: number;
    dialogueCount: number;
    readingCount: number;
    listeningCount: number;
  };
}

export interface FullLessonDetail extends LessonSummary {
  description: string;
  vocabularies: VocabularyItem[];
  grammars: GrammarItem[];
  dialogue?: DialogueItem;
  reading?: ReadingItem;
  listening?: ListeningItem;
  culturalNote?: CulturalNoteItem;
  academicContent?: AcademicContentItem;
}

// ===========================================================================
// 1. HSK 3.0 TRACK (Levels HSK 1 -> HSK 6 and HSK 7-9)
// ===========================================================================
export interface HskLevelMeta {
  id: string;
  title: string;
  desc: string;
  totalLessons: number;
  isAvailable: boolean;
  tag: string;
}

export const HSK_LEVELS_META: HskLevelMeta[] = [
  { id: "hsk1", title: "HSK 1", desc: "Sơ cấp 150-300 từ vựng căn bản", totalLessons: 15, isAvailable: true, tag: "15 bài" },
  { id: "hsk2", title: "HSK 2", desc: "Sơ trung cấp 300-600 từ vựng", totalLessons: 20, isAvailable: true, tag: "20 bài" },
  { id: "hsk3", title: "HSK 3", desc: "Trung cấp 600-1200 từ vựng", totalLessons: 20, isAvailable: true, tag: "20 bài" },
  { id: "hsk4", title: "HSK 4", desc: "Trung cao cấp 1200-2500 từ vựng", totalLessons: 20, isAvailable: true, tag: "20 bài" },
  { id: "hsk5", title: "HSK 5", desc: "Cao cấp 2500-4000 từ vựng", totalLessons: 20, isAvailable: true, tag: "20 bài" },
  { id: "hsk6", title: "HSK 6", desc: "Thành thạo trên 5000 từ vựng", totalLessons: 20, isAvailable: true, tag: "20 bài" },
  { id: "hsk79", title: "HSK 7–9", desc: "Bậc cao cấp chuyên sâu / Học thuật", totalLessons: 0, isAvailable: false, tag: "Chưa có bài" },
];

export const HSK1_LESSONS: LessonSummary[] = [
  {
    id: "hsk1-b01",
    orderNumber: 1,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "AI小语，你好！",
    titlePy: "AI Xiǎoyǔ, nǐ hǎo!",
    titleVi: "Xin chào AI Tiểu Ngữ!",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 12, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b02",
    orderNumber: 2,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我叫李文",
    titlePy: "Wǒ jiào Lǐ Wén",
    titleVi: "Mình tên là Lý Văn",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b03",
    orderNumber: 3,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我是中国人",
    titlePy: "Wǒ shì Zhōngguó rén",
    titleVi: "Mình là người Trung Quốc",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 11, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b04",
    orderNumber: 4,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我有两个孩子",
    titlePy: "Wǒ yǒu liǎng gè háizi",
    titleVi: "Chị có hai con",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 10, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b05",
    orderNumber: 5,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "今天我休息",
    titlePy: "Jīntiān wǒ xiūxi",
    titleVi: "Hôm nay anh được nghỉ",
    thumbnailArt: "lesson5",
    stats: { vocabCount: 10, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b06",
    orderNumber: 6,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "你的手机号是多少？",
    titlePy: "Nǐ de shǒujī hào shì duōshao?",
    titleVi: "Số điện thoại của bạn là bao nhiêu?",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 12, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b07",
    orderNumber: 7,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我晚上六点半下班",
    titlePy: "Wǒ wǎnshang liù diǎn bàn xiàbān",
    titleVi: "Em tan làm lúc 6 rưỡi tối",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 11, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b08",
    orderNumber: 8,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我爸爸也在医院工作",
    titlePy: "Wǒ bàba yě zài yīyuàn gōngzuò",
    titleVi: "Bố em cũng làm việc ở bệnh viện",
    thumbnailArt: "lesson8",
    stats: { vocabCount: 12, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b09",
    orderNumber: 9,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我明天上午在学校学习",
    titlePy: "Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí",
    titleVi: "Sáng mai mình học ở trường",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 10, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b10",
    orderNumber: 10,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "这儿的苹果真便宜！",
    titlePy: "Zhèr de píngguǒ zhēn piányi!",
    titleVi: "Táo ở đây rẻ thật!",
    thumbnailArt: "lesson5",
    stats: { vocabCount: 11, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b11",
    orderNumber: 11,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我读大学呢",
    titlePy: "Wǒ dú dàxué ne",
    titleVi: "Em đang học đại học",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b12",
    orderNumber: 12,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "昨天下雪了",
    titlePy: "Zuótiān xiàxuě le",
    titleVi: "Hôm qua tuyết rơi rồi",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 12, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b13",
    orderNumber: 13,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "请给我一杯茶",
    titlePy: "Qǐng gěi wǒ yì bēi chá",
    titleVi: "Cho tôi một cốc trà",
    thumbnailArt: "lesson8",
    stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b14",
    orderNumber: 14,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我看了一个电影",
    titlePy: "Wǒ kànle yí gè diànyǐng",
    titleVi: "Mình đã xem một bộ phim",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 11, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b15",
    orderNumber: 15,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "大兴机场见！",
    titlePy: "Dàxīng jīchǎng jiàn!",
    titleVi: "Hẹn gặp ở sân bay Đại Hưng!",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 12, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
];

export const HSK2_LESSONS: LessonSummary[] = [
  {
    id: "hsk2-b1",
    orderNumber: 1,
    trackId: "hsk",
    levelId: "hsk2",
    levelLabel: "HSK 2",
    titleZh: "九月去北京旅游最好",
    titlePy: "Jiǔ yuè qù Běijīng lǚyóu zuì hǎo",
    titleVi: "Tháng chín đi Bắc Kinh du lịch là thích hợp nhất",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 12, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk2-b2",
    orderNumber: 2,
    trackId: "hsk",
    levelId: "hsk2",
    levelLabel: "HSK 2",
    titleZh: "我每天六点起床",
    titlePy: "Wǒ měitiān liù diǎn qǐchuáng",
    titleVi: "Tôi thức dậy lúc sáu giờ mỗi ngày",
    thumbnailArt: "lesson5",
    stats: { vocabCount: 14, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
];

export const HSK3_LESSONS: LessonSummary[] = [
  {
    id: "hsk3-b1",
    orderNumber: 1,
    trackId: "hsk",
    levelId: "hsk3",
    levelLabel: "HSK 3",
    titleZh: "周末你有什么打算",
    titlePy: "Zhōumò nǐ yǒu shénme dǎsuàn",
    titleVi: "Cuối tuần bạn có dự định gì",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 16, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk3-b5",
    orderNumber: 5,
    trackId: "hsk",
    levelId: "hsk3",
    levelLabel: "HSK 3",
    titleZh: "最近越来越冷了",
    titlePy: "Zuìjìn yuèláiyuè lěng le",
    titleVi: "Dạo này trời càng ngày càng lạnh",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 18, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
];

export const HSK_LESSONS_MAP: Record<string, LessonSummary[]> = {
  hsk1: HSK1_LESSONS,
  hsk2: HSK2_LESSONS,
  hsk3: HSK3_LESSONS,
  hsk4: [
    {
      id: "hsk4-b1",
      orderNumber: 1,
      trackId: "hsk",
      levelId: "hsk4",
      levelLabel: "HSK 4",
      titleZh: "简单的爱情",
      titlePy: "Jiǎndān de àiqíng",
      titleVi: "Tình yêu giản dị",
      thumbnailArt: "lesson4",
      stats: { vocabCount: 18, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  hsk5: [
    {
      id: "hsk5-b1",
      orderNumber: 1,
      trackId: "hsk",
      levelId: "hsk5",
      levelLabel: "HSK 5",
      titleZh: "爱的教育",
      titlePy: "Ài de jiàoyù",
      titleVi: "Giáo dục của tình thương",
      thumbnailArt: "lesson5",
      stats: { vocabCount: 22, grammarCount: 4, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  hsk6: [
    {
      id: "hsk6-b1",
      orderNumber: 1,
      trackId: "hsk",
      levelId: "hsk6",
      levelLabel: "HSK 6",
      titleZh: "给儿子的一封信",
      titlePy: "Gěi érzi de yì fēng xìn",
      titleVi: "Bức thư gửi con trai",
      thumbnailArt: "lesson6",
      stats: { vocabCount: 26, grammarCount: 4, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  hsk79: [],
};

// ===========================================================================
// 2. THEO CHỦ ĐỀ TRACK (9 Major Topics & 72 Subtopics per Spec)
// ===========================================================================
export interface SubtopicMeta {
  id: string;
  title: string;
  totalLessons: number;
}

export interface MajorTopicMeta {
  id: string;
  orderNumber: number;
  title: string;
  desc: string;
  icon: string;
  priorityFocus: string;
  subtopics: SubtopicMeta[];
}

export const OFFICIAL_9_TOPICS: MajorTopicMeta[] = [
  {
    id: "top-1-life",
    orderNumber: 1,
    title: "Giao tiếp đời sống & Xã giao",
    desc: "Khẩu ngữ thường nhật, kết bạn, xưng hô, hỏi thăm và biểu đạt quan điểm",
    icon: "💬",
    priorityFocus: "Khẩu ngữ thông dụng, cách xưng hô, chào hỏi, từ chối lịch sự",
    subtopics: [
      { id: "sub-1-1", title: "Chào hỏi & Làm quen", totalLessons: 4 },
      { id: "sub-1-2", title: "Giới thiệu bản thân", totalLessons: 3 },
      { id: "sub-1-3", title: "Gia đình & Người thân", totalLessons: 3 },
      { id: "sub-1-4", title: "Bạn bè & Quan hệ xã hội", totalLessons: 2 },
      { id: "sub-1-5", title: "Hỏi thăm & Trò chuyện hằng ngày", totalLessons: 3 },
      { id: "sub-1-6", title: "Thời gian & Lịch hẹn", totalLessons: 2 },
      { id: "sub-1-7", title: "Mời mọc, Cảm ơn & Xin lỗi", totalLessons: 2 },
      { id: "sub-1-8", title: "Cảm xúc, Sở thích & Quan điểm", totalLessons: 2 },
    ],
  },
  {
    id: "top-2-food",
    orderNumber: 2,
    title: "Ẩm thực & Nhà hàng Trung Hoa",
    desc: "Gọi món, khẩu vị vùng miền, văn hóa bàn ăn và thanh toán",
    icon: "🍜",
    priorityFocus: "Cách nói cay/không cay, dị ứng, gọi món, văn hóa bàn tiệc",
    subtopics: [
      { id: "sub-2-1", title: "Các món ăn Trung Quốc", totalLessons: 3 },
      { id: "sub-2-2", title: "Nguyên liệu & Cách nấu ăn", totalLessons: 2 },
      { id: "sub-2-3", title: "Khẩu vị & Sở thích ăn uống", totalLessons: 2 },
      { id: "sub-2-4", title: "Đặt bàn & Gọi món", totalLessons: 4 },
      { id: "sub-2-5", title: "Giao tiếp với nhân viên phục vụ", totalLessons: 2 },
      { id: "sub-2-6", title: "Đồ uống, Trà & Quán cà phê", totalLessons: 2 },
      { id: "sub-2-7", title: "Thanh toán & Chia hóa đơn", totalLessons: 2 },
      { id: "sub-2-8", title: "Văn hóa bàn ăn & Tiệc tùng", totalLessons: 3 },
    ],
  },
  {
    id: "top-3-travel",
    orderNumber: 3,
    title: "Du lịch, Đặt vé & Khách sạn",
    desc: "Tàu cao tốc, sân bay, đặt phòng, hỏi đường và xử lý sự cố khi du lịch",
    icon: "✈️",
    priorityFocus: "Giao tiếp tại ga tàu, đặt vé, hỏi đường, check-in khách sạn",
    subtopics: [
      { id: "sub-3-1", title: "Chuẩn bị hành lý & Lịch trình", totalLessons: 2 },
      { id: "sub-3-2", title: "Sân bay & Làm thủ tục bay", totalLessons: 3 },
      { id: "sub-3-3", title: "Tàu cao tốc & Mua vé tàu", totalLessons: 3 },
      { id: "sub-3-4", title: "Giao thông công cộng & Taxi", totalLessons: 2 },
      { id: "sub-3-5", title: "Hỏi đường & Chỉ đường", totalLessons: 3 },
      { id: "sub-3-6", title: "Đặt phòng & Nhận phòng khách sạn", totalLessons: 3 },
      { id: "sub-3-7", title: "Tham quan & Mua vé thắng cảnh", totalLessons: 2 },
      { id: "sub-3-8", title: "Sự cố khi đi du lịch", totalLessons: 2 },
    ],
  },
  {
    id: "top-4-shopping",
    orderNumber: 4,
    title: "Mua sắm & Thanh toán điện tử",
    desc: "Hỏi giá, mặc cả, mua hàng online, thanh toán WeChat / Alipay",
    icon: "🛍️",
    priorityFocus: "Hỏi giá, xin giảm giá, theo dõi bưu kiện, khiếu nại hoàn tiền",
    subtopics: [
      { id: "sub-4-1", title: "Hỏi giá & So sánh sản phẩm", totalLessons: 2 },
      { id: "sub-4-2", title: "Mua quần áo, Giày dép & Phụ kiện", totalLessons: 3 },
      { id: "sub-4-3", title: "Mua đồ gia dụng & Đồ điện tử", totalLessons: 2 },
      { id: "sub-4-4", title: "Mặc cả & Khuyến mãi", totalLessons: 3 },
      { id: "sub-4-5", title: "Mua hàng online & Đặt hàng", totalLessons: 2 },
      { id: "sub-4-6", title: "Thanh toán WeChat & Alipay", totalLessons: 2 },
      { id: "sub-4-7", title: "Giao hàng & Nhận bưu kiện", totalLessons: 2 },
      { id: "sub-4-8", title: "Đổi trả, Bảo hành & Khiếu nại", totalLessons: 2 },
    ],
  },
  {
    id: "top-5-health",
    orderNumber: 5,
    title: "Sức khỏe, Bệnh viện & Khám bệnh",
    desc: "Mô tả triệu chứng bệnh, đăng ký khám, mua thuốc và giao tiếp y tế",
    icon: "🏥",
    priorityFocus: "Mô tả triệu chứng chính xác, hỏi chỉ dẫn y tế, trường hợp khẩn cấp",
    subtopics: [
      { id: "sub-5-1", title: "Cơ thể người & Sức khỏe cơ bản", totalLessons: 2 },
      { id: "sub-5-2", title: "Mô tả triệu chứng", totalLessons: 3 },
      { id: "sub-5-3", title: "Đặt lịch & Đăng ký khám", totalLessons: 2 },
      { id: "sub-5-4", title: "Khám bệnh & Trao đổi với bác sĩ", totalLessons: 3 },
      { id: "sub-5-5", title: "Xét nghiệm & Kết quả khám", totalLessons: 2 },
      { id: "sub-5-6", title: "Mua thuốc & Hướng dẫn dùng thuốc", totalLessons: 2 },
      { id: "sub-5-7", title: "Cấp cứu & Tình huống khẩn cấp", totalLessons: 2 },
      { id: "sub-5-8", title: "Phục hồi, Tái khám & Thói quen tốt", totalLessons: 2 },
    ],
  },
  {
    id: "top-6-work",
    orderNumber: 6,
    title: "Công sở & Phỏng vấn xin việc",
    desc: "Viết CV, phỏng vấn, email công việc, họp báo cáo và xin nghỉ phép",
    icon: "💼",
    priorityFocus: "Văn phong chuyên nghiệp, báo cáo công việc, xin nghỉ, thăng tiến",
    subtopics: [
      { id: "sub-6-1", title: "Tìm việc & Đọc tin tuyển dụng", totalLessons: 2 },
      { id: "sub-6-2", title: "Viết CV & Giới thiệu kinh nghiệm", totalLessons: 2 },
      { id: "sub-6-3", title: "Phỏng vấn xin việc", totalLessons: 3 },
      { id: "sub-6-4", title: "Ngày đầu đi làm & Nội quy", totalLessons: 2 },
      { id: "sub-6-5", title: "Giao tiếp với đồng nghiệp", totalLessons: 2 },
      { id: "sub-6-6", title: "Email, Tin nhắn & Điện thoại công việc", totalLessons: 3 },
      { id: "sub-6-7", title: "Họp, Báo cáo & Tiến độ dự án", totalLessons: 2 },
      { id: "sub-6-8", title: "Xin nghỉ, Tăng ca & Lương thưởng", totalLessons: 2 },
    ],
  },
  {
    id: "top-7-trade",
    orderNumber: 7,
    title: "Thương mại quốc tế",
    desc: "Tìm kiếm đối tác, đàm phán giá cả, hợp đồng ngoại thương và thanh toán",
    icon: "🤝",
    priorityFocus: "Tiếng Trung thương mại, báo giá, MOQ, điều khoản hợp đồng",
    subtopics: [
      { id: "sub-7-1", title: "Tìm kiếm đối tác & Nhà cung cấp", totalLessons: 2 },
      { id: "sub-7-2", title: "Giới thiệu công ty & Sản phẩm", totalLessons: 3 },
      { id: "sub-7-3", title: "Hỏi giá & Nhận báo giá", totalLessons: 2 },
      { id: "sub-7-4", title: "Đàm phán giá & Điều khoản hợp đồng", totalLessons: 4 },
      { id: "sub-7-5", title: "Đặt hàng & Xác nhận đơn", totalLessons: 2 },
      { id: "sub-7-6", title: "Thanh toán quốc tế", totalLessons: 3 },
      { id: "sub-7-7", title: "Giao tiếp hội chợ thương mại", totalLessons: 2 },
      { id: "sub-7-8", title: "Chăm sóc đối tác & Giải quyết tranh chấp", totalLessons: 2 },
    ],
  },
  {
    id: "top-8-study",
    orderNumber: 8,
    title: "Du học Trung Quốc",
    desc: "Học bổng, thủ tục visa, ký túc xá, nhắn tin giảng viên và học thuật",
    icon: "🎓",
    priorityFocus: "Nhắn tin cho giảng viên, xin nghỉ, văn phòng quốc tế, thi cử",
    subtopics: [
      { id: "sub-8-1", title: "Nộp hồ sơ & Học bổng", totalLessons: 2 },
      { id: "sub-8-2", title: "Visa, Cư trú & Thủ tục", totalLessons: 2 },
      { id: "sub-8-3", title: "Nhập học & Đăng ký môn", totalLessons: 2 },
      { id: "sub-8-4", title: "Ký túc xá & Thuê nhà", totalLessons: 2 },
      { id: "sub-8-5", title: "Giao tiếp với giảng viên", totalLessons: 3 },
      { id: "sub-8-6", title: "Học trên lớp & Thuyết trình", totalLessons: 2 },
      { id: "sub-8-7", title: "Thi cử & Bài tập học kỳ", totalLessons: 2 },
      { id: "sub-8-8", title: "Sinh hoạt & Kết bạn tại Trung Quốc", totalLessons: 2 },
    ],
  },
  {
    id: "top-9-logistics",
    orderNumber: 9,
    title: "Logistics & Xuất nhập khẩu",
    desc: "Incoterms, chứng từ vận tải biển/hàng không, thủ tục hải quan",
    icon: "🚢",
    priorityFocus: "Từ vựng chuyên ngành logistics, chứng từ, thông quan hải quan",
    subtopics: [
      { id: "sub-9-1", title: "Điều kiện giao hàng & Incoterms", totalLessons: 3 },
      { id: "sub-9-2", title: "Chứng từ xuất nhập khẩu", totalLessons: 2 },
      { id: "sub-9-3", title: "Vận tải biển & Đường hàng không", totalLessons: 3 },
      { id: "sub-9-4", title: "Đặt chỗ & Theo dõi lô hàng", totalLessons: 2 },
      { id: "sub-9-5", title: "Hải quan & Thông quan", totalLessons: 3 },
      { id: "sub-9-6", title: "Kho bãi & Quản lý tồn kho", totalLessons: 2 },
      { id: "sub-9-7", title: "Kiểm tra chất lượng & Đóng gói", totalLessons: 2 },
      { id: "sub-9-8", title: "Chậm giao, Thiếu hàng & Khiếu nại", totalLessons: 2 },
    ],
  },
];

// Topic lessons mapped by subtopic ID
export const SUBTOPIC_LESSONS_MAP: Record<string, LessonSummary[]> = {
  "sub-1-1": [
    {
      id: "top-comm-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "sub-1-1",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Giao tiếp đời sống → Chào hỏi & Làm quen",
      topicDifficulty: "BEGINNER",
      titleZh: "初次见面，请多关照",
      titlePy: "Chūcì jiànmiàn, qǐng duō guānzhào",
      titleVi: "Lần đầu gặp mặt, xin được chỉ giáo",
      thumbnailArt: "lesson4",
      stats: { vocabCount: 5, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
    {
      id: "top-comm-2",
      orderNumber: 2,
      trackId: "topic",
      levelId: "sub-1-1",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Giao tiếp đời sống → Chào hỏi & Làm quen",
      topicDifficulty: "INTERMEDIATE",
      titleZh: "久仰大名，很高兴认识您",
      titlePy: "Jiǔyǎng dàmíng, hěn gāoxìng rènshi nín",
      titleVi: "Ngưỡng mộ đại danh đã lâu, rất vui được quen biết ngài",
      thumbnailArt: "lesson6",
      stats: { vocabCount: 8, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  "sub-2-4": [
    {
      id: "top-food-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "sub-2-4",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Ẩm thực Trung Hoa → Đặt bàn & Gọi món",
      topicDifficulty: "BEGINNER",
      titleZh: "服务员，请给我们菜单",
      titlePy: "Fúwùyuán, qǐng gěi wǒmen càidān",
      titleVi: "Phục vụ ơi, xin cho chúng tôi xem thực đơn",
      thumbnailArt: "lesson5",
      stats: { vocabCount: 8, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  "sub-7-4": [
    {
      id: "top-trade-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "sub-7-4",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Thương mại quốc tế → Đàm phán giá & Điều khoản hợp đồng",
      topicDifficulty: "INTERMEDIATE",
      titleZh: "价格可以再优惠一点吗？",
      titlePy: "Jiàgé kěyǐ zài yōuhuì yìdiǎn ma?",
      titleVi: "Mức giá có thể ưu đãi thêm một chút được không?",
      thumbnailArt: "lesson5",
      stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
};

// ===========================================================================
// 3. ĐẠI HỌC & NGÀNH TRACK (12 Viện/Khoa, 50 Ngành đào tạo)
// ===========================================================================
export interface AcademicMajorMeta {
  id: string;
  nameZh: string;
  nameVi: string;
  courses: {
    id: string;
    titleZh: string;
    titleVi: string;
    chapters: {
      id: string;
      titleZh: string;
      titleVi: string;
      lessons: LessonSummary[];
    }[];
  }[];
}

export interface UniversityFacultyMeta {
  id: string;
  nameZh: string;
  nameVi: string;
  desc: string;
  icon: string;
  majors: AcademicMajorMeta[];
}

export const OFFICIAL_12_FACULTIES: UniversityFacultyMeta[] = [
  {
    id: "fac-business",
    nameZh: "商学院",
    nameVi: "Viện / Khoa Kinh doanh",
    desc: "Đào tạo quản trị kinh doanh, marketing quốc tế, thương mại điện tử và logistics",
    icon: "🏢",
    majors: [
      {
        id: "maj-ba",
        nameZh: "工商管理",
        nameVi: "Quản trị kinh doanh",
        courses: [
          {
            id: "crs-poliecon",
            titleZh: "政治经济学",
            titleVi: "Kinh tế chính trị học",
            chapters: [
              {
                id: "ch-1",
                titleZh: "第一章 政治经济学导论",
                titleVi: "Chương 1: Nhập môn kinh tế chính trị",
                lessons: [],
              },
              {
                id: "ch-2",
                titleZh: "第二章 商品与货币",
                titleVi: "Chương 2: Hàng hóa và tiền tệ",
                lessons: [
                  {
                    id: "uni-econ-ch2-sec1",
                    orderNumber: 1,
                    trackId: "major",
                    levelId: "fac-business",
                    levelLabel: "Đại học & Ngành",
                    categoryLabel: "商学院 → 工商管理 → 政治经济学 → 第二章",
                    titleZh: "第一节 商品的二因素",
                    titlePy: "Dì-yī jié: Shāngpǐn de èr yīnsù",
                    titleVi: "Hai thuộc tính của hàng hóa (Giá trị sử dụng & Giá trị)",
                    thumbnailArt: "lesson5",
                    stats: { vocabCount: 8, grammarCount: 2, dialogueCount: 0, readingCount: 1, listeningCount: 0 },
                  },
                  {
                    id: "uni-econ-ch2-sec2",
                    orderNumber: 2,
                    trackId: "major",
                    levelId: "fac-business",
                    levelLabel: "Đại học & Ngành",
                    categoryLabel: "商学院 → 工商管理 → 政治经济学 → 第二章",
                    titleZh: "第二节 劳动的二重性",
                    titlePy: "Dì-èr jié: Láodòng de èrchóngxìng",
                    titleVi: "Tính chất hai mặt của lao động sản xuất hàng hóa",
                    thumbnailArt: "lesson7",
                    stats: { vocabCount: 6, grammarCount: 1, dialogueCount: 0, readingCount: 1, listeningCount: 0 },
                  },
                ],
              },
            ],
          },
          {
            id: "crs-mgmt",
            titleZh: "现代管理学",
            titleVi: "Quản trị học hiện đại",
            chapters: [],
          },
        ],
      },
      { id: "maj-mkt", nameZh: "市场营销", nameVi: "Marketing", courses: [] },
      { id: "maj-ib", nameZh: "国际商务", nameVi: "Kinh doanh quốc tế", courses: [] },
      { id: "maj-hr", nameZh: "人力资源管理", nameVi: "Quản trị nhân sự", courses: [] },
      { id: "maj-ec", nameZh: "电子商务", nameVi: "Thương mại điện tử", courses: [] },
      { id: "maj-log", nameZh: "物流管理", nameVi: "Quản trị logistics", courses: [] },
    ],
  },
  {
    id: "fac-econ",
    nameZh: "经济学院",
    nameVi: "Viện / Khoa Kinh tế",
    desc: "Kinh tế học, tài chính, tiền tệ ngân hàng và thương mại quốc tế",
    icon: "📈",
    majors: [
      { id: "maj-econ", nameZh: "经济学", nameVi: "Kinh tế học", courses: [] },
      { id: "maj-trade", nameZh: "国际经济与贸易", nameVi: "Kinh tế & Thương mại quốc tế", courses: [] },
      { id: "maj-fin", nameZh: "金融学", nameVi: "Tài chính", courses: [] },
      { id: "maj-stat", nameZh: "经济统计学", nameVi: "Thống kê kinh tế", courses: [] },
      { id: "maj-tax", nameZh: "财政学", nameVi: "Tài chính công", courses: [] },
    ],
  },
  {
    id: "fac-foreign",
    nameZh: "外国语学院",
    nameVi: "Viện / Khoa Ngoại ngữ",
    desc: "Ngôn ngữ Anh, Biên phiên dịch, Giáo dục Hán ngữ quốc tế",
    icon: "🌐",
    majors: [
      { id: "maj-en", nameZh: "英语", nameVi: "Ngôn ngữ Anh", courses: [] },
      { id: "maj-trans", nameZh: "翻译", nameVi: "Biên phiên dịch", courses: [] },
      { id: "maj-tcsl", nameZh: "汉语国际教育", nameVi: "Giáo dục tiếng Trung quốc tế", courses: [] },
    ],
  },
  {
    id: "fac-literature",
    nameZh: "文学院",
    nameVi: "Viện / Khoa Văn học & Ngôn ngữ Trung",
    desc: "Hán ngữ hiện đại, Hán ngữ cổ đại, Văn hóa và văn học Trung Hoa",
    icon: "📜",
    majors: [
      { id: "maj-han", nameZh: "汉语言文学", nameVi: "Ngôn ngữ & Văn học Trung Quốc", courses: [] },
      { id: "maj-ch-lang", nameZh: "汉语言", nameVi: "Ngôn ngữ Trung Quốc", courses: [] },
    ],
  },
  {
    id: "fac-cs",
    nameZh: "计算机与人工智能学院",
    nameVi: "Viện Máy tính & Trí tuệ nhân tạo",
    desc: "Khoa học máy tính, kỹ thuật phần mềm, trí tuệ nhân tạo và dữ liệu lớn",
    icon: "💻",
    majors: [
      { id: "maj-cs", nameZh: "计算机科学与技术", nameVi: "Khoa học & Kỹ thuật máy tính", courses: [] },
      { id: "maj-se", nameZh: "软件工程", nameVi: "Kỹ thuật phần mềm", courses: [] },
      { id: "maj-ai", nameZh: "人工智能", nameVi: "Trí tuệ nhân tạo (AI)", courses: [] },
    ],
  },
  {
    id: "fac-eng",
    nameZh: "工学院",
    nameVi: "Viện / Khoa Kỹ thuật",
    desc: "Cơ khí, kỹ thuật điện, tự động hóa và kỹ thuật xây dựng",
    icon: "⚙️",
    majors: [
      { id: "maj-mech", nameZh: "机械工程", nameVi: "Kỹ thuật cơ khí", courses: [] },
      { id: "maj-auto", nameZh: "自动化", nameVi: "Tự động hóa", courses: [] },
    ],
  },
  {
    id: "fac-med",
    nameZh: "医学院",
    nameVi: "Viện / Khoa Y học",
    desc: "Y lâm sàng, răng hàm mặt, điều dưỡng",
    icon: "🩺",
    majors: [
      { id: "maj-clin", nameZh: "临床医学", nameVi: "Y lâm sàng", courses: [] },
      { id: "maj-nurse", nameZh: "护理学", nameVi: "Điều dưỡng", courses: [] },
    ],
  },
  {
    id: "fac-pharm",
    nameZh: "药学院",
    nameVi: "Viện / Khoa Dược",
    desc: "Dược học, đông dược học cổ truyền",
    icon: "💊",
    majors: [
      { id: "maj-pharm", nameZh: "药学", nameVi: "Dược học", courses: [] },
      { id: "maj-tcm", nameZh: "中药学", nameVi: "Dược học cổ truyền Trung Quốc", courses: [] },
    ],
  },
  {
    id: "fac-law",
    nameZh: "法学院",
    nameVi: "Viện / Khoa Luật",
    desc: "Luật học, sở hữu trí tuệ, luật kinh tế quốc tế",
    icon: "⚖️",
    majors: [
      { id: "maj-law", nameZh: "法学", nameVi: "Luật học", courses: [] },
      { id: "maj-ip", nameZh: "知识产权", nameVi: "Sở hữu trí tuệ", courses: [] },
    ],
  },
  {
    id: "fac-journalism",
    nameZh: "新闻与传播学院",
    nameVi: "Viện Báo chí & Truyền thông",
    desc: "Báo chí, truyền thông đại chúng, quảng cáo và truyền thông mới",
    icon: "🎙️",
    majors: [
      { id: "maj-news", nameZh: "新闻学", nameVi: "Báo chí học", courses: [] },
      { id: "maj-comm", nameZh: "传播学", nameVi: "Truyền thông học", courses: [] },
    ],
  },
  {
    id: "fac-art",
    nameZh: "艺术与设计学院",
    nameVi: "Viện Nghệ thuật & Thiết kế",
    desc: "Thiết kế truyền thông thị giác, thiết kế môi trường, mỹ thuật số",
    icon: "🎨",
    majors: [
      { id: "maj-vis", nameZh: "视觉传达设计", nameVi: "Thiết kế truyền thông thị giác", courses: [] },
    ],
  },
  {
    id: "fac-tourism",
    nameZh: "旅游与酒店管理学院",
    nameVi: "Viện Du lịch & Khách sạn",
    desc: "Quản trị du lịch, quản trị khách sạn quốc tế, tổ chức sự kiện",
    icon: "🛎️",
    majors: [
      { id: "maj-tour", nameZh: "旅游管理", nameVi: "Quản trị du lịch", courses: [] },
      { id: "maj-hotel", nameZh: "酒店管理", nameVi: "Quản trị khách sạn", courses: [] },
    ],
  },
];

// ===========================================================================
// SEED DETAILED LESSONS:
// 1. HSK 1 - Bài 1: AI小语，你好！ (Nội dung chuẩn 5 phần - 12 từ, 3 ngữ pháp, hội thoại, đọc hiểu, 8 văn hóa)
// 2. HSK 1 - Bài 5: 今天我休息 (Phần 1->5 đầy đủ)
// 3. Đại học - 政治经济学: 第一节 商品的二因素
// ===========================================================================
export const HSK1_LESSON_1_DETAIL: FullLessonDetail = {
  id: "hsk1-b01",
  orderNumber: 1,
  trackId: "hsk",
  levelId: "hsk1",
  levelLabel: "HSK 1",
  titleZh: "AI小语，你好！",
  titlePy: "AI Xiǎoyǔ, nǐ hǎo!",
  titleVi: "Xin chào AI Tiểu Ngữ!",
  thumbnailArt: "lesson4",
  description: "Bài học mở đầu giúp học sinh làm quen với AI Tiểu Ngữ, các cách chào hỏi cơ bản, phân biệt 你 và 您, hậu tố số nhiều 们 cùng văn hóa giao tiếp Trung Hoa.",
  stats: {
    vocabCount: 12,
    grammarCount: 3,
    dialogueCount: 1,
    readingCount: 1,
    listeningCount: 0,
  },
  vocabularies: [
    {
      id: "v-hsk1-1-1",
      hanzi: "你好",
      pinyin: "nǐ hǎo",
      partOfSpeech: "cụm từ",
      meaningVi: "Xin chào",
      usageNote: "Lời chào cơ bản khi gặp mặt một người. Lưu ý: Hai thanh 3 đứng liền nhau, 你好 thường được phát âm thành ní hǎo.",
      exampleZh: "你好，小语！",
      examplePy: "Nǐ hǎo, Xiǎoyǔ!",
      exampleVi: "Chào Tiểu Ngữ!",
    },
    {
      id: "v-hsk1-1-2",
      hanzi: "大家",
      pinyin: "dàjiā",
      partOfSpeech: "đại từ",
      meaningVi: "Mọi người",
      usageNote: "Chỉ tất cả mọi người trong một nhóm hoặc tập thể.",
      exampleZh: "大家好！",
      examplePy: "Dàjiā hǎo!",
      exampleVi: "Chào mọi người!",
    },
    {
      id: "v-hsk1-1-3",
      hanzi: "好",
      pinyin: "hǎo",
      partOfSpeech: "tính từ",
      meaningVi: "Tốt, khỏe",
      usageNote: "Tính từ thể hiện trạng thái tốt hoặc tích cực, cũng xuất hiện trong các lời chào.",
      exampleZh: "你好！",
      examplePy: "Nǐ hǎo!",
      exampleVi: "Xin chào!",
    },
    {
      id: "v-hsk1-1-4",
      hanzi: "学生",
      pinyin: "xuésheng",
      partOfSpeech: "danh từ",
      meaningVi: "Học sinh, sinh viên",
      usageNote: "Người đang học tập tại trường.",
      exampleZh: "学生们，你们好！",
      examplePy: "Xuéshengmen, nǐmen hǎo!",
      exampleVi: "Chào các em học sinh!",
    },
    {
      id: "v-hsk1-1-5",
      hanzi: "们",
      pinyin: "men",
      partOfSpeech: "hậu tố",
      meaningVi: "Hậu tố chỉ số nhiều",
      usageNote: "Đặt sau đại từ nhân xưng hoặc danh từ chỉ người để biểu thị số nhiều.",
      exampleZh: "你们好！",
      examplePy: "Nǐmen hǎo!",
      exampleVi: "Chào các bạn!",
    },
    {
      id: "v-hsk1-1-6",
      hanzi: "老师",
      pinyin: "lǎoshī",
      partOfSpeech: "danh từ",
      meaningVi: "Thầy giáo, cô giáo",
      usageNote: "Danh từ chỉ giáo viên, không phân biệt giới tính.",
      exampleZh: "老师，您好！",
      examplePy: "Lǎoshī, nín hǎo!",
      exampleVi: "Em chào thầy/cô ạ!",
    },
    {
      id: "v-hsk1-1-7",
      hanzi: "您",
      pinyin: "nín",
      partOfSpeech: "đại từ",
      meaningVi: "Đại từ kính trọng",
      usageNote: "Cách xưng hô lịch sự với thầy cô, người lớn tuổi hoặc người cần thể hiện sự tôn trọng.",
      exampleZh: "王老师，您好！",
      examplePy: "Wáng lǎoshī, nín hǎo!",
      exampleVi: "Em chào thầy/cô Vương ạ!",
    },
    {
      id: "v-hsk1-1-8",
      hanzi: "你们",
      pinyin: "nǐmen",
      partOfSpeech: "đại từ",
      meaningVi: "Các bạn",
      usageNote: "Đại từ ngôi thứ hai số nhiều, sử dụng khi nói với từ hai người trở lên.",
      exampleZh: "你们好！",
      examplePy: "Nǐmen hǎo!",
      exampleVi: "Chào các bạn!",
    },
    {
      id: "v-hsk1-1-9",
      hanzi: "谢谢",
      pinyin: "xièxie",
      partOfSpeech: "động từ",
      meaningVi: "Cảm ơn",
      usageNote: "Sử dụng khi cảm ơn người khác. Âm tiết thứ hai đọc thanh nhẹ.",
      exampleZh: "谢谢老师！",
      examplePy: "Xièxie lǎoshī!",
      exampleVi: "Em cảm ơn thầy/cô!",
    },
    {
      id: "v-hsk1-1-10",
      hanzi: "不客气",
      pinyin: "bú kèqi",
      partOfSpeech: "cụm từ",
      meaningVi: "Không có gì",
      usageNote: "Cách đáp lại khi người khác nói lời cảm ơn.",
      exampleZh: "不客气！",
      examplePy: "Bú kèqi!",
      exampleVi: "Không có gì!",
    },
    {
      id: "v-hsk1-1-11",
      hanzi: "同学",
      pinyin: "tóngxué",
      partOfSpeech: "danh từ",
      meaningVi: "Bạn học",
      usageNote: "Người cùng học tại trường hoặc trong lớp.",
      exampleZh: "同学们，再见！",
      examplePy: "Tóngxuémen, zàijiàn!",
      exampleVi: "Tạm biệt các bạn học!",
    },
    {
      id: "v-hsk1-1-12",
      hanzi: "再见",
      pinyin: "zàijiàn",
      partOfSpeech: "động từ",
      meaningVi: "Tạm biệt",
      usageNote: "Lời chào khi chia tay, kết thúc cuộc gặp hoặc kết thúc buổi học.",
      exampleZh: "老师，再见！",
      examplePy: "Lǎoshī, zàijiàn!",
      exampleVi: "Tạm biệt thầy/cô ạ!",
    },
  ],
  grammars: [
    {
      id: "g-hsk1-1-1",
      title: "Ngữ pháp 1: Cấu trúc chào hỏi với 好",
      structure: "Đối tượng được chào + 好！",
      explanation: "Trong tiếng Trung, có thể kết hợp đại từ nhân xưng hoặc danh xưng với 好 để hình thành câu chào. Lưu ý phát âm: 你好 viết nǐ hǎo nhưng khi đọc thông thường biến điệu thành ní hǎo.",
      examples: [
        { zh: "你好！", py: "Nǐ hǎo!", vi: "Xin chào!" },
        { zh: "您好！", py: "Nín hǎo!", vi: "Xin chào ạ!" },
        { zh: "大家好！", py: "Dàjiā hǎo!", vi: "Chào mọi người!" },
        { zh: "你们好！", py: "Nǐmen hǎo!", vi: "Chào các bạn!" },
        { zh: "老师好！", py: "Lǎoshī hǎo!", vi: "Chào thầy/cô ạ!" },
      ],
    },
    {
      id: "g-hsk1-1-2",
      title: "Ngữ pháp 2: Phân biệt 你 và 您",
      structure: "你 (thông thường) vs 您 (kính trọng)",
      explanation: "你 (nǐ): Bạn, sử dụng trong giao tiếp thông thường. 您 (nín): Đại từ kính trọng, sử dụng khi giao tiếp lịch sự với thầy cô, người lớn tuổi hoặc người cần thể hiện sự tôn trọng. Sự khác biệt nằm ở mức độ trang trọng và quan hệ giữa người nói với người nghe.",
      examples: [
        { zh: "小语，你好！", py: "Xiǎoyǔ, nǐ hǎo!", vi: "Chào Tiểu Ngữ!" },
        { zh: "王老师，您好！", py: "Wáng lǎoshī, nín hǎo!", vi: "Em chào thầy/cô Vương ạ!" },
      ],
    },
    {
      id: "g-hsk1-1-3",
      title: "Ngữ pháp 3: Hậu tố số nhiều 们",
      structure: "Đại từ nhân xưng / danh từ chỉ người + 们",
      explanation: "Đặt sau đại từ nhân xưng hoặc danh từ chỉ người để biểu thị số nhiều (Ví dụ: 你 + 们 = 你们, 我 + 们 = 我们, 同学 + 们 = 同学们, 学生 + 们 = 学生们). Lưu ý: Không thêm 们 ngay sau một danh từ đã có số lượng cụ thể như 三个学生.",
      examples: [
        { zh: "你们好！", py: "Nǐmen hǎo!", vi: "Chào các bạn!" },
        { zh: "同学们，再见！", py: "Tóngxuémen, zàijiàn!", vi: "Tạm biệt các bạn học!" },
      ],
    },
  ],
  dialogue: {
    id: "d-hsk1-1",
    title: "第一天上课 – Buổi học đầu tiên",
    situation: "Ngày đầu tiên đến lớp, thầy Vương chào cả lớp, sau đó từng học sinh và AI Tiểu Ngữ chào lại thầy giáo.",
    audioDuration: "01:15",
    lines: [
      { speaker: "王老师", speakerRole: "Giáo viên", zh: "同学们好！", py: "Tóngxuémen hǎo!", vi: "Chào các em học sinh!" },
      { speaker: "学生们", speakerRole: "Học sinh", zh: "老师好！", py: "Lǎoshī hǎo!", vi: "Chúng em chào thầy ạ!" },
      { speaker: "王老师", speakerRole: "Giáo viên", zh: "欢迎大家来到中文课！", py: "Huānyíng dàjiā lái dào zhōngwén kè!", vi: "Chào mừng mọi người đến với lớp học tiếng Trung!" },
      { speaker: "小语", speakerRole: "AI Trợ giảng", zh: "老师，您好！我是小语。", py: "Lǎoshī, nín hǎo! Wǒ shì Xiǎoyǔ.", vi: "Em chào thầy ạ! Em là Tiểu Ngữ." },
      { speaker: "王老师", speakerRole: "Giáo viên", zh: "你好，小语！", py: "Nǐ hǎo, Xiǎoyǔ!", vi: "Chào em, Tiểu Ngữ!" },
      { speaker: "学生们", speakerRole: "Học sinh", zh: "谢谢老师！", py: "Xièxie lǎoshī!", vi: "Cảm ơn thầy ạ!" },
      { speaker: "王老师", speakerRole: "Giáo viên", zh: "不客气！", py: "Bú kèqi!", vi: "Không có gì!" },
      { speaker: "王老师", speakerRole: "Giáo viên", zh: "同学们，再见！", py: "Tóngxuémen, zàijiàn!", vi: "Tạm biệt các em học sinh!" },
    ],
  },
  reading: {
    id: "r-hsk1-1",
    titleZh: "第一天上课",
    titleVi: "Buổi học đầu tiên",
    wordCount: 88,
    contentZh: "今天是第一天上课。王老师走进教室，对大家说：“同学们好！”学生们很高兴，一起说：“老师好！”小语也说：“王老师，您好！”下课了，老师说：“同学们，再见！”大家说：“老师，再见！谢谢老师！”",
    contentPy: "Jīntiān shì dì-yī tiān shàngkè. Wáng lǎoshī zǒu jìn jiàoshì, duì dàjiā shuō: “Tóngxuémen hǎo!” Xuéshengmen hěn gāoxìng, yìqǐ shuō: “Lǎoshī hǎo!” Xiǎoyǔ yě shuō: “Wáng lǎoshī, nín hǎo!” Xiàkè le, lǎoshī shuō: “Tóngxuémen, zàijiàn!” Dàjiā shuō: “Lǎoshī, zàijiàn! Xièxie lǎoshī!”",
    contentVi: "Hôm nay là buổi học đầu tiên. Thầy Vương bước vào lớp học, nói với mọi người: “Chào các em học sinh!” Các học sinh rất vui, cùng đồng thanh: “Chúng em chào thầy ạ!” Tiểu Ngữ cũng nói: “Em chào thầy Vương ạ!” Tan học rồi, thầy giáo nói: “Tạm biệt các em học sinh!” Mọi người cùng nói: “Tạm biệt thầy ạ! Em cảm ơn thầy!”",
    extraVocabs: [
      { hanzi: "今天", pinyin: "jīntiān", meaningVi: "Hôm nay", tag: "Từ vựng mở rộng" },
      { hanzi: "第一天", pinyin: "dì-yī tiān", meaningVi: "Ngày đầu tiên", tag: "Từ vựng mở rộng" },
      { hanzi: "上课", pinyin: "shàngkè", meaningVi: "Vào học, đi học", tag: "Từ vựng mở rộng" },
      { hanzi: "说", pinyin: "shuō", meaningVi: "Nói", tag: "Từ vựng mở rộng" },
      { hanzi: "下课", pinyin: "xiàkè", meaningVi: "Tan học", tag: "Từ vựng mở rộng" },
    ],
  },
  culturalNote: {
    naturalExpressions: [
      {
        zh: "你好！",
        py: "Nǐ hǎo!",
        vi: "Xin chào! (Lời chào phổ biến nhất khi gặp gỡ)",
        usage: "Lời chào cơ bản khi gặp mặt một người.",
      },
      {
        zh: "老师好！",
        py: "Lǎoshī hǎo!",
        vi: "Chào thầy/cô ạ! (Lời chào thể hiện sự kính trọng dành cho giáo viên)",
        usage: "Lời chào thể hiện sự kính trọng dành cho thầy giáo, cô giáo.",
      },
    ],
    politeExpressions: [
      {
        zh: "您好！",
        py: "Nín hǎo!",
        vi: "Xin chào ạ! (Dùng cho người lớn tuổi, thầy cô, đối tác lần đầu gặp)",
        note: "Đại từ kính trọng biểu thị sự trang trọng và lịch thiệp.",
      },
      {
        zh: "谢谢！",
        py: "Xièxie!",
        vi: "Cảm ơn! (Thể hiện lòng biết ơn chân thành)",
        note: "Sử dụng khi cảm ơn người khác đã giúp đỡ mình.",
      },
      {
        zh: "不客气！",
        py: "Bú kèqi!",
        vi: "Không có gì! (Lời đáp nhã nhặn, khiêm tốn khi nhận lời cảm ơn)",
        note: "Cách đáp lại lịch sự khi người khác nói lời cảm ơn.",
      },
    ],
    cautionNotes: [
      "Không gọi thẳng tên giáo viên: Trong văn hóa Trung Quốc, gọi Họ + 老师 (ví dụ: 王老师) thay vì gọi thẳng tên như trong tiếng Anh.",
      "Biến điệu của 你好: Khi hai âm tiết mang thanh 3 đi liền nhau, từ đầu tiên biến đổi thành thanh 2 (ní hǎo).",
      "Tránh dùng 您 với bạn bè đồng trang lứa: Dùng 您 với bạn bè thân thiết sẽ tạo cảm giác xa cách, khách sáo quá mức.",
    ],
  },
};

export const LESSON_5_DETAIL: FullLessonDetail = {
  id: "hsk1-b5",
  orderNumber: 5,
  trackId: "hsk",
  levelId: "hsk1",
  levelLabel: "HSK 1",
  titleZh: "今天我休息",
  titlePy: "Jīntiān wǒ xiūxi",
  titleVi: "Hôm nay tôi nghỉ ngơi",
  thumbnailArt: "lesson5",
  description: "Bài học giúp học viên làm quen với các từ vựng diễn tả trạng thái sức khỏe, sinh hoạt hàng ngày, trợ từ ngữ khí '了' và cách phủ định với '不'.",
  stats: {
    vocabCount: 6,
    grammarCount: 3,
    dialogueCount: 1,
    readingCount: 1,
    listeningCount: 1,
  },
  vocabularies: [
    {
      id: "v-jintian",
      hanzi: "今天",
      pinyin: "jīntiān",
      partOfSpeech: "danh từ",
      meaningVi: "Hôm nay",
      exampleZh: "今天天气很好。",
      examplePy: "Jīntiān tiānqì hěn hǎo.",
      exampleVi: "Hôm nay thời tiết rất đẹp.",
    },
    {
      id: "v-mingtian",
      hanzi: "明天",
      pinyin: "míngtiān",
      partOfSpeech: "danh từ",
      meaningVi: "Ngày mai",
      exampleZh: "明天是星期天。",
      examplePy: "Míngtiān shì xīngqītiān.",
      exampleVi: "Ngày mai là chủ nhật.",
    },
    {
      id: "v-xiuxi",
      hanzi: "休息",
      pinyin: "xiūxi",
      partOfSpeech: "động từ",
      meaningVi: "Nghỉ ngơi",
      exampleZh: "我想在宿舍休息一下。",
      examplePy: "Wǒ xiǎng zài sùshè xiūxi yíxià.",
      exampleVi: "Tôi muốn ở ký túc xá nghỉ ngơi một lát.",
    },
    {
      id: "v-shengbing",
      hanzi: "生病",
      pinyin: "shēngbìng",
      partOfSpeech: "động từ",
      meaningVi: "Bị ốm, bị bệnh",
      exampleZh: "他生病了，今天不能来上课。",
      examplePy: "Tā shēngbìng le, jīntiān bù néng lái shàngkè.",
      exampleVi: "Anh ấy ốm rồi, hôm nay không thể đến lớp.",
    },
    {
      id: "v-gongzuo",
      hanzi: "工作",
      pinyin: "gōngzuò",
      partOfSpeech: "danh từ / động từ",
      meaningVi: "Công việc / làm việc",
      exampleZh: "爸爸的工作非常忙碌。",
      examplePy: "Bàba de gōngzuò fēicháng mánglù.",
      exampleVi: "Công việc của bố rất bận rộn.",
    },
    {
      id: "v-yiyuan",
      hanzi: "医院",
      pinyin: "yīyuàn",
      partOfSpeech: "danh từ",
      meaningVi: "Bệnh viện",
      exampleZh: "张伟去医院看病了。",
      examplePy: "Zhāng Wěi qù yīyuàn kànbìng le.",
      exampleVi: "Trương Vĩ đã đi bệnh viện khám bệnh rồi.",
    },
  ],
  grammars: [
    {
      id: "g-le",
      title: "Trợ từ ngữ khí '了' biểu thị sự thay đổi hoặc việc đã phát sinh",
      structure: "Chủ ngữ + Vị ngữ (Động từ / Tính từ) + 了",
      explanation: "Đặt ở cuối câu để biểu thị một tình huống, trạng thái mới xuất hiện hoặc việc gì đó vừa xảy ra thay đổi so với trước đây.",
      examples: [
        {
          zh: "他生病了。",
          py: "Tā shēngbìng le.",
          vi: "Anh ấy bị ốm rồi (trước đó bình thường, nay xuất hiện trạng thái ốm).",
        },
        {
          zh: "天晴了，我们出去散步吧。",
          py: "Tiān qíng le, wǒmen chūqù sànbù ba.",
          vi: "Trời đã hửng nắng rồi, chúng mình ra ngoài đi dạo thôi.",
        },
      ],
    },
    {
      id: "g-bu",
      title: "Phó từ phủ định '不' đi cùng động từ",
      structure: "Chủ ngữ + 不 + Động từ + Tân ngữ",
      explanation: "Dùng để phủ định hành động, mong muốn, thói quen ở hiện tại hoặc tương lai.",
      examples: [
        {
          zh: "今天我不去上班。",
          py: "Jīntiān wǒ bù qù shàngbān.",
          vi: "Hôm nay tôi không đi làm.",
        },
      ],
    },
  ],
  dialogue: {
    id: "d-b5",
    title: "Hội thoại: Xin phép nghỉ ốm (请假)",
    situation: "Trương Vĩ gọi điện cho thầy Vương thông báo bị cảm sốt và xin phép nghỉ một ngày.",
    audioDuration: "01:25",
    lines: [
      {
        speaker: "张伟",
        speakerRole: "Học viên",
        zh: "王老师，您好！我今天身体有点不舒服，想请假一天。",
        py: "Wáng lǎoshī, nín hǎo! Wǒ jīntiān shēntǐ yǒudiǎn bù shūfu, xiǎng qǐngjià yì tiān.",
        vi: "Thầy Vương, em chào thầy ạ! Hôm nay cơ thể em hơi không khỏe, em muốn xin phép nghỉ một ngày ạ.",
      },
      {
        speaker: "王老师",
        speakerRole: "Giáo viên",
        zh: "张伟，你怎么了？去医院看过了吗？",
        py: "Zhāng Wěi, nǐ zěnme le? Qù yīyuàn kànguo le ma?",
        vi: "Trương Vĩ, em bị làm sao vậy? Đã đi bệnh viện khám chưa em?",
      },
      {
        speaker: "张伟",
        speakerRole: "Học viên",
        zh: "我发烧了，刚吃过感冒药，现在正在宿舍休息。",
        py: "Wǒ fāshāo le, gāng chīguo gǎnmàoyào, xiànzài zhèngzài sùshè xiūxi.",
        vi: "Em bị sốt, vừa uống thuốc cảm xong, hiện em đang nghỉ ngơi tại ký túc xá ạ.",
      },
      {
        speaker: "王老师",
        speakerRole: "Giáo viên",
        zh: "好，那你今天好好休息，多喝温水。昨天的作业明天交也可以。",
        py: "Hǎo, nà nǐ jīntiān hǎohǎo xiūxi, duō hē wēnshuǐ. Zuótiān de zuòyè míngtiān jiāo yě kěyǐ.",
        vi: "Được rồi, vậy hôm nay em hãy nghỉ ngơi cho tốt, uống nhiều nước ấm nhé. Bài tập hôm qua để ngày mai nộp cũng được.",
      },
      {
        speaker: "张伟",
        speakerRole: "Học viên",
        zh: "谢谢王老师关心！",
        py: "Xièxie Wáng lǎoshī guānxīn!",
        vi: "Em cảm ơn thầy đã quan tâm ạ!",
      },
    ],
    memorableSentences: [
      { zh: "我想请假一天。", py: "Wǒ xiǎng qǐngjià yì tiān.", vi: "Em muốn xin phép nghỉ một ngày." },
      { zh: "你好好休息，多喝温水。", py: "Nǐ hǎohǎo xiūxi, duō hē wēnshuǐ.", vi: "Em nghỉ ngơi cho tốt, uống nhiều nước ấm nhé." },
    ],
  },
  reading: {
    id: "r-b5",
    titleZh: "我的一天休息",
    titleVi: "Một ngày nghỉ ngơi của tôi",
    wordCount: 142,
    contentZh:
      "今天我不去上班，因为今天是星期日，我休息。\n早上八点我起床，喝了一杯温开水，然后去家附近的公园散步。\n公园里的空气很新鲜，有很多老人在打太极拳。\n中午我在家做了一碗热腾腾的面条。下午我看了一本中文故事书，听了轻松的音乐。\n虽然这一天很平淡，没有去远方旅行，但我感到非常放松和快乐。",
    contentPy:
      "Jīntiān wǒ bù qù shàngbān, yīnwèi jīntiān shì xīngqīrì, wǒ xiūxi.\nZǎoshang bā diǎn wǒ qǐchuáng, hē le yì bēi wēnkāishuǐ, ránhòu qù jiā fùjìn de gōngyuán sànbù.\nGōngyuán lǐ de kōngqì hěn xīnxiān, yǒu hěn duō lǎorén zài dǎ tàijíquán.\nZhōngwǔ wǒ zài jiā zuò le yì wǎn rèténgténg de miàntiáo. Xiàwǔ wǒ kàn le yì běn zhōngwén gùshì shū, tīng le qīngsōng de yīnyuè.\nSuīrán zhè yì tiān hěn píngdàn, méiyǒu qù yuǎnfāng lǚxíng, dàn wǒ gǎndào fēicháng fàngsōng hé kuàilè.",
    contentVi:
      "Hôm nay tôi không đi làm, vì hôm nay là Chủ nhật, tôi được nghỉ ngơi.\n8 giờ sáng tôi thức dậy, uống một cốc nước ấm, sau đó đi dạo ở công viên gần nhà.\nKhông khí trong công viên rất trong lành, có rất nhiều người cao tuổi đang tập Thái Cực Quyền.\nBuổi trưa tôi tự nấu một bát mì nóng hổi ở nhà. Buổi chiều tôi đọc một cuốn truyện tiếng Trung và nghe nhạc thư giãn.\nTuy một ngày trôi qua thật giản dị, không đi du lịch xa, nhưng tôi cảm thấy vô cùng thư thái và hạnh phúc.",
  },
  listening: {
    id: "l-b5",
    title: "Luyện nghe phản xạ: Hỏi thăm sức khỏe và xin phép",
    audioDuration: "01:10",
    scriptZh:
      "男：玛丽，明天是星期六，你打算做什么？\n女：我最近工作太累了，生了点小病，明天想在家好好休息。你呢？\n男：我也没什么特别的事，那你先好好休养，后天我们再去图书馆看书吧！\n女：好的，谢谢你！后天见！",
    scriptPy:
      "Nán: Mǎlì, míngtiān shì xīngqīliù, nǐ dǎsuàn zuò shénme?\nNǚ: Wǒ zuìjìn gōngzuò tài lèi le, shēng le diǎn xiǎobìng, míngtiān xiǎng zài jiā hǎohǎo xiūxi. Nǐ ne?\nNán: Wǒ yě méi shénme tèbié de shì, nà nǐ xiān hǎohǎo xiūyǎng, hòutiān wǒmen zài qù túshūguǎn kànshū ba!\nNǚ: Hǎo de, xièxie nǐ! Hòutiān jiàn!",
    scriptVi:
      "Nam: Mary à, ngày mai là thứ Bảy, bạn định làm gì thế?\nNữ: Dạo này mình làm việc mệt quá, lại bị ốm nhẹ một chút nên ngày mai muốn ở nhà nghỉ ngơi. Còn bạn thì sao?\nNam: Mình cũng không có việc gì đặc biệt. Vậy bạn cứ tĩnh dưỡng cho khỏe, ngày kia chúng ta cùng đến thư viện đọc sách nhé!\nNữ: Được, cảm ơn bạn nhiều! Hẹn gặp lại ngày kia nhé!",
    questions: [
      {
        question: "玛丽明天打算做什么？(Mary ngày mai định làm gì?)",
        options: ["Đi làm tăng ca", "Ở nhà nghỉ ngơi tĩnh dưỡng", "Đi mua sắm cùng bạn bè", "Đến bệnh viện khám bệnh"],
        correctIndex: 1,
        explanation: "Trong đoạn băng, Mary nói: '明天想在家好好休息' (ngày mai muốn ở nhà nghỉ ngơi).",
      },
    ],
  },
  culturalNote: {
    context: "Thông báo ngày nghỉ hoặc xin nghỉ phép vì lý do sức khỏe.",
    targetAudience: "Bạn bè thân thiết vs Giảng viên đại học / Cấp trên công ty.",
    naturalExpressions: [
      { zh: "今天我休息，我们去喝咖啡吧！", py: "Jīntiān wǒ xiūxi, wǒmen qù hē kāfēi ba!", vi: "Hôm nay mình được nghỉ, chúng mình đi cà phê đi!" },
      { zh: "我今天身体有点不舒服。", py: "Wǒ jīntiān shēntǐ yǒudiǎn bù shūfu.", vi: "Hôm nay người em hơi không được khỏe." },
    ],
    politeExpressions: [
      {
        zh: "老师您好，我今天身体不太舒服，想请一天假。",
        py: "Lǎoshī nín hǎo, wǒ jīntiān shēntǐ bú tài shūfu, xiǎng qǐng yì tiān jià.",
        vi: "Thưa thầy/cô, hôm nay em không được khỏe lắm, em muốn xin nghỉ một ngày ạ.",
        note: "Mẫu câu chuẩn mực thể hiện sự tôn trọng khi gửi tin nhắn hoặc gọi điện cho giảng viên.",
      },
    ],
    cautionNotes: [
      "Tránh nhắn tin cộc lốc cụt lủn như '我今天不来了' (Hôm nay tôi không đến), vì dễ bị đánh giá là thiếu tôn trọng.",
      "Khi từ chối lời mời ngày nghỉ, nên cảm ơn trước và nêu lý do mềm mỏng: '谢谢你的邀请，不过我今天有点累，想在家休息，下次我们再约好吗？'",
    ],
    comparisonNote: "Khẩu ngữ với bạn bè có thể dùng ngắn gọn '今天休息，不去了'; trong môi trường học thuật/công sở bắt buộc phải chào hỏi '您好' và dùng từ '请假'.",
    practiceScenario: "Em bị sốt nhẹ, hãy soạn một tin nhắn WeChat gửi cho giáo viên chủ nhiệm xin phép nghỉ học buổi sáng và xin nộp bài tập vào hôm sau.",
  },
};

// University Course Lesson Detail: 第一节 商品的二因素
export const UNIVERSITY_LESSON_DETAIL: FullLessonDetail = {
  id: "uni-econ-ch2-sec1",
  orderNumber: 1,
  trackId: "major",
  levelId: "fac-business",
  levelLabel: "Đại học & Ngành",
  categoryLabel: "郑州大学 → 商学院 → 工商管理 → 政治经济学 → 第二章",
  titleZh: "第一节 商品的二因素",
  titlePy: "Dì-yī jié: Shāngpǐn de èr yīnsù",
  titleVi: "Hai thuộc tính của hàng hóa: Giá trị sử dụng và Giá trị",
  thumbnailArt: "lesson5",
  description: "Phân tích thuộc tính tự nhiên (Giá trị sử dụng) và thuộc tính xã hội (Giá trị) của hàng hóa theo lý luận Kinh tế chính trị học.",
  stats: {
    vocabCount: 6,
    grammarCount: 2,
    dialogueCount: 0,
    readingCount: 1,
    listeningCount: 0,
  },
  vocabularies: [
    {
      id: "uv-1",
      hanzi: "商品",
      pinyin: "shāngpǐn",
      partOfSpeech: "danh từ",
      meaningVi: "Hàng hóa",
      exampleZh: "商品是用来交换的劳动产品。",
      examplePy: "Shāngpǐn shì yònglái jiāohuàn de láodòng chǎnpǐn.",
      exampleVi: "Hàng hóa là sản phẩm của lao động dùng để trao đổi.",
    },
    {
      id: "uv-2",
      hanzi: "使用价值",
      pinyin: "shǐyòng jiàzhí",
      partOfSpeech: "danh từ",
      meaningVi: "Giá trị sử dụng",
      exampleZh: "使用价值是商品的自然属性。",
      examplePy: "Shǐyòng jiàzhí shì shāngpǐn de zìrán shǔxìng.",
      exampleVi: "Giá trị sử dụng là thuộc tính tự nhiên của hàng hóa.",
    },
    {
      id: "uv-3",
      hanzi: "价值",
      pinyin: "jiàzhí",
      partOfSpeech: "danh từ",
      meaningVi: "Giá trị hàng hóa",
      exampleZh: "价值是凝结在商品中的无差别的人类劳动。",
      examplePy: "Jiàzhí shì níngjié zài shāngpǐn zhōng de wú chābié de rénlèi láodòng.",
      exampleVi: "Giá trị là lao động trừu tượng của con người kết tinh trong hàng hóa.",
    },
    {
      id: "uv-4",
      hanzi: "交换价值",
      pinyin: "jiāohuàn jiàzhí",
      partOfSpeech: "danh từ",
      meaningVi: "Giá trị trao đổi",
      exampleZh: "交换价值是价值的表现形式。",
      examplePy: "Jiāohuàn jiàzhí shì jiàzhí de biǎoxiàn xíngshì.",
      exampleVi: "Giá trị trao đổi là hình thức biểu hiện của giá trị.",
    },
    {
      id: "uv-5",
      hanzi: "劳动二重性",
      pinyin: "láodòng èrchóngxìng",
      partOfSpeech: "danh từ",
      meaningVi: "Tính hai mặt của lao động",
      exampleZh: "具体劳动创造使用价值，抽象劳动形成价值。",
      examplePy: "Jùtǐ láodòng chuàngzào shǐyòng jiàzhí, chōuxiàng láodòng xíngchéng jiàzhí.",
      exampleVi: "Lao động cụ thể tạo ra giá trị sử dụng, lao động trừu tượng tạo nên giá trị.",
    },
    {
      id: "uv-6",
      hanzi: "剩余价值",
      pinyin: "shèngyú jiàzhí",
      partOfSpeech: "danh từ",
      meaningVi: "Giá trị thặng dư",
      exampleZh: "剩余价值是雇佣工人创造的超过劳动力价值的价值。",
      examplePy: "Shèngyú jiàzhí shì gùyōng gōngrén chuàngzào de chāoguò láodònglì jiàzhí de jiàzhí.",
      exampleVi: "Giá trị thặng dư là phần giá trị do công nhân làm thuê tạo ra ngoài giá trị sức lao động.",
    },
  ],
  grammars: [
    {
      id: "ug-1",
      title: "Cấu trúc định nghĩa học thuật: A 是用来...的 / A 是...的表现形式",
      structure: "Thuật ngữ A + 是 + B 的表现形式 / 是用来 + Mục đích + 的",
      explanation: "Dùng để định nghĩa các khái niệm kinh tế chính trị và phân tích bản chất hiện tượng xã hội.",
      examples: [
        {
          zh: "交换价值是价值的表现形式，价值是交换价值的内容。",
          py: "Jiāohuàn jiàzhí shì jiàzhí de biǎoxiàn xíngshì, jiàzhí shì jiāohuàn jiàzhí de nèiróng.",
          vi: "Giá trị trao đổi là hình thức biểu hiện của giá trị, còn giá trị là nội dung bên trong của giá trị trao đổi.",
        },
      ],
    },
  ],
  reading: {
    id: "ur-1",
    titleZh: "商品的二因素及其辩证关系",
    titleVi: "Hai thuộc tính của hàng hóa và mối quan hệ biện chứng",
    wordCount: 180,
    contentZh:
      "商品具有二因素：使用价值和价值。\n使用价值是指物品能够满足人们某种需要的属性，是商品的自然属性，体现人与自然的关系。\n价值是凝结在商品中无差别的一般人类劳动，是商品的社会属性，体现商品生产者之间相互交换劳动的经济关系。\n使用价值和价值是对立统一的关系。任何商品都必须同时具备这两个因素，缺一不可。",
    contentPy:
      "Shāngpǐn jùyǒu èr yīnsù: shǐyòng jiàzhí hé jiàzhí.\nShǐyòng jiàzhí shì zhǐ wùpǐn nénggòu mǎnzú rénmen mǒuzhǒng xūyào de shǔxìng, shì shāngpǐn de zìrán shǔxìng.\nJiàzhí shì níngjié zài shāngpǐn zhōng wú chābié de yībān rénlèi láodòng, shì shāngpǐn de shèhuì shǔxìng.\nShǐyòng jiàzhí hé jiàzhí shì duìlì tǒngyī de guānxì.",
    contentVi:
      "Hàng hóa có hai thuộc tính: Giá trị sử dụng và Giá trị.\nGiá trị sử dụng là thuộc tính của vật phẩm có thể thỏa mãn nhu cầu nào đó của con người, là thuộc tính tự nhiên thể hiện mối quan hệ giữa con người và tự nhiên.\nGiá trị là lao động xã hội trừu tượng của người sản xuất kết tinh trong hàng hóa, là thuộc tính xã hội thể hiện quan hệ kinh tế giữa những người sản xuất.\nHai thuộc tính này vừa thống nhất vừa mâu thuẫn lẫn nhau.",
  },
  academicContent: {
    terms: [
      {
        zh: "商品 (shāngpǐn)",
        py: "shāngpǐn",
        vi: "Hàng hóa",
        definition: "Sản phẩm do lao động tạo ra nhằm mục đích trao đổi trên thị trường.",
        example: "阳光虽然有用，但不是劳动产品，因而不是商品。",
      },
      {
        zh: "使用价值 (shǐyòng jiàzhí)",
        py: "shǐyòng jiàzhí",
        vi: "Giá trị sử dụng",
        definition: "Thuộc tính tự nhiên thỏa mãn nhu cầu sinh hoạt hoặc sản xuất của con người.",
        example: "粮食可以充饥，衣服可以保暖，体现了不同的使用价值。",
      },
    ],
    theoryTitle: "Quy luật Mâu thuẫn giữa Giá trị sử dụng và Giá trị",
    theoryContent:
      "Người sản xuất hàng hóa tạo ra giá trị sử dụng nhưng mục đích là để bán lấy giá trị. Ngược lại, người mua cần giá trị sử dụng nhưng phải trả giá trị. Mâu thuẫn này chỉ được giải quyết khi hàng hóa được bán thành công trên thị trường (bước nhảy nguy hiểm của hàng hóa).",
    tableOrFormula: {
      title: "Bảng so sánh hai thuộc tính của hàng hóa",
      headers: ["Tiêu chí so sánh", "Giá trị sử dụng (使用价值)", "Giá trị (价值)"],
      rows: [
        ["Thuộc tính bản chất", "Thuộc tính tự nhiên (自然属性)", "Thuộc tính xã hội (社会属性)"],
        ["Thể hiện mối quan hệ", "Con người với giới tự nhiên", "Quan hệ kinh tế giữa người với người"],
        ["Tính chất lịch sử", "Phạm trù vĩnh viễn (mọi xã hội đều cần)", "Phạm trù lịch sử (chỉ có trong sản xuất hàng hóa)"],
      ],
    },
    practicalCase: {
      title: "Phân tích tình huống: Hàng hóa tồn kho không bán được",
      scenario: "Một xưởng dệt may sản xuất 10.000 bộ quần áo có chất lượng tốt nhưng mẫu mã lỗi thời, không bán được ra thị trường.",
      analysis: "Hàng hóa có giá trị sử dụng nhưng không thực hiện được giá trị trên thị trường. Lao động cá thể của xưởng không được xã hội thừa nhận, dẫn đến đọng vốn và thua lỗ.",
    },
    academicLanguageNote: "Khi viết báo cáo hoặc thuyết trình môn Kinh tế chính trị, luôn dùng cụm từ '对立统一关系' (quan hệ thống nhất biện chứng) thay vì các từ nói thông tục.",
  },
};

// ===========================================================================
// ALL LESSONS MASTER REPOSITORY (Flattened for Search Engine)
// ===========================================================================
export const ALL_LESSONS_INDEX: LessonSummary[] = [
  ...HSK1_LESSONS,
  ...HSK2_LESSONS,
  ...HSK3_LESSONS,
  ...(SUBTOPIC_LESSONS_MAP["sub-1-1"] || []),
  ...(SUBTOPIC_LESSONS_MAP["sub-2-4"] || []),
  ...(SUBTOPIC_LESSONS_MAP["sub-7-4"] || []),
  ...(OFFICIAL_12_FACULTIES[0].majors[0].courses[0].chapters[1].lessons || []),
];

// Lookup detail by id
export function getLessonDetailById(id: string): FullLessonDetail {
  if (id === "uni-econ-ch2-sec1") return UNIVERSITY_LESSON_DETAIL;
  if (
    id === "hsk1-b01" ||
    id === "hsk1-b1" ||
    id === "hsk1-01" ||
    id === "lesson-01" ||
    id === "lesson-1"
  ) {
    return HSK1_LESSON_1_DETAIL;
  }
  if (id === "hsk1-b5" || id === "hsk1-b05") return LESSON_5_DETAIL;

  const summary = ALL_LESSONS_INDEX.find((l) => l.id === id);
  if (!summary) return HSK1_LESSON_1_DETAIL;

  if (summary.orderNumber === 1 && summary.trackId === "hsk" && summary.levelId === "hsk1") {
    return HSK1_LESSON_1_DETAIL;
  }

  return {
    ...summary,
    description: `Nội dung học phần tiêu chuẩn cho ${summary.titleVi} (${summary.titleZh}).`,
    vocabularies: LESSON_5_DETAIL.vocabularies.slice(0, 5),
    grammars: LESSON_5_DETAIL.grammars.slice(0, 2),
    dialogue: LESSON_5_DETAIL.dialogue,
    reading: LESSON_5_DETAIL.reading,
    listening: LESSON_5_DETAIL.listening,
    culturalNote: LESSON_5_DETAIL.culturalNote,
  };
}

// Accent remover helper for Vietnamese search
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// Full Search Engine across the repository
export function searchLessons(
  query: string,
  branchScope: "ALL" | "hsk" | "topic" | "major" = "ALL"
): LessonSummary[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const rawQ = removeVietnameseAccents(cleanQ);

  return ALL_LESSONS_INDEX.filter((l) => {
    if (branchScope !== "ALL" && l.trackId !== branchScope) return false;

    const zhMatch = l.titleZh.toLowerCase().includes(cleanQ);
    const pyMatch = l.titlePy.toLowerCase().includes(cleanQ);
    const viMatch = removeVietnameseAccents(l.titleVi).includes(rawQ);
    const numMatch = `bài ${l.orderNumber}`.includes(cleanQ) || `bai ${l.orderNumber}`.includes(rawQ);
    const levelMatch = l.levelLabel.toLowerCase().includes(cleanQ);
    const catMatch = l.categoryLabel ? removeVietnameseAccents(l.categoryLabel).includes(rawQ) : false;

    return zhMatch || pyMatch || viMatch || numMatch || levelMatch || catMatch;
  });
}

// ===========================================================================
// TEACHER PERSONAL LIBRARY DATA MODELS (Tab 2: Thư viện của tôi)
// ===========================================================================
export interface SavedHanyuLesson {
  id: string;
  lessonId: string;
  titleZh: string;
  titleVi: string;
  trackId: "hsk" | "topic" | "major";
  levelLabel: string;
  savedAt: string;
  readOnly: true;
}

export interface CustomCuratedLesson {
  id: string;
  title: string;
  sourceLessonId: string;
  sourceLessonTitle: string;
  selectedVocabCount: number;
  selectedGrammarCount: number;
  selectedCulturalCount?: number;
  vocabs: VocabularyItem[];
  grammars: GrammarItem[];
  culturalItems?: CulturalSelectionItem[];
  createdAt: string;
  notes?: string;
}

export interface AssignedLessonToClass {
  id: string;
  lessonId: string;
  titleZh: string;
  titleVi: string;
  sourceTrackId: "hsk" | "topic" | "major";
  classIds: string[];
  classNames: string[];
  vocabCount: number;
  grammarCount: number;
  hasDialogue: boolean;
  hasReading: boolean;
  culturalCount: number;
  selectedVocabs: VocabularyItem[];
  selectedGrammars: GrammarItem[];
  selectedDialogue?: DialogueItem;
  selectedReading?: ReadingItem;
  selectedCulturalItems: CulturalSelectionItem[];
  assignedAt: string;
  dueDate: string;
  teacherNote?: string;
}

export function getCulturalSelectionItems(lesson: FullLessonDetail): CulturalSelectionItem[] {
  if (!lesson.culturalNote) return [];
  const cn = lesson.culturalNote;
  const items: CulturalSelectionItem[] = [];

  // 1. Context
  if (cn.context) {
    items.push({
      id: `cult-${lesson.id}-context`,
      type: "CONTEXT",
      categoryLabel: "Bối cảnh sử dụng",
      title: "Bối cảnh sử dụng",
      content: cn.context,
    });
  }

  // 2. Target Audience
  if (cn.targetAudience) {
    items.push({
      id: `cult-${lesson.id}-audience`,
      type: "TARGET_AUDIENCE",
      categoryLabel: "Đối tượng giao tiếp",
      title: "Đối tượng giao tiếp phù hợp",
      content: cn.targetAudience,
    });
  }

  // 3. Natural Expressions (Mẫu câu khuyên dùng)
  cn.naturalExpressions?.forEach((exp, idx) => {
    items.push({
      id: `cult-${lesson.id}-phrase-${idx}`,
      type: "PHRASE",
      categoryLabel: "Mẫu câu khuyên dùng",
      title: `Mẫu câu ${idx + 1}`,
      note: exp.usage,
      zh: exp.zh,
      py: exp.py,
      vi: exp.vi,
      content: `${exp.zh} (${exp.py}) - ${exp.vi}`,
    });
  });

  // 4. Polite Expressions (Cách nói lịch sự & tôn trọng)
  cn.politeExpressions?.forEach((pol, idx) => {
    items.push({
      id: `cult-${lesson.id}-polite-${idx}`,
      type: "POLITE",
      categoryLabel: "Cách nói lịch sự",
      title: `Cách nói lịch sự ${idx + 1}`,
      zh: pol.zh,
      py: pol.py,
      vi: pol.vi,
      note: pol.note,
      content: `${pol.zh} (${pol.py}) - ${pol.vi}`,
    });
  });

  // 5. Caution Notes (Lưu ý văn hóa & cấm kỵ cần tránh)
  cn.cautionNotes?.forEach((caut, idx) => {
    items.push({
      id: `cult-${lesson.id}-caution-${idx}`,
      type: "CAUTION",
      categoryLabel: "Lưu ý văn hóa",
      title: `Lưu ý văn hóa ${idx + 1}`,
      content: caut,
    });
  });

  if(cn.comparisonNote)items.push({id:`cult-${lesson.id}-comparison`,type:"POLITE",categoryLabel:"Lưu ý ngữ dụng",title:"Lưu ý ngữ dụng",content:cn.comparisonNote});
  // 6. Practice Scenario (Tình huống thực hành / áp dụng)
  if (cn.practiceScenario) {
    items.push({
      id: `cult-${lesson.id}-scenario`,
      type: "SCENARIO",
      categoryLabel: "Tình huống áp dụng",
      title: "Tình huống áp dụng thực tế",
      content: cn.practiceScenario,
    });
  }

  return items;
}

export interface LectureMaterialItem {
  id: string;
  title: string;
  fileType: "PDF" | "PPTX" | "DOCX" | "IMAGE" | "AUDIO" | "VIDEO";
  fileSize: string;
  fileUrl: string;
  sharedClassIds: string[];
  sharedClassNames: string[];
  classification: string;
  allowDownload: boolean;
  openDate?: string;
  dueDate?: string;
  uploadedAt: string;
  status: "PRIVATE" | "SHARED";
}

export const INITIAL_SAVED_HANYU_LESSONS: SavedHanyuLesson[] = [
  {
    id: "saved-1",
    lessonId: "hsk1-b5",
    titleZh: "今天我休息",
    titleVi: "Hôm nay tôi nghỉ ngơi",
    trackId: "hsk",
    levelLabel: "HSK 1",
    savedAt: "21/10/2026",
    readOnly: true,
  },
  {
    id: "saved-2",
    lessonId: "top-comm-1",
    titleZh: "初次见面，请多关照",
    titleVi: "Lần đầu gặp mặt, xin được chỉ giáo",
    trackId: "topic",
    levelLabel: "Giao tiếp đời sống",
    savedAt: "20/10/2026",
    readOnly: true,
  },
];

export const INITIAL_CURATED_LESSONS: CustomCuratedLesson[] = [
  {
    id: "curated-1",
    title: "Ôn tập Bài 5 - Phần 1: Từ vựng sức khỏe & trợ từ 了",
    sourceLessonId: "hsk1-b5",
    sourceLessonTitle: "HSK 1 - Bài 5: 今天我休息",
    selectedVocabCount: 4,
    selectedGrammarCount: 2,
    selectedCulturalCount: 3,
    vocabs: LESSON_5_DETAIL.vocabularies.slice(0, 4),
    grammars: LESSON_5_DETAIL.grammars.slice(0, 2),
    culturalItems: getCulturalSelectionItems(LESSON_5_DETAIL).slice(0, 3),
    createdAt: "21/10/2026",
    notes: "Dùng để ôn tập kiểm tra 15 phút đầu giờ cho lớp HSK1-K24.",
  },
];

export const INITIAL_ASSIGNED_LESSONS: AssignedLessonToClass[] = [];

export const INITIAL_LECTURE_MATERIALS: LectureMaterialItem[] = [
  {
    id: "mat-1",
    title: "Slide bài giảng: HSK 1 - Bài 5 Hôm nay tôi nghỉ ngơi.pptx",
    fileType: "PPTX",
    fileSize: "8.4 MB",
    fileUrl: "/sample-materials/slide-bai-5.pptx",
    sharedClassIds: ["c1"],
    sharedClassNames: ["HSK1-K24 Sơ cấp"],
    classification: "HSK 1",
    allowDownload: true,
    openDate: "2026-10-21",
    dueDate: "2026-10-28",
    uploadedAt: "21/10/2026 14:00",
    status: "SHARED",
  },
  {
    id: "mat-2",
    title: "Tập viết chữ Hán ô mễ: 150 chữ HSK 1 chuẩn.pdf",
    fileType: "PDF",
    fileSize: "4.2 MB",
    fileUrl: "/sample-materials/tap-viet-chu-han.pdf",
    sharedClassIds: ["c1", "c2"],
    sharedClassNames: ["HSK1-K24 Sơ cấp", "HSK2-K18 Cấp tốc"],
    classification: "HSK 1 & HSK 2",
    allowDownload: true,
    uploadedAt: "20/10/2026 10:30",
    status: "SHARED",
  },
];
