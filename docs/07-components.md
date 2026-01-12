# UI组件系统

## 概述

项目使用函数式组件和styled-components构建UI，主要组件位于 `src/components/` 目录。

## 组件层次结构

```
App.tsx
└── ThemeProvider
    └── GlobalStyle
        └── Terminal
            ├── CopyToast (条件)
            ├── Form (条件渲染)
            │   └── ClaudeInputContainer
            │       ├── ClaudeTopLine
            │       ├── ClaudeInputArea
            │       │   ├── TermInfo (提示符)
            │       │   ├── InputDisplay
            │       │   │   └── DisplayText (带光标)
            │       │   └── HiddenTextarea
            │       ├── ClaudeBottomLine
            │       └── 动态内容 (/ /? /默认)
            └── CommandHistory
                └── CommandHistoryItem[]
                    └── Output (懒加载)
```

---

## Terminal 组件

**文件**: `src/components/Terminal.tsx`

核心组件，整合所有终端功能。

### Props

无props，所有状态通过 Zustand store 管理。

### 状态选择器

使用精确订阅避免不必要的重渲染：

```typescript
// 输入状态
const inputVal = useTerminalStore((s) => s.input);
const cursorPosition = useTerminalStore((s) => s.cursorPosition);

// 历史状态
const cmdHistory = useTerminalStore((s) => s.history);
const rerender = useTerminalStore((s) => s.rerender);

// UI状态
const selectedCommandIndex = useTerminalStore((s) => s.selectedCommandIndex);
const filteredCommands = useTerminalStore((s) => s.filteredCommands);
const showCopyToast = useTerminalStore((s) => s.showCopyToast);
const isInputFocused = useTerminalStore((s) => s.isInputFocused);
const interactiveMode = useTerminalStore((s) => s.interactiveMode);

// 操作（稳定引用）
const setInput = useTerminalStore((s) => s.setInput);
// ...
```

### 自定义钩子使用

```typescript
// 剪贴板处理
useClipboardHandler({ containerRef, setShowCopyToast });

// 全局焦点
useGlobalFocus({ containerRef, inputRef });

// 命令提交
const { handleSubmit } = useCommandSubmission({...});

// 键盘快捷键
const { handleKeyDown } = useKeyboardShortcuts({...});
```

### 交互模式处理

当 `interactiveMode.active` 为 `true` 时，隐藏正常输入框：

```typescript
{!interactiveMode.active && (
  <Form onSubmit={handleSubmit}>
    {/* 输入区域 */}
  </Form>
)}
```

### 动态内容区域

根据输入显示不同内容：

```typescript
{inputVal.startsWith('/') ? (
  <CommandsList>
    {/* 命令列表 */}
  </CommandsList>
) : inputVal === '?' ? (
  <ShortcutsGrid>
    {/* 快捷键网格 */}
  </ShortcutsGrid>
) : (
  <InputHint>
    ? for shortcuts
  </InputHint>
)}
```

---

## Output 组件

**文件**: `src/components/Output.tsx`

命令输出渲染器，特性：

1. **懒加载**: 使用 `React.lazy` 动态导入
2. **参数验证**: 检查命令是否接受参数
3. **交互模式处理**: 为交互命令使用特殊key
4. **性能优化**: 使用 `React.memo`

### 参数验证

```typescript
const command = commandRegistry.get(cmd);

if (arg.length > 0 && !command?.acceptsArgs) {
  return <UsageDiv>Usage: {cmd}</UsageDiv>;
}
```

### 命令未找到

```typescript
if (!command) {
  return (
    <OutputContainer>
      command not found: {cmd}
    </OutputContainer>
  );
}
```

### 懒加载组件

```typescript
const CommandComponent = useMemo(
  () => lazy(command.component),
  [command]
);
```

### 交互模式key

为交互命令使用变化的key，强制重新挂载：

```typescript
const isInteractive = command.interactive === true;
const containerKey = isInteractive
  ? `${cmd}-${interactiveMode.active}`
  : undefined;

return (
  <OutputContainer key={containerKey}>
    <Suspense fallback={<LoadingOutput />}>
      <CommandComponent />
    </Suspense>
  </OutputContainer>
);
```

### React.memo

使用自定义比较函数：

```typescript
export default React.memo(Output, (prev, next) => {
  return prev.index === next.index && prev.cmd === next.cmd;
});
```

---

## CommandHistoryItem 组件

**文件**: `src/components/CommandHistoryItem.tsx`

历史记录项，负责渲染单个命令及其输出。

### Props

```typescript
interface CommandHistoryItemProps {
  cmdH: string                      // 命令文本
  entryId?: string                 // 条目ID
  index: number                    // 索引
  cmdHistory: CommandHistoryEntry[] // 完整历史
  rerender: boolean                // 重渲染标记
  clearHistory?: () => void        // 清空历史
  removeFromHistory?: (index) => void
  setDismissMessage?: (index, message) => void
  dismissMessage?: string          // 关闭消息
}
```

