import "server-only";
import { prisma } from "@/lib/prisma";
import { getDefaultLessons } from "./hsk-lessons-resolver";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";

export async function readCurriculum(level: number) {
  const record = await prisma.curriculumContent.findUnique({ where: { hskLevel: level } });
  if (record && !record.isDeleted && Array.isArray(record.lessons) && record.lessons.length > 0) {
    return { level, items: record.lessons as unknown as Hsk1FullLesson[], revision: record.revision, isDeleted: false, updatedAt: record.updatedAt.toISOString() };
  }
  return { level, items: getDefaultLessons(level), revision: record?.revision ?? 0, isDeleted: record ? record.isDeleted : level > 2, updatedAt: record?.updatedAt?.toISOString() || null };
}
export async function getServerLessonsByHskLevel(level: number) {
  return (await readCurriculum(level)).items;
}
