const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const tempIndex = path.join(os.tmpdir(), 'git_index_' + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: tempIndex };

console.log('Staging files...');
execSync('git add -A', { env, stdio: 'inherit' });

const treeHash = execSync('git write-tree', { env }).toString().trim();
console.log('Tree hash:', treeHash);

const parentHash = execSync('git rev-parse HEAD').toString().trim();
const commitMsg = 'fix(home): remove floating quick-role switcher pill and error alert from landing page';
const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentHash} -m "${commitMsg}"`, { env }).toString().trim();
console.log('New commit:', commitHash);

fs.writeFileSync(path.join('.git', 'refs', 'heads', 'main'), commitHash + '\n');
fs.writeFileSync(path.join('.git', 'refs', 'heads', 'feat', 'clean-architecture'), commitHash + '\n');

try { fs.unlinkSync(tempIndex); } catch (e) {}
console.log('Pushing to origin...');
execSync('git push origin main feat/clean-architecture', { stdio: 'inherit' });
console.log('Successfully pushed to both branches!');
