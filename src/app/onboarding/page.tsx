"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Layers,
  Award,
  Check,
  Search,
  AlertCircle,
  HelpCircle,
  Building,
  Target,
} from "lucide-react";

type LearningMode = "SELF" | "CLASS";
type MainTrack = "hsk" | "topic" | "major";
type MajorType = "kinhte" | "ketoan" | "cntt" | "khac";
type CurrentLevel = "beginner" | "intermediate" | "advanced";
type DailyTime = 15 | 30 | 60;

interface ClassInfo {
  id: string;
  name: string;
  level: number;
  description: string;
  code: string;
  teacherName: string;
  teacherAvatar: string;
  teacherEmail: string;
  studentCount: number;
}

interface PlacementQuestion {
  id: number;
  questionZh: string;
  pinyin: string;
  questionVi: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const HSK1_3_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    questionZh: "请问，这本词典是______的？",
    pinyin: "Qǐngwèn, zhè běn cídiǎn shì ______ de?",
    questionVi: "Xin hỏi, cuốn từ điển này là của ______?",
    options: ["谁 (Ai)", "哪 (Nào)", "什么 (Cái gì)", "怎么 (Thế nào)"],
    correctIndex: 0,
    explanation: "'谁' (shéi/shuí) là đại từ nghi vấn chỉ người, '是谁的' có nghĩa là 'của ai'."
  },
  {
    id: 2,
    questionZh: "外面下大雨了，你______带一把伞吧。",
    pinyin: "Wàimiàn xià dàyǔ le, nǐ ______ dài yì bǎ sǎn ba.",
    questionVi: "Ngoài trời mưa to rồi, bạn ______ mang theo một chiếc ô đi.",
    options: ["最好 (Tốt nhất nên)", "常常 (Thường xuyên)", "正在 (Đang)", "已经 (Đã)"],
    correctIndex: 0,
    explanation: "'最好' dùng để đưa ra lời khuyên nhủ, đề xuất tích cực."
  },
  {
    id: 3,
    questionZh: "今天的天气比昨天______得多。",
    pinyin: "Jīntiān de tiānqì bǐ zuótiān ______ de duō.",
    questionVi: "Thời tiết hôm nay so với hôm qua ______ hơn nhiều.",
    options: ["冷 (Lạnh)", "很冷 (Rất lạnh)", "太冷 (Quá lạnh)", "非常冷 (Cực kỳ lạnh)"],
    correctIndex: 0,
    explanation: "Trong câu so sánh chữ 比 (A + 比 + B + Tính từ + 得多), tính từ không đi kèm phó từ chỉ mức độ."
  },
  {
    id: 4,
    questionZh: "老师走进教室，把书包______桌子上。",
    pinyin: "Lǎoshī zǒujìn jiàoshì, bǎ shūbāo ______ zhuōzi shang.",
    questionVi: "Thầy giáo bước vào lớp, ______ cặp sách lên bàn.",
    options: ["放在 (Đặt lên)", "坐在 (Ngồi ở)", "看着 (Nhìn)", "听见 (Nghe thấy)"],
    correctIndex: 0,
    explanation: "Cấu trúc câu chữ 把: 把 + Tân ngữ + Động từ + 在 + Nơi chốn."
  },
  {
    id: 5,
    questionZh: "他______汉语说得流利，______汉字也写得很漂亮。",
    pinyin: "Tā ______ hànyǔ shuō de liúlì, ______ hànzì yě xiě de hěn piàoliang.",
    questionVi: "Anh ấy ______ tiếng Hán nói lưu loát, ______ chữ Hán viết cũng rất đẹp.",
    options: ["不但……而且…… (Không những... mà còn...)", "虽然……但是…… (Mặc dù... nhưng...)", "因为……所以…… (Bởi vì... cho nên...)", "如果……就…… (Nếu... thì...)"],
    correctIndex: 0,
    explanation: "Cặp liên từ tăng tiến '不但……而且……' (Không những... mà còn...)."
  }
];

const HSK4_6_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    questionZh: "请大家抓紧时间，在会议开始前把这些材料______好。",
    pinyin: "Qǐng dàjiā zhuājǐn shíjiān, zài huìyì kāishǐ qián bǎ zhèxiē cáiliào ______ hǎo.",
    questionVi: "Xin mọi người tranh thủ thời gian, trước khi cuộc họp bắt đầu hãy ______ tài liệu này thật tốt.",
    options: ["准备 (Chuẩn bị)", "考虑 (Cân nhắc)", "安排 (Sắp xếp)", "打印 (In ấn)"],
    correctIndex: 0,
    explanation: "'准备好材料' (Chuẩn bị xong tài liệu), '好' làm bổ ngữ kết quả biểu thị hoàn thành mỹ mãn."
  },
  {
    id: 2,
    questionZh: "______工作有多忙，他每天晚上______坚持读书半小时。",
    pinyin: "______ gōngzuò yǒu duō máng, tā měitiān wǎnshang ______ jiānchí dúshū bàn xiǎoshí.",
    questionVi: "______ công việc có bận thế nào, anh ấy mỗi tối ______ kiên trì đọc sách nửa tiếng.",
    options: ["不管……都…… (Cho dù... đều...)", "尽管……还是…… (Dẫu rằng... vẫn...)", "只有……才…… (Chỉ có... mới...)", "既然……就…… (Đã... thì...)"],
    correctIndex: 0,
    explanation: "'不管 + đại từ nghi vấn (有多忙) + 都...' biểu thị điều kiện vô điều kiện."
  },
  {
    id: 3,
    questionZh: "为了按时完成重点项目，两家公司进行了极其______的合作。",
    pinyin: "Wèile ànshí wánchéng zhòngdiǎn xiàngmù, liǎng jiā gōngsī jìnxíng le jíqí ______ de hézuò.",
    questionVi: "Để hoàn thành dự án trọng điểm đúng hạn, hai công ty đã tiến hành hợp tác vô cùng ______.",
    options: ["密切 (Chặt chẽ/Mật thiết)", "亲密 (Thân mật)", "亲切 (Thân thiết/Gần gũi)", "热情 (Nhiệt tình)"],
    correctIndex: 0,
    explanation: "'密切合作' là cụm cố định trong văn phong công việc/kinh tế, mang nghĩa hợp tác chặt chẽ."
  },
  {
    id: 4,
    questionZh: "随着科技的飞速发展，人工智能在医疗领域发挥着______重要的作用。",
    pinyin: "Suízhe kējì de fēisù fāzhǎn, réngōng zhìnéng zài yīliáo lǐngyù fāhuī zhe ______ zhòngyào de zuòyòng.",
    questionVi: "Cùng với sự phát triển nhanh chóng của công nghệ, AI trong y tế phát huy vai trò ______ quan trọng.",
    options: ["日益 (Ngày một / Ngày càng)", "常常 (Thường)", "稍微 (Hơi/Một chút)", "偶尔 (Thỉnh thoảng)"],
    correctIndex: 0,
    explanation: "'日益' (rìyì) là phó từ văn viết trang trọng, biểu thị mức độ gia tăng theo từng ngày."
  },
  {
    id: 5,
    questionZh: "大家集思广益，困扰团队多日的难题终于______。",
    pinyin: "Dàjiā jísīguǎngyì, kùnrǎo tuánduì duō rì de nántí zhōngyú ______.",
    questionVi: "Mọi người cùng nhau góp trí tuệ, câu hỏi khó làm đau đầu nhóm nhiều ngày cuối cùng cũng ______.",
    options: ["迎刃而解 (Được giải quyết êm xuôi)", "莫名其妙 (Kỳ lạ khó hiểu)", "画蛇添足 (Vẽ rắn thêm chân)", "半途而废 (Bỏ dở giữa chừng)"],
    correctIndex: 0,
    explanation: "'迎刃而解' là thành ngữ 4 chữ biểu thị vấn đề nan giải được tháo gỡ dứt điểm và dễ dàng."
  }
];

