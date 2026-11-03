import { pinyin } from "pinyin-pro";

export interface AutoFillResult {
  pinyin: string;
  meaningVi?: string;
  type?: string;
  exampleZh?: string;
  exampleVi?: string;
}

/**
 * Tự động tạo Pinyin có dấu thanh điệu chuẩn tiếng Trung
 */
export function getAutoPinyin(text: string): string {
  if (!text || !text.trim()) return "";
  try {
    return pinyin(text.trim(), { toneType: "symbol" });
  } catch {
    return "";
  }
}

/**
 * Tra cứu tự động từ điển để lấy nghĩa tiếng Việt và từ loại
 */
export async function lookupDictionaryAuto(hanzi: string): Promise<AutoFillResult> {
  const cleanHanzi = hanzi.trim();
  const generatedPinyin = getAutoPinyin(cleanHanzi);

  if (!cleanHanzi) {
    return { pinyin: "" };
  }

  try {
    const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(cleanHanzi)}`);
    if (!res.ok) {
      return { pinyin: generatedPinyin };
    }

    const data = await res.json();
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      // Tìm từ khớp chính xác nhất
      const exact = data.items.find((item: any) => item.simplified === cleanHanzi || item.traditional === cleanHanzi) || data.items[0];
      
      let meaningVi = "";
      if (Array.isArray(exact.definitionsVi) && exact.definitionsVi.length > 0) {
        meaningVi = exact.definitionsVi.join("; ");
      } else if (typeof exact.meaningVi === "string") {
        meaningVi = exact.meaningVi;
      }

      const wordType = exact.pos || (cleanHanzi.length === 1 ? "Từ đơn" : "Từ ghép");

      return {
        pinyin: exact.pinyin || generatedPinyin,
        meaningVi: meaningVi || "",
        type: wordType,
      };
    }
  } catch (err) {
    console.warn("Auto lookup dictionary note:", err);
  }

  return { pinyin: generatedPinyin };
}
