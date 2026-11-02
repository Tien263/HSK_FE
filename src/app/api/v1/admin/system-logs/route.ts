import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

// GET /api/v1/admin/system-logs - Xem danh sách nhật ký lỗi và cảnh báo bảo mật
export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ["API_ERROR", "SECURITY_ALERT", "AUTH_FAILURE"] },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const parsedLogs = logs.map((log) => {
      let parsedDetails: any = null;
      try {
        parsedDetails = log.details ? JSON.parse(log.details) : null;
      } catch {
        parsedDetails = { raw: log.details };
      }

      return {
        id: log.id,
        action: log.action,
        endpoint: log.entity,
        createdAt: log.createdAt,
        user: log.user,
        details: parsedDetails,
      };
    });

    return NextResponse.json({
      success: true,
      logs: parsedLogs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    console.error("GET /api/v1/admin/system-logs error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải nhật ký hệ thống." },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/system-logs - Dọn dẹp nhật ký lỗi cũ
export async function DELETE(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    await prisma.auditLog.deleteMany({
      where: {
        action: { in: ["API_ERROR", "SECURITY_ALERT", "AUTH_FAILURE"] },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã dọn dẹp toàn bộ nhật ký lỗi hệ thống.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa nhật ký hệ thống." },
      { status: 500 }
    );
  }
}
