import { duplicateQuestionNumbers, normalizeQuestionNumber, suggestQuestionNumbers } from "./question-number";
import examBlueprint from "../config/exam_blueprint.json";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { examExplanationTopics } from "./exam-explanation";
import type { Prisma } from "../generated/prisma";
import { getAuthUser, type AuthUser } from "./auth-server";
import { CLOZE_PASSAGE, WORD_BANK, PASSAGE_CHOICE, PASSAGE_SECTION, PASSAGE_JUDGEMENT, JUDGEMENT_SECTION, JUDGEMENT_OPTIONS, isReadingPassage, isReadingCloze, isReadingSection, clozeChoice } from "./reading-cloze";
import { NextResponse } from "next/server";
import { EXAM_LEVELS, EXAM_SKILLS, recommendExam, attemptForOwner, attemptSummary, examStatistics, finishManual, publicExamQuestion, levelGroup, paperSummary, scoreAttempt, snapshotQuestion, supportedTypes, playableQuestion, usableQuestion, isSharedListeningGroup, replySlots, restoreLegacyReplyGroups, READING_REPLIES, PICTURE_CODES, examAudioUrl, type ExamGroupMedia, type CenterAttempt, type ExamPaper, type ExamQuestion } from "./exam-center-core";

const ATTEMPT="EXAM_CENTER_ATTEMPT", PAPER="EXAM_CENTER_PAPER", PUBLICATION="EXAM_CENTER_PUBLICATION", REVIEW="EXAM_CENTER_REVIEW";
const HSKK_RECORDING="EXAM_CENTER_HSKK_RECORDING";
const hskkAudio=/^data:(audio\/(?:webm|mp4|mpeg|ogg|wav|aac|x-m4a))(?:;codecs=[\w.-]+)?;base64,([A-Za-z0-9+/]+={0,2})$/i;
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

type Publication = {approved:boolean;durationMin:number;passScore:number|null;proctorEnabled?:boolean;maxScore?:number;groups?:Record<string,ExamGroupMedia>};
async function latestPublication(paperId:string){
 const log=await prisma.auditLog.findFirst({where:{action:PUBLICATION,entity:paperId},orderBy:[{createdAt:"desc"},{id:"desc"}]});
 return log?parse<Publication>(log.details):null;
}

export async function officialPapers(){
 const [sets,logs]=await Promise.all([
  prisma.quizSet.findMany({where:{status:"READY",hskLevel:{gte:1,lte:9},mode:{in:["MOCK_EXAM","EXAM"]}},include:{teacher:{select:{role:true,name:true}},questions:{include:{question:true},orderBy:{orderIndex:"asc"}},assignments:{select:{durationMin:true}}},orderBy:{createdAt:"desc"}}),
  prisma.auditLog.findMany({where:{action:PUBLICATION},orderBy:[{createdAt:"desc"},{id:"desc"}]}),
 ]);
 const publications=new Map<string,Publication>();
 for(const log of logs)if(!publications.has(log.entity))publications.set(log.entity,parse(log.details));
 const papers:ExamPaper[]=[];
 for(const set of sets){
  const config=publications.get(set.id);if(config? !config.approved : (set.mode!=="MOCK_EXAM"&&set.teacher?.role!=="ADMIN"))continue;
  const durations=[...new Set(set.assignments.map(a=>a.durationMin).filter(n=>Number.isInteger(n)&&n>0))];
  const blueprint=examBlueprint.levels.find(row=>row.level===levelGroup(set.hskLevel));
  const durationMin=config?.durationMin||(durations.length===1?durations[0]:blueprint?.durationMin??null);
  const questions=set.questions.filter(row=>{const editor=row.question.editorData as Record<string,unknown>|null;return !editor?.status||editor.status==="READY";}).map(row=>snapshotQuestion(row.question as unknown as Record<string,unknown>,row.points));
  papers.push({...(blueprint?.resultMode==="CLASSIFICATION"?{classification:{bands:blueprint.classificationBands}}:{}),createdAt:set.createdAt?.toISOString(),id:set.id,title:set.title,description:set.description||"",level:set.hskLevel,source:"OFFICIAL",durationMin,groups:{...config?.groups,...restoreLegacyReplyGroups(questions,set.id)},maxScore:config?.maxScore??set.totalScore,passScore:blueprint?.resultMode==="CLASSIFICATION"?null:config?.passScore===null?null:config?.passScore??(blueprint?.maxScore===(config?.maxScore??set.totalScore)?blueprint.targetScore:null),proctorEnabled:config?.proctorEnabled??(set.proctorEnabled!==false),hskkExam:(config as any)?.hskkExam||null,hskkPaperId:(config as any)?.hskkPaperId||null,questions,mode:"EXAM"});
 }
 return papers;
}
async function privatePapers(user:AuthUser){return (await prisma.auditLog.findMany({where:{userId:user.id,action:PAPER},orderBy:{createdAt:"desc"}})).map(row=>parse<ExamPaper>(row.details));}
async function ownedRow(user:AuthUser,id:string){
 const row = user.role === "ADMIN"
  ? await prisma.auditLog.findFirst({where:{id,action:ATTEMPT}})
  : await prisma.auditLog.findFirst({where:{id,userId:user.id,action:ATTEMPT}});
 if(!row)throw new ExamError(404,"Không tìm thấy bài thi hoặc bài thi không tồn tại.");
 return row;
}
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
// The custom-paper builder samples individual questions. Keep passage blanks together in their published paper.
function approvedPool(papers:ExamPaper[],level:number){return [...new Map(papers.filter(p=>levelGroup(p.level)===level).flatMap(p=>p.questions).filter(q=>usableQuestion(q)&&q.points>0&&q.editorData.groupType!==CLOZE_PASSAGE&&!isReadingPassage(q.editorData.groupType)).map(q=>[q.id,q])).values()];}
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
 return {recommendations:[0,...EXAM_LEVELS].map(level=>({level,recommendation:recommendExam(official,attempts,level)})),blueprints:examBlueprint.levels,papers:papers.map(paper=>({...paperSummary(paper),available:paper.questions.length>0&&paper.questions.every(playableQuestion)&&paper.maxScore>0&&paper.questions.some(q=>q.points>0)&&!!paper.durationMin})),levels:EXAM_LEVELS.map(level=>{const rows=official.filter(p=>levelGroup(p.level)===level),times=rows.flatMap(p=>p.durationMin?[p.durationMin]:[]);return{level,count:rows.length,durationMin:times.length?Math.min(...times):null,durationMax:times.length?Math.max(...times):null};}),attempts:summaries,legacy,statistics:[0,...EXAM_LEVELS].map(level=>({level,...examStatistics(official,[...attempts,...legacyStats],level)})),bank,serverNow:new Date().toISOString()};
}
export async function getAttempt(user:AuthUser,id:string){return attemptForOwner(id,await settledState(user,id));}

