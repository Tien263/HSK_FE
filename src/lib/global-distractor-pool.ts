/**
 * Kho từ vựng mẫu tiếng Trung & Nghĩa tiếng Việt chuẩn HSK 1 - 6
 * Dùng làm phương án nhiễu (distractors) động, phong phú cho các bài tập trắc nghiệm,
 * ngăn chặn tình trạng "3 đáp án cũ đứng im" khi người học ôn tập một nhóm ít từ (ví dụ 5 từ).
 */

export interface VocabDistractorItem {
  hanzi: string;
  meaningVi: string;
}

export const GLOBAL_VOCAB_DISTRACTOR_POOL: VocabDistractorItem[] = [
  // HSK 1-2 cơ bản
  { hanzi: "你好", meaningVi: "Xin chào" },
  { hanzi: "谢谢", meaningVi: "Cảm ơn" },
  { hanzi: "再见", meaningVi: "Tạm biệt" },
  { hanzi: "高兴", meaningVi: "Vui mừng, phấn khởi" },
  { hanzi: "朋友", meaningVi: "Bạn bè" },
  { hanzi: "老师", meaningVi: "Thầy giáo, cô giáo" },
  { hanzi: "学生", meaningVi: "Học sinh, sinh viên" },
  { hanzi: "学习", meaningVi: "Học tập" },
  { hanzi: "工作", meaningVi: "Công việc, làm việc" },
  { hanzi: "时间", meaningVi: "Thời gian" },
  { hanzi: "今天", meaningVi: "Hôm nay" },
  { hanzi: "明天", meaningVi: "Ngày mai" },
  { hanzi: "昨天", meaningVi: "Hôm qua" },
  { hanzi: "天气", meaningVi: "Thời tiết" },
  { hanzi: "身体", meaningVi: "Sức khỏe, thân thể" },
  { hanzi: "医生", meaningVi: "Bác sĩ" },
  { hanzi: "医院", meaningVi: "Bệnh viện" },
  { hanzi: "帮助", meaningVi: "Giúp đỡ" },
  { hanzi: "介绍", meaningVi: "Giới thiệu" },
  { hanzi: "准备", meaningVi: "Chuẩn bị" },
  { hanzi: "开始", meaningVi: "Bắt đầu" },
  { hanzi: "希望", meaningVi: "Hy vọng" },
  { hanzi: "明白", meaningVi: "Hiểu rõ, rõ ràng" },
  { hanzi: "清楚", meaningVi: "Rõ ràng, rành mạch" },
  { hanzi: "休息", meaningVi: "Nghỉ ngơi" },
  { hanzi: "运动", meaningVi: "Vận động, thể thao" },
  { hanzi: "旅游", meaningVi: "Du lịch" },
  { hanzi: "便宜", meaningVi: "Rẻ, giá rẻ" },
  { hanzi: "贵", meaningVi: "Đắt đỏ" },
  { hanzi: "漂亮", meaningVi: "Xinh đẹp" },

  // HSK 3-4 trung cấp
  { hanzi: "解决", meaningVi: "Giải quyết" },
  { hanzi: "考虑", meaningVi: "Cân nhắc, suy nghĩ" },
  { hanzi: "安排", meaningVi: "Sắp xếp" },
  { hanzi: "坚持", meaningVi: "Kiên trì" },
  { hanzi: "放弃", meaningVi: "Từ bỏ" },
  { hanzi: "成功", meaningVi: "Thành công" },
  { hanzi: "失败", meaningVi: "Thất bại" },
  { hanzi: "经验", meaningVi: "Kinh nghiệm" },
  { hanzi: "机会", meaningVi: "Cơ hội" },
  { hanzi: "态度", meaningVi: "Thái độ" },
  { hanzi: "责任", meaningVi: "Trách nhiệm" },
  { hanzi: "环境保护", meaningVi: "Bảo vệ môi trường" },
  { hanzi: "污染", meaningVi: "Ô nhiễm" },
  { hanzi: "严格", meaningVi: "Nghiêm khắc" },
  { hanzi: "丰富", meaningVi: "Phong phú" },
  { hanzi: "精彩", meaningVi: "Đặc sắc, xuất sắc" },
  { hanzi: "幽默", meaningVi: "Hài hước" },
  { hanzi: "诚实", meaningVi: "Thành thật, trung thực" },
  { hanzi: "骄傲", meaningVi: "Kiêu ngạo, tự hào" },
  { hanzi: "谦虚", meaningVi: "Khiêm tốn" },
  { hanzi: "抱歉", meaningVi: "Xin lỗi, áy náy" },
  { hanzi: "原谅", meaningVi: "Tha thứ, lượng thứ" },
  { hanzi: "鼓励", meaningVi: "Khích lệ, động viên" },
  { hanzi: "支持", meaningVi: "Ủng hộ" },
  { hanzi: "反对", meaningVi: "Phản đối" },
  { hanzi: "商量", meaningVi: "Thương lượng, bàn bạc" },
  { hanzi: "谈判", meaningVi: "Đàm phán" },
  { hanzi: "合同", meaningVi: "Hợp đồng" },
  { hanzi: "法律", meaningVi: "Pháp luật" },
  { hanzi: "规定", meaningVi: "Quy định" },

  // HSK 5-6 cao cấp
  { hanzi: "密切", meaningVi: "Mật thiết, chặt chẽ" },
  { hanzi: "亲密", meaningVi: "Thân mật, gần gũi" },
  { hanzi: "亲切", meaningVi: "Thân thiết, ân cần" },
  { hanzi: "热情", meaningVi: "Nhiệt tình, niềm nở" },
  { hanzi: "忽略", meaningVi: "Xao lãng, bỏ qua, lơ là" },
  { hanzi: "重视", meaningVi: "Coi trọng, chú trọng" },
  { hanzi: "嫉妒", meaningVi: "Ghen tị, đố kỵ" },
  { hanzi: "羡慕", meaningVi: "Ngưỡng mộ" },
  { hanzi: "嘲笑", meaningVi: "Chế giễu, cười nhạo" },
  { hanzi: "赞赏", meaningVi: "Tán thưởng, khen ngợi" },
  { hanzi: "讨好", meaningVi: "Lấy lòng, nịnh bợ" },
  { hanzi: "奉承", meaningVi: "Tâng bốc, nịnh hót" },
  { hanzi: "和睦", meaningVi: "Hòa thuận, hòa mục" },
  { hanzi: "冲突", meaningVi: "Xung đột, mâu thuẫn" },
  { hanzi: "滔滔不绝", meaningVi: "Thao thao bất tuyệt, nói không ngừng" },
  { hanzi: "络绎不绝", meaningVi: "Nối liền không dứt, tấp nập" },
  { hanzi: "集思广益", meaningVi: "Góp trí tuệ tập thể, cùng suy nghĩ" },
  { hanzi: "迎刃而解", meaningVi: "Được giải quyết êm xuôi, dễ dàng" },
  { hanzi: "画蛇添足", meaningVi: "Vẽ rắn thêm chân, làm chuyện thừa thãi" },
  { hanzi: "半途而废", meaningVi: "Bỏ dở giữa chừng" },
  { hanzi: "莫名其妙", meaningVi: "Kỳ lạ khó hiểu, không hiểu vì sao" },
  { hanzi: "不可思议", meaningVi: "Không thể tưởng tượng nổi" },
  { hanzi: "一丝不苟", meaningVi: "Tỉ mỉ chu đáo, không cẩu thả" },
  { hanzi: "废寝忘食", meaningVi: "Quên ăn quên ngủ" },
  { hanzi: "潜移默化", meaningVi: "Thấm nhuần ngầm, ảnh hưởng dần dần" },
  { hanzi: "日新月异", meaningVi: "Đổi mới từng ngày, phát triển nhanh chóng" },
  { hanzi: "持之以恒", meaningVi: "Kiên trì bền bỉ không ngừng nghỉ" },
  { hanzi: "突飞猛进", meaningVi: "Tiến bộ vượt bậc" },
  { hanzi: "独一无二", meaningVi: "Độc nhất vô nhị" },
  { hanzi: "全力以赴", meaningVi: "Dốc toàn lực, cố gắng hết sức" },
  { hanzi: "胸有成竹", meaningVi: "Nắm chắc phần thắng, tự tin trong lòng" },
  { hanzi: "精益求精", meaningVi: "Đã tốt lại muốn tốt hơn, hoàn thiện hơn" },
  { hanzi: "自强不息", meaningVi: "Tự lực tự cường, không ngừng vươn lên" },
  { hanzi: "未雨绸缪", meaningVi: "Lo chu tất trước khi mưa tới, phòng ngừa rủi ro" },
  { hanzi: "推陈出新", meaningVi: "Đổi mới sáng tạo, bỏ cái cũ đón cái mới" },
  { hanzi: "循序渐进", meaningVi: "Làm theo trình tự từng bước" },
  { hanzi: "脚踏实地", meaningVi: "Chân thành thực tế, không viển vông" },
  { hanzi: "博大精深", meaningVi: "Bác đại tinh thâm, rộng lớn uyên thâm" },
  { hanzi: "见微知著", meaningVi: "Thấy việc nhỏ biết việc lớn" },
  { hanzi: "实事求是", meaningVi: "Cầu thị từ thực tế, khách quan chân thật" },
  { hanzi: "大相径庭", meaningVi: "Khác biệt một trời một vực" },
  { hanzi: "因材施教", meaningVi: "Tùy theo năng lực mà dạy dỗ" },
  { hanzi: "学以致用", meaningVi: "Học đi đôi với hành" },
  { hanzi: "温故知新", meaningVi: "Ôn cũ biết mới" },
];

