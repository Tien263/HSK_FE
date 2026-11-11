const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
const core=require(path.resolve('src/lib/exam-center-core.ts'));
const actors={a:{id:'a',name:'A',username:'a',role:'STUDENT',status:'ACTIVE',mustChangePassword:false},b:{id:'b',name:'B',username:'b',role:'STUDENT',status:'ACTIVE',mustChangePassword:false},admin:{id:'admin',name:'Admin',role:'ADMIN',status:'ACTIVE',mustChangePassword:false}};
const rawQuestion=(id,extra={})=>({id,type:'single_choice',content:'Chọn nghĩa '+id,skill:'READING',level:1,correctAnswer:'B',explanation:'Lời giải riêng '+id,options:JSON.stringify(['甲','乙']),editorData:null,tags:'vocab:你好',...extra});
function fixture(){
 let actor=actors.a,conflict=false;
 const audit=[],legacy=[{id:'legacy-a',studentId:'a',score:100,maxScore:200,status:'GRADED',startedAt:new Date('2026-11-01T17:00:00Z'),submittedAt:new Date('2026-11-01T17:10:00Z'),teacherNote:'Chưa đạt chuẩn',assignment:{title:'Đề cũ',quizSet:{id:'off1',hskLevel:1}},answers:[{id:'ans',question:rawQuestion('legacy-question'),userAnswer:'A',scoreEarned:0}]}];
 const sets=[
  {id:'off1',title:'Cùng tên',description:'Đề Admin',hskLevel:1,totalScore:200,status:'READY',mode:'MOCK_EXAM',teacherId:'admin',teacher:{name:'Admin',role:'ADMIN'},assignments:[{durationMin:30}],questions:[{points:1,orderIndex:1,question:rawQuestion('q1')},{points:1,orderIndex:2,question:rawQuestion('q2',{type:'true_false',skill:'LISTENING',correctAnswer:'true',audioUrl:'/audio.mp3'})}]},
  {id:'off2',title:'Cùng tên',hskLevel:1,totalScore:100,status:'READY',mode:'EXAM',teacherId:'admin',teacher:{name:'Admin',role:'ADMIN'},assignments:[{durationMin:20}],questions:[{points:10,orderIndex:1,question:rawQuestion('q3',{correctAnswer:'甲',options:JSON.stringify([{id:'custom-A',text:'甲',isCorrect:true,explanation:'SECRET'},{id:'custom-B',text:'乙',correct:false}])})}]},
  {id:'teacher',title:'Chưa được duyệt',hskLevel:1,totalScore:200,status:'READY',mode:'EXAM',teacherId:'teacher',teacher:{name:'Teacher',role:'TEACHER'},assignments:[{durationMin:45}],questions:[{points:10,question:rawQuestion('unapproved')}]},
  {id:'draft',title:'Nháp',hskLevel:1,totalScore:200,status:'DRAFT',mode:'EXAM',teacher:{role:'ADMIN'},assignments:[{durationMin:45}],questions:[{points:10,question:rawQuestion('draft-q')}]},
  {id:'manual',title:'Tự luận nâng cao',hskLevel:8,totalScore:300,status:'READY',mode:'MOCK_EXAM',teacherId:'admin',teacher:{name:'Admin',role:'ADMIN'},assignments:[{durationMin:60}],questions:[{points:5,question:rawQuestion('essay',{type:'essay',skill:'WRITING',level:8,correctAnswer:'Bài mẫu',editorData:{schemaVersion:2,status:'READY',rubric:'Tiêu chí chấm tay',sampleAnswer:'SECRET SAMPLE'}})}]},
 ];
 const wrong=[{id:'w-a',studentId:'a',wrongCount:3,consecutiveRight:0,question:rawQuestion('old-wrong',{skill:'GRAMMAR',tags:'grammar:比字句',editorData:{grammarRule:'比字句'}})},{id:'w-b',studentId:'b',wrongCount:8,consecutiveRight:0,question:rawQuestion('private-b')}];
 const matches=(row,where={})=>Object.entries(where).every(([key,value])=>key==='status'&&value&&typeof value==='object'?row.status!==value.not:row[key]===value);
 const db={quizSet:{findMany:async({where})=>sets.filter(set=>(!where.status||set.status===where.status)&&(!where.mode||where.mode.in.includes(set.mode))),findFirst:async({where})=>sets.find(set=>set.id===where.id&&set.status===where.status)||null},auditLog:{findMany:async({where,include})=>audit.filter(row=>matches(row,where)).slice().reverse().map(row=>({...row,...(include?.user?{user:{name:row.userId}}:{})})),findFirst:async({where})=>{const row=audit.find(row=>matches(row,where));return row?{...row}:null;},create:async({data})=>{if(data.id&&audit.some(row=>row.id===data.id))throw new Error('duplicate');const row={id:data.id||'log-'+(audit.length+1),createdAt:new Date(),...data};audit.push(row);return row;},updateMany:async({where,data})=>{if(conflict){conflict=false;return{count:0};}const row=audit.find(row=>matches(row,where));if(!row)return{count:0};Object.assign(row,data);return{count:1};},upsert:async({where,create,update})=>{const row=audit.find(row=>row.id===where.id);if(row){Object.assign(row,update);return row;}audit.push({...create,createdAt:new Date()});return create;}},attempt:{findMany:async({where})=>legacy.filter(row=>row.studentId===where.studentId),findFirst:async({where})=>legacy.find(row=>row.id===where.id&&row.studentId===where.studentId&&row.status!=='IN_PROGRESS')||null},wrongQuestion:{findMany:async({where})=>wrong.filter(row=>row.studentId===where.studentId&&row.consecutiveRight<where.consecutiveRight.lt)}};
 db.quizSet.create=async({data})=>{
  const {questions,...fields}=data;
  assert.ok(Number.isInteger(fields.totalScore));
  const set={...fields,id:`imported-${sets.length}`,createdAt:new Date(),teacher:{role:'ADMIN',name:'Admin'},assignments:[],
   questions:questions.create.map(({orderIndex,points,question},index)=>({
    orderIndex,points,question:{...question.create,id:`imported-q-${sets.length}-${index}`}
   }))};
  sets.push(set);
  return set;
 };
 db.$transaction=async callback=>callback(db);
 db.auditLog.findFirst=async({where,orderBy})=>{
  const row=(orderBy?audit.slice().reverse():audit).find(row=>matches(row,where));
  return row?{...row}:null;
 };
 const filename=path.resolve('src/lib/exam-center-service.ts'),loaded=new Module(filename,module);loaded.filename=filename;loaded.paths=Module._nodeModulePaths(path.dirname(filename));loaded.require=name=>name==='./prisma'?{prisma:db}:name==='./auth-server'?{getAuthUser:async()=>actor}:name==='./exam-center-core'?core:Module.prototype.require.call(loaded,name);loaded._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
 return{service:loaded.exports,audit,sets,legacy,wrong,actor(value){actor=value;},conflict(){conflict=true;}};
}
let serial=0;const requestId=()=>`00000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
const rejectStatus=(promise,status)=>assert.rejects(promise,error=>error.status===status);
const start=(f,paperId='off1',extra={})=>f.service.startAttempt(actors.a,{paperId,requestId:requestId(),...extra});
test('anonymous, locked and password-change sessions are denied before protected data access',async()=>{
 const f=fixture();for(const actor of [null,{...actors.a,status:'LOCKED'},{...actors.a,mustChangePassword:true}]){f.actor(actor);let called=false;const response=await f.service.examResponse(new Request('https://hanyu.test/api?studentId=a',{headers:{'x-user-id':'a'}}),async()=>{called=true;return Response.json({});});assert.equal(response.status,actor?.mustChangePassword?403:401);assert.equal(called,false);}assert.equal(f.audit.length,0);
});
test('foreign-origin writes and body role spoofing cannot publish',async()=>{
 const f=fixture();const response=await f.service.examResponse(new Request('https://hanyu.test/api',{method:'POST',headers:{origin:'https://attacker.test','content-type':'application/json'},body:'{}'}),async()=>{throw new Error('should not execute');},true);assert.equal(response.status,403);await rejectStatus(f.service.publishPaper(actors.a,{paperId:'teacher',role:'ADMIN',durationMin:30,passScore:120}),403);assert.equal(f.audit.length,0);
});
test('catalog counts published Admin papers, actual duration and advanced 7–9 grouping',async()=>{
 const f=fixture(),data=await f.service.dashboard(actors.a);assert.deepEqual(data.papers.map(p=>p.id),['off1','off2','manual']);assert.equal(data.levels.find(row=>row.level===1).count,2);assert.equal(data.levels.find(row=>row.level===1).durationMin,20);assert.equal(data.levels.find(row=>row.level===1).durationMax,30);assert.equal(data.levels.find(row=>row.level===7).count,1);assert.ok(data.bank.find(row=>row.level===1).count===3);assert.ok(!JSON.stringify(data).includes('Lời giải riêng'));
});
test('attempt identity differs from paper identity and active payload strips every answer key',async()=>{
 const f=fixture(),attempt=await start(f,'off2',{studentId:'b',score:9999,role:'ADMIN'});assert.ok(attempt.id.startsWith('exam_'));assert.equal(attempt.paperId,'off2');assert.notEqual(attempt.id,attempt.paperId);assert.equal(f.audit[0].userId,'a');assert.equal(attempt.score,null);const text=JSON.stringify(attempt.questions);for(const field of ['correctAnswer','isCorrect','correctChoices','explanation','editorData','rubric','sampleAnswer','transcript'])assert.ok(!text.includes('"'+field+'"'),field);assert.deepEqual(attempt.questions[0].options,[{id:'custom-A',text:'甲'},{id:'custom-B',text:'乙'}]);
});
test('sharing an attempt ID or forging studentId never grants another account access',async()=>{
 const f=fixture(),attempt=await start(f);await rejectStatus(f.service.getAttempt(actors.b,attempt.id),404);await rejectStatus(f.service.writeAttempt(actors.b,{id:attempt.id,studentId:'a',answers:{q1:'B'},revision:0},true),404);const other=await f.service.startAttempt(actors.b,{paperId:'off1',requestId:requestId()});assert.notEqual(other.id,attempt.id);assert.equal(f.audit.find(row=>row.id===other.id).userId,'b');
});
test('start requests are idempotent and a repeated open resumes the same active attempt',async()=>{
 const f=fixture(),id=requestId(),first=await f.service.startAttempt(actors.a,{paperId:'off1',requestId:id});const second=await f.service.startAttempt(actors.a,{paperId:'off1',requestId:id});const third=await start(f);assert.equal(first.id,second.id);assert.equal(first.id,third.id);assert.equal(f.audit.length,1);
});
test('snapshotted answers stay canonical when a bank question changes later',async()=>{
 const f=fixture(),attempt=await start(f);f.sets[0].questions[0].question.correctAnswer='A';const result=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{q1:'B',q2:'true'},score:9999,totalScore:9999},true);assert.equal(result.score,200);assert.equal(result.maxScore,200);assert.equal(result.questions[0].correctAnswer,'B');const again=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{q1:'A'},score:0},true);assert.equal(again.score,200);
});
test('draft saves do not grade and stale or foreign answers are rejected',async()=>{
 const f=fixture(),attempt=await start(f);await rejectStatus(f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{foreign:'B'}}),400);const saved=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{q1:'B'},status:'GRADED',score:200});assert.equal(saved.status,'IN_PROGRESS');assert.equal(saved.score,null);assert.equal(saved.answered,1);await rejectStatus(f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{q1:'A'}}),409);f.conflict();await rejectStatus(f.service.writeAttempt(actors.a,{id:attempt.id,revision:saved.revision,answers:{q1:'A'}}),409);
});
test('expired exam ignores late edits, cannot extend its clock, and grades saved responses only',async()=>{
 const f=fixture(),attempt=await start(f);const row=f.audit.find(row=>row.id===attempt.id),state=JSON.parse(row.details);state.answers={q1:'A'};state.expiresAt=new Date(Date.now()-1000).toISOString();row.details=JSON.stringify(state);const result=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:state.revision,answers:{q1:'B',q2:'true'},expiresAt:new Date(Date.now()+3600000).toISOString(),score:200},true);assert.equal(result.score,0);assert.equal(result.timedOut,true);assert.deepEqual(result.answers,{q1:'A'});
});
test('custom papers use only approved filtered questions and remain private',async()=>{
 const f=fixture();await rejectStatus(f.service.createCustom(actors.a,{requestId:requestId(),title:'Thiếu câu',level:1,skills:['READING'],types:['multiple_choice'],count:99,durationMin:15,mode:'EXAM'}),409);assert.equal(f.audit.length,0);const paper=await f.service.createCustom(actors.a,{requestId:requestId(),title:'Cá nhân',level:1,skills:['READING'],types:['multiple_choice'],count:2,durationMin:15,mode:'PRACTICE'});assert.equal(paper.source,'CUSTOM');assert.equal(paper.questionsCount,2);const attempt=await start(f,paper.id);assert.equal(attempt.expiresAt,null);const state=JSON.parse(f.audit.find(row=>row.id===attempt.id).details);assert.ok(state.paper.questions.every(q=>['q1','q3'].includes(q.id)));await rejectStatus(f.service.startAttempt(actors.b,{requestId:requestId(),paperId:paper.id}),404);
});
test('Admin approval adds a teacher paper with configured duration and pass threshold',async()=>{
 const f=fixture();await f.service.publishPaper(actors.admin,{paperId:'teacher',durationMin:42,passScore:123});const papers=await f.service.officialPapers();assert.equal(papers.find(p=>p.id==='teacher').durationMin,42);assert.equal(papers.find(p=>p.id==='teacher').passScore,123);await f.service.publishPaper(actors.admin,{paperId:'teacher',durationMin:42,passScore:123,approved:false});assert.equal((await f.service.officialPapers()).find(p=>p.id==='teacher'),undefined);
});
test('manual answers wait for grading; students cannot grade and Admin marks are bounded',async()=>{
 const f=fixture(),attempt=await start(f,'manual');const result=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{essay:'Bài viết của tôi'}},true);assert.equal(result.status,'NEEDS_GRADING');assert.equal((await f.service.dashboard(actors.a)).statistics.find(row=>row.level===7).averages.length,0);await rejectStatus(f.service.gradeManual(actors.a,{id:attempt.id,marks:{essay:5},role:'ADMIN'}),403);await rejectStatus(f.service.gradeManual(actors.admin,{id:attempt.id,marks:{essay:6}}),400);await f.service.gradeManual(actors.admin,{id:attempt.id,marks:{essay:2.5}});const graded=await f.service.getAttempt(actors.a,attempt.id);assert.equal(graded.status,'GRADED');assert.equal(graded.score,150);assert.equal(graded.maxScore,300);
});
test('statistics retain separate level/scale averages and normalize skill ratios per attempt',()=>{
 const q=core.snapshotQuestion(rawQuestion('q'),10),paper={id:'p',title:'P',description:'',source:'OFFICIAL',level:1,durationMin:30,maxScore:200,passScore:null,questions:[q],mode:'EXAM'};
 const state=(id,level,maxScore,score,earned,max)=>({id,state:{schemaVersion:1,paper:{...paper,id,level,maxScore,questions:[{...q,points:max}]},answers:{},results:[{questionId:'q',manual:false,correct:true,earned,max}],status:'GRADED',startedAt:new Date().toISOString(),score}});
 const rows=[state('p',1,200,100,5,10),state('p',1,200,200,10,10),state('other',1,100,100,2,2),state('advanced',3,300,240,8,10)];const stats=core.examStatistics([paper],rows,1);assert.equal(stats.done,1);assert.equal(stats.completionPercent,100);assert.deepEqual(stats.averages.map(row=>[row.level,row.maxScore,row.average]),[[1,200,150],[1,100,100]]);assert.equal(stats.skills.find(row=>row.skill==='READING').percent,83);assert.equal(stats.skills.find(row=>row.skill==='SPEAKING').percent,null);
});
test('review and legacy results are owner-scoped and topic counts use recorded metadata',async()=>{
 const f=fixture(),review=await f.service.reviewData(actors.a);assert.equal(review.wrong.length,1);assert.equal(review.wrong[0].question.id,'old-wrong');assert.equal(review.grammar[0].title,'比字句');assert.equal(review.grammar[0].count,3);await f.service.saveWrong(actors.a,{key:review.wrong[0].key,saved:false});assert.equal((await f.service.reviewData(actors.a)).wrong[0].saved,false);assert.equal(f.wrong[0].wrongCount,3);await rejectStatus(f.service.saveWrong(actors.b,{key:review.wrong[0].key,saved:true}),404);assert.equal((await f.service.legacyDetail(actors.a,'legacy:legacy-a')).answers.length,1);await rejectStatus(f.service.legacyDetail(actors.b,'legacy:legacy-a'),404);
});
test('existing results contribute to the correct average scale without leaking other users',async()=>{
 const f=fixture(),data=await f.service.dashboard(actors.a);assert.deepEqual(data.statistics.find(row=>row.level===1).averages.map(row=>[row.average,row.maxScore]),[[100,200]]);assert.equal((await f.service.dashboard(actors.b)).legacy.length,0);
});

test('exam_blueprint supplies all seven groups and server fallbacks without borrowing score thresholds across scales',async()=>{
 const f=fixture();f.sets[0].assignments=[];const data=await f.service.dashboard(actors.a);
 assert.deepEqual(data.blueprints.map(row=>[row.level,row.questionCount,row.durationMin,row.maxScore,row.targetScore]),[[1,40,40,200,120],[2,60,60,200,120],[3,70,83,300,180],[4,70,85,300,180],[5,72,110,300,180],[6,82,125,300,180],[7,91,200,null,null]]);
 assert.equal(data.papers.find(p=>p.id==='off1').durationMin,40);assert.equal(data.papers.find(p=>p.id==='off1').passScore,120);assert.equal(data.papers.find(p=>p.id==='off2').passScore,null);assert.equal(data.papers.find(p=>p.id==='manual').passScore,null);
 const attempt=await start(f);assert.equal(attempt.remainingSec,2400);
});
test('custom configuration and creation date round trip and cannot be read by another account',async()=>{
 const f=fixture();const created=await f.service.createCustom(actors.a,{requestId:requestId(),title:'Luyện riêng',level:1,count:1,durationMin:19,mode:'PRACTICE',skills:['READING'],types:['multiple_choice']});
 assert.deepEqual(created.customConfig,{skills:['READING'],types:['multiple_choice'],count:1});assert.ok(Date.parse(created.createdAt)>0);
 assert.deepEqual((await f.service.dashboard(actors.a)).papers.find(row=>row.id===created.id).customConfig,created.customConfig);assert.ok(!(await f.service.dashboard(actors.b)).papers.some(row=>row.id===created.id));
});
test('recommendation considers latest graded skill deficits, level and actual availability',async()=>{
 const f=fixture();const attempt=await start(f);await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{q1:'A',q2:'true'}},true);
 const data=await f.service.dashboard(actors.a),next=data.recommendations.find(row=>row.level===1).recommendation;
 assert.equal(next.paperId,'off2');assert.deepEqual(next.weakSkills,['READING']);assert.equal(data.recommendations.find(row=>row.level===2).recommendation,null);
 const state=JSON.parse(f.audit.find(row=>row.id===attempt.id).details);assert.equal(core.recommendExam([state.paper],[{id:attempt.id,state:{...state,status:'IN_PROGRESS'}}],1),null);
});

test('advanced level classification uses explicit configured bands and never an invented pass score',async()=>{
 const f=fixture(),attempt=await start(f,'manual');const submitted=await f.service.writeAttempt(actors.a,{id:attempt.id,revision:0,answers:{essay:'Bài viết'}},true);assert.equal(submitted.result,'PENDING');await f.service.gradeManual(actors.admin,{id:attempt.id,marks:{essay:2.5}});const graded=await f.service.getAttempt(actors.a,attempt.id);assert.equal(graded.result,'CLASSIFICATION_PENDING');
 const state=JSON.parse(f.audit.find(row=>row.id===attempt.id).details);state.paper.classification={bands:[{minScore:140,maxScore:160,label:'Nhóm thử nghiệm từ cấu hình'}]};assert.equal(core.attemptSummary(attempt.id,state).classificationLabel,'Nhóm thử nghiệm từ cấu hình');assert.equal(core.attemptSummary(attempt.id,state).result,'CLASSIFIED');
});

test('staff publication delivers shared picture and audio groups to students and grades each letter separately',async()=>{
 const f=fixture();
 const templates=require(path.resolve('src/components/exam-center/hsk-sample-templates.ts'));
 const images=core.PICTURE_CODES.map(id=>({id,label:`Tranh ${id}`,imageUrl:`/pictures/${id}.png`}));
 const reading={id:'read',title:'Đọc câu ghép tranh',skill:'READING',groupType:'matching_images',groupImages:images,passage:'Đoạn văn cũ',
  questions:core.PICTURE_CODES.slice(0,5).map((id,index)=>({
   id:`read-${id}`,questionNo:index+1,type:'matching',content:'他喜欢喝茶。',pinyin:'Tā xǐhuan hē chá.',
   points:2,correctAnswer:id,explanation:'Chọn tranh phù hợp.',options:[]
  }))};
 const audioUrl='/audio/listening-test.mp3';
 const listening={id:'listen',title:'Nghe A/B/C',skill:'LISTENING',groupType:'listening_choice_abc',audioUrl,
  questions:['B','C'].map((correctAnswer,index)=>({
   id:`listen-${index}`,type:'listening_choice',content:'SECRET TRANSCRIPT',pinyin:'SECRET PINYIN',points:2.25,
   correctAnswer,options:['A','B','C'].map(id=>({id,text:id}))
  }))};
 const listenPictures={...reading,id:'listen-pictures',title:'Nghe tranh',skill:'LISTENING',audioUrl,
  questions:[{...reading.questions[0],id:'listen-picture-1',content:'SECRET PICTURE SCRIPT',points:2}]};
 const body={level:1,title:'Đề kiểm thử',durationMin:20,passScore:null};
 const flatten=(groups)=>templates.flattenGroups(groups);
 const questions=flatten([reading,listening,listenPictures]);
 assert.equal(questions.filter(q=>q.groupImages?.length).length,2);
 assert.equal(questions.filter(q=>q.audioUrl).length,2);
 const [roundTrip]=templates.unflattenToGroups(questions,1);
 assert.deepEqual(roundTrip.groupImages,images);
 assert.equal(roundTrip.questions[0].pinyin,reading.questions[0].pinyin);
 for(const variant of [
  {...reading,groupImages:images.slice(0,5)},
  {...reading,questions:reading.questions.slice(0,4)},
  {...reading,questions:reading.questions.map(q=>({...q,correctAnswer:'A'}))},
  {...reading,questions:reading.questions.map((q,index)=>({...q,correctAnswer:index?q.correctAnswer:''}))},
  {...listening,audioUrl:''}
 ])await rejectStatus(f.service.importPaper(actors.admin,{...body,questions:flatten([variant])}),400);
 const {paperId}=await f.service.importPaper(actors.admin,{...body,questions});
 const set=f.sets.find(set=>set.id===paperId);
 assert.ok(set.questions.every(({question})=>!question.editorData.groupImages&&!question.audioUrl));
 await f.service.publishPaper(actors.admin,{paperId,durationMin:25,passScore:12.5});
 const data=await f.service.dashboard(actors.a);
 assert.equal(data.papers.find(p=>p.id===paperId).available,true);
 assert.equal(data.papers.find(p=>p.id===paperId).maxScore,16.5);
 const attempt=await start(f,paperId);
 assert.equal(attempt.questions[0].content,'他喜欢喝茶。');
 assert.equal(attempt.questions[0].passage,'');
 assert.deepEqual(attempt.questions[0].groupImages,images);
 assert.equal(attempt.questions.filter(q=>q.groupImages.length).length,2);
 assert.equal(attempt.questions[5].audioUrl,audioUrl);
 assert.equal(attempt.questions[6].audioUrl,audioUrl);
 assert.equal(attempt.questions[7].audioUrl,audioUrl);
 assert.ok(!JSON.stringify(attempt.questions).includes('SECRET'));
 const answers=Object.fromEntries(attempt.questions.map((q,index)=>[q.id,['A','C','C','D','E','B','C','A'][index]]));
 const saved=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:attempt.revision});
 assert.deepEqual((await f.service.getAttempt(actors.a,attempt.id)).answers,answers);
 const result=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:saved.revision},true);
 assert.equal(result.score,14.5);
 assert.deepEqual(result.questions.map(q=>q.result.earned),[2,0,2,2,2,2.25,2.25,2]);
 assert.equal(result.questions[1].correctAnswer,'B');
 assert.equal(result.questions[1].explanation,'Chọn tranh phù hợp.');
 assert.equal(result.questions[5].audioScript,'SECRET TRANSCRIPT');
});

test('shared reading replies survive import and attempt saves, and grade by letter',async()=>{
 const f=fixture();
 const templates=require(path.resolve('src/components/exam-center/hsk-sample-templates.ts'));
 const replies=['二千五百元。','坐出租车。','十岁了。','我女朋友。','没关系。','好的，谢谢！']
  .map((text,index)=>({id:core.PICTURE_CODES[index],text,pinyin:index===1?'Zuò chūzūchē.':''}));
 const reading={id:'reply',title:'阅读问答匹配 – Đọc nối câu hỏi với câu trả lời A–F',skill:'READING',groupType:core.READING_REPLIES,
  instruction:'Ghép câu hỏi với câu trả lời.',groupReplies:replies,
  questions:['多少钱？','你怎么回学校？','他几岁了？','她是谁？','对不起。'].map((content,index)=>({
   id:`reply-q-${index}`,type:'matching',content,questionNo:31+index,pinyin:index===1?'Nǐ zěnme huí xuéxiào?':'',
   points:2,correctAnswer:core.PICTURE_CODES[index],explanation:'Lời giải câu đọc.',options:[],
  }))};
 const body={level:1,title:'Đề đọc thử',durationMin:10,passScore:null};
 const flatten=(group)=>templates.flattenGroups([group]);
 const flat=flatten(reading);
 assert.equal(flat.filter(q=>q.groupReplies).length,1);
 assert.ok(flat.every(q=>!q.options.length&&!q.imageUrl));
 const [roundTrip]=templates.unflattenToGroups(flat,1);
 assert.deepEqual(roundTrip.groupReplies,replies);
 assert.equal(roundTrip.instruction,reading.instruction);
 assert.equal(roundTrip.questions[1].pinyin,reading.questions[1].pinyin);
 for(const invalid of [
  {...reading,groupReplies:replies.slice(0,5)},
  {...reading,questions:reading.questions.slice(0,4)},
  {...reading,questions:reading.questions.map(q=>({...q,correctAnswer:'A'}))},
  {...reading,questions:reading.questions.map((q,index)=>({...q,correctAnswer:index?q.correctAnswer:''}))},
 ])await rejectStatus(f.service.importPaper(actors.admin,{...body,questions:flatten(invalid)}),400);

 const {paperId}=await f.service.importPaper(actors.admin,{...body,questions:flat});
 const stored=f.sets.find(set=>set.id===paperId);
 assert.ok(stored.questions.every(({question})=>!question.editorData.groupReplies&&question.options==='[]'));
 const published=await f.service.publicationCandidates(actors.admin);
 assert.deepEqual(published.find(p=>p.id===paperId).questions[0].editorData.groupReplies,replies);
 const student=await f.service.dashboard(actors.a);
 assert.ok(student.papers.find(p=>p.id===paperId).available);
 const attempt=await start(f,paperId);
 assert.equal(attempt.questions.filter(q=>q.groupReplies.length).length,1);
 assert.deepEqual(attempt.questions[0].groupReplies,replies);
 assert.equal(attempt.questions[0].groupInstruction,reading.instruction);
 assert.ok(attempt.questions.every(q=>q.correctAnswer===undefined&&q.explanation===undefined));
 const answers=Object.fromEntries(attempt.questions.map((q,index)=>[q.id,index===1?'F':core.PICTURE_CODES[index]]));
 const saved=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:attempt.revision});
 assert.deepEqual((await f.service.getAttempt(actors.a,attempt.id)).answers,answers);
 const result=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:saved.revision},true);
 assert.deepEqual(result.questions.map(q=>q.result.earned),[2,0,2,2,2]);
 assert.equal(result.questions[1].correctAnswer,'B');
 assert.equal(result.questions[1].explanation,'Lời giải câu đọc.');

 const custom=flatten({...reading,groupCustom:true,questions:reading.questions.slice(0,3)});
 const customPaper=await f.service.importPaper(actors.admin,{...body,questions:custom});
 assert.equal((await start(f,customPaper.paperId)).questions.length,3);

 const legacy=reading.questions.map((q,index)=>({...q,type:'multiple_choice',skill:'READING',groupTitle:reading.title,
  options:replies,correctAnswer:core.PICTURE_CODES[index]}));
 const [legacyGroup]=templates.unflattenToGroups(legacy,1);
 assert.equal(legacyGroup.groupType,core.READING_REPLIES);
 const legacySet=f.sets.find(set=>set.id==='off1');
 legacySet.questions=legacy.map((q,index)=>({points:2,question:rawQuestion(`old-reply-${index}`,{
  ...q,options:JSON.stringify(q.options),editorData:{groupTitle:q.groupTitle},
 })}));
 const legacyAttempt=await start(f,'off1');
 assert.deepEqual(legacyAttempt.questions[0].groupReplies,replies);
 assert.equal(legacyAttempt.questions[1].type,'matching');
 legacySet.questions[0].question.options=JSON.stringify(replies.map(q=>({...q,text:'不同。'})));
 const [unchanged]=templates.unflattenToGroups(legacy.map((q,index)=>index===0?{...q,options:replies.map(r=>({...r,text:'不同。'}))}:q),1);
 assert.equal(unchanged.groupType,'standard');
 assert.ok((await f.service.officialPapers()).find(p=>p.id==='off1').questions.every(q=>q.type==='multiple_choice'));
});

test('reading cloze groups round trip, preserve order, hide keys and grade each selected word',async()=>{
 const f=fixture();
 const {WORD_BANK,CLOZE_PASSAGE,passageParts}=require(path.resolve('src/lib/reading-cloze.ts'));
 const templates=require(path.resolve('src/components/exam-center/hsk-sample-templates.ts'));
 const option=(id,text,pinyin='')=>({id,text,pinyin});
 const question=(id,content,correctAnswer,extra={})=>({id,content,correctAnswer,type:'fill_blank',points:2,
  explanation:'Giải thích ngữ cảnh.',options:[],...extra});
 const words=[option('C','休息'),option('A','开始','kāishǐ'),option('F','一起'),option('B','更好'),option('E','事情'),option('D','一定')];
 const bank={id:'bank',title:'Chọn từ',skill:'READING',groupType:WORD_BANK,groupWords:words,questions:[
  question('bank5','我[blank]会去。','D',{questionNo:40}),question('bank2','他们[blank]学中文。','A',{questionNo:37}),
  question('bank3','第二个杯子[blank]。','B',{questionNo:38}),question('bank1','我们[blank]去吧。','F',{questionNo:36}),
  question('bank4','大家[blank]一下。','C',{questionNo:39}),
 ]};
 const paragraph={id:'paragraph',title:'完形填空',skill:'READING',groupType:CLOZE_PASSAGE,
  instruction:'Đọc đoạn văn rồi chọn đáp án.',passage:'遇到困难不要[blank1]。\n每天练习可以[blank3]中文水平。',
  passagePinyin:'Yùdào kùnnán bùyào…',questions:[
   question('paragraph3','','C',{blankId:'blank3',options:[option('A','放弃'),option('B','承认'),option('C','提高'),option('D','帮助')]}),
   question('paragraph1','','B',{blankId:'blank1',options:[option('A','学习'),option('B','放弃','fàngqì'),option('C','发展'),option('D','保持')]}),
 ]};
 const flatten=(...groups)=>templates.flattenGroups(groups);
 const payload=flatten(bank,paragraph);
 assert.equal(payload.filter(q=>q.groupWords?.length).length,1);
 assert.equal(payload.filter(q=>q.passage).length,1);
 assert.deepEqual(templates.unflattenToGroups(payload,1)[0].groupWords,words);
 assert.deepEqual(templates.unflattenToGroups(payload,1)[1].questions.map(q=>q.blankId),['blank3','blank1']);
 assert.deepEqual(passageParts(paragraph.passage).flatMap(part=>part.blankId?[part.blankId]:[]),['blank1','blank3']);
 const body={level:1,title:'Đề điền từ',durationMin:10,passScore:null};
 for(const invalid of [
  {...bank,questions:bank.questions.map(q=>({...q,correctAnswer:'A'}))},
  {...bank,questions:bank.questions.map((q,i)=>i===0?{...q,content:'他[blank1][blank]学习。'}:q)},
  {...paragraph,passage:paragraph.passage+'[blank1]'},
  {...paragraph,passage:paragraph.passage+'[blank2]'},
  {...paragraph,questions:paragraph.questions.map(q=>({...q,correctAnswer:''}))},
 ])await rejectStatus(f.service.importPaper(actors.admin,{...body,questions:flatten(invalid)}),400);
 const custom={...bank,groupCustom:true,groupWords:words.slice(0,2),questions:[question('custom','大家[blank]一下。','C')]};
 await f.service.importPaper(actors.admin,{...body,questions:flatten(custom)});

 const {paperId}=await f.service.importPaper(actors.admin,{...body,questions:payload});
 assert.ok(f.sets.find(p=>p.id===paperId).questions.every(({question})=>!question.editorData.groupWords&&!question.editorData.passage));
 const attempt=await start(f,paperId);
 assert.deepEqual(attempt.questions.slice(0,5).map(q=>q.questionNo),[40,37,38,36,39]);
 assert.deepEqual(attempt.questions[0].groupWords,words);
 assert.equal(attempt.questions.filter(q=>q.groupWords.length).length,1);
 assert.equal(attempt.questions.filter(q=>q.passage).length,1);
 assert.equal(attempt.questions[5].passage,paragraph.passage);
 assert.equal(attempt.questions[5].passagePinyin,paragraph.passagePinyin);
 assert.equal(attempt.questions[5].blankId,'blank3');
 assert.deepEqual(attempt.questions[6].options.map(o=>o.id),['A','B','C','D']);
 assert.ok(attempt.questions.every(q=>q.correctAnswer===undefined&&q.explanation===undefined));
 const answers=Object.fromEntries(attempt.questions.map((q,index)=>[q.id,['D','C','B','F','C','C','B'][index]]));
 const saved=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:attempt.revision});
 assert.deepEqual((await f.service.getAttempt(actors.a,attempt.id)).answers,answers);
 const result=await f.service.writeAttempt(actors.a,{id:attempt.id,answers,revision:saved.revision},true);
 assert.deepEqual(result.questions.map(q=>q.result.earned),[2,0,2,2,2,2,2]);
 assert.equal(result.questions[6].correctAnswer,'B');
 assert.equal(result.questions[6].explanation,'Giải thích ngữ cảnh.');
});

test('reading sections preserve nested passage order, support mixed cloze modes and aggregate scores',async()=>{
 const f=fixture();
 const {WORD_BANK,CLOZE_PASSAGE,PASSAGE_CHOICE,PASSAGE_SECTION,CLOZE_SECTION}=require(path.resolve('src/lib/reading-cloze.ts'));
 const templates=require(path.resolve('src/components/exam-center/hsk-sample-templates.ts'));
 const options=['学习','休息','吃饭','看书'].map((text,i)=>({id:'ABCD'[i],text}));
 const question=(id,content,correctAnswer,extra={})=>({id,content,correctAnswer,type:'multiple_choice',points:2,
  explanation:'Theo ngữ cảnh đoạn văn.',options,...extra});
 const passage=(id,title,content,questions,extra={})=>({id,title,passage:content,skill:'READING',groupType:PASSAGE_CHOICE,questions,...extra});
 const first=passage('passage-1','Thư viện','他每天下午在图书馆看书。',[
  question('q-1','他在哪里看书？','D'),question('q-2','他每天做什么？','A'),
 ]);
 const second=passage('passage-2','Trường học','学校有一间图书馆。',[question('q-3','学校有什么？','B')]);
 const cloze=passage('cloze','Điền đoạn','我们每天都[blank1]。',[question('q-4','','A',{blankId:'blank1'})],{groupType:CLOZE_PASSAGE});
 const bank=passage('bank','Điền câu','',[question('q-5','晚上我喜欢[blank]。','D')],{groupType:WORD_BANK,groupCustom:true,groupWords:options});
 const section=(id,title,groupType,passages)=>({id,title,skill:'READING',groupType,instruction:'Đọc và trả lời.',questions:[],passages});
 const mc=section('mc','Phần đọc hiểu',PASSAGE_SECTION,[second,first]);
 const gap=section('gap','Phần điền từ',CLOZE_SECTION,[bank,cloze]);
 const flat=templates.flattenGroups([mc,gap]);
 assert.deepEqual(flat.map(q=>q.id),['q-3','q-1','q-2','q-5','q-4']);
 assert.deepEqual(flat.map(q=>q.sectionId),['mc','mc','mc','gap','gap']);
 assert.equal(flat[2].passage,'');
 const roundTrip=templates.unflattenToGroups(flat,9);
 assert.deepEqual(roundTrip.map(s=>s.passages.map(p=>p.id)),[['passage-2','passage-1'],['bank','cloze']]);
 assert.deepEqual(roundTrip[0].passages[1].questions.map(q=>q.id),['q-1','q-2']);
 assert.equal(roundTrip[1].passages[0].groupType,WORD_BANK);
 assert.equal(roundTrip[1].passages[1].groupType,CLOZE_PASSAGE);

 const body={level:9,title:'HSK 9',durationMin:30,passScore:null};
 for(const questions of [
  flat.map((q,i)=>i===0?{...q,correctAnswer:''}:q),
  flat.map((q,i)=>i===0?{...q,sectionType:CLOZE_SECTION}:q),
  flat.map((q,i)=>i===1?{...q,id:flat[0].id}:q),
  flat.map((q,i)=>i===0?{...q,options:q.options.slice(0,3)}:q),
 ])await rejectStatus(f.service.importPaper(actors.admin,{...body,questions}),400);

 const {paperId}=await f.service.importPaper(actors.admin,{...body,questions:flat});
 const paper=f.sets.find(set=>set.id===paperId);
 assert.ok(paper.questions.every(({question})=>!question.editorData.passage&&!question.editorData.sectionId));
 const opened=await start(f,paperId);
 assert.deepEqual(opened.questions.map(q=>q.groupTitle),['Trường học','Thư viện','Thư viện','Điền câu','Điền đoạn']);
 assert.equal(opened.questions[1].groupId,opened.questions[2].groupId);
 assert.notEqual(opened.questions[0].groupId,opened.questions[1].groupId);
 assert.equal(opened.questions[0].sectionId,opened.questions[2].sectionId);
 assert.notEqual(opened.questions[0].sectionId,opened.questions[3].sectionId);
 assert.deepEqual(opened.readingSections,[]);
 assert.ok(opened.questions.every(q=>q.correctAnswer===undefined&&q.explanation===undefined));
 const answers=Object.fromEntries(opened.questions.map((q,index)=>[q.id,['B','A','A','D','B'][index]]));
 const saved=await f.service.writeAttempt(actors.a,{id:opened.id,answers,revision:opened.revision});
 assert.deepEqual((await f.service.getAttempt(actors.a,opened.id)).answers,answers);
 const result=await f.service.writeAttempt(actors.a,{id:opened.id,answers,revision:saved.revision},true);
 assert.equal(result.score,6);
 assert.deepEqual(result.readingSections.map(s=>[s.title,s.earned,s.max]),[['Phần đọc hiểu',4,6],['Phần điền từ',2,4]]);
 assert.deepEqual(result.readingSections[0].passages.map(p=>[p.title,p.earned,p.max]),[['Trường học',2,2],['Thư viện',2,4]]);
 const wrong=await f.service.reviewData(actors.a);
 const reviewChoice=wrong.wrong.find(row=>row.question.id===opened.questions[1].id).question;
 const reviewGap=wrong.wrong.find(row=>row.question.id===opened.questions[4].id).question;
 assert.equal(reviewChoice.passage,first.passage);
 assert.equal(reviewChoice.explanation,'Theo ngữ cảnh đoạn văn.');
 assert.equal(reviewGap.passage,cloze.passage);
 assert.equal(reviewGap.blankId,'blank1');

 const many=section('long','Phần dài',PASSAGE_SECTION,[{...first,
  questions:Array.from({length:501},(_,index)=>question(`long-${index}`,'他在哪里看书？','D')),
 }]);
 const large=await f.service.importPaper(actors.admin,{...body,questions:templates.flattenGroups([many])});
 assert.equal((await start(f,large.paperId)).questions.length,501);
});
