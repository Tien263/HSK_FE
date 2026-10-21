import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlMasked = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@")
      : null;

    // Test a lightweight database query
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      dbUrlConfigured: hasDbUrl,
      dbHost: dbUrlMasked ? dbUrlMasked.split("@")[1]?.split("/")[0] : null,
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check database error:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        dbUrlConfigured: !!process.env.DATABASE_URL,
        errorMessage: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
