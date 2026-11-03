"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Smartphone,
  Monitor,
  Apple,
  Check,
  MousePointerClick,
  Download,
  Share,
  PlusSquare,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

type RoleType = "STUDENT" | "TEACHER" | "INSTALL_APP";
type PlatformType = "IOS" | "ANDROID" | "WINDOWS" | "MAC";

interface GuideStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  voiceText: string;
  tips: string[];
  mockup: {
    title: string;
    description: string;
    screenType: string;
    highlights: Array<{
      id: string;
      label: string;
      description: string;
      badge: string;
      color: "red" | "emerald" | "amber";
    }>;
  };
}

const STUDENT_STEPS: GuideStep[] = [
  {
    id: "s-step-1",
    stepNumber: 1,
    title: "Đăng nhập & Khảo sát xếp lớp (Onboarding)",
    subtitle: "Lựa chọn Tự học cá nhân hóa hoặc Nhập mã lớp giáo viên cấp",
    voiceText:
      "Bước một: Sau khi tạo tài khoản và đăng nhập, bạn sẽ đến trang Khảo sát xếp lớp. Tại đây bạn có hai lựa chọn. Lựa chọn A là Tự học chủ động theo lộ trình HSK cá nhân hóa. Lựa chọn B là Nhập mã lớp do cô giáo Ning Ning cấp. Nếu chưa biết trình độ, bạn làm bài kiểm tra nhanh 5 câu để hệ thống tự xếp vào cấp độ HSK 1 đến HSK 6 thích hợp.",
    tips: [
      "Nếu học lớp cô Ning Ning, hỏi cô mã lớp (Ví dụ: HANYU3A) rồi chọn Lựa chọn B.",
      "Nếu tự học, hãy chọn Lựa chọn A và làm bài test 5 câu để hệ thống xếp đúng cấp độ thực tế.",
      "Bạn luôn có thể tham gia lớp học bất kỳ lúc nào sau này trong trang tổng quan.",
    ],
    mockup: {
      title: "Màn hình Khởi đầu học tập (Onboarding)",
      description: "Giao diện lựa chọn hình thức học và làm bài test năng lực 5 câu",
      screenType: "onboarding",
      highlights: [
        {
          id: "h1",
          label: "Lựa chọn A: Tự học chủ động",
          description: "Mở tự do toàn bộ bài học, phòng thi và lộ trình cá nhân hóa.",
          badge: "❶ Bấm chọn",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Lựa chọn B: Nhập mã lớp giáo viên",
          description: "Nhập mã lớp để nhận bài tập, đề thi từ cô giáo.",
          badge: "❷ Nhập mã lớp",
          color: "red",
        },
        {
          id: "h3",
          label: "Khảo sát năng lực thực tế",
          description: "Làm 5 câu trắc nghiệm để hệ thống tự chấm điểm và xếp cấp HSK phù hợp.",
          badge: "❸ Bấm nộp bài",
          color: "amber",
        },
      ],
    },
  },
  {
    id: "s-step-2",
    stepNumber: 2,
    title: "Vào Lộ trình & Luyện phát âm AI qua Mic",
    subtitle: "Học từ vựng, ngữ pháp, xem nét viết chữ Hán và chấm điểm giọng nói AI",
    voiceText:
      "Bước hai: Vào kho bài học, bạn chọn cấp độ HSK muốn học. Mỗi bài học đều có danh sách từ vựng, ngữ pháp và mẫu câu. Đặc biệt, bạn bấm nút Loa để nghe phát thanh viên Bắc Kinh phát âm chuẩn, và bấm nút Mic để thu âm giọng nói của mình. Trí tuệ nhân tạo AI sẽ tự động so sánh phổ âm và chấm điểm phát âm từ 0 đến 100 điểm kèm nhận xét thanh điệu.",
    tips: [
      "Bấm nút [Loa] để nghe mẫu 2–3 lần trước khi thu âm.",
      "Bấm nút [Mic] màu đỏ để mở bảng Chấm điểm phát âm AI, đọc to rõ trong không gian yên tĩnh.",
      "Xem tab 'Thứ tự nét' để luyện viết chữ Hán đúng quy tắc thuận bút từ trên xuống dưới, từ trái sang phải.",
    ],
    mockup: {
      title: "Chi tiết bài học & Chấm điểm phát âm AI",
      description: "Giao diện học từ vựng chuẩn HSK 3.0 tích hợp loa và microphone AI",
      screenType: "lesson-study",
      highlights: [
        {
          id: "h1",
          label: "Nút Loa phát âm chuẩn",
          description: "Bấm để nghe giọng phát thanh viên chuẩn Bắc Kinh.",
          badge: "❶ Nghe mẫu",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Nút Mic AI Chấm điểm phát âm",
          description: "Bấm để mở modal thu âm đối chiếu thanh điệu và nhận điểm từ 0-100%.",
          badge: "❷ Bấm thu âm",
          color: "red",
        },
        {
          id: "h3",
          label: "Quy tắc thuận bút chữ Hán",
          description: "Mở bảng vẽ nét chữ sinh động để luyện viết tay từng nét.",
          badge: "❸ Luyện viết",
          color: "amber",
        },
      ],
    },
  },
  {
    id: "s-step-3",
    stepNumber: 3,
    title: "Làm bài tập cô giáo giao & Nộp bài",
    subtitle: "Xem hạn nộp, làm bài trắc nghiệm, điền từ, viết luận và nhận lời phê",
    voiceText:
      "Bước ba: Khi cô giáo giao bài tập về nhà, bạn sẽ thấy thông báo nổi bật trên trang chủ. Bấm vào bài tập để xem nội dung, thời hạn nộp bài. Bạn làm các câu hỏi trắc nghiệm, dịch câu, hoặc viết đoạn văn tiếng Trung. Sau khi hoàn thành, bấm nút Nộp bài để giáo viên nhận được bài và chấm điểm kèm lời nhận xét chi tiết.",
    tips: [
      "Theo dõi kỹ 'Hạn nộp bài' hiển thị bằng màu cam/đỏ trên thẻ bài tập.",
      "Các câu trắc nghiệm sẽ được máy chấm điểm tức thì sau khi nộp.",
      "Bài tự luận viết văn hoặc ghi âm giọng nói sẽ được cô Ning Ning trực tiếp phê duyệt và gửi nhận xét riêng.",
    ],
    mockup: {
      title: "Không gian Bài tập về nhà học sinh",
      description: "Danh sách bài tập cần hoàn thành, thẻ thông tin hạn nộp và nút làm bài",
      screenType: "assignments",
      highlights: [
        {
          id: "h1",
          label: "Thẻ bài tập chưa nộp",
          description: "Hiển thị tên bài, giáo viên giao và thời hạn còn lại.",
          badge: "❶ Chọn bài tập",
          color: "amber",
        },
        {
          id: "h2",
          label: "Nút Bắt đầu làm bài",
          description: "Mở giao diện làm bài tập tập trung không gây xao nhãng.",
          badge: "❷ Bấm làm bài",
          color: "emerald",
        },
        {
          id: "h3",
          label: "Nút Nộp bài & Xem kết quả",
          description: "Kiểm tra lại toàn bộ câu trả lời trước khi gửi bài cho cô giáo.",
          badge: "❸ Nộp bài",
          color: "red",
        },
      ],
    },
  },
  {
    id: "s-step-4",
    stepNumber: 4,
    title: "Phòng luyện tập đa năng & Đấu phản xạ",
    subtitle: "Thẻ ghi nhớ Flashcard, Ghép từ HSK, Luyện câu sai và Đóng vai cùng AI",
    voiceText:
      "Bước bốn: Vào mục Phòng luyện tập trên thanh điều hướng. Tại đây bạn có 5 khu vực rèn luyện: Luyện Flashcard từ vựng theo thuật toán lặp lại ngắt quãng, Game phản xạ ghép chữ Hán, Sổ tay từ vựng khó, Ôn lại những câu đã làm sai, và Hội thoại nhập vai tự do cùng AI theo tình huống đời sống.",
    tips: [
      "Dành 10 phút mỗi ngày trong mục 'Flashcard' để nhớ từ vựng sâu vào trí nhớ dài hạn.",
      "Bấm vào 'Câu làm sai' để làm lại các bẫy ngữ pháp bạn từng chọn nhầm.",
      "Mục 'Đóng vai AI' hỗ trợ cả gõ phím tiếng Trung và nói trực tiếp qua mic.",
    ],
    mockup: {
      title: "Phòng Luyện tập & Đấu phản xạ HSK",
      description: "Tổng hợp các chế độ luyện từ vựng, ngữ pháp và nhập vai tương tác",
      screenType: "practice-hub",
      highlights: [
        {
          id: "h1",
          label: "Luyện Flashcard thông minh",
          description: "Lật thẻ xem chữ Hán, Pinyin, giải nghĩa và âm thanh chuẩn.",
          badge: "❶ Lật thẻ từ",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Đấu phản xạ ghép từ HSK",
          description: "Trò chơi tính điểm tốc độ nối chữ Hán với nghĩa tiếng Việt.",
          badge: "❷ Chơi game",
          color: "amber",
        },
        {
          id: "h3",
          label: "Hội thoại nhập vai AI",
          description: "Luyện giao tiếp tự nhiên với gia sư ảo theo chủ đề mua sắm, du lịch.",
          badge: "❸ Trò chuyện AI",
          color: "red",
        },
      ],
    },
  },
  {
    id: "s-step-5",
    stepNumber: 5,
    title: "Thi thử HSK 3.0 bấm giờ thực chiến",
    subtitle: "Mô phỏng 100% kỳ thi chuẩn quốc tế từ HSK 1 đến HSK 6",
    voiceText:
      "Bước năm: Vào mục Phòng thi thử HSK. Bạn chọn cấp độ HSK mong muốn để làm bài thi chuẩn quốc tế. Hệ thống có đồng hồ đếm ngược từng phần Nghe, Đọc, Viết. Trong lúc làm bài, bạn có thể đánh dấu câu phân vân để xem lại. Sau khi nộp bài, hệ thống hiển thị bảng điểm chi tiết, đáp án giải thích từng câu và biểu đồ Radar đánh giá năng lực.",
    tips: [
      "Đeo tai nghe chất lượng tốt khi làm phần thi Nghe hiểu (Listening).",
      "Sử dụng nút 'Đánh dấu cờ' để ghi nhớ những câu chưa chắc chắn.",
      "Xem kỹ giải thích chi tiết câu sai sau khi có kết quả để rút kinh nghiệm.",
    ],
    mockup: {
      title: "Phòng thi thử HSK bấm giờ thực chiến",
      description: "Giao diện mô phỏng phòng thi thật với đồng hồ đếm ngược và bảng câu hỏi",
      screenType: "mock-exam",
      highlights: [
        {
          id: "h1",
          label: "Đồng hồ đếm ngược",
          description: "Kiểm soát thời gian làm bài chuẩn quy chế kỳ thi HSK.",
          badge: "❶ Canh giờ",
          color: "red",
        },
        {
          id: "h2",
          label: "Bảng câu hỏi chuyển nhanh",
          description: "Màu sắc thể hiện câu đã làm, câu chưa làm và câu đánh dấu xem lại.",
          badge: "❷ Điều hướng câu",
          color: "amber",
        },
        {
          id: "h3",
          label: "Nút Nộp bài thi",
          description: "Chấm điểm ngay lập tức và xem biểu đồ phân tích kỹ năng.",
          badge: "❸ Xem bảng điểm",
          color: "emerald",
        },
      ],
    },
  },
  {
    id: "s-step-6",
    stepNumber: 6,
    title: "Giữ lửa Streak & Cài đặt App PWA vào điện thoại (0đ)",
    subtitle: "Dùng XP bảo vệ chuỗi ngày học và cài ứng dụng về màn hình chính",
    voiceText:
      "Bước sáu: Để duy trì thói quen học mỗi ngày, hãy theo dõi ngọn lửa Streak ở góc phải trang chủ. Nếu hôm nào bận, bạn bấm vào thẻ Streak để kích hoạt Khiên bảo vệ chuỗi ngày bằng điểm kinh nghiệm XP. Đặc biệt, bạn có thể chuyển sang tab Cài đặt App ở menu trên để xem chi tiết cách cài ứng dụng Hanyu về cả iPhone, Android, máy tính Windows và máy Mac hoàn toàn miễn phí 0 đồng.",
    tips: [
      "Bấm vào tab 'Cài đặt App' ở trên cùng để xem chi tiết ảnh chụp hướng dẫn cho từng loại máy.",
      "Bật chuông thông báo 20:00 tối mỗi ngày trong mục Khiên Streak để không bị quên giờ học.",
      "Cài app sẽ giúp bạn học toàn màn hình không có thanh URL, mượt mà và tiết kiệm pin.",
    ],
    mockup: {
      title: "Khiên bảo vệ Streak & Cài đặt App điện thoại",
      description: "Bảo toàn chuỗi ngày học tập và trải nghiệm app toàn màn hình siêu mượt",
      screenType: "streak-pwa",
      highlights: [
        {
          id: "h1",
          label: "Thẻ Ngọn lửa Streak",
          description: "Bấm vào để mở bảng điều khiển Khiên bảo vệ chuỗi ngày.",
          badge: "❶ Bấm thẻ Streak",
          color: "amber",
        },
        {
          id: "h2",
          label: "Đóng băng chuỗi ngày bằng XP",
          description: "Bảo vệ ngọn lửa không bị mất khi bạn bận việc đột xuất.",
          badge: "❷ Kích hoạt khiên",
          color: "emerald",
        },
        {
          id: "h3",
          label: "Cài đặt App PWA (0đ)",
          description: "Đưa ứng dụng ra màn hình chính, xem chi tiết ở tab Cài đặt App.",
          badge: "❸ Xem cài App",
          color: "red",
        },
      ],
    },
  },
];

