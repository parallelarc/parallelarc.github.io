# 命令系统

## 概述

命令系统是整个终端应用的核心，通过CommandRegistry集中管理所有命令。

## 命令接口定义

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

interface ArgDefinition {
  name: string
  description: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean'
  defaultValue?: string | number | boolean
}

type LazyComponent = () => Promise<{ default: ComponentType }>
```

## 内置命令列表

### 信息类命令 (category: "info")

| 命令 | 描述 | 别名 | 特殊属性 |
|------|------|------|----------|
| `welcome` | 显示欢迎页面 | - | ASCII艺术字 |
| `about` | 关于我 | - | 个人介绍，带链接 |
| `contact` | 联系方式 | - | 图标+灯箱效果 |
| `education` | 教育背景 | - | 学历信息列表 |
| `projects` | 项目展示 | - | `acceptsArgs: true`，带相册 |

### 内容类命令 (category: "content")

| 命令 | 描述 | 别名 | 特殊属性 |
|------|------|------|----------|
| `blog` / `blogs` | 博客界面 | `blogs` | `interactive: true`，`acceptsArgs: true` |

### 系统类命令 (category: "system")

| 命令 | 描述 | 特殊属性 |
|------|------|----------|
| `clear` | 清空终端 | 使用`clearHistory` |

## 命令注册流程

**文件位置**: `src/commands/index.ts`

```typescript
// 1. 导入所有命令配置
import { commandRegistry } from '../core/CommandRegistry';
import { config as aboutConfig } from './about/config';
import { config as blogConfig } from './blog/config';
import { config as clearConfig } from './clear/config';
import { config as contactConfig } from './contact/config';
import { config as educationConfig } from './education/config';
import { config as projectsConfig } from './projects/config';
import { config as welcomeConfig } from './welcome/config';

// 2. 注册函数
export function registerCommands() {
  // Info commands
  commandRegistry.register(aboutConfig);
  commandRegistry.register(contactConfig);
  commandRegistry.register(educationConfig);
  commandRegistry.register(projectsConfig);
  commandRegistry.register(welcomeConfig);

  // Content commands
  commandRegistry.register(blogConfig);

  // System commands
  commandRegistry.register(clearConfig);

  return commandRegistry;
}

// 3. 自动注册（模块加载时执行）
registerCommands();

// 4. 导出配置供外部使用
export const commandConfigs = {
  about: aboutConfig,
  blog: blogConfig,
  clear: clearConfig,
  contact: contactConfig,
  education: educationConfig,
  projects: projectsConfig,
  welcome: welcomeConfig,
};

// 5. 导出注册表实例
export { commandRegistry };
```

## 命令目录结构

每个命令遵循统一的结构：

```
commands/
├── mycommand/
│   ├── config.ts       # 命令元数据和配置
│   └── index.tsx       # 命令的React组件
```

### config.ts 示例

```typescript
import { Command } from '../../types/command';

export const config: Command = {
  id: 'mycommand',
  name: 'mycommand',
  description: 'Command description',
  category: 'info',              // 可选分类
  aliases?: ['mc', 'mycmd'],      // 可选别名
  hidden?: false,                 // 是否隐藏
  acceptsArgs?: true,             // 是否接受参数
  interactive?: false,            // 是否TUI模式
  component: () => import('./index'),
};
```

### index.tsx 示例

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

## 命令执行流程

```
用户输入: "about"
        ↓
Terminal.tsx: handleChange
        ↓
terminalStore.input = "about"
        ↓
用户按 Enter
        ↓
useCommandSubmission.handleSubmit
        ↓
terminalStore.addToHistory("about")
        ↓
terminalStore.resetInputState()
        ↓
CommandHistoryItem 渲染
        ↓
解析命令: ["about"]
        ↓
commandRegistry.get("about")
        ↓
Output 组件懒加载
        ↓
