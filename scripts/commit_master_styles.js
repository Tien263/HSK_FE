const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const customIndex = path.resolve('.git', 'temp_index_' + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: customIndex };

execSync('git read-tree HEAD', { env });
execSync('git add -A', { env });
const treeHash = execSync('git write-tree', { env, encoding: 'utf8' }).trim();
const headCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const commitMsg = 'feat: integrate 4 Grand Master antique calligraphy styles with authentic paper textures, dynamic brush physics & imperial seal animation';
const newCommit = execSync(`git commit-tree ${treeHash} -p ${headCommit} -m "${commitMsg}"`, { env, encoding: 'utf8' }).trim();

fs.writeFileSync('.git/refs/heads/main', newCommit + '\n');
fs.writeFileSync('.git/refs/heads/feat/clean-architecture', newCommit + '\n');
if (fs.existsSync(customIndex)) fs.unlinkSync(customIndex);
console.log('Successfully committed:', newCommit);
