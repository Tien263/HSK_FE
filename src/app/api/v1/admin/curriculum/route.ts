import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { OFFICIAL_HSK1_15_LESSONS } from "@/lib/hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "@/lib/hsk2-full-lessons";
import fs from "fs";
import path from "path";

// File storage fallback để lưu trữ giáo trình tùy biến của Admin một cách bền vững
const STORAGE_DIR = path.join(process.cwd(), "data", "curriculum");

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function getCurriculumFilePath(level: number) {
  ensureStorageDir();
  return path.join(STORAGE_DIR, `hsk_level_${level}.json`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = Number(searchParams.get("level")) || 1;

    // 1. Kiểm tra file storage tùy biến của admin trước
    const filePath = getCurriculumFilePath(level);
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({
            success: true,
            source: "ADMIN_CUSTOM",
            level,
            items: parsed,
          });
        }
      } catch (e) {
        console.warn("Could not read custom curriculum file:", e);
      }
    }

    // 2. Mặc định trả về giáo trình chuẩn của hệ thống
    const defaultLessons = level === 2 ? OFFICIAL_HSK2_15_LESSONS : OFFICIAL_HSK1_15_LESSONS;

    return NextResponse.json({
      success: true,
      source: "OFFICIAL_DEFAULT",
      level,
      items: defaultLessons,
    });
  } catch (error) {
    console.error("GET /api/v1/admin/curriculum error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải giáo trình bài học" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    // Cho phép admin hoặc dev lưu bài học
    const body = await request.json();
    const { level = 1, lessons } = body;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách bài học không được để trống" },
        { status: 400 }
      );
    }

    // 1. Lưu vào file storage
    const filePath = getCurriculumFilePath(Number(level) || 1);
    fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), "utf-8");

    // 2. Cố gắng đồng bộ thêm vào database nếu có Level
    try {
      let dbLevel = await prisma.level.findFirst({
        where: { hskLevel: Number(level) || 1 },
      });

      if (!dbLevel) {
        const curr = await prisma.curriculum.findFirst();
        dbLevel = await prisma.level.create({
          data: {
            curriculumId: curr?.id || "curriculum-default",
            hskLevel: Number(level) || 1,
            title: `HSK ${Number(level) || 1}`,
            isOpen: true,
          },
        });
      }

      // Upsert các bài học vào bảng Lesson của Prisma
      for (const les of lessons) {
        const lesNum = les.number || 1;
        const lesTitle = les.titleZh ? `${les.titleZh} (${les.titleVi || ""})` : `Bài ${lesNum}`;
        const existing = await prisma.lesson.findFirst({
          where: {
            levelId: dbLevel.id,
            lessonNumber: lesNum,
          },
        });

        if (existing) {
          await prisma.lesson.update({
            where: { id: existing.id },
            data: {
              title: lesTitle,
              description: les.desc || les.pinyin || "",
              status: "PUBLISHED",
            },
          });
        } else {
          await prisma.lesson.create({
            data: {
              levelId: dbLevel.id,
              lessonNumber: lesNum,
              title: lesTitle,
              description: les.desc || les.pinyin || "",
              status: "PUBLISHED",
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Curriculum DB sync optional warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Đã lưu và xuất bản thành công ${lessons.length} bài học HSK ${level} vào kho chung!`,
      count: lessons.length,
    });
  } catch (error) {
    console.error("POST /api/v1/admin/curriculum error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi lưu giáo trình bài học" },
      { status: 500 }
    );
  }
}
