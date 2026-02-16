# 计划：让 AI 助手依赖网站实际文本内容

## 背景

目前 AI 助手使用预设的提示词（`aiPersona.ts` 和 `websiteMemory.ts`），内容是手动维护的简短摘要。用户希望 AI 使用网站上实际的文本内容。

## 实现方案

### 核心思路

1. **数据与 UI 分离** - 从现有 React 组件中提取数据到独立文件
2. **构建时生成** - 所有内容在构建时处理，无需运行时获取
3. **Token 感知** - 根据模型限制自动截断内容

### 文件变更

#### 新建文件
```
src/utils/content/
├── types.ts           # TypeScript 类型定义
├── contextBuilder.ts  # 上下文格式化（核心）

src/commands/
├── about/data.ts      # About 数据
├── projects/data.ts   # Projects 数据
├── contact/data.ts    # Contact 数据
└── education/data.ts # Education 数据
```

#### 修改文件
```
src/commands/ai/index.tsx  # 使用动态上下文替代 WEBSITE_MEMORY_PROMPT
```

### 实现步骤

**Step 1: 提取数据文件**
- 创建 `src/commands/*/data.ts` 文件
- 将现有硬编码数据迁移过去
- 修改组件从 data.ts 导入

**Step 2: 创建上下文构建器**
- `contextBuilder.ts` - 将所有内容格式化为 AI 上下文
- Token 限制策略：总共 ~3100 tokens
- Blog 包含标题 + 标签

**Step 3: 集成到 AI 命令**
- 替换 `WEBSITE_MEMORY_PROMPT` 为动态生成的上下文

### Token 预算

| 内容 | 预算 |
|------|------|
| About | ~500 tokens |
| Projects | ~1500 tokens |
| Contact | ~300 tokens |
| Education | ~300 tokens |
| Blog (标题 + 标签) | ~500 tokens |
| **总计** | ~3100 tokens |

### 验证方式

1. 运行 `npm run dev` 启动开发服务器
2. 验证 AI 回答使用的是网站上的实际内容

---

**状态：** 等待用户批准执行
