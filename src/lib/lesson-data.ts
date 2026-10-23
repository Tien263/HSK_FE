// Comprehensive Lesson Library Data Model & Seed Data
// Aligned with HSK 3.0, Theo chủ đề, Đại học & Ngành, and Teacher's Library

export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleZh: string;
  examplePy: string;
  exampleVi: string;
}

export interface GrammarItem {
  id: string;
  title: string;
  structure: string;
  explanation: string;
  examples: {
    zh: string;
    py: string;
    vi: string;
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
}

export interface ReadingItem {
  id: string;
  titleZh: string;
  titleVi: string;
  contentZh: string;
  contentPy: string;
  contentVi: string;
  wordCount: number;
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

export interface LessonSummary {
  id: string;
  orderNumber: number;
  trackId: "hsk" | "topic" | "major";
  levelId: string;
  levelLabel: string;
  categoryLabel?: string;
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
  { id: "hsk1", title: "HSK 1", desc: "Sơ cấp 150-300 từ vựng căn bản", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk2", title: "HSK 2", desc: "Sơ trung cấp 300-600 từ vựng", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk3", title: "HSK 3", desc: "Trung cấp 600-1200 từ vựng", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk4", title: "HSK 4", desc: "Trung cao cấp 1200-2500 từ vựng", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk5", title: "HSK 5", desc: "Cao cấp 2500-4000 từ vựng", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk6", title: "HSK 6", desc: "Thành thạo trên 5000 từ vựng", totalLessons: 20, isAvailable: true, tag: "Có 20 bài" },
  { id: "hsk79", title: "HSK 7–9", desc: "Bậc cao cấp chuyên sâu / Học thuật", totalLessons: 0, isAvailable: false, tag: "Chưa có bài" },
];

export const HSK1_LESSONS: LessonSummary[] = [
  {
    id: "hsk1-b1",
    orderNumber: 1,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "你好",
    titlePy: "Nǐ hǎo",
    titleVi: "Chào bạn",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 8, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b2",
    orderNumber: 2,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "谢谢你",
    titlePy: "Xièxie nǐ",
    titleVi: "Cảm ơn bạn",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 9, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b3",
    orderNumber: 3,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "你叫什么名字",
    titlePy: "Nǐ jiào shénme míngzi",
    titleVi: "Bạn tên là gì",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b4",
    orderNumber: 4,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "这是我的家",
    titlePy: "Zhè shì wǒ de jiā",
    titleVi: "Đây là gia đình tôi",
    thumbnailArt: "lesson4",
    stats: { vocabCount: 10, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b5",
    orderNumber: 5,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "今天我休息",
    titlePy: "Jīntiān wǒ xiūxi",
    titleVi: "Hôm nay tôi nghỉ ngơi",
    thumbnailArt: "lesson5",
    stats: { vocabCount: 6, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b6",
    orderNumber: 6,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我喜欢音乐",
    titlePy: "Wǒ xǐhuan yīnyuè",
    titleVi: "Tôi thích âm nhạc",
    thumbnailArt: "lesson6",
    stats: { vocabCount: 14, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b7",
    orderNumber: 7,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "你家有几口人",
    titlePy: "Nǐ jiā yǒu jǐ kǒu rén",
    titleVi: "Nhà bạn có mấy người",
    thumbnailArt: "lesson7",
    stats: { vocabCount: 11, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
  },
  {
    id: "hsk1-b8",
    orderNumber: 8,
    trackId: "hsk",
    levelId: "hsk1",
    levelLabel: "HSK 1",
    titleZh: "我们去公园吧",
    titlePy: "Wǒmen qù gōngyuán ba",
    titleVi: "Chúng ta cùng đi công viên nhé",
    thumbnailArt: "lesson8",
    stats: { vocabCount: 15, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
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

// ===========================================================================
// 2. THEO CHỦ ĐỀ TRACK (Topic-based Categories & Lessons)
// ===========================================================================
export interface TopicCategoryMeta {
  id: string;
  title: string;
  desc: string;
  icon: string;
  totalLessons: number;
}

export const TOPIC_CATEGORIES: TopicCategoryMeta[] = [
  {
    id: "topic-comm",
    title: "Giao tiếp đời sống & Xã giao",
    desc: "Khẩu ngữ thường nhật, kết bạn, hỏi thăm, chia sẻ sở thích",
    icon: "💬",
    totalLessons: 6,
  },
  {
    id: "topic-food",
    title: "Ẩm thực & Nhà hàng Trung Hoa",
    desc: "Gọi món, hương vị món ăn, văn hóa bàn tiệc và thanh toán",
    icon: "🍜",
    totalLessons: 4,
  },
  {
    id: "topic-travel",
    title: "Du lịch, Đặt vé & Khách sạn",
    desc: "Mua vé tàu cao tốc, hỏi đường, đặt phòng và tham quan",
    icon: "✈️",
    totalLessons: 5,
  },
  {
    id: "topic-shopping",
    title: "Mua sắm & Thanh toán điện tử",
    desc: "Mặc cả, mua quà lưu niệm, thanh toán qua WeChat / Alipay",
    icon: "🛍️",
    totalLessons: 4,
  },
  {
    id: "topic-health",
    title: "Sức khỏe, Bệnh viện & Khám bệnh",
    desc: "Mô tả triệu chứng bệnh, mua thuốc, đăng ký khám viện",
    icon: "🏥",
    totalLessons: 4,
  },
  {
    id: "topic-office",
    title: "Công sở & Phỏng vấn xin việc",
    desc: "Phỏng vấn, viết email công việc, báo cáo tiến độ và họp",
    icon: "💼",
    totalLessons: 4,
  },
];

export const TOPIC_LESSONS: Record<string, LessonSummary[]> = {
  "topic-comm": [
    {
      id: "top-comm-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "topic-comm",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Giao tiếp đời sống & Xã giao",
      titleZh: "初次见面，请多关照",
      titlePy: "Chūcì jiànmiàn, qǐng duō guānzhào",
      titleVi: "Lần đầu gặp mặt, xin được chỉ giáo",
      thumbnailArt: "lesson4",
      stats: { vocabCount: 12, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
    {
      id: "top-comm-2",
      orderNumber: 2,
      trackId: "topic",
      levelId: "topic-comm",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Giao tiếp đời sống & Xã giao",
      titleZh: "周末你喜欢做什么",
      titlePy: "Zhōumò nǐ xǐhuan zuò shénme",
      titleVi: "Cuối tuần bạn thích làm gì",
      thumbnailArt: "lesson6",
      stats: { vocabCount: 14, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  "topic-food": [
    {
      id: "top-food-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "topic-food",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Ẩm thực & Nhà hàng Trung Hoa",
      titleZh: "服务员，请给我们菜单",
      titlePy: "Fúwùyuán, qǐng gěi wǒmen càidān",
      titleVi: "Phục vụ ơi, xin cho chúng tôi xem thực đơn",
      thumbnailArt: "lesson5",
      stats: { vocabCount: 15, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
    {
      id: "top-food-2",
      orderNumber: 2,
      trackId: "topic",
      levelId: "topic-food",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Ẩm thực & Nhà hàng Trung Hoa",
      titleZh: "这道菜有点辣",
      titlePy: "Zhè dào cài yǒudiǎn là",
      titleVi: "Món ăn này hơi cay một chút",
      thumbnailArt: "lesson7",
      stats: { vocabCount: 12, grammarCount: 2, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  "topic-travel": [
    {
      id: "top-travel-1",
      orderNumber: 1,
      trackId: "topic",
      levelId: "topic-travel",
      levelLabel: "Theo chủ đề",
      categoryLabel: "Du lịch, Đặt vé & Khách sạn",
      titleZh: "我想预订一间大床房",
      titlePy: "Wǒ xiǎng yùdìng yì jiān dàchuáng fáng",
      titleVi: "Tôi muốn đặt một phòng giường đôi",
      thumbnailArt: "lesson8",
      stats: { vocabCount: 16, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
};

// ===========================================================================
// 3. ĐẠI HỌC & NGÀNH TRACK (Major Fields, Subjects & Lessons)
// ===========================================================================
export interface MajorFieldMeta {
  id: string;
  title: string;
  desc: string;
  icon: string;
  subjects: {
    id: string;
    title: string;
    totalLessons: number;
  }[];
}

export const MAJOR_FIELDS: MajorFieldMeta[] = [
  {
    id: "major-econ",
    title: "Kinh tế & Thương mại quốc tế",
    desc: "Đàm phán thương mại, ngoại thương, hợp đồng kinh tế và xuất nhập khẩu",
    icon: "📈",
    subjects: [
      { id: "sub-trade-1", title: "Tiếng Trung Ngoại thương căn bản", totalLessons: 6 },
      { id: "sub-trade-2", title: "Đàm phán giá cả và Hợp đồng quốc tế", totalLessons: 6 },
    ],
  },
  {
    id: "major-business",
    title: "Quản trị kinh doanh & Quản lý",
    desc: "Quản trị doanh nghiệp, marketing quốc tế và quản lý nhân sự",
    icon: "🏢",
    subjects: [
      { id: "sub-biz-1", title: "Tiếng Trung Quản trị doanh nghiệp", totalLessons: 5 },
      { id: "sub-biz-2", title: "Marketing và Phát triển thị trường", totalLessons: 4 },
    ],
  },
  {
    id: "major-finance",
    title: "Kế toán – Tài chính & Ngân hàng",
    desc: "Báo cáo tài chính, quyết toán thuế, thanh toán tín dụng quốc tế L/C",
    icon: "💰",
    subjects: [
      { id: "sub-fin-1", title: "Tiếng Trung Kế toán doanh nghiệp", totalLessons: 5 },
      { id: "sub-fin-2", title: "Nghiệp vụ Thanh toán Ngân hàng", totalLessons: 4 },
    ],
  },
  {
    id: "major-tech",
    title: "Công nghệ thông tin & Kỹ thuật",
    desc: "Thuật ngữ lập trình, phần mềm, trí tuệ nhân tạo và kỹ thuật",
    icon: "💻",
    subjects: [
      { id: "sub-tech-1", title: "Tiếng Trung Công nghệ thông tin", totalLessons: 4 },
    ],
  },
  {
    id: "major-other",
    title: "Ngành khác (Du lịch - Khách sạn)",
    desc: "Quản trị nhà hàng khách sạn, hướng dẫn viên quốc tế",
    icon: "🛎️",
    subjects: [
      { id: "sub-other-1", title: "Nghiệp vụ Lễ tân & Buồng phòng", totalLessons: 4 },
    ],
  },
];

export const MAJOR_LESSONS: Record<string, LessonSummary[]> = {
  "sub-trade-1": [
    {
      id: "maj-trade-1",
      orderNumber: 1,
      trackId: "major",
      levelId: "major-econ",
      levelLabel: "Đại học & Ngành",
      categoryLabel: "Kinh tế · Tiếng Trung Ngoại thương căn bản",
      titleZh: "国际贸易价格谈判",
      titlePy: "Guójì màoyì jiàgé tánpàn",
      titleVi: "Đàm phán giá cả thương mại quốc tế",
      thumbnailArt: "lesson5",
      stats: { vocabCount: 18, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
    {
      id: "maj-trade-2",
      orderNumber: 2,
      trackId: "major",
      levelId: "major-econ",
      levelLabel: "Đại học & Ngành",
      categoryLabel: "Kinh tế · Tiếng Trung Ngoại thương căn bản",
      titleZh: "外贸合同条款的确定",
      titlePy: "Wàimào hétong tiáokuǎn de quèdìng",
      titleVi: "Xác định các điều khoản hợp đồng ngoại thương",
      thumbnailArt: "lesson7",
      stats: { vocabCount: 20, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
  "sub-trade-2": [
    {
      id: "maj-trade-3",
      orderNumber: 1,
      trackId: "major",
      levelId: "major-econ",
      levelLabel: "Đại học & Ngành",
      categoryLabel: "Kinh tế · Đàm phán giá cả",
      titleZh: "信用证付款与交货条款",
      titlePy: "Xìnyòngzhèng fùkuǎn yǔ jiāohuò tiáokuǎn",
      titleVi: "Thanh toán bằng thư tín dụng L/C và giao hàng",
      thumbnailArt: "lesson8",
      stats: { vocabCount: 22, grammarCount: 3, dialogueCount: 1, readingCount: 1, listeningCount: 1 },
    },
  ],
};

// ===========================================================================
// FEATURED HERO LESSON DETAILS (Used across viewers)
// ===========================================================================
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
      explanation: "Dùng để phủ định hành động, mong muốn, thói quen ở hiện tại hoặc tương lai. Không dùng để phủ định hành động đã xảy ra trong quá khứ.",
      examples: [
        {
          zh: "今天我不去上班。",
          py: "Jīntiān wǒ bù qù shàngbān.",
          vi: "Hôm nay tôi không đi làm.",
        },
        {
          zh: "张伟不喝咖啡。",
          py: "Zhāng Wěi bù hē kāfēi.",
          vi: "Trương Vĩ không uống cà phê.",
        },
      ],
    },
    {
      id: "g-ma",
      title: "Trợ từ nghi vấn '吗' tạo câu hỏi lựa chọn Yes/No",
      structure: "Câu trần thuật + 吗？",
      explanation: "Chỉ cần thêm '吗' vào cuối một câu trần thuật khẳng định là câu đó biến thành câu hỏi nghi vấn Có/Không.",
      examples: [
        {
          zh: "你明天休息吗？",
          py: "Nǐ míngtiān xiūxi ma?",
          vi: "Ngày mai bạn có được nghỉ ngơi không?",
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
};

// ===========================================================================
// TOPIC DETAILED LESSON SEED: 初次见面，请多关照
// ===========================================================================
export const TOPIC_LESSON_DETAIL_1: FullLessonDetail = {
  id: "top-comm-1",
  orderNumber: 1,
  trackId: "topic",
  levelId: "topic-comm",
  levelLabel: "Theo chủ đề",
  categoryLabel: "Giao tiếp đời sống & Xã giao",
  titleZh: "初次见面，请多关照",
  titlePy: "Chūcì jiànmiàn, qǐng duō guānzhào",
  titleVi: "Lần đầu gặp mặt, xin được chỉ giáo",
  thumbnailArt: "lesson4",
  description: "Bài học giúp bạn làm quen với văn hóa xưng hô, chào hỏi lễ độ và giới thiệu bản thân trong môi trường học tập hoặc công sở Trung Hoa.",
  stats: {
    vocabCount: 5,
    grammarCount: 2,
    dialogueCount: 1,
    readingCount: 1,
    listeningCount: 1,
  },
  vocabularies: [
    {
      id: "v-chuci",
      hanzi: "初次",
      pinyin: "chūcì",
      partOfSpeech: "phó từ",
      meaningVi: "Lần đầu tiên",
      exampleZh: "这是我们初次见面。",
      examplePy: "Zhè shì wǒmen chūcì jiànmiàn.",
      exampleVi: "Đây là lần đầu tiên chúng tôi gặp mặt.",
    },
    {
      id: "v-guanzhao",
      hanzi: "关照",
      pinyin: "guānzhào",
      partOfSpeech: "động từ",
      meaningVi: "Quan tâm, giúp đỡ, chiếu cố",
      exampleZh: "以后请您多多关照。",
      examplePy: "Yǐhòu qǐng nín duōduō guānzhào.",
      exampleVi: "Sau này xin nhờ ngài chỉ giáo, giúp đỡ nhiều hơn.",
    },
    {
      id: "v-xingrong",
      hanzi: "荣幸",
      pinyin: "róngxìng",
      partOfSpeech: "tính từ",
      meaningVi: "Vinh hạnh, vinh dự",
      exampleZh: "认识您是我的荣幸。",
      examplePy: "Rènshi nín shì wǒ de róngxìng.",
      exampleVi: "Được quen biết ngài là vinh hạnh của tôi.",
    },
    {
      id: "v-mingpian",
      hanzi: "名片",
      pinyin: "míngpiàn",
      partOfSpeech: "danh từ",
      meaningVi: "Danh thiếp, namecard",
      exampleZh: "这是我的名片，请收下。",
      examplePy: "Zhè shì wǒ de míngpiàn, qǐng shōuxià.",
      exampleVi: "Đây là danh thiếp của tôi, xin ngài nhận lấy.",
    },
    {
      id: "v-jiaoliu",
      hanzi: "交流",
      pinyin: "jiāoliú",
      partOfSpeech: "động từ",
      meaningVi: "Giao lưu, trao đổi",
      exampleZh: "我们多交流汉语吧。",
      examplePy: "Wǒmen duō jiāoliú hànyǔ ba.",
      exampleVi: "Chúng ta hãy giao lưu tiếng Trung nhiều hơn nhé.",
    },
  ],
  grammars: [
    {
      id: "g-qingduo",
      title: "Mẫu câu lịch sự: 请多 + Động từ (Xin hãy chiếu cố / chỉ giáo)",
      structure: "请多 + Động từ (关照 / 交流 / 指教)",
      explanation: "Dùng trong ngữ cảnh trang trọng khi mới làm quen hoặc muốn thể hiện thái độ khiêm nhường.",
      examples: [
        {
          zh: "请多关照！",
          py: "Qǐng duō guānzhào!",
          vi: "Xin được chỉ giáo / giúp đỡ!",
        },
      ],
    },
    {
      id: "g-shi-de",
      title: "Cấu trúc nhấn mạnh '是...的'",
      structure: "Chủ ngữ + 是 + [Thời gian/Địa điểm/Phương thức] + Động từ + 的",
      explanation: "Nhấn mạnh về thời gian, địa điểm hoặc cách thức xảy ra một hành động đã diễn ra trong quá khứ.",
      examples: [
        {
          zh: "我们是去年认识的。",
          py: "Wǒmen shì qùnián rènshi de.",
          vi: "Chúng tôi quen nhau vào năm ngoái.",
        },
      ],
    },
  ],
  dialogue: {
    id: "d-top-1",
    title: "Hội thoại: Trao đổi danh thiếp trong buổi tiệc",
    situation: "Vương Minh lần đầu gặp đối tác Trương Lệ và giới thiệu bản thân.",
    audioDuration: "01:15",
    lines: [
      {
        speaker: "王明",
        speakerRole: "Giám đốc",
        zh: "张经理，初次见面，请多关照！",
        py: "Zhāng jīnglǐ, chūcì jiànmiàn, qǐng duō guānzhào!",
        vi: "Trương giám đốc, lần đầu gặp mặt, xin được ngài chỉ giáo!",
      },
      {
        speaker: "张丽",
        speakerRole: "Đối tác",
        zh: "王总您太客气了，久仰您的大名！这是我的名片。",
        py: "Wáng zǒng nín tài kèqi le, jiǔyǎng nín de dàmíng! Zhè shì wǒ de míngpiàn.",
        vi: "Vương tổng ngài khách sáo quá, ngưỡng mộ đại danh của ngài đã lâu! Đây là danh thiếp của tôi.",
      },
    ],
  },
};

// ===========================================================================
// MAJOR DETAILED LESSON SEED: 国际贸易价格谈判
// ===========================================================================
export const MAJOR_LESSON_DETAIL_1: FullLessonDetail = {
  id: "maj-trade-1",
  orderNumber: 1,
  trackId: "major",
  levelId: "major-econ",
  levelLabel: "Đại học & Ngành",
  categoryLabel: "Kinh tế · Tiếng Trung Ngoại thương căn bản",
  titleZh: "国际贸易价格谈判",
  titlePy: "Guójì màoyì jiàgé tánpàn",
  titleVi: "Đàm phán giá cả thương mại quốc tế",
  thumbnailArt: "lesson5",
  description: "Trọng tâm bài giảng hướng dẫn thuật ngữ báo giá CIF/FOB, chiến lược thương lượng chiết khấu và lập biên bản thỏa thuận giá cả trong hợp đồng mua bán.",
  stats: {
    vocabCount: 5,
    grammarCount: 2,
    dialogueCount: 1,
    readingCount: 1,
    listeningCount: 1,
  },
  vocabularies: [
    {
      id: "v-baojia",
      hanzi: "报价",
      pinyin: "bàojià",
      partOfSpeech: "danh từ / động từ",
      meaningVi: "Báo giá, giá chào hàng",
      exampleZh: "这是我们最新的FOB报价单。",
      examplePy: "Zhè shì wǒmen zuìxīn de FOB bàojià dān.",
      exampleVi: "Đây là bảng báo giá FOB mới nhất của chúng tôi.",
    },
    {
      id: "v-zhekou",
      hanzi: "折扣",
      pinyin: "zhékòu",
      partOfSpeech: "danh từ",
      meaningVi: "Chiết khấu, giảm giá",
      exampleZh: "如果订货量大，我们可以给予5%的折扣。",
      examplePy: "Rúguǒ dìnghuò liàng dà, wǒmen kěyǐ jǐyǔ bǎifēnzhīwǔ de zhékòu.",
      exampleVi: "Nếu lượng đặt hàng lớn, chúng tôi có thể chiết khấu 5%.",
    },
    {
      id: "v-jiaohuo",
      hanzi: "交货期",
      pinyin: "jiāohuò qī",
      partOfSpeech: "danh từ",
      meaningVi: "Thời hạn giao hàng",
      exampleZh: "贵公司的交货期是多久？",
      examplePy: "Guì gōngsī de jiāohuò qī shì duōjiǔ?",
      exampleVi: "Thời hạn giao hàng của quý công ty là bao lâu?",
    },
    {
      id: "v-hetong",
      hanzi: "合同",
      pinyin: "hétong",
      partOfSpeech: "danh từ",
      meaningVi: "Hợp đồng kinh tế",
      exampleZh: "双方已正式签订买卖合同。",
      examplePy: "Shuāngfāng yǐ zhèngshì qiāndìng mǎimài hétong.",
      exampleVi: "Hai bên đã chính thức ký kết hợp đồng mua bán.",
    },
    {
      id: "v-tiao",
      hanzi: "条款",
      pinyin: "tiáokuǎn",
      partOfSpeech: "danh từ",
      meaningVi: "Điều khoản",
      exampleZh: "付款条款采用不可撤销信用证。",
      examplePy: "Fùkuǎn tiáokuǎn cǎiyòng bùkě chèxiāo xìnyòngzhèng.",
      exampleVi: "Điều khoản thanh toán áp dụng thư tín dụng không thể hủy ngang.",
    },
  ],
  grammars: [
    {
      id: "g-ruguo-jiu",
      title: "Cấu trúc điều kiện: 如果...就 / 那么 (Nếu... thì)",
      structure: "如果 + Điều kiện thương mại, (那么/就) + Kết quả thỏa thuận",
      explanation: "Dùng để đàm phán các điều kiện tương hỗ (số lượng, thời hạn, chiết khấu).",
      examples: [
        {
          zh: "如果贵方接受这个价格，我们就可以本月发货。",
          py: "Rúguǒ guìfāng jiēshòu zhè ge jiàgé, wǒmen jiù kěyǐ běnyuè fāhuò.",
          vi: "Nếu quý bên chấp nhận mức giá này, chúng tôi có thể giao hàng trong tháng này.",
        },
      ],
    },
  ],
  dialogue: {
    id: "d-maj-1",
    title: "Hội thoại: Đàm phán mức chiết khấu đơn hàng 10.000 sản phẩm",
    situation: "Đại diện bên Mua yêu cầu giảm giá theo số lượng đặt hàng lớn.",
    audioDuration: "01:30",
    lines: [
      {
        speaker: "买方",
        speakerRole: "Giám đốc Mua hàng",
        zh: "王经理，我们的订购量达到一万件，不知道贵方是否能给予一些折扣？",
        py: "Wáng jīnglǐ, wǒmen de dìnggòu liàng dádào yí wàn jiàn, bù zhīdào guìfāng shìfǒu néng jǐyǔ yìxiē zhékòu?",
        vi: "Vương giám đốc, số lượng đặt hàng của chúng tôi đạt 10.000 chiếc, không rõ quý công ty có thể chiết khấu cho chúng tôi không?",
      },
      {
        speaker: "卖方",
        speakerRole: "Giám đốc Bán hàng",
        zh: "鉴于双方长期的友好合作关系，我们可以给贵方3%的价格优惠。",
        py: "Jiànyú shuāngfāng chángqī de yǒuhǎo hézuò guānxì, wǒmen kěyǐ gěi guìfāng bǎifēnzhīsān de jiàgé yōuhuì.",
        vi: "Xét thấy quan hệ hợp tác hữu nghị lâu dài giữa hai bên, chúng tôi có thể ưu đãi 3% trên giá cho quý bên.",
      },
    ],
  },
};

// ===========================================================================
// ALL LESSONS MASTER REPOSITORY (Flattened for Search Engine)
// ===========================================================================
export const ALL_LESSONS_INDEX: LessonSummary[] = [
  ...HSK1_LESSONS,
  ...HSK2_LESSONS,
  ...HSK3_LESSONS,
  ...(TOPIC_LESSONS["topic-comm"] || []),
  ...(TOPIC_LESSONS["topic-food"] || []),
  ...(TOPIC_LESSONS["topic-travel"] || []),
  ...(MAJOR_LESSONS["sub-trade-1"] || []),
  ...(MAJOR_LESSONS["sub-trade-2"] || []),
];

// Lookup detail by id
export function getLessonDetailById(id: string): FullLessonDetail {
  if (id === "top-comm-1") return TOPIC_LESSON_DETAIL_1;
  if (id === "maj-trade-1") return MAJOR_LESSON_DETAIL_1;
  if (id === "hsk1-b5" || !id) return LESSON_5_DETAIL;

  const summary = ALL_LESSONS_INDEX.find((l) => l.id === id);
  if (!summary) return LESSON_5_DETAIL;

  return {
    ...summary,
    description: `Nội dung học phần tiêu chuẩn cho ${summary.titleVi} (${summary.titleZh}).`,
    vocabularies: LESSON_5_DETAIL.vocabularies.slice(0, 5),
    grammars: LESSON_5_DETAIL.grammars.slice(0, 2),
    dialogue: LESSON_5_DETAIL.dialogue,
    reading: LESSON_5_DETAIL.reading,
    listening: LESSON_5_DETAIL.listening,
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
export function searchLessons(query: string, branchScope: "ALL" | "hsk" | "topic" | "major" = "ALL"): LessonSummary[] {
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
  vocabs: VocabularyItem[];
  grammars: GrammarItem[];
  createdAt: string;
  notes?: string;
}

export interface CustomCreatedLesson {
  id: string;
  title: string;
  curriculum: string;
  level: string;
  vocabCount: number;
  grammarCount: number;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

export interface LectureMaterialItem {
  id: string;
  title: string;
  fileType: "PDF" | "PPTX" | "DOCX" | "IMAGE" | "AUDIO" | "VIDEO";
  fileSize: string;
  fileUrl: string;
  sharedClassIds: string[];
  sharedClassNames: string[];
  classification: string; // e.g. "HSK 1", "Chủ đề Ẩm thực"
  allowDownload: boolean;
  openDate?: string;
  dueDate?: string;
  uploadedAt: string;
  status: "PRIVATE" | "SHARED";
}

// Mock initial data for Teacher Library
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
    vocabs: LESSON_5_DETAIL.vocabularies.slice(0, 4),
    grammars: LESSON_5_DETAIL.grammars.slice(0, 2),
    createdAt: "21/10/2026",
    notes: "Dùng để ôn tập kiểm tra 15 phút đầu giờ cho lớp HSK1-K24.",
  },
];

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
