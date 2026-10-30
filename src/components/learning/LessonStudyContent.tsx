"use client";
import LessonRichSections from "@/components/teacher/LessonRichSections";
import {teacherLibraryLesson} from "@/lib/teacher-library-adapter";
import { useState } from "react";
import { BookOpen, Languages, MessageSquare, Volume2, BookmarkPlus, Sparkles, Globe } from "lucide-react";
import type { Hsk1FullLesson,LessonVocabItem } from "@/lib/hsk1-full-lessons";
import styles from "./Ink.module.css";

export default function LessonStudyContent({lesson,onSaveVocabulary}:{lesson:Hsk1FullLesson;onSaveVocabulary?:(items:LessonVocabItem[])=>Promise<void>}){
  const [tab,setTab]=useState("vocab"),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  function speak(text:string){if(!("speechSynthesis"in window)){setMessage("Trình duyệt chưa hỗ trợ phát âm.");return;}speechSynthesis.cancel();const sound=new SpeechSynthesisUtterance(text);sound.lang="zh-CN";speechSynthesis.speak(sound);}
  async function save(items:LessonVocabItem[]){if(!onSaveVocabulary)return;setBusy(true);setMessage("");try{await onSaveVocabulary(items);setMessage(`Đã lưu ${items.length} từ vào kho riêng của bạn.`);}catch(error){setMessage(error instanceof Error?error.message:"Chưa lưu được từ vựng.");}finally{setBusy(false);}}
  const hskLevel=Number(lesson.id.match(/hsk(\d+)/)?.[1]||1);
  const fullLesson=teacherLibraryLesson(lesson,hskLevel);
  const tabs=[
    {id:"vocab",label:"Từ vựng",icon:Languages,count:lesson.vocabList.length},
    {id:"grammar",label:"Ngữ pháp",icon:BookOpen,count:lesson.grammarList.length},
    {id:"dialogue",label:"Hội thoại",icon:MessageSquare,count:lesson.dialogue.length},
    {id:"reading",label:"Đọc hiểu",icon:BookOpen,count:Number(!!lesson.reading?.contentZh)},
    {id:"culture_detail",label:"Văn hóa giao tiếp",icon:Globe,count:Number(!!(lesson.culturalNote||lesson.culture))},
    {id:"phonetics",label:"Ngữ âm",icon:Sparkles,count:Number(!!(lesson.phonetics.rule||lesson.phonetics.examples.length))},
  ];
  return <div className={styles.stack}>
    <nav className={styles.tabs} aria-label="Nội dung bài học">{tabs.map(({id,label,icon:Icon,count})=><button key={id} className={styles.tab} aria-pressed={tab===id} onClick={()=>setTab(id)}><Icon size={15}/>{label}<small>({count})</small></button>)}</nav>
    {message&&<p role="status" className={styles.notice}>{message}</p>}
    <section className={styles.panel} aria-label={tabs.find(item=>item.id===tab)?.label}>
      {tab==="vocab"&&<>
  <div className={styles.row}>
    <h3 className={styles.panelTitle}>Từ vựng trong bài</h3>
    {onSaveVocabulary&&lesson.vocabList.length>0&&<button className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={()=>void save(lesson.vocabList)}><BookmarkPlus size={14}/>Lưu tất cả vào kho riêng</button>}
  </div>
  <div className={styles.grid2}>
    {lesson.vocabList.map((word,index)=>(
      <article key={word.id||`${word.hanzi}:${word.pinyin}:${index}`} className={styles.contentItem}>
        <div className={styles.row}>
          <h4 className={styles.chinese} lang="zh-CN">{word.hanzi}</h4>
          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.secondary}`} aria-label={`Nghe ${word.hanzi}`} onClick={()=>speak(word.hanzi)}><Volume2 size={14}/></button>
            {onSaveVocabulary&&<button disabled={busy} className={`${styles.button} ${styles.secondary}`} onClick={()=>void save([word])} aria-label={`Lưu riêng ${word.hanzi}`}><BookmarkPlus size={14}/></button>}
          </div>
        </div>
        <p className={styles.pinyin}>{word.pinyin}</p>
        {(word.type||word.wordType)&&<span className={styles.tag}>{word.type||word.wordType}</span>}
        <p className={styles.meaning}>{word.meaningVi||word.meaning}</p>
        
        {word.usageExplanation&&(
          <div className="mt-3 rounded-lg bg-[#FAF7F0] p-3 text-xs leading-5 text-[#443822] border border-[#EBE3D3]">
            <strong className="font-semibold text-[#8F6D3B]">💡 Cách dùng: </strong>{word.usageExplanation}
          </div>
        )}

        {word.usagePatterns&&word.usagePatterns.length>0&&(
          <div className="mt-2 flex flex-wrap gap-1.5">
            {word.usagePatterns.map((pat,idx)=>(
              <span key={idx} className="rounded-md bg-[#F0EDE4] px-2 py-0.5 text-xs text-[#2A4B3A] font-medium border border-[#DDD6C5]">{pat}</span>
            ))}
          </div>
        )}

        {word.examples&&word.examples.length>0?(
          <div className="mt-4 border-t border-[#E5DEC9] pt-3 space-y-2.5">
            <span className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">Ví dụ minh họa:</span>
            {word.examples.map((ex,exIdx)=>(
              <div key={exIdx} className="rounded-lg bg-[#FAF8F3] p-2.5 border border-[#EFE8DA] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-sm font-semibold text-[#204434]" lang="zh-CN">{ex.zh}</p>
                  <button className="text-[#8F6D3B] hover:text-[#204434]" aria-label={`Nghe ${ex.zh}`} onClick={()=>speak(ex.zh)}><Volume2 size={13}/></button>
                </div>
                {ex.pinyin&&<p className={styles.pinyin}>{ex.pinyin}</p>}
                <p className="text-xs text-[#5D6B60]">{ex.vi}</p>
              </div>
            ))}
          </div>
        ):(word.exampleZh&&(
          <div className="mt-4 border-t border-[#E5DEC9] pt-3">
            <p className="text-sm leading-7" lang="zh-CN">{word.exampleZh}</p>
            {word.examplePy&&<p className={styles.pinyin}>{word.examplePy}</p>}
            {word.exampleVi&&<p className={styles.muted}>{word.exampleVi}</p>}
          </div>
        ))}

        {word.commonMistakes&&word.commonMistakes.length>0&&(
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚠️</span> Lỗi sai thường gặp ({word.commonMistakes.length} ví dụ cần tránh):
            </div>
            {word.commonMistakes.map((m,mIdx)=>(
              <div key={mIdx} className="rounded-lg bg-white/80 p-2.5 border border-amber-100 space-y-1 shadow-xs">
                <p className="text-rose-700 font-medium">❌ <span className="line-through">{m.incorrect}</span></p>
                {m.correct&&<p className="text-emerald-700 font-medium"> {m.correct}</p>}
                {m.explanation&&<p className="text-[#645037] text-[11px] leading-relaxed italic">ℹ️ {m.explanation}</p>}
              </div>
            ))}
          </div>
        )}
      </article>
    ))}
  </div>
  {!lesson.vocabList.length&&<p className={styles.empty}>Phần từ vựng chưa có nội dung.</p>}
</>}
      {tab==="grammar"&&<>
  <h3 className={styles.panelTitle}>Hiểu cấu trúc, dùng đúng câu</h3>
  <div className={styles.stack}>
    {lesson.grammarList.map((grammar,index)=>(
      <article className={styles.contentItem} key={`${grammar.title}:${index}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={styles.tag}>Ngữ pháp {index+1}</span>
          {grammar.titleZh&&<span className="font-serif text-sm font-semibold text-[#8F6D3B]">{grammar.titleZh}</span>}
        </div>
        <h4 className="mt-3 font-serif text-xl font-bold">{grammar.title}</h4>
        {grammar.summary&&<p className="mt-1 text-xs text-[#5D6B60] italic">{grammar.summary}</p>}
        <p className="my-4 rounded-xl border border-[#E5DEC9] bg-[#f4efdf] p-4 text-sm leading-7 font-mono font-semibold text-[#204434]">{grammar.structure}</p>
        {grammar.usageExplanation&&<p className={`${styles.meaning} mb-3`}>{grammar.usageExplanation}</p>}
        {!grammar.usageExplanation&&grammar.explanation&&<p className={`${styles.meaning} mb-3`}>{grammar.explanation}</p>}

        {grammar.usageSteps&&grammar.usageSteps.length>0&&(
          <div className="my-3 rounded-xl bg-[#FAF8F3] p-3.5 border border-[#E8DFC9] space-y-1.5">
            <span className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">Các bước áp dụng:</span>
            <ol className="list-decimal pl-4 text-xs text-[#3E4D42] space-y-1">
              {grammar.usageSteps.map((step,sIdx)=><li key={sIdx}>{step}</li>)}
            </ol>
          </div>
        )}

        {grammar.examples&&grammar.examples.length>0?(
          <div className="mt-4 border-t border-[#E5DEC9] pt-3 space-y-2.5">
            <span className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider">Ví dụ ứng dụng:</span>
            {grammar.examples.map((ex,exIdx)=>(
              <div key={exIdx} className="rounded-lg bg-[#FAF8F3] p-3 border border-[#EFE8DA] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-base font-semibold text-[#204434]" lang="zh-CN">{ex.zh}</p>
                  <button className="text-[#8F6D3B] hover:text-[#204434]" aria-label={`Nghe ${ex.zh}`} onClick={()=>speak(ex.zh)}><Volume2 size={13}/></button>
                </div>
                {ex.pinyin&&<p className={styles.pinyin}>{ex.pinyin}</p>}
                <p className="text-xs text-[#3E4D42]">{ex.vi}</p>
                {ex.explanationVi&&<p className="text-[11px] text-[#8F6D3B] italic pt-1 border-t border-dashed border-[#E5DEC9]">{ex.explanationVi}</p>}
              </div>
            ))}
          </div>
        ):(grammar.example&&(
          <div className="mt-4 border-t border-[#E5DEC9] pt-3">
            <p className={styles.chinese} lang="zh-CN">{grammar.example}</p>
          </div>
        ))}

        {grammar.usageContexts&&grammar.usageContexts.length>0&&(
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-[#8F6D3B]">Ngữ cảnh:</span>
            {grammar.usageContexts.map((ctx,cIdx)=>(
              <span key={cIdx} className="rounded-md bg-[#F0EDE4] px-2 py-0.5 text-[#2A4B3A] border border-[#DDD6C5]">{ctx}</span>
            ))}
          </div>
        )}

        {grammar.comparison&&(
          <div className="mt-3 rounded-xl bg-blue-50/70 border border-blue-200 p-3 text-xs text-blue-950 space-y-1">
            <strong className="font-semibold text-blue-900">🔍 So sánh & Phân biệt: </strong>
            <p className="leading-relaxed">{grammar.comparison}</p>
          </div>
        )}

        {grammar.commonMistakes&&((Array.isArray(grammar.commonMistakes)?grammar.commonMistakes.length>0:Boolean(grammar.commonMistakes)))&&(
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚠️</span> Lỗi ngữ pháp thường gặp:
            </div>
            {Array.isArray(grammar.commonMistakes)?(
              grammar.commonMistakes.map((m:any,mIdx:number)=>(
                <div key={mIdx} className="rounded-lg bg-white/80 p-2.5 border border-amber-100 space-y-1 shadow-xs">
                  {typeof m === 'string' ? (
                    <p className="text-amber-900">{m}</p>
                  ) : (
                    <>
                      <p className="text-rose-700 font-medium">❌ <span className="line-through">{m.incorrect}</span></p>
                      {m.correct&&<p className="text-emerald-700 font-medium"> {m.correct}</p>}
                      {m.explanation&&<p className="text-[#645037] text-[11px] leading-relaxed italic">ℹ️ {m.explanation}</p>}
                    </>
                  )}
                </div>
              ))
            ):(
              <p className="text-amber-900">{String(grammar.commonMistakes)}</p>
            )}
          </div>
        )}
      </article>
    ))}
  </div>
  {!lesson.grammarList.length&&<p className={styles.empty}>Phần ngữ pháp chưa có nội dung.</p>}
</>}
      {tab==="dialogue"&&<><h3 className={styles.panelTitle}>Hội thoại theo ngữ cảnh</h3><div className={styles.stack}>{lesson.dialogue.map((line,index)=><article key={`${index}:${line.speaker}`} className={styles.dialogue}><div className={styles.row}><strong className="text-xs text-[#8f6d3b]">{line.speaker}</strong><button className={`${styles.button} ${styles.secondary}`} aria-label={`Nghe hội thoại ${index+1}`} onClick={()=>speak(line.zh)}><Volume2 size={14}/></button></div><p className={styles.chinese} lang="zh-CN">{line.zh}</p>{line.pinyin&&<p className={styles.pinyin}>{line.pinyin}</p>}<p className={styles.meaning}>{line.vi}</p></article>)}</div>{!lesson.dialogue.length&&<p className={styles.empty}>Phần hội thoại chưa có nội dung.</p>}</>}
      {tab==="reading"&&(
        lesson.reading?.contentZh
          ? <LessonRichSections lesson={{...fullLesson,culturalNote:undefined}} />
          : <p className={styles.empty}>Bài này chưa có bài đọc hiểu. Giáo viên có thể bổ sung trong phần soạn bài.</p>
      )}
      {tab==="culture_detail"&&(
        (lesson.culturalNote||lesson.culture)
          ? <LessonRichSections lesson={{...fullLesson,reading:undefined}} />
          : <p className={styles.empty}>Bài này chưa có nội dung văn hóa giao tiếp. Giáo viên có thể bổ sung trong phần soạn bài.</p>
      )}
      {tab==="phonetics"&&<><h3 className={styles.panelTitle}>Ngữ âm</h3>{(lesson.phonetics.title||lesson.phonetics.rule||lesson.phonetics.examples.length>0)&&<article className={styles.contentItem}><h4 className="font-serif text-lg font-bold">{lesson.phonetics.title||"Ngữ âm"}</h4>{lesson.phonetics.rule&&<p className={`${styles.meaning} whitespace-pre-wrap`}>{lesson.phonetics.rule}</p>}<div className="mt-4 flex flex-wrap gap-2">{lesson.phonetics.examples.map((example,index)=><button key={`${example}:${index}`} className={`${styles.button} ${styles.secondary}`} onClick={()=>speak(example)}><Volume2 size={12}/>{example}</button>)}</div></article>}{!lesson.phonetics.title&&!lesson.phonetics.rule&&!lesson.phonetics.examples.length&&!lesson.culture&&<p className={styles.empty}>Phần ngữ âm chưa có nội dung.</p>}</>}
    </section>
  </div>;
}
