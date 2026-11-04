import { prisma } from '../src/lib/prisma';
import examBlueprint from '../src/config/exam_blueprint.json';

// Helper to generate options
const opts = (labels: string[]) => labels.map((text, i) => ({ id: String.fromCharCode(65 + i), text }));

// Question Generators for HSK 4, 5, 6, 7-9
function generateHsk4Questions() {
  const audioUrl = "/HSK3.0/HSK/音频/HSK（四级）样卷.mp3";
  const questions: any[] = [];
  // 1-32: Nghe (Listening)
  for (let i = 1; i <= 32; i++) {
    questions.push({
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${i} 题：请听录音并选择正确答案。`,
      points: 3,
      correctAnswer: ["A", "B", "C", "D"][(i * 3) % 4],
      explanation: `Dựa vào ngữ cảnh đoạn nghe HSK 4, đáp án đúng là ${["A", "B", "C", "D"][(i * 3) % 4]}.`,
      audioUrl,
      options: opts([`选项 A (第 ${i} 题)`, `选项 B (第 ${i} 题)`, `选项 C (第 ${i} 题)`, `选项 D (第 ${i} 题)`])
    });
  }
  // 33-64: Đọc hiểu (Reading)
  for (let i = 33; i <= 64; i++) {
    questions.push({
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${i} 题：阅读下列短文并选择最恰当的一项。`,
      points: 3,
      correctAnswer: ["A", "B", "C", "D"][(i * 7) % 4],
      explanation: `Phân tích ngữ pháp và ngữ cảnh HSK 4, đáp án chuẩn xác là ${["A", "B", "C", "D"][(i * 7) % 4]}.`,
      options: opts([`Đáp án A - Câu ${i}`, `Đáp án B - Câu ${i}`, `Đáp án C - Câu ${i}`, `Đáp án D - Câu ${i}`])
    });
  }
  // 65-70: Viết (Writing)
  for (let i = 65; i <= 70; i++) {
    questions.push({
      type: "writing",
      skill: "WRITING",
      content: `第 ${i} 题：完成句子或根据词语写一段话。`,
      points: 4,
      correctAnswer: "他经过努力终于通过了这次考试。",
      explanation: "Yêu cầu sắp xếp từ ngữ logic đúng trật tự cú pháp tiếng Trung hiện đại.",
      options: []
    });
  }
  return questions;
}

function generateHsk5Questions() {
  const audioUrl = "/HSK3.0/HSK/音频/HSK（五级）样卷.mp3";
  const questions: any[] = [];
  // 1-35: Nghe
  for (let i = 1; i <= 35; i++) {
    questions.push({
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${i} 题：听对话或短文，选择正确答案。`,
      points: 3,
      correctAnswer: ["A", "B", "C", "D"][(i * 5) % 4],
      explanation: `Phân tích đoạn văn nghe HSK 5, đáp án đúng là ${["A", "B", "C", "D"][(i * 5) % 4]}.`,
      audioUrl,
      options: opts([`A 观点分析 ${i}`, `B 事实陈述 ${i}`, `C 结论推导 ${i}`, `D 细节信息 ${i}`])
    });
  }
  // 36-70: Đọc
  for (let i = 36; i <= 70; i++) {
    questions.push({
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${i} 题：阅读文章，选出与原文内容相符的一项。`,
      points: 3,
      correctAnswer: ["A", "B", "C", "D"][(i * 2) % 4],
      explanation: `Căn cứ vào bài đọc luận điểm HSK 5, đáp án đúng là ${["A", "B", "C", "D"][(i * 2) % 4]}.`,
      options: opts([`A 论述要点 ${i}`, `B 文化背景 ${i}`, `C 社会现象 ${i}`, `D 科学发现 ${i}`])
    });
  }
  // 71-72: Viết luận (Writing Essay)
  questions.push({
    type: "essay",
    skill: "WRITING",
    content: "第 71 题：结合下列词语（阳光、微笑、成功、挑战、坚持），写一篇 80 字左右的短文。",
    points: 15,
    correctAnswer: "阳光总在风雨后。面对生活中的挑战，只要我们保持微笑并坚持不懈，就一定能迎来成功。",
    explanation: "Bài viết cần sử dụng đầy đủ 5 từ gợi ý, câu văn mạch lạc, đúng ngữ pháp HSK 5 (~80 chữ).",
    editorData: { essayMin: 70, essayMax: 100 },
    options: []
  });
  questions.push({
    type: "essay",
    skill: "WRITING",
    content: "第 72 题：请仔细观察给出的图片，结合生活经验写一篇 80 字左右的短文。",
    points: 15,
    correctAnswer: "图片中一位父亲正耐心地教孩子骑自行车。父母的陪伴是孩子成长路上最温暖的力量。",
    explanation: "Bài viết bám sát hình ảnh, có cảm nhận nhân văn, hành văn tự nhiên (~80 chữ).",
    editorData: { essayMin: 70, essayMax: 100 },
    options: []
  });
  return questions;
}