async function pairedHskkAttempt(user:AuthUser,id:string){
 const row=await ownedRow(user,id);
 if(row.userId!==user.id)throw new ExamError(403,"Chỉ chủ bài thi mới có thể nộp bản ghi âm.");
 const state=parse<CenterAttempt>(row.details);
 const groups=state.paper.hskkExam?.groups??[];
 const questions=groups.flatMap(group=>(group.questions??[]).map(question=>({group,question})));
 if(state.status==="IN_PROGRESS"||!questions.length)throw new ExamError(409,"Hãy nộp bài HSK có phần khẩu ngữ trước.");
 return {row,state,questions};
}

export async function saveHskkRecording(user:AuthUser,body:Record<string,unknown>){
 const id=String(body.id||""), questionId=String(body.questionId||"");
 const {state,questions}=await pairedHskkAttempt(user,id);
 if(state.hskkSubmission)throw new ExamError(409,"Bài khẩu ngữ đã được nộp.");
 if(!questions.some(({question})=>question.id===questionId))throw new ExamError(400,"Bản ghi không thuộc đề khẩu ngữ này.");
 const audio=body.audio;
 if(typeof audio!=="string"||audio.length>6_000_000||!hskkAudio.test(audio)||audio.slice(audio.indexOf(",")+1).length%4!==0)
  throw new ExamError(400,"Bản ghi âm không hợp lệ hoặc quá lớn. Hãy ghi âm lại câu này.");
 const entity=`${id}:${questionId}`;
 const recordingId="hskk_"+createHash("sha256").update(JSON.stringify([user.id,entity,audio])).digest("hex");
 await prisma.auditLog.upsert({where:{id:recordingId},create:{id:recordingId,userId:user.id,action:HSKK_RECORDING,entity,details:audio},update:{}});
 return {recordingId};
}

