import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        enrolledClasses: {
          include: { class: true },
        },
        _count: {
          select: {
            attempts: true,
            wrongQuestions: true,
            vocabProgress: true,
          },
        },
      },
      orderBy: { totalXp: "desc" },
    });

    const items = students.map((s) => ({
      id: s.id,
      name: s.name,
      username: s.username,
      email: s.email,
      currentHskLevel: s.currentHskLevel,
      totalXp: s.totalXp,
      streakDays: s.streakDays,
      status: s.status,
      className: s.enrolledClasses[0]?.class.name || "HSK 1A",
      attemptsCount: s._count.attempts,
      wrongQuestionsCount: s._count.wrongQuestions,
      vocabMasteredCount: s._count.vocabProgress,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách học sinh" }, { status: 500 });
  }
}
