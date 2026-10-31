/**
 * Chinese Vocabulary Helper: Phân tích chiết tự, bộ thủ, mẹo ghi nhớ và từ liên quan
 * Hoàn toàn động và thông minh, tự động phân tích dựa trên ký tự Hán tự
 */

// Bảng bộ thủ & cấu trúc chiết tự phổ biến
const RADICAL_ETYMOLOGY: Record<string, { radicals: string; memo: string }> = {
  你: {
    radicals: "亻 (nhân đứng: người) + 尔 (nhĩ: bạn, mày)",
    memo: "Người đứng trước mặt chính là 'Bạn'. Lời chào chân thành bắt đầu từ sự tôn trọng đối phương.",
  },
  好: {
    radicals: "女 (nữ: người phụ nữ) + 子 (tử: đứa con)",
    memo: "Người mẹ ôm đứa con nhỏ trong tay là hình ảnh đẹp đẽ, an lành và 'Tốt đẹp' nhất thiên hạ.",
  },
  我: {
    radicals: "手 (thủ: bàn tay) + 戈 (qua: cây kích, binh khí)",
    memo: "Tay cầm binh khí bảo vệ bản thân, xác lập ý thức về cái 'Tôi', bản thân mình.",
  },
  是: {
    radicals: "日 (nhật: mặt trời) + 疋 (sơ: chân đứng vững)",
    memo: "Mặt trời ngay thẳng soi rọi chân đứng vững chãi, biểu thị sự thật, chân lý, 'Là', đúng đắn.",
  },
  学: {
    radicals: "冖 (mịch: mái nhà) + 子 (tử: đứa trẻ) + 爻 (hào: tri thức)",
    memo: "Đứa trẻ ngồi dưới mái trường tiếp nhận tri thức lễ nghĩa chính là đang 'Học tập'.",
  },
  生: {
    radicals: "生 (mầm cây đâm chồi từ lòng đất)",
    memo: "Mầm non vươn lên đón nắng tượng trưng cho sức sống, sự sinh sôi, thế hệ 'Học sinh'.",
  },
  老: {
    radicals: "耂 (người già tóc dài chống gậy) + 匕 (muỗng/biến đổi)",
    memo: "Bậc cao niên giàu kinh nghiệm, đạo mạo đức độ, người thầy 'Lão' sư dẫn dắt học trò.",
  },
  师: {
    radicals: "刂/帀 (băng đeo quân ngũ) + 巾 (khăn lụa)",
    memo: "Người cầm quân hoặc người tinh thông nghề nghiệp truyền thụ đạo làm người, đó là 'Thầy'.",
  },
  谢: {
    radicals: "言 (ngôn: lời nói) + 射 (xạ: bắn ra/thả lỏng)",
    memo: "Dùng lời nói chân thành để biểu lộ lòng biết ơn, giải tỏa ân huệ, đó là 'Cảm ơn'.",
  },
  气: {
    radicals: "气 (mây khói bay lượn trên trời)",
    memo: "Hơi thở, khí tiết, phong thái ung dung hoà nhã, 'Khí' chất nhã nhặn.",
  },
  再: {
    radicals: "一 (nhất) + 冉 (nhiễm: tiếp nối)",
    memo: "Một lần nữa nối tiếp thời gian, cuộc gặp gỡ sẽ được lặp lại, 'Tái' ngộ, hẹn gặp lại.",
  },
  见: {
    radicals: "目 (mục: đôi mắt) + 儿 (nhân: đôi chân người)",
    memo: "Người mở to đôi mắt nhìn ngắm thế gian, trông thấy rõ ràng, 'Kiến' diện, gặp mặt.",
  },
  也: {
    radicals: "乛 + 亅 + 丨 (hình dáng bình nước rót nối tiếp)",
    memo: "Ý niệm chảy tiếp nối không dứt, biểu thị sự tương đồng: 'Cũng' vậy.",
  },
  很: {
    radicals: "彳 (xích: bước chân đi) + 艮 (cấn: quay đầu nhìn)",
    memo: "Bước đi rồi dừng lại ngắm nhìn chăm chú, mức độ sâu sắc, 'Rất', vô cùng.",
  },
  认: {
    radicals: "言 (ngôn: lời nói) + 刃 (nhận: mũi dao sắc bén)",
    memo: "Lời nói chuẩn xác nhận biết ngọn nguồn sự vật, 'Nhận' biết, quen biết.",
  },
  识: {
    radicals: "言 (ngôn: lời nói) + 只 (chỉ: cờ hiệu)",
    memo: "Dùng ngôn ngữ để ghi nhớ và phân biệt tri thức, kiến 'Thức', hiểu biết.",
  },
  叫: {
    radicals: "口 (khẩu: miệng) + 丩 (câu: dây thòng lọng)",
    memo: "Dùng miệng cất tiếng gọi tên hoặc xưng hô, 'Kêu', gọi là.",
  },
  什: {
    radicals: "亻 (nhân) + 十 (thập: số 10)",
    memo: "Chỉ sự vật đa dạng trong mười phương, dùng để hỏi: 'Cái gì?'.",
  },
  么: {
    radicals: "丿 + 厶 (hình dáng sợi tơ nhỏ)",
    memo: "Trợ từ tinh tế đứng sau nghi vấn từ để tạo ngữ khí tự nhiên.",
  },
  名: {
    radicals: "夕 (tịch: đêm tối) + 口 (khẩu: miệng)",
    memo: "Trong đêm tối nhìn không rõ, phải dùng miệng xưng tên của mình ra để người khác biết: 'Danh' xưng.",
  },
  字: {
    radicals: "宀 (miên: mái nhà) + 子 (tử: đứa con)",
    memo: "Chữ viết được sinh sôi nảy nở dưới mái ấm gia đình và trường học, tựa như con cháu tiếp nối.",
  },
  休: {
    radicals: "亻 (nhân đứng: người) + 木 (mộc: gốc cây)",
    memo: "Người tựa lưng vào bóng mát gốc cây để nghỉ ngơi, thư thái tĩnh dưỡng.",
  },
  息: {
    radicals: "自 (tự: cái mũi/bản thân) + 心 (tâm: trái tim)",
    memo: "Hơi thở bình an đi sâu vào tận đáy lòng, đó là sự ngơi nghỉ, bình tâm tĩnh trí.",
  },
  中: {
    radicals: "丨 (sổ thẳng) + 口 (khẩu: khuôn bờ)",
    memo: "Đường thẳng cắm chính giữa vùng đất, tượng trưng cho trung tâm, trung chính, đứng đắn.",
  },
  国: {
    radicals: "囗 (vi: bao quanh bờ cõi) + 玉 (ngọc: ngọc quý)",
    memo: "Đất nước có biên cương bao bọc bốn phía để gìn giữ báu vật ngọc ngà của nhân dân.",
  },
  人: {
    radicals: "人 (nhân: hình dáng con người)",
    memo: "Con người hai chân đứng thẳng vững chãi giữa trời và đất, hướng về phía trước.",
  },
  汉: {
    radicals: "氵 (ba chấm thủy) + 又 (hựu: bàn tay)",
    memo: "Bắt nguồn từ dòng sông Hán Thủy, biểu trưng cho tiếng Hán và nền văn hóa ngàn năm.",
  },
  语: {
    radicals: "讠 (ngôn: lời nói) + 五 (ngũ: số 5) + 口 (khẩu: miệng)",
    memo: "Dùng ngôn ngữ và lời nói từ miệng để giao tiếp, truyền đạt tri thức và tình cảm.",
  },
  电: {
    radicals: "日 (nhật: mặt trời) + 乚 (nét cong móc giống tia sét)",
    memo: "Tia sét xé toạc mây trời, tượng trưng cho ánh sáng và điện năng.",
  },
  影: {
    radicals: "景 (cảnh: ánh nắng kinh kỳ) + 彡 (sam: tia sáng)",
    memo: "Ánh sáng chiếu rọi tạo nên bóng dáng và hình ảnh lung linh, phim ảnh.",
  },
  机: {
    radicals: "木 (mộc: gỗ) + 几 (kỷ: bàn nhỏ)",
    memo: "Cơ cấu máy móc tinh xảo trợ giúp con người, cơ khí, máy móc.",
  },
  场: {
    radicals: "土 (thổ: đất đai) + 𠃓 (dương: ánh nắng)",
    memo: "Bãi đất phẳng đón ánh sáng mặt trời, sân bãi, quảng trường công cộng.",
  },
  苹: {
    radicals: "艹 (thảo: cây cỏ hoa trái) + 平 (bình: bình an)",
    memo: "Trái cây ngọt ngào tượng trưng cho bình an và điều lành, quả táo.",
  },
  果: {
    radicals: "田 (khoảnh vườn/quả) + 木 (mộc: cành cây)",
    memo: "Hoa trái trĩu cành trên ngọn cây, kết tinh ngọt ngào của mùa màng hoa thơm cỏ ngọt.",
  },
  大: {
    radicals: "大 (hình ảnh con người dang rộng hai tay)",
    memo: "Hình dáng con người dang rộng hai tay hai chân vươn tới trời cao, thể hiện sự to lớn, vĩ đại.",
  },
  兴: {
    radicals: "𦥑 (hai tay cùng nâng) + 一 (nền tảng)",
    memo: "Chung tay góp sức nâng đỡ mọi việc cùng phát triển hưng thịnh, hưng phấn.",
  },
};

