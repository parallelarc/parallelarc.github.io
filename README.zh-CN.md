<div align="center">

![Terminal Portfolio](public/demo.jpg)

# Terminal Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

**一个带有交互式命令行界面的终端风格个人网站**

[**在线预览**](https://parallelarc.github.io) &nbsp;•&nbsp; [功能特性](#-功能特性) &nbsp;•&nbsp; [快速开始](#-快速开始)

</div>

---

## &nbsp; 项目简介

一个以交互式终端体验构建的现代个人作品集网站。具备命令行界面、插件系统、主题切换和可扩展的命令系统 — 适合想要以独特方式展示作品的开发者。

## &nbsp; 功能特性

| 特性 | 描述 |
|------|------|
| **命令行界面** | 带有命令历史、自动补全和快捷键的交互式终端 |
| **插件系统** | 可扩展架构，支持添加自定义命令和功能 |
| **主题支持** | 6 种内置主题：dark、light、blue-matrix、espresso、green-goblin、ubuntu |
| **命令注册** | 集中式命令管理，支持别名和分类 |
| **事件系统** | 插件间通信的发布-订阅模式 |
| **状态管理** | 基于 Zustand 的终端和主题状态管理 |
| **PWA 支持** | 可安装为渐进式 Web 应用 |

## &nbsp; 内置命令

| 命令 | 描述 |
|------|------|
| `about` | 显示网站所有者信息 |
| `blog` | 查看博客文章（从 GitHub Issues 获取） |
| `contact` | 显示联系方式和社交链接 |
| `education` | 显示教育背景 |
| `projects` | 展示项目作品集 |
| `welcome` | 显示欢迎信息 |
| `clear` | 清空终端屏幕 |

## &nbsp; 技术栈

- **React 18** — UI 库
- **TypeScript** — 类型安全
- **Vite** — 构建工具
- **Styled Components** — CSS-in-JS 样式
- **Zustand** — 状态管理
- **Vitest** — 测试框架
- **React Icons** — 图标库

## &nbsp; 快速开始

```bash
# 克隆仓库
git clone https://github.com/parallelarc/parallelarc.github.io.git
cd parallelarc.github.io

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## &nbsp; 开发

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run coverage

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## &nbsp; 架构设计

### 命令系统

通过 `CommandRegistry` 单例注册命令：

```ts
import { commandRegistry } from './core/CommandRegistry';

commandRegistry.register({
  id: 'mycmd',
  name: 'mycmd',
  description: '我的命令',
  component: () => import('./mycmd'),
  aliases: ['mc'],
  category: 'info',
});
```

### 插件系统

插件通过 `PluginContext` 获取命令注册、状态和事件的访问权限：

```ts
import type { Plugin } from './types/plugin';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context) => {
    context.registerCommand({ /* ... */ });
    context.on('my-event', (data) => { /* ... */ });
  },
  destroy: () => { /* 清理工作 */ },
};

pluginManager.load(myPlugin);
```

### 项目结构

```
src/
├── App.tsx                 # 主题提供者、全局布局
├── components/
│   ├── Terminal.tsx        # 核心终端组件
│   ├── Output.tsx          # 命令输出渲染器
│   ├── TermInfo.tsx        # 提示符/路径显示
│   └── styles/             # Styled Components 主题样式
├── commands/               # 命令实现
├── core/                   # CommandRegistry、PluginManager、EventBus
├── hooks/                  # 自定义 React Hooks
├── stores/                 # Zustand 状态存储
├── types/                  # TypeScript 类型定义
└── utils/                  # 工具函数
```

## &nbsp; 部署

### Cloudflare（推荐）

该方案可确保 LLM Key 仅保存在服务端，不会暴露到前端资源中。

1. 安装 Wrangler 并登录：

```bash
npx wrangler login
```

2. 配置 Worker Secrets（一次性）：

```bash
npx wrangler secret put ANTHROPIC_COMPAT_API_KEY
```

3. 配置 Worker 变量（`wrangler.toml` 或 Cloudflare Dashboard）：
- `DEFAULT_PROVIDER=anthropic-compatible`
- `ANTHROPIC_COMPAT_BASE_URL=https://open.bigmodel.cn/api/anthropic`（或你的兼容网关基地址）
- `ANTHROPIC_COMPAT_AUTH_MODE=x-api-key`（或 `bearer`）
- `ANTHROPIC_COMPAT_MODEL=claude-3-5-sonnet-latest`

4. 部署代理 Worker：

```bash
npm run cf:worker:deploy
```

5. 配置前端环境变量：
- `VITE_LLM_PROXY_URL` = 你的 Worker 地址（例如 `https://xxx.workers.dev`）
- `VITE_LLM_PROVIDER=anthropic-compatible`
- 可选：`VITE_LLM_ANTHROPIC_COMPAT_MODEL`

6. 部署站点到 Cloudflare Pages：
- 使用工作流：`.github/workflows/deploy-cloudflare.yml`
- 需要的 GitHub Secrets：
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- 可选 GitHub Variable：
  - `CLOUDFLARE_PAGES_PROJECT`（默认 `parallelarc-portfolio`）

更多代理配置说明见：`cloudflare/README.md`

### GitHub Pages（仅静态）

GitHub Pages 仍可用于纯静态部署；若需要实时 AI 对话，建议使用 Cloudflare Worker 代理以避免暴露模型提供商 key。

### 博客配置

博客文章从 `public/blog.json` 加载。自定义方式：

1. 在仓库中创建带有 `blog` 标签的 issue
2. 运行 `npm run blog:generate` 更新 `blog.json`
3. 提交并推送更改

本地开发也可以直接编辑 `public/blog.json`，或在 `.env` 中设置 `VITE_BLOG_DATA_SOURCE=api` 使用 API 模式。

---

## &nbsp; 许可证

[MIT](LICENSE) © [parallelarc](https://github.com/parallelarc)
