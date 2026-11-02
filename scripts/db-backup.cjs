const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('../src/generated/prisma');
const fs = require('node:fs');
const path = require('node:path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Đang tạo bản sao lưu Cơ Sở Dữ Liệu Hanyu ---');

    const [
      users,
      classes,
      classStudents,
      assignments,
      assignmentTargets,
      attempts,
      questions,
      quizSets,
      materials,
      vocabProgress,
      gameSessions,
      xpLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.class.findMany(),
      prisma.classStudent.findMany(),
      prisma.assignment.findMany(),
      prisma.assignmentTarget.findMany(),
      prisma.attempt.findMany({ take: 10000 }),
      prisma.question.findMany({ take: 10000 }),
      prisma.quizSet.findMany(),
      prisma.teachingMaterial.findMany({
        select: {
          id: true,
          teacherId: true,
          title: true,
          description: true,
          fileName: true,
          mimeType: true,
          byteSize: true,
          createdAt: true,
        },
      }),
      prisma.vocabProgress.findMany({ take: 10000 }),
      prisma.gameSession.findMany({ take: 5000 }),
      prisma.xpLog.findMany({ take: 10000 }),
    ]);

    const backupData = {
      system: 'Hanyu HSK Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        classes: classes.length,
        classStudents: classStudents.length,
        assignments: assignments.length,
        attempts: attempts.length,
        questions: questions.length,
        quizSets: quizSets.length,
        materials: materials.length,
        vocabProgress: vocabProgress.length,
        gameSessions: gameSessions.length,
        xpLogs: xpLogs.length,
      },
      data: {
        users,
        classes,
        classStudents,
        assignments,
        assignmentTargets,
        attempts,
        questions,
        quizSets,
        materials,
        vocabProgress,
        gameSessions,
        xpLogs,
      },
    };

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const filePath = path.join(backupDir, `hanyu-backup-${dateStr}_${timeStr}.json`);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

    console.log(`✅ Bản sao lưu đã được tạo thành công tại:`);
    console.log(`📁 ${filePath}`);
    console.log(`📊 Thống kê: ${users.length} tài khoản, ${classes.length} lớp học, ${questions.length} câu hỏi, ${attempts.length} lượt thi.`);
  } catch (error) {
    console.error('❌ Lỗi sao lưu CSDL:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
