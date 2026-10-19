import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Xóa toàn bộ dữ liệu cũ để đồng bộ dữ liệu thật 100%...");
  await prisma.attemptAnswer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.assignmentTarget.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quizSetQuestion.deleteMany();
  await prisma.quizSet.deleteMany();
  await prisma.question.deleteMany();
  await prisma.vocabProgress.deleteMany();
  await prisma.wrongQuestion.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.grammarPoint.deleteMany();
  await prisma.listeningItem.deleteMany();
  await prisma.readingItem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.level.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.xpLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Tạo 3 tài khoản cho 3 role chuẩn...");

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Quản trị viên Hệ thống",
      email: "admin@ningning.edu.vn",
      passwordHash: "admin123",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // 2. Giáo viên (Cô Ning Ning)
  const teacher = await prisma.user.create({
    data: {
      username: "teacher",
      name: "Nguyễn Thảo (Cô Ning Ning)",
      email: "coningning@ningning.edu.vn",
      passwordHash: "teacher123",
      role: "TEACHER",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Học sinh (Em Minh Khang)
  const student = await prisma.user.create({
    data: {
      username: "student",
      name: "Trần Minh Khang",
      email: "student@ningning.edu.vn",
      passwordHash: "student123",
      role: "STUDENT",
      status: "ACTIVE",
      currentHskLevel: 1,
      totalXp: 180,
      streakDays: 4,
    },
  });

  console.log("🏫 Tạo Lớp học HSK 1A...");
  const hskClass = await prisma.class.create({
    data: {
      name: "HSK 1A",
      level: 1,
      teacherId: teacher.id,
      description: "Lớp tiếng Trung HSK 1 cơ bản cô Ning Ning trực tiếp giảng dạy",
    },
  });

  // Gán học sinh vào lớp
  await prisma.classStudent.create({
    data: {
      classId: hskClass.id,
      studentId: student.id,
    },
  });

  console.log("📚 Tạo Giáo trình và Bài học...");
  const curriculum = await prisma.curriculum.create({
    data: {
      title: "Giáo trình chuẩn HSK 3.0 Lớp Cô Ning Ning",
      description: "Lộ trình ôn bài, làm bài tập và thi thử đạt chuẩn",
    },
  });

  const level1 = await prisma.level.create({
    data: {
      curriculumId: curriculum.id,
      hskLevel: 1,
      title: "HSK 1 (Sơ cấp)",
      isOpen: true,
    },
  });

  const lesson5 = await prisma.lesson.create({
    data: {
      levelId: level1.id,
      lessonNumber: 5,
      title: "Bài 5 · 购物 (Mua sắm)",
      description: "Hỏi giá cả, đơn vị tiền tệ và các đồ vật thường dùng",
      status: "PUBLISHED",
    },
  });

  console.log("📖 Tạo Từ vựng thực tế trong Database...");
  const vocabList = [
    {
      lessonId: lesson5.id,
      hanzi: "苹果",
      pinyin: "píngguǒ",
      meaningVi: "Quả táo",
      wordType: "Danh từ",
      exampleHanzi: "我想买三个苹果。",
      examplePinyin: "Wǒ xiǎng mǎi sān gè píngguǒ.",
      exampleMeaning: "Tôi muốn mua ba quả táo.",
    },
    {
      lessonId: lesson5.id,
      hanzi: "多少钱",
      pinyin: "duōshǎo qián",
      meaningVi: "Bao nhiêu tiền",
      wordType: "Cụm từ",
      exampleHanzi: "这个苹果多少钱一斤？",
      examplePinyin: "Zhège píngguǒ duōshǎo qián yì jīn?",
      exampleMeaning: "Táo này bao nhiêu tiền một cân?",
    },
    {
      lessonId: lesson5.id,
      hanzi: "块",
      pinyin: "kuài",
      meaningVi: "Đồng (tệ)",
      wordType: "Lượng từ",
      exampleHanzi: "五块钱一斤。",
      examplePinyin: "Wǔ kuài qián yì jīn.",
      exampleMeaning: "Năm tệ một cân.",
    },
    {
      lessonId: lesson5.id,
      hanzi: "买",
      pinyin: "mǎi",
      meaningVi: "Mua",
      wordType: "Động từ",
      exampleHanzi: "你要买什么？",
      examplePinyin: "Nǐ yào mǎi shénme?",
      exampleMeaning: "Bạn muốn mua cái gì?",
    },
    {
      lessonId: lesson5.id,
      hanzi: "太...了",
      pinyin: "tài...le",
      meaningVi: "Quá... rồi",
      wordType: "Cấu trúc",
      exampleHanzi: "太贵了，便宜一点吧！",
      examplePinyin: "Tài guì le, piányi yìdiǎn ba!",
      exampleMeaning: "Đắt quá rồi, bớt một chút đi!",
    },
  ];

  const createdVocabs = [];
  for (const v of vocabList) {
    const item = await prisma.vocabulary.create({ data: v });
    createdVocabs.push(item);

    // Tạo tiến trình ôn tập Leitner hộp 1 cho học sinh
    await prisma.vocabProgress.create({
      data: {
        studentId: student.id,
        vocabularyId: item.id,
        leitnerBox: 1,
        nextReviewAt: new Date(), // Đến hạn ôn hôm nay
      },
    });
  }

  console.log("❓ Tạo Ngân hàng câu hỏi thực tế trong Database...");
  const questionsData = [
    {
      type: "single_choice",
      content: "Chọn nghĩa tiếng Việt đúng của từ 「苹果」 (píngguǒ):",
      pinyinPrompt: "píngguǒ",
      options: JSON.stringify([
        { id: "A", text: "Quả chuối" },
        { id: "B", text: "Quả táo" },
        { id: "C", text: "Quả dưa hấu" },
        { id: "D", text: "Quả cam" },
      ]),
      correctAnswer: "B",
      explanation: "苹果 (píngguǒ) có nghĩa là Quả táo.",
      skill: "VOCABULARY",
      difficulty: "EASY",
      level: 1,
      tags: "Hoa quả, Mua sắm",
    },
    {
      type: "single_choice",
      content: "Điền từ thích hợp vào chỗ trống: 「这个多少______？」 (Cái này bao nhiêu tiền?)",
      pinyinPrompt: "Zhège duōshǎo ______?",
      options: JSON.stringify([
        { id: "A", text: "点 (diǎn)" },
        { id: "B", text: "钱 (qián)" },
        { id: "C", text: "本 (běn)" },
        { id: "D", text: "个 (gè)" },
      ]),
      correctAnswer: "B",
      explanation: "多少钱 (duōshǎo qián) là mẫu câu hỏi giá tiền: Bao nhiêu tiền?",
      skill: "VOCABULARY",
      difficulty: "EASY",
      level: 1,
      tags: "Mua sắm",
    },
    {
      type: "single_choice",
      content: "Từ nào sau đây mang nghĩa là 「Mua」?",
      pinyinPrompt: "mǎi",
      options: JSON.stringify([
        { id: "A", text: "买 (mǎi)" },
        { id: "B", text: "卖 (mài)" },
        { id: "C", text: "看 (kàn)" },
        { id: "D", text: "去 (qù)" },
      ]),
      correctAnswer: "A",
      explanation: "买 (mǎi - thanh 3) nghĩa là Mua. Phân biệt với 卖 (mài - thanh 4) nghĩa là Bán.",
      skill: "VOCABULARY",
      difficulty: "MEDIUM",
      level: 1,
      tags: "Động từ",
    },
    {
      type: "true_false",
      content: "Câu 「太贵了！」 (Tài guì le!) có nghĩa là 「Rẻ quá!」, đúng hay sai?",
      pinyinPrompt: "Tài guì le!",
      options: JSON.stringify([
        { id: "A", text: "Đúng (对)" },
        { id: "B", text: "Sai (不对)" },
      ]),
      correctAnswer: "B",
      explanation: "Sai. 「贵」 (guì) nghĩa là Đắt. 「太贵了！」 nghĩa là Đắt quá rồi! Rẻ là 「便宜」 (piányi).",
      skill: "READING",
      difficulty: "EASY",
      level: 1,
      tags: "Cảm thán",
    },
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const ques = await prisma.question.create({ data: q });
    createdQuestions.push(ques);
  }

  // 1 Câu sai mẫu để học sinh vào mục "Luyện câu sai" test được ngay
  await prisma.wrongQuestion.create({
    data: {
      studentId: student.id,
      questionId: createdQuestions[2].id, // Câu phân biệt mǎi / mài
      wrongCount: 2,
      consecutiveRight: 0,
    },
  });

  console.log("📝 Tạo Bộ câu hỏi & Bài tập giao cho học sinh...");
  const quizSet = await prisma.quizSet.create({
    data: {
      lessonId: lesson5.id,
      title: "Bài kiểm tra từ vựng Bài 5 · 购物",
      mode: "EXAM",
      totalScore: 100,
    },
  });

  // Gắn 4 câu hỏi vào bộ đề
  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.quizSetQuestion.create({
      data: {
        quizSetId: quizSet.id,
        questionId: createdQuestions[i].id,
        orderIndex: i + 1,
        points: 25.0,
      },
    });
  }

  // Tạo Bài tập đang giao
  const assignment = await prisma.assignment.create({
    data: {
      quizSetId: quizSet.id,
      classId: hskClass.id,
      title: "Bài tập 5: Ôn từ vựng & phản xạ Mua sắm",
      openAt: new Date(),
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Hạn sau 3 ngày
      durationMin: 20,
      maxAttempts: 3,
      mode: "EXAM",
      status: "OPEN",
    },
  });

  // Giao cho học sinh
  await prisma.assignmentTarget.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
    },
  });

  console.log("✨ HOÀN THÀNH TẠO DỮ LIỆU THẬT 100%!");
  console.log("==========================================");
  console.log("🔑 TÀI KHOẢN ĐĂNG NHẬP TEST:");
  console.log("1. HỌC SINH: username: 'student'  | password: 'student123'");
  console.log("2. GIÁO VIÊN: username: 'teacher'  | password: 'teacher123'");
  console.log("3. ADMIN:     username: 'admin'    | password: 'admin123'");
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
