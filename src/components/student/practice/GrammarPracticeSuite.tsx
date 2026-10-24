"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  FileQuestion,
  BookOpen,
  Sparkles,
  HelpCircle,
  Shuffle,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type GrammarExerciseMode =
  | "choose_correct" // Chọn câu đúng ngữ pháp
  | "true_false" // Đúng / Sai
  | "fill_blank" // Trắc nghiệm điền từ
  | "reorder" // Sắp xếp từ thành câu
  | "correct_mistake"; // Sửa câu sai thành đúng

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string; // Tên quy tắc ngữ pháp liên quan
  prompt: string; // Đề bài / Câu hỏi
  pinyinPrompt?: string;
  sentence?: string; // Câu tiếng Hán cần xét hoặc câu gốc
  pinyin?: string;
  meaningVi?: string;
  options?: string[]; // 4 lựa chọn nếu là trắc nghiệm
  correctAnswer: string | boolean; // Đáp án đúng ("A" / "B" / true / false / text)
  scrambledWords?: string[]; // Danh sách từ xáo trộn cho dạng reorder
  explanation: string; // Giải thích ngữ pháp chi tiết
  wrongSentence?: string; // Câu sai cho dạng sửa lỗi
  wrongSentencePinyin?: string;
}

interface GrammarPracticeSuiteProps {
  grammarList: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  handleSpeak: (text: string) => void;
}

