export function isDictionarySentence(text: string) {
  const value = text.trim();
  const hanzi = value.match(/\p{Script=Han}/gu)?.length || 0;
  const shortSentence = /^(我|你|他|她|您|我们|你们|他们|她们)(爱|想|喜欢|是|要|会|在|觉得|不|没)/u.test(value) && hanzi >= 3;
  return [...value].length > 80 || hanzi >= 10 || shortSentence || (hanzi >= 3 && /[。！？?!，,；;]/u.test(value)) || (!hanzi && value.split(/\s+/).length >= 5);
}

export interface DictionarySentenceResult {
  sourceText: string;
  translatedText: string;
  pinyin: string;
  targetLanguage: string;
}
