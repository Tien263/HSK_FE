import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
      callback(dirPath);
    }
  });
}

const deadClickButtons = [];
const deadLinks = [];
const alertToasts = [];
const todoComments = [];

walkDir(SRC_DIR, (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(process.cwd(), filePath);
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Check empty onClick
    if (
      line.includes("onClick={() => {}}") ||
      line.includes("onClick={() => { }}") ||
      line.includes("onClick={() => void 0}") ||
      line.includes("onClick={() => undefined}")
    ) {
      deadClickButtons.push({ file: relPath, line: lineNum, text: line.trim() });
    }

    // Check alert in onClick
    if (line.includes("alert(") && !line.includes("AlertCircle") && !line.includes("AlertTriangle") && !line.includes("showAlert")) {
      alertToasts.push({ file: relPath, line: lineNum, text: line.trim() });
    }

    // Check href="#"
    if (line.includes('href="#"') || line.includes("href='#'")) {
      deadLinks.push({ file: relPath, line: lineNum, text: line.trim() });
    }

    // Check TODO / FIXME
    if (line.includes("TODO") || line.includes("FIXME")) {
      todoComments.push({ file: relPath, line: lineNum, text: line.trim() });
    }
  });
});

console.log("=== BÁO CÁO QUÉT TOÀN BỘ SOURCE CODE DỰ ÁN ===");
console.log(`1. Nút bấm có onClick rỗng (Dead onClick): ${deadClickButtons.length}`);
deadClickButtons.forEach((b) => console.log(`   - [${b.file}:${b.line}] ${b.text}`));

console.log(`\n2. Nút bấm dùng alert() thô: ${alertToasts.length}`);
alertToasts.forEach((a) => console.log(`   - [${a.file}:${a.line}] ${a.text}`));

console.log(`\n3. Thẻ liên kết rỗng (href='#'): ${deadLinks.length}`);
deadLinks.forEach((l) => console.log(`   - [${l.file}:${l.line}] ${l.text}`));

console.log(`\n4. Ghi chú TODO/FIXME trong code: ${todoComments.length}`);
todoComments.forEach((t) => console.log(`   - [${t.file}:${t.line}] ${t.text}`));
