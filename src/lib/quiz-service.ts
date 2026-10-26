import { prisma } from "./prisma";
import { PortalError,textField,type PortalUser } from "./portal-auth";
export const quizInclude={questions:{include:{question:true},orderBy:{orderIndex:"asc"as const}},assignments:{select:{id:true,title:true,status:true,class:{select:{name:true}}}}}as const;
export function quizClient(quiz:Awaited<ReturnType<typeof findQuiz>>,user:PortalUser){return{...quiz,canEdit:quiz.teacherId===user.id,questionsCount:quiz.questions.length,questionCount:quiz.questions.length,totalPoints:quiz.totalScore,questions:quiz.questions.map(row=>{let options=[];try{options=JSON.parse(row.question.options||"[]");}catch{}return{...(row.question.editorData&&typeof row.question.editorData==="object"?row.question.editorData:{}),...row.question,options,points:row.points,orderIndex:row.orderIndex};})};}
export async function findQuiz(id:string){const quiz=await prisma.quizSet.findUnique({where:{id},include:quizInclude});if(!quiz)throw new PortalError(404,"Không tìm thấy bộ đề.");return quiz;}
export function quizAccess(quiz:{teacherId:string|null},user:PortalUser,write=false){if(quiz.teacherId===user.id||(!write&&quiz.teacherId===null))return;throw new PortalError(403,"Bộ đề không thuộc kho riêng của bạn.");}
export async function saveQuiz(user:PortalUser,body:Record<string,unknown>,id?:string){
  const title=textField(body.title,"Tên bộ đề",true,500);const level=Number(body.hskLevel??1),totalScore=Number(body.totalScore??100);
  if(!Number.isInteger(level)||level<1||level>9||!Number.isFinite(totalScore)||(totalScore<0||(totalScore===0&&body.mode!=="PRACTICE"))||totalScore>10000)throw new PortalError(400,"Cấp HSK hoặc tổng điểm không hợp lệ.");
  const mode=String(body.mode||"EXAM"),status=String(body.status||"DRAFT");if(!["EXAM","PRACTICE"].includes(mode)||!["DRAFT","READY","ARCHIVED"].includes(status))throw new PortalError(400,"Chế độ hoặc trạng thái bộ đề không hợp lệ.");
  if(!Array.isArray(body.questions)||body.questions.length>500)throw new PortalError(400,"Cần danh sách tối đa 500 câu hỏi.");
  const requestedId=id||(typeof body.id==="string"?body.id:undefined);
  return prisma.$transaction(async tx=>{
    const previous=requestedId?await tx.quizSet.findUnique({where:{id:requestedId},include:{_count:{select:{assignments:true}}}}):null;
    if(previous){quizAccess(previous,user,true);if(previous._count.assignments)throw new PortalError(409,"Đề đã giao cho lớp. Tạo bản sao để chỉnh sửa và giữ lịch sử làm bài.");}
    const data={title,description:textField(body.description||"","Mô tả",false,5000),mode,status,hskLevel:level,totalScore,curriculum:textField(body.curriculum||"HSK 3.0","Giáo trình",false,200),teacherId:user.id};
    const quiz=previous?await tx.quizSet.update({where:{id:previous.id},data}):await tx.quizSet.create({data:{...(requestedId?{id:requestedId}:{}),...data}});
    await tx.quizSetQuestion.deleteMany({where:{quizSetId:quiz.id}});const seen=new Set<string>();
    for(const [index,value]of(body.questions as unknown[]).entries()){
      const row=typeof value==="string"?{id:value}:value as Record<string,unknown>;if(!row||typeof row!=="object")throw new PortalError(400,"Câu hỏi không hợp lệ.");
      let question=typeof row.id==="string"?await tx.question.findUnique({where:{id:row.id}}):null;
      if(question&&question.teacherId!==user.id&&question.teacherId!==null)throw new PortalError(403,"Không được sử dụng câu hỏi riêng của giáo viên khác.");
      if(!question)question=await tx.question.create({data:{teacherId:user.id,content:textField(row.content||row.title,"Nội dung câu hỏi",true,12000),type:String(row.type||"short_answer"),skill:String(row.skill||"VOCABULARY"),level,correctAnswer:typeof row.correctAnswer==="string"?row.correctAnswer:JSON.stringify(row.correctAnswer??""),options:row.options?JSON.stringify(row.options):null,explanation:String(row.explanation||"")}});
      if(seen.has(question.id))throw new PortalError(400,"Bộ đề có câu hỏi trùng.");seen.add(question.id);
      const actualPoints=row.points===undefined?totalScore/(body.questions as unknown[]).length:Number(row.points);
      if(!Number.isFinite(actualPoints)||actualPoints<0)throw new PortalError(400,"Điểm câu hỏi phải từ 0 trở lên.");
      await tx.quizSetQuestion.create({data:{quizSetId:quiz.id,questionId:question.id,orderIndex:index+1,points:actualPoints}});
    }
    return tx.quizSet.findUniqueOrThrow({where:{id:quiz.id},include:quizInclude});
  });
}
