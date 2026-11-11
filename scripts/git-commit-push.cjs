const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const tempIndex = path.join(root, ".git", "temp_index");

process.env.GIT_INDEX_FILE = tempIndex;

console.log("Staging changes...");
execSync("git add -A", { cwd: root, env: process.env, stdio: "inherit" });

console.log("Writing tree...");
const tree = execSync("git write-tree", { cwd: root, env: process.env }).toString().trim();
console.log("Tree:", tree);

const parent = execSync("git rev-parse HEAD", { cwd: root }).toString().trim();
console.log("Parent:", parent);

const commitMsg = "feat(exam-center): add picture given words writing, essay editor, and db field normalization";
console.log("Creating commit...");
const commit = execSync(`git commit-tree ${tree} -p ${parent} -m "${commitMsg}"`, {
  cwd: root,
  env: process.env,
}).toString().trim();
console.log("New Commit SHA:", commit);

// Update refs/heads/main directly
fs.writeFileSync(path.join(root, ".git", "refs", "heads", "main"), commit + "\n", "utf8");

// Also update .git/logs/refs/heads/main if it exists
const refLog = path.join(root, ".git", "logs", "refs", "heads", "main");
if (fs.existsSync(refLog)) {
  const authorName = "User";
  const authorEmail = "user@example.com";
  const timestamp = Math.floor(Date.now() / 1000);
  const logLine = `${parent} ${commit} ${authorName} <${authorEmail}> ${timestamp} +0700\tcommit: ${commitMsg}\n`;
  fs.appendFileSync(refLog, logLine, "utf8");
}

// Copy temp_index to .git/index directly
if (fs.existsSync(tempIndex)) {
  fs.copyFileSync(tempIndex, path.join(root, ".git", "index"));
  fs.unlinkSync(tempIndex);
}

delete process.env.GIT_INDEX_FILE;

console.log("Commit completed successfully! Checking git log:");
const log = execSync("git log -n 3 --oneline", { cwd: root }).toString();
console.log(log);

console.log("Pushing to remote origin main...");
execSync("git push origin main", { cwd: root, stdio: "inherit" });
console.log("Push completed successfully!");
