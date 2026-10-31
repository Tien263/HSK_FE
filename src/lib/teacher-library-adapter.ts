import {normalizeCulturalNote} from "./lesson-rich-content";
import type {Hsk1FullLesson} from "./hsk1-full-lessons";
import type {FullLessonDetail} from "./lesson-data";
export function teacherLibraryLesson(lesson: Hsk1FullLesson, level: number): FullLessonDetail {
  return {
    id: lesson.id,
    orderNumber: lesson.number,
    trackId: "hsk",
    levelId: `hsk${level}`,
    levelLabel: `HSK ${level}`,
    titleZh: lesson.titleZh,
    titlePy: lesson.pinyin,
    titleVi: lesson.titleVi,
    description: lesson.desc,
    thumbnailArt: "lesson5",
    stats: {
      vocabCount: lesson.vocabList.length,
      grammarCount: lesson.grammarList.length,
      dialogueCount: lesson.dialogue.length,
      readingCount: (lesson.reading?.contentZh || lesson.reading?.originalText) ? 1 : 0,
      listeningCount: 0,
    },
    vocabularies: lesson.vocabList.map((word, index) => {
      const examples = Array.isArray(word.examples) && word.examples.length > 0
        ? word.examples.map(ex => ({
            zh: ex.zh,
            pinyin: ex.pinyin || "",
            py: ex.pinyin || "",
            vi: ex.vi,
          }))
        : (word.exampleZh ? [{ zh: word.exampleZh, pinyin: word.examplePy || "", py: word.examplePy || "", vi: word.exampleVi || "" }] : []);
      return {
        id: word.id || `${lesson.id}-v-${index}`,
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        meaningVi: word.meaningVi || word.meaning,
        partOfSpeech: word.type || word.wordType || "",
        exampleZh: examples[0]?.zh || word.exampleZh || "",
        examplePy: examples[0]?.pinyin || word.examplePy || "",
        exampleVi: examples[0]?.vi || word.exampleVi || "",
        usageNote: word.usageExplanation || "",
        usageExplanation: word.usageExplanation,
        usagePatterns: word.usagePatterns,
        examples,
        commonMistakes: word.commonMistakes,
        comparison: word.comparison,
      };
    }),
    grammars: lesson.grammarList.map((grammar, index) => {
      const examples = Array.isArray(grammar.examples) && grammar.examples.length > 0
        ? grammar.examples.map(ex => ({
            zh: ex.zh,
            py: ex.pinyin || ex.py || "",
            pinyin: ex.pinyin || ex.py || "",
            vi: ex.vi,
            explanationVi: ex.explanationVi || "",
          }))
        : (grammar.example ? [{ zh: grammar.example, py: "", pinyin: "", vi: "", explanationVi: "" }] : []);
      return {
        id: grammar.id || `${lesson.id}-g-${index}`,
        title: grammar.title,
        titleZh: grammar.titleZh,
        summary: grammar.summary,
        structure: grammar.structure,
        explanation: grammar.usageExplanation || grammar.explanation || "",
        usageExplanation: grammar.usageExplanation,
        usageSteps: grammar.usageSteps,
        usageContexts: grammar.usageContexts,
        comparison: grammar.comparison,
        commonMistakes: grammar.commonMistakes,
        examples,
      };
    }),
    dialogue: lesson.dialogue.length
      ? {
          id: `${lesson.id}-dialogue`,
          title: "Hội thoại",
          situation: "",
          audioDuration: "",
          lines: lesson.dialogue.map(line => ({
            speaker: line.speaker,
            zh: line.zh,
            py: line.pinyin,
            vi: line.vi,
          })),
        }
      : undefined,
    reading: lesson.reading,
    culturalNote: normalizeCulturalNote(lesson.culturalNote, lesson.culture),
  };
}
export const emptyTeacherLesson:FullLessonDetail={id:"",orderNumber:0,trackId:"hsk",levelId:"",levelLabel:"",titleZh:"",titlePy:"",titleVi:"",description:"",thumbnailArt:"lesson5",stats:{vocabCount:0,grammarCount:0,dialogueCount:0,readingCount:0,listeningCount:0},vocabularies:[],grammars:[]};
