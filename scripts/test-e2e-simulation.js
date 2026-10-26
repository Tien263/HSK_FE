// Real HTTP journeys. Login cookies, API contracts and cleanup match the application.
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('../src/generated/prisma');
const strict=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const baseUrl=(process.env.BASE_URL||process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const db=new PrismaClient();
async function runTests(){
 const suffix=randomBytes(8).toString('hex'),prefix='e2e_ci_'+suffix,password=randomBytes(20).toString('hex');
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
  if(teacherId){await db.teachingMaterial.deleteMany({where:{teacherId}});await db.class.deleteMany({where:{teacherId}});}
  await db.user.deleteMany({where:{OR:[{id:{in:userIds}},{username:{in:usernames}}]}});await db.$disconnect();console.log('Temporary E2E accounts, class and files cleaned up.');
 }
}
runTests().catch(error=>{console.error('E2E failed:',error.message);process.exitCode=1;});
