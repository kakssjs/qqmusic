# Melo V4 — AI 音乐陪伴伙伴

## 当前部署与真实能力

前端为 Vite/React 静态构建，发布到 Vercel `docs/`。同源 `/api/*` 代理连接阿里云已有 Node/SQLite 后端。AI 使用服务端 Agnes 配置，真实聊天、核心五类音乐情绪、音乐故事保留；不在前端存放 AI 或 TME Secrets。这里不是当前线上使用 D1 或 Sites 登录的说明。

核心链路：表达 → AI 音乐状态 → 标签打分的多首推荐 → 播放/Mix → 收藏/Memory → Journey/分享卡。AI 分析不是心理健康诊断。场景与风格从用户原文的明确关键词提取，推荐规则可解释，没有宣传深度学习模型。

## 曲库与合法来源

- `data/music/catalog.ts`：20 个推荐条目，12 段 Melo Original + 8 个编辑选曲元数据。
- 原创音乐是为本项目制作的不同旋律、和弦、音色与节拍，90 秒 PCM WAV 在 `public/music/audio/`；生成源 `scripts/render-original-audio.mjs` + `lib/music/provider.ts`。不是商业歌曲录音，也不宣称专业录音室作品。
- QQ MUSIC 条目只提供歌名/艺术家和 `y.qq.com/n/ryqq/search` 官方搜索链接，不使用未经授权音频、歌词或唱片封面。展示封面是 Melo 自制抽象艺术；时长为未知（0），不虚构版本时长。
- 当前未配置官方 TME 音频或第三方 licensed-demo 资源。Provider 支持经授权 URL 的官方/授权路径，实际默认仅使用原创；文件无法加载时可在本机合成同一原创曲目。官方搜索在不同地区/登录状态下的可用性由 QQ 音乐决定。
- 不预加载整库。首次播放按需下载并解码单曲，内存最多缓存四段；全局队列跨页面区段继续播放。实体手机锁屏/切后台的行为还需实机验证。

## 模块

`data/music/` 类型、情绪与场景；`lib/music/` 原创音源、规则推荐、旧服务器兼容。
`components/music/` TrackCard、Playlist、DiscoverRail、Player/Now Playing、CompanionDock、MY MELO、MemoryCard、LateMount。
`components/melo/live/` 原对话、情绪、记忆、故事和现有 Today Card，共享一个控制器。
`hooks/useExpression.ts` 七种正式表情的共享订阅存储。动作 mode 与 facial expression 分开；统一参考角色和五官贴图不改坐标。

## 记录与兼容

旧 ECS 校验只接受 calm/tired/sad/bright/focus 的 track；V4 发送 legacy coreMood + catalogTrackId，客户端按 catalogTrackId 还原，避免新曲收藏混淆。Mix 收藏同样用现有 favorite 记录，单曲查询排除 Mix。Memory 保存原时刻 momentAt、实际 track、playlist 和 Mix，重听恢复队列。音乐人格在 0/1/3/5 次真实状态逐步形成，不编造用户偏好。

正常模式匿名云会话与浏览器聆听收据合并。Demo 使用独立 `melo-demo-v2`，回应是显式预设。AI 异常保留输入，可重试、先听音乐或进入 Demo。浏览器存储不可用时不阻止播放；本机待同步记录能否刷新后保留取决于存储权限。

## 视觉与交互

保留云视频、玻璃冰面、主构图和七张表情素材；新增灰蓝、薄荷、雾白与少量暖金的抽象封面。Inter 自托管预加载，中文使用系统字体。Lenis 和 reduced motion 保留，发现区/个人空间接近视口才挂载。Dock 在离开 Hero 后出现，可收起/关闭，每个页面会话最多两次真实30秒聆听反馈；移动键盘缩小视口时隐藏。角色为轻量2.5D图层，不是完整骨骼/逐发丝/逐手指 Live2D。

## 验证命令

```sh
npx tsc --noEmit
node scripts/verify-music-catalog.mjs
npx vite build --config vite.pages.config.mjs
node scripts/verify-award.mjs
node scripts/verify-failure-recovery.mjs
```

`verify-award.mjs` 用 MELO_TEST_URL 指定目标；MELO_TEST_MODE=real 使用真正线上 API，demo 使用独立预设。输出在 D:/chatgpt/qqmusic/award-v4-validation。Vercel Preview 保护使用临时分享凭证，不保存到仓库或报告。

`final-award-verification.json` 只汇总真实结果；历史 verification JSON 保留为历史证据。自动化模拟1440/390/430，不替代实体手机与 QQ 音乐真实账号测试。
