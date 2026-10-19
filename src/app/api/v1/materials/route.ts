import { NextResponse } from "next/server";
// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

function getDb() {
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
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const hskLevel = url.searchParams.get("hskLevel");
    const classId = url.searchParams.get("classId");
    const search = url.searchParams.get("search");

    const db = getDb();

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

    const insert = db.prepare(`
      INSERT INTO Material (id, title, type, hskLevel, classId, fileUrl, fileName, fileSize, description, uploadedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      title.trim(),
      type,
      Number(hskLevel) || 1,
      classId || null,
      fileUrl || `/materials/${id}.pdf`,
      fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSize || "4.5 MB",
      description || "",
      uploadedBy || "Cô Ning Ning"
    );

    const created = db.prepare("SELECT * FROM Material WHERE id = ?").get(id);

    return NextResponse.json({
      success: true,
      message: "Tải lên tài liệu thành công!",
      item: created,
    });
  } catch (error: any) {
    console.error("POST /api/v1/materials error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
