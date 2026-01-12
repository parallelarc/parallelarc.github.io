# 配置系统

## 概述

项目配置集中在 `src/config/` 目录，支持终端配置和插件配置。

---

## 终端配置 (terminal.ts)

**文件**: `src/config/terminal.ts`

### 配置项

```typescript
const terminalConfig = {
  // 最大历史条目数
  maxHistorySize: 100,

  // 启用自动补全
  enableAutocomplete: true,

  // 自动补全触发字符
  autocompleteTrigger: '/',

  // 帮助触发字符
  helpTrigger: '?',

  // 启用键盘快捷键
  enableKeyboardShortcuts: true,

  // 默认历史命令
  defaultHistory: ['welcome'],

  // 输入防抖延迟（毫秒）
  inputDebounceMs: 0,
} as const;
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `maxHistorySize` | number | 100 | 命令历史最大保存数量 |
| `enableAutocomplete` | boolean | true | 是否启用命令自动补全 |
| `autocompleteTrigger` | string | '/' | 触发自动补全的字符 |
| `helpTrigger` | string | '?' | 触发帮助显示的字符 |
| `enableKeyboardShortcuts` | boolean | true | 是否启用键盘快捷键 |
| `defaultHistory` | string[] | ['welcome'] | 页面加载时的默认历史 |
| `inputDebounceMs` | number | 0 | 输入防抖延迟 |

### 使用方式

```typescript
import { terminalConfig } from '../config/terminal';

// 读取配置
const maxSize = terminalConfig.maxHistorySize;
const trigger = terminalConfig.autocompleteTrigger;
```

---

## 插件配置 (plugins.ts)

**文件**: `src/config/plugins.ts`

### 配置项

```typescript
// 自动加载的插件列表
export const autoLoadPlugins: Plugin[] = [
  // 示例：
  // {
  //   name: 'my-plugin',
  //   version: '1.0.0',
  //   commands: [...]
  // }
];

// 插件设置
export const pluginConfig = {
  // 启用插件系统
  enabled: true,

  // 允许从外部URL加载插件（安全风险）
  allowExternalPlugins: false,

  // 最大插件数量
  maxPlugins: 50,

  // 插件加载超时（毫秒）
  loadTimeout: 5000,
} as const;
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | boolean | true | 是否启用插件系统 |
| `allowExternalPlugins` | boolean | false | 是否允许从外部URL加载插件 |
| `maxPlugins` | number | 50 | 同时加载的最大插件数 |
| `loadTimeout` | number | 5000 | 插件加载超时时间 |

### 添加自动加载插件

```typescript
import { Plugin } from '../types/plugin';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  commands: [...]
};

export const autoLoadPlugins: Plugin[] = [
  myPlugin,
  // 更多插件...
];
```

---

## 配置导出 (index.ts)

**文件**: `src/config/index.ts`

```typescript
export { terminalConfig, type TerminalConfig } from './terminal';
export { pluginConfig, type PluginConfig } from './plugins';
```

---

## TypeScript 类型

### TerminalConfig

```typescript
export type TerminalConfig = typeof terminalConfig;
// 等价于：
interface TerminalConfig {
  readonly maxHistorySize: 100
  readonly enableAutocomplete: true
  readonly autocompleteTrigger: '/'
  readonly helpTrigger: '?'
  readonly enableKeyboardShortcuts: true
  readonly defaultHistory: ['welcome']
  readonly inputDebounceMs: 0
}
```

### PluginConfig

```typescript
export type PluginConfig = typeof pluginConfig;
```

---

## 配置最佳实践

### 1. 保持配置简单

```typescript
// 好：使用原始类型
maxHistorySize: 100

// 避免：复杂嵌套对象
history: {
  max: 100,
  persist: true,
  compress: false
}
```

### 2. 使用 const 断言

```typescript
// 好：防止修改
export const config = {
  value: 100
} as const;

// 不好：可能被修改
export let config = {
  value: 100
};
```

### 3. 导出类型

```typescript
// 导出配置
export const terminalConfig = {...} as const;

// 导出类型
export type TerminalConfig = typeof terminalConfig;
```

---

## 环境变量

### 支持的环境变量

```bash
# GitHub博客配置
VITE_GITHUB_OWNER=parallelarc
VITE_GITHUB_BLOG_REPO=blog
VITE_GITHUB_BLOG_LABEL=blog
VITE_GITHUB_TOKEN=ghp_xxxxx
```

### 使用环境变量

```typescript
const config: GitHubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "default",
  repo: import.meta.env.VITE_GITHUB_BLOG_REPO || "blog",
  token: import.meta.env.VITE_GITHUB_TOKEN,
};
```

### .env.local 示例

```bash
# .env.local

VITE_GITHUB_OWNER=your-username
VITE_GITHUB_BLOG_REPO=your-blog-repo
VITE_GITHUB_BLOG_LABEL=blog
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 修改配置

### 修改历史大小

```typescript
// src/config/terminal.ts
export const terminalConfig = {
  maxHistorySize: 200,  // 改为200
  // ...
} as const;
```

### 修改自动补全触发器

```typescript
// src/config/terminal.ts
export const terminalConfig = {
  autocompleteTrigger: '>',  // 改为 >
  // ...
} as const;
```

### 添加新的自动加载插件

```typescript
// src/config/plugins.ts
import { myPlugin } from '../plugins/myPlugin';

export const autoLoadPlugins: Plugin[] = [
  myPlugin,
  // ...
];
```

---

## 配置验证

### 在插件中使用配置

```typescript
const plugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context) => {
    const config = context.getConfig();

    // 检查配置
    if (!config.enableAutocomplete) {
      console.warn('Autocomplete is disabled');
      return;
    }

    // 使用配置
    const maxSize = config.maxHistorySize;
    console.log('Max history:', maxSize);
  }
};
```

---

## 未来扩展

### 可能的配置项

```typescript
// 未来可能添加的配置
const futureConfig = {
  // 主题配置
  defaultTheme: 'dark',
  allowThemeSwitch: true,

  // 声音配置
  enableSound: false,
  keypressSound: null,

  // 动画配置
  enableAnimations: true,
  animationSpeed: 1.0,

  // 网络配置
  apiTimeout: 5000,
  retryAttempts: 3,
} as const;
```
