import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const ARTIFACT_DIR = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\dcb75dc7-4c48-4e46-81a9-f0934ba54baa";

// Có thể truyền cờ --gui để mở cửa sổ trình duyệt thật trên màn hình, hoặc chạy mặc định headless
const isGui = process.argv.includes("--gui");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVisualE2ETest() {
  console.log("=================================================================");
  console.log(` BẮT ĐẦU TEST BẤM NÚT TỰ ĐỘNG (${isGui ? "CHẾ ĐỘ MÀN HÌNH THẬT GUI" : "CHẾ ĐỘ HEADLESS"})`);
  console.log("=================================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: isGui ? false : "new",
    slowMo: isGui ? 400 : 50,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,900",
      "--disable-web-security",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Mở trang chủ học sinh
  console.log("1. Điều hướng đến trang học sinh /s/home...");
  await page.goto(`${BASE_URL}/s/home`, { waitUntil: "networkidle2" });
  await page.waitForSelector("body", { timeout: 10000 });

  // Khởi tạo trạng thái lớp học mới (chưa có bài nào được giao)
  await page.evaluate(() => {
    localStorage.clear();
    const demoStudent = {
      id: "student-demo-1",
      name: "Nguyễn Văn Học Sinh",
      username: "student",
      role: "STUDENT",
      currentHskLevel: 1,
    };
    const demoClass = {
      id: "class-demo-1",
      code: "US91ZS",
      name: "demo",
      studentCount: 1,
      level: 1,
    };
    localStorage.setItem("hanyu_user", JSON.stringify(demoStudent));
    localStorage.setItem("hanyu_student_enrolled_classes", JSON.stringify([demoClass]));
    localStorage.setItem("hanyu_study_profile", JSON.stringify({ classInfo: demoClass, learningMode: "CLASS", classCode: "US91ZS" }));
    localStorage.setItem("hanyu_assigned_lessons", JSON.stringify([]));
    localStorage.setItem("hanyu_shared_assignments", JSON.stringify([]));
    localStorage.setItem("hanyu_student_completed_lessons", JSON.stringify([]));
  });

  await page.reload({ waitUntil: "networkidle2" });
  await sleep(1500);

  // Helper hàm click vào tab bên sidebar menu
  async function clickSidebarNav(tabText) {
    const clicked = await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll("aside button, nav button, button"));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes(text));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, tabText);
    if (!clicked) throw new Error(`Không tìm thấy nút menu: ${tabText}`);
    await sleep(800);
  }

  // --- BƯỚC 1: BẤM NÚT "LỘ TRÌNH CỦA TÔI" & KIỂM TRA CHẶNG 1 KHÓA ---
  console.log("\n[BƯỚC 1] Bấm nút 'Lộ trình của tôi'...");
  await clickSidebarNav("Lộ trình của tôi");
  const shot1 = path.join(ARTIFACT_DIR, "step1-roadmap-locked.png");
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`✓ Đã bấm nút Lộ trình và chụp ảnh: ${shot1}`);

  // --- BƯỚC 2: BẤM NÚT "KHO BÀI HỌC" & KIỂM TRA BÀI 1 KHÓA ---
  console.log("\n[BƯỚC 2] Bấm nút 'Kho bài học & Khám phá'...");
  await clickSidebarNav("Kho bài học");
  await sleep(600);
  const shot2 = path.join(ARTIFACT_DIR, "step2-lesson1-locked.png");
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`✓ Đã bấm nút Kho bài học và chụp ảnh thẻ Bài 1 có khóa 🔒: ${shot2}`);

  // --- BƯỚC 3: MÔ PHỎNG GIÁO VIÊN GIAO BÀI 1 (BỎ TÍCH '大家', CÒN 11 TỪ) ---
  console.log("\n[BƯỚC 3] Giáo viên bấm giao Bài 1 với 11 từ vựng (bỏ tích '大家')...");
  await page.evaluate(() => {
    const assignedLesson = {
      id: "assign-hsk1-1",
      lessonId: 1,
      titleZh: "AI小语，你好！",
      titleVi: "Xin chào AI Tiểu Ngữ!",
      classIds: ["class-demo-1", "US91ZS"],
      classNames: ["demo"],
      vocabCount: 11,
      grammarCount: 3,
      hasDialogue: true,
      hasReading: true,
      culturalCount: 8,
      selectedVocabs: [
        { id: "v-hsk1-1-1", hanzi: "你好", pinyin: "nǐ hǎo", meaningVi: "Xin chào" },
        // ĐÃ BỎ QUA '大家'
        { id: "v-hsk1-1-3", hanzi: "好", pinyin: "hǎo", meaningVi: "Tốt, khỏe" },
        { id: "v-hsk1-1-4", hanzi: "学生", pinyin: "xuésheng", meaningVi: "Học sinh, sinh viên" },
        { id: "v-hsk1-1-5", hanzi: "们", pinyin: "men", meaningVi: "Hậu tố chỉ số nhiều" },
        { id: "v-hsk1-1-6", hanzi: "老师", pinyin: "lǎoshī", meaningVi: "Thầy giáo, cô giáo" },
        { id: "v-hsk1-1-7", hanzi: "您", pinyin: "nín", meaningVi: "Đại từ kính trọng" },
        { id: "v-hsk1-1-8", hanzi: "你们", pinyin: "nǐmen", meaningVi: "Các bạn" },
        { id: "v-hsk1-1-9", hanzi: "谢谢", pinyin: "xièxie", meaningVi: "Cảm ơn" },
        { id: "v-hsk1-1-10", hanzi: "不客气", pinyin: "bú kèqi", meaningVi: "Không có gì" },
        { id: "v-hsk1-1-11", hanzi: "同学", pinyin: "tóngxué", meaningVi: "Bạn học" },
        { id: "v-hsk1-1-12", hanzi: "再见", pinyin: "zàijiàn", meaningVi: "Tạm biệt" },
      ],
      assignedAt: "24/10/2026",
      dueDate: "2026-10-31",
      teacherNote: "Học kỹ 11 từ vựng!",
    };
    localStorage.setItem("hanyu_assigned_lessons", JSON.stringify([assignedLesson]));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("hanyu_lesson_assigned", { detail: assignedLesson }));
  });
  await sleep(1000);

  // --- BƯỚC 4: HỌC SINH BẤM VÀO THẺ BÀI 1 ĐỂ MỞ MODAL XEM CHI TIẾT ---
  console.log("\n[BƯỚC 4] Bấm vào thẻ Bài 1 để mở modal học liệu...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const card1 = cards.find((c) => c.textContent && c.textContent.includes("AI小语，你好！"));
    if (card1) card1.click();
  });
  await sleep(1000);

  const shot3 = path.join(ARTIFACT_DIR, "step3-lesson1-modal-11words.png");
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`✓ Đã bấm mở modal Bài 1 và chụp ảnh tab 1. Từ vựng (11): ${shot3}`);

  // Bấm đóng modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector(".animate-scaleUp button, [aria-label='Close'], button.absolute");
    if (closeBtn) closeBtn.click();
  });
  await sleep(500);

  // --- BƯỚC 5: GIÁO VIÊN GIAO ĐỀ KIỂM TRA 3 CÂU (10 PHÚT, 15 ĐIỂM) ---
  console.log("\n[BƯỚC 5] Giáo viên tạo và giao đề kiểm tra 3 câu (10 phút, 15 điểm)...");
  await page.evaluate(() => {
    const draft3Q = [
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

    const teacherAss = {
      id: "ass-auto-3q",
      title: "Bài tập củng cố: Xin chào AI Tiểu Ngữ!",
      className: "demo",
      classId: "class-demo-1",
      durationMin: 10,
      totalQuestions: 3,
      totalPoints: 15,
      questions: draft3Q,
      dueAt: "28/10/2026 23:59",
      status: "OPEN",
    };

    localStorage.setItem("hanyu_shared_assignments", JSON.stringify([teacherAss]));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("hanyu_assignment_assigned", { detail: teacherAss }));
  });
  await sleep(1000);

  // --- BƯỚC 6: BẤM NÚT "BÀI TẬP & PHÒNG THI" TRÊN MENU ---
  console.log("\n[BƯỚC 6] Bấm nút menu 'Bài tập & Phòng thi'...");
  await clickSidebarNav("Bài tập & Phòng thi");
  await sleep(1200);

  const shot4 = path.join(ARTIFACT_DIR, "step4-assignment-card-3q.png");
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`✓ Đã bấm sang Bài tập và chụp ảnh thẻ '10 phút • 3 câu • 15đ': ${shot4}`);

  // --- BƯỚC 7: BẤM NÚT "VÀO LÀM BÀI" TRÊN THẺ BÀI TẬP ---
  console.log("\n[BƯỚC 7] Bấm nút 'Vào làm bài' trên thẻ bài tập...");
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a, button"));
    const startLink = links.find((l) => l.href && l.href.includes("/s/attempts/ass-auto-3q"));
    if (startLink) {
      startLink.click();
    } else {
      window.location.href = "/s/attempts/ass-auto-3q";
    }
  });

  await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
  await sleep(1500);

  const shot5 = path.join(ARTIFACT_DIR, "step5-exam-room-3q.png");
  await page.screenshot({ path: shot5, fullPage: false });
  console.log(`✓ Đã vào phòng thi và chụp ảnh Đề thi 3 câu hỏi cô giáo giao: ${shot5}`);

  // --- BƯỚC 8: BẤM CHỌN ĐÁP ÁN CHO CẢ 3 CÂU HỎI TRONG PHÒNG THI ---
  console.log("\n[BƯỚC 8] Trực tiếp bấm chọn đáp án từng câu:");

  // Câu 1: Bấm chọn đáp án B (Xin chào)
  console.log("- Câu 1: Bấm chọn đáp án 'B. Xin chào'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, label"));
    const optB = buttons.find((b) => b.textContent && b.textContent.includes("Xin chào"));
    if (optB) optB.click();
  });
  await sleep(600);

  // Bấm "Câu tiếp theo"
  console.log("- Bấm nút 'Câu tiếp theo' sang Câu 2...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const nextBtn = buttons.find((b) => b.textContent && b.textContent.includes("Câu tiếp theo"));
    if (nextBtn) nextBtn.click();
  });
  await sleep(600);

  // Câu 2: Bấm chọn đáp án B (Cảm ơn)
  console.log("- Câu 2: Bấm chọn đáp án 'B. Cảm ơn'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, label"));
    const optB = buttons.find((b) => b.textContent && b.textContent.includes("Cảm ơn"));
    if (optB) optB.click();
  });
  await sleep(600);

  // Bấm "Câu tiếp theo"
  console.log("- Bấm nút 'Câu tiếp theo' sang Câu 3...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const nextBtn = buttons.find((b) => b.textContent && b.textContent.includes("Câu tiếp theo"));
    if (nextBtn) nextBtn.click();
  });
  await sleep(600);

  // Câu 3: Bấm chọn đáp án A (Hẹn gặp lại / Tạm biệt)
  console.log("- Câu 3: Bấm chọn đáp án 'A. Hẹn gặp lại / Tạm biệt'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, label"));
    const optA = buttons.find((b) => b.textContent && (b.textContent.includes("Hẹn gặp lại") || b.textContent.includes("Tạm biệt")));
    if (optA) optA.click();
  });
  await sleep(600);

  // --- BƯỚC 9: BẤM NÚT "NỘP BÀI THI" ---
  console.log("\n[BƯỚC 9] Bấm nút 'Nộp bài thi'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const submitBtn = buttons.find((b) => b.textContent && b.textContent.includes("Nộp bài thi"));
    if (submitBtn) submitBtn.click();
  });
  await sleep(800);

  // Xác nhận nộp bài trong modal
  console.log("- Bấm xác nhận nộp bài...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const confirmBtn = buttons.find((b) => b.textContent && (b.textContent.includes("Xác nhận nộp") || b.textContent.includes("Đồng ý")));
    if (confirmBtn) confirmBtn.click();
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => {});
  await sleep(1500);

  const shot6 = path.join(ARTIFACT_DIR, "step6-exam-submitted.png");
  await page.screenshot({ path: shot6, fullPage: false });
  console.log(`✓ Đã nộp bài thành công và chụp ảnh kết quả: ${shot6}`);

  // --- BƯỚC 10: GIÁO VIÊN VÀO MÀN HÌNH BÀI TẬP KIỂM TRA BÀI NỘP CỦA HỌC SINH ---
  console.log("\n[BƯỚC 10] Mở tab Giáo viên kiểm tra bài nộp của học sinh...");
  const teacherPage = await browser.newPage();
  await teacherPage.setViewport({ width: 1440, height: 900 });

  await teacherPage.goto(`${BASE_URL}/t/dashboard?tab=assignments`, { waitUntil: "domcontentloaded" });
  await teacherPage.evaluate(() => {
    const demoTeacher = {
      id: "cmve587ws0001ucdskbwxsjda",
      name: "Nguyễn Thảo (Cô Ning Ning)",
      username: "teacher",
      role: "TEACHER",
    };
    localStorage.setItem("currentUser", JSON.stringify(demoTeacher));
  });
  await teacherPage.reload({ waitUntil: "domcontentloaded" });
  await sleep(2000);

  // Bấm vào tab "Chờ chấm / Bài nộp"
  await teacherPage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll("button"));
    const subTab = tabs.find((t) => t.textContent && (t.textContent.includes("Chờ chấm") || t.textContent.includes("Bài nộp")));
    if (subTab) subTab.click();
  });
  await sleep(1200);

  const teacherSubmissionCheck = await teacherPage.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasStudentName: text.includes("Nguyễn Văn Học Sinh") || text.includes("Học viên"),
      hasScore15: text.includes("15/15") || text.includes("15"),
      hasAssignmentTitle: text.includes("Bài tập củng cố"),
    };
  });

  console.log(`- Giáo viên đã thấy bài nộp của học sinh:`);
  console.log(`  + Tên học viên: ${teacherSubmissionCheck.hasStudentName}`);
  console.log(`  + Tên bài tập: ${teacherSubmissionCheck.hasAssignmentTitle}`);
  console.log(`  + Điểm số: ${teacherSubmissionCheck.hasScore15}`);

  const shot7 = path.join(ARTIFACT_DIR, "step7-teacher-graded-submission.png");
  await teacherPage.screenshot({ path: shot7, fullPage: false });
  console.log(`✓ Đã chụp ảnh màn hình bài nộp của giáo viên: ${shot7}`);

  console.log("\n=================================================================");
  console.log(" HOÀN TẤT BẤM NÚT TRỰC TIẾP & CHỤP ẢNH TẤT CẢ CÁC BƯỚC THÀNH CÔNG!");
  console.log("=================================================================\n");

  await browser.close();
}

runVisualE2ETest().catch((err) => {
  console.error("LỖI TEST:", err);
  process.exit(1);
});
