# 状态管理

## 概述

项目使用 Zustand 进行状态管理，两个主要的 store 分别管理终端状态和主题状态。

## Zustand 配置

使用 `subscribeWithSelector` 中间件支持精确订阅：

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useTerminalStore = create<TerminalState>()(
  subscribeWithSelector((set, get) => ({
    // state and actions
  }))
);
```

---

## Terminal Store (终端状态)

**文件位置**: `src/stores/terminalStore.ts`

### 状态结构

```typescript
interface TerminalState {
  // --- 输入状态 ---
  input: string                      // 当前输入文本
  cursorPosition: number             // 光标位置
  setInput: (value: string) => void
  setCursorPosition: (pos: number) => void

  // --- 历史状态 ---
  history: CommandHistoryEntry[]     // 命令历史
  historyIndex: number               // 历史导航索引
  addToHistory: (command: string) => void
  clearHistory: () => void
  navigateHistory: (direction: 'up' | 'down') => void
  removeFromHistory: (index: number) => void
  setDismissMessage: (index: number, message: string) => void

  // --- 自动补全状态 ---
  selectedCommandIndex: number       // 选中的命令索引
  setSelectedCommandIndex: (index: number) => void

  // --- 焦点状态 ---
  isInputFocused: boolean            // 输入框是否聚焦
  setInputFocused: (focused: boolean) => void

  // --- Toast状态 ---
  showCopyToast: boolean             // 是否显示复制提示
  setShowCopyToast: (show: boolean) => void

  // --- 过滤命令 ---
  filteredCommands: LegacyCommand[]  // 过滤后的命令列表
  setFilteredCommands: (commands) => void
  updateFilteredCommands: (input: string) => void

  // --- 杂项 ---
  rerender: boolean                  // 触发重渲染标记
  setRerender: (value: boolean) => void

  // --- 交互模式 ---
  interactiveMode: InteractiveMode   // TUI模式状态
  setInteractiveMode: (active: boolean, command?: string | null) => void

  // --- 操作 ---
  resetInputState: () => void
  syncCursorPosition: (position: number) => void
}

interface CommandHistoryEntry {
  id: string                         // 唯一标识符
  command: string                    // 命令文本
  timestamp?: number                 // 时间戳
  dismissMessage?: string            // 关闭时的替换消息
}

interface InteractiveMode {
  active: boolean                    // 是否激活
  command: string | null             // 来源命令
}
```

### 核心行为详解

#### 历史管理

```typescript
addToHistory: (command: string) => {
  const entry: CommandHistoryEntry = {
    id: generateHistoryId(),         // 生成唯一ID
    command,
    timestamp: Date.now(),
  };

  // 限制最大历史条目
  const maxSize = terminalConfig.maxHistorySize; // 100
  const trimmedHistory = newHistory.length > maxSize
    ? newHistory.slice(0, maxSize)
    : newHistory;

  set({ history: trimmedHistory, historyIndex: -1 });
}
```

#### 历史导航

```typescript
navigateHistory: (direction: 'up' | 'down') => {
  const { history, historyIndex } = get();

  if (direction === 'up') {
    // 向上：在历史中前进
    const newIndex = historyIndex + 1;
    if (newIndex < history.length) {
      set({
        historyIndex: newIndex,
        input: history[newIndex].command
      });
    }
  } else {
    // 向下：在历史中后退
    const newIndex = historyIndex - 1;
    if (newIndex >= 0) {
      set({
        historyIndex: newIndex,
        input: history[newIndex].command
      });
    } else {
      // 回到空输入
      set({ historyIndex: -1, input: '' });
    }
  }
}
```

#### 光标同步

```typescript
syncCursorPosition: (position: number) => {
  // 验证位置有效性
  const validPos = Number.isNaN(position)
    ? 0
    : Math.max(0, Math.floor(position));

  set({ cursorPosition: validPos });

  // 同步到隐藏的 textarea
  const textarea = document.getElementById('terminal-input');
  if (textarea) {
    textarea.setSelectionRange(validPos, validPos);
  }
}
```

#### 交互模式

```typescript
setInteractiveMode: (active: boolean, command: string | null = null) =>
  set({ interactiveMode: { active, command } })
```

当 `interactiveMode.active` 为 `true` 时，Terminal 组件隐藏正常输入框。

### 使用示例

```typescript
// 在组件中使用
function MyComponent() {
  // 精确订阅 - 只在 input 变化时重渲染
  const input = useTerminalStore((s) => s.input);

  // 获取多个状态
  const { input, cursorPosition } = useTerminalStore((s) => ({
    input: s.input,
    cursorPosition: s.cursorPosition,
  }));

  // 获取操作（稳定引用）
  const setInput = useTerminalStore((s) => s.setInput);

  // 使用
  const handleChange = (value: string) => {
    setInput(value);
  };
}
```

---

## Theme Store (主题状态)

**文件位置**: `src/stores/themeStore.ts`

### 状态结构

```typescript
interface ThemeState {
  theme: DefaultTheme           // 当前主题对象
  themeLoaded: boolean          // 主题是否已加载
  setMode: (mode: DefaultTheme) => void
  setThemeByName: (name: ThemeName) => void
  initTheme: () => void
}

