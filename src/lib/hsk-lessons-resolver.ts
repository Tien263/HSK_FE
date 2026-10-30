import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "./hsk1-full-lessons";
import { OFFICIAL_HSK2_15_LESSONS } from "./hsk2-full-lessons";

function generateFallbackLessonsForLevel(lvl: number): Hsk1FullLesson[] {
  const titlesByLevel: Record<number, { zh: string; py: string; vi: string; word: string; pyWord: string; viWord: string }[]> = {
    3: [
      { zh: "周末你有什么打算", py: "Zhōumò nǐ yǒu shénme dǎsuàn", vi: "Cuối tuần bạn có dự định gì", word: "打算", pyWord: "dǎsuàn", viWord: "dự định" },
      { zh: "他什么时候回来", py: "Tā shénme shíhou huílái", vi: "Khi nào anh ấy về", word: "回来", pyWord: "huílái", viWord: "trở về" },
      { zh: "桌子上放着很多饮料", py: "Zhuōzi shang fàngzhe hěn duō yǐnliào", vi: "Trên bàn để rất nhiều đồ uống", word: "饮料", pyWord: "yǐnliào", viWord: "đồ uống" },
      { zh: "她总是笑着跟客人说话", py: "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", vi: "Cô ấy luôn mỉm cười nói chuyện với khách", word: "总是", pyWord: "zǒngshì", viWord: "luôn luôn" },
      { zh: "我最近越来越胖了", py: "Wǒ zuìjìn yuè lái yuè pàng le", vi: "Dạo này tôi càng ngày càng béo", word: "最近", pyWord: "zuìjìn", viWord: "dạo này" },
      { zh: "怎么突然找不到了", py: "Zěnme tūrán zhǎo bù dào le", vi: "Sao đột nhiên không tìm thấy nữa", word: "突然", pyWord: "tūrán", viWord: "đột nhiên" },
      { zh: "我跟他都一样", py: "Wǒ gēn tā dōu yíyàng", vi: "Tôi với anh ấy đều giống nhau", word: "一样", pyWord: "yíyàng", viWord: "giống nhau" },
      { zh: "你去哪儿我就去哪儿", py: "Nǐ qù nǎr wǒ jiù qù nǎr", vi: "Bạn đi đâu tôi đi đó", word: "马上", pyWord: "mǎshàng", viWord: "ngay lập tức" },
      { zh: "她的中文越说越好", py: "Tā de zhōngwén yuè shuō yuè hǎo", vi: "Tiếng Trung của cô ấy càng nói càng hay", word: "提高", pyWord: "tígāo", viWord: "nâng cao" },
      { zh: "数学比历史难多了", py: "Shùxué bǐ lìshǐ nán duō le", vi: "Toán học khó hơn lịch sử nhiều", word: "历史", pyWord: "lìshǐ", viWord: "lịch sử" },
      { zh: "别忘了把空调关了", py: "Bié wàng le bǎ kōngtiáo guān le", vi: "Đừng quên tắt điều hòa", word: "空调", pyWord: "kōngtiáo", viWord: "máy điều hòa" },
      { zh: "把重要的事先做完", py: "Bǎ zhòngyào de shì xiān zuò wán", vi: "Làm xong việc quan trọng trước", word: "重要", pyWord: "zhòngyào", viWord: "quan trọng" },
      { zh: "我是走回来的", py: "Wǒ shì zǒu huílái de", vi: "Tôi đi bộ về đấy", word: "健康", pyWord: "jiànkāng", viWord: "sức khỏe" },
      { zh: "你把水果洗干净了吗", py: "Nǐ bǎ shuǐguǒ xǐ gānjìng le ma", vi: "Bạn rửa sạch hoa quả chưa", word: "干净", pyWord: "gānjìng", viWord: "sạch sẽ" },
      { zh: "复习与综合测验", py: "Fùxí yǔ zōnghé cèyàn", vi: "Ôn tập và kiểm tra tổng hợp", word: "复习", pyWord: "fùxí", viWord: "ôn tập" },
    ],
    4: [
      { zh: "简单的爱情", py: "Jiǎndān de àiqíng", vi: "Tình yêu giản dị", word: "爱情", pyWord: "àiqíng", viWord: "tình yêu" },
      { zh: "真正的朋友", py: "Zhēnzhèng de péngyou", vi: "Người bạn thực sự", word: "真正的", pyWord: "zhēnzhèng de", viWord: "chân chính, thực sự" },
      { zh: "买对的，不买贵的", py: "Mǎi duì de, bù mǎi guì de", vi: "Mua đồ phù hợp, không mua đồ đắt", word: "适合", pyWord: "shìhé", viWord: "phù hợp" },
      { zh: "不要太在乎得失", py: "Bú yào tài zàihu déshī", vi: "Đừng quá bận tâm được mất", word: "在乎", pyWord: "zàihu", viWord: "để ý, bận tâm" },
      { zh: "一分钱一分货", py: "Yì fēn qián yì fēn huò", vi: "Tiền nào của nấy", word: "质量", pyWord: "zhìliàng", viWord: "chất lượng" },
      { zh: "最好的医生是自己", py: "Zuì hǎo de yīshēng shì zìjǐ", vi: "Bác sĩ tốt nhất là chính mình", word: "坚持", pyWord: "jiānchí", viWord: "kiên trì" },
      { zh: "生活中不缺少美", py: "Shēnghuó zhōng bù quēshǎo měi", vi: "Cuộc sống không thiếu cái đẹp", word: "缺少", pyWord: "quēshǎo", viWord: "thiếu hụt" },
      { zh: "阳光总在风雨后", py: "Yángguāng zǒng zài fēngyǔ hòu", vi: "Nắng ấm luôn sau cơn mưa", word: "困难", pyWord: "kùnnan", viWord: "khó khăn" },
      { zh: "幸福的标准", py: "Xìngfú de biāozhǔn", vi: "Tiêu chuẩn của hạnh phúc", word: "标准", pyWord: "biāozhǔn", viWord: "tiêu chuẩn" },
      { zh: "读书好，读好书", py: "Dúshū hǎo, dú hǎo shū", vi: "Đọc sách hay, chăm đọc sách", word: "丰富", pyWord: "fēngfù", viWord: "phong phú" },
      { zh: "用心发现世界", py: "Yòngxīn fāxiàn shìjiè", vi: "Dùng trái tim khám phá thế giới", word: "发现", pyWord: "fāxiàn", viWord: "phát hiện" },
      { zh: "喝茶的艺术", py: "Hē chá de yìshù", vi: "Nghệ thuật uống trà", word: "艺术", pyWord: "yìshù", viWord: "nghệ thuật" },
      { zh: "保护环境", py: "Bǎohù huánjìng", vi: "Bảo vệ môi trường", word: "环境", pyWord: "huánjìng", viWord: "môi trường" },
      { zh: "勇敢面对生活", py: "Yǒnggǎn miànduì shēnghuó", vi: "Dũng cảm đối mặt cuộc sống", word: "勇敢", pyWord: "yǒnggǎn", viWord: "dũng cảm" },
      { zh: "HSK 4 综合复习", py: "HSK 4 Zōnghé fùxí", vi: "Ôn tập tổng hợp HSK 4", word: "成功", pyWord: "chénggōng", viWord: "thành công" },
    ],
  };

  const list: Hsk1FullLesson[] = [];
  const titles = titlesByLevel[lvl] || [];
  for (let num = 1; num <= 15; num++) {
    const t = titles[num - 1] || {
      zh: `第${num}课：HSK ${lvl} 核心提升`,
      py: `Dì ${num} kè: HSK ${lvl} Héxīn Tíshēng`,
      vi: `Bài ${num}: Nâng cao năng lực HSK ${lvl}`,
      word: "努力",
      pyWord: "nǔlì",
      viWord: "nỗ lực, cố gắng",
    };

    list.push({
      id: `hsk${lvl}-${String(num).padStart(2, "0")}`,
      number: num,
      titleZh: t.zh,
      titleVi: t.vi,
      pinyin: t.py,
      desc: `Bài học cung cấp từ vựng, ngữ pháp và bài đọc hiểu chuyên sâu chuẩn HSK ${lvl}.0.`,
      durationMin: 45,
      vocabCount: 6,
      grammarCount: 2,
      isUnlockedDefault: num === 1,
      unlockedScheduleText: "Đã mở",
      vocabList: [
        {
          hanzi: t.word,
          pinyin: t.pyWord,
          meaningVi: t.viWord,
          meaning: t.viWord,
          type: "Từ vựng HSK",
          usageExplanation: `Từ trọng tâm trong chuẩn bài thi HSK ${lvl}.`,
          usagePatterns: [`Sử dụng với: ${t.word}`],
          examples: [
            { zh: `在学习中我们要${t.word}。`, pinyin: `Zài xuéxí zhōng wǒmen yào ${t.pyWord}.`, vi: `Trong học tập chúng ta cần ${t.viWord}.` }
          ],
          commonMistakes: [
            { incorrect: `Sai ngữ cảnh khi dùng ${t.word}`, correct: `Dùng đúng vị trí ${t.word}`, explanation: `Cần chú ý từ loại và cấu trúc câu đi kèm.` },
            { incorrect: `Thiếu trợ từ liên kết`, correct: `Bổ sung đúng trợ từ`, explanation: `Chú ý liên kết câu trong chuẩn HSK ${lvl}.` }
          ],
          exampleZh: `在学习中我们要${t.word}。`,
          examplePy: `Zài xuéxí zhōng wǒmen yào ${t.pyWord}.`,
          exampleVi: `Trong học tập chúng ta cần ${t.viWord}.`,
        },
        {
          hanzi: "坚持",
          pinyin: "jiānchí",
          meaningVi: "kiên trì",
          meaning: "kiên trì",
          type: "Động từ",
          usageExplanation: "Biểu thị hành động tiếp tục không bỏ cuộc.",
          usagePatterns: ["坚持 + Động từ: 坚持学习"],
          examples: [
            { zh: "坚持每天学中文就会有进步。", pinyin: "Jiānchí měitiān xué zhōngwén jiù huì yǒu jìnbù.", vi: "Kiên trì mỗi ngày học tiếng Trung sẽ có tiến bộ." }
          ],
          commonMistakes: [
            { incorrect: "坚持很累 (dùng như tính từ)", correct: "坚持做下去", explanation: "'坚持' là động từ." },
            { incorrect: "我坚持 (nói cộc lốc thiếu tân ngữ)", correct: "我会坚持下去！", explanation: "Cần bổ ngữ chỉ phương hướng để câu hoàn chỉnh." }
          ],
          exampleZh: "坚持每天学中文就会有进步。",
          examplePy: "Jiānchí měitiān xué zhōngwén jiù huì yǒu jìnbù.",
          exampleVi: "Kiên trì mỗi ngày học tiếng Trung sẽ có tiến bộ.",
        }
      ],
      grammarList: [
        {
          title: `Cấu trúc câu trọng điểm bài ${num}`,
          titleZh: `第${num}课重点句型`,
          summary: `Mẫu câu then chốt trong HSK ${lvl}.`,
          structure: "Chủ ngữ + Trạng ngữ + Động từ + Tân ngữ",
          usageExplanation: `Hướng dẫn sử dụng cấu trúc ngữ pháp chuẩn xác trong giao tiếp HSK ${lvl}.`,
          usageSteps: ["Bước 1: Xác định chủ ngữ", "Bước 2: Bổ sung vị ngữ", "Bước 3: Hoàn thiện câu"],
          examples: [
            { zh: `${t.zh}，我们一起努力！`, pinyin: `${t.py}, wǒmen yìqǐ nǔlì!`, vi: `${t.vi}, chúng ta cùng cố gắng!`, explanationVi: "Mẫu câu ứng dụng thực tế." }
          ],
          example: `${t.zh}，我们一起努力！`,
          explanation: `Cấu trúc ngữ pháp trọng điểm của HSK ${lvl}.`,
        }
      ],
      dialogue: [
        { speaker: "A", zh: `${t.zh}？`, pinyin: `${t.py}?`, vi: `${t.vi}?` },
        { speaker: "B", zh: "我们一起准备，一定能学好！", pinyin: "Wǒmen yìqǐ zhǔnbèi, yídìng néng xué hǎo!", vi: "Chúng ta cùng chuẩn bị, nhất định sẽ học tốt!" }
      ],
      reading: {
        id: `hsk${lvl}-${String(num).padStart(2, "0")}-reading`,
        titleZh: t.zh,
        titleVi: t.vi,
        originalText: `${t.zh}。学习中文需要每天坚持，多听、多读、多练习。只要认真积累，HSK ${lvl} 一定能顺利通关！`,
        translation: `${t.vi}. Học tiếng Trung cần kiên trì mỗi ngày, nghe nhiều, đọc nhiều và luyện tập nhiều. Chỉ cần chăm chỉ tích lũy, bạn nhất định sẽ vượt qua HSK ${lvl}!`,
        contentZh: `${t.zh}。学习中文需要每天坚持，多听、多读、多练习。只要认真积累，HSK ${lvl} 一定能顺利通关！`,
        contentPy: t.py,
        contentVi: `${t.vi}. Học tiếng Trung cần kiên trì mỗi ngày, nghe nhiều, đọc nhiều và luyện tập nhiều. Chỉ cần chăm chỉ tích lũy, bạn nhất định sẽ vượt qua HSK ${lvl}!`,
        analysisExplanation: `Đoạn văn rèn luyện khả năng đọc hiểu và củng cố kiến thức trọng tâm HSK ${lvl}.`,
        mainIdea: `Khích lệ tinh thần nỗ lực và chia sẻ phương pháp học tập hiệu quả.`,
        wordCount: 30,
      },
      phonetics: { title: `Ngữ âm HSK ${lvl}`, rule: "Phát âm chuẩn ngữ điệu tự nhiên và biến âm.", examples: ["zhōngwén", "nǔlì"] },
      culture: `Nét đẹp văn hóa và nghệ thuật giao tiếp Á Đông ứng dụng trong HSK ${lvl}.`,
      grammarExercises: [],
    });
  }
  return list;
}

