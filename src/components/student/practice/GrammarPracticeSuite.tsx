"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
} from "lucide-react";

export type GrammarExerciseMode =
  | "choose_correct" // 1. Chọn câu đúng ngữ pháp (~10 câu)
  | "listen_dialogue" // 2. Nghe hiểu hội thoại ngắn (~10 câu)
  | "fill_blank" // 3. Trắc nghiệm điền từ vào chỗ trống (~10 câu)
  | "reorder" // 4. Sắp xếp từ thành câu (~10 câu)
  | "correct_mistake"; // 5. Sửa câu sai thành đúng (~10 câu)

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string; // Tên quy tắc ngữ pháp liên quan
  prompt: string; // Đề bài / Câu hỏi
  meaningVi?: string; // Gợi ý nghĩa tiếng Việt
  
  // Dùng cho choose_correct, fill_blank, correct_mistake, listen_dialogue
  options?: string[]; // 4 lựa chọn A, B, C, D
  correctAnswer: string; // "A" | "B" | "C" | "D"
  
  // Dùng cho listen_dialogue
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  audioText?: string;
  
  // Dùng cho reorder
  sentence?: string; // Câu đúng mục tiêu (CHỈ hiển thị sau khi kiểm tra!)
  pinyin?: string;
  scrambledWords?: string[]; // Danh sách từ xáo trộn
  
  // Dùng cho correct_mistake
  wrongSentence?: string;
  wrongSentencePinyin?: string;
  
  // Giải thích chi tiết (luôn hiển thị sau khi trả lời)
  explanation: string;
}

interface GrammarPracticeSuiteProps {
  grammarList: any[];
  vocabList?: any[];
  dialogueList?: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  handleSpeak: (text: string) => void;
}

