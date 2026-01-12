# 自定义钩子

## 概述

项目包含9个自定义钩子，封装了可复用的逻辑。

## 钩子列表

| 钩子 | 功能 | 文件 |
|------|------|------|
| `useTheme` | 主题管理 | `useTheme.ts` |
| `useAutocomplete` | 命令自动补全 | `useAutocomplete.ts` |
| `useClipboardHandler` | 剪贴板自动复制 | `useClipboardHandler.ts` |
| `useCommandSubmission` | 命令提交处理 | `useCommandSubmission.ts` |
| `useGlobalFocus` | 全局焦点管理 | `useGlobalFocus.ts` |
| `useKeyboardShortcuts` | 键盘快捷键 | `useKeyboardShortcuts.ts` |
| `useGitHubIssues` | GitHub数据管理 | `useGitHubIssues.ts` |
| `useKeyboardNavigation` | TUI键盘导航 | `useKeyboardNavigation.ts` |
| `useTextInput` | 文本输入状态 | `useTextInput.ts` |

---

## useTheme

**文件**: `src/hooks/useTheme.ts`

主题管理钩子，处理主题初始化和切换。

```typescript
function useTheme(): {
  theme: DefaultTheme           // 当前主题
  themeLoaded: boolean          // 是否已加载
  setMode: (theme) => void      // 设置主题
}
```

### 使用示例

```typescript
function MyComponent() {
  const { theme, themeLoaded, setMode } = useTheme();

  useEffect(() => {
    if (!themeLoaded) {
      initTheme();
    }
  }, [themeLoaded, initTheme]);

  const switchTheme = () => {
    setMode(themes.light);
  };
}
```

---

## useAutocomplete

**文件**: `src/hooks/useAutocomplete.ts`

命令自动补全钩子。

```typescript
function useAutocomplete({
  inputVal,
  allCommands,
}: UseAutocompleteProps): {
  filteredCommands: Command[]           // 过滤后的命令
  selectedCommandIndex: number          // 选中索引
  setSelectedCommandIndex: (index) => void
  handleTabCompletion: () => string | null  // Tab补全
  isAutocompleteMode: boolean           // 是否在补全模式
}
```

### 行为

- 检测输入是否以 `/` 开头
- 过滤匹配的命令
- 处理Tab补全

### 使用示例

```typescript
const {
  filteredCommands,
  selectedCommandIndex,
  handleTabCompletion,
  isAutocompleteMode,
} = useAutocomplete({
  inputVal: input,
  allCommands: commands,
});

// 补全命令
if (e.key === 'Tab') {
  const completed = handleTabCompletion();
  if (completed) {
    setInput(completed);
  }
}
```

---

## useClipboardHandler

**文件**: `src/hooks/useClipboardHandler.ts`

自动复制选中文本到剪贴板，显示Toast提示。

```typescript
function useClipboardHandler({
  containerRef,
  setShowCopyToast,
}): void
```

### 行为

1. 监听 `mouseup` 事件
2. 检查选择是否在容器内
3. 使用 `navigator.clipboard.writeText` 复制
4. 显示2.2秒的Toast提示
5. 清理定时器

### 使用示例

```typescript
const containerRef = useRef<HTMLDivElement>(null);
const setShowCopyToast = useTerminalStore((s) => s.setShowCopyToast);

useClipboardHandler({
  containerRef,
  setShowCopyToast,
});
```

---

## useCommandSubmission

**文件**: `src/hooks/useCommandSubmission.ts`

命令提交处理。

```typescript
function useCommandSubmission({
  inputVal,
  onAddToHistory,
  onResetInputState,
  onSetRerender,
}): {
  handleSubmit: (e) => void
}
```

### 行为

1. 验证输入非空
2. 添加到历史
3. 重置输入状态
4. 触发重渲染

### 使用示例

```typescript
const { handleSubmit } = useCommandSubmission({
  inputVal: input,
  onAddToHistory: addToHistory,
  onResetInputState: resetInputState,
  onSetRerender: setRerender,
});

<form onSubmit={handleSubmit}>
  {/* ... */}
</form>
```

---

## useGlobalFocus

**文件**: `src/hooks/useGlobalFocus.ts`

全局焦点管理，任何按键自动聚焦输入框。

```typescript
function useGlobalFocus({
  containerRef,
  inputRef,
}): void
```

### 行为

- 任何按键（除ESC）自动聚焦输入框
- 滚动到底部
- 使用双 `requestAnimationFrame` 确保DOM就绪
- 排除其他输入元素

### 使用示例

```typescript
const containerRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLTextAreaElement>(null);

useGlobalFocus({
  containerRef,
  inputRef,
});
```

---

## useKeyboardShortcuts

**文件**: `src/hooks/useKeyboardShortcuts.ts`

键盘快捷键处理。

```typescript
function useKeyboardShortcuts({
  inputVal,
  cursorPosition,
  filteredCommands,
  selectedCommandIndex,
  onResetInput,
  handleSubmit,
  onAddToHistory,
  onSetSelectedIndex,
  onSetInput,
  onSyncCursorPosition,
  onSetRerender,
}): {
  handleKeyDown: (e) => void
}
```

