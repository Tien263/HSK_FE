// hskk-templates.ts
// Cấu trúc và bộ đề mẫu chuẩn HSKK (Khẩu ngữ Hán ngữ) theo chuẩn Hanban / CTI
// Phân cấp: HSKK Sơ cấp (ghép HSK 1, 2, 3), HSKK Trung cấp (ghép HSK 4), HSKK Cao cấp (ghép HSK 5, 6)

import type { ExamSectionGroup, QuestionItem } from "./hsk-sample-templates";

export interface HskkExamPackage {
  title: string;
  level: "HSKK_BEGINNER" | "HSKK_INTERMEDIATE" | "HSKK_ADVANCED";
  levelName: string;
  durationMin: number;
  groups: ExamSectionGroup[];
}

/**
 * 1. HSKK Sơ cấp (初级) - Ghép cùng HSK 1, 2, 3
 * - Phần 1: Nghe rồi nhắc lại (听后重复) - 15 câu (Câu 1-15)
 * - Phần 2: Nghe rồi trả lời ngắn (听后回答) - 10 câu (Câu 16-25)
 * - Phần 3: Trả lời câu hỏi (回答问题) - 2 câu (Câu 26-27, có pinyin)
 */
export function buildHskkBeginnerTemplate(baseTitle = "Đề thi HSKK Sơ cấp"): HskkExamPackage {
  const defaultAudio = "https://res.cloudinary.com/dgyv9ffre/video/upload/v1747123456/hsk_exam_media/sample_listening.mp3";

  // Phần 1: Nghe rồi nhắc lại
  const part1Questions: QuestionItem[] = [];
  const part1SampleTexts = [
    { zh: "我想去商店买水。", py: "Wǒ xiǎng qù shāngdiàn mǎi shuǐ." },
    { zh: "今天天气非常好，很暖和。", py: "Jīntiān tiānqì fēicháng hǎo, hěn nuǎnhuo." },
    { zh: "请问，去火车站怎么走？", py: "Qǐngwèn, qù huǒchēzhàn zěnme zǒu?" },
    { zh: "妈妈在厨房做饭呢。", py: "Māma zài chúfáng zuò fàn ne." },
    { zh: "这是我去年买的新自行车。", py: "Zhè shì wǒ qùnián mǎi de xīn zìxíngchē." },
    { zh: "他学汉语学了两年了。", py: "Tā xué Hànyǔ xué le liǎng nián le." },
    { zh: "别客气，随便坐吧。", py: "Bié kèqi, suíbiàn zuò ba." },
    { zh: "我们明天上午八点在校门口见。", py: "Wǒmen míngtiān shàngwǔ bā diǎn zài xiào ménkǒu jiàn." },
    { zh: "这个西瓜真甜，很好吃。", py: "Zhège xīguā zhēn tián, hěn hǎochī." },
    { zh: "你看见我的手机了吗？", py: "Nǐ kànjiàn wǒ de shǒujī le ma?" },
    { zh: "今天工作有点儿累，想早点儿休息。", py: "Jīntiān gōngzuò yǒudiǎnr lèi, xiǎng zǎodiǎnr xiūxi." },
    { zh: "外边下雨了，你出门记得带伞。", py: "Wàibian xiàyǔ le, nǐ chūmén jìde dài sǎn." },
    { zh: "李老师正在办公室改作业。", py: "Lǐ lǎoshī zhèngzài bàngōngshì gǎi zuòyè." },
    { zh: "虽然有点儿贵，但是质量很好。", py: "Suīrán yǒudiǎnr guì, dànshì zhìliàng hěn hǎo." },
    { zh: "祝你生日快乐，天天开心！", py: "Zhù nǐ shēngrì kuàilè, tiāntiān kāixīn!" },
  ];

  for (let i = 1; i <= 15; i++) {
    const sample = part1SampleTexts[i - 1];
    part1Questions.push({
      id: `hskk_beg_p1_q${i}`,
      questionNumber: i,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: sample.zh,
      pinyin: sample.py,
      audioUrl: defaultAudio,
      points: 2.5,
      correctAnswer: `Thí sinh phát âm chuẩn xác, nhắc lại nguyên vẹn: "${sample.zh}"`,
      explanation: `HSKK Sơ cấp Phần 1 (Câu ${i}): Nghe câu ghi âm và nhắc lại ngay sau tiếng bíp. Chú ý thanh điệu và phát âm chuẩn các thanh 1, 2, 3, 4.`,
      options: [],
      requiresManualReview: true,
    });
  }

  // Phần 2: Nghe rồi trả lời ngắn (10 câu)
  const part2Questions: QuestionItem[] = [];
  const part2SampleTexts = [
    { q: "你每天几点起床？", py: "Nǐ měitiān jǐ diǎn qǐchuáng?", exp: "Trả lời giờ thức dậy (ví dụ: 我每天七点起床。)" },
    { q: "你最喜欢吃什么中国菜？", py: "Nǐ zuì xǐhuan chī shénme Zhōngguó cài?", exp: "Trả lời món ăn (ví dụ: 我最喜欢吃饺子 / 烤鸭。)" },
    { q: "你去过北京旅游吗？", py: "Nǐ qùguo Běijīng lǚyóu ma?", exp: "Trả lời có hoặc chưa đi Bắc Kinh." },
    { q: "平时你喜欢喝茶还是喝咖啡？", py: "Píngshí nǐ xǐhuan hē chá háishì hē kāfēi?", exp: "Trả lời sở thích uống trà hoặc cà phê." },
    { q: "今天星期几？", py: "Jīntiān xīngqī jǐ?", exp: "Nêu đúng thứ trong tuần (ví dụ: 今天星期六。)" },
    { q: "你家有几口人？", py: "Nǐ jiā yǒu jǐ kǒu rén?", exp: "Trả lời số thành viên trong gia đình." },
    { q: "你学汉语多长时间了？", py: "Nǐ xué Hànyǔ duō cháng shíjiān le?", exp: "Nêu thời gian học (ví dụ: 我学汉语半年了。)" },
    { q: "你觉得汉语难不难？", py: "Nǐ juéde Hànyǔ nán bu nán?", exp: "Nêu cảm nhận (ví dụ: 我觉得汉字难，发音容易。)" },
    { q: "明天你想去哪里玩儿？", py: "Míngtiān nǐ xiǎng qù nǎlǐ wánr?", exp: "Nêu địa điểm muốn đi (ví dụ: 我想去公园 / 电影院。)" },
    { q: "你一般怎么去学校？", py: "Nǐ yībān zěnme qù xuéxiào?", exp: "Nêu phương tiện (ví dụ: 我骑自行车去学校。)" },
  ];

  for (let i = 1; i <= 10; i++) {
    const sample = part2SampleTexts[i - 1];
    part2Questions.push({
      id: `hskk_beg_p2_q${15 + i}`,
      questionNumber: 15 + i,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: sample.q,
      pinyin: sample.py,
      audioUrl: defaultAudio,
      points: 3,
      correctAnswer: sample.exp,
      explanation: `HSKK Sơ cấp Phần 2 (Câu ${15 + i}): Nghe câu hỏi và trả lời ngắn gọn, chuẩn ngữ pháp trong vòng 10 giây.`,
      options: [],
      requiresManualReview: true,
    });
  }

  // Phần 3: Trả lời câu hỏi (2 câu, có pinyin)
  const part3Questions: QuestionItem[] = [
    {
      id: `hskk_beg_p3_q26`,
      questionNumber: 26,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "请介绍一下你最好的朋友。他（她）长什么样？你们平时一起做什么？",
      pinyin: "Qǐng jièshào yíxià nǐ zuì hǎo de péngyou. Tā zhǎng shénme yàng? Nǐmen píngshí yìqǐ zuò shénme?",
      points: 16,
      correctAnswer: "Miêu tả bạn thân: ngoại hình, tính cách, sở thích chung (nói khoảng 1 - 1.5 phút).",
      explanation: "HSKK Sơ cấp Phần 3 (Câu 26): Đọc đề bài và suy nghĩ trong 1 phút, sau đó nói liên tục trong 1.5 phút. Cần nói được ít nhất 5-8 câu mạch lạc.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: `hskk_beg_p3_q27`,
      questionNumber: 27,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "你最喜欢一年当中的哪个季节？为什么喜欢这个季节？",
      pinyin: "Nǐ zuì xǐhuan yì nián dāngzhōng de nǎge jìjié? Wèishénme xǐhuan zhège jìjié?",
      points: 16.5,
      correctAnswer: "Nêu rõ mùa yêu thích (xuân, hạ, thu, đông), lý do (thời tiết, cảnh đẹp, hoạt động thường làm).",
      explanation: "HSKK Sơ cấp Phần 3 (Câu 27): Đọc câu hỏi và trình bày quan điểm cá nhân, vận dụng từ vựng về thời tiết và hoạt động giải trí.",
      options: [],
      requiresManualReview: true,
    },
  ];

  const groups: ExamSectionGroup[] = [
    {
      id: "hskk_beg_group_1",
      title: "Phần 1: Nghe rồi nhắc lại (听后重复 - 15 câu)",
      skill: "SPEAKING",
      instruction: "Thí sinh nghe đoạn ghi âm và nhắc lại nguyên văn câu nói sau tiếng bíp. Mỗi câu có 1 lần nghe.",
      audioUrl: defaultAudio,
      groupType: "hskk_listen_repeat" as any,
      questions: part1Questions,
    },
    {
      id: "hskk_beg_group_2",
      title: "Phần 2: Nghe rồi trả lời ngắn (听后回答 - 10 câu)",
      skill: "SPEAKING",
      instruction: "Thí sinh nghe câu hỏi qua ghi âm và trả lời ngắn gọn, đúng trọng tâm trong vòng 10 giây.",
      audioUrl: defaultAudio,
      groupType: "hskk_listen_answer" as any,
      questions: part2Questions,
    },
    {
      id: "hskk_beg_group_3",
      title: "Phần 3: Trả lời câu hỏi (回答问题 - 2 câu)",
      skill: "SPEAKING",
      instruction: "Thí sinh đọc câu hỏi chữ Hán (kèm pinyin) trên màn hình, có thời gian chuẩn bị và trả lời từ 1 đến 1.5 phút cho mỗi câu.",
      groupType: "hskk_read_prompt" as any,
      questions: part3Questions,
    },
  ];

  return {
    title: baseTitle,
    level: "HSKK_BEGINNER",
    levelName: "HSKK Sơ cấp (初级)",
    durationMin: 20,
    groups,
  };
}

