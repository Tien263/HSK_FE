import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ character: string }> }) {
  const { character } = await context.params;
  if (!/^\p{Script=Han}$/u.test(character)) return NextResponse.json({ message: "Chữ Hán không hợp lệ." }, { status: 400 });
  try {
    const data = await readFile(path.join(process.cwd(), "node_modules", "hanzi-writer-data", `${character}.json`), "utf8");
    return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" } });
  } catch { return NextResponse.json({ message: "Chưa có dữ liệu nét viết cho chữ này." }, { status: 404 }); }
}
