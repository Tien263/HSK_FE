import { NextResponse } from "next/server";
// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

function getDb() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  return new DatabaseSync(dbPath);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare("DELETE FROM Material WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      message: "Đã xóa tài liệu khỏi thư viện.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { classId } = body;

    const db = getDb();
    db.prepare("UPDATE Material SET classId = ? WHERE id = ?").run(classId || null, id);

    const updated = db.prepare("SELECT * FROM Material WHERE id = ?").get(id);

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài liệu thành công!",
      item: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
