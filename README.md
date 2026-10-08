# qqmusic · Melo

Melo — AI 音乐陪伴伙伴，让音乐听懂你的情绪。

## 在线体验

- 网站：https://melo-qqmusic.vercel.app/
- 比赛演示：https://melo-qqmusic.vercel.app/?demo=1
- GitHub Pages：https://kakssjs.github.io/qqmusic/

V4：十二段可完整播放的独立原创声音、八个真实歌曲官方搜索条目、透明推荐、六段 Melo Mix、五条 Discover、全局播放器、Now Playing、常驻伙伴、MY MELO、记忆与今日音乐卡。真实歌曲在 QQ 音乐官方页面查找，本站没有第三方全曲播放权限。

源码在 `melo/`；Vercel/GitHub Pages 发布内容在 `docs/`；现有 Node/SQLite 阿里云服务源码在 `backend/`。Secrets 只在服务器环境中，仓库不包含真实密钥或数据库。

## 本地运行

进入 melo，安装依赖后使用原有开发方式，或运行静态预览：

```sh
npm install
npx vite build --config vite.pages.config.mjs
npx vite preview --config vite.pages.config.mjs --port 5173
```

预览路径 `/qqmusic/?demo=1`。正常模式需要可访问的后端；Demo 使用明确标注的预设回应，独立存储。

## 验证

`melo/final-award-verification.json` 为 V4 实际验收汇总；早期 verification JSON 是历史版本证据，不代表当前新功能。详细说明见 `melo/README.md`。
