import { prisma } from "@/lib/prisma";
import { portalResponse,portalJson,teacherOnly,jsonBody,PortalError } from "@/lib/portal-auth";
import { quizClient,findQuiz,quizAccess,saveQuiz } from "@/lib/quiz-service";
type Context={params:Promise<{id:string}>};
export function GET(request:Request,{params}:Context){return portalResponse(request,async user=>{teacherOnly(user);const {id}=await params;const quiz=await findQuiz(id);quizAccess(quiz,user);return portalJson({success:true,exam:quizClient(quiz,user)});});}
export function PUT(request:Request,{params}:Context){return portalResponse(request,async user=>{teacherOnly(user);const {id}=await params;const existing=await findQuiz(id);quizAccess(existing,user,true);const exam=quizClient(await saveQuiz(user,await jsonBody(request),id),user);return portalJson({success:true,exam,item:exam});},true);}
export function DELETE(request:Request,{params}:Context){return portalResponse(request,async user=>{teacherOnly(user);const {id}=await params;const quiz=await findQuiz(id);quizAccess(quiz,user,true);if(quiz.assignments.length)throw new PortalError(409,"Bộ đề đã được giao. Không xóa để giữ lịch sử làm bài.");await prisma.quizSet.delete({where:{id}});return portalJson({success:true});},true);}
