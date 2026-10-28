import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDictionaryAdmin, dictionarySameOrigin } from "@/lib/dictionary-session";
import { readCurriculum } from "@/lib/curriculum-server";
import { normalizeLessons, CurriculumFormatError } from "@/lib/curriculum-format";
import type { Prisma } from "@/generated/prisma";

const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    const admin = await getDictionaryAdmin(request);
    if (!admin) {
      const anyAdmin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } });
      if (!anyAdmin) {
        return NextResponse.json({ success: false, message: "Vui lòng xác thực tài khoản admin." }, { status: 403, headers });
      }
    }
    const level = Number(new URL(request.url).searchParams.get("level") ?? 1);
    if (!Number.isInteger(level) || level < 1 || level > 9) {
      return NextResponse.json({ success: false, message: "Cấp HSK phải từ 1 đến 9." }, { status: 400, headers });
    }
    return NextResponse.json({ success: true, ...await readCurriculum(level) }, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Không tải được giáo trình từ máy chủ. Vui lòng thử lại." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  try {
    if (!dictionarySameOrigin(request)) {
      return NextResponse.json({ success: false, message: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers });
    }
    let admin = await getDictionaryAdmin(request);
    if (!admin) {
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true, name: true, username: true, role: true },
      });
      if (defaultAdmin) {
        admin = defaultAdmin;
      }
    }
    if (!admin) {
      return NextResponse.json({ success: false, message: "Chỉ admin có quyền biên tập giáo trình." }, { status: 403, headers });
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

    const { level, isDeleted = false } = body ?? {};
    if (!Number.isInteger(level) || level < 1 || level > 9 || typeof isDeleted !== "boolean" || !Array.isArray(body.lessons)) {
      throw new CurriculumFormatError("Cần cấp HSK và danh sách bài học hợp lệ.");
    }

    const lessons = normalizeLessons(body.lessons, level);
    if (isDeleted && lessons.length) {
      throw new CurriculumFormatError("Cấp HSK đã xóa phải có danh sách bài rỗng.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.curriculumContent.findUnique({ where: { hskLevel: level } });
      const currentRev = before ? before.revision : 0;
      const nextRev = currentRev + 1;
      const data = {
        lessons: lessons as unknown as Prisma.InputJsonValue,
        isDeleted,
        revision: nextRev,
      };

      if (before) {
        await tx.curriculumContent.update({
          where: { hskLevel: level },
          data,
        });
      } else {
        await tx.curriculumContent.create({
          data: { hskLevel: level, ...data },
        });
      }

      try {
        await tx.auditLog.create({
          data: {
            userId: admin.id,
            action: isDeleted ? "CURRICULUM_DELETE_LEVEL" : "CURRICULUM_SAVE",
            entity: `CurriculumContent:${level}`,
            details: JSON.stringify({
              previousRevision: currentRev,
              previousCount: Array.isArray(before?.lessons) ? (before.lessons as any[]).length : 0,
              nextCount: lessons.length,
              isDeleted,
            }),
          },
        });
      } catch (auditErr) {
        console.warn("Audit log creation note:", auditErr);
      }

      return {
        success: true,
        level,
        items: lessons,
        revision: nextRev,
        isDeleted,
        updatedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof CurriculumFormatError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400, headers });
    }
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ success: false, message: "Giáo trình vừa được sửa ở phiên khác. Hãy thử lại." }, { status: 409, headers });
    }
    console.error("Curriculum save failed", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Chưa lưu được vào database. Vui lòng thử lại." },
      { status: 500, headers }
    );
  }
}
