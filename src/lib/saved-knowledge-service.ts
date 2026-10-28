"use client";

export interface SavedVocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  type?: string;
  exampleZh?: string;
  exampleVi?: string;
  hskLevel?: number;
  lessonNumber?: number;
  lessonTitleZh?: string;
  savedAt: string;
}

export interface SavedGrammarItem {
  id: string;
  title: string;
  structure: string;
  example: string;
  explanation?: string;
  hskLevel?: number;
  lessonNumber?: number;
  lessonTitleZh?: string;
  savedAt: string;
}

export interface SavedQuestionItem {
  id: string;
  mode: string;
  grammarRule?: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  scrambledWords?: string[];
  wrongSentence?: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  hskLevel?: number;
  lessonNumber?: number;
  lessonTitleZh?: string;
  savedAt: string;
}

export interface SavedKnowledgeStore {
  vocabs: SavedVocabItem[];
  grammars: SavedGrammarItem[];
  questions: SavedQuestionItem[];
}

const STORAGE_KEY_PREFIX = "hanyu_saved_knowledge_";

function getStorageKey(studentId?: string): string {
  return `${STORAGE_KEY_PREFIX}${studentId || "default"}`;
}

export function getSavedKnowledge(studentId?: string): SavedKnowledgeStore {
  if (typeof window === "undefined") {
    return { vocabs: [], grammars: [], questions: [] };
  }
  try {
    const raw = localStorage.getItem(getStorageKey(studentId));
    if (!raw) return { vocabs: [], grammars: [], questions: [] };
    const parsed = JSON.parse(raw);
    return {
      vocabs: Array.isArray(parsed?.vocabs) ? parsed.vocabs : [],
      grammars: Array.isArray(parsed?.grammars) ? parsed.grammars : [],
      questions: Array.isArray(parsed?.questions) ? parsed.questions : [],
    };
  } catch (e) {
    console.warn("Failed to read saved knowledge from storage:", e);
    return { vocabs: [], grammars: [], questions: [] };
  }
}

function saveStore(studentId: string | undefined, store: SavedKnowledgeStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(studentId), JSON.stringify(store));
    window.dispatchEvent(new Event("saved_knowledge_updated"));
  } catch (e) {
    console.warn("Failed to write saved knowledge to storage:", e);
  }
}

// 1. TỪ VỰNG
export function saveVocabItem(
  studentId: string | undefined,
  item: Omit<SavedVocabItem, "savedAt">
): boolean {
  const store = getSavedKnowledge(studentId);
  const exists = store.vocabs.some((v) => v.id === item.id || v.hanzi === item.hanzi);
  if (exists) {
    // Nếu đã có thì bỏ lưu (toggle)
    store.vocabs = store.vocabs.filter((v) => v.id !== item.id && v.hanzi !== item.hanzi);
    saveStore(studentId, store);
    return false; // đã bỏ lưu
  } else {
    store.vocabs.unshift({ ...item, savedAt: new Date().toISOString() });
    saveStore(studentId, store);
    return true; // đã lưu
  }
}

export function removeSavedVocab(studentId: string | undefined, id: string): void {
  const store = getSavedKnowledge(studentId);
  store.vocabs = store.vocabs.filter((v) => v.id !== id && v.hanzi !== id);
  saveStore(studentId, store);
}

export function isVocabSaved(studentId: string | undefined, idOrHanzi: string): boolean {
  const store = getSavedKnowledge(studentId);
  return store.vocabs.some((v) => v.id === idOrHanzi || v.hanzi === idOrHanzi);
}

// 2. NGỮ PHÁP
export function saveGrammarItem(
  studentId: string | undefined,
  item: Omit<SavedGrammarItem, "savedAt">
): boolean {
  const store = getSavedKnowledge(studentId);
  const exists = store.grammars.some((g) => g.id === item.id || g.title === item.title);
  if (exists) {
    store.grammars = store.grammars.filter((g) => g.id !== item.id && g.title !== item.title);
    saveStore(studentId, store);
    return false;
  } else {
    store.grammars.unshift({ ...item, savedAt: new Date().toISOString() });
    saveStore(studentId, store);
    return true;
  }
}

export function removeSavedGrammar(studentId: string | undefined, idOrTitle: string): void {
  const store = getSavedKnowledge(studentId);
  store.grammars = store.grammars.filter((g) => g.id !== idOrTitle && g.title !== idOrTitle);
  saveStore(studentId, store);
}

export function isGrammarSaved(studentId: string | undefined, idOrTitle: string): boolean {
  const store = getSavedKnowledge(studentId);
  return store.grammars.some((g) => g.id === idOrTitle || g.title === idOrTitle);
}

// 3. CÂU HỎI
export function saveQuestionItem(
  studentId: string | undefined,
  item: Omit<SavedQuestionItem, "savedAt">
): boolean {
  const store = getSavedKnowledge(studentId);
  const exists = store.questions.some((q) => q.id === item.id || q.prompt === item.prompt);
  if (exists) {
    store.questions = store.questions.filter((q) => q.id !== item.id && q.prompt !== item.prompt);
    saveStore(studentId, store);
    return false;
  } else {
    store.questions.unshift({ ...item, savedAt: new Date().toISOString() });
    saveStore(studentId, store);
    return true;
  }
}

export function removeSavedQuestion(studentId: string | undefined, idOrPrompt: string): void {
  const store = getSavedKnowledge(studentId);
  store.questions = store.questions.filter((q) => q.id !== idOrPrompt && q.prompt !== idOrPrompt);
  saveStore(studentId, store);
}

export function isQuestionSaved(studentId: string | undefined, idOrPrompt: string): boolean {
  const store = getSavedKnowledge(studentId);
  return store.questions.some((q) => q.id === idOrPrompt || q.prompt === idOrPrompt);
}
