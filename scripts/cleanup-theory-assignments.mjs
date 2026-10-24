import { PrismaClient } from "../src/generated/prisma/index.js";
const prisma = new PrismaClient();
async function clean() {
  const res = await prisma.assignment.deleteMany({
    where: {
      OR: [
        { title: { startsWith: "Học phần lý thuyết:" } },
        { title: { contains: "Xin chào AI Tiểu Ngữ" } },
      ],
    },
  });
  console.log("Cleaned legacy theory assignments:", res.count);
  await prisma.$disconnect();
}
clean();
