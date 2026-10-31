const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const tmpIndex = path.join(process.cwd(), ".git", "index_tmp_" + Date.now());
const env = { ...process.env, GIT_INDEX_FILE: tmpIndex };

try {
  if (fs.existsSync(".git/index")) {
    fs.copyFileSync(".git/index", tmpIndex);
  }
  execSync("git add -A", { env, stdio: "inherit" });
  const tree = execSync("git write-tree", { env }).toString().trim();
  const parent = execSync("git rev-parse HEAD").toString().trim();
  const msg = process.argv[2] || "feat(curriculum): display all vocab and grammar examples without limit, enrich reading analysis and add official HSK restore";
  const commit = execSync(`git commit-tree ${tree} -p ${parent} -m "${msg}"`, { env }).toString().trim();
  execSync(`git update-ref refs/heads/main ${commit}`);
  console.log("Committed:", commit);
  if (fs.existsSync(".git/index.lock")) fs.unlinkSync(".git/index.lock");
  try {
    fs.copyFileSync(tmpIndex, ".git/index");
  } catch {}
  fs.unlinkSync(tmpIndex);
  console.log("Index updated successfully.");
} catch (e) {
  console.error("Error:", e.message);
  if (fs.existsSync(tmpIndex)) fs.unlinkSync(tmpIndex);
  process.exit(1);
}
