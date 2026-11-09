import { prisma } from "@/lib/prisma";
import { portalResponse, portalJson, jsonBody, PortalError } from "@/lib/portal-auth";
import { enrollmentClass, enrollmentInfo } from "@/lib/class-enrollment";

export function POST(request: Request) {
  return portalResponse(
    request,
    async (user) => {
      if (user.role !== "STUDENT") {
        throw new PortalError(403, "Vui lòng đăng nhập tài khoản học sinh.");
      }

      const body = await jsonBody(request);
      const mode = body.learningMode === "CLASS" ? "CLASS" : "SELF";
      const classroom =
        mode === "CLASS"
          ? await enrollmentClass(
              String(body.classCode || ""),
              typeof body.classId === "string" ? body.classId : undefined
            )
          : null;

      // Xác định cấp độ HSK chính xác: Ưu tiên mã lớp -> điểm bài test khảo sát (1-6) -> fallback cấp độ
      let level = 1;
      if (classroom?.level) {
        level = classroom.level;
      } else {
        const parsedHsk = Number(body.currentHskLevel);
        if (!isNaN(parsedHsk) && parsedHsk >= 1 && parsedHsk <= 6) {
          level = parsedHsk;
        } else if (body.currentLevel === "advanced") {
          level = 4;
        } else if (body.currentLevel === "intermediate") {
          level = 2;
        } else {
          level = 1;
        }
      }

      const enrollment = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { currentHskLevel: level },
        });

        const member = classroom
          ? await tx.classStudent.upsert({
              where: {
                classId_studentId: {
                  classId: classroom.id,
                  studentId: user.id,
                },
              },
              create: {
                classId: classroom.id,
                studentId: user.id,
                status: "PENDING",
              },
              update: {},
            })
          : null;

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "COMPLETE_ONBOARDING",
            entity: "StudyProfile",
            details: JSON.stringify({
              learningMode: mode,
              mainTrack: body.mainTrack || "hsk",
              major: body.major || null,
              currentLevel: body.currentLevel || "beginner",
              currentHskLevel: level,
              dailyTime: body.dailyTime || 30,
              classId: classroom?.id || null,
            }),
          },
        });

        return member;
      });

      return portalJson({
        success: true,
        message: classroom ? "Đã gửi yêu cầu tham gia lớp." : "Đã lưu thiết lập học tập.",
        profile: {
          hskLevel: level,
          currentHskLevel: level,
          learningMode: mode,
          mainTrack: body.mainTrack || "hsk",
          major: body.major || null,
          currentLevel: body.currentLevel || "beginner",
          dailyTime: body.dailyTime || 30,
          enrolledClass: classroom
            ? {
                ...enrollmentInfo(classroom),
                status: enrollment?.status,
                enrollmentStatus: enrollment?.status,
              }
            : null,
        },
      });
    },
    true
  );
}