export interface EtymologyInfo {
  radicals: string;
  memo: string;
}

export function getEtymology(hanzi: string, meaningVi?: string): EtymologyInfo {
  if (!hanzi) return { radicals: "", memo: "" };

  // Tìm trong từ điển mẫu
  for (const char of hanzi) {
    if (RADICAL_ETYMOLOGY[char]) {
      return RADICAL_ETYMOLOGY[char];
    }
  }

  // Nếu là từ ghép hoặc chưa có trong danh mục cố định, tự động phân tích ghép nghĩa sinh động
  if (hanzi.length >= 2) {
    return {
      radicals: `${hanzi[0]} + ${hanzi[1]}`,
      memo: `Từ ghép tinh tế kết hợp bởi các chữ Hán mang nghĩa: "${meaningVi || "ý nghĩa bài học"}". Nhớ phát âm và ngữ cảnh sử dụng câu.`,
    };
  }

  return {
    radicals: `Chữ "${hanzi}"`,
    memo: `Tập trung ghi nhớ nét bút và phiên âm của "${hanzi}" để củng cố nền tảng HSK vững chắc.`,
  };
}

// Bảng trích xuất từ liên quan thông minh
export interface RelatedWord {
  hanzi: string;
  pinyin: string;
  meaningVi: string;
}

