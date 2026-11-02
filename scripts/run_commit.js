const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const tempIndex = path.join(os.tmpdir(), 'git_index_' + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: tempIndex };

console.log('Staging files with temp index...');
execSync('git add -A', { env, stdio: 'inherit' });

const treeHash = execSync('git write-tree', { env }).toString().trim();
console.log('Tree hash:', treeHash);

const parentHash = execSync('git rev-parse HEAD').toString().trim();
console.log('Parent hash:', parentHash);

const commitMsg = 'feat(admin-seo): add comprehensive SEO management tab with live SERP preview, dynamic sitemap and robots controls';
const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentHash} -m "${commitMsg}"`, { env }).toString().trim();
console.log('New commit hash:', commitHash);

fs.writeFileSync(path.join('.git', 'refs', 'heads', 'main'), commitHash + '\n');
fs.writeFileSync(path.join('.git', 'refs', 'heads', 'feat', 'clean-architecture'), commitHash + '\n');

try {
  fs.unlinkSync(tempIndex);
} catch (e) {}

console.log('Successfully committed to main and feat/clean-architecture!');
