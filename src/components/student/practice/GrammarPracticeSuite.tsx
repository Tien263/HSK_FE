"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  recordStudyTime,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  formatStudyTimeVi,
  formatTimerMMSS,
} from "@/lib/memory-review-service";
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
  Sparkles,
  HelpCircle,
  Shuffle,
  Headphones,
  Edit3,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  VolumeX,
  BookOpen,
  MinusCircle,
  ShieldAlert,
  BarChart2,
  Search,
  Filter,
  Lightbulb,
  Clock,
  Target,
  BookMarked,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  normalizeGrammarList,
  NormalizedGrammarPoint,
} from "@/lib/chinese-grammar-helper";

export type GrammarExerciseMode =
  | "choose_correct" // 1. Chọn câu đúng ngữ pháp (10 câu)
  | "listen_dialogue" // 2. Nghe hiểu hội thoại ngắn (10 câu)
  | "fill_blank" // 3. Điền từ vào chỗ trống (10 câu)
  | "reorder" // 4. Sắp xếp từ thành câu (10 câu)
  | "correct_mistake"; // 5. Sửa câu sai thành đúng (10 câu)

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string;
  prompt: string;
  meaningVi?: string;
  options?: string[];
  correctAnswer: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  audioText?: string;
  sentence?: string;
  pinyin?: string;
  scrambledWords?: string[];
  wrongSentence?: string;
  wrongSentencePinyin?: string;
  explanation: string;
}

interface GrammarPracticeSuiteProps {
  grammarList: any[];
  vocabList?: any[];
  dialogueList?: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
  handleSpeak: (text: string) => void;
}