const TEACHER_STEPS: GuideStep[] = [
  {
    id: "t-step-1",
    stepNumber: 1,
    title: "Đăng nhập Bàn làm việc Giáo viên (/t/dashboard)",
    subtitle: "Tổng quan sĩ số lớp học, bài tập chờ chấm và thống kê tiến độ",
    voiceText:
      "Bước một dành cho giáo viên: Thầy cô đăng nhập tài khoản giáo viên và truy cập Bàn làm việc tại địa chỉ t xuyệt dashboard. Tại đây, thầy cô sẽ thấy tổng quan số lớp đang phụ trách, tổng số học sinh, danh sách bài tập học sinh mới nộp chờ chấm, và thống kê tiến độ hoàn thành bài giảng trong tuần.",
    tips: [
      "Đăng nhập bằng tài khoản giáo viên được cấp riêng để mở đầy đủ quyền hạn sư phạm.",
      "Xem nhanh mục 'Bài tập chờ duyệt' ở ngay trang chính để chấm bài kịp thời cho học sinh.",
    ],
    mockup: {
      title: "Bàn làm việc Sư phạm (Teacher Dashboard)",
      description: "Khu vực quản lý lớp học, học viên, kho giáo trình và tiến độ giảng dạy",
      screenType: "teacher-dashboard",
      highlights: [
        {
          id: "h1",
          label: "Thẻ thống kê tổng quan",
          description: "Xem số lớp, tổng số học sinh và số bài tập cần chấm trong ngày.",
          badge: "❶ Xem thống kê",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Menu điều hướng sư phạm",
          description: "Chuyển nhanh giữa Quản lý lớp, Soạn bài, Kho đề thi và Chấm bài.",
          badge: "❷ Menu chức năng",
          color: "amber",
        },
        {
          id: "h3",
          label: "Danh sách bài tập chờ chấm",
          description: "Bấm vào từng bài nộp của học sinh để chấm điểm và ghi lời phê.",
          badge: "❸ Bấm chấm bài",
          color: "red",
        },
      ],
    },
  },
  {
    id: "t-step-2",
    stepNumber: 2,
    title: "Tạo lớp học mới & Lấy Mã mời học sinh",
    subtitle: "Thiết lập thông tin lớp, cấp độ HSK và sao chép mã mời 1-click",
    voiceText:
      "Bước hai: Để tạo lớp học mới, thầy cô vào mục Quản lý lớp học và bấm nút Thêm lớp mới. Điền tên lớp, chọn cấp độ HSK từ 1 đến 6 và thêm mô tả khóa học. Sau khi bấm Tạo lớp, hệ thống sẽ tự động tạo một Mã lớp độc quyền như HANYU3A. Thầy cô chỉ cần bấm Sao chép mã lớp để gửi vào nhóm Zalo hoặc tin nhắn cho học sinh nhập khi đăng ký.",
    tips: [
      "Mã lớp là duy nhất và có thể gửi cho học sinh bất kỳ lúc nào.",
      "Thầy cô có thể khóa lớp khi đã đủ sĩ số để tránh người ngoài nhập mã.",
      "Có thể xem danh sách toàn bộ học viên đã tham gia lớp và mức điểm tích lũy của từng em.",
    ],
    mockup: {
      title: "Quản lý Lớp học & Tạo mã mời học viên",
      description: "Thao tác tạo lớp học mới và sao chép mã mời cho học viên",
      screenType: "class-management",
      highlights: [
        {
          id: "h1",
          label: "Nút Tạo lớp học mới",
          description: "Điền tên lớp, lịch học và trình độ HSK mục tiêu.",
          badge: "❶ Bấm tạo lớp",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Mã mời lớp học (Ví dụ: HANYU3A)",
          description: "Mã định danh lớp học để học sinh nhập vào khi đăng ký tài khoản.",
          badge: "❷ Sao chép mã",
          color: "red",
        },
        {
          id: "h3",
          label: "Danh sách học sinh trong lớp",
          description: "Quản lý sĩ số, ngày tham gia và trạng thái học tập của từng học viên.",
          badge: "❸ Xem học sinh",
          color: "amber",
        },
      ],
    },
  },
  {
    id: "t-step-3",
    stepNumber: 3,
    title: "Kho tài liệu bài giảng & Tải lên tệp học tập",
    subtitle: "Đăng tải sách giáo trình PDF, file âm thanh MP3, Slide bài giảng và bảng từ",
    voiceText:
      "Bước ba: Thầy cô vào mục Kho tài liệu bài giảng để đăng tải tài liệu ôn tập cho lớp. Hỗ trợ đầy đủ các định dạng: Sách giáo khoa PDF, file nén Audio phát âm MP3, Slide bài giảng PowerPoint, và bảng Excel từ vựng. Thầy cô có thể phân loại tài liệu theo từng cấp độ HSK để học sinh dễ dàng tải về học.",
    tips: [
      "Đặt tên file rõ ràng, kèm cấp độ HSK để học sinh tìm kiếm nhanh.",
      "Tài liệu tải lên sẽ được hiển thị ngay lập tức trong tài khoản của toàn bộ học sinh trong lớp.",
      "Có thể theo dõi số lượt học sinh đã tải và xem tài liệu.",
    ],
    mockup: {
      title: "Kho Tư liệu & Giáo trình bài giảng",
      description: "Khu vực quản lý và tải lên sách PDF, Audio phát âm và Slide trình chiếu",
      screenType: "materials-library",
      highlights: [
        {
          id: "h1",
          label: "Nút Đăng tải tài liệu mới",
          description: "Tải lên giáo trình chuẩn, bảng từ vựng hoặc slide bài giảng.",
          badge: "❶ Tải tài liệu",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Bộ lọc theo cấp độ HSK",
          description: "Lọc nhanh tài liệu HSK 1 đến HSK 6 cho từng lớp cụ thể.",
          badge: "❷ Lọc theo cấp độ",
          color: "amber",
        },
        {
          id: "h3",
          label: "Thao tác gán tài liệu vào lớp",
          description: "Chọn lớp học được phép xem và tải tài liệu này về máy.",
          badge: "❸ Gán vào lớp",
          color: "red",
        },
      ],
    },
  },
  {
    id: "t-step-4",
    stepNumber: 4,
    title: "Giao bài tập về nhà & Thiết lập thời hạn",
    subtitle: "Soạn bài trắc nghiệm, bài đọc hiểu, dịch câu và bài viết luận tự luận",
    voiceText:
      "Bước bốn: Để giao bài tập, thầy cô vào mục Bài tập lớp học, chọn lớp cần giao và bấm nút Tạo bài tập mới. Thầy cô nhập tiêu đề bài, chọn hạn nộp, và thêm các câu hỏi từ ngân hàng câu hỏi hoặc tự soạn. Khi bấm Giao bài, toàn bộ học sinh trong lớp sẽ nhận được thông báo ngay lập tức.",
    tips: [
      "Nên đặt hạn nộp cụ thể (ngày giờ) để tạo thói quen kỷ luật cho học viên.",
      "Có thể chọn kết hợp cả câu hỏi trắc nghiệm (máy tự chấm) và bài viết luận (giáo viên chấm).",
      "Sau khi giao, thầy cô có thể theo dõi danh sách ai đã nộp, ai chưa nộp theo thời gian thực.",
    ],
    mockup: {
      title: "Khu vực Giao bài tập về nhà",
      description: "Soạn đề bài tập, chọn lớp nhận và cài đặt hạn nộp bài",
      screenType: "assign-homework",
      highlights: [
        {
          id: "h1",
          label: "Nút Tạo bài tập mới",
          description: "Bắt đầu soạn phiếu bài tập củng cố kiến thức sau buổi học.",
          badge: "❶ Tạo bài tập",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Cài đặt Hạn chót nộp bài",
          description: "Thiết lập thời gian đóng cổng nộp bài tập về nhà.",
          badge: "❷ Đặt hạn nộp",
          color: "red",
        },
        {
          id: "h3",
          label: "Nút Phát hành bài tập",
          description: "Gửi bài tập đến toàn bộ học sinh trong lớp được chỉ định.",
          badge: "❸ Giao cho lớp",
          color: "amber",
        },
      ],
    },
  },
  {
    id: "t-step-5",
    stepNumber: 5,
    title: "Tạo và Phát hành Đề thi thử HSK",
    subtitle: "Soạn bộ đề chuẩn định dạng HSK 3.0 với phần Nghe, Đọc và Viết",
    voiceText:
      "Bước năm: Để tổ chức thi thử cho học sinh, thầy cô vào không gian Đề thi thử HSK. Thầy cô có thể tạo đề thi mới với cấu trúc chuẩn HSK: Phần nghe có file âm thanh và câu hỏi trắc nghiệm, phần đọc hiểu ngữ pháp, và phần viết sắp xếp câu hoặc viết đoạn văn. Thầy cô bấm nút Phát hành đề thi để học sinh có thể vào phòng thi thử làm bài bấm giờ.",
    tips: [
      "Có thể tải đề thi mẫu dạng JSON hoặc soạn trực tiếp trên giao diện trực quan.",
      "Đề thi sau khi phát hành có thể dùng chung cho nhiều lớp hoặc để ở chế độ tự do cho học viên tự học.",
      "Hệ thống sẽ lưu lại toàn bộ lịch sử điểm số và thời gian làm bài của từng thí sinh.",
    ],
    mockup: {
      title: "Không gian Soạn và Quản lý Đề thi HSK",
      description: "Quản lý đề thi thử, tải lên file audio đề nghe và gán đề cho các lớp",
      screenType: "teacher-exams",
      highlights: [
        {
          id: "h1",
          label: "Nút Tạo đề thi HSK mới",
          description: "Thiết lập số câu hỏi, thời gian làm bài và phân bổ kỹ năng.",
          badge: "❶ Tạo đề thi",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Gán Audio đề nghe (Listening)",
          description: "Đính kèm file nghe chuẩn giọng Bắc Kinh cho các câu nghe hiểu.",
          badge: "❷ Đính kèm Audio",
          color: "amber",
        },
        {
          id: "h3",
          label: "Nút Phát hành 1-click",
          description: "Mở đề thi cho học sinh làm bài thi thử chính thức.",
          badge: "❸ Phát hành đề",
          color: "red",
        },
      ],
    },
  },
  {
    id: "t-step-6",
    stepNumber: 6,
    title: "Chấm bài tự luận & Xem Radar năng lực học sinh",
    subtitle: "Chấm điểm bài viết luận, ghi nhận xét chi tiết và phân tích điểm mạnh yếu",
    voiceText:
      "Bước sáu: Khi học sinh nộp bài tập hoặc đề thi, thầy cô vào danh sách bài nộp để chấm điểm. Với bài viết luận, thầy cô có thể ghi chú lỗi ngữ pháp, dùng từ và chấm điểm trực tiếp. Sau đó, thầy cô mở Biểu đồ Radar năng lực để xem đánh giá 5 kỹ năng: Nghe, Nói, Đọc, Viết, và Từ vựng của học sinh để có phương pháp bồi dưỡng thích hợp.",
    tips: [
      "Lời nhận xét của cô giáo sẽ được gửi thông báo riêng đến tài khoản của học sinh.",
      "Biểu đồ Radar giúp thầy cô biết chính xác học sinh đang yếu kỹ năng nào (ví dụ: yếu phần Viết hoặc Nghe) để bổ sung bài tập trọng điểm.",
      "Có thể xuất danh sách điểm số cả lớp ra file để tiện theo dõi sổ điểm.",
    ],
    mockup: {
      title: "Chấm điểm bài nộp & Biểu đồ Radar Năng lực",
      description: "Giao diện chấm bài tự luận học viên và phân tích biểu đồ 5 kỹ năng HSK",
      screenType: "grading-radar",
      highlights: [
        {
          id: "h1",
          label: "Khung nhập Điểm số & Lời phê",
          description: "Ghi nhận xét chi tiết, khen ngợi và chỉnh sửa lỗi sai cho học viên.",
          badge: "❶ Chấm & Nhận xét",
          color: "emerald",
        },
        {
          id: "h2",
          label: "Biểu đồ Radar 5 Kỹ năng HSK",
          description: "Trực quan hóa độ thuần thục Nghe - Nói - Đọc - Viết - Ngữ pháp.",
          badge: "❷ Xem Radar",
          color: "red",
        },
        {
          id: "h3",
          label: "Nút Lưu & Gửi kết quả",
          description: "Gửi thông báo điểm và nhận xét ngay đến hòm thư học sinh.",
          badge: "❸ Gửi kết quả",
          color: "amber",
        },
      ],
    },
  },
];

