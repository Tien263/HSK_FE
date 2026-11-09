import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  PlacementQuestion,
  PlacementTestConfig,
  PlacementScoreThresholds,
  DEFAULT_PLACEMENT_TESTS,
  DEFAULT_PLACEMENT_THRESHOLDS,
} from "./placement-test-types";

export type { PlacementQuestion, PlacementTestConfig, PlacementScoreThresholds };
export { DEFAULT_PLACEMENT_TESTS, DEFAULT_PLACEMENT_THRESHOLDS };

const CONFIG_FILE = path.join(process.cwd(), "prisma", "placement-tests.json");
const DB_PLACEMENT_LEVEL_ID = 99; // Dedicated ID in CurriculumContent table for placement tests

let memoryConfig: PlacementTestConfig = { ...DEFAULT_PLACEMENT_TESTS };

/**
 * Đọc cấu hình Placement Test từ Database (Supabase PostgreSQL),
 * fallback sang file JSON và fallback về giá trị mặc định.
 */
export async function getPlacementQuestionsAsync(): Promise<PlacementTestConfig> {
  try {
    const record = await prisma.curriculumContent.findUnique({
      where: { hskLevel: DB_PLACEMENT_LEVEL_ID },
    });

    if (record && !record.isDeleted && record.lessons) {
      const data = record.lessons as any;
      if (Array.isArray(data.hsk1_3) && data.hsk1_3.length > 0) {
        const config: PlacementTestConfig = {
          hsk1_3: data.hsk1_3,
          hsk4_6: Array.isArray(data.hsk4_6) && data.hsk4_6.length > 0 ? data.hsk4_6 : DEFAULT_PLACEMENT_TESTS.hsk4_6,
          thresholds: data.thresholds || DEFAULT_PLACEMENT_THRESHOLDS,
        };
        memoryConfig = config;
        // Tự động ghi lại file cache cục bộ nếu chưa có
        try {
          const dir = path.dirname(CONFIG_FILE);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
        } catch {}
        return config;
      }
    }
  } catch (dbErr) {
    console.warn("[PlacementConfig] Lỗi đọc từ Database, đang thử file JSON cục bộ:", dbErr);
  }

  // Fallback đọc từ file JSON
  return getPlacementQuestions();
}

/**
 * Đọc đồng bộ từ cache / file JSON
 */
export function getPlacementQuestions(): PlacementTestConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      const config: PlacementTestConfig = {
        hsk1_3: Array.isArray(parsed.hsk1_3) && parsed.hsk1_3.length > 0 ? parsed.hsk1_3 : DEFAULT_PLACEMENT_TESTS.hsk1_3,
        hsk4_6: Array.isArray(parsed.hsk4_6) && parsed.hsk4_6.length > 0 ? parsed.hsk4_6 : DEFAULT_PLACEMENT_TESTS.hsk4_6,
        thresholds: parsed.thresholds || DEFAULT_PLACEMENT_THRESHOLDS,
      };
      memoryConfig = config;
      return config;
    }
  } catch (err) {
    console.error("Lỗi khi đọc placement-tests.json:", err);
  }
  return memoryConfig;
}

/**
 * Lưu cấu hình Placement Test đồng thời vào Database PostgreSQL và file JSON
 */
export async function savePlacementQuestionsAsync(newConfig: Partial<PlacementTestConfig>): Promise<PlacementTestConfig> {
  const current = await getPlacementQuestionsAsync();
  const updated: PlacementTestConfig = {
    hsk1_3: newConfig.hsk1_3 && newConfig.hsk1_3.length > 0 ? newConfig.hsk1_3 : current.hsk1_3,
    hsk4_6: newConfig.hsk4_6 && newConfig.hsk4_6.length > 0 ? newConfig.hsk4_6 : current.hsk4_6,
    thresholds: newConfig.thresholds || current.thresholds || DEFAULT_PLACEMENT_THRESHOLDS,
  };
  memoryConfig = updated;

  // 1. Lưu vào Database PostgreSQL
  try {
    await prisma.curriculumContent.upsert({
      where: { hskLevel: DB_PLACEMENT_LEVEL_ID },
      update: {
        lessons: updated as any,
        revision: { increment: 1 },
        isDeleted: false,
      },
      create: {
        hskLevel: DB_PLACEMENT_LEVEL_ID,
        lessons: updated as any,
        revision: 1,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[PlacementConfig] Lỗi khi lưu vào Database Prisma:", dbErr);
  }

  // 2. Ghi ra file JSON cục bộ
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (fileErr) {
    console.error("[PlacementConfig] Lỗi khi ghi placement-tests.json:", fileErr);
  }

  return updated;
}

/**
 * Hàm đồng bộ để tương thích ngược
 */
export function savePlacementQuestions(newConfig: Partial<PlacementTestConfig>): PlacementTestConfig {
  const current = getPlacementQuestions();
  const updated: PlacementTestConfig = {
    hsk1_3: newConfig.hsk1_3 && newConfig.hsk1_3.length > 0 ? newConfig.hsk1_3 : current.hsk1_3,
    hsk4_6: newConfig.hsk4_6 && newConfig.hsk4_6.length > 0 ? newConfig.hsk4_6 : current.hsk4_6,
    thresholds: newConfig.thresholds || current.thresholds || DEFAULT_PLACEMENT_THRESHOLDS,
  };
  memoryConfig = updated;

  // Background async save to DB
  prisma.curriculumContent.upsert({
    where: { hskLevel: DB_PLACEMENT_LEVEL_ID },
    update: {
      lessons: updated as any,
      revision: { increment: 1 },
      isDeleted: false,
    },
    create: {
      hskLevel: DB_PLACEMENT_LEVEL_ID,
      lessons: updated as any,
      revision: 1,
      isDeleted: false,
    },
  }).catch((err) => console.warn("[PlacementConfig Sync] Lỗi background upsert:", err));

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Lỗi khi ghi placement-tests.json:", err);
  }

  return updated;
}
