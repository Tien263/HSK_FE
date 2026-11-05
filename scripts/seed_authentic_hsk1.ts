import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Authentic HSK 1 Official Exam...");

  // Find admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    throw new Error("No admin user found to author official exams.");
  }

  // Find old CTI HSK 1 exam only, never delete user-uploaded exams
  const oldExams = await prisma.quizSet.findMany({
    where: {
      hskLevel: 1,
      mode: "MOCK_EXAM",
      title: { contains: "CTI Chuẩn 01" }
    },
  });

  for (const old of oldExams) {
    console.log("Replacing old CTI HSK 1 quizSet:", old.id, old.title);
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
      correct: "A",
      explanation: "Theo ghi âm HSK 1: Câu 4 tương ứng với hình ảnh A.",
    },
    {
      qNum: 5,
      options: [
        { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/q5_A.jpg" },
        { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/q5_B.jpg" },
        { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/q5_C.jpg" },
      ],
      correct: "C",
      explanation: "Theo ghi âm HSK 1: Câu 5 tương ứng với hình ảnh C.",
    },
  ];

  // Questions 6 to 10: Listening Part 2 - Choose text options
  const p2Questions = [
    {
      qNum: 6,
      content: "第 6 题：请听录音并选择正确答案。",
      options: [
        { id: "A", text: "星期四 (xīngqīsì)" },
        { id: "B", text: "三块钱 (sān kuài qián)" },
        { id: "C", text: "五口人 (wǔ kǒu rén)" },
      ],
      correct: "C",
      explanation: "Theo đoạn ghi âm: Câu hỏi về số lượng người trong gia đình -> 五口人.",
    },
    {
      qNum: 7,
      content: "第 7 题：请听录音并选择正确答案。",
      options: [
        { id: "A", text: "前边 (qiánbian)" },
        { id: "B", text: "做饭 (zuò fàn)" },
        { id: "C", text: "不客气 (bú kèqi)" },
      ],
      correct: "A",
      explanation: "Theo đoạn ghi âm: Đáp án vị trí 前边.",
    },
    {
      qNum: 8,
      content: "第 8 题：请听录音并选择正确答案。",
      options: [
        { id: "A", text: "不会 (bú huì)" },
        { id: "B", text: "写字 (xiě zì)" },
        { id: "C", text: "昨天晚上 (zuótiān wǎnshang)" },
      ],
      correct: "A",
      explanation: "Theo đoạn ghi âm: Đáp án trả lời phủ định 不会.",
    },
    {
      qNum: 9,
      content: "第 9 题：请听录音并选择正确答案。",
      options: [
        { id: "A", text: "好玩儿 (hǎowánr)" },
        { id: "B", text: "玩电脑 (wán diànnǎo)" },
        { id: "C", text: "上大学了 (shàng dàxué le)" },
      ],
      correct: "B",
      explanation: "Theo đoạn ghi âm: Hành động đang làm là 玩电脑.",
    },
    {
      qNum: 10,
      content: "第 10 题：请听录音并选择正确答案。",
      options: [
        { id: "A", text: "汉语课 (Hànyǔ kè)" },
        { id: "B", text: "男学生 (nán xuésheng)" },
        { id: "C", text: "我也不认识 (wǒ yě bú rènshi)" },
      ],
      correct: "C",
      explanation: "Theo đoạn ghi âm: Người nói đáp lại 我也不认识.",
    },
  ];

  // Questions 11 to 15: Listening Part 3 - Picture matching A to F
  const p3Photos = [
    { id: "A", text: "A", imageUrl: "/exam-assets/hsk1/listen_p3_A.jpg" },
    { id: "B", text: "B", imageUrl: "/exam-assets/hsk1/listen_p3_B.jpg" },
    { id: "C", text: "C", imageUrl: "/exam-assets/hsk1/listen_p3_C.jpg" },
    { id: "D", text: "D", imageUrl: "/exam-assets/hsk1/listen_p3_D.jpg" },
    { id: "E", text: "E", imageUrl: "/exam-assets/hsk1/listen_p3_E.jpg" },
    { id: "F", text: "F", imageUrl: "/exam-assets/hsk1/listen_p3_F.jpg" },
  ];
  const p3Questions = [
    { qNum: 11, correct: "E", explanation: "Theo đoạn đối thoại: Hình ảnh phù hợp là E." },
    { qNum: 12, correct: "F", explanation: "Theo đoạn đối thoại: Hình ảnh phù hợp là F." },
    { qNum: 13, correct: "B", explanation: "Theo đoạn đối thoại: Hình ảnh phù hợp là B." },
    { qNum: 14, correct: "D", explanation: "Theo đoạn đối thoại: Hình ảnh phù hợp là D." },
    { qNum: 15, correct: "A", explanation: "Theo đoạn đối thoại: Hình ảnh phù hợp là A." },
  ];

  // Questions 16 to 20: Listening Part 4 - Dialogue & Questions
  const p4Questions = [
    {
      qNum: 16,
      content: "第 16 题：请听对话并回答问题。",
      options: [
        { id: "A", text: "病了 (bìng le)" },
        { id: "B", text: "没来上学 (méi lái shàngxué)" },
        { id: "C", text: "不想睡觉 (bù xiǎng shuìjiào)" },
      ],
      correct: "A",
      explanation: "Theo đoạn hội thoại: Tình trạng của nhân vật là 病了.",
    },
    {
      qNum: 17,
      content: "第 17 题：请听对话并回答问题。",
      options: [
        { id: "A", text: "卖车 (mài chē)" },
        { id: "B", text: "打电话 (dǎ diànhuà)" },
        { id: "C", text: "找手机 (zhǎo shǒujī)" },
      ],
      correct: "B",
      explanation: "Theo đoạn hội thoại: Hành động nhân vật đang làm là 打电话.",
    },
    {
      qNum: 18,
      content: "第 18 题：请听对话并回答问题。",
      options: [
        { id: "A", text: "很新 (hěn xīn)" },
        { id: "B", text: "太贵了 (tài guì le)" },
        { id: "C", text: "不好看 (bù hǎokàn)" },
      ],
      correct: "C",
      explanation: "Theo đoạn hội thoại: Đánh giá về đồ vật là 不好看.",
    },
    {
      qNum: 19,
      content: "第 19 题：请听对话并回答问题。",
      options: [
        { id: "A", text: "学校里边 (xuéxiào lǐbian)" },
        { id: "B", text: "医院后边 (yīyuàn hòubian)" },
        { id: "C", text: "超市后面 (chāoshì hòumiàn)" },
      ],
      correct: "A",
      explanation: "Theo đoạn hội thoại: Địa điểm được nhắc đến là 学校里边.",
    },
    {
      qNum: 20,
      content: "第 20 题：请听对话并回答问题。",
      options: [
        { id: "A", text: "一个月 (yí gè yuè)" },
        { id: "B", text: "三个月 (sān gè yuè)" },
        { id: "C", text: "六个月 (liù gè yuè)" },
      ],
      correct: "C",
      explanation: "Theo đoạn hội thoại: Khoảng thời gian chính xác là 六个月.",
    },
  ];

  // Questions 21 to 25: Reading Part 1 - Sentences with Photos A to F
  const r1Photos = [
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
      content: "第 22 题：\nDìdi hěn ài chànggē.\n弟弟 很 爱 唱 歌 。",
      correct: "A",
      explanation: "Câu 'Em trai rất thích hát' tương ứng với hình ảnh A (cậu bé đang hát).",
    },
    {
      qNum: 23,
      content: "第 23 题：\nZǎofàn chī jīdàn hé niúnǎi, zěnmeyàng?\n早饭 吃 鸡蛋 和 牛奶 ， 怎么样 ？",
      correct: "D",
      explanation: "Câu 'Bữa sáng ăn trứng gà và sữa bò, thấy thế nào?' tương ứng với hình ảnh D (trứng và sữa).",
    },
    {
      qNum: 24,
      content: "第 24 题：\nJīntiān shì mèimei shàng xiǎoxué de dì-yī tiān.\n今天 是 妹妹 上 小学 的 第一 天 。",
      correct: "B",
      explanation: "Câu 'Hôm nay là ngày đầu tiên em gái vào học tiểu học' tương ứng với hình ảnh B (bé gái đeo cặp sách).",
    },
    {
      qNum: 25,
      content: "第 25 题：\nZǎoshang xiàyǔ le, yǒudiǎnr lěng.\n早上 下 雨 了 ， 有点儿 冷 。",
      correct: "C",
      explanation: "Câu 'Buổi sáng trời mưa rồi, có chút lạnh' tương ứng với hình ảnh C (trời mưa cầm ô).",
    },
  ];

  // Questions 26 to 30: Reading Part 2 - Q&A Matching A to F
  const r2Options = [
    { id: "A", text: "A: 2500 元。 (2500 yuán.)" },
    { id: "B", text: "B: 坐出租车。 (Zuò chūzūchē.)" },
    { id: "C", text: "C: 十岁了。 (Shí suì le.)" },
    { id: "D", text: "D: 我女朋友。 (Wǒ nǚpéngyou.)" },
    { id: "E", text: "E: 没关系。 (Méi guānxi.)" },
    { id: "F", text: "F: 好的，谢谢！ (Hǎo de, xièxie!)" },
  ];
  const r2Questions = [
    {
      qNum: 26,
      content: "第 26 题：\nTā shì shéi?\n她 是 谁 ？",
      correct: "D",
      explanation: "Hỏi 'Cô ấy là ai?' -> Đáp án phù hợp nhất là D: 我女朋友 (Bạn gái tôi).",
    },
    {
      qNum: 27,
      content: "第 27 题：\nDuìbuqǐ.\n对不起 。",
      correct: "E",
      explanation: "Lời xin lỗi '对不起' -> Lời đáp chuẩn là E: 没关系 (Không có gì/Không sao đâu).",
    },
    {
      qNum: 28,
      content: "第 28 题：\nNǐ nǚ'ér duō dà le?\n你 女儿 多 大 了 ？",
      correct: "C",
      explanation: "Hỏi tuổi 'Con gái bạn bao nhiêu tuổi rồi?' -> Đáp án C: 十岁了 (Mười tuổi rồi).",
    },
    {
      qNum: 29,
      content: "第 29 题：\nNǐ zěnme huí xuéxiào?\n你 怎么 回 学校 ？",
      correct: "B",
      explanation: "Hỏi phương tiện 'Bạn về trường bằng cách nào?' -> Đáp án B: 坐出租车 (Đi xe taxi).",
    },
    {
      qNum: 30,
      content: "第 30 题：\nQǐngwèn, zhège diànshì duōshao qián?\n请问 ， 这个 电视 多少 钱 ？",
      correct: "A",
      explanation: "Hỏi giá tiền 'Xin hỏi chiếc TV này bao nhiêu tiền?' -> Đáp án A: 2500 元.",
    },
  ];

  // Questions 31 to 35: Reading Part 3 - Fill in Blanks from Word Bank
  const r3Options = [
    { id: "A", text: "A: 上午 (shàngwǔ)" },
    { id: "B", text: "B: 漂亮 (piàoliang)" },
    { id: "C", text: "C: 休息 (xiūxi)" },
    { id: "D", text: "D: 叫 (jiào)" },
    { id: "E", text: "E: 事 (shì)" },
    { id: "F", text: "F: 很 (hěn)" },
  ];
  const r3Questions = [
    {
      qNum: 31,
      content: "第 31 题：\nJīntiān shūdiàn li yǒu （ ） duō xiǎopéngyǒu.\n今天 书店 里 有 （ ） 多 小朋友 。",
      correct: "F",
      explanation: "Cần phó từ chỉ mức độ trước '多': 有很多小朋友 -> Chọn F: 很.",
    },
    {
      qNum: 32,
      content: "第 32 题：\nTāmen （ ） xuéle Zhōngwén.\n他们 （ ） 学了 中文 。",
      correct: "A",
      explanation: "Cần từ chỉ thời gian đứng trước vị ngữ: 他们上午学了中文 -> Chọn A: 上午.",
    },
    {
      qNum: 33,
      content: "第 33 题：\nWǒ juéde dì-èr gè bēizi （ ）， mǎi nàge ba.\n我 觉得 第二 个 杯子 （ ）， 买 那个 吧 。",
      correct: "B",
      explanation: "Cần tính từ khen ngợi đồ vật 'chiếc cốc thứ hai rất đẹp': 漂亮 -> Chọn B: 漂亮.",
    },
    {
      qNum: 34,
      content: "第 34 题：\nXiàkè le, tóngxuémen （ ） yíxià.\n下课 了 ， 同学们 （ ） 一下 。",
      correct: "C",
      explanation: "Tan học rồi, các bạn học sinh nghỉ ngơi một lát: 休息一下 -> Chọn C: 休息.",
    },
    {
      qNum: 35,
      content: "第 35 题：\nA: Nǐ shuō shénme? Wǒ méi tīngjiàn.\n   你 说 什么 ？ 我 没 听见 。\nB: Wǒ shuō, wǒ míngtiān báitiān yǒu （ ）， bù néng lái le.\n   我 说 ， 我 明天 白天 有 （ ）， 不 能 来 了 。",
      correct: "E",
      explanation: "Có việc bận vào ban ngày: 有事 -> Chọn E: 事.",
    },
  ];

  // Questions 36 to 40: Reading Part 4 - Passages & Comprehension
  const r4Questions = [
    {
      qNum: 36,
      content: "第 36 题：\nTā jiào Duōduo, shì wǒ de hǎopéngyou, yě shì wǒ de jiārén.\n它 叫 多多 ， 是 我 的 好朋友 ， 也 是 我 的 家人 。\n\n★ “Duōduo” shì:\n★ “多多” 是 ：",
      options: [
        { id: "A", text: "小学生 (xiǎoxuéshēng)" },
        { id: "B", text: "他的家人 (tā de jiārén)" },
        { id: "C", text: "他男朋友 (tā nánpéngyou)" },
      ],
      correct: "B",
      explanation: "Đoạn văn ghi rõ: '也是我的家人' -> Đáp án B.",
    },
    {
      qNum: 37,
      content: "第 37 题：\nWǒ xīngqītiān bú shàngbān, yào hé háizi qù kàn diànyǐng.\n我 星期天 不 上班 ， 要 和 孩子 去 看 电影 。\n\n★ Tā xīngqītiān yào:\n★ 他 星期天 要 ：",
      options: [
        { id: "A", text: "上班 (shàngbān)" },
        { id: "B", text: "看电影 (kàn diànyǐng)" },
        { id: "C", text: "见同学 (jiàn tóngxué)" },
      ],
      correct: "B",
      explanation: "Đoạn văn nêu: Chủ nhật không đi làm, muốn đi xem phim cùng con -> Đáp án B: 看电影.",
    },
    {
      qNum: 38,
      content: "第 38 题：\nMāma zhōngwǔ zuòle miàntiáor, dàjiā dōu juéde hǎochī.\n妈妈 中午 做了 面条儿 ， 大家 都 觉得 好吃 。\n\n★ Dàjiā juéde shénme hǎochī?\n★ 大家 觉得 什么 好吃 ？",
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

  // Assemble all 40 questions
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
      options: q.options,
      audioUrl: "/audio/hsk1_exam.mp3",
    });
  }

  // Q6-10
  for (const q of p2Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "listening_choice",
      content: q.content,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: q.options,
      audioUrl: "/audio/hsk1_exam.mp3",
    });
  }

  // Q11-15
  for (const q of p3Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "listening_choice",
      content: `第 ${q.qNum} 题：请听对话并选择对应的图片（A～F）。`,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: p3Photos,
      audioUrl: "/audio/hsk1_exam.mp3",
    });
  }

  // Q16-20
  for (const q of p4Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "listening_choice",
      content: q.content,
      skill: "LISTENING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: q.options,
      audioUrl: "/audio/hsk1_exam.mp3",
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
      options: r1Photos,
    });
  }

  // Q26-30
  for (const q of r2Questions) {
    allQuestionsData.push({
      orderIndex: q.qNum,
      points: 5,
      type: "multiple_choice",
      content: q.content,
      skill: "READING",
      level: 1,
      correctAnswer: q.correct,
      explanation: q.explanation,
      options: r2Options,
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
      teacherId: admin.id,
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
      userId: admin.id,
      action: "EXAM_CENTER_PUBLICATION",
      entity: createdSet.id,
      details: JSON.stringify({
        approved: true,
        durationMin: 40,
        passScore: 120,
      }),
    },
  });

  console.log(`Successfully created authentic HSK 1 exam: ${createdSet.id} with ${allQuestionsData.length} questions!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
