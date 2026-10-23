const assert = require("assert");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function runInteractiveSimulation() {
  console.log("🚀 STARTING E2E INTERACTIVE BUTTON & FLOW SIMULATION");

  let testClassId = null;
  let testClassCode = null;
  let testStudentUsername = `sim_hs_${Date.now().toString().slice(-4)}`;
  let testStudentId = null;

  try {
    // 1. TEACHER AUTHENTICATION
    console.log("\n[1/7] Teacher login simulation...");
    const tLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "teacher", password: "teacher123" }),
    });
    const tLoginData = await tLoginRes.json();
    assert.strictEqual(tLoginData.success, true, "Teacher login succeeded");
    const teacherId = tLoginData.user.id;
    console.log(`✅ Teacher logged in: ${tLoginData.user.name} (${teacherId})`);

    // 2. TEACHER CREATES CLASS BUTTON SIMULATION
    console.log("\n[2/7] Teacher creates new class simulation...");
    const className = `Lớp Mô Phỏng Luồng K${Date.now().toString().slice(-3)}`;
    const createClassRes = await fetch(`${baseUrl}/api/v1/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacherId },
      body: JSON.stringify({
        name: className,
        level: 1,
        teacherId: teacherId,
        description: "Lớp học kiểm thử luồng tương tác thực tế",
      }),
    });
    const createClassData = await createClassRes.json();
    assert.strictEqual(createClassData.success, true, "Class created");
    const createdClass = createClassData.item || createClassData.class;
    testClassId = createdClass.id;
    testClassCode = createdClass.code || createdClass.id.slice(-6).toUpperCase();
    console.log(`✅ Class created: "${createdClass.name}" (ID: ${testClassId}, Code: ${testClassCode})`);

    // 3. STUDENT REGISTRATION & LOGIN
    console.log("\n[3/7] Student account creation & login simulation...");
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testStudentUsername,
        name: "Học Viên Mô Phỏng",
        email: `${testStudentUsername}@hsktest.com`,
        password: "student123",
        role: "STUDENT",
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regData.success, true, "Student registered");
    testStudentId = regData.user.id;
    console.log(`✅ Student registered: ${regData.user.name} (@${testStudentUsername})`);

    // 4. STUDENT VERIFIES CLASS CODE (Join Modal simulation)
    console.log("\n[4/7] Student verifies class code in Join Modal...");
    const verifyRes = await fetch(`${baseUrl}/api/v1/classes/verify?code=${encodeURIComponent(testClassCode)}`);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.success, true, "Class code verified");
    console.log(`✅ Class code "${testClassCode}" verified for: ${verifyData.classInfo.name}`);

    // 5. STUDENT CONFIRMS ENROLLMENT (Onboarding / Join Confirm button)
    console.log("\n[5/7] Student confirms joining class...");
    const enrollRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testStudentUsername,
        classCode: testClassCode,
        classId: testClassId,
        learningMode: "CLASS",
        mainTrack: "hsk",
        dailyTime: 30,
      }),
    });
    const enrollData = await enrollRes.json();
    assert.strictEqual(enrollData.success, true, "Student enrolled in class");
    console.log(`✅ Student successfully enrolled in class`);

    // 6. TEACHER CHECKS CLASS STUDENTS LIST
    console.log("\n[6/7] Teacher checks class students count...");
    const classStudentsRes = await fetch(`${baseUrl}/api/v1/classes/${testClassId}/students`, {
      headers: { "x-user-id": teacherId },
    });
    const classStudentsData = await classStudentsRes.json();
    assert.strictEqual(classStudentsData.success, true, "Fetched class students");
    assert.strictEqual(classStudentsData.items.length, 1, "Student count is exactly 1");
    assert.strictEqual(classStudentsData.items[0].username, testStudentUsername, "Enrolled student matches");
    console.log(`✅ Teacher confirms student count is 1: ${classStudentsData.items[0].name} (@${classStudentsData.items[0].username})`);

    // 7. TEACHER ASSIGNS HOMEWORK & STUDENT CHECKS IT
    console.log("\n[7/7] Teacher assigns homework and student views assignment...");
    const createAsgRes = await fetch(`${baseUrl}/api/v1/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacherId },
      body: JSON.stringify({
        title: "Bài tập mô phỏng kiểm thử luồng",
        classId: testClassId,
        durationMin: 30,
        dueAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        teacherId: teacherId,
      }),
    });
    const createAsgData = await createAsgRes.json();
    assert.strictEqual(createAsgData.success, true, "Teacher created assignment");
    const asgId = createAsgData.item?.id || createAsgData.id;
    console.log(`✅ Assignment created: ID=${asgId}`);

    // Student fetches assignments
    const sAsgRes = await fetch(`${baseUrl}/api/v1/assignments?studentId=${testStudentId}`, {
      headers: { "x-user-id": testStudentId },
    });
    const sAsgData = await sAsgRes.json();
    assert.strictEqual(sAsgData.success, true, "Student fetched assignments");
    const list = sAsgData.items || sAsgData.data || [];
    assert(list.some((a) => a.id === asgId || a.title.includes("Bài tập mô phỏng")), "Student receives teacher assignment");
    console.log(`✅ Student successfully received teacher's homework!`);

    console.log("\n🎉 ALL 7 CRITICAL STEPS VERIFIED: TWO-WAY INTERACTION IS 100% WORKING!");
  } catch (err) {
    console.error("❌ Simulation failed:", err);
    process.exitCode = 1;
  } finally {
    // CLEANUP DATABASE
    console.log("\n🧹 Cleaning up test data from DB...");
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      if (testStudentUsername) {
        await prisma.user.deleteMany({ where: { username: testStudentUsername } });
      }
      if (testClassId) {
        await prisma.assignment.deleteMany({ where: { classId: testClassId } });
        await prisma.classStudent.deleteMany({ where: { classId: testClassId } });
        await prisma.class.deleteMany({ where: { id: testClassId } });
      }
      await prisma.$disconnect();
      console.log("✅ Cleanup complete: database remains 100% spotless!");
    } catch (cleanErr) {
      console.error("Cleanup error:", cleanErr);
    }
  }
}

runInteractiveSimulation();
