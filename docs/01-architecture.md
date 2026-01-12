# 架构设计

## 整体架构图

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
```

## 数据流设计

### 命令执行流程

```
用户输入 → HiddenTextarea onChange
           ↓
       更新 terminalStore.input
           ↓
       过滤命令列表 (updateFilteredCommands)
           ↓
    用户按 Enter 提交
           ↓
      useCommandSubmission.handleSubmit
           ↓
    添加到历史 (addToHistory)
           ↓
    重置输入状态 (resetInputState)
           ↓
    触发重渲染 (setRerender)
           ↓
CommandHistoryItem 渲染历史
           ↓
    查找命令 (commandRegistry.get)
           ↓
    Output 懒加载命令组件
           ↓
    渲染命令输出
```

### 事件流设计

```
组件/插件 → emit(event, data)
                ↓
        EventBus.listeners Map
                ↓
        遍历事件处理器
                ↓
        try-catch 包裹执行
                ↓
        错误隔离 (console.error)
```

### 状态更新流

```
组件调用 Store Action
        ↓
Zustand 内部状态更新
        ↓
subscribeWithSelector 通知
        ↓
精确订阅的组件重渲染
```

## 文件结构详解

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
│   ├── welcome/                 # 欢迎命令
│   ├── about/                   # 关于命令
│   ├── contact/                 # 联系命令
│   ├── education/               # 教育命令
│   ├── projects/                # 项目命令
│   ├── blog/                    # 博客命令（TUI模式）
│   └── clear/                   # 清屏命令
│
├── core/                        # 核心系统（单例模式）
│   ├── CommandRegistry.ts       # 命令注册表
│   ├── PluginManager.ts         # 插件管理器
│   └── EventBus.ts              # 事件总线
│
├── hooks/                       # 自定义钩子
│   ├── useTheme.ts              # 主题管理
│   ├── useAutocomplete.ts       # 自动补全
│   ├── useClipboardHandler.ts   # 剪贴板
│   ├── useCommandSubmission.ts  # 命令提交
│   ├── useGlobalFocus.ts        # 全局焦点
│   ├── useKeyboardShortcuts.ts  # 键盘快捷键
│   ├── useGitHubIssues.ts       # GitHub数据
│   ├── useKeyboardNavigation.ts # TUI导航
│   └── useTextInput.ts          # 文本输入
│
├── stores/                      # Zustand状态存储
│   ├── terminalStore.ts         # 终端状态
│   └── themeStore.ts            # 主题状态
│
├── types/                       # TypeScript类型定义
│   ├── command.ts               # 命令类型
│   ├── plugin.ts                # 插件类型
│   └── github.ts                # GitHub类型
│
├── config/                      # 配置文件
│   ├── index.ts                 # 配置导出
│   ├── terminal.ts              # 终端配置
│   └── plugins.ts               # 插件配置
│
└── utils/                       # 工具函数
    ├── storage.ts               # LocalStorage封装
    ├── funcs.ts                 # 通用函数
    ├── validateArgs.ts          # 参数验证
    └── github.ts                # GitHub API工具
```

## 设计模式

### 单例模式

三个核心系统采用单例模式：

1. **CommandRegistry** - 全局唯一的命令注册表
2. **PluginManager** - 全局唯一的插件管理器
3. **EventBus** - 全局唯一的事件总线

```typescript
// 单例导出模式
export const commandRegistry = new CommandRegistry();
export const pluginManager = new PluginManager();
export const eventBus = new EventBus();
```

### 发布-订阅模式

EventBus实现了经典的发布-订阅模式：

- **发布者**: 通过`emit()`触发事件
- **订阅者**: 通过`on()`注册监听器
- **解耦**: 发布者和订阅者互不依赖

### 上下文模式

使用React Context传递命令执行上下文：

```typescript
export const termContext = createContext<Term>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
  isLatest: false,
});
```

### 懒加载模式

所有命令组件使用动态导入：

```typescript
component: () => import('./index')
```

这确保了：
- 初始包体积小
- 按需加载命令
- 更快的首屏渲染

## 性能优化策略

### 1. 精确订阅

使用Zustand的selector避免不必要的重渲染：

```typescript
// 不好：订阅整个store，任何变化都会重渲染
const state = useTerminalStore();

// 好：只订阅需要的状态
const inputVal = useTerminalStore((s) => s.input);
```

### 2. 组件记忆化

使用`React.memo`和`useMemo`：

```typescript
export default React.memo(Output, (prev, next) => {
  return prev.index === next.index && prev.cmd === next.cmd;
});
```

### 3. 懒加载

命令组件动态导入：

```typescript
const CommandComponent = useMemo(
  () => lazy(command.component),
  [command]
);
```

### 4. 事件委托

使用全局事件监听器而不是为每个元素绑定：

```typescript
document.addEventListener('keydown', handleGlobalKeyDown);
```

## 扩展性设计

### 添加新命令

只需创建新文件并注册，无需修改核心代码：

```typescript
// 1. 创建命令配置
export const config: Command = {
  id: 'mycommand',
  name: 'mycommand',
  description: 'My command',
  component: () => import('./index'),
};

// 2. 注册
commandRegistry.register(config);
```

### 添加新插件

插件系统允许扩展功能：

```typescript
const plugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init: (context) => {
    context.registerCommand(/* ... */);
  },
};

pluginManager.load(plugin);
```

### 添加新主题

主题是纯数据结构，易于扩展：

```typescript
"my-theme": {
  id: "T_007",
  name: "my-theme",
  colors: { /* ... */ },
}
```
