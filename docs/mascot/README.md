# Melo 分层角色

character-layers.png：内置 imagegen 根据用户参考图生成的透明资源。上半部分是无五官头部，下半部分是独立身体；共享一份图片，七种表情不会重新下载整人物。

head/head.svg 与 body/body.svg 定义资源坐标。注意：浏览器 img 中 SVG 不允许加载外部图片，因此角色组件使用内联 SVG image 引用同源 PNG。

头发、耳机与头部合为一个高质量绘制层；服装、四肢与身体合为一个绘制层。当前不是每根头发或每条手臂都独立绑定的 Live2D 模型。呼吸和重心移动控制身体层，歪头与跟随控制头部层，灯光和配饰独立叠加。

eyes / mouth / brows：表情路径集中在 components/melo/MeloFace.tsx，由 Expression 状态驱动，450ms 过渡；不保存重复 PNG。

effects / accessories：MusicWave、MeloScene 和 character.css 绘制耳机灯光、音乐波纹、伴随机器人与心形效果。

生成提示：根据参考图的薄荷白双丸子头与音符耳机制作透明分层资源，上方为正面无眼睛眉毛嘴巴的头部，下方为无头身体；白绿机能外套、白色内搭、黑色短裤、运动鞋、音符腰包；统一高级二次元立体材质，无文字背景。使用内置 imagegen。
