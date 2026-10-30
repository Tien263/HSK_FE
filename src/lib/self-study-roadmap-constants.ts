export interface RoadmapStage {
  step: number;
  title: string;
  duration: string;
  desc: string;
  badge: string;
}

export const DEFAULT_SELF_STUDY_ROADMAP_STAGES: RoadmapStage[] = [
  {
    step: 1,
    title: "Khởi động & Ngữ âm chuẩn Pinyin",
    duration: "Dự kiến 2 tuần",
    desc: "Làm chủ 21 thanh mẫu, 36 vận mẫu, 4 thanh điệu và quy tắc viết 150 chữ Hán đầu tiên.",
    badge: "🎯 Đạt chuẩn phát âm tự nhiên",
  },
  {
    step: 2,
    title: "Tích lũy 500+ Từ vựng & Ngữ pháp căn bản",
    duration: "Dự kiến 4 tuần",
    desc: "Nắm vững các mẫu câu giao tiếp cốt lõi, từ loại, cấu trúc câu vị ngữ động từ, lượng từ thông dụng.",
    badge: "🎯 Giao tiếp cơ bản đời sống",
  },
  {
    step: 3,
    title: "Rèn phản xạ Nghe - Đọc - Viết chuyên sâu",
    duration: "Dự kiến 5 tuần",
    desc: "Luyện nghe bắt từ khóa, đọc hiểu đoạn văn ngắn và rèn tư duy ngữ pháp HSK 3.0 tiêu chuẩn.",
    badge: "🎯 Tự tin với cấu trúc đề mới",
  },
  {
    step: 4,
    title: "Luyện đề thực chiến & Tối ưu điểm số",
    duration: "Dự kiến 3 tuần",
    desc: "Giải bộ đề thi thử độc quyền, phân tích bẫy đề thi, rà soát số câu sai và thi thử bấm giờ.",
    badge: "🎯 Sẵn sàng thi đạt điểm cao",
  },
];
