import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

// GET /api/v1/classes/[id]/lessons - Lấy lộ trình 15 bài học của lớp theo đúng cấp độ HSK
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);

    // 1. Kiểm tra lớp học
    let targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    if (!targetClass) {
      targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { id: { endsWith: classId.toLowerCase() } },
            { id: { endsWith: classId.toUpperCase() } },
          ],
        },
        include: {
          teacher: { select: { id: true, name: true } },
        },
      });
    }

    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Bảo mật phân quyền: Nếu là học sinh, PHẢI là thành viên hợp lệ và ĐÃ ĐƯỢC PHÊ DUYỆT
    const { searchParams } = new URL(request.url);
    const studentId = request.headers.get("x-user-id") || searchParams.get("studentId") || (authUser?.role === "STUDENT" ? authUser.id : null);

    if (studentId) {
      const studentUser = await prisma.user.findUnique({
        where: { id: studentId },
        select: { role: true },
      });

      if (studentUser?.role === "STUDENT") {
        const membership = await prisma.classStudent.findUnique({
          where: {
            classId_studentId: {
              classId: targetClass.id,
              studentId,
            },
          },
        });

        if (!membership) {
          return NextResponse.json(
            { success: false, message: "Bạn không phải là thành viên của lớp này hoặc đã bị xóa khỏi lớp." },
            { status: 403 }
          );
        }

        if (membership.status === "PENDING") {
          return NextResponse.json(
            {
              success: false,
              isPendingApproval: true,
              message: "Yêu cầu tham gia lớp học của bạn đang chờ giáo viên phê duyệt. Lộ trình bài học sẽ mở khóa ngay khi được cô giáo duyệt.",
              lessons: [],
            },
            { status: 403 }
          );
        }
      }
    }

    // 2. Lấy danh sách các bài học đã được giáo viên lưu / công bố trong DB cho lớp này
    const dbLessons = await prisma.classLesson.findMany({
      where: { classId: targetClass.id },
      orderBy: { lessonNumber: "asc" },
    });

    const dbLessonsMap = new Map<number, any>();
    for (const dbl of dbLessons) {
      dbLessonsMap.set(dbl.lessonNumber, dbl);
    }

    // 3. Chuẩn hóa đủ 15 bài học theo đúng cấp độ của lớp (HSK 1 / HSK 2...)
    const hskLevel = targetClass.level || 1;
    const baseLessonsList = getLessonsByHskLevel(hskLevel);

    const lessons = baseLessonsList.map((base) => {
      const dbRecord = dbLessonsMap.get(base.number);

      if (dbRecord) {
        let parsedVocabs = [];
        let parsedGrammars = [];
        let parsedCultural = [];

        try {
          parsedVocabs = dbRecord.selectedVocabs ? JSON.parse(dbRecord.selectedVocabs) : [];
        } catch {}
        try {
          parsedGrammars = dbRecord.selectedGrammars ? JSON.parse(dbRecord.selectedGrammars) : [];
        } catch {}
        try {
          parsedCultural = dbRecord.selectedCultural ? JSON.parse(dbRecord.selectedCultural) : [];
        } catch {}

        const isPublished = dbRecord.status === "PUBLISHED";

        return {
          id: dbRecord.id,
          lessonNumber: base.number,
          lessonId: base.id,
          titleZh: base.titleZh,
          titleVi: base.titleVi,
          pinyin: base.pinyin,
          desc: base.desc,
          durationMin: base.durationMin,
          status: dbRecord.status, // "PUBLISHED" | "DRAFT"
          isPublished,
          isUnlocked: isPublished,
          vocabCount: parsedVocabs.length > 0 ? parsedVocabs.length : dbRecord.vocabCount || base.vocabCount,
          grammarCount: parsedGrammars.length > 0 ? parsedGrammars.length : dbRecord.grammarCount || base.grammarCount,
          selectedVocabs: parsedVocabs,
          selectedGrammars: parsedGrammars,
          selectedCultural: parsedCultural,
          hasDialogue: dbRecord.hasDialogue,
          hasReading: dbRecord.hasReading,
          teacherNote: dbRecord.teacherNote || undefined,
          dueDate: dbRecord.dueDate || undefined,
          publishedAt: dbRecord.publishedAt,
          updatedAt: dbRecord.updatedAt,
        };
      }

      // Chưa được công bố -> Mặc định KHÓA 🔒
      return {
        id: `locked-${base.number}`,
        lessonNumber: base.number,
        lessonId: base.id,
        titleZh: base.titleZh,
        titleVi: base.titleVi,
        pinyin: base.pinyin,
        desc: base.desc,
        durationMin: base.durationMin,
        status: "LOCKED",
        isPublished: false,
        isUnlocked: false,
        vocabCount: base.vocabCount,
        grammarCount: base.grammarCount,
        selectedVocabs: [],
        selectedGrammars: [],
        selectedCultural: [],
        hasDialogue: true,
        hasReading: true,
      };
    });

    return NextResponse.json({
      success: true,
      classInfo: {
        id: targetClass.id,
        name: targetClass.name,
        level: targetClass.level,
        teacherName: targetClass.teacher?.name,
      },
      lessons,
      totalLessons: lessons.length,
      publishedCount: lessons.filter((l) => l.isPublished).length,
    });
  } catch (error: any) {
    console.error("GET /classes/[id]/lessons error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải lộ trình bài học của lớp." }, { status: 500 });
  }
}

