import { NextResponse } from "next/server";
import { getPackages, getUserSubscription, getSepayConfig } from "@/lib/sepay";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const packages = getPackages().filter((p) => p.isActive);
    const sepayConfig = getSepayConfig();

    let currentSubscription = null;
    const authCheck = await requireAuth(request);
    if (authCheck.ok && authCheck.user) {
      currentSubscription = getUserSubscription(authCheck.user.id);
    }

    return NextResponse.json({
      success: true,
      packages,
      currentSubscription,
      placements: sepayConfig.placements,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