export async function getHskkRecording(user:AuthUser,id:string,range:string|null=null){
 const row=await prisma.auditLog.findFirst({where:{id,action:HSKK_RECORDING,
  ...(user.role==="ADMIN"||user.role==="TEACHER"?{}:{userId:user.id}),
 }});
 const audio=row?.details?.match(hskkAudio);
 if(!audio)throw new ExamError(404,"Không tìm thấy bản ghi âm.");
 const bytes=Buffer.from(audio[2],"base64");
 const headers=new Headers({"Content-Type":audio[1],"Content-Length":String(bytes.length),"Accept-Ranges":"bytes",
  "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});
 const requested=range?.match(/^bytes=(\d*)-(\d*)$/);
 if(!requested)return new Response(new Uint8Array(bytes),{headers});
 const [,first,last]=requested;
 const start=first?Number(first):Math.max(0,bytes.length-Number(last));
 const end=first&&last?Math.min(bytes.length-1,Number(last)):bytes.length-1;
 if(start>=bytes.length||start>end){
  headers.set("Content-Range",`bytes */${bytes.length}`);
  headers.set("Content-Length","0");
  return new Response(null,{status:416,headers});
 }
 headers.set("Content-Range",`bytes ${start}-${end}/${bytes.length}`);
 headers.set("Content-Length",String(end-start+1));
 return new Response(new Uint8Array(bytes.subarray(start,end+1)),{status:206,headers});
}

export async function submitHskk(user:AuthUser,body:Record<string,unknown>){
 const id=String(body.id||"");
 const {row,state,questions}=await pairedHskkAttempt(user,id);
 if(state.hskkSubmission)return attemptForOwner(id,state);
 if(!body.recordings||typeof body.recordings!=="object"||Array.isArray(body.recordings))
  throw new ExamError(400,"Danh sách bản ghi âm không hợp lệ.");
 const entries=Object.entries(body.recordings);
 const questionIds=new Set(questions.map(({question})=>question.id));
 if(!entries.length||entries.some(([questionId,recordingId])=>!questionIds.has(questionId)||typeof recordingId!=="string"||!/^hskk_[a-f0-9]{64}$/.test(recordingId)))
  throw new ExamError(400,"Cần ít nhất một bản ghi hợp lệ thuộc đề khẩu ngữ.");
 const recordings=await prisma.auditLog.findMany({
  where:{userId:user.id,action:HSKK_RECORDING,id:{in:entries.map(([,recordingId])=>recordingId as string)}},
  select:{id:true,entity:true},
 });
 const byId=new Map(recordings.map(recording=>[recording.id,recording.entity]));
 if(entries.some(([questionId,recordingId])=>byId.get(recordingId as string)!==`${id}:${questionId}`))
  throw new ExamError(400,"Không tìm thấy bản ghi âm của lượt thi này.");

 const byQuestion=new Map(entries);
 const weights=questions.map(({question})=>Number.isFinite(question.points)&&question.points>0?question.points:0);
 const defaultPoints=weights.every(points=>points===0);
 const pairedQuestions=questions.map(({group,question},index)=>snapshotQuestion({
  ...question,id:randomUUID(),type:"speaking_audio",skill:"SPEAKING",level:state.paper.level,
  groupTitle:group.title,instruction:group.instruction,
 },defaultPoints?1:weights[index]));
 const mapping=Object.fromEntries(pairedQuestions.map((question,index)=>[question.id,questions[index].question.id]));
 const answers={...state.answers};
 const results=[...state.results];
 for(const question of pairedQuestions){
  const recordingId=byQuestion.get(mapping[question.id]);
  if(recordingId)answers[question.id]=`/api/v1/exam-center?action=hskkRecording&id=${recordingId}`;
  results.push({questionId:question.id,manual:!!recordingId,earned:recordingId?null:0,correct:recordingId?null:false,max:question.points});
 }
 const submitted:CenterAttempt={...state,paper:{...state.paper,questions:[...state.paper.questions,...pairedQuestions]},answers,results,
  hskkSubmission:{submittedAt:new Date().toISOString(),questionIds:mapping},status:"NEEDS_GRADING",revision:state.revision+1};
 try{
  await replaceAttempt(row,submitted);
 }catch(error){
  if(!(error instanceof ExamError)||error.status!==409)throw error;
  const latest=await settledState(user,id);
  if(latest.hskkSubmission)return attemptForOwner(id,latest);
  throw error;
 }
 return attemptForOwner(id,submitted);
}

export async function startAttempt(user:AuthUser,body:Record<string,unknown>){
 const requestId=clientId(body.requestId),id=`exam_${requestId}`;
 const prior=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:ATTEMPT}});if(prior)return getAttempt(user,id);
 const paperId=String(body.paperId||"");const papers=await Promise.all([officialPapers(),privatePapers(user)]);const paper=papers.flat().find(p=>p.id===paperId);
 if(!paper)throw new ExamError(404,"Đề chưa được Admin xuất bản hoặc không thuộc tài khoản của bạn.");
 if(!paper.questions.length||paper.questions.some(q=>!playableQuestion(q))||!paper.questions.some(q=>q.points>0)||paper.maxScore<=0)throw new ExamError(409,"Đề chưa có câu hỏi tính điểm hoặc có dạng câu hỏi chưa hỗ trợ.");
 if(!paper.durationMin)throw new ExamError(409,"Admin chưa cấu hình thời gian cho đề này.");
 const active=!body.forceNew?(await ownAttempts(user)).find(row=>row.state.status==="IN_PROGRESS"&&row.state.paper.id===paper.id):null;if(active)return attemptForOwner(active.id,active.state);
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
 const official=await officialPapers();
 const pool=approvedPool(official,level).filter(q=>(body.skills as string[]).includes(q.skill)&&(body.types as string[]).includes(q.type));
 if(pool.length<count)throw new ExamError(409,`Ngân hàng đã duyệt chỉ có ${pool.length} câu phù hợp. Giảm số lượng hoặc đổi bộ lọc.`);
 for(let i=pool.length-1;i>0;i--){const j=randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 const questions=pool.slice(0,count),maxScore=questions.reduce((sum,q)=>sum+q.points,0);
 const groupIds=new Set(questions.map(q=>String(q.editorData.groupId||"")));
 const groups=Object.fromEntries(official.flatMap(paper=>Object.entries(paper.groups||{})).filter(([id])=>groupIds.has(id)));
 const paper:ExamPaper={groups,createdAt:new Date().toISOString(),customConfig:{skills:[...body.skills] as string[],types:[...body.types] as string[],count},id,title:title(body.title),description:"Đề cá nhân từ ngân hàng Admin đã xuất bản.",level,source:"CUSTOM",durationMin,maxScore,passScore:null,questions,mode:body.mode as "EXAM"|"PRACTICE"};
 try{await prisma.auditLog.create({data:{id,userId:user.id,action:PAPER,entity:id,details:JSON.stringify(paper)}});}catch{const old=await prisma.auditLog.findFirst({where:{id,userId:user.id,action:PAPER}});if(!old)throw new ExamError(409,"Không tạo được đề cá nhân.");return paperSummary(parse<ExamPaper>(old.details));}
 return paperSummary(paper);
}
export async function publicationCandidates(user:AuthUser){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin được xem danh sách đề.");
 const [rows,logs,official]=await Promise.all([
  prisma.quizSet.findMany({where:{status:"READY",mode:{in:["EXAM","MOCK_EXAM"]}},include:{teacher:{select:{name:true}},questions:{include:{question:true},orderBy:{orderIndex:"asc"}}},orderBy:{createdAt:"desc"}}),
  prisma.auditLog.findMany({where:{action:PUBLICATION},orderBy:[{createdAt:"desc"},{id:"desc"}]}),
  officialPapers(),
 ]);
 const configs=new Map<string,Publication>();
 for(const log of logs)if(!configs.has(log.entity))configs.set(log.entity,parse(log.details));
 const published=new Map(official.map(paper=>[paper.id,paper]));
 return rows.map(row=>{
  const config=configs.get(row.id),paper=published.get(row.id);
  const questions=row.questions.map(({question,points})=>snapshotQuestion(question as unknown as Record<string,unknown>,points));
  const groups={...config?.groups,...restoreLegacyReplyGroups(questions,row.id)};
  const shownGroups=new Set<string>();
  for(const q of questions){
   const id=String(q.editorData.groupId||"");
   const group=groups[id];
   if(group?.section){
    q.editorData={...q.editorData,sectionId:group.section.id,sectionTitle:group.section.title,
     sectionType:group.section.type,sectionInstruction:group.section.instruction};
   }
   if(group&&!shownGroups.has(id)){
    q.audioUrl=group.audioUrl||q.audioUrl;
    q.editorData={...q.editorData,groupImages:group.images,groupReplies:group.replies,groupWords:group.words,
     passage:group.passage??q.editorData.passage,passagePinyin:group.passagePinyin,groupCustom:group.custom,
     instruction:group.instruction||q.editorData.instruction};
    shownGroups.add(id);
   }
  }
  return {id:row.id,title:row.title,level:row.hskLevel,maxScore:config?.maxScore??row.totalScore,author:row.teacher?.name||"",
   durationMin:config?.durationMin??paper?.durationMin??null,passScore:config?.passScore??paper?.passScore??null,published:!!paper,hskkExam:(config as any)?.hskkExam||null,hskkPaperId:(config as any)?.hskkPaperId||null,questions};
 });
}
export async function publishPaper(user:AuthUser,body:Record<string,unknown>){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin được duyệt đề.");
 const paper=await prisma.quizSet.findFirst({where:{id:String(body.paperId),status:"READY",mode:{in:["EXAM","MOCK_EXAM"]}}});if(!paper)throw new ExamError(404,"Không có đề sẵn sàng để xuất bản.");
 const config=await latestPublication(paper.id);
 const durationMin=integer(body.durationMin,1,600,"Thời gian"),passScore=body.passScore===null||body.passScore===""?null:Number(body.passScore);
 if(passScore!==null&&(!Number.isFinite(passScore)||passScore<0||passScore>(config?.maxScore??paper.totalScore)))throw new ExamError(400,"Ngưỡng đạt phải nằm trong thang điểm của đề.");
 await prisma.auditLog.create({data:{userId:user.id,action:PUBLICATION,entity:paper.id,details:JSON.stringify({...config,approved:body.approved!==false,durationMin,passScore})}});return{success:true};
}
function validatePairedHskk(value: unknown) {
 if(value==null)return null;
 if(typeof value!=="object"||!("groups" in value)||!Array.isArray(value.groups)||
    value.groups.some(group=>!group||!Array.isArray(group.questions)))
  throw new ExamError(400,"Cấu trúc phần HSKK không hợp lệ.");
 const groups=value.groups.filter(group=>group.questions.length>0);
 if(!groups.length)return null;
 const ids=new Set<string>();
 for(const group of groups){
  for(const [index,question] of group.questions.entries()){
   const label=`HSKK · ${group.title || "Phần thi"} · Câu ${question?.questionNumber ?? index+1}`;
   if(typeof question?.id!=="string"||!question.id.trim()||ids.has(question.id))
    throw new ExamError(400,`${label} có mã câu hỏi thiếu hoặc bị trùng.`);
   ids.add(question.id);
   if(typeof question.points!=="number"||!Number.isFinite(question.points)||question.points<0)
    throw new ExamError(400,`${label} có điểm không hợp lệ.`);
  }
 }
 return {...value,groups};
}

