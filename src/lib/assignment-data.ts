// Comprehensive Data Definitions & 12 Official Question Types
// HSK Teacher Assignment & Exam Specification v2.0 (21/10/2026)

export type QuestionType =
  | "multiple_choice"
  | "matching"
  | "flashcard"
  | "fill_blank"
  | "sentence_order"
  | "true_false"
  | "handwriting_photo"
  | "essay"
  | "translation"
  | "find_error"
  | "listening_choice"
  | "listening_fill";

export interface QuestionTypeMeta {
  id: QuestionType;
  number: string;
  name: string;
  category: "AUTO" | "MANUAL";
  desc: string;
  gradingNote: string;
  defaultPoints: number;
}

export const OFFICIAL_12_QUESTION_TYPES: QuestionTypeMeta[] = [
  {
    id: "multiple_choice",
    number: "01",
    name: "Trắc nghiệm",
    category: "AUTO",
    desc: "Chọn 1 hoặc nhiều đáp án đúng trong các phương án cho sẵn.",
    gradingNote: "Hệ thống tự chấm so khớp ID đáp án.",
    defaultPoints: 5,
  },
  {
    id: "matching",
    number: "02",
    name: "Nối từ",
    category: "AUTO",
    desc: "Nối cặp từ tương ứng giữa hai cột (chữ Hán - Pinyin hoặc Nghĩa).",
    gradingNote: "Hệ thống tự chấm từng cặp nối chính xác.",
    defaultPoints: 10,
  },
  {
    id: "flashcard",
    number: "03",
    name: "Flashcard",
    category: "AUTO",
    desc: "Lật thẻ từ vựng hai mặt, học viên tự đánh giá Đã nhớ / Chưa nhớ.",
    gradingNote: "Theo dõi tiến độ chuyên cần, không bắt buộc tính điểm thi.",
    defaultPoints: 0,
  },
  {
    id: "fill_blank",
    number: "04",
    name: "Điền từ",
    category: "AUTO",
    desc: "Điền chữ Hán hoặc Pinyin vào chỗ trống còn thiếu trong câu.",
    gradingNote: "Tự chấm theo danh sách đáp án và biến thể hợp lệ.",
    defaultPoints: 5,
  },
  {
    id: "sentence_order",
    number: "05",
    name: "Sắp xếp câu",
    category: "AUTO",
    desc: "Kéo / chạm sắp xếp các cụm từ xáo trộn thành câu hoàn chỉnh.",
    gradingNote: "Tự chấm theo chuỗi token ID chuẩn.",
    defaultPoints: 10,
  },
  {
    id: "true_false",
    number: "06",
    name: "Đúng / Sai",
    category: "AUTO",
    desc: "Xác định câu phát biểu là Đúng hay Sai dựa trên ngữ cảnh.",
    gradingNote: "Hệ thống tự chấm, không lộ giải thích sớm.",
    defaultPoints: 5,
  },
  {
    id: "handwriting_photo",
    number: "07",
    name: "Chép từ – Nộp ảnh",
    category: "MANUAL",
    desc: "Học viên chép chữ Hán ra vở, chụp ảnh gửi lên hệ thống.",
    gradingNote: "Giáo viên chấm thủ công qua hình ảnh, nét chữ và số lần chép.",
    defaultPoints: 10,
  },
  {
    id: "essay",
    number: "08",
    name: "Tự luận",
    category: "MANUAL",
    desc: "Viết đoạn văn ngắn bằng tiếng Trung theo chủ đề yêu cầu.",
    gradingNote: "Giáo viên chấm thủ công theo thang Rubric và nhận xét.",
    defaultPoints: 15,
  },
  {
    id: "translation",
    number: "09",
    name: "Dịch câu",
    category: "MANUAL",
    desc: "Dịch câu từ tiếng Trung sang tiếng Việt hoặc ngược lại.",
    gradingNote: "Giáo viên chấm thủ công dựa trên câu dịch tham khảo.",
    defaultPoints: 10,
  },
  {
    id: "find_error",
    number: "10",
    name: "Tìm lỗi sai",
    category: "MANUAL",
    desc: "Phát hiện lỗi sai ngữ pháp / dùng từ trong câu và viết lại câu đúng.",
    gradingNote: "Giáo viên chấm thủ công phương án sửa chữa.",
    defaultPoints: 10,
  },
  {
    id: "listening_choice",
    number: "11",
    name: "Nghe chọn",
    category: "AUTO",
    desc: "Nghe đoạn băng audio / phát âm và chọn phương án đúng.",
    gradingNote: "Tự chấm, kiểm soát số lượt nghe tối đa.",
    defaultPoints: 5,
  },
  {
    id: "listening_fill",
    number: "12",
    name: "Nghe điền",
    category: "AUTO",
    desc: "Nghe audio và gõ các từ còn thiếu vào chỗ trống.",
    gradingNote: "Tự chấm chuẩn hóa chữ Hán / Pinyin.",
    defaultPoints: 10,
  },
];

