import { NextResponse } from "next/server";
import { readCurriculum } from "@/lib/curriculum-server";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const value = new URL(request.url).searchParams.get("level");
    if (value === null) {
      const records = await Promise.all(Array.from({ length: 9 }, (_, index) => readCurriculum(index + 1)));
      const levels = records.map(({ level, items, isDeleted }) => ({ level, items, isDeleted }));
      return NextResponse.json({ success: true, levels }, { headers });
    }
    const level = Number(value);
    if (!Number.isInteger(level) || level < 1 || level > 9) return NextResponse.json({ success: false, message: "Cấp HSK phải từ 1 đến 9." }, { status: 400, headers });
    const data = await readCurriculum(level);
    return NextResponse.json({ success: true, level, items: data.items, isDeleted: data.isDeleted }, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Chưa tải được kho giáo trình. Vui lòng thử lại." }, { status: 503, headers });
  }
}
