"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Mic,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  Award,
  BookOpen,
  Send,
  HelpCircle,
  Headphones,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
  Trophy,
  Flame,
  ChevronRight,
} from "lucide-react";
import { LessonDialogueLine } from "@/lib/hsk1-full-lessons";

export interface RoleplayScenario {
  id: string;
  title: string;
  badge: string;
  icon: string;
  level: string;
  description: string;
  aiRole: string;
  studentRole: string;
  initialGreeting: {
    zh: string;
    pinyin: string;
    vi: string;
  };
  missions: Array<{
    id: number;
    title: string;
    description: string;
    hintZh: string;
    hintPinyin: string;
    hintVi: string;
  }>;
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "haidilao",
    title: "Gọi món tại Nhà hàng Lẩu Haidilao",
    badge: "Ẩm thực đời sống",
    icon: "🍲",
    level: "HSK 1 - 2",
    description: "Bạn vừa bước vào nhà hàng lẩu, phục vụ niềm nở đón tiếp. Hãy chọn bàn, gọi nước lẩu, món thịt và thanh toán.",
    aiRole: "Phục vụ Haidilao (服务员小王)",
    studentRole: "Thực khách đi ăn lẩu (顾客)",
    initialGreeting: {
      zh: "您好！欢迎光临海底捞！请问您一共几位？想坐靠窗的位置吗？",
      pinyin: "Nǐ hǎo! Huānyíng guānglín Hǎidǐlāo! Qǐngwèn nín yígòng jǐ wèi? Xiǎng zuò kào chuāng de wèizhì ma?",
      vi: "Chào quý khách! Hoan nghênh đến với Haidilao! Xin hỏi quý khách đi mấy người ạ? Quý khách muốn ngồi bàn gần cửa sổ không?",
    },
    missions: [
      {
        id: 1,
        title: "Báo số lượng người đi ăn",
        description: "Chào phục vụ và nói bạn đi 2 người (hoặc 3 người)",
        hintZh: "你好，我们两个人，请问有空位吗？",
        hintPinyin: "Nǐ hǎo, wǒmen liǎng gè rén, qǐngwèn yǒu kòngwèi ma?",
        hintVi: "Chào bạn, chúng tôi đi 2 người, xin hỏi có chỗ trống không?",
      },
      {
        id: 2,
        title: "Chọn nước lẩu và gọi thịt",
        description: "Gọi nước lẩu cà chua/ít cay và 1 đĩa thịt bò",
        hintZh: "我们要番茄锅底，还要一份牛肉。",
        hintPinyin: "Wǒmen yào fānqié guōdǐ, hái yào yí fèn niúròu.",
        hintVi: "Chúng tôi muốn nước lẩu cà chua, và thêm một phần thịt bò.",
      },
      {
        id: 3,
        title: "Xin hóa đơn và thanh toán",
        description: "Gọi thanh toán và hỏi có dùng WeChat Pay được không",
        hintZh: "服务员，买单！可以微信支付吗？",
        hintPinyin: "Fúwùyuán, mǎidān! Kěyǐ Wēixìn zhīfù ma?",
        hintVi: "Phục vụ ơi tính tiền! Có thể thanh toán bằng WeChat được không?",
      },
    ],
  },
  {
    id: "night_market",
    title: "Mua sắm & Trả giá ở Chợ đêm",
    badge: "Mua sắm du lịch",
    icon: "🛍️",
    level: "HSK 2 - 3",
    description: "Bạn dạo chợ đêm thấy một chiếc áo rất đẹp. Hãy bắt chuyện với chủ sạp, hỏi giá, mặc cả khéo léo để mua được giá tốt.",
    aiRole: "Chủ sạp hàng vui tính (热情摊主)",
    studentRole: "Khách du lịch khéo mặc cả (游客)",
    initialGreeting: {
      zh: "帅哥/美女，来看一看啊！最新款的纯棉短袖，今天刚到的新货！你喜欢哪一件？",
      pinyin: "Shuàigē / měinǚ, lái kàn yí kàn a! Zuì xīn kuǎn de chúnmián duǎnxiù, jīntiān gāng dào de xīn huò! Nǐ xǐhuan nǎ yí jiàn?",
      vi: "Anh đẹp trai / Người đẹp ơi lại xem đi! Áo ngắn tay cotton mẫu mới nhất, hàng vừa về hôm nay! Bạn thích chiếc nào?",
    },
    missions: [
      {
        id: 1,
        title: "Hỏi giá chiếc áo",
        description: "Hỏi người bán xem chiếc áo này giá bao nhiêu tiền",
        hintZh: "老板，这件衣服多少钱一件？",
        hintPinyin: "Lǎobǎn, zhè jiàn yīfu duōshao qián yí jiàn?",
        hintVi: "Ông chủ ơi, chiếc áo này bao nhiêu tiền một chiếc?",
      },
      {
        id: 2,
        title: "Chê đắt và xin bớt giá",
        description: "Nói giá hơi đắt và đề nghị bớt một chút (ví dụ 50 tệ)",
        hintZh: "太贵了，便宜一点儿吧！五十块行不行？",
        hintPinyin: "Tài guì le, piányi yìdiǎnr ba! Wǔshí kuài xíng bu xíng?",
        hintVi: "Đắt quá, bớt chút đi ông chủ! 50 tệ được không?",
      },
      {
        id: 3,
        title: "Chốt mua chiếc áo",
        description: "Đồng ý mua và cảm ơn chủ quán",
        hintZh: "好的，那我要这一件，谢谢老板！",
        hintPinyin: "Hǎo de, nà wǒ yào zhè yí jiàn, xièxie lǎobǎn!",
        hintVi: "Được rồi, thế tôi lấy chiếc này, cảm ơn ông chủ!",
      },
    ],
  },
  {
    id: "taxi_airport",
    title: "Bắt Taxi ra Sân bay Bắc Kinh",
    badge: "Giao thông đi lại",
    icon: "🚕",
    level: "HSK 2 - 3",
    description: "Bạn cần ra sân bay Đại Hưng để kịp chuyến bay. Hãy nói điểm đến cho bác tài, hỏi thời gian và yêu cầu hóa đơn.",
    aiRole: "Bác tài xế Bắc Kinh thân thiện (出租车师傅)",
    studentRole: "Hành khách ra sân bay (赶飞机的乘客)",
    initialGreeting: {
      zh: "您好！上车请系好安全带。请问您去哪儿啊？",
      pinyin: "Nǐ hǎo! Shàng chē qǐng jì hǎo ānquándài. Qǐngwèn nín qù nǎr a?",
      vi: "Chào quý khách! Lên xe xin thắt dây an toàn. Xin hỏi quý khách đi đâu ạ?",
    },
    missions: [
      {
        id: 1,
        title: "Nói rõ điểm đến",
        description: "Nói với tài xế bạn muốn đi sân bay Đại Hưng",
        hintZh: "师傅，我去北京大兴机场，飞机两点起飞。",
        hintPinyin: "Shīfu, wǒ qù Běijīng Dàxīng Jīchǎng, fēijī liǎng diǎn qǐfēi.",
        hintVi: "Bác tài ơi, tôi đi sân bay Đại Hưng Bắc Kinh, máy bay cất cánh lúc 2 giờ.",
      },
      {
        id: 2,
        title: "Hỏi thời gian và xin đi cao tốc",
        description: "Hỏi đi mất bao lâu và xin chạy đường cao tốc cho nhanh",
        hintZh: "大概要多长时间？能走高速公路吗？",
        hintPinyin: "Dàgài yào duō cháng shíjiān? Néng zǒu gāosù gōnglù ma?",
        hintVi: "Mất khoảng bao lâu thế bác? Có thể đi đường cao tốc được không?",
      },
      {
        id: 3,
        title: "Trả tiền và lấy hóa đơn",
        description: "Đưa tiền cho tài xế và xin hóa đơn",
        hintZh: "师傅，给你一百块，请给我发票，谢谢！",
        hintPinyin: "Shīfu, gěi nǐ yìbǎi kuài, qǐng gěi wǒ fāpiào, xièxie!",
        hintVi: "Bác tài ơi gửi bác 100 tệ, làm ơn cho cháu xin hóa đơn, cảm ơn bác!",
      },
    ],
  },
  {
    id: "hotel_checkin",
    title: "Check-in & Đổi phòng ở Khách sạn",
    badge: "Khách sạn du lịch",
    icon: "🏨",
    level: "HSK 3 - 4",
    description: "Bạn đến khách sạn nhận phòng đã đặt online, sau đó phát hiện phòng cạnh đường lớn bị ồn và nhờ lễ tân đổi phòng yên tĩnh hơn.",
    aiRole: "Lễ tân khách sạn (酒店前台小李)",
    studentRole: "Khách nhận phòng (预订房客)",
    initialGreeting: {
      zh: "您好，欢迎光临希尔顿酒店！请问您有预订吗？请出示一下您的护照。",
      pinyin: "Nǐ hǎo, huānyíng guānglín Xī'ěrdùn Jiǔdiàn! Qǐngwèn nín yǒu yùdìng ma? Qǐng chūshì yíxià nín de hùzhào.",
      vi: "Xin chào, hoan nghênh đến khách sạn Hilton! Xin hỏi quý khách đã đặt phòng chưa? Xin vui lòng xuất trình hộ chiếu.",
    },
    missions: [
      {
        id: 1,
        title: "Xác nhận đặt phòng và đưa hộ chiếu",
        description: "Nói bạn đã đặt phòng trên mạng và đưa hộ chiếu",
        hintZh: "你好，我在网上预订了大床房，这是我的护照。",
        hintPinyin: "Nǐ hǎo, wǒ zài wǎngshang yùdìng le dàchuángfáng, zhè shì wǒ de hùzhào.",
        hintVi: "Xin chào, tôi đã đặt phòng giường đôi trên mạng, đây là hộ chiếu của tôi.",
      },
      {
        id: 2,
        title: "Phản ánh phòng ồn và xin đổi phòng",
        description: "Phản ánh phòng sát đường hơi ồn và xin đổi phòng yên tĩnh",
        hintZh: "你好，这个房间靠近马路有点儿吵，可以帮我换一间安静的吗？",
        hintPinyin: "Nǐ hǎo, zhège fángjiān kàojìn mǎlù yǒudiǎnr chǎo, kěyǐ bāng wǒ huàn yì jiān ānjìng de ma?",
        hintVi: "Xin chào, phòng này gần mặt đường hơi ồn, có thể đổi cho tôi một phòng yên tĩnh không?",
      },
      {
        id: 3,
        title: "Hỏi giờ ăn sáng và mật khẩu Wi-Fi",
        description: "Hỏi ăn sáng mấy giờ bắt đầu và mật khẩu Wi-Fi là gì",
        hintZh: "请问明天的早餐几点开始？还有WiFi密码是多少？",
        hintPinyin: "Qǐngwèn míngtiān de zǎocān jǐ diǎn kāishǐ? Hái yǒu WiFi mìmǎ shì duōshao?",
        hintVi: "Xin hỏi bữa sáng ngày mai mấy giờ bắt đầu? Và mật khẩu Wi-Fi là bao nhiêu ạ?",
      },
    ],
  },
  {
    id: "job_interview",
    title: "Phỏng vấn Xin việc Tiếng Trung",
    badge: "Công sở HSK Cao cấp",
    icon: "💼",
    level: "HSK 4 - 5",
    description: "Bạn ứng tuyển vào công ty thương mại song phương Việt - Trung. Người phỏng vấn yêu cầu bạn giới thiệu bản thân và nêu thế mạnh.",
    aiRole: "Giám đốc nhân sự (HR总监陈经理)",
    studentRole: "Ứng viên phỏng vấn (应聘者)",
    initialGreeting: {
      zh: "请坐！我看过你的简历，你的中文水平很不错。首先请你用中文做一个简短的自我介绍吧。",
      pinyin: "Qǐng zuò! Wǒ kànguo nǐ de jiǎnlì, nǐ de Zhōngwén shuǐpíng hěn búcuò. Shǒuxiān qǐng nǐ yòng Zhōngwén zuò yí gè jiǎnduǎn de zìwǒ jièshào ba.",
      vi: "Mời bạn ngồi! Tôi đã xem qua CV của bạn, trình độ tiếng Trung của bạn khá tốt. Trước tiên mời bạn dùng tiếng Trung giới thiệu ngắn gọn về bản thân.",
    },
    missions: [
      {
        id: 1,
        title: "Giới thiệu bản thân cơ bản",
        description: "Giới thiệu tên, trường tốt nghiệp hoặc kinh nghiệm làm việc",
        hintZh: "陈经理好，我毕业于河内大学中文系，有两年的外贸工作经验。",
        hintPinyin: "Chén jīnglǐ hǎo, wǒ bìyè yú Hénèi Dàxué Zhōngwénxì, yǒu liǎng nián de wàimào gōngzuò jīngyàn.",
        hintVi: "Chào giám đốc Trần, tôi tốt nghiệp khoa tiếng Trung ĐH Hà Nội, có 2 năm kinh nghiệm làm xuất nhập khẩu.",
      },
      {
        id: 2,
        title: "Trình bày thế mạnh cá nhân",
        description: "Nói về kỹ năng giao tiếp tốt và khả năng chịu áp lực công việc",
        hintZh: "我的优势是沟通能力强，而且能吃苦，抗压能力很好。",
        hintPinyin: "Wǒ de yōushì shì gōutōng nénglì qiáng, érqiě néng chīkǔ, kàngyā nénglì hěn hǎo.",
        hintVi: "Thế mạnh của tôi là khả năng giao tiếp tốt, chăm chỉ chịu khó và chịu áp lực công việc rất tốt.",
      },
      {
        id: 3,
        title: "Hỏi về thời gian thông báo kết quả",
        description: "Cảm ơn người phỏng vấn và hỏi thời gian nhận kết quả",
        hintZh: "非常感谢您的时间！请问大概什么时候能知道面试结果呢？",
        hintPinyin: "Fēicháng gǎnxiè nín de shíjiān! Qǐngwèn dàgài shénme shíhou néng zhīdào miànshì jiéguǒ ne?",
        hintVi: "Rất cảm ơn thời gian của quý công ty! Xin hỏi khoảng bao giờ thì có kết quả phỏng vấn ạ?",
      },
    ],
  },
];

