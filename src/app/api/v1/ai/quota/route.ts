import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getAiQuotaStatus, getClientIp } from "@/lib/ai-rate-limiter";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const clientIp = getClientIp(request);
    const quota = await getAiQuotaStatus(authUser?.id, clientIp);

    return NextResponse.json(
      {
        success: true,
        quota,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/v1/ai/quota error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy thông tin hạn mức AI.",
      },
      { status: 500 }
    );
  }
}
