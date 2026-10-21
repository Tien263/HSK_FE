import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLessonDetailById } from "@/lib/lesson-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check DB first
    try {
      const lessonFromDb = await prisma.lesson.findUnique({
        where: { id },
        include: {
          level: true,
          vocabularies: true,
          grammarPoints: true,
          listeningItems: true,
          readingItems: true,
        },
      });

      if (lessonFromDb) {
        return NextResponse.json({
          success: true,
          item: {
            id: lessonFromDb.id,
            orderNumber: lessonFromDb.lessonNumber,
            trackId: "hsk",
            levelId: `hsk${lessonFromDb.level.hskLevel}`,
            levelLabel: `HSK ${lessonFromDb.level.hskLevel}`,
            titleZh: lessonFromDb.title.split("-")[0]?.trim() || lessonFromDb.title,
            titlePy: "",
            titleVi: lessonFromDb.description || "",
            thumbnailArt: "lesson5",
            description: lessonFromDb.description || "",
            vocabularies: lessonFromDb.vocabularies.map((v) => ({
              id: v.id,
              hanzi: v.hanzi,
              pinyin: v.pinyin,
              partOfSpeech: v.wordType || "từ vựng",
              meaningVi: v.meaningVi,
              exampleZh: v.exampleHanzi || "",
              examplePy: v.examplePinyin || "",
              exampleVi: v.exampleMeaning || "",
            })),
            grammars: lessonFromDb.grammarPoints.map((g) => ({
              id: g.id,
              title: g.title,
              structure: g.structure || "",
              explanation: g.explanation,
              examples: [
                {
                  zh: g.examples || g.title,
                  py: "",
                  vi: g.explanation,
                },
              ],
            })),
            dialogue: getLessonDetailById(id).dialogue,
            reading: getLessonDetailById(id).reading,
            listening: getLessonDetailById(id).listening,
            stats: {
              vocabCount: lessonFromDb.vocabularies.length || 6,
              grammarCount: lessonFromDb.grammarPoints.length || 3,
              dialogueCount: 1,
              readingCount: lessonFromDb.readingItems.length || 1,
              listeningCount: lessonFromDb.listeningItems.length || 1,
            },
          },
        });
      }
    } catch {
      // Fallback below
    }

    // High fidelity curated fallback
    const fallbackItem = getLessonDetailById(id);
    return NextResponse.json({
      success: true,
      item: fallbackItem,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Không thể lấy thông tin bài học" },
      { status: 500 }
    );
  }
}
