const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

process.env.GIT_INDEX_FILE = path.join(process.env.TEMP, "git_index_hsk");
execSync("git add -A", { stdio: "inherit" });
const tree = execSync("git write-tree").toString().trim();
const parent = execSync("git rev-parse HEAD").toString().trim();
const msg = "feat(seo): add dynamic robots.txt and sitemap.xml for Google Search indexing of ninjistudy.click";
const commit = execSync(`git commit-tree ${tree} -p ${parent} -m "${msg}"`).toString().trim();

fs.writeFileSync(path.join(".git", "refs", "heads", "main"), commit + "\n");
fs.writeFileSync(path.join(".git", "refs", "heads", "feat", "clean-architecture"), commit + "\n");

console.log("Committed:", commit);
console.log(execSync("git log -1 --oneline").toString());
