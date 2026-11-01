import { NextResponse } from "next/server";
import { pinyin } from "pinyin-pro";
import { prisma } from "@/lib/prisma";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { lookupRadicalOrComponent, KANGXI_RADICALS } from "@/lib/chinese-radicals";

// Lazy initialization for HanziJS decomposition engine (lightweight composer only)
let hanziInitialized = false;
let hanziDecomposer: any = null;

function getHanziEngine() {
  if (!hanziDecomposer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      hanziDecomposer = require("hanzi/lib/hanzidecomposer.js");
    } catch (e) {
      console.warn("Failed to require hanzidecomposer:", e);
    }
  }
  if (!hanziInitialized && hanziDecomposer) {
    try {
      hanziDecomposer.start();
      hanziInitialized = true;
    } catch (e) {
      console.warn("HanziJS initialization error:", e);
    }
  }
  return hanziDecomposer;
}

// Bảng âm Hán Việt chuẩn cho các chữ phổ biến nếu CSDL chưa có
const SINO_VIETNAMESE_FALLBACK: Record<string, string> = {
  搞: "Cảo / Cào",
  你: "Nễ / Nhĩ",
  我: "Ngã",
  他: "Tha",
  她: "Tha (Nữ)",
  好: "Hảo / Háo",
  学: "Học",
  做: "Tố / Tác",
  看: "Khán",
  听: "Thính",
  说: "Thuyết",
  读: "Độc",
  写: "Tả",
  吃: "Cật",
  喝: "Hát",
  明: "Minh",
  休: "Hưu",
  森: "Sâm",
  林: "Lâm",
  家: "Gia",
  国: "Quốc",
  人: "Nhân",
  中: "Trung",
  大: "Đại",
  小: "Tiểu",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawChar = (searchParams.get("char") || "").trim();
  const char = [...rawChar][0] || "你";

  if (!/^\p{Script=Han}$/u.test(char)) {
    return NextResponse.json({ success: false, message: "Ký tự không phải chữ Hán." }, { status: 400 });
  }

  try {
    // 1. Pinyin chuẩn từ pinyin-pro
    const py = pinyin(char, { toneType: "symbol" });
    const pyNum = pinyin(char, { toneType: "num" });

    // 2. Tra cứu Từ Điển CSDL để lấy nghĩa tiếng Việt và âm Hán Việt chuẩn
    const [dictEntry, charEntry] = await Promise.all([
      prisma.dictionaryEntry.findFirst({
        where: {
          OR: [{ simplified: char }, { traditional: char }],
        },
        select: {
          simplified: true,
          traditional: true,
          pinyin: true,
          definitionsVi: true,
        },
      }),
      prisma.dictionaryCharacter.findUnique({
        where: { character: char },
        select: {
          hanViet: true,
        },
      }),
    ]);

    // 3. Đọc dữ liệu nét viết từ hanzi-writer-data (nếu có)
    let writerStrokesCount = 0;
    try {
      const writerPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "node_modules", "hanzi-writer-data", `${char}.json`);
      const writerRaw = await readFile(writerPath, "utf8");
      const writerJson = JSON.parse(writerRaw);
      if (Array.isArray(writerJson.strokes)) {
        writerStrokesCount = writerJson.strokes.length;
      }
    } catch {
      // Fallback: Nếu trên server container không có file cục bộ, fetch từ CDN jsdelivr
      try {
        const cdnRes = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`, {
          next: { revalidate: 86400 },
        });
        if (cdnRes.ok) {
          const cdnJson = await cdnRes.json();
          if (Array.isArray(cdnJson.strokes)) {
            writerStrokesCount = cdnJson.strokes.length;
          }
        }
      } catch {}
    }

    const totalStrokes = writerStrokesCount || 1;

    // 4. Phân tích thành phần chiết tự động bằng HanziJS
    const hanzi = getHanziEngine();
    let rawParts: string[] = [];

    if (hanzi) {
      try {
        const dec = hanzi.decompose(char);
        if (dec && Array.isArray(dec.components1) && dec.components1.length > 1 && !dec.components1.includes("No glyph available")) {
          rawParts = dec.components1;
        } else if (dec && Array.isArray(dec.components2) && dec.components2.length > 1 && !dec.components2.includes("No glyph available")) {
          rawParts = dec.components2;
        } else if (dec && Array.isArray(dec.components4) && dec.components4.length > 1) {
          rawParts = dec.components4.filter((c: string) => c && c !== "No glyph available");
        }
      } catch (err) {
        console.warn("Decompose error:", err);
      }
    }

    // Xác định bộ thủ chính (ưu tiên khớp bộ thủ Khang Hy trong các thành phần)
    let detectedRadical = "";

    if (!detectedRadical && rawParts.length > 0) {
      for (const part of rawParts) {
        if (KANGXI_RADICALS[part]) {
          detectedRadical = part;
          break;
        }
      }
    }

    if (!detectedRadical) {
      // Trường hợp chữ độc thể (tự thân là bộ thủ hoặc ký tự đơn)
      detectedRadical = KANGXI_RADICALS[char] ? char : rawParts[0] || char;
    }

    const radicalInfo = lookupRadicalOrComponent(detectedRadical);

    // Xây dựng mảng thành phần cấu trúc (components) chi tiết
    const components: Array<{ part: string; meaning: string }> = [];
    if (rawParts.length > 0) {
      for (const part of rawParts) {
        if (part === char && rawParts.length > 1) continue;
        const partInfo = lookupRadicalOrComponent(part);
        components.push({
          part,
          meaning: `${partInfo.nameVi} - ${partInfo.meaningVi}`,
        });
      }
    }

    if (components.length === 0) {
      components.push({
        part: detectedRadical,
        meaning: `${radicalInfo.nameVi} - ${radicalInfo.meaningVi}`,
      });
    }

    // 5. Chuẩn hóa âm Hán Việt (Sino-Vietnamese)
    let sinoVietnamese = "";
    if (charEntry?.hanViet) {
      // Viết hoa chữ cái đầu từng âm
      sinoVietnamese = charEntry.hanViet
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" / ");
    } else if (SINO_VIETNAMESE_FALLBACK[char]) {
      sinoVietnamese = SINO_VIETNAMESE_FALLBACK[char];
    } else {
      sinoVietnamese = "Hán tự";
    }

    // Nghĩa tiếng Việt
    const meaningVi = dictEntry?.definitionsVi?.slice(0, 3).join("; ") || "Ý nghĩa từ vựng Hán ngữ chuẩn";

    // 6. Diễn giải tượng hình & Câu chuyện chiết tự chuẩn mực Lục Thư
    let mnemonicStory = "";
    if (components.length >= 2) {
      const p1 = components[0];
      const p2 = components[1];
      const isPhonetic = rawParts.length === 2;

      if (isPhonetic) {
        mnemonicStory = `Chữ "${char}" (${sinoVietnamese}) cấu tạo theo lối **Hình Thanh** (形声) kinh điển trong Lục Thư. Phần biểu ý là bộ **${p1.part}** (${p1.meaning.split(" - ")[0]}), gợi tả hàm ý "${radicalInfo.meaningVi}". Phần biểu âm/hài thanh là **${p2.part}** (${p2.meaning.split(" - ")[0]}), vừa trợ âm đọc (${py}), vừa cộng hưởng ý niệm mở rộng. Tổ hợp nét bút tạo nên ý nghĩa trọn vẹn: "${meaningVi}".`;
      } else {
        const partsSummary = components.map((c) => `[${c.part}] ${c.meaning.split(" - ")[0]}`).join(" kết hợp cùng ");
        mnemonicStory = `Chữ "${char}" (${sinoVietnamese}) là chữ **Hội Ý** (会意) được tạo thành từ ${partsSummary}. Mỗi bộ phận mang một biểu tượng đời sống, hòa quyện tạo nên ý niệm: "${meaningVi}".`;
      }
    } else {
      mnemonicStory = `Chữ "${char}" (${sinoVietnamese}) là chữ **Tượng Hình** (象形) hoặc Độc Thể cổ điển mang bộ **${detectedRadical}** (${radicalInfo.nameVi} - ${radicalInfo.meaningVi}). Nét chữ khắc họa trực quan hình tượng sự vật trong thiên nhiên và đời sống con người từ thời giáp cốt văn.`;
    }

    // 7. Tìm từ ghép liên quan từ CSDL từ điển
    const relatedEntries = await prisma.dictionaryEntry.findMany({
      where: {
        simplified: { contains: char },
        NOT: { simplified: char },
      },
      select: {
        simplified: true,
        pinyin: true,
        definitionsVi: true,
      },
      take: 4,
    });

    const collocations = relatedEntries.map((e) => ({
      zh: e.simplified,
      py: e.pinyin,
      vi: e.definitionsVi[0] || "",
    }));

    return NextResponse.json({
      success: true,
      data: {
        hanzi: char,
        pinyin: py,
        pinyinNum: pyNum,
        sinoVietnamese,
        meaning: meaningVi,
        radical: `${detectedRadical} (${radicalInfo.nameVi})`,
        radicalMeaning: radicalInfo.meaningVi,
        strokeCount: totalStrokes,
        mnemonicStory,
        components,
        collocations,
      },
    });
  } catch (error: any) {
    console.error("Etymology lookup error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tra cứu chiết tự." }, { status: 500 });
  }
}
