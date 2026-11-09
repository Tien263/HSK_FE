import { NextResponse } from "next/server";
import { getPlacementQuestionsAsync } from "@/lib/placement-test-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getPlacementQuestionsAsync();
    return NextResponse.json({
      success: true,
      hsk1_3: config.hsk1_3,
      hsk4_6: config.hsk4_6,
      thresholds: config.thresholds,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lấy đề kiểm tra năng lực." },
      { status: 500 }
    );
  }
}
