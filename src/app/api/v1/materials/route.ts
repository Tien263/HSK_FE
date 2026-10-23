import { NextResponse } from "next/server";

let inMemoryMaterials: any[] = [
  {
    id: "mat-sample-1",
    title: "HSK 1-6 Bảng Tổng Hợp Ngữ Pháp & Từ Vựng Cốt Lõi",
    type: "VOCABULARY",
    hskLevel: 1,
    classId: null,
    fileUrl: "/materials/vocab_hsk1.pdf",
    fileName: "vocab_hsk1.pdf",
    fileSize: "2.4 MB",
    description: "Tài liệu chuẩn phân phối theo giáo trình quốc tế",
    uploadedBy: "Cô Ning Ning",
    downloadCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getDb() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path");
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    const db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS Material (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        hskLevel INTEGER DEFAULT 1,
        classId TEXT,
        fileUrl TEXT,
        fileName TEXT,
        fileSize TEXT,
        description TEXT,
        uploadedBy TEXT DEFAULT 'Cô Ning Ning',
        downloadCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return db;
  } catch (e) {
    console.warn("node:sqlite not available or failed to load, falling back to in-memory store:", e);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const hskLevel = url.searchParams.get("hskLevel");
    const classId = url.searchParams.get("classId");
    const search = url.searchParams.get("search");

    const db = getDb();

    if (db) {
      let query = "SELECT * FROM Material WHERE 1=1";
      const params: any[] = [];

      if (type && type !== "ALL") {
        query += " AND type = ?";
        params.push(type);
      }

      if (hskLevel && hskLevel !== "ALL") {
        query += " AND hskLevel = ?";
        params.push(Number(hskLevel));
      }

      if (classId) {
        query += " AND (classId = ? OR classId IS NULL)";
        params.push(classId);
      }

      if (search) {
        query += " AND (title LIKE ? OR description LIKE ? OR fileName LIKE ?)";
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
      }

      query += " ORDER BY createdAt DESC";

      const items = db.prepare(query).all(...params);

      // Compute stats
      const allMaterials = db.prepare("SELECT type FROM Material").all() as Array<{ type: string }>;
      const stats = {
        total: allMaterials.length,
        vocabulary: allMaterials.filter((m) => m.type === "VOCABULARY").length,
        grammar: allMaterials.filter((m) => m.type === "GRAMMAR").length,
        slide: allMaterials.filter((m) => m.type === "SLIDE").length,
        textbook: allMaterials.filter((m) => m.type === "TEXTBOOK").length,
        audio: allMaterials.filter((m) => m.type === "AUDIO").length,
      };

      return NextResponse.json({
        success: true,
        items,
        stats,
      });
    }

    // Fallback: in-memory store
    let filtered = [...inMemoryMaterials];
    if (type && type !== "ALL") {
      filtered = filtered.filter((m) => m.type === type);
    }
    if (hskLevel && hskLevel !== "ALL") {
      filtered = filtered.filter((m) => m.hskLevel === Number(hskLevel));
    }
    if (classId) {
      filtered = filtered.filter((m) => !m.classId || m.classId === classId);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.fileName && m.fileName.toLowerCase().includes(q))
      );
    }

    const stats = {
      total: inMemoryMaterials.length,
      vocabulary: inMemoryMaterials.filter((m) => m.type === "VOCABULARY").length,
      grammar: inMemoryMaterials.filter((m) => m.type === "GRAMMAR").length,
      slide: inMemoryMaterials.filter((m) => m.type === "SLIDE").length,
      textbook: inMemoryMaterials.filter((m) => m.type === "TEXTBOOK").length,
      audio: inMemoryMaterials.filter((m) => m.type === "AUDIO").length,
    };

    return NextResponse.json({
      success: true,
      items: filtered,
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/v1/materials error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, hskLevel, classId, fileName, fileSize, fileUrl, description, uploadedBy } = body;

    if (!title || !type) {
      return NextResponse.json({ success: false, message: "Thiếu tiêu đề hoặc phân loại tài liệu" }, { status: 400 });
    }

    const db = getDb();
    const id = "mat-" + Date.now();
    const nowIso = new Date().toISOString();

    const newItem = {
      id,
      title: title.trim(),
      type,
      hskLevel: Number(hskLevel) || 1,
      classId: classId || null,
      fileUrl: fileUrl || `/materials/${id}.pdf`,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSize: fileSize || "4.5 MB",
      description: description || "",
      uploadedBy: uploadedBy || "Cô Ning Ning",
      downloadCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      const insert = db.prepare(`
        INSERT INTO Material (id, title, type, hskLevel, classId, fileUrl, fileName, fileSize, description, uploadedBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        newItem.id,
        newItem.title,
        newItem.type,
        newItem.hskLevel,
        newItem.classId,
        newItem.fileUrl,
        newItem.fileName,
        newItem.fileSize,
        newItem.description,
        newItem.uploadedBy
      );

      const created = db.prepare("SELECT * FROM Material WHERE id = ?").get(id);
      return NextResponse.json({
        success: true,
        message: "Tải lên tài liệu thành công!",
        item: created,
      });
    }

    inMemoryMaterials.unshift(newItem);
    return NextResponse.json({
      success: true,
      message: "Tải lên tài liệu thành công!",
      item: newItem,
    });
  } catch (error: any) {
    console.error("POST /api/v1/materials error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // query param preferred
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu mã tài liệu cần xóa" }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      const existing = db.prepare("SELECT id, title FROM Material WHERE id = ?").get(id);

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

    const idx = inMemoryMaterials.findIndex((m) => m.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài liệu cần xóa" }, { status: 404 });
    }
    inMemoryMaterials.splice(idx, 1);

    return NextResponse.json({
      success: true,
      message: "Đã xóa tài liệu thành công!",
      deletedId: id,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/materials error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
