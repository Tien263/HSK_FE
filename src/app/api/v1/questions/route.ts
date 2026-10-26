import {prepareQuestion,canonicalQuestionType} from "@/lib/question-content";
import { prisma } from "@/lib/prisma";
import { portalResponse,portalJson,teacherOnly,jsonBody,PortalError,textField } from "@/lib/portal-auth";
function formatQuestionForClient(q: any) {
  const clientType=canonicalQuestionType(q.type);
  let parsedOptions: any = [];
  try {
    parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options || [];
  } catch {
    parsedOptions = [];
  }

  return {
    ...(q.editorData&&typeof q.editorData==="object"?q.editorData:{}),
    id: q.id,
    source: "MINE" as const,
    sourceId: q.teacherId || "custom",
    sourceLesson: q.editorData?.sourceLesson || "Kho câu hỏi riêng",
    subtitle:
      q.type === "multiple_choice"
        ? "Chọn 1 đáp án đúng"
        : q.type === "true_false"
        ? "Phán đoán Đúng / Sai"
        : q.type === "fill_blank"
        ? "Điền từ vào chỗ trống"
        : q.type === "sentence_ordering"
        ? "Sắp xếp từ thành câu"
        : "Luyện tập HSK",
    status: (q.editorData?.status || (q.tags?.includes("draft") ? "DRAFT" : "READY")) as "DRAFT" | "READY",
    type: clientType || "multiple_choice",
    title: q.editorData?.title || (q.content || "").slice(0, 45),
    content: q.content,
    pinyinPrompt: q.pinyinPrompt,
    pinyin: q.pinyinPrompt || "",
    points: q.editorData?.points ?? 5,
    difficulty: (q.difficulty || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
    hskLevel: q.level || 1,
    level: q.level || 1,
    curriculum: q.editorData?.curriculum || "HSK 3.0",
    skill: q.skill || "VOCABULARY",
    options: parsedOptions,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
    updatedAt:q.editorData?.updatedAt?new Date(q.editorData.updatedAt).toLocaleString("vi-VN"):q.createdAt?new Date(q.createdAt).toLocaleString("vi-VN"):null,
    createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
    usedInExamCount: q.quizSetQuestions?.length || 0,
    usedInExams: q.quizSetQuestions?.map((link:any)=>({id:link.quizSet.id,title:link.quizSet.title,status:link.quizSet.status,updatedAt:link.quizSet.createdAt.toISOString()})) || [],
  };
}

export function GET(request:Request){return portalResponse(request,async user=>{teacherOnly(user);const params=new URL(request.url).searchParams;const skill=params.get("skill");const items=await prisma.question.findMany({where:{...(params.get("mine")==="1"?{teacherId:user.id}:{OR:[{teacherId:user.id},{teacherId:null}]}),...(skill&&skill!=="ALL"?{skill}:{})},include:{quizSetQuestions:{where:{quizSet:{teacherId:user.id}},select:{quizSetId:true,quizSet:{select:{id:true,title:true,status:true,createdAt:true}}}}},orderBy:{createdAt:"desc"}});return portalJson({success:true,items:items.map(item=>({...formatQuestionForClient(item),canEdit:item.teacherId===user.id}))});});}
export function POST(request:Request){return portalResponse(request,async user=>{teacherOnly(user);const body=await jsonBody(request);const rows=Array.isArray(body.items)?body.items:[body];if(!rows.length||rows.length>500)throw new PortalError(400,"Mỗi lần lưu từ 1 đến 500 câu hỏi.");const items=await prisma.$transaction(async tx=>{const saved=[];for(const raw of rows){let row:Record<string,unknown>;try{row=prepareQuestion(raw as Record<string,any>);}catch(error){throw new PortalError(400,(error as Error).message);}const level=Number(row.level??row.hskLevel??1);if(!Number.isInteger(level)||level<1||level>9)throw new PortalError(400,"Cấp HSK không hợp lệ.");const editorKeys=["schemaVersion","sourceContent","selectionMode","correctChoices","shuffleMatching","tokenIds","flashcards","essayMin","essayMax","translationDirection","acceptedAnswers","errorTokens","errorMode","gradingMode","maxAudioPlays","transcript","maxUploadBytes","status","title","subtitle","points","curriculum","sourceLesson","matchingPairs","tokens","flashcard","handwritingCount","rubric","sampleAnswer","blanks","audioUrl","imageUrl"];const editorData=Object.fromEntries(editorKeys.filter(key=>row[key]!==undefined).map(key=>[key,row[key]]));editorData.updatedAt=new Date().toISOString();if(JSON.stringify(editorData).length>2000000)throw new PortalError(400,"Nội dung câu hỏi quá lớn.");if(editorData.status&&!['DRAFT','READY'].includes(String(editorData.status)))throw new PortalError(400,"Trạng thái câu hỏi không hợp lệ.");if(row.status==="READY"&&["multiple_choice","single_choice","listening_mcq","listening_choice"].includes(String(row.type))){let options=row.options;if(typeof options==="string"){try{options=JSON.parse(options);}catch{}}if(!Array.isArray(options)||options.length<2||options.some(value=>!String(typeof value==="object"&&value?((value as any).text||""):value||"").trim()))throw new PortalError(400,"Cần nhập ít nhất hai phương án trả lời trước khi hoàn thiện.");}const data={editorData:JSON.parse(JSON.stringify(editorData)),audioUrl:typeof row.audioUrl==="string"?row.audioUrl:null,imageUrl:typeof row.imageUrl==="string"?row.imageUrl:null,teacherId:user.id,content:textField(row.content||(row.type==="flashcard"?(row.flashcard as any)?.front:"")||"","Nội dung câu hỏi",row.status!=="DRAFT"&&row.type!=="flashcard",12000),type:textField(row.type||"short_answer","Dạng câu hỏi",true,80),skill:textField(row.skill||"VOCABULARY","Kỹ năng",true,80),difficulty:textField(row.difficulty||"MEDIUM","Độ khó",true,30),level,correctAnswer:typeof row.correctAnswer==="string"?row.correctAnswer:JSON.stringify(row.correctAnswer??""),options:row.options?(typeof row.options==="string"?row.options:JSON.stringify(row.options)):null,explanation:textField(row.explanation||"","Giải thích",false,12000),pinyinPrompt:textField(row.pinyinPrompt||row.pinyin||"","Pinyin",false,3000),tags:textField(row.tags||"teacher_custom","Nhãn",false,1000)};if(!Array.isArray(body.items)&&body.id){const id=String(body.id);if(!await tx.question.findFirst({where:{id,teacherId:user.id}}))throw new PortalError(404,"Không tìm thấy câu hỏi trong kho riêng.");if(await tx.quizSetQuestion.count({where:{questionId:id}}))throw new PortalError(409,"Câu hỏi đã dùng trong đề. Hãy tạo bản sao để giữ lịch sử làm bài.");saved.push(await tx.question.update({where:{id},data}));}else saved.push(await tx.question.create({data}));}return saved;});return portalJson({success:true,item:formatQuestionForClient(items[0]),items:items.map(formatQuestionForClient)},201);},true);}
export function DELETE(request:Request){return portalResponse(request,async user=>{teacherOnly(user);const params=new URL(request.url).searchParams;let ids=params.get("id")?[params.get("id")!]:[];if(!ids.length&&params.get("all")!=="true"){const body=await jsonBody(request);if(Array.isArray(body.ids))ids=body.ids.map(String);}if(!ids.length&&params.get("all")!=="true")throw new PortalError(400,"Chọn câu hỏi cần xóa.");const referenced=await prisma.quizSetQuestion.count({where:{question:{teacherId:user.id,...(ids.length?{id:{in:ids}}:{})}}});if(referenced)throw new PortalError(409,"Câu hỏi đang nằm trong đề. Gỡ khỏi đề trước khi xóa để giữ lịch sử làm bài.");const result=await prisma.question.deleteMany({where:{teacherId:user.id,...(ids.length?{id:{in:ids}}:{})}});if(ids.length&&!result.count)throw new PortalError(404,"Không tìm thấy câu hỏi trong kho riêng.");return portalJson({success:true,count:result.count});},true);}