export default function OnboardingPage() {
  const router = useRouter();

  // Multi-step State (Step 1 = Screen 4, Step 2 = Screen 5, Step 3 = Screen 6)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // User State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Step 1: Learning Mode
  const [learningMode, setLearningMode] = useState<LearningMode>("SELF");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [verifiedClass, setVerifiedClass] = useState<ClassInfo | null>(null);
  const [classCodeError, setClassCodeError] = useState("");

  // Step 2: Target & Goal Settings
  const [mainTrack, setMainTrack] = useState<MainTrack>("hsk");
  const [major, setMajor] = useState<MajorType>("kinhte");
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>("beginner");
  const [dailyTime, setDailyTime] = useState<DailyTime>(30);

  // Placement Test State
  const [placementAnswers, setPlacementAnswers] = useState<Record<number, number>>({});
  const [placementSubmitted, setPlacementSubmitted] = useState(false);
  const [placementScore, setPlacementScore] = useState(0);
  const [determinedHskLevel, setDeterminedHskLevel] = useState(1);
  const [trackNotice, setTrackNotice] = useState<string | null>(null);

  // Step 3: Submission Loading
  const [submitting, setSubmitting] = useState(false);
  const [adminRoadmapStages, setAdminRoadmapStages] = useState<any[]>([]);

  // Tải cấu hình lộ trình do Admin thiết lập trong CSDL
  useEffect(() => {
    fetch("/api/v1/self-study-roadmap")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stages) && data.stages.length > 0) {
          setAdminRoadmapStages(data.stages);
        }
      })
      .catch(() => {});
  }, []);

  // Khôi phục trạng thái dở dang khi bị mất mạng hoặc tải lại trang
  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }

      const savedStep = localStorage.getItem("hanyu_onboarding_step");
      if (savedStep && ["1", "2", "3"].includes(savedStep)) {
        setStep(Number(savedStep) as 1 | 2 | 3);
      }

      const draftRaw = localStorage.getItem("hanyu_onboarding_draft");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft.learningMode) setLearningMode(draft.learningMode);
        if (draft.mainTrack) setMainTrack(draft.mainTrack);
        if (draft.currentLevel) setCurrentLevel(draft.currentLevel);
        if (draft.dailyTime) setDailyTime(draft.dailyTime);
        if (draft.placementAnswers) setPlacementAnswers(draft.placementAnswers);
        if (draft.placementSubmitted) setPlacementSubmitted(draft.placementSubmitted);
        if (draft.placementScore !== undefined) setPlacementScore(draft.placementScore);
        if (draft.determinedHskLevel) setDeterminedHskLevel(draft.determinedHskLevel);
      }
    } catch {}
  }, []);

  // Tự động lưu tiến trình dở dang để bảo vệ học viên khi bị rớt mạng
  const saveDraft = (overrides: Record<string, any> = {}) => {
    try {
      const currentDraft = {
        step,
        learningMode,
        mainTrack,
        currentLevel,
        dailyTime,
        placementAnswers,
        placementSubmitted,
        placementScore,
        determinedHskLevel,
        ...overrides,
      };
      localStorage.setItem("hanyu_onboarding_draft", JSON.stringify(currentDraft));
      localStorage.setItem("hanyu_onboarding_step", String(overrides.step || step));
    } catch {}
  };

  // Chọn cấp độ
  const handleSelectLevel = (level: CurrentLevel) => {
    setCurrentLevel(level);
    setPlacementAnswers({});
    setPlacementSubmitted(false);

    let defaultHsk = 1;
    if (level === "intermediate") defaultHsk = 2;
    if (level === "advanced") defaultHsk = 4;
    setDeterminedHskLevel(defaultHsk);

    saveDraft({
      currentLevel: level,
      placementAnswers: {},
      placementSubmitted: false,
      determinedHskLevel: defaultHsk,
    });
  };

  // Nộp bài kiểm tra năng lực
  const handleSubmitPlacementTest = () => {
    const questions = currentLevel === "intermediate" ? HSK1_3_QUESTIONS : HSK4_6_QUESTIONS;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (placementAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    setPlacementScore(correct);
    setPlacementSubmitted(true);

    let assignedLevel = 1;
    if (currentLevel === "intermediate") {
      if (correct >= 4) assignedLevel = 3;
      else if (correct >= 2) assignedLevel = 2;
      else assignedLevel = 1;
    } else if (currentLevel === "advanced") {
      if (correct >= 4) assignedLevel = 5;
      else if (correct >= 2) assignedLevel = 4;
      else assignedLevel = 3;
    }

    setDeterminedHskLevel(assignedLevel);
    saveDraft({
      placementSubmitted: true,
      placementScore: correct,
      determinedHskLevel: assignedLevel,
    });
  };

  // Check Class Code
  const handleVerifyClassCode = async () => {
    const code = classCodeInput.trim();
    if (!code) {
      setClassCodeError("Vui lòng nhập mã lớp học.");
      return;
    }

    setCheckingCode(true);
    setClassCodeError("");
    setVerifiedClass(null);

    try {
      const res = await fetch(`/api/v1/classes/verify?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setClassCodeError(data.message || "Mã lớp không hợp lệ hoặc lớp không tồn tại.");
        setCheckingCode(false);
        return;
      }

      setVerifiedClass(data.classInfo);
      setCheckingCode(false);
    } catch {
      setClassCodeError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setCheckingCode(false);
    }
  };

  // Complete Onboarding & Save Profile
  const handleFinishOnboarding = async () => {
    setSubmitting(true);

    const payload = {
      username: currentUser?.username || "student",
      learningMode: "SELF",
      mainTrack: "hsk",
      currentLevel,
      currentHskLevel: determinedHskLevel,
      dailyTime,
    };

    try {
      await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
      
      const profileData = {
        ...payload,
        completedAt: new Date().toISOString(),
      };
      
      localStorage.setItem("hanyu_study_profile", JSON.stringify(profileData));
      if (currentUser?.id) {
        localStorage.setItem(`hanyu_onboarding_${currentUser.id}`, "true");
      }
      localStorage.setItem("hanyu_onboarding_completed", "true");

      // Xóa draft trạng thái dở dang vì đã hoàn thành
      localStorage.removeItem("hanyu_onboarding_step");
      localStorage.removeItem("hanyu_onboarding_draft");

      if (currentUser) {
        const updated = {
          ...currentUser,
          currentHskLevel: determinedHskLevel,
          learningMode: "SELF",
          hasEnrolledClasses: false,
        };
        localStorage.setItem("currentUser", JSON.stringify(updated));
      }

      // ĐIỀU HƯỚNG TRỰC TIẾP VÀO PHÒNG TỰ HỌC VÀ LỘ TRÌNH VƯỢT ẢI ĐÃ LÀM
      router.push(`/s/home?tab=practice&hsk=${determinedHskLevel}`);
    } catch (err) {
      router.push("/s/home?tab=practice");
    } finally {
      setSubmitting(false);
    }
  };

  // Xác nhận tham gia lớp: BẮT BUỘC PHẢI CÓ MÃ LỚP ĐƯỢC XÁC THỰC
  const handleConfirmClassDirectly = async () => {
    if (!verifiedClass) {
      setClassCodeError("Vui lòng nhập mã lớp và bấm 'Kiểm tra mã lớp' trước khi xác nhận.");
      return;
    }

    setSubmitting(true);
    setLearningMode("CLASS");

    const payload = {
      username: currentUser?.username || "student",
      learningMode: "CLASS",
      classCode: verifiedClass.code || classCodeInput.trim(),
      classId: verifiedClass.id,
      mainTrack: "hsk",
      major: null,
      currentLevel: verifiedClass.level === 1 ? "beginner" : verifiedClass.level <= 3 ? "intermediate" : "advanced",
      dailyTime: 30,
    };

    try {
      await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      const profileData = {
        ...payload,
        classInfo: verifiedClass,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem("hanyu_study_profile", JSON.stringify(profileData));
      if (currentUser?.id) {
        localStorage.setItem(`hanyu_onboarding_${currentUser.id}`, "true");
      }
      localStorage.setItem("hanyu_onboarding_completed", "true");
      localStorage.removeItem("hanyu_onboarding_step");
      localStorage.removeItem("hanyu_onboarding_draft");

      if (currentUser) {
        const updated = {
          ...currentUser,
          currentHskLevel: verifiedClass.level || 1,
          hasEnrolledClasses: true,
        };
        localStorage.setItem("currentUser", JSON.stringify(updated));
      }

      router.push("/s/home?tab=classes");
    } catch (err) {
      router.push("/s/home");
    } finally {
      setSubmitting(false);
    }
  };

  // Content generation for Step 3 based on selection
  const getRoadmapPhases = () => {
    if (mainTrack === "hsk") {
      if (adminRoadmapStages.length > 0) {
        return adminRoadmapStages.map((st) => ({
          phase: `Giai đoạn ${st.step}`,
          title: st.title,
          desc: st.desc,
          milestone: (st.badge || "").replace(/^🎯\s*/, "") || "Đạt chuẩn năng lực",
          duration: (st.duration || "").replace(/^Dự kiến\s*/, "") || "2-4 tuần",
        }));
      }
      return [
        {
          phase: "Giai đoạn 1",
          title: "Khởi động & Ngữ âm chuẩn Pinyin",
          desc: "Làm chủ 21 thanh mẫu, 36 vận mẫu, 4 thanh điệu và quy tắc viết 150 chữ Hán đầu tiên.",
          milestone: "Đạt chuẩn phát âm tự nhiên",
          duration: dailyTime === 15 ? "4 tuần" : dailyTime === 30 ? "2 tuần" : "1.5 tuần",
        },
        {
          phase: "Giai đoạn 2",
          title: "Tích lũy 500+ Từ vựng & Ngữ pháp căn bản",
          desc: "Nắm vững các mẫu câu giao tiếp cốt lõi, từ loại, cấu trúc câu vị ngữ động từ, lượng từ thông dụng.",
          milestone: "Giao tiếp cơ bản đời sống",
          duration: dailyTime === 15 ? "6 tuần" : dailyTime === 30 ? "4 tuần" : "2.5 tuần",
        },
        {
          phase: "Giai đoạn 3",
          title: "Rèn phản xạ Nghe - Đọc - Viết chuyên sâu",
          desc: "Luyện nghe bắt từ khóa, đọc hiểu đoạn văn ngắn và rèn tư duy ngữ pháp HSK 3.0 tiêu chuẩn.",
          milestone: "Tự tin với cấu trúc đề mới",
          duration: dailyTime === 15 ? "8 tuần" : dailyTime === 30 ? "5 tuần" : "3 tuần",
        },
        {
          phase: "Giai đoạn 4",
          title: "Luyện đề thực chiến & Tối ưu điểm số",
          desc: "Giải bộ đề thi thử độc quyền, phân tích bẫy đề thi, rà soát sổ câu sai và thi thử bấm giờ.",
          milestone: "Sẵn sàng thi đạt điểm cao",
          duration: dailyTime === 15 ? "4 tuần" : dailyTime === 30 ? "3 tuần" : "2 tuần",
        },
      ];
    }

    if (mainTrack === "topic") {
      return [
        {
          phase: "Giai đoạn 1",
          title: "Phát âm & Giao tiếp mở đầu",
          desc: "Chào hỏi lịch sự, giới thiệu bản thân, xưng hô phù hợp văn hóa Trung Hoa.",
          milestone: "Tự tin mở lời chào",
          duration: dailyTime === 15 ? "3 tuần" : dailyTime === 30 ? "2 tuần" : "1 tuần",
        },
        {
          phase: "Giai đoạn 2",
          title: "Đời sống, Mua sắm & Ẩm thực",
          desc: "Đặt món ăn truyền thống, hỏi đường, trả giá khi đi chợ, sử dụng thanh toán di động.",
          milestone: "Tự chủ sinh hoạt thực tế",
          duration: dailyTime === 15 ? "6 tuần" : dailyTime === 30 ? "4 tuần" : "2 tuần",
        },
        {
          phase: "Giai đoạn 3",
          title: "Du lịch & Trải nghiệm văn hóa",
          desc: "Đặt phòng khách sạn, vé máy bay, tàu cao tốc, giải quyết tình huống phát sinh khi du lịch.",
          milestone: "Vi vu Trung Quốc độc lập",
          duration: dailyTime === 15 ? "6 tuần" : dailyTime === 30 ? "4 tuần" : "2.5 tuần",
        },
        {
          phase: "Giai đoạn 4",
          title: "Giao tiếp công sở & Đàm thoại tự nhiên",
          desc: "Trò chuyện thân mật, trao đổi công việc thường ngày, giữ mối quan hệ bạn bè đối tác.",
          milestone: "Nói lưu loát không ngập ngừng",
          duration: dailyTime === 15 ? "5 tuần" : dailyTime === 30 ? "3 tuần" : "2 tuần",
        },
      ];
    }

    // MainTrack: Major
    const majorNames: Record<MajorType, string> = {
      kinhte: "Kinh tế & Thương mại quốc tế",
      ketoan: "Kế toán - Tài chính doanh nghiệp",
      cntt: "Công nghệ thông tin & Khoa học máy tính",
      khac: "Chuyên ngành học thuật khác",
    };

    return [
      {
        phase: "Giai đoạn 1",
        title: "Thuật ngữ & Ngữ pháp chuyên ngành nền tảng",
        desc: `Nắm vững 300 từ vựng và thuật ngữ cốt lõi ngành ${majorNames[major]}.`,
        milestone: "Đọc hiểu bảng biểu & thuật ngữ",
        duration: dailyTime === 15 ? "4 tuần" : dailyTime === 30 ? "2.5 tuần" : "1.5 tuần",
      },
      {
        phase: "Giai đoạn 2",
        title: "Đọc hiểu tài liệu & Giáo trình chuyên môn",
        desc: "Đọc và tóm tắt bài giảng đại học, giáo trình tiếng Trung chuyên ngành không cần tra cứu nhiều.",
        milestone: "Nắm trọn tài liệu đại học",
        duration: dailyTime === 15 ? "6 tuần" : dailyTime === 30 ? "4 tuần" : "2.5 tuần",
      },
      {
        phase: "Giai đoạn 3",
        title: "Kỹ năng Viết báo cáo & Hợp đồng",
        desc: "Thực hành soạn thảo văn bản học thuật, email kinh doanh, hợp đồng và biên bản chuyên nghiệp.",
        milestone: "Văn phong chuẩn xác",
        duration: dailyTime === 15 ? "6 tuần" : dailyTime === 30 ? "4 tuần" : "3 tuần",
      },
      {
        phase: "Giai đoạn 4",
        title: "Thuyết trình & Đàm phán chuyên sâu",
        desc: "Báo cáo đề án môn học, bảo vệ luận văn hoặc tham gia đàm phán hợp đồng với doanh nghiệp đối tác.",
        milestone: "Sẵn sàng tốt nghiệp & làm việc",
        duration: dailyTime === 15 ? "5 tuần" : dailyTime === 30 ? "3.5 tuần" : "2 tuần",
      },
    ];
  };

  const getTimeBreakdown = () => {
    if (dailyTime === 15) {
      return [
        { label: "Ôn từ vựng flashcard", min: "5 phút", desc: "Hệ thống Leitner lặp lại ngắt quãng" },
        { label: "Bài học mới", min: "7 phút", desc: "1 điểm ngữ pháp hoặc 5 từ mới" },
        { label: "Luyện tập nhanh", min: "3 phút", desc: "3 câu hỏi trắc nghiệm củng cố" },
      ];
    }
    if (dailyTime === 60) {
      return [
        { label: "Ôn tập chuyên sâu", min: "15 phút", desc: "Từ vựng + rà soát câu hỏi sai" },
        { label: "Bài học & Hội thoại", min: "25 phút", desc: "Nội dung bài học, ngữ cảnh và bài đọc" },
        { label: "Luyện đề & Đề thi thử", min: "20 phút", desc: "Luyện nghe, đọc hiểu và phản xạ bài thi" },
      ];
    }
    // Default 30 min
    return [
      { label: "Ôn tập từ cũ & ngữ pháp", min: "10 phút", desc: "Củng cố trí nhớ dài hạn" },
      { label: "Bài học mới", min: "12 phút", desc: "Từ mới, ngữ cảnh và mẫu câu chuẩn" },
      { label: "Luyện tập đa dạng", min: "8 phút", desc: "Trắc nghiệm, nghe và ghép câu" },
    ];
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans flex flex-col justify-between selection:bg-[#204434] selection:text-[#FFFCF6] relative overflow-hidden">
      
      {/* ===================== FULL-BLEED ARTWORK BACKGROUND ===================== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/theme/bg-auth-master.jpg"
          alt="Sơn thủy trà xanh Hanyu"
          fill
          priority
          className="object-cover object-center filter saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5ED]/45 via-[#F8F5ED]/30 to-[#F8F5ED]/65" />
      </div>

      {/* Header */}
      <header className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 2xl:px-16 py-3 2xl:py-5 flex items-center justify-between z-10 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 2xl:gap-3">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-xl bg-[#9D493E] text-[#FFFCF6] flex items-center justify-center font-serif text-base 2xl:text-lg font-bold shadow-sm">
            <span>宁</span>
          </div>
          <div>
            <div className="font-serif font-bold text-lg 2xl:text-xl text-[#204434] tracking-tight drop-shadow-xs">Hanyu</div>
            <div className="text-[10px] 2xl:text-[11px] text-[#315E48] tracking-widest uppercase font-semibold">Thiết lập học tập</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const defaultProfile = {
                learningMode: "SELF",
                mainTrack: "hsk",
                currentLevel: "beginner",
                dailyTime: 30,
                currentHskLevel: 1,
                completedAt: new Date().toISOString(),
              };
              localStorage.setItem("hanyu_study_profile", JSON.stringify(defaultProfile));
              localStorage.setItem("hanyu_onboarding_completed", "true");
              if (currentUser?.id) {
                localStorage.setItem(`hanyu_onboarding_${currentUser.id}`, "true");
              }
              router.push("/s/home");
            }}
            className="text-xs font-semibold text-[#8F6D3B] hover:text-[#204434] px-3 py-1.5 rounded-full hover:bg-[#FFFCF6]/80 transition cursor-pointer"
          >
            Bỏ qua & Vào Tự học ngay &rarr;
          </button>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 bg-[#FFFCF6]/85 backdrop-blur-md px-3.5 2xl:px-4 py-1.5 rounded-full border border-[#BC9B6B]/40 text-[11px] 2xl:text-xs font-semibold text-[#204434] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#BC9B6B]" />
            <span>Bước {step} / 3:</span>
            <span className="text-[#315E48]">
              {step === 1 ? "Hình thức học" : step === 2 ? "Mục tiêu & Trình độ" : "Lộ trình đề xuất"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 2xl:px-8 py-2 2xl:py-6 my-auto relative z-10">
        
        {/* ========================================================================= */}
        {/* MÀN HÌNH 4 (BƯỚC 1): CHỌN HÌNH THỨC HỌC */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 2xl:space-y-6">
            <div className="text-center max-w-xl mx-auto mb-4 2xl:mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-[#204434]/10 text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-1.5 2xl:mb-2.5">
                Màn hình 4 · Khởi đầu học tập
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[#204434] tracking-tight">
                Bạn muốn bắt đầu như thế nào?
              </h1>
              <p className="text-xs 2xl:text-sm text-[#315E48] mt-1.5 leading-relaxed">
                Hai lựa chọn chỉ xác định cách bạn muốn bắt đầu. Bạn có thể tự học độc lập và tham gia lớp có giáo viên đồng thời mà không bị mất tiến độ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
              
              {/* Option A: Tự học chủ động */}
              <div
                onClick={() => setLearningMode("SELF")}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer border flex flex-col justify-between backdrop-blur-md ${
                  learningMode === "SELF"
                    ? "bg-[#FFFCF6]/95 border-[#204434] shadow-2xl shadow-[#204434]/15 ring-2 ring-[#204434]/20"
                    : "bg-[#FFFCF6]/85 border-[#BC9B6B]/35 hover:border-[#204434]/50 hover:bg-[#FFFCF6]/95 shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                      <Compass className="w-6 h-6" />
                    </div>
                    {learningMode === "SELF" && (
                      <span className="px-2.5 py-1 rounded-full bg-[#204434] text-[#FFFCF6] text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Đang chọn</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#204434] mb-2">
                    Lựa chọn A – Tự học chủ động
                  </h3>
                  <p className="text-xs text-[#315E48] leading-relaxed mb-5">
                    Học theo lộ trình riêng, chủ động lựa chọn nội dung và luyện tập bất kỳ lúc nào.
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-[#BC9B6B]/20">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#BC9B6B] block">
                      Quyền lợi dành cho bạn:
                    </span>
                    <ul className="space-y-2 text-xs text-[#204434]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                        <span>Tự chọn nội dung học được mở</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                        <span>Nhận lộ trình cá nhân hóa đề xuất</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                        <span>Sử dụng đầy đủ Phòng luyện tập</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                        <span>Theo dõi tiến độ học tập cá nhân</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                        <span>Ôn lại những câu đã làm sai thông minh</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#BC9B6B]/20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLearningMode("SELF");
                      setStep(2);
                    }}
                    className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Bắt đầu tự học</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option B: Tham gia lớp có giáo viên */}
              <div
                onClick={() => setLearningMode("CLASS")}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer border flex flex-col justify-between backdrop-blur-md ${
                  learningMode === "CLASS"
                    ? "bg-[#FFFCF6]/95 border-[#204434] shadow-2xl shadow-[#204434]/15 ring-2 ring-[#204434]/20"
                    : "bg-[#FFFCF6]/85 border-[#BC9B6B]/35 hover:border-[#204434]/50 hover:bg-[#FFFCF6]/95 shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    {learningMode === "CLASS" && (
                      <span className="px-2.5 py-1 rounded-full bg-[#9D493E] text-[#FFFCF6] text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Đang chọn</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#204434] mb-2">
                    Lựa chọn B – Tham gia lớp có giáo viên
                  </h3>
                  <p className="text-xs text-[#315E48] leading-relaxed mb-5">
                    Tham gia lớp học để nhận bài tập, làm bài theo yêu cầu và được giáo viên theo dõi tiến độ.
                  </p>

                  {/* Class Code Input Area */}
                  <div className="space-y-3 pt-2 border-t border-[#BC9B6B]/20">
                    <label className="text-xs font-semibold text-[#204434] block">
                      Nhập mã lớp từ giáo viên của bạn:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={classCodeInput}
                        onChange={(e) => {
                          setClassCodeInput(e.target.value.toUpperCase());
                          setClassCodeError("");
                        }}
                        placeholder="Ví dụ: HANYU3A"
                        className="flex-1 bg-[#F8F5ED] border border-[#BC9B6B]/30 focus:border-[#204434] focus:bg-[#FFFCF6] rounded-xl px-3.5 py-2 text-xs font-mono font-bold tracking-wider text-[#204434] uppercase outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerifyClassCode();
                        }}
                        disabled={checkingCode}
                        className="px-3.5 py-2 rounded-xl bg-[#204434] text-[#FFFCF6] text-xs font-semibold hover:bg-[#183629] transition disabled:opacity-60 cursor-pointer flex items-center gap-1"
                      >
                        {checkingCode ? "Đang kiểm tra..." : "Kiểm tra mã lớp"}
                      </button>
                    </div>

                    {/* Hint badge */}
                    <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                      <span>💡 Mã thử nghiệm:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClassCodeInput("HANYU3A");
                        }}
                        className="font-mono font-bold text-[#9D493E] hover:underline cursor-pointer"
                      >
                        HANYU3A
                      </button>
                    </div>

                    {/* Class Code Error */}
                    {classCodeError && (
                      <div className="p-2.5 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-xs text-[#9D493E] font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{classCodeError}</span>
                      </div>
                    )}

                    {/* Verified Class Card */}
                    {verifiedClass && (
                      <div className="p-3.5 rounded-2xl bg-[#204434]/5 border border-[#204434]/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#315E48]" />
                            <span>Đã tìm thấy lớp học:</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#204434] text-[#FFFCF6] text-[10px] font-bold">
                            HSK {verifiedClass.level}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-sm text-[#204434]">
                          {verifiedClass.name}
                        </div>
                        <div className="text-xs text-[#315E48] flex items-center gap-1.5">
                          <span>Giáo viên:</span>
                          <strong className="text-[#204434]">{verifiedClass.teacherName}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#BC9B6B]/20">
                  <button
                    type="button"
                    disabled={submitting || !verifiedClass}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!verifiedClass) {
                        setClassCodeError("Bạn phải nhập mã lớp hợp lệ và bấm 'Kiểm tra mã lớp' trước khi xác nhận vào lớp.");
                        return;
                      }
                      handleConfirmClassDirectly();
                    }}
                    className={`w-full font-semibold py-3 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 ${
                      verifiedClass && !submitting
                        ? "bg-[#9D493E] hover:bg-[#833d34] text-[#FFFCF6] shadow-[#9D493E]/20 cursor-pointer"
                        : "bg-[#BC9B6B]/25 text-[#204434]/40 cursor-not-allowed border border-[#BC9B6B]/30"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang ghi danh và vào lớp học...</span>
                      </>
                    ) : !verifiedClass ? (
                      <span>Nhập mã lớp hợp lệ để xác nhận &rarr;</span>
                    ) : (
                      <>
                        <span>Xác nhận vào lớp: {verifiedClass.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Note alert */}
            <div className="p-4 rounded-2xl bg-[#FFFCF6]/85 backdrop-blur-md border border-[#BC9B6B]/30 text-center text-xs text-[#315E48] max-w-xl mx-auto leading-relaxed shadow-sm">
              <strong>Ghi chú:</strong> Học viên tự học có thể tham gia lớp bất kỳ lúc nào sau này trong Dashboard. Học viên có lớp vẫn hoàn toàn tự do luyện tập độc lập mà không bị giới hạn.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÀN HÌNH 5 (BƯỚC 2): THIẾT LẬP MỤC TIÊU HỌC TẬP */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-[#204434]/10 space-y-8">
            
            <div className="border-b border-[#BC9B6B]/20 pb-5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#204434]/10 text-xs font-semibold text-[#204434] mb-2">
                Màn hình 5 · Thiết lập mục tiêu học tập
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#204434] tracking-tight">
                Hãy để Hanyu hiểu mục tiêu của bạn.
              </h1>
              <p className="text-sm text-[#315E48] mt-1.5">
                Giúp chúng tôi cá nhân hóa lộ trình bài học và bài tập phù hợp nhất với năng lực của bạn.
              </p>
            </div>

            {/* Thông báo cập nhật chuyên mục */}
            {trackNotice && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-xs text-[#8F6D3B] font-medium flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 shrink-0 text-[#8F6D3B]" />
                <span>{trackNotice}</span>
              </div>
            )}

            {/* 1. Chọn hướng học chính */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#204434] text-[#FFFCF6] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <label className="text-sm font-bold text-[#204434]">
                  Chọn hướng học chính của bạn:
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Track: HSK 3.0 (Active) */}
                <div
                  onClick={() => {
                    setMainTrack("hsk");
                    saveDraft({ mainTrack: "hsk" });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    mainTrack === "hsk"
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#204434] text-white text-[10px] font-bold">
                    Tiêu chuẩn
                  </span>
                  <div className="font-serif font-bold text-base text-[#204434] mb-1">
                    HSK 3.0
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Chuẩn bị thi chứng chỉ từ HSK 1 đến HSK 6/9 theo tiêu chuẩn mới nhất.
                  </p>
                </div>

                {/* Track: Tiếng Trung theo chủ đề (Cập nhật sau) */}
                <div
                  onClick={() => {
                    setTrackNotice("Chuyên mục 'Tiếng Trung theo chủ đề' đang được cập nhật sau. Bạn hãy bắt đầu với HSK 3.0 trước nhé!");
                    setTimeout(() => setTrackNotice(null), 4500);
                  }}
                  className="p-4 rounded-2xl border border-[#BC9B6B]/25 bg-[#F8F5ED]/40 opacity-75 hover:opacity-100 transition-all cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] text-[10px] font-bold border border-[#BC9B6B]/30">
                    Cập nhật sau
                  </span>
                  <div className="font-serif font-bold text-base text-[#204434] mb-1">
                    Tiếng Trung theo chủ đề
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Giao tiếp, du lịch, mua sắm, ẩm thực và đời sống thường nhật phong phú.
                  </p>
                </div>

                {/* Track: Tiếng Trung đại học & Chuyên ngành (Cập nhật sau) */}
                <div
                  onClick={() => {
                    setTrackNotice("Chuyên mục 'Đại học & Chuyên ngành' đang được hoàn thiện. Bạn hãy bắt đầu với HSK 3.0 trước nhé!");
                    setTimeout(() => setTrackNotice(null), 4500);
                  }}
                  className="p-4 rounded-2xl border border-[#BC9B6B]/25 bg-[#F8F5ED]/40 opacity-75 hover:opacity-100 transition-all cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] text-[10px] font-bold border border-[#BC9B6B]/30">
                    Cập nhật sau
                  </span>
                  <div className="font-serif font-bold text-base text-[#204434] mb-1">
                    Đại học & Chuyên ngành
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Học thuật chuyên sâu cho du học sinh, nghiên cứu và sinh viên đại học.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Chọn trình độ hiện tại */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#204434] text-[#FFFCF6] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <label className="text-sm font-bold text-[#204434]">
                  Chọn trình độ hiện tại của bạn:
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Mới bắt đầu */}
                <div
                  onClick={() => handleSelectLevel("beginner")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentLevel === "beginner"
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#204434]">Mới bắt đầu</span>
                    {currentLevel === "beginner" && <Check className="w-4 h-4 text-[#204434]" />}
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Chưa biết tiếng Trung hoặc mới bắt đầu làm quen với hệ thống phát âm Pinyin.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-[#8F6D3B]">
                    → Xếp lớp trực tiếp: HSK 1
                  </div>
                </div>

                {/* Đã học cơ bản */}
                <div
                  onClick={() => handleSelectLevel("intermediate")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentLevel === "intermediate"
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#204434]">Đã học cơ bản</span>
                    {currentLevel === "intermediate" && <Check className="w-4 h-4 text-[#204434]" />}
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Tương đương trình độ HSK 1 – HSK 3, biết các từ vựng và câu giao tiếp đơn giản.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-[#8F6D3B]">
                    → Kiểm tra nhanh HSK 1 – HSK 3
                  </div>
                </div>

                {/* Đã có nền tảng tốt */}
                <div
                  onClick={() => handleSelectLevel("advanced")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentLevel === "advanced"
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#204434]">Đã có nền tảng tốt</span>
                    {currentLevel === "advanced" && <Check className="w-4 h-4 text-[#204434]" />}
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    Tương đương trình độ HSK 4 trở lên, muốn tăng tốc phản xạ và luyện đề chuyên sâu.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-[#8F6D3B]">
                    → Kiểm tra nhanh HSK 4 – HSK 6
                  </div>
                </div>
              </div>

              {/* KHUNG BÀI KIỂM TRA NĂNG LỰC ĐẦU VÀO CHO 2 TRÌNH ĐỘ CÓ NỀN TẢNG */}
              {(currentLevel === "intermediate" || currentLevel === "advanced") && (
                <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#BC9B6B]/30">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#204434]/10 text-[#204434] text-[11px] font-bold inline-block mb-1">
                        Khảo sát năng lực thực tế
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#204434]">
                        {currentLevel === "intermediate"
                          ? "Bài kiểm tra nhanh trình độ HSK 1 – HSK 3 (5 câu)"
                          : "Bài kiểm tra nhanh trình độ HSK 4 – HSK 6 (5 câu)"}
                      </h3>
                      <p className="text-xs text-[#315E48]">
                        Chọn đáp án đúng nhất để hệ thống xếp bạn vào đúng cấp độ HSK tương ứng:
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#8F6D3B]">
                        Đã chọn: {Object.keys(placementAnswers).length} / 5 câu
                      </span>
                    </div>
                  </div>

                  {/* Danh sách 5 câu hỏi trắc nghiệm */}
                  <div className="space-y-4">
                    {(currentLevel === "intermediate" ? HSK1_3_QUESTIONS : HSK4_6_QUESTIONS).map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#204434] text-white text-[11px] font-bold">
                            Câu {qIdx + 1} / 5
                          </span>
                          {placementSubmitted && (
                            <span
                              className={`text-xs font-bold ${
                                placementAnswers[qIdx] === q.correctIndex
                                  ? "text-[#315E48]"
                                  : "text-[#9D493E]"
                              }`}
                            >
                              {placementAnswers[qIdx] === q.correctIndex
                                ? "✓ Chính xác"
                                : `✗ Đáp án đúng: ${q.options[q.correctIndex]}`}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-serif text-base font-bold text-[#204434]">
                            {q.questionZh}
                          </div>
                          <div className="text-xs text-[#8F6D3B] font-mono mt-0.5">
                            {q.pinyin}
                          </div>
                          <div className="text-xs text-[#315E48] italic mt-0.5">
                            {q.questionVi}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = placementAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={placementSubmitted}
                                onClick={() => {
                                  const next = { ...placementAnswers, [qIdx]: optIdx };
                                  setPlacementAnswers(next);
                                  saveDraft({ placementAnswers: next });
                                }}
                                className={`p-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? "bg-[#204434] text-[#FFFCF6] border-[#204434] shadow-xs"
                                    : "bg-[#F8F5ED] text-[#204434] border-[#BC9B6B]/30 hover:border-[#204434]/50"
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>

                        {placementSubmitted && (
                          <div className="text-[11px] text-[#315E48] bg-[#FAF7F0] p-2.5 rounded-xl border border-[#BC9B6B]/20">
                            💡 <strong>Giải thích:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Nút nộp bài / Kết quả */}
                  {!placementSubmitted ? (
                    <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                      <button
                        type="button"
                        onClick={handleSubmitPlacementTest}
                        className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
                        <span>Nộp bài & Đánh giá cấp độ HSK</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const fallback = currentLevel === "intermediate" ? 2 : 4;
                          setDeterminedHskLevel(fallback);
                          setPlacementSubmitted(true);
                          saveDraft({ determinedHskLevel: fallback, placementSubmitted: true });
                        }}
                        className="text-xs text-[#8F6D3B] hover:text-[#204434] underline cursor-pointer"
                      >
                        Bỏ qua bài test, tôi tự chọn HSK {currentLevel === "intermediate" ? 2 : 4}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/40 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#8F6D3B]" />
                          <h4 className="font-serif font-bold text-sm text-[#204434]">
                            Kết quả: {placementScore} / 5 câu đúng ({Math.round((placementScore / 5) * 100)}%)
                          </h4>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#204434] text-white text-xs font-bold">
                          Đề xuất bắt đầu: HSK {determinedHskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#315E48]">
                        {determinedHskLevel >= 3
                          ? `Năng lực của bạn rất tốt! Hệ thống đã định tuyến để bạn bắt đầu ngay tại HSK ${determinedHskLevel} trên Lộ trình Chiếu chỉ hoàng gia.`
                          : `Hệ thống đề xuất bạn học từ HSK ${determinedHskLevel} để củng cố nền tảng vững chắc nhất.`}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPlacementAnswers({});
                            setPlacementSubmitted(false);
                            saveDraft({ placementAnswers: {}, placementSubmitted: false });
                          }}
                          className="text-xs text-[#204434] font-semibold hover:underline cursor-pointer"
                        >
                          ↺ Làm lại bài test
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Chọn thời gian học mỗi ngày */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#204434] text-[#FFFCF6] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <label className="text-sm font-bold text-[#204434]">
                  Thời gian bạn có thể dành để học mỗi ngày:
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 15 phút */}
                <div
                  onClick={() => {
                    setDailyTime(15);
                    saveDraft({ dailyTime: 15 });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
                    dailyTime === 15
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto text-[#204434] mb-2" />
                  <div className="font-serif font-bold text-lg text-[#204434]">15 phút / ngày</div>
                  <p className="text-xs text-[#315E48] mt-1">
                    Dành cho người bận rộn, duy trì thói quen học đều đặn mỗi ngày.
                  </p>
                </div>

                {/* 30 phút (Khuyên dùng) */}
                <div
                  onClick={() => {
                    setDailyTime(30);
                    saveDraft({ dailyTime: 30 });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-center relative ${
                    dailyTime === 30
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#BC9B6B] text-white text-[10px] font-bold shadow-xs">
                    Khuyên dùng
                  </span>
                  <Clock className="w-5 h-5 mx-auto text-[#204434] mb-2" />
                  <div className="font-serif font-bold text-lg text-[#204434]">30 phút / ngày</div>
                  <p className="text-xs text-[#315E48] mt-1">
                    Cân bằng tối ưu giữa học kiến thức mới và luyện tập củng cố.
                  </p>
                </div>

                {/* 60 phút */}
                <div
                  onClick={() => {
                    setDailyTime(60);
                    saveDraft({ dailyTime: 60 });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
                    dailyTime === 60
                      ? "bg-[#204434]/5 border-[#204434] ring-2 ring-[#204434]/20 shadow-xs"
                      : "bg-[#F8F5ED]/60 border-[#BC9B6B]/30 hover:border-[#204434]/40"
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto text-[#204434] mb-2" />
                  <div className="font-serif font-bold text-lg text-[#204434]">60 phút / ngày</div>
                  <p className="text-xs text-[#315E48] mt-1">
                    Tiến bộ vượt bậc, tập trung cao độ để bứt phá cấp độ nhanh chóng.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#BC9B6B]/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  saveDraft({ step: 1 });
                }}
                className="px-4 py-2.5 rounded-xl border border-[#BC9B6B]/30 text-xs font-semibold text-[#315E48] hover:text-[#204434] transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại bước 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(3);
                  saveDraft({ step: 3 });
                }}
                className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold px-6 py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Xem lộ trình đề xuất</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MÀN HÌNH 6 (BƯỚC 3): LỘ TRÌNH ĐƯỢC ĐỀ XUẤT */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#204434]/10 text-xs font-semibold text-[#204434] mb-2">
                Màn hình 6 · Lộ trình đề xuất cá nhân hóa
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#204434] tracking-tight">
                Lộ trình học tập dành riêng cho bạn
              </h1>
              <p className="text-sm text-[#315E48] mt-2">
                Dựa trên mục tiêu và thời gian học của bạn, Hanyu đã tối ưu lộ trình {adminRoadmapStages.length || 4} giai đoạn toàn diện.
              </p>
            </div>

            {/* 1. Target Summary Card */}
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#204434]/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#315E48] font-bold block mb-1">
                  Hình thức học
                </span>
                <div className="font-serif font-bold text-sm text-[#204434] flex items-center gap-1.5">
                  {learningMode === "SELF" ? (
                    <>
                      <Compass className="w-4 h-4 text-[#204434]" />
                      <span>Tự học chủ động</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-[#9D493E]" />
                      <span>Có giáo viên ({verifiedClass?.name || "HANYU3A"})</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#315E48] font-bold block mb-1">
                  Hướng học chính
                </span>
                <div className="font-serif font-bold text-sm text-[#204434]">
                  {mainTrack === "hsk"
                    ? "HSK 3.0 Chuẩn quốc tế"
                    : mainTrack === "topic"
                    ? "Theo chủ đề thực tế"
                    : `Chuyên ngành (${major.toUpperCase()})`}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#315E48] font-bold block mb-1">
                  Cấp độ bắt đầu
                </span>
                <div className="font-serif font-bold text-sm text-[#204434] flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-xs font-bold">
                    HSK {determinedHskLevel}
                  </span>
                  <span className="text-xs text-[#315E48]">
                    {currentLevel === "beginner" ? "(Nhập môn)" : `(Đạt ${placementScore}/5 điểm test)`}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#315E48] font-bold block mb-1">
                  Thời gian học
                </span>
                <div className="font-serif font-bold text-sm text-[#204434] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#BC9B6B]" />
                  <span>{dailyTime} phút mỗi ngày</span>
                </div>
              </div>
            </div>

            {/* 2. Four Roadmap Phases */}
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#204434]/10 space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#204434] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#BC9B6B]" />
                <span>{getRoadmapPhases().length} Giai đoạn học tập chi tiết</span>
              </h3>

              <div className="space-y-4">
                {getRoadmapPhases().map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#FFFCF6] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#BC9B6B]">
                            {p.phase}
                          </span>
                          <span className="text-xs text-[#315E48]">· Dự kiến {p.duration}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#204434] mt-0.5">
                          {p.title}
                        </h4>
                        <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#BC9B6B]/30 text-[11px] font-semibold text-[#204434]">
                        🎯 {p.milestone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Daily Breakdown */}
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-6 sm:p-7 shadow-xl shadow-[#204434]/10">
              <h3 className="font-serif text-lg font-bold text-[#204434] mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#315E48]" />
                <span>Phân bổ kế hoạch học tập mỗi ngày ({dailyTime} phút)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {getTimeBreakdown().map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#204434]">{item.label}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[11px] font-bold">
                        {item.min}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#315E48]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 rounded-3xl bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 shadow-2xl shadow-[#204434]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#BC9B6B]/30 text-xs font-semibold text-[#315E48] hover:text-[#204434] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Điều chỉnh mục tiêu</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={submitting}
                className="w-full sm:w-auto bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold px-8 py-3.5 rounded-xl transition duration-200 shadow-md shadow-[#204434]/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 text-sm"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Bắt đầu Lộ trình Tự học HSK {determinedHskLevel} ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-[#204434] font-medium z-10 drop-shadow-xs">
        © 2026 Hanyu · Nền tảng học tiếng Trung và Luyện thi HSK 3.0 · Phong cách Thủy Mặc Tối Giản
      </footer>
    </div>
  );
}
