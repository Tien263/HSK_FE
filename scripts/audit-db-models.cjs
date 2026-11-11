const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('generated')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.cjs')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').concat(walk('./scripts'));
const models = [
  'user', 'class', 'classLesson', 'classStudent', 'curriculumContent', 'curriculum', 'level', 'lesson',
  'vocabulary', 'grammarPoint', 'listeningItem', 'readingItem', 'question', 'teacherSavedLesson',
  'teacherVocabulary', 'teachingMaterial', 'materialClass', 'classSchedule', 'scheduleException',
  'quizSet', 'quizSetQuestion', 'assignment', 'assignmentTarget', 'attempt', 'attemptAnswer',
  'wrongQuestion', 'vocabProgress', 'gameSession', 'gameConfig', 'xpLog', 'notification', 'auditLog',
  'setting', 'dictionaryEntry', 'dictionaryCharacter', 'dictionaryEntryCharacter', 'dictionarySentenceTranslation'
];

const counts = {};
const occurrences = {};
models.forEach(m => {
  counts[m] = 0;
  occurrences[m] = [];
});

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  models.forEach(m => {
    const regex = new RegExp(`(?:prisma|tx)\\.${m}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      counts[m] += matches.length;
      occurrences[m].push(f);
    }
  });
});

console.log('--- DIRECT PRISMA CALLS ---');
models.forEach(m => {
  console.log(`${m}: ${counts[m]} calls across ${occurrences[m].length} files`);
});
