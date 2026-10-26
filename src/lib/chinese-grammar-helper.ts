/**
 * Chinese Grammar Helper: Bổ trợ phân tích cấu trúc ngữ pháp, ví dụ mở rộng và mẹo ghi nhớ động
 */

export interface NormalizedGrammarPoint {
  id: string;
  title: string;
  titleZh?: string;
  structure: string;
  meaningVi: string;
  summary: string;
  usage: string;
  examples: { zh: string; pinyin: string; vi: string }[];
  notes: string;
  commonMistakes: string;
  memo: string;
  status: "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED";
}

export function normalizeGrammarList(
  grammarList: any[],
  lessonNumber: number = 1
): NormalizedGrammarPoint[] {
  if (!Array.isArray(grammarList) || grammarList.length === 0) {
    // Dữ liệu mẫu chuẩn HSK cho bài học tương ứng
    return [
      {
        id: `g-${lessonNumber}-1`,
        title: "Cấu trúc chào hỏi với 好",
        titleZh: "你好 / 老师好",
        structure: "Đối tượng được chào + 好",
        meaningVi: "Dùng để chào hỏi người khác trong các tình huống giao tiếp thông thường.",
        summary: "Chào hỏi căn bản và lịch sự nhất trong tiếng Trung.",
        usage: "Đặt từ '好' ngay sau đại từ hoặc danh xưng của người đối diện. Ví dụ: 你 + 好, 老师 + 好, 大家 + 好.",
        examples: [
          { zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" },
          { zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Chào thầy/cô!" },
          { zh: "大家好！", pinyin: "Dàjiā hǎo!", vi: "Chào mọi người!" },
          { zh: "你好吗？", pinyin: "Nǐ hǎo ma?", vi: "Bạn khỏe không?" },
        ],
        notes: "Khi chào người lớn tuổi hoặc cấp trên, nên dùng '您好' (Nín hǎo) thay vì '你好'.",
        commonMistakes: "Không nói '好你' hoặc '好老师', tính từ '好' bắt buộc phải đứng sau danh từ đối tượng được chào.",
        memo: "“好” thường dùng trong các tình huống chào hỏi hàng ngày. Khi cần đặt sau đối tượng được chào. Ví dụ: gọi thầy cô thì nói “老师好”, gọi nhiều người thì nói “大家好”.",
        status: "MASTERED",
      },
      {
        id: `g-${lessonNumber}-2`,
        title: "Phân biệt 你 và 您",
        titleZh: "你 vs 您",
        structure: "Bạn vs. Đại từ kính trọng",
        meaningVi: "Biểu đạt sắc thái tôn kính đối với người lớn tuổi, thầy cô hoặc khách hàng.",
        summary: "Bạn (ngang hàng) vs Bạn/Ngài (kính trọng).",
        usage: "Chữ '您' thêm bộ 'Tâm' (心) ở dưới chữ '你', biểu thị lòng tôn kính xuất phát từ trái tim.",
        examples: [
          { zh: "您好，李老师！", pinyin: "Nín hǎo, Lǐ lǎoshī!", vi: "Em chào thầy Lý ạ!" },
          { zh: "请问您贵姓？", pinyin: "Qǐngwèn nín guìxìng?", vi: "Xin hỏi quý danh của ngài?" },
        ],
        notes: "Chữ '您' không đi với hậu tố '们' để làm số nhiều, khi muốn nói số nhiều kính trọng thì dùng '各位' (các vị).",
        commonMistakes: "Tránh gọi bạn bè cùng trang lứa bằng '您' vì tạo cảm giác quá xa cách, khách sáo.",
        memo: "Chữ “您” có chữ “心” (trái tim) ở dưới, tượng trưng cho sự tôn trọng chân thành từ đáy lòng đối với người bề trên.",
        status: "REVIEW_NEEDED",
      },
      {
        id: `g-${lessonNumber}-3`,
        title: "Hậu tố số nhiều 们",
        titleZh: "们 (Số nhiều)",
        structure: "Danh từ chỉ người / Đại từ + 们",
        meaningVi: "Dùng để biểu thị số nhiều cho người hoặc đại từ nhân xưng.",
        summary: "Biểu thị số nhiều: 我们, 你们, 他们, 老师们, 学生们.",
        usage: "Đứng sau các đại từ (我, 你, 他, 她) hoặc danh từ chỉ người (老师, 朋友, 学生). Đọc thanh nhẹ (men).",
        examples: [
          { zh: "我们都是学生。", pinyin: "Wǒmen dōu shì xuésheng.", vi: "Chúng tôi đều là học sinh." },
          { zh: "同学们好！", pinyin: "Tóngxuémen hǎo!", vi: "Chào các bạn học sinh!" },
        ],
        notes: "Khi phía trước đã có số lượng từ cụ thể (ví dụ: 三个学生), tuyệt đối KHÔNG thêm '们'.",
        commonMistakes: "Sai: 三个学生们 (Thừa 们). Đúng: 三个学生.",
        memo: "Nếu đã đếm số người rõ ràng (1, 2, 3 người) thì không dùng “们”. “们” chỉ dùng khi nói chung chung số nhiều.",
        status: "NOT_LEARNED",
      },
      {
        id: `g-${lessonNumber}-4`,
        title: "Câu hỏi thông tin với 什么 / 几 / 怎么",
        titleZh: "疑问代词",
        structure: "Hỏi người / đồ vật / số lượng / cách thức",
        meaningVi: "Các đại từ nghi vấn phổ biến để tạo câu hỏi lấy thông tin.",
        summary: "Cấu trúc câu hỏi thông tin không đảo ngữ trật tự từ.",
        usage: "Trong tiếng Trung, từ nghi vấn đứng ngay tại vị trí của thành phần cần hỏi trong câu trả lời.",
        examples: [
          { zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" },
          { zh: "你家有几口人？", pinyin: "Nǐ jiā yǒu jǐ kǒu rén?", vi: "Nhà bạn có mấy người?" },
        ],
        notes: "'几' thường dùng hỏi số lượng nhỏ dưới 10, '多少' dùng hỏi số lượng lớn hơn 10.",
        commonMistakes: "Không đảo đại từ nghi vấn ra đầu câu như tiếng Anh (không đưa '什么' lên đầu).",
        memo: "Tiếng Trung hỏi chỗ nào thì điền từ hỏi vào đúng chỗ đó, trật tự câu không hề bị xáo trộn!",
        status: "NOT_LEARNED",
      },
    ];
  }

  return grammarList.map((g, idx) => {
    const rawTitle = g.titleZh || g.title || g.name || `Ngữ pháp điểm #${idx + 1}`;
    const rawStructure = g.structure || g.formula || g.pattern || "Cấu trúc ngữ pháp trọng tâm";
    const rawMeaning = g.meaningVi || g.meaning || g.explanation || g.usage || "Ý nghĩa và cách dùng trong câu";

    let exList: { zh: string; pinyin: string; vi: string }[] = [];
    if (Array.isArray(g.examples) && g.examples.length > 0) {
      exList = g.examples.map((ex: any) => ({
        zh: typeof ex === "string" ? ex : ex.zh || ex.sentence || "",
        pinyin: typeof ex === "string" ? "" : ex.pinyin || "",
        vi: typeof ex === "string" ? "" : ex.vi || ex.meaning || "",
      }));
    } else if (g.exampleZh) {
      exList.push({
        zh: g.exampleZh,
        pinyin: g.examplePinyin || "",
        vi: g.exampleVi || "",
      });
    } else {
      exList = [
        { zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" },
        { zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Em chào thầy cô!" },
      ];
    }

    return {
      id: g.id || `g-${lessonNumber}-${idx + 1}`,
      title: rawTitle,
      titleZh: g.titleZh || rawTitle,
      structure: rawStructure,
      meaningVi: rawMeaning,
      summary: g.summary || rawMeaning,
      usage: g.usage || rawMeaning,
      examples: exList,
      notes: g.notes || g.warning || "Chú ý trật tự từ và hư từ tương ứng trong câu.",
      commonMistakes: g.commonMistakes || "Tránh dịch từng từ theo ngữ pháp tiếng Việt mà cần tuân theo kết cấu ngữ pháp tiếng Trung.",
      memo: g.memo || `Nắm chắc cấu trúc "${rawStructure}" để vận dụng chính xác khi làm bài tập và giao tiếp.`,
      status: idx === 0 ? "MASTERED" : idx === 1 ? "REVIEW_NEEDED" : "NOT_LEARNED",
    };
  });
}
