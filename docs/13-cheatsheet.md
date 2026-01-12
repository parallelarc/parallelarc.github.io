# 速查参考

## 命令速查

| 命令 | 别名 | 描述 | 分类 |
|------|------|------|------|
| `welcome` | - | 显示欢迎页面 | info |
| `about` | - | 关于我 | info |
| `contact` | - | 联系方式 | info |
| `education` | - | 教育背景 | info |
| `projects` | - | 项目展示 | info |
| `blog` | `blogs` | 博客界面（TUI） | content |
| `clear` | - | 清空终端 | system |

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

## 主题列表

| 名称 | ID | 主色 | 背景 |
|------|-----|------|------|
| dark | T_001 | #05CE91 | #1D2A35 |
| light | T_002 | #027474 | #EFF3F3 |
| blue-matrix | T_003 | #00ff9c | #101116 |
| espresso | T_004 | #E1E48B | #323232 |
| green-goblin | T_005 | #E5E500 | #000000 |
| ubuntu | T_006 | #80D932 | #2D0922 |

## 环境变量

```bash
VITE_GITHUB_OWNER=owner           # GitHub用户名
VITE_GITHUB_BLOG_REPO=repo        # 博客仓库名
VITE_GITHUB_BLOG_LABEL=label      # 博客标签
VITE_GITHUB_TOKEN=token           # GitHub Token（可选）
VITE_BLOG_DATA_SOURCE=static      # Use static blog.json
VITE_BLOG_STATIC_URL=/blog.json   # Static data URL
```

## 配置项

```typescript
maxHistorySize: 100                # 最大历史条目
autocompleteTrigger: '/'          # 补全触发符
helpTrigger: '?'                  # 帮助触发符
enableKeyboardShortcuts: true      # 启用快捷键
defaultHistory: ['welcome']       # 默认历史
```

## 核心系统API

### CommandRegistry

```typescript
commandRegistry.register(command)    # 注册命令
commandRegistry.get(name)            # 获取命令
commandRegistry.getAll()             # 获取所有命令
commandRegistry.findMatches(partial) # 查找匹配
commandRegistry.has(name)            # 检查是否存在
```

### PluginManager

```typescript
pluginManager.load(plugin)           # 加载插件
pluginManager.unload(name)           # 卸载插件
pluginManager.get(name)              # 获取插件
pluginManager.getAll()               # 获取所有插件
pluginManager.reload(name)           # 重载插件
```

### EventBus

```typescript
eventBus.on(event, handler)         # 订阅事件
eventBus.off(event, handler)        # 取消订阅
eventBus.emit(event, ...args)        # 触发事件
eventBus.listenerCount(event)        # 监听器数量
```

## Zustand Store

### Terminal Store

```typescript
useTerminalStore((s) => s.input)              # 输入文本
useTerminalStore((s) => s.cursorPosition)    # 光标位置
useTerminalStore((s) => s.history)           # 命令历史
useTerminalStore((s) => s.filteredCommands)  # 过滤命令
useTerminalStore((s) => s.interactiveMode)   # TUI模式
```

### Actions

```typescript
setInput(value)                          # 设置输入
setCursorPosition(pos)                   # 设置光标
addToHistory(command)                    # 添加到历史
clearHistory()                           # 清空历史
resetInputState()                        # 重置输入
setInteractiveMode(true, 'blog')         # 设置TUI模式
```

## 自定义钩子

| 钩子 | 功能 |
|------|------|
| `useTheme` | 主题管理 |
| `useAutocomplete` | 命令补全 |
| `useClipboardHandler` | 剪贴板 |
| `useCommandSubmission` | 命令提交 |
| `useGlobalFocus` | 全局焦点 |
| `useKeyboardShortcuts` | 快捷键 |
| `useGitHubIssues` | GitHub数据 |
| `useKeyboardNavigation` | TUI导航 |
| `useTextInput` | 文本输入 |

## 文件结构速查

