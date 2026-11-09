import fs from "fs";
import path from "path";

/**
 * Safe Config & Self-Healing Utilities
 * Đảm bảo hệ thống không bao giờ crash khi file cấu hình bị hỏng, bị xóa nhầm hoặc sai cú pháp JSON.
 */

export function ensureDirExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.error(`[SafeConfig] Không thể tạo thư mục ${dirPath}:`, err);
  }
}

/**
 * Đọc file JSON an toàn tuyệt đối kèm cơ chế tự phục hồi (Self-Healing).
 * Nếu file không tồn tại, trống, hoặc bị lỗi cú pháp:
 * 1. Tự động phục hồi bằng dữ liệu mặc định fallback.
 * 2. Ghi lại file lành lặn để hệ thống tiếp tục hoạt động trơn tru.
 */
export function readSafeJsonFile<T>(filePath: string, fallbackData: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      // Tự động tạo file với dữ liệu mặc định lành lặn
      ensureDirExists(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), "utf-8");
      return fallbackData;
    }

    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) {
      // File rỗng -> tự phục hồi
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), "utf-8");
      return fallbackData;
    }

    const parsed = JSON.parse(content);
    return { ...fallbackData, ...parsed };
  } catch (error) {
    console.warn(`[SafeConfig Auto-Heal] Phát hiện file lỗi cú pháp tại ${filePath}. Đang tự động vá và phục hồi...`, error);
    try {
      // Tạo bản sao lưu file lỗi
      const backupPath = `${filePath}.corrupt_${Date.now()}.bak`;
      if (fs.existsSync(filePath)) {
        fs.renameSync(filePath, backupPath);
      }
      // Ghi đè file chuẩn mới
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), "utf-8");
    } catch (healError) {
      console.error(`[SafeConfig] Lỗi khi thực hiện tự phục hồi ${filePath}:`, healError);
    }
    return fallbackData;
  }
}

/**
 * Ghi file JSON an toàn (Atomic Write với file tạm để chống mất dữ liệu khi gián đoạn)
 */
export function writeSafeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    ensureDirExists(path.dirname(filePath));
    const tempFile = `${filePath}.tmp_${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, filePath);
    return true;
  } catch (error) {
    console.error(`[SafeConfig] Không thể ghi an toàn vào ${filePath}:`, error);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (directWriteError) {
      console.error(`[SafeConfig DirectWrite] Thất bại:`, directWriteError);
      return false;
    }
  }
}

export interface DiagnosticResult {
  fileName: string;
  status: "HEALTHY" | "REPAIRED" | "ERROR";
  message: string;
}

/**
 * Chạy quét toàn bộ các file cấu hình hệ thống và tự động sửa chữa nếu phát hiện sai sót.
 */
export function runSystemDiagnosticsAndSelfHeal(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const baseDir = path.join(process.cwd(), "prisma");
  ensureDirExists(baseDir);

  const targets = [
    {
      name: "seo-config.json",
      path: path.join(baseDir, "seo-config.json"),
      fallback: {
        siteName: "Hanyu - NinjiStudy",
        title: "NinjiStudy · Học Tiếng Trung & Luyện Thi HSK 3.0 Chuẩn Quốc Tế",
        canonicalUrl: "https://ninjistudy.click",
        allowIndexing: true,
      },
    },
    {
      name: "placement-tests.json",
      path: path.join(baseDir, "placement-tests.json"),
      fallback: {
        activeLevel: "HSK1_3",
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      name: "self-study-roadmap.json",
      path: path.join(baseDir, "self-study-roadmap.json"),
      fallback: {
        updatedAt: new Date().toISOString(),
        stages: [],
      },
    },
    {
      name: "guide-config.json",
      path: path.join(baseDir, "guide-config.json"),
      fallback: {
        updatedAt: new Date().toISOString(),
        studentSteps: [],
        teacherSteps: [],
      },
    },
  ];

  for (const t of targets) {
    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ t.path)) {
        writeSafeJsonFile(t.path, t.fallback);
        results.push({
          fileName: t.name,
          status: "REPAIRED",
          message: "File chưa có sẵn -> Đã tự động tạo mới cấu hình chuẩn an toàn.",
        });
      } else {
        const content = fs.readFileSync(/*turbopackIgnore: true*/ t.path, "utf-8").trim();
        JSON.parse(content);
        results.push({
          fileName: t.name,
          status: "HEALTHY",
          message: "Cấu hình toàn vẹn, hợp lệ 100%.",
        });
      }
    } catch {
      writeSafeJsonFile(t.path, t.fallback);
      results.push({
        fileName: t.name,
        status: "REPAIRED",
        message: "File bị hỏng cú pháp -> Đã tự động vá và khôi phục về trạng thái chuẩn.",
      });
    }
  }

  // Đảm bảo thư mục lưu ảnh upload tồn tại
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "branding");
  ensureDirExists(uploadsDir);

  return results;
}