export async function importPaper(user:AuthUser,body:Record<string,unknown>){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin được nhập và tạo đề.");
 const level=integer(body.level,1,9,"Cấp độ HSK"),titleStr=title(body.title);
 const description=typeof body.description==="string"?body.description.trim():"Đề thi mô phỏng chuẩn HSK 3.0";
 const durationMin=integer(body.durationMin,1,600,"Thời gian làm bài");
 const passScore=body.passScore==null||body.passScore===""?null:Number(body.passScore);
 const hskkExam=validatePairedHskk(body.hskkExam);
 if(!Array.isArray(body.questions)||!body.questions.length||
    body.questions.some(q=>!q||typeof q!=="object"||Array.isArray(q)))throw new ExamError(400,"Đề thi cần ít nhất một câu hỏi hợp lệ.");

 const prefix=randomUUID();
 const grouped=new Map<string,{title:string;questions:ExamQuestion[];media:ExamGroupMedia}>();
 const questions=body.questions.map((raw:Record<string,unknown>,idx:number)=>{
  const points=Number(raw.points??1);
  if(!Number.isFinite(points)||points<0)throw new ExamError(400,`Điểm câu ${idx+1} không hợp lệ.`);
  const editor=raw.editorData as Record<string,unknown>|undefined;
  const providedNumber=raw.questionNumber??editor?.questionNumber;
  if(providedNumber!==undefined&&normalizeQuestionNumber(providedNumber)===undefined)
   throw new ExamError(400,`Số thứ tự ở vị trí ${idx+1} phải là số nguyên dương.`);
  const fallbackType=raw.skill==="LISTENING"?"listening_choice":raw.skill==="WRITING"?"essay":raw.skill==="SPEAKING"?"speaking":"multiple_choice";
  const q=snapshotQuestion({...raw,type:raw.type||fallbackType,level},points);
  q.editorData.rubric=raw.rubric||q.editorData.rubric||"";
  return q;
 });
 const numbers=suggestQuestionNumbers(questions.map(q=>q.editorData));
 const duplicateNumbers=duplicateQuestionNumbers(numbers.map(questionNumber=>({questionNumber})));
 questions.forEach((q,index)=>{q.editorData.questionNumber=numbers[index];});
 const legacy=restoreLegacyReplyGroups(questions,prefix);
 const sections=new Map<string,NonNullable<ExamGroupMedia["section"]>>();
 const passageOwners=new Map<string,string>();
 let previousSectionId="",previousPassageId="";
 const sectionQuestionIds=new Set<string>();
 for(const q of questions){
  const groupType=q.editorData.groupType;
  const originalGroupId=String(q.editorData.groupId||"");
  const rawSectionId=String(q.editorData.sectionId||"").trim();
  const sectionType=q.editorData.sectionType;
  let section:ExamGroupMedia["section"];
  if(isReadingPassage(groupType)&&!rawSectionId)throw new ExamError(400,"Bài đọc hiểu cần thuộc một phần thi.");
  if(rawSectionId||sectionType){
   if(!rawSectionId||!originalGroupId||!isReadingSection(sectionType)||
      (sectionType===PASSAGE_SECTION?groupType!==PASSAGE_CHOICE:
       sectionType===JUDGEMENT_SECTION?groupType!==PASSAGE_JUDGEMENT:!isReadingCloze(groupType)))
    throw new ExamError(400,"Bài lớn chưa được liên kết với đúng phần thi.");
   const sectionTitle=String(q.editorData.sectionTitle||"").trim()||"Phần Đọc";
   section=sections.get(rawSectionId);
   if(section&&previousSectionId!==rawSectionId)
    throw new ExamError(400,"Các bài lớn thuộc cùng phần thi cần nằm liền nhau.");
   if(section&&(section.type!==sectionType||section.title!==sectionTitle||
      section.instruction!==String(q.editorData.sectionInstruction||"")))
    throw new ExamError(400,"Thông tin phần thi không nhất quán.");
   if(!section){
    section={id:`${prefix}:${rawSectionId}`,title:sectionTitle,type:sectionType,instruction:String(q.editorData.sectionInstruction||"")};
    sections.set(rawSectionId,section);
   }
   const identity=JSON.stringify([rawSectionId,groupType,q.editorData.groupTitle]);
   const previousIdentity=passageOwners.get(originalGroupId);
   if(previousIdentity&&(previousIdentity!==identity||previousPassageId!==originalGroupId))
    throw new ExamError(400,"Mỗi bài lớn cần một ID riêng và các câu hỏi nhỏ cần nằm liền nhau.");
   passageOwners.set(originalGroupId,identity);
   if(!q.id||q.id==="undefined"||sectionQuestionIds.has(q.id))throw new ExamError(400,"Mỗi câu hỏi nhỏ cần có ID riêng.");
   sectionQuestionIds.add(q.id);
  }
  previousSectionId=rawSectionId;
  previousPassageId=section?originalGroupId:"";
  const key=JSON.stringify([rawSectionId,q.skill,groupType,originalGroupId||q.editorData.groupTitle||""]);
  if(groupType==="matching_images"||isSharedListeningGroup(groupType)||groupType===READING_REPLIES||isReadingCloze(groupType)||isReadingPassage(groupType)){
   let group=grouped.get(key);
   if(!group){
    group={title:String(q.editorData.groupTitle||"Nhóm câu hỏi"),questions:[],media:section?{section}:{}};
    grouped.set(key,group);
   }
   const images=q.editorData.groupImages;
   if(groupType==="matching_images"&&Array.isArray(images)&&images.length){
    if(images.some(image=>!image||typeof image.id!=="string"||typeof image.imageUrl!=="string"))
     throw new ExamError(400,`${group.title} — Dữ liệu tranh không hợp lệ.`);
    group.media.images=images.map(image=>({id:image.id,label:`Tranh ${image.id}`,imageUrl:image.imageUrl}));
   }
   if(q.audioUrl?.trim()&&q.skill==="LISTENING")group.media.audioUrl??=examAudioUrl(q.audioUrl.trim(),level);
   q.editorData.groupId=`${prefix}_${key}`;
   delete q.editorData.groupImages;
   delete q.editorData.audioUrl;
   q.audioUrl="";
   if(groupType==="eval_true_false_na"||groupType==="listening_fill_blank"){
    if(q.skill!=="LISTENING")throw new ExamError(400,`${group.title} — Chọn kỹ năng Nghe.`);
    q.type=groupType==="eval_true_false_na"?"true_false_na":"listening_fill";
   }
   if(groupType===WORD_BANK||groupType===CLOZE_PASSAGE||isReadingPassage(groupType)){
    if(q.skill!=="READING")throw new ExamError(400,`${group.title} — Chọn kỹ năng Đọc.`);
    const cleanChoice=(option:unknown)=>{
     if(!clozeChoice(option))throw new ExamError(400,`${group.title} — Dữ liệu lựa chọn không hợp lệ.`);
     return {id:option.id,text:option.text.trim(),pinyin:option.pinyin?.trim()||""};
    };
    if(groupType===WORD_BANK){
     if(Array.isArray(q.editorData.groupWords)){
      const words=q.editorData.groupWords.map(cleanChoice);
      if(group.media.words&&JSON.stringify(group.media.words)!==JSON.stringify(words))
       throw new ExamError(400,`${group.title} — Nhóm có nhiều ngân hàng từ khác nhau.`);
      group.media.words=words;
     }
     if(typeof q.editorData.groupCustom==="boolean"){
      if(group.media.custom!==undefined&&group.media.custom!==q.editorData.groupCustom)
       throw new ExamError(400,`${group.title} — Chế độ soạn nhóm không nhất quán.`);
      group.media.custom=q.editorData.groupCustom;
     }
     q.options=[];
    }else{
     const passage=String(q.editorData.passage||"");
     if(passage&&group.media.passage&&group.media.passage!==passage)
      throw new ExamError(400,`${group.title} — Nhóm có nhiều đoạn văn khác nhau.`);
     group.media.passage||=passage;
     group.media.passagePinyin||=String(q.editorData.passagePinyin||"");
     q.options=groupType===PASSAGE_JUDGEMENT?JUDGEMENT_OPTIONS:q.options.map(cleanChoice);
     if(groupType===CLOZE_PASSAGE)q.editorData.blankId=String(q.editorData.blankId||"");
    }
    group.media.instruction||=String(q.editorData.instruction||"");
    q.type=groupType===PASSAGE_JUDGEMENT?"true_false":groupType===PASSAGE_CHOICE?"multiple_choice":"fill_blank";
    if(groupType===PASSAGE_JUDGEMENT)q.editorData.evidence=String(q.editorData.evidence||"").trim();
    q.imageUrl="";
    delete q.editorData.passage;
    delete q.editorData.passagePinyin;
    delete q.editorData.groupWords;
    delete q.editorData.groupCustom;
    delete q.editorData.instruction;
    delete q.editorData.imageUrl;
    delete q.editorData.requiresManualReview;
    delete q.editorData.sectionId;
    delete q.editorData.sectionTitle;
    delete q.editorData.sectionType;
    delete q.editorData.sectionInstruction;
   } else if(groupType===READING_REPLIES){
    if(q.skill!=="READING")throw new ExamError(400,`${group.title} — Chọn kỹ năng Đọc.`);
    const replies=legacy[originalGroupId]?.replies||q.editorData.groupReplies;
    if(Array.isArray(replies)){
     if(replies.some(reply=>!reply||typeof reply.id!=="string"||typeof reply.text!=="string"||
        (reply.pinyin!==undefined&&typeof reply.pinyin!=="string")))throw new ExamError(400,`${group.title} — Dữ liệu câu trả lời không hợp lệ.`);
     const normalized=replies.map(reply=>({id:reply.id,text:reply.text.trim(),pinyin:reply.pinyin?.trim()||""}));
     if(group.media.replies&&JSON.stringify(group.media.replies)!==JSON.stringify(normalized))
      throw new ExamError(400,`${group.title} — Nhóm có nhiều bộ câu trả lời khác nhau.`);
     group.media.replies=normalized;
    }
    if(typeof q.editorData.groupCustom==="boolean"){
     if(group.media.custom!==undefined&&group.media.custom!==q.editorData.groupCustom)
      throw new ExamError(400,`${group.title} — Chế độ soạn nhóm không nhất quán.`);
     group.media.custom=q.editorData.groupCustom;
    }
    group.media.instruction||=String(q.editorData.instruction||"");
    q.type="matching";
    q.options=[];
    q.imageUrl="";
    q.editorData.passage="";
    delete q.editorData.groupReplies;
    delete q.editorData.groupCustom;
    delete q.editorData.instruction;
    delete q.editorData.imageUrl;
   } else if(groupType==="matching_images"){
    q.type="matching";
    q.options=PICTURE_CODES.map(id=>({id,text:`Tranh ${id}`}));
    q.editorData.passage="";
    if(q.skill==="READING"){
     q.imageUrl="";
     delete q.editorData.imageUrl;
    }
   }
   group.questions.push(q);
  }
 }

 const groups:Record<string,ExamGroupMedia>={};
 for(const {questions,media} of grouped.values()){
  const first=questions[0];
  if(media.replies)media.replies=replySlots(media.replies);
  groups[String(first.editorData.groupId)]=media;
 }
 const invalid=questions.findIndex(q=>!playableQuestion(q));
 if(invalid>=0)throw new ExamError(400,`Câu ${invalid+1} có dạng câu hỏi chưa hỗ trợ.`);
 const useDefaultPoints=questions.every(q=>q.points===0);
 if(useDefaultPoints)questions.forEach(q=>{q.points=1;});
 const totalScore=questions.reduce((sum,q)=>sum+q.points,0);
 if(Math.round(totalScore)>2147483647)throw new ExamError(400,"Tổng điểm của đề không hợp lệ.");
 if(passScore!==null&&(!Number.isFinite(passScore)||passScore<0||passScore>totalScore))
  throw new ExamError(400,`Mốc điểm đạt phải từ 0 đến ${totalScore}. Có thể để trống.`);

 const existingPaperId = typeof body.paperId === "string" && body.paperId.trim() ? body.paperId.trim() : null;
 return prisma.$transaction(async tx=>{
  let targetPaperId: string = existingPaperId || "";
  if(existingPaperId){
   await tx.quizSetQuestion.deleteMany({where:{quizSetId:existingPaperId}});
   await tx.quizSet.update({
    where:{id:existingPaperId},
    data:{
     title:titleStr,description,hskLevel:level,
     totalScore:Math.max(1,Math.round(totalScore)),
     questions:{create:questions.map((q,idx)=>({
      orderIndex:idx+1,points:q.points,
      question:{create:{
       type:q.type,content:q.content,skill:q.skill,level,correctAnswer:q.correctAnswer,
       explanation:q.explanation,options:JSON.stringify(q.options),audioUrl:q.audioUrl||null,
       imageUrl:q.imageUrl||null,
       editorData:jsonClone({...q.editorData,status:"READY",pinyin:q.pinyinPrompt}) as Prisma.InputJsonObject,
      }},
     }))},
    }
   });
   await tx.auditLog.deleteMany({where:{entity:existingPaperId,action:PUBLICATION}});
  } else {
   const createdSet=await tx.quizSet.create({data:{
    title:titleStr,description,hskLevel:level,mode:"MOCK_EXAM",status:"READY",
    totalScore:Math.max(1,Math.round(totalScore)),teacherId:user.id,
    questions:{create:questions.map((q,idx)=>({
     orderIndex:idx+1,points:q.points,
     question:{create:{
      type:q.type,content:q.content,skill:q.skill,level,correctAnswer:q.correctAnswer,
      explanation:q.explanation,options:JSON.stringify(q.options),audioUrl:q.audioUrl||null,
      imageUrl:q.imageUrl||null,
      editorData:jsonClone({...q.editorData,status:"READY",pinyin:q.pinyinPrompt}) as Prisma.InputJsonObject,
     }},
    }))},
   }});
   targetPaperId = createdSet.id;
  }
  await tx.auditLog.create({data:{
   userId:user.id,action:PUBLICATION,entity:targetPaperId,
   details:JSON.stringify({
    approved:body.approved!==false,
    durationMin,
    passScore,
    maxScore:totalScore,
    groups,
    hskkExam,
    hskkPaperId:body.hskkPaperId||null
   }),
  }});
  return {success:true,paperId:targetPaperId,duplicateQuestionNumbers:duplicateNumbers,useDefaultPoints};
 },{timeout:60000,maxWait:15000});
}

