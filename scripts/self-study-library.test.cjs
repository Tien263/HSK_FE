const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}, extras = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: id => mocks[id] || require(id), console, URL, Intl, ...extras }, { filename: file });
  return exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const log = (number, date, userId = 'student-a') => ({ details: JSON.stringify({ completedLesson: number }), createdAt: new Date(date), userId });
class Clock extends Date { constructor(...args) { super(...(args.length ? args : ['2026-11-01T17:30:00Z'])); } }
function route({ auth = { id: 'student-a', role: 'STUDENT' }, personal = [], publicLogs = [], error = false } = {}) {
  const calls = [];
  const api = load('src/app/api/v1/my/self-study/library/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body: plain(body), status: options?.status || 200, headers: options?.headers }) } },
    '@/lib/auth-server': { getAuthUser: async () => auth },
    '@/lib/prisma': { prisma: { auditLog: { findMany: async query => { calls.push(query); if (error) throw new Error('offline'); return query.where.userId ? personal : publicLogs; } } } },
  }, { Date: Clock });
  return { api, calls };
}
test('library statistics require a student session and valid level before database access', async () => {
  for (const auth of [null, { id: 'teacher', role: 'TEACHER' }]) { const { api, calls } = route({ auth }); assert.equal((await api.GET({ url: 'https://hanyu.test/api?level=1' })).status, 401); assert.equal(calls.length, 0); }
  const { api, calls } = route(); assert.equal((await api.GET({ url: 'https://hanyu.test/api?level=1.5' })).status, 400); assert.equal(calls.length, 0);
});
test('week follows Vietnam Monday even when UTC is Sunday; repeats do not count as new completions', async () => {
  const personal = [log(2, '2026-10-25T16:00:00Z'), log(2, '2026-11-01T18:00:00Z'), log(7, '2026-11-01T17:00:00Z'), { details: 'broken', createdAt: new Date() }, log(null, '2026-11-02T00:00:00Z')];
  const { api, calls } = route({ personal }); const result = await api.GET({ url: 'https://hanyu.test/api?level=2' });
  assert.equal(result.status, 200); assert.deepEqual(result.body.days, ['2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08']);
  assert.deepEqual(result.body.completed, [{ number: 2, date: '2026-10-25' }, { number: 7, date: '2026-11-02' }]);
  assert.equal(calls[0].where.userId, 'student-a'); assert.equal(calls[0].where.entity, 'SelfStudyProgress:2'); assert.equal(result.headers['Cache-Control'], 'private, no-store');
});
test('popular lessons count distinct learners, ignore malformed completions and disclose no identities', async () => {
  const publicLogs = [log(7, '', 'private-user-a'), log(7, '', 'private-user-a'), log(7, '', 'private-user-b'), log(2, '', 'private-user-a'), log(-1, '', 'private-user-c')];
  const { api, calls } = route({ publicLogs }); const result = await api.GET({ url: 'https://hanyu.test/api?level=1' });
  assert.deepEqual(result.body.popular, [{ number: 7, learners: 2 }, { number: 2, learners: 1 }]); assert.equal(JSON.stringify(result.body).includes('private-user'), false); assert.equal(calls[1].take, 5000); assert.ok(calls[1].where.createdAt.gte instanceof Date);
});
test('empty history stays empty and failed statistics return an explicit error', async () => {
  const { api } = route(); const result = await api.GET({ url: 'https://hanyu.test/api?level=1' }); assert.deepEqual(result.body.completed, []); assert.deepEqual(result.body.popular, []);
  assert.equal((await route({ error: true }).api.GET({ url: 'https://hanyu.test/api?level=1' })).status, 500);
});
test('bookmarks and reading locations are isolated by account and preserve each other', () => {
  const values = new Map();
  const localStorage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const lib = load('src/lib/use-lesson-library.ts', {}, { localStorage, window: { dispatchEvent() {} }, Event });
  assert.equal(lib.updateLibrary('a', store => ({ ...store, saved: ['1:7'] })), true);
  lib.updateLibrary('b', store => ({ ...store, saved: ['2:11'] }));
  lib.updateLibrary('a', store => ({ ...store, resume: { 1: 7 }, reading: { '1:7': { tab: 'grammar', viewed: ['grammar'], updatedAt: '' } } }));
  assert.deepEqual(JSON.parse(values.get('hanyu_library_a')).saved, ['1:7']); assert.deepEqual(JSON.parse(values.get('hanyu_library_b')).saved, ['2:11']);
  assert.equal(JSON.parse(values.get('hanyu_library_a')).reading['1:7'].tab, 'grammar');
});
test('reading percentages use only content actually present, independent of unlock state', () => {
  const lib = load('src/lib/use-lesson-library.ts'); const lesson = { vocabList: [{}], grammarList: [{}], dialogue: [], phonetics: { rule: '', examples: [] } };
  assert.equal(lib.viewedPercent(lesson), 0); assert.equal(lib.viewedPercent(lesson, { viewed: ['vocab', 'dialogue'] }), 50); assert.equal(lib.viewedPercent({ ...lesson, vocabList: [], grammarList: [] }, { viewed: ['vocab'] }), 0);
});

