// Automated E2E test simulating a real student and a real teacher
const baseUrl = (process.env.BASE_URL || process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

async function runTests() {
  console.log("=== STARTING REAL STUDENT & REAL TEACHER E2E TEST ===");
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName) {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. HOMEPAGE CHECK
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing Homepage (Oriental Ink & Paper) ---");
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, "Homepage returns HTTP 200");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("Học tiếng Trung"), "Homepage has main headline");
    assert(homeHtml.includes("HSK 3.0"), "Homepage has HSK 3.0 section");
    assert(homeHtml.includes("Hai hình thức học"), "Homepage has Two Learning Modes section");
    assert(homeHtml.includes("Lộ trình học"), "Homepage has 4-step Roadmap section");
    assert(homeHtml.includes("Luyện tập"), "Homepage has Practice & Quiz section");

    // -------------------------------------------------------------
    // 2. REAL STUDENT FLOW: Registration -> Onboarding -> Student Dashboard
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Real Student Journey ---");
    const testUsername = "student_test_" + Date.now().toString().slice(-4);

    // Register
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lê Hoàng Thảo",
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: "student123",
        role: "STUDENT",
      }),
    });
    const regData = await regRes.json();
    assert(regData.success === true, `Student registration succeeded for '${testUsername}'`);

    // Onboarding survey
    const onbRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUsername,
        goal: "pass_exam",
        level: "hsk2",
        dailyTime: "30min",
        classCode: "HSK1A",
      }),
    });
    const onbData = await onbRes.json();
    assert(onbData.success === true, "Student onboarding preferences and class linking saved");

    // Student Login
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUsername, password: "student123" }),
    });
    const loginData = await loginRes.json();
    assert(loginData.success === true && loginData.user.role === "STUDENT", "Student login authentication verified");

    // Student Dashboard summary API
    const sumRes = await fetch(`${baseUrl}/api/v1/my/summary?username=${testUsername}`);
    const sumData = await sumRes.json();
    assert(sumData.success === true && sumData.data.student.username === testUsername, "Student summary API returns profile and metrics");

    // Student Leitner Vocab Review
    const vocabRes = await fetch(`${baseUrl}/api/v1/my/vocab-review/today?username=${testUsername}`);
    const vocabData = await vocabRes.json();
    assert(vocabData.success === true && Array.isArray(vocabData.items), "Student Leitner 5-box vocab review cards loaded");

    // Student submits Leitner answer if cards exist
    if (vocabData.items && vocabData.items.length > 0) {
      const ansRes = await fetch(`${baseUrl}/api/v1/my/vocab-review/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: vocabData.items[0].progressId,
          remembered: true,
        }),
      });
      const ansData = await ansRes.json();
      assert(ansData.success === true, "Student Leitner card advancement persisted");
    }

    // Student Wrong Questions Notebook
    const wrongRes = await fetch(`${baseUrl}/api/v1/my/wrong-questions?username=student`);
    const wrongData = await wrongRes.json();
    assert(wrongData.success === true && Array.isArray(wrongData.items), "Student wrong questions notebook retrieved");

    // -------------------------------------------------------------
    // 3. REAL TEACHER FLOW: Login -> Create Class -> Provision Student -> Upload Material
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Real Teacher Journey ---");

    // Teacher Login
    const tLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "teacher", password: "teacher123" }),
    });
    const tLoginData = await tLoginRes.json();
    assert(tLoginData.success === true && tLoginData.user.role === "TEACHER", "Teacher 'teacher' authenticated successfully");

    // Teacher Dashboard overview metrics
    const tOverviewRes = await fetch(`${baseUrl}/api/v1/reports/overview`);
    const tOverviewData = await tOverviewRes.json();
    assert(tOverviewData.success === true && tOverviewData.data?.summary?.totalStudents > 0, "Teacher overview metrics retrieved");

    // Teacher creates a new Class
    const newClassName = "Lớp HSK 2 Cấp Tốc - K" + Date.now().toString().slice(-3);
    const createClassRes = await fetch(`${baseUrl}/api/v1/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newClassName,
        level: 2,
        teacherId: tLoginData.user.id,
        description: "Lớp ôn thi HSK 2 cấp tốc cùng cô Ning Ning",
      }),
    });
    const createClassData = await createClassRes.json();
    const createdClass = createClassData.item || createClassData.class;
    assert(createClassData.success === true && createdClass && createdClass.name === newClassName, `Teacher created new class '${newClassName}'`);

    const createdClassId = createdClass.id;

    // Teacher provisions a new Student into this new Class
    const provStudentUsername = "nam_hsk2_" + Date.now().toString().slice(-3);
    const provStudentRes = await fetch(`${baseUrl}/api/v1/classes/${createdClassId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nguyễn Văn Nam",
        username: provStudentUsername,
        password: "password123",
      }),
    });
    const provStudentData = await provStudentRes.json();
    assert(provStudentData.success === true, `Teacher provisioned new student account '${provStudentUsername}'`);

    // Teacher uploads a new Material to Library
    const uploadMatRes = await fetch(`${baseUrl}/api/v1/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Slide Ngữ pháp Bài 4: Câu chữ 把 (HSK 2)",
        type: "SLIDE",
        hskLevel: 2,
        classId: createdClassId,
        fileName: "Slide_NguPhap_CauChuBa_HSK2.pptx",
        fileSize: "14.8 MB",
        description: "Slide bài giảng chuyên sâu về cấu trúc câu chữ 把 có bài tập thực hành.",
        uploadedBy: "Cô Ning Ning",
      }),
    });
    const uploadMatData = await uploadMatRes.json();
    assert(uploadMatData.success === true && uploadMatData.item?.type === "SLIDE", "Teacher uploaded and categorized new material in Library");

    // Verify Library API returns the newly uploaded material
    const listMatRes = await fetch(`${baseUrl}/api/v1/materials?classId=${createdClassId}`);
    const listMatData = await listMatRes.json();
    assert(listMatData.success === true && listMatData.items.some((m) => m.id === uploadMatData.item.id), "Newly uploaded material retrieved in Library query");

    // Teacher deletes the test material to keep the library 100% clean for real user uploads
    const delMatRes = await fetch(`${baseUrl}/api/v1/materials?id=${uploadMatData.item.id}`, { method: "DELETE" });
    const delMatData = await delMatRes.json();
    assert(delMatData.success === true, "Teacher successfully deleted material from Library");

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log(`\n=== TEST RESULTS: ${passedCount}/${totalCount} TESTS PASSED ===\n`);
    if (passedCount === totalCount) {
      console.log("🎉 ALL REAL STUDENT & REAL TEACHER FLOWS VERIFIED SUCCESSFULLY (100%)!");
      process.exit(0);
    } else {
      console.error("⚠️ SOME TESTS FAILED!");
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution error:", error);
    process.exit(1);
  }
}

runTests();
