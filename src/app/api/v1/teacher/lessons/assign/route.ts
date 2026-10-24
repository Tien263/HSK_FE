import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

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
    const baseLessonsList = getLessonsByHskLevel(targetClass.level);
    const baseLesson = baseLessonsList.find((l) => l.number === lessonNum) || baseLessonsList[0];

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

    return NextResponse.json({
      success: true,
      message: `Đã công bố bài học "${baseLesson.titleVi}" (${lessonNum}) cho lớp ${targetClass.name}!`,
    });
  } catch (error: any) {
    console.error("Assign lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi giao bài học cho lớp" },
      { status: 500 }
    );
  }
}
