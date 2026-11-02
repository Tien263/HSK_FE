type Row = Record<string, unknown>;
export const textKey = (value: string) => value.normalize("NFC").replace(/\s+/g, " ").trim();
const record = (value: unknown): value is Row => !!value && typeof value === "object" && !Array.isArray(value);
function fingerprint(value: unknown): string {
  if (typeof value === "string") return textKey(value);
  if (Array.isArray(value)) return JSON.stringify(value.map(fingerprint));
  if (record(value)) return JSON.stringify(Object.keys(value).sort().map(key => [key, fingerprint(value[key])]));
  return JSON.stringify(value);
}
function useful(value: unknown) { return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0); }
function combine(values: unknown[]): unknown {
  const flat = values.flatMap(value => Array.isArray(value) ? value : [value]).flatMap(value => typeof value === "string" ? value.split(/\r?\n\s*\r?\n/) : [value]).filter(useful);
  const unique = [...new Map(flat.map(value => [fingerprint(value), value])).values()];
  if (unique.length === 1) return unique[0];
  if (unique.every(value => typeof value === "string")) return unique.join("\n\n");
  return unique;
}
/** Merge aliases for presentation only. Raw JSON, bookmark IDs and completion IDs are untouched. */
export function compactKnowledgeData(source: Row, headerText: string[] = [], example = false): Row {
  const used = new Set<string>(), output: Row = {};
  const take = (key: string, aliases: string[]) => {
    aliases.forEach(alias => used.add(alias));
    const values = aliases.map(alias => source[alias]).filter(useful);
    if (values.length) output[key] = values.length === 1 && Array.isArray(values[0]) ? values[0] : combine(values);
  };
  if (example) {
    take("speaker", ["speaker", "role", "name", "person", "author"]);
    take("zh", ["zh", "exampleZh", "example", "chinese", "sentence", "cn", "content", "text", "original"]); take("pinyin", ["pinyin", "py", "examplePy"]);
    take("vi", ["vi", "meaningVi", "exampleVi", "meaning", "translation", "vietnamese", "dich"]); take("explanationVi", ["explanationVi", "explanation"]);
  } else {
    take("pinyin", ["pinyin", "py"]);
    take("incorrect", ["incorrect", "wrong", "zhWrong"]); take("correct", ["correct", "right", "zhCorrect"]);
    take("meaningVi", ["meaningVi", "meaning", "vi"]); take("type", ["type", "wordType", "partOfSpeech"]);
    take("structure", ["structure", "pattern"]); take("usageExplanation", ["usageExplanation", "explanation", "usage", "usageNote", "definition"]);
    take("usagePatterns", ["usagePatterns"]);
    const examples: unknown[] = Array.isArray(source.examples) ? [...source.examples] : useful(source.examples) ? [source.examples] : [];
    if (source.exampleZh || source.examplePy || source.exampleVi) examples.push({ zh: source.exampleZh, pinyin: source.examplePy, vi: source.exampleVi });
    if (useful(source.example)) examples.push(typeof source.example === "string" ? { zh: source.example } : source.example);
    if (examples.length) output.examples = mergeExamples(examples);
    ["examples", "example", "exampleZh", "examplePy", "exampleVi"].forEach(key => used.add(key));
    take("comparison", ["comparison", "comparisonNote"]); take("commonMistakes", ["commonMistakes"]);
    take("contentZh", ["originalText", "contentZh"]); take("contentPy", ["contentPy"]); take("contentVi", ["translation", "contentVi"]);
    take("notes", ["notes", "memo", "note"]);
  }
  for (const [key, value] of Object.entries(source)) if (!used.has(key) && useful(value)) output[key] = value;
  const seen = new Set([...headerText, ...(example ? [source.zh, source.pinyin, source.vi].filter((value): value is string => typeof value === "string") : [])].filter(Boolean).map(textKey));
  // Incorrect/correct, dialogue turns, translations and examples retain their semantic roles.
  const protectedText = new Set(["incorrect", "correct", "wrong", "right", "speaker", "zh", "pinyin", "py", "vi", "structure"]);
  const sharedNarrative = new Set(["examples", "commonMistakes", "naturalExpressions", "politeExpressions"]);
  const setLikeLists = new Set(["examples", "usagePatterns", "keywords", "secondaryDetails", "usageContexts", "commonMistakes", "naturalExpressions", "politeExpressions", "cautionNotes"]);
  const rememberNarrative = (value: unknown, key = "") => {
    if (protectedText.has(key)) return;
    if (typeof value === "string") value.split(/\r?\n+/).forEach(part => seen.add(textKey(part)));
    else if (Array.isArray(value)) value.forEach(item => rememberNarrative(item, key));
    else if (record(value)) Object.entries(value).forEach(([field,item]) => rememberNarrative(item,field));
  };
  const clean = (value: unknown, key: string): unknown => {
    if (typeof value === "string") {
      if (key === "structure") { const id = textKey(value); if (seen.has(id)) return ""; seen.add(id); return value; }
      if (protectedText.has(key)) return value;
      return value.split(/\r?\n+/).filter(part => { const id = textKey(part); if (!id || seen.has(id)) return false; seen.add(id); return true; }).join("\n\n");
    }
    if (Array.isArray(value)) return (setLikeLists.has(key) ? [...new Map(value.map(item => [fingerprint(item), item])).values()] : value).map(item => {
      const result = record(item) ? compactKnowledgeData(item, sharedNarrative.has(key) ? [...seen] : [], ["examples", "lines", "dialogue", "naturalExpressions", "politeExpressions"].includes(key)) : setLikeLists.has(key) ? clean(item, key) : item;
      if (sharedNarrative.has(key)) rememberNarrative(result);
      return result;
    }).filter(useful);
    if (record(value)) return compactKnowledgeData(value, sharedNarrative.has(key) ? [...seen] : []);
    return value;
  };
  return Object.fromEntries(Object.entries(output).map(([key, value]) => [key, clean(value, key)]).filter(([, value]) => useful(value)));
}
export function mergeExamples(values: unknown[]): Row[] {
  const result = new Map<string, Row>();
  for (let value of values) {
    if (typeof value === "string") { try { const parsed = JSON.parse(value); value = record(parsed) ? parsed : { zh: value }; } catch { value = { zh: value }; } }
    if (!record(value)) { if (useful(value)) value = { content: value }; else continue; }
    const row = compactKnowledgeData(value as Row, [], true);
    const identity = typeof row.zh === "string" ? textKey(row.zh) : fingerprint(row);
    const existing = result.get(identity);
    if (!existing) result.set(identity, row);
    else { for (const [key, content] of Object.entries(row)) existing[key] = combine([existing[key], content]); }
  }
  return [...result.values()];
}
