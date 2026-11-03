export interface HskTopicOption {
  id: string;
  titleZh: string;
  titleVi: string;
  desc: string;
  initialAiPromptZh: string;
  initialAiPromptPinyin: string;
  initialAiPromptVi: string;
  initialSuggestions: Array<{
    zh: string;
    pinyin: string;
    vi: string;
    grammarStructure?: string;
    explanation?: string;
  }>;
}

export interface HskLevelMetadata {
  level: number;
  badge: string;
  title: string;
  speechRate: number;
  charRange: string;
  description: string;
  topics: HskTopicOption[];
}

export const HSK_LEVEL_CONFIG: Record<number, HskLevelMetadata> = {
  1: {
    level: 1,
    badge: "HSK 1",
    title: "Giao tiếp nhập môn",
    speechRate: 0.75,
    charRange: "3–8 chữ Hán",
    description: "AI nói rất chậm, câu cực ngắn (3–8 chữ Hán), mỗi lần chỉ hỏi 1 câu đơn giản, đầy đủ Pinyin.",
    topics: [
      {
        id: "hsk1_greeting",
        titleZh: "问候与相识",
        titleVi: "Chào hỏi & Làm quen",
        desc: "Chào hỏi cơ bản, hỏi tên và quốc tịch",
        initialAiPromptZh: "你好！我叫小语。你叫什么？",
        initialAiPromptPinyin: "Nǐ hǎo! Wǒ jiào Xiǎo Yǔ. Nǐ jiào shénme?",
        initialAiPromptVi: "Chào bạn! Mình tên là Tiểu Ngữ. Bạn tên là gì?",
        initialSuggestions: [
          {
            zh: "你好，我叫大卫。",
            pinyin: "Nǐ hǎo, wǒ jiào Dàwèi.",
            vi: "Chào bạn, mình tên là David.",
            grammarStructure: "我叫 + Tên",
            explanation: "Mẫu câu giới thiệu tên ngắn gọn nhất trong HSK 1.",
          },
          {
            zh: "你好！很高兴认识你。",
            pinyin: "Nǐ hǎo! Hěn gāoxìng rènshí nǐ.",
            vi: "Chào bạn! Rất vui được làm quen với bạn.",
            grammarStructure: "很高兴 + 认识 + Bạn",
            explanation: "Câu lịch sự kinh điển khi mới làm quen.",
          },
        ],
      },
      {
        id: "hsk1_nationality",
        titleZh: "姓名与国籍",
        titleVi: "Tên tuổi & Quốc tịch",
        desc: "Hỏi quốc tịch, bạn là người nước nào",
        initialAiPromptZh: "我是中国人。你是哪国人？",
        initialAiPromptPinyin: "Wǒ shì Zhōngguó rén. Nǐ shì nǎ guó rén?",
        initialAiPromptVi: "Mình là người Trung Quốc. Bạn là người nước nào?",
        initialSuggestions: [
          {
            zh: "我是越南人。你呢？",
            pinyin: "Wǒ shì Yuènán rén. Nǐ ne?",
            vi: "Mình là người Việt Nam. Còn bạn?",
            grammarStructure: "我是 + Quốc gia + 人",
            explanation: "Dùng để giới thiệu quốc tịch của mình và hỏi lại bạn.",
          },
          {
            zh: "我是学生，你是老师吗？",
            pinyin: "Wǒ shì xuésheng, nǐ shì lǎoshī ma?",
            vi: "Tôi là học sinh, bạn là giáo viên phải không?",
            grammarStructure: "我是... 你是... 吗？",
            explanation: "Hỏi đáp về nghề nghiệp và thân phận.",
          },
        ],
      },
      {
        id: "hsk1_family",
        titleZh: "家庭与家人",
        titleVi: "Gia đình & Thành viên",
        desc: "Hỏi số thành viên và các thành viên gia đình",
        initialAiPromptZh: "你家有几口人？",
        initialAiPromptPinyin: "Nǐ jiā yǒu jǐ kǒu rén?",
        initialAiPromptVi: "Nhà bạn có mấy người?",
        initialSuggestions: [
          {
            zh: "我家有四口人。",
            pinyin: "Wǒ jiā yǒu sì kǒu rén.",
            vi: "Nhà mình có 4 người.",
            grammarStructure: "我家有 + Số lượng + 口人",
            explanation: "Lượng từ '口' chuyên dùng để đếm nhân khẩu trong gia đình.",
          },
        ],
      },
      {
        id: "hsk1_food",
        titleZh: "吃喝与喜好",
        titleVi: "Ăn uống đơn giản",
        desc: "Hỏi sở thích ăn cơm, uống trà, hoa quả",
        initialAiPromptZh: "你喜欢喝茶吗？",
        initialAiPromptPinyin: "Nǐ xǐhuān hē chá ma?",
        initialAiPromptVi: "Bạn thích uống trà không?",
        initialSuggestions: [
          {
            zh: "我喜欢喝茶，也喜欢喝水。",
            pinyin: "Wǒ xǐhuān hē chá, yě xǐhuān hē shuǐ.",
            vi: "Mình thích uống trà, cũng thích uống nước.",
            grammarStructure: "喜欢 + Động từ (Thích làm gì)",
            explanation: "Từ vựng ăn uống quen thuộc trong bài học HSK 1.",
          },
        ],
      },
    ],
  },
  2: {
    level: 2,
    badge: "HSK 2",
    title: "Giao tiếp cơ bản",
    speechRate: 0.85,
    charRange: "5–12 chữ Hán",
    description: "Nói chậm, câu dài 5–12 chữ, hỏi 1–2 ý liên quan, hỏi tiếp theo câu trả lời.",
    topics: [
      {
        id: "hsk2_dining",
        titleZh: "餐饮与买菜",
        titleVi: "Ăn uống & Mua sắm",
        desc: "Hỏi món ăn yêu thích, giá cả, đi nhà hàng",
        initialAiPromptZh: "今天你想吃什么中国菜？",
        initialAiPromptPinyin: "Jīntiān nǐ xiǎng chī shénme Zhōngguó cài?",
        initialAiPromptVi: "Hôm nay bạn muốn ăn món Trung Quốc nào?",
        initialSuggestions: [
          {
            zh: "我想吃饺子，听说很好吃。",
            pinyin: "Wǒ xiǎng chī jiǎozi, tīngshuō hěn hǎochī.",
            vi: "Mình muốn ăn sủi cảo, nghe nói rất ngon.",
            grammarStructure: "我想 + Động từ (Muốn làm gì)",
            explanation: "Bày tỏ nguyện vọng và lý do đơn giản.",
          },
          {
            zh: "这个多少钱？可以便宜一点吗？",
            pinyin: "Zhè ge duōshao qián? Kěyǐ piányi yìdiǎn ma?",
            vi: "Cái này bao nhiêu tiền? Có thể rẻ hơn một chút không?",
            grammarStructure: "多少钱？便宜一点",
            explanation: "Mẫu câu mua sắm hỏi giá cơ bản HSK 2.",
          },
        ],
      },
      {
        id: "hsk2_daily",
        titleZh: "日常生活习惯",
        titleVi: "Sinh hoạt & Thời gian",
        desc: "Hỏi giờ giấc thức dậy, thói quen sinh hoạt",
        initialAiPromptZh: "你每天早上几点起床？",
        initialAiPromptPinyin: "Nǐ měitiān zǎoshang jǐ diǎn qǐchuáng?",
        initialAiPromptVi: "Mỗi sáng bạn thức dậy lúc mấy giờ?",
        initialSuggestions: [
          {
            zh: "我每天早上七点起床。",
            pinyin: "Wǒ měitiān zǎoshang qī diǎn qǐchuáng.",
            vi: "Mỗi ngày mình thức dậy lúc 7 giờ sáng.",
            grammarStructure: "Thời gian đứng trước động từ",
            explanation: "Trật tự thời gian kinh điển trong tiếng Trung.",
          },
        ],
      },
      {
        id: "hsk2_weather",
        titleZh: "天气与出行",
        titleVi: "Thời tiết & Đi lại",
        desc: "Thời tiết hôm nay, phương tiện đi xe buýt/tàu điện",
        initialAiPromptZh: "今天天气怎么样？冷不冷？",
        initialAiPromptPinyin: "Jīntiān tiānqì zěnmeyàng? Lěng bù lěng?",
        initialAiPromptVi: "Thời tiết hôm nay thế nào? Có lạnh không?",
        initialSuggestions: [
          {
            zh: "今天天气很好，不太冷。",
            pinyin: "Jīntiān tiānqì hěn hǎo, bú tài lěng.",
            vi: "Hôm nay thời tiết rất tốt, không lạnh lắm.",
            grammarStructure: "不太 + Tính từ (Không ... lắm)",
            explanation: "Mẫu câu phủ định nhẹ nhàng thường gặp ở HSK 2.",
          },
        ],
      },
    ],
  },
  3: {
    level: 3,
    badge: "HSK 3",
    title: "Hội thoại đời sống",
    speechRate: 0.90,
    charRange: "8–18 chữ Hán",
    description: "Tốc độ vừa phải, câu 8–18 chữ, giải thích lý do, kể lại sự việc đơn giản.",
    topics: [
      {
        id: "hsk3_study",
        titleZh: "学习与考试计划",
        titleVi: "Học tập & Kế hoạch thi cử",
        desc: "Kể về quá trình học tiếng Trung và lý do học",
        initialAiPromptZh: "你学习汉语多长时间了？打算考HSK吗？",
        initialAiPromptPinyin: "Nǐ xuéxí Hànyǔ duō cháng shíjiān le? Dǎsuàn kǎo HSK ma?",
        initialAiPromptVi: "Bạn học tiếng Trung bao lâu rồi? Có dự định thi HSK không?",
        initialSuggestions: [
          {
            zh: "我学了半年了，打算今年考HSK3级。",
            pinyin: "Wǒ xué le bàn nián le, dǎsuàn jīnnián kǎo HSK 3 jí.",
            vi: "Mình học được nửa năm rồi, dự định năm nay thi HSK 3.",
            grammarStructure: "Động từ + 了 + Thời lượng + 了",
            explanation: "Diễn tả hành động đã diễn ra và vẫn đang tiếp diễn.",
          },
        ],
      },
      {
        id: "hsk3_travel",
        titleZh: "旅游与出行体验",
        titleVi: "Du lịch & Trải nghiệm",
        desc: "Kể về chuyến đi gần nhất và địa điểm muốn đến",
        initialAiPromptZh: "如果有假期，你最想去中国哪个城市旅游？",
        initialAiPromptPinyin: "Rúguǒ yǒu jiàqī, nǐ zuì xiǎng qù Zhōngguó nǎ ge chéngshì lǚyóu?",
        initialAiPromptVi: "Nếu có kỳ nghỉ, bạn muốn đến thành phố nào của Trung Quốc nhất?",
        initialSuggestions: [
          {
            zh: "我想去北京看看故宫，还想去吃烤鸭。",
            pinyin: "Wǒ xiǎng qù Běijīng kànkan Gùgōng, hái xiǎng qù chī kǎoyā.",
            vi: "Mình muốn đi Bắc Kinh ngắm Cố Cung, còn muốn đi ăn vịt quay.",
            grammarStructure: "想...还想... (Muốn... còn muốn...)",
            explanation: "Liên kết hai mục đích hành động song song.",
          },
        ],
      },
    ],
  },
  4: {
    level: 4,
    badge: "HSK 4",
    title: "Giao tiếp tự nhiên",
    speechRate: 0.95,
    charRange: "Câu dài, ngữ cảnh sâu",
    description: "Tốc độ tự nhiên, câu hỏi mở, hỏi sâu, học viên kể chuyện và giải thích quan điểm.",
    topics: [
      {
        id: "hsk4_experience",
        titleZh: "个人经历与难忘的事",
        titleVi: "Kinh nghiệm cá nhân & Cảm xúc",
        desc: "Kể về kỷ niệm đáng nhớ hoặc bước ngoặt cuộc sống",
        initialAiPromptZh: "在你的成长经历中，有没有哪件事对你影响特别大？能和我分享一下吗？",
        initialAiPromptPinyin: "Zài nǐ de chéngzhǎng jīnglì zhōng, yǒu méiyǒu nǎ jiàn shì duì nǐ yǐngxiǎng tèbié dà? Néng hé wǒ fēnxiǎng yíxià ma?",
        initialAiPromptVi: "Trong quá trình trưởng thành, có sự việc nào ảnh hưởng sâu sắc đến bạn không? Bạn chia sẻ được không?",
        initialSuggestions: [
          {
            zh: "第一次离开家去外地上大学时，让我学会了独立生活。",
            pinyin: "Dì-yī cì líkāi jiā qù wàidì shàng dàxué shí, ràng wǒ xuéhuì le dúlì shēnghuó.",
            vi: "Lần đầu tiên rời nhà đi học đại học xa đã dạy mình cách sống tự lập.",
            grammarStructure: "让/使 + Ai đó + Động từ (Khiến cho/làm cho)",
            explanation: "Câu kiêm ngữ diễn đạt nguyên nhân kết quả tinh tế.",
          },
        ],
      },
      {
        id: "hsk4_workplace",
        titleZh: "职场经历与工作压力",
        titleVi: "Công việc & Áp lực đời sống",
        desc: "Thảo luận về cân bằng công việc và cuộc sống",
        initialAiPromptZh: "面对工作和学习的压力，你通常会用什么方法来放松心情？",
        initialAiPromptPinyin: "Miànduì gōngzuò hé xuéxí de yālì, nǐ tōngcháng huì yòng shénme fāngfǎ lái fàngsōng xīnqíng?",
        initialAiPromptVi: "Khi đối mặt với áp lực học tập và công việc, bạn thường giải tỏa tâm trạng bằng cách nào?",
        initialSuggestions: [
          {
            zh: "我一般会去听音乐或者跑步，这样不仅健康而且能减轻压力。",
            pinyin: "Wǒ yībān huì qù tīng yīnyuè huòzhě pǎobù, zhèyàng bùjǐn jiànkāng érqiě néng jiǎnqīng yālì.",
            vi: "Mình thường nghe nhạc hoặc chạy bộ, như vậy không chỉ khỏe mạnh mà còn giảm bớt áp lực.",
            grammarStructure: "不仅...而且... (Không những... mà còn...)",
            explanation: "Cấu trúc tăng tiến chuẩn HSK 4.",
          },
        ],
      },
    ],
  },
  5: {
    level: 5,
    badge: "HSK 5",
    title: "Giao tiếp chuyên sâu",
    speechRate: 0.98,
    charRange: "Cấu trúc phức tạp, so sánh phản biện",
    description: "Nói tự nhiên, cấu trúc phức tạp, so sánh phân tích, AI đưa quan điểm khác để phản hồi.",
    topics: [
      {
        id: "hsk5_culture",
        titleZh: "传统文化与现代变迁",
        titleVi: "Văn hóa truyền thống & Hiện đại",
        desc: "So sánh giá trị truyền thống và lối sống công nghệ mới",
        initialAiPromptZh: "现代年轻人越来越依赖手机和社交媒体，有人认为这拉近了人与人的距离，但也有人觉得这让人更孤独。你对此持什么态度？",
        initialAiPromptPinyin: "Xiàndài niánqīngrén yuèláiyuè yīlài shǒujī hé shèjiāo méitǐ, yǒurén rènwéi zhè lājìn le rén yǔ rén de jùlí, dàn yě yǒurén juéde zhè ràng rén gèng gūdú. Nǐ duì cǐ chí shénme tàidù?",
        initialAiPromptVi: "Giới trẻ ngày càng lệ thuộc vào điện thoại và mạng xã hội. Có người cho rằng điều này kéo gần khoảng cách, nhưng cũng có người thấy nó làm con người cô đơn hơn. Bạn có thái độ thế nào?",
        initialSuggestions: [
          {
            zh: "我认为凡事都有两面性，网络便利了沟通，但面对面的真实陪伴依然无法替代。",
            pinyin: "Wǒ rènwéi fánshì dōu yǒu liǎngmiànxìng, wǎnglù biànlì le gōutōng, dàn miànduìmiàn de zhēnshí péibàn yīrán wúfǎ tìdài.",
            vi: "Tôi cho rằng sự việc nào cũng có hai mặt, mạng internet giúp việc giao tiếp tiện lợi, nhưng sự đồng hành trực tiếp vẫn không thể thay thế.",
            grammarStructure: "凡事都有两面性 (Mọi việc đều có tính 2 mặt)",
            explanation: "Thành ngữ và lập luận đa chiều chuẩn phong cách HSK 5.",
          },
        ],
      },
    ],
  },
  6: {
    level: 6,
    badge: "HSK 6",
    title: "Thảo luận & Phản biện",
    speechRate: 1.0,
    charRange: "Tiếng Trung cao cấp, lập luận sắc bén",
    description: "Phân tích nguyên nhân - hệ quả, bảo vệ luận điểm và phản biện sâu sắc.",
    topics: [
      {
        id: "hsk6_economy",
        titleZh: "人工智能与就业结构变革",
        titleVi: "Trí tuệ nhân tạo & Thị trường lao động",
        desc: "Tranh luận về việc AI thay thế lao động con người và đối sách",
        initialAiPromptZh: "随着生成式AI的爆发式发展，许多传统脑力岗位正面临被颠覆的风险。你认为我们应当采取何种机制来防范结构性失业并引导技术向善？",
        initialAiPromptPinyin: "Suízhe shēngchéngshì AI de bàofāshì fāzhǎn, xǔduō chuántǒng nǎolì gǎngwèi zhèng miànlín bèi diānfù de fēngxiǎn. Nǐ rènwéi wǒmen yīngdāng cǎiqǔ hézhǒng jīzhì lái fángfàn jiégòuxìng shīyè bìng yǐndǎo jìshù xiàngshàn?",
        initialAiPromptVi: "Với sự bùng nổ của AI tạo sinh, nhiều vị trí lao động trí óc truyền thống đang đối mặt nguy cơ bị đảo lộn. Theo bạn chúng ta nên áp dụng cơ chế nào để phòng ngừa thất nghiệp cơ cấu và định hướng công nghệ vì con người?",
        initialSuggestions: [
          {
            zh: "从长远来看，技术替代不可逆转，关键在于重构终身教育体系，培养批判性思维与跨界创新能力。",
            pinyin: "Cóng chángyuǎn láikàn, jìshù tìdài bùkě nìzhuǎn, guānjiàn zàiyú chónggòu zhōngshēn jiàoyù tǐxì, péiyǎng pīpànxìng sīwéi yǔ kuàjiè chuàngxīn nénglì.",
            vi: "Nhìn về lâu dài, sự thay thế công nghệ là không thể đảo ngược, điều then chốt nằm ở việc tái cấu trúc hệ thống giáo dục suốt đời.",
            grammarStructure: "从长远来看... 关键在于... (Nhìn về lâu dài... then chốt nằm ở...)",
            explanation: "Cấu trúc biện luận chuyên sâu ở bậc HSK 6.",
          },
        ],
      },
    ],
  },
  7: {
    level: 7,
    badge: "HSK 7",
    title: "Giao tiếp chuyên môn",
    speechRate: 1.0,
    charRange: "Học thuật, đàm phán, chính sách",
    description: "Ngôn ngữ chuyên ngành, mô phỏng phỏng vấn, họp, đàm phán và thuyết trình có dẫn chứng.",
    topics: [
      {
        id: "hsk7_business",
        titleZh: "国际商务谈判与跨国投资战略",
        titleVi: "Đàm phán thương mại & Đầu tư đa quốc gia",
        desc: "Mô phỏng đàm phán hợp đồng cung ứng và quản trị rủi ro tỷ giá",
        initialAiPromptZh: "在本次跨国战略合作意向谈判中，针对关于知识产权保护及本地化供应链配额的核心分歧，贵方能够提供怎样的折中解决方案？",
        initialAiPromptPinyin: "Zài běncì kuàguó zhànlüè hézuò yìxiàng tánpàn zhōng, zhēnduì guānyú zhīshi chǎnquán bǎohù jí běndìhuà gōngyìngliàn pèié de héxīn fēnqí, guìfāng nénggòu tígōng zěnyàng de zhézhōng jiějué fāng'àn?",
        initialAiPromptVi: "Trong cuộc đàm phán hợp tác chiến lược đa quốc gia lần này, đối với những bất đồng cốt lõi về bảo vệ sở hữu trí tuệ và hạn ngạch chuỗi cung ứng bản địa, phía quý công ty có thể đưa ra phương án nhượng bộ dung hòa nào?",
        initialSuggestions: [
          {
            zh: "我们提议设立阶段性技术互信审查机制，并在前三年保障不低于40%的属地化采购比例，以实现互利共赢。",
            pinyin: "Wǒmen tíyì shèlì jiēduànxìng jìshù hùxìn shěnchá jīzhì, bìng zài qián sān nián bǎozhàng bù dǐyú bǎifēnzhī sìshí de shǔdìhuà cǎigòu bǐlì, yǐ shíxiàn hùlì gòngyíng.",
            vi: "Chúng tôi đề xuất thiết lập cơ chế thẩm tra độ tin cậy kỹ thuật theo giai đoạn và bảo đảm tỷ lệ mua sắm bản địa không dưới 40% trong ba năm đầu.",
            grammarStructure: "设立...机制，以实现互利共赢 (Thiết lập cơ chế... để hiện thực hóa cùng có lợi)",
            explanation: "Thuật ngữ đàm phán thương mại quốc tế chuẩn mực bậc HSK 7.",
          },
        ],
      },
    ],
  },
  8: {
    level: 8,
    badge: "HSK 8",
    title: "Tranh luận nâng cao",
    speechRate: 1.0,
    charRange: "Diễn đạt tinh tế, phản biện đa chiều",
    description: "Chủ động phản biện, đưa tình huống giả định phức tạp, bảo vệ luận điểm đa góc nhìn.",
    topics: [
      {
        id: "hsk8_debate",
        titleZh: "全球通胀治理与货币政策博弈",
        titleVi: "Xung đột chính sách tiền tệ & Lạm phát toàn cầu",
        desc: "Phản biện đa chiều về sự đánh đổi giữa kìm chế lạm phát và suy thoái kinh tế",
        initialAiPromptZh: "有经济学家断言紧缩性货币政策是遏制通胀恶化的唯一良药，但亦有学者批评此举无异于饮鸩止渴，必将诱发流动性枯竭与深层衰退。你如何评判这两者之间的内在悖论？",
        initialAiPromptPinyin: "Yǒu jīngjì xuéjiā duànyán jǐnsuōxìng huòbì zhèngcè shì èzhì tōngzhàng èhuà de wéiyī liángyào, dàn yì yǒu xuézhě pīpíng cǐ jǔ wúyì yú yǐnzhènzhǐkě, bì jiāng yòufā liúdòngxìng kūjié yǔ shēncéng shuāituì. Nǐ rúhé píngpàn zhè liǎngxíng zhījiān de nèizài bèilùn?",
        initialAiPromptVi: "Có nhà kinh tế học khẳng định chính sách tiền tệ thắt chặt là liều thuốc duy nhất kiềm chế lạm phát, song cũng có học giả chỉ trích hành động này chẳng khác nào 'uống rượu độc giải khát'. Bạn đánh giá thế nào về nghịch lý nội tại này?",
        initialSuggestions: [
          {
            zh: "单一维度的货币工具难以根治供给侧断裂引发的滞胀，政策制定者必须在总量稳健与定向纾困之间寻求微妙的动态平衡。",
            pinyin: "Dānyī wéidù de huòbì gōngjù nányǐ gēnzhì gōnggǐ cè duànliè yǐnfā de zhìzhàng, zhèngcè zhìdìngzhě bìxū zài zǒngliàng wěnjiàn yǔ dìngxiàng shūkùn zhījiān xúnqiú wēimiào de dòngtài pínghéng.",
            vi: "Công cụ tiền tệ đơn chiều khó lòng chữa trị dứt điểm tình trạng đình lạm do đứt gãy phía nguồn cung...",
            grammarStructure: "难以根治... 必须在...与...之间寻求微妙的动态平衡",
            explanation: "Khả năng phân tích kinh tế vĩ mô tinh tế bậc HSK 8.",
          },
        ],
      },
    ],
  },
  9: {
    level: 9,
    badge: "HSK 9",
    title: "Giao tiếp thành thạo đỉnh cao",
    speechRate: 1.0,
    charRange: "Triết học, hàm ý tinh tế, thành ngữ điển cố",
    description: "Trình độ cao nhất, triết học, tư tưởng văn hóa, thành ngữ, hàm ý tinh tế, tranh luận liên tục.",
    topics: [
      {
        id: "hsk9_philosophy",
        titleZh: "儒道互补与现代人类的精神危机",
        titleVi: "Triết học Nho - Đạo & Khủng hoảng tinh thần hiện đại",
        desc: "Thảo luận về sự hòa hợp giữa 'Nhập thế hữu vi' và 'Thuận theo tự nhiên'",
        initialAiPromptZh: "当现代文明陷入无休止的技术异化与物欲膨胀时，先秦诸子‘知其不可而为之’的入世担当，与老庄‘绝圣弃智、复归于朴’的超然思辨，究竟何者方能为当代人构筑安身立命之所？愿闻高见。",
        initialAiPromptPinyin: "Dāng xiàndài wénmíng xiànrù wúxiūzhǐ de jìshù yìhuà yǔ wùyù péngzhàng shí, Xiān-Qín zhūzǐ ‘zhī qí bùkě ér wéi zhī’ de rùshì dāndāng, yǔ Lǎo-Zhuāng ‘jué shèng qì zhì, fù guī yú pǔ’ de chāorán sībiàn, jiùjìng hézhě fāng néng wèi dāngdàirén gòuzhù ānshēnlìmìng zhī suǒ? Yuàn wén gāojiàn.",
        initialAiPromptVi: "Khi nền văn minh hiện đại sa vào tha hóa công nghệ và ham muốn vật chất, giữa tinh thần nhập thế gánh vác của Nho gia và tư tưởng siêu nhiên 'thuận theo tự nhiên' của Lão Trang, điều gì mới có thể dựng xây chốn an thân lập mệnh cho con người đương đại? Xin được lắng nghe kiến giải sâu sắc của bạn.",
        initialSuggestions: [
          {
            zh: "二者实非非此即彼之对立，而呈阴阳相济之张力：外圆内方，以外在之担当匡正世风，以内省之冲淡安顿心神，方得自适。",
            pinyin: "Èr zhě shí fēi fēi cǐ jí bǐ zhī duìlì, ér chéng yīnyáng xiāngjì zhī zhānglì: wài yuán nèi fāng, yǐ wàizài zhī dāndāng kuāngzhèng shìfēng, yǐ nèixǐng zhī chōngdàn āndùn xīnshén, fāng dé zìshì.",
            vi: "Hai điều đó thực chất không phải thế đối lập loại trừ, mà mang sức căng tương hỗ âm dương: bên ngoài linh hoạt gánh vác việc đời, bên trong thanh thản tự tại, như thế mới an nhiên.",
            grammarStructure: "实非...而呈...: 外圆内方，方得自适",
            explanation: "Khẩu khí triết học uyên bác, vận dụng thành ngữ điển cố chuẩn HSK 9.",
          },
        ],
      },
    ],
  },
};
