import { prisma } from "@/lib/prisma";
import { materialAccess, shareMaterial } from "@/lib/teaching-materials";
import { portalResponse, portalJson, teacherOnly, jsonBody, PortalError } from "@/lib/portal-auth";
type Context = { params: Promise<{ id: string }> };
export function DELETE(request: Request, context: Context) { return portalResponse(request, async user => {
  teacherOnly(user); const { id } = await context.params; await materialAccess(user, id, true);
  await prisma.teachingMaterial.delete({ where: { id } }); return portalJson({ success: true });
}, true); }
export function PATCH(request: Request, context: Context) { return portalResponse(request, async user => {
  teacherOnly(user); const { id } = await context.params; await materialAccess(user, id, true); const body = await jsonBody(request);
  if (!Array.isArray(body.classIds) || body.classIds.some(id => typeof id !== "string")) throw new PortalError(400, "Chọn danh sách lớp để chia sẻ.");
  await shareMaterial(user, id, body.classIds as string[]); return portalJson({ success: true });
}, true); }