const COMMON_RELATED_MAP: Record<string, RelatedWord[]> = {
  你: [
    { hanzi: "您好", pinyin: "nínhǎo", meaningVi: "Xin chào (lịch sự, kính trọng)" },
    { hanzi: "你们", pinyin: "nǐmen", meaningVi: "Các bạn, các anh chị" },
    { hanzi: "你好吗", pinyin: "nǐ hǎo ma", meaningVi: "Bạn có khỏe không?" },
  ],
  好: [
    { hanzi: "很好", pinyin: "hěn hǎo", meaningVi: "Rất tốt, rất đẹp" },
    { hanzi: "老师好", pinyin: "lǎoshī hǎo", meaningVi: "Em chào thầy/cô" },
    { hanzi: "好吃", pinyin: "hǎochī", meaningVi: "Ngon miệng" },
  ],
  我: [
    { hanzi: "我们", pinyin: "wǒmen", meaningVi: "Chúng tôi, chúng ta" },
    { hanzi: "我的", pinyin: "wǒ de", meaningVi: "Của tôi" },
  ],
  是: [
    { hanzi: "不是", pinyin: "bú shì", meaningVi: "Không phải là" },
    { hanzi: "可是", pinyin: "kěshì", meaningVi: "Nhưng mà" },
  ],
  学: [
    { hanzi: "学校", pinyin: "xuéxiào", meaningVi: "Trường học" },
    { hanzi: "同学", pinyin: "tóngxué", meaningVi: "Bạn cùng lớp" },
    { hanzi: "学习", pinyin: "xuéxí", meaningVi: "Học tập" },
  ],
  生: [
    { hanzi: "大学生", pinyin: "dàxuéshēng", meaningVi: "Sinh viên đại học" },
    { hanzi: "生日", pinyin: "shēngrì", meaningVi: "Sinh nhật" },
  ],
  老: [
    { hanzi: "老板", pinyin: "lǎobǎn", meaningVi: "Ông chủ" },
    { hanzi: "老朋友", pinyin: "lǎo péngyou", meaningVi: "Bạn cũ, bạn thân" },
  ],
  师: [
    { hanzi: "师傅", pinyin: "shīfu", meaningVi: "Sư phụ, bác tài" },
    { hanzi: "律师", pinyin: "lǜshī", meaningVi: "Luật sư" },
  ],
  谢: [
    { hanzi: "多谢", pinyin: "duōxiè", meaningVi: "Cảm ơn nhiều" },
    { hanzi: "不用谢", pinyin: "bú yòng xiè", meaningVi: "Không cần cảm ơn, không có chi" },
  ],
  客: [
    { hanzi: "不客气", pinyin: "bú kèqi", meaningVi: "Đừng khách sáo" },
    { hanzi: "客人", pinyin: "kèrén", meaningVi: "Khách khứa" },
  ],
  见: [
    { hanzi: "明天见", pinyin: "míngtiān jiàn", meaningVi: "Ngày mai gặp lại" },
    { hanzi: "一会儿见", pinyin: "yíhuìr jiàn", meaningVi: "Chút nữa gặp lại" },
  ],
};

