# 插件系统

## 概述

插件系统允许开发者扩展终端功能，无需修改核心代码。插件可以注册命令、订阅事件、与其他插件通信。

## 插件接口

```typescript
interface Plugin {
  name: string              // 唯一标识符
  version: string           // 语义化版本号
  description?: string      // 插件描述
  author?: string           // 作者信息
  commands?: Command[]      // 插件提供的命令
  init?: (context) => void  // 初始化函数
  destroy?: () => void      // 清理函数
}
```

## 插件上下文

插件在初始化时接收一个 `PluginContext` 对象：

```typescript
interface PluginContext {
  // --- 命令管理 ---
  registerCommand(command: Command): void
  unregisterCommand(name: string): void

  // --- 状态访问（只读）---
  getTerminalState(): TerminalState
  getConfig(): TerminalConfig

  // --- 事件系统（自动命名空间）---
  on(event: string, handler: EventHandler): void
  off(event: string, handler: EventHandler): void
  emit(event: string, ...args: unknown[]): void

  // --- 插件间通信 ---
  sendMessage(targetPlugin: string, message: unknown): void
  onMessage(handler: (from: string, message: unknown) => void): void
}
```

## PluginManager API

**文件位置**: `src/core/PluginManager.ts`

```typescript
class PluginManager {
  // 加载插件
  load(plugin: Plugin): PluginLoadResult

  // 卸载插件
  unload(name: string): boolean

  // 获取插件
  get(name: string): Plugin | undefined
  getAll(): Plugin[]
  getPluginInfo(): PluginInfo[]

  // 检查和重载
  has(name: string): boolean
  reload(name: string): PluginLoadResult

  // 批量操作
  clear(): void
  get size(): number
}
```

## 插件配置

**文件位置**: `src/config/plugins.ts`

```typescript
// 自动加载的插件列表
export const autoLoadPlugins: Plugin[] = []

// 插件设置
export const pluginConfig = {
  enabled: true                      // 启用插件系统
  allowExternalPlugins: false         // 允许外部插件
  maxPlugins: 50                      // 最大插件数
  loadTimeout: 5000                   // 加载超时(ms)
} as const
```

## 插件开发示例

### 基础插件

```typescript
import type { Plugin } from '../types/plugin';
import type { PluginContext } from '../types/plugin';

// 1. 创建插件对象
const helloPlugin: Plugin = {
  name: 'hello-world',
  version: '1.0.0',
  description: 'A simple greeting plugin',
  author: 'Your Name',

  // 2. 提供命令
  commands: [
    {
      id: 'hello',
      name: 'hello',
      description: 'Say hello',
      category: 'info',
      component: () => import('./HelloCommand'),
    }
  ],

  // 3. 初始化
  init: (context: PluginContext) => {
    console.log('Hello plugin initialized!');

    // 订阅事件
    context.on('greet', (name: string) => {
      console.log(`Hello, ${name}!`);
    });
  },

  // 4. 清理
  destroy: () => {
    console.log('Hello plugin destroyed!');
  }
};

// 5. 加载插件
import { pluginManager } from '../core/PluginManager';
const result = pluginManager.load(helloPlugin);

if (result.success) {
  console.log('Plugin loaded successfully');
} else {
  console.error('Failed to load plugin:', result.error);
}
```

### 高级插件示例

```typescript
import type { Plugin, PluginContext } from '../types/plugin';

const advancedPlugin: Plugin = {
  name: 'advanced-plugin',
  version: '2.0.0',

  // 多个命令
  commands: [
    {
      id: 'cmd1',
      name: 'cmd1',
      description: 'First command',
      component: () => import('./Command1'),
    },
    {
      id: 'cmd2',
      name: 'cmd2',
      description: 'Second command',
      component: () => import('./Command2'),
    }
  ],

  init: (context: PluginContext) => {
    // 访问终端状态（只读）
    const state = context.getTerminalState();
    console.log('Current history length:', state.history.length);

    // 访问配置
    const config = context.getConfig();
    console.log('Max history size:', config.maxHistorySize);

    // 动态注册命令
    context.registerCommand({
      id: 'dynamic',
      name: 'dynamic',
      description: 'Dynamically registered',
      component: () => import('./DynamicCommand'),
    });

    // 订阅事件（带命名空间）
    context.on('data', (data) => {
      console.log('[advanced-plugin] Data received:', data);
    });

    // 监听其他插件的消息
    context.onMessage((from: string, message: unknown) => {
      console.log(`Message from ${from}:`, message);

      // 回复消息
      if (from === 'another-plugin') {
        context.sendMessage('another-plugin', {
          type: 'reply',
          data: 'Got your message!'
        });
      }
    });

    // 触发事件
    context.emit('initialized', {
      plugin: 'advanced-plugin',
      timestamp: Date.now()
    });
  },

  destroy: () => {
    // 清理资源
    console.log('[advanced-plugin] Cleaning up...');
  }
};
```

## 事件命名空间

插件的事件会自动添加命名空间前缀：

