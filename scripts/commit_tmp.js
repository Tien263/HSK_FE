const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const tempIndex = path.join(os.tmpdir(), 'git_index_' + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: tempIndex };

execSync('git add -A', { env, stdio: 'inherit' });
const treeHash = execSync('git write-tree', { env }).toString().trim();
const parentHash = execSync('git rev-parse HEAD').toString().trim();
const commitMsg = 'fix(auth & onboarding): auto-bypass onboarding for returning students with XP progress';
const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentHash} -m "${commitMsg}"`, { env }).toString().trim();

fs.writeFileSync(path.join('.git', 'refs', 'heads', 'main'), commitHash + '\n');
fs.writeFileSync(path.join('.git', 'refs', 'heads', 'feat', 'clean-architecture'), commitHash + '\n');

try { fs.unlinkSync(tempIndex); } catch (e) {}
console.log('Committed:', commitHash);
