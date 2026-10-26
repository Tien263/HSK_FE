import {publicQuestion} from "./question-content";
import {prisma} from "./prisma";
import {classAccess,PortalError,type PortalUser} from "./portal-auth";
export const attemptInclude={student:{select:{name:true}},answers:{include:{question:true}},assignment:{include:{class:true,quizSet:{include:{questions:{include:{question:true},orderBy:{orderIndex:"asc" as const}}}}}}} as const;
export async function authorizedAttempt(user:PortalUser,id:string,write=false){
 const attempt=await prisma.attempt.findUnique({where:{id},include:attemptInclude});if(!attempt)throw new PortalError(404,"Không tìm thấy lượt làm bài.");
 if(user.role==="STUDENT"){if(attempt.studentId!==user.id)throw new PortalError(403,"Không có quyền xem bài của học sinh khác.");await classAccess(user,attempt.assignment.classId);}
 else await classAccess(user,attempt.assignment.classId,write);
 return attempt;
}
export function attemptQuestions(attempt:Awaited<ReturnType<typeof authorizedAttempt>>){return attempt.assignment.quizSet.questions.map(row=>{let options=[];try{options=JSON.parse(row.question.options||"[]");}catch{}const editor=(row.question.editorData||{}) as Record<string,any>;if(editor.schemaVersion===2)return {...publicQuestion(row.question),points:row.points,orderIndex:row.orderIndex};return{matchingLeft:Array.isArray(editor.matchingPairs)?editor.matchingPairs.map((pair:any)=>pair.left):[],matchingRight:Array.isArray(editor.matchingPairs)?editor.matchingPairs.map((pair:any)=>pair.right).sort():[],tokens:Array.isArray(editor.tokens)?[...editor.tokens].sort():[],flashcard:row.question.type==="flashcard"?editor.flashcard:undefined,rubric:editor.rubric,handwritingCount:editor.handwritingCount,id:row.question.id,orderIndex:row.orderIndex,type:row.question.type,content:row.question.content,pinyinPrompt:row.question.pinyinPrompt,audioUrl:row.question.audioUrl,imageUrl:row.question.imageUrl,options,points:row.points};});}