渲染 about/index.tsx
```

## 详细命令说明

### welcome - 欢迎页面

**文件**: `src/commands/welcome/index.tsx`

**特性**:
- ASCII艺术字签名（桌面版和移动版不同）
- 彩虹动画文字效果
- ASCII艺术插图
- 响应式布局

### about - 关于我

**文件**: `src/commands/about/index.tsx`

**特性**:
- 个人介绍
- 高亮显示
- 外部链接（MARS Lab）

### contact - 联系方式

**文件**: `src/commands/contact/index.tsx`

**特性**:
- 多个联系方式（Email、GitHub、X、Steam）
- 图标显示（使用react-icons）
- 图片画廊预览
- 灯箱效果（点击放大）
- ESC键关闭灯箱

**联系方式**:
- Email: jvren42@gmail.com
- GitHub: parallelarc
- X (Twitter): @jvren42
- Steam: 游戏库拼贴画

### education - 教育背景

**文件**: `src/commands/education/index.tsx`

**特性**:
- 教育经历列表
- 时间段显示
- 学校和专业信息

### projects - 项目展示

**文件**: `src/commands/projects/index.tsx`

**特性**:
- 项目列表
- 图片相册（支持多种布局）
- 动态图片方向检测
- 灯箱效果
- 图片懒加载

**相册布局类型**:
- `3h`: 三张水平图片
- `3v`: 三张垂直图片
- `2h1v`: 两张水平，一张垂直
- `1h2v`: 一张水平，两张垂直

**项目列表**:
1. Terminal Portfolio - 本项目
2. Vbot - 机器人宠物项目

### blog - 博客界面（TUI模式）

**文件**: `src/commands/blog/index.tsx`

这是最复杂的命令，实现了完整的TUI（终端用户界面）模式。

**特性**:
1. **GitHub Issues集成**
   - 从指定仓库获取博客文章
   - 支持标签过滤
   - 支持搜索功能
   - 错误处理（404、限流等）

2. **TUI模式**
   - `interactive: true` 隐藏正常输入框
   - 完整的键盘导航
   - 统一列表导航（搜索、标签、文章）

3. **键盘操作**:
   | 按键 | 功能 |
   |------|------|
   | `↑↓` | 在列表间循环导航 |
   | `←→` | 切换标签/翻页 |
   | `Enter/Space` | 打开文章（新标签页） |
   | `Esc` | 退出TUI模式 |
   | 字符键 | 实时搜索 |
   | Backspace | 删除搜索字符 |

4. **状态管理**:
   - 分类统计（All + 各标签）
   - 分页（每页10篇）
   - 搜索查询
   - 焦点状态

5. **环境变量配置**:
   ```bash
   VITE_GITHUB_OWNER=parallelarc
   VITE_GITHUB_BLOG_REPO=blog
   VITE_GITHUB_BLOG_LABEL=blog
   VITE_GITHUB_TOKEN=optional_token
   ```

6. **命令参数支持**:
   - `blog search term` - 搜索文章
   - `blog tag:xxx` - 按标签过滤

### clear - 清空终端

**文件**: `src/commands/clear/index.tsx`

**特性**:
- 调用`clearHistory()`
- 带参数时显示用法提示
- 恢复默认历史（`['welcome']`）

## 添加新命令

### 步骤

1. **创建命令目录**

```bash
mkdir -p src/commands/mycommand
```

2. **创建配置文件** (`config.ts`)

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

3. **创建组件文件** (`index.tsx`)

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

4. **注册命令** (在 `src/commands/index.ts`)

```typescript
import { config as myCommandConfig } from './mycommand/config';

export function registerCommands() {
  // ... 现有命令
  commandRegistry.register(myCommandConfig);
  return commandRegistry;
}
```

### 命令选项

#### 带别名

```typescript
export const config: Command = {
  id: 'mycommand',
  name: 'mycommand',
  aliases: ['mc', 'mycmd'],
  // ...
};
```

#### 隐藏命令

```typescript
export const config: Command = {
  // ...
  hidden: true,  // 不在帮助中显示
};
```

#### 接受参数

```typescript
export const config: Command = {
  // ...
  acceptsArgs: true,  // 允许任意参数
};
```

#### TUI模式

```typescript
export const config: Command = {
  // ...
  interactive: true,  // 隐藏输入框
};
```

#### 带参数定义

```typescript
export const config: Command = {
  // ...
  args: [
    {
      name: 'action',
      description: 'Action to perform',
      required: true,
      type: 'string',
    },
    {
      name: 'count',
      description: 'Number of times',
      type: 'number',
      defaultValue: 1,
    },
  ],
};
```

## 命令上下文

命令组件通过 `termContext` 获取上下文：

```typescript
interface Term {
  arg: string[]              // 命令参数
  history: string[]          // 完整历史
  rerender: boolean          // 重渲染标记
  index: number              // 当前索引
  isLatest: boolean          // 是否为最新命令
  clearHistory?: () => void  // 清空历史
  removeFromHistory?: (index) => void
  setDismissMessage?: (index, message) => void
  entryId?: string
}
```

**使用示例**:

```typescript
import { useContext } from "react";
import { termContext } from "../../components/Terminal";

function MyCommand() {
  const { arg, isLatest } = useContext(termContext);

  return (
    <div>
      Arguments: {arg.join(' ')}
      {isLatest && <span> (Latest)</span>}
    </div>
  );
}
```
