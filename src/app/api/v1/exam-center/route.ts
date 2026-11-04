import { examResponse,examJson,examBody,dashboard,getAttempt,startAttempt,writeAttempt,createCustom,publicationCandidates,publishPaper,importPaper,reviewData,saveWrong,gradingQueue,gradeManual,legacyDetail,ExamError } from "@/lib/exam-center-service";
export function GET(request:Request){return examResponse(request,async user=>{
 const params=new URL(request.url).searchParams,action=params.get('action')||'dashboard';
 const data=action==='dashboard'?await dashboard(user):action==='attempt'?await getAttempt(user,params.get('id')||''):action==='review'?await reviewData(user):action==='publications'?await publicationCandidates(user):action==='grading'?await gradingQueue(user):action==='legacy'?await legacyDetail(user,params.get('id')||''):null;
 if(data===null)throw new ExamError(400,'Yêu cầu không hợp lệ.');return examJson({success:true,data});
});}
export function POST(request:Request){return examResponse(request,async user=>{
 const body=await examBody(request);
 const data=body.action==='start'?await startAttempt(user,body):body.action==='save'?await writeAttempt(user,body):body.action==='submit'?await writeAttempt(user,body,true):body.action==='custom'?await createCustom(user,body):body.action==='publication'?await publishPaper(user,body):body.action==='importPaper'?await importPaper(user,body):body.action==='saveWrong'?await saveWrong(user,body):body.action==='grade'?await gradeManual(user,body):null;
 if(data===null)throw new ExamError(400,'Yêu cầu không hợp lệ.');return examJson({success:true,data});
},true);}
