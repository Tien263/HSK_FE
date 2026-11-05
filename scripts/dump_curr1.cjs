const { PrismaClient } = require('../src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const row = await prisma.curriculumContent.findUnique({
    where: { hskLevel: 1 }
  });

  if (!row) {
    console.log('No CurriculumContent found for HSK 1');
    return;
  }

  console.log(`Revision: ${row.revision}, isDeleted: ${row.isDeleted}, updatedAt: ${row.updatedAt}`);
  const lessons = row.lessons || [];
  console.log(`Lessons count: ${lessons.length}`);
  
  lessons.forEach((l, i) => {
    console.log(`\n--- BÀI ${i + 1} ---`);
    console.log(`ID: ${l.id}`);
    console.log(`Title Zh: ${l.titleZh || l.title || ''}`);
    console.log(`Title Vi: ${l.titleVi || ''}`);
    console.log(`Pinyin: ${l.pinyin || ''}`);
    console.log(`Vocab: ${(l.vocabList || []).length} items`);
    if (l.vocabList && l.vocabList.length > 0) {
      console.log(`  Sample vocab:`, l.vocabList.slice(0, 3).map(v => `${v.word || v.zh || ''} (${v.meaning || v.vi || ''})`).join(', '));
    }
    console.log(`Grammar: ${(l.grammarList || []).length} points`);
    console.log(`Exercises: ${(l.grammarExercises || []).length} questions`);
    if (l.grammarExercises && l.grammarExercises.length > 0) {
      console.log(`  Sample exercise:`, l.grammarExercises[0].prompt);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