export interface ExamQuestionItem {
  id: string;
  source: "ADMIN" | "MINE" | "TEMPLATE";
  sourceId?: string;
  sourceLesson?: string; // e.g. "HSK 1 – Bài 5", "HSK 2 – Bài 3"
  subtitle?: string; // e.g. "Chọn 1 đáp án đúng", "Sắp xếp các cụm từ thành câu hoàn chỉnh"
  status?: "DRAFT" | "READY";
  type: QuestionType;
  title: string;
  content: string;
  pinyin?: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hskLevel: number;
  curriculum: string; // e.g., "HSK 3.0", "Giao tiếp", "Kinh tế"
  explanation?: string;
  options?: string[];
  correctAnswer?: string | string[];
  selectionMode?: "SINGLE" | "MULTIPLE";
  matchingPairs?: { id?: string; left: string; right: string }[];
  tokens?: string[];
  correctOrder?: string[];
  flashcard?: { front: string; backPinyin: string; backVi: string; exampleZh?: string };
  audioUrl?: string;
  maxAudioPlays?: number;
  rubric?: string;
  sampleAnswer?: string;
  handwritingCount?: number;
  translationDirection?: "ZH_TO_VI" | "VI_TO_ZH";
  errorTokens?: { id: string; text: string; isError: boolean }[];
  blanks?: { id: string; answer: string; alternatives?: string }[];
  usedInExamCount?: number;
  usedInExams?: { id: string; title: string; status: string; className?: string; updatedAt: string }[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// 12 Guided Templates (Luồng C: Câu mẫu hướng dẫn và tùy chỉnh)
// ---------------------------------------------------------------------------
export const GUIDED_QUESTION_TEMPLATES: ExamQuestionItem[] = [
  {
    id: "tpl-01-mcq",
    source: "TEMPLATE",
    type: "multiple_choice",
    title: "Mẫu trắc nghiệm: Chọn từ thích hợp điền vào chỗ trống",
    content: "今天的天气非常好，我想去公园______。",
    pinyin: "Jīntiān de tiānqì fēicháng hǎo, wǒ xiǎng qù gōngyuán ______.",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    options: ["散步 (sànbù)", "睡觉 (shuìjiào)", "工作 (gōngzuò)", "生病 (shēngbìng)"],
    correctAnswer: "A",
    explanation: "Dựa vào ngữ cảnh 'thời tiết rất đẹp muốn đến công viên', hành động phù hợp nhất là '散步' (đi dạo).",
  },
  {
    id: "tpl-02-matching",
    source: "TEMPLATE",
    type: "matching",
    title: "Mẫu nối từ: Ghép chữ Hán với nghĩa tiếng Việt tương ứng",
    content: "Nối các từ vựng chỉ thời gian và trạng thái sức khỏe với nghĩa đúng:",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    matchingPairs: [
      { left: "今天 (jīntiān)", right: "Hôm nay" },
      { left: "明天 (míngtiān)", right: "Ngày mai" },
      { left: "休息 (xiūxi)", right: "Nghỉ ngơi" },
      { left: "生病 (shēngbìng)", right: "Bị ốm, bị bệnh" },
    ],
    explanation: "Học viên cần nối chính xác từng cặp chữ Hán và nghĩa tiếng Việt.",
  },
  {
    id: "tpl-03-flashcard",
    source: "TEMPLATE",
    type: "flashcard",
    title: "Mẫu thẻ Flashcard: Ôn tập từ vựng bệnh viện",
    content: "Thẻ từ vựng hai mặt giúp ghi nhớ từ mới nhanh chóng:",
    points: 0,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    flashcard: {
      front: "医院",
      backPinyin: "yīyuàn",
      backVi: "Bệnh viện (Ví dụ: 他去医院看病了 - Anh ấy đi bệnh viện khám bệnh rồi)",
    },
    explanation: "Học viên xem mặt trước, suy nghĩ nghĩa rồi lật thẻ để kiểm tra độ nhớ.",
  },
  {
    id: "tpl-04-fillblank",
    source: "TEMPLATE",
    type: "fill_blank",
    title: "Mẫu điền từ: Điền phó từ phủ định vào câu",
    content: "他身体不舒服，所以今天______去上班。(Anh ấy trong người không khỏe, nên hôm nay không đi làm).",
    pinyin: "Tā shēntǐ bù shūfu, suǒyǐ jīntiān ______ qù shàngbān.",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    correctAnswer: "不",
    explanation: "Điền phó từ phủ định '不' (hoặc 'bù') đứng trước động từ '去' để biểu thị không đi làm.",
  },
  {
    id: "tpl-05-order",
    source: "TEMPLATE",
    type: "sentence_order",
    title: "Mẫu sắp xếp câu: Hoàn thiện câu hỏi nghi vấn",
    content: "Sắp xếp các mảnh từ sau thành câu tiếng Trung hoàn chỉnh:",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    tokens: ["你", "明天", "休息", "吗", "？"],
    correctOrder: ["你", "明天", "休息", "吗", "？"],
    explanation: "Trật tự đúng: Chủ ngữ (你) + Trạng ngữ thời gian (明天) + Động từ (休息) + Trợ từ nghi vấn (吗) + Dấu câu (？).",
  },
  {
    id: "tpl-06-tf",
    source: "TEMPLATE",
    type: "true_false",
    title: "Mẫu đúng / sai: Đánh giá ngữ pháp trợ từ '了'",
    content: "Phát biểu: Trong câu '他生病了', trợ từ '了' biểu thị hành động đang tiếp diễn ở hiện tại.",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    correctAnswer: "SAI",
    explanation: "Sai. Trợ từ ngữ khí '了' ở đây biểu thị sự biến đổi trạng thái (trước đây khỏe mạnh, nay chuyển sang trạng thái ốm), không phải hành động đang tiếp diễn.",
  },
  {
    id: "tpl-07-handwriting",
    source: "TEMPLATE",
    type: "handwriting_photo",
    title: "Mẫu chép từ nộp ảnh: Tập viết các từ mới Bài 5",
    content: "Chép mỗi từ mới sau 5 lần vào vở luyện viết ô mễ (米字格): 今天, 明天, 休息, 医院. Sau đó chụp ảnh trang viết rõ nét và tải lên.",
    points: 10,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    rubric: "Đủ số lượng (4 điểm), đúng quy tắc bút thuận (3 điểm), ngay ngắn sạch đẹp (3 điểm).",
  },
  {
    id: "tpl-08-essay",
    source: "TEMPLATE",
    type: "essay",
    title: "Mẫu tự luận: Viết đoạn văn 'Ngày nghỉ ngơi của tôi'",
    content: "Dùng tiếng Trung viết đoạn văn từ 50-80 chữ giới thiệu về một ngày nghỉ của bạn. Gợi ý: Buổi sáng làm gì? Buổi chiều làm gì? Cảm thấy thế nào?",
    points: 15,
    difficulty: "HARD",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    rubric: "Dùng từ chính xác (5 điểm), ngữ pháp đúng (5 điểm), bố cục mạch lạc (5 điểm).",
    sampleAnswer: "今天我休息。早上我八点起床，喝一杯温水。下午我在家看中文书，听音乐。晚上我和朋友一起吃晚饭。虽然生活很平淡，但是我觉得非常开心。",
  },
  {
    id: "tpl-09-translation",
    source: "TEMPLATE",
    type: "translation",
    title: "Mẫu dịch câu: Dịch câu xin phép nghỉ ốm",
    content: "Dịch câu sau sang tiếng Trung: 'Thầy Vương, hôm nay em hơi không khỏe, muốn xin nghỉ một ngày ạ.'",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    sampleAnswer: "王老师，我今天身体有点不舒服，想请假一天。",
    explanation: "Có thể chấp nhận các biến thể tương đương như: '王老师，您好！我今天有点不舒服，想请一天假。'",
  },
  {
    id: "tpl-10-finderror",
    source: "TEMPLATE",
    type: "find_error",
    title: "Mẫu tìm lỗi sai: Lỗi trật tự trạng từ chỉ thời gian",
    content: "Tìm lỗi sai trong câu sau và viết lại câu đúng: '我想明天不去上班。'",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    sampleAnswer: "Câu đúng: '我明天不想去上班。' hoặc '明天我不想去上班。'",
    explanation: "Động từ năng nguyện '想' phải đi sau trạng ngữ chỉ thời gian '明天', và phó từ phủ định '不' phải đặt trước '想' (不想去).",
  },
  {
    id: "tpl-11-listenchoice",
    source: "TEMPLATE",
    type: "listening_choice",
    title: "Mẫu nghe chọn: Nghe đoạn đối thoại ngắn và trả lời",
    content: "Nghe đoạn băng và cho biết: Mary ngày mai dự định làm gì?",
    pinyin: "Audio hội thoại giữa hai người bạn về kế hoạch cuối tuần.",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    maxAudioPlays: 2,
    options: ["Đi làm tăng ca", "Ở nhà nghỉ ngơi tĩnh dưỡng", "Đi công viên tập thể dục", "Đến bệnh viện thăm bạn"],
    correctAnswer: "B",
    explanation: "Trong đoạn băng nhân vật nữ nói: '我最近工作太累了，明天想在家好好休息。'",
  },
  {
    id: "tpl-12-listenfill",
    source: "TEMPLATE",
    type: "listening_fill",
    title: "Mẫu nghe điền: Điền từ còn thiếu vào chỗ trống",
    content: "Nghe audio và điền từ còn thiếu vào câu: '王老师，我发烧了，正在宿舍______。'",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    maxAudioPlays: 3,
    correctAnswer: "休息",
    explanation: "Đáp án đúng là từ '休息' (nghỉ ngơi) hoặc pinyin 'xiuxi'.",
  },
];

// ---------------------------------------------------------------------------
// Unified Question Bank (Kho câu hỏi của tôi: 24 câu chuẩn theo Mockup & Đặc tả)
// Thống kê: Tất cả (24) = Bản nháp (5) + Đã hoàn thiện (19) | Đã sử dụng trong đề (8)
// ---------------------------------------------------------------------------
export const UNIFIED_QUESTION_BANK: ExamQuestionItem[] = [
  // 1. Mockup Item 1 (READY, Used in 3 exams)
  {
    id: "q-mock-01",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Chọn 1 đáp án đúng",
    status: "READY",
    type: "multiple_choice",
    title: "“休息” có nghĩa là gì?",
    content: "“休息” có nghĩa là gì?",
    pinyin: "xiūxi",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    options: ["Hôm nay", "Nghỉ ngơi", "Ngày mai", "Bị bệnh"],
    correctAnswer: "B",
    selectionMode: "SINGLE",
    explanation: "“休息” (xiūxi) có nghĩa là nghỉ ngơi.",
    usedInExamCount: 3,
    usedInExams: [
      { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5 (Đang soạn)", status: "Đang soạn", className: "Lớp HSK 1A", updatedAt: "23/05/2025" },
      { id: "ex-2", title: "Kiểm tra giữa kỳ (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 1B", updatedAt: "20/05/2025" },
      { id: "ex-3", title: "Bài tập tuần 3 (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 1A", updatedAt: "15/05/2025" },
    ],
    createdAt: "23/05/2025 08:30",
    updatedAt: "23/05/2025 10:24",
  },
  // 2. Mockup Item 2 (READY, Used in 1 exam)
  {
    id: "q-mock-02",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Sắp xếp các cụm từ thành câu hoàn chỉnh",
    status: "READY",
    type: "sentence_order",
    title: "Sắp xếp câu: 我今天休息",
    content: "我今天休息",
    pinyin: "Wǒ jīntiān xiūxi.",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    tokens: ["我", "今天", "休息"],
    correctOrder: ["我", "今天", "休息"],
    sampleAnswer: "我今天休息。",
    explanation: "Trật tự câu: Chủ ngữ (我) + Trạng từ thời gian (今天) + Vị ngữ (休息).",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5 (Đang soạn)", status: "Đang soạn", className: "Lớp HSK 1A", updatedAt: "22/05/2025" },
    ],
    createdAt: "22/05/2025 14:00",
    updatedAt: "22/05/2025 15:10",
  },
  // 3. Mockup Item 3 (DRAFT 1, Used in 0 exams)
  {
    id: "q-mock-03",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Điền từ thích hợp vào chỗ trống",
    status: "DRAFT",
    type: "fill_blank",
    title: "Điền từ: 我______咖啡",
    content: "我是______咖啡。",
    pinyin: "Wǒ shì ______ kāfēi.",
    points: 10,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    blanks: [{ id: "b1", answer: "喝", alternatives: "he, hē" }],
    correctAnswer: "喝",
    explanation: "“喝” (hē) có nghĩa là uống.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "21/05/2025 09:15",
    updatedAt: "21/05/2025 09:15",
  },
  // 4. Mockup Item 4 (READY, Used in 2 exams)
  {
    id: "q-mock-04",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 3",
    subtitle: "Nối từ với nghĩa đúng",
    status: "READY",
    type: "matching",
    title: "Nối từ với nghĩa",
    content: "Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    matchingPairs: [
      { id: "p1", left: "今天 (jīntiān)", right: "Hôm nay" },
      { id: "p2", left: "明天 (míngtiān)", right: "Ngày mai" },
      { id: "p3", left: "休息 (xiūxi)", right: "Nghỉ ngơi" },
      { id: "p4", left: "生病 (shēngbìng)", right: "Bị bệnh" },
    ],
    explanation: "Nối chính xác các cặp từ vựng chỉ thời gian và trạng thái.",
    usedInExamCount: 2,
    usedInExams: [
      { id: "ex-2", title: "Kiểm tra giữa kỳ (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 2A", updatedAt: "18/05/2025" },
      { id: "ex-3", title: "Bài tập tuần 3 (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 2A", updatedAt: "17/05/2025" },
    ],
    createdAt: "18/05/2025 15:00",
    updatedAt: "18/05/2025 16:30",
  },
  // 5. Mockup Item 5 (READY, Used in 1 exam)
  {
    id: "q-mock-05",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 2",
    subtitle: "Chép lại từ theo mẫu",
    status: "READY",
    type: "handwriting_photo",
    title: "Chép từ – 写汉...",
    content: "Chép các từ sau 5 lần vào vở: 今天、明天、休息、生病",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    handwritingCount: 5,
    rubric: "Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Đúng bút thuận (2đ), Ngay ngắn sạch đẹp (2đ).",
    sampleAnswer: "今天、明天、休息、生病",
    explanation: "Học viên viết vào vở ô mễ rồi chụp ảnh gửi giáo viên chấm.",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5 (Đang soạn)", status: "Đang soạn", className: "Lớp HSK 1A", updatedAt: "17/05/2025" },
    ],
    createdAt: "17/05/2025 10:00",
    updatedAt: "17/05/2025 11:20",
  },
  // 6. Flashcard (READY, Used in 0 exams)
  {
    id: "q-mock-06",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Thẻ từ vựng 2 mặt",
    status: "READY",
    type: "flashcard",
    title: "Thẻ Flashcard từ vựng: 医院",
    content: "Thẻ từ vựng bệnh viện",
    pinyin: "yīyuàn",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    flashcard: {
      front: "医院",
      backPinyin: "yīyuàn",
      backVi: "Bệnh viện",
      exampleZh: "他去医院看病了。(Anh ấy đi bệnh viện khám bệnh rồi).",
    },
    explanation: "Học viên xem mặt trước chữ Hán và lật thẻ để ôn tập nghĩa và ví dụ.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "16/05/2025 09:10",
    updatedAt: "16/05/2025 14:40",
  },
  // 7. DRAFT 2 (Used in 0 exams)
  {
    id: "q-mock-07",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 4",
    subtitle: "Chọn đáp án đúng Đúng/Sai",
    status: "DRAFT",
    type: "true_false",
    title: "Đúng/Sai: Trợ từ ngữ khí 了",
    content: "Trong câu '他生病了', trợ từ '了' biểu thị sự thay đổi trạng thái mới phát sinh.",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    correctAnswer: "DUNG",
    explanation: "Trợ từ '了' ở cuối câu biểu thị có tình hình mới hoặc trạng thái mới phát sinh.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "15/05/2025 11:00",
    updatedAt: "15/05/2025 11:00",
  },
  // 8. Tự luận (READY, Used in 1 exam)
  {
    id: "q-mock-08",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Viết đoạn văn ngắn 50-80 chữ",
    status: "READY",
    type: "essay",
    title: "Tự luận: Giới thiệu ngày nghỉ của bạn",
    content: "Dùng tiếng Trung viết đoạn văn từ 50-80 chữ giới thiệu về một ngày nghỉ của bạn.",
    points: 15,
    difficulty: "HARD",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    sampleAnswer: "今天我休息。早上我在宿舍看书，听音乐。下午我和朋友一起去公园散步。虽然生活很简单，但是我觉得非常开心。",
    rubric: "Nội dung phù hợp chủ đề (5đ), Ngữ pháp chính xác (5đ), Chữ viết chuẩn (5đ).",
    explanation: "Đánh giá khả năng diễn đạt câu phức và từ vựng chỉ thời gian sinh hoạt.",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5 (Đang soạn)", status: "Đang soạn", className: "Lớp HSK 1A", updatedAt: "14/05/2025" },
    ],
    createdAt: "14/05/2025 09:30",
    updatedAt: "14/05/2025 16:15",
  },
  // 9. Dịch câu (READY, Used in 0 exams)
  {
    id: "q-mock-09",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Dịch Trung sang Việt",
    status: "READY",
    type: "translation",
    title: "Dịch câu: Xin phép giáo viên nghỉ học",
    content: "王老师，我今天身体有点不舒服，想请假一天。",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    translationDirection: "ZH_TO_VI",
    sampleAnswer: "Thầy Vương, hôm nay em hơi không khỏe, muốn xin nghỉ một ngày ạ.",
    explanation: "Chú ý cấu trúc '有点儿 + tính từ' và động từ ly hợp '请假'.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "13/05/2025 10:20",
    updatedAt: "13/05/2025 11:45",
  },
  // 10. Tìm lỗi sai (READY, Used in 1 exam)
  {
    id: "q-mock-10",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 1",
    subtitle: "Bấm vào cụm từ bị sai trong câu",
    status: "READY",
    type: "find_error",
    title: "Tìm lỗi sai: Logic trạng từ thời gian",
    content: "我 明天 昨天 休息。",
    points: 10,
    difficulty: "HARD",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    errorTokens: [
      { id: "e1", text: "我", isError: false },
      { id: "e2", text: "明天", isError: true },
      { id: "e3", text: "昨天", isError: true },
      { id: "e4", text: "休息。", isError: false },
    ],
    sampleAnswer: "我明天休息。 / 我昨天休息。",
    explanation: "Không thể đặt cùng lúc hai trạng từ chỉ thời gian mâu thuẫn '明天' và '昨天'.",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-2", title: "Kiểm tra giữa kỳ (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 2A", updatedAt: "12/05/2025" },
    ],
    createdAt: "12/05/2025 08:45",
    updatedAt: "12/05/2025 14:00",
  },
  // 11. Nghe chọn (READY, Used in 0 exams)
  {
    id: "q-mock-11",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Nghe audio và chọn đáp án",
    status: "READY",
    type: "listening_choice",
    title: "Nghe chọn: Kế hoạch ngày mai của bạn nữ",
    content: "Người nói ngày mai dự định làm gì?",
    audioUrl: "/sample-audio/hsk1-b5-dialogue.mp3",
    maxAudioPlays: 2,
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    options: ["Đi làm tăng ca", "Ở nhà nghỉ ngơi đọc sách", "Đi công viên tập thể dục", "Đến bệnh viện thăm bạn"],
    correctAnswer: "B",
    sampleAnswer: "A: 你明天去上班吗？ B: 我明天休息，在宿舍看书。",
    explanation: "Trong hội thoại nhân vật B nói rõ '在宿舍看书'.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "11/05/2025 15:20",
    updatedAt: "11/05/2025 17:30",
  },
  // 12. DRAFT 3 (Used in 0 exams)
  {
    id: "q-mock-12",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 5",
    subtitle: "Nghe audio và điền vào ô trống",
    status: "DRAFT",
    type: "listening_fill",
    title: "Nghe điền: Lời xin phép nghỉ ốm",
    content: "王老师，我发烧了，正在宿舍 [_____] 。",
    audioUrl: "/sample-audio/hsk1-b5-fill.mp3",
    maxAudioPlays: 2,
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    correctAnswer: "休息",
    sampleAnswer: "王老师，我发烧了，正在宿舍休息。",
    explanation: "Từ cần điền là '休息'.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "10/05/2025 16:00",
    updatedAt: "10/05/2025 16:00",
  },
  // 13. Trắc nghiệm (READY, Used in 0 exams)
  {
    id: "q-mock-13",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 3",
    subtitle: "Chọn lượng từ thích hợp",
    status: "READY",
    type: "multiple_choice",
    title: "Lượng từ: Phân biệt 个 và 本",
    content: "桌子上有两______书。(Trên bàn có 2 cuốn sách).",
    pinyin: "Zhuōzi shàng yǒu liǎng ______ shū.",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    options: ["本 (běn)", "个 (gè)", "支 (zhī)", "张 (zhāng)"],
    correctAnswer: "A",
    selectionMode: "SINGLE",
    explanation: "Lượng từ dùng cho sách vở là '本'.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "09/05/2025 09:00",
    updatedAt: "09/05/2025 10:15",
  },
  // 14. Nối từ (READY, Used in 1 exam)
  {
    id: "q-mock-14",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 6",
    subtitle: "Nối tính từ trái nghĩa",
    status: "READY",
    type: "matching",
    title: "Nối từ: Cặp tính từ trái nghĩa",
    content: "Nối các tính từ ở cột A với từ trái nghĩa tương ứng ở cột B:",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    matchingPairs: [
      { id: "p1", left: "大 (dà - lớn)", right: "小 (xiǎo - nhỏ)" },
      { id: "p2", left: "多 (duō - nhiều)", right: "少 (shǎo - ít)" },
      { id: "p3", left: "快 (kuài - nhanh)", right: "慢 (màn - chậm)" },
      { id: "p4", left: "高 (gāo - cao)", right: "矮 (ǎi - thấp)" },
    ],
    explanation: "Các cặp tính từ trái nghĩa cơ bản trong HSK 2.",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-3", title: "Bài tập tuần 3 (Bản nháp)", status: "Bản nháp", className: "Lớp HSK 2A", updatedAt: "08/05/2025" },
    ],
    createdAt: "08/05/2025 13:40",
    updatedAt: "08/05/2025 15:00",
  },
  // 15. Flashcard (READY, Used in 0 exams)
  {
    id: "q-mock-15",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 4",
    subtitle: "Thẻ từ vựng phương hướng",
    status: "READY",
    type: "flashcard",
    title: "Thẻ Flashcard: 前边 / 后边",
    content: "Thẻ ôn tập từ chỉ phương vị",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    flashcard: {
      front: "前边",
      backPinyin: "qiánbian",
      backVi: "Phía trước",
      exampleZh: "学校的前边有一个超市。(Phía trước trường học có một siêu thị).",
    },
    explanation: "Ôn tập vị trí không gian.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "07/05/2025 11:15",
    updatedAt: "07/05/2025 11:45",
  },
  // 16. DRAFT 4 (Used in 0 exams)
  {
    id: "q-mock-16",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 3 – Bài 2",
    subtitle: "Cấu trúc câu chữ 把",
    status: "DRAFT",
    type: "sentence_order",
    title: "Sắp xếp câu chữ 把 (Bản nháp)",
    content: "请 把 药 吃了。",
    points: 10,
    difficulty: "HARD",
    hskLevel: 3,
    curriculum: "HSK 3.0",
    tokens: ["请", "把", "药", "吃了。"],
    correctOrder: ["请", "把", "药", "吃了。"],
    sampleAnswer: "请把药吃了。",
    explanation: "Cấu trúc câu chữ 把: Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "06/05/2025 14:00",
    updatedAt: "06/05/2025 14:00",
  },
  // 17. Đúng / Sai (READY, Used in 0 exams)
  {
    id: "q-mock-17",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 1",
    subtitle: "Quy tắc ngữ âm thanh điệu",
    status: "READY",
    type: "true_false",
    title: "Đúng/Sai: Biến điệu của '一' (yī)",
    content: "Từ '一' (yī) khi đứng trước âm tiết mang thanh 4 sẽ chuyển sang đọc thành thanh 2 (yí).",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    correctAnswer: "DUNG",
    explanation: "Chính xác. Ví dụ: 一样 (yí yàng), 一共 (yí gòng).",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "05/05/2025 10:00",
    updatedAt: "05/05/2025 10:50",
  },
  // 18. Chép từ (READY, Used in 0 exams)
  {
    id: "q-mock-18",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 1",
    subtitle: "Luyện viết nét cơ bản",
    status: "READY",
    type: "handwriting_photo",
    title: "Chép từ: Nhất, Nhị, Tam, Tứ",
    content: "Chép các số đếm sau 5 lần: 一、二、三、四",
    points: 10,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    handwritingCount: 5,
    rubric: "Nét ngang thẳng hàng (4đ), Đủ 5 lần (3đ), Cân đối (3đ).",
    sampleAnswer: "一、二、三、四",
    explanation: "Luyện các nét ngang và quy tắc viết từ trên xuống dưới.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "04/05/2025 08:30",
    updatedAt: "04/05/2025 09:15",
  },
  // 19. Dịch câu (READY, Used in 1 exam)
  {
    id: "q-mock-19",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 2",
    subtitle: "Dịch Việt sang Trung",
    status: "READY",
    type: "translation",
    title: "Dịch câu: Cảm ơn và không có gì",
    content: "Dịch sang tiếng Trung: 'Cảm ơn bạn! - Không có gì đâu.'",
    points: 10,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    translationDirection: "VI_TO_ZH",
    sampleAnswer: "谢谢你！——不客气。",
    explanation: "Mẫu câu giao tiếp lịch sự cơ bản.",
    usedInExamCount: 1,
    usedInExams: [
      { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5 (Đang soạn)", status: "Đang soạn", className: "Lớp HSK 1A", updatedAt: "03/05/2025" },
    ],
    createdAt: "03/05/2025 16:10",
    updatedAt: "03/05/2025 17:00",
  },
  // 20. Tìm lỗi sai (READY, Used in 0 exams)
  {
    id: "q-mock-20",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 5",
    subtitle: "Lỗi dùng phó từ 不 và 没",
    status: "READY",
    type: "find_error",
    title: "Tìm lỗi sai: Phủ định hành động trong quá khứ",
    content: "我 昨天 不 去 上学。",
    points: 10,
    difficulty: "HARD",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    errorTokens: [
      { id: "e1", text: "我", isError: false },
      { id: "e2", text: "昨天", isError: false },
      { id: "e3", text: "不", isError: true },
      { id: "e4", text: "去 上学。", isError: false },
    ],
    sampleAnswer: "我昨天没去上学。",
    explanation: "Phủ định hành động đã xảy ra trong quá khứ phải dùng '没' hoặc '没有', không dùng '不'.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "02/05/2025 14:00",
    updatedAt: "02/05/2025 14:45",
  },
  // 21. DRAFT 5 (Used in 0 exams)
  {
    id: "q-mock-21",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 3 – Bài 6",
    subtitle: "Chủ đề học thuật chuyên ngành",
    status: "DRAFT",
    type: "essay",
    title: "Tự luận: Khái niệm hàng hóa và giá trị sử dụng",
    content: "Giải thích ngắn gọn khái niệm '商品' (hàng hóa) theo quan điểm kinh tế học.",
    points: 15,
    difficulty: "HARD",
    hskLevel: 3,
    curriculum: "Đại học & Ngành",
    sampleAnswer: "商品是用于交换的劳动产品，具有使用价值和价值两个基本属性。",
    rubric: "Nêu đủ 2 thuộc tính (8đ), Diễn đạt chuẩn học thuật (7đ).",
    explanation: "Đặc tả chuyên ngành Thương Mại - Kinh tế chính trị học.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "01/05/2025 11:30",
    updatedAt: "01/05/2025 11:30",
  },
  // 22. Trắc nghiệm (READY, Used in 0 exams)
  {
    id: "q-mock-22",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 8",
    subtitle: "Chọn liên từ biểu thị điều kiện",
    status: "READY",
    type: "multiple_choice",
    title: "Liên từ: Cặp từ 只要...就...",
    content: "______明天不下雨，我们______去踢足球。(Chỉ cần ngày mai không mưa, chúng mình liền đi đá bóng).",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    options: ["只要...就...", "因为...所以...", "虽然...但是...", "不仅...而且..."],
    correctAnswer: "A",
    selectionMode: "SINGLE",
    explanation: "Cặp liên từ '只要...就...' biểu thị điều kiện đủ.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "30/04/2025 10:10",
    updatedAt: "30/04/2025 11:00",
  },
  // 23. Điền từ (READY, Used in 0 exams)
  {
    id: "q-mock-23",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 1 – Bài 6",
    subtitle: "Điền trợ từ kết cấu 的",
    status: "READY",
    type: "fill_blank",
    title: "Điền từ: Trợ từ sở hữu 的",
    content: "这是我 [_____] 汉语老师。(Đây là giáo viên tiếng Trung của tôi).",
    points: 5,
    difficulty: "EASY",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    blanks: [{ id: "b1", answer: "的", alternatives: "de" }],
    correctAnswer: "的",
    explanation: "Trợ từ sở hữu '的' đứng giữa định ngữ và trung tâm ngữ.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "29/04/2025 09:20",
    updatedAt: "29/04/2025 10:00",
  },
  // 24. Nghe điền (READY, Used in 0 exams)
  {
    id: "q-mock-24",
    source: "MINE",
    sourceId: "src-teacher-01",
    sourceLesson: "HSK 2 – Bài 2",
    subtitle: "Nghe audio đoạn hội thoại và điền từ",
    status: "READY",
    type: "listening_fill",
    title: "Nghe điền: Thời tiết Bắc Kinh mùa thu",
    content: "北京的秋天天气非常好，不冷也 [_____] 。",
    audioUrl: "/sample-audio/hsk2-b2.mp3",
    maxAudioPlays: 2,
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 2,
    curriculum: "HSK 3.0",
    correctAnswer: "不热",
    sampleAnswer: "北京的秋天天气非常好，不冷也不热。",
    explanation: "Cụm từ cố định '不冷也不热' nghĩa là không lạnh cũng không nóng.",
    usedInExamCount: 0,
    usedInExams: [],
    createdAt: "28/04/2025 14:15",
    updatedAt: "28/04/2025 15:30",
  },
];

