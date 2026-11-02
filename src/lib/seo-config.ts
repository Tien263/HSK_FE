import fs from "fs";
import path from "path";

export interface SitemapUrlEntry {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export interface SeoConfig {
  siteName: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  googleVerificationCode: string;
  allowIndexing: boolean;
  sitemapUrls: SitemapUrlEntry[];
}

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteName: "Hanyu - NinjiStudy",
  title: "NinjiStudy · Học Tiếng Trung & Luyện Thi HSK 3.0 Chuẩn Quốc Tế",
  description: "Nền tảng học tiếng Trung và luyện thi HSK 1-6 chuẩn mới 3.0. Hệ thống lộ trình tự học, từ vựng thông minh, tra cứu chiết tự chữ Hán và luyện thi trực tuyến phong cách Thủy Mặc.",
  keywords: "ninjistudy, ninjistudy.click, học tiếng trung, luyện thi hsk, hsk 3.0, từ vựng hsk, ngữ pháp tiếng trung, chiết tự hán tự, tiếng trung cô ning ning",
  canonicalUrl: "https://ninjistudy.click",
  ogImage: "https://ninjistudy.click/theme/bg-auth-master.jpg",
  googleVerificationCode: "",
  allowIndexing: true,
  sitemapUrls: [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/login", changeFrequency: "monthly", priority: 0.8 },
    { path: "/register", changeFrequency: "monthly", priority: 0.8 },
    { path: "/onboarding", changeFrequency: "monthly", priority: 0.7 },
  ],
};

const CONFIG_FILE = path.join(process.cwd(), "prisma", "seo-config.json");

let memorySeoConfig: SeoConfig = { ...DEFAULT_SEO_CONFIG };

export function getSeoConfig(): SeoConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_SEO_CONFIG,
        ...parsed,
        sitemapUrls: Array.isArray(parsed.sitemapUrls) && parsed.sitemapUrls.length > 0
          ? parsed.sitemapUrls
          : DEFAULT_SEO_CONFIG.sitemapUrls,
      };
    }
  } catch (error) {
    console.error("Lỗi khi đọc seo-config.json:", error);
  }
  return memorySeoConfig;
}

export function saveSeoConfig(config: Partial<SeoConfig>): SeoConfig {
  try {
    const current = getSeoConfig();
    const updated: SeoConfig = {
      ...current,
      ...config,
      sitemapUrls: config.sitemapUrls || current.sitemapUrls,
    };
    memorySeoConfig = updated;

    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    console.error("Lỗi khi ghi seo-config.json:", error);
    return memorySeoConfig;
  }
}
