import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve("data/dictionary");
const sources = [
  ["cedict.zip", "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip"],
  ["Unihan.zip", "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"],
  ["cedict-vi.zip", "https://raw.githubusercontent.com/MarshNg/yomilens-dictionaries/86cc70dfa4aa83284771051da9c598c8efbd3c4a/cedict-vi.zip"],
];
await mkdir(directory, { recursive: true });
for (const [name, url] of sources) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Download ${name}: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error(`${name} is not a ZIP archive`);
  await writeFile(path.join(directory, name), bytes);
  console.log(`Downloaded ${name}: ${bytes.length} bytes`);
}
await writeFile(path.join(directory, "sources.json"), JSON.stringify({ downloadedAt: new Date().toISOString(), sources }, null, 2));