// ---------------------------------------------------------------------------
// Waiting for Grading Mock Submissions & Extended Assignment/Exam Models
// ---------------------------------------------------------------------------
export interface ManualQuestionItem {
  questionId: string;
  questionTitle: string;
  type: QuestionType;
  maxPoints: number;
  awardedPoints?: number;
  studentResponseText?: string;
  studentPhotoUrl?: string;
  studentPhotoUrls?: string[];
  handwritingWords?: string[];
  requiredRepeats?: number;
  rubric?: string;
  criteriaBreakdown?: {
    correctHanzi?: number;
    repeatCount?: number;
    strokeClarity?: number;
    layoutClean?: number;
  };
  teacherComment?: string;
}

export interface StudentSubmissionItem {
  id: string;
  studentId?: string;
  studentName: string;
  studentAvatar: string;
  assignmentId?: string;
  assignmentTitle: string;
  classId?: string;
  className: string;
  attemptNumber: number;
  submittedAt: string;
  submissionStatus: "SUBMITTED" | "LATE_SUBMITTED" | "RESUBMISSION_REQUIRED" | "NOT_STARTED" | "IN_PROGRESS" | "EXPIRED";
  gradingStatus: "UNGRADED" | "WAITING_MANUAL" | "GRADING" | "GRADED" | "PUBLISHED";
  status: "WAITING_GRADE" | "GRADED" | "REQUEST_RESUBMIT" | "PUBLISHED";
  answeredQuestionsCount: number;
  totalQuestionsCount: number;
  autoScore: number;
  manualScore?: number;
  totalScore?: number;
  maxScore: number;
  isPublished: boolean;
  publishedAt?: string;
  resubmitReason?: string;
  teacherOverallFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  manualQuestions: ManualQuestionItem[];
}

