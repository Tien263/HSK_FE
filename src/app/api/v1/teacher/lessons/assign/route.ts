import { prisma } from "@/lib/prisma";
import { classAccess, jsonBody, portalResponse, portalJson, teacherOnly, textField, PortalError } from "@/lib/portal-auth";
import { getServerLessonsByHskLevel } from "@/lib/curriculum-server";
import { prepareClassContent } from "@/lib/class-lesson-content";

async function notifyStudentsAboutLesson(classIds: string[], titleZh: string, titleVi: string) {
  if (!classIds.length) return;
  try {
    const classStudents = await prisma.classStudent.findMany({
      where: { classId: { in: classIds }, status: "APPROVED" },
      select: { studentId: true },
    });
    const uniqueStudentIds = [...new Set(classStudents.map(cs => cs.studentId))];
    if (uniqueStudentIds.length > 0) {
      const lessonTitle = `${titleZh} · ${titleVi}`;
      await prisma.notification.createMany({
        data: uniqueStudentIds.map(sId => ({
          userId: sId,
          title: "Bài học mới được công bố",
          message: `Giáo viên đã cập nhật bài học mới: "${lessonTitle}". Hãy vào học ngay!`,
          type: "ASSIGNMENT",
          linkUrl: "/s/home",
        })),
      });
    }
  } catch (err) {
    console.warn("Lỗi khi gửi thông báo bài học mới tới học sinh:", err);
  }
}

export function POST(request: Request) {
  return portalResponse(request, async user => {
    teacherOnly(user);
    const body = await jsonBody(request);
    const ids = [...new Set((Array.isArray(body.classIds) ? body.classIds : [body.classId]).map(value => textField(value, "Lớp học", true, 150)))];
    if (!ids.length || ids.length > 100) throw new PortalError(400, "Chọn từ 1 đến 100 lớp.");
    const classrooms: Awaited<ReturnType<typeof classAccess>>[] = [];
    for (const id of ids) classrooms.push(await classAccess(user, id, true));
    if (classrooms.some(row => row.level !== classrooms[0].level)) {
      throw new PortalError(400, "Các lớp được giao cùng giáo trình phải có cùng cấp HSK.");
    }
    const classroom = classrooms[0];
    const lessons = await getServerLessonsByHskLevel(classroom.level);
    const id = String(body.lessonId || "");
    const number = Number(id.match(/(?:-b?)(\d+)$/)?.[1] || id);
    const base = lessons.find((item: any) => item.id === id) || lessons.find((item: any) => item.number === number);
    if (!base) throw new PortalError(404, "Bài học không còn trong kho giáo trình. Hãy tải lại.");
    const content = prepareClassContent(base, (body.selectedItems && typeof body.selectedItems === "object" ? body.selectedItems : {}) as Record<string, unknown>);
    const data = {
      lessonId: base.id,
      titleZh: base.titleZh,
      titleVi: base.titleVi,
      pinyin: base.pinyin,
      status: "PUBLISHED",
      vocabCount: content.vocabList.length,
      grammarCount: content.grammarList.length,
      hasDialogue: content.dialogue.length > 0,
      hasReading: !!(content.culture || content.phonetics.rule),
      selectedVocabs: JSON.stringify(content.vocabList),
      selectedGrammars: JSON.stringify(content.grammarList),
      selectedDialogue: JSON.stringify(content.dialogue),
      content: JSON.parse(JSON.stringify(content)),
      teacherNote: textField(body.note || "", "Ghi chú", false, 3000),
      dueDate: textField(body.dueDate || "", "Hạn học", false, 30),
    };
    const items = await prisma.$transaction(
      ids.map(classId =>
        prisma.classLesson.upsert({
          where: { classId_lessonNumber: { classId, lessonNumber: base.number } },
          create: { classId, lessonNumber: base.number, ...data },
          update: data,
        })
      )
    );
    await notifyStudentsAboutLesson(ids, base.titleZh, base.titleVi);
    return portalJson({ success: true, item: items[0], items, message: "Đã công bố đầy đủ nội dung đã chọn cho lớp." });
  }, true);
}
