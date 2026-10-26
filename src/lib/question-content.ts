import {parseCurriculumCsv} from "./curriculum-format";
export type QuestionDraft = Record<string, any>;
export const QUESTION_TYPES = ["multiple_choice","matching","flashcard","fill_blank","sentence_order","true_false","handwriting_photo","essay","translation","find_error","listening_choice","listening_fill"];
export const canonicalQuestionType = (type:string) => ({listening_mcq:"listening_choice",single_choice:"multiple_choice",short_answer:"fill_blank",sentence_ordering:"sentence_order"}[type]||type);
export function newQuestion(type="multiple_choice",source:QuestionDraft={}):QuestionDraft {
 return {schemaVersion:2,type:canonicalQuestionType(type),status:"DRAFT",title:"",content:"",points:type==="flashcard"?0:5,difficulty:"EASY",hskLevel:source.hskLevel||1,curriculum:source.curriculum||"HSK 3.0",sourceLesson:source.sourceLesson||"",sourceContent:source.sourceContent||"",options:["","","",""],selectionMode:"SINGLE",correctChoices:[],matchingPairs:[{id:"pair-1",rightId:"right-first",left:"",right:""}],shuffleMatching:true,blanks:[{id:"blank-1",answer:"",alternatives:""}],tokens:[],tokenIds:[],flashcard:{front:"",backPinyin:"",backVi:"",exampleZh:""},flashcards:[],handwritingCount:5,essayMin:0,essayMax:500,translationDirection:"ZH_TO_VI",errorTokens:[],errorMode:"TOKENS",gradingMode:"MANUAL",maxAudioPlays:2,audioUrl:"",transcript:"",explanation:"",rubric:"",sampleAnswer:"",acceptedAnswers:[],maxUploadBytes:1000000};
}
export function prepareQuestion(raw:QuestionDraft):QuestionDraft {
 const q:QuestionDraft={...raw,type:canonicalQuestionType(raw.type||"multiple_choice")};
 if(!QUESTION_TYPES.includes(q.type))throw new Error("Dạng câu hỏi không được hỗ trợ.");
 if(q.schemaVersion!==2)return q;
 const ready=q.status==="READY",fail=(test:boolean,message:string)=>{if(ready&&test)throw new Error(message);};
 if(!Number.isFinite(Number(q.points))||Number(q.points)<0)throw new Error("Điểm tối đa phải là số từ 0 trở lên.");
 fail(!String(q.content||"").trim()&&q.type!=="flashcard","Cần nhập đề bài.");
 if(["multiple_choice","listening_choice"].includes(q.type)) {
  fail(!Array.isArray(q.options)||q.options.length<2||q.options.some((item:unknown)=>typeof item!=="string"||!item.trim()),"Cần ít nhất hai phương án đầy đủ.");
  const choices=Array.isArray(q.correctChoices)?q.correctChoices:[];
  fail(!choices.length||choices.some((id:string)=>!q.options?.[id.charCodeAt(0)-65]),"Chọn đáp án đúng hợp lệ.");
  fail(q.selectionMode!=="MULTIPLE"&&choices.length!==1,"Chế độ một đáp án cần đúng một lựa chọn.");
  q.correctAnswer=q.selectionMode==="MULTIPLE"?JSON.stringify([...choices].sort()):choices[0]||"";
 }
 if(q.type==="matching") {const pairs=q.matchingPairs||[];fail(!pairs.length||pairs.some((item:any)=>!item.id||!item.left?.trim()||!item.right?.trim()),"Nhập đầy đủ từng cặp nối.");fail(new Set(pairs.map((pair:any)=>pair.id)).size!==pairs.length,"Mã cặp nối không được trùng.");q.correctAnswer=JSON.stringify(Object.fromEntries(pairs.map((pair:any)=>[pair.id,pair.rightId||pair.id])));}
 if(["fill_blank","listening_fill"].includes(q.type)) {const blanks=q.blanks||[];fail(!blanks.length||blanks.some((blank:any)=>!blank.id||!blank.answer?.trim()),"Nhập đáp án chính xác cho từng ô trống.");fail(new Set(blanks.map((blank:any)=>blank.id)).size!==blanks.length,"Mã ô trống không được trùng.");const slots=String(q.content||"").match(/\[_+\]|_{2,}|\{\{[^}]+\}\}/g)||[];fail(slots.length!==blanks.length,"Số ô trống trong câu phải khớp danh sách đáp án.");q.correctAnswer=JSON.stringify(Object.fromEntries(blanks.map((blank:any)=>[blank.id,blank.answer])));}
 if(q.type==="sentence_order") {fail(!q.tokens?.length||q.tokens.some((token:string)=>!token.trim()),"Cần nhập các thẻ từ.");fail(q.tokenIds?.length!==q.tokens?.length,"Mã thẻ từ không khớp.");q.correctAnswer=JSON.stringify(q.tokenIds||[]);}
 if(q.type==="true_false")fail(!["true","false"].includes(q.correctAnswer),"Chọn Đúng hoặc Sai.");
 if(q.type==="flashcard") {fail(!q.flashcard?.front?.trim()||!q.flashcard?.backVi?.trim(),"Flashcard cần chữ Hán và nghĩa tiếng Việt.");for(const card of q.flashcards||[])fail(!card.front?.trim()||!card.backVi?.trim(),"Nhập đầy đủ các thẻ bổ sung.");q.correctAnswer="";}
 if(q.type==="sentence_order")fail(new Set(q.tokenIds||[]).size!==q.tokenIds?.length,"Mã thẻ từ không được trùng.");
 if(q.type==="essay")fail(!Number.isInteger(q.essayMin)||!Number.isInteger(q.essayMax)||q.essayMin<0||q.essayMax<q.essayMin,"Giới hạn số chữ không hợp lệ.");
 if(q.type==="translation"){fail(!q.sampleAnswer?.trim(),"Cần bản dịch tham khảo.");q.correctAnswer=q.sampleAnswer||"";}
 if(q.type==="find_error"){fail(!q.errorTokens?.length||!q.errorTokens.some((token:any)=>token.isError),"Đánh dấu ít nhất một cụm từ sai.");fail(!q.sampleAnswer?.trim(),"Nhập câu sửa đúng.");q.correctAnswer=JSON.stringify(q.errorTokens?.filter((token:any)=>token.isError).map((token:any)=>token.id)||[]);}
 if(["handwriting_photo","essay","translation"].includes(q.type))fail(!q.rubric?.trim(),"Cần tiêu chí chấm tay.");
 if(["listening_choice","listening_fill"].includes(q.type)) {fail(!/^(https?:\/\/|\/(?!sample-audio\/)|data:audio\/)/i.test(q.audioUrl||""),"Tải lên file nghe thật hoặc nhập nguồn âm thanh hợp lệ.");fail(!Number.isInteger(q.maxAudioPlays)||q.maxAudioPlays<1,"Số lượt nghe phải từ 1 trở lên.");}
 return q;
}
const normalize=(value:unknown)=>String(value??"").normalize("NFC").trim().toLocaleLowerCase();
function decode(value:string,fallback:any){try{return JSON.parse(value);}catch{return fallback;}}
const alternatives=(value:unknown)=>Array.isArray(value)?value.map(String):String(value||"").split(/\s*[,|]\s*/).filter(Boolean);
export function gradeQuestion(q:QuestionDraft,value:string):{manual:boolean;correct:boolean} {
 q={...(q.editorData||{}),...q,type:canonicalQuestionType(q.type)};
 const manual=["handwriting_photo","essay","translation","speaking","audio","writing","speaking_audio"].includes(q.type)||(q.type==="find_error"&&q.schemaVersion===2&&(q.gradingMode!=="AUTO"||q.errorMode!=="TOKENS"));
 if(manual)return{manual:true,correct:false};
 if(["fill_blank","listening_fill"].includes(q.type)&&q.blanks?.some((blank:any)=>blank.answer?.trim())) {
  const answers=decode(value,{});return{manual:false,correct:q.blanks.every((blank:any,index:number)=>{const actual=q.blanks.length===1&&typeof answers!=="object"?value:answers[blank.id]??(q.blanks.length===1?value:"");return [blank.answer,...alternatives(blank.alternatives)].some(expected=>normalize(actual)!==""&&normalize(actual)===normalize(expected));})};
 }
 if(q.type==="true_false"){const truth=(v:unknown)=>["true","đúng","a"].includes(normalize(v))?"true":["false","sai","b"].includes(normalize(v))?"false":normalize(v);return{manual:false,correct:truth(value)===truth(q.correctAnswer)};}
 if(q.type==="matching") {const actual=decode(value,{}),expected=decode(q.correctAnswer,{});return{manual:false,correct:Object.keys(expected).length>0&&Object.keys(actual).length===Object.keys(expected).length&&Object.keys(expected).every(id=>normalize(actual[id])===normalize(expected[id]))};}
 if(q.schemaVersion===2&&((q.type==="multiple_choice"||q.type==="listening_choice")&&q.selectionMode==="MULTIPLE"||q.type==="find_error")) {const actual=decode(value,[]),expected=decode(q.correctAnswer,[]);return{manual:false,correct:Array.isArray(actual)&&Array.isArray(expected)&&expected.length>0&&JSON.stringify([...new Set(actual)].sort())===JSON.stringify([...expected].sort())};}
 if(q.type==="sentence_order") {const actual=decode(value,null),expected=decode(q.correctAnswer,null);if(Array.isArray(actual)&&Array.isArray(expected)&&JSON.stringify(actual)===JSON.stringify(expected))return{manual:false,correct:true};const assembled=Array.isArray(actual)&&q.tokenIds?actual.map(id=>q.tokens[q.tokenIds.indexOf(id)]||"").join(""):value;const target=Array.isArray(actual)&&q.schemaVersion===2?null:Array.isArray(expected)&&q.tokens?q.tokens.join(""):q.correctAnswer;return{manual:false,correct:[...(target===null?[]:[target]),...alternatives(q.acceptedAnswers)].some(answer=>normalize(assembled).replace(/\s/g,"")===normalize(answer).replace(/\s/g,""))};}
 return{manual:false,correct:String(q.correctAnswer||"").split("|").some(answer=>normalize(value)!==""&&normalize(value)===normalize(answer))};
}
export function importQuestionCsv(text:string):QuestionDraft[] {
 return parseCurriculumCsv(text).map((row,index)=> {
  const type=canonicalQuestionType(String(row.type||"")),answer=String(row.correctAnswer??row.correct??row.answer??"");
  if(!QUESTION_TYPES.includes(type))throw new Error(`Dòng ${index+2}: dạng câu hỏi không hợp lệ.`);
  if(!answer.trim()&&!["essay","translation","handwriting_photo","flashcard"].includes(type))throw new Error(`Dòng ${index+2}: thiếu cột correctAnswer/answer, không tự đặt đáp án A.`);
  const points=row.points==null||row.points===""?(type==="flashcard"?0:5):Number(row.points);
  if(!Number.isFinite(points)||points<0)throw new Error(`Dòng ${index+2}: điểm không hợp lệ.`);
  return {type,content:String(row.content||""),title:String(row.title||row.content||""),status:"READY",pinyin:String(row.pinyin||""),correctAnswer:answer,options:[row.optionA??row.optA,row.optionB??row.optB,row.optionC??row.optC,row.optionD??row.optD].filter(value=>value!==undefined&&value!=="").map(String),points,explanation:String(row.explanation||""),hskLevel:Number(row.hskLevel||row.level||1),curriculum:String(row.curriculum||"HSK 3.0"),sourceLesson:String(row.sourceLesson||"Nhập CSV"),blanks:["fill_blank","listening_fill"].includes(type)?[{id:"blank-1",answer,alternatives:String(row.alternatives||"")}]:undefined};
 });
}

