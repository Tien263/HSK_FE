const fs = require('fs');
const path = require('path');

const targetDirs = [
  'src/components/student',
  'src/components/teacher',
  'src/app/s',
  'src/app/t',
  'src/app/student',
  'src/app/teacher',
];

const patterns = [
  { name: 'MOCK_OR_SAMPLE', regex: /(?:MOCK|SAMPLE|INITIAL_|DUMMY|FAKER)_[A-Z0-9_]+/i },
  { name: 'HARDCODED_PERCENT', regex: /"(?:84%|85%|76%|40%|50%|65%|70%|90%)"/ },
  { name: 'PROGRESS_ASSIGNMENT', regex: /progressPercent:\s*\d+/ },
  { name: 'SUBMISSION_RATE', regex: /submissionRate:\s*\d+/ },
  { name: 'TOTAL_LESSONS_10', regex: /totalLessons:\s*10/ },
  { name: 'FALLBACK_PROGRESS_RING', regex: /strokeDasharray.*(?:40|84|76|85)/ },
  { name: 'CALCULATED_FAKE_PROGRESS', regex: /attemptsCount\s*\*\s*20/ },
  { name: 'FIXED_ATTEMPTS_COUNT', regex: /totalAssignments:\s*10/ },
  { name: 'COMPLETED_LESSONS_HARDCODED', regex: /completedLessons:\s*[1-9]/ },
  { name: 'HARDCODED_AVATAR_UNSPLASH', regex: /images\.unsplash\.com/ },
  { name: 'HARDCODED_STUDENT_STATUS', regex: /ruleType:\s*"(?:OVERDUE|GRAMMAR_MISTAKE|LOW_SCORE)"/ },
];

let totalHits = 0;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comment lines or test lines
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
        
        patterns.forEach(({ name, regex }) => {
          if (regex.test(line)) {
            totalHits++;
            console.log(`[${name}] ${path.relative(process.cwd(), fullPath)}:${idx+1}`);
            console.log(`    --> ${line.trim()}`);
          }
        });
      });
    }
  }
}

console.log('=== STARTING DEEP FRONTEND HARDCODED AUDIT ===');
targetDirs.forEach(scan);
console.log(`=== AUDIT FINISHED: TOTAL ${totalHits} SUSPICIOUS LINES FOUND ===`);
