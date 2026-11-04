import { randomInt } from "node:crypto";
import { prisma } from "./prisma";
import { getAuthUser, type AuthUser } from "./auth-server";
import { NextResponse } from "next/server";
import { EXAM_LEVELS, EXAM_SKILLS, attemptForOwner, attemptSummary, examStatistics, finishManual, publicExamQuestion, levelGroup, paperSummary, scoreAttempt, snapshotQuestion, supportedTypes, usableQuestion, type CenterAttempt, type ExamPaper } from "./exam-center-core";

const ATTEMPT="EXAM_CENTER_ATTEMPT", PAPER="EXAM_CENTER_PAPER", PUBLICATION="EXAM_CENTER_PUBLICATION", REVIEW="EXAM_CENTER_REVIEW";
export class ExamError extends Error { constructor(public status:number,message:string){super(message);} }
export async function examAccess(request:Request){
 const user=await getAuthUser(request);
 if(!user||user.status!=="ACTIVE")throw new ExamError(401,"Vui lòng đăng nhập bằng tài khoản đang hoạt động để vào phòng thi.");
 if(user.mustChangePassword)throw new ExamError(403,"Vui lòng đổi mật khẩu lần đầu trong tài khoản trước khi vào phòng thi.");
 // All exam access goes through this policy; subscriptions can be added here later.
 return user;
}
export function examWriteOrigin(request:Request){
 const origin=request.headers.get("origin");if(!origin)return true;
 try{return new URL(origin).host===(request.headers.get("x-forwarded-host")||request.headers.get("host")||new URL(request.url).host);}catch{return false;}
}
export const examJson=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store","Vary":"Cookie"}});
export async function examResponse(request:Request,handler:(user:AuthUser)=>Promise<Response>,write=false){try{const user=await examAccess(request);if(write&&(!examWriteOrigin(request)||!request.headers.get('content-type')?.includes('application/json')))throw new ExamError(403,"Nguồn yêu cầu không hợp lệ.");return await handler(user);}catch(error){if(error instanceof ExamError)return examJson({success:false,message:error.message},error.status);console.error('Exam center failed',error instanceof Error?error.name:'Unknown');return examJson({success:false,message:"Chưa xử lý được phòng thi. Hãy thử lại."},503);}}
export async function examBody(request:Request){if(Number(request.headers.get('content-length')||0)>8_000_000)throw new ExamError(413,"Dữ liệu bài thi quá lớn.");let body;try{body=await request.json();}catch{throw new ExamError(400,"JSON không hợp lệ.");}if(!body||typeof body!=="object"||Array.isArray(body)||JSON.stringify(body).length>8_000_000)throw new ExamError(400,"Nội dung yêu cầu không hợp lệ.");return body as Record<string,unknown>;}
const integer=(value:unknown,min:number,max:number,label:string)=>{const number=Number(value);if(!Number.isInteger(number)||number<min||number>max)throw new ExamError(400,`${label} phải từ ${min} đến ${max}.`);return number;};
const title=(value:unknown)=>{if(typeof value!=="string"||!value.trim()||value.length>300)throw new ExamError(400,"Tên đề phải có từ 1 đến 300 ký tự.");return value.trim();};
const clientId=(value:unknown)=>{if(typeof value!=="string"||! /^[0-9a-f-]{36}$/i.test(value))throw new ExamError(400,"Mã yêu cầu không hợp lệ.");return value;};
const parse=<T,>(text:string|null):T=>{try{return JSON.parse(text||'{}') as T;}catch{throw new ExamError(503,"Bản ghi bài thi không hợp lệ.");}};
const jsonClone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value));

