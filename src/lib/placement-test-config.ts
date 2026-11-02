import fs from "fs";
import path from "path";

export interface PlacementQuestion {
  id: number;
  questionZh: string;
  pinyin: string;
  questionVi: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PlacementTestConfig {
  hsk1_3: PlacementQuestion[];
  hsk4_6: PlacementQuestion[];
}

export const DEFAULT_PLACEMENT_TESTS: PlacementTestConfig = {
  hsk1_3: [
    {
      id: 1,
      questionZh: "请问，这本词典是______的？",
      pinyin: "Qǐngwèn, zhè běn cídiǎn shì ______ de?",
      questionVi: "Xin hỏi, cuốn từ điển này là của ______?",
      options: ["哪 (Nào)", "什么 (Cái gì)", "谁 (Ai)", "怎么 (Thế nào)"],
      correctIndex: 2,
      explanation: "'谁' (shéi/shuí) là đại từ nghi vấn chỉ người, '是谁的' có nghĩa là 'của ai'.",
    },
    {
      id: 2,
      questionZh: "外面下大雨了，你______带一把伞吧。",
      pinyin: "Wàimiàn xià dàyǔ le, nǐ ______ dài yì bǎ sǎn ba.",
      questionVi: "Ngoài trời mưa to rồi, bạn ______ mang theo một chiếc ô đi.",
      options: ["最好 (Tốt nhất nên)", "常常 (Thường xuyên)", "正在 (Đang)", "已经 (Đã)"],
      correctIndex: 0,
      explanation: "'最好' dùng để đưa ra lời khuyên nhủ, đề xuất tích cực.",
    },
    {
      id: 3,
      questionZh: "今天的天气比昨天______得多。",
      pinyin: "Jīntiān de tiānqì bǐ zuótiān ______ de duō.",
      questionVi: "Thời tiết hôm nay so với hôm qua ______ hơn nhiều.",
      options: ["很冷 (Rất lạnh)", "冷 (Lạnh)", "太冷 (Quá lạnh)", "非常冷 (Cực kỳ lạnh)"],
      correctIndex: 1,
      explanation: "Trong câu so sánh chữ 比 (A + 比 + B + Tính từ + 得多), tính từ đứng độc lập không đi kèm phó từ chỉ mức độ.",
    },
    {
      id: 4,
      questionZh: "老师走进教室，把书包______桌子上。",
      pinyin: "Lǎoshī zǒujìn jiàoshì, bǎ shūbāo ______ zhuōzi shang.",
      questionVi: "Thầy giáo bước vào lớp, ______ cặp sách lên bàn.",
      options: ["坐在 (Ngồi ở)", "看着 (Nhìn)", "听见 (Nghe thấy)", "放在 (Đặt lên)"],
      correctIndex: 3,
      explanation: "Cấu trúc câu chữ 把: 把 + Tân ngữ + Động từ + 在 + Nơi chốn (放在桌子上: đặt lên bàn).",
    },
    {
      id: 5,
      questionZh: "他______汉语说得流利，______汉字也写得很漂亮。",
      pinyin: "Tā ______ hànyǔ shuō de liúlì, ______ hànzì yě xiě de hěn piàoliang.",
      questionVi: "Anh ấy ______ tiếng Hán nói lưu loát, ______ chữ Hán viết cũng rất đẹp.",
      options: [
        "虽然……但是…… (Mặc dù... nhưng...)",
        "不但……而且…… (Không những... mà còn...)",
        "因为……所以…… (Bởi vì... cho nên...)",
        "如果……就…… (Nếu... thì...)",
      ],
      correctIndex: 1,
      explanation: "Cặp liên từ tăng tiến '不但……而且……' (Không những... mà còn...) diễn tả mối quan hệ nâng cấp bổ sung.",
    },
  ],
  hsk4_6: [
    {
      id: 1,
      questionZh: "请大家抓紧时间，在会议开始前把这些材料______好。",
      pinyin: "Qǐng dàjiā zhuājǐn shíjiān, zài huìyì kāishǐ qián bǎ zhèxiē cáiliào ______ hǎo.",
      questionVi: "Xin mọi người tranh thủ thời gian, trước khi cuộc họp bắt đầu hãy ______ tài liệu này thật tốt.",
      options: ["准备 (Chuẩn bị)", "考虑 (Cân nhắc)", "安排 (Sắp xếp)", "打印 (In ấn)"],
      correctIndex: 0,
      explanation: "'准备好材料' (Chuẩn bị xong tài liệu), '好' làm bổ ngữ kết quả biểu thị hoàn thành mỹ mãn.",
    },
    {
      id: 2,
      questionZh: "______工作有多忙，他每天晚上______坚持读书半小时。",
      pinyin: "______ gōngzuò yǒu duō máng, tā měitiān wǎnshang ______ jiānchí dúshū bàn xiǎoshí.",
      questionVi: "______ công việc có bận thế nào, anh ấy mỗi tối ______ kiên trì đọc sách nửa tiếng.",
      options: [
        "尽管……还是…… (Dẫu rằng... vẫn...)",
        "只有……才…… (Chỉ có... mới...)",
        "不管……都…… (Cho dù... đều...)",
        "既然……就…… (Đã... thì...)",
      ],
      correctIndex: 2,
      explanation: "'不管 + đại từ nghi vấn (有多忙) + 都...' biểu thị điều kiện vô điều kiện.",
    },
    {
      id: 3,
      questionZh: "为了按时完成重点项目，两家公司进行了极其______的合作。",
      pinyin: "Wèile ànshí wánchéng zhòngdiǎn xiàngmù, liǎng jiā gōngsī jìnxíng le jíqí ______ de hézuò.",
      questionVi: "Để hoàn thành dự án trọng điểm đúng hạn, hai công ty đã tiến hành hợp tác vô cùng ______.",
      options: ["亲密 (Thân mật)", "密切 (Chặt chẽ/Mật thiết)", "亲切 (Thân thiết/Gần gũi)", "热情 (Nhiệt tình)"],
      correctIndex: 1,
      explanation: "'密切合作' là cụm cố định trong văn phong công việc/kinh tế, mang nghĩa hợp tác chặt chẽ.",
    },
    {
      id: 4,
      questionZh: "随着科技的飞速发展，人工智能在医疗领域发挥着______重要的作用。",
      pinyin: "Suízhe kējì de fēisù fāzhǎn, réngōng zhìnéng zài yīliáo lǐngyù fāhuī zhe ______ zhòngyào de zuòyòng.",
      questionVi: "Cùng với sự phát triển nhanh chóng của công nghệ, AI trong y tế phát huy vai trò ______ quan trọng.",
      options: ["常常 (Thường)", "稍微 (Hơi/Một chút)", "偶尔 (Thỉnh thoảng)", "日益 (Ngày một / Ngày càng)"],
      correctIndex: 3,
      explanation: "'日益' (rìyì) là phó từ văn viết trang trọng, biểu thị mức độ gia tăng theo từng ngày.",
    },
    {
      id: 5,
      questionZh: "大家集思广益，困扰团队多日的难题终于______。",
      pinyin: "Dàjiā jísīguǎngyì, kùnrǎo tuánduì duō rì de nántí zhōngyú ______.",
      questionVi: "Mọi người cùng nhau góp trí tuệ, câu hỏi khó làm đau đầu nhóm nhiều ngày cuối cùng cũng ______.",
      options: [
        "莫名其妙 (Kỳ lạ khó hiểu)",
        "迎刃而解 (Được giải quyết êm xuôi)",
        "画蛇添足 (Vẽ rắn thêm chân)",
        "半途而废 (Bỏ dở giữa chừng)",
      ],
      correctIndex: 1,
      explanation: "Thành ngữ '迎刃而解' (nghênh nhận nhi giải) chỉ những vấn đề khó khăn tìm ra cách và được giải quyết trơn tru.",
    },
  ],
};

const CONFIG_FILE = path.join(process.cwd(), "prisma", "placement-tests.json");

let memoryConfig: PlacementTestConfig = { ...DEFAULT_PLACEMENT_TESTS };

export function getPlacementQuestions(): PlacementTestConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        hsk1_3: Array.isArray(parsed.hsk1_3) && parsed.hsk1_3.length > 0 ? parsed.hsk1_3 : DEFAULT_PLACEMENT_TESTS.hsk1_3,
        hsk4_6: Array.isArray(parsed.hsk4_6) && parsed.hsk4_6.length > 0 ? parsed.hsk4_6 : DEFAULT_PLACEMENT_TESTS.hsk4_6,
      };
    }
  } catch (err) {
    console.error("Lỗi khi đọc placement-tests.json:", err);
  }
  return memoryConfig;
}

export function savePlacementQuestions(newConfig: Partial<PlacementTestConfig>): PlacementTestConfig {
  try {
    const current = getPlacementQuestions();
    const updated: PlacementTestConfig = {
      hsk1_3: newConfig.hsk1_3 || current.hsk1_3,
      hsk4_6: newConfig.hsk4_6 || current.hsk4_6,
    };
    memoryConfig = updated;

    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Lỗi khi ghi placement-tests.json:", err);
    return memoryConfig;
  }
}
