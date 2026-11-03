import fs from "fs";
import path from "path";
import { PlacementQuestion, PlacementTestConfig, DEFAULT_PLACEMENT_TESTS } from "./placement-test-types";

export type { PlacementQuestion, PlacementTestConfig };
export { DEFAULT_PLACEMENT_TESTS };

const CONFIG_FILE = path.join(process.cwd(), "prisma", "placement-tests.json");

let memoryConfig: PlacementTestConfig = { ...DEFAULT_PLACEMENT_TESTS };

export function getPlacementQuestions(): PlacementTestConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        hsk1_3: Array.isArray(parsed.hsk1_3) && parsed.hsk1_3.length > 0 ? parsed.hsk1_3 : DEFAULT_PLACEMENT_TESTS.hsk1_3,
        hsk4_6: Array.isArray(parsed.hsk4_6) && parsed.hsk4_6.length > 0 ? parsed.hsk4_6 : DEFAULT_PLACEMENT_TESTS.hsk4_6,
      };
    }
  } catch (err) {
    console.error("Lỗi khi đọc placement-tests.json:", err);
  }
  return memoryConfig;
}

export function savePlacementQuestions(newConfig: Partial<PlacementTestConfig>): PlacementTestConfig {
  try {
    const current = getPlacementQuestions();
    const updated: PlacementTestConfig = {
      hsk1_3: newConfig.hsk1_3 || current.hsk1_3,
      hsk4_6: newConfig.hsk4_6 || current.hsk4_6,
    };
    memoryConfig = updated;

    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Lỗi khi ghi placement-tests.json:", err);
    return memoryConfig;
  }
}
