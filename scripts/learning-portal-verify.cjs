const {loadEnvConfig}=require('@next/env');loadEnvConfig(process.cwd());
const {PrismaClient}=require('../src/generated/prisma');const assert=require('node:assert/strict'),crypto=require('node:crypto');
const db=new PrismaClient(),base=process.env.PORTAL_TEST_URL||'http://localhost:3000';
async function verify(callback,lessonExtras={}){const users=[],classIds=[],suffix=crypto.randomBytes(6).toString('hex');let level,revision=0;try{
 async function user(role,label){const row=await db.user.create({data:{username:'portal-qa-'+label+'-'+suffix,name:'Kiểm tra '+label,passwordHash:suffix,role,status:'ACTIVE'}});users.push(row);const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:row.username,password:suffix})});assert.equal(response.status,200);const cookie=response.headers.getSetCookie().find(value=>value.startsWith('hsk_dictionary_session=')).split(';')[0];return{...row,cookie};}
 const teacher=await user('TEACHER','teacher'),other=await user('TEACHER','other'),student=await user('STUDENT','student'),pending=await user('STUDENT','pending'),admin=await user('ADMIN','admin');
 async function api(actor,path,method='GET',body,status=200){const response=await fetch(base+path,{method,headers:{Cookie:actor.cookie,Origin:base,...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});const result=await response.json();assert.equal(response.status,status,path+' '+JSON.stringify(result));return result;}
 assert.equal((await fetch(base+'/api/v1/classes',{headers:{'x-user-id':teacher.id}})).status,401);
 for(const candidate of [9,8,7,6,5,4,3])if(!await db.curriculumContent.findUnique({where:{hskLevel:candidate}})){level=candidate;break;}assert(level,'Need unused HSK level for isolated test.');
 const lesson={id:'hsk'+level+'-17',number:17,titleZh:'你好',titleVi:'Bài kiểm tra đủ bốn nội dung',pinyin:'nǐ hǎo',vocabList:[{hanzi:'你好',pinyin:'nǐ hǎo',meaning:'Xin chào'}],grammarList:[{title:'Câu giới thiệu',structure:'S + 是 + N',example:'我是学生。',explanation:'Giới thiệu bản thân.'}],dialogue:[{speaker:'A',zh:'你好！',pinyin:'nǐ hǎo',vi:'Xin chào bạn!'}],phonetics:{title:'Thanh điệu',rule:'Quy tắc kiểm tra ngữ âm',examples:['nǐ hǎo']},culture:'Văn hóa chào hỏi kiểm tra',...lessonExtras};
 let result=await api(admin,'/api/v1/admin/curriculum','POST',{level,revision:0,lessons:[lesson]});revision=result.revision;
 const catalog=await api(teacher,'/api/v1/curriculum');assert.equal(catalog.levels.find(item=>item.level===level).items[0].culture,lesson.culture);
 result=await api(teacher,'/api/v1/classes','POST',{name:'Lớp HSK kiểm tra '+suffix,level,track:'HSK'},201);const classroom=result.item||result.class||result.data;const classId=classroom?.id||result.id;assert(classId,JSON.stringify(result));classIds.push(classId);
 const otherClass=await db.class.create({data:{name:'Lớp khác kiểm tra',level:1,teacherId:other.id}});classIds.push(otherClass.id);
 await db.classStudent.createMany({data:[{classId,studentId:student.id,status:'APPROVED'},{classId,studentId:pending.id,status:'PENDING'}]});
 await api(pending,'/api/v1/auth/onboarding','POST',{userId:student.id,learningMode:'CLASS',classId});assert.equal((await db.classStudent.findUnique({where:{classId_studentId:{classId,studentId:student.id}}})).status,'APPROVED');assert.equal((await db.classStudent.findUnique({where:{classId_studentId:{classId,studentId:pending.id}}})).status,'PENDING');
 await api(student,'/api/v1/classes/verify?code=HANYU-NONEXISTENT','GET',undefined,404);
 await api(other,'/api/v1/classes/'+classId+'/lessons','GET',undefined,403);
 await api(teacher,'/api/v1/classes/'+classId+'/lessons','POST',{lessonNumber:17,status:'PUBLISHED',selectedVocabs:lesson.vocabList,selectedGrammars:lesson.grammarList,hasDialogue:true,includeCulture:true});
 result=await api(student,'/api/v1/classes/'+classId+'/lessons');const content=result.lessons.find(item=>item.lessonNumber===17).content;assert.equal(content.dialogue[0].vi,lesson.dialogue[0].vi);assert.equal(content.phonetics.rule,lesson.phonetics.rule);assert.equal(content.culture,lesson.culture);assert.equal(content.vocabList.length,1);assert.equal(content.grammarList.length,1);
 await api(pending,'/api/v1/classes/'+classId+'/lessons','GET',undefined,403);
 await api(teacher,'/api/v1/classes/'+classId+'/lessons','POST',{lessonNumber:17,status:'DRAFT',selectedVocabs:[],selectedGrammars:[],hasDialogue:false,includeCulture:false});
 result=await api(student,'/api/v1/classes/'+classId+'/lessons');assert.equal(result.lessons.find(item=>item.lessonNumber===17).content,undefined);
 await api(teacher,'/api/v1/classes/'+classId+'/lessons','POST',{lessonNumber:17,status:'PUBLISHED',selectedVocabs:lesson.vocabList,selectedGrammars:lesson.grammarList,hasDialogue:true,includeCulture:true});
 await api(teacher,'/api/v1/teacher/vocabulary','POST',{items:lesson.vocabList,hskLevel:level});result=await api(other,'/api/v1/teacher/vocabulary');assert.equal(result.items.length,0);result=await api(teacher,'/api/v1/teacher/vocabulary');const word=result.items[0];assert.equal(word.meaning,'Xin chào');
 await api(other,'/api/v1/teacher/vocabulary','POST',{action:'exercise',id:word.id},404);
 const exercise=await api(teacher,'/api/v1/teacher/vocabulary','POST',{action:'exercise',id:word.id});assert.equal((await api(other,'/api/v1/questions')).items.some(item=>item.id===exercise.questionId),false);
 assert.equal((await db.curriculumContent.findUnique({where:{hskLevel:level}})).revision,revision);
 const quiz=(await api(teacher,'/api/v1/exams','POST',{title:'Đề riêng kiểm tra',questions:[{id:exercise.questionId}],status:'READY',totalScore:100},201)).item;
 assert(quiz?.id,'Quiz persisted');assert.equal((await api(other,'/api/v1/exams')).items.some(item=>item.id===quiz.id),false);
 await api(other,'/api/v1/assignments','POST',{classId:otherClass.id,title:'Thử truy cập đề riêng',quizSetId:quiz.id,dueAt:new Date(Date.now()+86400000).toISOString()},403);
 const assigned=await api(teacher,'/api/v1/assignments','POST',{classId,quizSetId:quiz.id,title:'Bài giao kiểm tra',dueAt:new Date(Date.now()+86400000).toISOString(),maxAttempts:2,durationMin:30},201);const assignment=assigned.items[0];
 const started=await api(student,'/api/v1/assignments/'+assignment.id+'/start','POST',{},201);assert.equal((await api(student,'/api/v1/assignments/'+assignment.id+'/start','POST',{},201)).attemptId,started.attemptId);
 await api(pending,'/api/v1/assignments/'+assignment.id+'/start','POST',{},403);await api(other,'/api/v1/attempts/'+started.attemptId,'GET',undefined,403);
 const before=await api(student,'/api/v1/attempts/'+started.attemptId);assert.equal(before.questions[0].correctAnswer,undefined);
 await api(student,'/api/v1/attempts/'+started.attemptId+'/submit','POST',{answers:{[exercise.questionId]:'你好'}});
 await api(student,'/api/v1/attempts/'+started.attemptId+'/submit','POST',{answers:{[exercise.questionId]:'你好'}},409);
 await api(teacher,'/api/v1/attempts/'+started.attemptId,'PATCH',{answers:[{questionId:exercise.questionId,score:80}],teacherNote:'Nhận xét đã lưu'});
 const report=(await api(teacher,'/api/v1/reports/class/'+classId)).data;assert.equal(report.summary.totalStudents,1);assert.equal(report.summary.pendingStudents,1);assert.equal(report.summary.expected,1);assert.equal(report.summary.completed,1);assert.equal(report.summary.completionRate,100);assert.equal(report.summary.averageScore,80);
 assert.equal((await api(student,'/api/v1/reports/me')).data.students.length,1);assert.equal((await api(other,'/api/v1/reports/overview')).data.summary.totalStudents,0);
 // Repeated completed attempts must not inflate completion count.
 await db.attempt.create({data:{assignmentId:assignment.id,studentId:student.id,status:'GRADED',score:20,maxScore:100,submittedAt:new Date()}});assert.equal((await api(teacher,'/api/v1/reports/class/'+classId)).data.summary.completed,1);
 const bytes=Buffer.from('Tài liệu lớp thử nghiệm — nội dung thật\n你好');const form=new FormData();form.set('title','Tài liệu kiểm tra');form.set('file',new Blob([bytes],{type:'text/plain'}),'bai-hoc.txt');form.append('classIds',classId);
 result=await api(teacher,'/api/v1/materials','POST',form,201);const material=result.item;assert(material?.id,JSON.stringify(result));
 const download=await fetch(base+'/api/v1/materials/'+material.id+'/file',{headers:{Cookie:student.cookie}});assert.equal(download.status,200);assert.deepEqual(Buffer.from(await download.arrayBuffer()),bytes);
 for(const actor of [pending,other])await api(actor,'/api/v1/materials/'+material.id+'/file','GET',undefined,403);
 await api(teacher,'/api/v1/materials/'+material.id,'PATCH',{classIds:[]});await api(student,'/api/v1/materials/'+material.id+'/file','GET',undefined,403);await api(teacher,'/api/v1/materials/'+material.id,'PATCH',{classIds:[classId]});
 const schedule={classId,title:'Lịch tuần kiểm tra',startDate:'2026-10-26',endDate:'2026-12-31',weekdays:[1,3,5],startTime:'18:00',endTime:'19:00'};
 const parallel=await Promise.all([0,1].map(()=>fetch(base+'/api/v1/schedules',{method:'POST',headers:{Cookie:teacher.cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify(schedule)})));assert.deepEqual(parallel.map(r=>r.status).sort(),[201,409]);const series=await parallel.find(r=>r.status===201).json();
 result=await api(student,'/api/v1/schedules?classId='+classId+'&from=2026-11-02&to=2026-11-08');assert.equal(result.items.length,3);assert.equal(result.rules.length,0);
 await api(teacher,'/api/v1/schedules','PATCH',{id:series.item.id,originalDate:'2026-11-02',date:'2026-11-03',startTime:'20:00',endTime:'21:00',cancelled:false,note:'Có việc bận',revision:1,exceptionRevision:0});
 await api(teacher,'/api/v1/schedules','PATCH',{id:series.item.id,originalDate:'2026-11-02',date:'2026-11-03',startTime:'20:00',endTime:'21:00',revision:1,exceptionRevision:0},409);
 result=await api(student,'/api/v1/schedules?classId='+classId+'&from=2026-11-02&to=2026-11-08');assert.deepEqual(result.items.map(item=>item.date),['2026-11-03','2026-11-04','2026-11-06']);
 await api(teacher,'/api/v1/schedules','PATCH',{id:series.item.id,originalDate:'2026-11-04',date:'2026-11-04',startTime:'18:00',endTime:'19:00',cancelled:true,revision:1,exceptionRevision:0});
 assert.equal((await api(student,'/api/v1/schedules?classId='+classId+'&from=2026-11-09&to=2026-11-15')).items.filter(item=>!item.cancelled).length,3);
 await api(student,'/api/v1/schedules','POST',schedule,403);
 const fresh=new PrismaClient();try{assert.equal((await fresh.teachingMaterial.findUnique({where:{id:material.id}})).byteSize,bytes.length);assert.equal((await fresh.classLesson.findFirst({where:{classId}})).content.culture,lesson.culture);assert.equal((await fresh.scheduleException.count({where:{scheduleId:series.item.id}})),2);}finally{await fresh.$disconnect();}
 if(callback)await callback({teacher,other,student,pending,admin,classId,level,api,suffix});
 console.log('Portal verification passed: scopes, four lesson sections, private vocabulary/questions/quizzes, durable files, weekly recurrence/concurrency, per-occurrence changes, persisted grading and real reports.');
 }finally{const ids=users.map(item=>item.id);await db.class.deleteMany({where:{teacherId:{in:ids}}});await db.quizSet.deleteMany({where:{teacherId:{in:ids}}});await db.question.deleteMany({where:{teacherId:{in:ids}}});await db.user.deleteMany({where:{id:{in:ids}}});if(level&&revision)await db.curriculumContent.deleteMany({where:{hskLevel:level,revision}});await db.$disconnect();}}
module.exports={verify,base};if(require.main===module)verify().catch(error=>{console.error(error);process.exitCode=1;});
