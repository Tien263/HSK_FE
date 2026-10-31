import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập học sinh." }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        userId: auth.id,
        action: "SELF_STUDY_NOTE_SAVE",
        entity: { startsWith: "CalligraphyNote:" },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const notesMap = new Map<string, any>();
    for (const log of logs) {
      try {
        const data = JSON.parse(log.details || "{}");
        if (data && data.id && !notesMap.has(data.id)) {
          notesMap.set(data.id, data);
        }
      } catch {}
    }

    const notes = Array.from(notesMap.values());
    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error("Self study notes GET error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi tải danh sách bút ký." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập học sinh." }, { status: 401 });
    }

    const body = await request.json();
    const note = body.note;
    if (!note || !note.id) {
      return NextResponse.json({ success: false, message: "Dữ liệu bút ký không hợp lệ." }, { status: 400 });
    }

    // Ghi vết lưu bút ký lên database
    await prisma.auditLog.create({
      data: {
        userId: auth.id,
        action: "SELF_STUDY_NOTE_SAVE",
        entity: `CalligraphyNote:${note.id}`,
        details: JSON.stringify(note),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã đồng bộ bút ký lên đám mây thành công.",
      noteId: note.id,
    });
  } catch (error: any) {
    console.error("Self study notes POST error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi lưu bút ký." }, { status: 500 });
  }
}
