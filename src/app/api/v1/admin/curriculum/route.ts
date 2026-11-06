import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDictionaryUser } from "@/lib/dictionary-session";
import { examWriteOrigin } from "@/lib/exam-center-service";
import { readCurriculum } from "@/lib/curriculum-server";
import { normalizeLessons, CurriculumFormatError } from "@/lib/curriculum-format";
import type { Prisma } from "@/generated/prisma";

const headers = { "Cache-Control": "no-store" };

async function resolveCurriculumAdmin(request: Request) {
  const user = await getDictionaryUser(request);
  return user && (user.role === "ADMIN" || user.role === "TEACHER") ? user : null;
}

export async function GET(request: Request) {
  try {
    const admin = await resolveCurriculumAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Vui lòng xác thực tài khoản quản trị viên / giáo viên." }, { status: 403, headers });
    }
    const query = new URL(request.url).searchParams;
    const level = Number(query.get("level") ?? 1);
    if (!Number.isInteger(level) || level < 1 || level > 9) {
      return NextResponse.json({ success: false, message: "Cấp HSK phải từ 1 đến 9." }, { status: 400, headers });
    }
    const history = query.get("history");
    if (history !== null) {
      const where = { entity: `CurriculumContent:${level}`, action: "CURRICULUM_BACKUP" };
      if (history === "list") {
        const items = await prisma.auditLog.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return NextResponse.json({ success: true, items }, { headers });
      }
      const entry = await prisma.auditLog.findFirst({
        where: { ...where, id: history },
        select: { details: true },
      });
      if (!entry?.details) {
        return NextResponse.json({ success: false, message: "Không tìm thấy bản sao lưu." }, { status: 404, headers });
      }
      const { previousRevision, previousIsDeleted, previousLessons } = JSON.parse(entry.details);
      return NextResponse.json({
        success: true, level, revision: previousRevision, isDeleted: previousIsDeleted, lessons: previousLessons,
      }, { headers });
    }
    return NextResponse.json({ success: true, ...await readCurriculum(level) }, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Không tải được giáo trình từ máy chủ. Vui lòng thử lại." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await resolveCurriculumAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Chỉ quản trị viên hoặc giáo viên có quyền biên tập giáo trình." }, { status: 403, headers });
    }

    if (!examWriteOrigin(request) || !request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ success: false, message: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers });
    }

    const text = await request.text();
    if (Buffer.byteLength(text) > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Nội dung tối đa 8 MB." }, { status: 413, headers });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, message: "JSON không hợp lệ." }, { status: 400, headers });
    }

    const { level, revision, isDeleted = false } = body ?? {};
    if (!Number.isInteger(level) || level < 1 || level > 9 || !Number.isSafeInteger(revision) || revision < 0 || typeof isDeleted !== "boolean" || !Array.isArray(body.lessons)) {
      throw new CurriculumFormatError("Cần cấp HSK và danh sách bài học hợp lệ.");
    }

    const lessons = normalizeLessons(body.lessons, level);
    if (isDeleted && lessons.length) {
      throw new CurriculumFormatError("Cấp HSK đã xóa phải có danh sách bài rỗng.");
    }

    const before = await prisma.curriculumContent.findUnique({
      where: { hskLevel: level },
      select: { revision: true, lessons: true, isDeleted: true },
    });
    const currentRev = before?.revision ?? 0;
    if (revision !== currentRev) {
      return NextResponse.json({ success: false, message: "Giáo trình đã thay đổi. Hãy tải lại dữ liệu trước khi lưu." }, { status: 409, headers });
    }

    const nextRev = currentRev + 1;
    const data = {
      lessons: lessons as unknown as Prisma.InputJsonValue,
      isDeleted,
      revision: nextRev,
    };
    const write = before
      ? prisma.curriculumContent.update({ where: { hskLevel: level, revision }, data, select: { updatedAt: true } })
      : prisma.curriculumContent.create({ data: { hskLevel: level, ...data }, select: { updatedAt: true } });
    // A failed write or backup rolls back both operations. The revision filter protects
    // the snapshot read above from a concurrent write without an interactive transaction.
    const [saved] = await prisma.$transaction([
      write,
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: before ? "CURRICULUM_BACKUP" : "CURRICULUM_SAVE",
          entity: `CurriculumContent:${level}`,
          details: JSON.stringify({
            previousRevision: currentRev,
            previousIsDeleted: before?.isDeleted,
            previousLessons: before?.lessons,
            nextCount: lessons.length,
            isDeleted,
          }),
        },
        select: { id: true },
      }),
    ]);

    const result = {
      success: true,
      level,
      items: lessons,
      revision: nextRev,
      isDeleted,
      updatedAt: saved.updatedAt.toISOString(),
    };

    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof CurriculumFormatError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400, headers });
    }
    if (["P2002", "P2025"].includes((error as { code?: string })?.code ?? "")) {
      return NextResponse.json({ success: false, message: "Giáo trình vừa được sửa ở phiên khác. Hãy thử lại." }, { status: 409, headers });
    }
    console.error("Curriculum save failed", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      { success: false, message: "Chưa lưu được giáo trình vào cơ sở dữ liệu. Vui lòng thử lại." },
      { status: 503, headers }
    );
  }
}