export async function deletePaper(user:AuthUser,body:Record<string,unknown>){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin có quyền xóa đề thi.");
 const paperId=String(body.paperId||body.id||"");
 if(!paperId)throw new ExamError(400,"Thiếu mã đề thi cần xóa.");
 await prisma.quizSetQuestion.deleteMany({where:{quizSetId:paperId}});
 await prisma.assignment.deleteMany({where:{quizSetId:paperId}});
 await prisma.auditLog.deleteMany({where:{entity:paperId}});
 await prisma.quizSet.deleteMany({where:{id:paperId}});
 return {success:true};
}
export async function purgeOldMockExams(user:AuthUser){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin có quyền xóa kho đề thi.");
 const mockSets=await prisma.quizSet.findMany({where:{mode:{in:["MOCK_EXAM","EXAM"]}},select:{id:true}});
 const mockIds=mockSets.map(s=>s.id);
 if(mockIds.length>0){
  await prisma.quizSetQuestion.deleteMany({where:{quizSetId:{in:mockIds}}});
  await prisma.assignment.deleteMany({where:{quizSetId:{in:mockIds}}});
  await prisma.auditLog.deleteMany({where:{entity:{in:mockIds}}});
  await prisma.quizSet.deleteMany({where:{id:{in:mockIds}}});
 }
 const deletedLogs=await prisma.auditLog.deleteMany({
  where:{action:{in:[ATTEMPT,PAPER,PUBLICATION]}}
 });
 return {success:true,deletedSets:mockIds.length,deletedLogs:deletedLogs.count};
}
function legacyWeakTopics(question:ExamQuestion,kind:"grammar"|"vocabulary"){
 const metadata=question.editorData;
 const grammar=kind==="grammar";
 const tags=question.tags.toLowerCase();
 const source=String(metadata.sourceContent||"").toLowerCase();
 if(!tags.includes(grammar?"grammar":"vocab")&&!source.includes(grammar?"grammar":"vocab")&&
    !tags.includes(grammar?"ngữ pháp":"từ vựng"))return [];
 const fields=grammar?[metadata.grammarRule,metadata.grammarPoint,metadata.structure]:
  [metadata.hanzi,metadata.word,metadata.vocabulary,metadata.sourceWord];
 const tag=question.tags.match(grammar?/(?:grammar|ngữ pháp)\s*[:=]\s*([^,;|]+)/i:/(?:vocab(?:ulary)?|từ vựng)\s*[:=]\s*([^,;|]+)/i);
 const label=fields.find((value):value is string=>typeof value==="string"&&!!value.trim())||tag?.[1]||question.content;
 return label.trim()?[label.trim()]:[];
}