### 快捷键列表

| 按键 | 功能 |
|------|------|
| `Ctrl+C` | 清空输入 |
| `Esc` | 退出命令选择模式 |
| `Shift+Enter` | 插入换行 |
| `Enter` | 提交表单 |
| `Tab/Ctrl+I` | 补全命令 |
| `↑` | 上一个命令 |
| `↓` | 下一个命令 |
| `←` | 左移光标 |
| `→` | 右移光标 |
| `Home` | 跳到行首 |
| `End` | 跳到行尾 |

### 使用示例

```typescript
const { handleKeyDown } = useKeyboardShortcuts({
  inputVal: input,
  cursorPosition: cursorPosition,
  // ...
});

<textarea onKeyDown={handleKeyDown} />
```

---

## useGitHubIssues

**文件**: `src/hooks/useGitHubIssues.ts`

GitHub Issues博客数据管理。

```typescript
function useGitHubIssues(
  config: GitHubConfig,
  initialCategory = "All"
): {
  // --- 数据状态 ---
  posts: BlogPost[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null

  // --- 列表状态 ---
  listState: PostListState
  categoryStats: CategoryStats[]

  // --- 操作 ---
  refresh: () => Promise<void>
  setActiveCategory: (category) => void
  setSearchQuery: (query) => void
  setSelectedIndex: (index) => void
  setCurrentPage: (page) => void
  nextPage: () => void
  prevPage: () => void
}
```

### 特性

- 每页10篇文章
- 搜索过滤（标题、内容、标签）
- 分类统计
- 分页导航

### 使用示例

```typescript
const BLOG_CONFIG: GitHubConfig = {
  owner: 'parallelarc',
  repo: 'blog',
  token: import.meta.env.VITE_GITHUB_TOKEN,
  labels: ['blog'],
};

const {
  posts,
  loading,
  error,
  listState,
  categoryStats,
  refresh,
  setActiveCategory,
  setSearchQuery,
} = useGitHubIssues(BLOG_CONFIG);
```

---

## useKeyboardNavigation

**文件**: `src/hooks/useKeyboardNavigation.ts`

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
  onCategoryChange,
  onPostSelect,
  onPageChange,
  onEscape,
  onSearchInput,
  onSearchBackspace,
  onSearchMoveLeft,
  onSearchMoveRight,
  onSearchMoveToStart,
  onSearchMoveToEnd,
  onSearchDelete,
}): {
  handleKeyDown: (e: KeyboardEvent) => void
}
```

### 导航模式

#### 搜索模式 (section: "search")

| 按键 | 功能 |
|------|------|
| 字符键 | 添加到搜索 |
| Backspace | 删除字符 |
| `←→` | 移动光标 |
| `Home/End` | 跳到首尾 |
| `Delete` | 删除光标处字符 |
| `↑` | 跳到最后文章 |
| `↓` | 跳到标签或文章 |

#### 标签模式 (section: "tags")

| 按键 | 功能 |
|------|------|
| `↑` | 跳到搜索 |
| `↓` | 跳到文章 |
| `←→` | 切换标签（循环） |

#### 文章模式 (section: "posts")

| 按键 | 功能 |
|------|------|
| `↑↓` | 上下选择文章 |
| `←→` | 翻页（循环） |
| `Enter/Space` | 打开文章 |

### 使用示例

```typescript
const [focusState, setFocusState] = useState<FocusState>({
  section: 'tags',
  tagsIndex: 0,
  postIndex: 0,
});

const { handleKeyDown } = useKeyboardNavigation({
  focusState,
  setFocusState,
  categoryCount: categoryStats.length,
  currentPagePosts: currentPosts.length,
  totalPages,
  currentPage,
  activeCategoryIndex,
  onCategoryChange: (index) => setActiveCategory(categoryStats[index].name),
  onPostSelect: (index) => window.open(currentPosts[index].url, '_blank'),
  onPageChange: setCurrentPage,
  onEscape: () => setInteractiveMode(false),
});

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);
```

---

## useTextInput

**文件**: `src/hooks/useTextInput.ts`

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

### 操作说明

| 操作 | 描述 |
|------|------|
| `setValue` | 设置值 |
| `setCursorPosition` | 设置光标位置 |
| `insertChar` | 在光标处插入字符 |
| `backspace` | 删除光标前字符 |
| `deleteChar` | 删除光标处字符 |
| `moveLeft` | 左移光标 |
| `moveRight` | 右移光标 |
| `moveToStart` | 跳到开头 |
| `moveToEnd` | 跳到结尾 |
| `clear` | 清空输入 |

### 使用示例

```typescript
const {
  value,
  cursorPosition,
  insertChar,
  backspace,
  moveLeft,
  moveRight,
  clear,
} = useTextInput({
  initialValue: '',
  onChange: (value) => console.log('Input:', value),
});

// 插入字符
insertChar('a');

// 删除字符
backspace();

// 移动光标
moveLeft();
```
