import { gradeQuestion, publicQuestion, canonicalQuestionType } from "./question-content";
import { isMockAnswerCorrect } from "./mock-exam-matcher";
export const EXAM_LEVELS = [1,2,3,4,5,6,7] as const;
export const EXAM_SKILLS = ["LISTENING","READING","WRITING","TRANSLATION","SPEAKING"] as const;
export type ExamSkill = typeof EXAM_SKILLS[number];
export type ExamQuestion = { id:string; type:string; content:string; skill:ExamSkill; level:number; points:number; correctAnswer:string; explanation:string; options:unknown[]; pinyinPrompt?:string; audioUrl?:string; imageUrl?:string; editorData:Record<string,unknown>; tags:string };
export type ExamPaper = { classification?:{bands:{minScore:number;maxScore:number;label:string}[]}; createdAt?:string; customConfig?:{skills:string[];types:string[];count:number}; id:string; title:string; description:string; level:number; source:"OFFICIAL"|"CUSTOM"; durationMin:number|null; maxScore:number; passScore:number|null; questions:ExamQuestion[]; mode:"EXAM"|"PRACTICE" };
export type ExamResult = { questionId:string; manual:boolean; correct:boolean|null; earned:number|null; max:number };
export type CenterAttempt = { schemaVersion:1; paper:ExamPaper; answers:Record<string,string>; results:ExamResult[]; status:"IN_PROGRESS"|"NEEDS_GRADING"|"GRADED"; startedAt:string; expiresAt:string|null; submittedAt:string|null; score:number|null; revision:number; timedOut:boolean };
export const levelGroup=(level:number)=>level>=7?7:level;
export const levelLabel=(level:number)=>level>=7?"HSK 7–9":`HSK ${level}`;
export function skillOf(value:string):ExamSkill { const key=value.toUpperCase();return key.includes("SPEAK")?"SPEAKING":key.includes("TRANS")?"TRANSLATION":key.includes("LISTEN")?"LISTENING":key.includes("WRIT")||key.includes("GRAMMAR")?"WRITING":"READING"; }
export function questionType(value:string){return canonicalQuestionType(({multi_choice:"multiple_choice",ordering:"sentence_order",pinyin_input:"fill_blank",listening:"listening_choice"} as Record<string,string>)[value]||value);}
export const supportedTypes = new Set(["multiple_choice","listening_choice","true_false","fill_blank","listening_fill","matching","sentence_order","find_error","essay","translation","speaking","speaking_audio","audio","writing","handwriting_photo"]);
export function snapshotQuestion(raw:Record<string,unknown>,points:number):ExamQuestion {
 const editor=raw.editorData&&typeof raw.editorData==="object"&&!Array.isArray(raw.editorData)?raw.editorData as Record<string,unknown>:{};
 let options:unknown=[];try{options=typeof raw.options==="string"?JSON.parse(raw.options):raw.options||editor.options||[];}catch{}
 const type=questionType(String(raw.type||""));
 return {id:String(raw.id),type,content:String(raw.content||""),skill:skillOf(String(raw.skill||"READING")),level:Number(raw.level||1),points,correctAnswer:String(raw.correctAnswer||""),explanation:String(raw.explanation||editor.explanation||""),options:Array.isArray(options)?options:[],pinyinPrompt:String(raw.pinyinPrompt||editor.pinyin||""),audioUrl:String(raw.audioUrl||editor.audioUrl||""),imageUrl:String(raw.imageUrl||editor.imageUrl||""),editorData:{...editor,...(raw.type==="multi_choice"?{schemaVersion:2,selectionMode:"MULTIPLE"}:{})},tags:[raw.skill,raw.tags,editor.sourceContent].filter(Boolean).join(" ")};
}
export function usableQuestion(q:ExamQuestion){
 if(!supportedTypes.has(q.type)||!q.content.trim()||!Number.isFinite(q.points)||q.points<0)return false;
 const manual=q.skill==="SPEAKING"||gradeQuestion(q,"").manual;
 if(!manual&&!q.correctAnswer.trim())return false;
 if(["multiple_choice","listening_choice"].includes(q.type)&&q.options.length<2)return false;
 if(q.type==="matching"&&(!Array.isArray(q.editorData.matchingPairs)||!q.editorData.matchingPairs.length))return false;
 return true;
}
export function publicExamQuestion(q:ExamQuestion){
 const safe=publicQuestion({...q,...(q.editorData.schemaVersion===2?{schemaVersion:2}:{}),type:q.type});
 // Option metadata and editorData are never sent to a candidate.
 const options=q.options.map((option,index)=>({id:typeof option==="object"&&option&&typeof (option as Record<string,unknown>).id==="string"?String((option as Record<string,unknown>).id):String.fromCharCode(65+index),text:typeof option==="string"?option:String((option as Record<string,unknown>)?.text||(option as Record<string,unknown>)?.content||""),...(typeof option==="object"&&option&&"imageUrl" in (option as Record<string,unknown>)?{imageUrl:String((option as Record<string,unknown>).imageUrl||"")}:{})}));
 return {id:q.id,type:q.type,skill:q.skill,content:q.content,points:q.points,pinyin:q.pinyinPrompt,audioUrl:q.audioUrl,imageUrl:q.imageUrl,options,selectionMode:safe.selectionMode,errorMode:safe.errorMode,errorTokens:safe.errorTokens,blanks:safe.blanks,matchingLeftItems:safe.matchingLeftItems,matchingRightItems:safe.matchingRightItems,tokenItems:safe.tokenItems,essayMin:safe.essayMin,essayMax:safe.essayMax,translationDirection:safe.translationDirection};
}
export function paperSummary(paper:ExamPaper){return{createdAt:paper.createdAt||null,customConfig:paper.customConfig||null,id:paper.id,title:paper.title,description:paper.description,level:paper.level,source:paper.source,durationMin:paper.durationMin,maxScore:paper.maxScore,passScore:paper.passScore,questionsCount:paper.questions.length,skills:[...new Set(paper.questions.map(q=>q.skill))],mode:paper.mode};}
export function hasAnswer(answer:unknown):boolean {
 if(typeof answer!=="string"||!answer.trim())return false;
 try{const value=JSON.parse(answer);if(Array.isArray(value))return value.length>0&&value.some(item=>String(item).trim());if(value&&typeof value==="object")return Object.values(value).some(item=>String(item??"").trim());}catch{}
 return true;
}
export function scoreAttempt(attempt:CenterAttempt,now=new Date()):CenterAttempt {
 if(attempt.status!=="IN_PROGRESS")return attempt;
 const results=attempt.paper.questions.map(q=>{
  const answer=attempt.answers[q.id]||"";
  const graded=q.skill==="SPEAKING"?{manual:true,correct:false}:gradeQuestion(q,answer);
  let correct=graded.correct;
  if(!graded.manual&&q.editorData.schemaVersion!==2&&["multiple_choice","listening_choice","fill_blank","true_false"].includes(q.type)){
   const option=q.options.find(item=>typeof item==="object"&&item&&(item as Record<string,unknown>).id===answer);
   const resolved=option?String((option as Record<string,unknown>).text||(option as Record<string,unknown>).content||answer):answer;
   correct=isMockAnswerCorrect(answer,q.correctAnswer,q.options.map(option=>typeof option==="string"?option:String((option as Record<string,unknown>)?.text||"")))||resolved!==answer&&isMockAnswerCorrect(resolved,q.correctAnswer);
  }
  return {questionId:q.id,manual:graded.manual,correct:graded.manual?null:correct,earned:graded.manual?null:correct?q.points:0,max:q.points};
 });
 const weight=results.reduce((sum,row)=>sum+row.max,0),earned=results.reduce((sum,row)=>sum+(row.earned||0),0);
 return {...attempt,status:results.some(row=>row.manual)?"NEEDS_GRADING":"GRADED",results,score:weight?Math.round(earned/weight*attempt.paper.maxScore*100)/100:0,submittedAt:now.toISOString(),revision:attempt.revision+1};
}
export function finishManual(attempt:CenterAttempt,marks:Record<string,number>):CenterAttempt {
 const results=attempt.results.map(result=>{if(!result.manual)return result;const value=marks[result.questionId];if(!Number.isFinite(value)||value<0||value>result.max)throw new Error("Điểm tự luận phải nằm trong điểm tối đa của câu.");return{...result,earned:value,correct:value===result.max};});
 const weight=results.reduce((sum,row)=>sum+row.max,0),earned=results.reduce((sum,row)=>sum+(row.earned||0),0);
 return {...attempt,results,status:"GRADED",score:weight?Math.round(earned/weight*attempt.paper.maxScore*100)/100:0,revision:attempt.revision+1};
}
export function attemptSummary(id:string,attempt:CenterAttempt,now=new Date()){
 const answered=attempt.paper.questions.filter(q=>hasAnswer(attempt.answers[q.id])).length;
 const classificationLabel=attempt.status==="GRADED"?attempt.paper.classification?.bands.find(band=>Number(attempt.score)>=band.minScore&&Number(attempt.score)<=band.maxScore)?.label||null:null;
 return {classificationLabel,...paperSummary(attempt.paper),paperId:attempt.paper.id,id,status:attempt.status,answered,progress:attempt.paper.questions.length?Math.round(answered/attempt.paper.questions.length*100):0,startedAt:attempt.startedAt,submittedAt:attempt.submittedAt,score:attempt.score,remainingSec:attempt.expiresAt?Math.max(0,Math.ceil((Date.parse(attempt.expiresAt)-now.getTime())/1000)):null,result:attempt.status!=="GRADED"?"PENDING":attempt.paper.classification?(classificationLabel?"CLASSIFIED":"CLASSIFICATION_PENDING"):attempt.paper.passScore===null?"UNSET":Number(attempt.score)>=attempt.paper.passScore?"PASS":"FAIL",timedOut:attempt.timedOut};
}
export function attemptForOwner(id:string,attempt:CenterAttempt){
 const finished=attempt.status!=="IN_PROGRESS";
 return {...attemptSummary(id,attempt),revision:attempt.revision,expiresAt:attempt.expiresAt,answers:attempt.answers,serverNow:new Date().toISOString(),questions:attempt.paper.questions.map(q=>({...publicExamQuestion(q),...(finished?{correctAnswer:q.correctAnswer,explanation:q.explanation,result:attempt.results.find(row=>row.questionId===q.id)}:{})}))};
}
export function examStatistics(papers:ExamPaper[],attempts:{id:string;state:CenterAttempt}[],filter=0){
 const rows=attempts.filter(row=>!filter||levelGroup(row.state.paper.level)===filter);
 const completed=rows.filter(row=>row.state.status==="GRADED");
 const eligible=papers.filter(p=>p.source==="OFFICIAL"&&(!filter||levelGroup(p.level)===filter));
 const finishedIds=new Set(completed.filter(row=>row.state.paper.source==="OFFICIAL").map(row=>row.state.paper.id));
 const done=eligible.filter(paper=>finishedIds.has(paper.id)).length;
 const groups=new Map<string,{level:number;maxScore:number;sum:number;count:number}>();
 for(const {state}of completed){const key=`${state.paper.level}:${state.paper.maxScore}`;const group=groups.get(key)||{level:state.paper.level,maxScore:state.paper.maxScore,sum:0,count:0};group.sum+=Number(state.score);group.count++;groups.set(key,group);}
 const skills=EXAM_SKILLS.map(skill=>{const ratios=completed.flatMap(({state})=>{const questions=state.paper.questions.filter(q=>q.skill===skill),weight=questions.reduce((sum,q)=>sum+q.points,0);if(!weight)return[];const earned=questions.reduce((sum,q)=>sum+(state.results.find(r=>r.questionId===q.id)?.earned||0),0);return[earned/weight];});return{skill,count:ratios.length,percent:ratios.length?Math.round(ratios.reduce((sum,v)=>sum+v,0)/ratios.length*100):null};});
 return {done,total:eligible.length,completionPercent:eligible.length?Math.round(done/eligible.length*100):0,averages:[...groups.values()].map(group=>({level:group.level,maxScore:group.maxScore,count:group.count,average:Math.round(group.sum/group.count*100)/100})),skills};
}