```
src/
├── App.tsx                    # 应用入口
├── main.tsx                   # React入口
├── components/
│   ├── Terminal.tsx           # 主终端组件
│   ├── Output.tsx             # 输出渲染
│   ├── CommandHistoryItem.tsx # 历史项
│   ├── TermInfo.tsx           # 提示符
│   └── styles/                # 样式组件
├── commands/                  # 命令实现
│   └── [command]/
│       ├── config.ts          # 命令配置
│       └── index.tsx          # 命令组件
├── core/                      # 核心系统
│   ├── CommandRegistry.ts     # 命令注册表
│   ├── PluginManager.ts       # 插件管理器
│   └── EventBus.ts            # 事件总线
├── hooks/                     # 自定义钩子
├── stores/                    # Zustand存储
├── types/                     # TypeScript类型
├── config/                    # 配置文件
└── utils/                     # 工具函数
```

## NPM脚本

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run preview      # 预览构建
npm test             # 运行测试
npm run coverage     # 测试覆盖率
npm run lint         # ESLint检查
npm run format       # Prettier格式化
```

## 命令模板

### 基础命令

```typescript
// config.ts
import { Command } from '../../types/command';

export const config: Command = {
  id: 'mycommand',
  name: 'mycommand',
  description: 'Description',
  category: 'info',
  component: () => import('./index'),
};

// index.tsx
function MyCommand() {
  return <div>Output</div>;
}
export default MyCommand;
```

### 带参数命令

```typescript
export const config: Command = {
  // ...
  acceptsArgs: true,
};

// 使用
const { arg } = useContext(termContext);
```

### TUI命令

```typescript
export const config: Command = {
  // ...
  interactive: true,
};

// 使用
const setInteractiveMode = useTerminalStore((s) => s.setInteractiveMode);
useEffect(() => {
  setInteractiveMode(true, 'mycommand');
  return () => setInteractiveMode(false, null);
}, []);
```

## 插件模板

```typescript
import type { Plugin } from '../types/plugin';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',

  commands: [...],

  init: (context) => {
    context.registerCommand(...);
    context.on('event', handler);
  },

  destroy: () => {
    // cleanup
  },
};

pluginManager.load(myPlugin);
```

## 常用导入

```typescript
// 组件
import { useContext, useEffect, useState } from 'react';

// Zustand
import { useTerminalStore } from '../stores/terminalStore';
import { useThemeStore } from '../stores/themeStore';

// 核心
import { commandRegistry } from '../core/CommandRegistry';
import { pluginManager } from '../core/PluginManager';
import { eventBus } from '../core/EventBus';

// 类型
import type { Command } from '../types/command';
import type { Plugin } from '../types/plugin';

// 样式
import styled from 'styled-components';

// 钩子
import { useTheme } from '../hooks/useTheme';

// 工具
import { setToLS, getFromLS } from '../utils/storage';
```

## Git工作流

```bash
# 创建功能分支
git checkout -b feature/my-feature

# 提交更改
git add .
git commit -m "feat: add my feature"

# 推送分支
git push origin feature/my-feature

# 创建 Pull Request
```

## 故障排除

### 命令找不到

```typescript
// 检查命令是否注册
console.log(commandRegistry.has('command-name'));

// 查看所有命令
console.log(commandRegistry.getAll());
```

### 主题不保存

```javascript
// 清除存储
localStorage.removeItem('tsn-theme');

// 检查存储
console.log(localStorage.getItem('tsn-theme'));
```

### GitHub API失败

```bash
# 检查配置
echo $VITE_GITHUB_OWNER
echo $VITE_GITHUB_BLOG_REPO

# 测试Token
curl -H "Authorization: token $VITE_GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues

# Static mode (no token in client bundle)
BLOG_GITHUB_TOKEN=ghp_xxx pnpm blog:generate
```

## 相关链接

- [项目仓库](https://github.com/parallelarc/terminal-portfolio)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [styled-components 文档](https://styled-components.com/)
