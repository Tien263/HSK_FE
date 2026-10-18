import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "student";

    const student = await prisma.user.findFirst({ where: { username } });
    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const vocabs = await prisma.vocabProgress.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        vocabulary: true,
      },
      take: 20,
    });

    const items = vocabs.map((v) => ({
      progressId: v.id,
      vocabId: v.vocabulary.id,
      hanzi: v.vocabulary.hanzi,
      pinyin: v.vocabulary.pinyin,
      meaningVi: v.vocabulary.meaningVi,
      wordType: v.vocabulary.wordType,
      exampleHanzi: v.vocabulary.exampleHanzi,
      examplePinyin: v.vocabulary.examplePinyin,
      exampleMeaning: v.vocabulary.exampleMeaning,
      leitnerBox: v.leitnerBox,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải từ vựng ôn tập" }, { status: 500 });
  }
}
