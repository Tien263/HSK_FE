const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete any lingering test students
  const delStudents = await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'nam_hsk2_' } },
        { username: { startsWith: 'student_test_' } },
        { username: { startsWith: 'sim_hs_' } }
      ]
    }
  });
  console.log('Cleaned test students:', delStudents.count);

  // Delete any lingering junk test classes
  const delClasses = await prisma.class.deleteMany({
    where: {
      name: { startsWith: 'Lớp HSK 2 Cấp Tốc - K' }
    }
  });
  console.log('Cleaned junk test classes:', delClasses.count);

  // List all classes
  const classes = await prisma.class.findMany({
    include: {
      students: { include: { student: true } },
      teacher: true,
      assignments: true
    }
  });
  console.log('--- ALL REMAINING CLASSES (' + classes.length + ') ---');
  for (const c of classes) {
    console.log(`Class [${c.id}] "${c.name}" (Level HSK ${c.level}) - Teacher: ${c.teacher?.name} (@${c.teacher?.username}) - Students: ${c.students?.length}`);
    for (const s of c.students) {
      console.log(`  └─ Student: ${s.student?.name} (@${s.student?.username})`);
    }
  }

  // List all users
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, createdAt: true }
  });
  console.log('--- ALL USERS (' + users.length + ') ---');
  for (const u of users) {
    console.log(`User [${u.id}] @${u.username} (${u.name}) - Role: ${u.role}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
