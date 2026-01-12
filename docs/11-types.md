# 类型系统

## 概述

项目使用TypeScript严格模式，类型定义位于 `src/types/` 目录。

---

## command.ts

**文件**: `src/types/command.ts`

### 命令参数定义

```typescript
interface ArgDefinition {
  name: string                      // 参数名
  description: string               // 参数描述
  required?: boolean                // 是否必填
  type?: 'string' | 'number' | 'boolean'  // 参数类型
  defaultValue?: string | number | boolean   // 默认值
}
```

### 懒加载组件

```typescript
type LazyComponent = () => Promise<{
  default: ComponentType
}>
```

### 命令接口

```typescript
interface Command {
  // 基础信息
  id: string                        // 唯一标识符
  name: string                      // 主命令名
  description: string               // 帮助文本

  // 可选属性
  aliases?: string[]                 // 别名列表
  category?: string                  // 分类（用于分组）
  hidden?: boolean                   // 是否从帮助中隐藏
  args?: ArgDefinition[]             // 参数定义
  acceptsArgs?: boolean              // 是否接受任意参数
  interactive?: boolean              // 是否为TUI模式

  // 组件和执行
  component: LazyComponent           // 懒加载组件
  execute?: (args, context) => CommandResult  // 可选执行函数
}
```

### 命令上下文

```typescript
interface CommandContext {
  history: string[]                  // 命令历史
  addToHistory: (command: string) => void
  clearHistory: () => void
}
```

### 命令执行结果

```typescript
interface CommandResult {
  success: boolean
  output?: string | JSX.Element
  error?: string
}
```

### 兼容旧格式

```typescript
interface LegacyCommand {
  cmd: string                        // 命令名
  desc: string                       // 描述
  tab: number                        // Tab宽度
}
```

### 类型转换函数

```typescript
function legacyToCommand(
  legacy: LegacyCommand,
  component: LazyComponent
): Command
```

---

## plugin.ts

**文件**: `src/types/plugin.ts`

### 插件接口

```typescript
interface Plugin {
  name: string                       // 唯一标识符
  version: string                    // 语义化版本号
  description?: string                // 插件描述
  author?: string                    // 作者信息
  commands?: Command[]               // 插件提供的命令
  init?: (context: PluginContext) => void   // 初始化函数
  destroy?: () => void               // 清理函数
}
```

### 插件上下文

```typescript
interface PluginContext {
  // 命令管理
  registerCommand(command: Command): void
  unregisterCommand(name: string): void

  // 状态访问（只读）
  getTerminalState(): TerminalState
  getConfig(): TerminalConfig

  // 事件系统（自动命名空间）
  on(event: string, handler: EventHandler): void
  off(event: string, handler: EventHandler): void
  emit(event: string, ...args: unknown[]): void

  // 插件间通信
  sendMessage(targetPlugin: string, message: unknown): void
  onMessage(handler: (from: string, message: unknown) => void): void
}
```

### 终端状态（插件可见）

```typescript
interface TerminalState {
  history: CommandHistoryEntry[]     // 命令历史
  input?: string                     // 当前输入（只读）
  cursorPosition?: number            // 光标位置（只读）
}
```

### 事件处理器

```typescript
type EventHandler = (...args: unknown[]) => void
```

### 插件加载结果

```typescript
interface PluginLoadResult {
  success: boolean
  plugin?: Plugin
  error?: string
}
```

### 插件信息

```typescript
interface PluginInfo {
  name: string
  version: string
  description?: string
  author?: string
  loaded: boolean
}
```

---

## github.ts

**文件**: `src/types/github.ts`

### GitHub用户

```typescript
interface GitHubUser {
  login: string                      // 用户名
  avatar_url: string                 // 头像URL
  html_url: string                   // 主页URL
}
```

### GitHub标签

```typescript
interface GitHubLabel {
  id: number                         // 标签ID
  name: string                       // 标签名
  color: string                      // 标签颜色
}
```

### GitHub Issue

```typescript
interface GitHubIssue {
  id: number                         // Issue ID
  number: number                     // Issue编号
  title: string                      // 标题
  body: string                       // 内容
  state: "open" | "closed"           // 状态
  created_at: string                 // 创建时间
  updated_at: string                 // 更新时间
  html_url: string                   // Issue URL
  user: GitHubUser                   // 创建者
  labels: GitHubLabel[]              // 标签列表
  comments: number                   // 评论数
  pull_request?: {                   // PR信息（如果有）
    url: string
  }
}
```