### 上下文值

使用 `useMemo` 优化上下文值：

```typescript
const contextValue = useMemo(
  () => ({
    arg: commandArray.slice(1),
    history: cmdHistory.map(e => e.command),
    rerender,
    index,
    entryId,
    isLatest: index === 0,
    clearHistory,
    removeFromHistory,
    setDismissMessage,
  }),
  [commandArray, cmdHistory, rerender, index, entryId, clearHistory, removeFromHistory, setDismissMessage]
);
```

### 渲染结构

```typescript
<div>
  <CommandBlock>
    <HistoryPrompt>❯</HistoryPrompt>
    <MobileBr />
    <MobileSpan>&#62;</MobileSpan>
    <span>{cmdH}</span>
  </CommandBlock>

  {dismissMessage ? (
    <OutputContainer>{dismissMessage}</OutputContainer>
  ) : validCommand ? (
    <termContext.Provider value={contextValue}>
      <Output index={index} cmd={normalizedCommand} />
    </termContext.Provider>
  ) : cmdH === "" ? (
    <Empty />
  ) : (
    <OutputContainer>command not found: {cmdH}</OutputContainer>
  )}
</div>
```

---

## TermInfo 组件

**文件**: `src/components/TermInfo.tsx`

简单的提示符组件。

```typescript
function TermInfo() {
  return <ClaudePrompt>❯</ClaudePrompt>;
}
```

---

## 样式组件

### Terminal.styled.tsx

**文件**: `src/components/styles/Terminal.styled.tsx`

主要样式组件：

| 组件 | 用途 |
|------|------|
| `Wrapper` | 主容器，反向列布局 |
| `CopyToast` | 复制成功提示 |
| `Empty` | 空状态占位 |
| `MobileSpan` | 移动端提示符 |
| `MobileBr` | 移动端换行 |
| `CommandBlock` | 命令块背景 |
| `Form` | 表单容器 |
| `HiddenTextarea` | 隐藏的实际输入框 |
| `InputDisplay` | 显示输入的容器 |
| `DisplayText` | 显示的文本 |
| `CursorChar` | 块状光标字符 |
| `InputHint` | 输入提示 |
| `ShortcutsGrid` | 快捷键网格 |
| `CommandsList` | 命令列表 |
| `CommandItem` | 命令项 |

### TerminalInfo.styled.tsx

**文件**: `src/components/styles/TerminalInfo.styled.tsx`

Claude Code风格的输入容器：

| 组件 | 用途 |
|------|------|
| `ClaudeInputContainer` | 输入容器 |
| `ClaudeTopLine` | 上横线 |
| `ClaudeInputArea` | 输入区域 |
| `ClaudePrompt` | 提示符（绿色） |
| `HistoryPrompt` | 历史提示符（暗绿色） |
| `ClaudeBottomLine` | 下横线 |

### Output.styled.tsx

**文件**: `src/components/styles/Output.styled.tsx`

输出样式组件：

| 组件 | 用途 |
|------|------|
| `BaseOutputStyle` | 基础输出样式 |
| `OutputContainer` | 输出容器 |
| `Wrapper` | 包装器 |
| `UsageDiv` | 用法提示 |

### Commands.styled.tsx

**文件**: `src/components/styles/Commands.styled.tsx`

各命令的专用样式组件，包含：

- 共享组件（`Cmd`, `Link`, `Divider` 等）
- About 组件
- Education 组件
- Help 组件
- Projects 组件
- Contact 组件（含灯箱）
- Welcome 组件（含彩虹文字）
- Blog 组件（含TUI样式）

---

## 响应式设计

### 断点

项目主要使用以下断点：

```css
@media (max-width: 550px) { ... }   /* 移动端 */
@media (min-width: 550px) { ... }   /* 桌面端 */
@media (max-width: 640px) { ... }   /* 小屏 */
@media (min-width: 640px) { ... }   /* 中屏 */
@media (min-width: 960px) { ... }   /* 大屏 */
```

### 移动端适配

1. **提示符**: 显示简化的 `>` 符号
2. **欢迎页面**: 使用移动版ASCII艺术字
3. **快捷键网格**: 2列布局
4. **灯箱**: 全屏宽度

---

## 性能优化

### 懒加载

所有命令组件使用动态导入：

```typescript
component: () => import('./index')
```

### 记忆化

```typescript
// Context值记忆化
const contextValue = useMemo(() => ({...}), [...]);

// 组件记忆化
export default React.memo(Output, (prev, next) => {
  return prev.index === next.index && prev.cmd === next.cmd;
});
```

### 条件渲染

只在需要时渲染 Toast：

```typescript
{showCopyToast && <CopyToast>...</CopyToast>}
```

### 精确订阅

使用 Zustand selector 避免不必要的重渲染：

```typescript
const inputVal = useTerminalStore((s) => s.input);
```
