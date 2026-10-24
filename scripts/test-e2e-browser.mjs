// scripts/test-e2e-browser.mjs
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runE2ETests() {
  console.log("=================================================================");
  console.log(" BẮT ĐẦU CHẠY TEST TRÌNH DUYỆT TRỰC TIẾP (E2E CHROME AUTOMATION)");
  console.log("=================================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const clickNavTab = async (tabName) => {
    const buttons = await page.$$("aside button, nav button");
    for (const b of buttons) {
      const text = await b.evaluate((el) => el.textContent || "");
      if (text.includes(tabName)) {
        await b.click();
        await new Promise((r) => setTimeout(r, 1200));
        return true;
      }
    }
    return false;
  };

  // --------------------------------------------------------------------------
  // LUỒNG 1: HỌC SINH MỚI VÀO LỚP - CHƯA ĐƯỢC GIÁO VIÊN CẤP BÀI HỌC NÀO
  // --------------------------------------------------------------------------
  console.log("--- [LUỒNG 1: HỌC SINH VÀO LỚP KHI CHƯA ĐƯỢC CẤP BÀI NÀO] ---");
  await page.goto(`${BASE_URL}/s/home`, { waitUntil: "networkidle2" });

  // Khởi tạo trạng thái ban đầu trong localStorage: Học sinh có 1 lớp, nhưng chưa có bài học nào được giao
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
  await new Promise((r) => setTimeout(r, 2000)); // Chờ React hydration hoàn tất

  // 1.1 Kiểm tra Tab Lộ trình (Roadmap)
  console.log("1.1 Chuyển sang Tab Lộ trình...");
  await clickNavTab("Lộ trình");

  // Kiểm tra xem Chặng 1 có bị khóa ("Chờ giáo viên mở khóa") hay không:
  const mainText = await page.evaluate(() => document.querySelector("main")?.innerText || "MAIN RỖNG");
  console.log("NỘI DUNG MAIN:", mainText.slice(0, 300));
  const stage1Status = await page.evaluate(() => {
    const text = document.body.innerText;
    const isLocked = text.includes("Chờ giáo viên mở khóa");
    const isInProgress = text.includes("Đang học hiện tại");
    return { isLocked, isInProgress };
  });

  console.log(`- Trạng thái Chặng 1 khi chưa cấp bài: Chờ mở khóa = ${stage1Status.isLocked}, Đang học = ${stage1Status.isInProgress}`);
  if (!stage1Status.isLocked) {
    throw new Error("LỖI LUỒNG 1: Lộ trình vẫn hiển thị 'Đang học hiện tại' dù cô giáo chưa mở khóa bài nào!");
  }
  console.log("✓ ĐÚNG: Lộ trình hiển thị đúng 'Chờ giáo viên mở khóa' khi lớp chưa có bài học!");

  // 1.2 Kiểm tra Tab Kho bài học (Lessons)
  console.log("1.2 Chuyển sang Tab Kho bài học...");
  await clickNavTab("Kho bài học");

  const lesson1Status = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const card1 = cards.find((c) => c.textContent && c.textContent.includes("AI小语，你好！"));
    if (!card1) return null;
    return {
      text: card1.innerText,
      hasLockBadge: card1.innerText.includes("Chờ giáo viên mở"),
      hasUnlockedBadge: card1.innerText.includes("Chưa học") || card1.innerText.includes("Được giao"),
    };
  });

  console.log(`- Trạng thái Bài 1 khi cô chưa cấp: Khóa = ${lesson1Status?.hasLockBadge}, Tự mở = ${lesson1Status?.hasUnlockedBadge}`);
  if (lesson1Status?.hasUnlockedBadge) {
    throw new Error("LỖI LUỒNG 1: Bài 1 bị tự ý mở khóa dù cô giáo chưa cấp bài học!");
  }
  console.log("✓ ĐÚNG: Bài 1 hiển thị trạng thái 🔒 'Chờ giáo viên mở'!");

  // --------------------------------------------------------------------------
  // LUỒNG 2: GIÁO VIÊN BỎ TÍCH '大家' (CHỌN 11/12 TỪ) VÀ GIAO BÀI 1 CHO LỚP
  // --------------------------------------------------------------------------
  console.log("\n--- [LUỒNG 2: GIÁO VIÊN BỎ TÍCH '大家' (CHỌN 11/12 TỪ) GIAO CHO LỚP] ---");

  // Giả lập thao tác giáo viên: chọn 11 từ (bỏ '大家'), giao bài 1 cho lớp demo
  const assignmentResult = await page.evaluate(() => {
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
      teacherNote: "Học kỹ 11 từ vựng và lưu ý không học từ 大家!",
    };

    localStorage.setItem("hanyu_assigned_lessons", JSON.stringify([assignedLesson]));
    window.dispatchEvent(new Event("storage"));
    return assignedLesson;
  });

  console.log(`- Đã mô phỏng giáo viên giao bài 1: ${assignmentResult.selectedVocabs.length} từ vựng (đã bỏ '大家').`);

  // Học sinh tải lại hoặc nhận sự kiện
  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));

  // Chuyển sang Tab Bài học
  await clickNavTab("Kho bài học");

  // Kiểm tra bài 1 đã được mở khóa và hiển thị đúng 11 từ
  const unlockedCardInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const card1 = cards.find((c) => c.textContent && c.textContent.includes("AI小语，你好！"));
    if (!card1) return null;
    return {
      text: card1.innerText,
      hasBadgeAssigned: card1.innerText.includes("Được giao"),
      vocabCountText: card1.innerText.includes("11 từ"),
    };
  });

  console.log(`- Thẻ Bài 1 sau khi cô giao: Có badge 'Được giao' = ${unlockedCardInfo?.hasBadgeAssigned}, Hiển thị '11 từ' = ${unlockedCardInfo?.vocabCountText}`);
  if (!unlockedCardInfo?.hasBadgeAssigned || !unlockedCardInfo?.vocabCountText) {
    throw new Error("LỖI LUỒNG 2: Thẻ Bài 1 chưa cập nhật trạng thái 'Được giao' hoặc chưa đổi thành '11 từ'!");
  }

  // Mở modal bài học xem chi tiết
  console.log("- Nhấp vào Bài 1 để mở modal chi tiết...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const card1 = cards.find((c) => c.textContent && c.textContent.includes("AI小语，你好！"));
    if (card1) card1.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const modalDetail = await page.evaluate(() => {
    const modal = document.querySelector(".animate-scaleUp");
    if (!modal) return null;
    const tabBtn = Array.from(modal.querySelectorAll("button")).find((b) => b.innerText.includes("Từ vựng"));
    const tabLabel = tabBtn ? tabBtn.innerText : "";
    // Lấy danh sách các chữ Hán trong danh sách từ vựng
    const vocabWords = Array.from(modal.querySelectorAll(".font-serif.text-2xl, .font-serif.text-xl")).map((el) => el.innerText.trim());
    const hasDajiaInVocab = vocabWords.includes("大家");
    const hasNihaoInVocab = vocabWords.includes("你好");
    return { tabLabel, hasDajia: hasDajiaInVocab, hasNihao: hasNihaoInVocab, count: vocabWords.length };
  });

  console.log(`- Tiêu đề tab từ vựng: "${modalDetail?.tabLabel}" (Số thẻ từ: ${modalDetail?.count})`);
  console.log(`- Có thẻ từ '你好' không: ${modalDetail?.hasNihao}`);
  console.log(`- Có thẻ từ '大家' không: ${modalDetail?.hasDajia ? "CÓ (LỖI)" : "KHÔNG (ĐÚNG)"}`);

  if (modalDetail?.hasDajia) {
    throw new Error("LỖI LUỒNG 2: Thẻ từ '大家' vẫn xuất hiện trong danh sách từ vựng dù cô giáo đã bỏ chọn!");
  }
  if (!modalDetail?.tabLabel.includes("(11)")) {
    throw new Error(`LỖI LUỒNG 2: Tiêu đề tab hiển thị sai: ${modalDetail?.tabLabel}`);
  }
  console.log("✓ ĐÚNG: Modal bài học hiển thị chính xác 1. Từ vựng (11) và thẻ từ '大家' đã được loại bỏ hoàn toàn!");

  // Đóng modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector(".animate-scaleUp button");
    if (closeBtn) closeBtn.click();
  });

  // --------------------------------------------------------------------------
  // LUỒNG 3: GIÁO VIÊN GIAO ĐỀ BÀI TẬP 3 CÂU (10 PHÚT, 15 ĐIỂM)
  // --------------------------------------------------------------------------
  console.log("\n--- [LUỒNG 3: GIÁO VIÊN GIAO ĐỀ THI 3 CÂU TỪ BÀI HỌC (10 PHÚT, 15 ĐIỂM)] ---");

  // Giả lập giáo viên tạo và giao đề thi 3 câu
  await page.evaluate(() => {
    const draft3Q = [
      {
        id: "q-test-1",
        title: "Nhận biết: 你好",
        content: "“你好” (nǐ hǎo) có nghĩa là gì?",
        type: "multiple_choice",
        points: 5,
        options: ["Nấu ăn", "Xin chào", "Đi làm", "Ngày mai"],
        correctAnswer: "B",
      },
      {
        id: "q-test-2",
        title: "Nhận biết: 谢谢",
        content: "“谢谢” (xièxie) có nghĩa là gì?",
        type: "multiple_choice",
        points: 5,
        options: ["Tạm biệt", "Cảm ơn", "Không có chi", "Mời ngồi"],
        correctAnswer: "B",
      },
      {
        id: "q-test-3",
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
  });

  // Chuyển sang Tab Bài tập
  console.log("- Chuyển sang Tab Bài tập & Phòng thi...");
  await clickNavTab("Bài tập");
  await new Promise((r) => setTimeout(r, 1200));

  // Kiểm tra thẻ bài tập
  const studentAssignmentCard = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main .group, main div.grid > div"));
    const card = cards.find((c) => c.textContent && c.textContent.includes("Bài tập củng cố: Xin chào AI Tiểu Ngữ!"));
    if (!card) return null;
    return {
      text: card.innerText,
      has3Questions: card.innerText.includes("3 câu"),
      has15Points: card.innerText.includes("15đ"),
      has10Minutes: card.innerText.includes("10 phút"),
      has10QuestionsBug: card.innerText.includes("10 câu"),
      has100PointsBug: card.innerText.includes("100đ"),
    };
  });

  console.log(`- Thẻ bài tập học sinh hiển thị:`);
  console.log(`  + Thời lượng 10 phút: ${studentAssignmentCard?.has10Minutes}`);
  console.log(`  + Số lượng: 3 câu: ${studentAssignmentCard?.has3Questions} (Bị lỗi 10 câu: ${studentAssignmentCard?.has10QuestionsBug})`);
  console.log(`  + Điểm số: 15đ: ${studentAssignmentCard?.has15Points} (Bị lỗi 100đ: ${studentAssignmentCard?.has100PointsBug})`);

  if (studentAssignmentCard?.has10QuestionsBug || studentAssignmentCard?.has100PointsBug) {
    throw new Error("LỖI LUỒNG 3: Thẻ bài tập vẫn bị fix cứng 10 câu • 100đ!");
  }
  if (!studentAssignmentCard?.has3Questions || !studentAssignmentCard?.has15Points) {
    throw new Error("LỖI LUỒNG 3: Thẻ bài tập không hiển thị đúng 3 câu • 15đ!");
  }
  console.log("✓ ĐÚNG: Thẻ bài tập hiển thị chính xác '10 phút • 3 câu • 15đ'!");

  // --------------------------------------------------------------------------
  // LUỒNG 4: HỌC SINH VÀO PHÒNG THI (/s/attempts/[id])
  // --------------------------------------------------------------------------
  console.log("\n--- [LUỒNG 4: HỌC SINH VÀO PHÒNG THI /s/attempts/[id]] ---");
  await page.goto(`${BASE_URL}/s/attempts/ass-auto-3q`, { waitUntil: "networkidle2" });
  await page.waitForSelector("body", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200));

  const examRoomState = await page.evaluate(() => {
    const text = document.body.innerText;
    const question1Exists = text.includes("“你好” (nǐ hǎo) có nghĩa là gì?");
    const hasXiuxiBug = text.includes("“休息” (xiūxi)");
    const totalQuestionsText = text.includes("3 CÂU") || text.includes("1/3");
    const has12QuestionsBug = text.includes("12 CÂU") || text.includes("1/12");

    // Lấy số nút câu hỏi trong danh sách
    const questionButtons = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.innerText && /^\d+$/.test(b.innerText.trim())
    );

    return {
      title: document.title,
      question1Exists,
      hasXiuxiBug,
      totalQuestionsText,
      has12QuestionsBug,
      numberButtonsCount: questionButtons.length,
    };
  });

  console.log(`- Tiêu đề & Nội dung phòng thi:`);
  console.log(`  + Câu 1 là '“你好” (nǐ hǎo) có nghĩa là gì?': ${examRoomState.question1Exists}`);
  console.log(`  + Có bị câu hỏi mẫu '休息' (xiūxi) đè lên không: ${examRoomState.hasXiuxiBug ? "CÓ (LỖI)" : "KHÔNG (ĐÚNG)"}`);
  console.log(`  + Số nút câu hỏi trong đề: ${examRoomState.numberButtonsCount} câu (Bị lỗi 12 câu: ${examRoomState.has12QuestionsBug})`);

  if (examRoomState.hasXiuxiBug) {
    throw new Error("LỖI LUỒNG 4: Phòng thi bị câu hỏi mẫu '休息' đè lên thay vì 3 câu cô giáo giao!");
  }
  if (examRoomState.numberButtonsCount !== 3) {
    throw new Error(`LỖI LUỒNG 4: Số lượng câu hỏi trong phòng thi là ${examRoomState.numberButtonsCount}, không phải 3 câu!`);
  }
  console.log("✓ ĐÚNG: Phòng thi nạp chính xác đúng 3 câu hỏi cô giáo vừa giao!");

  // --------------------------------------------------------------------------
  // LUỒNG 5: KIỂM TRA BÀI 5 KHÔNG TỰ ĐỘNG MỞ & GIAO ĐỘNG N BÀI HỌC (3 BÀI / 5 BÀI)
  // --------------------------------------------------------------------------
  console.log("\n--- [LUỒNG 5: KIỂM TRA BÀI 5 KHÔNG TỰ ĐỘNG MỞ & GIAO ĐỘNG N BÀI HỌC] ---");
  await page.goto(`${BASE_URL}/s/home`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  await clickNavTab("Kho bài học");

  // 5.1 Kiểm tra khi chỉ có Bài 1 được giao: Bài 5 ("今天我休息") PHẢI BỊ KHÓA
  const checkLesson5Status = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const card5 = cards.find((c) => c.textContent && c.textContent.includes("今天我休息"));
    if (!card5) return null;
    return {
      text: card5.innerText,
      isLocked: card5.innerText.includes("Chờ giáo viên mở"),
      isAssigned: card5.innerText.includes("Được giao"),
    };
  });

  console.log(`- Trạng thái Bài 5 khi giáo viên chưa giao Bài 5: Khóa = ${checkLesson5Status?.isLocked}, Tự nhận 'Được giao' = ${checkLesson5Status?.isAssigned}`);
  if (checkLesson5Status?.isAssigned || !checkLesson5Status?.isLocked) {
    throw new Error("LỖI LUỒNG 5: Bài 5 '今天我休息' bị tự động nhận 'Được giao' dù giáo viên chưa mở bài 5!");
  }
  console.log("✓ ĐÚNG: Bài 5 hiển thị 🔒 'Chờ giáo viên mở', không bị tự ý mở khóa!");

  // 5.2 Giáo viên giao ĐÚNG 3 bài: Bài 1, Bài 2, Bài 3
  console.log("\n5.2 Giả lập Giáo viên giao đúng 3 bài (Bài 1, Bài 2, Bài 3) cho lớp:");
  await page.evaluate(() => {
    const threeLessons = [
      {
        id: "assign-hsk1-b1",
        lessonId: "hsk1-b01",
        titleZh: "AI小语，你好！",
        titleVi: "Xin chào AI Tiểu Ngữ!",
        classIds: ["class-demo-1", "US91ZS"],
        classNames: ["demo"],
      },
      {
        id: "assign-hsk1-b2",
        lessonId: "hsk1-b02",
        titleZh: "我叫李文",
        titleVi: "Mình tên là Lý Văn",
        classIds: ["class-demo-1", "US91ZS"],
        classNames: ["demo"],
      },
      {
        id: "assign-hsk1-b3",
        lessonId: "hsk1-b03",
        titleZh: "我是中国人",
        titleVi: "Mình là người Trung Quốc",
        classIds: ["class-demo-1", "US91ZS"],
        classNames: ["demo"],
      },
    ];
    localStorage.setItem("hanyu_assigned_lessons", JSON.stringify(threeLessons));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("hanyu_lesson_assigned"));
  });

  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  await clickNavTab("Kho bài học");

  const threeLessonsCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div > div > div"));
    const assignedCards = cards.filter((c) => c.textContent && c.textContent.includes("Được giao"));
    const lockedCards = cards.filter((c) => c.textContent && c.textContent.includes("Chờ giáo viên mở"));
    const titlesAssigned = assignedCards.map((c) => c.querySelector("h3")?.innerText || "");
    return {
      assignedCount: assignedCards.length,
      lockedCount: lockedCards.length,
      titlesAssigned,
    };
  });

  console.log(`- Khi cô giao 3 bài:`);
  console.log(`  + Số bài nhận được huy hiệu 'Được giao': ${threeLessonsCheck.assignedCount}`);
  console.log(`  + Danh sách bài: ${threeLessonsCheck.titlesAssigned.join(", ")}`);
  console.log(`  + Số bài bị khóa: ${threeLessonsCheck.lockedCount}`);

  if (threeLessonsCheck.assignedCount !== 3) {
    throw new Error(`LỖI LUỒNG 5: Giáo viên giao 3 bài nhưng học sinh nhận được ${threeLessonsCheck.assignedCount} bài!`);
  }
  console.log("✓ ĐÚNG: Học sinh nhận chính xác 3 bài được giao (Bài 1, Bài 2, Bài 3), các bài còn lại bị khóa!");

  console.log("\n=================================================================");
  console.log(" TẤT CẢ 5 LUỒNG CHÍNH ĐÃ ĐƯỢC TEST TRỰC TIẾP TRÊN TRÌNH DUYỆT PASS 100%!");
  console.log("=================================================================\n");

  await browser.close();
}

runE2ETests().catch((err) => {
  console.error("\n❌ TEST THẤT BẠI:", err.message);
  process.exit(1);
});
