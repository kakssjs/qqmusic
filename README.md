# qqmusic · Melo

Melo — AI 音乐陪伴伙伴，让音乐听懂你的情绪。

## 在线体验

- [Melo 在线网站](https://melo-qqmusic.vercel.app/)
- [比赛预设演示](https://melo-qqmusic.vercel.app/?demo=1)
- [GitHub 仓库](https://github.com/kakssjs/qqmusic)
- [GitHub Pages](https://kakssjs.github.io/qqmusic/)

项目包括情绪对话、实时语音、音乐旅程、播放器、Melo Mix、发现、记忆和音乐日记。现有曲库保留 16 段原创音乐、7 首用户提供歌曲与编辑选曲，并新增官方赛事参考歌单的 156 首歌曲目录，支持按曲名或歌手搜索、打开 QQ 音乐官方歌曲页。

赛事参考目录仅包含歌曲元数据和官方链接，播放由 QQ 音乐提供。比赛预设演示使用单独存储的预设回应；正常模式通过阿里云后端提供真实 AI 对话和记忆。

## 项目结构

- `melo/`：完整 React 前端源码、角色素材、音乐资源与构建脚本。
- `backend/`：Node/SQLite 后端、AI 服务和实时语音服务源码。
- `docs/`：Vercel/GitHub Pages 发布页面、静态资源与 Vercel API 代理。
- `start-melo-local.mjs`、`打开Melo本地网站.cmd`：Windows 本地预览启动入口。

真实密钥、环境变量和个人会话数据库保存在服务器环境中。

## 本地运行

需要 Node.js 22.13 或更高版本；后端使用 Node.js 24 或更高版本。

```sh
cd melo
npm install
npx vite build --config vite.pages.config.mjs
npx vite preview --config vite.pages.config.mjs --host 127.0.0.1 --port 4173
```

访问 `http://127.0.0.1:4173/qqmusic/`。完成安装和构建后，Windows 可直接双击根目录的 `打开Melo本地网站.cmd`。

## 发布

Vercel 项目 `melo-qqmusic` 连接本仓库的 `main` 分支，以 `docs/` 作为发布目录。修改前端后，重新执行静态构建，将 `melo/dist-pages/` 内的页面与资源复制到 `docs/`，保留 `docs/api/` 和 `docs/vercel.json`，再提交到 GitHub。

Vercel 同源 API 代理连接现有阿里云服务；后端代码更新需要另外部署到服务器。后端配置见 `backend/README.md`，前端功能说明与历史验收记录见 `melo/README.md`。
