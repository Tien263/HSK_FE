import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { readSafeJsonFile, writeSafeJsonFile } from "@/lib/safe-config";
import {
  DEFAULT_STUDENT_STEPS,
  DEFAULT_TEACHER_STEPS,
  GuideConfigData,
} from "@/lib/guide-data";
import path from "path";

const GUIDE_FILE = path.join(process.cwd(), "prisma", "guide-config.json");

const DEFAULT_CONFIG: GuideConfigData = {
  updatedAt: new Date().toISOString(),
  studentSteps: DEFAULT_STUDENT_STEPS,
  teacherSteps: DEFAULT_TEACHER_STEPS,
};

export async function GET() {
  try {
    const data = readSafeJsonFile<GuideConfigData>(GUIDE_FILE, DEFAULT_CONFIG);
    return NextResponse.json({
      success: true,
      data: {
        studentSteps: data.studentSteps && data.studentSteps.length > 0 ? data.studentSteps : DEFAULT_STUDENT_STEPS,
        teacherSteps: data.teacherSteps && data.teacherSteps.length > 0 ? data.teacherSteps : DEFAULT_TEACHER_STEPS,
        updatedAt: data.updatedAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEFAULT_CONFIG,
    });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const { studentSteps, teacherSteps } = body;

    const newConfig: GuideConfigData = {
      updatedAt: new Date().toISOString(),
      studentSteps: Array.isArray(studentSteps) && studentSteps.length > 0 ? studentSteps : DEFAULT_STUDENT_STEPS,
      teacherSteps: Array.isArray(teacherSteps) && teacherSteps.length > 0 ? teacherSteps : DEFAULT_TEACHER_STEPS,
    };

    writeSafeJsonFile(GUIDE_FILE, newConfig);

    return NextResponse.json({
      success: true,
      message: "Cập nhật cẩm nang hướng dẫn thành công!",
      data: newConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lưu cấu hình hướng dẫn." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    writeSafeJsonFile(GUIDE_FILE, DEFAULT_CONFIG);

    return NextResponse.json({
      success: true,
      message: "Đã khôi phục cẩm nang hướng dẫn về trạng thái mặc định ban đầu.",
      data: DEFAULT_CONFIG,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi khôi phục hướng dẫn." },
      { status: 500 }
    );
  }
}
