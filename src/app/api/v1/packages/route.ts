import { NextResponse } from "next/server";
import { getPackages, getUserSubscription } from "@/lib/sepay";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const packages = getPackages().filter((p) => p.isActive);

    let currentSubscription = null;
    const authCheck = await requireAuth(request);
    if (authCheck.ok && authCheck.user) {
      currentSubscription = getUserSubscription(authCheck.user.id);
    }

    return NextResponse.json({
      success: true,
      packages,
      currentSubscription,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
