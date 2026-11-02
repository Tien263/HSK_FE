import { NextResponse } from "next/server";
import { getSeoConfig, saveSeoConfig, SeoConfig, SitemapUrlEntry } from "@/lib/seo-config";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const config = getSeoConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lấy cấu hình SEO." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const {
      siteName,
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      googleVerificationCode,
      allowIndexing,
      sitemapUrls,
    } = body;

    const updatedConfig: Partial<SeoConfig> = {};

    if (typeof siteName === "string") updatedConfig.siteName = siteName.trim();
    if (typeof title === "string") updatedConfig.title = title.trim();
    if (typeof description === "string") updatedConfig.description = description.trim();
    if (typeof keywords === "string") updatedConfig.keywords = keywords.trim();
    if (typeof canonicalUrl === "string") updatedConfig.canonicalUrl = canonicalUrl.trim();
    if (typeof ogImage === "string") updatedConfig.ogImage = ogImage.trim();
    if (typeof googleVerificationCode === "string") {
      // Nếu admin dán cả thẻ meta <meta name="google-site-verification" content="XYZ" />
      // thì tự động trích xuất chuỗi content="XYZ"
      let cleanCode = googleVerificationCode.trim();
      const match = cleanCode.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        cleanCode = match[1];
      }
      updatedConfig.googleVerificationCode = cleanCode;
    }
    if (typeof allowIndexing === "boolean") updatedConfig.allowIndexing = allowIndexing;

    if (Array.isArray(sitemapUrls)) {
      const validSitemapUrls: SitemapUrlEntry[] = sitemapUrls
        .filter((item: any) => item && typeof item.path === "string" && item.path.trim().length > 0)
        .map((item: any) => ({
          path: item.path.trim(),
          changeFrequency: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].includes(item.changeFrequency)
            ? item.changeFrequency
            : "monthly",
          priority: typeof item.priority === "number" && item.priority >= 0.1 && item.priority <= 1.0
            ? Math.round(item.priority * 10) / 10
            : 0.8,
        }));
      updatedConfig.sitemapUrls = validSitemapUrls;
    }

    const saved = saveSeoConfig(updatedConfig);

    // Ghi nhật ký kiểm toán (AuditLog)
    try {
      if (authCheck.user?.id) {
        await prisma.auditLog.create({
          data: {
            userId: authCheck.user.id,
            action: "UPDATE_SEO_CONFIG",
            entity: "SEO_MANAGEMENT",
            details: JSON.stringify({
              title: saved.title,
              canonicalUrl: saved.canonicalUrl,
              sitemapCount: saved.sitemapUrls.length,
            }),
          },
        });
      }
    } catch (auditErr) {
      console.warn("Không thể ghi audit log SEO:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình SEO & Sitemap thành công!",
      config: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi lưu cấu hình SEO." },
      { status: 500 }
    );
  }
}