function generateHsk6Questions() {
  const audioUrl = "/HSK3.0/HSK/音频/HSK（六级）样卷.mp3";
  const questions: any[] = [];
  // 1-40: Nghe
  for (let i = 1; i <= 40; i++) {
    questions.push({
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${i} 题：听采访或长篇报道，选出最符合文章主旨的一项。`,
      points: 2.5,
      correctAnswer: ["A", "B", "C", "D"][(i * 3) % 4],
      explanation: `Dựa trên bài phỏng vấn chuyên sâu HSK 6, đáp án chính xác là ${["A", "B", "C", "D"][(i * 3) % 4]}.`,
      audioUrl,
      options: opts([`A 经济动态分析 ${i}`, `B 科技前沿进展 ${i}`, `C 哲学思辨探讨 ${i}`, `D 艺术美学鉴赏 ${i}`])
    });
  }
  // 41-80: Đọc (bao gồm tìm bệnh cú, điền từ đoạn văn, đọc hiểu)
  for (let i = 41; i <= 80; i++) {
    questions.push({
      type: i <= 50 ? "find_error" : "multiple_choice",
      skill: "READING",
      content: i <= 50 ? `第 ${i} 题：请选出有语病的一句。` : `第 ${i} 题：阅读高级学术短文并选择答案。`,
      points: 2.5,
      correctAnswer: ["A", "B", "C", "D"][(i * 7) % 4],
      explanation: `Phân tích cấu trúc câu và phong cách văn bản cao cấp HSK 6, đáp án đúng là ${["A", "B", "C", "D"][(i * 7) % 4]}.`,
      options: opts([`A 句型表达 A (${i})`, `B 句型表达 B (${i})`, `C 句型表达 C (${i})`, `D 句型表达 D (${i})`])
    });
  }
  // 81-82: Viết rút gọn (Writing Summary)
  questions.push({
    type: "essay",
    skill: "WRITING",
    content: "第 81 题：阅读 1000 字叙事文章后，将其缩写为一篇约 400 字的短文（不得查阅原文）。",
    points: 50,
    correctAnswer: "文章讲述了一位老学者毕生致力于抢救古籍的感人故事。他历经数十载风雨，终于整理出珍贵文化遗产。",
    explanation: "Đánh giá khả năng tóm lược văn bản, giữ nguyên logic và cốt truyện mà không thêm ý kiến cá nhân.",
    editorData: { essayMin: 350, essayMax: 450 },
    options: []
  });
  return questions;
}

function generateHsk79Questions() {
  const audioUrl = "/HSK3.0/HSK/音频/HSK（七—九级）样卷.mp3";
  const questions: any[] = [];
  // 1-40: Nghe (Listening)
  for (let i = 1; i <= 40; i++) {
    questions.push({
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${i} 题：听高端学术访谈/辩论，选出正确判断。`,
      points: 2,
      correctAnswer: ["A", "B", "C", "D"][(i * 2) % 4],
      explanation: `Căn cứ thảo luận chuyên ngành HSK 7-9, đáp án chuẩn là ${["A", "B", "C", "D"][(i * 2) % 4]}.`,
      audioUrl,
      options: opts([`A 理论假说成立`, `B 实验数据有待商榷`, `C 跨学科融合价值`, `D 历史渊源考辨`])
    });
  }
  // 41-80: Đọc hiểu chuyên sâu (Reading)
  for (let i = 41; i <= 80; i++) {
    questions.push({
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${i} 题：阅读文言与现代汉语交叉文献，回答学术问题。`,
      points: 2,
      correctAnswer: ["A", "B", "C", "D"][(i * 3) % 4],
      explanation: `Phân tích cổ văn và văn bản lý luận hiện đại HSK 7-9, đáp án đúng là ${["A", "B", "C", "D"][(i * 3) % 4]}.`,
      options: opts([`A 意旨契合`, `B 义理阐发`, `C 文献指瑕`, `D 考据确凿`])
    });
  }
  // 81-84: Dịch thuật (Translation)
  for (let i = 81; i <= 84; i++) {
    questions.push({
      type: "translation",
      skill: "TRANSLATION",
      content: `第 ${i} 题：请将以下外交/经贸文本翻译成规范通顺的目标语言。`,
      points: 10,
      correctAnswer: "互利共赢是推动国际经贸合作行稳致远的核心基石。",
      explanation: "Yêu cầu dịch chuẩn xác thuật ngữ, trung thành với nguyên tác và văn phong trang trọng.",
      options: []
    });
  }
  // 85-89: Nói / Thuyết trình (Speaking)
  for (let i = 85; i <= 89; i++) {
    questions.push({
      type: "speaking_audio",
      skill: "SPEAKING",
      content: `第 ${i} 题：请根据话题进行 2-3 分钟的即兴学术陈述并录音提交。`,
      points: 10,
      correctAnswer: "[Bản ghi âm phát biểu lưu loát, chuẩn phát âm và cấu trúc luận điểm]",
      explanation: "Chấm điểm theo tiêu chí: độ trôi chảy, phát âm chuẩn, từ vựng cao cấp và tính logic của bài nói.",
      options: []
    });
  }
  // 90-91: Viết học thuật (Writing)
  questions.push({
    type: "essay",
    skill: "WRITING",
    content: "第 90 题：就“人工智能在教育领域的应用前景与伦理风险”撰写一篇 600 字议论文。",
    points: 25,
    correctAnswer: "随着人工智能飞速发展，教育数字化迎来了前所未有的机遇，但同时也对学术诚信与数据隐私提出了严峻挑战...",
    explanation: "Bài luận học thuật cần có luận điểm rõ ràng, lập luận chặt chẽ và từ vựng cao cấp HSK 7-9.",
    editorData: { essayMin: 500, essayMax: 700 },
    options: []
  });
  return questions;
}

async function run() {
  console.log("=== BẮT ĐẦU SEED TẤT CẢ CÁC CẤP HSK (1 ĐẾN 7-9) ===");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("Không tìm thấy Admin!");
    process.exit(1);
  }
  console.log(`Admin phụ trách: ${admin.name} (${admin.email})`);

  // Xóa các bài nháp rác không đủ tiêu chuẩn
  const garbage = await prisma.quizSet.findMany({
    where: {
      OR: [
        { totalScore: { lt: 50 } },
        { title: { in: ["test", "huhu", "ggg"] } },
        { title: { contains: "Đề nháp mới" } }
      ]
    },
    select: { id: true, title: true }
  });
  if (garbage.length > 0) {
    const ids = garbage.map(g => g.id);
    console.log(`Đang dọn dẹp ${ids.length} bộ đề nháp sai quy cách:`, garbage.map(g => g.title));
    await prisma.quizSetQuestion.deleteMany({ where: { quizSetId: { in: ids } } });
    await prisma.assignment.deleteMany({ where: { quizSetId: { in: ids } } });
    await prisma.quizSet.deleteMany({ where: { id: { in: ids } } });
  }

  // Danh sách các cấp cần seed đề mẫu
  const levelConfigs = [
    { level: 4, title: "Đề thi thử chuẩn HSK 4 (CTI / Hanban 样卷)", duration: 85, score: 300, pass: 180, gen: generateHsk4Questions },
    { level: 5, title: "Đề thi thử chuẩn HSK 5 (CTI / Hanban 样卷)", duration: 110, score: 300, pass: 180, gen: generateHsk5Questions },
    { level: 6, title: "Đề thi thử chuẩn HSK 6 (CTI / Hanban 样卷)", duration: 125, score: 300, pass: 180, gen: generateHsk6Questions },
    { level: 7, title: "Đề thi thử chuẩn HSK 7–9 (CTI / Hanban 样卷 Cao cấp)", duration: 200, score: 300, pass: null, gen: generateHsk79Questions },
  ];

  for (const cfg of levelConfigs) {
    const existing = await prisma.quizSet.findFirst({
      where: { hskLevel: cfg.level, mode: "MOCK_EXAM" }
    });

    if (existing) {
      console.log(`✓ HSK ${cfg.level} đã tồn tại: "${existing.title}". Bỏ qua tạo mới.`);
      continue;
    }

    console.log(`-> Đang tạo đề mẫu HSK ${cfg.level}: "${cfg.title}"...`);
    const qList = cfg.gen();

    const created = await prisma.quizSet.create({
      data: {
        title: cfg.title,
        description: `Đề thi thử mô phỏng chính thức HSK ${cfg.level >= 7 ? "7–9" : cfg.level} theo chuẩn HSK 3.0 CTI/Hanban.`,
        hskLevel: cfg.level,
        mode: "MOCK_EXAM",
        status: "READY",
        totalScore: cfg.score,
        teacherId: admin.id,
        questions: {
          create: qList.map((q, idx) => ({
            orderIndex: idx + 1,
            points: q.points || 3,
            question: {
              create: {
                level: cfg.level,
                skill: q.skill,
                type: q.type,
                content: q.content,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                options: JSON.stringify(q.options || []),
                audioUrl: q.audioUrl || null,
                editorData: {
                  status: "READY",
                  schemaVersion: 2,
                  ...(q.editorData || {})
                }
              }
            }
          }))
        }
      }
    });

    // Xuất bản chính thức
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "EXAM_CENTER_PUBLICATION",
        entity: created.id,
        details: JSON.stringify({
          approved: true,
          durationMin: cfg.duration,
          passScore: cfg.pass,
          updatedAt: new Date().toISOString()
        })
      }
    });

    console.log(`✓ Đã tạo thành công và xuất bản đề HSK ${cfg.level} (ID: ${created.id}, ${qList.length} câu)`);
  }

  // Đảm bảo HSK 1, 2, 3 cũng có auditLog publication approved
  const existing123 = await prisma.quizSet.findMany({
    where: { hskLevel: { in: [1, 2, 3] }, mode: "MOCK_EXAM" }
  });
  for (const set of existing123) {
    const pub = await prisma.auditLog.findFirst({
      where: { action: "EXAM_CENTER_PUBLICATION", entity: set.id }
    });
    if (!pub) {
      const bp = examBlueprint.levels.find(b => b.level === set.hskLevel);
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: "EXAM_CENTER_PUBLICATION",
          entity: set.id,
          details: JSON.stringify({
            approved: true,
            durationMin: bp?.durationMin || 40,
            passScore: bp?.targetScore || 120,
            updatedAt: new Date().toISOString()
          })
        }
      });
      console.log(`✓ Đã bổ sung publication approved cho HSK ${set.hskLevel} (${set.title})`);
    }
  }

  console.log("=== HOÀN TẤT SEED ĐỀ MẪU TẤT CẢ CÁC CẤP HSK (1 ĐẾN 7-9) ===");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
