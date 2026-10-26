import { blankLesson, normalizeLessons } from "./curriculum-format";
import type { Hsk1FullLesson } from "./hsk1-full-lessons";

type Row=Record<string,unknown>;
export function prepareClassContent(base:Hsk1FullLesson,selection:Row){
  const rawVocabs=Array.isArray(selection.selectedVocabs)?selection.selectedVocabs:base.vocabList;
  const vocabList=rawVocabs.map((value:Row)=>({...value,meaning:value.meaning??value.meaningVi,type:value.type??value.partOfSpeech??""}));
  const rawGrammars=Array.isArray(selection.selectedGrammars)?selection.selectedGrammars:base.grammarList;
  const grammarList=rawGrammars.map((value:Row)=>({...value,example:value.example??(Array.isArray(value.examples)?(value.examples[0] as Row)?.zh:"")??"",explanation:value.explanation??""}));
  const includeCulture=selection.includeCulture!==false;
  return normalizeLessons([{...base,vocabList,grammarList,dialogue:selection.hasDialogue===false?[]:Array.isArray(selection.selectedDialogue)?selection.selectedDialogue:base.dialogue,phonetics:includeCulture?(selection.phonetics??base.phonetics):blankLesson(1,1).phonetics,reading:selection.hasReading===false?undefined:selection.reading??base.reading,culturalNote:includeCulture?(selection.culturalNote??base.culturalNote):{},culture:includeCulture?(selection.culturalNote?"":selection.culture??base.culture):""}],1)[0];
}
export function storedClassContent(record:{lessonNumber:number;lessonId:string;titleZh:string;titleVi:string;pinyin?:string|null;content?:unknown;selectedVocabs?:string|null;selectedGrammars?:string|null;selectedDialogue?:string|null;hasDialogue?:boolean;hasReading?:boolean},base?:Hsk1FullLesson,level=1):Hsk1FullLesson{
  if(record.content&&typeof record.content==="object"&&!Array.isArray(record.content))return record.content as Hsk1FullLesson;
  const source=base||{...blankLesson(level,record.lessonNumber),id:record.lessonId,titleZh:record.titleZh,titleVi:record.titleVi,pinyin:record.pinyin||""};
  function parse(value:string|null|undefined,fallback:unknown){if(value===null||value===undefined)return fallback;try{const data=JSON.parse(value);return Array.isArray(data)?data:[];}catch{return[];}}
  return prepareClassContent(source,{selectedVocabs:parse(record.selectedVocabs,source.vocabList),selectedGrammars:parse(record.selectedGrammars,source.grammarList),selectedDialogue:parse(record.selectedDialogue,source.dialogue),hasDialogue:record.hasDialogue,includeCulture:record.hasReading});
}
