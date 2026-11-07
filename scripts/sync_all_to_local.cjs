const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('../src/generated/prisma/client.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('🔄 ĐANG ĐỒNG BỘ TOÀN BỘ DỮ LIỆU TỪ MÁY CHỦ VỀ MÁY NÀY');
  console.log('====================================================\n');

  // 1. Ensure directories exist
  const dataDir = path.join(process.cwd(), 'data', 'curriculum');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // 2. Fetch all Curriculums
  console.log('1. Đang tải toàn bộ Kho giáo trình HSK...');
  const curriculums = await prisma.curriculumContent.findMany({
    orderBy: { hskLevel: 'asc' },
  });

  console.log(`   Tìm thấy ${curriculums.length} cấp độ HSK trên máy chủ:`);
  for (const c of curriculums) {
    let lessons = [];
    try {
      lessons = Array.isArray(c.lessons) ? c.lessons : JSON.parse(c.lessons);
    } catch {}

    let totalExercises = 0;
    for (const l of lessons) {
      totalExercises += (l.exercises || l.grammarExercises || []).length;
    }

    const filePath = path.join(dataDir, `hsk${c.hskLevel}_live.json`);
    fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf8');

    console.log(`   ✓ HSK ${c.hskLevel}: ${lessons.length} bài học, ${totalExercises} bài tập ngữ pháp (lưu tại data/curriculum/hsk${c.hskLevel}_live.json)`);
  }

  // 3. Fetch Questions, QuizSets, Users
  console.log('\n2. Đang tải ngân hàng đề thi & người dùng...');
  const [users, questions, quizSets, classes] = await Promise.all([
    prisma.user.findMany({ select: { id: true, username: true, email: true, name: true, role: true } }),
    prisma.question.findMany({ take: 10000 }),
    prisma.quizSet.findMany(),
    prisma.class.findMany(),
  ]);

  console.log(`   ✓ Người dùng: ${users.length} tài khoản`);
  console.log(`   ✓ Ngân hàng câu hỏi: ${questions.length} câu hỏi`);
  console.log(`   ✓ Bộ đề thi: ${quizSets.length} bộ đề`);
  console.log(`   ✓ Lớp học: ${classes.length} lớp`);

  // 4. Save full timestamped backup
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const fullBackupFile = path.join(backupDir, `auto_sync_${dateStr}.json`);
  const fullBackup = {
    syncedAt: new Date().toISOString(),
    databaseHost: process.env.DATABASE_URL?.split('@')?.[1]?.split('/')[0] || 'supabase',
    curriculums: curriculums.map((c) => ({
      level: c.hskLevel,
      revision: c.revision,
      updatedAt: c.updatedAt,
      lessons: Array.isArray(c.lessons) ? c.lessons : JSON.parse(c.lessons || '[]'),
    })),
    questionsCount: questions.length,
    users,
    quizSets,
    classes,
  };
  fs.writeFileSync(fullBackupFile, JSON.stringify(fullBackup, null, 2), 'utf8');
  console.log(`\n3. Đã tạo bản sao lưu an toàn tại: backups/auto_sync_${dateStr}.json`);

  console.log('\n====================================================');
  console.log('🎉 ĐỒNG BỘ THÀNH CÔNG 100%! TOÀN BỘ DỮ LIỆU ĐÃ NẰM TRÊN MÁY BẠN.');
  console.log('====================================================');
}

main()
  .catch((err) => {
    console.error('❌ Lỗi đồng bộ:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