/**
 * 2. HSKK Trung cấp (中级) - Ghép cùng HSK 4
 * - Phần 1: Nghe rồi nhắc lại (听后重复) - 10 câu (Câu 1-10)
 * - Phần 2: Nhìn tranh nói (看图说话) - 2 tranh (Câu 11, 12, mỗi tranh nói 2 phút)
 * - Phần 3: Trả lời câu hỏi (回答问题) - 2 câu (Câu 13, 14, không pinyin)
 */
export function buildHskkIntermediateTemplate(baseTitle = "Đề thi HSKK Trung cấp"): HskkExamPackage {
  const defaultAudio = "https://res.cloudinary.com/dgyv9ffre/video/upload/v1747123456/hsk_exam_media/sample_listening.mp3";

  // Phần 1: Nghe rồi nhắc lại (10 câu dài hơn)
  const part1Questions: QuestionItem[] = [];
  const part1Texts = [
    "生活就像一面镜子，你对它笑，它就对你笑。",
    "经过大家的共同努力，这次活动举办得非常成功。",
    "他不仅学习成绩优秀，而且经常热心帮助别的同学。",
    "在做决定之前，一定要先考虑清楚可能出现的问题。",
    "由于堵车非常严重，很多乘客不得不选择乘坐地铁。",
    "不管是遇到什么困难，我们都千万不能轻易放弃。",
    "阅读不仅能丰富我们的知识，还能开阔我们的眼界。",
    "虽然平时工作很忙，但他每个周末都会抽出时间陪伴家人。",
    "保护环境是我们每一个人的责任，应该从身边的小事做起。",
    "只有坚持不懈地努力练习，才能真正掌握一门外语。",
  ];

  for (let i = 1; i <= 10; i++) {
    part1Questions.push({
      id: `hskk_int_p1_q${i}`,
      questionNumber: i,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: part1Texts[i - 1],
      audioUrl: defaultAudio,
      points: 3,
      correctAnswer: `Nhắc lại chuẩn xác câu: "${part1Texts[i - 1]}"`,
      explanation: `HSKK Trung cấp Phần 1 (Câu ${i}): Câu nói dài hơn và có liên từ phức hợp (不仅...而且..., 只有...才...). Cần chú ý ngắt nghỉ đúng cụm ngữ pháp.`,
      options: [],
      requiresManualReview: true,
    });
  }

  // Phần 2: Nhìn tranh nói (2 câu tranh)
  const part2Questions: QuestionItem[] = [
    {
      id: `hskk_int_p2_q11`,
      questionNumber: 11,
      type: "speaking_picture",
      skill: "SPEAKING",
      content: "请看图片，结合画面内容说一段完整的话 (建议 1.5 - 2 分钟)。",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
      points: 18,
      correctAnswer: "Miêu tả nhóm bạn trẻ đang thảo luận học tập trong thư viện: biểu cảm vui vẻ, hợp tác, tinh thần học tập.",
      explanation: "HSKK Trung cấp Phần 2 (Câu 11): Quan sát bức tranh và nói liên tục trong 2 phút. Bố cục: Giới thiệu chung bức tranh -> Chi tiết nhân vật, hành động -> Cảm nghĩ của bản thân.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: `hskk_int_p2_q12`,
      questionNumber: 12,
      type: "speaking_picture",
      skill: "SPEAKING",
      content: "请看图片，结合画面内容说一段完整的话 (建议 1.5 - 2 分钟)。",
      imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80",
      points: 18,
      correctAnswer: "Miêu tả khung cảnh gia đình đoàn tụ ăn tối ấm áp: các thành viên trò chuyện, không khí gia đình.",
      explanation: "HSKK Trung cấp Phần 2 (Câu 12): Quan sát bức tranh bữa cơm gia đình và nói trong 2 phút, vận dụng từ ngữ về tình cảm gia đình.",
      options: [],
      requiresManualReview: true,
    },
  ];

  // Phần 3: Trả lời câu hỏi (2 câu, không pinyin)
  const part3Questions: QuestionItem[] = [
    {
      id: `hskk_int_p3_q13`,
      questionNumber: 13,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "有人说“现代人的生活离不开手机”，你同意这种说法吗？为什么？请谈谈你的看法。",
      points: 17,
      correctAnswer: "Nêu quan điểm đồng ý hoặc không đồng ý, đưa ra 2-3 luận điểm (liên lạc, công việc, thanh toán, tiêu cực khi nghiện điện thoại).",
      explanation: "HSKK Trung cấp Phần 3 (Câu 13): Bàn luận về chủ đề điện thoại thông minh trong đời sống hiện đại. Trình bày có mở đầu, thân bài và kết luận.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: `hskk_int_p3_q14`,
      questionNumber: 14,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "你认为找工作时，薪水（工资）和个人兴趣哪一个更重要？请说明你的理由。",
      points: 17,
      correctAnswer: "So sánh giữa lương bổng và sở thích cá nhân khi chọn nghề nghiệp, đưa ra ví dụ thực tế.",
      explanation: "HSKK Trung cấp Phần 3 (Câu 14): Câu hỏi suy nghĩ về định hướng nghề nghiệp, đánh giá khả năng lập luận bằng tiếng Trung.",
      options: [],
      requiresManualReview: true,
    },
  ];

  const groups: ExamSectionGroup[] = [
    {
      id: "hskk_int_group_1",
      title: "Phần 1: Nghe rồi nhắc lại (听后重复 - 10 câu)",
      skill: "SPEAKING",
      instruction: "Thí sinh nghe từng câu ghi âm và nhắc lại chuẩn xác ngữ âm và thanh điệu ngay sau tiếng bíp.",
      audioUrl: defaultAudio,
      groupType: "hskk_listen_repeat" as any,
      questions: part1Questions,
    },
    {
      id: "hskk_int_group_2",
      title: "Phần 2: Nhìn tranh nói (看图说话 - 2 tranh)",
      skill: "SPEAKING",
      instruction: "Thí sinh quan sát bức tranh và nói một đoạn văn hoàn chỉnh từ 1.5 đến 2 phút cho mỗi tranh.",
      groupType: "hskk_picture_speaking" as any,
      questions: part2Questions,
    },
    {
      id: "hskk_int_group_3",
      title: "Phần 3: Trả lời câu hỏi (回答问题 - 2 câu)",
      skill: "SPEAKING",
      instruction: "Đọc câu hỏi trên màn hình và trình bày suy nghĩ, lập luận của bản thân trong 2 phút mỗi câu.",
      groupType: "hskk_read_prompt" as any,
      questions: part3Questions,
    },
  ];

  return {
    title: baseTitle,
    level: "HSKK_INTERMEDIATE",
    levelName: "HSKK Trung cấp (中级)",
    durationMin: 23,
    groups,
  };
}

