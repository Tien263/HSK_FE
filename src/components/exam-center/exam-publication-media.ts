import { uploadToCloudinary } from "@/lib/cloudinary";

const mediaKind = { imageUrl: "image", audioUrl: "video" } as const;

export function prepareExamPublicationMedia(
  payload: Record<string, unknown>,
  uploaded: Map<string, Promise<string>>,
): Promise<Record<string, unknown>> {
  async function uploadInline(source: string, field: keyof typeof mediaKind) {
    const existing = uploaded.get(source);
    if (existing) return existing;

    const upload = (async () => {
      try {
        const file = await (await fetch(source)).blob();
        const result = await uploadToCloudinary(file, {
          folder: "hsk_exam_media",
          resourceType: mediaKind[field],
        });
        if (!result.secureUrl) throw new Error("Dịch vụ lưu tệp chưa trả về đường dẫn.");
        return result.secureUrl;
      } catch (error) {
        throw new Error(`Không tải được ${field === "imageUrl" ? "ảnh" : "audio"} đính kèm trong đề. ${(error as Error).message}`);
      }
    })();
    uploaded.set(source, upload);
    try {
      return await upload;
    } catch (error) {
      uploaded.delete(source);
      throw error;
    }
  }

  async function visit(value: unknown, field?: string): Promise<unknown> {
    if (Array.isArray(value)) return Promise.all(value.map(item => visit(item)));
    if (value && typeof value === "object") return visitObject(value);
    if (typeof value === "string" && (
      (field === "imageUrl" && /^data:image\//i.test(value)) ||
      (field === "audioUrl" && /^data:audio\//i.test(value))
    )) return uploadInline(value, field as keyof typeof mediaKind);
    return value;
  }

  async function visitObject(value: object) {
    return Object.fromEntries(await Promise.all(Object.entries(value).map(
      async ([field, item]) => [field, await visit(item, field)],
    )));
  }

  return visitObject(payload);
}
