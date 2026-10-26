-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "editorData" JSONB;

-- CreateTable
CREATE TABLE "TeacherSavedLesson" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "sourceLessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'SAVED',
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSavedLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherSavedLesson_teacherId_updatedAt_idx" ON "TeacherSavedLesson"("teacherId", "updatedAt");

-- AddForeignKey
ALTER TABLE "TeacherSavedLesson" ADD CONSTRAINT "TeacherSavedLesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Calendar color
ALTER TABLE "ClassSchedule" ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT 'emerald';
