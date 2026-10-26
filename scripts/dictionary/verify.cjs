const {loadEnvConfig}=require('@next/env');loadEnvConfig(process.cwd());
const {PrismaClient}=require('../../src/generated/prisma');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const db=new PrismaClient();
const base=process.env.DICTIONARY_TEST_URL || 'http://localhost:3000';
(async()=>{
 const suffix=crypto.randomBytes(6).toString('hex');let admin,student,entry;const sentenceKeys=[];
 try {
  admin=await db.user.create({data:{username:'dict-qa-admin-'+suffix,name:'Dictionary QA',passwordHash:suffix,role:'ADMIN',status:'ACTIVE'}});
  student=await db.user.create({data:{username:'dict-qa-student-'+suffix,name:'Dictionary QA student',passwordHash:suffix,role:'STUDENT',status:'ACTIVE'}});
  async function login(user){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user.username,password:suffix})});assert.equal(r.status,200);const c=r.headers.getSetCookie().find(c=>c.startsWith('hsk_dictionary_session='));assert(c,'Missing signed HttpOnly session');assert(c.includes('HttpOnly'));return c.split(';')[0];}
  const adminCookie=await login(admin);const studentCookie=await login(student);
  assert.equal((await fetch(base+'/api/v1/auth/session')).status,401);
  let session=await fetch(base+'/api/v1/auth/session',{headers:{Cookie:adminCookie}});
  assert.equal(session.status,200);assert(session.headers.getSetCookie().some(c=>c.startsWith('hsk_dictionary_session=')));
  const sessionData=await session.json();assert.equal(sessionData.user.role,'ADMIN');assert.equal(sessionData.user.id,admin.id);assert(!JSON.stringify(sessionData).includes('passwordHash'));
  assert.equal((await fetch(base+'/api/v1/auth/session',{headers:{Cookie:adminCookie+'tampered'}})).status,401);
  const sentenceHeaders={Origin:base,'Content-Type':'application/json',Cookie:studentCookie};
  const sentenceBody=JSON.stringify({text:'今天学习中文。'+suffix});
  assert.equal((await fetch(base+'/api/dictionary/translate',{method:'POST',headers:{...sentenceHeaders,Cookie:''},body:sentenceBody})).status,401);
  assert.equal((await fetch(base+'/api/dictionary/translate',{method:'POST',headers:{...sentenceHeaders,Origin:'https://other.example'},body:sentenceBody})).status,403);
  for(const body of [{text:''},{text:'a'.repeat(501)},{text:'学习',targetLanguage:'en'}])assert.equal((await fetch(base+'/api/dictionary/translate',{method:'POST',headers:sentenceHeaders,body:JSON.stringify(body)})).status,400);
  for(const fixture of [{sourceText:'今天学习中文。'+suffix,targetLanguage:'vi',translatedText:'Hôm nay học tiếng Trung.'},{sourceText:'Hôm nay học tiếng Trung. '+suffix,targetLanguage:'zh',translatedText:'今天学习中文。'}]){
   const key=crypto.createHash('sha256').update(fixture.targetLanguage+'\0'+fixture.sourceText).digest('hex');
   await db.dictionarySentenceTranslation.create({data:{key,...fixture,pinyin:'jīn tiān xué xí zhōng wén.',model:'QA-only'}});sentenceKeys.push(key);
   const response=await fetch(base+'/api/dictionary/translate',{method:'POST',headers:sentenceHeaders,body:JSON.stringify({text:fixture.sourceText})});assert.equal(response.status,200);
   const output=await response.json();assert.equal(output.translation.translatedText,fixture.translatedText);assert.equal(output.translation.targetLanguage,fixture.targetLanguage);assert(!JSON.stringify(output).includes('QA-only'));assert(!JSON.stringify(output).includes('meaningViStatus'));
  }
  await db.user.update({where:{id:student.id},data:{status:'INACTIVE'}});
  assert.equal((await fetch(base+'/api/v1/auth/session',{headers:{Cookie:studentCookie}})).status,401);
  assert.equal((await fetch(base+'/api/dictionary/translate',{method:'POST',headers:sentenceHeaders,body:sentenceBody})).status,401);
  await db.user.update({where:{id:student.id},data:{status:'ACTIVE'}});
  entry=await db.dictionaryEntry.create({data:{simplified:'测试'+suffix,traditional:'測試'+suffix,pinyinNumbered:'ce4 shi4',pinyin:'cè shì',pinyinSearch:'ceshi',definitionsEn:['test'],definitionsVi:['bản nháp'],meaningViStatus:'GENERATED',meaningViSource:'QA'}});
  assert.equal((await fetch(base+'/api/admin/dictionary')).status,403);
  assert.equal((await fetch(base+'/api/admin/dictionary',{headers:{'x-user-id':admin.id}})).status,403);
  assert.equal((await fetch(base+'/api/admin/dictionary',{headers:{Cookie:studentCookie}})).status,403);
  assert.equal((await fetch(base+'/api/admin/dictionary',{headers:{Cookie:adminCookie+'tampered'}})).status,403);
  let r=await fetch(base+'/api/admin/dictionary?q='+encodeURIComponent(entry.simplified)+'&status=ALL',{headers:{Cookie:adminCookie}});assert.equal(r.status,200);let data=await r.json();assert.equal(data.items[0].meaningViStatus,'GENERATED');
  const edit={id:entry.id,revision:0,definitionsVi:['Nghĩa Việt đã sửa'],approve:true};
  const headers={Cookie:adminCookie,Origin:base,'Content-Type':'application/json'};
  assert.equal((await fetch(base+'/api/admin/dictionary',{method:'PATCH',headers:{...headers,Cookie:studentCookie},body:JSON.stringify(edit)})).status,403);
  assert.equal((await fetch(base+'/api/admin/dictionary',{method:'PATCH',headers:{...headers,Origin:'https://other.example'},body:JSON.stringify(edit)})).status,403);
  r=await fetch(base+'/api/admin/dictionary',{method:'PATCH',headers,body:JSON.stringify(edit)});assert.equal(r.status,200,await r.clone().text());data=await r.json();assert.equal(data.item.meaningViStatus,'REVIEWED');assert.equal(data.item.meaningViRevision,1);
  assert.equal((await fetch(base+'/api/admin/dictionary',{method:'PATCH',headers,body:JSON.stringify(edit)})).status,409);
  r=await fetch(base+'/api/dictionary/search?ids='+entry.id);data=await r.json();assert.deepEqual(data.items[0].definitionsVi,['Nghĩa Việt đã sửa']);assert(!JSON.stringify(data).includes('meaningViStatus'));assert(!JSON.stringify(data).includes('meaningViRevision'));assert(!JSON.stringify(data).includes('meaningViSource'));
  assert.equal(await db.auditLog.count({where:{userId:admin.id,entity:'DictionaryEntry:'+entry.id}}),1);
  for(const q of ['学习','學習','xue2 xi2','xué xí','hoc tap']){r=await fetch(base+'/api/dictionary/search?q='+encodeURIComponent(q));assert.equal(r.status,200);data=await r.json();assert(data.items.some(item=>item.simplified==='学习'),q);}
  r=await fetch(base+'/api/dictionary/search?q='+encodeURIComponent('行'));data=await r.json();assert(data.items.filter(item=>item.simplified==='行').length>=2,'Polyphonic entries lost');
  assert.equal((await fetch(base+'/api/dictionary/search?q='+'a'.repeat(81))).status,400);
  assert.equal((await fetch(base+'/api/dictionary/search?ids=-1')).status,400);
  r=await fetch(base+'/api/dictionary/strokes/'+encodeURIComponent('学'));assert.equal(r.status,200);data=await r.json();assert(data.strokes.length>0 && data.medians.length>0);
  assert.equal((await fetch(base+'/api/dictionary/strokes/a')).status,400);
  r=await fetch(base+'/api/v1/auth/logout',{method:'POST',headers:{Cookie:adminCookie}});assert(r.headers.getSetCookie().some(c=>c.includes('Max-Age=0')));
  console.log(JSON.stringify({passed:true,checks:['signed login session and refresh','revoked user rejected','admin access','student and spoofed access denied','CSRF for admin and sentence translation','authenticated cached sentence translation in both directions','sentence validation','save and approve','stale edit conflict','audit log','student JSON excludes review metadata','simplified/traditional/numbered/accented pinyin/Vietnamese search','polyphones','input validation','local stroke data','logout clears session']}));
 }finally{
  if(sentenceKeys.length)await db.dictionarySentenceTranslation.deleteMany({where:{key:{in:sentenceKeys}}});
  if(entry)await db.dictionaryEntry.delete({where:{id:entry.id}});
  for(const user of [admin,student])if(user)await db.user.delete({where:{id:user.id}});
  await db.$disconnect();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
