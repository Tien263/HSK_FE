import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runAllScenarios() {
  console.log("================================================================================");
  console.log("🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN KỊCH BẢN A ĐẾN H (ĐẶC TẢ NGHIỆP VỤ V2)");
  console.log("================================================================================");

  try {
    // 0. Chuẩn bị tài khoản Giáo viên & Học sinh
    let teacher = await prisma.user.findFirst({ where: { role: "TEACHER" } });
    if (!teacher) {
      teacher = await prisma.user.create({
        data: {
          username: "teacher_test_v2",
          email: "teacher_v2@hanyu.edu.vn",
          passwordHash: "dummyhash",
          name: "Cô Giáo Test V2",
          role: "TEACHER",
        },
      });
    }

    let student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          username: "student_test_v2",
          email: "student_v2@hanyu.edu.vn",
          passwordHash: "dummyhash",
          name: "Học Sinh Test V2",
          role: "STUDENT",
        },
      });
    }

    console.log(`\n🧑‍🏫 Teacher: ${teacher.name} (${teacher.id})`);
    console.log(`👨‍🎓 Student: ${student.name} (${student.id})`);

    // ============================================================================
    // KỊCH BẢN A: TẠO LỚP MỚI & THAM GIA LỚP (KIỂM TRA LỖI 01)
    // ============================================================================
    console.log("\n--- [KỊCH BẢN A] Tạo lớp mới & Học sinh tham gia lớp (Kiểm tra Lỗi 01) ---");

    const resCreateA = await fetch(`${BASE_URL}/api/v1/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        name: `Lớp HSK1_TestA_${Date.now()}`,
        level: 1,
        track: "HSK",
        teacherId: teacher.id,
      }),
    });
    const dataCreateA = await resCreateA.json();
    assert(dataCreateA.success === true, "Giáo viên tạo lớp học mới thành công");
    const classA = dataCreateA.item;

    // Học sinh kiểm tra mã và tham gia lớp
    const resVerifyA = await fetch(`${BASE_URL}/api/v1/classes/verify?code=${encodeURIComponent(classA.code)}`);
    const dataVerifyA = await resVerifyA.json();
    assert(dataVerifyA.success === true, `Học sinh kiểm tra mã lớp "${classA.code}" hợp lệ`);

    const resJoinA = await fetch(`${BASE_URL}/api/v1/auth/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: student.id,
        classCode: classA.code,
        classId: classA.id,
        learningMode: "CLASS",
      }),
    });
    const dataJoinA = await resJoinA.json();
    assert(dataJoinA.success === true, "Học sinh gửi yêu cầu vào lớp thành công trong CSDL");

    // Kiểm tra bảo mật: Khi đang ở trạng thái CHỜ DUYỆT (PENDING), học sinh KHÔNG ĐƯỢC PHÉP xem bài học
    const resPendingLessons = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/lessons`, {
      headers: { "x-user-id": student.id },
    });
    const dataPendingLessons = await resPendingLessons.json();
    assert(
      resPendingLessons.status === 403 && dataPendingLessons.isPendingApproval === true,
      "Bảo mật: Học sinh đang Chờ duyệt (PENDING) bị chặn không cho truy cập bài học (HTTP 403 & isPendingApproval: true)"
    );

    // Cô giáo phê duyệt học sinh vào lớp
    const resApprove = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/students`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        studentId: student.id,
        action: "APPROVE",
      }),
    });
    const dataApprove = await resApprove.json();
    assert(dataApprove.success === true, "Cô giáo duyệt học sinh vào lớp thành công");

    // Lỗi 01 Verification: Kiểm tra danh sách bài tập của lớp vừa tạo
    const resAsgA = await fetch(`${BASE_URL}/api/v1/assignments?studentId=${student.id}&classId=${classA.id}`, {
      headers: { "x-user-id": student.id },
    });
    const dataAsgA = await resAsgA.json();
    const asgItemsA = dataAsgA.items || [];
    assert(
      asgItemsA.length === 0,
      `Lớp mới tạo có đúng 0 bài tập (Thực tế: ${asgItemsA.length} bài) -> Không tự sinh bài tập lý thuyết rác!`
    );

    // ============================================================================
    // KỊCH BẢN B: GIÁO VIÊN TÙY CHỈNH & CÔNG BỐ BÀI HỌC
    // ============================================================================
    console.log("\n--- [KỊCH BẢN B] Giáo viên tùy chỉnh & công bố bài học ---");

    // 1. Lưu DRAFT Bài 1 với 6 từ vựng, 2 ngữ pháp
    const sampleVocabsB = [
      { hanzi: "你", pinyin: "nǐ", meaning: "bạn, anh" },
      { hanzi: "好", pinyin: "hǎo", meaning: "tốt, đẹp" },
      { hanzi: "您", pinyin: "nín", meaning: "ngài, ông" },
      { hanzi: "们", pinyin: "men", meaning: "các (số nhiều)" },
      { hanzi: "对不起", pinyin: "duìbuqǐ", meaning: "xin lỗi" },
      { hanzi: "没关系", pinyin: "méi guānxi", meaning: "không sao" },
    ];
    const sampleGrammarsB = [
      { title: "Đại từ nhân xưng 你, 您", desc: "Cách xưng hô lịch sự" },
      { title: "Hậu tố số nhiều 们", desc: "Biểu thị số nhiều" },
    ];

    const resSaveDraftB = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        lessonNumber: 1,
        status: "DRAFT",
        selectedVocabs: sampleVocabsB,
        selectedGrammars: sampleGrammarsB,
      }),
    });
    const dataSaveDraftB = await resSaveDraftB.json();
    assert(dataSaveDraftB.success === true, "Giáo viên lưu bản nháp Bài 1 thành công");

    // Học sinh kiểm tra lộ trình khi bài ở trạng thái DRAFT -> Bài 1 vẫn LOCKED
    const resLessonsDraft = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/lessons`, {
      headers: { "x-user-id": student.id },
    });
    const dataLessonsDraft = await resLessonsDraft.json();
    const ls1Draft = dataLessonsDraft.lessons.find((l) => l.lessonNumber === 1);
    assert(ls1Draft.isPublished === false && ls1Draft.isUnlocked === false, "Học sinh kiểm tra: Bài 1 ở trạng thái Nháp (DRAFT) thì KHÔNG mở khóa");

    // 2. Giáo viên công bố PUBLISHED Bài 1
    const resPublishB = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        lessonNumber: 1,
        status: "PUBLISHED",
        selectedVocabs: sampleVocabsB,
        selectedGrammars: sampleGrammarsB,
      }),
    });
    const dataPublishB = await resPublishB.json();
    assert(dataPublishB.success === true, "Giáo viên công bố (PUBLISHED) Bài 1 thành công");

    // Học sinh kiểm tra lộ trình sau khi công bố:
    const resLessonsPub = await fetch(`${BASE_URL}/api/v1/classes/${classA.id}/lessons`, {
      headers: { "x-user-id": student.id },
    });
    const dataLessonsPub = await resLessonsPub.json();
    const ls1Pub = dataLessonsPub.lessons.find((l) => l.lessonNumber === 1);
    const ls2Pub = dataLessonsPub.lessons.find((l) => l.lessonNumber === 2);

    assert(ls1Pub.isPublished === true && ls1Pub.isUnlocked === true, "Bài 1 đã mở khóa thành công cho học sinh");
    assert(ls1Pub.vocabCount === 6, `Bài 1 hiển thị đúng 6 từ vựng được chọn (Thực tế: ${ls1Pub.vocabCount})`);
    assert(ls1Pub.grammarCount === 2, `Bài 1 hiển thị đúng 2 ngữ pháp được chọn (Thực tế: ${ls1Pub.grammarCount})`);
    assert(ls2Pub.isUnlocked === false, "Bài 2 và các bài còn lại vẫn khóa do chưa được giáo viên công bố");

    // ============================================================================
    // KỊCH BẢN C: GIÁO VIÊN GIAO ĐỀ THI & HỌC SINH LÀM BÀI
    // ============================================================================
    console.log("\n--- [KỊCH BẢN C] Giáo viên giao đề thi & Học sinh làm bài ---");

    const resAssignC = await fetch(`${BASE_URL}/api/v1/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        title: "Kiểm tra 15 phút: Từ vựng Bài 1",
        classId: classA.id,
        durationMin: 15,
        totalPoints: 100,
        questions: [
          { question: "Từ '你好' có nghĩa là gì?", type: "MCQ", points: 50, answer: "Xin chào" },
          { question: "Từ '对不起' có nghĩa là gì?", type: "MCQ", points: 50, answer: "Xin lỗi" },
        ],
      }),
    });
    const dataAssignC = await resAssignC.json();
    assert(dataAssignC.success === true, "Giáo viên tạo và giao bài kiểm tra cho lớp thành công");
    const createdAssignment = dataAssignC.assignment || dataAssignC.item;

    // Học sinh kiểm tra danh sách bài tập
    const resCheckAsgC = await fetch(`${BASE_URL}/api/v1/assignments?studentId=${student.id}&classId=${classA.id}`, {
      headers: { "x-user-id": student.id },
    });
    const dataCheckAsgC = await resCheckAsgC.json();
    const studentAssList = dataCheckAsgC.items || [];
    assert(studentAssList.length === 1, `Học sinh nhận đúng 1 bài tập thật (Thực tế: ${studentAssList.length})`);
    assert(studentAssList[0].title === "Kiểm tra 15 phút: Từ vựng Bài 1", "Tên bài tập nhận được chính xác");

    // Học sinh bắt đầu làm bài
    const resStartC = await fetch(`${BASE_URL}/api/v1/assignments/${studentAssList[0].id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": student.id },
      body: JSON.stringify({ studentId: student.id }),
    });
    const dataStartC = await resStartC.json();
    assert(dataStartC.success === true, "Học sinh bắt đầu bài thi và tạo attempt thành công");
    const attemptId = dataStartC.attempt?.id || dataStartC.attemptId;

    // Học sinh nộp bài
    const resSubmitC = await fetch(`${BASE_URL}/api/v1/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": student.id },
      body: JSON.stringify({
        studentId: student.id,
        answers: [
          { questionIndex: 0, answer: "Xin chào" },
          { questionIndex: 1, answer: "Xin lỗi" },
        ],
      }),
    });
    const dataSubmitC = await resSubmitC.json();
    assert(dataSubmitC.success === true, "Học sinh nộp bài thi thành công");

    // ============================================================================
    // KỊCH BẢN D: LỚP HSK 2 (KIỂM TRA CẤP ĐỘ ĐỘNG THEO LỚP)
    // ============================================================================
    console.log("\n--- [KỊCH BẢN D] Lớp HSK 2 (Kiểm tra Cấp độ Động) ---");

    const resCreateD = await fetch(`${BASE_URL}/api/v1/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        name: `Lớp HSK2_TestD_${Date.now()}`,
        level: 2,
        track: "HSK",
        teacherId: teacher.id,
      }),
    });
    const dataCreateD = await resCreateD.json();
    assert(dataCreateD.success === true, "Tạo lớp HSK 2 thành công");
    const classD = dataCreateD.item;

    // Học sinh tham gia lớp HSK 2
    await fetch(`${BASE_URL}/api/v1/auth/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: student.id,
        classCode: classD.code,
        classId: classD.id,
        learningMode: "CLASS",
      }),
    });

    await fetch(`${BASE_URL}/api/v1/classes/${classD.id}/students`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        studentId: student.id,
        action: "APPROVE",
      }),
    });

    // Lấy lộ trình lớp HSK 2
    const resLessonsD = await fetch(`${BASE_URL}/api/v1/classes/${classD.id}/lessons`, {
      headers: { "x-user-id": student.id },
    });
    const dataLessonsD = await resLessonsD.json();
    assert(dataLessonsD.success === true, "Tải lộ trình lớp HSK 2 thành công");
    assert(dataLessonsD.classInfo.level === 2, "Cấp độ lớp trong classInfo là 2");
    assert(dataLessonsD.lessons.length === 15, "Lộ trình đủ 15 bài");

    const hsk2Ls1 = dataLessonsD.lessons[0];
    assert(
      hsk2Ls1.titleZh === "九月去北京旅游最好",
      `Bài 1 của lớp HSK 2 là bài HSK 2 chính thức: "${hsk2Ls1.titleZh} - ${hsk2Ls1.titleVi}" (Không bị cố định HSK 1!)`
    );

    // ============================================================================
    // KỊCH BẢN E: XÓA HỌC SINH KHỎI LỚP (BẢO LƯU TÀI KHOẢN, THU HỒI QUYỀN TRUY CẬP)
    // ============================================================================
    console.log("\n--- [KỊCH BẢN E] Xóa học sinh khỏi lớp & Thu hồi quyền truy cập ---");

    // Xóa học sinh khỏi lớp D
    const resRemoveE = await fetch(`${BASE_URL}/api/v1/classes/${classD.id}/students?studentId=${student.id}`, {
      method: "DELETE",
      headers: { "x-user-id": teacher.id },
    });
    const dataRemoveE = await resRemoveE.json();
    assert(dataRemoveE.success === true, "Giáo viên gỡ học sinh khỏi lớp thành công");

    // Học sinh gọi API lộ trình lớp D -> Phải nhận 403 Forbidden
    const resAccessE = await fetch(`${BASE_URL}/api/v1/classes/${classD.id}/lessons`, {
      headers: { "x-user-id": student.id },
    });
    assert(
      resAccessE.status === 403,
      `Học sinh bị xóa khỏi lớp khi truy cập API nhận HTTP 403 Forbidden (Thực tế: ${resAccessE.status})`
    );

    // Kiểm tra tài khoản học sinh vẫn tồn tại nguyên vẹn
    const studentDbRecord = await prisma.user.findUnique({ where: { id: student.id } });
    assert(studentDbRecord !== null, "Tài khoản học sinh vẫn tồn tại trong hệ thống (Không bị xóa tài khoản)");

    // ============================================================================
    // KỊCH BẢN F: XÓA HÀNG LOẠT LỚP HỌC (BULK DELETE CLASSES)
    // ============================================================================
    console.log("\n--- [KỊCH BẢN F] Xóa hàng loạt lớp học (Bulk Delete Classes) ---");

    // Tạo 2 lớp học tạm
    const c1 = await prisma.class.create({
      data: { name: `Temp_Class_1_${Date.now()}`, level: 1, teacherId: teacher.id, description: "temp" },
    });
    const c2 = await prisma.class.create({
      data: { name: `Temp_Class_2_${Date.now()}`, level: 1, teacherId: teacher.id, description: "temp" },
    });

    const resBulkDelF = await fetch(`${BASE_URL}/api/v1/classes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({ classIds: [c1.id, c2.id] }),
    });
    const dataBulkDelF = await resBulkDelF.json();
    assert(dataBulkDelF.success === true, "Gọi API xóa hàng loạt lớp học thành công");
    assert(dataBulkDelF.deletedCount === 2, `Xóa đúng 2 lớp (Thực tế: ${dataBulkDelF.deletedCount})`);

    const checkC1 = await prisma.class.findUnique({ where: { id: c1.id } });
    const checkC2 = await prisma.class.findUnique({ where: { id: c2.id } });
    assert(checkC1 === null && checkC2 === null, "Cả 2 lớp đã được xóa cascade hoàn toàn khỏi CSDL");

    // ============================================================================
    // KỊCH BẢN G: HAI LỚP CÙNG CẤP ĐỘ ĐỘC LẬP TUYỆT ĐỐI
    // ============================================================================
    console.log("\n--- [KỊCH BẢN G] Hai lớp cùng cấp độ độc lập tuyệt đối ---");

    const classG1 = await prisma.class.create({
      data: { name: `Class_G1_${Date.now()}`, level: 1, teacherId: teacher.id, description: "G1" },
    });
    const classG2 = await prisma.class.create({
      data: { name: `Class_G2_${Date.now()}`, level: 1, teacherId: teacher.id, description: "G2" },
    });

    // Lớp G1: Giáo viên công bố 5 từ vựng
    const vocabsG1 = sampleVocabsB.slice(0, 5);
    await fetch(`${BASE_URL}/api/v1/classes/${classG1.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        lessonNumber: 1,
        status: "PUBLISHED",
        selectedVocabs: vocabsG1,
      }),
    });

    // Lớp G2: Giáo viên công bố 3 từ vựng khác
    const vocabsG2 = sampleVocabsB.slice(0, 3);
    await fetch(`${BASE_URL}/api/v1/classes/${classG2.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": teacher.id },
      body: JSON.stringify({
        lessonNumber: 1,
        status: "PUBLISHED",
        selectedVocabs: vocabsG2,
      }),
    });

    // Kiểm tra lớp G1
    const resLessonsG1 = await fetch(`${BASE_URL}/api/v1/classes/${classG1.id}/lessons`, {
      headers: { "x-user-id": teacher.id },
    });
    const dataLessonsG1 = await resLessonsG1.json();
    const ls1G1 = dataLessonsG1.lessons.find((l) => l.lessonNumber === 1);

    // Kiểm tra lớp G2
    const resLessonsG2 = await fetch(`${BASE_URL}/api/v1/classes/${classG2.id}/lessons`, {
      headers: { "x-user-id": teacher.id },
    });
    const dataLessonsG2 = await resLessonsG2.json();
    const ls1G2 = dataLessonsG2.lessons.find((l) => l.lessonNumber === 1);

    assert(ls1G1.vocabCount === 5, `Lớp G1 có đúng 5 từ vựng (Thực tế: ${ls1G1.vocabCount})`);
    assert(ls1G2.vocabCount === 3, `Lớp G2 có đúng 3 từ vựng (Thực tế: ${ls1G2.vocabCount})`);
    assert(ls1G1.vocabCount !== ls1G2.vocabCount, "Dữ liệu hai lớp độc lập hoàn toàn, không đè lên nhau");

    // ============================================================================
    // KỊCH BẢN H: KIỂM TRA ĐA PHIÊN & PERSISTENCE TRONG CSDL NEON POSTGRESQL
    // ============================================================================
    console.log("\n--- [KỊCH BẢN H] Đa phiên & Lưu trữ CSDL Neon PostgreSQL ---");

    // Truy vấn trực tiếp từ bảng ClassLesson trong PostgreSQL
    const dbLessonRecord = await prisma.classLesson.findUnique({
      where: {
        classId_lessonNumber: {
          classId: classG1.id,
          lessonNumber: 1,
        },
      },
    });

    assert(dbLessonRecord !== null, "Bản ghi ClassLesson tồn tại trực tiếp trong PostgreSQL DB");
    assert(dbLessonRecord.status === "PUBLISHED", "Trạng thái trong DB là PUBLISHED");
    assert(dbLessonRecord.vocabCount === 5, "Số lượng từ vựng trong DB là 5");

    // Cleanup lớp thử nghiệm
    await prisma.classLesson.deleteMany({ where: { classId: { in: [classA.id, classD.id, classG1.id, classG2.id] } } });
    await prisma.assignment.deleteMany({ where: { classId: { in: [classA.id, classD.id, classG1.id, classG2.id] } } });
    await prisma.classStudent.deleteMany({ where: { classId: { in: [classA.id, classD.id, classG1.id, classG2.id] } } });
    await prisma.class.deleteMany({ where: { id: { in: [classA.id, classD.id, classG1.id, classG2.id] } } });

    console.log("\n================================================================================");
    console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Lỗi trong quá trình chạy kịch bản kiểm thử:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllScenarios();
