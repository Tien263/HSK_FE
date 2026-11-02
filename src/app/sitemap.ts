import { MetadataRoute } from "next";
import { getSeoConfig } from "@/lib/seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const seo = getSeoConfig();
  const baseUrl = (seo.canonicalUrl || "https://ninjistudy.click").replace(/\/$/, "");
  const now = new Date();

  const entries = (seo.sitemapUrls && seo.sitemapUrls.length > 0)
    ? seo.sitemapUrls
    : [
        { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
        { path: "/login", changeFrequency: "monthly" as const, priority: 0.8 },
        { path: "/register", changeFrequency: "monthly" as const, priority: 0.8 },
        { path: "/onboarding", changeFrequency: "monthly" as const, priority: 0.7 },
      ];

  return entries.map((item) => {
    const rawPath = item.path || "/";
    const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const url = cleanPath === "/" ? baseUrl : `${baseUrl}${cleanPath}`;

    return {
      url,
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    };
  });
}
