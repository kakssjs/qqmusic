import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const {
  chromium,
} = require("C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const report = {};
report.initial = await page.evaluate(() => ({
  title: document.title,
  scroll: scrollY,
  lenis: document.documentElement.classList.contains("lenis"),
  width: document.documentElement.scrollWidth,
}));
await page.screenshot({ path: "D:/chatgpt/qqmusic/melo-final-desktop.png" });
await page.mouse.move(1100, 700);
await page.mouse.wheel(0, 650);
await page.waitForTimeout(50);
const y1 = await page.evaluate(() => scrollY);
await page.waitForTimeout(450);
const y2 = await page.evaluate(() => scrollY);
report.smoothWheel = { early: y1, later: y2, inertia: y2 > y1 };
await page.getByRole("link", { name: "情绪", exact: true }).click();
await page.waitForTimeout(1500);
report.anchor = await page.evaluate(() => ({
  hash: location.hash,
  top: document.getElementById("emotion").getBoundingClientRect().top,
  focus: document.activeElement.id,
}));
await page
  .getByLabel("此刻，你感觉怎么样？")
  .fill("验证记录：今天完成了钢琴练习，感到有些疲惫，想安静听一会音乐。");
await page.getByRole("button", { name: "让 Melo 听懂", exact: true }).click();
await page.waitForResponse((r) => r.url().endsWith("/api/emotion"), {
  timeout: 40000,
});
await page.waitForTimeout(300);
report.emotion = await page.locator(".live-scores").innerText();
report.reason = await page.locator(".emotional-state").innerText();
await page.getByRole("button", { name: "记住这一刻", exact: true }).click();
await page.waitForResponse(
  (r) => r.url().endsWith("/api/session") && r.request().method() === "POST",
);
await page.waitForTimeout(300);
await page.getByRole("link", { name: "聊聊", exact: true }).click();
await page.waitForTimeout(1300);
await page
  .getByLabel("给 Melo 的消息")
  .fill("我刚刚的验证记录里练习了什么乐器？只回答乐器名称。");
await page.getByRole("button", { name: "发送给 Melo" }).click();
const chatResponse = await page.waitForResponse(
  (r) => r.url().endsWith("/api/chat"),
  { timeout: 40000 },
);
report.chatStatus = chatResponse.status();
await page.waitForTimeout(700);
report.chatMemory = await page
  .locator(".live-message.assistant")
  .last()
  .innerText();
await page.getByRole("link", { name: "音乐", exact: true }).click();
await page.waitForTimeout(1400);
await page.getByRole("button", { name: "播放音乐", exact: true }).click();
await page.waitForTimeout(1800);
report.audio = {
  progress: await page
    .getByRole("slider", { name: "音乐播放进度" })
    .inputValue(),
  wave: await page
    .locator(".real-wave")
    .evaluate((e) =>
      [...e.children].some((c) => parseFloat(c.style.height) > 4),
    ),
};
await page.getByRole("slider", { name: "音乐播放进度" }).fill("40");
await page.waitForTimeout(300);
report.seek = await page
  .getByRole("slider", { name: "音乐播放进度" })
  .inputValue();
await page.getByRole("slider", { name: "音量", exact: true }).fill("0.3");
await page.getByRole("button", { name: "暂停音乐", exact: true }).click();
await page.getByRole("button", { name: "收藏当前音乐" }).click();
await page.waitForTimeout(500);
report.favorite = await page
  .getByRole("button", { name: "收藏当前音乐" })
  .getAttribute("aria-pressed");
await page.getByRole("link", { name: "旅程", exact: true }).click();
await page.waitForTimeout(1300);
await page
  .getByRole("button", { name: /生成我的音乐故事|更新我的音乐故事/ })
  .click();
const storyResponse = await page.waitForResponse(
  (r) => r.url().endsWith("/api/story"),
  { timeout: 40000 },
);
report.storyStatus = storyResponse.status();
await page.waitForTimeout(400);
report.story = await page.locator(".your-music-story>p").innerText();
report.keywords = await page.locator(".journey-keywords").innerText();
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
report.persisted = await page.locator(".space-memories").innerText();
report.listened = await page.locator(".journey-numbers").innerText();
report.errors = errors;
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForTimeout(300);
report.reduced = await page.evaluate(() => ({
  mode: document.documentElement.dataset.motion,
  lenis: document.documentElement.classList.contains("lenis"),
  particles: getComputedStyle(document.querySelector(".hero-stars")).display,
  animation: getComputedStyle(document.querySelector(".life-core img"))
    .animationName,
  revealsVisible: [...document.querySelectorAll(".reveal")].every(
    (e) => getComputedStyle(e).opacity === "1",
  ),
}));
await page.getByRole("link", { name: "记忆", exact: true }).click();
report.reducedAnchor = await page.evaluate(() => ({
  hash: location.hash,
  top: document.getElementById("memory").getBoundingClientRect().top,
}));
await page.screenshot({ path: "D:/chatgpt/qqmusic/melo-final-memory.png" });
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await mobile.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(300);
await mobile.screenshot({ path: "D:/chatgpt/qqmusic/melo-final-mobile.png" });
report.mobile = await mobile.evaluate(() => ({
  width: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  scroll: scrollY,
}));
await mobile.getByRole("button", { name: "打开导航" }).click();
await mobile.getByRole("link", { name: "聊聊", exact: true }).click();
report.mobileNav = await mobile.evaluate(() => ({
  hash: location.hash,
  open: document.querySelector(".live-nav nav").classList.contains("open"),
}));
fs.writeFileSync(
  "D:/chatgpt/qqmusic/melo/verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (
  !report.initial.lenis ||
  !report.smoothWheel.inertia ||
  report.chatStatus !== 200 ||
  !report.chatMemory.includes("钢琴") ||
  report.storyStatus !== 200 ||
  errors.length ||
  report.reduced.lenis ||
  !report.reduced.revealsVisible ||
  report.mobile.documentWidth > 390
)
  process.exitCode = 1;
