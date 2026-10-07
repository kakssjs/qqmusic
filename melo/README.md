# Melo

AI虚拟音乐伙伴。让音乐听懂你的情绪。

## 参考人物、冰面与小精灵修正

首页人物使用 `mascot/melo-reference-cutout.png`，保留参考图的歪头、伸手姿势和立体脸部，移除平面 SVG 五官。默认为参考图的 wink。其余表情与自动眨眼复用 `painted-heads.png` 的局部绘制五官，通过 PaintedExpression 进行渐变；身体、头发与服装保持同一基础资源，不再拼接头身。两份资源由内置 imagegen 根据选定参考图提取和制作，原资源保留。

首屏和推荐唱片使用 `cloud-ice-scene.webp`，由内置 imagegen 生成的原始 PNG 已保存在仓库根目录 `assets/cloud-ice-scene-source.png`。WebP 保持原画面尺寸，约减少 92% 体积。原 `hero-clouds.mp4` 继续作为灰蓝流云动态层播放；减少动态效果或开启省流量/慢速网络时保留静态场景，不请求背景视频。

MusicCompanion 支持漂浮、摇摆、叶片摆动、眨眼、音乐律动以及点击打招呼。Hover 暂停漂浮便于点击，点击后显示短暂跳跃与星光。系统减少动态效果时关闭这些动画，保留点击和表情选择。

## 灰蓝云境首页

按选定参考图重排首屏：左侧大号 Melo、说明与绿色主按钮，右侧门前人物、薄荷音乐光带与悬浮伙伴。保留原始 `public/hero-clouds.mp4`（SHA-256 F088D32EC4B9924D6D7D5CABE88A45F5884DDD4ADB1A9C0229FE96FC6426B180），没有替换成静态背景。

CloudBackground 使用 SVG 色彩矩阵，将视频和加载海报同步映射为灰蓝/雾白色，再添加文字遮罩和薄荷光晕。保留循环播放、静音、移动端内联、后台暂停/恢复、用户交互恢复和 reduced-motion 暂停。CloudBackground.tsx 和 cloud-hero.css 控制此首屏。

`character-cloud-v2.png` 使用内置 imagegen，参考选定效果图与原分层坐标生成伸手姿态；原角色素材保留。提示要求：与参考图相同的薄荷双发髻、音符耳机、白绿外套、黑色短裤和运动鞋，头身分离透明资源，上部无五官，下部伸手友好姿态，复用既有坐标。五官仍由 MeloFace 控制，七种表情继续可选。

`node scripts/verify-cloud-hero.mjs` 检查原视频哈希、真实播放、灰蓝滤镜、页面排版、减少动态及移动端。流云视频的场景和镜头保留，因此与静态参考图的云朵形状、门内场景和水面细节存在差异。

## 动态首页角色（2026-10-07）

首页已改为黑绿 Melo 音乐舞台。按用户参考图制作薄荷白双发髻、音符耳机、机能外套、黑色短裤与运动鞋，使用 2.5D 分层素材，按主参考人物缩小头部、放大身体比例。

- 七种状态：happy / wink / surprise / listen / calm / love / care。450ms 五官路径过渡，头像选择器复用同一个 MeloFace。
- 随机自动眨眼、呼吸、身体重心移动、头部轻微跟随指针、悬浮机器人、耳机灯光和音乐波纹。
- 选择器默认隐藏；键盘方向键、Home / End、Escape 均可用；手机使用底部玻璃面板。
- 原有音乐播放器播放时进入 listen，暂停回 calm；聊天入口为 calm，疲惫/失败等消息为 care，成功收到回复回 calm；收藏成功为 love。
- 系统 prefers-reduced-motion 和页面静态开关均关闭浮动、跟随与律动，同时保留表情切换。

### 统一表情接口

`hooks/useExpression.ts` 导出 `useExpression()`，返回 `{ expression, setExpression }`。例如 `setExpression("care")`。现有 `useLiveMelo()` 也直接返回这两个字段，供聊天、音乐和首页共享。类型在 `data/expressions.ts`。

`components/melo/` 下新增 MeloCharacter、MeloFace、MeloScene、MeloHero、ExpressionPicker、MusicWave、CharacterArt。资源在 `public/mascot/`，内置 imagegen 生成的 PNG 由内联 SVG 按坐标复用。头发与耳机合在头部绘制层，衣服与四肢合在身体绘制层；这是可扩展的 2.5D 网页角色，不是完整骨骼 3D 或逐部位 Live2D 模型。

运行 `node scripts/verify-character.mjs` 执行桌面/移动端交互检查，结果在 `character-verification.json`。截图保存于项目上级目录。该验证不替代实体手机测试。

## 运行

在当前目录执行 `npm install`，然后执行 `npm run dev`。预览地址为 http://127.0.0.1:5173/ 。本地登录使用 Sites 的开发身份，线上使用真实登录身份。

## 功能

- Agnes AI 真实对话，结合已保存的心情和对话上下文。
- Agnes AI 情绪理解，返回音乐适配信号和推荐理由。
- 五段原创程序合成音乐，支持播放、暂停、切歌、进度和音量。
- 个人心情、对话、收藏、聆听时长存储在服务端 D1，按登录用户隔离。
- 基于真实记录生成个人关键词、音乐故事和记忆摘要。
- Lenis 平滑滚动与 GSAP ScrollTrigger，支持系统减少动态效果设置。

## 结构

`components/melo/live/` 包含 Hero、AIChat、EmotionAnalysis、MusicRecommendation、MemorySpace、Journey、Contact 和共享状态。

`components/melo/useMeloAudio.ts` 包含原创音乐合成和真实播放状态。

`app/api/` 包含聊天、情绪、个人记录和音乐故事接口。

`app/index.css`、`app/rose-ui.css` 与 `tailwind.config.ts` 实现视频首屏、Geist 字体、玫瑰灰视觉与侧滑菜单。Melo 文案与产品内容保持不变。

React / Next.js API，Vite（Vinext）构建，Tailwind CSS 4，Framer Motion，GSAP，Lenis。Tailwind 4 使用导入方式而非旧版 `@tailwind` 指令，基础重置放在 base 层以保留响应式工具类优先级。

## 服务配置

本地 `.dev.vars` 中设置 `AGNES_API_KEY`、`AI_MODEL` 与 `AI_BASE_URL`。该文件已被忽略。线上密钥通过 Sites 服务端 Secret 配置，不能写入前端代码或提交到仓库。更换密钥后需同步更新线上 Secret 并重新发布。

## 验证

`npx tsc --noEmit` 和 `npm run build`。

`verification.json` 记录真实 AI、情绪、音乐播放、记忆恢复和故事生成验证；`ui-verification.json` 记录视频播放、Geist、滚动惯性、锚点、移动菜单和减少动态效果验证。

程序合成音乐不是第三方流媒体曲库。当前部署默认仅自己可访问，若用于评委访问，需要另行开放网站访问权限。
