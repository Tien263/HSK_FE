import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { ensureDirExists } from "@/lib/safe-config";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const formData = await request.formData();
    const file = formData.get("file");
    const targetAsset = String(formData.get("targetAsset") || "CUSTOM").toUpperCase();

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn một file ảnh hợp lệ." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Dung lượng ảnh tối đa là 10 MB." },
        { status: 400 }
      );
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const allowed = ["png", "jpg", "jpeg", "webp", "svg", "ico"];
    if (!allowed.includes(rawExt)) {
      return NextResponse.json(
        { success: false, message: "Định dạng file không hỗ trợ. Vui lòng chọn PNG, JPG, WEBP hoặc SVG." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalPublicUrl = "";
    const publicDir = path.join(process.cwd(), "public");

    // Xử lý các vị trí ảnh cốt lõi nếu chỉ định rõ
    if (targetAsset === "OG_IMAGE") {
      // Cập nhật ảnh đại diện SEO Facebook / Zalo
      ensureDirExists(path.join(publicDir, "theme"));
      const p1 = path.join(publicDir, "og-image.png");
      const p2 = path.join(publicDir, "theme", "og-social-preview.png");
      fs.writeFileSync(p1, buffer);
      fs.writeFileSync(p2, buffer);
      finalPublicUrl = `/og-image.png?v=${Date.now()}`;
    } else if (targetAsset === "APP_ICON_192") {
      // Cập nhật Icon PWA 192x192
      ensureDirExists(path.join(publicDir, "brand"));
      fs.writeFileSync(path.join(publicDir, "brand", "app-icon-192.png"), buffer);
      fs.writeFileSync(path.join(publicDir, "icon-192.png"), buffer);
      finalPublicUrl = `/brand/app-icon-192.png?v=${Date.now()}`;
    } else if (targetAsset === "APP_ICON_512") {
      // Cập nhật Icon PWA 512x512
      ensureDirExists(path.join(publicDir, "brand"));
      fs.writeFileSync(path.join(publicDir, "brand", "app-icon-512.png"), buffer);
      fs.writeFileSync(path.join(publicDir, "icon-512.png"), buffer);
      finalPublicUrl = `/brand/app-icon-512.png?v=${Date.now()}`;
    } else if (targetAsset === "APPLE_TOUCH_ICON") {
      // Cập nhật Icon Apple màn hình iPhone
      fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), buffer);
      finalPublicUrl = `/apple-touch-icon.png?v=${Date.now()}`;
    } else {
      // Tải lên ảnh tùy chỉnh
      const uploadDir = path.join(publicDir, "uploads", "branding");
      ensureDirExists(uploadDir);
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase()
        .slice(0, 100);
      const safeName = `${Date.now()}_${cleanFileName}`;
      const destPath = path.join(uploadDir, safeName);
      fs.writeFileSync(destPath, buffer);
      finalPublicUrl = `/uploads/branding/${safeName}`;
    }

    return NextResponse.json({
      success: true,
      url: finalPublicUrl,
      targetAsset,
      message: "Tải lên và cập nhật hình ảnh thành công!",
    });
  } catch (error: any) {
    console.error("Lỗi upload branding:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xử lý file tải lên." },
      { status: 500 }
    );
  }
}
