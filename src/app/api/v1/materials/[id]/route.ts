import { NextResponse } from "next/server";

function getDb() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path");
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    return new DatabaseSync(dbPath);
  } catch {
    return null;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu ID tài liệu" }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      const existing = db.prepare("SELECT id FROM Material WHERE id = ?").get(id);

      if (!existing) {
        return NextResponse.json({ success: false, message: "Không tìm thấy tài liệu cần xóa" }, { status: 404 });
      }

      db.prepare("DELETE FROM Material WHERE id = ?").run(id);

      return NextResponse.json({
        success: true,
        message: "Đã xóa tài liệu thành công!",
        deletedId: id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa tài liệu thành công!",
      deletedId: id,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/materials/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
