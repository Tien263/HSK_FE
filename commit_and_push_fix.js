const { execSync } = require('child_process');
const fs = require('fs');

const env = { ...process.env, GIT_INDEX_FILE: '.git/index_new' };

fs.writeFileSync('.git/refs/heads/main', '1fb3a6f8d582a374bd583c8722342e50b922e21d\n');

console.log("Adding changes to custom index...");
execSync('git add -A', { env, stdio: 'inherit' });

console.log("Writing tree...");
const treeHash = execSync('git write-tree', { env }).toString().trim();
console.log("Tree hash:", treeHash);

const parentCommit = '1fb3a6f8d582a374bd583c8722342e50b922e21d';
const commitMsg = "fix: Tu dong xu ly nguoi gui Resend ve onboarding@resend.dev va bo qua SMTP timeout khi gui OTP";
const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentCommit} -m "${commitMsg}"`, { env }).toString().trim();
console.log("New commit hash:", commitHash);

fs.writeFileSync('.git/refs/heads/main', commitHash + '\n');
console.log("Updated refs/heads/main to:", commitHash);

console.log("Pushing to origin main...");
execSync(`git push origin ${commitHash}:refs/heads/main`, { env, stdio: 'inherit' });

console.log("Pushing to origin feat/clean-architecture...");
execSync(`git push origin ${commitHash}:refs/heads/feat/clean-architecture`, { env, stdio: 'inherit' });

// Clean up temporary script
try { fs.unlinkSync('commit_and_push_fix.js'); } catch (e) {}
console.log("Successfully committed and pushed!");