/**
 * 3. HSKK Cao cấp (高级) - Ghép cùng HSK 5, 6
 * - Phần 1: Nghe rồi thuật lại (听后复述) - 3 đoạn văn ngắn (Câu 1-3)
 * - Phần 2: Đọc to đoạn văn (朗读) - 1 đoạn văn chuẩn ~200 chữ (Câu 4)
 * - Phần 3: Trả lời câu hỏi (回答问题) - 2 câu hỏi chuyên sâu (Câu 5, 6)
 */
export function buildHskkAdvancedTemplate(baseTitle = "Đề thi HSKK Cao cấp"): HskkExamPackage {
  const defaultAudio = "https://res.cloudinary.com/dgyv9ffre/video/upload/v1747123456/hsk_exam_media/sample_listening.mp3";

  // Phần 1: Nghe rồi thuật lại (3 đoạn văn)
  const part1Questions: QuestionItem[] = [
    {
      id: "hskk_adv_p1_q1",
      questionNumber: 1,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: "【Đoạn văn nghe 1】：Một câu chuyện ngụ ngôn về lòng kiên trì và phương pháp làm việc khoa học.",
      audioUrl: defaultAudio,
      points: 14,
      correctAnswer: "Thuật lại trung thực cốt truyện, diễn biến nhân vật và bài học rút ra từ câu chuyện.",
      explanation: "HSKK Cao cấp Phần 1 (Câu 1): Nghe một đoạn văn kể chuyện hoặc thuyết minh, sau đó thuật lại trọn vẹn ý chính trong 2 phút.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: "hskk_adv_p1_q2",
      questionNumber: 2,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: "【Đoạn văn nghe 2】：Bài phỏng vấn một nhà khoa học về xu hướng bảo vệ môi trường và chuyển đổi năng lượng xanh.",
      audioUrl: defaultAudio,
      points: 14,
      correctAnswer: "Tóm tắt các luận điểm: thách thức môi trường hiện nay, giải pháp khoa học và vai trò của cộng đồng.",
      explanation: "HSKK Cao cấp Phần 1 (Câu 2): Nắm bắt các số liệu và thuật ngữ trong bài nói thuyết minh để thuật lại mạch lạc.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: "hskk_adv_p1_q3",
      questionNumber: 3,
      type: "speaking_audio",
      skill: "SPEAKING",
      content: "【Đoạn văn nghe 3】：Một câu chuyện ngắn về sự đồng cảm và trí tuệ cảm xúc trong ứng xử đời thường.",
      audioUrl: defaultAudio,
      points: 14,
      correctAnswer: "Thuật lại tình huống giao tiếp, phản ứng của hai bên và thông điệp nhân văn.",
      explanation: "HSKK Cao cấp Phần 1 (Câu 3): Thuật lại lưu loát, chú ý giọng điệu biểu cảm tự nhiên.",
      options: [],
      requiresManualReview: true,
    },
  ];

  // Phần 2: Đọc to đoạn văn (1 đoạn văn ~200 chữ)
  const part2Questions: QuestionItem[] = [
    {
      id: "hskk_adv_p2_q4",
      questionNumber: 4,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: `每个人在成长的过程中，都会遇到各种各样的挫折与挑战。挫折并不可怕，可怕的是丧失重新站起来的勇气。很多时候，成功与失败的距离，仅仅在于你能否在最艰难的时刻再坚持一下。把困难看作是磨砺意志的石头，在风雨中磨砺自己，才能收获内心的坚韧与从容。只要心中有光，脚下就有方向，我们终将在奋斗中迎来属于自己的曙光。`,
      points: 18,
      correctAnswer: "Đọc to trôi chảy, chuẩn xác từng chữ Hán, không vấp, thanh điệu đúng và diễn cảm tốt.",
      explanation: "HSKK Cao cấp Phần 2 (Câu 4): Thí sinh có 10 phút chuẩn bị chung cho toàn bộ bài thi. Khi ghi âm, đọc to đoạn văn trong 2 phút với tốc độ vừa phải, âm lượng rõ ràng.",
      options: [],
      requiresManualReview: true,
    },
  ];

  // Phần 3: Trả lời câu hỏi (2 câu nghị luận)
  const part3Questions: QuestionItem[] = [
    {
      id: "hskk_adv_p3_q5",
      questionNumber: 5,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "随着人工智能（AI）技术的迅猛发展，有人担心AI最终会取代人类的很多工作。对此你怎么看？请谈谈你的深入思考。",
      points: 20,
      correctAnswer: "Phân tích 2 mặt của AI: tăng năng suất lao động, cơ hội mới, đồng thời chỉ ra các công việc đòi hỏi sáng tạo, cảm xúc và đạo đức con người.",
      explanation: "HSKK Cao cấp Phần 3 (Câu 5): Trình bày bài nói nghị luận logic có cấu trúc trong vòng 2.5 phút.",
      options: [],
      requiresManualReview: true,
    },
    {
      id: "hskk_adv_p3_q6",
      questionNumber: 6,
      type: "speaking_prompt",
      skill: "SPEAKING",
      content: "“读万卷书，行万里路”，请结合你自己的亲身经历，谈谈理论知识与社会实践之间的关系。",
      points: 20,
      correctAnswer: "Lấy ví dụ bản thân về việc học kiến thức trên sách vở và khi cọ xát với thực tế, rút ra sự kết hợp tri hành hợp nhất.",
      explanation: "HSKK Cao cấp Phần 3 (Câu 6): Vận dụng thành ngữ và liên hệ trải nghiệm cá nhân sâu sắc.",
      options: [],
      requiresManualReview: true,
    },
  ];

  const groups: ExamSectionGroup[] = [
    {
      id: "hskk_adv_group_1",
      title: "Phần 1: Nghe rồi thuật lại (听后复述 - 3 đoạn văn)",
      skill: "SPEAKING",
      instruction: "Thí sinh nghe từng đoạn văn và thuật lại tóm tắt nội dung chính trong 2 phút.",
      audioUrl: defaultAudio,
      groupType: "hskk_listen_retell" as any,
      questions: part1Questions,
    },
    {
      id: "hskk_adv_group_2",
      title: "Phần 2: Đọc to đoạn văn (朗读 - 1 đoạn)",
      skill: "SPEAKING",
      instruction: "Đọc to đoạn văn khoảng 200 chữ trên màn hình với phát âm chuẩn xác, trôi chảy và có ngữ điệu.",
      groupType: "hskk_read_prompt" as any,
      questions: part2Questions,
    },
    {
      id: "hskk_adv_group_3",
      title: "Phần 3: Trả lời câu hỏi (回答问题 - 2 câu)",
      skill: "SPEAKING",
      instruction: "Trả lời câu hỏi thảo luận chuyên sâu, trình bày rõ ràng quan điểm và dẫn chứng trong 2.5 phút mỗi câu.",
      groupType: "hskk_read_prompt" as any,
      questions: part3Questions,
    },
  ];

  return {
    title: baseTitle,
    level: "HSKK_ADVANCED",
    levelName: "HSKK Cao cấp (高级)",
    durationMin: 25,
    groups,
  };
}
