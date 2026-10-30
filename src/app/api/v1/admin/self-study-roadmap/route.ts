import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SELF_STUDY_ROADMAP_STAGES } from "@/app/api/v1/self-study-roadmap/route";

export async function GET() {
  try {
    const record = await prisma.curriculumContent.findUnique({
      where: { hskLevel: 0 },
    });

    let stages = DEFAULT_SELF_STUDY_ROADMAP_STAGES;
    if (record && !record.isDeleted && Array.isArray(record.lessons) && record.lessons.length > 0) {
      stages = record.lessons as any;
    }

    return NextResponse.json({
      success: true,
      stages,
      updatedAt: record?.updatedAt?.toISOString() || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi tải cấu hình lộ trình" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { stages } = body;

    if (!Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách giai đoạn lộ trình không được để trống." },
        { status: 400 }
      );
    }

    const normalizedStages = stages.map((st: any, idx: number) => ({
      step: idx + 1,
      title: String(st.title || `Giai đoạn ${idx + 1}`).trim(),
      duration: String(st.duration || "Dự kiến 2-4 tuần").trim(),
      desc: String(st.desc || "").trim(),
      badge: String(st.badge || "🎯 Mục tiêu giai đoạn").trim(),
    }));

    const updated = await prisma.curriculumContent.upsert({
      where: { hskLevel: 0 },
      update: {
        lessons: normalizedStages as any,
        revision: { increment: 1 },
        isDeleted: false,
      },
      create: {
        hskLevel: 0,
        lessons: normalizedStages as any,
        revision: 1,
        isDeleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật thành công lộ trình tự học cá nhân hóa!",
      stages: normalizedStages,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi lưu cấu hình lộ trình: " + (error as Error).message },
      { status: 500 }
    );
  }
}