/**
 * Thuật toán xáo trộn Fisher-Yates chuẩn xác
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Tạo 4 lựa chọn trắc nghiệm nghĩa tiếng Việt (1 đúng + 3 sai ngẫu nhiên)
 * từ kho từ vựng phong phú, không bao giờ bị trùng lặp hoặc đứng im khi ôn ít từ.
 */
export function generateDynamicMeaningDistractors(
  correctMeaning: string,
  localVocabs: any[] = [],
  memoryRecords: any[] = [],
  count: number = 3
): string[] {
  if (!correctMeaning) return [];

  const cleanCorrect = correctMeaning.trim().toLowerCase();

  // 1. Tập hợp các nghĩa ứng viên từ kho cục bộ + kho ghi nhớ + kho toàn hệ thống
  const candidatePool: string[] = [];

  // Từ kho bài học hiện tại
  localVocabs.forEach((v) => {
    const m = (v.meaningVi || v.meaning || "").trim();
    if (m && m.toLowerCase() !== cleanCorrect && !candidatePool.includes(m)) {
      candidatePool.push(m);
    }
  });

  // Từ kho ghi nhớ học viên
  memoryRecords.forEach((r) => {
    const m = (r.meaningVi || "").trim();
    if (m && m.toLowerCase() !== cleanCorrect && !candidatePool.includes(m)) {
      candidatePool.push(m);
    }
  });

  // Từ kho phong phú toàn cầu
  GLOBAL_VOCAB_DISTRACTOR_POOL.forEach((item) => {
    const m = item.meaningVi.trim();
    if (m && m.toLowerCase() !== cleanCorrect && !candidatePool.includes(m)) {
      candidatePool.push(m);
    }
  });

  // 2. Xáo trộn toàn bộ ứng viên
  const shuffledCandidates = shuffleArray(candidatePool);

  // 3. Lấy đúng số lượng distractor cần thiết
  const selectedDistractors = shuffledCandidates.slice(0, count);

  // 4. Gộp đáp án đúng + 3 đáp án sai và xáo trộn vị trí
  return shuffleArray([correctMeaning, ...selectedDistractors]);
}

