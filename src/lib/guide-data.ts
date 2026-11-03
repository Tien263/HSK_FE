export interface GuideHighlight {
  id: string;
  label: string;
  description: string;
  badge: string;
  color: "red" | "emerald" | "amber";
}

export interface GuideStep {
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
    highlights: GuideHighlight[];
  };
}

export interface GuideConfigData {
  updatedAt: string;
  studentSteps: GuideStep[];
  teacherSteps: GuideStep[];
}

export const DEFAULT_STUDENT_STEPS: GuideStep[] = [
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

export const DEFAULT_TEACHER_STEPS: GuideStep[] = [
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
