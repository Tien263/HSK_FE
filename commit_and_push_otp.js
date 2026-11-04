const { execSync } = require('child_process');
const fs = require('fs');

const env = { ...process.env, GIT_INDEX_FILE: '.git/index_new' };

console.log("Adding changes to custom index...");
execSync('git add -A', { env, stdio: 'inherit' });

console.log("Writing tree...");
const treeHash = execSync('git write-tree', { env }).toString().trim();
console.log("Tree hash:", treeHash);

const parentCommit = fs.readFileSync('.git/refs/heads/main', 'utf-8').trim();
console.log("Parent commit:", parentCommit);

const commitMsg = "feat: Tich hop cong gui OTP sieu toc qua Resend API va toi uu ket noi SMTP Gmail";
const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentCommit} -m "${commitMsg}"`, { env }).toString().trim();
console.log("New commit hash:", commitHash);

fs.writeFileSync('.git/refs/heads/main', commitHash + '\n');
console.log("Updated refs/heads/main to:", commitHash);

console.log("Pushing to origin main...");
execSync(`git push origin ${commitHash}:refs/heads/main`, { env, stdio: 'inherit' });

console.log("Pushing to origin feat/clean-architecture...");
execSync(`git push origin ${commitHash}:refs/heads/feat/clean-architecture`, { env, stdio: 'inherit' });

// Clean up temporary script
try { fs.unlinkSync('commit_and_push_otp.js'); } catch (e) {}
console.log("Successfully committed and pushed!");