export async function reviewData(user:AuthUser){
 const [attempts,bookmark,legacy]=await Promise.all([ownAttempts(user),prisma.auditLog.findFirst({where:{id:`exam-review:${user.id}`,userId:user.id,action:REVIEW}}),prisma.wrongQuestion.findMany({where:{studentId:user.id,consecutiveRight:{lt:3}},include:{question:true}})]);
 const saved=new Set(parse<{keys?:string[]}>(bookmark?.details||null).keys||[]);
 const hidden=new Set(parse<{hidden?:string[]}>(bookmark?.details||null).hidden||[]);
 const wrong=attempts.flatMap(({id,state})=>{
  if(state.status==="IN_PROGRESS")return [];
  const positions=new Map(state.paper.questions.map((question,index)=>[question.id,{question,position:index+1}]));
  return state.results.flatMap(result=>{
   const entry=positions.get(result.questionId);
   if(!entry||result.correct!==false)return [];
   const {question,position}=entry;
   const group=state.paper.groups?.[String(question.editorData.groupId||"")];
   return [{key:`${id}:${question.id}`,attemptId:id,paperTitle:state.paper.title,level:state.paper.level,
    question:{...question,...publicExamQuestion(question,group,position)},userAnswer:state.answers[question.id]||"",
    saved:saved.has(`${id}:${question.id}`),frequency:1}];
  });
 });
 for(const row of legacy){const question=snapshotQuestion(row.question as unknown as Record<string,unknown>,Number((row.question.editorData as Record<string,unknown>|null)?.points)||1);wrong.push({key:`legacy-question:${question.id}`,attemptId:"",paperTitle:"Kho câu sai đã lưu trước đây",level:question.level,question:{...question,...publicExamQuestion(question)},userAnswer:"",saved:!hidden.has(`legacy-question:${question.id}`),frequency:row.wrongCount});}
 const topics=wrong.map(row=>({...row,topics:examExplanationTopics(row.question.explanation)}));
 const weak=(kind:"grammar"|"vocabulary")=>{
  const groups=new Map<string,{id:string;title:string;count:number;attemptId:string;level:number}>();
  for(const row of topics){
   const labels=row.topics?.[kind]??legacyWeakTopics(row.question,kind);
   const seen=new Set<string>();
   for(const label of labels){
    const id=[kind,row.level,label.normalize("NFC").replace(/\s+/g," ")].join(":");
    if(seen.has(id))continue;
    seen.add(id);
    const value=groups.get(id)??{id,title:label,count:0,attemptId:"",level:row.level};
    value.count+=row.frequency;
    value.attemptId||=row.attemptId;
    groups.set(id,value);
   }
  }
  return [...groups.values()].sort((a,b)=>b.count-a.count);
 };
 return {wrong,grammar:weak("grammar"),vocabulary:weak("vocabulary")};
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
export async function gradingQueue(user:AuthUser){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin có quyền chấm bài.");
 const rows=await prisma.auditLog.findMany({where:{action:ATTEMPT},include:{user:{select:{name:true}}},orderBy:{createdAt:"desc"}});
 return rows.flatMap(row=>{
  const state=parse<CenterAttempt>(row.details);
  if(state.status!=="NEEDS_GRADING")return [];
  const pending=new Set(state.results.filter(result=>result.manual&&result.earned===null).map(result=>result.questionId));
  return [{id:row.id,title:state.paper.title,level:state.paper.level,studentName:row.user.name,
   manualQuestions:state.paper.questions.filter(q=>pending.has(q.id)).map(q=>({...q,answer:state.answers[q.id]||""}))}];
 });
}

export async function gradeManual(user:AuthUser,body:Record<string,unknown>){
 if(user.role!=="ADMIN"&&user.role!=="TEACHER")throw new ExamError(403,"Chỉ Giáo viên và Admin có quyền chấm bài.");
 const row=await prisma.auditLog.findFirst({where:{id:String(body.id),action:ATTEMPT}});
 if(!row)throw new ExamError(404,"Không tìm thấy lượt thi.");
 const state=parse<CenterAttempt>(row.details);
 if(state.status!=="NEEDS_GRADING")throw new ExamError(409,"Bài không còn ở trạng thái chờ chấm.");
 if(!body.marks||typeof body.marks!=="object"||Array.isArray(body.marks))throw new ExamError(400,"Điểm chấm không hợp lệ.");
 const pending=new Set(state.results.filter(result=>result.manual&&result.earned===null).map(result=>result.questionId));
 const feedback=body.feedback??{};
 if(typeof feedback!=="object"||Array.isArray(feedback)||Object.entries(feedback).some(([id,note])=>
  !pending.has(id)||typeof note!=="string"||note.length>4000))
  throw new ExamError(400,"Nhận xét phải thuộc câu đang chờ chấm và tối đa 4.000 ký tự.");
 const notes=Object.fromEntries(Object.entries(feedback).map(([id,note])=>[id,(note as string).trim()]).filter(([,note])=>note));
 let graded;
 try{graded=finishManual(state,body.marks as Record<string,number>,notes);}
 catch(error){throw new ExamError(400,(error as Error).message);}
 await replaceAttempt(row,graded);
 return {success:true};
}

export async function legacyDetail(user:AuthUser,id:string){
 const row=await prisma.attempt.findFirst({where:{id:id.replace(/^legacy:/,""),studentId:user.id,status:{not:"IN_PROGRESS"}},include:{answers:{include:{question:true}},assignment:{select:{title:true}}}});
 if(!row)throw new ExamError(404,"Không tìm thấy kết quả thuộc tài khoản này.");
 return {id:row.id,title:row.assignment.title,feedback:row.teacherNote,answers:row.answers.map(answer=>({id:answer.id,content:answer.question.content,userAnswer:answer.userAnswer,correctAnswer:answer.question.correctAnswer,explanation:answer.question.explanation,earned:answer.scoreEarned}))};
}

const DRAFT = "EXAM_CENTER_DRAFT";

export async function getExamDrafts(user: AuthUser) {
  if (user.role !== "ADMIN" && user.role !== "TEACHER") throw new ExamError(403, "Chỉ Giáo viên và Admin được xem bản nháp.");
  const rows = await prisma.auditLog.findMany({
    where: { action: DRAFT },
    include: { user: { select: { id: true, name: true, role: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(r => {
    const d = parse<any>(r.details);
    return {
      id: r.entity,
      logId: r.id,
      authorId: r.userId,
      authorName: r.user?.name || d.authorName || "Giáo viên",
      authorRole: r.user?.role || "TEACHER",
      title: d.authorTitle || "Đề chưa đặt tên",
      description: d.authorDesc || "",
      level: d.authorLevel || 1,
      durationMin: d.authorDuration || 40,
      passScore: d.authorPass ?? null,
      mode: d.authorMode || "grouped",
      groups: d.groups || [],
      hskkExam: d.hskkExam || null,
      jsonInput: d.jsonInput || "",
      questionsCount: d.groups ? d.groups.reduce((s: number, g: any) => s + (g.questions?.length || 0), 0) : 0,
      updatedAt: d.savedAt || r.createdAt.toISOString(),
      canManage: user.role === "ADMIN" || r.userId === user.id,
    };
  });
}

export async function saveExamDraft(user: AuthUser, body: Record<string, unknown>) {
  if (user.role !== "ADMIN" && user.role !== "TEACHER") throw new ExamError(403, "Chỉ Giáo viên và Admin được lưu bản nháp.");
  const draftId = String(body.draftId || `draft_${user.id}_${body.authorLevel || 1}`);
  const payload = {
    draftId,
    authorId: user.id,
    authorName: user.name,
    authorLevel: Number(body.authorLevel || 1),
    authorTitle: String(body.authorTitle || "").slice(0, 300),
    authorDesc: String(body.authorDesc || "").slice(0, 3000),
    authorDuration: Number(body.authorDuration || 40),
    authorPass: body.authorPass ?? null,
    authorMode: body.authorMode || "grouped",
    groups: body.groups || [],
    hskkExam: body.hskkExam || null,
    jsonInput: typeof body.jsonInput === "string" ? body.jsonInput : "",
    savedAt: new Date().toISOString(),
  };

  const existing = await prisma.auditLog.findFirst({
    where: { action: DRAFT, entity: draftId },
  });

  if (existing) {
    await prisma.auditLog.update({
      where: { id: existing.id },
      data: {
        userId: user.id,
        details: JSON.stringify(payload),
      },
    });
  } else {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: DRAFT,
        entity: draftId,
        details: JSON.stringify(payload),
      },
    });
  }

  return { success: true, draftId, savedAt: payload.savedAt };
}

export async function deleteExamDraft(user: AuthUser, body: Record<string, unknown>) {
  if (user.role !== "ADMIN" && user.role !== "TEACHER") throw new ExamError(403, "Chỉ Giáo viên và Admin có quyền xóa bản nháp.");
  const draftId = String(body.draftId || body.id || "");
  if (!draftId) throw new ExamError(400, "Thiếu mã bản nháp cần xóa.");
  await prisma.auditLog.deleteMany({
    where: { action: DRAFT, entity: draftId },
  });
  return { success: true };
}
