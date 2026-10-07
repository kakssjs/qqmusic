# qqmusic

Melo — AI 音乐陪伴伙伴。让音乐听懂你的情绪。

## 文件夹内容

- `melo/`：网站源码、组件、样式、项目文档、验证脚本与运行所需的公开素材。
- `assets/`：项目视觉素材。
- `package-portable.mjs`：部署打包脚本。
- `melo-deployment.tar.gz`：当前版本部署产物。
- 根目录 PNG：参考图、桌面与手机页面效果图、人物表情和过渡效果截图。

## 本地运行

进入 `melo` 文件夹，安装依赖后运行开发服务：

```sh
npm install
npm run dev
```

聊天与数据存储功能需要配置自己的服务凭据和运行环境，详情见 `melo/README.md`。本仓库不包含私钥、API 密钥、本地数据库、依赖包、缓存。



## 在线访问

GitHub Pages 主页：https://kakssjs.github.io/qqmusic/

主页由 GitHub Pages 发布构建后的 docs/ 网页，保留原有角色、流云视频、玻璃冰面和音乐播放。GitHub 网页版将收藏、心情记录和聆听时长保存在当前浏览器，清除浏览器数据会删除这些记录。

GitHub Pages 不运行服务端 API，因此 AI 聊天、AI 情绪分析和 AI 故事生成需要使用页面底部的完整在线版入口（其访问权限由该服务独立管理）。网页版不会伪造 AI 回复。原 Sites 源码和后端仍保留在 melo/ 中。

GitHub Pages 构建：在 melo/ 下运行 npx vite build --config vite.pages.config.mjs，输出为 dist-pages/，将输出复制到仓库根目录 docs/ 后发布。