// =========================================================================
// HÀM SINH BÀI TẬP TOÀN DIỆN: 10 CÂU MỖI DẠNG KẾT HỢP NGỮ PHÁP + TỪ VỰNG + HỘI THOẠI
// =========================================================================
function generateLessonGrammarExercises(
  grammarList: any[],
  vocabList: any[],
  dialogueList: any[],
  hskLevel: number,
  lessonNumber: number
): GrammarExerciseItem[] {
  const result: GrammarExerciseItem[] = [];

  // Lấy các từ vựng tiêu biểu của bài
  const safeVocab = Array.isArray(vocabList) && vocabList.length > 0 ? vocabList : [
    { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "xin chào" },
    { hanzi: "老师", pinyin: "lǎoshī", meaning: "thầy cô giáo" },
    { hanzi: "学生", pinyin: "xuésheng", meaning: "học sinh" },
    { hanzi: "中国", pinyin: "Zhōngguó", meaning: "Trung Quốc" },
    { hanzi: "朋友", pinyin: "péngyou", meaning: "bạn bè" },
    { hanzi: "学校", pinyin: "xuéxiào", meaning: "trường học" },
  ];

  // Lấy các điểm ngữ pháp tiêu biểu của bài
  const safeGrammar = Array.isArray(grammarList) && grammarList.length > 0 ? grammarList : [
    {
      title: "Cấu trúc câu với 是 (phán đoán)",
      structure: "Chủ ngữ + 是 + Danh từ",
      example: "我是学生。(Tôi là học sinh.)",
      explanation: "Động từ '是' dùng để biểu thị nhận định, phán đoán. Phủ định dùng '不是'.",
    },
    {
      title: "Câu hỏi Yes/No với trợ từ 吗",
      structure: "Câu trần thuật + 吗?",
      example: "你是老师吗？(Bạn là giáo viên phải không?)",
      explanation: "Đặt trợ từ 吗 ở cuối câu trần thuật để biến thành câu hỏi nghi vấn.",
    },
  ];

  // Lấy hội thoại mẫu
  const safeDialogues = Array.isArray(dialogueList) && dialogueList.length > 0 ? dialogueList : [
    { speaker: "李明", zh: "你好！你是老师吗？", pinyin: "Nǐ hǎo! Nǐ shì lǎoshī ma?", vi: "Chào bạn! Bạn là giáo viên phải không?" },
    { speaker: "王美", zh: "你好！我不是老师，我是学生。", pinyin: "Nǐ hǎo! Wǒ bú shì lǎoshī, wǒ shì xuésheng.", vi: "Chào bạn! Tôi không phải giáo viên, tôi là học sinh." },
    { speaker: "李明", zh: "很高兴认识你！", pinyin: "Hěn gāoxìng rènshi nǐ!", vi: "Rất vui được làm quen với bạn!" },
    { speaker: "王美", zh: "认识你我也很高兴！", pinyin: "Rènshi nǐ wǒ yě hěn gāoxìng!", vi: "Làm quen với bạn tôi cũng rất vui!" },
  ];

  // -----------------------------------------------------------------------
  // 1. DẠNG 1: CHỌN CÂU ĐÚNG NGỮ PHÁP (TẠO 10 CÂU ĐA DẠNG)
  // -----------------------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    const g = safeGrammar[i % safeGrammar.length];
    const v = safeVocab[i % safeVocab.length];
    const v2 = safeVocab[(i + 1) % safeVocab.length];

    let correctSentence = "";
    let wrongA = "";
    let wrongB = "";
    let wrongC = "";
    let ruleDesc = g.title || "Quy tắc ngữ pháp trọng tâm";
    let explainText = "";

    if (i % 5 === 0) {
      // Mẫu câu với 是 và 不是
      correctSentence = `我不是${v.hanzi}，我是${v2.hanzi}。`;
      wrongA = `我不${v.hanzi}，我是${v2.hanzi}。`;
      wrongB = `我是不是${v.hanzi}，我没是${v2.hanzi}。`;
      wrongC = `我${v.hanzi}不是，是${v2.hanzi}我。`;
      explainText = `Động từ phán đoán '是' (là) phủ định bắt buộc phải dùng '不是' (không dùng '没是' hoặc bỏ '是'). Trật tự chuẩn: Chủ ngữ + 不是 + Tân ngữ 1, 是 + Tân ngữ 2.`;
    } else if (i % 5 === 1) {
      // Mẫu câu hỏi với 吗 vs 什么/谁
      correctSentence = `你是${v.hanzi}吗？`;
      wrongA = `你是${v.hanzi}什么吗？`;
      wrongB = `你吗是${v.hanzi}？`;
      wrongC = `你${v.hanzi}是吗？`;
      explainText = `Trợ từ nghi vấn '吗' luôn đứng ở cuối câu hỏi Yes/No. Tuyệt đối không để '吗' ở giữa câu hoặc kết hợp đồng thời với đại từ nghi vấn '什么'.`;
    } else if (i % 5 === 2) {
      // Mẫu câu thời gian đứng trước vị ngữ
      correctSentence = `今天我去${v.hanzi}看${v2.hanzi}。`;
      wrongA = `我去${v.hanzi}看${v2.hanzi}今天。`;
      wrongB = `看${v2.hanzi}我去${v.hanzi}今天。`;
      wrongC = `今天看我去${v.hanzi}${v2.hanzi}。`;
      explainText = `Trong tiếng Trung, trạng ngữ chỉ thời gian (今天, 明天, 昨天...) bắt buộc phải đứng trước động từ (đầu câu hoặc ngay sau chủ ngữ). Không được đặt thời gian ở cuối câu như tiếng Việt/tiếng Anh.`;
    } else if (i % 5 === 3) {
      // Mẫu câu sở hữu 有 và 沒有
      correctSentence = `他有两个${v.hanzi}。`;
      wrongA = `他有二个${v.hanzi}。`;
      wrongB = `他二个有${v.hanzi}。`;
      wrongC = `他两${v.hanzi}有。`;
      explainText = `Quy tắc số từ: Đứng trước lượng từ (như '个', '本', '口'...) bắt buộc dùng '两' (liǎng) biểu thị số lượng 2, không được dùng '二' (èr).`;
    } else {
      // Mẫu câu với phó từ 也 / 都
      correctSentence = `我们都是${v.hanzi}。`;
      wrongA = `都是我们${v.hanzi}。`;
      wrongB = `我们${v.hanzi}都是。`;
      wrongC = `我们都${v.hanzi}是。`;
      explainText = `Phó từ '也' (cũng), '都' (đều) luôn luôn đứng ngay trước động từ/hình dung từ (Chủ ngữ + 都 + 是 + Danh từ). Không bao giờ đặt '都' ở đầu câu hay cuối câu.`;
    }

    const options = [
      `A. ${correctSentence}`,
      `B. ${wrongA}`,
      `C. ${wrongB}`,
      `D. ${wrongC}`,
    ];

    result.push({
      id: `cc-${lessonNumber}-${i + 1}`,
      mode: "choose_correct",
      grammarRule: ruleDesc,
      prompt: `Câu ${i + 1}: Chọn câu có cấu trúc và trật tự ngữ pháp đúng nhất:`,
      options,
      correctAnswer: "A",
      explanation: explainText,
    });
  }

  // -----------------------------------------------------------------------
  // 2. DẠNG 2: NGHE HIỂU HỘI THOẠI NGẮN (TẠO 10 CÂU THOẠI 5-15 GIÂY)
  // -----------------------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    const v1 = safeVocab[i % safeVocab.length];
    const v2 = safeVocab[(i + 1) % safeVocab.length];

    let dialLines: { speaker: string; zh: string; pinyin: string; vi: string }[] = [];
    let questionPrompt = "";
    let optA = "";
    let optB = "";
    let optC = "";
    let optD = "";
    let correct = "A";
    let listenExplanation = "";

    if (i % 4 === 0) {
      dialLines = [
        { speaker: "李明", zh: `请问，你是${v1.hanzi}吗？`, pinyin: `Qǐngwèn, nǐ shì ${v1.pinyin} ma?`, vi: `Cho hỏi, bạn là ${v1.meaning} phải không?` },
        { speaker: "王美", zh: `我不是${v1.hanzi}，我是${v2.hanzi}。`, pinyin: `Wǒ bú shì ${v1.pinyin}, wǒ shì ${v2.pinyin}.`, vi: `Tôi không phải ${v1.meaning}, tôi là ${v2.meaning}.` },
      ];
      questionPrompt = `Theo đoạn hội thoại vừa nghe, nhân vật nữ (王美) làm gì?`;
      optA = `A. Là ${v2.meaning} (${v2.hanzi})`;
      optB = `B. Là ${v1.meaning} (${v1.hanzi})`;
      optC = `C. Không đi học`;
      optD = `D. Không rõ nghề nghiệp`;
      correct = "A";
      listenExplanation = `Trong đoạn thoại, khi được hỏi "你是${v1.hanzi}吗？", nhân vật nữ đã trả lời rõ ràng: "我不是${v1.hanzi}，我是${v2.hanzi}" (Tôi là ${v2.meaning}). Do đó đáp án A là chính xác.`;
    } else if (i % 4 === 1) {
      dialLines = [
        { speaker: "大卫", zh: `你叫什么名字？你是哪国人？`, pinyin: `Nǐ jiào shénme míngzi? Nǐ shì nǎ guó rén?`, vi: `Bạn tên là gì? Bạn là người nước nào?` },
        { speaker: "玛丽", zh: `我叫玛丽，我是美国人。你呢？`, pinyin: `Wǒ jiào Mǎlì, wǒ shì Měiguó rén. Nǐ ne?`, vi: `Tôi tên là Mary, tôi là người Mỹ. Còn bạn?` },
        { speaker: "大卫", zh: `我是中国${v1.hanzi}。`, pinyin: `Wǒ shì Zhōngguó ${v1.pinyin}.`, vi: `Tôi là ${v1.meaning} người Trung Quốc.` },
      ];
      questionPrompt = `Nhân vật nữ (玛丽) mang quốc tịch nào?`;
      optA = `A. Người Mỹ (美国人)`;
      optB = `B. Người Trung Quốc (中国人)`;
      optC = `C. Người Việt Nam (越南人)`;
      optD = `D. Người Anh (英国人)`;
      correct = "A";
      listenExplanation = `Nhân vật Mary nói trực tiếp: "我是美国人" (Tôi là người Mỹ). Cấu trúc hỏi quốc tịch: "你是哪国人？" -> Đáp: "我是 + [Tên quốc gia] + 人".`;
    } else if (i % 4 === 2) {
      dialLines = [
        { speaker: "小雨", zh: `明天星期几？你去学校吗？`, pinyin: `Míngtiān xīngqī jǐ? Nǐ qù xuéxiào ma?`, vi: `Ngày mai là thứ mấy? Bạn có đến trường không?` },
        { speaker: "张华", zh: `明天星期三，我去学校学汉语。`, pinyin: `Míngtiān xīngqī sān, wǒ qù xuéxiào xué Hànyǔ.`, vi: `Ngày mai là thứ Tư, tôi đến trường học tiếng Trung.` },
      ];
      questionPrompt = `Ngày mai Trương Hoa (张华) đi đâu và làm gì?`;
      optA = `A. Đến trường học tiếng Trung (去学校学汉语)`;
      optB = `B. Ở nhà nghỉ ngơi`;
      optC = `C. Đi mua sắm`;
      optD = `D. Đi du lịch Bắc Kinh`;
      correct = "A";
      listenExplanation = `Trương Hoa nói: "我去学校学汉语" (Tôi đến trường học tiếng Trung). Cấu trúc liên động: Đi đâu (去学校) để làm gì (学汉语).`;
    } else {
      dialLines = [
        { speaker: "李文", zh: `你家有几口人？`, pinyin: `Nǐ jiā yǒu jǐ kǒu rén?`, vi: `Nhà bạn có mấy người?` },
        { speaker: "王朋", zh: `我家有四口人：爸爸、妈妈、一个哥哥和我。`, pinyin: `Wǒ jiā yǒu sì kǒu rén: bàba, māma, yí gè gēge hé wǒ.`, vi: `Nhà tôi có bốn người: bố, mẹ, một anh trai và tôi.` },
      ];
      questionPrompt = `Gia đình Vương Bằng (王朋) có tất cả bao nhiêu người?`;
      optA = `A. 4 người (四口人)`;
      optB = `B. 3 người (三口人)`;
      optC = `C. 5 người (五口人)`;
      optD = `D. 2 người (两口人)`;
      correct = "A";
      listenExplanation = `Vương Bằng trả lời: "我家有四口人" (Nhà tôi có bốn người). Lượng từ '口' dùng để đếm nhân khẩu trong gia đình.`;
    }

    const audioContent = dialLines.map((l) => `${l.speaker}说：${l.zh}`).join("。 ");

    result.push({
      id: `ld-${lessonNumber}-${i + 1}`,
      mode: "listen_dialogue",
      grammarRule: `Luyện nghe hiểu hội thoại HSK · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Nghe đoạn hội thoại và chọn đáp án chính xác nhất:`,
      dialogueLines: dialLines,
      audioText: audioContent,
      options: [optA, optB, optC, optD],
      correctAnswer: correct,
      explanation: listenExplanation,
    });
  }

  // -----------------------------------------------------------------------
  // 3. DẠNG 3: TRẮC NGHIỆM ĐIỀN TỪ VÀO CHỖ TRỐNG (TẠO 10 CÂU)
  // -----------------------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    const v = safeVocab[i % safeVocab.length];

    let sentenceWithBlank = "";
    let optA = "";
    let optB = "";
    let optC = "";
    let optD = "";
    let explain = "";
    let pinyinP = "";

    if (i % 5 === 0) {
      sentenceWithBlank = `我 ___ 是中国学生，我是越南人。`;
      pinyinP = `Wǒ ___ shì Zhōngguó xuésheng, wǒ shì Yuènán rén.`;
      optA = `A. 不 (bù)`;
      optB = `B. 没 (méi)`;
      optC = `C. 很 (hěn)`;
      optD = `D. 也 (yě)`;
      explain = `Phủ định của động từ '是' bắt buộc dùng '不' (不是), không bao giờ dùng '没'. Đáp án đúng là 不.`;
    } else if (i % 5 === 1) {
      sentenceWithBlank = `他是你的${v.hanzi} ___ ？`;
      pinyinP = `Tā shì nǐ de ${v.pinyin} ___ ?`;
      optA = `A. 吗 (ma)`;
      optB = `B. 呢 (ne)`;
      optC = `C. 的 (de)`;
      optD = `D. 个 (gè)`;
      explain = `Để chuyển câu trần thuật thành câu hỏi Yes/No, thêm trợ từ nghi vấn '吗' vào cuối câu.`;
    } else if (i % 5 === 2) {
      sentenceWithBlank = `我家有 ___ 个${v.hanzi}。`;
      pinyinP = `Wǒ jiā yǒu ___ gè ${v.pinyin}.`;
      optA = `A. 两 (liǎng)`;
      optB = `B. 二 (èr)`;
      optC = `C. 俩 (liǎ)`;
      optD = `D. 双 (shuāng)`;
      explain = `Trước lượng từ '个', số 2 bắt buộc phải dùng '两' (两 + lượng từ + danh từ), không dùng '二'.`;
    } else if (i % 5 === 3) {
      sentenceWithBlank = `今天天气 ___ 冷了！`;
      pinyinP = `Jīntiān tiānqì ___ lěng le!`;
      optA = `A. 太 (tài)`;
      optB = `B. 很 (hěn)`;
      optC = `C. 非常 (fēicháng)`;
      optD = `D. 真 (zhēn)`;
      explain = `Cấu trúc cảm thán quá mức: '太 + Tính từ + 了' (太冷了 = Lạnh quá rồi!).`;
    } else {
      sentenceWithBlank = `我和他 ___ 是北京大学的${v.hanzi}。`;
      pinyinP = `Wǒ hé tā ___ shì Běijīng Dàxué de ${v.pinyin}.`;
      optA = `A. 都 (dōu)`;
      optB = `B. 也 (yě)`;
      optC = `C. 很 (hěn)`;
      optD = `D. 个 (gè)`;
      explain = `Khi chủ ngữ gồm nhiều đối tượng ('我和他' - Tôi và anh ấy), dùng phó từ '都' (đều) đứng trước động từ '是'.`;
    }

    result.push({
      id: `fb-${lessonNumber}-${i + 1}`,
      mode: "fill_blank",
      grammarRule: `Điền hư từ & cấu trúc câu · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Chọn từ thích hợp nhất để điền vào chỗ trống:`,
      options: [optA, optB, optC, optD],
      correctAnswer: "A",
      sentence: sentenceWithBlank,
      pinyin: pinyinP,
      meaningVi: `Điền từ thích hợp hoàn chỉnh câu`,
      explanation: explain,
    });
  }

  // -----------------------------------------------------------------------
  // 4. DẠNG 4: SẮP XẾP TỪ THÀNH CÂU (TẠO 10 CÂU - TUYỆT ĐỐI KHÔNG LỘ ĐỀ MẪU)
  // -----------------------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    let fullSentence = "";
    let tokens: string[] = [];
    let meaningHint = "";
    let ruleText = "";

    if (i % 5 === 0) {
      fullSentence = `我是中国学生。`;
      tokens = ["学生", "我", "中国", "是", "。"];
      meaningHint = "Tôi là học sinh Trung Quốc.";
      ruleText = "Trật tự câu phán đoán: Chủ ngữ (我) + 是 + Định ngữ (中国) + Danh từ trung tâm (学生).";
    } else if (i % 5 === 1) {
      fullSentence = `他是你的老师吗？`;
      tokens = ["吗", "他", "你的老师", "是", "？"];
      meaningHint = "Anh ấy có phải là giáo viên của bạn không?";
      ruleText = "Trật tự câu hỏi Yes/No: Chủ ngữ (他) + 是 + Tân ngữ (你的老师) + Trợ từ nghi vấn (吗) + Dấu hỏi.";
    } else if (i % 5 === 2) {
      fullSentence = `明天我去学校学习。`;
      tokens = ["学习", "明天", "去学校", "我", "。"];
      meaningHint = "Ngày mai tôi đến trường học tập.";
      ruleText = "Thời gian (明天) + Chủ ngữ (我) + Địa điểm liên động (去学校) + Hành động (学习).";
    } else if (i % 5 === 3) {
      fullSentence = `我家有四口人。`;
      tokens = ["四口人", "我家", "有", "。"];
      meaningHint = "Nhà tôi có bốn người.";
      ruleText = "Chủ ngữ chỉ nơi chốn/gia đình (我家) + Động từ (有) + Số lượng danh từ (四口人).";
    } else {
      fullSentence = `我们都喜欢学习汉语。`;
      tokens = ["喜欢", "汉语", "我们", "都", "学习", "。"];
      meaningHint = "Chúng tôi đều thích học tiếng Trung.";
      ruleText = "Chủ ngữ (我们) + Phó từ (都) + Động từ năng nguyện (喜欢) + Cụm vị ngữ (学习汉语).";
    }

    // Đảo ngẫu nhiên các từ
    const scrambled = [...tokens].sort(() => Math.random() - 0.5);

    result.push({
      id: `ro-${lessonNumber}-${i + 1}`,
      mode: "reorder",
      grammarRule: `Sắp xếp trật tự từ · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Bấm vào các khối từ bên dưới để xếp thành câu hoàn chỉnh đúng quy tắc ngữ pháp:`,
      meaningVi: meaningHint,
      sentence: fullSentence, // CHỈ hiển thị sau khi học sinh kiểm tra!
      scrambledWords: scrambled,
      correctAnswer: tokens.join(" "),
      explanation: ruleText,
    });
  }

  // -----------------------------------------------------------------------
  // 5. DẠNG 5: SỬA CÂU TỪ CÂU SAI THÀNH CÂU ĐÚNG (TẠO 10 CÂU)
  // -----------------------------------------------------------------------
  for (let i = 0; i < 10; i++) {
    let wrongS = "";
    let wrongP = "";
    let correctS = "";
    let fake1 = "";
    let fake2 = "";
    let fake3 = "";
    let errorAnalysis = "";

    if (i % 5 === 0) {
      wrongS = `我没是老师。`;
      wrongP = `Wǒ méi shì lǎoshī.`;
      correctS = `我不是老师。`;
      fake1 = `我不老师是。`;
      fake2 = `没有我是老师。`;
      fake3 = `我是老师不。`;
      errorAnalysis = `LỖI SAI TRONG CÂU GỐC: Dùng sai phó từ phủ định '没'. Động từ '是' bắt buộc chỉ phủ định bằng '不' -> '不是老师'.`;
    } else if (i % 5 === 1) {
      wrongS = `他去学校昨天。`;
      wrongP = `Tā qù xuéxiào zuótiān.`;
      correctS = `他昨天去学校。`;
      fake1 = `他去昨天学校。`;
      fake2 = `学校他去昨天。`;
      fake3 = `去学校他昨天。`;
      errorAnalysis = `LỖI SAI TRONG CÂU GỐC: Đặt trạng từ thời gian '昨天' ở cuối câu. Trong tiếng Trung, từ chỉ thời gian phải đặt trước động từ: '他昨天去学校' hoặc '昨天他去学校'.`;
    } else if (i % 5 === 2) {
      wrongS = `你叫什么名字吗？`;
      wrongP = `Nǐ jiào shénme míngzi ma?`;
      correctS = `你叫什么名字？`;
      fake1 = `你叫吗什么名字？`;
      fake2 = `什么名字你叫吗？`;
      fake3 = `你吗叫什么名字？`;
      errorAnalysis = `LỖI SAI TRONG CÂU GỐC: Thừa trợ từ nghi vấn '吗'. Khi câu đã có đại từ nghi vấn '什么' (gì) thì tuyệt đối KHÔNG thêm '吗' ở cuối câu.`;
    } else if (i % 5 === 3) {
      wrongS = `我家有二口人。`;
      wrongP = `Wǒ jiā yǒu èr kǒu rén.`;
      correctS = `我家有两口人。`;
      fake1 = `我家两口人有。`;
      fake2 = `我家有二个人。`;
      fake3 = `我家有两个。`;
      errorAnalysis = `LỖI SAI TRONG CÂU GỐC: Dùng '二' trước lượng từ. Quy tắc ngữ pháp chuẩn: Đứng trước lượng từ (như '口', '个') để biểu thị số lượng thì dùng '两' (两口人).`;
    } else {
      wrongS = `我们也是不学生。`;
      wrongP = `Wǒmen yě shì bù xuésheng.`;
      correctS = `我们也不是学生。`;
      fake1 = `我们不也是学生。`;
      fake2 = `也是我们不学生。`;
      fake3 = `我们学生也不是。`;
      errorAnalysis = `LỖI SAI TRONG CÂU GỐC: Trật tự phó từ sai. Cụm phủ định phán đoán là '不是', và phó từ '也' phải đứng trước cụm '不是' -> '也不是学生'.`;
    }

    result.push({
      id: `cm-${lessonNumber}-${i + 1}`,
      mode: "correct_mistake",
      grammarRule: `Sửa lỗi câu sai ngữ pháp · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Tìm lỗi sai ngữ pháp trong câu bên dưới và chọn câu sửa chuẩn xác nhất:`,
      wrongSentence: wrongS,
      wrongSentencePinyin: wrongP,
      meaningVi: `Lỗi sai trật tự / dùng từ`,
      options: [
        `A. ${correctS}`,
        `B. ${fake1}`,
        `C. ${fake2}`,
        `D. ${fake3}`,
      ],
      correctAnswer: "A",
      explanation: errorAnalysis,
    });
  }

  return result;
}