// POST /api/v1/classes/[id]/lessons - Giáo viên tùy chỉnh & công bố / lưu nháp / thu hồi bài học cho lớp (Nghiệp vụ 3)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);
    const body = await request.json();

    const {
      lessonNumber,
      status = "PUBLISHED", // "PUBLISHED" | "DRAFT" | "LOCKED"
      selectedVocabs = [],
      selectedGrammars = [],
      hasDialogue = true,
      hasReading = true,
      selectedCultural = [],
      teacherNote,
      dueDate,
    } = body;

    const num = Number(lessonNumber);
    if (!num || num < 1 || num > 15) {
      return NextResponse.json({ success: false, message: "Số thứ tự bài học không hợp lệ (1 - 15)." }, { status: 400 });
    }

    // 1. Kiểm tra lớp học và quyền giáo viên
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
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền quản lý bài học của lớp này." },
        { status: 403 }
      );
    }

    // Nếu giáo viên chọn thu hồi / khóa bài:
    if (status === "LOCKED") {
      await prisma.classLesson.deleteMany({
        where: {
          classId: targetClass.id,
          lessonNumber: num,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Đã thu hồi (khóa lại) Bài ${num} của lớp ${targetClass.name}.`,
      });
    }

    // 2. Tìm thông tin bài học gốc theo đúng cấp độ lớp
    const baseLessonsList = getLessonsByHskLevel(targetClass.level);
    const baseLesson = baseLessonsList.find((l) => l.number === num) || baseLessonsList[0];

    // 3. Upsert vào bảng ClassLesson trong PostgreSQL DB
    const upserted = await prisma.classLesson.upsert({
      where: {
        classId_lessonNumber: {
          classId: targetClass.id,
          lessonNumber: num,
        },
      },
      update: {
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        vocabCount: Array.isArray(selectedVocabs) ? selectedVocabs.length : 0,
        grammarCount: Array.isArray(selectedGrammars) ? selectedGrammars.length : 0,
        hasDialogue: Boolean(hasDialogue),
        hasReading: Boolean(hasReading),
        culturalCount: Array.isArray(selectedCultural) ? selectedCultural.length : 0,
        selectedVocabs: JSON.stringify(selectedVocabs),
        selectedGrammars: JSON.stringify(selectedGrammars),
        selectedCultural: JSON.stringify(selectedCultural),
        teacherNote: teacherNote ? String(teacherNote).trim() : null,
        dueDate: dueDate ? String(dueDate).trim() : null,
        updatedAt: new Date(),
      },
      create: {
        classId: targetClass.id,
        lessonNumber: num,
        lessonId: baseLesson.id,
        titleZh: baseLesson.titleZh,
        titleVi: baseLesson.titleVi,
        pinyin: baseLesson.pinyin,
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        vocabCount: Array.isArray(selectedVocabs) ? selectedVocabs.length : 0,
        grammarCount: Array.isArray(selectedGrammars) ? selectedGrammars.length : 0,
        hasDialogue: Boolean(hasDialogue),
        hasReading: Boolean(hasReading),
        culturalCount: Array.isArray(selectedCultural) ? selectedCultural.length : 0,
        selectedVocabs: JSON.stringify(selectedVocabs),
        selectedGrammars: JSON.stringify(selectedGrammars),
        selectedCultural: JSON.stringify(selectedCultural),
        teacherNote: teacherNote ? String(teacherNote).trim() : null,
        dueDate: dueDate ? String(dueDate).trim() : null,
      },
    });

    const isPublished = upserted.status === "PUBLISHED";
    const actionText = isPublished ? "công bố cho lớp" : "lưu bản nháp";

    return NextResponse.json({
      success: true,
      message: `Đã ${actionText} Bài ${num} (${baseLesson.titleVi}) cho lớp ${targetClass.name} thành công!`,
      item: {
        id: upserted.id,
        lessonNumber: upserted.lessonNumber,
        titleZh: upserted.titleZh,
        titleVi: upserted.titleVi,
        status: upserted.status,
        isPublished,
        vocabCount: upserted.vocabCount,
        grammarCount: upserted.grammarCount,
        updatedAt: upserted.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("POST /classes/[id]/lessons error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu hoặc công bố bài học." }, { status: 500 });
  }
}
