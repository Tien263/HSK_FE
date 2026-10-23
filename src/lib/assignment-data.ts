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
// Unified Question Bank (Luồng A: Admin + Cá nhân của tôi)
// ---------------------------------------------------------------------------
export const UNIFIED_QUESTION_BANK: ExamQuestionItem[] = [
  ...GUIDED_QUESTION_TEMPLATES.map((t, idx) => ({
    ...t,
    id: `admin-q-${idx + 1}`,
    source: "ADMIN" as const,
    sourceId: `src-admin-${idx + 1}`,
    title: `[Admin] ${t.title}`,
  })),
  {
    id: "mine-q-1",
    source: "MINE",
    sourceId: "src-teacher-101",
    type: "multiple_choice",
    title: "[Của tôi] Phân biệt từ vựng 生病 và 看病",
    content: "他去医院______了，因为他______了。",
    points: 5,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    options: ["看病 / 生病", "生病 / 看病", "休息 / 工作", "工作 / 休息"],
    correctAnswer: "A",
    explanation: "Đi bệnh viện khám bệnh dùng '看病', nguyên nhân là do bị ốm '生病'.",
  },
  {
    id: "mine-q-2",
    source: "MINE",
    sourceId: "src-teacher-102",
    type: "translation",
    title: "[Của tôi] Dịch câu hỏi thăm bạn bè",
    content: "Dịch sang tiếng Trung: 'Ngày mai bạn có rảnh không? Chúng mình cùng đi thư viện nhé!'",
    points: 10,
    difficulty: "MEDIUM",
    hskLevel: 1,
    curriculum: "HSK 3.0",
    sampleAnswer: "你明天有空吗？我们一起去图书馆吧！",
    explanation: "Dùng trợ từ '吧' biểu thị lời rủ rê đề nghị thân mật.",
  },
];

// ---------------------------------------------------------------------------
// Waiting for Grading Mock Submissions (Chờ chấm thủ công)
// ---------------------------------------------------------------------------
export interface StudentSubmissionItem {
  id: string;
  assignmentTitle: string;
  className: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  status: "WAITING_GRADE" | "GRADED" | "REQUEST_RESUBMIT";
  manualQuestions: {
    questionId: string;
    questionTitle: string;
    type: QuestionType;
    maxPoints: number;
    awardedPoints?: number;
    studentResponseText?: string;
    studentPhotoUrl?: string;
    rubric?: string;
    teacherComment?: string;
  }[];
  autoScore: number;
  totalScore?: number;
}

export const MOCK_WAITING_SUBMISSIONS: StudentSubmissionItem[] = [
  {
    id: "sub-01",
    assignmentTitle: "Bài tập củng cố: Bài 5 - 今天我休息",
    className: "HSK1-K24 Sơ cấp",
    studentName: "Nguyễn Văn An",
    studentAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    submittedAt: "21/10/2026 14:30",
    status: "WAITING_GRADE",
    autoScore: 40,
    manualQuestions: [
      {
        questionId: "mq-1",
        questionTitle: "Chép từ – Nộp ảnh: 4 từ mới Bài 5",
        type: "handwriting_photo",
        maxPoints: 10,
        studentPhotoUrl: "https://images.unsplash.com/photo-1584697964190-705b89369e96?w=800",
        rubric: "Đủ số lần viết (4đ), đúng quy tắc bút thuận (3đ), chữ ngay ngắn (3đ).",
      },
      {
        questionId: "mq-2",
        questionTitle: "Dịch câu: Xin phép nghỉ ốm",
        type: "translation",
        maxPoints: 10,
        studentResponseText: "王老师好，我今天有点不舒服，想请假一天。",
        rubric: "Đúng ngữ nghĩa (5đ), đúng cấu trúc (5đ).",
      },
    ],
  },
  {
    id: "sub-02",
    assignmentTitle: "Kiểm tra định kỳ Tuần 3: HSK 1 Cơ bản",
    className: "HSK1-K24 Sơ cấp",
    studentName: "Trần Thị Mai",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    submittedAt: "21/10/2026 15:10",
    status: "WAITING_GRADE",
    autoScore: 45,
    manualQuestions: [
      {
        questionId: "mq-3",
        questionTitle: "Tự luận: Giới thiệu ngày nghỉ của bạn",
        type: "essay",
        maxPoints: 15,
        studentResponseText: "今天星期日，我休息。早上八点起床，我和妈妈去超市买菜。下午在家看中文故事，听音乐。晚上我们吃饺子，我觉得很开心！",
        rubric: "Từ vựng phong phú (5đ), ngữ pháp chuẩn (5đ), bố cục rõ (5đ).",
      },
    ],
  },
];
