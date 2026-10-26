export interface PublicDictionaryEntry {
  id: number;
  simplified: string;
  traditional: string;
  pinyin: string;
  definitionsVi: string[];
  definitionsEn: string[];
  characters: { position: number; traditionalCharacter: string; simplifiedCharacter: string | null; character: { hanViet: string | null } }[];
}
