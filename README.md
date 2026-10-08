# qqmusic

Melo — AI 音乐陪伴伙伴。让音乐听懂你的情绪。

## 文件夹内容

- `melo/`：网站源码、组件、样式、项目文档、验证脚本与运行所需的公开素材。
- `assets/`：项目视觉素材与保留的原始场景图。
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

正式体验：[Melo](https://melo-qqmusic.vercel.app/)

预设演示：[Demo](https://melo-qqmusic.vercel.app/?demo=1)。演示明确标注为脚本回应，记录与真实模式隔离，音乐播放和下载功能可以实际使用。

GitHub Pages 主页：https://kakssjs.github.io/qqmusic/

主页使用构建后的 docs/ 网页，保留原有角色、流云视频、玻璃冰面和音乐播放。聊天、情绪、歌曲、收藏、记忆与音乐人格使用同一份体验状态。真实模式通过阿里云后端保存匿名会话记录，本浏览器保留详细聆听收据和未同步记录。清除浏览器存储会丢失匿名会话入口与本机收据。

GitHub Pages 自身不运行服务端 API，通过公开的 melo-backend.json 连接已授权的 HTTPS 后端；Vercel 使用同源接口中转。模型密钥只配置在阿里云服务器，前端不含模型密钥。正常模式不会用脚本伪造 AI 回复；接口失败时保留输入并提供重试和明确的演示入口。原 Sites 源码和后端仍保留在 melo/ 中。

验收结果见 melo/final-demo-verification.json，含真实 Preview、生产站和四种宽度的演示流程；补充故障注入结果见 melo/failure-recovery-verification.json。旧云端仅返回聆听总量，无法据此还原跨浏览器的每日明细；本浏览器新增明细按实际播放计时。手机尺寸通过 Chromium 验证，实体手机锁屏播放尚未验证。

GitHub Pages 构建：在 melo/ 下运行 npx vite build --config vite.pages.config.mjs，输出为 dist-pages/，将输出复制到仓库根目录 docs/ 后发布。

