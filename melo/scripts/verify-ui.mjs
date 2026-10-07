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
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(
  () => document.querySelector("video")?.readyState >= 2,
  { timeout: 30000 },
);
await page.waitForTimeout(1200);
const report = {};
report.video = await page
  .locator("video")
  .evaluate((v) => ({
    ready: v.readyState,
    paused: v.paused,
    muted: v.muted,
    loop: v.loop,
    inline: v.playsInline,
    time: v.currentTime,
    position: getComputedStyle(v).objectPosition,
  }));
report.content = await page.locator(".video-hero-content").innerText();
report.font = await page.evaluate(() => ({
  font: getComputedStyle(document.body).fontFamily,
  geist: [...document.fonts]
    .filter((f) => f.family === "Geist")
    .map((f) => f.status),
}));
await page.screenshot({ path: "D:/chatgpt/qqmusic/melo-rose-desktop.png" });
await page.mouse.wheel(0, 600);
await page.waitForTimeout(50);
const early = await page.evaluate(() => scrollY);
await page.waitForTimeout(400);
const later = await page.evaluate(() => scrollY);
report.lenis = {
  present: await page.evaluate(() =>
    document.documentElement.classList.contains("lenis"),
  ),
  early,
  later,
  inertia: later > early,
};
await page.getByRole("link", { name: "情绪", exact: true }).click();
await page.waitForTimeout(1500);
report.anchor = await page.evaluate(() => ({
  hash: location.hash,
  top: document.getElementById("emotion").getBoundingClientRect().top,
  focus: document.activeElement.id,
}));
report.product = {
  chat: await page.getByLabel("给 Melo 的消息").count(),
  emotion: await page.getByLabel("此刻，你感觉怎么样？").count(),
  music: await page.getByRole("slider", { name: "音乐播放进度" }).count(),
  memory: await page.locator("#memory").count(),
  journey: await page.locator("#journey").count(),
};
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForTimeout(350);
report.reduced = await page.evaluate(() => ({
  mode: document.documentElement.dataset.motion,
  lenis: document.documentElement.classList.contains("lenis"),
  videoPaused: document.querySelector("video").paused,
  revealsVisible: [...document.querySelectorAll(".reveal")].every(
    (e) => getComputedStyle(e).opacity === "1",
  ),
}));
await page.getByRole("link", { name: "音乐", exact: true }).click();
report.reducedAnchor = await page.evaluate(() => ({
  hash: location.hash,
  top: document.getElementById("music").getBoundingClientRect().top,
}));
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await mobile.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: "D:/chatgpt/qqmusic/melo-rose-mobile.png" });
report.mobile = await mobile.evaluate(() => ({
  width: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  heroHeight: document.getElementById("home").getBoundingClientRect().height,
  videoPosition: getComputedStyle(document.querySelector("video"))
    .objectPosition,
  paused: document.querySelector("video").paused,
}));
await mobile.getByRole("button", { name: "打开导航" }).click();
await mobile.getByRole("dialog").waitFor();
report.menu = await mobile.evaluate(() => ({
  overflow: document.body.style.overflow,
  width: document.querySelector(".melo-menu-panel").getBoundingClientRect()
    .width,
  focused: document.activeElement.tagName,
}));
await mobile.screenshot({ path: "D:/chatgpt/qqmusic/melo-rose-menu.png" });
await mobile.keyboard.press("Escape");
await mobile.getByRole("dialog").waitFor({ state: "hidden" });
report.escape = await mobile.evaluate(() => ({
  overflow: document.body.style.overflow,
  focus: document.activeElement.getAttribute("aria-label"),
}));
await mobile.getByRole("button", { name: "打开导航" }).click();
await mobile
  .getByRole("navigation", { name: "移动端导航" })
  .getByRole("link", { name: "聊聊", exact: true })
  .click();
report.mobileAnchor = await mobile.evaluate(() => ({
  hash: location.hash,
  top: document.getElementById("chat").getBoundingClientRect().top,
  overflow: document.body.style.overflow,
}));
report.errors = errors;
fs.writeFileSync(
  "D:/chatgpt/qqmusic/melo/ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (
  report.video.paused ||
  !report.lenis.inertia ||
  !report.reduced.videoPaused ||
  report.reduced.lenis ||
  report.mobile.documentWidth > 390 ||
  report.menu.overflow !== "hidden" ||
  errors.length
)
  process.exitCode = 1;
