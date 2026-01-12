# 开发工作流

## 概述

本文档介绍项目的开发流程、脚本使用和最佳实践。

---

## 可用脚本

| 脚本 | 功能 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm test` | 运行测试（监视模式） |
| `npm run test:once` | 运行测试一次 |
| `npm run coverage` | 生成测试覆盖率报告 |
| `npm run lint` | ESLint检查 |
| `npm run format:check` | Prettier检查 |
| `npm run format` | Prettier格式化 |

---

## 开发环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/parallelarc/terminal-portfolio.git
cd terminal-portfolio
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 配置环境变量（可选）

创建 `.env.local` 文件：

```bash
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_BLOG_REPO=your-blog-repo
VITE_GITHUB_BLOG_LABEL=blog
VITE_GITHUB_TOKEN=your-personal-access-token
```

---

## 添加新命令

### 步骤

1. **创建命令目录**

```bash
mkdir -p src/commands/mycommand
```

2. **创建配置文件** `config.ts`

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

3. **创建组件文件** `index.tsx`

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

5. **测试命令**

```bash
npm run dev
# 在终端中输入: /mycommand
```

---

## 命令选项

### 带别名

```typescript
export const config: Command = {
  // ...
  aliases: ['mc', 'mycmd'],
};
```

### 接受参数

```typescript
export const config: Command = {
  // ...
  acceptsArgs: true,
};

// 在组件中使用
const { arg } = useContext(termContext);
console.log('Arguments:', arg);
```

### TUI模式

```typescript
export const config: Command = {
  // ...
  interactive: true,
};
```

### 带参数定义

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

---

## 添加新主题

编辑 `src/components/styles/themes.ts`：

```typescript
const theme: Themes = {
  // ... 现有主题

  "my-theme": {
    id: "T_007",
    name: "my-theme",
    colors: {
      body: "#...",
      bg: "#...",
      scrollHandle: "#...",
      scrollHandleHover: "#...",
      primary: "#...",
      secondary: "#...",
      accent: "#...",
      text: {
        100: "#...",
        200: "#...",
        300: "#...",
        400: "#...",
      },
    },
  },
};
```

---

## 测试

### 运行测试

```bash
# 监视模式
npm test

# 运行一次
npm run test:once

# 覆盖率报告
npm run coverage
```

### 测试文件位置

```
src/
└── test/
    ├── setup.ts          # 测试设置
    └── *.test.ts         # 测试文件
```

### 测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { commandRegistry } from '../core/CommandRegistry';

describe('CommandRegistry', () => {
  it('should register a command', () => {
    const command = {
      id: 'test',
      name: 'test',
      description: 'Test command',
      component: () => Promise.resolve({ default: () => null }),
    };

    commandRegistry.register(command);
    expect(commandRegistry.has('test')).toBe(true);
  });
});
```

---

## 代码检查

### ESLint

```bash
# 检查代码
npm run lint

# 自动修复（部分问题）
npm run lint -- --fix
```

### Prettier

```bash
# 检查格式
npm run format:check

# 格式化代码
npm run format
```

---

## Git提交

### Husky 钩子

项目配置了 Git 钩子，提交前自动运行检查：

```bash
# Git 钩子会在提交前自动运行
git add .
git commit -m "feat: add new command"
# → 自动运行 lint 和 format
```

### 提交信息规范

推荐使用约定式提交：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

---

## 构建与部署

### 构建

```bash
npm run build
```

构建过程：
1. TypeScript编译 (`tsc`)
2. Vite打包
3. 输出到 `dist/` 目录

### 预览构建

```bash
npm run preview
```

### 部署到 GitHub Pages

1. 构建

```bash
npm run build
```

2. 部署 `dist/` 目录到 `gh-pages` 分支

```bash
# 如果使用 gh-pages 包
npx gh-pages -d dist
```

3. 在仓库设置中配置 GitHub Pages

---

## 开发技巧

### 热重载

Vite 支持热模块替换（HMR），修改代码后自动刷新。

### 状态调试

在组件中打印 Zustand 状态：

```typescript
const state = useTerminalStore();
console.log('Terminal state:', state);
```

### 命令调试

查看所有已注册命令：

```typescript
import { commandRegistry } from '../core/CommandRegistry';

console.log('All commands:', commandRegistry.getAll());
console.log('Command count:', commandRegistry.size);
```

### 插件调试

查看已加载插件：

```typescript
import { pluginManager } from '../core/PluginManager';

console.log('Plugins:', pluginManager.getPluginInfo());
```

---

## 常见问题

### 端口被占用

如果 5173 端口被占用，Vite 会自动选择下一个可用端口。

### 命令不显示

检查命令是否被标记为隐藏：

```typescript
hidden: true  // 从帮助中隐藏
```

### 主题不生效

清除 localStorage：

```javascript
localStorage.removeItem('tsn-theme');
// 然后刷新页面
```

### GitHub API 限流

配置 Personal Access Token：

```bash
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 性能优化

### 代码分割

命令组件自动代码分割：

```typescript
component: () => import('./index')
```

### 图片优化

使用懒加载和适当格式：

```typescript
<img
  src={src}
  alt={alt}
  loading="lazy"
  decoding="async"
/>
```

### 减少重渲染

使用精确订阅：

```typescript
// 好
const input = useTerminalStore((s) => s.input);

// 不好
const state = useTerminalStore();
```

---

## 资源链接

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [styled-components 文档](https://styled-components.com/)
