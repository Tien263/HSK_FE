const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Use a custom index file
  const customIndex = path.resolve('.git', 'temp_index_' + Date.now());
  const env = { ...process.env, GIT_INDEX_FILE: customIndex };

  console.log('Reading current HEAD tree into custom index...');
  execSync('git read-tree HEAD', { env, stdio: 'inherit' });

  console.log('Adding modified and untracked files...');
  execSync('git add -A', { env, stdio: 'inherit' });

  console.log('Writing tree...');
  const treeHash = execSync('git write-tree', { env, encoding: 'utf8' }).trim();
  console.log('Tree:', treeHash);

  const headCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  console.log('Parent commit:', headCommit);

  const commitMsg = 'feat: add admin self-study roadmap manager, dynamic onboarding stages, canvas calligraphy notebook & fix practice route crash';
  const newCommit = execSync(`git commit-tree ${treeHash} -p ${headCommit} -m "${commitMsg}"`, { env, encoding: 'utf8' }).trim();
  console.log('New commit:', newCommit);

  execSync(`git update-ref refs/heads/main ${newCommit}`, { stdio: 'inherit' });
  console.log('Updated refs/heads/main to', newCommit);

  // Also update feat/clean-architecture
  try {
    execSync(`git update-ref refs/heads/feat/clean-architecture ${newCommit}`, { stdio: 'inherit' });
    console.log('Updated refs/heads/feat/clean-architecture to', newCommit);
  } catch (e) {}

  // Clean up custom index
  if (fs.existsSync(customIndex)) {
    fs.unlinkSync(customIndex);
  }

  console.log('Done!');
} catch (err) {
  console.error('Commit failed:', err);
  process.exit(1);
}
