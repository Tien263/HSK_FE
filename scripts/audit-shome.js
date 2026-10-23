const fs = require('fs');
const content = fs.readFileSync('src/app/s/home/page.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- AUDITING src/app/s/home/page.tsx ---');
lines.forEach((line, idx) => {
  const l = line.trim();
  if (l.startsWith('//') || l.startsWith('/*')) return;
  // Look for hardcoded strings with numbers or stats
  if (/(\d+h|\d+p|\d+%|\b[1-9]\d*\s*(?:bài|câu|điểm|học viên|phút))\b/.test(l)) {
    if (!l.includes('{') && !l.includes('Date') && !l.includes('px') && !l.includes('rem') && !l.includes('max-w-')) {
      console.log(`Line ${idx+1}: ${l}`);
    }
  }
});
