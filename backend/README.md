# Melo 阿里云后端

Node.js 24 原生 HTTP + SQLite，无额外运行依赖。与当前 Melo 前端的 session/chat/emotion/story 接口兼容；原 Sites 后端仍保留。

## 运行

在 backend 目录执行 `npm start`。默认只监听 127.0.0.1:8080，数据库保存在 data/。运行 `npm test` 检查持久化、访客隔离、CORS、输入校验和模型接口契约。

环境变量：HOST、PORT、DATA_DIR、ALLOWED_ORIGINS（逗号分隔的精确来源）、AGNES_API_KEY、AI_BASE_URL、AI_MODEL。密钥只配置在服务器忽略的 .env 中，不能提交仓库。

## Windows ECS

使用阿里云云助手 PowerShell 执行 install-windows.ps1，安装官方 Node 并校验 SHA256，将后端写入服务器 ProgramData/Melo，以 MeloBackend 计划任务实现启动和失败重试。安装不会开放公网端口。

GET /api/session 在没有 X-Melo-Session 时创建随机匿名会话并返回 token。前端只在自己的浏览器保存 token，其他接口用 X-Melo-Session 请求；服务端只存 token 的哈希。更换浏览器不能自动同步匿名会话。数据库和配置应单独备份。

服务必须通过可信 HTTPS 反向代理接入 GitHub/Vercel 网页。健康检查为 /api/health。模型未配置时返回明确 503 错误，不生成虚假 AI 内容。不能把私有模型密钥放入前端。
