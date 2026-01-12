# 核心系统详解

## 概述

项目包含三个核心系统，均采用单例模式设计：

1. **CommandRegistry** - 命令注册表
2. **PluginManager** - 插件管理器
3. **EventBus** - 事件总线

---

## CommandRegistry (命令注册表)

**文件位置**: `src/core/CommandRegistry.ts`

命令注册表是整个应用的核心，负责管理所有终端命令。

### 内部数据结构

```typescript
class CommandRegistry {
  private commands: Map<string, Command>      // 命令名 -> 命令对象
  private aliases: Map<string, string>        // 别名 -> 命令名
}
```

### API 方法

#### `register(command: Command): void`

注册新命令到注册表。

**行为**:
1. 验证命令必须有`id`和`name`
2. 检查重名并发出警告
3. 注册主命令到`commands` Map
4. 注册所有别名到`aliases` Map
5. 处理别名冲突

**示例**:
```typescript
commandRegistry.register({
  id: 'hello',
  name: 'hello',
  description: 'Say hello',
  aliases: ['hi', 'hey'],
  component: () => import('./Hello'),
});
```

#### `unregister(name: string): boolean`

从注册表注销命令。

**行为**:
1. 查找命令
2. 删除主命令
3. 删除所有关联别名
4. 返回操作结果

#### `get(name: string): Command | undefined`

通过命令名或别名获取命令。

**查找顺序**:
1. 先查找`commands` Map
2. 再查找`aliases` Map

#### `getAll(): Command[]`

获取所有已注册命令。

#### `getByCategory(category: string): Command[]`

按分类获取命令。

**示例**:
```typescript
const infoCommands = commandRegistry.getByCategory('info');
// ['welcome', 'about', 'contact', 'education', 'projects']
```

#### `getVisible(): Command[]`

获取非隐藏命令（用于帮助显示）。

#### `findMatches(partial: string): string[]`

查找匹配部分输入的命令名。

**行为**:
- 转换为小写进行匹配
- 过滤隐藏命令
- 按字母排序返回

**示例**:
```typescript
commandRegistry.findMatches('a')
// ['about']
```

#### `has(name: string): boolean`

检查命令是否存在（包括别名）。

#### `clear(): void`

清空所有命令和别名。

#### `size: number`

获取已注册命令数量。

#### `getLegacyCommands(): LegacyCommand[]`

获取兼容旧格式的命令列表。

**用于**: Terminal组件的自动补全显示。

---

## PluginManager (插件管理器)

**文件位置**: `src/core/PluginManager.ts`

插件管理器实现了一个完整的插件生命周期管理系统。

### 内部数据结构

```typescript
class PluginManager {
  private plugins: Map<string, Plugin>           // 插件名 -> 插件对象
  private contexts: Map<string, PluginContext>   // 插件名 -> 上下文
  private messageHandlers: Map<string, MessageHandler>  // 消息处理器
}
```

### PluginContext (插件上下文)

插件在初始化时接收的上下文对象：

```typescript
interface PluginContext {
  // 命令管理
  registerCommand(command: Command): void
  unregisterCommand(name: string): void

  // 状态访问
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

### 事件命名空间

插件自动使用命名空间避免冲突：

```typescript
// 插件 "my-plugin" 订阅事件 "data"
eventBus.on("my-plugin:data", handler);

// emit 会触发两个事件
eventBus.emit("my-plugin:data", ...args);  // 插件专属
eventBus.emit("data", ...args);             // 全局（跨插件通信）
```

### API 方法

#### `load(plugin: Plugin): PluginLoadResult`

加载并初始化插件。

**流程**:
1. 验证插件（必须有`name`和`version`）
2. 检查是否已加载
3. 创建插件上下文
4. 注册插件的命令
5. 调用插件的`init`函数
6. 存储插件和上下文
7. 触发`plugin:loaded`事件

**返回值**:
```typescript
interface PluginLoadResult {
  success: boolean
  plugin?: Plugin
  error?: string
}
```

#### `unload(name: string): boolean`

卸载插件。

**流程**:
1. 触发`plugin:{name}:unload`事件
2. 调用插件的`destroy`函数
3. 注销插件的所有命令
4. 清理插件的事件监听器
5. 移除消息处理器
6. 从存储中删除
7. 触发`plugin:unloaded`事件

#### `get(name: string): Plugin | undefined`

获取已加载的插件。

#### `getAll(): Plugin[]`

获取所有已加载的插件。

#### `getPluginInfo(): PluginInfo[]`

获取插件元数据列表。

#### `has(name: string): boolean`

检查插件是否已加载。

#### `reload(name: string): PluginLoadResult`

重新加载插件（先卸载再加载）。

#### `clear(): void`

卸载所有插件。

#### `size: number`

获取已加载插件数量。

### 插件开发示例

```typescript
import type { Plugin } from '../types/plugin';

