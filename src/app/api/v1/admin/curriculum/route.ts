import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDictionaryAdmin, dictionarySameOrigin } from "@/lib/dictionary-session";
import { readCurriculum } from "@/lib/curriculum-server";
import { normalizeLessons, CurriculumFormatError } from "@/lib/curriculum-format";
import type { Prisma } from "@/generated/prisma";

const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  try {
    if (!await getDictionaryAdmin(request)) return NextResponse.json({ success: false, message: "Vui lòng xác thực tài khoản admin." }, { status: 403, headers });
    const level = Number(new URL(request.url).searchParams.get("level") ?? 1);
    if (!Number.isInteger(level) || level < 1 || level > 9) return NextResponse.json({ success: false, message: "Cấp HSK phải từ 1 đến 9." }, { status: 400, headers });
    return NextResponse.json({ success: true, ...await readCurriculum(level) }, { headers });
  } catch { return NextResponse.json({ success: false, message: "Không tải được giáo trình từ máy chủ. Vui lòng thử lại." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  try {
    if (!dictionarySameOrigin(request)) return NextResponse.json({ success: false, message: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers });
    const admin = await getDictionaryAdmin(request);
    if (!admin) return NextResponse.json({ success: false, message: "Chỉ admin có quyền biên tập giáo trình." }, { status: 403, headers });
    const text = await request.text();
    if (Buffer.byteLength(text) > 8 * 1024 * 1024) return NextResponse.json({ success: false, message: "Nội dung tối đa 8 MB." }, { status: 413, headers });
    let body;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ success: false, message: "JSON không hợp lệ." }, { status: 400, headers }); }
    const { level, revision, isDeleted = false } = body ?? {};
    if (!Number.isInteger(level) || level < 1 || level > 9 || !Number.isSafeInteger(revision) || revision < 0 || typeof isDeleted !== "boolean" || !Array.isArray(body.lessons)) throw new CurriculumFormatError("Cần cấp HSK, danh sách bài và phiên bản dữ liệu hợp lệ.");
    const lessons = normalizeLessons(body.lessons, level);
    if (isDeleted && lessons.length) throw new CurriculumFormatError("Cấp HSK đã xóa phải có danh sách bài rỗng.");
    const result = await prisma.$transaction(async tx => {
      const before = await tx.curriculumContent.findUnique({ where: { hskLevel: level } });
      if ((before?.revision ?? 0) !== revision) return null;
      const data = { lessons: lessons as unknown as Prisma.InputJsonValue, isDeleted, revision: revision + 1 };
      if (before) {
        const updated = await tx.curriculumContent.updateMany({ where: { hskLevel: level, revision }, data });
        if (updated.count !== 1) return null;
      } else await tx.curriculumContent.create({ data: { hskLevel: level, ...data } });
      await tx.auditLog.create({ data: { userId: admin.id, action: isDeleted ? "CURRICULUM_DELETE_LEVEL" : "CURRICULUM_SAVE", entity: `CurriculumContent:${level}`, details: JSON.stringify({ previousRevision: revision, previousCount: Array.isArray(before?.lessons) ? before.lessons.length : null, nextCount: lessons.length, isDeleted }) } });
      return { success: true, level, items: lessons, revision: revision + 1, isDeleted, updatedAt: new Date().toISOString() };
    });
    if (!result) return NextResponse.json({ success: false, message: "Giáo trình đã được sửa ở phiên khác. Tải lại dữ liệu trước khi lưu." }, { status: 409, headers });
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof CurriculumFormatError) return NextResponse.json({ success: false, message: error.message }, { status: 400, headers });
    if ((error as { code?: string })?.code === "P2002") return NextResponse.json({ success: false, message: "Giáo trình vừa được sửa ở phiên khác. Hãy tải lại." }, { status: 409, headers });
    console.error("Curriculum save failed", error instanceof Error ? error.name : "Unknown");
    return NextResponse.json({ success: false, message: "Chưa lưu được vào database. Dữ liệu chưa được xuất bản; vui lòng thử lại." }, { status: 503, headers });
  }
}
