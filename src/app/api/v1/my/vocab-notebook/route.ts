import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdHeader = request.headers.get("x-user-id");
    const studentIdParam = searchParams.get("studentId");
    const username = searchParams.get("username");
    const boxFilter = searchParams.get("box"); // '1' | '2' | '3' | '4' | '5' | 'all'

    let student = null;
    if (studentIdParam || userIdHeader) {
      student = await prisma.user.findUnique({
        where: { id: studentIdParam || userIdHeader || "" },
      });
    }

    if (!student && username) {
      student = await prisma.user.findFirst({ where: { username } });
    }

    if (!student) {
      return NextResponse.json({ success: true, items: [], stats: { total: 0, box1: 0, box2: 0, box3: 0, box4: 0, box5: 0 } });
    }

    // Kiểm tra xem học sinh có từ nào chưa, nếu chưa có thì nạp 8 từ HSK 1 cơ bản để học sinh trải nghiệm ngay
    const count = await prisma.vocabProgress.count({
      where: { studentId: student.id },
    });

    if (count === 0) {
      // Tìm hoặc tạo bài học mẫu
      let defaultLesson = await prisma.lesson.findFirst();
      if (!defaultLesson) {
        let level = await prisma.level.findFirst();
        if (!level) {
          let curr = await prisma.curriculum.findFirst();
          if (!curr) {
            curr = await prisma.curriculum.create({
              data: { title: "Giáo trình chuẩn HSK 3.0", description: "Chuẩn 9 cấp HSK 3.0" },
            });
          }
          level = await prisma.level.create({
            data: { curriculumId: curr.id, hskLevel: 1, title: "HSK 1 Sơ cấp", isOpen: true },
          });
        }
        defaultLesson = await prisma.lesson.create({
          data: {
            levelId: level.id,
            lessonNumber: 1,
            title: "你好！- Xin chào!",
            description: "Bài học mở đầu làm quen tiếng Trung HSK 1",
            status: "PUBLISHED",
          },
        });
      }

      // Tạo một số từ vựng mẫu nếu chưa có
      const starterVocabs = [
        { hanzi: "你好", pinyin: "nǐ hǎo", meaningVi: "Xin chào", wordType: "Thán từ", exampleHanzi: "你好！很高兴认识你。", exampleMeaning: "Xin chào! Rất vui được quen bạn." },
        { hanzi: "谢谢", pinyin: "xièxie", meaningVi: "Cảm ơn", wordType: "Động từ", exampleHanzi: "谢谢你的帮助。", exampleMeaning: "Cảm ơn sự giúp đỡ của bạn." },
        { hanzi: "不客气", pinyin: "bú kèqi", meaningVi: "Đừng khách sáo / Không có gì", wordType: "Cụm từ", exampleHanzi: "不用谢，不客气！", exampleMeaning: "Không cần cảm ơn, đừng khách sáo!" },
        { hanzi: "再见", pinyin: "zàijiàn", meaningVi: "Tạm biệt", wordType: "Động từ", exampleHanzi: "明天学校再见！", exampleMeaning: "Hẹn gặp lại ngày mai ở trường!" },
        { hanzi: "对不起", pinyin: "duìbuqǐ", meaningVi: "Xin lỗi", wordType: "Cụm từ", exampleHanzi: "对不起，我迟到了。", exampleMeaning: "Xin lỗi, mình đến muộn rồi." },
        { hanzi: "没关系", pinyin: "méi guānxi", meaningVi: "Không sao đâu", wordType: "Cụm từ", exampleHanzi: "没关系，请进！", exampleMeaning: "Không sao, mời vào!" },
        { hanzi: "老师", pinyin: "lǎoshī", meaningVi: "Thầy cô giáo", wordType: "Danh từ", exampleHanzi: "李老师好！", exampleMeaning: "Em chào cô Lý ạ!" },
        { hanzi: "朋友", pinyin: "péngyou", meaningVi: "Bạn bè", wordType: "Danh từ", exampleHanzi: "我们是好朋友。", exampleMeaning: "Chúng mình là bạn tốt của nhau." },
      ];

      for (const item of starterVocabs) {
        let vocab = await prisma.vocabulary.findFirst({
          where: { hanzi: item.hanzi },
        });
        if (!vocab) {
          vocab = await prisma.vocabulary.create({
            data: {
              lessonId: defaultLesson.id,
              hanzi: item.hanzi,
              pinyin: item.pinyin,
              meaningVi: item.meaningVi,
              wordType: item.wordType,
              exampleHanzi: item.exampleHanzi,
              exampleMeaning: item.exampleMeaning,
            },
          });
        }
        await prisma.vocabProgress.create({
          data: {
            studentId: student.id,
            vocabularyId: vocab.id,
            leitnerBox: 1,
            nextReviewAt: new Date(),
          },
        });
      }
    }

    // Lấy toàn bộ tiến trình
    const allProgress = await prisma.vocabProgress.findMany({
      where: { studentId: student.id },
      include: { vocabulary: true },
      orderBy: [{ leitnerBox: "asc" }, { lastReviewedAt: "desc" }],
    });

    const stats = {
      total: allProgress.length,
      box1: allProgress.filter((p) => p.leitnerBox === 1).length,
      box2: allProgress.filter((p) => p.leitnerBox === 2).length,
      box3: allProgress.filter((p) => p.leitnerBox === 3).length,
      box4: allProgress.filter((p) => p.leitnerBox === 4).length,
      box5: allProgress.filter((p) => p.leitnerBox === 5).length,
    };

    let filtered = allProgress;
    if (boxFilter && boxFilter !== "all") {
      const boxNum = parseInt(boxFilter);
      if (!isNaN(boxNum)) {
        filtered = allProgress.filter((p) => p.leitnerBox === boxNum);
      }
    }

    const items = filtered.map((v) => ({
      progressId: v.id,
      vocabId: v.vocabulary.id,
      hanzi: v.vocabulary.hanzi,
      pinyin: v.vocabulary.pinyin,
      meaningVi: v.vocabulary.meaningVi,
      wordType: v.vocabulary.wordType,
      exampleHanzi: v.vocabulary.exampleHanzi,
      exampleMeaning: v.vocabulary.exampleMeaning,
      leitnerBox: v.leitnerBox,
      correctStreak: v.correctStreak,
      nextReviewAt: v.nextReviewAt,
      lastReviewedAt: v.lastReviewedAt,
    }));

    return NextResponse.json({
      success: true,
      stats,
      items,
    });
  } catch (error) {
    console.error("Lỗi lấy sổ tay từ vựng:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải sổ tay từ vựng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, username, hanzi, pinyin, meaningVi, wordType, exampleHanzi, exampleMeaning } = body;

    let student = null;
    if (studentId) {
      student = await prisma.user.findUnique({ where: { id: studentId } });
    }
    if (!student && username) {
      student = await prisma.user.findFirst({ where: { username } });
    }

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy thông tin học sinh" }, { status: 404 });
    }

    if (!hanzi) {
      return NextResponse.json({ success: false, message: "Chữ Hán không được để trống" }, { status: 400 });
    }

    // Tìm xem từ vựng đã có trong bảng Vocabulary chưa
    let vocab = await prisma.vocabulary.findFirst({
      where: { hanzi: hanzi.trim() },
    });

    if (!vocab) {
      let lesson = await prisma.lesson.findFirst();
      if (!lesson) {
        let level = await prisma.level.findFirst();
        if (!level) {
          const curr = await prisma.curriculum.findFirst() || await prisma.curriculum.create({
            data: { title: "Giáo trình chuẩn HSK 3.0", description: "Chuẩn 9 cấp HSK 3.0" },
          });
          level = await prisma.level.create({
            data: { curriculumId: curr.id, hskLevel: 1, title: "HSK 1", isOpen: true },
          });
        }
        lesson = await prisma.lesson.create({
          data: { levelId: level.id, lessonNumber: 1, title: "Từ vựng chung", status: "PUBLISHED" },
        });
      }

      vocab = await prisma.vocabulary.create({
        data: {
          lessonId: lesson.id,
          hanzi: hanzi.trim(),
          pinyin: pinyin?.trim() || "",
          meaningVi: meaningVi?.trim() || "Nghĩa từ vựng",
          wordType: wordType?.trim() || null,
          exampleHanzi: exampleHanzi?.trim() || null,
          exampleMeaning: exampleMeaning?.trim() || null,
        },
      });
    }

    // Thêm hoặc cập nhật trong VocabProgress
    const existingProgress = await prisma.vocabProgress.findUnique({
      where: {
        studentId_vocabularyId: {
          studentId: student.id,
          vocabularyId: vocab.id,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json({
        success: true,
        message: "Từ vựng này đã có trong Sổ tay của bạn!",
        progress: existingProgress,
        alreadyExists: true,
      });
    }

    const newProgress = await prisma.vocabProgress.create({
      data: {
        studentId: student.id,
        vocabularyId: vocab.id,
        leitnerBox: 1,
        nextReviewAt: new Date(),
      },
      include: { vocabulary: true },
    });

    return NextResponse.json({
      success: true,
      message: "Đã thêm thành công vào Sổ tay từ vựng SRS!",
      progress: newProgress,
    });
  } catch (error) {
    console.error("Lỗi thêm từ vào sổ tay:", error);
    return NextResponse.json({ success: false, message: "Lỗi thêm từ vào sổ tay" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const progressId = searchParams.get("progressId");

    if (!progressId) {
      return NextResponse.json({ success: false, message: "Thiếu progressId" }, { status: 400 });
    }

    await prisma.vocabProgress.delete({
      where: { id: progressId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa từ khỏi Sổ tay từ vựng" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi xóa từ vựng" }, { status: 500 });
  }
}
