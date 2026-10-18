import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu cho Lớp tiếng Trung cô Ning Ning...");

  // 1. Tạo Giáo viên Cô Ning Ning (Nguyễn Thảo)
  const teacher = await prisma.user.upsert({
    where: { username: "coningning" },
    update: {},
    create: {
      username: "coningning",
      name: "Nguyễn Thảo (Cô Ning Ning)",
      email: "coningning.tiengtrung@gmail.com",
      passwordHash: "pbkdf2_sha256$hashed_password_ningning",
      role: "TEACHER",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Tạo Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Quản trị viên Hệ thống",
      email: "admin@ningning.edu.vn",
      passwordHash: "pbkdf2_sha256$hashed_password_admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // 3. Tạo các Lớp học
  const classData = [
    { name: "HSK 1A", level: 1, totalStudents: 36, activeCount: 32 },
    { name: "HSK 1B", level: 1, totalStudents: 30, activeCount: 28 },
    { name: "HSK 2A", level: 2, totalStudents: 28, activeCount: 20 },
    { name: "HSK 3A", level: 3, totalStudents: 25, activeCount: 18 },
    { name: "HSK 1C", level: 1, totalStudents: 22, activeCount: 20 },
    { name: "HSK 2B", level: 2, totalStudents: 24, activeCount: 22 },
    { name: "HSK 3B", level: 3, totalStudents: 20, activeCount: 17 },
    { name: "HSK 4A", level: 4, totalStudents: 18, activeCount: 15 },
  ];

  const createdClasses = [];
  for (const c of classData) {
    const cls = await prisma.class.create({
      data: {
        name: c.name,
        level: c.level,
        teacherId: teacher.id,
        description: `Lớp tiếng Trung HSK ${c.level} cô Ning Ning phụ trách`,
      },
    });
    createdClasses.push(cls);
  }

  // 4. Tạo các Học sinh tiêu biểu và gán vào lớp
  const studentData = [
    { name: "Trần Minh Khang", username: "khang.tm", classIdx: 1, atRiskReason: "Thường sai từ vựng 3 bài gần đây" },
    { name: "Lê Gia Hân", username: "han.lg", classIdx: 2, atRiskReason: "Nghe hiểu dưới 50% 2 bài liên tiếp" },
    { name: "Nguyễn Tuấn Kiệt", username: "kiet.nt", classIdx: 3, atRiskReason: "Chưa nộp 2 bài tập quá hạn" },
    { name: "Phạm Mai Linh", username: "linh.pm", classIdx: 0, atRiskReason: "Cần ôn lại ngữ pháp 把字句" },
    { name: "Đỗ Hoàng Long", username: "long.dh", classIdx: 0, atRiskReason: null },
    { name: "Vũ Bảo Ngọc", username: "ngoc.vb", classIdx: 1, atRiskReason: null },
    { name: "Trương Khánh An", username: "an.tk", classIdx: 2, atRiskReason: null },
    { name: "Hoàng Minh Đức", username: "duc.hm", classIdx: 3, atRiskReason: null },
  ];

  const createdStudents = [];
  for (const s of studentData) {
    const student = await prisma.user.create({
      data: {
        username: s.username,
        name: s.name,
        email: `${s.username}@ningning.edu.vn`,
        passwordHash: "pbkdf2_sha256$hashed_student",
        role: "STUDENT",
        status: "ACTIVE",
        totalXp: Math.floor(Math.random() * 500) + 120,
        streakDays: Math.floor(Math.random() * 15) + 3,
      },
    });

    createdStudents.push({ ...student, atRiskReason: s.atRiskReason, classIdx: s.classIdx });

    // Gán vào lớp
    await prisma.classStudent.create({
      data: {
        classId: createdClasses[s.classIdx].id,
        studentId: student.id,
      },
    });
  }

  // 5. Tạo Giáo trình & Cấp độ HSK 1, 2, 3
  const curriculum = await prisma.curriculum.create({
    data: {
      title: "Giáo trình chuẩn HSK 3.0 Lớp Cô Ning Ning",
      description: "Khung đào tạo tích lũy từ vựng, ngữ pháp và đề thi thử",
    },
  });

  const level1 = await prisma.level.create({
    data: {
      curriculumId: curriculum.id,
      hskLevel: 1,
      title: "HSK 1 - Sơ cấp",
      isOpen: true,
    },
  });

  const level2 = await prisma.level.create({
    data: {
      curriculumId: curriculum.id,
      hskLevel: 2,
      title: "HSK 2 - Sơ cấp",
      isOpen: true,
    },
  });

  const level3 = await prisma.level.create({
    data: {
      curriculumId: curriculum.id,
      hskLevel: 3,
      title: "HSK 3 - Sơ cấp",
      isOpen: true,
    },
  });

  // 6. Tạo các Bài học trọng điểm (Bài 4, Bài 5, Bài 6)
  const lesson4 = await prisma.lesson.create({
    data: {
      levelId: level1.id,
      lessonNumber: 4,
      title: "Bài 4 · 家庭 (Gia đình)",
      description: "Học từ vựng và câu hỏi về các thành viên trong gia đình",
      status: "PUBLISHED",
    },
  });

  const lesson5 = await prisma.lesson.create({
    data: {
      levelId: level1.id,
      lessonNumber: 5,
      title: "Bài 5 · 购物 (Mua sắm)",
      description: "Số đếm, đơn vị tiền tệ, mẫu câu hỏi giá và mua hàng",
      status: "PUBLISHED",
    },
  });

  const lesson6 = await prisma.lesson.create({
    data: {
      levelId: level2.id,
      lessonNumber: 6,
      title: "Bài 6 · 旅行 (Du lịch)",
      description: "Hỏi đường, phương tiện giao thông và địa điểm du lịch",
      status: "PUBLISHED",
    },
  });

  // 7. Tạo Từ vựng cho Bài 5 & Bài 4
  const vocabItems = [
    { lessonId: lesson5.id, hanzi: "买", pinyin: "mǎi", meaningVi: "Mua", wordType: "Động từ" },
    { lessonId: lesson5.id, hanzi: "多少钱", pinyin: "duōshǎo qián", meaningVi: "Bao nhiêu tiền", wordType: "Cụm từ" },
    { lessonId: lesson5.id, hanzi: "块", pinyin: "kuài", meaningVi: "Đồng (tệ)", wordType: "Lượng từ" },
    { lessonId: lesson5.id, hanzi: "苹果", pinyin: "píngguǒ", meaningVi: "Quả táo", wordType: "Danh từ" },
    { lessonId: lesson4.id, hanzi: "爸爸", pinyin: "bàba", meaningVi: "Bố", wordType: "Danh từ" },
    { lessonId: lesson4.id, hanzi: "妈妈", pinyin: "māma", meaningVi: "Mẹ", wordType: "Danh từ" },
    { lessonId: lesson4.id, hanzi: "家", pinyin: "jiā", meaningVi: "Gia đình / Nhà", wordType: "Danh từ" },
  ];

  for (const v of vocabItems) {
    await prisma.vocabulary.create({ data: v });
  }

  // 8. Tạo Bộ câu hỏi & Bài kiểm tra
  const quizSet5 = await prisma.quizSet.create({
    data: {
      lessonId: lesson5.id,
      title: "Kiểm tra từ vựng & phản xạ Bài 5 · 购物",
      mode: "EXAM",
      totalScore: 100,
    },
  });

  const quizSet4 = await prisma.quizSet.create({
    data: {
      lessonId: lesson4.id,
      title: "Luyện nghe & nhận diện chữ Hán Bài 4 · 家庭",
      mode: "EXAM",
      totalScore: 100,
    },
  });

  // 9. Tạo các Bài tập đang giao (Khớp 100% với ảnh dashboard của cô)
  const assignments = [
    {
      title: "Bài 5 · 购物 (Từ vựng)",
      quizSetId: quizSet5.id,
      classId: createdClasses[1].id, // HSK 1B
      dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Hạn 16/10
      submittedCount: 24,
      totalCount: 28,
    },
    {
      title: "Ngữ pháp · 把字句",
      quizSetId: quizSet5.id,
      classId: createdClasses[3].id, // HSK 3A
      dueAt: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // Hạn 15/10
      submittedCount: 18,
      totalCount: 25,
    },
    {
      title: "Bài 4 · 家庭 (Nghe hiểu)",
      quizSetId: quizSet4.id,
      classId: createdClasses[0].id, // HSK 1A
      dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hạn 14/10
      submittedCount: 32,
      totalCount: 36,
    },
    {
      title: "Bài 6 · 旅行 (Đọc hiểu)",
      quizSetId: quizSet5.id,
      classId: createdClasses[2].id, // HSK 2A
      dueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Hạn 20/10
      submittedCount: 12,
      totalCount: 28,
    },
  ];

  for (const a of assignments) {
    await prisma.assignment.create({
      data: {
        title: a.title,
        quizSetId: a.quizSetId,
        classId: a.classId,
        dueAt: a.dueAt,
        status: "OPEN",
      },
    });
  }

  console.log("✅ Dữ liệu mẫu đã được nạp thành công vào SQLite!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi nạp dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