export default function GuidePage() {
  const [role, setRole] = useState<RoleType>("STUDENT");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformType>("IOS");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);

  const steps = role === "STUDENT" ? STUDENT_STEPS : TEACHER_STEPS;
  const currentStep = steps[activeStepIndex] || steps[0];

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesisAvailable(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech when changing steps or role
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeStepIndex, role, activePlatform]);

  const toggleVoiceOver = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getPlatformVoiceText = (platform: PlatformType): string => {
    switch (platform) {
      case "IOS":
        return "Hướng dẫn cài đặt Hanyu trên điện thoại iPhone và iPad. Bước một: Mở trình duyệt Safari và truy cập vào trang ninjistudy.click. Lưu ý bạn phải dùng Safari vì Apple chỉ cho phép cài đặt PWA qua Safari. Bước hai: Nhìn xuống thanh công cụ dưới đáy màn hình, bấm vào biểu tượng Chia sẻ có hình ô vuông với mũi tên chỉ lên. Bước ba: Cuộn danh sách xuống và chọn dòng 'Thêm vào Màn hình chính'. Bước bốn: Bấm nút 'Thêm' ở góc trên bên phải. Ứng dụng Hanyu sẽ xuất hiện ngay trên màn hình chính, mở ra chạy toàn màn hình siêu mượt.";
      case "ANDROID":
        return "Hướng dẫn cài đặt Hanyu trên điện thoại Android như Samsung, Xiaomi hay Oppo. Khi mở trang web trên trình duyệt Google Chrome, bạn sẽ thấy thanh thông báo 'Cài đặt ứng dụng Hanyu' ở phía dưới màn hình, bạn bấm nút 'Cài đặt ngay'. Nếu không thấy thanh này, bạn bấm vào biểu tượng dấu ba chấm ở góc trên bên phải trình duyệt, chọn dòng 'Cài đặt ứng dụng' hoặc 'Thêm vào Màn hình chính', sau đó bấm xác nhận 'Cài đặt'. Ứng dụng sẽ được tải về màn hình chính chỉ trong 2 giây.";
      case "WINDOWS":
        return "Hướng dẫn cài đặt Hanyu trên máy tính Windows bằng Google Chrome hoặc Microsoft Edge. Nhìn lên thanh địa chỉ trang web ở góc trên cùng bên phải, bạn sẽ thấy biểu tượng chiếc màn hình máy tính có mũi tên xuống mang tên 'Cài đặt Hanyu', bạn bấm vào đó rồi chọn 'Cài đặt'. Sau khi cài đặt, Hanyu sẽ xuất hiện ngoài màn hình Desktop và thanh Taskbar, mở ra chạy độc lập như phần mềm Word hay Zalo mà không bị vướng thanh địa chỉ web.";
      case "MAC":
        return "Hướng dẫn cài đặt Hanyu trên máy tính Mac và MacBook. Nếu bạn dùng Safari trên macOS Sonoma: Bấm vào menu Tệp ở thanh menu trên cùng của màn hình Mac, sau đó chọn dòng 'Thêm vào Dock'. Biểu tượng Hanyu sẽ nằm ngay trên thanh Dock của bạn, mở ra chạy trong cửa sổ riêng biệt. Nếu bạn dùng Google Chrome trên Mac: Bấm vào biểu tượng Cài đặt trên thanh địa chỉ và chọn 'Cài đặt Hanyu'.";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6] relative overflow-x-hidden">
      {/* Background ink wash artwork overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15">
        <Image
          src="/theme/bg-auth-master.jpg"
          alt="Shanshui background"
          fill
          className="object-cover object-top filter grayscale contrast-125"
        />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-[#BC9B6B]/25 bg-[#FFFCF6]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#BC9B6B]/40 bg-[#F8F5ED] hover:bg-[#FFFCF6] text-xs font-semibold text-[#204434] transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#315E48]" />
              <span>Trang chủ</span>
            </Link>

            <div className="h-4 w-px bg-[#BC9B6B]/30 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="font-serif font-bold text-base sm:text-lg text-[#204434] tracking-tight">
                Cẩm nang Hướng dẫn Hanyu
              </span>
            </div>
          </div>

          {/* Role & App Switcher Tabs */}
          <div className="flex items-center p-1 rounded-full bg-[#204434]/10 border border-[#BC9B6B]/30">
            <button
              type="button"
              onClick={() => {
                setRole("STUDENT");
                setActiveStepIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === "STUDENT"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("TEACHER");
                setActiveStepIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === "TEACHER"
                  ? "bg-[#9D493E] text-[#FFFCF6] shadow-md"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("INSTALL_APP");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === "INSTALL_APP"
                  ? "bg-amber-700 text-white shadow-md animate-pulse"
                  : "text-amber-900 font-bold hover:text-amber-700"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>📲 Cài đặt App (0đ)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* ===================== VIEW 1 & 2: STUDENT & TEACHER ROLES ===================== */}
        {role !== "INSTALL_APP" && (
          <>
            {/* Hero Banner Section */}
            <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-[#FFFCF6]/90 border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-[#BC9B6B]/10 blur-2xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#204434]/10 text-xs font-bold text-[#204434] mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    <span>
                      {role === "STUDENT"
                        ? "Lộ trình 6 bước làm chủ nền tảng cho Học viên"
                        : "Cẩm nang 6 bước Sư phạm & Giảng dạy cho Cô giáo"}
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#204434] tracking-tight leading-snug">
                    {role === "STUDENT"
                      ? "Hướng dẫn sử dụng dành cho Học sinh"
                      : "Cẩm nang Sư phạm dành cho Cô Ning Ning"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#315E48] mt-2 max-w-2xl leading-relaxed">
                    Minh họa trực quan từng nút bấm với ô khoanh vùng chức năng, kèm tính năng giọng đọc thuyết minh chỉ dẫn để bạn bắt đầu dễ dàng nhất.
                  </p>
                </div>

                {/* Quick seal badge & Install App CTA shortcut */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("INSTALL_APP")}
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-700" />
                    <span>Cách cài App Điện thoại & PC →</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
                      宁
                    </div>
                    <div className="text-left text-xs">
                      <div className="font-bold text-[#204434]">Lớp tiếng Trung Hanyu</div>
                      <div className="text-[#315E48] text-[11px]">Thẩm mỹ Thủy Mặc · HSK 3.0</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Horizontal Navigation Bar */}
              <div className="mt-6 pt-5 border-t border-[#BC9B6B]/25 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {steps.map((st, idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                        isActive
                          ? role === "STUDENT"
                            ? "bg-[#204434] text-[#FFFCF6] border-[#204434] shadow-md scale-[1.02]"
                            : "bg-[#9D493E] text-[#FFFCF6] border-[#9D493E] shadow-md scale-[1.02]"
                          : "bg-[#F8F5ED]/70 hover:bg-[#F8F5ED] border-[#BC9B6B]/30 text-[#204434]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                        <span>Bước {st.stepNumber}</span>
                        {isActive && <Check className="w-3 h-3" />}
                      </div>
                      <div className="text-xs font-bold truncate leading-tight">
                        {st.title.split("&")[0].trim()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Step Detailed Content & Annotated Mockup Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Step Guide, Voiceover & Instruction Details */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-[#FFFCF6]/95 border border-[#BC9B6B]/35 shadow-lg shadow-[#204434]/5 space-y-4">
                  {/* Step Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs ${
                        role === "STUDENT" ? "bg-[#204434]" : "bg-[#9D493E]"
                      }`}
                    >
                      BƯỚC {currentStep.stepNumber} / 6
                    </span>

                    {/* Voiceover Speaker Button */}
                    {speechSynthesisAvailable && (
                      <button
                        type="button"
                        onClick={() => toggleVoiceOver(currentStep.voiceText)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition shadow-xs cursor-pointer ${
                          isSpeaking
                            ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                            : "bg-[#F8F5ED] hover:bg-[#204434]/10 text-[#204434] border-[#BC9B6B]/40"
                        }`}
                        title="Bấm để nghe đọc hướng dẫn bằng giọng nói"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#9D493E]" />
                            <span>Nghe thuyết minh</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#204434] leading-snug">
                      {currentStep.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#315E48] mt-1 font-medium">
                      {currentStep.subtitle}
                    </p>
                  </div>

                  {/* Spoken Narration Transcript Box */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F5ED]/90 border border-[#BC9B6B]/25 text-xs text-[#204434] leading-relaxed relative">
                    <div className="font-bold text-[11px] text-[#315E48] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-[#9D493E]" />
                      <span>Lời thoại hướng dẫn:</span>
                    </div>
                    <p className="italic">“{currentStep.voiceText}”</p>
                  </div>

                  {/* Action Callout Highlights Checklist */}
                  <div className="space-y-2 pt-2 border-t border-[#BC9B6B]/20">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#204434] flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>Các điểm cần thao tác trên màn hình:</span>
                    </div>
                    {currentStep.mockup.highlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-3 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/25 flex items-start gap-2.5"
                      >
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white shrink-0 mt-0.5 shadow-xs ${
                            hl.color === "red"
                              ? "bg-[#9D493E]"
                              : hl.color === "emerald"
                              ? "bg-[#204434]"
                              : "bg-[#BC9B6B]"
                          }`}
                        >
                          {hl.badge}
                        </span>
                        <div className="text-xs">
                          <div className="font-bold text-[#204434]">{hl.label}</div>
                          <div className="text-[#315E48] text-[11px] mt-0.5 leading-relaxed">
                            {hl.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Useful Tips */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-600/25 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Mẹo hữu ích cần lưu ý:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
                      {currentStep.tips.map((tip, i) => (
                        <li key={i} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prev / Next Step Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#BC9B6B]/20">
                    <button
                      type="button"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      className="px-3.5 py-1.5 rounded-xl border border-[#BC9B6B]/35 bg-[#F8F5ED] hover:bg-[#FFFCF6] text-xs font-semibold text-[#204434] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Bước trước
                    </button>

                    <span className="text-xs font-semibold text-[#315E48]">
                      {activeStepIndex + 1} / {steps.length}
                    </span>

                    <button
                      type="button"
                      disabled={activeStepIndex === steps.length - 1}
                      onClick={() =>
                        setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))
                      }
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                        role === "STUDENT"
                          ? "bg-[#204434] hover:bg-[#183629]"
                          : "bg-[#9D493E] hover:bg-[#83382F]"
                      }`}
                    >
                      Bước tiếp theo →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Annotated Visual Mockup (Screenshots with Callouts) */}
              <div className="lg:col-span-7">
                <div className="p-5 sm:p-7 rounded-3xl bg-[#FFFCF6]/95 border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/10">
                  
                  {/* Mockup Header Bar */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#BC9B6B]/25 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-[#204434] ml-2">
                        {currentStep.mockup.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#315E48] font-medium hidden sm:inline">
                      Ảnh chụp mô phỏng thực tế
                    </span>
                  </div>

                  {/* Render Customized Visual Mockup Canvas based on Step */}
                  <div className="rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 p-4 sm:p-6 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                    
                    {/* Visual Backdrop Watermark */}
                    <div className="absolute right-4 bottom-4 text-7xl font-serif text-[#204434]/5 pointer-events-none select-none">
                      宁
                    </div>

                    {/* Dynamic Screen Mockup Content */}
                    {currentStep.mockup.screenType === "onboarding" && (
                      <div className="space-y-4">
                        <div className="text-center max-w-md mx-auto">
                          <div className="text-[10px] font-bold text-[#315E48] uppercase tracking-widest">Màn hình khởi đầu</div>
                          <h3 className="font-serif text-lg font-bold text-[#204434]">Bạn muốn bắt đầu như thế nào?</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Box A - Highlighted */}
                          <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 shadow-md relative group">
                            <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-[#204434] text-white text-[10px] font-bold shadow-md animate-bounce">
                              ❶ Bấm chọn Tự học
                            </div>
                            <div className="font-bold text-xs text-[#204434] flex items-center gap-1.5 mb-1.5">
                              <span>🧭</span>
                              <span>Lựa chọn A - Tự học</span>
                            </div>
                            <p className="text-[11px] text-[#315E48] leading-relaxed mb-3">
                              Học theo lộ trình riêng, tự động đề xuất bài học HSK thích hợp.
                            </p>
                            <div className="w-full py-1.5 rounded-lg bg-[#204434] text-white text-center text-xs font-bold">
                              Bắt đầu tự học →
                            </div>
                          </div>

                          {/* Box B - Highlighted */}
                          <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-dashed border-red-500 shadow-md relative">
                            <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-[#9D493E] text-white text-[10px] font-bold shadow-md">
                              ❷ Nhập mã lớp
                            </div>
                            <div className="font-bold text-xs text-[#204434] flex items-center gap-1.5 mb-1.5">
                              <span>🎓</span>
                              <span>Lựa chọn B - Có giáo viên</span>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-xs font-mono font-bold text-amber-900 text-center mb-2">
                              MÃ LỚP: HANYU3A
                            </div>
                            <div className="w-full py-1.5 rounded-lg bg-[#9D493E] text-white text-center text-xs font-bold">
                              Xác nhận vào lớp →
                            </div>
                          </div>
                        </div>

                        {/* Test 5 questions highlight */}
                        <div className="p-3.5 rounded-xl bg-[#FFFCF6] border-2 border-amber-500 relative mt-2">
                          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#BC9B6B] text-white text-[10px] font-bold shadow-xs">
                            ❸ Khảo sát năng lực 5 câu
                          </div>
                          <div className="text-xs font-bold text-[#204434] mb-1">
                            Câu 1/5: 借问，这本词典是______的？
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#315E48]">
                            <div className="p-1.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                              ✓ 谁 (Ai)
                            </div>
                            <div className="p-1.5 rounded bg-[#F8F5ED]">哪 (Nào)</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "lesson-study" && (
                      <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-[#FFFCF6] border border-[#BC9B6B]/30 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-[#204434]">Bài 1: Xin chào & Chào hỏi cơ bản</div>
                            <div className="text-[11px] text-[#315E48]">HSK 1 · 15 từ vựng · 3 cấu trúc ngữ pháp</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Chuẩn HSK 3.0
                          </span>
                        </div>

                        {/* Word row with highlighted Loa and Mic */}
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 shadow-md relative space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-serif font-bold text-[#204434]">你好</div>
                              <div className="text-xs text-[#315E48] font-mono">nǐ hǎo · Xin chào</div>
                            </div>

                            {/* Highlighted Loa and Mic Buttons */}
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-[#204434] text-white flex items-center justify-center shadow-md">
                                  <Volume2 className="w-4 h-4" />
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-[#204434] text-[9px] font-bold text-white shadow-xs">
                                  ❶ Nghe chuẩn
                                </span>
                              </div>

                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md animate-pulse">
                                  <span className="text-xs font-bold">Mic</span>
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-bold text-white shadow-xs">
                                  ❷ Thu âm AI
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* AI Voice scoring popup simulation */}
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between mt-5">
                            <div className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>AI Đánh giá: 96/100 (Thanh 3 chuẩn xác)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                              +15 XP
                            </span>
                          </div>
                        </div>

                        {/* Stroke order highlight */}
                        <div className="p-3 rounded-xl bg-[#FFFCF6] border-2 border-dashed border-amber-500 relative">
                          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#BC9B6B] text-white text-[10px] font-bold shadow-xs">
                            ❸ Thuận bút chữ Hán
                          </div>
                          <div className="text-xs font-bold text-[#204434]">Nét vẽ: 亻 ➔ 尔 (Tổng cộng 7 nét)</div>
                          <div className="text-[11px] text-[#315E48]">Quy tắc: Phẩy trước, sổ sau, từ trái qua phải.</div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "assignments" && (
                      <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-amber-500 shadow-md relative">
                          <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-[#BC9B6B] text-white text-[10px] font-bold shadow-xs">
                            ❶ Thẻ bài tập cần làm
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                Hạn nộp: 23:59 Chủ nhật này
                              </span>
                              <h4 className="font-bold text-xs text-[#204434] mt-1.5">
                                Bài tập 03: Phân biệt lượng từ 个, 支, 本 & Đặt 5 câu
                              </h4>
                              <div className="text-[11px] text-[#315E48]">Giáo viên: Cô Ning Ning · Lớp HSK1 Cơ bản</div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-[#BC9B6B]/20 flex items-center justify-between">
                            <span className="text-[11px] text-red-600 font-semibold">Chưa nộp (Còn 2 ngày)</span>
                            <div className="px-4 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-xs flex items-center gap-1">
                              <span>Bắt đầu làm</span>
                              <span>→</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#FFFCF6] border-2 border-red-500 relative">
                          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs">
                            ❸ Bấm Nộp bài cho cô giáo
                          </div>
                          <div className="text-xs font-bold text-[#204434]">Đã hoàn thành 8/8 câu</div>
                          <div className="text-[11px] text-[#315E48] mt-0.5">
                            Kiểm tra kỹ trước khi bấm nộp bài để giáo viên nhận và chấm điểm.
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "practice-hub" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 shadow-sm relative">
                          <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded bg-[#204434] text-[9px] font-bold text-white">
                            ❶ Flashcard
                          </span>
                          <div className="text-xl mb-1">🗂️</div>
                          <div className="font-bold text-xs text-[#204434]">Flashcard HSK</div>
                          <p className="text-[10px] text-[#315E48] mt-1">Lật thẻ từ vựng ghi nhớ sâu.</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-amber-500 shadow-sm relative">
                          <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded bg-[#BC9B6B] text-[9px] font-bold text-white">
                            ❷ Đấu phản xạ
                          </span>
                          <div className="text-xl mb-1">⚡</div>
                          <div className="font-bold text-xs text-[#204434]">Game Ghép từ</div>
                          <p className="text-[10px] text-[#315E48] mt-1">Đấu tốc độ phản xạ HSK 3.0.</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-red-500 shadow-sm relative">
                          <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded bg-[#9D493E] text-[9px] font-bold text-white">
                            ❸ Đóng vai AI
                          </span>
                          <div className="text-xl mb-1">🤖</div>
                          <div className="font-bold text-xs text-[#204434]">Hội thoại AI</div>
                          <p className="text-[10px] text-[#315E48] mt-1">Giao tiếp phản xạ tự nhiên.</p>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "mock-exam" && (
                      <div className="space-y-3.5">
                        <div className="p-3 rounded-xl bg-[#204434] text-white flex items-center justify-between shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm">HSK 2 ĐỀ THỰC CHIẾN SỐ 01</span>
                          </div>
                          <div className="px-2.5 py-1 rounded bg-red-600 text-white font-mono font-bold text-xs">
                            ⏱️ Còn lại: 34:20
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-amber-500 space-y-2">
                          <div className="text-xs font-bold text-[#204434]">
                            Phần 1: Nghe hiểu · Câu 5/35 (Đã đánh dấu cờ xem lại)
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#F8F5ED] text-xs text-[#315E48]">
                            🔊 [Audio mẫu phát thanh viên]: 他昨天买了一件红色的毛衣。
                          </div>
                          <div className="flex items-center gap-2 text-xs pt-1">
                            <button className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-400">
                              ✓ Đúng (对)
                            </button>
                            <button className="px-3 py-1 rounded-lg bg-[#F8F5ED] text-[#315E48]">
                              ✗ Sai (错)
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-600 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900">Bấm nộp bài để xem biểu đồ Radar</span>
                          <div className="px-3 py-1 rounded bg-emerald-700 text-white font-bold text-xs">
                            Nộp bài thi →
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "streak-pwa" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-amber-500 shadow-md flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
                              🔥
                            </div>
                            <div>
                              <div className="font-serif font-bold text-sm text-[#204434]">Chuỗi ngày học: 12 Ngày</div>
                              <div className="text-[11px] text-[#315E48]">Bảo toàn ngọn lửa để nhận thưởng huy hiệu</div>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-xs">
                            🛡️ Dùng Khiên Streak
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-red-500 shadow-md flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-red-900 mb-1">
                              <Smartphone className="w-4 h-4 text-red-700" />
                              <span>Cài đặt ứng dụng vào điện thoại & máy tính (0đ)</span>
                            </div>
                            <p className="text-[11px] text-[#315E48] leading-relaxed">
                              Đầy đủ hướng dẫn cho iPhone (iOS), Android, máy tính Windows và máy Mac.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRole("INSTALL_APP")}
                            className="px-3.5 py-1.5 rounded-xl bg-[#9D493E] text-white text-xs font-bold shadow-xs shrink-0"
                          >
                            Xem cài App →
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "teacher-dashboard" && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 rounded-xl bg-[#FFFCF6] border border-[#BC9B6B]/30 text-center">
                            <div className="text-base font-bold text-[#204434]">3</div>
                            <div className="text-[10px] text-[#315E48]">Lớp phụ trách</div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FFFCF6] border border-[#BC9B6B]/30 text-center">
                            <div className="text-base font-bold text-[#204434]">48</div>
                            <div className="text-[10px] text-[#315E48]">Học sinh</div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FFFCF6] border-2 border-red-500 text-center">
                            <div className="text-base font-bold text-red-600">5</div>
                            <div className="text-[10px] font-bold text-red-900">Bài chờ chấm</div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600">
                          <div className="text-xs font-bold text-[#204434] mb-1">Menu nghiệp vụ sư phạm</div>
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            <span className="px-2.5 py-1 rounded bg-[#204434] text-white font-semibold">Quản lý lớp</span>
                            <span className="px-2.5 py-1 rounded bg-[#F8F5ED] text-[#204434]">Soạn bài giảng</span>
                            <span className="px-2.5 py-1 rounded bg-[#F8F5ED] text-[#204434]">Kho tài liệu</span>
                            <span className="px-2.5 py-1 rounded bg-[#9D493E] text-white font-semibold">Đề thi HSK</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "class-management" && (
                      <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-red-500 shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-xs text-[#204434]">Lớp HSK 1 Cơ Bản - Khóa K12</div>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                              Đang hoạt động
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-amber-800 font-semibold">MÃ MỜI LỚP HỌC:</div>
                              <div className="font-mono text-base font-bold text-amber-950">HANYU3A</div>
                            </div>
                            <button className="px-3 py-1 rounded-lg bg-[#9D493E] text-white text-xs font-bold shadow-xs">
                              Sao chép mã 📋
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "materials-library" && (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">📚</span>
                            <div>
                              <div className="text-xs font-bold text-[#204434]">Giáo trình Chuẩn HSK 1 (Full PDF)</div>
                              <div className="text-[10px] text-[#315E48]">Dung lượng: 24.5 MB · 42 lượt tải</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded bg-[#204434] text-white text-[10px] font-bold">Đã gán lớp</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🎧</span>
                            <div>
                              <div className="text-xs font-bold text-[#204434]">Trọn bộ Audio luyện nghe HSK 1</div>
                              <div className="text-[10px] text-[#315E48]">Dung lượng: 65.4 MB · 114 lượt tải</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded bg-[#204434] text-white text-[10px] font-bold">Đã gán lớp</span>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "assign-homework" && (
                      <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 shadow-md space-y-2">
                          <div className="text-xs font-bold text-[#204434]">Soạn phiếu bài tập mới</div>
                          <input
                            readOnly
                            value="Bài tập tuần 2: Luyện mẫu câu 是...的 và 10 câu đọc hiểu"
                            className="w-full text-xs p-2 rounded-lg bg-[#F8F5ED] border border-[#BC9B6B]/30 font-medium"
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-amber-50 border border-amber-300 font-bold text-amber-900">
                              Hạn chót: 23:59 Chủ Nhật
                            </div>
                            <div className="p-2 rounded bg-emerald-50 border border-emerald-300 font-bold text-emerald-900">
                              Giao cho: Lớp HSK 1 K12
                            </div>
                          </div>
                          <button className="w-full py-2 rounded-xl bg-[#204434] text-white font-bold text-xs shadow-xs">
                            Phát hành bài tập ngay 🚀
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "teacher-exams" && (
                      <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-red-500 shadow-md space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-xs text-[#204434]">Đề thi thử HSK 1 Chuẩn 3.0 (Đề số 01)</div>
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 text-[10px] font-bold">
                              Đã phát hành
                            </span>
                          </div>
                          <div className="text-[11px] text-[#315E48]">
                            40 câu hỏi · Nghe hiểu: 20 câu (Kèm file MP3) · Đọc hiểu: 20 câu · Thời gian: 35 phút
                          </div>
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-xs text-[#204434] font-semibold">Đã có 18 học sinh nộp bài</span>
                            <div className="px-3 py-1 rounded-lg bg-[#9D493E] text-white text-xs font-bold shadow-xs">
                              Xem bảng điểm →
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.mockup.screenType === "grading-radar" && (
                      <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#FFFCF6] border-2 border-emerald-600 shadow-md space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#204434]">Bài làm của: Nguyễn Thị Thảo (Lớp HSK1)</span>
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Điểm: 9.5 / 10
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#F8F5ED] text-xs text-[#315E48] italic">
                            Lời phê của cô Ning Ning: "Em dùng từ rất tự nhiên, chữ viết sạch sẽ, chú ý thanh 3 ở câu số 4 nhé! 加油!"
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border-2 border-red-500 flex items-center justify-between">
                          <div className="text-xs">
                            <div className="font-bold text-[#204434]">Biểu đồ Radar Năng lực HSK</div>
                            <div className="text-[11px] text-[#315E48]">Nghe (92%) · Nói (85%) · Đọc (95%) · Viết (88%)</div>
                          </div>
                          <span className="px-3 py-1 rounded-lg bg-[#9D493E] text-white text-xs font-bold shadow-xs">
                            Đạt chuẩn HSK 1 ✓
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer caption */}
                    <div className="mt-4 pt-3 border-t border-[#BC9B6B]/25 flex items-center justify-between text-[11px] text-[#315E48]">
                      <span>✨ Các ô khoanh viền nổi bật chỉ dẫn đúng thao tác thực tế</span>
                      <span className="font-serif">博学笃行 · 沉潜致远</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================== VIEW 3: DEDICATED APP INSTALLATION SUITE ===================== */}
        {role === "INSTALL_APP" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header of App Install Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF6]/95 border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-bold text-amber-900 mb-2">
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                    <span>Công nghệ Progressive Web App (PWA) 0 Đồng</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#204434] tracking-tight">
                    Hướng dẫn Cài đặt App Hanyu về Điện thoại & Máy tính
                  </h1>
                  <p className="text-xs sm:text-sm text-[#315E48] mt-1.5 max-w-2xl leading-relaxed">
                    Không cần tải nặng máy từ App Store hay CH Play. Chỉ 1 thao tác nhỏ, bạn sẽ có ngay icon Hanyu ngoài màn hình, mở ra chạy toàn màn hình, học mượt mà và không tốn bộ nhớ.
                  </p>
                </div>

                {/* Voiceover Speaker Button for Current Platform */}
                {speechSynthesisAvailable && (
                  <button
                    type="button"
                    onClick={() => toggleVoiceOver(getPlatformVoiceText(activePlatform))}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition shadow-sm cursor-pointer shrink-0 ${
                      isSpeaking
                        ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                        : "bg-[#204434] hover:bg-[#183629] text-white border-[#204434]"
                    }`}
                    title="Bấm để nghe đọc hướng dẫn cài đặt"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Dừng đọc</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-300" />
                        <span>Nghe thuyết minh cài đặt</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 4 Platforms Switcher Tabs */}
              <div className="mt-6 pt-5 border-t border-[#BC9B6B]/25 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActivePlatform("IOS")}
                  className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                    activePlatform === "IOS"
                      ? "bg-[#204434] text-white border-[#204434] shadow-md scale-[1.02]"
                      : "bg-[#F8F5ED] hover:bg-white text-[#204434] border-[#BC9B6B]/30"
                  }`}
                >
                  <Apple className="w-4 h-4" />
                  <span>iPhone & iPad (iOS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlatform("ANDROID")}
                  className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                    activePlatform === "ANDROID"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-md scale-[1.02]"
                      : "bg-[#F8F5ED] hover:bg-white text-[#204434] border-[#BC9B6B]/30"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Android (Samsung/Oppo...)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlatform("WINDOWS")}
                  className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                    activePlatform === "WINDOWS"
                      ? "bg-blue-800 text-white border-blue-800 shadow-md scale-[1.02]"
                      : "bg-[#F8F5ED] hover:bg-white text-[#204434] border-[#BC9B6B]/30"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Máy tính Windows (PC/Laptop)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlatform("MAC")}
                  className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                    activePlatform === "MAC"
                      ? "bg-[#9D493E] text-white border-[#9D493E] shadow-md scale-[1.02]"
                      : "bg-[#F8F5ED] hover:bg-white text-[#204434] border-[#BC9B6B]/30"
                  }`}
                >
                  <Apple className="w-4 h-4" />
                  <span>Máy tính Mac (MacBook)</span>
                </button>
              </div>
            </div>

            {/* Platform Detail & Visual Callout Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Instructions for Selected Platform */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-[#FFFCF6]/95 border border-[#BC9B6B]/35 shadow-lg shadow-[#204434]/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 font-bold text-xs">
                      {activePlatform === "IOS" && "📱 Dành cho iPhone & iPad"}
                      {activePlatform === "ANDROID" && "🤖 Dành cho Điện thoại Android"}
                      {activePlatform === "WINDOWS" && "💻 Dành cho Máy tính Windows"}
                      {activePlatform === "MAC" && "🍏 Dành cho Máy Mac & MacBook"}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">Miễn phí 100% · Cực nhẹ</span>
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#204434]">
                    {activePlatform === "IOS" && "Cài đặt trên iPhone / iPad qua Safari"}
                    {activePlatform === "ANDROID" && "Cài đặt trên Android qua Google Chrome"}
                    {activePlatform === "WINDOWS" && "Cài đặt trên Windows (Chrome / Edge)"}
                    {activePlatform === "MAC" && "Cài đặt trên Mac (Safari / Chrome)"}
                  </h2>

                  {/* Step by Step Breakdown */}
                  <div className="space-y-3 pt-2">
                    {activePlatform === "IOS" && (
                      <>
                        <div className="p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            1
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Mở trình duyệt Safari:</strong>
                            Truy cập vào <code>https://ninjistudy.click</code> (Lưu ý: Phải dùng Safari, không dùng Chrome trên iOS).
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-red-500 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            2
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Bấm nút Chia sẻ [↑]:</strong>
                            Ở thanh menu dưới đáy màn hình Safari, bấm vào biểu tượng ô vuông có mũi tên trỏ lên <strong>[↑]</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-emerald-600 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#204434] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            3
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Chọn "Thêm vào MH chính":</strong>
                            Cuộn danh sách xuống và bấm chọn dòng <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-amber-500 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            4
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Xác nhận "Thêm" (Add):</strong>
                            Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình. Biểu tượng Hanyu sẽ xuất hiện ngay ngoài màn hình chính!
                          </div>
                        </div>
                      </>
                    )}

                    {activePlatform === "ANDROID" && (
                      <>
                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-emerald-600 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            1
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Cách nhanh nhất (Banner tự động):</strong>
                            Khi mở web trên Chrome, nhìn dưới đáy màn hình sẽ có thanh thông báo màu xanh <strong>"Cài đặt ứng dụng Hanyu"</strong>. Bấm nút <strong>"Cài đặt ngay"</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-red-500 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            2
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Cách 2 (Bằng menu 3 chấm ⋮):</strong>
                            Bấm vào biểu tượng <strong>dấu 3 chấm ⋮</strong> ở góc phải trên cùng trình duyệt Chrome.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#204434] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            3
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Chọn Cài đặt ứng dụng:</strong>
                            Chọn dòng <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong> rồi bấm <strong>Cài đặt</strong>.
                          </div>
                        </div>
                      </>
                    )}

                    {activePlatform === "WINDOWS" && (
                      <>
                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-red-500 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            1
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Nhìn lên thanh địa chỉ (URL Bar):</strong>
                            Ở góc phải thanh địa chỉ (cạnh biểu tượng ngôi sao yêu thích), bạn sẽ thấy biểu tượng <strong>chiếc máy tính có mũi tên xuống [⤓]</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-emerald-600 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#204434] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            2
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Bấm "Cài đặt" (Install):</strong>
                            Bấm vào biểu tượng đó, trình duyệt hiện popup <i>"Cài đặt ứng dụng Hanyu?"</i> ➔ Bấm <strong>Cài đặt</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            3
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Mở ứng dụng từ Desktop:</strong>
                            Biểu tượng Hanyu sẽ xuất hiện ngay ngoài màn hình máy tính Desktop và thanh Taskbar, mở ra chạy độc lập như app máy tính thật!
                          </div>
                        </div>
                      </>
                    )}

                    {activePlatform === "MAC" && (
                      <>
                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-red-500 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            1
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Trên Safari (macOS Sonoma trở lên):</strong>
                            Mở Safari vào web, nhìn lên thanh Menu đỉnh màn hình Mac, bấm vào menu <strong>Tệp (File)</strong> ➔ Chọn <strong>"Thêm vào Dock" (Add to Dock)</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border-2 border-emerald-600 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#204434] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            2
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Trên Google Chrome (Mac):</strong>
                            Bấm vào biểu tượng <strong>Cài đặt [⤓]</strong> trên thanh địa chỉ URL hoặc menu 3 chấm ➔ Chọn <strong>"Cài đặt Hanyu"</strong>.
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            3
                          </span>
                          <div className="text-xs leading-relaxed">
                            <strong className="text-[#204434] block">Khởi động từ thanh Dock & Launchpad:</strong>
                            Icon ấn triện đỏ Hanyu sẽ cố định trên thanh Dock, bấm là mở ngay lập tức trong cửa sổ ứng dụng riêng biệt.
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Advantages of PWA */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-600/25 space-y-2">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Lợi ích vượt trội khi cài App Hanyu:</span>
                    </div>
                    <ul className="text-xs text-emerald-900/90 space-y-1 list-disc list-inside">
                      <li><strong>Toàn màn hình:</strong> Học tập tập trung, không có thanh địa chỉ web vướng víu.</li>
                      <li><strong>Cực nhẹ (Dưới 2MB):</strong> Không tốn dung lượng máy, không làm nóng hay chậm máy.</li>
                      <li><strong>Tự động cập nhật:</strong> Bài học mới từ cô giáo tự cập nhật ngay, không cần vào App Store cập nhật lại.</li>
                      <li><strong>Hoàn toàn 0 đồng:</strong> Tiết kiệm chi phí, không quảng cáo rác.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Mockup with Red Highlight Boxes */}
              <div className="lg:col-span-7">
                <div className="p-5 sm:p-7 rounded-3xl bg-[#FFFCF6]/95 border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/10">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#BC9B6B]/25 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-[#204434] ml-2">
                        {activePlatform === "IOS" && "Mô phỏng thao tác trên Safari iPhone"}
                        {activePlatform === "ANDROID" && "Mô phỏng thao tác trên Google Chrome Android"}
                        {activePlatform === "WINDOWS" && "Mô phỏng thanh địa chỉ trình duyệt trên Windows"}
                        {activePlatform === "MAC" && "Mô phỏng thanh Menu Safari trên macOS"}
                      </span>
                    </div>
                    <span className="text-[11px] text-red-600 font-bold">
                      Ô khoanh đỏ là điểm bấm chính xác
                    </span>
                  </div>

                  {/* Render Mockup per Platform */}
                  <div className="rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 p-4 sm:p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
                    
                    {/* iOS MOCKUP */}
                    {activePlatform === "IOS" && (
                      <div className="space-y-4">
                        {/* Fake iPhone browser view */}
                        <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 shadow-sm text-center">
                          <div className="text-xs font-bold text-[#204434]">ninjistudy.click</div>
                          <div className="text-[10px] text-[#315E48]">Hanyu - Nền tảng học tiếng Trung</div>
                        </div>

                        {/* Share Action Sheet Popup with Highlights */}
                        <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600 shadow-xl space-y-3 relative">
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#9D493E] text-white flex items-center justify-center font-bold text-xs">
                                宁
                              </div>
                              <div className="text-left text-xs">
                                <div className="font-bold text-gray-900">Hanyu Học Tiếng Trung</div>
                                <div className="text-[10px] text-gray-500">ninjistudy.click</div>
                              </div>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                              Bước 4: Bấm "Thêm"
                            </div>
                          </div>

                          {/* Highlighted item: Add to Home Screen */}
                          <div className="p-3 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-600 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-950">
                              <PlusSquare className="w-5 h-5 text-emerald-700" />
                              <span>Thêm vào Màn hình chính (Add to Home Screen)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#204434] text-white text-[10px] font-bold shadow-xs animate-bounce">
                              ❸ Bấm dòng này
                            </span>
                          </div>
                        </div>

                        {/* Fake Safari Bottom Bar with Red Highlight on Share */}
                        <div className="mt-4 p-3 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-around relative">
                          <span className="text-gray-400">‹</span>
                          <span className="text-gray-400">›</span>
                          
                          {/* Highlighted Share Button */}
                          <div className="relative p-2 rounded-xl bg-red-50 border-2 border-red-600 shadow-sm animate-pulse">
                            <Share className="w-5 h-5 text-red-600" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white shadow-xs">
                              ❷ Bấm nút Chia sẻ này
                            </span>
                          </div>

                          <span className="text-gray-400">📖</span>
                          <span className="text-gray-400">▢</span>
                        </div>
                      </div>
                    )}

                    {/* ANDROID MOCKUP */}
                    {activePlatform === "ANDROID" && (
                      <div className="space-y-4">
                        {/* Chrome Top Bar with Highlight on 3 dots */}
                        <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-700 flex-1 mr-3">
                            <span>🔒</span>
                            <span className="truncate">https://ninjistudy.click</span>
                          </div>
                          
                          {/* 3 Dots Highlight */}
                          <div className="relative px-2 py-1 rounded-lg bg-red-50 border-2 border-red-600">
                            <span className="text-lg font-bold text-red-600">⋮</span>
                            <span className="absolute -bottom-6 right-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-bold text-white shadow-xs">
                              ❷ Hoặc bấm 3 chấm
                            </span>
                          </div>
                        </div>

                        {/* PWA Floating Install Banner on Android */}
                        <div className="p-4 rounded-2xl bg-[#204434] text-white shadow-xl border-2 border-emerald-400 flex items-center justify-between relative mt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#9D493E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                              宁
                            </div>
                            <div>
                              <div className="font-bold text-xs">Cài đặt ứng dụng Hanyu</div>
                              <div className="text-[11px] text-emerald-200">Trải nghiệm toàn màn hình mượt mà</div>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md animate-bounce cursor-pointer">
                              Cài đặt ngay ⤓
                            </div>
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-400 text-[9px] font-bold text-[#204434] shadow-xs">
                              ❶ Bấm cài đặt ngay
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 space-y-1">
                          <div className="font-bold text-[#204434]">Sau khi cài đặt:</div>
                          <div>Ứng dụng sẽ xuất hiện như app tải từ CH Play, mở ra không có thanh duyệt web!</div>
                        </div>
                      </div>
                    )}

                    {/* WINDOWS MOCKUP */}
                    {activePlatform === "WINDOWS" && (
                      <div className="space-y-4">
                        {/* Windows Chrome/Edge Browser Address Bar Simulation */}
                        <div className="p-3.5 rounded-2xl bg-white border-2 border-blue-600 shadow-md space-y-2">
                          <div className="text-[10px] font-bold text-blue-900 uppercase">Thanh địa chỉ Google Chrome / Microsoft Edge trên Windows</div>
                          <div className="p-2 rounded-xl bg-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-700">
                              <span>🔒</span>
                              <span className="font-mono">https://ninjistudy.click</span>
                            </div>

                            {/* Highlighted Install Button in URL bar */}
                            <div className="relative flex items-center gap-2">
                              <span className="text-gray-400">★</span>
                              <div className="px-2 py-1 rounded bg-red-100 border-2 border-red-600 flex items-center gap-1 font-bold text-red-700 shadow-sm animate-pulse">
                                <Download className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Cài đặt Hanyu</span>
                              </div>
                              <span className="absolute -bottom-7 right-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-bold text-white shadow-xs">
                                ❶ Bấm nút Cài đặt này
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Windows Install Confirmation Popup */}
                        <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600 shadow-xl max-w-sm mx-auto space-y-3 mt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#9D493E] text-white flex items-center justify-center font-bold text-lg">
                              宁
                            </div>
                            <div>
                              <div className="font-bold text-xs text-gray-900">Cài đặt ứng dụng Hanyu?</div>
                              <div className="text-[10px] text-gray-500">ninjistudy.click</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                            <span className="px-3 py-1 rounded text-xs text-gray-600">Hủy</span>
                            <div className="px-3.5 py-1 rounded bg-blue-600 text-white font-bold text-xs shadow-xs">
                              ❷ Bấm Cài đặt
                            </div>
                          </div>
                        </div>

                        <div className="text-center text-xs text-[#315E48]">
                          ✨ Biểu tượng Hanyu sẽ nằm ngay ngoài Desktop và thanh Taskbar dưới đáy màn hình!
                        </div>
                      </div>
                    )}

                    {/* MAC MOCKUP */}
                    {activePlatform === "MAC" && (
                      <div className="space-y-4">
                        {/* Fake macOS Menu Bar */}
                        <div className="p-2.5 rounded-xl bg-gray-800 text-white flex items-center gap-4 text-xs font-medium shadow-sm">
                          <span className="font-bold"></span>
                          <span className="font-bold">Safari</span>
                          <span className="text-red-400 font-bold underline">Tệp (File)</span>
                          <span className="text-gray-400">Sửa</span>
                          <span className="text-gray-400">Xem</span>
                          <span className="text-gray-400">Lịch sử</span>
                          <span className="text-gray-400">Dấu trang</span>
                        </div>

                        {/* File Menu Dropdown Highlight */}
                        <div className="p-3 rounded-2xl bg-white border-2 border-red-500 shadow-xl max-w-xs space-y-1.5 text-xs text-gray-700">
                          <div className="px-2 py-1 text-gray-400">Cửa sổ mới</div>
                          <div className="px-2 py-1 text-gray-400">Mở vị trí...</div>
                          <div className="p-2 rounded-lg bg-emerald-50 border-2 border-emerald-600 font-bold text-emerald-950 flex items-center justify-between">
                            <span>Thêm vào Dock... (Add to Dock)</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                              ❶ Bấm chọn dòng này
                            </span>
                          </div>
                          <div className="px-2 py-1 text-gray-400">Lưu dưới dạng...</div>
                        </div>

                        {/* Mac Dock Simulation */}
                        <div className="p-2 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-300 shadow-md max-w-sm mx-auto flex items-center justify-around mt-4">
                          <span className="text-xl">📁</span>
                          <span className="text-xl">🧭</span>
                          <div className="relative p-1 rounded-xl bg-[#9D493E] text-white font-bold text-sm w-9 h-9 flex items-center justify-center shadow-md animate-bounce">
                            宁
                            <span className="absolute -top-6 whitespace-nowrap px-1.5 py-0.5 rounded bg-[#9D493E] text-[9px] text-white font-bold">
                              ❷ Nằm trên Dock
                            </span>
                          </div>
                          <span className="text-xl">⚙️</span>
                          <span className="text-xl">🗑️</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom notes */}
                    <div className="mt-4 pt-3 border-t border-[#BC9B6B]/25 flex items-center justify-between text-[11px] text-[#315E48]">
                      <span>💡 Không cần tốn phí 25$ hay 99$/năm của chợ ứng dụng</span>
                      <span className="font-serif">博学笃行 · 沉潜致远</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Contact & Direct Teacher Guidance Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#204434] text-[#FFFCF6] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="space-y-1.5 text-center md:text-left relative z-10">
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
              Bạn vẫn còn câu hỏi hoặc cần giải đáp thêm?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
              Cô Ning Ning và đội ngũ trợ giảng luôn sẵn sàng hỗ trợ trực tiếp học viên qua Zalo, WeChat hoặc tin nhắn trong lớp học.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-[#FFFCF6] text-[#204434] hover:bg-white text-xs font-bold transition shadow-md"
            >
              Về Trang chủ
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-[#9D493E] hover:bg-[#83382F] text-white text-xs font-bold transition shadow-md"
            >
              Đăng nhập ngay →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#BC9B6B]/20 py-6 text-center text-xs text-[#315E48]">
        © 2026 Hanyu · Lớp tiếng Trung cô Ning Ning · Nền tảng Học tiếng Trung & Luyện thi HSK 3.0
      </footer>
    </div>
  );
}
