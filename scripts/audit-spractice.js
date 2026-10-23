const fs = require('fs');
const content = fs.readFileSync('src/components/student/StudentPracticeWorkspace.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- AUDITING StudentPracticeWorkspace.tsx ---');
lines.forEach((line, idx) => {
  const l = line.trim();
  if (l.startsWith('//') || l.startsWith('/*')) return;
  if (/(?:MOCK|SAMPLE|INITIAL_|DUMMY)/i.test(l)) {
    console.log(`Line ${idx+1}: ${l}`);
  }
});
