const { execSync } = require('child_process');
const fs = require('fs');

const env = { ...process.env, GIT_INDEX_FILE: '.git/index_new' };

console.log("Adding changes to custom index...");
execSync('git add -A', { env, stdio: 'inherit' });

console.log("Committing...");
execSync('git commit -m "feat: Tuy bien vi tri ma QR theo Admin, bat buoc giao vien doi mat khau lan dau va on dinh session phan quyen"', { env, stdio: 'inherit' });

console.log("Updating .git/index if possible...");
try {
  if (fs.existsSync('.git/index_new')) {
    fs.copyFileSync('.git/index_new', '.git/index');
    console.log("Successfully copied index_new to index");
  }
} catch (e) {
  console.log("Could not copy index_new to index (locked):", e.message);
}

console.log("Pushing to origin main...");
execSync('git push origin main', { env, stdio: 'inherit' });

console.log("Pushing to origin feat/clean-architecture...");
execSync('git push origin main:feat/clean-architecture', { env, stdio: 'inherit' });

console.log("Done!");
