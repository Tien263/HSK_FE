import "server-only";
import { prisma } from "@/lib/prisma";
import { getDefaultLessons } from "./hsk-lessons-resolver";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";

export async function readCurriculum(level: number) {
  const record = await prisma.curriculumContent.findUnique({ where: { hskLevel: level } });
  if (record) return { level, items: record.isDeleted ? [] : record.lessons as unknown as Hsk1FullLesson[], revision: record.revision, isDeleted: record.isDeleted, updatedAt: record.updatedAt.toISOString() };
  return { level, items: getDefaultLessons(level), revision: 0, isDeleted: level > 2, updatedAt: null };
}
export async function getServerLessonsByHskLevel(level: number) {
  return (await readCurriculum(level)).items;
}