export function getLessonsByHskLevel(level: number = 1): Hsk1FullLesson[] {
  const lvl = Math.max(1, Math.min(9, Number(level) || 1));
  let baseLessons: Hsk1FullLesson[] = [];
  if (lvl === 1) {
    baseLessons = [...OFFICIAL_HSK1_15_LESSONS];
  } else if (lvl === 2) {
    baseLessons = [...OFFICIAL_HSK2_15_LESSONS];
  } else {
    baseLessons = generateFallbackLessonsForLevel(lvl);
  }

  // Nếu Admin đã tùy biến hoặc bổ sung bài học trong kho chung
  if (typeof window !== "undefined") {
    try {
      const savedRaw = localStorage.getItem(`hsk_admin_custom_curriculum_level_${lvl}`);
      if (savedRaw) {
        const customLessons: Hsk1FullLesson[] = JSON.parse(savedRaw);
        if (Array.isArray(customLessons) && customLessons.length > 0) {
          const lessonMap = new Map<number, Hsk1FullLesson>();
          // Đưa base vào trước
          baseLessons.forEach((l) => lessonMap.set(l.number, l));
          // Đè hoặc bổ sung custom của Admin vào
          customLessons.forEach((l) => lessonMap.set(l.number, l));
          return Array.from(lessonMap.values()).sort((a, b) => a.number - b.number);
        }
      }
    } catch (e) {
      console.warn("Failed to parse custom admin curriculum from storage:", e);
    }
  }

  return baseLessons;
}

export function getLessonByNumber(level: number = 1, num: number): Hsk1FullLesson | undefined {
  const lessons = getLessonsByHskLevel(level);
  return lessons.find((l) => l.number === num) || lessons[0];
}

export function getDefaultLessons(level: number): Hsk1FullLesson[] {
  return getLessonsByHskLevel(level);
}