export function publicQuestion(q:QuestionDraft):QuestionDraft {
 const v={...(q.editorData||{}),...q};
 return {schemaVersion:2,id:q.id,type:canonicalQuestionType(q.type),content:q.content,options:typeof q.options==="string"?decode(q.options,[]):q.options||[],pinyin:v.pinyin||q.pinyinPrompt,audioUrl:q.audioUrl,selectionMode:v.selectionMode,maxAudioPlays:v.maxAudioPlays,handwritingCount:v.handwritingCount,maxUploadBytes:Math.min(v.maxUploadBytes||1000000,1000000),essayMin:v.essayMin,essayMax:v.essayMax,translationDirection:v.translationDirection,errorMode:v.errorMode,errorTokens:v.errorTokens?.map((item:any)=>({id:item.id,text:item.text})),blanks:v.blanks?.map((item:any)=>({id:item.id})),matchingLeftItems:v.matchingPairs?.map((item:any)=>({id:item.id,text:item.left})),matchingRightItems:(v.shuffleMatching===false?v.matchingPairs:[...(v.matchingPairs||[])].reverse())?.map((item:any)=>({id:item.rightId||item.id,text:item.right})),tokenItems:(v.tokens||[]).map((text:string,index:number)=>({id:v.tokenIds?.[index],text})).reverse(),flashcard:v.type==="flashcard"?v.flashcard:undefined,flashcards:v.type==="flashcard"?v.flashcards:undefined};
}