/**
 * Tạo 4 lựa chọn trắc nghiệm chữ Hán (1 đúng + 3 sai ngẫu nhiên)
 */
export function generateDynamicHanziDistractors(
  correctHanzi: string,
  localVocabs: any[] = [],
  memoryRecords: any[] = [],
  count: number = 3
): string[] {
  if (!correctHanzi) return [];

  const cleanCorrect = correctHanzi.trim();

  const candidatePool: string[] = [];

  localVocabs.forEach((v) => {
    const hz = (v.hanzi || "").trim();
    if (hz && hz !== cleanCorrect && !candidatePool.includes(hz)) {
      candidatePool.push(hz);
    }
  });

  memoryRecords.forEach((r) => {
    const hz = (r.hanzi || "").trim();
    if (hz && hz !== cleanCorrect && !candidatePool.includes(hz)) {
      candidatePool.push(hz);
    }
  });

  GLOBAL_VOCAB_DISTRACTOR_POOL.forEach((item) => {
    const hz = item.hanzi.trim();
    if (hz && hz !== cleanCorrect && !candidatePool.includes(hz)) {
      candidatePool.push(hz);
    }
  });

  const shuffledCandidates = shuffleArray(candidatePool);
  const selectedDistractors = shuffledCandidates.slice(0, count);

  return shuffleArray([correctHanzi, ...selectedDistractors]);
}
