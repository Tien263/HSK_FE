import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// Vietnam calendar dates keep week boundaries consistent with the student interface.
function dayKey(date: Date) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); }
export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth || auth.role !== "STUDENT") return NextResponse.json({ success: false }, { status: 401 });
  const level = Number(new URL(request.url).searchParams.get("level"));
  if (!Number.isInteger(level) || level < 1 || level > 9) return NextResponse.json({ success: false }, { status: 400 });
  try {
    const today = new Date(`${dayKey(new Date())}T00:00:00+07:00`);
    const monday = new Date(today); monday.setUTCDate(monday.getUTCDate() - (new Date(`${dayKey(today)}T12:00:00Z`).getUTCDay() + 6) % 7);
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setUTCDate(date.getUTCDate() + index); return dayKey(date); });
    const recent = new Date(); recent.setDate(recent.getDate() - 30);
    const [personal, publicLogs] = await Promise.all([
      prisma.auditLog.findMany({ where: { userId: auth.id, action: "SELF_STUDY_PROGRESS_SYNC", entity: `SelfStudyProgress:${level}` }, select: { details: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
      prisma.auditLog.findMany({ where: { action: "SELF_STUDY_PROGRESS_SYNC", entity: `SelfStudyProgress:${level}`, createdAt: { gte: recent } }, select: { details: true, userId: true }, orderBy: { createdAt: "desc" }, take: 5000 }),
    ]);
    const completed = new Map<number, string>();
    for (const log of personal) {
      try { const number = JSON.parse(log.details || "{}").completedLesson; if (Number.isInteger(number) && number > 0 && !completed.has(number)) completed.set(number, dayKey(log.createdAt)); } catch { /* Ignore malformed legacy records. */ }
    }
    const users = new Map<number, Set<string>>();
    for (const log of publicLogs) {
      try { const number = JSON.parse(log.details || "{}").completedLesson; if (Number.isInteger(number) && number > 0) { if (!users.has(number)) users.set(number, new Set()); users.get(number)!.add(log.userId); } } catch { /* Ignore malformed legacy records. */ }
    }
    return NextResponse.json({ success: true, level, completed: [...completed].map(([number, date]) => ({ number, date })), days, popular: [...users].map(([number, learners]) => ({ number, learners: learners.size })).sort((a, b) => b.learners - a.learners || a.number - b.number) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ success: false, message: "Chưa tải được thống kê học tập." }, { status: 500 }); }
}
