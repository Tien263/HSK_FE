import { MetadataRoute } from "next";
import { getSeoConfig } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoConfig();
  const baseUrl = (seo.canonicalUrl || "https://ninjistudy.click").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: seo.allowIndexing ? "/" : undefined,
      disallow: seo.allowIndexing
        ? ["/admin/", "/api/", "/t/"]
        : ["/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
