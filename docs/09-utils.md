# 工具函数库

## 概述

项目包含4个工具模块，提供通用功能和API集成。

---

## storage.ts

**文件**: `src/utils/storage.ts`

LocalStorage封装函数。

### API

```typescript
function setToLS(key: string, value: string): void
function getFromLS(key: string): string | undefined
```

### 使用示例

```typescript
// 保存
setToLS('tsn-theme', 'dark');

// 读取
const theme = getFromLS('tsn-theme');
// 返回: 'dark' 或 undefined
```

---

## funcs.ts

**文件**: `src/utils/funcs.ts`

通用工具函数。

### API

| 函数 | 功能 | 参数 | 返回值 |
|------|------|------|--------|
| `isArgInvalid` | 检查命令参数是否有效 | `arg, action, options` | `boolean` |
| `getCurrentCmdArry` | 解析最新命令为数组 | `history` | `string[]` |
| `checkThemeSwitch` | 检查是否应切换主题 | `rerender, currentCommand, themes` | `boolean` |
| `getThemeNames` | 获取所有主题名称 | - | `string[]` |

### 使用示例

```typescript
// 检查参数
if (isArgInvalid(arg, 'set', ['dark', 'light'])) {
  console.log('Invalid arguments');
}

// 获取当前命令
const currentCommand = getCurrentCmdArry(history);
// ['set', 'dark']

// 检查主题切换
if (checkThemeSwitch(true, ['themes', 'set', 'light'], themeNames)) {
  // 执行切换
}

// 获取主题名列表
const names = getThemeNames();
// ['dark', 'light', 'blue-matrix', ...]
```

---

## validateArgs.ts

**文件**: `src/utils/validateArgs.ts`

命令参数验证系统。

### API

#### `validateArgs(command, inputArgs): ValidationResult`

验证命令参数：

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  parsedArgs: Record<string, string | number | boolean>
}

interface ValidationError {
  arg: string
  message: string
}
```

**行为**:
1. 检查必填参数
2. 使用默认值
3. 类型验证
4. 返回验证结果

**示例**:

```typescript
const command: Command = {
  args: [
    { name: 'count', type: 'number', required: true },
    { name: 'verbose', type: 'boolean', defaultValue: false },
  ]
};

const result = validateArgs(command, ['10', 'true']);
// {
//   valid: true,
//   errors: [],
//   parsedArgs: { count: 10, verbose: true }
// }
```

#### `getUsageString(command): string`

生成命令用法字符串：

```typescript
getUsageString({ name: 'cmd', args: [...] })
// "cmd <arg1> [arg2]"
```

#### `getArgHelp(command): ArgHelp[]`

获取参数帮助信息：

```typescript
getArgHelp(command)
// [
//   { name: 'count', description: 'Number of items', required: true, type: 'number' },
//   ...
// ]
```

---

## github.ts

**文件**: `src/utils/github.ts`

GitHub API集成工具。

### API

| 函数 | 功能 |
|------|------|
| `createGitHubHeaders(token)` | 创建API请求头 |
| `fetchIssues(config)` | 获取仓库Issues |
| `fetchBlogPosts(config)` | 获取所有博客文章 |
| `calculateCategoryStats(posts)` | 计算分类统计 |
| `formatDate(dateString)` | 格式化日期 |
| `formatRelativeTime(dateString)` | 相对时间 |

### GitHub配置

```typescript
interface GitHubConfig {
  owner: string              // 仓库所有者
  repo: string               // 仓库名称
  token?: string             // Personal Access Token（可选）
  labels?: string[]          // 标签过滤
  dataSource?: "api" | "static" // Data source mode
  staticUrl?: string         // Static JSON URL
}
```

### createGitHubHeaders

```typescript
function createGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  return headers;
}
```

### fetchIssues

```typescript
async function fetchIssues(config: GitHubConfig): Promise<GitHubIssue[]>
```

**行为**:
1. 构建API URL
2. 添加标签过滤
3. 发送请求
4. 处理错误（403限流、404未找到）
5. 过滤Pull Requests

**错误处理**:

| 状态码 | 错误信息 |
|--------|----------|
| 403 | GitHub API rate limit exceeded |
| 404 | Repository not found |

### fetchBlogPosts

```typescript
async function fetchBlogPosts(config: GitHubConfig): Promise<BlogPost[]>
```

**行为**:
1. 调用 `fetchIssues`
2. 转换为博客文章格式
3. 按创建时间排序（新→旧）

### calculateCategoryStats

```typescript
function calculateCategoryStats(
  posts: BlogPost[],
  allLabel = "All"
): CategoryStats[]
```

**返回格式**:

```typescript
[
  { name: "All", count: 10, isActive: true },
  { name: "JavaScript", count: 5, isActive: false },
  { name: "React", count: 3, isActive: false },
  // ...
]
```

### formatDate

```typescript
function formatDate(dateString: string): string
// "2024-01-15"
```

### formatRelativeTime

```typescript
function formatRelativeTime(dateString: string): string
// "today" | "yesterday" | "3 days ago" | "2 weeks ago" | "2024-01-15"
```

**规则**:
- 0天 → "today"
- 1天 → "yesterday"
- <7天 → "X days ago"
- <30天 → "X weeks ago"
- <365天 → "X months ago"
- ≥365天 → 格式化日期

---

## 使用示例

### 完整的博客数据获取流程

```typescript
import { fetchBlogPosts, calculateCategoryStats, formatRelativeTime } from '../utils/github';

// 1. 配置
const config: GitHubConfig = {
  owner: 'parallelarc',
  repo: 'blog',
  token: import.meta.env.VITE_GITHUB_TOKEN,
  labels: ['blog'],
};

// 2. 获取文章
try {
  const posts = await fetchBlogPosts(config);

  // 3. 计算分类统计
  const stats = calculateCategoryStats(posts);

  // 4. 使用数据
  posts.forEach(post => {
    console.log(post.title);
    console.log(formatRelativeTime(post.createdAt));
  });
} catch (error) {
  console.error('Failed to fetch posts:', error.message);
}
```

### 参数验证流程

```typescript
import { validateArgs, getUsageString } from '../utils/validateArgs';

// 定义命令
const command: Command = {
  name: 'search',
  args: [
    {
      name: 'query',
      description: 'Search query',
      required: true,
      type: 'string',
    },
    {
      name: 'limit',
      description: 'Result limit',
      type: 'number',
      defaultValue: 10,
    }
  ]
};

// 验证输入
const input = ['hello', '20'];
const result = validateArgs(command, input);

if (!result.valid) {
  console.error('Errors:', result.errors);
  console.log('Usage:', getUsageString(command));
  // "Usage: search <query> [limit]"
} else {
  console.log('Parsed:', result.parsedArgs);
  // { query: 'hello', limit: 20 }
}
```

### LocalStorage操作

```typescript
import { setToLS, getFromLS } from '../utils/storage';

// 保存主题
setToLS('tsn-theme', 'dark');

// 读取主题
const theme = getFromLS('tsn-theme');
if (theme) {
  console.log('Current theme:', theme);
}
```

---

## 扩展工具函数

### 添加新的工具函数

在 `src/utils/` 目录创建新文件：

```typescript
// src/utils/myHelper.ts

export function myHelper(value: string): string {
  // 实现逻辑
  return value.toUpperCase();
}

export const MY_CONSTANT = 100;
```

### 导出工具

在 `src/utils/index.ts` 中集中导出：

```typescript
export * from './storage';
export * from './funcs';
export * from './validateArgs';
export * from './github';
export * from './myHelper';
```