// =========================================================================
// CURATED GRAMMAR EXERCISE DATABASE FOR HSK 1 & HSK 2 LESSONS
// =========================================================================
const CURATED_GRAMMAR_EXERCISES: Record<string, GrammarExerciseItem[]> = {
  // HSK 1 - BÀI 1: CHÀO HỎI & 你 vs 您
  "1-1": [
    {
      id: "h1-l1-cc-1",
      mode: "choose_correct",
      grammarRule: "Chào hỏi với 你 / 您 / 你们",
      prompt: "Chọn câu chào hỏi đúng ngữ pháp khi gặp thầy giáo Vương:",
      options: [
        "A. 老师，您好！ (Lǎoshī, nín hǎo!)",
        "B. 您好老师！ (Nín hǎo lǎoshī!)",
        "C. 老师你好们！ (Lǎoshī nǐ hǎo men!)",
        "D. 老师你很！ (Lǎoshī nǐ hěn!)",
      ],
      correctAnswer: "A",
      explanation: "Quy tắc: Danh xưng/chức vụ đứng trước câu chào. Với thầy cô giáo hoặc người lớn tuổi, dùng kính ngữ '您' (Nín) để bày tỏ sự tôn kính.",
    },
    {
      id: "h1-l1-tf-1",
      mode: "true_false",
      grammarRule: "Phân biệt 你 và 您",
      prompt: "Xác định câu sau đúng hay sai ngữ pháp:",
      sentence: "你们好，李老师！",
      pinyin: "Nǐmen hǎo, Lǐ lǎoshī!",
      meaningVi: "Chào các bạn, thầy Lý!",
      correctAnswer: false,
      explanation: "SAI vì '李老师' là một thầy giáo, không thể dùng đại từ số nhiều '你们' (các bạn/các thầy) để gọi một người.",
    },
    {
      id: "h1-l1-fb-1",
      mode: "fill_blank",
      grammarRule: "Đại từ số nhiều 们",
      prompt: "Chọn từ thích hợp điền vào chỗ trống:",
      sentence: "同学 ___ ，你们好！",
      pinyin: "Tóngxué ___ , nǐmen hǎo!",
      meaningVi: "Chào các bạn học sinh!",
      options: ["A. 们 (men)", "B. 的 (de)", "C. 个 (gè)", "D. 很 (hěn)"],
      correctAnswer: "A",
      explanation: "Hậu tố '们' đặt sau danh từ chỉ người '同学' để tạo danh từ số nhiều '同学们' (các bạn học sinh).",
    },
    {
      id: "h1-l1-ro-1",
      mode: "reorder",
      grammarRule: "Cấu trúc lời chào trang trọng",
      prompt: "Bấm vào các từ bên dưới để sắp xếp thành câu chào hỏi hoàn chỉnh:",
      sentence: "王老师，您好！",
      scrambledWords: ["您好", "！", "王老师", "，"],
      correctAnswer: "王老师 ， 您好 ！",
      explanation: "Trật tự câu: Danh từ xưng hô (王老师) + Dấu phẩy + Lời chào (您好) + Dấu cảm thán.",
    },
    {
      id: "h1-l1-cm-1",
      mode: "correct_mistake",
      grammarRule: "Kính ngữ 您 không kết hợp với số nhiều 们",
      prompt: "Câu sau có lỗi ngữ pháp, hãy chọn câu sửa đúng nhất:",
      wrongSentence: "您们好，老师！",
      wrongSentencePinyin: "Nínmen hǎo, lǎoshī!",
      meaningVi: "Chào các thầy cô giáo!",
      options: [
        "A. 老师们，您好！ (Lǎoshīmen, nín hǎo!)",
        "B. 老师好您！ (Lǎoshī hǎo nín!)",
        "C. 你们好，老师！ (Nǐmen hǎo, lǎoshī!)",
        "D. 老师您好们！ (Lǎoshī nín hǎo men!)",
      ],
      correctAnswer: "A",
      explanation: "Trong ngữ pháp tiếng Trung chuẩn, đại từ kính ngữ '您' thường không ghép với '们'. Khi chào nhiều thầy cô, dùng '老师们，您好！' hoặc '各位老师好！'.",
    },
  ],

  // HSK 1 - BÀI 2: HỎI TÊN VỚI 叫 & CÂU PHÁN ĐOÁN 是
  "1-2": [
    {
      id: "h1-l2-cc-1",
      mode: "choose_correct",
      grammarRule: "Câu phán đoán khẳng định với 是",
      prompt: "Chọn câu có cấu trúc ngữ pháp đúng nhất:",
      options: [
        "A. 我是学生。 (Wǒ shì xuésheng.)",
        "B. 我学生是。 (Wǒ xuésheng shì.)",
        "C. 是我学生。 (Shì wǒ xuésheng.)",
        "D. 我是个是学生。 (Wǒ shì gè shì xuésheng.)",
      ],
      correctAnswer: "A",
      explanation: "Cấu trúc câu khẳng định với 是: Chủ ngữ (我) + 是 + Vị ngữ danh từ (学生). Động từ '是' không thể đứng cuối câu hay đầu câu.",
    },
    {
      id: "h1-l2-tf-1",
      mode: "true_false",
      grammarRule: "Phủ định của động từ 是 bằng 不是",
      prompt: "Xác định câu sau đúng hay sai ngữ pháp:",
      sentence: "我没是老师，我是学生。",
      pinyin: "Wǒ méi shì lǎoshī, wǒ shì xuésheng.",
      meaningVi: "Tôi không phải là giáo viên, tôi là học sinh.",
      correctAnswer: false,
      explanation: "SAI vì động từ phán đoán '是' CHỈ được phủ định bằng '不' (不是), TUYỆT ĐỐI không dùng '没' (没是).",
    },
    {
      id: "h1-l2-fb-1",
      mode: "fill_blank",
      grammarRule: "Đại từ nghi vấn 什么",
      prompt: "Chọn từ điền vào chỗ trống:",
      sentence: "你叫 ___ 名字？",
      pinyin: "Nǐ jiào ___ míngzi?",
      meaningVi: "Bạn tên là gì?",
      options: ["A. 什么 (shénme)", "B. 吗 (ma)", "C. 哪 (nǎ)", "D. 谁 (shéi)"],
      correctAnswer: "A",
      explanation: "Cấu trúc hỏi tên: Chủ ngữ + 叫 + 什么 + 名字? '什么' (gì/cái gì) đóng vai trò định ngữ bổ nghĩa cho danh từ '名字'.",
    },
    {
      id: "h1-l2-ro-1",
      mode: "reorder",
      grammarRule: "Cấu trúc giới thiệu tên với 叫",
      prompt: "Sắp xếp các từ thành câu đúng ngữ pháp:",
      sentence: "我叫李小龙。",
      scrambledWords: ["叫", "李小龙", "我", "。"],
      correctAnswer: "我 叫 李小龙 。",
      explanation: "Trật tự câu: Chủ ngữ (我) + Động từ (叫) + Họ tên (李小龙).",
    },
    {
      id: "h1-l2-cm-1",
      mode: "correct_mistake",
      grammarRule: "Không dùng trợ từ nghi vấn 吗 trong câu đã có từ hỏi 什么",
      prompt: "Câu sau mắc lỗi thừa từ hỏi, hãy chọn câu sửa chuẩn xác:",
      wrongSentence: "你叫什么名字吗？",
      wrongSentencePinyin: "Nǐ jiào shénme míngzi ma?",
      meaningVi: "Bạn tên là gì?",
      options: [
        "A. 你叫什么名字？ (Nǐ jiào shénme míngzi?)",
        "B. 你叫名字什么吗？ (Nǐ jiào míngzi shénme ma?)",
        "C. 叫你什么名字？ (Jiào nǐ shénme míngzi?)",
        "D. 你吗叫什么名字？ (Nǐ ma jiào shénme míngzi?)",
      ],
      correctAnswer: "A",
      explanation: "Câu đã có đại từ nghi vấn '什么' thì KHÔNG dùng trợ từ nghi vấn '吗' ở cuối câu nữa.",
    },
  ],

  // HSK 1 - BÀI 3: QUỐC TỊCH & TRỢ TỪ NGHI VẤN 吗
  "1-3": [
    {
      id: "h1-l3-cc-1",
      mode: "choose_correct",
      grammarRule: "Câu hỏi quốc tịch với 哪国人",
      prompt: "Chọn câu hỏi quốc tịch đúng trật tự ngữ pháp:",
      options: [
        "A. 你是哪国人？ (Nǐ shì nǎ guó rén?)",
        "B. 你是国哪人？ (Nǐ shì guó nǎ rén?)",
        "C. 哪国人是你是？ (Nǎ guó rén shì nǐ shì?)",
        "D. 你哪国人是？ (Nǐ nǎ guó rén shì?)",
      ],
      correctAnswer: "A",
      explanation: "Cấu trúc hỏi quốc tịch: Chủ ngữ + 是 + 哪国人? (Bạn là người nước nào?).",
    },
    {
      id: "h1-l3-tf-1",
      mode: "true_false",
      grammarRule: "Cấu trúc câu hỏi Yes/No với 吗",
      prompt: "Xét tính đúng sai của câu sau:",
      sentence: "你是中国人吗？",
      pinyin: "Nǐ shì Zhōngguó rén ma?",
      meaningVi: "Bạn là người Trung Quốc phải không?",
      correctAnswer: true,
      explanation: "ĐÚNG. Cấu trúc câu hỏi nghi vấn Yes/No: Câu trần thuật (你是中国人) + trợ từ nghi vấn 吗 ở cuối câu.",
    },
    {
      id: "h1-l3-fb-1",
      mode: "fill_blank",
      grammarRule: "Phủ định 不是",
      prompt: "Chọn từ điền vào chỗ trống:",
      sentence: "我 ___ 美国人，我是越南人。",
      pinyin: "Wǒ ___ Měiguó rén, wǒ shì Yuènán rén.",
      meaningVi: "Tôi không phải người Mỹ, tôi là người Việt Nam.",
      options: ["A. 不是 (bú shì)", "B. 没 (méi)", "C. 很 (hěn)", "D. 也 (yě)"],
      correctAnswer: "A",
      explanation: "Dùng phó từ '不是' để phủ định câu nhận định 'A 不是 B'.",
    },
    {
      id: "h1-l3-ro-1",
      mode: "reorder",
      grammarRule: "Câu hỏi xác nhận với 吗",
      prompt: "Sắp xếp các từ thành câu hỏi hoàn chỉnh:",
      sentence: "他是美国人吗？",
      scrambledWords: ["美国人", "吗", "他", "是", "？"],
      correctAnswer: "他 是 美国人 吗 ？",
      explanation: "Trật tự: Chủ ngữ (他) + Động từ (是) + Tân ngữ (美国人) + Trợ từ nghi vấn (吗) + Dấu hỏi.",
    },
    {
      id: "h1-l3-cm-1",
      mode: "correct_mistake",
      grammarRule: "Trợ từ nghi vấn 吗 luôn đứng cuối câu",
      prompt: "Tìm và sửa lỗi vị trí của trợ từ nghi vấn trong câu:",
      wrongSentence: "他是吗越南人？",
      wrongSentencePinyin: "Tā shì ma Yuènán rén?",
      meaningVi: "Anh ấy là người Việt Nam phải không?",
      options: [
        "A. 他是越南人吗？ (Tā shì Yuènán rén ma?)",
        "B. 他吗是越南人？ (Tā ma shì Yuènán rén?)",
        "C. 是他越南人吗？ (Shì tā Yuènán rén ma?)",
        "D. 越南人他是吗？ (Yuènán rén tā shì ma?)",
      ],
      correctAnswer: "A",
      explanation: "Trợ từ nghi vấn '吗' BẮT BUỘC phải đứng ở vị trí cuối cùng của câu hỏi Yes/No.",
    },
  ],

  // HSK 1 - BÀI 4: SỞ HỮU VỚI 有 & SỐ TỪ 两 TRƯỚC LƯỢNG TỪ
  "1-4": [
    {
      id: "h1-l4-cc-1",
      mode: "choose_correct",
      grammarRule: "Phân biệt 两 và 二 trước lượng từ",
      prompt: "Chọn câu sử dụng đúng số lượng từ:",
      options: [
        "A. 我家有两个人。 (Wǒ jiā yǒu liǎng gè rén.)",
        "B. 我家有二个人。 (Wǒ jiā yǒu èr gè rén.)",
        "C. 我家两个人有。 (Wǒ jiā liǎng gè rén yǒu.)",
        "D. 我家有二口。 (Wǒ jiā yǒu èr kǒu.)",
      ],
      correctAnswer: "A",
      explanation: "Quy tắc ngữ pháp quan trọng: Đứng trước lượng từ chỉ số lượng (như 个, 口, 本...) BẮT BUỘC dùng '两' (liǎng), KHÔNG dùng '二' (èr).",
    },
    {
      id: "h1-l4-tf-1",
      mode: "true_false",
      grammarRule: "Phủ định của động từ 有 là 没有",
      prompt: "Đánh giá câu sau đúng hay sai ngữ pháp:",
      sentence: "我不会有女儿。",
      pinyin: "Wǒ bù huì yǒu nǚ'ér.",
      meaningVi: "Tôi không có con gái.",
      correctAnswer: false,
      explanation: "SAI khi dùng phủ định '不' cho sở hữu. Để nói 'không có cái gì', bắt buộc dùng '没有' (没有女儿).",
    },
    {
      id: "h1-l4-fb-1",
      mode: "fill_blank",
      grammarRule: "Lượng từ 口 cho thành viên gia đình",
      prompt: "Điền lượng từ thích hợp vào chỗ trống:",
      sentence: "你家有几 ___ 人？",
      pinyin: "Nǐ jiā yǒu jǐ ___ rén?",
      meaningVi: "Nhà bạn có mấy người?",
      options: ["A. 口 (kǒu)", "B. 个 (gè)", "C. 本 (běn)", "D. 只 (zhī)"],
      correctAnswer: "A",
      explanation: "Khi hỏi về số nhân khẩu gia đình, lượng từ chuẩn thường dùng là '口' (几口人) hoặc '个'. '口' là lượng từ đặc trưng nhất.",
    },
    {
      id: "h1-l4-ro-1",
      mode: "reorder",
      grammarRule: "Cấu trúc sở hữu với 有",
      prompt: "Bấm các từ để ghép thành câu có nghĩa:",
      sentence: "我有一个女儿。",
      scrambledWords: ["女儿", "有", "我", "一个", "。"],
      correctAnswer: "我 有 一个 女儿 。",
      explanation: "Trật tự: Chủ ngữ (我) + Động từ (有) + Số lượng từ (一个) + Danh từ (女儿).",
    },
    {
      id: "h1-l4-cm-1",
      mode: "correct_mistake",
      grammarRule: "Phủ định của 有 là 没有, không bao giờ là 不有",
      prompt: "Câu sau dùng sai phó từ phủ định, hãy chọn câu sửa đúng:",
      wrongSentence: "我不有中国朋友。",
      wrongSentencePinyin: "Wǒ bù yǒu Zhōngguó péngyou.",
      meaningVi: "Tôi không có bạn người Trung Quốc.",
      options: [
        "A. 我没有中国朋友。 (Wǒ méiyǒu Zhōngguó péngyou.)",
        "B. 我不中国朋友有。 (Wǒ bù Zhōngguó péngyou yǒu.)",
        "C. 没有我是中国朋友。 (Méiyǒu wǒ shì Zhōngguó péngyou.)",
        "D. 我没是有中国朋友。 (Wǒ méi shì yǒu Zhōngguó péngyou.)",
      ],
      correctAnswer: "A",
      explanation: "Trong tiếng Trung tuyệt đối KHÔNG có cụm '不有'. Phủ định của '有' luôn luôn là '没有'.",
    },
  ],

  // HSK 1 - BÀI 5: THỜI GIAN & THỨ NGÀY
  "1-5": [
    {
      id: "h1-l5-cc-1",
      mode: "choose_correct",
      grammarRule: "Trật tự từ chỉ thời gian trong câu",
      prompt: "Chọn câu có vị trí trạng ngữ chỉ thời gian đúng ngữ pháp:",
      options: [
        "A. 今天我去学校。 (Jīntiān wǒ qù xuéxiào.)",
        "B. 我去学校今天。 (Wǒ qù xuéxiào jīntiān.)",
        "C. 去学校我今天。 (Qù xuéxiào wǒ jīntiān.)",
        "D. 今天学校去我。 (Jīntiān xuéxiào qù wǒ.)",
      ],
      correctAnswer: "A",
      explanation: "Quy tắc trạng ngữ thời gian: Trạng ngữ thời gian (今天) đứng trước hoặc ngay sau chủ ngữ (今天我去学校 hoặc 我今天去学校). KHÔNG BAO GIỜ đặt ở cuối câu như tiếng Việt/tiếng Anh.",
    },
    {
      id: "h1-l5-tf-1",
      mode: "true_false",
      grammarRule: "Chủ nhật trong tiếng Trung là 星期天 hoặc 星期日",
      prompt: "Xét tính đúng sai của câu sau:",
      sentence: "明天是星期七。",
      pinyin: "Míngtiān shì xīngqī qī.",
      meaningVi: "Ngày mai là Chủ nhật.",
      correctAnswer: false,
      explanation: "SAI vì tuần chỉ đếm từ 星期一 (Thứ 2) đến 星期六 (Thứ 7). Chủ nhật gọi là 星期天 hoặc 星期日, KHÔNG ĐƯỢC NÓI là 星期七.",
    },
    {
      id: "h1-l5-fb-1",
      mode: "fill_blank",
      grammarRule: "Hỏi ngày trong tháng với 号",
      prompt: "Điền từ thích hợp vào chỗ trống:",
      sentence: "今天几月几 ___ ？",
      pinyin: "Jīntiān jǐ yuè jǐ ___ ?",
      meaningVi: "Hôm nay ngày mấy tháng mấy?",
      options: ["A. 号 (hào)", "B. 点 (diǎn)", "C. 天 (tiān)", "D. 岁 (suì)"],
      correctAnswer: "A",
      explanation: "Trong văn nói, ngày trong tháng dùng '号' (hào) (Ví dụ: 9月15号). Trong văn viết dùng '日' (rì).",
    },
    {
      id: "h1-l5-ro-1",
      mode: "reorder",
      grammarRule: "Trật tự thời gian từ lớn đến bé",
      prompt: "Sắp xếp các từ theo trật tự thời gian chuẩn:",
      sentence: "明天星期三，我去学校。",
      scrambledWords: ["明天", "我去学校", "星期三", "，", "。"],
      correctAnswer: "明天 星期三 ， 我去学校 。",
      explanation: "Quy tắc thời gian: Đơn vị lớn đứng trước, nhỏ đứng sau (Ngày mai -> Thứ tư -> Hành động).",
    },
    {
      id: "h1-l5-cm-1",
      mode: "correct_mistake",
      grammarRule: "Trạng từ thời gian không đặt cuối câu",
      prompt: "Sửa lỗi trạng từ chỉ thời gian bị đảo xuống cuối câu:",
      wrongSentence: "他去北京昨天。",
      wrongSentencePinyin: "Tā qù Běijīng zuótiān.",
      meaningVi: "Hôm qua anh ấy đi Bắc Kinh.",
      options: [
        "A. 昨天他去北京。 (Zuótiān tā qù Běijīng.)",
        "B. 他去昨天北京。 (Tā qù zuótiān Běijīng.)",
        "C. 北京他去昨天。 (Běijīng tā qù zuótiān.)",
        "D. 昨天去他北京。 (Zuótiān qù tā Běijīng.)",
      ],
      correctAnswer: "A",
      explanation: "Trạng ngữ chỉ thời gian phải đặt trước động từ (ở đầu câu hoặc sau chủ ngữ): 昨天他去北京 hoặc 他昨天去北京.",
    },
  ],
};

