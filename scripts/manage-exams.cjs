const { PrismaClient } = require('../src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const row = await prisma.auditLog.findUnique({
    where: { id: 'exam_f3723edd-5f85-4ea1-9672-e9dcd8757470' }
  });
  const data = JSON.parse(row.details);
  console.log('details.paper.questions length:', data.paper.questions.length);
  for (let i = 0; i < data.paper.questions.length; i++) {
    const q = data.paper.questions[i];
    if (!q.content || !q.type || !q.skill || q.points === undefined) {
      console.log('SUSPICIOUS QUESTION at index', i, q);
    }
  }
  console.log('Checked all questions in attempt.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