```typescript
// 插件 "my-plugin" 订阅事件 "data"
context.on('data', handler);

// 实际订阅的是 "my-plugin:data"

// emit 会触发两个事件
context.emit('data', ...args);
// → 触发 "my-plugin:data" (插件专属)
// → 触发 "data" (全局，用于跨插件通信)
```

## 插件间通信

### 方式一：事件总线

```typescript
// 插件A - 发布者
const pluginA: Plugin = {
  name: 'publisher',
  version: '1.0.0',
  init: (context) => {
    // 发布全局事件
    context.emit('news', { headline: 'Hello World' });
  }
};

// 插件B - 订阅者
const pluginB: Plugin = {
  name: 'subscriber',
  version: '1.0.0',
  init: (context) => {
    // 订阅全局事件
    context.on('news', (data) => {
      console.log('Breaking news:', data.headline);
    });
  }
};
```

### 方式二：直接消息

```typescript
// 插件A - 发送者
const pluginA: Plugin = {
  name: 'sender',
  version: '1.0.0',
  init: (context) => {
    // 向特定插件发送消息
    context.sendMessage('receiver', {
      type: 'ping',
      timestamp: Date.now()
    });
  }
};

// 插件B - 接收者
const pluginB: Plugin = {
  name: 'receiver',
  version: '1.0.0',
  init: (context) => {
    // 注册消息处理器
    context.onMessage((from, message) => {
      if (message.type === 'ping') {
        console.log(`Ping from ${from}`);
        // 回复
        context.sendMessage(from, { type: 'pong' });
      }
    });
  }
};
```

## 插件生命周期

```
加载阶段：
   ↓
验证插件（name, version）
   ↓
检查是否已加载
   ↓
创建插件上下文
   ↓
注册插件命令
   ↓
调用 init()
   ↓
存储插件和上下文
   ↓
触发 plugin:loaded 事件
   ↓
[插件运行中]
   ↓
卸载阶段：
   ↓
触发 plugin:{name}:unload 事件
   ↓
调用 destroy()
   ↓
注销插件命令
   ↓
清理事件监听器
   ↓
移除消息处理器
   ↓
删除存储
   ↓
触发 plugin:unloaded 事件
```

## 插件最佳实践

### 1. 命名规范

```typescript
// 好的命名
const myPlugin: Plugin = {
  name: 'my-feature',      // kebab-case
  version: '1.0.0',        // 语义化版本
  // ...
};

// 避免冲突
const companyFeaturePlugin: Plugin = {
  name: '@company/feature',  // 作用域命名
  // ...
};
```

### 2. 错误处理

```typescript
const robustPlugin: Plugin = {
  name: 'robust',
  version: '1.0.0',
  init: (context) => {
    try {
      // 可能出错的代码
      riskyOperation();
    } catch (error) {
      console.error('[robust] Init failed:', error);
      // 不要抛出错误，让插件继续加载
    }
  },
  destroy: () => {
    try {
      cleanup();
    } catch (error) {
      console.error('[robust] Cleanup failed:', error);
    }
  }
};
```

### 3. 资源清理

```typescript
const cleanPlugin: Plugin = {
  name: 'clean',
  version: '1.0.0',
  init: (context) => {
    // 保存取消函数
    const unsubscribe = context.on('event', handler);
    const intervalId = setInterval(() => {
      // 定期任务
    }, 1000);

    // 在destroy中清理
    context.cleanup = () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  },
  destroy: function() {
    // 执行清理
    (this as any).cleanup?.();
  }
};
```

### 4. 版本兼容

```typescript
const compatiblePlugin: Plugin = {
  name: 'compatible',
  version: '1.0.0',
  init: (context) => {
    const config = context.getConfig();

    // 检查配置版本
    if (!config.enablePlugins) {
      console.warn('[compatible] Plugins are disabled');
      return;
    }

    // 检查API版本
    if (typeof context.registerCommand !== 'function') {
      console.error('[compatible] Incompatible API version');
      return;
    }

    // 正常初始化
    // ...
  }
};
```

## 插件示例仓库

### 示例1：计数器插件

```typescript
const counterPlugin: Plugin = {
  name: 'counter',
  version: '1.0.0',
  description: 'Simple counter command',

  commands: [{
    id: 'count',
    name: 'count',
    description: 'Count from 1 to N',
    acceptsArgs: true,
    component: () => import('./CountCommand'),
  }]
};
```

### 示例2：时间插件

```typescript
const timePlugin: Plugin = {
  name: 'time',
  version: '1.0.0',
  description: 'Display current time',

  commands: [{
    id: 'time',
    name: 'time',
    description: 'Show current time',
    category: 'info',
    component: () => import('./TimeCommand'),
  }]
};
```

### 示例3：提醒插件

```typescript
const reminderPlugin: Plugin = {
  name: 'reminder',
  version: '1.0.0',
  description: 'Set reminders',

  init: (context) => {
    context.on('reminder:add', (data) => {
      const { message, delay } = data as { message: string, delay: number };
      setTimeout(() => {
        context.emit('notification', { message });
      }, delay);
    });
  },

  commands: [{
    id: 'remind',
    name: 'remind',
    description: 'Set a reminder',
    acceptsArgs: true,
    component: () => import('./RemindCommand'),
  }]
};
```