export default function GrammarPracticeSuite({
  grammarList,
  vocabList = [],
  dialogueList = [],
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

  // 4. State trả lời cho dạng trắc nghiệm
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 5. State cho dạng sắp xếp từ (reorder)
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [isReorderChecked, setIsReorderChecked] = useState(false);
  const [isReorderCorrect, setIsReorderCorrect] = useState(false);

  // 6. State cho dạng nghe hội thoại (listen_dialogue)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.85);

  // 7. Điểm số
  const [score, setScore] = useState(0);

  // Sinh đủ ~10 câu hỏi cho mỗi chế độ luyện tập, vận dụng cả ngữ pháp và từ vựng của bài
  const allExercises = useMemo(() => {
    return generateLessonGrammarExercises(
      grammarList,
      vocabList,
      dialogueList,
      hskLevel,
      lessonNumber
    );
  }, [grammarList, vocabList, dialogueList, hskLevel, lessonNumber]);

  // Lọc bài tập theo chế độ đang chọn (mỗi chế độ có 10 câu)
  const filteredExercises = useMemo(() => {
    return allExercises.filter((item) => item.mode === activeExerciseMode);
  }, [allExercises, activeExerciseMode]);

  const currentExercise = filteredExercises[currentIndex] || filteredExercises[0];

  // Khởi tạo trạng thái khi đổi câu hoặc đổi chế độ
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsReorderChecked(false);
    setIsReorderCorrect(false);
    setIsPlayingAudio(false);

    if (currentExercise && currentExercise.mode === "reorder" && currentExercise.scrambledWords) {
      setAvailableWords([...currentExercise.scrambledWords]);
      setAssembledWords([]);
    }
  }, [currentExercise, activeExerciseMode, currentIndex]);

  // Dừng phát âm thanh khi chuyển câu
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex, activeExerciseMode]);

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

  // Xử lý phát audio hội thoại (5 - 15 giây)
  const handlePlayDialogue = () => {
    if (!currentExercise || !currentExercise.dialogueLines) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const fullText = currentExercise.dialogueLines
      .map((l) => `${l.zh}。`)
      .join(" ");

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "zh-CN";
    utterance.rate = audioSpeed;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Xử lý chọn đáp án trắc nghiệm (Chọn câu đúng / Nghe hội thoại / Điền từ / Sửa câu)
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
                Các cấu trúc câu, quy tắc kết hợp từ vựng và câu ví dụ ứng dụng giao tiếp thực tế.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTheoryCollapsed(!isTheoryCollapsed)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] bg-white hover:bg-[#FAF7F0] text-xs font-bold transition cursor-pointer shadow-2xs"
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
      {/* 2. THANH ĐIỀU HƯỚNG 5 CHẾ ĐỘ BÀI TẬP LUYỆN TẬP (MỖI PHẦN ~10 CÂU)   */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8F6D3B]" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">
                Bài tập tương tác chuyên sâu
              </h3>
              <p className="text-xs text-[#315E48]">
                Vận dụng tổng hợp ngữ pháp và từ vựng của Bài {lessonNumber} (10 câu mỗi dạng bài tập).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#204434] bg-[#FAF7F0] px-3.5 py-1.5 rounded-full border border-[#E5DEC9] shadow-2xs">
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
            <span className="truncate">1. Chọn câu đúng (10)</span>
          </button>

          <button
            onClick={() => {
              setActiveExerciseMode("listen_dialogue");
              setCurrentIndex(0);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeExerciseMode === "listen_dialogue"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-white"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="truncate">2. Nghe hội thoại (10)</span>
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
            <span className="truncate">3. Điền từ (10)</span>
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
            <span className="truncate">4. Sắp xếp câu (10)</span>
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
            <span className="truncate">5. Sửa câu sai (10)</span>
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
              <span className="px-3 py-1 rounded-full bg-[#204434] text-white text-xs font-bold shadow-2xs">
                Câu {currentIndex + 1} / {filteredExercises.length}
              </span>
              <span className="text-xs font-semibold text-[#8F6D3B] truncate max-w-xs">
                {currentExercise.grammarRule}
              </span>
            </div>

            {/* Thanh tiến độ làm bài */}
            <div className="flex items-center gap-1.5">
              {filteredExercises.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    dotIdx === currentIndex
                      ? "w-5 bg-[#204434]"
                      : dotIdx < currentIndex
                      ? "bg-emerald-500"
                      : "bg-[#E5DEC9]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tiêu đề & Đề bài */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
              {currentExercise.prompt}
            </h4>

            {/* Dạng câu điền từ hoặc câu ví dụ (KHÔNG PHẢI REORDER) */}
            {currentExercise.mode !== "reorder" && currentExercise.sentence && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#204434] tracking-wide">
                  {currentExercise.sentence}
                </p>
                {currentExercise.pinyin && (
                  <p className="font-mono text-xs text-[#8F6D3B]">
                    {currentExercise.pinyin}
                  </p>
                )}
              </div>
            )}

            {/* Dạng câu sai cho dạng Sửa lỗi */}
            {currentExercise.mode === "correct_mistake" && currentExercise.wrongSentence && (
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-1.5">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                  Câu sai ngữ pháp cần sửa:
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

            {/* DẠNG 2: NGHE HIỂU HỘI THOẠI NGẮN (5 - 15 GIÂY) */}
            {currentExercise.mode === "listen_dialogue" && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF7F0] to-[#FFFCF6] border border-[#BC9B6B]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#204434] text-white flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-[#BC9B6B]" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#204434] block">
                        Đoạn hội thoại ngắn ({currentExercise.dialogueLines?.length || 2} lượt nói)
                      </span>
                      <span className="text-[11px] text-[#315E48]">
                        Bấm nghe và chọn câu trả lời chính xác bên dưới
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tốc độ đọc */}
                    <button
                      onClick={() => setAudioSpeed((s) => (s === 0.85 ? 0.7 : 0.85))}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#8F6D3B] hover:bg-[#FAF7F0] transition cursor-pointer"
                      title="Chỉnh tốc độ giọng đọc"
                    >
                      {audioSpeed === 0.85 ? "Tốc độ: Chuẩn" : "Tốc độ: Chậm"}
                    </button>

                    {/* Nút phát âm thanh */}
                    <button
                      onClick={handlePlayDialogue}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                        isPlayingAudio
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-[#204434] hover:bg-[#17382F] text-white"
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Đang phát... (Dừng)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Phát hội thoại</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sóng âm mô phỏng khi đang phát */}
                {isPlayingAudio && (
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <div className="w-1.5 h-6 bg-[#204434] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-8 bg-[#8F6D3B] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-10 bg-[#204434] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-7 bg-[#8F6D3B] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                    <div className="w-1.5 h-5 bg-[#204434] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                  </div>
                )}

                {/* HIỂN THỊ NỘI DUNG HỘI THOẠI SAU KHI ĐÃ TRẢ LỜI */}
                {isAnswered && currentExercise.dialogueLines && (
                  <div className="pt-3 border-t border-[#E5DEC9] space-y-2 animate-fadeIn">
                    <span className="text-[11px] font-bold text-[#8F6D3B] uppercase tracking-wider block">
                      Văn bản đoạn hội thoại vừa nghe (Transcript):
                    </span>
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#E5DEC9]">
                      {currentExercise.dialogueLines.map((line, lIdx) => (
                        <div key={lIdx} className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#204434] px-1.5 py-0.5 bg-[#FAF7F0] rounded">
                              {line.speaker}:
                            </span>
                            <span className="font-serif font-bold text-[#204434] text-sm">
                              {line.zh}
                            </span>
                            <button
                              onClick={() => handleSpeak(line.zh)}
                              className="text-[#8F6D3B] hover:text-[#204434] p-0.5"
                              title="Nghe câu này"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-mono text-[11px] text-[#8F6D3B] pl-2">
                            {line.pinyin}
                          </p>
                          <p className="text-[11px] text-[#315E48] pl-2 italic">
                            ({line.vi})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* A. DẠNG TRẮC NGHIỆM 4 ĐÁP ÁN (CHỌN CÂU, NGHE HỘI THOẠI, ĐIỀN TỪ, SỬA CÂU) */}
          {/* =============================================================== */}
          {currentExercise.mode !== "reorder" && currentExercise.options && (
            <div className="space-y-3">
              {currentExercise.options.map((opt, i) => {
                const optLetter = opt.charAt(0);
                const isCorrect = optLetter === currentExercise.correctAnswer;
                const isUserSelected = selectedOption === optLetter;

                let btnStyle =
                  "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] hover:border-[#204434]";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs";
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
          {/* B. DẠNG 4: SẮP XẾP TỪ THÀNH CÂU (KHÔNG LỘ ĐÁP ÁN MẪU TRƯỚC)      */}
          {/* =============================================================== */}
          {currentExercise.mode === "reorder" && (
            <div className="space-y-5">
              {/* Gợi ý nghĩa tiếng Việt (để học sinh hiểu ngữ cảnh nhưng KHÔNG lộ từ tiếng Trung) */}
              {currentExercise.meaningVi && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#315E48] flex items-center gap-2">
                  <span className="font-bold text-[#8F6D3B] shrink-0">Ý nghĩa câu cần xếp:</span>
                  <span className="font-medium italic text-[#204434]">"{currentExercise.meaningVi}"</span>
                </div>
              )}

              {/* Vùng các từ đã xếp vào câu */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#204434]">
                  Câu đang sắp xếp (Bấm vào từ đã chọn để gỡ bỏ):
                </span>
                <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-[#BC9B6B]/60 min-h-[90px] flex flex-wrap items-center gap-2">
                  {assembledWords.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Bấm vào các khối từ bên dưới theo đúng trật tự ngữ pháp để ghép thành câu...
                    </span>
                  ) : (
                    assembledWords.map((word, idx) => (
                      <button
                        key={idx}
                        disabled={isReorderChecked}
                        onClick={() => handleRemoveWord(word, idx)}
                        className="px-4 py-2.5 rounded-xl bg-[#204434] text-white text-base font-bold shadow-xs hover:bg-red-700 transition cursor-pointer flex items-center gap-1.5"
                        title="Bấm để đưa từ này trở lại kho từ"
                      >
                        <span>{word}</span>
                      </button>
                    ))
                  )}
                </div>
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

              {/* Kết quả sắp xếp VÀ CHỈ LÚC NÀY MỚI HIỂN THỊ CÂU CHUẨN */}
              {isReorderChecked && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isReorderCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-red-50 border-red-300 text-red-800"
                  } space-y-1.5 animate-fadeIn`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isReorderCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Bạn đã sắp xếp đúng quy tắc ngữ pháp tiếng Trung.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Chưa chính xác! Trật tự từ chưa đúng với quy tắc ngữ pháp.</span>
                      </>
                    )}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span>
                      Câu chuẩn hoàn chỉnh: <strong>{currentExercise.sentence}</strong>
                    </span>
                    <button
                      onClick={() => handleSpeak(currentExercise.sentence || "")}
                      className="p-1 text-[#204434] hover:bg-white rounded transition"
                      title="Phát âm câu chuẩn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* D. PHẦN GIẢI THÍCH CHI TIẾT (XUẤT HIỆN SAU KHI CHỌN HOẶC KIỂM TRA) */}
          {/* =============================================================== */}
          {(isAnswered || isReorderChecked) && (
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-[#8F6D3B] space-y-2 animate-fadeIn shadow-2xs">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#8F6D3B]" />
                  <span className="text-sm">Giải thích ngữ pháp & đáp án chi tiết:</span>
                </div>
                {currentExercise.sentence && (
                  <button
                    onClick={() => handleSpeak(currentExercise.sentence || "")}
                    className="p-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe câu mẫu</span>
                  </button>
                )}
              </div>
              <p className="leading-relaxed text-amber-950 text-xs sm:text-sm font-medium">
                {currentExercise.explanation}
              </p>
            </div>
          )}

          {/* Điều hướng câu tiếp theo */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DEC9]">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-[#E5DEC9] text-[#204434] bg-white hover:bg-[#FAF7F0] text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            <span className="text-xs font-bold text-[#315E48]">
              {currentIndex + 1} / {filteredExercises.length} câu
            </span>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#204434] text-white hover:bg-[#17382F] text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentIndex === filteredExercises.length - 1 ? "Làm lại dạng này" : "Câu tiếp theo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
