# 熊布朗 AI 实战营 Demo 03: JumpX 静态资源库与可视化中台

**JumpX Assets Portal (Global Assets CDN)**

本项目是由熊布朗 AI 实战营孵化的极简静态资源托管中台，采用了“代码即数据库”的设计理念，配合 GitHub Actions 与 Cloudflare Pages 实现毫秒级响应的图片 CDN 和自动生成的极客风画廊。

## 🌟 项目简介

为了彻底消灭在多个代码库中来回拷贝宣传图的低效行为，我们构建了 `course-assets`。
它同时具备双重身份：
1. **高速 CDN**：为所有 JumpX 下游业务提供极速的、统一规范的图片引用链接。
2. **可视化画廊**：为运营和教研团队提供了一个美观的网页门户，直接浏览、检索各个课程的海报素材。

## 🚀 核心交互流

本中台采用纯正的 **“零代码工作流”**，只需在浏览器端即可完成更新：
1. 在 GitHub 的 `/courses/<课程名>/` 目录点击 `Upload files` 上传新海报。
2. 确保**遵循同名覆盖原则**并控制体积，然后直接 `Commit changes`。
3. 等待约 15 秒，Cloudflare Pages 将自动触发构建并部署。
4. 打开门户网站，点击 **"Copy CDN Link"** 即可获取带有时间戳防缓存策略的外部引用 URL。

## 💻 如何本地运行

由于本项目采用极简的 SSG (Static Site Generation) 架构，本地运行极其轻量。

```bash
# 1. 克隆仓库
git clone https://github.com/JumpX-Labs/course-assets.git
cd course-assets

# 2. 生成最新画廊数据
npm run build

# 3. 启动本地预览 (需要 npx)
npm run dev
```
启动后访问 `http://localhost:3000` 即可预览极客风（Editorial Dev Tool 风格）画廊。

## 🛠️ 课后实战作业
1. **防缓存策略验证**：观察你复制的 CDN 链接，理解为什么我们需要在末尾自动附加 `?v=timestamp` 查询参数。如果去掉它，图片更新会有什么表现？
2. **构建脚本魔改**：尝试修改 `build-gallery.js` 中的 CSS，将其变为柔和明亮的“极简日系风”。观察构建产物 `index.html` 的变化。

## 📚 关于课程
以上内容是「熊布朗 AI 实战营」体系中的一部分，带领学员从零构建现代化、极客范的全栈应用。
关注我们获取更多：[JumpX Labs](https://jumpx-labs.com)
