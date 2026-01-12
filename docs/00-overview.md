# Terminal Portfolio - 项目概述

## 项目简介

这是一个基于React的**终端风格个人网站**，通过命令行界面(CLI)的方式展示个人信息、项目作品集和博客内容。项目采用函数式组件架构，结合Zustand进行状态管理，使用styled-components实现主题化样式系统。

## 核心特性

- **命令行界面模拟** - 真实还原终端交互体验，支持命令输入和历史记录
- **命令自动补全** - 输入`/`触发命令列表，Tab键补全
- **键盘快捷键支持** - 完整的键盘导航，模拟真实终端操作
- **交互式TUI模式** - 博客界面采用终端用户界面(TUI)，纯键盘操作
- **多主题支持** - 6种预设主题可切换，主题持久化到本地存储
- **GitHub集成** - 博客数据从GitHub Issues获取，支持标签分类
- **插件系统** - 可扩展的插件架构，支持动态加载命令
- **剪贴板自动复制** - 选中文本自动复制，带Toast提示
- **响应式设计** - 移动端友好，适配各种屏幕尺寸

## 技术栈

### 前端框架
- **React 18.2** - 采用函数式组件和Hooks
- **TypeScript 5.0** - 严格类型检查
- **Vite 7.3** - 构建工具和开发服务器

### 状态管理
- **Zustand 5.0** - 轻量级状态管理，带selector中间件

### 样式方案
- **styled-components 5.3** - CSS-in-JS解决方案
- **styled-normalize** - CSS重置

### UI增强
- **react-icons 5.3** - 图标库
- **react-markdown 10.1** - Markdown渲染

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 可用命令

| 命令 | 描述 |
|------|------|
| `welcome` | 显示欢迎页面 |
| `about` | 关于我 |
| `contact` | 联系方式 |
| `education` | 教育背景 |
| `projects` | 项目展示 |
| `blog` / `blogs` | 博客界面（TUI模式） |
| `clear` | 清空终端 |

## 键盘快捷键

### 全局快捷键

| 按键 | 功能 |
|------|------|
| `/` | 触发命令补全 |
| `?` | 显示帮助 |
| `Ctrl+C` | 清空输入 |
| `Tab` | 补全命令 |
| `Shift+Enter` | 插入换行 |

### 历史导航

| 按键 | 功能 |
|------|------|
| `↑` | 上一条命令 |
| `↓` | 下一条命令 |

### 光标移动

| 按键 | 功能 |
|------|------|
| `←` | 左移一个字符 |
| `→` | 右移一个字符 |
| `Home` | 跳到行首 |
| `End` | 跳到行尾 |

### TUI模式（Blog命令）

| 按键 | 功能 |
|------|------|
| `↑↓` | 在列表间导航 |
| `←→` | 切换标签/翻页 |
| `Enter/Space` | 打开文章 |
| `Esc` | 退出TUI模式 |

## 目录结构

```
src/
├── App.tsx              # 应用入口
├── main.tsx             # React渲染入口
├── components/          # UI组件
├── commands/            # 命令实现
├── core/                # 核心系统
├── hooks/               # 自定义钩子
├── stores/              # Zustand状态存储
├── types/               # TypeScript类型定义
├── config/              # 配置文件
└── utils/               # 工具函数
```

## 环境变量

创建 `.env.local` 文件配置GitHub博客：

```bash
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_BLOG_REPO=your-blog-repo
VITE_GITHUB_BLOG_LABEL=blog
VITE_GITHUB_TOKEN=your-personal-access-token
```

## 许可证

MIT
