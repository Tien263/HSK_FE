const { PrismaClient } = require('../src/generated/prisma/index.js');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const b = JSON.parse(fs.readFileSync('backups/hanyu-backup-2026-11-02_16-43-16.json', 'utf8'));
  const hsk1Sets = b.data.quizSets.filter(q => q.hskLevel === 1);

  console.log(`Found ${hsk1Sets.length} HSK 1 sets in backup.`);

  // Find an admin user to assign teacherId if missing
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  for (const s of hsk1Sets) {
    // Check if this quizSet already exists
    const existing = await prisma.quizSet.findUnique({
      where: { id: s.id }
    });

    if (existing) {
      console.log(`QuizSet ${s.title} (${s.id}) already exists, skipping creation.`);
    } else {
      console.log(`Restoring QuizSet: "${s.title}" (${s.id}) ...`);
      
      // Ensure teacher exists or fallback to admin
      let teacherId = s.teacherId;
      if (teacherId) {
        const tUser = await prisma.user.findUnique({ where: { id: teacherId } });
        if (!tUser) teacherId = admin ? admin.id : null;
      } else {
        teacherId = admin ? admin.id : null;
      }

      await prisma.quizSet.create({
        data: {
          id: s.id,
          title: s.title,
          description: s.description || 'Đề thi thử HSK 1 Chuẩn Quốc Tế do Giáo viên/Admin tải lên.',
          mode: s.mode || 'MOCK_EXAM',
          status: s.status || 'READY',
          hskLevel: 1,
          curriculum: s.curriculum || 'HSK 3.0',
          totalScore: s.totalScore || 200,
          proctorEnabled: true,
          teacherId: teacherId,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date()
        }
      });
    }

    // Now find questions that belong to this set by prefix or matching
    const prefix = s.id.slice(0, 7);
    const questions = await prisma.question.findMany({
      where: {
        id: { startsWith: prefix },
        level: 1
      },
      orderBy: { createdAt: 'asc' }
    });

    if (questions.length > 0) {
      console.log(`  Linking ${questions.length} questions to ${s.id}...`);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        // Check if already linked
        const existingLink = await prisma.quizSetQuestion.findUnique({
          where: {
            quizSetId_questionId: {
              quizSetId: s.id,
              questionId: q.id
            }
          }
        }).catch(() => null);

        if (!existingLink) {
          const points = s.totalScore ? Math.round(s.totalScore / questions.length) : 5;
          await prisma.quizSetQuestion.create({
            data: {
              quizSetId: s.id,
              questionId: q.id,
              orderIndex: i + 1,
              points: points
            }
          }).catch(err => console.warn(`    Could not link question ${q.id}:`, err.message));
        }
      }
    }

    // Ensure publication config exists in AuditLog so it is visible in Mock Exam Center
    const existingPub = await prisma.auditLog.findFirst({
      where: {
        action: 'EXAM_CENTER_PUBLICATION',
        entity: s.id
      }
    });

    if (!existingPub && s.mode === 'MOCK_EXAM') {
      await prisma.auditLog.create({
        data: {
          action: 'EXAM_CENTER_PUBLICATION',
          entity: s.id,
          userId: admin ? admin.id : null,
          details: JSON.stringify({
            approved: true,
            durationMin: 40,
            passScore: 120,
            updatedAt: new Date().toISOString()
          })
        }
      });
      console.log(`  Published ${s.title} to Mock Exam Center.`);
    }
  }

  // Restore the assignment cmvph6lm3000beb2aqr5v97y1 if missing
  const hsk1Assignments = b.data.assignments?.filter(a => a.id === 'cmvph6lm3000beb2aqr5v97y1');
  if (hsk1Assignments && hsk1Assignments.length > 0) {
    const a = hsk1Assignments[0];
    const existingA = await prisma.assignment.findUnique({ where: { id: a.id } });
    if (!existingA) {
      console.log(`Restoring assignment: ${a.title} (${a.id})`);
      await prisma.assignment.create({
        data: {
          id: a.id,
          quizSetId: a.quizSetId,
          classId: a.classId,
          title: a.title,
          openAt: new Date(a.openAt),
          dueAt: new Date(a.dueAt),
          durationMin: a.durationMin || 40,
          maxAttempts: a.maxAttempts || 1,
          mode: a.mode || 'EXAM',
          latePolicy: a.latePolicy || 'ALLOW',
          scoreRule: a.scoreRule || 'BEST',
          status: a.status || 'OPEN',
          createdAt: new Date(a.createdAt)
        }
      }).catch(err => console.warn('Assignment restore warning:', err.message));
    }
  }

  console.log('\n--- RESTORATION FINISHED! ---');
  const allHsk1 = await prisma.quizSet.findMany({
    where: { hskLevel: 1 },
    select: {
      id: true,
      title: true,
      mode: true,
      status: true,
      _count: { select: { questions: true } }
    }
  });
  console.log('All current HSK 1 QuizSets in DB:');
  console.log(JSON.stringify(allHsk1, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
