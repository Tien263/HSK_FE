import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdHeader = request.headers.get("x-user-id");
    const studentIdParam = searchParams.get("studentId");
    const username = searchParams.get("username");

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
      return NextResponse.json({ success: true, items: [] });
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