// =========================================================================
// HÀM SINH BÀI TẬP ĐỘNG: 10 CÂU MỖI DẠNG DỰA TRÊN NGỮ PHÁP BÀI HỌC
// =========================================================================
function generateLessonGrammarExercises(
  normalizedGrammars: NormalizedGrammarPoint[],
  vocabList: any[],
  dialogueList: any[],
  hskLevel: number,
  lessonNumber: number
): GrammarExerciseItem[] {
  const result: GrammarExerciseItem[] = [];

  const safeVocab = Array.isArray(vocabList) && vocabList.length > 0 ? vocabList : [
    { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "xin chào" },
    { hanzi: "老师", pinyin: "lǎoshī", meaning: "thầy cô giáo" },
    { hanzi: "学生", pinyin: "xuésheng", meaning: "học sinh" },
    { hanzi: "朋友", pinyin: "péngyou", meaning: "bạn bè" },
  ];

  // 1. DẠNG 1: CHỌN CÂU ĐÚNG NGỮ PHÁP (10 CÂU ĐỘC LẬP CHUẨN XÁC)
  const chooseCorrectItems: Array<{
    rule: string;
    prompt: string;
    options: string[];
    correct: string;
    explain: string;
  }> = [
    {
      rule: "Cấu trúc chào hỏi lịch sự",
      prompt: "Câu 1: Chọn câu chào hỏi đúng trật tự từ tiếng Trung:",
      options: ["A. 好老师！我是学生。", "B. 老师好！我是学生。", "C. 是老师好，学生我是。", "D. 老师是好，我学生是。"],
      correct: "B",
      explain: "Quy tắc chào hỏi tiếng Trung: Đối tượng được chào + 好 (老师好！). Không được đảo tính từ '好' lên trước danh xưng.",
    },
    {
      rule: "Phán đoán và phủ định với 是",
      prompt: "Câu 2: Chọn câu phán đoán phủ định đúng trật tự:",
      options: ["A. 我不是美国人，我是越南人。", "B. 我没是美国人，我不是越南人。", "C. 我美国人不是，是越南人我。", "D. 我不美国人是，我越南人是。"],
      correct: "A",
      explain: "Phủ định của động từ phán đoán '是' bắt buộc dùng '不是' (Chủ ngữ + 不是 + Tân ngữ). Không dùng '没是'.",
    },
    {
      rule: "Trợ từ nghi vấn 吗",
      prompt: "Câu 3: Chọn câu hỏi nghi vấn đúng quy tắc:",
      options: ["A. 你是李老师的中国学生吗？", "B. 你是李老师的中国学生什么？", "C. 吗你是李老师的中国学生？", "D. 你叫什么名字吗？"],
      correct: "A",
      explain: "Trợ từ nghi vấn '吗' đặt ở cuối câu trần thuật để tạo câu hỏi Có/Không. Câu có từ hỏi (什么) thì không dùng '吗'.",
    },
    {
      rule: "Phó từ chỉ phạm vi 都 / 也",
      prompt: "Câu 4: Chọn câu dùng phó từ '都' đúng vị trí:",
      options: ["A. 他们都去北京大学学习。", "B. 他们去北京大学都学习。", "C. 都在北京大学他们去学习。", "D. 去北京大学都他们学习。"],
      correct: "A",
      explain: "Phó từ '都' (đều) và '也' (cũng) luôn đứng trước động từ hoặc tính từ, không đứng đầu câu hay cuối câu.",
    },
    {
      rule: "Trạng ngữ chỉ thời gian",
      prompt: "Câu 5: Chọn câu có vị trí trạng từ chỉ thời gian đúng nhất:",
      options: ["A. 我去图书馆明天下午。", "B. 我明天下午去图书馆看书。", "C. 我看书去图书馆明天下午。", "D. 去图书馆明天下午我看书。"],
      correct: "B",
      explain: "Trạng ngữ chỉ thời gian (明天下午) luôn đứng trước động từ (Chủ ngữ + Thời gian + Động từ).",
    },
    {
      rule: "Lượng từ và phân biệt 两 / 二",
      prompt: "Câu 6: Chọn câu dùng số từ và lượng từ chuẩn xác:",
      options: ["A. 他有两个中国朋友。", "B. 他有二个中国朋友。", "C. 他有两中国朋友。", "D. 他有两个朋友们。"],
      correct: "A",
      explain: "Trước lượng từ để đếm số lượng bắt buộc dùng '两' (两个朋友). Không dùng '二' và không thêm '们' khi đã có số lượng.",
    },
    {
      rule: "Đại từ nghi vấn 什么",
      prompt: "Câu 7: Chọn câu hỏi tên đúng trật tự từ:",
      options: ["A. 什么名字你叫？", "B. 你叫名字什么？", "C. 你叫什么名字？", "D. 叫什么名字你？"],
      correct: "C",
      explain: "Trật tự hỏi tên: '你叫什么名字？'. Từ hỏi '什么' đứng trước danh từ '名字', không đảo ra đầu câu.",
    },
    {
      rule: "Trợ từ kết cấu 的",
      prompt: "Câu 8: Chọn câu biểu thị quan hệ sở hữu chuẩn xác:",
      options: ["A. 这是我的汉语老师。", "B. 这是我汉语老师的。", "C. 的我汉语老师是这。", "D. 这汉语老师是我。"],
      correct: "A",
      explain: "Quan hệ sở hữu: Định ngữ (我) + 的 + Trung tâm ngữ (汉语老师). Đáp án A đúng hoàn toàn.",
    },
    {
      rule: "Trạng ngữ chỉ nơi chốn với 在",
      prompt: "Câu 9: Chọn câu có cụm từ chỉ nơi chốn đúng vị trí:",
      options: ["A. 妈妈在厨房做饭。", "B. 妈妈做饭在厨房。", "C. 做饭妈妈在厨房。", "D. 在厨房做饭妈妈。"],
      correct: "A",
      explain: "Trạng ngữ chỉ nơi chốn (在 + địa điểm) phải đứng trước hành động (Chủ ngữ + 在... + Động từ).",
    },
    {
      rule: "Trợ từ ngữ khí 呢",
      prompt: "Câu 10: Chọn câu hỏi tỉnh lược ngữ cảnh với '呢':",
      options: ["A. 我是越南留学生，你呢？", "B. 我是越南留学生，你吗？", "C. 你呢我是越南留学生？", "D. 呢你我是越南留学生？"],
      correct: "A",
      explain: "Trợ từ '呢' dùng sau đại từ/danh từ để tạo câu hỏi tỉnh lược theo ngữ cảnh (Tôi là..., còn bạn thì sao?).",
    },
  ];

  chooseCorrectItems.forEach((item, i) => {
    result.push({
      id: `cc-${lessonNumber}-${i + 1}`,
      mode: "choose_correct",
      grammarRule: item.rule,
      prompt: item.prompt,
      options: item.options,
      correctAnswer: item.correct,
      explanation: item.explain,
    });
  });

  // 2. DẠNG 2: NGHE HIỂU HỘI THOẠI NGẮN (10 ĐOẠN HỘI THOẠI THỰC TẾ)
  const dialItems: Array<{
    lines: { speaker: string; zh: string; pinyin: string; vi: string }[];
    audioText: string;
    prompt: string;
    options: string[];
    correct: string;
    explain: string;
  }> = [
    {
      lines: [
        { speaker: "李明", zh: "请问，您贵姓？", pinyin: "Qǐngwèn, nín guìxìng?", vi: "Xin hỏi, quý danh của ngài là gì?" },
        { speaker: "王美", zh: "我姓王，叫王美。你呢？", pinyin: "Wǒ xìng Wáng, jiào Wáng Měi. Nǐ ne?", vi: "Tôi họ Vương, tên là Vương Mỹ. Còn bạn?" },
      ],
      audioText: "李明说：请问，您贵姓？王美说：我姓王，叫王美。你呢？",
      prompt: "Câu 1: Nghe đoạn hội thoại và cho biết người phụ nữ họ gì?",
      options: ["A. Họ Vương (王)", "B. Họ Lý (李)", "C. Họ Trương (张)", "D. Họ Trần (陈)"],
      correct: "A",
      explain: "Người phụ nữ trả lời rõ: '我姓王' (Tôi họ Vương). Đáp án A chính xác.",
    },
    {
      lines: [
        { speaker: "张华", zh: "大卫，你是哪国人？", pinyin: "Dàwèi, nǐ shì nǎ guó rén?", vi: "David, bạn là người nước nào?" },
        { speaker: "大卫", zh: "我是美国人，我在北京学汉语。", pinyin: "Wǒ shì Měiguó rén, wǒ zài Běijīng xué Hànyǔ.", vi: "Tôi là người Mỹ, tôi đang học tiếng Trung ở Bắc Kinh." },
      ],
      audioText: "张华说：大卫，你是哪国人？大卫说：我是美国人，我在北京学汉语。",
      prompt: "Câu 2: Nghe đoạn hội thoại và cho biết Đại Vệ (David) mang quốc tịch nào?",
      options: ["A. Người Mỹ (美国人)", "B. Người Anh (英国人)", "C. Người Trung Quốc (中国人)", "D. Người Việt Nam (越南人)"],
      correct: "A",
      explain: "Đại Vệ trả lời: '我是美国人' (Tôi là người Mỹ). Đáp án A đúng.",
    },
    {
      lines: [
        { speaker: "学生", zh: "请问，王老师在办公室吗？", pinyin: "Qǐngwèn, Wáng lǎoshī zài bàngōngshì ma?", vi: "Xin hỏi thầy Vương có ở văn phòng không ạ?" },
        { speaker: "老师", zh: "他不在办公室，他去教室上课了。", pinyin: "Tā bú zài bàngōngshì, tā qù jiàoshì shàngkè le.", vi: "Thầy ấy không ở văn phòng, thầy ấy đến lớp dạy học rồi." },
      ],
      audioText: "学生说：请问，王老师在办公室吗？老师说：他不在办公室，他去教室上课了。",
      prompt: "Câu 3: Thầy Vương hiện đang ở đâu?",
      options: ["A. Ở phòng học lên lớp (教室)", "B. Ở văn phòng (办公室)", "C. Ở nhà (家)", "D. Ở thư viện (图书馆)"],
      correct: "A",
      explain: "Giáo viên nói: '他去教室上课了' (Thầy ấy đi lên lớp dạy rồi). Đáp án A chuẩn xác.",
    },
    {
      lines: [
        { speaker: "李朋", zh: "小雨，你家有几口人？", pinyin: "Xiǎoyǔ, nǐ jiā yǒu jǐ kǒu rén?", vi: "Tiểu Vũ, nhà bạn có mấy người?" },
        { speaker: "小雨", zh: "我家有四口人：爸爸、妈妈、一个弟弟和我。", pinyin: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, yí gè dìdi hé wǒ.", vi: "Nhà tôi có 4 người: bố, mẹ, một em trai và tôi." },
      ],
      audioText: "李朋说：小雨，你家有几口人？小雨说：我家有四口人：爸爸、妈妈、一个弟弟和我。",
      prompt: "Câu 4: Gia đình Tiểu Vũ có bao nhiêu thành viên?",
      options: ["A. 4 người (四口人)", "B. 3 người (三口人)", "C. 5 người (五口人)", "D. 6 người (六口人)"],
      correct: "A",
      explain: "Tiểu Vũ trả lời: '我家有四口人' (Bố, mẹ, em trai và tôi = 4 người).",
    },
    {
      lines: [
        { speaker: "玛丽", zh: "今天星期几？", pinyin: "Jīntiān xīngqījǐ?", vi: "Hôm nay là thứ mấy?" },
        { speaker: "大为", zh: "昨天星期二，今天星期三。", pinyin: "Zuótiān xīngqī'èr, jīntiān xīngqīsān.", vi: "Hôm qua thứ Ba, hôm nay thứ Tư." },
      ],
      audioText: "玛丽说：今天星期几？大为说：昨天星期二，今天星期三。",
      prompt: "Câu 5: Hôm nay là thứ mấy?",
      options: ["A. Thứ Tư (星期三)", "B. Thứ Ba (星期二)", "C. Thứ Năm (星期四)", "D. Thứ Sáu (星期五)"],
      correct: "A",
      explain: "Đại Vi nói rõ: '今天星期三' (Hôm nay là thứ Tư).",
    },
    {
      lines: [
        { speaker: "服务员", zh: "先生，您喝茶还是喝咖啡？", pinyin: "Xiānsheng, nín hē chá háishì hē kāfēi?", vi: "Thưa anh, anh uống trà hay uống cà phê ạ?" },
        { speaker: "客人", zh: "给我一杯热茶，谢谢！", pinyin: "Gěi wǒ yì bēi rè chá, xièxie!", vi: "Cho tôi một ly trà nóng, cảm ơn!" },
      ],
      audioText: "服务员说：先生，您喝茶还是喝咖啡？客人说：给我一杯热茶，谢谢！",
      prompt: "Câu 6: Vị khách muốn gọi đồ uống gì?",
      options: ["A. Trà nóng (热茶)", "B. Cà phê (咖啡)", "C. Nước lọc (水)", "D. Trà sữa (奶茶)"],
      correct: "A",
      explain: "Vị khách chọn: '给我一杯热茶' (Cho tôi một ly trà nóng).",
    },
    {
      lines: [
        { speaker: "买者", zh: "老板，这个苹果多少钱一斤？", pinyin: "Lǎobǎn, zhè ge píngguǒ duōshao qián yì jīn?", vi: "Ông chủ, táo này bao nhiêu tiền một cân?" },
        { speaker: "老板", zh: "五块钱一斤，很甜很好吃。", pinyin: "Wǔ kuài qián yì jīn, hěn tián hěn hǎochī.", vi: "Năm tệ một cân, ngọt và ngon lắm." },
      ],
      audioText: "买者说：老板，这个苹果多少钱一斤？老板说：五块钱一斤，很甜很好吃。",
      prompt: "Câu 7: Một cân táo có giá bao nhiêu?",
      options: ["A. 5 tệ (五块钱)", "B. 10 tệ (十块钱)", "C. 3 tệ (三块钱)", "D. 15 tệ (十五块钱)"],
      correct: "A",
      explain: "Chủ quán nói: '五块钱一斤' (5 tệ một cân). Đáp án A chính xác.",
    },
    {
      lines: [
        { speaker: "王兰", zh: "你会说汉语吗？", pinyin: "Nǐ huì shuō Hànyǔ ma?", vi: "Bạn biết nói tiếng Trung không?" },
        { speaker: "安娜", zh: "我会说一点儿，我的朋友也会说。", pinyin: "Wǒ huì shuō yìdiǎnr, wǒ de péngyou yě huì shuō.", vi: "Tôi biết nói một chút, bạn tôi cũng biết nói." },
      ],
      audioText: "王兰说：你会说汉语吗？安娜说：我会说一点儿，我的朋友也会说。",
      prompt: "Câu 8: Khả năng nói tiếng Trung của Anna như thế nào?",
      options: ["A. Biết nói một chút (会说一点儿)", "B. Không biết nói (不会说)", "C. Nói rất giỏi (说得很好)", "D. Chưa học bao giờ"],
      correct: "A",
      explain: "Anna trả lời: '我会说一点儿' (Tôi biết nói một chút).",
    },
    {
      lines: [
        { speaker: "小明", zh: "现在几点了？我们该去吃饭了。", pinyin: "Xiànzài jǐ diǎn le? Wǒmen gāi qù chīfàn le.", vi: "Bây giờ mấy giờ rồi? Chúng ta nên đi ăn cơm thôi." },
        { speaker: "小华", zh: "现在差十分十二点，走吧！", pinyin: "Xiànzài chà shí fēn shí'èr diǎn, zǒu ba!", vi: "Bây giờ là 12 giờ kém 10 phút, đi thôi!" },
      ],
      audioText: "小明说：现在几点了？小华说：现在差十分十二点，走吧！",
      prompt: "Câu 9: Lúc này là mấy giờ?",
      options: ["A. 12 giờ kém 10 phút (11:50)", "B. 12 giờ đúng (12:00)", "C. 12 giờ 10 phút (12:10)", "D. 11 giờ đúng (11:00)"],
      correct: "A",
      explain: "Tiểu Hoa nói: '差十分十二点' (Kém 10 phút nữa là 12 giờ = 11:50).",
    },
    {
      lines: [
        { speaker: "刘洋", zh: "谁是你的汉语老师？", pinyin: "Shéi shì nǐ de Hànyǔ lǎoshī?", vi: "Ai là giáo viên tiếng Trung của bạn?" },
        { speaker: "田中", zh: "林老师是我的汉语老师，她教得很好。", pinyin: "Lín lǎoshī shì wǒ de Hànyǔ lǎoshī, tā jiāo de hěn hǎo.", vi: "Cô Lâm là giáo viên dạy tiếng Trung của tôi, cô dạy rất hay." },
      ],
      audioText: "刘洋说：谁是你的汉语老师？田中说：林老师是我的汉语老师，她教得很好。",
      prompt: "Câu 10: Giáo viên dạy tiếng Trung của Điền Trung là ai?",
      options: ["A. Cô Lâm (林老师)", "B. Thầy Vương (王老师)", "C. Thầy Lý (李老师)", "D. Cô Trương (张老师)"],
      correct: "A",
      explain: "Điền Trung khẳng định: '林老师是我的汉语老师' (Cô Lâm là cô giáo của tôi).",
    },
  ];

  dialItems.forEach((item, i) => {
    result.push({
      id: `ld-${lessonNumber}-${i + 1}`,
      mode: "listen_dialogue",
      grammarRule: `Hội thoại HSK thực tế · Bài ${lessonNumber}`,
      prompt: item.prompt,
      dialogueLines: item.lines,
      audioText: item.audioText,
      options: item.options,
      correctAnswer: item.correct,
      explanation: item.explain,
    });
  });

  // 3. DẠNG 3: ĐIỀN TỪ VÀO CÂU (10 CÂU KHÁC BIỆT HOÀN TOÀN)
  const fillItems: Array<{
    sentence: string;
    pinyin: string;
    options: string[];
    correct: string;
    explain: string;
  }> = [
    {
      sentence: "我 ___ 是中国留学生，我是越南人。",
      pinyin: "Wǒ ___ shì Zhōngguó liúxuéshēng, wǒ shì Yuènán rén.",
      options: ["A. 不 (bù)", "B. 没 (méi)", "C. 很 (hěn)", "D. 也 (yě)"],
      correct: "A",
      explain: "Phủ định của động từ '是' bắt buộc dùng '不' (不是), không bao giờ dùng '没'.",
    },
    {
      sentence: "他们两个人 ___ 是北京大学的学生。",
      pinyin: "Tāmen liǎng gè rén ___ shì Běijīng Dàxué de xuésheng.",
      options: ["A. 都 (dōu)", "B. 不 (bù)", "C. 很 (hěn)", "D. 呢 (ne)"],
      correct: "A",
      explain: "Phó từ '都' (đều) dùng sau chủ ngữ số nhiều (hai người bọn họ) để chỉ sự đồng nhất.",
    },
    {
      sentence: "你想喝茶 ___ 喝咖啡？",
      pinyin: "Nǐ xiǎng hē chá ___ hē kāfēi?",
      options: ["A. 还是 (háishì)", "B. 或者 (huòzhě)", "C. 和 (hé)", "D. 也 (yě)"],
      correct: "A",
      explain: "Trong câu hỏi lựa chọn 'A hay là B', bắt buộc dùng liên từ '还是'. '或者' chỉ dùng trong câu trần thuật.",
    },
    {
      sentence: "书桌上有两 ___ 汉语词典。",
      pinyin: "Shūzhuō shang yǒu liǎng ___ Hànyǔ cídiǎn.",
      options: ["A. 本 (běn)", "B. 个 (gè)", "C. 张 (zhāng)", "D. 支 (zhī)"],
      correct: "A",
      explain: "Lượng từ dành cho sách, từ điển, vở là '本' (两本词典).",
    },
    {
      sentence: "请问，李老师今天 ___ 学校了吗？",
      pinyin: "Qǐngwèn, Lǐ lǎoshī jīntiān ___ xuéxiào le ma?",
      options: ["A. 来 (lái)", "B. 是 (shì)", "C. 很 (hěn)", "D. 的 (de)"],
      correct: "A",
      explain: "Động từ '来' (đến) phù hợp với ngữ cảnh 'Thầy Lý đã đến trường chưa?'.",
    },
    {
      sentence: "他家一共有四 ___ 人。",
      pinyin: "Tā jiā yígòng yǒu sì ___ rén.",
      options: ["A. 口 (kǒu)", "B. 本 (běn)", "C. 只 (zhī)", "D. 条 (tiáo)"],
      correct: "A",
      explain: "Lượng từ đếm số lượng thành viên trong gia đình thường dùng '口' (四口人).",
    },
    {
      sentence: "这本汉语书很 ___ 意思，我很喜欢看。",
      pinyin: "Zhè běn Hànyǔ shū hěn ___ yìsi, wǒ hěn xǐhuan kàn.",
      options: ["A. 有 (yǒu)", "B. 是 (shì)", "C. 去 (qù)", "D. 在 (zài)"],
      correct: "A",
      explain: "Cụm tính từ '有意思' có nghĩa là 'thú vị, hay ho'.",
    },
    {
      sentence: "请问，学校的图书馆 ___ 哪儿？",
      pinyin: "Qǐngwèn, xuéxiào de túshūguǎn ___ nǎr?",
      options: ["A. 在 (zài)", "B. 是 (shì)", "C. 有 (yǒu)", "D. 去 (qù)"],
      correct: "A",
      explain: "Động từ vị trí '在' dùng để hỏi vị trí: Đối tượng + 在 + 哪儿？ (Thư viện ở đâu?).",
    },
    {
      sentence: "今天天气 ___ 好，我们去公园散步吧。",
      pinyin: "Jīntiān tiānqì ___ hǎo, wǒmen qù gōngyuán sànbù ba.",
      options: ["A. 很 (hěn)", "B. 没 (méi)", "C. 吗 (ma)", "D. 的 (de)"],
      correct: "A",
      explain: "Trước hình dung từ/tính từ (好) thường dùng phó từ mức độ '很' (rất tốt, rất đẹp).",
    },
    {
      sentence: "我是大一的新学生，你 ___？",
      pinyin: "Wǒ shì dàyī de xīn xuésheng, nǐ ___?",
      options: ["A. 呢 (ne)", "B. 吗 (ma)", "C. 吧 (ba)", "D. 啊 (a)"],
      correct: "A",
      explain: "Trợ từ ngữ khí '呢' tạo câu hỏi tỉnh lược ngữ cảnh: 'Tôi là sinh viên năm nhất, còn bạn thì sao?'.",
    },
  ];

  fillItems.forEach((item, i) => {
    result.push({
      id: `fb-${lessonNumber}-${i + 1}`,
      mode: "fill_blank",
      grammarRule: `Điền hư từ & cấu trúc · Câu ${i + 1}`,
      prompt: `Câu ${i + 1}: Chọn từ thích hợp nhất để điền vào chỗ trống:`,
      sentence: item.sentence,
      pinyin: item.pinyin,
      options: item.options,
      correctAnswer: item.correct,
      explanation: item.explain,
    });
  });

  // 4. DẠNG 4: SẮP XẾP TỪ THÀNH CÂU (10 CÂU ĐA DẠNG)
  const reorderItems: Array<{
    sentence: string;
    pinyin: string;
    scrambled: string[];
    correct: string;
    explain: string;
  }> = [
    {
      sentence: "我是中国留学生。",
      pinyin: "Wǒ shì Zhōngguó liúxuéshēng.",
      scrambled: ["留学生", "中国", "我", "是"],
      correct: "我是中国留学生。",
      explain: "Trật tự câu phán đoán: Chủ ngữ (我) + Động từ (是) + Định ngữ (中国) + Trung tâm ngữ (留学生).",
    },
    {
      sentence: "王老师今天很忙。",
      pinyin: "Wáng lǎoshī jīntiān hěn máng.",
      scrambled: ["很", "今天", "忙", "王老师"],
      correct: "王老师今天很忙。",
      explain: "Trật tự câu vị ngữ hình dung từ: Chủ ngữ (王老师) + Thời gian (今天) + Phó từ (很) + Tính từ (忙).",
    },
    {
      sentence: "你叫什么名字？",
      pinyin: "Nǐ jiào shénme míngzi?",
      scrambled: ["名字", "叫", "你", "什么", "？"],
      correct: "你叫什么名字？",
      explain: "Trật tự câu hỏi tên: Chủ ngữ (你) + Động từ (叫) + Đại từ nghi vấn (什么) + Danh từ (名字) + ？",
    },
    {
      sentence: "我有两个中国朋友。",
      pinyin: "Wǒ yǒu liǎng gè Zhōngguó péngyou.",
      scrambled: ["中国朋友", "有", "我", "两个"],
      correct: "我有两个中国朋友。",
      explain: "Trật tự câu vị ngữ động từ '有': Chủ ngữ (我) + 有 + Số lượng từ (两个) + Danh từ (中国朋友).",
    },
    {
      sentence: "他在图书馆看书。",
      pinyin: "Tā zài túshūguǎn kàn shū.",
      scrambled: ["看书", "在图书馆", "他"],
      correct: "他在图书馆看书。",
      explain: "Trật tự trạng ngữ chỉ nơi chốn: Chủ ngữ (他) + Nơi chốn (在图书馆) + Hành động (看书).",
    },
    {
      sentence: "我们都学汉语。",
      pinyin: "Wǒmen dōu xué Hànyǔ.",
      scrambled: ["汉语", "学", "都", "我们"],
      correct: "我们都学汉语。",
      explain: "Phó từ '都' đứng trước động từ: Chủ ngữ (我们) + Phó từ (都) + Động từ (学) + Tân ngữ (汉语).",
    },
    {
      sentence: "爸爸很喜欢喝茶。",
      pinyin: "Bàba hěn xǐhuan hē chá.",
      scrambled: ["喝茶", "喜欢", "很", "爸爸"],
      correct: "爸爸很喜欢喝茶。",
      explain: "Trật tự phó từ năng nguyện: Chủ ngữ (爸爸) + Phó từ (很) + Động từ tâm lý (喜欢) + Động từ (喝茶).",
    },
    {
      sentence: "这是我的电脑。",
      pinyin: "Zhè shì wǒ de diànnǎo.",
      scrambled: ["电脑", "是", "我的", "这"],
      correct: "这是我的电脑。",
      explain: "Đại từ chỉ thị (这) + 是 + Cụm danh từ sở hữu (我的电脑).",
    },
    {
      sentence: "他明天去北京。",
      pinyin: "Tā míngtiān qù Běijīng.",
      scrambled: ["北京", "去", "明天", "他"],
      correct: "他明天去北京。",
      explain: "Trạng ngữ chỉ thời gian đứng trước động từ: Chủ ngữ (他) + Thời gian (明天) + Động từ (去) + Điểm đến (北京).",
    },
    {
      sentence: "我们的学校很漂亮。",
      pinyin: "Wǒmen de xuéxiào hěn piàoliang.",
      scrambled: ["很漂亮", "学校", "我们的"],
      correct: "我们的学校很漂亮。",
      explain: "Chủ ngữ (我们的学校) + Phó từ mức độ (很) + Tính từ (漂亮).",
    },
  ];

  reorderItems.forEach((item, i) => {
    result.push({
      id: `ro-${lessonNumber}-${i + 1}`,
      mode: "reorder",
      grammarRule: `Trật tự câu chuẩn HSK · Câu ${i + 1}`,
      prompt: `Câu ${i + 1}: Sắp xếp các từ bên dưới thành câu hoàn chỉnh và chính xác:`,
      sentence: item.sentence,
      pinyin: item.pinyin,
      scrambledWords: item.scrambled,
      correctAnswer: item.correct,
      explanation: item.explain,
    });
  });

  // 5. DẠNG 5: SỬA CÂU SAI NGỮ PHÁP (10 LỖI SAI KINH ĐIỂN KHÁC NHAU)
  const mistakeItems: Array<{
    wrong: string;
    wrongPy: string;
    options: string[];
    correct: string;
    explain: string;
  }> = [
    {
      wrong: "我家有二口人。",
      wrongPy: "Wǒ jiā yǒu èr kǒu rén.",
      options: ["A. 我家有两口人。", "B. 我家两口人有。", "C. 我家有二个人。", "D. 我家有两个。"],
      correct: "A",
      explain: "LỖI SAI: Dùng '二' trước lượng từ. Quy tắc chuẩn: Đứng trước lượng từ để đếm số lượng thì bắt buộc dùng '两' (两口人).",
    },
    {
      wrong: "我去图书馆明天下午。",
      wrongPy: "Wǒ qù túshūguǎn míngtiān xiàwǔ.",
      options: ["A. 我明天下午去图书馆。", "B. 明天下午我去图书馆了没。", "C. 我去明天下午图书馆。", "D. 图书馆明天下午我去。"],
      correct: "A",
      explain: "LỖI SAI: Đặt thời gian sau động từ. Quy tắc chuẩn: Trạng từ chỉ thời gian luôn đứng trước động từ (Chủ ngữ + Thời gian + Động từ).",
    },
    {
      wrong: "你叫什么名字吗？",
      wrongPy: "Nǐ jiào shénme míngzi ma?",
      options: ["A. 你叫什么名字？", "B. 吗你叫什么名字？", "C. 你叫名字什么吗？", "D. 什么名字叫你？"],
      correct: "A",
      explain: "LỖI SAI: Dùng cả '什么' và '吗'. Quy tắc chuẩn: Khi trong câu đã có đại từ nghi vấn (什么, 谁, 哪儿) thì không dùng thêm trợ từ '吗'.",
    },
    {
      wrong: "我们三个学生们都很高兴。",
      wrongPy: "Wǒmen sān gè xuésheng men dōu hěn gāoxìng.",
      options: ["A. 我们三个学生都很高兴。", "B. 我们三个学生们都很高。", "C. 三个学生们我们都很高兴。", "D. 我们学生们三个都很高兴。"],
      correct: "A",
      explain: "LỖI SAI: Thừa hậu tố '们'. Quy tắc chuẩn: Khi phía trước đã có số từ và lượng từ cụ thể (三个学生) thì tuyệt đối không thêm '们'.",
    },
    {
      wrong: "他是也很忙。",
      wrongPy: "Tā shì yě hěn máng.",
      options: ["A. 他也很忙。", "B. 他很忙也是。", "C. 是他也忙。", "D. 也很忙是他。"],
      correct: "A",
      explain: "LỖI SAI: Dùng thừa '是' trước tính từ và đặt '也' sai chỗ. Quy tắc: Phó từ '也' đứng trước tính từ '很忙' (他也很忙).",
    },
    {
      wrong: "我买一书。",
      wrongPy: "Wǒ mǎi yì shū.",
      options: ["A. 我买一本书。", "B. 我买个书。", "C. 我书买一。", "D. 一书我买。"],
      correct: "A",
      explain: "LỖI SAI: Thiếu lượng từ. Quy tắc: Giữa số từ (一) và danh từ (书) bắt buộc phải có lượng từ thích hợp là '本' (一本书).",
    },
    {
      wrong: "他不有汉语词典。",
      wrongPy: "Tā bù yǒu Hànyǔ cídiǎn.",
      options: ["A. 他没有汉语词典。", "B. 他不具有汉语词典。", "C. 汉语词典他不有。", "D. 他没是汉语词典。"],
      correct: "A",
      explain: "LỖI SAI: Dùng '不' để phủ định động từ '有'. Quy tắc: Phủ định của '有' bắt buộc phải dùng '没' (没有).",
    },
    {
      wrong: "好老师！我是新同学。",
      wrongPy: "Hǎo lǎoshī! Wǒ shì xīn tóngxué.",
      options: ["A. 老师好！我是新同学。", "B. 老师是好！我是新同学。", "C. 是老师好！我是新同学。", "D. 好学生老师！我是新同学。"],
      correct: "A",
      explain: "LỖI SAI: Đảo trật tự chào hỏi. Quy tắc: Danh xưng đối tượng + 好 (老师好！). Không nói '好老师'.",
    },
    {
      wrong: "他在看书家。",
      wrongPy: "Tā zài kàn shū jiā.",
      options: ["A. 他在家看书。", "B. 他看书在家。", "C. 在看书他在家。", "D. 家他在看书。"],
      correct: "A",
      explain: "LỖI SAI: Đặt cụm từ nơi chốn lộn xộn. Quy tắc: Cụm giới từ chỉ nơi chốn '在家' phải đứng trước hành động '看书' (他在家看书).",
    },
    {
      wrong: "这是谁电脑？",
      wrongPy: "Zhè shì shéi diànnǎo?",
      options: ["A. 这是谁的电脑？", "B. 这谁是电脑？", "C. 谁的电脑是这？", "D. 电脑是谁这？"],
      correct: "A",
      explain: "LỖI SAI: Thiếu trợ từ sở hữu '的'. Quy tắc: Khi hỏi hoặc biểu đạt sở hữu cần có '的' giữa đại từ và danh từ (谁的电脑).",
    },
  ];

  mistakeItems.forEach((item, i) => {
    result.push({
      id: `cm-${lessonNumber}-${i + 1}`,
      mode: "correct_mistake",
      grammarRule: `Sửa lỗi sai ngữ pháp · Câu ${i + 1}`,
      prompt: `Câu ${i + 1}: Tìm lỗi sai ngữ pháp trong câu bên dưới và chọn câu sửa chuẩn xác nhất:`,
      wrongSentence: item.wrong,
      wrongSentencePinyin: item.wrongPy,
      options: item.options,
      correctAnswer: item.correct,
      explanation: item.explain,
    });
  });

  return result;
}

export default function GrammarPracticeSuite({
  grammarList,
  vocabList = [],
  dialogueList = [],
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId = "guest",
  handleSpeak,
}: GrammarPracticeSuiteProps) {
  // Thời gian học thực tế hôm nay & trong tuần (ĐỘNG 100%)
  const [isMounted, setIsMounted] = useState(false);
  const [todayStudySec, setTodayStudySec] = useState(0);
  const [weeklyStudySec, setWeeklyStudySec] = useState(0);

  // State Quản lý Trạng thái Ngữ pháp do Học sinh tự đánh dấu (Lưu LocalStorage theo User)
  const [userGrammarStatuses, setUserGrammarStatuses] = useState<Record<string, "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED">>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hanyu_grammar_status_${studentId || "default"}`);
        if (stored) {
          setUserGrammarStatuses(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("load grammar status error", e);
      }
    }
  }, [studentId]);

  const handleToggleGrammarStatus = (grammarId: string, currentStatus: "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatusMap: Record<string, "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED"> = {
      NOT_LEARNED: "REVIEW_NEEDED",
      REVIEW_NEEDED: "MASTERED",
      MASTERED: "NOT_LEARNED",
    };
    const nextStatus = nextStatusMap[currentStatus] || "REVIEW_NEEDED";

    setUserGrammarStatuses((prev) => {
      const next = { ...prev, [grammarId]: nextStatus };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`hanyu_grammar_status_${studentId || "default"}`, JSON.stringify(next));
        } catch (err) {}
      }
      return next;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    setTodayStudySec(getTodayStudySeconds(studentId));
    setWeeklyStudySec(getWeeklyStudySeconds(studentId));

    const timer = setInterval(() => {
      recordStudyTime(3, studentId);
      setTodayStudySec(getTodayStudySeconds(studentId));
      setWeeklyStudySec(getWeeklyStudySeconds(studentId));
    }, 3000);
    return () => clearInterval(timer);
  }, [studentId]);

  // Chuẩn hóa danh sách cấu trúc ngữ pháp động kèm trạng thái thực của học sinh
  const normalizedGrammars: NormalizedGrammarPoint[] = useMemo(() => {
    const list = normalizeGrammarList(grammarList, lessonNumber);
    return list.map((g) => ({
      ...g,
      status: userGrammarStatuses[g.id] || g.status,
    }));
  }, [grammarList, lessonNumber, userGrammarStatuses]);

  // Vị trí cấu trúc ngữ pháp đang chọn bên cột trái
  const [selectedGrammarIdx, setSelectedGrammarIdx] = useState(0);

  // Chế độ bài tập đang chọn (5 dạng)
  const [activeExerciseMode, setActiveExerciseMode] =
    useState<GrammarExerciseMode>("choose_correct");

  // Vị trí câu hỏi hiện tại trong 10 câu
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // State trả lời trắc nghiệm
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State sắp xếp câu
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderCorrect, setOrderCorrect] = useState(false);

  // State tìm kiếm & sắp xếp cột trái
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"DEFAULT" | "STATUS">("DEFAULT");

  // State các tab con bên cột phải (Nội dung ngữ pháp hiện tại)
  const [subTabRight, setSubTabRight] = useState<"GIẢI THÍCH" | "CẤU TRÚC" | "VÍ DỤ" | "LƯU Ý">("GIẢI THÍCH");

  // State các tab con ở Vùng 6 (Giải thích mở rộng đáy)
  const [subTabBottom, setSubTabBottom] = useState<"TÓM TẮT" | "CÁCH DÙNG" | "VÍ DỤ" | "LƯU Ý" | "LỖI THƯỜNG GẶP">("TÓM TẮT");

  // Điểm số & Số câu đúng
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Điểm ngữ pháp hiện tại
  const currentGrammar = normalizedGrammars[selectedGrammarIdx] || normalizedGrammars[0];

  // Sinh 10 câu hỏi cho mỗi dạng bài
  const allExercises = useMemo(() => {
    return generateLessonGrammarExercises(
      normalizedGrammars,
      vocabList,
      dialogueList,
      hskLevel,
      lessonNumber
    );
  }, [normalizedGrammars, vocabList, dialogueList, hskLevel, lessonNumber]);

  // Danh sách câu hỏi của dạng bài đang chọn
  const currentModeExercises = useMemo(() => {
    return allExercises.filter((ex) => ex.mode === activeExerciseMode);
  }, [allExercises, activeExerciseMode]);

  const currentExercise = currentModeExercises[currentQuestionIdx] || currentModeExercises[0];

  // Lọc danh sách ngữ pháp bên cột trái theo tìm kiếm
  const filteredGrammars = useMemo(() => {
    if (!searchQuery.trim()) return normalizedGrammars;
    const q = searchQuery.toLowerCase().trim();
    return normalizedGrammars.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.structure.toLowerCase().includes(q) ||
        g.meaningVi.toLowerCase().includes(q)
    );
  }, [normalizedGrammars, searchQuery]);

  // Reset trạng thái khi chuyển câu hoặc chuyển dạng bài
  useEffect(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setOrderChecked(false);
    setOrderCorrect(false);

    if (currentExercise && currentExercise.mode === "reorder" && currentExercise.scrambledWords) {
      setAvailableTokens([...currentExercise.scrambledWords]);
      setAssembledTokens([]);
    }
  }, [currentExercise, activeExerciseMode, currentQuestionIdx]);

  // Xử lý nộp trắc nghiệm
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    const letter = opt.trim().charAt(0);
    const isCorrect = letter === currentExercise.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }
  };

  // Xử lý sắp xếp từ
  const handlePickToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAssembledTokens((prev) => [...prev, word]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAvailableTokens((prev) => [...prev, word]);
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckReorder = () => {
    if (assembledTokens.length === 0) return;
    const joined = assembledTokens.join("").trim();
    const correctClean = (currentExercise.sentence || "").replace(/\s+/g, "").trim();
    const isMatch = joined === correctClean || assembledTokens.join(" ") === currentExercise.correctAnswer;

    setOrderCorrect(isMatch);
    setOrderChecked(true);

    if (isMatch) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      handleSpeak(currentExercise.sentence || joined);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentModeExercises.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
    }
  };

  // Thống kê nhanh
  const masteredCount = normalizedGrammars.filter((g) => g.status === "MASTERED").length;
  const reviewCount = normalizedGrammars.filter((g) => g.status === "REVIEW_NEEDED").length;
  const notLearnedCount = normalizedGrammars.filter((g) => g.status === "NOT_LEARNED").length;
  const accuracyPercentage =
    currentQuestionIdx > 0 ? Math.round((correctCount / (currentQuestionIdx + 1)) * 100) : 80;

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. VÙNG 1: BANNER TIÊU ĐỀ BÀI LUYỆN NGỮ PHÁP & 5 THẺ THỐNG KÊ        */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F0] via-[#F4EFE6] to-[#EAE3D2] border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#17382F] border border-[#BC9B6B]/40 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7 text-[#204434]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#17382F] flex items-center gap-2.5">
                <span>Luyện ngữ pháp</span>
                <span className="text-xl sm:text-2xl font-serif text-[#8F6D3B]">语法训练</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#315E48] mt-1 font-medium">
                Hiểu – Luyện – Vận dụng | Ghi nhớ cấu trúc qua nhiều dạng bài thực hành
              </p>
            </div>
          </div>

          <div className="p-3.5 px-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E5DEC9] shadow-2xs max-w-xs text-right hidden sm:block">
            <p className="font-serif font-bold text-sm text-[#204434] tracking-wide">
              “积少成多，学无止境。”
            </p>
            <p className="text-[11px] text-[#8F6D3B] mt-0.5">
              Tích tiểu thành đa, học không có giới hạn.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Thẻ thống kê ngữ pháp */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Thẻ 1: Cấu trúc trong bài */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#204434] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {normalizedGrammars.length} / {normalizedGrammars.length}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium truncate max-w-[120px]">
              Cấu trúc trong bài
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate max-w-[120px]">
              Bài {String(lessonNumber).padStart(2, "0")}: {lessonTitleZh}
            </p>
          </div>
        </div>

        {/* Thẻ 2: Đã nắm vững */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
            75%
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-emerald-800">
              75%
            </div>
            <p className="text-[10px] text-emerald-900/80 font-bold">
              Đã nắm vững
            </p>
          </div>
        </div>

        {/* Thẻ 3: Cần ôn */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-amber-800">
              {reviewCount}
            </div>
            <p className="text-[10px] text-amber-900/80 font-bold">
              Cần ôn
            </p>
          </div>
        </div>

        {/* Thẻ 4: Chưa nắm */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-rose-800">
              {notLearnedCount}
            </div>
            <p className="text-[10px] text-rose-900/80 font-bold">
              Chưa nắm
            </p>
          </div>
        </div>

        {/* Thẻ 5: Thời gian luyện hôm nay */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#204434] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {isMounted ? formatStudyTimeVi(todayStudySec) : "0 phút"}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium">
              Thời gian luyện Hôm nay
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate" title={`Tuần này: ${isMounted ? formatStudyTimeVi(weeklyStudySec) : "0 phút"}`}>
              Tuần này: {isMounted ? formatStudyTimeVi(weeklyStudySec) : "0 phút"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. VÙNG 2: CHỌN DẠNG BÀI LUYỆN TẬP (5 DẠNG)                        */}
      {/* =================================================================== */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#204434]">
          Chọn dạng bài luyện tập (5 dạng)
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {/* Dạng 1: Chọn câu đúng */}
          <button
            onClick={() => {
              setActiveExerciseMode("choose_correct");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "choose_correct"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Chọn câu đúng (10 câu)</span>
          </button>

          {/* Dạng 2: Nghe hội thoại */}
          <button
            onClick={() => {
              setActiveExerciseMode("listen_dialogue");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "listen_dialogue"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Nghe hội thoại (10 câu)</span>
          </button>

          {/* Dạng 3: Điền từ */}
          <button
            onClick={() => {
              setActiveExerciseMode("fill_blank");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "fill_blank"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>3. Điền từ (10 câu)</span>
          </button>

          {/* Dạng 4: Sắp xếp câu */}
          <button
            onClick={() => {
              setActiveExerciseMode("reorder");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "reorder"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>4. Sắp xếp câu (10 câu)</span>
          </button>

          {/* Dạng 5: Sửa câu sai */}
          <button
            onClick={() => {
              setActiveExerciseMode("correct_mistake");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "correct_mistake"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>5. Sửa câu sai (10 câu)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. VÙNG 3, 4, 5: HÀNG GIỮA (3 CỘT: DANH SÁCH + LÀM BÀI + TIẾN ĐỘ)   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* CỘT TRÁI (VÙNG 3): DANH SÁCH CẤU TRÚC NGỮ PHÁP (3.5 COLS)         */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3.5 bg-white border border-[#E5DEC9] rounded-3xl p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-serif font-bold text-xs text-[#204434]">
              Danh sách cấu trúc ngữ pháp ({filteredGrammars.length})
            </h3>
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="text-[10px] font-semibold text-[#204434] bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="DEFAULT">Theo thứ tự bài học</option>
              <option value="STATUS">Theo trạng thái</option>
            </select>
          </div>

          {/* Ô Tìm kiếm cấu trúc */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
            <input
              type="text"
              placeholder="Tìm cấu trúc ngữ pháp (ví dụ: 你好, 是, ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-xs text-[#204434] placeholder-[#6B766D] focus:outline-hidden focus:border-[#204434]"
            />
          </div>

          {/* Danh sách các card cấu trúc ngữ pháp */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
            {filteredGrammars.map((item, idx) => {
              const isSelected = selectedGrammarIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedGrammarIdx(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-[#E8F3EE] border-[#17382F] shadow-2xs ring-1 ring-[#17382F]"
                      : "bg-[#FFFCF6] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[10px] font-bold text-[#8F6D3B] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#17382F] leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#6B766D] mt-0.5 font-medium">
                          {item.structure}
                        </p>
                      </div>
                    </div>

                    {/* Nút chuyển đổi trạng thái ngữ pháp linh hoạt (Học sinh tự điền/chọn) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleGrammarStatus(item.id, item.status, e)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                        item.status === "MASTERED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : item.status === "REVIEW_NEEDED"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                      }`}
                      title="Bấm để thay đổi trạng thái học: Chưa học ➔ Đang ôn ➔ Đã hiểu"
                    >
                      {item.status === "MASTERED" ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Đã hiểu</span>
                        </>
                      ) : item.status === "REVIEW_NEEDED" ? (
                        <>
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Đang ôn</span>
                        </>
                      ) : (
                        <span>Chưa học</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT GIỮA (VÙNG 4): KHUNG LÀM BÀI TẬP LUYỆN NGỮ PHÁP (5 COLS)       */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 xl:col-span-5 bg-white border border-[#E5DEC9] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17382F]">
                Ngữ pháp {selectedGrammarIdx + 1}/{normalizedGrammars.length}
              </span>
              <span className="text-[#8F6D3B] font-medium hidden sm:inline">
                {currentGrammar.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / 10) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#8F6D3B]">
                {currentQuestionIdx + 1}/10
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] font-bold">
                HSK {hskLevel} · Bài {String(lessonNumber).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#17382F]">
              {currentExercise?.prompt}
            </h3>

            {/* Dạng Sắp Xếp Câu */}
            {activeExerciseMode === "reorder" && (
              <div className="space-y-3 py-2">
                <div className="min-h-[50px] p-3 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#BC9B6B] flex flex-wrap gap-2 items-center justify-center">
                  {assembledTokens.map((tok, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveToken(tok, i)}
                      className="px-3 py-1.5 rounded-xl bg-[#17382F] text-white text-sm font-serif font-bold shadow-xs cursor-pointer hover:bg-rose-700 transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {availableTokens.map((tok, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePickToken(tok, idx)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm font-serif font-bold shadow-2xs hover:bg-[#FAF7F0] cursor-pointer transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleCheckReorder}
                    className="px-6 py-2 rounded-xl bg-[#17382F] text-white text-xs font-bold hover:bg-[#0f241e] transition cursor-pointer shadow-xs"
                  >
                    Kiểm tra câu
                  </button>
                </div>
              </div>
            )}

            {/* Dạng Điền Từ / Sửa Câu Sai: Hiển thị câu mẫu */}
            {(activeExerciseMode === "fill_blank" || activeExerciseMode === "correct_mistake") && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-center">
                <p className="font-serif font-bold text-lg text-[#17382F]">
                  {currentExercise.sentence || currentExercise.wrongSentence}
                </p>
                <p className="text-xs text-[#8F6D3B] font-mono">
                  {currentExercise.pinyin || currentExercise.wrongSentencePinyin}
                </p>
              </div>
            )}

            {/* Dạng Nghe Hội Thoại: Nút phát âm thanh */}
            {activeExerciseMode === "listen_dialogue" && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleSpeak(currentExercise.audioText || "")}
                  className="w-14 h-14 mx-auto rounded-full bg-[#17382F] text-white hover:bg-[#0f241e] flex items-center justify-center shadow-md cursor-pointer transition"
                  title="Nghe hội thoại"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                  Bấm loa để nghe đoạn hội thoại (5 - 10 giây)
                </span>
              </div>
            )}

            {/* 4 Lựa chọn A, B, C, D (cho choose_correct, listen_dialogue, fill_blank, correct_mistake) */}
            {activeExerciseMode !== "reorder" && currentExercise?.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {currentExercise.options.map((opt, idx) => {
                  const letter = opt.trim().charAt(0);
                  const isSelected = selectedOpt === opt;
                  const isCorrect = letter === currentExercise.correctAnswer;
                  let style =
                    "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";

                  if (isAnswered) {
                    if (isCorrect) {
                      style = "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold ring-2 ring-emerald-200";
                    } else if (isSelected) {
                      style = "bg-rose-50 text-rose-800 border-rose-500 font-bold ring-2 ring-rose-200";
                    } else {
                      style = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between shadow-2xs ${style}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Khối Giải Thích Sau Khi Trả Lời */}
            {(isAnswered || orderChecked) && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2 text-xs text-[#204434] animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedOpt?.trim().charAt(0) === currentExercise.correctAnswer || orderCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đúng!</span>
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa chính xác!</span>
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-[#315E48]">
                  {currentExercise.explanation}
                </p>
              </div>
            )}

            {/* Hàng nút hành động dưới câu hỏi */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnswered(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#8F6D3B] hover:bg-[#FAF7F0] flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xem giải thích chi tiết</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      currentExercise.sentence ||
                        currentExercise.audioText ||
                        currentExercise.prompt
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#204434] hover:bg-[#FAF7F0] flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe lại</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl bg-[#17382F] hover:bg-[#0f241e] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT PHẢI (VÙNG 5): TIẾN ĐỘ NGỮ PHÁP & NỘI DUNG HIỆN TẠI (3.5 COLS) */}
        {/* ================================================================= */}
        <div className="lg:col-span-12 xl:col-span-3.5 space-y-4">
          {/* 1. Tiến độ ngữ pháp */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-sm text-[#17382F]">
                Tiến độ ngữ pháp
              </span>
              <span className="text-[11px] text-[#8F6D3B] font-bold hover:underline cursor-pointer">
                Xem chi tiết &gt;
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut progress chart */}
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600 bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <span>{masteredCount}/{normalizedGrammars.length}</span>
                <span className="text-[9px] font-normal text-emerald-900">cấu trúc</span>
              </div>

              {/* Thông số chi tiết */}
              <div className="space-y-1.5 text-xs text-[#315E48] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <BookMarked className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Đã luyện:
                  </span>
                  <strong className="text-[#17382F]">3</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Độ chính xác:
                  </span>
                  <strong className="text-emerald-700">{accuracyPercentage}%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Thời gian:
                  </span>
                  <strong className="text-[#17382F] font-mono">{isMounted ? formatTimerMMSS(todayStudySec) : "00:00"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Nội dung ngữ pháp hiện tại */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <span className="font-serif font-bold text-xs text-[#17382F] block">
              Nội dung ngữ pháp hiện tại
            </span>

            {/* 4 Tab con: Giải thích | Cấu trúc | Ví dụ | Lưu ý */}
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E5DEC9] text-[10px] font-bold">
              {(["GIẢI THÍCH", "CẤU TRÚC", "VÍ DỤ", "LƯU Ý"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabRight(tab)}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                    subTabRight === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:text-[#17382F]"
                  }`}
                >
                  {tab === "GIẢI THÍCH"
                    ? "Giải thích"
                    : tab === "CẤU TRÚC"
                    ? "Cấu trúc"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : "Lưu ý"}
                </button>
              ))}
            </div>

            {/* Chi tiết nội dung tab con */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#17382F]">
                  {currentGrammar.titleZh || currentGrammar.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentGrammar.titleZh || currentGrammar.title)}
                  className="p-1 rounded-full text-[#8F6D3B] hover:text-[#17382F] cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#6B766D] font-medium">
                {currentGrammar.meaningVi}
              </p>

              {/* Mẫu cấu trúc */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-[11px] font-mono">
                <span className="text-[#8F6D3B] font-bold block font-sans text-[10px]">Cấu trúc:</span>
                <p className="text-[#17382F] font-bold">{currentGrammar.structure}</p>
                <p className="text-[#315E48] font-sans text-[10px]">{currentGrammar.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. VÙNG 6: HÀNG DƯỚI CÙNG (3 KHỐI: GIẢI THÍCH / VÍ DỤ / MẸO GHI NHỚ) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* Khối 1 (Trái): Giải thích ngữ pháp (5 tab con) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#17382F]">
              Giải thích ngữ pháp
            </span>
          </div>

          {/* 5 Tab con: Tóm tắt | Cách dùng | Ví dụ | Lưu ý | Lỗi thường gặp */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold border-b border-[#E5DEC9]/80">
            {(["TÓM TẮT", "CÁCH DÙNG", "VÍ DỤ", "LƯU Ý", "LỖI THƯỜNG GẶP"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabBottom(tab)}
                  className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                    subTabBottom === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {tab === "TÓM TẮT"
                    ? "Tóm tắt"
                    : tab === "CÁCH DÙNG"
                    ? "Cách dùng"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : tab === "LƯU Ý"
                    ? "Lưu ý"
                    : "Lỗi thường gặp"}
                </button>
              )
            )}
          </div>

          {/* Nội dung tương ứng của tab con */}
          <div className="space-y-2 text-xs">
            {subTabBottom === "TÓM TẮT" && (
              <div className="space-y-1.5">
                <p>
                  <strong className="text-[#17382F]">Cấu trúc:</strong>{" "}
                  <span className="text-[#8F6D3B] font-mono">{currentGrammar.structure}</span>
                </p>
                <p>
                  <strong className="text-[#17382F]">Ý nghĩa:</strong>{" "}
                  <span className="text-[#315E48]">{currentGrammar.meaningVi}</span>
                </p>
                <div className="pt-1 space-y-1">
                  <strong className="text-[#17382F] block">Ví dụ:</strong>
                  {currentGrammar.examples.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-[11px] text-[#315E48]">
                      <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span> ({ex.vi})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {subTabBottom === "CÁCH DÙNG" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.usage}
              </div>
            )}

            {subTabBottom === "VÍ DỤ" && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {currentGrammar.examples.map((ex, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[#FAF7F0] text-[11px]">
                    <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span>
                    <span className="text-[#8F6D3B] font-mono block">{ex.pinyin}</span>
                    <span className="text-[#315E48]">{ex.vi}</span>
                  </div>
                ))}
              </div>
            )}

            {subTabBottom === "LƯU Ý" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.notes}
              </div>
            )}

            {subTabBottom === "LỖI THƯỜNG GẶP" && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 leading-relaxed">
                {currentGrammar.commonMistakes}
              </div>
            )}
          </div>
        </div>

        {/* Khối 2 (Giữa): Ví dụ câu (có phát âm từng câu) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
          <span className="font-serif font-bold text-sm text-[#17382F] block">
            Ví dụ câu
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentGrammar.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeak(ex.zh)}
                    className="p-1.5 rounded-full bg-white text-[#8F6D3B] hover:text-[#17382F] shadow-2xs cursor-pointer"
                    title="Nghe câu này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="font-serif font-bold text-[#17382F] mr-2">
                      {ex.zh}
                    </span>
                    <span className="text-[10px] text-[#8F6D3B] font-mono mr-2">
                      {ex.pinyin}
                    </span>
                    <span className="text-[10px] text-[#315E48]">
                      {ex.vi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối 3 (Phải): Mẹo ghi nhớ 💡 */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="font-serif font-bold text-sm text-[#17382F] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Mẹo ghi nhớ</span>
            </span>
            <p className="text-xs text-[#315E48] leading-relaxed">
              {currentGrammar.memo}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-[10px] text-[#8F6D3B] italic">
            Áp dụng mẹo trên khi làm bài tập phản xạ để ghi nhớ cấu trúc vĩnh viễn!
          </div>
        </div>
      </div>
    </div>
  );
}
