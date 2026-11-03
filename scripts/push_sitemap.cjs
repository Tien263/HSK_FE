const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const tempIndex = path.join(process.env.TEMP || "C:\\Windows\\Temp", `git_idx_${Date.now()}`);
const env = { ...process.env, GIT_INDEX_FILE: tempIndex };

console.log("Staging changes...");
execSync("git add -A", { env, stdio: "inherit" });

const treeHash = execSync("git write-tree", { env }).toString().trim();
console.log("Tree hash:", treeHash);

const parentHash = execSync("git rev-parse HEAD").toString().trim();
const commitMsg = "feat(seo): include /guide in sitemap.xml for search engines";

const commitHash = execSync(`git commit-tree ${treeHash} -p ${parentHash} -m "${commitMsg}"`, { env }).toString().trim();
console.log("Commit hash:", commitHash);

fs.writeFileSync(path.join(".git", "refs", "heads", "main"), commitHash + "\n");
try {
  fs.writeFileSync(path.join(".git", "refs", "heads", "feat", "clean-architecture"), commitHash + "\n");
} catch (e) {}

try { fs.unlinkSync(tempIndex); } catch (e) {}

console.log("Pushing to origin main...");
execSync("git push origin main", { stdio: "inherit" });

try {
  console.log("Pushing to origin feat/clean-architecture...");
  execSync("git push origin feat/clean-architecture", { stdio: "inherit" });
} catch (err) {
  console.log("feat/clean-architecture push note:", err.message);
}

console.log("ALL DONE!");
