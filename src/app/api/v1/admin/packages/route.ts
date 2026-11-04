import { NextResponse } from "next/server";
import { getPackages, savePackages, PackageItem } from "@/lib/sepay";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const packages = getPackages();
    return NextResponse.json({ success: true, packages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const { action, packageData, packageId } = body;

    let packages = getPackages();

    if (action === "create") {
      const newPkg: PackageItem = {
        id: `pkg_${Date.now()}`,
        name: packageData.name || "Gói học HSK mới",
        tagline: packageData.tagline || "",
        levelRange: packageData.levelRange || "HSK 1 - 3",
        price: Number(packageData.price) || 0,
        originalPrice: packageData.originalPrice ? Number(packageData.originalPrice) : undefined,
        durationDays: Number(packageData.durationDays) || 30,
        dailyAiQuota: Number(packageData.dailyAiQuota) || 50,
        features: Array.isArray(packageData.features) ? packageData.features : [],
        recommended: Boolean(packageData.recommended),
        isActive: packageData.isActive !== undefined ? Boolean(packageData.isActive) : true,
        order: packages.length + 1,
      };
      packages.push(newPkg);
      savePackages(packages);
      return NextResponse.json({ success: true, message: "Tạo gói học mới thành công!", package: newPkg });
    }

    if (action === "update") {
      const idx = packages.findIndex((p) => p.id === packageData.id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Không tìm thấy gói học" }, { status: 404 });
      }
      packages[idx] = {
        ...packages[idx],
        ...packageData,
        price: Number(packageData.price) || 0,
        originalPrice: packageData.originalPrice ? Number(packageData.originalPrice) : undefined,
        durationDays: Number(packageData.durationDays) || 30,
        dailyAiQuota: Number(packageData.dailyAiQuota) || 50,
      };
      savePackages(packages);
      return NextResponse.json({ success: true, message: "Cập nhật gói học thành công!", package: packages[idx] });
    }

    if (action === "delete") {
      packages = packages.filter((p) => p.id !== packageId);
      savePackages(packages);
      return NextResponse.json({ success: true, message: "Đã xóa gói học!", packages });
    }

    if (action === "reorder") {
      if (Array.isArray(body.packages)) {
        packages = body.packages;
        savePackages(packages);
        return NextResponse.json({ success: true, message: "Cập nhật thứ tự gói học thành công!" });
      }
    }

    return NextResponse.json({ success: false, error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
