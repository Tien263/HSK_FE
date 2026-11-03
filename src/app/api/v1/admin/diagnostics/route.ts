import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { runSystemDiagnosticsAndSelfHeal } from "@/lib/safe-config";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const results = runSystemDiagnosticsAndSelfHeal();
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      message: "Đã hoàn thành kiểm tra và tự phục hồi toàn bộ hệ thống file cấu hình an toàn.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi chạy chẩn đoán hệ thống." },
      { status: 500 }
    );
  }
}
