import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ninjistudy.click";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/t/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
