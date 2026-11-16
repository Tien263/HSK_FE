// Real HTTP journeys. Login cookies, API contracts and cleanup match the application.
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('../src/generated/prisma');
const strict=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const baseUrl=(process.env.BASE_URL||process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const db=new PrismaClient();
async function runTests(){
 const suffix=randomBytes(8).toString('hex'),prefix='e2e_ci_'+suffix,password=randomBytes(20).toString('hex');
 const examTitle='E2E HSK publication '+suffix;
 const userIds=[],usernames=[prefix+'_teacher',prefix+'_student',prefix+'_provisioned'];let teacherId,passed=0;
 function check(condition,label){strict.ok(condition,label);passed++;console.log('✅ [PASS] '+label);}
 async function request(actor,path,method='GET',body,status=200){
  const response=await fetch(baseUrl+path,{method,headers:{Origin:baseUrl,...(actor?.cookie?{Cookie:actor.cookie}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  let data;try{data=await response.json();}catch{throw new Error(method+' '+path+': server did not return JSON (HTTP '+response.status+').');}
  strict.equal(response.status,status,method+' '+path+': '+(data.message||'unexpected HTTP status'));
  if(status<400)strict.notEqual(data.success,false,method+' '+path+': '+data.message);
  if(path==="/api/v1/auth/register")data.sessionCookie=response.headers.getSetCookie().find(value=>value.startsWith("hsk_dictionary_session="))?.split(";")[0];
  return data;
 }
 async function login(username){
  const response=await fetch(baseUrl+'/api/v1/auth/login',{method:'POST',headers:{Origin:baseUrl,'Content-Type':'application/json'},body:JSON.stringify({username,password}),signal:AbortSignal.timeout(30000)});
  const data=await response.json();strict.equal(response.status,200,'Login failed: '+(data.message||''));strict.ok(data.user?.id,'Login response is missing user');
  const cookie=response.headers.getSetCookie().find(value=>value.startsWith('hsk_dictionary_session='))?.split(';')[0];strict.ok(cookie,'Login did not issue the signed session cookie');return{...data.user,cookie};
 }
 console.log('=== REAL STUDENT & TEACHER E2E ===');
 try{
  console.log('\n--- Homepage ---');
  const home=await fetch(baseUrl,{signal:AbortSignal.timeout(30000)});check(home.status===200,'Homepage returns HTTP 200');const html=await home.text();for(const text of ['Học tiếng Trung','HSK 3.0','Hai hình thức học','Lộ trình học','Luyện tập'])check(html.includes(text),'Homepage contains '+text);
  // The only direct fixture write: a unique teacher, never a shared demo account.
  const fixture=await db.user.create({data:{username:usernames[0],name:'E2E teacher',passwordHash:password,role:'TEACHER',status:'ACTIVE'}});teacherId=fixture.id;userIds.push(fixture.id);
  const teacher=await login(fixture.username);check(teacher.role==='TEACHER','Teacher authenticates and receives a session');
  const classroom=(await request(teacher,'/api/v1/classes','POST',{name:'E2E HSK 2 '+suffix,level:2,description:'Isolated automated test class'},201)).item;
  check(!!classroom?.id&&!!classroom?.code,'Teacher creates an actual class with its generated join code');
  console.log('\n--- Student journey ---');
  const registered=await request(null,'/api/v1/auth/register','POST',{name:'E2E student',username:usernames[1],email:usernames[1]+'@example.com',password,role:'STUDENT'});strict.ok(registered.user?.id,'Registration response is missing user');userIds.push(registered.user.id);check(registered.user.role==='STUDENT','Student registration succeeds');
  check(!!registered.sessionCookie,'Registration establishes a signed session for the onboarding page');const student={...registered.user,cookie:registered.sessionCookie};
  await request(null,'/api/v1/auth/onboarding','POST',{username:student.username,learningMode:'SELF'},401);check(true,'Onboarding rejects unsigned identity claims');
  const onboarding=await request(student,'/api/v1/auth/onboarding','POST',{learningMode:'CLASS',mainTrack:'hsk',currentLevel:'intermediate',dailyTime:30,classCode:classroom.code,classId:classroom.id});
  check(onboarding.profile?.enrolledClass?.id===classroom.id&&onboarding.profile.enrolledClass.status==='PENDING'&&onboarding.profile.hskLevel===2,'Onboarding saves preferences and requests the real class');
  await request(teacher,'/api/v1/classes/'+classroom.id+'/students','PATCH',{studentId:student.id,action:'APPROVE'});
  const loggedIn=await login(registered.user.username);check(loggedIn.role==='STUDENT','Student login authentication also succeeds');
  const summary=await request(loggedIn,'/api/v1/my/summary');check(summary.data?.student?.username===student.username&&summary.data.student.currentHskLevel===2,'Authenticated summary returns this student and saved HSK level');
  const vocab=await request(student,'/api/v1/my/vocab-review/today?username='+encodeURIComponent(student.username));check(Array.isArray(vocab.items),'Student vocabulary review endpoint returns a list');
  const wrong=await request(student,'/api/v1/my/wrong-questions?username='+encodeURIComponent(student.username));check(Array.isArray(wrong.items),'Student wrong-question notebook returns a list');
  const publication=(await request(teacher,'/api/v1/exam-center','POST',{
   action:'importPaper',level:1,title:examTitle,durationMin:15,questions:[
    {type:'listening_choice',skill:'LISTENING',groupId:'listening',groupType:'listening_choice_abc',audioUrl:'/test-listening.mp3',options:['去学校','回家'],correctAnswer:'A',points:0},
    {type:'essay',skill:'WRITING',content:'写短文',points:0,
     explanation:'Giải thích từ vựng: 文章 nghĩa là bài văn.\nGiải thích ngữ pháp: Mẫu 比 dùng để so sánh.'},
   ],
   hskkExam:{title:'E2E oral',level:'HSKK_BEGINNER',durationMin:5,groups:[
    {id:'oral',title:'Khẩu ngữ',questions:[{id:'oral1',type:'speaking_prompt',content:'请介绍你自己。',points:2}]},
   ]},
  })).data;
  check(!!publication?.paperId&&publication.useDefaultPoints,'Teacher publishes an HSK exam with shared audio and default points');
  const attempt=(await request(student,'/api/v1/exam-center','POST',{
   action:'start',paperId:publication.paperId,requestId:require('node:crypto').randomUUID(),
  })).data;
  check(attempt.questions.length===2&&attempt.questions[0].audioUrl==='/test-listening.mp3'&&attempt.maxScore===2,'Student can start the newly published HSK exam');
  const essayId=attempt.questions[1].id;
  await request(student,'/api/v1/exam-center','POST',{action:'submit',id:attempt.id,revision:attempt.revision,answers:{[attempt.questions[0].id]:'A',[essayId]:'我的文章'}});
  const audio='GkXfow==';
  const recording=(await request(student,'/api/v1/exam-center','POST',{
   action:'saveHskkRecording',id:attempt.id,questionId:'oral1',audio:'data:audio/webm;codecs=opus;base64,'+audio,
  })).data;
  const spoken=(await request(student,'/api/v1/exam-center','POST',{
   action:'submitHskk',id:attempt.id,recordings:{oral1:recording.recordingId},
  })).data;
  const queue=(await request(teacher,'/api/v1/exam-center?action=grading')).data;
  const question=queue.find(row=>row.id===attempt.id&&row.kind==='hskk')?.manualQuestions.find(row=>row.skill==='SPEAKING');
  check(spoken.hskkSubmittedAt&&question?.id&&queue.find(row=>row.id===attempt.id&&row.kind==='hsk')?.manualQuestions.some(row=>row.id===essayId),'HSKK and HSK appear as separate grading entries under the same attempt');
  const playback=await fetch(baseUrl+question.answer,{headers:{Cookie:teacher.cookie,Range:'bytes=0-1'},signal:AbortSignal.timeout(30000)});
  check(playback.status===206&&Buffer.from(await playback.arrayBuffer()).equals(Buffer.from(audio,'base64').subarray(0,2)),'Teacher can fetch the recording for playback');
  await request(teacher,'/api/v1/exam-center','POST',{action:'grade',kind:'hskk',id:attempt.id,
   marks:{[question.id]:1.5},feedback:{[question.id]:'Luyện thêm thanh điệu.'},
  });
  const partial=(await request(student,'/api/v1/exam-center?action=attempt&id='+attempt.id)).data;
  check(partial.status==='NEEDS_GRADING'&&partial.hskkResult.status==='GRADED','HSKK is graded while HSK is still pending');
  const gradeHsk=()=>request(teacher,'/api/v1/exam-center','POST',{action:'grade',kind:'hsk',id:attempt.id,
   marks:{[essayId]:0.5},feedback:{[essayId]:'Viết rõ ý.'},
  });
  if(process.env.HSK_BROWSER_TEST==='1'||process.env.GITHUB_ACTIONS==='true'){
   const {checkExamBrowser}=await import('./exam-center-browser.mjs');
   await checkExamBrowser({baseUrl,cookie:student.cookie,attemptId:attempt.id,gradeHsk});
  }else await gradeHsk();
  const evaluated=(await request(student,'/api/v1/exam-center?action=attempt&id='+attempt.id)).data;
  const evaluatedSpeaking=evaluated.questions.find(row=>row.id===question.id);
  check(evaluated.hskkScore.earned===1.5&&evaluatedSpeaking.result.feedback==='Luyện thêm thanh điệu.'&&evaluated.score===1.5&&
   evaluated.questions.find(row=>row.id===essayId).result.feedback==='Viết rõ ý.','Student sees HSKK and essay feedback alongside both scores');
  const review=(await request(student,'/api/v1/exam-center?action=review')).data;
  check(review.vocabulary.some(row=>row.title==='文章 nghĩa là bài văn.'&&row.attemptId===attempt.id)&&
   review.grammar.some(row=>row.title==='Mẫu 比 dùng để so sánh.'&&row.attemptId===attempt.id),'Labelled explanations populate both review tabs');
  console.log('\n--- Teacher journey ---');
  const overview=await request(teacher,'/api/v1/reports/overview');check(overview.data?.summary?.totalStudents===1,'Teacher report counts the actual approved student');
  const spoof=await fetch(baseUrl+'/api/v1/classes',{headers:{'x-user-id':teacher.id},signal:AbortSignal.timeout(30000)});check(spoof.status===401,'Spoofed x-user-id cannot replace the login cookie');
  await request(teacher,'/api/v1/classes/'+classroom.id+'/students','POST',{name:'E2E provisioned student',username:usernames[2],password},201);
  const members=(await request(teacher,'/api/v1/classes/'+classroom.id+'/students')).items;
  const provisioned=members.find(row=>row.username===usernames[2]);check(!!provisioned?.id,'Teacher provisions a student into the owned class');userIds.push(provisioned.id);
  const fileBytes=Buffer.from('E2E material: real uploaded bytes\n你好\n','utf8'),form=new FormData();form.set('title','E2E material '+suffix);form.set('description','Temporary file for upload/download verification');form.set('file',new Blob([fileBytes],{type:'text/plain'}),'lesson.txt');form.append('classIds',classroom.id);
  const material=(await request(teacher,'/api/v1/materials','POST',form,201)).item;check(!!material?.id&&material.byteSize===fileBytes.length,'Teacher uploads an actual file using multipart/form-data');
  const listed=await request(teacher,'/api/v1/materials?classId='+classroom.id);check(listed.items.some(row=>row.id===material.id),'Uploaded material is listed for the class');
  const download=await fetch(baseUrl+'/api/v1/materials/'+material.id+'/file',{headers:{Cookie:student.cookie},signal:AbortSignal.timeout(30000)});strict.equal(download.status,200);strict.deepEqual(Buffer.from(await download.arrayBuffer()),fileBytes);check(true,'Approved student downloads the original file bytes');
  await request(teacher,'/api/v1/materials/'+material.id,'DELETE');const after=await request(teacher,'/api/v1/materials?classId='+classroom.id);check(!after.items.some(row=>row.id===material.id),'Deleted material stays removed from the class');
  await request(teacher,'/api/v1/classes/'+classroom.id,'DELETE');check(!(await request(teacher,'/api/v1/classes')).items.some(row=>row.id===classroom.id),'Teacher deletes the temporary class');
  console.log('\n=== '+passed+'/'+passed+' CHECKS PASSED ===');
 }finally{
  // Cleanup runs on failure as well; touch only IDs/usernames created by this run.
  if(teacherId){
   const paper=await db.quizSet.findFirst({where:{teacherId,title:examTitle},select:{id:true,questions:{select:{questionId:true}}}});
   if(paper){
    await db.auditLog.deleteMany({where:{entity:paper.id,action:{in:['EXAM_CENTER_PUBLICATION','EXAM_CENTER_ATTEMPT']},userId:{in:userIds}}});
    await db.quizSet.delete({where:{id:paper.id}});
    await db.question.deleteMany({where:{id:{in:paper.questions.map(row=>row.questionId)}}});
   }
   await db.auditLog.deleteMany({where:{userId:{in:userIds},action:'EXAM_CENTER_HSKK_RECORDING'}});
   await db.teachingMaterial.deleteMany({where:{teacherId}});await db.class.deleteMany({where:{teacherId}});
  }
  await db.user.deleteMany({where:{OR:[{id:{in:userIds}},{username:{in:usernames}}]}});await db.$disconnect();console.log('Temporary E2E accounts, class and files cleaned up.');
 }
}
runTests().catch(error=>{console.error('E2E failed:',error);process.exitCode=1;});
