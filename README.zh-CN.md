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

本项目使用 GitHub Actions 自动部署到 GitHub Pages。

### Fork 并部署

1. **Fork 本仓库**
2. **在你的 Fork 设置中启用 GitHub Pages**：
   - 进入 Settings → Pages
   - Source 选择：GitHub Actions
3. **推送到 main 分支** — 自动部署开始！

部署会自动检测你的 Fork 并使用你的仓库获取博客文章，无需额外配置！

### 博客配置

博客文章从你的 Fork 仓库中带有 `blog` 标签的 GitHub Issues 获取。添加文章：

1. 在你的 Fork 仓库中创建新 issue
2. 添加 `blog` 标签
3. 网站会自动显示

**可选**：在仓库 Settings → Variables → 中设置 `BLOG_LABEL` 来自定义博客标签（默认：`blog`）

**本地开发**：编辑 `.env` 文件匹配你的 GitHub 用户名：
```bash
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_BLOG_REPO=your-username.github.io
```

---

## &nbsp; 许可证

[MIT](LICENSE) © [parallelarc](https://github.com/parallelarc)
