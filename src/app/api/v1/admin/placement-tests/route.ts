import { NextResponse } from "next/server";
import {
  getPlacementQuestionsAsync,
  savePlacementQuestionsAsync,
  DEFAULT_PLACEMENT_TESTS,
} from "@/lib/placement-test-config";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const config = await getPlacementQuestionsAsync();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi tải đề kiểm tra Admin." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const { action, hsk1_3, hsk4_6, thresholds } = body;

    if (action === "RESET") {
      const resetConfig = await savePlacementQuestionsAsync(DEFAULT_PLACEMENT_TESTS);
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục bộ đề khảo sát HSK chuẩn mặc định!",
        config: resetConfig,
      });
    }

    if (!Array.isArray(hsk1_3) || !Array.isArray(hsk4_6)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu câu hỏi không hợp lệ." },
        { status: 400 }
      );
    }

    const saved = await savePlacementQuestionsAsync({ hsk1_3, hsk4_6, thresholds });

    // Ghi audit log
    try {
      if (authCheck.user?.id) {
        await prisma.auditLog.create({
          data: {
            userId: authCheck.user.id,
            action: "UPDATE_PLACEMENT_TESTS",
            entity: "ONBOARDING_TESTS",
            details: JSON.stringify({
              hsk1_3Count: saved.hsk1_3.length,
              hsk4_6Count: saved.hsk4_6.length,
              thresholds: saved.thresholds,
            }),
          },
        });
      }
    } catch (auditErr) {
      console.warn("Lỗi ghi audit log placement test:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật bộ đề khảo sát và ngưỡng điểm thành công!",
      config: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lưu đề kiểm tra." },
      { status: 500 }
    );
  }
}
