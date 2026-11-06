const test = require('node:test'); const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path'); const Module = require('node:module'); const ts = require('typescript');
function load(file) { return require(path.resolve(file)); }
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const f = load('src/lib/curriculum-format.ts');
const base = () => [{ ...f.blankLesson(9, 1), titleVi: 'Bài một', vocabList: [{ hanzi: '你', pinyin: 'nǐ', meaning: 'bạn' }], dialogue: [{speaker:'A',zh:'你好',pinyin:'nǐ hǎo',vi:'Xin chào'}] }, { ...f.blankLesson(9, 2), titleVi: 'Bài hai' }];
test('Bundled HSK 1 and 2 data pass strict persistence validation', () => { for(const level of [1,2]) { const data=load(`src/lib/hsk${level}-full-lessons.ts`)[`OFFICIAL_HSK${level}_15_LESSONS`]; assert.equal(f.normalizeLessons(data,level).length,15); } });
test('Every JSON and CSV template can be imported into its own section', () => { for(const {id} of f.curriculumScopes) for(const kind of ['json','csv']) { const input=kind==='json'?f.curriculumTemplate(id,9,1):f.parseCurriculumCsv(f.curriculumTemplateCsv(id,9,1)); const result=f.applyCurriculumImport(base(),input,9,id,'merge',1); assert.equal(result.length,2,id+kind); if(id!=='lessons')assert.equal(result[1].titleVi,'Bài hai'); } });
test('Metadata CSV updates retain vocabulary, grammar and dialogue', () => { const result=f.applyCurriculumImport(base(),[{number:'1',titleVi:'Đã cập nhật'}],9,'lessons','merge');assert.equal(result[0].titleVi,'Đã cập nhật');assert.equal(result[0].vocabList[0].hanzi,'你');assert.equal(result[0].dialogue.length,1); });
test('Vocabulary merge updates one reading without erasing another or other sections', () => { const source=base(); source[0].vocabList.push({hanzi:'行',pinyin:'háng',meaning:'hàng'}); const result=f.applyCurriculumImport(source,[{lessonNumber:1,hanzi:'行',pinyin:'xíng',meaning:'đi'}],9,'vocab','merge');assert.equal(result[0].vocabList.length,3);assert.equal(result[0].dialogue.length,1);assert.equal(source[0].vocabList.length,2); });
test('Scoped replace never erases another lesson or unrelated sections', () => { const result=f.applyCurriculumImport(base(),{items:[]},9,'vocab','replace',1);assert.equal(result[0].vocabList.length,0);assert.equal(result[0].dialogue.length,1);assert.equal(result.length,2);const single=f.applyCurriculumImport(base(),f.curriculumTemplate('lessons',9,1),9,'lessons','replace',1);assert.equal(single.length,2); });
test('Explicit empty curriculum remains empty', () => { assert.deepEqual(f.normalizeLessons([],9),[]);assert.deepEqual(f.applyCurriculumImport(base(),[],9,'lessons','replace'),[]); });
test('CSV supports BOM, commas, quoted newlines and escaped quotes', () => { const rows=f.parseCurriculumCsv('\uFEFFtitle,culture\r\n"A, B","Dòng 1\nDòng ""2"""\r\n');assert.deepEqual(rows,[{title:'A, B',culture:'Dòng 1\nDòng "2"'}]);assert.throws(()=>f.parseCurriculumCsv('a,a\n1,2'));assert.throws(()=>f.parseCurriculumCsv('a,b\n1'));assert.throws(()=>f.parseCurriculumCsv('a\n"x')); });
test('Wrong level, unknown lesson, duplicate numbers and malformed rows are rejected', () => { assert.throws(()=>f.applyCurriculumImport(base(),f.curriculumTemplate('vocab',1,1),9,'vocab','merge'));assert.throws(()=>f.applyCurriculumImport(base(),[{lessonNumber:99,hanzi:'你',pinyin:'nǐ',meaning:'bạn'}],9,'vocab','merge'));assert.throws(()=>f.normalizeLessons([base()[0],base()[0]],9));assert.throws(()=>f.applyCurriculumImport(base(),[{lessonNumber:1,hanzi:'你',pinyin:'',meaning:'bạn'}],9,'vocab','merge'));assert.throws(()=>f.applyCurriculumImport(base(),f.curriculumTemplate('lessons',9,2),9,'lessons','replace',1)); });
test('An HSK 1 row hidden inside an HSK 2 payload is rejected before normalization', () => {
  const rows = [f.blankLesson(2, 1), f.blankLesson(1, 2)];
  assert.throws(() => f.applyCurriculumImport([], { level: 2, lessons: rows }, 2, 'lessons', 'merge'), /HSK 1/);
  assert.throws(() => f.normalizeLessons([{ ...f.blankLesson(2, 1), hskLevel: 1 }], 2), /HSK 1/);
  assert.equal(f.normalizeLessons([{ ...f.blankLesson(2, 1), id: 'legacy-lesson-01' }], 2)[0].id, 'legacy-lesson-01');
});

test('Live lesson imports preserve rich fields and existing exercises across merge and replace', () => {
  const source = base();
  const old = { id: 'old', prompt: 'Đã có', editorData: { custom: true } };
  const fresh = { id: 'new', prompt: 'Câu mới' };
  source[0].grammarExercises = [old];
  source[0].vocabList[0].examples = [{ zh: '你好', vi: 'Xin chào', note: 'Giữ chú giải' }];
  const rows = f.parseCurriculumLessonRows({ level: 9, lesson: {
    lessonNumber: 1, titleVi: 'Tên mới', dialogue: ['A: 你好'],
    grammarExercises: [{ ...old, id: 'dup' }, fresh, fresh],
  } }, 9);
  const merged = f.applyCurriculumImport(source, rows, 9, 'lessons', 'merge');
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, source[0].id);
  assert.equal(merged[0].vocabList[0].examples[0].note, 'Giữ chú giải');
  assert.equal(merged[0].dialogue[0].zh, '你好');
  assert.deepEqual(merged[0].grammarExercises, [old, fresh]);
  assert.deepEqual(source[0].grammarExercises, [old]);
  const replaced = f.applyCurriculumImport(source, [{ number: 1, grammarExercises: [] }], 9, 'lessons', 'replace');
  assert.equal(replaced.length, 1);
  assert.deepEqual(replaced[0].grammarExercises, [old]);
});

test('Invalid exercise payloads and section replacement of missing lessons fail validation', () => {
  assert.throws(() => f.normalizeLessons([{ number: 1, grammarExercises: [null] }], 9), /grammarExercises/);
  assert.throws(() => f.applyCurriculumImport(base(), [], 9, 'vocab', 'replace', 99), /Bài 99/);
});
