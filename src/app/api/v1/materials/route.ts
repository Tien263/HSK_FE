import { prisma } from "@/lib/prisma";
import { classAccess, portalResponse, portalJson, PortalError, teacherOnly, textField } from "@/lib/portal-auth";
import { materialSelection } from "@/lib/teaching-materials";
export function GET(request: Request) { return portalResponse(request, async user => {
  const classId = new URL(request.url).searchParams.get("classId");
  if (classId) await classAccess(user, classId); else teacherOnly(user);
  const items = await prisma.teachingMaterial.findMany({ where: classId ? { classes: { some: { classId } } } : { teacherId: user.id }, select: materialSelection, orderBy: { createdAt: "desc" } });
  return portalJson({ success: true, items: items.map(item => ({ ...item, canManage: item.teacherId===user.id||user.role==="ADMIN", classes:user.role==="STUDENT"?item.classes.filter(share=>share.classId===classId):item.classes, downloadUrl: `/api/v1/materials/${item.id}/file` })) });
}); }
export function POST(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user);
  const contentType = request.headers.get("content-type") || "";

  // 1. Hỗ trợ upload qua Cloudinary CDN (JSON payload)
  if (contentType.includes("application/json")) {
    const body = await request.json();
    const title = textField(body.title, "Tên tài liệu", true, 300);
    const description = textField(body.description || "", "Mô tả", false, 3000);
    const fileUrl = String(body.fileUrl || "").trim();
    if (!fileUrl || (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://"))) {
      throw new PortalError(400, "Đường dẫn file tài liệu không hợp lệ.");
    }
    const fileName = String(body.fileName || "tai_lieu").replace(/[\r\n/\\]/g, "_").slice(0, 240);
    const mimeType = String(body.mimeType || "application/octet-stream").slice(0, 100);
    const byteSize = Number(body.byteSize) || 1024;
    const classIds: string[] = Array.isArray(body.classIds) ? body.classIds.map((c: unknown) => String(c)) : [];
    if (classIds.length > 100 || new Set(classIds).size !== classIds.length) {
      throw new PortalError(400, "Danh sách lớp không hợp lệ.");
    }
    for (const classId of classIds) await classAccess(user, classId, true);

    const item = await prisma.teachingMaterial.create({
      data: {
        teacherId: user.id,
        title,
        description,
        fileName,
        mimeType,
        byteSize,
        content: Buffer.from(fileUrl, "utf8"),
        classes: { create: classIds.map((classId: string) => ({ classId })) },
      },
      select: materialSelection,
    });
    return portalJson({ success: true, item: { ...item, downloadUrl: `/api/v1/materials/${item.id}/file` } }, 201);
  }

  // 2. Hỗ trợ form-data truyền thống
  if (Number(request.headers.get("content-length")) > 17 * 1024 * 1024) throw new PortalError(413, "File tối đa 15 MB.");
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > 15 * 1024 * 1024) throw new PortalError(400, "Chọn file có dung lượng từ 1 byte đến 15 MB.");
  const allowed: Record<string, string> = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv", txt: "text/plain", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
  const mimeType = allowed[file.name.split(".").pop()?.toLowerCase() || ""];
  if (!mimeType) throw new PortalError(400, "Hỗ trợ PDF, Word, PowerPoint, Excel, CSV, TXT, ảnh và âm thanh.");
  const title = textField(form.get("title"), "Tên tài liệu", true, 300); const description = textField(form.get("description") || "", "Mô tả", false, 3000);
  const classIds = form.getAll("classIds").map(String);
  if (classIds.length > 100 || new Set(classIds).size !== classIds.length) throw new PortalError(400, "Danh sách lớp không hợp lệ.");
  for (const classId of classIds) await classAccess(user, classId, true);
  const item = await prisma.teachingMaterial.create({ data: { teacherId: user.id, title, description, fileName: file.name.replace(/[\r\n/\\]/g, "_").slice(0, 240), mimeType, byteSize: file.size, content: Buffer.from(await file.arrayBuffer()), classes: { create: classIds.map(classId => ({ classId })) } }, select: materialSelection });
  return portalJson({ success: true, item: { ...item, downloadUrl: `/api/v1/materials/${item.id}/file` } }, 201);
}, true); }
