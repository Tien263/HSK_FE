import {
  examResponse,
  examJson,
  examBody,
  dashboard,
  getAttempt,
  startAttempt,
  writeAttempt,
  createCustom,
  publicationCandidates,
  publishPaper,
  deletePaper,
  importPaper,
  purgeOldMockExams,
  reviewData,
  saveWrong,
  gradingQueue,
  gradeManual,
  legacyDetail,
  getExamDrafts,
  saveExamDraft,
  deleteExamDraft,
  ExamError,
} from "@/lib/exam-center-service";

export function GET(request: Request) {
  return examResponse(request, async (user) => {
    const params = new URL(request.url).searchParams;
    const action = params.get("action") || "dashboard";
    const data =
      action === "dashboard"
        ? await dashboard(user)
        : action === "attempt"
        ? await getAttempt(user, params.get("id") || "")
        : action === "review"
        ? await reviewData(user)
        : action === "publications"
        ? await publicationCandidates(user)
        : action === "grading"
        ? await gradingQueue(user)
        : action === "legacy"
        ? await legacyDetail(user, params.get("id") || "")
        : action === "purgeOldMockExams"
        ? await purgeOldMockExams(user)
        : action === "drafts"
        ? await getExamDrafts(user)
        : null;
    if (data === null) throw new ExamError(400, "Yêu cầu không hợp lệ.");
    return examJson({ success: true, data });
  });
}

export function POST(request: Request) {
  return examResponse(
    request,
    async (user) => {
      const body = await examBody(request);
      const data =
        body.action === "start"
          ? await startAttempt(user, body)
          : body.action === "save"
          ? await writeAttempt(user, body)
          : body.action === "submit"
          ? await writeAttempt(user, body, true)
          : body.action === "custom"
          ? await createCustom(user, body)
          : body.action === "publication"
          ? await publishPaper(user, body)
          : body.action === "deletePaper"
          ? await deletePaper(user, body)
          : body.action === "importPaper"
          ? await importPaper(user, body)
          : body.action === "purgeOldMockExams"
          ? await purgeOldMockExams(user)
          : body.action === "saveWrong"
          ? await saveWrong(user, body)
          : body.action === "grade"
          ? await gradeManual(user, body)
          : body.action === "saveDraft"
          ? await saveExamDraft(user, body)
          : body.action === "deleteDraft"
          ? await deleteExamDraft(user, body)
          : null;
      if (data === null) throw new ExamError(400, "Yêu cầu không hợp lệ.");
      return examJson({ success: true, data });
    },
    true
  );
}
