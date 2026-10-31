import { NextResponse } from "next/server";
import { pinyin } from "pinyin-pro";
import { prisma } from "@/lib/prisma";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Mapping các bộ thủ phổ biến trong chữ Hán
const COMMON_RADICALS: Record<string, { name: string; meaning: string }> = {
  "亻": { name: "Nhân đứng", meaning: "Liên quan đến con người, tính cách hoặc hành vi" },
  "口": { name: "Khẩu", meaning: "Liên quan đến miệng, lời nói, âm thanh hoặc ăn uống" },
  "氵": { name: "Ba chấm thủy", meaning: "Liên quan đến nước, chất lỏng, sông hồ biển" },
  "木": { name: "Mộc", meaning: "Liên quan đến cây cối, gỗ, thực vật hoặc rừng" },
  "艹": { name: "Thảo đầu", meaning: "Liên quan đến cỏ, hoa lá, thảo mộc dược liệu" },
  "女": { name: "Nữ", meaning: "Liên quan đến phụ nữ, phái đẹp, người mẹ" },
  "子": { name: "Tử", meaning: "Liên quan đến con cái, hạt giống, thế hệ trẻ" },
  "日": { name: "Nhật", meaning: "Mặt trời, ban ngày, thời gian, ánh sáng" },
  "月": { name: "Nguyệt (Nhục)", meaning: "Mặt trăng, ban đêm hoặc các bộ phận cơ thể thịt" },
  "心": { name: "Tâm", meaning: "Tâm tư, tình cảm, suy nghĩ, đạo đức" },
  "忄": { name: "Tâm đứng", meaning: "Trạng thái tinh thần, cảm xúc nội tâm" },
  "手": { name: "Thủ", meaning: "Bàn tay, thao tác lao động, cầm nắm" },
  "扌": { name: "Tài gảy", meaning: "Hành động bằng tay, đẩy, kéo, vung" },
  "火": { name: "Hỏa", meaning: "Lửa, ánh sáng, nhiệt độ cao, nấu nướng" },
  "灬": { name: "Bốn chấm hỏa", meaning: "Hơi nóng, bếp núc, nấu chín" },
  "土": { name: "Thổ", meaning: "Đất đai, mặt đất, công trình xây dựng" },
  "金": { name: "Kim", meaning: "Kim loại, vàng bạc, vũ khí đao kiếm" },
  "钅": { name: "Kim đứng", meaning: "Dụng cụ kim khí, máy móc sắc bén" },
  "宀": { name: "Miên", meaning: "Mái nhà, gia đình, nơi cư ngụ che chở" },
  "广": { name: "Nghiễm", meaning: "Nhà kho, mái hiên rộng, dinh thự" },
  "言": { name: "Ngôn", meaning: "Lời nói, ngôn ngữ, đàm thoại, văn tự" },
  "讠": { name: "Ngôn đứng", meaning: "Phát biểu, trò chuyện, văn bản" },
  "走": { name: "Tẩu", meaning: "Chạy nhảy, đi lại nhanh, di chuyển" },
  "辶": { name: "Quai xước", meaning: "Đường đi, bước chân di chuyển xa gần" },
  "纟": { name: "Mịch", meaning: "Sợi tơ, dệt lụa, liên kết gắn bó" },
  "目": { name: "Mục", meaning: "Mắt, thị giác, nhìn ngắm, quan sát" },
  "足": { name: "Túc", meaning: "Chân, bước đi, dẫm đạp, hành trình" },
  "食": { name: "Thực", meaning: "Thức ăn, ẩm thực, dinh dưỡng" },
  "饣": { name: "Thực đứng", meaning: "Đồ ăn, bữa cơm, nuôi dưỡng" },
  "门": { name: "Môn", meaning: "Cổng thành, cửa nhà, lối ra vào" },
  "贝": { name: "Bối", meaning: "Vỏ sò tiền tệ cổ, của cải, quý giá" },
  "力": { name: "Lực", meaning: "Sức mạnh, cơ bắp, sự nỗ lực làm việc" },
  "刀": { name: "Đao", meaning: "Con dao, cắt gọt, sắc bén" },
  "刂": { name: "Đao đứng", meaning: "Phân chia, chặt đứt, dao kéo" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawChar = (searchParams.get("char") || "").trim();
  const char = [...rawChar][0] || "你";

  if (!/^\p{Script=Han}$/u.test(char)) {
    return NextResponse.json({ success: false, message: "Ký tự không phải chữ Hán." }, { status: 400 });
  }

  try {
    // 1. Lấy Pinyin động từ pinyin-pro
    const py = pinyin(char, { toneType: "symbol" });
    const pyNum = pinyin(char, { toneType: "num" });

    // 2. Tra cứu cơ sở dữ liệu từ điển nếu có
    const dictEntry = await prisma.dictionaryEntry.findFirst({
      where: {
        OR: [{ simplified: char }, { traditional: char }],
      },
      select: {
        simplified: true,
        traditional: true,
        pinyin: true,
        definitionsVi: true,
      },
    });

    // 3. Đọc dữ liệu nét viết từ hanzi-writer-data (nếu có)
    let writerStrokesCount = 0;
    try {
      const writerPath = path.join(process.cwd(), "node_modules", "hanzi-writer-data", `${char}.json`);
      const writerRaw = await readFile(writerPath, "utf8");
      const writerJson = JSON.parse(writerRaw);
      if (Array.isArray(writerJson.strokes)) {
        writerStrokesCount = writerJson.strokes.length;
      }
    } catch {}

    const totalStrokes = writerStrokesCount || 1;

    // 4. Xác định bộ thủ động
    let detectedRadical = "";
    let detectedRadicalInfo = { name: "Bộ thủ", meaning: "Nét cơ bản cấu thành chữ" };

    if (!detectedRadical) {
      for (const [rad, info] of Object.entries(COMMON_RADICALS)) {
        if (char.includes(rad)) {
          detectedRadical = rad;
          detectedRadicalInfo = info;
          break;
        }
      }
    } else if (COMMON_RADICALS[detectedRadical]) {
      detectedRadicalInfo = COMMON_RADICALS[detectedRadical];
    }

    if (!detectedRadical) {
      detectedRadical = char;
    }

    // 5. Tìm các thành phần phân rã (decomposition)
    const components: Array<{ part: string; meaning: string }> = [];
    for (const [rad, info] of Object.entries(COMMON_RADICALS)) {
      if (rad !== char && char.includes(rad)) {
        components.push({ part: rad, meaning: `${info.name} - ${info.meaning}` });
        if (components.length >= 3) break;
      }
    }
    if (components.length === 0) {
      components.push({ part: detectedRadical, meaning: detectedRadicalInfo.meaning });
    }

    // 6. Nghĩa tiếng Việt và âm Hán Việt
    const meaningVi = dictEntry?.definitionsVi?.slice(0, 3).join("; ") || "Ý nghĩa từ vựng Hán ngữ chuẩn";

    // 7. Sinh câu chuyện chiết tự động dựa trên thành phần
    let mnemonicStory = "";
    if (components.length > 1) {
      const partsDesc = components.map((c) => c.meaning).join(", kết hợp cùng ");
      mnemonicStory = `Chữ "${char}" được tạo thành từ ${components.map((c) => c.part).join(" và ")}. Tượng trưng cho ý niệm: ${partsDesc}. Qua ngàn năm biến đổi, hình thành nên ý nghĩa "${meaningVi}".`;
    } else {
      mnemonicStory = `Chữ "${char}" là chữ tượng hình độc thể cổ điển mang bộ ${detectedRadical} (${detectedRadicalInfo.name} - ${detectedRadicalInfo.meaning}). Từng nét bút mô phỏng sự vật trong thiên nhiên và đời sống.`;
    }

    // 8. Tìm từ ghép liên quan từ CSDL từ điển
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
        sinoVietnamese: dictEntry?.definitionsVi?.[0]?.split(";")?.[0]?.trim() || "Hán tự",
        meaning: meaningVi,
        radical: `${detectedRadical} (${detectedRadicalInfo.name})`,
        radicalMeaning: detectedRadicalInfo.meaning,
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
