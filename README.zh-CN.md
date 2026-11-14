# Foxiv 的终端风格个人网站

同时提供终端交互和点击浏览，使用 React、TypeScript、Vite、styled-components 和 Zustand 构建。

[在线网站](https://parallelarc.github.io) · [English](README.md) ·
[开发指南](CONTRIBUTING.md) · [Agent 协作约定](AGENTS.md)

## 使用方式

- **浏览模式**：点击进入博客、筛选分类、加载更多文章和站内阅读。返回列表时保留分类及滚动位置，无需输入命令。
- **终端模式**：提供命令、历史记录、补全和可选的 AI 对话。保留原生文本输入的选择、多行编辑和中文输入法行为，方块光标会闪烁并将覆盖的字符反色。
- **主动切换模式**：使用顶部的 `>_ terminal` 和 `← browse`。终端内点击或输入命令会继续在终端中执行。
- **项目相册**：先展示四张预览图，点击后浏览完整相册。支持滑动、方向键和点击切换，关闭后回到原位置。
  光标悬停在主图或大图上时，也可以用触控板左右滑动或按住鼠标拖动切换；页面的上下滚动不受影响。

没有 hash 路径时，紧凑屏幕默认进入浏览模式，桌面默认进入终端模式。显式链接可以保留用户选择：

| 路径                     | 页面                   |
| ------------------------ | ---------------------- |
| `#/`                     | 浏览首页，桌面同样适用 |
| `#/blogs`                | 博客列表               |
| `#/blogs/<issue-number>` | 站内文章阅读           |
| `#/projects`             | 项目                   |
| `#/about`                | 个人介绍和联系方式     |
| `#/contact`              | 联系方式               |
| `#/terminal`             | 任意屏幕尺寸下的终端   |

界面说明使用英语，文章标题和正文保留原语言。

## 本地开发

使用与部署工作流一致的 Node.js 20.x（至少 20.19），通过 npm 和仓库中的 lockfile 安装依赖。以下命令直接使用已有博客快照，无需 GitHub 或模型密钥：

```bash
npm ci
VITE_BLOG_DATA_SOURCE=static npm run dev
```

使用同一快照构建并预览前端：

```bash
VITE_BLOG_DATA_SOURCE=static npm run build
npm run preview
```

`npm run build` 使用已有快照；需要更新文章时，显式运行 `npm run blog:generate`，并配置构建时的 GitHub token。AI 对话需要单独配置代理。配置和验证方式见[开发指南](CONTRIBUTING.md)。

## Agent 阅读入口

页头的 **For agents** 链接打开 [GitHub 阅读指南](docs/READING_GUIDE.md)。
简短的 `/llms.txt` 指向指南、博客 Issues 和仓库。文章原文保存在 GitHub，
网站不再生成独立的静态文章页或 Markdown 副本。原有 hash 链接、浏览模式和终端模式继续可用。

## 终端命令

| 命令        | 用途                         |
| ----------- | ---------------------------- |
| `/about`    | 个人介绍                     |
| `/projects` | 项目                         |
| `/contact`  | 联系方式                     |
| `/blogs`    | 终端内支持键盘操作的博客面板 |
| `/welcome`  | 欢迎信息和可点击的命令       |
| `/clear`    | 清空终端                     |

已注册命令也可以省略 `/`。其他普通文本在配置代理后进入 AI 对话。输入 `/` 打开命令菜单；空输入框中按 `?` 查看快捷键；`Enter` 提交，`Shift+Enter` 换行。

## 文档导航

| 文档                               | 内容                                |
| ---------------------------------- | ----------------------------------- |
| [AGENTS.md](AGENTS.md)             | 工程原则、产品约束及 Agent 工作方式 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 环境配置、检查、界面审查及部署      |
| [架构说明](docs/ARCHITECTURE.md)   | 代码入口、状态归属和内容流向        |
| [LLM 代理](cloudflare/README.md)   | Worker 配置、本地开发及部署         |

主要部署方式是推送 `main` 后触发 [GitHub Pages 工作流](.github/workflows/deploy.yml)，也支持手动触发该工作流。AI 请求由独立的 Cloudflare Worker 处理，可以与 GitHub Pages 前端搭配使用。[Cloudflare 部署工作流](.github/workflows/deploy-cloudflare.yml)是另一种手动触发的部署方式。

## 许可证

[MIT](LICENSE) © [parallelarc](https://github.com/parallelarc)
