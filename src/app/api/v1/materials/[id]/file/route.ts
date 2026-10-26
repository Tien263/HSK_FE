import { prisma } from "@/lib/prisma";
import { materialAccess } from "@/lib/teaching-materials";
import { portalResponse, PortalError } from "@/lib/portal-auth";
export function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { return portalResponse(request, async user => {
  const { id } = await params; const meta = await materialAccess(user, id);
  const item = await prisma.teachingMaterial.findUnique({ where: { id }, select: { content: true } });
  if (!item) throw new PortalError(404, "Không tìm thấy file.");
  return new Response(new Uint8Array(item.content), { headers: { "Content-Type": meta.mimeType, "Content-Length": String(meta.byteSize), "Content-Disposition": `attachment; filename="document"; filename*=UTF-8''${encodeURIComponent(meta.fileName)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}); }