type ThemeName = keyof typeof themes;
// 'dark' | 'light' | 'blue-matrix' | 'espresso' | 'green-goblin' | 'ubuntu'
```

### 核心方法

#### `setMode(mode: DefaultTheme): void`

设置主题并保存到 localStorage：

```typescript
setMode: (mode: DefaultTheme) => {
  setToLS('tsn-theme', mode.name);  // 保存主题名
  set({ theme: mode });
}
```

#### `setThemeByName(name: ThemeName): void`

按名称设置主题：

```typescript
setThemeByName: (name: ThemeName) => {
  const theme = themes[name];
  if (theme) {
    setToLS('tsn-theme', name as string);
    set({ theme });
  }
}
```

#### `initTheme(): void`

从 localStorage 初始化主题：

```typescript
initTheme: () => {
  const localThemeName = getFromLS('tsn-theme') as ThemeName;
  if (localThemeName && themes[localThemeName]) {
    set({ theme: themes[localThemeName] });
  }
  set({ themeLoaded: true });
}
```

### 使用示例

```typescript
import { useThemeStore } from '../stores/themeStore';

function ThemeSwitcher() {
  const { theme, themeLoaded, setMode, initTheme } = useThemeStore();

  // 初始化
  useEffect(() => {
    if (!themeLoaded) {
      initTheme();
    }
  }, [themeLoaded, initTheme]);

  // 切换主题
  const switchToLight = () => {
    setMode(themes.light);
  };
}
```

---

## 订阅模式

### 精确订阅（推荐）

只订阅需要的状态，避免不必要的重渲染：

```typescript
// 好：只订阅 input
const input = useTerminalStore((s) => s.input);

// 好：订阅多个状态
const { input, cursorPosition } = useTerminalStore((s) => ({
  input: s.input,
  cursorPosition: s.cursorPosition,
}));

// 不好：订阅整个 store
const state = useTerminalStore();
```

### 选择器函数

使用选择器函数进行复杂计算：

```typescript
// 计算派生状态
const inputLength = useTerminalStore((s) => s.input.length);
const hasHistory = useTerminalStore((s) => s.history.length > 0);
```

### 订阅变化

监听特定状态的变化：

```typescript
import { useTerminalStore } from '../stores/terminalStore';

useEffect(() => {
  const unsubscribe = useTerminalStore.subscribe(
    (state) => state.input,
    (input, previousInput) => {
      console.log('Input changed:', previousInput, '->', input);
    }
  );

  return unsubscribe;
}, []);
```

---

## 性能优化

### 1. 使用选择器避免重渲染

```typescript
// 组件A - 只需要 input
function ComponentA() {
  const input = useTerminalStore((s) => s.input);
  // 只有 input 变化时才重渲染
}

// 组件B - 需要 input 和 cursor
function ComponentB() {
  const { input, cursorPosition } = useTerminalStore((s) => ({
    input: s.input,
    cursorPosition: s.cursorPosition,
  }));
  // 只有 input 或 cursor 变化时才重渲染
}

// 组件C - 只需要操作（稳定引用）
function ComponentC() {
  const setInput = useTerminalStore((s) => s.setInput);
  // 永远不会因为状态变化而重渲染
}
```

### 2. 批量更新

Zustand 自动批量更新，无需手动处理：

```typescript
// 自动批量
set({
  input: '',
  cursorPosition: 0,
  selectedCommandIndex: 0,
});
```

### 3. 浅比较选择器

```typescript
// 使用浅比较
const state = useTerminalStore(
  (state) => ({ input: state.input, history: state.history }),
  shallow
);
```

---

## 状态持久化

### LocalStorage 键

| 键 | 值 | Store |
|---|---|---|
| `tsn-theme` | 主题名称 | themeStore |

### 历史持久化

当前命令历史**不**持久化，刷新页面会重置。可以通过修改 `addToHistory` 来实现持久化：

```typescript
addToHistory: (command: string) => {
  const entry = {
    id: generateHistoryId(),
    command,
    timestamp: Date.now(),
  };
  const newHistory = [entry, ...history];
  const trimmedHistory = /* ... */;

  set({ history: trimmedHistory });

  // 持久化
  setToLS('terminal-history', JSON.stringify(trimmedHistory));
}
```