export interface ExamPackageItem {
  id: string;
  title: string;
  description: string;
  curriculum: string;
  hskLevel: number;
  status: "DRAFT" | "READY" | "ARCHIVED";
  questionsCount: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  questions: ExamQuestionItem[];
}

export interface TeacherAssignmentRecord {
  id: string;
  examId?: string;
  title: string;
  classId: string;
  className: string;
  assignedAt: string;
  openAt: string;
  dueAt: string;
  durationMin: number;
  maxAttempts: number;
  assignedCount: number;
  submittedCount: number;
  unsubmittedCount: number;
  waitingGradeCount: number;
  gradedCount: number;
  publishedCount: number;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED";
  allowLate: boolean;
  viewScorePolicy: "AFTER_SUBMIT" | "AFTER_PUBLISH" | "NEVER";
}

export const MOCK_EXAM_PACKAGES: ExamPackageItem[] = [
  {
    id: "exam-pkg-01",
    title: "Đề kiểm tra giữa kỳ HSK 1 Tiêu chuẩn (Đề 01)",
    description: "Bao gồm trắc nghiệm, nối từ, sắp xếp câu và tự luận ngắn.",
    curriculum: "HSK 3.0",
    hskLevel: 1,
    status: "READY",
    questionsCount: 12,
    totalPoints: 100,
    createdAt: "18/10/2026 09:00",
    updatedAt: "20/10/2026 14:00",
    questions: [],
  },
  {
    id: "exam-pkg-02",
    title: "Bản nháp: Bài tập luyện nghe & điền từ HSK 2",
    description: "Đang biên soạn câu hỏi nghe chọn và nghe điền đoạn hội thoại.",
    curriculum: "HSK 3.0",
    hskLevel: 2,
    status: "DRAFT",
    questionsCount: 4,
    totalPoints: 35,
    createdAt: "22/10/2026 10:30",
    updatedAt: "22/10/2026 16:45",
    questions: [],
  },
  {
    id: "exam-pkg-03",
    title: "Luyện viết chữ Hán và nộp ảnh tuần 2",
    description: "Đề chép từ nộp ảnh kèm theo dịch câu ngắn.",
    curriculum: "HSK 3.0",
    hskLevel: 2,
    status: "READY",
    questionsCount: 4,
    totalPoints: 40,
    createdAt: "15/10/2026 08:00",
    updatedAt: "17/10/2026 11:20",
    questions: [],
  },
  {
    id: "exam-pkg-04",
    title: "Đề ôn tập học kỳ 1 (Khóa cũ 2025)",
    description: "Đề tổng hợp đã lưu trữ sau khi khóa học kết thúc.",
    curriculum: "HSK 2.0",
    hskLevel: 1,
    status: "ARCHIVED",
    questionsCount: 20,
    totalPoints: 100,
    createdAt: "10/01/2025 08:00",
    updatedAt: "15/06/2025 17:00",
    questions: [],
  },
];

