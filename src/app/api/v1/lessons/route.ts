import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        level: true,
        _count: { select: { vocabularies: true, grammarPoints: true, quizSets: true } },
      },
      orderBy: [{ level: { hskLevel: "asc" } }, { lessonNumber: "asc" }],
    });

    return NextResponse.json({
      success: true,
      items: lessons.map((l) => ({
        id: l.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        description: l.description,
        hskLevel: l.level.hskLevel,
        status: l.status,
        vocabCount: l._count.vocabularies,
        grammarCount: l._count.grammarPoints,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải kho bài học" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, lessonNumber, hskLevel, description } = body;

    // Tìm level tương ứng
    let level = await prisma.level.findFirst({
      where: { hskLevel: hskLevel || 1 },
    });

    if (!level) {
      const curriculum = await prisma.curriculum.findFirst();
      level = await prisma.level.create({
        data: {
          curriculumId: curriculum?.id || "curriculum-default",
          hskLevel: hskLevel || 1,
          title: `HSK ${hskLevel || 1}`,
          isOpen: true,
        },
      });
    }

    const newLesson = await prisma.lesson.create({
      data: {
        levelId: level.id,
        lessonNumber: lessonNumber || 1,
        title: title || `Bài mới · HSK ${hskLevel || 1}`,
        description: description || "",
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, item: newLesson }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tạo bài học mới" }, { status: 500 });
  }
}
