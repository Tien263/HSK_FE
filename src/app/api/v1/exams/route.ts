import { prisma } from "@/lib/prisma";
import { portalResponse,portalJson,teacherOnly,jsonBody } from "@/lib/portal-auth";
import { quizClient,quizInclude,saveQuiz } from "@/lib/quiz-service";
export function GET(request:Request){return portalResponse(request,async user=>{teacherOnly(user);const params=new URL(request.url).searchParams;const q=params.get("q");const mode=params.get("mode");const rows=await prisma.quizSet.findMany({where:{OR:[{teacherId:user.id},{teacherId:null}],...(q?{title:{contains:q,mode:"insensitive"}}:{}),...(mode?{mode}:{})},include:quizInclude,orderBy:{createdAt:"desc"}});return portalJson({success:true,items:rows.map(row=>quizClient(row,user))});});}
export function POST(request:Request){return portalResponse(request,async user=>{teacherOnly(user);const exam=quizClient(await saveQuiz(user,await jsonBody(request)),user);return portalJson({success:true,exam,item:exam},201);},true);}
