import {gradeQuestion} from "./question-content";
import {prisma} from "./prisma";
import {PortalError,type PortalUser} from "./portal-auth";
import {authorizedAttempt} from "./attempt-service";
export async function submitAttempt(user:PortalUser,id:string,answers:unknown){
 if(user.role!=="STUDENT")throw new PortalError(403,"Chỉ học sinh được nộp bài.");
 const attempt=await authorizedAttempt(user,id);
 if(!answers||typeof answers!=="object"||Array.isArray(answers))throw new PortalError(400,"Dữ liệu trả lời không hợp lệ.");
 const input=answers as Record<string,unknown>;
 return prisma.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
  const current=await tx.attempt.findUniqueOrThrow({where:{id}});
  if(current.status!=="IN_PROGRESS")throw new PortalError(409,"Bài đã được nộp trước đó.");
  if(attempt.assignment.status==="CLOSED")throw new PortalError(409,"Giáo viên đã đóng bài tập.");
  const now=new Date(),deadline=Math.min(attempt.assignment.dueAt.getTime(),current.startedAt.getTime()+attempt.assignment.durationMin*60000);
  if(now.getTime()>deadline+30000)throw new PortalError(409,"Bài đã quá thời gian nộp.");
  let score=0,correctCount=0,manual=false;
  for(const row of attempt.assignment.quizSet.questions){
   const value=input[row.questionId]??"";if(typeof value!=="string"||value.length>(["speaking_audio","handwriting_photo"].includes(row.question.type)?1500000:20000))throw new PortalError(400,"Câu trả lời không hợp lệ.");
   if(row.question.type==="handwriting_photo"&&value){if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)||Buffer.from(value.split(",")[1],"base64").length>1000000)throw new PortalError(400,"Ảnh bài nộp cần đúng định dạng và tối đa 1 MB.");}
   const graded=gradeQuestion(row.question,value);manual ||= graded.manual;const needsManual=graded.manual,isCorrect=graded.correct;
   const earned=isCorrect?row.points:0;score+=earned;if(isCorrect&&row.question.type!=="flashcard")correctCount++;
   await tx.attemptAnswer.create({data:{attemptId:id,questionId:row.questionId,userAnswer:value,isCorrect,scoreEarned:earned}});
   if(!isCorrect&&!needsManual&&row.question.type!=="flashcard")await tx.wrongQuestion.upsert({where:{studentId_questionId:{studentId:user.id,questionId:row.questionId}},create:{studentId:user.id,questionId:row.questionId},update:{wrongCount:{increment:1},consecutiveRight:0,lastWrongAt:now}});
  }
  const xpEarned=10+correctCount+(current.maxScore>0&&score/current.maxScore>=.8?5:0);
  await tx.attempt.update({where:{id},data:{score:manual?null:score,status:manual?"NEEDS_GRADING":"GRADED",submittedAt:now,durationSec:Math.max(0,Math.round((now.getTime()-current.startedAt.getTime())/1000))}});
  await tx.user.update({where:{id:user.id},data:{totalXp:{increment:xpEarned}}});
  await tx.xpLog.create({data:{studentId:user.id,amount:xpEarned,source:"ASSIGNMENT_SUBMIT",reason:`Hoàn thành bài tập ${attempt.assignment.title}`}});
  return {success:true,attemptId:id,score:manual?null:score,maxScore:current.maxScore,correctCount,totalQuestions:attempt.assignment.quizSet.questions.length,xpEarned};
 });
}
