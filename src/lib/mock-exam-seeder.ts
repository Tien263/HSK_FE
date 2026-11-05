import { prisma } from "@/lib/prisma";

export async function seedAuthenticHsk1(teacherId?: string) {
  // Find or use admin
  let authorId = teacherId;
  if (!authorId) {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (!admin) throw new Error("Chưa có tài khoản Quản trị viên.");
    authorId = admin.id;
  }

  // Delete old HSK 1 mock exams
  const oldExams = await prisma.quizSet.findMany({
    where: { hskLevel: 1, mode: "MOCK_EXAM" },
    select: { id: true },
  });

  for (const old of oldExams) {
    await prisma.quizSetQuestion.deleteMany({ where: { quizSetId: old.id } });
    await prisma.auditLog.deleteMany({ where: { entity: old.id } });
    await prisma.quizSet.delete({ where: { id: old.id } });
  }

  // Questions 1 to 5: Listening Part 1 - Image Options A, B, C
  const p1Images = [
    {
      qNum: 1,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q1_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q1_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q1_C.jpg" },
      ],
      correct: "C",
      explanation: "Theo ghi âm HSK 1: Câu 1 tương ứng với hình ảnh C.",
    },
    {
      qNum: 2,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q2_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q2_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q2_C.jpg" },
      ],
      correct: "A",
      explanation: "Theo ghi âm HSK 1: Câu 2 tương ứng với hình ảnh A.",
    },
    {
      qNum: 3,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q3_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q3_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q3_C.jpg" },
      ],
      correct: "B",
      explanation: "Theo ghi âm HSK 1: Câu 3 tương ứng với hình ảnh B.",
    },
    {
      qNum: 4,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q4_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q4_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q4_C.jpg" },
      ],
      correct: "B",
      explanation: "Theo ghi âm HSK 1: Câu 4 tương ứng với hình ảnh B.",
    },
    {
      qNum: 5,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q5_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q5_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q5_C.jpg" },
      ],
      correct: "A",
      explanation: "Theo ghi âm HSK 1: Câu 5 tương ứng với hình ảnh A.",
    },
  ];

  // Questions 6 to 10: Listening Part 2 - True / False
  const p2Questions = [
    {
      qNum: 6,
      content: "第 6 题：看图听录音，判断对错（√ / ×）。",
      correct: "TRUE",
      explanation: "Nội dung ghi âm trùng khớp với hình ảnh miêu tả.",
    },
    {
      qNum: 7,
      content: "第 7 题：看图听录音，判断对错（√ / ×）。",
      correct: "TRUE",
      explanation: "Nội dung ghi âm trùng khớp với hình ảnh miêu tả.",
    },
    {
      qNum: 8,
      content: "第 8 题：看图听录音，判断对错（√ / ×）。",
      correct: "FALSE",
      explanation: "Nội dung ghi âm không trùng khớp với hình ảnh.",
    },
    {
      qNum: 9,
      content: "第 9 题：看图听录音，判断对错（√ / ×）。",
      correct: "TRUE",
      explanation: "Nội dung ghi âm trùng khớp với hình ảnh miêu tả.",
    },
    {
      qNum: 10,
      content: "第 10 题：看图听录音，判断对错（√ / ×）。",
      correct: "FALSE",
      explanation: "Nội dung ghi âm không trùng khớp với hình ảnh.",
    },
  ];

  // Questions 11 to 15: Listening Part 3 - Match with pictures A - F
  const p3Options = [
    { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/listen_p3_A.jpg" },
    { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/listen_p3_B.jpg" },
    { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/listen_p3_C.jpg" },
    { id: "D", text: "D", imageUrl: "/exam-assets/hsk1/listen_p3_D.jpg" },
    { id: "E", text: "E", imageUrl: "/exam-assets/hsk1/listen_p3_E.jpg" },
    { id: "F", text: "F", imageUrl: "/exam-assets/hsk1/listen_p3_F.jpg" },
  ];

  const p3Questions = [
    { qNum: 11, correct: "F", explanation: "Khớp với ngữ cảnh hình F." },
    { qNum: 12, correct: "C", explanation: "Khớp với ngữ cảnh hình C." },
    { qNum: 13, correct: "B", explanation: "Khớp với ngữ cảnh hình B." },
    { qNum: 14, correct: "A", explanation: "Khớp với ngữ cảnh hình A." },
    { qNum: 15, correct: "E", explanation: "Khớp với ngữ cảnh hình E." },
  ];

  // Questions 16 to 20: Listening Part 4 - Dialogue Questions
  const p4Questions = [
    {
      qNum: 16,
      content: "第 16 题：请听对话并选择正确答案。",
      options: [
        { id: "A", text: "上午 (shàngwǔ)" },
        { id: "B", text: "下午 (xiàwǔ)" },
        { id: "C", text: "明天 (míngtiān)" },
      ],
      correct: "C",
      explanation: "Theo ghi âm cuộc thoại, hai người hẹn nhau vào ngày mai (míngtiān).",
    },
    {
      qNum: 17,
      content: "第 17 题：请听对话并选择正确答案。",
      options: [
        { id: "A", text: "去医院 (qù yīyuàn)" },
        { id: "B", text: "去商店 (qù shāngdiàn)" },
        { id: "C", text: "去学校 (qù xuéxiào)" },
      ],
      correct: "B",
      explanation: "Theo ghi âm, người nói định đi cửa hàng mua đồ (qù shāngdiàn).",
    },
    {
      qNum: 18,
      content: "第 18 题：请听对话并选择正确答案。",
      options: [
        { id: "A", text: "喝茶 (hē chá)" },
        { id: "B", text: "吃米饭 (chī mǐfàn)" },
        { id: "C", text: "吃苹果 (chī píngguǒ)" },
      ],
      correct: "A",
      explanation: "Theo ghi âm, nhân vật muốn uống trà (hē chá).",
    },
    {
      qNum: 19,
      content: "第 19 题：请听对话并选择正确答案。",
      options: [
        { id: "A", text: "很冷 (hěn lěng)" },
        { id: "B", text: "很热 (hěn rè)" },
        { id: "C", text: "下雨了 (xià yǔ le)" },
      ],
      correct: "A",
      explanation: "Theo ghi âm, thời tiết hôm nay rất lạnh (hěn lěng).",
    },
    {
      qNum: 20,
      content: "第 20 题：请听对话并选择正确答案。",
      options: [
        { id: "A", text: "李老师 (Lǐ lǎoshī)" },
        { id: "B", text: "王先生 (Wáng xiānsheng)" },
        { id: "C", text: "张小姐 (Zhāng xiǎojiě)" },
      ],
      correct: "B",
      explanation: "Theo ghi âm, nhân vật được hỏi là ông Vương (Wáng xiānsheng).",
    },
  ];

  // Reading Part 1: Q21 to Q25
  const r1Options = [
    { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/read_p1_A.jpg" },
    { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/read_p1_B.jpg" },
    { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/read_p1_C.jpg" },
    { id: "D", text: "D", imageUrl: "/exam-assets/hsk1/read_p1_D.jpg" },
    { id: "E", text: "E", imageUrl: "/exam-assets/hsk1/read_p1_E.jpg" },
    { id: "F", text: "F", imageUrl: "/exam-assets/hsk1/read_p1_F.jpg" },
  ];

  const r1Questions = [
    {
      qNum: 21,
      content: "第 21 题：\nWáng xiānsheng, zàijiàn.\n王 先生 ， 再见 。",
      correct: "F",
      explanation: "Câu 'Chào tạm biệt ông Vương' tương ứng với hình ảnh F (vẫy tay chào tạm biệt).",
    },
    {
      qNum: 22,
      content: "第 22 题：\nTāmen zài kànshū.\n他们 在 看书 。",
      correct: "E",
      explanation: "Câu 'Họ đang đọc sách' tương ứng với hình ảnh E (các bạn nhỏ đang đọc sách).",
    },
    {
      qNum: 23,
      content: "第 23 题：\nZhège píngguǒ hěn dà.\n这个 苹果 很 大 。",
      correct: "D",
      explanation: "Câu 'Quả táo này rất to' tương ứng với hình ảnh D (quả táo).",
    },
    {
      qNum: 24,
      content: "第 24 题：\nTā zài dǎ diànhuà ne.\n他 在 打 电话 呢 。",
      correct: "B",
      explanation: "Câu 'Anh ấy đang nghe điện thoại' tương ứng với hình ảnh B (người đàn ông cầm điện thoại).",
    },
    {
      qNum: 25,
      content: "第 25 题：\nNàge fànguǎnr zài nǎr?\n那个 饭馆儿 在 哪儿 ？",
      correct: "C",
      explanation: "Câu 'Quán ăn đó ở đâu?' tương ứng với hình ảnh C (nhà hàng, quán ăn).",
    },
  ];

  // Reading Part 2: Q26 to Q30 (True/False)
  const r2Questions = [
    {
      qNum: 26,
      content: "第 26 题：\nWǒ xǐhuan chī mǐfàn.\n我 喜欢 吃 米饭 。\n\n★ Tā bù xǐhuan chī mǐfàn.\n★ 他 不 喜欢 吃 米饭 。",
      correct: "FALSE",
      explanation: "Câu đề bài nói 'Tôi thích ăn cơm' (我喜欢吃米饭), nhận định nói 'Anh ấy không thích ăn cơm' -> Sai (×).",
    },
    {
      qNum: 27,
      content: "第 27 题：\nJīntiān tiānqì hěn hǎo, bù lěng yě bù rè.\n今天 天气 很 好 ， 不 冷 也 不 热 。\n\n★ Jīntiān tiānqì bú cuò.\n★ 今天 天气 不 错 。",
      correct: "TRUE",
      explanation: "Thời tiết không lạnh cũng không nóng tức thời tiết rất tốt (不错) -> Đúng (√).",
    },
    {
      qNum: 28,
      content: "第 28 题：\nNàgè yīyuàn lí wǒ jiā hěn yuǎn.\n那个 医院 离 我 家 很 远 。\n\n★ Yīyuàn lí tā jiā hěn jìn.\n★ 医院 离 他 家 很 近 。",
      correct: "FALSE",
      explanation: "Đề bài nói bệnh viện cách nhà rất xa (很远), nhận định nói rất gần (很近) -> Sai (×).",
    },
    {
      qNum: 29,
      content: "第 29 题：\nWǒ yǒu sān gè érzi, tāmen dōu shì xuésheng.\n我 有 三 个 儿子 ， 他们 都 是 学生 。\n\n★ Tā de érzi dōu zài xuéxí.\n★ 他 的 儿子 都 在 学习 。",
      correct: "TRUE",
      explanation: "Các con trai đều là học sinh (都是学生), tức đều đang đi học (都在学习) -> Đúng (√).",
    },
    {
      qNum: 30,
      content: "第 30 题：\nXiànzài shì shí diǎn líng wǔ fēn.\n现在 是 10 点 零 5 分 。\n\n★ Xiànzài shí diǎn le.\n★ 现在 10 点 了 。",
      correct: "TRUE",
      explanation: "10 giờ 05 phút tức là đã 10 giờ rồi -> Đúng (√).",
    },
  ];

  // Reading Part 3: Q31 to Q35 (Matching A to E)
  const r3Options = [
    { id: "A", text: "A: Wǒ bú rènshi tā. (我 不 认识 他 。)" },
    { id: "B", text: "B: Hǎo de, xièxie nǐ! (好 的 ， 谢谢 你 ！)" },
    { id: "C", text: "C: Zài zhuōzi shàng. (在 桌子 上 。)" },
    { id: "D", text: "D: Tā jīnnián shíwǔ suì. (她 今年 十五 岁 。)" },
    { id: "E", text: "E: Wǒ qù mǎi diǎnr shuǐguǒ. (我 去 买 点儿 水果 。)" },
  ];

  const r3Questions = [
    {
      qNum: 31,
      content: "第 31 题：\nNǐ de bēizi zài nǎr?\n你 的 杯子 在 哪儿 ？",
      correct: "C",
      explanation: "Hỏi: 'Cốc của bạn ở đâu?' -> Đáp C: 'Ở trên bàn' (在桌子上).",
    },
    {
      qNum: 32,
      content: "第 32 题：\nTā de nǚ'ér duō dà le?\n她 的 女儿 多 大 了 ？",
      correct: "D",
      explanation: "Hỏi: 'Con gái cô ấy bao nhiêu tuổi rồi?' -> Đáp D: 'Năm nay 15 tuổi' (她今年十五岁).",
    },
    {
      qNum: 33,
      content: "第 33 题：\nNǐ qù shāngdiàn mǎi shénme?\n你 去 商店 买 什么 ？",
      correct: "E",
      explanation: "Hỏi: 'Bạn đi cửa hàng mua cái gì?' -> Đáp E: 'Tôi đi mua chút hoa quả' (我去买点儿水果).",
    },
    {
      qNum: 34,
      content: "第 34 题：\nQǐng hē chá.\n请 喝 茶 。",
      correct: "B",
      explanation: "Lời mời: 'Mời uống trà' -> Đáp B: 'Được, cảm ơn bạn!' (好的，谢谢你！).",
    },
    {
      qNum: 35,
      content: "第 35 题：\nNàgè rén shì shéi?\n那个 人 是 谁 ？",
      correct: "A",
      explanation: "Hỏi: 'Người đó là ai?' -> Đáp A: 'Tôi không quen anh ấy' (我不认识他).",
    },
  ];

  // Reading Part 4: Q36 to Q40 (Short Passages)
  const r4Questions = [
    {
      qNum: 36,
      content: "第 36 题：\nWǒ mǎi le yī běn shū, sānshí kuài qián.\n我 买 了 一 本 书 ， 30 块 钱 。\n\n★ Nà běn shū duōshao qián?\n★ 那 本 书 多少 钱 ？",
      options: [
        { id: "A", text: "13 块 (kuài)" },
        { id: "B", text: "30 块 (kuài)" },
        { id: "C", text: "300 块 (kuài)" },
      ],
      correct: "B",
      explanation: "Giá quyển sách là 30 đồng (30 块钱) -> Đáp án B: 30 块.",
    },
    {
      qNum: 37,
      content: "第 37 题：\nZuótiān xià yǔ le, jīntiān tiānqì hěn hǎo.\n昨天 下 雨 了 ， 今天 天气 很 好 。\n\n★ Jīntiān:\n★ 今天 ：",
      options: [
        { id: "A", text: "下雨 (xià yǔ)" },
        { id: "B", text: "天气好 (tiānqì hǎo)" },
        { id: "C", text: "很冷 (hěn lěng)" },
      ],
      correct: "B",
      explanation: "Hôm nay thời tiết rất tốt: 今天天气很好 -> Đáp án B: 天气好.",
    },
    {
      qNum: 38,
      content: "第 38 题：\nMāma zhōngwǔ zuò le miàntiáor, dàjiā dōu juéde hěn hǎochī.\n妈妈 中午 做 了 面条儿 ， 大家 都 觉得 很 好 吃 。\n\n★ Dàjiā juéde shénme hǎochī?\n★ 大家 觉得 什么 好吃 ？",
      options: [
        { id: "A", text: "包子 (bāozi)" },
        { id: "B", text: "面包 (miànbāo)" },
        { id: "C", text: "面条儿 (miàntiáor)" },
      ],
      correct: "C",
      explanation: "Mẹ trưa nay làm mì sợi (面条儿), mọi người đều thấy ngon -> Đáp án C: 面条儿.",
    },
    {
      qNum: 39,
      content: "第 39 题：\nBā diǎn tài zǎo le, wǒmen jiǔ diǎn bàn jiàn ba.\n八 点 太 早 了 ， 我们 九 点 半 见 吧 。\n\n★ Tā xiǎng jǐ diǎn jiàn?\n★ 他 想 几 点 见 ？",
      options: [
        { id: "A", text: "8:00" },
        { id: "B", text: "9:00" },
        { id: "C", text: "9:30" },
      ],
      correct: "C",
      explanation: "Người nói đề xuất: 九点半见 (9 giờ rưỡi gặp) -> Đáp án C: 9:30.",
    },
    {
      qNum: 40,
      content: "第 40 题：\nWǒ jiějie shì yīshēng, tā gōngzuò hěn máng.\n我 姐姐 是 医生 ， 她 工作 很 忙 。\n\n★ Jiějie:\n★ 姐姐 ：",
      options: [
        { id: "A", text: "工作忙 (gōngzuò máng)" },
        { id: "B", text: "还在读书 (hái zài dúshū)" },
        { id: "C", text: "到国外了 (dào guówài le)" },
      ],
      correct: "A",
      explanation: "Chị gái là bác sĩ, công việc rất bận: 工作很忙 -> Đáp án A: 工作忙.",
    },
  ];

  // Aggregate all questions
  const allQuestionsData: any[] = [];

  // Q1-5
  for (const q of p1Images) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "listening_choice",
      content: `第 ${q.qNum} 题：请听录音并选择符合内容的图片。`,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      audioUrl: "/audio/hsk1_exam.mp3",
      options: q.options,
    });
  }

  // Q6-10
  for (const q of p2Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "true_false",
      content: q.content,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      audioUrl: "/audio/hsk1_exam.mp3",
      options: [
        { id: "TRUE", text: "√ 对 (Đúng)" },
        { id: "FALSE", text: "× 错 (Sai)" },
      ],
    });
  }

  // Q11-15
  for (const q of p3Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "matching",
      content: `第 ${q.qNum} 题：请听对话并与图片（A - F）进行匹配。`,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      audioUrl: "/audio/hsk1_exam.mp3",
      options: p3Options,
    });
  }

  // Q16-20
  for (const q of p4Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "multiple_choice",
      content: q.content,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      audioUrl: "/audio/hsk1_exam.mp3",
      options: q.options,
    });
  }

  // Q21-25
  for (const q of r1Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "multiple_choice",
      content: q.content,
      skill: "READING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: r1Options,
    });
  }

  // Q26-30
  for (const q of r2Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "true_false",
      content: q.content,
      skill: "READING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: [
        { id: "TRUE", text: "√ 对 (Đúng)" },
        { id: "FALSE", text: "× 错 (Sai)" },
      ],
    });
  }

  // Q31-35
  for (const q of r3Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "multiple_choice",
      content: q.content,
      skill: "READING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: r3Options,
    });
  }

  // Q36-40
  for (const q of r4Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "multiple_choice",
      content: q.content,
      skill: "READING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: q.options,
    });
  }

  // Create the authentic QuizSet
  const createdSet = await prisma.quizSet.create({
    data: {
      title: "HSK 1 · Đề thi mẫu CTI Chuẩn 01 (Chính thức)",
      description: "Đề thi mô phỏng chính thức HSK 1 theo chuẩn HSK 3.0 của CTI / Hanban (40 câu: 20 Nghe + 20 Đọc, có audio và ảnh minh họa gốc).",
      hskLevel: 1,
      mode: "MOCK_EXAM",
      status: "READY",
      totalScore: 200,
      teacherId: authorId,
      questions: {
        create: allQuestionsData.map((q) => ({
          orderIndex: q.orderIndex,
          points: q.points,
          question: {
            create: {
              type: q.type,
              skill: q.skill || (q.orderIndex <= 20 ? "LISTENING" : "READING"),
              level: 1,
              difficulty: "MEDIUM",
              content: q.content,
              pinyinPrompt: "",
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              audioUrl: q.audioUrl || "",
              imageUrl: "",
              options: JSON.stringify(q.options || []),
              editorData: {
                options: q.options || [],
                status: "READY",
                audioUrl: q.audioUrl || "",
                pinyin: "",
              },
            },
          },
        })),
      },
    },
  });

  // Create publication audit log
  await prisma.auditLog.create({
    data: {
      userId: authorId,
      action: "EXAM_CENTER_PUBLICATION",
      entity: createdSet.id,
      details: JSON.stringify({
        approved: true,
        durationMin: 40,
        passScore: 120,
      }),
    },
  });

  return { success: true, quizSetId: createdSet.id, questionsCount: allQuestionsData.length };
}
