import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dictionarySameOrigin, getDictionaryAdmin } from "@/lib/dictionary-session";
import { dictionaryWhere, normalizeDictionaryPinyin } from "@/lib/dictionary-search";
import type { Prisma } from "@/generated/prisma";

const headers = { "Cache-Control": "no-store" };
async function listDictionary(request: Request) {
  if (!await getDictionaryAdmin(request)) return NextResponse.json({ message: "Vui lòng đăng nhập tài khoản admin." }, { status: 403, headers });
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") || "").trim();
  const status = params.get("status") || "GENERATED";
  const page = Number(params.get("page") || 1);
  if (q.length > 80 || !["ALL", "MISSING", "GENERATED", "REVIEWED"].includes(status) || !Number.isInteger(page) || page < 1 || page > 10000) return NextResponse.json({ message: "Bộ lọc không hợp lệ." }, { status: 400, headers });
  const where: Prisma.DictionaryEntryWhereInput = {
    ...(q ? dictionaryWhere(q) : {}),
    ...(status === "ALL" ? {} : { meaningViStatus: status as "MISSING" | "GENERATED" | "REVIEWED" }),
  };
  const [items, total, groups] = await prisma.$transaction([
    prisma.dictionaryEntry.findMany({ where, skip: (page - 1) * 25, take: 25, orderBy: { id: "asc" } }),
    prisma.dictionaryEntry.count({ where }),
    prisma.dictionaryEntry.groupBy({ by: ["meaningViStatus"], orderBy: { meaningViStatus: "asc" }, _count: { _all: true } }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: 25, counts: Object.fromEntries(groups.map((group) => [group.meaningViStatus, typeof group._count === "object" ? group._count._all || 0 : 0])) }, { headers });
}

async function updateDictionary(request: Request) {
  if (!dictionarySameOrigin(request)) return NextResponse.json({ message: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers });
  const admin = await getDictionaryAdmin(request);
  if (!admin) return NextResponse.json({ message: "Chỉ admin có quyền sửa từ điển." }, { status: 403, headers });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "JSON không hợp lệ." }, { status: 400, headers }); }
  const { id, revision, definitionsVi, approve } = body || {};
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(revision) || revision < 0 || typeof approve !== "boolean" || !Array.isArray(definitionsVi) || definitionsVi.length > 40 || definitionsVi.some((item: unknown) => typeof item !== "string" || !item.trim() || item.length > 1500) || (approve && definitionsVi.length === 0)) return NextResponse.json({ message: "Nghĩa Việt hoặc phiên bản sửa không hợp lệ." }, { status: 400, headers });
  const cleaned = [...new Set<string>(definitionsVi.map((value: string) => value.trim()))];
  const item = await prisma.$transaction(async (transaction) => {
    const before = await transaction.dictionaryEntry.findUnique({ where: { id } });
    if (!before) return "MISSING" as const;
    const updated = await transaction.dictionaryEntry.updateMany({ where: { id, meaningViRevision: revision }, data: {
      definitionsVi: cleaned, meaningViSearch: normalizeDictionaryPinyin(cleaned.join(" | ")),
      meaningViStatus: cleaned.length ? (approve ? "REVIEWED" : "GENERATED") : "MISSING",
      meaningViSource: `Admin: ${admin.name}`, meaningViUpdatedAt: new Date(), meaningViRevision: { increment: 1 },
    } });
    if (updated.count === 0) return "CONFLICT" as const;
    await transaction.auditLog.create({ data: { userId: admin.id, action: approve ? "DICTIONARY_APPROVE" : "DICTIONARY_EDIT", entity: `DictionaryEntry:${id}`, details: JSON.stringify({ before: before.definitionsVi, after: cleaned, previousStatus: before.meaningViStatus }) } });
    return transaction.dictionaryEntry.findUnique({ where: { id } });
  });
  if (item === "MISSING") return NextResponse.json({ message: "Không tìm thấy từ." }, { status: 404, headers });
  if (item === "CONFLICT") return NextResponse.json({ message: "Từ đã được sửa ở phiên khác. Hãy tải lại trước khi lưu." }, { status: 409, headers });
  return NextResponse.json({ item }, { headers });
}

export async function GET(request: Request) {
  try { return await listDictionary(request); }
  catch { return NextResponse.json({ message: "Chưa tải được dữ liệu quản trị từ điển." }, { status: 503, headers }); }
}

export async function PATCH(request: Request) {
  try { return await updateDictionary(request); }
  catch { return NextResponse.json({ message: "Chưa lưu được nghĩa Việt. Vui lòng thử lại." }, { status: 503, headers }); }
}
