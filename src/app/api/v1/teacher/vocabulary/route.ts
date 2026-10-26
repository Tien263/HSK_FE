import { prisma } from "@/lib/prisma";
import { jsonBody, portalResponse, portalJson, PortalError, teacherOnly, textField } from "@/lib/portal-auth";

export function GET(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user); const params = new URL(request.url).searchParams; const q = (params.get("q") || "").trim();
  const items = await prisma.teacherVocabulary.findMany({ where: { teacherId: user.id, ...(q ? { OR: [{ hanzi: { contains: q } }, { meaning: { contains: q, mode: "insensitive" } }, { pinyin: { contains: q, mode: "insensitive" } }] } : {}) }, orderBy: { updatedAt: "desc" }, take: 2000 });
  return portalJson({ success: true, items });
}); }
export function POST(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user); const body = await jsonBody(request);
  if (body.action === "exercise") {
    const id = textField(body.id, "Mã từ", true, 150);
    const word = await prisma.teacherVocabulary.findFirst({ where: { id, teacherId: user.id } });
    if (!word) throw new PortalError(404, "Không tìm thấy từ trong kho riêng của bạn.");
    const data = { type: "fill_blank", content: `Viết chữ Hán tương ứng với nghĩa: ${word.meaning}`, correctAnswer: word.hanzi, explanation: `${word.hanzi} · ${word.pinyin} · ${word.meaning}`, skill: "VOCABULARY", level: word.hskLevel, teacherId: user.id, difficulty: "MEDIUM" };
    const question = await prisma.$transaction(async tx => {
      if (word.questionId) { const existing = await tx.question.findFirst({ where: { id: word.questionId, teacherId: user.id } }); if (existing && !await tx.quizSetQuestion.count({where:{questionId:existing.id}})) return tx.question.update({ where: { id: existing.id }, data }); }
      const created = await tx.question.create({ data });
      const changed = await tx.teacherVocabulary.updateMany({ where: { id, teacherId: user.id, questionId: word.questionId }, data: { questionId: created.id } });
      if (!changed.count) throw new PortalError(409, "Từ vừa được cập nhật. Hãy tải lại kho riêng.");
      return created;
    });
    return portalJson({ success: true, questionId: question.id });
  }
  const raw = Array.isArray(body.items) ? body.items : [body];
  if (!raw.length || raw.length > 500) throw new PortalError(400, "Mỗi lần lưu từ 1 đến 500 từ.");
  const items = raw.map(value => {
    if (!value || typeof value !== "object") throw new PortalError(400, "Dữ liệu từ vựng không hợp lệ.");
    const row = value as Record<string, unknown>; const level = Number(row.hskLevel ?? body.hskLevel ?? 1);
    if (!Number.isInteger(level) || level < 1 || level > 9) throw new PortalError(400, "Cấp HSK phải từ 1 đến 9.");
    return { teacherId: user.id, hanzi: textField(row.hanzi, "Chữ Hán", true, 100), pinyin: textField(row.pinyin, "Pinyin", true, 300), meaning: textField(row.meaning ?? row.meaningVi, "Nghĩa Việt", true, 3000), wordType: textField(row.wordType ?? row.type ?? "", "Từ loại", false, 100), exampleZh: textField(row.exampleZh ?? "", "Ví dụ Trung", false, 3000), examplePy: textField(row.examplePy ?? "", "Pinyin ví dụ", false, 3000), exampleVi: textField(row.exampleVi ?? "", "Nghĩa ví dụ", false, 3000), hskLevel: level };
  });
  const saved = await prisma.$transaction(items.map(item => prisma.teacherVocabulary.upsert({ where: { teacherId_hanzi_pinyin: { teacherId: user.id, hanzi: item.hanzi, pinyin: item.pinyin } }, create: item, update: item })));
  return portalJson({ success: true, count: saved.length });
}, true); }
export function DELETE(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user); const id = new URL(request.url).searchParams.get("id") || "";
  const deleted = await prisma.teacherVocabulary.deleteMany({ where: { id, teacherId: user.id } });
  if (!deleted.count) throw new PortalError(404, "Không tìm thấy từ trong kho riêng.");
  return portalJson({ success: true });
}, true); }
