const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadSession() {
  const filename = path.resolve('src/lib/dictionary-session.ts');
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded.require = (name) => name === '@/lib/prisma' ? { prisma: { user: { findFirst: async ({ where }) => where.id === 'real-admin' ? { id: 'real-admin', role: 'ADMIN', name: 'Admin' } : where.id === 'real-student' ? { id: 'real-student', role: 'STUDENT', name: 'Student' } : null } } } : Module.prototype.require.call(loaded, name);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
  return loaded.exports;
}

test('Session remains signed and admin-only when NEXTAUTH_SECRET is absent', async () => {
  const original = Object.fromEntries(['NEXTAUTH_SECRET', 'DICTIONARY_SESSION_SECRET', 'DATABASE_URL'].map(key => [key, process.env[key]]));
  try {
    delete process.env.NEXTAUTH_SECRET; delete process.env.DICTIONARY_SESSION_SECRET;
    process.env.DATABASE_URL = 'postgresql://fixture:unit-test-only@localhost/example';
    const session = loadSession();
    const token = session.createDictionarySession('real-admin');
    assert(token);
    const request = token => new Request('http://localhost/admin', { headers: { cookie: `${session.DICTIONARY_SESSION_COOKIE}=${token}` } });
    assert.equal((await session.getDictionaryAdmin(request(token))).id, 'real-admin');
    assert.equal(await session.getDictionaryAdmin(request(token + 'changed')), null);
    assert.equal(await session.getDictionaryAdmin(request(session.createDictionarySession('real-student'))), null);
    assert.equal(await session.getDictionaryAdmin(new Request('http://localhost/admin', { headers: { 'x-user-id': 'real-admin' } })), null);
  } finally {
    for (const [key, value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('Cookie security follows actual HTTP/HTTPS and forwarded protocol', () => {
  const session = loadSession();
  assert.equal(session.dictionaryCookieOptions(new Request('http://192.168.1.10:3000/login')).secure, false);
  assert.equal(session.dictionaryCookieOptions(new Request('https://example.com/login')).secure, true);
  assert.equal(session.dictionaryCookieOptions(new Request('http://internal/login', { headers: { 'x-forwarded-proto': 'https' } })).secure, true);
  assert.equal(session.dictionarySameOrigin(new Request('http://0.0.0.0:3000/api', { headers: { host: 'localhost:3000', origin: 'http://localhost:3000' } })), true);
  assert.equal(session.dictionarySameOrigin(new Request('http://localhost:3000/api', { headers: { origin: 'https://other.example' } })), false);
});
