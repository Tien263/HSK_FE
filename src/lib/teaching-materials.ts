import { prisma } from "./prisma";
import { classAccess, PortalError, type PortalUser } from "./portal-auth";

export const materialSelection = { id: true, teacherId: true, title: true, description: true, fileName: true, mimeType: true, byteSize: true, createdAt: true, classes: { select: { classId: true, class: { select: { name: true } } } } } as const;
export async function materialAccess(user: PortalUser, id: string, write = false) {
  const item = await prisma.teachingMaterial.findUnique({ where: { id }, select: materialSelection });
  if (!item) throw new PortalError(404, "Không tìm thấy tài liệu.");
  if (item.teacherId === user.id || user.role === "ADMIN") return item;
  if (!write) for (const share of item.classes) { try { await classAccess(user, share.classId); return item; } catch (error) { if (!(error instanceof PortalError) || ![403,404].includes(error.status)) throw error; } }
  throw new PortalError(403, "Bạn không có quyền truy cập tài liệu này.");
}
export async function shareMaterial(user: PortalUser, id: string, classIds: string[]) {
  if (classIds.length > 100 || new Set(classIds).size !== classIds.length) throw new PortalError(400, "Danh sách lớp không hợp lệ.");
  for (const classId of classIds) await classAccess(user, classId, true);
  await prisma.$transaction(async tx => {
    await tx.materialClass.deleteMany({ where: { materialId: id } });
    if (classIds.length) await tx.materialClass.createMany({ data: classIds.map(classId => ({ materialId: id, classId })) });
  });
}
