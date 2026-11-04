const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempIndex = path.join(process.env.TEMP, 'git_idx_' + Date.now());
console.log('Using temp index:', tempIndex);

// Copy current index to temp if it exists
if (fs.existsSync('.git/index')) {
  fs.copyFileSync('.git/index', tempIndex);
}

const env = { ...process.env, GIT_INDEX_FILE: tempIndex };

function run(cmd) {
  console.log('>', cmd);
  const out = execSync(cmd, { env, encoding: 'utf8' });
  if (out.trim()) console.log(out.trim());
  return out;
}

try {
  run('git add -A');
  const tree = run('git write-tree').trim();
  console.log('Tree:', tree);

  const parent = run('git rev-parse HEAD').trim();
  console.log('Parent:', parent);

  const commitMsg = process.argv[2] || 'feat: update mock exam and proctor';
  const commit = run(`git commit-tree ${tree} -p ${parent} -m "${commitMsg}"`).trim();
  console.log('New commit:', commit);

  // Update refs/heads/main safely
  const refPath = '.git/refs/heads/main';
  fs.writeFileSync(refPath, commit + '\n', 'utf8');
  console.log('Updated refs/heads/main');

  // Copy tempIndex back to .git/index to keep index synced
  fs.copyFileSync(tempIndex, '.git/index');
  console.log('Synced .git/index');

  // Push to origin
  run('git push origin main');
  console.log('Pushed to origin/main successfully!');
} catch (err) {
  console.error('Failed:', err);
  process.exit(1);
} finally {
  try {
    if (fs.existsSync(tempIndex)) fs.unlinkSync(tempIndex);
  } catch {}
}