export const MOCK_WAITING_SUBMISSIONS: StudentSubmissionItem[] = [
  {
    id: "sub-01",
    studentId: "std-01",
    studentName: "Nguyễn Văn An",
    studentAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    assignmentId: "ass-1",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 1,
    submittedAt: "21/10/2026 14:30",
    submissionStatus: "SUBMITTED",
    gradingStatus: "WAITING_MANUAL",
    status: "WAITING_GRADE",
    answeredQuestionsCount: 6,
    totalQuestionsCount: 6,
    autoScore: 30,
    maxScore: 50,
    isPublished: false,
    manualQuestions: [
      {
        questionId: "mq-1",
        questionTitle: "Chép từ – Nộp ảnh: 4 từ mới Bài 5",
        type: "handwriting_photo",
        maxPoints: 10,
        studentPhotoUrl: "https://images.unsplash.com/photo-1584697964190-705b89369e96?w=800",
        studentPhotoUrls: [
          "https://images.unsplash.com/photo-1584697964190-705b89369e96?w=800",
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"
        ],
        handwritingWords: ["今天", "明天", "休息", "生病"],
        requiredRepeats: 5,
        rubric: "Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Nét chữ rõ đẹp (2đ), Trình bày sạch (2đ).",
        criteriaBreakdown: {
          correctHanzi: 4,
          repeatCount: 2,
          strokeClarity: 2,
          layoutClean: 2,
        },
      },
      {
        questionId: "mq-2",
        questionTitle: "Dịch câu: Xin phép nghỉ ốm",
        type: "translation",
        maxPoints: 10,
        studentResponseText: "王老师好，我今天身体有点不舒服，想请假一天。",
        rubric: "Đúng ngữ nghĩa và kính ngữ (5đ), đúng cấu trúc xin phép (5đ).",
      },
    ],
  },
  {
    id: "sub-02",
    studentId: "std-02",
    studentName: "Trần Thị Mai",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    assignmentId: "ass-1",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 1,
    submittedAt: "21/10/2026 15:10",
    submissionStatus: "SUBMITTED",
    gradingStatus: "WAITING_MANUAL",
    status: "WAITING_GRADE",
    answeredQuestionsCount: 6,
    totalQuestionsCount: 6,
    autoScore: 30,
    maxScore: 50,
    isPublished: false,
    manualQuestions: [
      {
        questionId: "mq-3",
        questionTitle: "Tự luận: Giới thiệu ngày nghỉ của bạn",
        type: "essay",
        maxPoints: 10,
        studentResponseText: "今天星期日，我休息。早上八点起床，我和妈妈去超市买菜。下午在家看中文故事，听音乐。晚上我们吃饺子，我觉得很开心！",
        rubric: "Từ vựng phong phú (4đ), ngữ pháp chuẩn (3đ), bố cục rõ (3đ).",
      },
      {
        questionId: "mq-1b",
        questionTitle: "Chép từ – Nộp ảnh: 4 từ mới Bài 5",
        type: "handwriting_photo",
        maxPoints: 10,
        studentPhotoUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        handwritingWords: ["今天", "明天", "休息", "生病"],
        requiredRepeats: 5,
        rubric: "Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Nét chữ rõ đẹp (2đ), Trình bày sạch (2đ).",
      },
    ],
  },
  {
    id: "sub-03",
    studentId: "std-03",
    studentName: "Lê Hoàng Long",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    assignmentId: "ass-1",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 1,
    submittedAt: "20/10/2026 10:15",
    submissionStatus: "SUBMITTED",
    gradingStatus: "PUBLISHED",
    status: "PUBLISHED",
    answeredQuestionsCount: 6,
    totalQuestionsCount: 6,
    autoScore: 30,
    manualScore: 19,
    totalScore: 49,
    maxScore: 50,
    isPublished: true,
    publishedAt: "21/10/2026 09:00",
    teacherOverallFeedback: "Nét chữ rất đẹp, đúng thứ tự bút thuận. Dịch câu tự nhiên và chuẩn văn phong!",
    gradedBy: "Giáo viên Hanyu",
    gradedAt: "21/10/2026 08:45",
    manualQuestions: [
      {
        questionId: "mq-1c",
        questionTitle: "Chép từ – Nộp ảnh: 4 từ mới Bài 5",
        type: "handwriting_photo",
        maxPoints: 10,
        awardedPoints: 10,
        studentPhotoUrl: "https://images.unsplash.com/photo-1584697964190-705b89369e96?w=800",
        handwritingWords: ["今天", "明天", "休息", "生病"],
        requiredRepeats: 5,
        rubric: "Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Nét chữ rõ đẹp (2đ), Trình bày sạch (2đ).",
        teacherComment: "Chữ viết rất đều, đủ 5 lượt mỗi từ.",
      },
      {
        questionId: "mq-2c",
        questionTitle: "Dịch câu: Xin phép nghỉ ốm",
        type: "translation",
        maxPoints: 10,
        awardedPoints: 9,
        studentResponseText: "王老师，我今天生病了，想请假休息一天。",
        teacherComment: "Rất tốt, lưu ý dùng thêm kính ngữ 您 cho lịch sự hơn.",
      },
    ],
  },
  {
    id: "sub-04",
    studentId: "std-04",
    studentName: "Phạm Minh Thư",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    assignmentId: "ass-1",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 1,
    submittedAt: "21/10/2026 16:45",
    submissionStatus: "RESUBMISSION_REQUIRED",
    gradingStatus: "WAITING_MANUAL",
    status: "REQUEST_RESUBMIT",
    answeredQuestionsCount: 6,
    totalQuestionsCount: 6,
    autoScore: 28,
    maxScore: 50,
    isPublished: false,
    resubmitReason: "Ảnh chụp bài viết tay bị mờ và lóa sáng, vui lòng chụp lại rõ nét cả trang vở để cô chấm nhé!",
    manualQuestions: [
      {
        questionId: "mq-1d",
        questionTitle: "Chép từ – Nộp ảnh: 4 từ mới Bài 5",
        type: "handwriting_photo",
        maxPoints: 10,
        studentPhotoUrl: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800",
        handwritingWords: ["今天", "明天", "休息", "生病"],
        requiredRepeats: 5,
        teacherComment: "Ảnh bị mờ chữ và bóng đen, yêu cầu nộp lại ảnh mới.",
      },
    ],
  },
  {
    id: "sub-05",
    studentId: "std-05",
    studentName: "Đặng Quốc Huy",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    assignmentId: "ass-2",
    assignmentTitle: "Kiểm tra giữa kỳ: HSK 1 Tiêu chuẩn (Đề 01)",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 1,
    submittedAt: "22/10/2026 09:12",
    submissionStatus: "LATE_SUBMITTED",
    gradingStatus: "WAITING_MANUAL",
    status: "WAITING_GRADE",
    answeredQuestionsCount: 12,
    totalQuestionsCount: 12,
    autoScore: 70,
    maxScore: 100,
    isPublished: false,
    manualQuestions: [
      {
        questionId: "mq-5a",
        questionTitle: "Tự luận: Đoạn văn tiếng Trung 60 chữ",
        type: "essay",
        maxPoints: 15,
        studentResponseText: "我想去中国旅游，因为我很喜欢中国文化和中国菜。明年我要考HSK3级。",
        rubric: "Nội dung (5đ), Ngữ pháp (5đ), Độ dài (5đ).",
      },
      {
        questionId: "mq-5b",
        questionTitle: "Dịch câu: Hẹn gặp bạn ở thư viện",
        type: "translation",
        maxPoints: 15,
        studentResponseText: "明天下午两点我们在图书馆见吧。",
        rubric: "Đúng ngữ pháp (8đ), đúng từ vựng (7đ).",
      },
    ],
  },
  {
    id: "sub-06",
    studentId: "std-06",
    studentName: "Vũ Hải Yến",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    assignmentId: "ass-3",
    assignmentTitle: "Luyện viết chữ Hán và nộp ảnh tuần 2",
    classId: "c2",
    className: "HSK2-K18 Cấp tốc",
    attemptNumber: 1,
    submittedAt: "19/10/2026 21:00",
    submissionStatus: "SUBMITTED",
    gradingStatus: "GRADED",
    status: "GRADED",
    answeredQuestionsCount: 4,
    totalQuestionsCount: 4,
    autoScore: 20,
    manualScore: 18,
    totalScore: 38,
    maxScore: 40,
    isPublished: false,
    teacherOverallFeedback: "Bài làm tốt, chữ viết thanh mảnh sạch sẽ.",
    gradedBy: "Giáo viên Hanyu",
    gradedAt: "20/10/2026 14:00",
    manualQuestions: [
      {
        questionId: "mq-6a",
        questionTitle: "Chép từ – Nộp ảnh: HSK2 Tuần 2",
        type: "handwriting_photo",
        maxPoints: 20,
        awardedPoints: 18,
        studentPhotoUrl: "https://images.unsplash.com/photo-1584697964190-705b89369e96?w=800",
        rubric: "Viết đúng chữ Hán (8đ), Đủ lần chép (4đ), Nét chữ rõ đẹp (4đ), Trình bày sạch (4đ).",
      },
    ],
  },
  {
    id: "sub-07",
    studentId: "std-07",
    studentName: "Hoàng Đức Anh",
    studentAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100",
    assignmentId: "ass-1",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    classId: "c1",
    className: "HSK1-K24 Sơ cấp",
    attemptNumber: 0,
    submittedAt: "—",
    submissionStatus: "NOT_STARTED",
    gradingStatus: "UNGRADED",
    status: "WAITING_GRADE",
    answeredQuestionsCount: 0,
    totalQuestionsCount: 6,
    autoScore: 0,
    maxScore: 50,
    isPublished: false,
    manualQuestions: [],
  },
];