export function recommendExam(papers:ExamPaper[],attempts:{id:string;state:CenterAttempt}[],level:number){
 const history=attempts.filter(row=>!level||levelGroup(row.state.paper.level)===level).sort((a,b)=>Date.parse(b.state.submittedAt||b.state.startedAt)-Date.parse(a.state.submittedAt||a.state.startedAt));
 const latest=history.find(row=>row.state.status==='GRADED')?.state;
 const weak=latest?EXAM_SKILLS.flatMap(skill=>{const questions=latest.paper.questions.filter(q=>q.skill===skill),max=questions.reduce((sum,q)=>sum+q.points,0);return max?[{skill,ratio:questions.reduce((sum,q)=>sum+(latest.results.find(r=>r.questionId===q.id)?.earned||0),0)/max}]:[];}).sort((a,b)=>a.ratio-b.ratio).filter(row=>row.ratio<1).slice(0,2).map(row=>row.skill):[];
 const candidates=papers.filter(p=>p.source==='OFFICIAL'&&(!level||levelGroup(p.level)===level)&&p.durationMin&&p.maxScore>0&&p.questions.length&&p.questions.every(usableQuestion)&&p.questions.some(q=>q.points>0));
 const active=new Set(history.filter(row=>row.state.status==='IN_PROGRESS').map(row=>row.state.paper.id));
 const count=(paper:ExamPaper)=>history.filter(row=>row.state.paper.id===paper.id).length;
 const fit=(paper:ExamPaper)=>weak.filter(skill=>paper.questions.some(q=>q.skill===skill)).length;
 const paper=candidates.filter(p=>!active.has(p.id)).sort((a,b)=>(count(a)>0?1:0)-(count(b)>0?1:0)||fit(b)-fit(a)||count(a)-count(b)||a.id.localeCompare(b.id))[0];
 return paper?{paperId:paper.id,weakSkills:weak.filter(skill=>paper.questions.some(q=>q.skill===skill)),reason:weak.length?'Ưu tiên kỹ năng còn thiếu điểm trong lượt thi đã chấm gần nhất.':history.length?'Ưu tiên đề bạn chưa làm hoặc ít luyện nhất trong cấp đang chọn.':'Bắt đầu từ một đề đã được Admin duyệt trong cấp đang chọn.'}:null;
}