export async function officialPapers(){
 const [sets,logs]=await Promise.all([
  prisma.quizSet.findMany({where:{status:"READY",hskLevel:{gte:1,lte:9},mode:{in:["MOCK_EXAM","EXAM"]}},include:{teacher:{select:{role:true,name:true}},questions:{include:{question:true},orderBy:{orderIndex:"asc"}},assignments:{select:{durationMin:true}}},orderBy:{createdAt:"desc"}}),
  prisma.auditLog.findMany({where:{action:PUBLICATION},orderBy:{createdAt:"desc"}}),
 ]);
 const publications=new Map<string,{approved:boolean;durationMin:number;passScore:number|null}>();
 for(const log of logs)if(!publications.has(log.entity))publications.set(log.entity,parse(log.details));
 const papers:ExamPaper[]=[];
 for(const set of sets){
  const config=publications.get(set.id);if(config? !config.approved : set.teacher?.role!=="ADMIN")continue;
  const durations=[...new Set(set.assignments.map(a=>a.durationMin).filter(n=>Number.isInteger(n)&&n>0))];
  const durationMin=config?.durationMin||(durations.length===1?durations[0]:null);
  const questions=set.questions.filter(row=>{const editor=row.question.editorData as Record<string,unknown>|null;return !editor?.status||editor.status==="READY";}).map(row=>snapshotQuestion(row.question as unknown as Record<string,unknown>,row.points));
  papers.push({id:set.id,title:set.title,description:set.description||"",level:set.hskLevel,source:"OFFICIAL",durationMin,maxScore:set.totalScore,passScore:config?.passScore??null,questions,mode:"EXAM"});
 }
 return papers;
}
async function privatePapers(user:AuthUser){return (await prisma.auditLog.findMany({where:{userId:user.id,action:PAPER},orderBy:{createdAt:"desc"}})).map(row=>parse<ExamPaper>(row.details));}
async function ownedRow(user:AuthUser,id:string){const row=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:ATTEMPT}});if(!row)throw new ExamError(404,"Không tìm thấy bài thi thuộc tài khoản này.");return row;}
async function replaceAttempt(row:{id:string;userId:string;details:string|null},state:CenterAttempt){const result=await prisma.auditLog.updateMany({where:{id:row.id,userId:row.userId,action:ATTEMPT,details:row.details},data:{details:JSON.stringify(state)}});if(result.count!==1)throw new ExamError(409,"Bài thi vừa được cập nhật ở tab khác. Hãy tải lại trước khi tiếp tục.");return state;}
function expire(state:CenterAttempt){return state.status==="IN_PROGRESS"&&state.expiresAt&&Date.parse(state.expiresAt)<=Date.now()?scoreAttempt({...state,timedOut:true}):state;}
async function settledState(user:AuthUser,id:string,initial?:{id:string;userId:string;details:string|null}){
 for(let retry=0;retry<3;retry++){
  const row=retry===0&&initial?initial:await ownedRow(user,id),original=parse<CenterAttempt>(row.details),state=expire(original);
  if(state===original)return state;
  try{return await replaceAttempt(row,state);}catch(error){if(!(error instanceof ExamError)||error.status!==409||retry===2)throw error;}
 }
 throw new ExamError(409,"Bài thi đang được cập nhật. Hãy thử lại.");
}
async function ownAttempts(user:AuthUser){
 const rows=await prisma.auditLog.findMany({where:{userId:user.id,action:ATTEMPT},orderBy:{createdAt:"desc"}});
 const result=[];for(const row of rows)result.push({id:row.id,state:await settledState(user,row.id,row)});return result;
}
function approvedPool(papers:ExamPaper[],level:number){return [...new Map(papers.filter(p=>levelGroup(p.level)===level).flatMap(p=>p.questions).filter(q=>usableQuestion(q)&&q.points>0).map(q=>[q.id,q])).values()];}
async function legacyHistory(user:AuthUser){
 const rows=await prisma.attempt.findMany({where:{studentId:user.id,status:{not:"IN_PROGRESS"},assignment:{quizSet:{mode:{in:["MOCK_EXAM","EXAM"]}}}},select:{id:true,score:true,maxScore:true,status:true,startedAt:true,submittedAt:true,teacherNote:true,assignment:{select:{title:true,quizSet:{select:{id:true,hskLevel:true}}}}},orderBy:{startedAt:"desc"}});
 return rows.map(row=>({id:`legacy:${row.id}`,paperId:row.assignment.quizSet.id,title:row.assignment.title,level:row.assignment.quizSet.hskLevel,source:"LEGACY" as const,maxScore:row.maxScore,score:row.score,status:row.status,startedAt:row.startedAt.toISOString(),submittedAt:row.submittedAt?.toISOString()||null,result:row.status!=="GRADED"?"PENDING":/chưa đạt/i.test(row.teacherNote||"")?"FAIL":/đạt chuẩn/i.test(row.teacherNote||"")?"PASS":"UNSET",feedback:row.teacherNote||""}));
}
export async function dashboard(user:AuthUser){
 const [official,custom,attempts,legacy]=await Promise.all([officialPapers(),privatePapers(user),ownAttempts(user),legacyHistory(user)]);
 const papers=[...official,...custom];
 const bank=EXAM_LEVELS.map(level=>{const pool=approvedPool(official,level);return{level,count:pool.length,skills:EXAM_SKILLS.map(skill=>({skill,count:pool.filter(q=>q.skill===skill).length})),types:[...new Set(pool.map(q=>q.type))].map(type=>({type,count:pool.filter(q=>q.type===type).length,skills:[...new Set(pool.filter(q=>q.type===type).map(q=>q.skill))],skillCounts:EXAM_SKILLS.map(skill=>({skill,count:pool.filter(q=>q.type===type&&q.skill===skill).length}))}))};});
 const summaries=attempts.map(row=>attemptSummary(row.id,row.state));
 const legacyStats=legacy.filter(row=>row.status==="GRADED"&&row.score!==null&&Number.isFinite(row.score)&&row.score>=0&&row.score<=row.maxScore&&row.maxScore>0).map(row=>({id:row.id,state:{schemaVersion:1,paper:{id:row.paperId,title:row.title,description:"",level:row.level,source:official.some(p=>p.id===row.paperId)?"OFFICIAL":"CUSTOM",durationMin:null,maxScore:row.maxScore,passScore:null,questions:[],mode:"EXAM"},answers:{},results:[],status:"GRADED",startedAt:row.startedAt,expiresAt:null,submittedAt:row.submittedAt,score:row.score,revision:0,timedOut:false} as CenterAttempt}));
 return {papers:papers.map(paper=>({...paperSummary(paper),available:paper.questions.length>0&&paper.questions.every(usableQuestion)&&paper.maxScore>0&&paper.questions.some(q=>q.points>0)&&!!paper.durationMin})),levels:EXAM_LEVELS.map(level=>{const rows=official.filter(p=>levelGroup(p.level)===level),times=rows.flatMap(p=>p.durationMin?[p.durationMin]:[]);return{level,count:rows.length,durationMin:times.length?Math.min(...times):null,durationMax:times.length?Math.max(...times):null};}),attempts:summaries,legacy,statistics:[0,...EXAM_LEVELS].map(level=>({level,...examStatistics(official,[...attempts,...legacyStats],level)})),bank,serverNow:new Date().toISOString()};
}
export async function getAttempt(user:AuthUser,id:string){return attemptForOwner(id,await settledState(user,id));}
export async function startAttempt(user:AuthUser,body:Record<string,unknown>){
 const requestId=clientId(body.requestId),id=`exam_${requestId}`;
 const prior=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:ATTEMPT}});if(prior)return getAttempt(user,id);
 const paperId=String(body.paperId||"");const papers=await Promise.all([officialPapers(),privatePapers(user)]);const paper=papers.flat().find(p=>p.id===paperId);
 if(!paper)throw new ExamError(404,"Đề chưa được Admin xuất bản hoặc không thuộc tài khoản của bạn.");
 if(!paper.questions.length||paper.questions.length>500||paper.questions.some(q=>!usableQuestion(q))||!paper.questions.some(q=>q.points>0)||paper.maxScore<=0)throw new ExamError(409,"Đề chưa có đủ dữ liệu chấm điểm hoặc có dạng câu hỏi chưa hỗ trợ.");
 if(!paper.durationMin)throw new ExamError(409,"Admin chưa cấu hình thời gian cho đề này.");
 const active=(await ownAttempts(user)).find(row=>row.state.status==="IN_PROGRESS"&&row.state.paper.id===paper.id);if(active)return attemptForOwner(active.id,active.state);
 const now=new Date();const state:CenterAttempt={schemaVersion:1,paper:jsonClone(paper),answers:{},results:[],status:"IN_PROGRESS",startedAt:now.toISOString(),expiresAt:paper.mode==="EXAM"?new Date(now.getTime()+paper.durationMin*60000).toISOString():null,submittedAt:null,score:null,revision:0,timedOut:false};
 try{await prisma.auditLog.create({data:{id,userId:user.id,action:ATTEMPT,entity:paper.id,details:JSON.stringify(state)}});}catch{const existing=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:ATTEMPT}});if(!existing)throw new ExamError(409,"Không tạo được lượt thi. Hãy thử lại.");return getAttempt(user,id);}
 return attemptForOwner(id,state);
}
function validateAnswers(value:unknown,state:CenterAttempt){if(!value||typeof value!=="object"||Array.isArray(value))throw new ExamError(400,"Câu trả lời không hợp lệ.");const allowed=new Set(state.paper.questions.map(q=>q.id)),answers:Record<string,string>={};for(const [id,answer]of Object.entries(value)){if(!allowed.has(id)||typeof answer!=="string"||answer.length>1_400_000)throw new ExamError(400,"Câu trả lời không thuộc đề hoặc vượt giới hạn.");answers[id]=answer;}if(JSON.stringify(answers).length>7_000_000)throw new ExamError(413,"Tổng dữ liệu trả lời quá lớn.");return answers;}
export async function writeAttempt(user:AuthUser,body:Record<string,unknown>,submit=false){
 const id=String(body.id||""),row=await ownedRow(user,id);let state=parse<CenterAttempt>(row.details);
 if(state.status!=="IN_PROGRESS")return attemptForOwner(id,state);
 const expired=!!state.expiresAt&&Date.parse(state.expiresAt)<=Date.now();
 if(expired){state=scoreAttempt({...state,timedOut:true});await replaceAttempt(row,state);return attemptForOwner(id,state);}
 if(body.revision!==state.revision)throw new ExamError(409,"Bài thi đã thay đổi ở tab khác. Tải lại để dùng dữ liệu mới nhất.");
 state={...state,answers:validateAnswers(body.answers,state),revision:state.revision+1};
 if(submit)state=scoreAttempt(state);
 await replaceAttempt(row,state);return attemptForOwner(id,state);
}
export async function createCustom(user:AuthUser,body:Record<string,unknown>){
 const id=`paper_${clientId(body.requestId)}`,level=integer(body.level,1,7,"Nhóm cấp HSK"),count=integer(body.count,1,200,"Số câu"),durationMin=integer(body.durationMin,1,600,"Thời gian");
 if(!["EXAM","PRACTICE"].includes(String(body.mode)))throw new ExamError(400,"Chọn chế độ mô phỏng hoặc luyện tập.");
 if(!Array.isArray(body.skills)||!body.skills.length||body.skills.some(skill=>!EXAM_SKILLS.includes(skill))||!Array.isArray(body.types)||!body.types.length||body.types.some(type=>typeof type!=="string"||!supportedTypes.has(type)))throw new ExamError(400,"Chọn kỹ năng và dạng câu hỏi hợp lệ.");
 const pool=approvedPool(await officialPapers(),level).filter(q=>(body.skills as string[]).includes(q.skill)&&(body.types as string[]).includes(q.type));
 if(pool.length<count)throw new ExamError(409,`Ngân hàng đã duyệt chỉ có ${pool.length} câu phù hợp. Giảm số lượng hoặc đổi bộ lọc.`);
 for(let i=pool.length-1;i>0;i--){const j=randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 const questions=pool.slice(0,count),maxScore=questions.reduce((sum,q)=>sum+q.points,0);
 const paper:ExamPaper={id,title:title(body.title),description:"Đề cá nhân từ ngân hàng Admin đã xuất bản.",level,source:"CUSTOM",durationMin,maxScore,passScore:null,questions,mode:body.mode as "EXAM"|"PRACTICE"};
 try{await prisma.auditLog.create({data:{id,userId:user.id,action:PAPER,entity:id,details:JSON.stringify(paper)}});}catch{const old=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:PAPER}});if(!old)throw new ExamError(409,"Không tạo được đề cá nhân.");return paperSummary(parse<ExamPaper>(old.details));}
 return paperSummary(paper);
}
export async function publicationCandidates(user:AuthUser){if(user.role!=="ADMIN")throw new ExamError(403,"Chỉ Admin được duyệt đề chính thức.");const rows=await prisma.quizSet.findMany({where:{status:"READY",mode:{in:["EXAM","MOCK_EXAM"]}},include:{teacher:{select:{name:true}},questions:{include:{question:true},orderBy:{orderIndex:"asc"}}},orderBy:{createdAt:"desc"}});const published=await officialPapers();return rows.map(row=>({durationMin:published.find(p=>p.id===row.id)?.durationMin??null,passScore:published.find(p=>p.id===row.id)?.passScore??null,published:published.some(p=>p.id===row.id),id:row.id,title:row.title,level:row.hskLevel,maxScore:row.totalScore,author:row.teacher?.name||"",questions:row.questions.map(q=>snapshotQuestion(q.question as unknown as Record<string,unknown>,q.points))}));}
export async function publishPaper(user:AuthUser,body:Record<string,unknown>){
 if(user.role!=="ADMIN")throw new ExamError(403,"Chỉ Admin được duyệt đề chính thức.");
 const paper=await prisma.quizSet.findFirst({where:{id:String(body.paperId),status:"READY",mode:{in:["EXAM","MOCK_EXAM"]}}});if(!paper)throw new ExamError(404,"Không có đề sẵn sàng để xuất bản.");
 const durationMin=integer(body.durationMin,1,600,"Thời gian"),passScore=body.passScore===null||body.passScore===""?null:Number(body.passScore);
 if(passScore!==null&&(!Number.isFinite(passScore)||passScore<0||passScore>paper.totalScore))throw new ExamError(400,"Ngưỡng đạt phải nằm trong thang điểm của đề.");
 await prisma.auditLog.create({data:{userId:user.id,action:PUBLICATION,entity:paper.id,details:JSON.stringify({approved:body.approved!==false,durationMin,passScore})}});return{success:true};
}
export async function reviewData(user:AuthUser){
 const [attempts,bookmark,legacy]=await Promise.all([ownAttempts(user),prisma.auditLog.findFirst({where:{id:`exam-review:${user.id}`,userId:user.id,action:REVIEW}}),prisma.wrongQuestion.findMany({where:{studentId:user.id,consecutiveRight:{lt:3}},include:{question:true}})]);
 const saved=new Set(parse<{keys?:string[]}>(bookmark?.details||null).keys||[]);
 const hidden=new Set(parse<{hidden?:string[]}>(bookmark?.details||null).hidden||[]);
 const wrong=attempts.flatMap(({id,state})=>state.status==="IN_PROGRESS"?[]:state.results.flatMap(result=>{const question=state.paper.questions.find(q=>q.id===result.questionId);return question&&result.correct===false?[{key:`${id}:${question.id}`,attemptId:id,paperTitle:state.paper.title,level:state.paper.level,question:{...question,...publicExamQuestion(question)},userAnswer:state.answers[question.id]||"",saved:saved.has(`${id}:${question.id}`),frequency:1}]:[];}));
 for(const row of legacy){const question=snapshotQuestion(row.question as unknown as Record<string,unknown>,Number((row.question.editorData as Record<string,unknown>|null)?.points)||1);wrong.push({key:`legacy-question:${question.id}`,attemptId:"",paperTitle:"Kho câu sai đã lưu trước đây",level:question.level,question:{...question,...publicExamQuestion(question)},userAnswer:"",saved:!hidden.has(`legacy-question:${question.id}`),frequency:row.wrongCount});}
 const weak=(kind:string)=>{const groups=new Map<string,{id:string;title:string;count:number;attemptId:string}>();for(const row of wrong){if(!`${row.question.tags} ${row.question.editorData.sourceContent||""}`.toLowerCase().includes(kind)&&!(kind==="grammar"&&row.question.tags.toLowerCase().includes("ngữ pháp"))&&!(kind==="vocab"&&row.question.tags.toLowerCase().includes("từ vựng")))continue;const metadata=row.question.editorData;const fields=kind==="grammar"?[metadata.grammarRule,metadata.grammarPoint,metadata.structure]:[metadata.hanzi,metadata.word,metadata.vocabulary,metadata.sourceWord];const tagMatch=row.question.tags.match(kind==="grammar"?/(?:grammar|ngữ pháp)\s*[:=]\s*([^,;|]+)/i:/(?:vocab(?:ulary)?|từ vựng)\s*[:=]\s*([^,;|]+)/i);const label=fields.find(value=>typeof value==="string"&&value.trim())||tagMatch?.[1]?.trim()||row.question.content;const groupId=`${kind}:${String(label)}`;const value=groups.get(groupId)||{id:groupId,title:String(label),count:0,attemptId:row.attemptId};value.count+=row.frequency;groups.set(value.id,value);}return[...groups.values()].sort((a,b)=>b.count-a.count);};
 return{wrong,grammar:weak("grammar"),vocabulary:weak("vocab")};
}
export async function saveWrong(user:AuthUser,body:Record<string,unknown>){
 const review=await reviewData(user),key=String(body.key);if(!review.wrong.some(row=>row.key===key))throw new ExamError(404,"Câu sai không thuộc tài khoản này.");
 const id=`exam-review:${user.id}`;
 for(let retry=0;retry<3;retry++){
  const old=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:REVIEW}}),current=parse<{keys?:string[];hidden?:string[]}>(old?.details||null);
  const keys=new Set(current.keys||[]),hidden=new Set(current.hidden||[]);if(body.saved===false){keys.delete(key);if(key.startsWith("legacy-question:"))hidden.add(key);}else{keys.add(key);hidden.delete(key);}
  const details=JSON.stringify({keys:[...keys],hidden:[...hidden]});
  if(old){const saved=await prisma.auditLog.updateMany({where:{id,userId:user.id,action:REVIEW,details:old.details},data:{details}});if(saved.count===1)return{success:true};}
  else{try{await prisma.auditLog.create({data:{id,userId:user.id,action:REVIEW,entity:user.id,details}});return{success:true};}catch{if(retry===2)throw new ExamError(409,"Kho câu sai đang được cập nhật. Hãy thử lại.");}}
 }
 throw new ExamError(409,"Kho câu sai đang được cập nhật. Hãy thử lại.");
}
export async function gradingQueue(user:AuthUser){if(user.role!=="ADMIN")throw new ExamError(403,"Chỉ Admin có quyền chấm bài.");const rows=await prisma.auditLog.findMany({where:{action:ATTEMPT},include:{user:{select:{name:true}}},orderBy:{createdAt:"desc"}});return rows.flatMap(row=>{const state=parse<CenterAttempt>(row.details);return state.status==="NEEDS_GRADING"?[{...attemptForOwner(row.id,state),studentName:row.user.name,manualQuestions:state.paper.questions.filter(q=>state.results.find(r=>r.questionId===q.id)?.manual).map(q=>({...q,answer:state.answers[q.id]||""}))}]:[];});}
export async function gradeManual(user:AuthUser,body:Record<string,unknown>){if(user.role!=="ADMIN")throw new ExamError(403,"Chỉ Admin có quyền chấm bài.");const row=await prisma.auditLog.findFirst({where:{id:String(body.id),action:ATTEMPT}});if(!row)throw new ExamError(404,"Không tìm thấy lượt thi.");const state=parse<CenterAttempt>(row.details);if(state.status!=="NEEDS_GRADING")throw new ExamError(409,"Bài không còn ở trạng thái chờ chấm.");if(!body.marks||typeof body.marks!=="object"||Array.isArray(body.marks))throw new ExamError(400,"Điểm chấm không hợp lệ.");let graded;try{graded=finishManual(state,body.marks as Record<string,number>);}catch(error){throw new ExamError(400,(error as Error).message);}await replaceAttempt(row,graded);return{success:true};}

export async function legacyDetail(user:AuthUser,id:string){
 const row=await prisma.attempt.findFirst({where:{id:id.replace(/^legacy:/,""),studentId:user.id,status:{not:"IN_PROGRESS"}},include:{answers:{include:{question:true}},assignment:{select:{title:true}}}});
 if(!row)throw new ExamError(404,"Không tìm thấy kết quả thuộc tài khoản này.");
 return {id:row.id,title:row.assignment.title,feedback:row.teacherNote,answers:row.answers.map(answer=>({id:answer.id,content:answer.question.content,userAnswer:answer.userAnswer,correctAnswer:answer.question.correctAnswer,explanation:answer.question.explanation,earned:answer.scoreEarned}))};
}