export default function GrammarPracticeSuite({
  grammarList,
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  handleSpeak,
}: GrammarPracticeSuiteProps) {
  // 1. Quản lý chế độ bài tập
  const [activeExerciseMode, setActiveExerciseMode] =
    useState<GrammarExerciseMode>("choose_correct");

  // 2. Thu gọn / mở rộng lý thuyết ngữ pháp ở trên
  const [isTheoryCollapsed, setIsTheoryCollapsed] = useState(false);

  // 3. Vị trí câu hỏi hiện tại trong danh sách
  const [currentIndex, setCurrentIndex] = useState(0);

  // 4. State trả lời cho dạng trắc nghiệm / đúng sai / chọn câu
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 5. State cho dạng sắp xếp từ (reorder)
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [isReorderChecked, setIsReorderChecked] = useState(false);
  const [isReorderCorrect, setIsReorderCorrect] = useState(false);

  // 6. Điểm số & Số câu làm đúng
  const [score, setScore] = useState(0);

  // Lấy danh sách bài tập cho bài học này:
  // Ưu tiên dữ liệu biên soạn chuẩn xác trong CURATED_GRAMMAR_EXERCISES
  // Nếu chưa có, tự động sinh từ grammarList của bài học!
  const exercisePool: GrammarExerciseItem[] = useMemo(() => {
    const key = `${hskLevel}-${lessonNumber}`;
    if (CURATED_GRAMMAR_EXERCISES[key]) {
      return CURATED_GRAMMAR_EXERCISES[key];
    }

    // Fallback: Tự động trích xuất các bài tập đa dạng từ grammarList của bài học
    const generated: GrammarExerciseItem[] = [];

    grammarList.forEach((g: any, idx: number) => {
      const gTitle = g.title || `Quy tắc #${idx + 1}`;
      const gEx = g.example || "我学习汉语。";
      const cleanEx = gEx.split(/[—–-]|[(]/)[0]?.trim() || "我学习汉语。";

      // 1. Choose correct
      generated.push({
        id: `gen-${idx}-cc`,
        mode: "choose_correct",
        grammarRule: gTitle,
        prompt: `Chọn câu vận dụng đúng quy tắc: "${gTitle}"`,
        options: [
          `A. ${cleanEx}`,
          `B. 不是 ${cleanEx}`,
          `C. 很 ${cleanEx} 吗`,
          `D. ${cleanEx} 的个`,
        ],
        correctAnswer: "A",
        explanation: g.explanation || `Câu A áp dụng đúng mẫu ngữ pháp: ${g.structure || gTitle}`,
      });

      // 2. True / False
      generated.push({
        id: `gen-${idx}-tf`,
        mode: "true_false",
        grammarRule: gTitle,
        prompt: "Xét tính chuẩn xác ngữ pháp của câu ví dụ sau:",
        sentence: cleanEx,
        meaningVi: gEx.includes("(") ? gEx.substring(gEx.indexOf("(")) : "Câu ví dụ chuẩn",
        correctAnswer: true,
        explanation: `ĐÚNG. Câu này là ví dụ mẫu của cấu trúc: ${g.structure || gTitle}.`,
      });

      // 3. Fill blank
      const words = cleanEx.split(/([\u4e00-\u9fa5]{1,2})/g).filter(Boolean);
      const targetWord = words.length > 2 ? words[1] : words[0] || "的";
      const blankSentence = cleanEx.replace(targetWord, " ___ ");

      generated.push({
        id: `gen-${idx}-fb`,
        mode: "fill_blank",
        grammarRule: gTitle,
        prompt: "Chọn từ/cụm từ chuẩn ngữ pháp để hoàn thành câu:",
        sentence: blankSentence,
        meaningVi: "Điền trợ từ / vị ngữ tương ứng",
        options: [
          `A. ${targetWord}`,
          "B. 吗",
          "C. 没",
          "D. 不",
        ],
        correctAnswer: "A",
        explanation: `Đáp án đúng là ${targetWord}. Cấu trúc chuẩn: ${g.structure || gTitle}`,
      });

      // 4. Reorder
      const rawTokens = cleanEx.match(/[\u4e00-\u9fa5]+|[，。？！]/g) || ["我", "学习", "汉语", "。"];
      generated.push({
        id: `gen-${idx}-ro`,
        mode: "reorder",
        grammarRule: gTitle,
        prompt: "Bấm vào các khối từ để xếp thành câu hoàn chỉnh đúng quy tắc ngữ pháp:",
        sentence: cleanEx,
        scrambledWords: [...rawTokens].sort(() => Math.random() - 0.5),
        correctAnswer: rawTokens.join(" "),
        explanation: `Trật tự câu chuẩn: ${cleanEx}. Phù hợp cấu trúc: ${g.structure || gTitle}`,
      });

      // 5. Correct mistake
      generated.push({
        id: `gen-${idx}-cm`,
        mode: "correct_mistake",
        grammarRule: gTitle,
        prompt: "Câu bên dưới có lỗi dùng từ/trật tự ngữ pháp, chọn câu sửa đúng nhất:",
        wrongSentence: `没 ${cleanEx}`,
        wrongSentencePinyin: "",
        meaningVi: "Câu bị đảo sai quy tắc",
        options: [
          `A. ${cleanEx}`,
          `B. 是不是 ${cleanEx}`,
          `C. 的 ${cleanEx} 了`,
          `D. 个个 ${cleanEx}`,
        ],
        correctAnswer: "A",
        explanation: `Quy tắc chuẩn: ${g.explanation || g.structure || gTitle}`,
      });
    });

    return generated.length > 0 ? generated : CURATED_GRAMMAR_EXERCISES["1-1"];
  }, [grammarList, hskLevel, lessonNumber]);

  // Lọc bài tập theo chế độ đang chọn
  const filteredExercises = useMemo(() => {
    const list = exercisePool.filter((item) => item.mode === activeExerciseMode);
    return list.length > 0 ? list : exercisePool;
  }, [exercisePool, activeExerciseMode]);

  const currentExercise = filteredExercises[currentIndex] || filteredExercises[0];

  // Khởi tạo trạng thái khi đổi câu hoặc đổi chế độ
  useEffect(() => {
    setSelectedOption(null);
    setSelectedBool(null);
    setIsAnswered(false);
    setIsReorderChecked(false);
    setIsReorderCorrect(false);

    if (currentExercise && currentExercise.mode === "reorder" && currentExercise.scrambledWords) {
      setAvailableWords([...currentExercise.scrambledWords]);
      setAssembledWords([]);
    }
  }, [currentExercise, activeExerciseMode, currentIndex]);

  // Xử lý nạp từ vào câu sắp xếp
  const handlePickWord = (word: string, index: number) => {
    if (isReorderChecked) return;
    setAssembledWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  // Trả từ về kho
  const handleRemoveWord = (word: string, index: number) => {
    if (isReorderChecked) return;
    setAvailableWords((prev) => [...prev, word]);
    setAssembledWords((prev) => prev.filter((_, i) => i !== index));
  };

  // Kiểm tra bài sắp xếp
  const handleCheckReorder = () => {
    if (assembledWords.length === 0) return;
    const userJoined = assembledWords.join("").trim();
    const correctClean = (currentExercise.sentence || "")
      .replace(/\s+/g, "")
      .trim();

    const isMatch =
      userJoined === correctClean ||
      assembledWords.join(" ") === currentExercise.correctAnswer;

    setIsReorderCorrect(isMatch);
    setIsReorderChecked(true);

    if (isMatch) {
      setScore((s) => s + 10);
      handleSpeak(currentExercise.sentence || userJoined);
    }
  };

  // Làm lại sắp xếp
  const handleResetReorder = () => {
    if (currentExercise && currentExercise.scrambledWords) {
      setAvailableWords([...currentExercise.scrambledWords]);
      setAssembledWords([]);
      setIsReorderChecked(false);
      setIsReorderCorrect(false);
    }
  };

  // Xử lý chọn đáp án trắc nghiệm / chọn câu đúng / sửa câu
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    const optLetter = opt.charAt(0);
    setSelectedOption(optLetter);
    setIsAnswered(true);

    const isCorrect = optLetter === currentExercise.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 10);
      const textToSpeak = opt.split(/[.()]/)[1]?.trim() || opt;
      handleSpeak(textToSpeak);
    }
  };

  // Xử lý chọn Đúng / Sai
  const handleSelectTrueFalse = (val: boolean) => {
    if (isAnswered) return;
    setSelectedBool(val);
    setIsAnswered(true);

    const isCorrect = val === currentExercise.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 10);
      if (currentExercise.sentence) {
        handleSpeak(currentExercise.sentence);
      }
    }
  };

  // Next / Prev câu hỏi
  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* =================================================================== */}
      {/* 1. PHẦN LÝ THUYẾT NGỮ PHÁP (GIỮ NGUYÊN NỘI DUNG BÀI HỌC Ở TRÊN)     */}
      {/* =================================================================== */}
      <div className="rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F0] to-[#FFFCF6] border-b border-[#E5DEC9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#BC9B6B]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#204434] flex items-center gap-2">
                <span>Lý thuyết ngữ pháp trọng tâm</span>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434]">
                  Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
                </span>
              </h3>
              <p className="text-xs text-[#315E48] mt-0.5">
                Các quy tắc, cấu trúc câu chuẩn và câu ví dụ ứng dụng trong giao tiếp hàng ngày.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTheoryCollapsed(!isTheoryCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-[#204434] bg-white hover:bg-[#FAF7F0] text-xs font-bold transition cursor-pointer"
          >
            <span>{isTheoryCollapsed ? "Xem lý thuyết" : "Thu gọn"}</span>
            {isTheoryCollapsed ? (
              <ChevronDown className="w-4 h-4 text-[#8F6D3B]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#8F6D3B]" />
            )}
          </button>
        </div>

        {!isTheoryCollapsed && (
          <div className="p-5 sm:p-6">
            {grammarList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grammarList.map((g: any, index: number) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-[#FAF7F0]/60 border border-[#E5DEC9] hover:border-[#204434] transition shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-[11px] font-bold">
                        Ngữ pháp #{index + 1}
                      </span>
                      <button
                        onClick={() => handleSpeak(g.example || g.title)}
                        className="p-1.5 rounded-lg border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#204434]">
                      {g.title}
                    </h4>

                    {g.structure && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs font-mono font-semibold text-[#8F6D3B]">
                        Cấu trúc: {g.structure}
                      </div>
                    )}

                    <p className="text-xs text-[#315E48] leading-relaxed">
                      {g.explanation || g.desc || "Xem ví dụ minh họa bên dưới để hiểu rõ ngữ cảnh sử dụng."}
                    </p>

                    {g.example && (
                      <div className="pt-2 border-t border-[#E5DEC9]/80 text-xs space-y-1">
                        <span className="font-bold text-[#8F6D3B] text-[11px]">Ví dụ minh họa:</span>
                        <p className="font-medium text-[#204434]">{g.example}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#315E48]">
                Bài học này hiện chưa có điểm ngữ pháp nào được lưu.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. THANH ĐIỀU HƯỚNG 5 CHẾ ĐỘ BÀI TẬP LUYỆN NGỮ PHÁP                   */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8F6D3B]" />
            <h3 className="font-serif font-bold text-lg text-[#204434]">
              Bài tập luyện ngữ pháp tương tác
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#204434] bg-[#FAF7F0] px-3 py-1.5 rounded-full border border-[#E5DEC9]">
            <Award className="w-4 h-4 text-[#8F6D3B]" />
            <span>Điểm tích lũy: {score} đ</span>
          </div>
        </div>

        {/* 5 Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#FAF7F0] p-1.5 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => {
              setActiveExerciseMode("choose_correct");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeExerciseMode === "choose_correct"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="truncate">1. Chọn câu đúng</span>
          </button>

          <button
            onClick={() => {
              setActiveExerciseMode("true_false");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeExerciseMode === "true_false"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="truncate">2. Đúng / Sai</span>
          </button>

          <button
            onClick={() => {
              setActiveExerciseMode("fill_blank");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeExerciseMode === "fill_blank"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span className="truncate">3. Điền từ</span>
          </button>

          <button
            onClick={() => {
              setActiveExerciseMode("reorder");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeExerciseMode === "reorder"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="truncate">4. Sắp xếp câu</span>
          </button>

          <button
            onClick={() => {
              setActiveExerciseMode("correct_mistake");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer col-span-2 sm:col-span-1 ${
              activeExerciseMode === "correct_mistake"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="truncate">5. Sửa câu sai</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. KHU VỰC THỰC HIỆN BÀI TẬP THEO TỪNG CHẾ ĐỘ                        */}
      {/* =================================================================== */}
      {currentExercise && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/50 shadow-sm space-y-6 max-w-3xl mx-auto">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#204434] text-white text-xs font-bold">
                Câu {currentIndex + 1} / {filteredExercises.length}
              </span>
              <span className="text-xs font-medium text-[#8F6D3B] truncate max-w-xs">
                {currentExercise.grammarRule}
              </span>
            </div>
            <button
              onClick={() => {
                if (currentExercise.sentence) handleSpeak(currentExercise.sentence);
                else if (currentExercise.wrongSentence) handleSpeak(currentExercise.wrongSentence);
              }}
              className="p-2 rounded-xl border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
              title="Phát âm câu hỏi"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Đề bài */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
              {currentExercise.prompt}
            </h4>

            {/* Dạng câu hiển thị nếu có */}
            {currentExercise.sentence && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#204434] tracking-wide">
                  {currentExercise.sentence}
                </p>
                {currentExercise.pinyin && (
                  <p className="font-mono text-xs text-[#8F6D3B]">
                    {currentExercise.pinyin}
                  </p>
                )}
                {currentExercise.meaningVi && (
                  <p className="text-xs text-[#315E48] italic">
                    Ý nghĩa: {currentExercise.meaningVi}
                  </p>
                )}
              </div>
            )}

            {/* Dạng câu sai cho dạng sửa lỗi */}
            {currentExercise.wrongSentence && (
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-1">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Câu sai ngữ pháp:
                </span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-red-800 line-through tracking-wide">
                  {currentExercise.wrongSentence}
                </p>
                {currentExercise.wrongSentencePinyin && (
                  <p className="font-mono text-xs text-red-600">
                    {currentExercise.wrongSentencePinyin}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* A. DẠNG 1, 3, 5: TRẮC NGHIỆM 4 ĐÁP ÁN (CHỌN CÂU, ĐIỀN TỪ, SỬA CÂU) */}
          {/* =============================================================== */}
          {(currentExercise.mode === "choose_correct" ||
            currentExercise.mode === "fill_blank" ||
            currentExercise.mode === "correct_mistake") &&
            currentExercise.options && (
              <div className="space-y-3">
                {currentExercise.options.map((opt, i) => {
                  const optLetter = opt.charAt(0);
                  const isCorrect = optLetter === currentExercise.correctAnswer;
                  const isUserSelected = selectedOption === optLetter;

                  let btnStyle =
                    "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] hover:border-[#204434]";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold";
                    } else if (isUserSelected) {
                      btnStyle = "bg-red-50 border-red-400 text-red-700 font-medium";
                    } else {
                      btnStyle = "bg-white/60 border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between text-sm sm:text-base cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {isAnswered && isUserSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          {/* =============================================================== */}
          {/* B. DẠNG 2: ĐÚNG / SAI (TRUE / FALSE)                             */}
          {/* =============================================================== */}
          {currentExercise.mode === "true_false" && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                disabled={isAnswered}
                onClick={() => handleSelectTrueFalse(true)}
                className={`p-5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isAnswered
                    ? currentExercise.correctAnswer === true
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                      : selectedBool === true
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "opacity-40 border-slate-200"
                    : "bg-white border-[#E5DEC9] text-[#204434] hover:bg-emerald-50 hover:border-emerald-400"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="font-bold text-base">Đúng ngữ pháp</span>
              </button>

              <button
                disabled={isAnswered}
                onClick={() => handleSelectTrueFalse(false)}
                className={`p-5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isAnswered
                    ? currentExercise.correctAnswer === false
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                      : selectedBool === false
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "opacity-40 border-slate-200"
                    : "bg-white border-[#E5DEC9] text-[#204434] hover:bg-red-50 hover:border-red-400"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="font-bold text-base">Sai ngữ pháp</span>
              </button>
            </div>
          )}

          {/* =============================================================== */}
          {/* C. DẠNG 4: SẮP XẾP TỪ THÀNH CÂU (REORDER)                        */}
          {/* =============================================================== */}
          {currentExercise.mode === "reorder" && (
            <div className="space-y-5">
              {/* Vùng các từ đã xếp vào câu */}
              <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-[#BC9B6B]/60 min-h-[90px] flex flex-wrap items-center gap-2">
                {assembledWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Bấm vào các từ bên dưới theo thứ tự để ghép thành câu đúng ngữ pháp...
                  </span>
                ) : (
                  assembledWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isReorderChecked}
                      onClick={() => handleRemoveWord(word, idx)}
                      className="px-3.5 py-2 rounded-xl bg-[#204434] text-white text-base font-bold shadow-xs hover:bg-red-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{word}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Vùng từ chưa chọn */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#8F6D3B]">
                  Kho từ vựng cần sắp xếp:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isReorderChecked}
                      onClick={() => handlePickWord(word, idx)}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/50 hover:border-[#204434] hover:bg-white text-[#204434] text-base font-bold shadow-2xs transition cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={isReorderChecked || assembledWords.length === 0}
                  onClick={handleCheckReorder}
                  className="flex-1 py-3 rounded-2xl bg-[#204434] text-white font-bold text-sm hover:bg-[#17382F] transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Kiểm tra câu
                </button>
                <button
                  onClick={handleResetReorder}
                  className="px-4 py-3 rounded-2xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0] font-bold text-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xếp lại</span>
                </button>
              </div>

              {/* Kết quả sắp xếp */}
              {isReorderChecked && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isReorderCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-red-50 border-red-300 text-red-800"
                  } space-y-1`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isReorderCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Câu sắp xếp hoàn toàn chuẩn ngữ pháp.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Chưa chính xác! Thứ tự từ chưa tuân thủ quy tắc.</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs">
                    Câu chuẩn: <strong>{currentExercise.sentence}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* D. GIẢI THÍCH NGỮ PHÁP CHI TIẾT (XUẤT HIỆN SAU KHI TRẢ LỜI)      */}
          {/* =============================================================== */}
          {(isAnswered || isReorderChecked) && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-[#8F6D3B] space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-[#8F6D3B]" />
                <span>Quy tắc ngữ pháp giải thích:</span>
              </div>
              <p className="leading-relaxed text-amber-950 font-medium">
                {currentExercise.explanation}
              </p>
            </div>
          )}

          {/* Điều hướng câu tiếp theo */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DEC9]">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] bg-white hover:bg-[#FAF7F0] text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#204434] text-white hover:bg-[#17382F] text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentIndex === filteredExercises.length - 1 ? "Làm lại từ đầu" : "Câu tiếp theo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
