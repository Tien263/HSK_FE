const { PrismaClient } = require('../src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const sets = await prisma.quizSet.findMany({
    where: { mode: 'MOCK_EXAM' },
    select: {
      id: true,
      title: true,
      hskLevel: true,
      totalScore: true,
      _count: { select: { questions: true } }
    }
  });
  console.log('Published Mock Exams in DB:', JSON.stringify(sets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
