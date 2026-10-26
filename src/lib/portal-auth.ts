import {unstable_rethrow} from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getDictionaryUser, dictionarySameOrigin } from "./dictionary-session";

export class PortalError extends Error { constructor(public status: number, message: string) { super(message); } }
export type PortalUser = NonNullable<Awaited<ReturnType<typeof getDictionaryUser>>>;
export async function portalUser(request: Request) {
  const user = await getDictionaryUser(request);
  if (!user) throw new PortalError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return user;
}
export function teacherOnly(user: PortalUser) { if (!["TEACHER", "ADMIN"].includes(user.role)) throw new PortalError(403, "Chỉ giáo viên có quyền thực hiện thao tác này."); }
export async function classAccess(user: PortalUser, classId: string, write = false) {
  const classroom = await prisma.class.findUnique({ where: { id: classId } });
  if (!classroom) throw new PortalError(404, "Không tìm thấy lớp học.");
  if (user.role === "ADMIN" || (user.role === "TEACHER" && classroom.teacherId === user.id)) return classroom;
  if (!write && user.role === "STUDENT" && await prisma.classStudent.findFirst({ where: { classId, studentId: user.id, status: "APPROVED" } })) return classroom;
  throw new PortalError(403, "Bạn không có quyền truy cập lớp học này.");
}
export async function portalResponse(request: Request, handler: (user: PortalUser) => Promise<Response>, write = false) {
  try {
    if (write && !dictionarySameOrigin(request)) throw new PortalError(403, "Nguồn yêu cầu không hợp lệ.");
    return await handler(await portalUser(request));
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof PortalError) return NextResponse.json({ success: false, message: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    console.error("Portal request failed", error instanceof Error ? error.name : "Unknown");
    return NextResponse.json({ success: false, message: "Chưa xử lý được yêu cầu. Vui lòng thử lại." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
export function portalJson(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } }); }
export function textField(value: unknown, label: string, required = false, max = 1000) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new PortalError(400, `${label} không hợp lệ.`);
  return value.trim();
}
export async function jsonBody(request: Request) { try { const body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error(); return body as Record<string, unknown>; } catch { throw new PortalError(400, "Nội dung JSON không hợp lệ."); } }