### 博客文章

```typescript
interface BlogPost {
  id: number                         // 文章ID
  number: number                     // Issue编号
  title: string                      // 标题
  content: string                    // 内容（Markdown）
  createdAt: string                  // 创建时间
  updatedAt: string                  // 更新时间
  author: string                     // 作者
  authorAvatar: string               // 作者头像
  authorUrl: string                  // 作者主页
  labels: string[]                   // 标签列表
  url: string                        // Issue URL
  commentsCount: number              // 评论数
  excerpt: string                    // 摘要
  isSelected?: boolean               // 是否选中（TUI用）
}
```

### 分类统计

```typescript
interface CategoryStats {
  name: string                       // 分类名
  count: number                      // 文章数
  isActive: boolean                  // 是否激活
}
```

### GitHub配置

```typescript
interface GitHubConfig {
  owner: string                      // 仓库所有者
  repo: string                       // 仓库名称
  token?: string                     // Personal Access Token
  labels?: string[]                  // 标签过滤
}
```

### API状态

```typescript
interface ApiStatus {
  loading: boolean                   // 是否加载中
  error: string | null               // 错误信息
  lastUpdated: Date | null           // 最后更新时间
}
```

### 文章列表状态

```typescript
interface PostListState {
  posts: BlogPost[]                  // 所有文章
  filteredPosts: BlogPost[]          // 过滤后文章
  selectedIndex: number              // 选中索引
  currentPage: number                // 当前页
  totalPages: number                 // 总页数
  searchQuery: string                // 搜索查询
  activeCategory: string             // 当前分类
}
```

### TUI视图

```typescript
type BlogView = "list" | "detail"
```

### 菜单项

```typescript
interface MenuItem {
  id: string                         // 菜单项ID
  label: string                      // 显示文本
  shortcut?: string                  // 快捷键
  isActive: boolean                  // 是否激活
}
```

---

## stores/terminalStore.ts

### 命令历史条目

```typescript
interface CommandHistoryEntry {
  id: string                         // 唯一标识符
  command: string                    // 命令文本
  timestamp?: number                 // 时间戳
  dismissMessage?: string            // 关闭时的替换消息
}
```

### 交互模式

```typescript
interface InteractiveMode {
  active: boolean                    // 是否激活
  command: string | null             // 来源命令
}
```

---

## 类型使用示例

### 定义新命令

```typescript
import type { Command } from '../types/command';

const myCommand: Command = {
  id: 'mycommand',
  name: 'mycommand',
  description: 'My command',
  category: 'info',
  component: () => import('./index'),
};
```

### 定义新插件

```typescript
import type { Plugin, PluginContext } from '../types/plugin';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context: PluginContext) => {
    const config = context.getConfig();
    const state = context.getTerminalState();

    context.registerCommand({
      id: 'plugin-cmd',
      name: 'plugin-cmd',
      description: 'Plugin command',
      component: () => import('./PluginCommand'),
    });
  },
};
```

### 使用GitHub类型

```typescript
import type { GitHubConfig, BlogPost } from '../types/github';

const config: GitHubConfig = {
  owner: 'parallelarc',
  repo: 'blog',
  labels: ['blog'],
};

async function fetchPosts(config: GitHubConfig): Promise<BlogPost[]> {
  // 实现逻辑
  return [];
}
```

---

## 类型导入

### 从类型文件导入

```typescript
// 推荐：明确导入类型
import type { Command, Plugin } from '../types/command';

// 也可以：值和类型一起导入
import { Command, Plugin } from '../types/command';
```

### 类型断言

```typescript
// 使用 as 断言
const command = commandRegistry.get('hello') as Command;

// 使用类型守卫
function isCommand(value: unknown): value is Command {
  return typeof value === 'object' && value !== null && 'name' in value;
}
```

---

## 扩展类型

### 添加新命令属性

```typescript
// 扩展 Command 接口
interface ExtendedCommand extends Command {
  customProperty?: string;
}

const extendedCommand: ExtendedCommand = {
  ...baseCommand,
  customProperty: 'value',
};
```

### 添加新插件上下文方法

```typescript
// 扩展 PluginContext
declare module '../types/plugin' {
  interface PluginContext {
    customMethod?(): void;
  }
}

// 使用
context.customMethod?.();
```
