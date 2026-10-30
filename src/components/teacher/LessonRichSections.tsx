"use client";
import type {FullLessonDetail, CulturalNoteItem, ReadingItem} from "@/lib/lesson-data";
import {getCulturalSelectionItems} from "@/lib/lesson-data";
import {pinyin} from "pinyin-pro";
import {Volume2} from "lucide-react";

function speak(text: string) {if (!text || !window.speechSynthesis) return;window.speechSynthesis.cancel();const voice = new SpeechSynthesisUtterance(text);voice.lang = "zh-CN";window.speechSynthesis.speak(voice);}
const card = "rounded-2xl border border-[#E5DEC9] bg-[#FFFCF6] p-5 space-y-3 min-w-0";
function Audio({text}: {text: string}) {return <button type="button" aria-label={`Nghe ${text}`} onClick={() => speak(text)} className="inline-flex items-center gap-2 rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs"><Volume2 size={14}/>Nghe phát âm</button>;}
type Props = {lesson: FullLessonDetail; readingSelected?: boolean; onReadingChange?: (value:boolean)=>void; wordIds?:string[]; onWordsChange?:(ids:string[])=>void; cultureIds?:string[]; onCultureChange?:(id:string)=>void};
export default function LessonRichSections({lesson,readingSelected,onReadingChange,wordIds=[],onWordsChange,cultureIds=[],onCultureChange}:Props) {
 const reading=lesson.reading, words=reading?.extraVocabs||[], items=getCulturalSelectionItems(lesson);
 const select=(id:string,label:string,checked:boolean,onChange?:()=>void)=>onChange?<label className="flex items-start gap-2 text-xs font-semibold"><input type="checkbox" aria-label={label} checked={checked} onChange={onChange}/>{label}</label>:null;
 const groups=[{title:"1. Bối cảnh sử dụng",types:["CONTEXT","SCENARIO"]},{title:"2. Mẫu câu vàng khuyên dùng",types:["PHRASE"]},{title:"3. Cách nói lịch sự & Tôn trọng",types:["POLITE"]},{title:"4. Lưu ý & Cấm kỵ văn hóa",types:["CAUTION"]},{title:"5. Đối tượng phù hợp",types:["TARGET_AUDIENCE"]}];
 return <div className="space-y-6 text-[#204434]" data-rich-lesson>
  <section className={`${card} space-y-5`}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-lg font-bold">04 · Luyện đọc hiểu & Ngữ cảnh</h3>{reading&&select(reading.id,"Chọn toàn bộ bài đọc",!!readingSelected, onReadingChange?()=>onReadingChange(!readingSelected):undefined)}</div>
   {reading?.contentZh ? (
      <div className="space-y-5">
        <article className="space-y-4 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F0] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-serif text-xl font-bold">{reading.titleZh}</h4>
              <p className="text-sm text-[#8F6D3B]">{reading.titleVi}</p>
            </div>
            <Audio text={reading.contentZh} />
          </div>
          <p className="whitespace-pre-wrap font-serif text-xl leading-loose">{reading.originalText || reading.contentZh}</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#8F6D3B]">{reading.contentPy || pinyin(reading.contentZh)}</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#2A4B3A] border-t border-[#E5DEC9] pt-3">{reading.translation || reading.contentVi || "Bài đọc chưa có bản dịch tiếng Việt."}</p>
        </article>

        {(reading.mainIdea || reading.analysisExplanation || (reading.keywords && reading.keywords.length > 0) || reading.commonTrap || reading.readingTip) && (
          <div className="space-y-4 rounded-2xl border border-[#D5CBB2] bg-[#FAF8F3] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-3">
              <span className="text-lg">📊</span>
              <h4 className="font-serif text-lg font-bold text-[#2A4B3A]">Phân tích bài đọc chuyên sâu</h4>
            </div>

            {reading.analysisExplanation && (
              <div className="rounded-xl bg-white p-4 border border-[#EBE3D3] space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F6D3B]">📖 Phân tích tổng quan:</span>
                <p className="text-xs leading-relaxed text-[#3E4D42]">{reading.analysisExplanation}</p>
              </div>
            )}

            {reading.mainIdea && (
              <div className="rounded-xl bg-white p-4 border border-[#EBE3D3] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8F6D3B]">
                  <span>📌</span> Ý chính toàn bài (Main Idea)
                </div>
                <p className="text-sm font-semibold text-[#204434]">{reading.mainIdea}</p>
                {reading.mainIdeaExplanation && (
                  <p className="text-xs text-[#5D6B60] leading-relaxed italic border-t border-dashed border-[#E5DEC9] pt-1.5">
                    <strong>Giải thích ý chính: </strong>{reading.mainIdeaExplanation}
                  </p>
                )}
              </div>
            )}

            {reading.mainEvent && (
              <div className="rounded-xl bg-white p-4 border border-[#EBE3D3] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8F6D3B]">
                  <span>🎯</span> Sự kiện / Diễn biến chính (Main Event)
                </div>
                <p className="text-xs text-[#204434] leading-relaxed font-medium">{reading.mainEvent}</p>
              </div>
            )}

            {reading.keySentence && (
              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span>🔑</span> Câu then chốt (Key Sentence)
                </div>
                <p className="font-serif text-base font-bold text-emerald-950">{reading.keySentence}</p>
                {reading.evidenceExplanation && (
                  <p className="text-xs text-emerald-800 leading-relaxed pt-1 border-t border-dashed border-emerald-200">
                    <strong className="font-semibold">Dẫn chứng & Cơ sở: </strong>{reading.evidenceExplanation}
                  </p>
                )}
              </div>
            )}

            {reading.keywords && reading.keywords.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8F6D3B]">
                  <span>🏷️</span> Từ khóa quan trọng (Keywords)
                </div>
                <div className="flex flex-wrap gap-2">
                  {reading.keywords.map((kw, i) => (
                    <span key={i} className="rounded-lg bg-[#EAE5D8] px-3 py-1 text-xs font-semibold text-[#204434] border border-[#DDD6C5]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reading.secondaryDetails && reading.secondaryDetails.length > 0 && (
              <div className="rounded-xl bg-white p-4 border border-[#EBE3D3] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8F6D3B]">
                  <span>📝</span> Chi tiết bổ trợ (Secondary Details)
                </div>
                <ul className="list-disc pl-5 text-xs text-[#3E4D42] space-y-1 leading-relaxed">
                  {reading.secondaryDetails.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {reading.commonTrap && (
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wider">
                  <span>⚠️</span> Bẫy đề thi cần tránh (Common Trap)
                </div>
                <p className="text-amber-950 leading-relaxed">{reading.commonTrap}</p>
              </div>
            )}

            {reading.readingTip && (
              <div className="rounded-xl bg-sky-50 p-4 border border-sky-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-sky-900 uppercase tracking-wider">
                  <span>💡</span> Mẹo đọc hiểu & Định vị thông tin (Reading Tip)
                </div>
                <p className="text-sky-950 leading-relaxed">{reading.readingTip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-[#6B766D]">Chưa có bài đọc riêng. Thêm nội dung ở mục Chỉnh sửa học liệu; phần văn hóa không được dùng thay bài đọc.</p>
    )}
   {!!words.length&&<div className="space-y-4"><div className="flex flex-wrap justify-between gap-3"><h4 className="font-bold">Từ vựng mở rộng ({words.length})</h4>{onWordsChange&&<button type="button" className="text-xs underline" onClick={()=>onWordsChange(wordIds.length===words.length?[]:words.map((word,index)=>word.id||`${reading!.id}-word-${index}`))}>{wordIds.length===words.length?"Bỏ chọn từ mở rộng":"Chọn tất cả từ mở rộng"}</button>}</div><div className="grid gap-4 md:grid-cols-2">{words.map((word,index)=>{const id=word.id||`${reading!.id}-word-${index}`;return <article key={id} className={card}>{select(id,`Chọn từ ${word.hanzi}`,wordIds.includes(id),onWordsChange?()=>onWordsChange(wordIds.includes(id)?wordIds.filter(value=>value!==id):[...wordIds,id]):undefined)}<h5 className="font-serif text-2xl font-bold">{word.hanzi}</h5><p className="text-[#8F6D3B]">{word.pinyin||pinyin(word.hanzi)}</p><p className="text-sm">{word.meaningVi}</p><Audio text={word.hanzi}/>{word.exampleZh&&<div className="space-y-1 border-t border-[#E5DEC9] pt-3 text-sm"><p>{word.exampleZh}</p><p className="text-[#8F6D3B]">{word.examplePy||pinyin(word.exampleZh)}</p><p>{word.exampleVi}</p></div>}</article>;})}</div></div>}
  </section>
  <section className={`${card} space-y-6`}><h3 className="font-serif text-lg font-bold">05 · Văn hóa giao tiếp & Cách sử dụng thực tế</h3>{groups.map(group=>{const rows=items.filter(item=>group.types.includes(item.type));if(!rows.length)return null;return <div key={group.title} className="space-y-3"><h4 className="font-bold">{group.title}</h4><div className="grid gap-4 md:grid-cols-2">{rows.map(item=><article key={item.id} className={`${card} ${["CONTEXT","SCENARIO"].includes(item.type)||((item.content?.length||0)>280)?"md:col-span-2":""} ${item.type==="CAUTION"?"border-[#DDBDB4]":""}`}>{select(item.id,`Chọn ${item.categoryLabel}`,cultureIds.includes(item.id),onCultureChange?()=>onCultureChange(item.id):undefined)}{item.zh?<><p className="font-serif text-xl font-bold">{item.zh}</p><p className="text-sm text-[#8F6D3B]">{item.py||pinyin(item.zh)}</p><p className="text-sm">{item.vi||"Chưa có bản dịch tiếng Việt."}</p>{item.note&&<p className="text-sm leading-7">{item.note}</p>}<Audio text={item.zh}/></>:<p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>}</article>)}</div></div>;})}{!items.length&&<p className="text-sm text-[#6B766D]">Chưa có thông tin văn hóa giao tiếp.</p>}</section>
 </div>;
}

export function filterSelectedCulture(lesson:FullLessonDetail,ids:string[]):CulturalNoteItem {
 const c=lesson.culturalNote||{},has=(suffix:string)=>ids.includes(`cult-${lesson.id}-${suffix}`);
 return {context:has("context")?c.context:"",targetAudience:has("audience")?c.targetAudience:"",naturalExpressions:c.naturalExpressions?.filter((_,index)=>has(`phrase-${index}`)),politeExpressions:c.politeExpressions?.filter((_,index)=>has(`polite-${index}`)),cautionNotes:c.cautionNotes?.filter((_,index)=>has(`caution-${index}`)),practiceScenario:has("scenario")?c.practiceScenario:"",comparisonNote:has("comparison")?c.comparisonNote:""};
}

export function RichReadingEditor({value,onChange}:{value:ReadingItem;onChange:(value:ReadingItem)=>void}) {
 const fields=[['titleZh','Tiêu đề tiếng Trung'],['titleVi','Tiêu đề tiếng Việt'],['contentZh','Nội dung bài đọc'],['contentPy','Pinyin bài đọc'],['contentVi','Bản dịch tiếng Việt']] as const;
 const input="mt-2 w-full rounded-xl border border-[#E5DEC9] bg-white p-3 text-sm";
 return <div className="space-y-4">{fields.map(([key,label])=><label key={key} className="block text-sm">{label}<textarea className={input} rows={key.startsWith('content')?4:1} value={value[key]} onChange={event=>onChange({...value,[key]:event.target.value})}/></label>)}<h4 className="font-bold">Từ vựng mở rộng</h4>{value.extraVocabs?.map((word,index)=><fieldset key={index} className={`${card} grid gap-3 sm:grid-cols-2`}>{(['hanzi','pinyin','meaningVi','exampleZh','examplePy','exampleVi'] as const).map((key,i)=><label key={key} className="text-xs">{['Chữ Hán','Pinyin','Nghĩa Việt','Ví dụ tiếng Trung','Pinyin ví dụ','Dịch ví dụ'][i]}<input className={input} value={word[key]||""} onChange={event=>onChange({...value,extraVocabs:value.extraVocabs?.map((item,n)=>n===index?{...item,[key]:event.target.value}:item)})}/></label>)}<button onClick={()=>onChange({...value,extraVocabs:value.extraVocabs?.filter((_,n)=>n!==index)})}>Xóa từ này</button></fieldset>)}<button className="rounded-xl border border-[#E5DEC9] p-3 text-sm" onClick={()=>onChange({...value,extraVocabs:[...(value.extraVocabs||[]),{id:crypto.randomUUID(),hanzi:"",pinyin:"",meaningVi:""}]})}>+ Thêm từ mở rộng</button></div>;
}

export function RichCultureEditor({value,onChange}:{value:CulturalNoteItem;onChange:(value:CulturalNoteItem)=>void}) {
 const input="mt-2 w-full rounded-xl border border-[#E5DEC9] bg-white p-3 text-sm";
 return <div className="space-y-5">{([['context','Bối cảnh sử dụng (mô tả ngắn)'],['targetAudience','Đối tượng phù hợp'],['comparisonNote','Lưu ý ngữ dụng'],['practiceScenario','Tình huống thực hành']] as const).map(([key,label])=><label key={key} className="block text-sm">{label}<textarea maxLength={key==='context'?1200:30000} className={input} value={value[key]||""} onChange={event=>onChange({...value,[key]:event.target.value})}/></label>)}{(['naturalExpressions','politeExpressions'] as const).map((key,group)=><div key={key} className="space-y-3"><h4 className="font-bold">{group?'Cách nói lịch sự & Tôn trọng':'Mẫu câu vàng khuyên dùng'}</h4>{value[key]?.map((phrase,index)=><fieldset className={`${card} grid gap-3 sm:grid-cols-2`} key={index}>{(['zh','py','vi',group?'note':'usage'] as const).map((field,i)=><label key={field} className="text-xs">{['Chữ Hán','Pinyin','Nghĩa tiếng Việt',group?'Giải thích và lưu ý':'Tình huống sử dụng'][i]}<textarea className={input} value={(phrase as Record<string,string>)[field]||""} onChange={event=>onChange({...value,[key]:value[key]?.map((item,n)=>n===index?{...item,[field]:event.target.value}:item)})}/></label>)}<button onClick={()=>onChange({...value,[key]:value[key]?.filter((_,n)=>n!==index)})}>Xóa mẫu câu</button></fieldset>)}<button className="rounded-xl border border-[#E5DEC9] p-3 text-sm" onClick={()=>onChange({...value,[key]:[...(value[key]||[]),{zh:"",py:"",vi:""}]})}>+ Thêm mẫu câu</button></div>)}<h4 className="font-bold">Lưu ý & Cấm kỵ văn hóa</h4>{value.cautionNotes?.map((note,index)=><div key={index} className="flex gap-3"><textarea className={input} value={note} onChange={event=>onChange({...value,cautionNotes:value.cautionNotes?.map((item,n)=>n===index?event.target.value:item)})}/><button onClick={()=>onChange({...value,cautionNotes:value.cautionNotes?.filter((_,n)=>n!==index)})}>Xóa</button></div>)}<button className="rounded-xl border border-[#E5DEC9] p-3 text-sm" onClick={()=>onChange({...value,cautionNotes:[...(value.cautionNotes||[]),""]})}>+ Thêm lưu ý riêng</button></div>;
}
