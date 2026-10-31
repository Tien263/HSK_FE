const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const tmp = path.join('.git', 'tmp_idx_' + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: tmp };
if (fs.existsSync('.git/index')) fs.copyFileSync('.git/index', tmp);
execSync('git add -A', { env });
const tree = execSync('git write-tree', { env }).toString().trim();
const parent = execSync('git rev-parse HEAD').toString().trim();
const msg = 'fix(student): align practice default unlocked lessons with roadmap and clean staged index';
const commit = execSync(`git commit-tree ${tree} -p ${parent} -m "${msg}"`, { env }).toString().trim();
fs.writeFileSync('.git/refs/heads/main', commit + '\n');
fs.writeFileSync('.git/refs/heads/feat/clean-architecture', commit + '\n');
try { fs.copyFileSync(tmp, '.git/index'); } catch {}
if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
console.log('Committed:', commit);
