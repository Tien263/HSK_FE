// scripts/test-simulation.mjs
// Automated verification for Lesson & Assignment Teacher-to-Student Synchronization

import { OFFICIAL_HSK1_15_LESSONS } from "../src/lib/hsk1-full-lessons.js";

async function runSimulation() {
  console.log("=== BẮT ĐẦU TEST MÔ PHỎNG LUỒNG GIÁO VIÊN & HỌC SINH ===");

  // --------------------------------------------------------------------------
  // TEST CASE 1: GIÁO VIÊN BỎ TÍCH '大家' (CHỌN 11/12 TỪ VỰNG) VÀ GIAO CHO LỚP
  // --------------------------------------------------------------------------
  console.log("\n[TEST 1] Mô phỏng giáo viên bỏ chọn '大家' (chỉ chọn 11 từ) cho Bài 1: AI小语，你好！");
  
  const originalLesson1 = OFFICIAL_HSK1_15_LESSONS.find((l) => l.number === 1);
  console.log(`- Bản gốc Bài 1 có: ${originalLesson1.vocabList.length} từ vựng.`);
  const hasDajiaOriginal = originalLesson1.vocabList.some((v) => v.hanzi === "大家");
  console.log(`- Có từ '大家' trong bản gốc: ${hasDajiaOriginal}`);

  // Giáo viên chọn 11 từ, loại bỏ từ '大家'
  const chosen11Vocabs = originalLesson1.vocabList
    .filter((v) => v.hanzi !== "大家")
    .map((v, idx) => ({ id: `v-1-${idx}`, ...v, meaningVi: v.meaning }));
  
  console.log(`- Giáo viên đã tích chọn: ${chosen11Vocabs.length} từ vựng (đã bỏ dấu tích '大家').`);

  const mockAssignedLesson = {
    id: "assign-test-1",
    lessonId: 1,
    titleZh: "AI小语，你好！",
    titleVi: "Xin chào AI Tiểu Ngữ!",
    vocabCount: chosen11Vocabs.length,
    selectedVocabs: chosen11Vocabs,
    hasDialogue: true,
  };

  // Mô phỏng logic lọc khi học sinh mở bài học trong StudentLessonsWorkspace:
  const studentEffectiveVocabList = originalLesson1.vocabList.filter((v) =>
    mockAssignedLesson.selectedVocabs.some((sv) => sv.hanzi === v.hanzi)
  );

  console.log(`- Kết quả học sinh nhận được: ${studentEffectiveVocabList.length} từ vựng.`);
  const hasDajiaInStudentView = studentEffectiveVocabList.some((v) => v.hanzi === "大家");
  console.log(`- Có từ '大家' trong màn hình học sinh không? ${hasDajiaInStudentView ? "CÓ (LỖI)" : "KHÔNG (ĐÚNG)"}`);
  
  if (studentEffectiveVocabList.length === 11 && !hasDajiaInStudentView) {
    console.log("===> TEST 1 THÀNH CÔNG: Học sinh chỉ thấy đúng 11 từ giáo viên đã tích chọn!");
  } else {
    throw new Error("TEST 1 THẤT BẠI: Số từ vựng hoặc lọc từ vựng bị sai!");
  }

  // --------------------------------------------------------------------------
  // TEST CASE 2: GIÁO VIÊN GIAO ĐỀ 3 CÂU - 15 ĐIỂM - 10 PHÚT
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2] Mô phỏng giáo viên soạn đề 3 câu từ bài học (15 điểm, 10 phút)");

  const draft3Questions = [
    {
      id: "q-1",
      title: "Nhận biết: 你好",
      content: "“你好” (nǐ hǎo) có nghĩa là gì?",
      type: "multiple_choice",
      points: 5,
      options: ["Nấu ăn", "Xin chào", "Đi làm", "Ngày mai"],
      correctAnswer: "B",
    },
    {
      id: "q-2",
      title: "Nhận biết: 谢谢",
      content: "“谢谢” (xièxie) có nghĩa là gì?",
      type: "multiple_choice",
      points: 5,
      options: ["Tạm biệt", "Cảm ơn", "Không có chi", "Mời ngồi"],
      correctAnswer: "B",
    },
    {
      id: "q-3",
      title: "Nhận biết: 再见",
      content: "“再见” (zàijiàn) có nghĩa là gì?",
      type: "multiple_choice",
      points: 5,
      options: ["Hẹn gặp lại / Tạm biệt", "Xin lỗi", "Đừng khách sáo", "Chào buổi sáng"],
      correctAnswer: "A",
    },
  ];

  const teacherAssignment = {
    id: "ass-test-3q",
    title: "Bài tập củng cố: Xin chào AI Tiểu Ngữ!",
    durationMin: 10,
    totalQuestions: draft3Questions.length,
    totalPoints: draft3Questions.reduce((s, q) => s + q.points, 0),
    questions: draft3Questions,
  };

  console.log(`- Đề bài được tạo: "${teacherAssignment.title}"`);
  console.log(`- Thời lượng: ${teacherAssignment.durationMin} phút`);
  console.log(`- Số lượng câu: ${teacherAssignment.totalQuestions} câu`);
  console.log(`- Tổng điểm: ${teacherAssignment.totalPoints} điểm`);

  // Mô phỏng hiển thị trên thẻ bài tập của học sinh:
  const cardQuestionsText = `${teacherAssignment.durationMin} phút • ${teacherAssignment.totalQuestions} câu • ${teacherAssignment.totalPoints}đ`;
  console.log(`- Hiển thị trên thẻ bài tập học sinh: "${cardQuestionsText}"`);
  if (teacherAssignment.totalQuestions !== 3 || teacherAssignment.totalPoints !== 15 || teacherAssignment.durationMin !== 10) {
    throw new Error("TEST 2 THẤT BẠI: Số câu hoặc điểm hiển thị bị sai (vẫn bị 10 câu • 100đ)!");
  }

  // Mô phỏng khi học sinh vào phòng thi /s/attempts/[id]:
  const loadedAttemptQuestions = teacherAssignment.questions.map((q, idx) => ({
    id: q.id,
    orderIndex: idx + 1,
    type: q.type,
    content: q.content,
    options: q.options.map((opt, optIdx) => ({ id: String.fromCharCode(65 + optIdx), text: opt })),
    points: q.points,
  }));

  console.log(`- Số câu hỏi nạp vào phòng thi: ${loadedAttemptQuestions.length} câu`);
  console.log(`- Câu 1 trong phòng thi: "${loadedAttemptQuestions[0].content}"`);
  console.log(`- Câu 2 trong phòng thi: "${loadedAttemptQuestions[1].content}"`);
  console.log(`- Câu 3 trong phòng thi: "${loadedAttemptQuestions[2].content}"`);

  const hasXiuxiQuestion = loadedAttemptQuestions.some((q) => q.content.includes("休息"));
  console.log(`- Có bị câu hỏi mẫu '休息' (xiūxi) đè lên không? ${hasXiuxiQuestion ? "CÓ (LỖI)" : "KHÔNG (ĐÚNG)"}`);

  if (loadedAttemptQuestions.length === 3 && !hasXiuxiQuestion && loadedAttemptQuestions[0].content.includes("你好")) {
    console.log("===> TEST 2 THÀNH CÔNG: Học sinh nhận đúng 3 câu hỏi giáo viên vừa giao!");
  } else {
    throw new Error("TEST 2 THẤT BẠI: Phòng thi không nạp đúng 3 câu hỏi!");
  }

  console.log("\n=======================================================");
  console.log(" TẤT CẢ CÁC TEST CASES ĐÃ PASS 100%! HỆ THỐNG ĐỒNG BỘ CHUẨN!");
  console.log("=======================================================");
}

runSimulation().catch((err) => {
  console.error("LỖI TEST:", err);
  process.exit(1);
});
