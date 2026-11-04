const { PrismaClient } = require('../src/generated/prisma/index.js');
const { getHsk1Questions, getHsk2Questions, getHsk3Questions } = require('./generate-hsk-sample-json.cjs');
const prisma = new PrismaClient();

async function main() {
  console.log('--- BẮT ĐẦU DỌN DẸP VÀ SEED ĐỀ THI HSK 3.0 CHUẨN ---');

  // 1. Dọn sạch mock exam cũ
  const oldSets = await prisma.quizSet.findMany({
    where: { mode: 'MOCK_EXAM' },
    select: { id: true }
  });
  const oldIds = oldSets.map(s => s.id);
  if (oldIds.length > 0) {
    console.log(`Đang xóa ${oldIds.length} bộ đề MOCK_EXAM cũ...`);
    await prisma.quizSetQuestion.deleteMany({ where: { quizSetId: { in: oldIds } } });
    await prisma.assignment.deleteMany({ where: { quizSetId: { in: oldIds } } });
    await prisma.quizSet.deleteMany({ where: { id: { in: oldIds } } });
  }

  // Xóa các logs thi thử cũ để làm sạch phòng thi
  const deletedLogs = await prisma.auditLog.deleteMany({
    where: { action: { in: ['EXAM_CENTER_ATTEMPT', 'EXAM_CENTER_PAPER', 'EXAM_CENTER_PUBLICATION'] } }
  });
  console.log(`Đã xóa ${deletedLogs.count} bản ghi audit logs thi thử cũ.`);

  // 2. Tìm Admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true }
  });
  if (!admin) {
    throw new Error('Không tìm thấy tài khoản ADMIN trong hệ thống.');
  }
  console.log(`Tìm thấy Admin: ${admin.name} (${admin.email})`);

  const examsToSeed = [
    {
      level: 1,
      title: 'Đề thi thử chuẩn HSK 1 (CTI / Hanban 样卷)',
      description: 'Đề thi mô phỏng chính thức HSK 1 theo chuẩn HSK 3.0 (40 câu: 20 Nghe + 20 Đọc), có audio đầy đủ.',
      durationMin: 40,
      passScore: 120,
      totalScore: 200,
      questions: getHsk1Questions()
    },
    {
      level: 2,
      title: 'Đề thi thử chuẩn HSK 2 (CTI / Hanban 样卷)',
      description: 'Đề thi mô phỏng chính thức HSK 2 theo chuẩn HSK 3.0 (60 câu: 25 Nghe + 25 Đọc + 10 Viết), có audio đầy đủ.',
      durationMin: 60,
      passScore: 120,
      totalScore: 200,
      questions: getHsk2Questions()
    },
    {
      level: 3,
      title: 'Đề thi thử chuẩn HSK 3 (CTI / Hanban 样卷)',
      description: 'Đề thi mô phỏng chính thức HSK 3 theo chuẩn HSK 3.0 (70 câu: 30 Nghe + 30 Đọc + 10 Viết, 83 phút, 300 điểm), có audio đầy đủ.',
      durationMin: 83,
      passScore: 180,
      totalScore: 300,
      questions: getHsk3Questions()
    }
  ];

  for (const exam of examsToSeed) {
    console.log(`Đang tạo ${exam.title} (${exam.questions.length} câu)...`);
    const createdSet = await prisma.quizSet.create({
      data: {
        title: exam.title,
        description: exam.description,
        hskLevel: exam.level,
        mode: 'MOCK_EXAM',
        status: 'READY',
        totalScore: exam.totalScore,
        teacherId: admin.id,
        questions: {
          create: exam.questions.map((q, idx) => ({
            orderIndex: idx + 1,
            points: q.points,
            question: {
              create: {
                type: q.type,
                content: q.content,
                skill: q.skill,
                level: exam.level,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                options: JSON.stringify(q.options || []),
                audioUrl: q.audioUrl || null,
                imageUrl: q.imageUrl || null,
                editorData: {
                  status: 'READY',
                  pinyin: q.pinyin || '',
                  audioUrl: q.audioUrl || '',
                  imageUrl: q.imageUrl || '',
                  options: q.options || []
                }
              }
            }
          }))
        }
      }
    });

    // Tạo publication
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'EXAM_CENTER_PUBLICATION',
        entity: createdSet.id,
        details: JSON.stringify({
          approved: true,
          durationMin: exam.durationMin,
          passScore: exam.passScore
        })
      }
    });

    console.log(`-> Tạo và xuất bản thành công ${exam.title} (ID: ${createdSet.id})`);
  }

  console.log('--- HOÀN TẤT SEED ĐỀ THI HSK 3.0 THÀNH CÔNG ---');
}

main().catch(err => {
  console.error('Lỗi khi seed đề thi:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
