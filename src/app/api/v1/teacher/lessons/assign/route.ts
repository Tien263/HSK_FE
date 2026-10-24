import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OFFICIAL_HSK1_15_LESSONS } from "@/lib/hsk1-full-lessons";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, lessonId, lessonTitle, selectedItems, startDate, dueDate, note } = body;

    if (!classId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn lớp học cần giao bài" },
        { status: 400 }
      );
    }

    // Check if class exists
    let targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { id: { endsWith: classId.toLowerCase() } },
            { id: { endsWith: classId.toUpperCase() } },
            { name: { contains: classId } },
          ],
        },
      });
    }

    if (!targetClass) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học yêu cầu" },
        { status: 404 }
      );
    }

    // 1. Lưu bản ghi ClassLesson vào PostgreSQL DB theo Nghiệp vụ 3
    const lessonNum = parseInt(String(lessonId).replace(/\D/g, ""), 10) || 1;
    const baseLesson = OFFICIAL_HSK1_15_LESSONS.find((l) => l.number === lessonNum) || OFFICIAL_HSK1_15_LESSONS[0];

    const chosenVocabs = selectedItems?.selectedVocabs || [];
    const chosenGrammars = selectedItems?.selectedGrammars || [];
    const chosenCultural = selectedItems?.selectedCulturalItems || [];

    await prisma.classLesson.upsert({
      where: {
        classId_lessonNumber: {
          classId: targetClass.id,
          lessonNumber: lessonNum,
        },
      },
      update: {
        status: "PUBLISHED",
        vocabCount: chosenVocabs.length > 0 ? chosenVocabs.length : (selectedItems?.vocabCount || baseLesson.vocabCount),
        grammarCount: chosenGrammars.length > 0 ? chosenGrammars.length : (selectedItems?.grammarCount || baseLesson.grammarCount),
        selectedVocabs: chosenVocabs.length > 0 ? JSON.stringify(chosenVocabs) : null,
        selectedGrammars: chosenGrammars.length > 0 ? JSON.stringify(chosenGrammars) : null,
        selectedDialogue: selectedItems?.selectedDialogue ? JSON.stringify(selectedItems.selectedDialogue) : null,
        selectedCultural: chosenCultural.length > 0 ? JSON.stringify(chosenCultural) : null,
        teacherNote: note ? String(note).trim() : null,
        dueDate: dueDate ? String(dueDate).trim() : null,
        updatedAt: new Date(),
      },
      create: {
        classId: targetClass.id,
        lessonNumber: lessonNum,
        lessonId: baseLesson.id,
        titleZh: baseLesson.titleZh,
        titleVi: baseLesson.titleVi,
        pinyin: baseLesson.pinyin,
        status: "PUBLISHED",
        vocabCount: chosenVocabs.length > 0 ? chosenVocabs.length : (selectedItems?.vocabCount || baseLesson.vocabCount),
        grammarCount: chosenGrammars.length > 0 ? chosenGrammars.length : (selectedItems?.grammarCount || baseLesson.grammarCount),
        selectedVocabs: chosenVocabs.length > 0 ? JSON.stringify(chosenVocabs) : null,
        selectedGrammars: chosenGrammars.length > 0 ? JSON.stringify(chosenGrammars) : null,
        selectedDialogue: selectedItems?.selectedDialogue ? JSON.stringify(selectedItems.selectedDialogue) : null,
        selectedCultural: chosenCultural.length > 0 ? JSON.stringify(chosenCultural) : null,
        teacherNote: note ? String(note).trim() : null,
        dueDate: dueDate ? String(dueDate).trim() : null,
      },
    });

    // 2. Tạo bản ghi giao bài tập phụ trợ (nếu có)
    let quizSet = await prisma.quizSet.findFirst();
    if (!quizSet) {
      quizSet = await prisma.quizSet.create({
        data: {
          title: `Lý thuyết bài học: ${lessonTitle || "Bài mới"}`,
          mode: "PRACTICE",
          totalScore: 100,
        },
      });
    }

    const assignmentTitle = `Học phần lý thuyết: ${lessonTitle || "Bài học mới"}`;

    const newAssignment = await prisma.assignment.create({
      data: {
        quizSetId: quizSet.id,
        classId: targetClass.id,
        title: assignmentTitle,
        openAt: startDate ? new Date(startDate) : new Date(),
        dueAt: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        durationMin: 45,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã công bố bài học "${baseLesson.titleVi}" (${lessonNum}) cho lớp ${targetClass.name}!`,
      assignmentId: newAssignment.id,
    });
  } catch (error: any) {
    console.error("Assign lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi giao bài học cho lớp" },
      { status: 500 }
    );
  }
}