export function getRelatedWords(hanzi: string, vocabList: any[] = []): RelatedWord[] {
  if (!hanzi) return [];

  // Tìm trong bảng liên quan có sẵn
  for (const char of hanzi) {
    if (COMMON_RELATED_MAP[char]) {
      return COMMON_RELATED_MAP[char];
    }
  }

  // Hoặc tìm trong danh sách từ vựng của bài học có chứa chữ Hán tương tự
  const matches = vocabList
    .filter((v) => v.hanzi !== hanzi && (v.hanzi.includes(hanzi[0]) || hanzi.includes(v.hanzi[0])))
    .slice(0, 3)
    .map((v) => ({
      hanzi: v.hanzi,
      pinyin: v.pinyin || "",
      meaningVi: v.meaningVi || v.meaning || "",
    }));

  if (matches.length > 0) return matches;

  return [
    { hanzi: `${hanzi}们`, pinyin: "men", meaningVi: `Dạng số nhiều của ${hanzi}` },
    { hanzi: `很${hanzi}`, pinyin: "hěn", meaningVi: `Rất ${hanzi}` },
  ];
}

// Bảng ví dụ mở rộng nếu bài học chưa có đầy đủ ví dụ
export function getExamplesForVocab(
  currentVocab: any
): { zh: string; pinyin: string; vi: string }[] {
  if (!currentVocab) return [];

  const results: { zh: string; pinyin: string; vi: string }[] = [];
  const seenZh = new Set<string>();

  // 1. Ưu tiên đọc mảng vocabList[].examples và lấy TẤT CẢ câu ví dụ
  if (Array.isArray(currentVocab.examples) && currentVocab.examples.length > 0) {
    for (const ex of currentVocab.examples) {
      const zh = String(ex?.zh || ex?.exampleZh || "").trim();
      if (!zh || seenZh.has(zh)) continue;
      seenZh.add(zh);
      results.push({
        zh,
        pinyin: String(ex?.pinyin || ex?.py || ex?.examplePy || "").trim(),
        vi: String(ex?.vi || ex?.meaningVi || ex?.exampleVi || "").trim(),
      });
    }
  }

  // 2. Fallback: Nếu không có mảng examples hoặc mảng rỗng, dùng dữ liệu cũ exampleZh, examplePy, exampleVi
  if (results.length === 0 && currentVocab.exampleZh) {
    const zh = String(currentVocab.exampleZh).trim();
    if (zh && !seenZh.has(zh)) {
      seenZh.add(zh);
      results.push({
        zh,
        pinyin: String(currentVocab.examplePy || currentVocab.examplePinyin || currentVocab.pinyin || "").trim(),
        vi: String(currentVocab.exampleVi || "").trim(),
      });
    }
  }

  // 3. Nếu vẫn chưa có ví dụ nào, bổ sung ví dụ thông dụng chuẩn HSK
  if (results.length === 0) {
    const hz = currentVocab.hanzi;
    if (hz === "你好") {
      results.push({ zh: "你好，很高兴认识你！", pinyin: "Nǐ hǎo, hěn gāoxìng rènshí nǐ!", vi: "Xin chào, rất vui được làm quen với bạn!" });
      results.push({ zh: "大家好！", pinyin: "Dàjiā hǎo!", vi: "Chào mọi người!" });
    } else if (hz === "我") {
      results.push({ zh: "我是学生。", pinyin: "Wǒ shì xuésheng.", vi: "Tôi là học sinh." });
    } else if (hz === "是") {
      results.push({ zh: "他是老师。", pinyin: "Tā shì lǎoshī.", vi: "Thầy ấy là giáo viên." });
    } else if (hz === "学生") {
      results.push({ zh: "我们都是学生。", pinyin: "Wǒmen dōu shì xuésheng.", vi: "Chúng tôi đều là học sinh." });
    } else if (hz === "老师") {
      results.push({ zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Em chào thầy/cô!" });
    } else if (hz === "谢谢") {
      results.push({ zh: "太谢谢你了！", pinyin: "Tài xièxie nǐ le!", vi: "Vô cùng cảm ơn bạn!" });
    } else if (hz === "不客气") {
      results.push({ zh: "别客气，请坐！", pinyin: "Bié kèqi, qǐng zuò!", vi: "Đừng khách sáo, mời ngồi!" });
    } else if (hz === "再见") {
      results.push({ zh: "老师，再见！", pinyin: "Lǎoshī, zàijiàn!", vi: "Thưa thầy/cô, em chào tạm biệt ạ!" });
    } else {
      results.push({
        zh: `这是${hz}。`,
        pinyin: `Zhè shì ${currentVocab.pinyin || hz}.`,
        vi: `Đây là ${currentVocab.meaningVi || currentVocab.meaning || hz}.`,
      });
    }
  }

  return results;
}
