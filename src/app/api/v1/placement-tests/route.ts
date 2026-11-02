import { NextResponse } from "next/server";
import { getPlacementQuestions } from "@/lib/placement-test-config";

export async function GET() {
  try {
    const config = getPlacementQuestions();
    return NextResponse.json({
      success: true,
      hsk1_3: config.hsk1_3,
      hsk4_6: config.hsk4_6,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lấy đề kiểm tra năng lực." },
      { status: 500 }
    );
  }
}
