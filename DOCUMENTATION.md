# Terminal Portfolio - 完整技术文档

## 目录

1. [项目概述](#项目概述)
2. [核心技术栈](#核心技术栈)
3. [架构设计](#架构设计)
4. [核心系统详解](#核心系统详解)
5. [命令系统](#命令系统)
6. [插件系统](#插件系统)
7. [状态管理](#状态管理)
8. [自定义钩子](#自定义钩子)
9. [UI组件系统](#ui组件系统)
10. [样式系统](#样式系统)
11. [工具函数库](#工具函数库)
12. [配置系统](#配置系统)
13. [类型系统](#类型系统)
14. [开发工作流](#开发工作流)
15. [部署与构建](#部署与构建)

---

## 项目概述

这是一个基于React的**终端风格个人网站**，通过命令行界面(CLI)的方式展示个人信息、项目作品集和博客内容。项目采用函数式组件架构，结合Zustand进行状态管理，使用styled-components实现主题化样式系统。

### 核心特性

- **命令行界面模拟**：真实还原终端交互体验
- **命令自动补全**：输入`/`触发命令列表
- **键盘快捷键支持**：完整的键盘导航
- **交互式TUI模式**：博客界面采用终端用户界面(TUI)
- **多主题支持**：6种预设主题可切换
- **GitHub集成**：博客数据从GitHub Issues获取
- **插件系统**：可扩展的插件架构
- **剪贴板自动复制**：选中文本自动复制
- **响应式设计**：移动端友好

---

## 核心技术栈

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

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Husky** - Git钩子
- **Vitest** - 单元测试
- **vite-plugin-pwa** - PWA支持

---

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ThemeProvider (styled-components)           │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │              GlobalStyle                        │  │  │
│  │  │         (CSS normalize + global styles)         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │              Terminal                          │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │          Form (Input Area)                │  │  │  │
│  │  │  │  ┌────────────────────────────────────┐  │  │  │  │
│  │  │  │  │    HiddenTextarea (actual input)    │  │  │  │  │
│  │  │  │  │    InputDisplay (visual cursor)     │  │  │  │  │
│  │  │  │  │    Autocomplete List                │  │  │  │  │
│  │  │  │  └────────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │                                                │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │       CommandHistory (render history)    │  │  │  │
│  │  │  │  ┌────────────────────────────────────┐  │  │  │  │
│  │  │  │  │    CommandHistoryItem               │  │  │  │  │
│  │  │  │  │  ┌──────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │   Output (lazy-loaded)        │  │  │  │  │  │
│  │  │  │  │  │  └─ Command Component         │  │  │  │  │  │
│  │  │  │  │  └──────────────────────────────┘  │  │  │  │  │
│  │  │  │  └────────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Core Systems                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │CommandRegistry│  │ PluginManager│  │  EventBus    │      │
│  │  (Singleton) │  │  (Singleton) │  │  (Singleton) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Zustand Stores                        │    │
│  │  ┌─────────────────┐    ┌─────────────────┐        │    │
│  │  │ terminalStore   │    │  themeStore     │        │    │
│  │  │ - input         │    │  - theme        │        │    │
│  │  │ - history       │    │  - themeLoaded  │        │    │
│  │  │ - cursor        │    │  - setMode      │        │    │
│  │  │ - autocomplete  │    │  - initTheme    │        │    │
│  │  └─────────────────┘    └─────────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                              │
│  useTheme | useAutocomplete | useClipboardHandler           │
│  useCommandSubmission | useGlobalFocus | useKeyboardShortcuts│
│  useGitHubIssues | useKeyboardNavigation | useTextInput     │
└─────────────────────────────────────────────────────────────┘
```

### 文件结构

```
src/
├── App.tsx                      # 应用入口，主题提供者
├── main.tsx                     # React渲染入口
│
├── components/                  # UI组件
│   ├── Terminal.tsx             # 主终端组件
│   ├── Output.tsx               # 命令输出渲染器
│   ├── CommandHistoryItem.tsx   # 历史记录项
│   ├── TermInfo.tsx             # 提示符组件
│   └── styles/                  # 样式组件
│       ├── GlobalStyle.tsx      # 全局样式
│       ├── themes.ts            # 主题定义
│       ├── Terminal.styled.tsx  # 终端样式
│       ├── TerminalInfo.styled.tsx
│       ├── Output.styled.tsx    # 输出样式
│       ├── Commands.styled.tsx  # 命令样式
│       └── Blog.styled.tsx      # 博客样式
│
├── commands/                    # 命令实现
│   ├── index.ts                 # 命令注册中心
│   ├── welcome/
│   │   ├── config.ts            # 命令配置
│   │   └── index.tsx            # 命令组件
│   ├── about/
│   ├── contact/
│   ├── education/
│   ├── projects/
│   ├── blog/                    # 最复杂的命令
│   │   ├── config.ts
│   │   └── index.tsx            # TUI模式实现
│   └── clear/
│
├── core/                        # 核心系统
│   ├── CommandRegistry.ts       # 命令注册表(单例)
│   ├── PluginManager.ts         # 插件管理器(单例)
│   └── EventBus.ts              # 事件总线(单例)
│
├── hooks/                       # 自定义钩子
│   ├── useTheme.ts
│   ├── useAutocomplete.ts
│   ├── useClipboardHandler.ts
│   ├── useCommandSubmission.ts
│   ├── useGlobalFocus.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useGitHubIssues.ts
│   ├── useKeyboardNavigation.ts  # TUI导航
│   └── useTextInput.ts
│
├── stores/                      # Zustand状态存储
│   ├── terminalStore.ts         # 终端状态
│   └── themeStore.ts            # 主题状态
│
├── types/                       # TypeScript类型定义
│   ├── command.ts
│   ├── plugin.ts
│   └── github.ts
│
├── config/                      # 配置文件
│   ├── index.ts
│   ├── terminal.ts              # 终端配置
│   └── plugins.ts               # 插件配置
│
└── utils/                       # 工具函数
    ├── storage.ts               # LocalStorage封装
    ├── funcs.ts                 # 通用函数
    ├── validateArgs.ts          # 参数验证
    └── github.ts                # GitHub API工具
```

---

## 核心系统详解

### 1. 命令注册表 (CommandRegistry)

**文件位置**: `src/core/CommandRegistry.ts`

命令注册表是整个应用的核心，采用**单例模式**，负责：

- 命令注册与注销
- 命令查找（支持别名）
- 命令自动补全匹配
- 命令分类查询
- 隐藏命令过滤

#### 内部数据结构

```typescript
class CommandRegistry {
  private commands: Map<string, Command>      // 命令名 -> 命令对象
  private aliases: Map<string, string>        // 别名 -> 命令名
}
```

#### 关键方法

| 方法 | 功能 | 返回值 |
|------|------|--------|
| `register(command)` | 注册新命令，同时注册别名 | `void` |
| `unregister(name)` | 注销命令及其所有别名 | `boolean` |
| `get(name)` | 通过命令名或别名获取命令 | `Command \| undefined` |
| `getAll()` | 获取所有已注册命令 | `Command[]` |
| `getByCategory(category)` | 按分类获取命令 | `Command[]` |
| `getVisible()` | 获取非隐藏命令 | `Command[]` |
| `findMatches(partial)` | 查找匹配部分输入的命令名 | `string[]` |
| `has(name)` | 检查命令是否存在 | `boolean` |
| `clear()` | 清空所有命令 | `void` |
| `size` | 获取命令数量 | `number` |
| `getLegacyCommands()` | 获取兼容旧格式的命令列表 | `LegacyCommand[]` |

#### 注册行为

1. **验证**: 检查命令是否有`id`和`name`
2. **重载检测**: 如果命令名已存在，发出警告并覆盖
3. **主命令注册**: 将命令存入`commands` Map
4. **别名注册**: 将别名映射到主命令名，处理别名冲突

### 2. 插件管理器 (PluginManager)

**文件位置**: `src/core/PluginManager.ts`

插件管理器实现了一个完整的插件生命周期管理系统，支持：

- 插件加载与初始化
- 插件卸载与清理
- 插件重载
- 插件间消息传递
- 事件系统集成

#### 内部数据结构

```typescript
class PluginManager {
  private plugins: Map<string, Plugin>           // 插件名 -> 插件对象
  private contexts: Map<string, PluginContext>   // 插件名 -> 上下文
  private messageHandlers: Map<string, MessageHandler>  // 消息处理器
}
```

#### 插件上下文 (PluginContext)

插件在初始化时接收一个增强的上下文对象，包含：

| 方法/属性 | 功能 |
|-----------|------|
| `registerCommand(command)` | 注册新命令 |
| `unregisterCommand(name)` | 注销命令 |
| `getTerminalState()` | 获取只读终端状态 |
| `getConfig()` | 获取终端配置 |
| `on(event, handler)` | 订阅事件（自动命名空间） |
| `off(event, handler)` | 取消订阅事件 |
| `emit(event, ...args)` | 触发事件（同时触发全局事件） |
| `sendMessage(target, message)` | 向其他插件发送消息 |
| `onMessage(handler)` | 注册消息接收处理器 |

#### 事件命名空间

插件自动使用命名空间避免冲突：

```typescript
// 插件 "my-plugin" 订阅事件 "data"
eventBus.on("my-plugin:data", handler);

// 同时触发两个事件
eventBus.emit("my-plugin:data", ...args);  // 插件专属
eventBus.emit("data", ...args);             // 全局（跨插件通信）
```

#### 加载流程

1. 验证插件（必须有`name`和`version`）
2. 检查是否已加载
3. 创建插件上下文
4. 注册插件的命令
5. 调用插件的`init`函数
6. 存储插件和上下文
7. 触发`plugin:loaded`事件

#### 卸载流程

1. 触发`plugin:{name}:unload`事件
2. 调用插件的`destroy`函数
3. 注销插件的所有命令
4. 清理插件的事件监听器
5. 移除消息处理器
6. 从存储中删除
7. 触发`plugin:unloaded`事件

### 3. 事件总线 (EventBus)

**文件位置**: `src/core/EventBus.ts`

简单的发布-订阅模式实现，用于组件和插件间通信。

#### 特性

- **订阅返回取消函数**: `on()`返回一个取消订阅的函数
- **错误隔离**: 事件处理器中的错误不会影响其他处理器
- **自动清理**: 当事件没有监听器时自动删除
- **批量处理**: 触发时复制监听器列表，避免迭代时修改

#### API

| 方法 | 功能 |
|------|------|
| `on(event, handler)` | 订阅事件，返回取消函数 |
| `off(event, handler)` | 取消订阅 |
| `emit(event, ...args)` | 触发事件 |
| `clear()` | 清空所有事件 |
| `listenerCount(event)` | 获取事件监听器数量 |
| `getEventNames()` | 获取所有有监听器的事件名 |

---

## 命令系统

### 命令接口定义

```typescript
interface Command {
  id: string                // 唯一标识符
  name: string              // 主命令名
  description: string       // 帮助文本
  aliases?: string[]        // 别名列表
  category?: string         // 分类（用于分组）
  hidden?: boolean          // 是否从帮助中隐藏
  args?: ArgDefinition[]    // 参数定义
  acceptsArgs?: boolean     // 是否接受任意参数
  interactive?: boolean     // 是否为TUI模式（隐藏输入）
  component: LazyComponent  // 懒加载组件
  execute?: (args, context) => CommandResult  // 可选执行函数
}
```

### 内置命令列表

#### 信息类命令 (category: "info")

| 命令 | 描述 | 别名 | 特性 |
|------|------|------|------|
| `welcome` | 显示英雄区域 | - | ASCII艺术字 |
| `about` | 关于我 | - | 个人介绍 |
| `contact` | 联系方式 | - | 带图标和灯箱 |
| `education` | 教育背景 | - | 学历信息 |
| `projects` | 项目展示 | - | 接受参数，带相册 |

#### 内容类命令 (category: "content")

| 命令 | 描述 | 特性 |
|------|------|------|
| `blog` / `blogs` | 博客界面 | TUI模式，接受参数，GitHub集成 |

#### 系统类命令 (category: "system")

| 命令 | 描述 | 特性 |
|------|------|------|
| `clear` | 清空终端 | - |

### 命令注册流程

**文件位置**: `src/commands/index.ts`

```typescript
// 1. 导入所有命令配置
import { config as aboutConfig } from './about/config';
import { config as blogConfig } from './blog/config';
// ... 其他命令

// 2. 注册函数
export function registerCommands() {
  commandRegistry.register(aboutConfig);
  commandRegistry.register(blogConfig);
  // ... 其他命令
  return commandRegistry;
}

// 3. 自动注册（模块加载时执行）
registerCommands();
```

### 命令组件结构

每个命令目录包含：
- `config.ts` - 命令元数据和配置
- `index.tsx` - 命令的React组件（懒加载）

### 复杂命令示例：Blog

**文件位置**: `src/commands/blog/index.tsx`

这是最复杂的命令，实现了完整的TUI（终端用户界面）模式：

#### 特性

1. **GitHub Issues集成**
   - 从指定仓库获取博客文章
   - 支持标签过滤
   - 支持搜索功能

2. **TUI模式**
   - 进入时隐藏正常输入框
   - 完整的键盘导航
   - 统一列表导航（搜索、标签、文章）

3. **键盘操作**
   - `↑↓` - 在列表间循环导航
   - `←→` - 切换标签/翻页
   - `Enter/Space` - 打开文章
   - `Esc` - 退出TUI模式
   - 输入字符 - 实时搜索

4. **状态管理**
   - 分类统计
   - 分页（每页10篇）
   - 搜索查询
   - 焦点状态

---

## 插件系统

### 插件接口

```typescript
interface Plugin {
  name: string              // 唯一标识符
  version: string           // 语义化版本号
  description?: string      // 插件描述
  author?: string           // 作者信息
  commands?: Command[]      // 插件提供的命令
  init?: (context) => void  // 初始化函数
  destroy?: () => void      // 清理函数
}
```

### 插件开发示例

```typescript
import type { Plugin } from '../types/plugin';

const myPlugin: Plugin = {
  name: 'hello-world',
  version: '1.0.0',
  description: 'A simple greeting plugin',
  author: 'Your Name',

  // 提供的命令
  commands: [
    {
      id: 'hello',
      name: 'hello',
      description: 'Say hello',
      category: 'info',
      component: () => import('./HelloCommand'),
    }
  ],

  // 初始化
  init: (context) => {
    // 订阅事件
    context.on('greet', (name) => {
      console.log(`Hello, ${name}!`);
    });

    // 监听来自其他插件的消息
    context.onMessage((from, message) => {
      console.log(`Received from ${from}:`, message);
    });
  },

  // 清理
  destroy: () => {
    console.log('Goodbye from hello-world plugin');
  }
};

// 加载插件
import { pluginManager } from '../core/PluginManager';
pluginManager.load(myPlugin);
```

### 插件通信机制

1. **事件系统**: 通过事件总线进行广播
2. **直接消息**: 使用`sendMessage`和`onMessage`进行点对点通信

---

## 状态管理

### 终端状态 (terminalStore)

**文件位置**: `src/stores/terminalStore.ts`

使用Zustand with `subscribeWithSelector`中间件，支持精确订阅。

#### 状态结构

```typescript
interface TerminalState {
  // --- 输入状态 ---
  input: string                    // 当前输入文本
  cursorPosition: number           // 光标位置
  setInput: (value) => void
  setCursorPosition: (pos) => void

  // --- 历史状态 ---
  history: CommandHistoryEntry[]   // 命令历史
  historyIndex: number             // 历史导航索引
  addToHistory: (command) => void
  clearHistory: () => void
  navigateHistory: (direction) => void
  removeFromHistory: (index) => void
  setDismissMessage: (index, message) => void

  // --- 自动补全状态 ---
  selectedCommandIndex: number     // 选中的命令索引
  setSelectedCommandIndex: (index) => void

  // --- 焦点状态 ---
  isInputFocused: boolean          // 输入框是否聚焦
  setInputFocused: (focused) => void

  // --- Toast状态 ---
  showCopyToast: boolean           // 是否显示复制提示
  setShowCopyToast: (show) => void

  // --- 过滤命令 ---
  filteredCommands: LegacyCommand[]// 过滤后的命令列表
  setFilteredCommands: (commands) => void
  updateFilteredCommands: (input) => void

  // --- 杂项 ---
  rerender: boolean                // 触发重渲染标记
  setRerender: (value) => void

  // --- 交互模式 ---
  interactiveMode: InteractiveMode // TUI模式状态
  setInteractiveMode: (active, command?) => void

  // --- 操作 ---
  resetInputState: () => void
  syncCursorPosition: (position) => void
}
```

#### 关键行为

1. **历史管理**
   - 唯一ID生成（使用时间戳+随机字符串）
   - 最大历史条目限制（`maxHistorySize`）
   - 历史导航（上下箭头）

2. **光标同步**
   - 自动验证位置有效性
   - 同步到隐藏的textarea

3. **交互模式**
   - 激活时隐藏输入框
   - 记录来源命令

### 主题状态 (themeStore)

**文件位置**: `src/stores/themeStore.ts`

```typescript
interface ThemeState {
  theme: DefaultTheme             // 当前主题对象
  themeLoaded: boolean            // 主题是否已加载
  setMode: (mode) => void         // 设置主题
  setThemeByName: (name) => void  // 按名称设置
  initTheme: () => void           // 初始化主题
}
```

#### 主题持久化

- 存储键：`tsn-theme`
- 优先级：localStorage > 默认主题

---

## 自定义钩子

### 1. useTheme

**文件位置**: `src/hooks/useTheme.ts`

主题管理钩子，处理主题初始化和切换。

```typescript
function useTheme(): {
  theme: DefaultTheme
  themeLoaded: boolean
  setMode: (theme) => void
}
```

### 2. useAutocomplete

**文件位置**: `src/hooks/useAutocomplete.ts`

命令自动补全钩子。

```typescript
function useAutocomplete({
  inputVal,
  allCommands
}: UseAutocompleteProps): {
  filteredCommands: Command[]
  selectedCommandIndex: number
  setSelectedCommandIndex: (index) => void
  handleTabCompletion: () => string | null
  isAutocompleteMode: boolean
}
```

**行为**:
- 检测是否以`/`开头
- 过滤匹配的命令
- 处理Tab补全

### 3. useClipboardHandler

**文件位置**: `src/hooks/useClipboardHandler.ts`

自动复制选中文本到剪贴板。

```typescript
function useClipboardHandler({
  containerRef,
  setShowCopyToast
}): void
```

**特性**:
- 监听`mouseup`事件
- 检查选择是否在容器内
- 使用`navigator.clipboard.writeText`
- 显示2.2秒的Toast提示

### 4. useCommandSubmission

**文件位置**: `src/hooks/useCommandSubmission.ts`

命令提交处理。

```typescript
function useCommandSubmission({
  inputVal,
  onAddToHistory,
  onResetInputState,
  onSetRerender
}): {
  handleSubmit: (e) => void
}
```

**行为**:
- 验证输入非空
- 添加到历史
- 重置输入状态
- 触发重渲染

### 5. useGlobalFocus

**文件位置**: `src/hooks/useGlobalFocus.ts`

全局焦点管理。

```typescript
function useGlobalFocus({
  containerRef,
  inputRef
}): void
```

**行为**:
- 任何按键（除ESC）自动聚焦输入框
- 滚动到底部
- 使用双`requestAnimationFrame`确保DOM就绪
- 排除其他输入元素

### 6. useKeyboardShortcuts

**文件位置**: `src/hooks/useKeyboardShortcuts.ts`

键盘快捷键处理。

**快捷键列表**:

| 按键 | 功能 |
|------|------|
| `Ctrl+C` | 清空输入 |
| `Esc` | 退出命令选择模式 |
| `Shift+Enter` | 插入换行 |
| `Enter` | 提交表单 |
| `Tab/Ctrl+I` | 补全命令 |
| `↑` | 上一个命令 |
| `↓` | 下一个命令 |
| `←/→` | 移动光标 |
| `Home` | 跳到开头 |
| `End` | 跳到结尾 |

### 7. useGitHubIssues

**文件位置**: `src/hooks/useGitHubIssues.ts`

GitHub Issues博客数据管理。

```typescript
function useGitHubIssues(
  config: GitHubConfig,
  initialCategory = "All"
): {
  // 数据状态
  posts: BlogPost[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null

  // 列表状态
  listState: PostListState
  categoryStats: CategoryStats[]

  // 操作
  refresh: () => Promise<void>
  setActiveCategory: (category) => void
  setSearchQuery: (query) => void
  setSelectedIndex: (index) => void
  setCurrentPage: (page) => void
  nextPage: () => void
  prevPage: () => void
}
```

**特性**:
- 每页10篇文章（`POSTS_PER_PAGE`）
- 搜索过滤（标题、内容、标签）
- 分类统计
- 分页导航

### 8. useKeyboardNavigation

**文件位置**: `src/hooks/useKeyboardNavigation.ts`

TUI模式的键盘导航。

```typescript
function useKeyboardNavigation({
  focusState,
  setFocusState,
  categoryCount,
  currentPagePosts,
  totalPages,
  currentPage,
  activeCategoryIndex,
  // 回调...
}): {
  handleKeyDown: (e: KeyboardEvent) => void
}
```

**导航逻辑**:

1. **搜索模式**:
   - 字符输入：添加到搜索
   - Backspace：删除字符
   - `←→`：移动光标
   - `Home/End`：跳到首尾
   - `Delete`：删除光标处字符
   - `↑`：跳到最后文章
   - `↓`：跳到标签或文章

2. **标签模式**:
   - `↑`：跳到搜索
   - `↓`：跳到文章
   - `←→`：切换标签（循环）

3. **文章模式**:
   - `↑↓`：上下选择文章（到顶/底回到标签）
   - `←→`：翻页（循环）
   - `Enter/Space`：打开文章

### 9. useTextInput

**文件位置**: `src/hooks/useTextInput.ts`

通用文本输入状态管理。

```typescript
function useTextInput(options?: {
  initialValue?: string
  onChange?: (value) => void
}): {
  value: string
  cursorPosition: number
  setValue: (value) => void
  setCursorPosition: (pos) => void
  insertChar: (char) => void
  backspace: () => void
  deleteChar: () => void
  moveLeft: () => void
  moveRight: () => void
  moveToStart: () => void
  moveToEnd: () => void
  clear: () => void
}
```

---

## UI组件系统

### Terminal 组件

**文件位置**: `src/components/Terminal.tsx`

核心组件，整合所有功能。

#### 层级结构

```
Terminal
├── CopyToast (条件渲染)
├── Form (交互模式激活时隐藏)
│   └── ClaudeInputContainer
│       ├── ClaudeTopLine
│       ├── ClaudeInputArea
│       │   ├── TermInfo (提示符)
│       │   ├── InputDisplay
│       │   │   └── DisplayText (带光标)
│       │   └── HiddenTextarea (实际输入)
│       ├── ClaudeBottomLine
│       └── 动态内容区域
│           ├── CommandsList (/模式)
│           ├── ShortcutsGrid (?模式)
│           └── InputHint (默认)
└── CommandHistory (命令历史)
    └── CommandHistoryItem[]
        └── Output (懒加载命令组件)
```

#### 状态选择器

使用Zustand的selector模式进行精确订阅，避免不必要的重渲染：

```typescript
const inputVal = useTerminalStore((s) => s.input);
const cursorPosition = useTerminalStore((s) => s.cursorPosition);
// ... 其他状态
```

### Output 组件

**文件位置**: `src/components/Output.tsx`

命令输出渲染器，特性：

1. **懒加载**: 使用`React.lazy`动态导入组件
2. **参数验证**: 检查命令是否接受参数
3. **交互模式处理**: 为交互命令使用特殊key强制重新挂载
4. **性能优化**: 使用`React.memo`防止不必要的重渲染

### CommandHistoryItem 组件

**文件位置**: `src/components/CommandHistoryItem.tsx`

历史记录项，负责：

1. 解析命令字符串
2. 查找有效命令
3. 提供上下文（termContext）
4. 渲染命令输出

#### 上下文值

```typescript
interface Term {
  arg: string[]              // 命令参数
  history: string[]          // 完整历史
  rerender: boolean          // 重渲染标记
  index: number              // 当前索引
  isLatest: boolean          // 是否为最新
  clearHistory?: () => void
  removeFromHistory?: (index) => void
  setDismissMessage?: (index, message) => void
  entryId?: string
}
```

### TermInfo 组件

**文件位置**: `src/components/TermInfo.tsx`

简单的提示符组件，显示`❯`符号。

---

## 样式系统

### 主题定义

**文件位置**: `src/components/styles/themes.ts`

定义了6种主题：

| 主题ID | 名称 | 主色调 | 辅助色 | 背景 |
|--------|------|--------|--------|------|
| T_001 | dark | #05CE91 | #FF9D00 | #1D2A35 |
| T_002 | light | #027474 | #FF9D00 | #EFF3F3 |
| T_003 | blue-matrix | #00ff9c | #60fdff | #101116 |
| T_004 | espresso | #E1E48B | #A5C260 | #323232 |
| T_005 | green-goblin | #E5E500 | #04A500 | #000000 |
| T_006 | ubuntu | #80D932 | #80D932 | #2D0922 |

#### 主题结构

```typescript
interface Theme {
  id: string
  name: string
  colors: {
    body: string              // 页面背景
    bg: string                // 滚动条背景
    scrollHandle: string      // 滚动条滑块
    scrollHandleHover: string // 滚动条悬停
    primary: string           // 主色
    secondary: string         // 辅助色
    accent: string            // 强调色
    text: {
      100: string             // 主要文本
      200: string             // 次要文本
      300: string             // 暗淡文本
      400: string             // 透明文本
    }
  }
}
```

### 全局样式

**文件位置**: `src/components/styles/GlobalStyle.tsx`

使用`styled-normalize`进行CSS重置，包含：

- 字体：IBM Plex Mono
- 隐藏滚动条（所有浏览器）
- 输入框样式
- 屏幕阅读器辅助类

### 组件样式文件

| 文件 | 内容 |
|------|------|
| `Terminal.styled.tsx` | 终端主容器、输入框、光标、提示、列表 |
| `TerminalInfo.styled.tsx` | Claude Code风格的输入容器 |
| `Output.styled.tsx` | 输出容器、基础样式 |
| `Commands.styled.tsx` | 各命令的专用样式 |
| `Blog.styled.tsx` | 博客TUI样式 |

#### 关键样式组件

**光标字符 (CursorChar)**:
- 反色显示（背景色=文本色，文本色=背景色）
- 最小宽度0.6em

**命令块 (CommandBlock)**:
- 半透明背景
- 内联布局
- 圆角边框

**彩虹文字 (RainbowText)**:
- 线性渐变背景
- `background-clip: text`
- 12秒循环动画

---

## 工具函数库

### storage.ts

**文件位置**: `src/utils/storage.ts`

LocalStorage封装：

```typescript
function setToLS(key: string, value: string): void
function getFromLS(key: string): string | undefined
```

### funcs.ts

**文件位置**: `src/utils/funcs.ts`

通用函数：

| 函数 | 功能 |
|------|------|
| `isArgInvalid(arg, action, options)` | 检查命令参数是否有效 |
| `getCurrentCmdArry(history)` | 解析最新命令为数组 |
| `checkThemeSwitch(...)` | 检查是否应切换主题 |
| `getThemeNames()` | 获取所有主题名称 |

### validateArgs.ts

**文件位置**: `src/utils/validateArgs.ts`

命令参数验证系统：

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  parsedArgs: Record<string, string | number | boolean>
}

function validateArgs(
  command: Command,
  inputArgs: string[]
): ValidationResult

function getUsageString(command: Command): string

function getArgHelp(command: Command): ArgHelp[]
```

### github.ts

**文件位置**: `src/utils/github.ts`

GitHub API集成：

| 函数 | 功能 |
|------|------|
| `createGitHubHeaders(token)` | 创建API请求头 |
| `fetchIssues(config)` | 获取仓库Issues |
| `transformIssueToBlogPost(issue)` | 转换Issue为博客文章 |
| `fetchBlogPosts(config)` | 获取所有博客文章 |
| `calculateCategoryStats(posts)` | 计算分类统计 |
| `formatDate(dateString)` | 格式化日期 |
| `formatRelativeTime(dateString)` | 相对时间（"3天前"） |

---

## 配置系统

### 终端配置 (terminal.ts)

**文件位置**: `src/config/terminal.ts`

```typescript
const terminalConfig = {
  maxHistorySize: 100            // 最大历史条目
  enableAutocomplete: true       // 启用自动补全
  autocompleteTrigger: '/'       // 自动补全触发字符
  helpTrigger: '?'              // 帮助触发字符
  enableKeyboardShortcuts: true  // 启用快捷键
  defaultHistory: ['welcome']   // 默认历史命令
  inputDebounceMs: 0            // 输入防抖延迟
} as const
```

### 插件配置 (plugins.ts)

**文件位置**: `src/config/plugins.ts`

```typescript
const autoLoadPlugins: Plugin[] = []  // 自动加载的插件列表

const pluginConfig = {
  enabled: true                      // 启用插件系统
  allowExternalPlugins: false         // 允许外部插件
  maxPlugins: 50                      // 最大插件数
  loadTimeout: 5000                   // 加载超时(ms)
} as const
```

---

## 类型系统

### command.ts

```typescript
interface ArgDefinition {
  name: string
  description: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean'
  defaultValue?: string | number | boolean
}

type LazyComponent = () => Promise<{ default: ComponentType }>

interface Command {
  id: string
  name: string
  description: string
  aliases?: string[]
  category?: string
  hidden?: boolean
  args?: ArgDefinition[]
  acceptsArgs?: boolean
  interactive?: boolean
  component: LazyComponent
  execute?: (args, context) => CommandResult
}

interface CommandContext {
  history: string[]
  addToHistory: (command) => void
  clearHistory: () => void
}

interface CommandResult {
  success: boolean
  output?: string | JSX.Element
  error?: string
}

interface LegacyCommand {
  cmd: string
  desc: string
  tab: number
}
```

### plugin.ts

```typescript
interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  commands?: Command[]
  init?: (context: PluginContext) => void
  destroy?: () => void
}

interface TerminalState {
  history: CommandHistoryEntry[]
  input?: string
  cursorPosition?: number
}

type EventHandler = (...args: unknown[]) => void

interface PluginContext {
  registerCommand: (command) => void
  unregisterCommand: (name) => void
  getTerminalState: () => TerminalState
  getConfig: () => TerminalConfig
  on: (event, handler) => void
  off: (event, handler) => void
  emit: (event, ...args) => void
  sendMessage: (target, message) => void
  onMessage: (handler) => void
}

interface PluginLoadResult {
  success: boolean
  plugin?: Plugin
  error?: string
}

interface PluginInfo {
  name: string
  version: string
  description?: string
  author?: string
  loaded: boolean
}
```

### github.ts

```typescript
interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
}

interface GitHubLabel {
  id: number
  name: string
  color: string
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string
  state: "open" | "closed"
  created_at: string
  updated_at: string
  html_url: string
  user: GitHubUser
  labels: GitHubLabel[]
  comments: number
  pull_request?: { url: string }
}

interface BlogPost {
  id: number
  number: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: string
  authorAvatar: string
  authorUrl: string
  labels: string[]
  url: string
  commentsCount: number
  excerpt: string
  isSelected?: boolean
}

interface CategoryStats {
  name: string
  count: number
  isActive: boolean
}

interface GitHubConfig {
  owner: string
  repo: string
  token?: string
  labels?: string[]
}

interface ApiStatus {
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface PostListState {
  posts: BlogPost[]
  filteredPosts: BlogPost[]
  selectedIndex: number
  currentPage: number
  totalPages: number
  searchQuery: string
  activeCategory: string
}

type BlogView = "list" | "detail"

interface MenuItem {
  id: string
  label: string
  shortcut?: string
  isActive: boolean
}
```

---

## 开发工作流

### 可用脚本

| 命令 | 功能 |
|------|------|
| `npm run dev` | 启动开发服务器 (http://localhost:5173) |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm test` | 运行测试（监视模式） |
| `npm run test:once` | 运行测试一次 |
| `npm run coverage` | 运行测试并生成覆盖率报告 |
| `npm run lint` | ESLint检查 |
| `npm run format:check` | Prettier检查 |
| `npm run format` | Prettier格式化 |

### 添加新命令

1. 创建命令目录：`src/commands/mycommand/`
2. 创建配置文件 `config.ts`:

```typescript
import { Command } from '../../types/command';

export const config: Command = {
  id: 'mycommand',
  name: 'mycommand',
  description: 'My command description',
  category: 'info',
  component: () => import('./index'),
};
```

3. 创建组件文件 `index.tsx`:

```typescript
function MyCommand() {
  return (
    <div>
      Command output here
    </div>
  );
}

export default MyCommand;
```

4. 在 `src/commands/index.ts` 中注册：

```typescript
import { config as myCommandConfig } from './mycommand/config';

export function registerCommands() {
  // ... 其他命令
  commandRegistry.register(myCommandConfig);
}
```

### 添加新主题

编辑 `src/components/styles/themes.ts`:

```typescript
const theme: Themes = {
  // ... 现有主题
  "my-theme": {
    id: "T_007",
    name: "my-theme",
    colors: {
      body: "#...",
      bg: "#...",
      // ... 其他颜色
    },
  },
};
```

### 环境变量

创建 `.env.local` 文件：

```bash
# GitHub博客配置
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_BLOG_REPO=your-blog-repo
VITE_GITHUB_BLOG_LABEL=blog
VITE_GITHUB_TOKEN=your-personal-access-token
```

---

## 部署与构建

### Vite配置

**文件位置**: `vite.config.ts`

```typescript
export default defineConfig({
  envPrefix: ["OPENAI_", "VITE_"],
  plugins: [react(), VitePWA({ registerType: "autoUpdate" })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### PWA支持

使用`vite-plugin-pwa`实现：
- 自动更新模式
- Service Worker注册
- 离线支持

### 构建输出

构建过程：
1. TypeScript编译 (`tsc`)
2. Vite打包
3. 输出到 `dist/` 目录

---

## 附录

### 键盘快捷键速查

| 按键 | 全局 | /模式 | TUI模式 |
|------|------|-------|---------|
| `Esc` | 退出聚焦 | 退出选择 | 退出TUI |
| `/` | - | 触发 | - |
| `?` | 显示帮助 | - | - |
| `Ctrl+C` | 清空输入 | 清空输入 | - |
| `Tab` | 补全 | 补全 | - |
| `Enter` | 提交 | 提交 | 选择 |
| `↑` | 历史上 | 上选 | 上移 |
| `↓` | 历史下 | 下选 | 下移 |
| `←` | 左移 | 禁用 | 左页/标签 |
| `→` | 右移 | 禁用 | 右页/标签 |
| `Shift+Enter` | 换行 | 换行 | - |

### 命令分类

```
info/        - 个人信息类命令
content/     - 内容类命令
system/      - 系统类命令
```

### 浏览器兼容性

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 完全支持
- 移动浏览器: 支持（响应式设计）

### 性能优化要点

1. **懒加载**: 所有命令组件使用动态导入
2. **记忆化**: 使用`useMemo`和`React.memo`
3. **精确订阅**: Zustand selector模式
4. **事件委托**: 全局事件监听器
5. **防抖**: 可配置的输入防抖
6. **虚拟化**: 大列表考虑分页

---

*本文档由Claude Code自动生成，涵盖项目所有核心功能和实现细节。*