test('legacy lesson bookmarks migrate without becoming learned content', () => {
  const legacy = JSON.stringify({ saved: ['1:7'], resume: { 1: 7 }, reading: { '1:7': { tab: 'grammar', viewed: ['vocab','grammar'], updatedAt: '' } } });
  const react = { useMemo: fn => fn(), useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
  const lib = load('src/lib/use-lesson-library.ts', { react }, { localStorage: { getItem: () => legacy } });
  const store = lib.useLessonLibrary('a'); assert.deepEqual(plain(store.saved), ['1:7']); assert.deepEqual(plain(store.completed), []); assert.deepEqual(plain(store.items), []); assert.equal(store.reading['1:7'].tab, 'grammar');
});
test('knowledge identifiers retain progress after list reorder but invalidate changed explanations', () => {
  const model = load('src/lib/self-study-knowledge.ts');
  const lesson = { id: 'hsk1-7', number: 7, titleZh: '你好', titleVi: 'Chào', vocabList: [{ hanzi:'你', pinyin:'nǐ', meaning:'bạn', usageExplanation:'Dùng để xưng hô', examples:[{zh:'你好。',vi:'Chào bạn.'},{zh:'你是谁？',vi:'Bạn là ai?'}] }, {hanzi:'好',pinyin:'hǎo',meaning:'tốt'}], grammarList: [], dialogue: [], culture: '', phonetics: { title:'',rule:'',examples:[] } };
  const original = model.lessonKnowledge(lesson,1), reordered = model.lessonKnowledge({...lesson,vocabList:[...lesson.vocabList].reverse()},1);
  assert.equal(original[0].id, reordered[1].id); assert.equal(original[0].data.examples.length,2);
  const changed = model.lessonKnowledge({...lesson,vocabList:[{...lesson.vocabList[0],usageExplanation:'Nội dung được sửa'},lesson.vocabList[1]]},1);
  assert.notEqual(original[0].id, changed[0].id); assert.notEqual(original[0].id, model.lessonKnowledge(lesson,2)[0].id);
  assert.equal(model.completionPercent(lesson,1,[]),0); assert.equal(model.completionPercent(lesson,1,[original[0].id]),50); assert.equal(model.completionPercent(lesson,2,[original[0].id]),0);
});
test('lesson and knowledge bookmarks synchronize through one store and never increase completion', () => {
  const values = new Map(); const lib = load('src/lib/use-lesson-library.ts', { react: {useMemo: fn=>fn(),useSyncExternalStore: (_sub,snapshot)=>snapshot()} }, { localStorage: { getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value) },window:{dispatchEvent(){}},Event });
  const item={id:'1:7:vocab:a',kind:'vocab',section:'vocab',level:1,lessonNumber:7,lessonTitle:'你好',title:'你',subtitle:'nǐ',data:{hanzi:'你',usageExplanation:'Chi tiết'}};
  assert.equal(lib.toggleKnowledge('a',item),true); let store=lib.useLessonLibrary('a'); assert.equal(lib.isKnowledgeSaved(store,item),true); assert.equal(store.items[0].data.usageExplanation,'Chi tiết'); assert.deepEqual(plain(store.completed),[]);
  lib.toggleKnowledge('a',{...item,id:'1:7',kind:'lesson'}); store=lib.useLessonLibrary('a'); assert.deepEqual(plain(store.saved),['1:7']); assert.equal(store.items.length,2);
  lib.toggleKnowledge('a',item); assert.equal(lib.isKnowledgeSaved(lib.useLessonLibrary('a'),item),false); assert.deepEqual(plain(lib.useLessonLibrary('b').items),[]);
  const failing=load('src/lib/use-lesson-library.ts',{}, {localStorage:{getItem:()=>null,setItem:()=>{throw new Error('quota');}},window:{dispatchEvent(){}},Event});assert.equal(failing.toggleKnowledge('a',item),false);
});