const myPlugin: Plugin = {
  name: 'greeting',
  version: '1.0.0',
  description: 'Greeting commands',
  author: 'Your Name',

  // 提供的命令
  commands: [
    {
      id: 'hello',
      name: 'hello',
      description: 'Say hello',
      category: 'info',
      component: () => import('./HelloCommand'),
    }
  ],

  // 初始化
  init: (context) => {
    // 订阅事件
    context.on('greet', (name) => {
      console.log(`Hello, ${name}!`);
    });

    // 监听来自其他插件的消息
    context.onMessage((from, message) => {
      console.log(`Received from ${from}:`, message);
    });

    // 获取终端状态（只读）
    const state = context.getTerminalState();
    console.log('History length:', state.history.length);
  },

  // 清理
  destroy: () => {
    console.log('Greeting plugin destroyed');
  }
};

// 加载插件
import { pluginManager } from '../core/PluginManager';
pluginManager.load(myPlugin);
```

---

## EventBus (事件总线)

**文件位置**: `src/core/EventBus.ts`

简单的发布-订阅模式实现，用于组件和插件间通信。

### 内部数据结构

```typescript
class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map()
}
```

### API 方法

#### `on(event: string, handler: EventHandler): () => void`

订阅事件，返回取消订阅函数。

```typescript
const unsubscribe = eventBus.on('data', (data) => {
  console.log('Received:', data);
});

// 取消订阅
unsubscribe();
```

#### `off(event: string, handler: EventHandler): void`

取消订阅事件。

```typescript
const handler = (data) => console.log(data);
eventBus.on('data', handler);
eventBus.off('data', handler);
```

#### `emit(event: string, ...args: unknown[]): void`

触发事件，通知所有订阅者。

```typescript
eventBus.emit('data', { message: 'Hello' });
```

**特性**:
- 复制监听器列表进行迭代（避免迭代时修改）
- 错误隔离（一个处理器出错不影响其他）
- 自动清理（没有监听器时删除事件）

#### `clear(): void`

清空所有事件监听器。

#### `listenerCount(event: string): number`

获取事件的监听器数量。

```typescript
const count = eventBus.listenerCount('data');
console.log(`${count} listeners for 'data' event`);
```

#### `getEventNames(): string[]`

获取所有有监听器的事件名。

### 使用示例

#### 基础使用

```typescript
// 订阅事件
eventBus.on('user:login', (user) => {
  console.log(`User ${user.name} logged in`);
});

// 触发事件
eventBus.emit('user:login', { name: 'Alice' });
```

#### 取消订阅

```typescript
// 方法1: 使用返回的取消函数
const unsubscribe = eventBus.on('event', handler);
unsubscribe();

// 方法2: 手动取消
eventBus.on('event', handler);
eventBus.off('event', handler);
```

#### 错误隔离

```typescript
eventBus.on('event', () => {
  throw new Error('Oops!');
});

eventBus.on('event', () => {
  console.log('Still called!');
});

eventBus.emit('event');
// Console: "Error in event handler for 'event': Error: Oops!"
// Console: "Still called!"
```

---

## 系统间协作

### 命令与插件的协作

```typescript
// 插件通过上下文注册命令
plugin.init = (context) => {
  context.registerCommand({
    id: 'plugin-cmd',
    name: 'plugin-cmd',
    // ...
  });
};

// 插件卸载时自动注销命令
pluginManager.unload('my-plugin');
// plugin-cmd 也被自动注销
```

### 事件与插件的协作

```typescript
// 插件A发布事件
pluginA.init = (context) => {
  context.emit('data-update', { data: '...' });
};

// 插件B订阅事件
pluginB.init = (context) => {
  context.on('data-update', (data) => {
    console.log('Received:', data);
  });
};
```

### 插件间直接通信

```typescript
// 插件A发送消息
context.sendMessage('plugin-b', { type: 'ping' });

// 插件B接收消息
context.onMessage((from, message) => {
  if (from === 'plugin-a' && message.type === 'ping') {
    context.sendMessage('plugin-a', { type: 'pong' });
  }
});
```
