"use client";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight,BookOpen,ChartNoAxesColumnIncreasing,Clock,FileCheck2,History,Home,Leaf,Search,Settings2,ShieldCheck,Bookmark,PenTool,CheckCircle2 } from "lucide-react";
import { EXAM_LEVELS,levelGroup,levelLabel } from "@/lib/exam-center-core";
import type { dashboard,reviewData } from "@/lib/exam-center-service";
import { examApi,dateText,resultNames,skillNames,timeText,typeNames,dayKey } from "./exam-client";
import ExamPlayer from "./ExamPlayer";
import { displayQuestionNumber } from "@/lib/question-number";
import { CLOZE_PASSAGE, PASSAGE_CHOICE, PASSAGE_JUDGEMENT, WORD_BANK, passageParts } from "@/lib/reading-cloze";
import ExamStaff from "./ExamStaff";
import ExamCatalog,{ExamIntroduction,ScoreTrend} from "./ExamCatalog";
import ComponentErrorBoundary from "@/components/common/ComponentErrorBoundary";
import s from "./ExamCenter.module.css";
type Dashboard=Awaited<ReturnType<typeof dashboard>>;
type Review=Awaited<ReturnType<typeof reviewData>>;
type Paper=Dashboard['papers'][number];
const safeUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
function ReadingReviewContext({ question }: { question: Review["wrong"][number]["question"] }) {
 const cloze=question.groupType===CLOZE_PASSAGE;
 const evidence=question.groupType===PASSAGE_JUDGEMENT?String(question.editorData.evidence||""):"";
 const start=evidence?question.passage.indexOf(evidence):-1;
 return <>
  {question.sectionTitle&&<p>{question.sectionTitle} · {question.groupTitle}</p>}
  {question.passage&&<div lang="zh" className={s.reviewPassage}>
   {cloze?passageParts(question.passage).map((part,index)=>part.blankId
    ? part.blankId===question.blankId?<mark key={index}>({part.blankId.slice(5)}) ______</mark>:<span key={index}> ({part.blankId.slice(5)}) ______ </span>
    : <span key={index}>{part.text}</span>):start>=0
    ? <>{question.passage.slice(0,start)}<mark>{evidence}</mark>{question.passage.slice(start+evidence.length)}</>
    : question.passage}
  </div>}
  {question.groupWords.length>0&&<ul className={s.reviewWords}>{question.groupWords.map(word=><li key={word.id}>
   <strong>{word.id}</strong> <span lang="zh">{word.text}</span>{word.pinyin&&<small> {word.pinyin}</small>}
  </li>)}</ul>}
  <h3>
   {(question.questionNumber!==undefined||question.questionNo)&&<>Câu {displayQuestionNumber(question,1)} · </>}
   {cloze&&question.blankId?`Chỗ trống (${question.blankId.slice(5)})`:question.content}
  </h3>
 </>;
}
function readingReviewAnswer(question:Review["wrong"][number]["question"],answer:string){
 if(![WORD_BANK,CLOZE_PASSAGE,PASSAGE_CHOICE,PASSAGE_JUDGEMENT].includes(question.groupType))return answer;
 const choice=(question.groupType===WORD_BANK?question.groupWords:question.options).find(option=>option.id===answer);
 return choice?(question.groupType===PASSAGE_JUDGEMENT?choice.text:`${choice.id} · ${choice.text}`):answer;
}
export default function ExamCenter({user}:{user:{id:string;name:string;role:string}}){
 const router=useRouter(),pathname=usePathname(),params=useSearchParams(),view=params.get('view')||'home';
 const initialLevel=Number(params.get('level')||0),selectedLevel=initialLevel>=7?7:initialLevel>=1?initialLevel:0;
 const [data,setData]=useState<Dashboard|null>(null),[review,setReview]=useState<Review|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[search,setSearch]=useState(''),[working,setWorking]=useState('');
 const [legacyDetails,setLegacyDetails]=useState<Record<string,{answers:{id:string;content:string;userAnswer:string|null;correctAnswer:string;explanation:string|null;earned:number}[]}>>({});
 const [outcome,setOutcome]=useState('all'),[from,setFrom]=useState(''),[to,setTo]=useState('');
 const reviewTab=params.get('tab')||'saved';
 const beforeLeave=useRef<(()=>Promise<void>)|null>(null);
 const registerLeave=useCallback((fn:(()=>Promise<void>)|null)=>{beforeLeave.current=fn;},[]);
 const reload=useCallback(()=>{void Promise.all([examApi<Dashboard>('dashboard'),examApi<Review>('review')]).then(([next,review])=>{setData(next);setReview(review);setError('');}).catch(error=>setError(error.message)).finally(()=>setLoading(false));},[]);
 useEffect(()=>{if(view!=="attempt")reload();},[reload,view]);
 const go=useCallback(async(next:string,options:Record<string,string|number>={})=>{try{await beforeLeave.current?.();const query=new URLSearchParams({view:next,...Object.fromEntries(Object.entries(options).map(([key,value])=>[key,String(value)]))});router.push(`${pathname}?${query}`);window.scrollTo({top:0,behavior:'instant'});}catch(error){setError((error as Error).message);}},[router,pathname]);
 const navigate=(next:string,level=selectedLevel)=>void go(next,level?{level}:{});
 async function start(paper:Paper,forceNew=false){setWorking(paper.id);try{const attempt=await examApi<{id:string}>('start',{paperId:paper.id,requestId:safeUUID(),forceNew});await go('attempt',{id:attempt.id,level:levelGroup(paper.level)});reload();}catch(error){setError((error as Error).message);}finally{setWorking('');}}
 const history=useMemo(()=>data?[...data.attempts.filter(row=>row.status!=='IN_PROGRESS'),...data.legacy].sort((a,b)=>Date.parse(b.submittedAt||b.startedAt)-Date.parse(a.submittedAt||a.startedAt)):[],[data]);
 const attempts=data?.attempts||[],active=attempts.find(row=>row.status==='IN_PROGRESS'&&(!selectedLevel||levelGroup(row.level)===selectedLevel));
 const recommendation=data?.recommendations.find(row=>row.level===selectedLevel)?.recommendation;
 const suggested=data?.papers.find(paper=>paper.id===recommendation?.paperId);
 const introPaper=data?.papers.find(paper=>paper.id===params.get('id'));
 const stats=data?.statistics.find(row=>row.level===selectedLevel)||data?.statistics[0];
 const filteredHistory=history.filter(row=>(!selectedLevel||levelGroup(row.level)===selectedLevel)&&(outcome==='all'||row.result===outcome)&&(!from||dayKey(row.submittedAt||row.startedAt)>=from)&&(!to||dayKey(row.submittedAt||row.startedAt)<=to)&&row.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
 const levelSelect=(allowAll=true)=><select aria-label="Lọc cấp HSK" value={selectedLevel} onChange={e=>navigate(view,Number(e.target.value))}>{allowAll&&<option value={0}>Tất cả cấp độ</option>}{EXAM_LEVELS.map(level=><option key={level} value={level}>{levelLabel(level)}</option>)}</select>;
 const historyTable=(rows:typeof history)=><div className={s.tableWrap}><table><thead><tr><th>Đề thi</th><th>Ngày thi</th><th>Điểm số</th><th>Kết quả</th><th/></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.title}</strong><small>{levelLabel(row.level)} · {row.source==='CUSTOM'?'Đề cá nhân':row.source==='LEGACY'?'Lịch sử trước đây':'Đề chính thức'}</small></td><td>{dateText(row.submittedAt||row.startedAt)}</td><td>{row.score===null?'Chờ chấm':`${row.score} / ${row.maxScore}`}</td><td><span className={s.status} data-result={row.result}>{('classificationLabel' in row&&row.classificationLabel)||resultNames[row.result]||'Đã nộp'}</span></td><td>{row.source==='LEGACY'?<details onToggle={async event=>{if(!event.currentTarget.open||legacyDetails[row.id])return;try{const response=await fetch(`/api/v1/exam-center?action=legacy&id=${encodeURIComponent(row.id)}`,{cache:"no-store"});const result=await response.json();if(!response.ok||!result.success)throw new Error(result.message||"Không tải được kết quả cũ.");setLegacyDetails(values=>({...values,[row.id]:result.data}));}catch(error){setError((error as Error).message);}}}><summary>Xem chi tiết</summary><p>{row.feedback||"Kết quả trước đây"}</p>{legacyDetails[row.id]?.answers.map(answer=><div key={answer.id} className={s.legacyAnswer}><strong>{answer.content}</strong><p>Đã trả lời: {answer.userAnswer||"Bỏ trống"}</p><p>Đáp án: {answer.correctAnswer}</p><p>{answer.explanation}</p><small>{answer.earned} điểm trọng số</small></div>)}{legacyDetails[row.id]&&!legacyDetails[row.id].answers.length&&<p>Lượt thi cũ chưa có bản lưu từng câu.</p>}</details>:<button className={s.textButton} onClick={()=>void go('attempt',{id:row.id,level:levelGroup(row.level)})}>Xem chi tiết →</button>}</td></tr>)}</tbody></table>{!rows.length&&<p className={s.empty}>Chưa có lượt thi phù hợp.</p>}</div>;
 const statistics=<section className={s.panel} aria-label="Tiến độ học tập"><div className={s.sectionHeading}><h2><ChartNoAxesColumnIncreasing size={20}/>Tiến độ học tập</h2>{levelSelect()}</div>{stats?<><div className={s.statsGrid}><div className={s.ring} style={{background:`conic-gradient(#69934b ${stats.completionPercent}%,#e6e9dc 0)`}}><div><strong>{stats.total?`${stats.completionPercent}%`:'—'}</strong><small>Hoàn thành</small></div></div><div className={s.averages}><h3>Điểm trung bình theo cấp & thang điểm</h3>{stats.averages.length?stats.averages.map(group=><p key={`${group.level}:${group.maxScore}`}><small>HSK {group.level} · {group.count} lượt đã chấm</small><strong>{group.average} <span>/ {group.maxScore}</span></strong></p>):<p>Chưa có bài đã chấm để tính trung bình.</p>}<small>{stats.done}/{stats.total} đề Admin xuất bản đã hoàn thành. Không cộng đề cá nhân vào tỷ lệ này.</small></div><div className={s.skills}><h3>Phân tích kỹ năng</h3>{stats.skills.map(skill=><div key={skill.skill}><span>{skillNames[skill.skill]}</span><progress max={100} value={skill.percent??0}/><small>{skill.percent===null?'—':`${skill.percent}%`}</small></div>)}<small>Tỷ lệ điểm theo kỹ năng từ các lượt đã chấm; chuẩn hóa từng lượt trước khi lấy trung bình.</small></div></div></>:<p>Đang tải thống kê…</p>}</section>;
 if (view === 'attempt') {
   return (
     <ComponentErrorBoundary
       name="Phòng làm bài thi"
       fallback={
         <div className={s.center} style={{ padding: '60px 20px', textAlign: 'center' }}>
           <p className={s.empty}>Không thể kết nối bài thi vào lúc này hoặc phiên thi đã kết thúc.</p>
           <p style={{ color: '#5b6b55', fontSize: 13, marginTop: 8 }}>
             Bạn có thể làm lại đề thi này bất cứ lúc nào bằng cách quay lại danh sách đề và chọn Bắt đầu thi.
           </p>
           <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
             <button className={s.primary} onClick={() => navigate('exams')}>
               ← Về danh sách đề thi để làm lại
             </button>
             <button className={s.secondary} onClick={reload}>
               Thử tải lại
             </button>
           </div>
         </div>
       }
     >
       <ExamPlayer
         id={params.get('id') || ''}
         userId={user.id}
         onBack={() => navigate('exams')}
         onChanged={reload}
         registerLeave={registerLeave}
         onRetake={(paperId) => {
           const paper = data?.papers.find((p) => p.id === paperId);
           if (paper) void start(paper, true);
           else navigate('exams');
         }}
       />
     </ComponentErrorBoundary>
   );
 }

 if (view === 'intro') {
   if (!data) return <div className={s.center}><p role="status" className={s.loading}>Đang đồng bộ dữ liệu phòng thi…</p></div>;
   return introPaper ? (
     <ExamIntroduction
       key={introPaper.id}
       paper={introPaper}
       blueprint={data.blueprints.find(b => b.level === levelGroup(introPaper.level))}
       activeAttempt={data.attempts.find(a => a.paperId === introPaper.id && a.status === 'IN_PROGRESS')}
       onContinueAttempt={id => void go('attempt', { id, level: levelGroup(introPaper.level) })}
       onStart={() => void start(introPaper)}
       onBack={() => navigate('exams')}
       busy={!!working}
       role={user.role}
       onEdit={() => navigate('publications')}
     />
   ) : (
     <div className={s.center} style={{ padding: '60px 20px', textAlign: 'center' }}>
       <p className={s.empty}>Đề không còn xuất bản hoặc không thuộc tài khoản này.</p>
       <button className={s.primary} style={{ marginTop: 16 }} onClick={() => navigate('exams')}>
         Quay lại danh sách đề
       </button>
     </div>
   );
 }

 return <div className={s.center} data-exam-center><header className={s.topbar}><Link className={s.brand} href="/s/home"><Leaf size={33}/><span><strong>HSK Exam Center</strong><small>汉语水平考试 · 模拟考试中心</small></span></Link><nav aria-label="Menu trung tâm thi">{[{id:'home',text:'Trang chủ',icon:Home},{id:'exams',text:'Thi thử',icon:FileCheck2},{id:'review',text:'Ôn tập',icon:BookOpen},{id:'stats',text:'Thống kê',icon:ChartNoAxesColumnIncreasing}].concat((user.role==='ADMIN'||user.role==='TEACHER')?[{id:'authoring',text:'Soạn đề HSK 3.0',icon:PenTool},{id:'publications',text:'Quản lý đề',icon:Settings2},{id:'grading',text:'Chấm tự luận',icon:CheckCircle2}]:[]).map(({id,text,icon:Icon})=><button key={id} aria-current={view===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={17}/>{text}</button>)}</nav><label className={s.headerSearch}><Search size={16}/><input aria-label="Tìm đề thi" placeholder="Tìm đề thi…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')navigate('exams');}}/></label><div className={s.account}>{(user.role==='ADMIN'||user.role==='TEACHER')&&<div style={{display:'flex',gap:6,marginRight:8}}><button type="button" onClick={()=>navigate('authoring')} style={{padding:'5px 12px',borderRadius:8,background:'#27492c',color:'#fff',fontSize:12,fontWeight:600,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4}} title="Nhập tài liệu hoặc Soạn đề HSK 3.0"><PenTool size={13}/><span>Soạn đề</span></button><button type="button" onClick={()=>navigate('publications')} style={{padding:'5px 12px',borderRadius:8,background:'#fff',border:'1px solid #c2d5bb',color:'#27492c',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4}} title="Duyệt và cấu hình đề thi"><Settings2 size={13}/><span>Quản lý</span></button></div>}<ShieldCheck size={20}/><span>{user.name}<small>{user.role==='ADMIN'?'Quản trị viên':user.role==='TEACHER'?'Giáo viên':'Học viên'}</small></span></div></header>
 <main className={s.content}>{error&&<div className={s.error} role="alert">{error}<button onClick={reload}>Thử tải lại</button></div>}
 {view==='home'&&<><section className={s.hero}><small>HANYU · PHÒNG THI THỬ</small><h1>HSK Exam Center</h1><p lang="zh-CN">汉语水平考试 · 模拟考试中心</p><p>Chọn cấp HSK, tiếp tục bài thi và nhìn lại tiến độ của bạn.</p></section><section aria-label="Chọn cấp HSK"><h2 className={s.heading}>Chọn cấp HSK</h2><div className={s.levelGrid}>{EXAM_LEVELS.map(level=>{const item=data?.levels.find(row=>row.level===level);return <button key={level} className={s.levelCard} onClick={()=>{navigate('exams',level);}}><strong>{levelLabel(level)}</strong><span><FileCheck2 size={14}/>{item?`${item.count} đề Admin xuất bản`:'Đang tải đề…'}</span><span><Clock size={14}/>{item?.durationMin?item.durationMin===item.durationMax?`${item.durationMin} phút`:`${item.durationMin}–${item.durationMax} phút`:'Chưa có thời gian được đặt'}</span><ArrowRight className={s.levelArrow} size={17}/></button>;})}</div></section>
 <div className={s.homeColumns}><section><h2 className={s.heading}>Tiếp tục thi</h2><div className={`${s.panel} ${s.resume}`}>{active?<><div className={s.resumeIcon}><FileCheck2 size={30}/></div><div><small>{levelLabel(active.level)} · Bài thi chưa hoàn thành</small><h3>{active.title}</h3><p>Đã trả lời: {active.answered}/{active.questionsCount} câu · {active.progress}%</p><progress max={100} value={active.progress}/><small>Điểm: {active.score===null?'Chưa chấm':`${active.score}/${active.maxScore}`}</small></div><div><Clock size={18}/><strong>{timeText(active.remainingSec)}</strong><button className={s.primary} onClick={()=>void go('attempt',{id:active.id,level:levelGroup(active.level)})}>Tiếp tục <ArrowRight size={15}/></button></div></>:suggested?<><div><small>Gợi ý từ đề Admin đã xuất bản</small><h3>{suggested.title}</h3><p>{levelLabel(suggested.level)} · {suggested.questionsCount} câu · {suggested.durationMin} phút</p></div><button className={s.primary} onClick={()=>void go('intro',{id:suggested.id,level:selectedLevel})} disabled={!!working}>Bắt đầu đề này →</button></>:<div className={s.empty}>Bạn chưa có bài đang làm. Chọn một cấp để xem các đề đã xuất bản.</div>}</div></section>{statistics}</div>
 <div className={s.lowerGrid}><section className={s.panel}><div className={s.sectionHeading}><h2><History size={19}/>Lịch sử thi</h2><button onClick={()=>navigate('history')}>Xem tất cả →</button></div>{historyTable(history.slice(0,4))}</section><section className={`${s.panel} ${s.actionCard}`}><Settings2 size={26}/><h2>Tự tạo đề</h2><p>Chọn cấp, kỹ năng, dạng bài và số câu từ ngân hàng Admin đã duyệt.</p><button className={s.primary} onClick={()=>navigate('create',selectedLevel||1)}>Tạo đề mới →</button></section><section className={`${s.panel} ${s.actionCard}`}><BookOpen size={27}/><h2>Ôn tập câu sai</h2><p>{review?review.wrong.filter(q=>q.saved).length:'—'} câu hỏi đã lưu</p><p>Ngữ pháp yếu: {review?.grammar.length??'—'} mục</p><p>Từ vựng yếu: {review?.vocabulary.length??'—'} mục</p><button className={s.primary} onClick={()=>navigate('review')}>Ôn tập ngay →</button></section></div></>}
 {view==='exams'&&data&&<ExamCatalog key={`${selectedLevel}:${params.get('source')||'all'}`} role={user.role} data={data} review={review} level={selectedLevel} search={search} source={params.get('source')||'all'} go={(view,options)=>void go(view,options)} levelSelect={levelSelect()}/>}
 {view==='intro'&&data&&(introPaper?<ExamIntroduction key={introPaper.id} paper={introPaper} blueprint={data.blueprints.find(b=>b.level===levelGroup(introPaper.level))} activeAttempt={data.attempts.find(a=>a.paperId===introPaper.id&&a.status==='IN_PROGRESS')} onContinueAttempt={id=>void go('attempt',{id,level:levelGroup(introPaper.level)})} onStart={()=>void start(introPaper)} onBack={()=>navigate('exams')} busy={!!working} role={user.role} onEdit={()=>navigate('publications')}/>:<p className={s.empty}>Đề không còn xuất bản hoặc không thuộc tài khoản này.</p>)}
 {view==='stats'&&<><div className={s.pageTitle}><h1>Thống kê năng lực</h1></div>{statistics}<ScoreTrend history={history.filter(row=>!selectedLevel||levelGroup(row.level)===selectedLevel)}/></>}
 {view==='history'&&<><div className={s.pageTitle}><h1>Lịch sử thi của tôi</h1>{levelSelect()}</div><div className={s.filters}><label>Từ ngày<input aria-label="Từ ngày thi" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Đến ngày<input aria-label="Đến ngày thi" type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><select aria-label="Lọc kết quả" value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="all">Tất cả kết quả</option>{Object.entries(resultNames).map(([key,text])=><option key={key} value={key}>{text}</option>)}</select></div><section className={s.panel}>{historyTable(filteredHistory)}</section></>}
 {view==='create'&&data&&<CustomBuilder data={data} initialLevel={selectedLevel||1} onCreated={level=>{reload();void go('exams',{level,source:'CUSTOM'});}}/>}
 {view==='review'&&<><div className={s.pageTitle}><h1>Ôn tập câu sai</h1></div><div className={s.filters}>{[{id:'saved',text:'Câu sai đã lưu'},{id:'all',text:'Tất cả câu sai'},{id:'grammar',text:'Ngữ pháp yếu'},{id:'vocabulary',text:'Từ vựng yếu'}].map(tab=><button key={tab.id} aria-pressed={reviewTab===tab.id} onClick={()=>void go('review',{level:selectedLevel,tab:tab.id})}>{tab.text}</button>)}</div>{reviewTab==='grammar'||reviewTab==='vocabulary'?<section className={s.panel}><h2>{reviewTab==='grammar'?'Ngữ pháp yếu':'Từ vựng yếu'}</h2><p className={s.hint}>Tổng hợp theo nhãn kỹ năng của các câu bạn trả lời sai; chưa tự suy diễn cấu trúc hoặc từ mới.</p>{review?.[reviewTab].filter(item=>!selectedLevel||levelGroup(item.level)===selectedLevel).map(item=><article className={s.weakItem} key={item.id}><strong>{item.title}</strong><span>{item.count} lần cần ôn</span>{item.attemptId&&<button className={s.secondary} onClick={()=>void go('attempt',{id:item.attemptId,level:levelGroup(item.level)})}>Xem bài làm gốc</button>}</article>)}{!review?.[reviewTab].filter(item=>!selectedLevel||levelGroup(item.level)===selectedLevel).length&&<p className={s.empty}>Chưa có câu sai được gắn nhãn phù hợp để phân tích.</p>}</section>:<div className={s.reviewGrid}>{review?.wrong.filter(row=>(!selectedLevel||levelGroup(row.level)===selectedLevel)&&(reviewTab==='all'||row.saved)).map(row=><article className={s.panel} key={row.key}><small>{levelLabel(row.level)} · {row.paperTitle}</small><ReadingReviewContext question={row.question}/><details><summary>Xem lại lời giải</summary><p>Câu trả lời của bạn: {row.userAnswer.startsWith('data:')?'Bản ghi âm / ảnh bài viết trong kết quả gốc':readingReviewAnswer(row.question,row.userAnswer)||'Chưa có bản lưu'}</p><p>Đáp án: {readingReviewAnswer(row.question,row.question.correctAnswer)}</p><p>{row.question.explanation}</p></details><button className={s.secondary} onClick={async()=>{try{await examApi('saveWrong',{key:row.key,saved:!row.saved});reload();}catch(error){setError((error as Error).message);}}}><Bookmark size={15} fill={row.saved?'currentColor':'none'}/>{row.saved?'Bỏ lưu':'Lưu câu sai'}</button></article>)}</div>}{review&&!review.wrong.filter(row=>(!selectedLevel||levelGroup(row.level)===selectedLevel)&&(reviewTab==='all'||row.saved)).length&&(reviewTab==='all'||reviewTab==='saved')&&<p className={s.empty}>Chưa có câu sai trong nhóm này.</p>}</>}
 {(view==='publications'||view==='grading'||view==='authoring')&&<ExamStaff role={user.role} view={view} onNavigate={navigate} onChanged={reload}/>}
 {loading&&<p role="status" className={s.loading}>Đang đồng bộ dữ liệu phòng thi…</p>}
 <footer className={s.footer}><Link href="/s/home">← Về Hanyu</Link><span><ShieldCheck size={14}/>Dữ liệu bài thi được bảo vệ theo tài khoản</span>{(user.role==='ADMIN'||user.role==='TEACHER')&&<><button onClick={()=>navigate('authoring')}>Nhập & Soạn đề HSK 3.0</button><button onClick={()=>navigate('publications')}>Duyệt & cấu hình đề</button><button onClick={()=>navigate('grading')}>Chấm tự luận</button></>}</footer></main></div>;
}
function CustomBuilder({data,initialLevel,onCreated}:{data:Dashboard;initialLevel:number;onCreated:(level:number)=>void}){
 const [level,setLevel]=useState(initialLevel),[skills,setSkills]=useState<string[]>(['READING']),[types,setTypes]=useState<string[]>([]),[count,setCount]=useState(10),[duration,setDuration]=useState(30),[mode,setMode]=useState('PRACTICE'),[name,setName]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const bank=data.bank.find(row=>row.level===level),available=bank?.types.filter(row=>row.skills.some(skill=>skills.includes(skill)))||[];
 return <section className={`${s.panel} ${s.builder}`}><h1>Tự tạo đề cá nhân</h1><p>Chỉ lấy câu từ ngân hàng đã được Admin xuất bản. Đề này thuộc riêng tài khoản của bạn.</p><form onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{await examApi('custom',{requestId:safeUUID(),title:name,level,skills,types,count,durationMin:duration,mode});onCreated(level);}catch(error){setError((error as Error).message);}finally{setBusy(false);}}}><label>Tên đề<input required maxLength={300} value={name} onChange={e=>setName(e.target.value)} placeholder="Ví dụ: Buổi luyện đọc của tôi"/></label><div className={s.formColumns}><label>Cấp HSK<select value={level} onChange={e=>{setLevel(Number(e.target.value));setTypes([]);}}>{EXAM_LEVELS.map(level=><option key={level} value={level}>{levelLabel(level)}</option>)}</select></label><label>Chế độ<select value={mode} onChange={e=>setMode(e.target.value)}><option value="PRACTICE">Luyện tập tùy chỉnh · không giới hạn</option><option value="EXAM">Thi mô phỏng · đếm ngược</option></select></label><label>Số câu<input required type="number" min={1} max={200} value={count} onChange={e=>setCount(Number(e.target.value))}/></label><label>{mode==='PRACTICE'?'Thời gian gợi ý (phút)':'Thời gian làm bài (phút)'}<input required type="number" min={1} max={600} value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label></div><fieldset><legend>Kỹ năng muốn luyện</legend><div className={s.checks}>{Object.entries(skillNames).map(([id,label])=><label key={id}><input type="checkbox" checked={skills.includes(id)} onChange={()=>{setSkills(values=>values.includes(id)?values.filter(value=>value!==id):[...values,id]);setTypes([]);}}/>{label}<small>({bank?.skills.find(row=>row.skill===id)?.count||0} câu)</small></label>)}</div></fieldset><fieldset><legend>Dạng bài đã có trong cấp HSK này</legend><div className={s.checks}>{available.map(item=><label key={item.type}><input type="checkbox" checked={types.includes(item.type)} onChange={()=>setTypes(values=>values.includes(item.type)?values.filter(value=>value!==item.type):[...values,item.type])}/>{typeNames[item.type]||item.type}<small>({item.skillCounts.filter(row=>skills.includes(row.skill)).reduce((sum,row)=>sum+row.count,0)})</small></label>)}</div>{!available.length&&<p className={s.hint}>Chưa có câu đã duyệt phù hợp các kỹ năng đang chọn.</p>}</fieldset>{error&&<p role="alert" className={s.error}>{error}</p>}<button className={s.primary} disabled={busy||!skills.length||!types.length} type="submit">{busy?'Đang tạo…':'Tạo đề cá nhân'}<ArrowRight size={15}/></button></form></section>;
}
