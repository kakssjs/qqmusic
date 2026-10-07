import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)(
  "C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const browser = await chromium.launch({ headless: true });
const report = { errors: [], hero: [], mobile: [] };
const base = JSON.parse(
  fs.readFileSync("scripts/fixtures/hero-before-music-world.json", "utf8"),
);
const readHero = () =>
  Object.fromEntries(
    [
      "#home",
      ".cloud-title",
      ".cloud-statement",
      ".character-copy",
      ".character-stage",
      ".canonical-character-art",
      ".cloud-video",
    ].map((selector) => {
      const el = document.querySelector(selector),
        b = el.getBoundingClientRect(),
        s = getComputedStyle(el);
      return [
        selector,
        {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          font: s.fontFamily,
          fontSize: s.fontSize,
          color: s.color,
          opacity: s.opacity,
          mask: s.maskImage,
          filter: s.filter,
        },
      ];
    }),
  );
async function mock(page) {
  let records = [];
  const event = (type, payload) => ({
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: new Date().toISOString(),
  });
  await page.route("**/api/session", async (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      const body = req.postDataJSON(),
        item = event(body.type, body.payload);
      records.unshift(item);
      await route.fulfill({ json: { event: item } });
    } else if (req.method() === "DELETE") {
      records = [];
      await route.fulfill({ json: { ok: true } });
    } else
      await route.fulfill({ json: { events: records, aiConnected: true } });
  });
  await page.route("**/api/emotion", async (route) => {
    assert(route.request().postDataJSON().text.includes("疲惫"));
    await route.fulfill({
      json: {
        mood: "tired",
        reason: "今晚让节奏慢一点。",
        values: [82, 64, 91],
      },
    });
  });
  await page.route("**/api/chat", async (route) => {
    const text = route.request().postDataJSON().message;
    records.unshift(
      event("message", { role: "user", content: text }),
      event("message", {
        role: "assistant",
        content: "我在。今晚先陪你听一首歌。",
      }),
    );
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/story", async (route) => {
    const item = event("story", {
      keywords: ["探索", "坚持", "热爱"],
      story: "你把疲惫说给音乐，也给自己留了一段安静的时间。",
    });
    records.unshift(item);
    await route.fulfill({ json: { event: item } });
  });
}
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 390 ? 844 : 960 },
      reducedMotion: "reduce",
    });
    await mock(page);
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(
      await page.evaluate(readHero),
      base[width],
      "The approved Hero must remain unchanged",
    );
    report.hero.push({ width, unchanged: true });
    assert.deepEqual(
      await page
        .locator(".music-world>section")
        .evaluateAll((els) => els.map((e) => e.id)),
      ["emotion", "chat", "music", "memory", "journey", "ending"],
    );
    assert(
      await page.evaluate(
        () =>
          document.fonts.check("16px Inter") &&
          document.fonts.check("32px Manrope"),
      ),
    );
    for (const id of [
      "emotion",
      "chat",
      "music",
      "memory",
      "journey",
      "ending",
    ]) {
      const section = page.locator("#" + id);
      await section.scrollIntoViewIfNeeded();
      const colors = await section.evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
      }));
      assert.equal(colors.background, "rgb(5, 7, 6)");
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth === innerWidth,
        ),
        "No horizontal overflow at " + width + " / " + id,
      );
      await section.screenshot({
        path: "D:/chatgpt/qqmusic/melo-" + id + "-" + width + ".png",
        style: ".live-nav,.skip-link{visibility:hidden!important}",
      });
    }
    if (width === 390) {
      await page.getByRole("button", { name: "打开导航" }).click();
      await page.getByRole("dialog").waitFor();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "情绪", exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.equal(await page.evaluate(() => location.hash), "#emotion");
      report.mobile.push({ width, noOverflow: true, menu: true });
      await page.close();
      continue;
    }
    await page
      .getByLabel("此刻，你感觉怎么样？")
      .fill("今天有些疲惫，想静静听歌。");
    await page
      .getByRole("button", { name: "让 Melo 听懂", exact: true })
      .click();
    await page.waitForFunction(() =>
      document.querySelector(".floating-scores").textContent.includes("82"),
    );
    assert((await page.locator(".live-scores").innerText()).includes("91"));
    await page.getByRole("button", { name: "记住这一刻", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector(".memory-node") !== null,
    );
    assert((await page.locator(".memory-node").innerText()).includes("疲惫"));
    await page.getByLabel("给 Melo 的消息").fill("今晚想安静听歌。");
    await page
      .getByRole("button", { name: "发送给 Melo", exact: true })
      .click();
    await page.waitForFunction(() =>
      document
        .querySelector(".live-message.assistant")
        ?.textContent.includes("我在"),
    );
    await page.getByRole("button", { name: "播放音乐", exact: true }).click();
    await page.waitForTimeout(1300);
    assert(
      +(await page.getByRole("slider", { name: "音乐播放进度" }).inputValue()) >
        0,
    );
    await page.getByRole("slider", { name: "音乐播放进度" }).fill("40");
    await page.getByRole("slider", { name: "音量", exact: true }).fill("0.3");
    await page.getByRole("button", { name: "暂停音乐", exact: true }).click();
    await page.getByRole("button", { name: "下一首", exact: true }).click();
    assert.equal(await page.locator(".record-cover h3").innerText(), "雨后");
    await page.getByRole("button", { name: "上一首", exact: true }).click();
    assert.equal(
      await page.locator(".record-cover h3").innerText(),
      "月光停靠",
    );
    await page
      .getByRole("button", { name: "收藏当前音乐", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[aria-label="收藏当前音乐"]')
          .getAttribute("aria-pressed") === "true",
    );
    await page
      .getByRole("button", { name: "生成我的音乐故事", exact: true })
      .click();
    await page.waitForFunction(() =>
      document.querySelector(".journey-keywords").textContent.includes("探索"),
    );
    assert((await page.locator(".journey-numbers").innerText()).includes("1"));
    await page
      .locator("#memory")
      .screenshot({ path: "D:/chatgpt/qqmusic/melo-memory-with-records.png" });
    await page
      .locator("#journey")
      .screenshot({ path: "D:/chatgpt/qqmusic/melo-journey-with-story.png" });
    await page
      .getByRole("button", { name: "清空我的记录", exact: true })
      .click();
    assert(
      await page
        .getByRole("button", { name: "确认清空", exact: true })
        .isVisible(),
    );
    await page.getByRole("button", { name: "取消", exact: true }).click();
    assert((await page.locator(".memory-node").count()) > 0);
    report.functions = {
      emotion: true,
      save: true,
      chat: true,
      audio: true,
      seek: true,
      volume: true,
      skip: true,
      favorite: true,
      story: true,
      deleteCancel: true,
    };
    assert(
      !(await page.evaluate(() =>
        document.documentElement.classList.contains("lenis"),
      )),
    );
    assert(
      await page
        .locator(".music-world")
        .evaluate((el) =>
          el
            .getAnimations({ subtree: true })
            .every((a) => a.playState !== "running"),
        ),
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForTimeout(400);
    assert(
      await page.evaluate(() =>
        document.documentElement.classList.contains("lenis"),
      ),
    );
    await page
      .getByRole("link", { name: "melo ✳", exact: true })
      .first()
      .click();
    await page.waitForTimeout(1500);
    await page.mouse.move(700, 550);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(45);
    const early = await page.evaluate(() => scrollY);
    await page.waitForTimeout(450);
    const later = await page.evaluate(() => scrollY);
    assert(later > early);
    report.lenis = { early, later, smooth: true };
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(250);
    assert(
      await page
        .locator(".music-world .reveal")
        .evaluateAll((els) =>
          els.every((e) => getComputedStyle(e).opacity === "1"),
        ),
    );
    report.reducedMotion = true;
    await page.close();
  }
  assert.deepEqual(report.errors, []);
  fs.writeFileSync(
    "music-world-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
