// Comprehensive Lesson Library Data Model & Seed Data
// Aligned with the approved 21/10/2026 specification and teacher dashboard mockup

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

// ---------------------------------------------------------------------------
// Lesson 5: 今天我休息 (Hero lesson matching uploaded mockup)
// ---------------------------------------------------------------------------
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
        {
          zh: "你今天去医院吗？",
          py: "Nǐ jīntiān qù yīyuàn ma?",
          vi: "Hôm nay bạn có đi bệnh viện không?",
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
      {
        question: "Hai người hẹn gặp nhau vào lúc nào?",
        options: ["Tối nay", "Sáng mai", "Ngày kia (后天)", "Tuần sau"],
        correctIndex: 2,
        explanation: "Người nam đề nghị: '后天我们再去图书馆看书吧！' và Mary đồng ý.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// All Lessons in HSK 1
// ---------------------------------------------------------------------------
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

// Helper to look up any lesson by ID
export function getLessonDetailById(id: string): FullLessonDetail {
  if (id === "hsk1-b5" || !id) {
    return LESSON_5_DETAIL;
  }
  const summary = HSK1_LESSONS.find((l) => l.id === id);
  if (!summary) {
    return LESSON_5_DETAIL;
  }
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
