const {loadEnvConfig}=require('@next/env');loadEnvConfig(process.cwd());
const {PrismaClient}=require('../src/generated/prisma');const assert=require('node:assert/strict');const crypto=require('node:crypto');const db=new PrismaClient();
const base=process.env.CURRICULUM_TEST_URL||'http://localhost:3000';
(async()=>{let level,revision=0;const users=[];try{
 for(const candidate of [9,8,7,6,5,4,3])if(!await db.curriculumContent.findUnique({where:{hskLevel:candidate}})){level=candidate;break;}
 assert(level,'Need an unused HSK 3–9 level for isolated verification.');
 const suffix=crypto.randomBytes(6).toString('hex');
 async function user(role){const user=await db.user.create({data:{username:'curriculum-qa-'+role.toLowerCase()+'-'+suffix,passwordHash:suffix,name:'Curriculum QA',role,status:'ACTIVE'}});users.push(user);const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user.username,password:suffix})});assert.equal(response.status,200);return{...user,cookie:response.headers.getSetCookie().find(c=>c.startsWith('hsk_dictionary_session=')).split(';')[0]};}
 const admin=await user('ADMIN'),student=await user('STUDENT'),teacher=await user('TEACHER');
 const headers={Cookie:admin.cookie,Origin:base,'Content-Type':'application/json'};
 async function get(){const response=await fetch(base+'/api/v1/admin/curriculum?level='+level,{headers});assert.equal(response.status,200);return response.json();}
 async function save(lessons,isDeleted=false){const response=await fetch(base+'/api/v1/admin/curriculum',{method:'POST',headers,body:JSON.stringify({level,revision,lessons,isDeleted})});const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));revision=data.revision;return data;}
 assert.equal((await fetch(base+'/api/v1/admin/curriculum?level='+level)).status,403);
 assert.equal((await fetch(base+'/api/v1/admin/curriculum?level='+level,{headers:{'x-user-id':admin.id}})).status,403);
 const invalidBody=JSON.stringify({level,revision:0,lessons:[]});
 assert.equal((await fetch(base+'/api/v1/admin/curriculum',{method:'POST',headers:{...headers,Cookie:student.cookie},body:invalidBody})).status,403);
 assert.equal((await fetch(base+'/api/v1/admin/curriculum',{method:'POST',headers:{...headers,Origin:'https://other.example'},body:invalidBody})).status,403);
 const lesson={id:`hsk${level}-17`,number:17,titleZh:'你好',titleVi:'Kiểm tra lưu bền vững',pinyin:'nǐ hǎo',vocabList:[{hanzi:'你',pinyin:'nǐ',meaning:'bạn'}],grammarList:[{title:'Câu với 是',structure:'S + 是 + N',example:'我是学生。',explanation:'Giới thiệu.'}],dialogue:[{speaker:'A',zh:'你好',pinyin:'nǐ hǎo',vi:'Xin chào'}]};
 await save([lesson]);assert.equal((await get()).items[0].vocabList[0].meaning,'bạn');
 const fresh=new PrismaClient();try{assert.equal((await fresh.curriculumContent.findUnique({where:{hskLevel:level}})).lessons[0].titleVi,lesson.titleVi);}finally{await fresh.$disconnect();}
 const classroom=await db.class.create({data:{name:'Curriculum QA '+suffix,level,teacherId:teacher.id}});
 let response=await fetch(base+'/api/v1/teacher/lessons/assign',{method:'POST',headers:{...headers,Cookie:teacher.cookie},body:JSON.stringify({classId:classroom.id,lessonId:lesson.id,selectedItems:{selectedVocabs:lesson.vocabList,selectedGrammars:lesson.grammarList,selectedDialogue:lesson.dialogue}})});assert.equal(response.status,200,await response.text());assert.equal((await db.classLesson.findFirst({where:{classId:classroom.id}})).lessonNumber,17);
 response=await fetch(base+`/api/v1/classes/${classroom.id}/lessons`,{method:'POST',headers:{...headers,Cookie:teacher.cookie,'x-user-id':teacher.id},body:JSON.stringify({lessonNumber:17,selectedVocabs:lesson.vocabList,selectedGrammars:lesson.grammarList,selectedDialogue:lesson.dialogue})});assert.equal(response.status,200,await response.text());
 let data=await get();data.items[0].vocabList[0].meaning='bạn (đã sửa)';await save(data.items);data=await get();assert.equal(data.items[0].grammarList.length,1);assert.equal(data.items[0].dialogue.length,1);
 response=await fetch(base+'/api/v1/admin/curriculum',{method:'POST',headers,body:JSON.stringify({level,revision:0,lessons:[]})});assert.equal(response.status,409);
 await save([]);assert.deepEqual((await get()).items,[]);let published=await(await fetch(base+'/api/v1/curriculum?level='+level)).json();assert.deepEqual(published.items,[]);
 response=await fetch(base+`/api/v1/classes/${classroom.id}/lessons`,{headers:{Cookie:teacher.cookie,'x-user-id':teacher.id}});assert.equal(response.status,200);data=await response.json();assert.equal(data.lessons.length,1,'Existing class snapshot must remain after source deletion');assert.equal(data.lessons[0].selectedVocabs[0].hanzi,'你');assert.equal(data.lessons[0].selectedDialogue[0].zh,'你好');
 await save([],true);data=await get();assert.equal(data.isDeleted,true);assert.deepEqual(data.items,[]);
 await save([],false);data=await get();assert.equal(data.isDeleted,false);assert.deepEqual(data.items,[]);
 const parallelBody=JSON.stringify({level,revision,lessons:[lesson]});const statuses=await Promise.all([1,2].map(()=>fetch(base+'/api/v1/admin/curriculum',{method:'POST',headers,body:parallelBody}).then(response=>response.status)));assert.deepEqual(statuses.sort(),[200,409]);revision++;
 assert.equal((await get()).items.length,1);assert(await db.auditLog.count({where:{userId:admin.id,entity:`CurriculumContent:${level}`}})>=6);
 console.log(JSON.stringify({passed:true,level,checks:['signed admin only','spoofed headers denied','student denied','CSRF','database persisted through fresh client','teacher assignment reads shared curriculum','correct lesson number','partial update preserves other sections','empty curriculum stays empty','delete entire level and recreate empty','published class snapshots preserved','stale edit rejected','concurrent edits protected','audit log']}));
 }finally{if(level&&revision)await db.curriculumContent.deleteMany({where:{hskLevel:level,revision}});for(const user of users)await db.user.delete({where:{id:user.id}});await db.$disconnect();}})().catch(error=>{console.error(error);process.exitCode=1});
