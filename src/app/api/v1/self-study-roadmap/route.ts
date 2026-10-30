import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SELF_STUDY_ROADMAP_STAGES } from "@/lib/self-study-roadmap-constants";

export { DEFAULT_SELF_STUDY_ROADMAP_STAGES };

export async function GET() {
  try {
    const record = await prisma.curriculumContent.findUnique({
      where: { hskLevel: 0 },
    });

    if (record && !record.isDeleted && Array.isArray(record.lessons) && record.lessons.length > 0) {
      return NextResponse.json({
        success: true,
        stages: record.lessons,
        updatedAt: record.updatedAt.toISOString(),
        isCustomized: true,
      });
    }

    return NextResponse.json({
      success: true,
      stages: DEFAULT_SELF_STUDY_ROADMAP_STAGES,
      updatedAt: null,
      isCustomized: false,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      stages: DEFAULT_SELF_STUDY_ROADMAP_STAGES,
      updatedAt: null,
      isCustomized: false,
      fallback: true,
    });
  }
}