interface AiDialogueRoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDialogue?: LessonDialogueLine[];
  lessonTitle?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
}

export default function AiDialogueRoleplayModal({
  isOpen,
  onClose,
  initialDialogue = [],
  lessonTitle = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId,
}: AiDialogueRoleplayModalProps) {
  // Chế độ: BÀI HỌC (LESSON) vs TÌNH HUỐNG THỰC TẾ (SCENARIO) vs TRÒ CHUYỆN TỰ DO (FREE_TALK)
  const [talkMode, setTalkMode] = useState<"LESSON" | "SCENARIO" | "FREE_TALK">("LESSON");
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(ROLEPLAY_SCENARIOS[0]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [activeHintMission, setActiveHintMission] = useState<any | null>(null);

  // Lịch sử hội thoại tình huống
  const [scenarioChatHistory, setScenarioChatHistory] = useState<
    Array<{
      sender: "STUDENT" | "AI";
      zh: string;
      pinyin?: string;
      vi?: string;
      score?: number;
      vocab?: any[];
    }>
  >([
    {
      sender: "AI",
      zh: ROLEPLAY_SCENARIOS[0].initialGreeting.zh,
      pinyin: ROLEPLAY_SCENARIOS[0].initialGreeting.pinyin,
      vi: ROLEPLAY_SCENARIOS[0].initialGreeting.vi,
    },
  ]);

  // Danh sách câu thoại (cho phép người dùng thêm hoặc sửa theo ý muốn)
  const [dialogueLines, setDialogueLines] = useState<LessonDialogueLine[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(0);
  const [myRole, setMyRole] = useState<string>("");

  // Trạng thái thu âm và kết quả AI
  const [isRecording, setIsRecording] = useState(false);
  const [spokenResult, setSpokenResult] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  // Form Thêm / Sửa câu thoại
  const [isEditingLine, setIsEditingLine] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editZh, setEditZh] = useState("");
  const [editPinyin, setEditPinyin] = useState("");
  const [editVi, setEditVi] = useState("");

  // Lời chào mở đầu mặc định của AI Tiểu Ngữ để cuộc hội thoại có khởi đầu hai chiều tự nhiên
  const defaultAiIntro = useMemo(
    () => ({
      sender: "AI" as const,
      zh: "你好！我是你的中文语伴小语。很高兴今天能和你聊天！你今天过得怎么样？",
      pinyin: "Nǐ hǎo! Wǒ shì nǐ de Zhōngwén yǔbàn Xiǎo Yǔ. Hěn gāoxìng jīntiān néng hé nǐ liáotiān! Nǐ jīntiān guò de zěnmeyàng?",
      vi: "Chào bạn! Mình là bạn học tiếng Trung Tiểu Ngữ. Rất vui hôm nay được trò chuyện cùng bạn! Hôm nay bạn thế nào?",
    }),
    []
  );

  // Free talk chat history
  const [freeChatHistory, setFreeChatHistory] = useState<
    Array<{
      sender: "STUDENT" | "AI";
      zh: string;
      pinyin?: string;
      vi?: string;
      score?: number;
      vocab?: any[];
    }>
  >([
    {
      sender: "AI",
      zh: "你好！我是你的中文语伴小语。很高兴今天能和你聊天！你今天过得怎么样？",
      pinyin: "Nǐ hǎo! Wǒ shì nǐ de Zhōngwén yǔbàn Xiǎo Yǔ. Hěn gāoxìng jīntiān néng hé nǐ liáotiān! Nǐ jīntiān guò de zěnmeyàng?",
      vi: "Chào bạn! Mình là bạn học tiếng Trung Tiểu Ngữ. Rất vui hôm nay được trò chuyện cùng bạn! Hôm nay bạn thế nào?",
    },
  ]);

  // Gợi ý phản hồi và ô nhập văn bản tự do
  const [typedText, setTypedText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [autoListen, setAutoListen] = useState<boolean>(true);
  const autoListenRef = useRef<boolean>(true);
  const [aiVoiceGender, setAiVoiceGender] = useState<"female" | "male">("female");

  useEffect(() => {
    autoListenRef.current = autoListen;
  }, [autoListen]);

  // Nạp danh sách giọng đọc trình duyệt không đồng bộ
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
      return () => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const [currentSuggestions, setCurrentSuggestions] = useState<
    Array<{
      zh: string;
      pinyin: string;
      vi: string;
      grammarStructure?: string;
      explanation?: string;
    }>
  >([
    {
      zh: "我今天挺好的，不太忙。",
      pinyin: "Wǒ jīntiān tǐng hǎo de, bú tài máng.",
      vi: "Hôm nay mình khá ổn, không bận lắm.",
      grammarStructure: "主语 + 挺 + 形容词 + 的 (Khá / Rất ...)",
      explanation: "Dùng để diễn tả tình trạng khá tốt một cách khiêm tốn, tự nhiên trong giao tiếp hàng ngày.",
    },
    {
      zh: "今天工作有点多，有点累。",
      pinyin: "Jīntiān gōngzuò yǒudiǎn duō, yǒudiǎn lèi.",
      vi: "Hôm nay công việc hơi nhiều, có chút mệt.",
      grammarStructure: "有点儿 + 形容词 (Hơi / Có chút ...)",
      explanation: "Dùng '有点儿' trước tính từ mang hàm ý hơi tiêu cực (hơi mệt, hơi đắt, hơi bận).",
    },
    {
      zh: "你叫什么名字？你是哪国人？",
      pinyin: "Nǐ jiào shénme míngzi? Nǐ shì nǎ guó rén?",
      vi: "Bạn tên là gì? Bạn là người nước nào?",
      grammarStructure: "疑问代词 (Đại từ nghi vấn 什么 / 哪)",
      explanation: "Hai câu hỏi làm quen cơ bản và tự nhiên nhất khi bắt đầu cuộc trò chuyện.",
    },
  ]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [freeChatHistory, scenarioChatHistory]);

  // Khởi tạo dialogue từ bài học
  useEffect(() => {
    if (initialDialogue && initialDialogue.length > 0) {
      setDialogueLines(initialDialogue);
      setCurrentLineIdx(0);
      setMyRole(initialDialogue[1]?.speaker || initialDialogue[0]?.speaker || "Tôi");
    } else {
      setDialogueLines([
        { speaker: "王老师", zh: "同学们好！", pinyin: "Tóngxuémen hǎo!", vi: "Chào các em học sinh!" },
        { speaker: "学生们", zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Chúng em chào thầy ạ!" },
        { speaker: "王老师", zh: "今天我们学习第一课。", pinyin: "Jīntiān wǒmen xuéxí dì-yī kè.", vi: "Hôm nay chúng ta học bài 1." },
        { speaker: "学生们", zh: "好的，谢谢老师！", pinyin: "Hǎo de, xièxie lǎoshī!", vi: "Vâng ạ, cảm ơn thầy!" },
      ]);
      setMyRole("学生们");
    }
    setCheckResult(null);
    setSpokenResult("");
  }, [initialDialogue, isOpen]);

  const currentLine = dialogueLines[currentLineIdx] || dialogueLines[0];
  const isMyTurn = currentLine && currentLine.speaker === myRole;

  // Phát âm câu thoại qua Web SpeechSynthesis ưu tiên các giọng Neural / Natural bản xứ cao cấp
  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9; // Tốc độ đàm thoại tự nhiên của người bản xứ

      const voices = window.speechSynthesis.getVoices();
      const zhVoices = voices.filter((v) => /^zh/i.test(v.lang));

      let selectedVoice = null;
      if (aiVoiceGender === "female") {
        // Ưu tiên giọng nữ tự nhiên chuẩn Bắc Kinh (Xiaoxiao, Yaoyao, Google)
        selectedVoice =
          zhVoices.find((v) => /xiaoxiao/i.test(v.name)) ||
          zhVoices.find((v) => /natural|online|neural/i.test(v.name) && /female|xiaoxiao|yaoyao|huihui/i.test(v.name)) ||
          zhVoices.find((v) => /google.*(cmn|zh|mandarin)/i.test(v.name)) ||
          zhVoices.find((v) => /female|yaoyao|xiaoxiao/i.test(v.name)) ||
          zhVoices.find((v) => /natural|online/i.test(v.name)) ||
          zhVoices[0];
      } else {
        // Ưu tiên giọng nam ấm áp chuẩn phát thanh viên (Yunxi, Yunjian, Kangkang)
        selectedVoice =
          zhVoices.find((v) => /yunxi/i.test(v.name)) ||
          zhVoices.find((v) => /natural|online|neural/i.test(v.name) && /male|yunxi|yunjian|kangkang/i.test(v.name)) ||
          zhVoices.find((v) => /male|yunxi|yunjian/i.test(v.name)) ||
          zhVoices.find((v) => /natural|online/i.test(v.name)) ||
          zhVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }
      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      onEnd();
    }
  };

  // Thu âm qua Web Speech Recognition
  const handleStartRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt chưa hỗ trợ Web Speech API. Vui lòng mở trang web trên Google Chrome hoặc Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setSpokenResult("");
      setCheckResult(null);

      recognition.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript || "";
        setSpokenResult(spoken);
        setIsRecording(false);
        await verifySpeechWithBackend(spoken);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      alert("Lỗi khởi tạo micro. Vui lòng cấp quyền truy cập micro cho trình duyệt.");
    }
  };

  // Cho AI tự động đọc câu hiện tại (khi đến lượt AI nói trong bài học) và chuyển lượt cho học sinh
  const handleAiSpeakCurrentLine = () => {
    if (!currentLine) return;
    speakText(currentLine.zh, () => {
      const nextIdx = currentLineIdx + 1;
      if (nextIdx < dialogueLines.length) {
        setCurrentLineIdx(nextIdx);
        setCheckResult(null);
        setSpokenResult("");
        if (autoListenRef.current) {
          setTimeout(() => {
            handleStartRecording();
          }, 600);
        }
      }
    });
  };

  // Chọn kịch bản tình huống nhập vai
  const handleSelectScenario = (sc: RoleplayScenario) => {
    setSelectedScenario(sc);
    setCompletedMissions([]);
    setShowCelebration(false);
    setCheckResult(null);
    setScenarioChatHistory([
      {
        sender: "AI",
        zh: sc.initialGreeting.zh,
        pinyin: sc.initialGreeting.pinyin,
        vi: sc.initialGreeting.vi,
      },
    ]);
    if (sc.missions[0]) {
      setCurrentSuggestions([
        {
          zh: sc.missions[0].hintZh,
          pinyin: sc.missions[0].hintPinyin,
          vi: sc.missions[0].hintVi,
          grammarStructure: "Câu mẫu gợi ý tình huống",
          explanation: sc.missions[0].description,
        },
      ]);
    }
    setTimeout(() => {
      speakText(sc.initialGreeting.zh, () => {
        if (autoListenRef.current) {
          setTimeout(() => {
            handleStartRecording();
          }, 700);
        }
      });
    }, 400);
  };

  // Gửi âm thanh lên backend đối chiếu kho từ điển và chấm điểm
  const verifySpeechWithBackend = async (spokenText: string) => {
    const historyPayload =
      talkMode === "SCENARIO"
        ? scenarioChatHistory.map((m) => ({ sender: m.sender, zh: m.zh }))
        : freeChatHistory.map((m) => ({ sender: m.sender, zh: m.zh }));

    if (talkMode === "SCENARIO") {
      setScenarioChatHistory((prev) => [
        ...prev,
        {
          sender: "STUDENT",
          zh: spokenText,
        },
      ]);
    } else if (talkMode === "FREE_TALK") {
      setFreeChatHistory((prev) => [
        ...prev,
        {
          sender: "STUDENT",
          zh: spokenText,
        },
      ]);
    }

    setChecking(true);
    try {
      const targetText = talkMode === "LESSON" ? currentLine?.zh || "" : "";
      const res = await fetch("/api/v1/ai/dialogue-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText,
          targetText,
          mode: talkMode === "LESSON" ? "DIALOGUE" : talkMode === "SCENARIO" ? "SCENARIO" : "FREE_TALK",
          speaker: talkMode === "SCENARIO" ? selectedScenario.studentRole : myRole,
          lessonNumber,
          hskLevel,
          studentId,
          history: historyPayload,
          scenarioTitle: selectedScenario.title,
          scenarioAiRole: selectedScenario.aiRole,
          scenarioStudentRole: selectedScenario.studentRole,
          scenarioMissions: selectedScenario.missions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckResult(data);

        if (talkMode === "SCENARIO") {
          // Cập nhật câu nói của học sinh và thêm phản hồi nhập vai của AI
          setScenarioChatHistory((prev) => {
            const nextList = [...prev];
            const lastStudentIdx = nextList.findLastIndex((m) => m.sender === "STUDENT");
            if (lastStudentIdx >= 0) {
              nextList[lastStudentIdx] = {
                ...nextList[lastStudentIdx],
                score: data.score,
                vocab: data.vocabDetected,
              };
            }
            if (data.aiReplyZh) {
              nextList.push({
                sender: "AI",
                zh: data.aiReplyZh,
                pinyin: data.aiReplyPinyin,
                vi: data.aiReplyVi,
              });
            }
            return nextList;
          });

          // Kiểm tra và cập nhật nhiệm vụ đã hoàn thành
          if (data.completedMissionId) {
            setCompletedMissions((prev) => {
              if (!prev.includes(data.completedMissionId)) {
                const nextMissions = [...prev, data.completedMissionId];
                if (nextMissions.length >= selectedScenario.missions.length) {
                  setShowCelebration(true);
                }
                return nextMissions;
              }
              return prev;
            });
          }

          if (data.suggestedReplies && Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
            setCurrentSuggestions(data.suggestedReplies);
          }

          if (data.aiReplyZh) {
            setTimeout(() => {
              speakText(data.aiReplyZh, () => {
                if (autoListenRef.current) {
                  setTimeout(() => {
                    handleStartRecording();
                  }, 700);
                }
              });
            }, 500);
          }
        } else if (talkMode === "FREE_TALK") {
          // Cập nhật điểm cho câu nói vừa rồi của học sinh và thêm câu đáp của AI
          setFreeChatHistory((prev) => {
            const nextList = [...prev];
            const lastStudentIdx = nextList.findLastIndex((m) => m.sender === "STUDENT");
            if (lastStudentIdx >= 0) {
              nextList[lastStudentIdx] = {
                ...nextList[lastStudentIdx],
                score: data.score,
                vocab: data.vocabDetected,
              };
            }
            if (data.aiReplyZh) {
              nextList.push({
                sender: "AI",
                zh: data.aiReplyZh,
                pinyin: data.aiReplyPinyin,
                vi: data.aiReplyVi,
              });
            }
            return nextList;
          });

          // Cập nhật gợi ý câu đối đáp mới từ AI
          if (data.suggestedReplies && Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
            setCurrentSuggestions(data.suggestedReplies);
          }

          // Tự động phát âm câu đối đáp của AI & Khi đọc xong tự động mở lại micro nếu bật autoListen
          if (data.aiReplyZh) {
            setTimeout(() => {
              speakText(data.aiReplyZh, () => {
                if (autoListenRef.current) {
                  setTimeout(() => {
                    handleStartRecording();
                  }, 700);
                }
              });
            }, 500);
          }
        } else if (talkMode === "LESSON") {
          // Nếu học sinh nói tốt trong chế độ bài học, tự động chuyển lượt và đối đáp
          if (data.score >= 70) {
            const nextIdx = currentLineIdx + 1;
            if (nextIdx < dialogueLines.length) {
              const nextLine = dialogueLines[nextIdx];
              if (nextLine.speaker !== myRole) {
                // AI tự động phát âm câu thoại của mình rồi nhường lượt tiếp theo cho học sinh và mở micro
                setTimeout(() => {
                  setCurrentLineIdx(nextIdx);
                  speakText(nextLine.zh, () => {
                    const afterNextIdx = nextIdx + 1;
                    if (afterNextIdx < dialogueLines.length && dialogueLines[afterNextIdx].speaker === myRole) {
                      setCurrentLineIdx(afterNextIdx);
                      setCheckResult(null);
                      setSpokenResult("");
                      if (autoListenRef.current) {
                        setTimeout(() => {
                          handleStartRecording();
                        }, 700);
                      }
                    }
                  });
                }, 1000);
              } else {
                setTimeout(() => {
                  setCurrentLineIdx(nextIdx);
                  setCheckResult(null);
                  setSpokenResult("");
                }, 1000);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("verifySpeechWithBackend error:", e);
    } finally {
      setChecking(false);
    }
  };

  // Gửi câu nói bằng văn bản nhập từ bàn phím hoặc bấm từ gợi ý
  const handleSendTypedText = (textToSend?: string) => {
    const text = (textToSend || typedText).trim();
    if (!text || checking) return;
    setTypedText("");
    verifySpeechWithBackend(text);
  };

  // Lưu hoặc thêm câu thoại mới
  const handleSaveDialogueLine = () => {
    if (!editSpeaker.trim() || !editZh.trim()) {
      alert("Vui lòng nhập tên người nói và câu thoại chữ Hán.");
      return;
    }

    const newLine: LessonDialogueLine = {
      speaker: editSpeaker.trim(),
      zh: editZh.trim(),
      pinyin: editPinyin.trim(),
      vi: editVi.trim(),
    };

    if (editingIndex !== null) {
      // Sửa câu có sẵn
      setDialogueLines((prev) => {
        const copy = [...prev];
        copy[editingIndex] = newLine;
        return copy;
      });
    } else {
      // Thêm câu mới vào cuối đoạn hội thoại
      setDialogueLines((prev) => [...prev, newLine]);
    }

    setIsEditingLine(false);
    setEditingIndex(null);
  };

  const handleOpenEdit = (idx: number) => {
    const item = dialogueLines[idx];
    if (!item) return;
    setEditingIndex(idx);
    setEditSpeaker(item.speaker);
    setEditZh(item.zh);
    setEditPinyin(item.pinyin);
    setEditVi(item.vi);
    setIsEditingLine(true);
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setEditSpeaker(myRole || "Tôi");
    setEditZh("");
    setEditPinyin("");
    setEditVi("");
    setIsEditingLine(true);
  };

  const handleDeleteLine = (idx: number) => {
    if (dialogueLines.length <= 1) {
      alert("Cần giữ lại ít nhất 1 câu thoại.");
      return;
    }
    setDialogueLines((prev) => prev.filter((_, i) => i !== idx));
    if (currentLineIdx >= dialogueLines.length - 1) {
      setCurrentLineIdx(Math.max(0, dialogueLines.length - 2));
    }
  };

  if (!isOpen) return null;

  // Lấy danh sách các nhân vật trong đoạn hội thoại
  const allSpeakers = Array.from(new Set(dialogueLines.map((l) => l.speaker)));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[94vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-[#BC9B6B] flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
                  Luyện Khẩu Ngữ & Hội Thoại AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                  Kho Từ Điển Live
                </span>
              </div>
              <p className="text-xs text-[#315E48]">
                {lessonTitle} · Kết nối trực tiếp dữ liệu từ điển đối chiếu thanh điệu và từ vựng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chuyển đổi 3 chế độ: Theo bài học vs Tình huống nhập vai vs Trò chuyện tự do */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF7F0] p-1.5 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => {
              setTalkMode("LESSON");
              setCheckResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[130px] ${
              talkMode === "LESSON"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hội thoại bài học ({dialogueLines.length})</span>
          </button>

          <button
            onClick={() => {
              setTalkMode("SCENARIO");
              setCheckResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[170px] ${
              talkMode === "SCENARIO"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Tình huống nhập vai ({ROLEPLAY_SCENARIOS.length})</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 font-extrabold uppercase">
              Mới
            </span>
          </button>

          <button
            onClick={() => {
              setTalkMode("FREE_TALK");
              setCheckResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[130px] ${
              talkMode === "FREE_TALK"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Trò chuyện tự do</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* CHẾ ĐỘ 1: LUYỆN HỘI THOẠI THEO BÀI HỌC                              */}
        {/* =================================================================== */}
        {talkMode === "LESSON" && (
          <div className="space-y-4">
            {/* Thanh chọn nhân vật đóng vai & Nút Thêm câu mới */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8F6D3B]">Bạn muốn đóng vai:</span>
                <div className="flex items-center gap-1.5">
                  {allSpeakers.map((spk, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMyRole(spk)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        myRole === spk
                          ? "bg-[#204434] text-white shadow-xs"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:bg-white"
                      }`}
                    >
                      {spk}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiVoiceGender(aiVoiceGender === "female" ? "male" : "female")}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0] shadow-2xs"
                  title="Đổi giọng đọc AI (Giọng Nữ Xiaoxiao / Giọng Nam Yunxi)"
                >
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Giọng: {aiVoiceGender === "female" ? "Nữ (Tiểu Ngữ)" : "Nam (Tiểu Hi)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoListen((prev) => !prev)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                    autoListen
                      ? "bg-emerald-700 text-white"
                      : "bg-[#FAF7F0] text-slate-600 border border-[#E5DEC9] hover:bg-white"
                  }`}
                  title="Khi bạn nói đạt điểm, AI sẽ tự phát âm câu tiếp theo và tự mở micro cho bạn"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Thoại 2 chiều: {autoListen ? "Tự động (BẬT)" : "Bấm nút (TẮT)"}</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Thêm câu thoại mới vào đoạn hội thoại"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Thêm câu thoại mới</span>
                </button>
              </div>
            </div>

            {/* Danh sách câu thoại tuần tự */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {dialogueLines.map((line, idx) => {
                const isCurrent = currentLineIdx === idx;
                const isMine = line.speaker === myRole;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentLineIdx(idx);
                      setCheckResult(null);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-50/70 border-amber-300 shadow-xs"
                        : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isMine
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#204434] text-white"
                          }`}
                        >
                          {line.speaker} {isMine && "(Vai của bạn)"}
                        </span>
                        <span className="text-[11px] font-mono text-[#8F6D3B]">{line.pinyin}</span>
                      </div>
                      <p className="font-serif font-bold text-base text-[#204434]">{line.zh}</p>
                      <p className="text-xs text-[#315E48]">{line.vi}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(line.zh);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(idx);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] cursor-pointer"
                        title="Sửa câu thoại này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLine(idx);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ô tương tác nói câu hiện tại */}
            <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#8F6D3B] block">
                  {isMyTurn ? "👉 Đến lượt bạn nói:" : `🤖 AI đang nói (${currentLine?.speaker}):`}
                </span>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] block">
                  {currentLine?.zh}
                </span>
                <span className="text-sm font-mono font-bold text-[#8F6D3B] block">
                  {currentLine?.pinyin}
                </span>
                <p className="text-xs text-[#315E48]">{currentLine?.vi}</p>
              </div>

              {/* Nút bấm hành động đối đáp hai chiều */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => speakText(currentLine?.zh || "")}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#F3EEDD] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Nghe lại phát âm câu này"
                >
                  <Volume2 className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Nghe giọng mẫu</span>
                </button>

                {isMyTurn ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording || checking}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-[#204434] hover:bg-[#183629] text-white"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isRecording ? "Đang lắng nghe bạn..." : "Bấm Micro để nói câu này"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAiSpeakCurrentLine}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition bg-amber-600 hover:bg-amber-700 text-white"
                    title="AI đọc câu này và tự động chuyển lượt cho bạn nói tiếp"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Bấm để AI đối đáp câu này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CHẾ ĐỘ 2: NHẬP VAI TÌNH HUỐNG ĐỜI THỰC CÓ NHIỆM VỤ (SCENARIO MISSIONS) */}
        {/* =================================================================== */}
        {talkMode === "SCENARIO" && (
          <div className="space-y-3.5">
            {/* Thanh chọn 5 kịch bản tình huống */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#8F6D3B] block">
                Chọn một tình huống thực tế để nhập vai và rèn luyện phản xạ:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {ROLEPLAY_SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc)}
                      className={`px-3 py-2 rounded-2xl border text-left transition shrink-0 flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-400"
                          : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                      }`}
                    >
                      <span className="text-xl">{sc.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#204434] font-serif">{sc.title}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#8F6D3B] font-bold">
                            {sc.level}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Vai của bạn: {sc.studentRole}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bảng nhiệm vụ của tình huống đang chọn */}
            <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-[#FAF7F0] rounded-2xl border border-amber-200/90 space-y-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedScenario.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#204434]">{selectedScenario.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {selectedScenario.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Vai của bạn: <strong>{selectedScenario.studentRole}</strong> · AI đóng vai: <strong>{selectedScenario.aiRole}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-[#204434]">
                      Nhiệm vụ: {completedMissions.length}/{selectedScenario.missions.length}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectScenario(selectedScenario)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Bắt đầu lại tình huống này"
                  >
                    <RotateCcw className="w-3 h-3" /> Bắt đầu lại
                  </button>
                </div>
              </div>

              {/* Danh sách 3 nhiệm vụ với trạng thái & nút xem câu mẫu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {selectedScenario.missions.map((m, idx) => {
                  const isDone = completedMissions.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border transition flex flex-col justify-between text-xs space-y-1.5 ${
                        isDone
                          ? "bg-emerald-50/90 border-emerald-300 text-emerald-900"
                          : "bg-white border-[#E5DEC9] text-[#204434]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3 text-white" /> : idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <p className={`font-bold text-[11px] ${isDone ? "line-through text-emerald-800" : "text-[#204434]"}`}>
                            {m.title}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-tight">{m.description}</p>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-100 mt-1">
                        <span className="text-[10px] font-bold text-amber-700">
                          {isDone ? "✅ Đã đạt" : "Chưa hoàn thành"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveHintMission(m)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 underline font-semibold cursor-pointer"
                        >
                          Gợi ý câu
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner chúc mừng khi hoàn thành cả 3 nhiệm vụ */}
            {showCelebration && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-[#204434] text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-lg">
                    🏆
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm">Xuất sắc! Bạn đã hoàn thành toàn bộ nhiệm vụ tình huống!</h5>
                    <p className="text-xs text-emerald-100">Khả năng phản xạ và ứng biến rất tự nhiên · Đã thưởng +30 XP vào hồ sơ của bạn!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
                >
                  Tiếp tục trò chuyện
                </button>
              </div>
            )}

            {/* Khung chat tình huống */}
            <div
              ref={chatContainerRef}
              className="space-y-3.5 min-h-[220px] max-h-[300px] overflow-y-auto p-4 bg-white rounded-3xl border border-[#E5DEC9] shadow-inner"
            >
              {scenarioChatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "STUDENT" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                      msg.sender === "STUDENT"
                        ? "bg-[#204434] text-white"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {msg.sender === "STUDENT" ? "Bạn" : "AI"}
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                      msg.sender === "STUDENT"
                        ? "bg-[#204434] text-white rounded-tr-none"
                        : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-serif font-bold text-base block">{msg.zh}</span>
                      {msg.sender === "AI" && (
                        <button
                          onClick={() => speakText(msg.zh)}
                          className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-[#204434] transition shrink-0"
                          title="Nghe lại phát âm của AI"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {msg.pinyin && (
                      <span className="font-mono text-[11px] block text-emerald-700 font-medium">
                        {msg.pinyin}
                      </span>
                    )}
                    {msg.vi && (
                      <p className="text-[11px] text-slate-600 font-sans italic">{msg.vi}</p>
                    )}

                    {msg.score && (
                      <div className="pt-1 text-[10px] text-amber-300 font-bold border-t border-white/20 mt-1 flex items-center justify-between">
                        <span>Điểm phát âm: {msg.score}/100đ</span>
                        {msg.vocab && msg.vocab.length > 0 && (
                          <span className="text-[9px] opacity-80">
                            Tra được {msg.vocab.length} từ điển
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {checking && (
                <div className="flex items-start gap-2.5 flex-row animate-fadeIn">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs bg-amber-100 text-amber-800 border border-amber-200">
                    AI
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-xs flex items-center gap-2 shadow-2xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="italic text-slate-600 font-sans">
                      {selectedScenario.aiRole} đang đối đáp cùng bạn...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thanh điều khiển âm giọng & thoại 2 chiều */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiVoiceGender(aiVoiceGender === "female" ? "male" : "female")}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0] shadow-2xs"
                  title="Đổi giọng đọc AI (Giọng Nữ Xiaoxiao / Giọng Nam Yunxi)"
                >
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Giọng: {aiVoiceGender === "female" ? "Nữ (Tiểu Ngữ)" : "Nam (Tiểu Hi)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoListen((prev) => !prev)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                    autoListen
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                  }`}
                  title="Khi AI nói xong, micro sẽ tự động mở để bạn tiếp tục trò chuyện rảnh tay mà không cần bấm nút"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Thoại 2 chiều: {autoListen ? "Tự động (BẬT)" : "Bấm nút (TẮT)"}</span>
                </button>
              </div>

              {currentSuggestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] hover:bg-[#F3EEDD] border border-[#E5DEC9] text-[#204434] transition shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showSuggestions ? "Ẩn gợi ý đối đáp" : "💡 Gợi ý đối đáp & Ngữ pháp"}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
                    {currentSuggestions.length}
                  </span>
                  {showSuggestions ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              )}
            </div>

            {/* Panel gợi ý chi tiết nếu mở */}
            {showSuggestions && currentSuggestions.length > 0 && (
              <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-2 animate-fadeIn">
                <span className="text-[11px] font-bold text-[#8F6D3B] block">
                  Gợi ý câu đối đáp phù hợp với tình huống này:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {currentSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSendTypedText(sug.zh);
                        setShowSuggestions(false);
                      }}
                      disabled={checking || isRecording}
                      className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-left transition shadow-2xs group cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-xs text-[#204434] group-hover:text-amber-800">
                          {sug.zh}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">
                          Chọn
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#8F6D3B]">{sug.pinyin}</p>
                      <p className="text-[10px] text-slate-600 italic">{sug.vi}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Khung nhập văn bản hoặc thu âm bằng Micro */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendTypedText();
                  }}
                  placeholder={`Đóng vai ${selectedScenario.studentRole}: nói hoặc gõ câu trả lời...`}
                  disabled={checking || isRecording}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs text-[#204434] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#204434] transition shadow-2xs font-medium"
                />
              </div>

              <button
                onClick={() => handleSendTypedText()}
                disabled={!typedText.trim() || checking || isRecording}
                className="px-4 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>

              <button
                onClick={handleStartRecording}
                disabled={isRecording || checking}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                }`}
                title="Nói bằng giọng nói qua Microphone"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRecording ? "Đang nghe..." : "Nói Micro"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CHẾ ĐỘ 3: TRÒ CHUYỆN TỰ DO KHÔNG GIỚI HẠN CHỦ ĐỀ                    */}
        {/* =================================================================== */}
        {talkMode === "FREE_TALK" && (
          <div className="space-y-3.5">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-[#8F6D3B] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Trò chuyện tự nhiên cùng <strong>AI Tiểu Ngữ (Qwen/Gemini)</strong>: Đối đáp linh hoạt 2 chiều, phân tích ngữ pháp và sửa lỗi chi tiết.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiVoiceGender(aiVoiceGender === "female" ? "male" : "female")}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0] shadow-2xs"
                  title="Đổi giọng đọc AI (Giọng Nữ Xiaoxiao / Giọng Nam Yunxi)"
                >
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Giọng: {aiVoiceGender === "female" ? "Nữ (Tiểu Ngữ)" : "Nam (Tiểu Hi)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoListen((prev) => !prev)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                    autoListen
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                  }`}
                  title="Khi AI nói xong, micro sẽ tự động mở để bạn tiếp tục trò chuyện rảnh tay mà không cần bấm nút"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Thoại 2 chiều: {autoListen ? "Tự động nghe (BẬT)" : "Bấm nút (TẮT)"}</span>
                </button>

                {freeChatHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setFreeChatHistory([]);
                      setCheckResult(null);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Xóa lịch sử và bắt đầu cuộc trò chuyện mới"
                  >
                    <RotateCcw className="w-3 h-3" /> Bắt đầu lại
                  </button>
                )}
              </div>
            </div>

            {/* Khung chat cuộn mượt mà */}
            <div
              ref={chatContainerRef}
              className="space-y-3.5 min-h-[220px] max-h-[300px] overflow-y-auto p-4 bg-white rounded-3xl border border-[#E5DEC9] shadow-inner"
            >
              {freeChatHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#315E48] space-y-2">
                  <div className="text-3xl">🤖💬</div>
                  <p className="font-bold text-sm text-[#204434]">
                    Chào bạn! Tôi là Tiểu Ngữ, rất vui được luyện khẩu ngữ cùng bạn.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Bạn có thể bấm vào Micro để nói chuyện trực tiếp, hoặc gõ phím bên dưới. AI sẽ tự động lắng nghe và phản hồi liên tục!
                  </p>
                </div>
              ) : (
                freeChatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "STUDENT" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                        msg.sender === "STUDENT"
                          ? "bg-[#204434] text-white"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {msg.sender === "STUDENT" ? "Me" : "AI"}
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                        msg.sender === "STUDENT"
                          ? "bg-[#204434] text-white rounded-tr-none"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-serif font-bold text-base block">{msg.zh}</span>
                        {msg.sender === "AI" && (
                          <button
                            onClick={() => speakText(msg.zh)}
                            className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-[#204434] transition shrink-0"
                            title="Nghe lại phát âm của AI"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {msg.pinyin && (
                        <span className="font-mono text-[11px] block text-emerald-700 font-medium">
                          {msg.pinyin}
                        </span>
                      )}
                      {msg.vi && (
                        <p className="text-[11px] text-slate-600 font-sans italic">{msg.vi}</p>
                      )}

                      {msg.score && (
                        <div className="pt-1 text-[10px] text-amber-300 font-bold border-t border-white/20 mt-1 flex items-center justify-between">
                          <span>Điểm phát âm: {msg.score}/100đ</span>
                          {msg.vocab && msg.vocab.length > 0 && (
                            <span className="text-[9px] opacity-80">
                              Tra được {msg.vocab.length} từ điển
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {checking && (
                <div className="flex items-start gap-2.5 flex-row animate-fadeIn">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs bg-amber-100 text-amber-800 border border-amber-200">
                    AI
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-xs flex items-center gap-2 shadow-2xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="italic text-slate-600 font-sans">
                      Tiểu Ngữ đang suy nghĩ và đối đáp cùng bạn...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thanh bật / tắt gợi ý đối đáp & ngữ pháp (Không hiển thị tràn lan vô ích) */}
            {currentSuggestions.length > 0 && (
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSuggestions((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7F0] hover:bg-[#F3EEDD] border border-[#E5DEC9] text-[#204434] transition shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showSuggestions ? "Ẩn gợi ý đối đáp & Ngữ pháp" : "💡 Xem gợi ý câu đối đáp & Cấu trúc ngữ pháp"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
                      {currentSuggestions.length}
                    </span>
                    {showSuggestions ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                    {autoListen ? "🎙️ Chế độ tự động nghe đang hoạt động" : "💡 Nhấn micro hoặc gõ phím để tiếp tục"}
                  </span>
                </div>

                {/* Panel gợi ý chi tiết kèm cấu trúc ngữ pháp và giải thích ngữ cảnh */}
                {showSuggestions && (
                  <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-3 animate-fadeIn">
                    {checkResult && (checkResult.grammarCorrection || checkResult.grammarTip) && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200/90 text-xs space-y-2 shadow-2xs">
                        {checkResult.grammarCorrection && (
                          <div className="flex items-start gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px] shrink-0 mt-0.5">
                              Sửa câu & Trật tự từ
                            </span>
                            <span className="font-serif font-bold text-sm text-[#204434]">
                              {checkResult.grammarCorrection}
                            </span>
                          </div>
                        )}
                        {checkResult.grammarTip && (
                          <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 mt-0.5">
                              Cấu trúc trọng tâm
                            </span>
                            <p className="text-slate-700 leading-relaxed font-sans">
                              {checkResult.grammarTip}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#8F6D3B] block">
                        Chọn một câu bên dưới để đối đáp tự nhiên và áp dụng cấu trúc ngữ pháp:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        {currentSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleSendTypedText(sug.zh);
                              setShowSuggestions(false);
                            }}
                            disabled={checking || isRecording}
                            className="p-3 rounded-2xl bg-white hover:bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 text-left transition shadow-2xs group cursor-pointer flex flex-col justify-between space-y-2"
                            title="Bấm để chọn câu đối đáp này"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-serif font-bold text-sm text-[#204434] group-hover:text-amber-800">
                                  {sug.zh}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold shrink-0">
                                  Chọn
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-[#8F6D3B]">{sug.pinyin}</p>
                              <p className="text-[11px] text-slate-600 font-sans italic">{sug.vi}</p>
                            </div>

                            {(sug.grammarStructure || sug.explanation) && (
                              <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1">
                                {sug.grammarStructure && (
                                  <div className="text-emerald-800 font-medium leading-snug">
                                    <span className="font-bold text-[#204434]">Cấu trúc: </span>
                                    <code className="bg-emerald-50 text-emerald-900 px-1 py-0.5 rounded text-[10px] font-mono">
                                      {sug.grammarStructure}
                                    </code>
                                  </div>
                                )}
                                {sug.explanation && (
                                  <p className="text-slate-600 leading-snug">
                                    <span className="font-bold text-slate-700">Ngữ cảnh: </span>
                                    {sug.explanation}
                                  </p>
                                )}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Khung nhập văn bản hoặc thu âm bằng Micro */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendTypedText();
                  }}
                  placeholder="Gõ tiếng Trung để trò chuyện hoặc bấm micro..."
                  disabled={checking || isRecording}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs text-[#204434] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#204434] transition shadow-2xs font-medium"
                />
              </div>

              <button
                onClick={() => handleSendTypedText()}
                disabled={!typedText.trim() || checking || isRecording}
                className="px-4 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>

              <button
                onClick={handleStartRecording}
                disabled={isRecording || checking}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                }`}
                title="Nói bằng giọng nói qua Microphone"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRecording ? "Đang nghe..." : "Nói Micro"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* KẾT QUẢ ĐỐI CHIẾU KHO TỪ ĐIỂN & CHẤM ĐIỂM AI */}
        {checkResult && (
          <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] shadow-xs space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-[#204434]">
                  Kết quả đối chiếu Kho từ điển & Phát âm AI:
                </span>
              </div>
              <span className="font-bold text-emerald-700 text-sm">
                {checkResult.score}/100đ
              </span>
            </div>

            <p className="text-[#315E48] font-medium leading-relaxed">{checkResult.feedback}</p>

            {/* Sửa câu & Trật tự từ */}
            {checkResult.grammarCorrection && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  Sửa lỗi diễn đạt & Trật tự từ chuẩn:
                </span>
                <p className="text-amber-900 font-serif text-sm font-semibold">
                  {checkResult.grammarCorrection}
                </p>
              </div>
            )}

            {/* Cấu trúc ngữ pháp áp dụng */}
            {checkResult.grammarTip && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  Cấu trúc ngữ pháp áp dụng:
                </span>
                <p className="text-emerald-900 text-xs leading-relaxed font-sans">
                  {checkResult.grammarTip}
                </p>
              </div>
            )}

            {/* Danh sách từ vựng tra cứu được trong câu */}
            {checkResult.vocabDetected && checkResult.vocabDetected.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#8F6D3B]">
                  Từ vựng nhận diện trong câu từ Kho Từ Điển ({checkResult.vocabDetected.length} từ):
                </span>
                <div className="flex flex-wrap gap-2">
                  {checkResult.vocabDetected.map((v: any, vIdx: number) => (
                    <div
                      key={vIdx}
                      className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center gap-1.5"
                    >
                      <strong className="font-serif text-[#204434]">{v.hanzi}</strong>
                      <span className="font-mono text-[#8F6D3B] text-[10px]">({v.pinyin})</span>
                      <span className="text-[10px] text-[#315E48]">: {v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Thêm / Sửa câu thoại */}
        {isEditingLine && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-md border border-[#E5DEC9] shadow-2xl space-y-3">
              <h4 className="font-serif font-bold text-base text-[#204434]">
                {editingIndex !== null ? "Chỉnh sửa câu thoại" : "Thêm câu thoại mới vào bài"}
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Người nói / Nhân vật:</label>
                  <input
                    type="text"
                    value={editSpeaker}
                    onChange={(e) => setEditSpeaker(e.target.value)}
                    placeholder="Ví dụ: 王老师, 学生, 小语, Tôi..."
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Câu thoại Chữ Hán:</label>
                  <input
                    type="text"
                    value={editZh}
                    onChange={(e) => setEditZh(e.target.value)}
                    placeholder="Ví dụ: 你好，请问这个多少钱？"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Phiên âm Pinyin:</label>
                  <input
                    type="text"
                    value={editPinyin}
                    onChange={(e) => setEditPinyin(e.target.value)}
                    placeholder="Ví dụ: Nǐ hǎo, qǐngwèn zhège duōshao qián?"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Nghĩa tiếng Việt:</label>
                  <input
                    type="text"
                    value={editVi}
                    onChange={(e) => setEditVi(e.target.value)}
                    placeholder="Ví dụ: Xin chào, xin hỏi cái này bao nhiêu tiền?"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditingLine(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveDialogueLine}
                  className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Lưu câu thoại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gợi ý câu mẫu cho nhiệm vụ tình huống */}
        {activeHintMission && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-[#E5DEC9] shadow-2xl space-y-3 animate-scaleUp">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Gợi ý câu mẫu nhiệm vụ
                </span>
                <button
                  onClick={() => setActiveHintMission(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <h5 className="font-serif font-bold text-sm text-[#204434]">{activeHintMission.title}</h5>
                <p className="text-xs text-slate-600">{activeHintMission.description}</p>

                <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-1 mt-2">
                  <span className="font-serif font-bold text-base text-[#204434] block">
                    {activeHintMission.hintZh}
                  </span>
                  <span className="font-mono text-xs text-[#8F6D3B] block">
                    {activeHintMission.hintPinyin}
                  </span>
                  <p className="text-xs text-slate-600 italic">
                    {activeHintMission.hintVi}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => speakText(activeHintMission.hintZh)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" /> Nghe
                </button>
                <button
                  onClick={() => {
                    handleSendTypedText(activeHintMission.hintZh);
                    setActiveHintMission(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold cursor-pointer"
                >
                  Chọn câu này để nói
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
          <span className="text-xs text-[#315E48]">
            HSK {hskLevel} · Bài {lessonNumber} · Luyện tập phản xạ trực tiếp
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
