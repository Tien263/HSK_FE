import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

export async function checkExamBrowser({ baseUrl, cookie, attemptId, gradeHsk }) {
  const executablePath = process.env.CHROME_BIN || (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : execFileSync("which", ["google-chrome"], { encoding: "utf8" }).trim());
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: process.env.GITHUB_ACTIONS ? ["--no-sandbox"] : [],
  });
  const page = await browser.newPage();
  let step = "result";
  const open = query => page.goto(`${baseUrl}/s/mock-exam?${new URLSearchParams(query)}`, { waitUntil: "domcontentloaded" });
  const waitForText = (selector, expected, timeout = 10000) => page.waitForFunction(
    (query, text) => [...document.querySelectorAll(query)].some(node => node.textContent.includes(text)),
    { timeout }, selector, expected,
  );
  const click = label => page.locator(`::-p-xpath(//button[normalize-space(.)=${JSON.stringify(label)}])`).click();
  const clickHistory = title => page.locator(
    `::-p-xpath(//section[h2[normalize-space(.)=${JSON.stringify(title)}]]//tbody//button)`,
  ).click();
  const scoreCards = () => page.$$eval('section[aria-label^="Kết quả "]', cards => cards.map(card => {
    const { x, y, width, height } = card.getBoundingClientRect();
    return { x, y, width, height };
  }));

  try {
    // Start with the optional install prompt dismissed so it cannot cover an exam control.
    await page.evaluateOnNewDocument(() => localStorage.setItem("hanyu_pwa_dismissed_at", String(Date.now())));
    const separator = cookie.indexOf("=");
    await page.browserContext().setCookie({
      name: cookie.slice(0, separator),
      value: cookie.slice(separator + 1),
      url: baseUrl,
    });
    await page.setViewport({ width: 1280, height: 900 });
    await open({ view: "attempt", id: attemptId });
    await waitForText('[aria-label="Kết quả HSK"]', "Chờ chấm");
    await waitForText('[aria-label="Kết quả HSKK"]', "Đã chấm");
    const [hsk, hskk] = await scoreCards();
    assert.equal(hsk.y, hskk.y, "Desktop result cards should share a row");
    assert.equal(hsk.width, hskk.width, "Desktop result cards should have equal widths");
    assert.equal(hsk.height, hskk.height, "Desktop result cards should have equal heights");
    const pendingRow = await page.$$eval("tbody tr", rows => rows.find(row => row.cells[0].textContent === "Viết")?.cells[2].textContent);
    assert.equal(pendingRow, "—");

    step = "mobile";
    await page.setViewport({ width: 390, height: 844 });
    const [mobileHsk, mobileHskk] = await scoreCards();
    assert.equal(mobileHsk.x, mobileHskk.x, "Mobile result cards should share a column");
    assert.ok(mobileHskk.y > mobileHsk.y, "HSKK should appear below HSK on mobile");

    step = "grade-sync";
    await gradeHsk();
    await waitForText('[aria-label="Kết quả HSK"]', "Đã chấm", 30000);
    await waitForText('[aria-label="Kết quả HSKK"]', "1,5");

    step = "oral-history";
    await page.setViewport({ width: 1280, height: 900 });
    await open({ view: "history" });
    await clickHistory("Bảng thành tích HSKK");
    await waitForText("h1", "Kết quả thi HSKK");
    step = "oral-recording";
    await click("Xem bản ghi và nhận xét");
    await waitForText("main", "Luyện thêm thanh điệu.");
    step = "written-history";
    await open({ view: "history" });
    await clickHistory("Bảng thành tích HSK");
    await waitForText("h1", "Kết quả thi HSK");
    assert.equal((await scoreCards()).length, 1);

    step = "review";
    await open({ view: "review" });
    await waitForText("h1", "Ôn tập câu sai");
    await click("Từ vựng yếu");
    await waitForText("article", "文章 nghĩa là bài văn.");
    await click("Ngữ pháp yếu");
    await waitForText("article", "Mẫu 比 dùng để so sánh.");
    assert.equal(await page.$$eval("article", cards => cards.some(card => card.textContent.includes("文章 nghĩa là bài văn."))), false);
    await click("Câu sai đã lưu");
    await waitForText("p", "Chưa có câu sai trong nhóm này.");
    console.log("✅ [PASS] Exam browser regression: desktop/mobile, independent grades, history, and unsaved review topics");
  } catch (error) {
    const directory = process.env.HSK_BROWSER_ARTIFACTS;
    if (directory) {
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, `${step}.png`), fullPage: true });
    }
    throw new Error(`Exam browser regression failed at ${step} (${page.url()})`, { cause: error });
  } finally {
    await browser.close();
  }
}
