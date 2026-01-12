# 样式系统

## 概述

项目使用 styled-components 实现 CSS-in-JS 样式，支持6种预设主题。

---

## 主题定义

**文件**: `src/components/styles/themes.ts`

### 主题列表

| ID | 名称 | 主色调 | 辅助色 | 背景 |
|----|------|--------|--------|------|
| T_001 | dark | #05CE91 | #FF9D00 | #1D2A35 |
| T_002 | light | #027474 | #FF9D00 | #EFF3F3 |
| T_003 | blue-matrix | #00ff9c | #60fdff | #101116 |
| T_004 | espresso | #E1E48B | #A5C260 | #323232 |
| T_005 | green-goblin | #E5E500 | #04A500 | #000000 |
| T_006 | ubuntu | #80D932 | #80D932 | #2D0922 |

### 主题结构

```typescript
interface Theme {
  id: string
  name: string
  colors: {
    body: string              // 页面背景
    bg: string                // 滚动条背景
    scrollHandle: string      // 滚动条滑块
    scrollHandleHover: string // 滚动条悬停
    primary: string           // 主色（提示符、链接等）
    secondary: string         // 辅助色
    accent: string            // 强调色
    text: {
      100: string             // 主要文本
      200: string             // 次要文本
      300: string             // 暗淡文本
      400: string             // 透明文本（占位符）
    }
  }
}
```

### 主题颜色表

#### Dark 主题

```typescript
{
  body: "#1D2A35",
  bg: "#1D2A35",
  primary: "#05CE91",
  secondary: "#FF9D00",
  accent: "#B794F6",
  text: {
    100: "#cbd5e1",
    200: "#B2BDCC",
    300: "#64748b",
    400: "rgba(255, 255, 255, 0.35)"
  }
}
```

#### Light 主题

```typescript
{
  body: "#EFF3F3",
  bg: "#EFF3F3",
  primary: "#027474",
  secondary: "#FF9D00",
  accent: "#B794F6",
  text: {
    100: "#334155",
    200: "#475569",
    300: "#64748b",
    400: "rgba(0, 0, 0, 0.35)"
  }
}
```

#### Blue-Matrix 主题

```typescript
{
  body: "#101116",
  bg: "#101116",
  primary: "#00ff9c",
  secondary: "#60fdff",
  accent: "#B794F6",
  text: {
    100: "#ffffff",
    200: "#c7c7c7",
    300: "#76ff9f",
    400: "rgba(255, 255, 255, 0.35)"
  }
}
```

---

## 全局样式

**文件**: `src/components/styles/GlobalStyle.tsx`

使用 `styled-normalize` 进行CSS重置：

```typescript
const GlobalStyle = createGlobalStyle<{ theme: DefaultTheme }>`
  ${normalize}

  *, ::before, ::after {
    border-width: 0;
    border-style: solid;
    border-color: theme('borderColor.DEFAULT', currentColor);
  }

  body {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    background-color: ${({ theme }) => theme.colors?.body};
    color: ${({ theme }) => theme.colors?.text[100]};
  }

  /* 隐藏滚动条 */
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  /* 输入框样式 */
  input[type=text] {
    background-color: ${({ theme }) => theme.colors?.body};
    color: ${({ theme }) => theme.colors?.text[100]};
    caret-color: ${({ theme }) => theme.colors?.primary};
  }

  /* 屏幕阅读器辅助类 */
  .sr-only {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;
```

---

## 关键样式组件

### CursorChar - 块状光标

反色显示光标字符：

```typescript
export const CursorChar = styled.span`
  background-color: ${({ theme }) => theme.colors?.text[100]};
  color: ${({ theme }) => theme.colors?.body};
  display: inline-block;
  min-width: 0.6em;
  text-align: center;
`;
```

### RainbowText - 彩虹文字

用于欢迎页面的渐变动画文字：

```typescript
const rainbowShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const RainbowText = styled.p`
  background: linear-gradient(
    120deg,
    #ff6b6b, #f7b733, #51cf66, #1e90ff, #845ef7
  );
  background-size: 280% 280%;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${rainbowShift} 12s ease infinite;
`;
```

### CopyToast - 复制提示

带动画的浮动提示：

```typescript
export const CopyToast = styled.div`
  position: fixed;
  top: 0.85rem;
  right: clamp(1rem, 4vw, 2.5rem);
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors?.primary};
  color: ${({ theme }) => theme.colors?.text[100]};
  animation: fadeSlide 2.6s ease forwards;

  @keyframes fadeSlide {
    0% { opacity: 0; transform: translateY(-6px); }
    8% { opacity: 1; transform: translateY(0); }
    92% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-6px); }
  }
`;
```

### Lightbox - 灯箱效果

```typescript
export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
  animation: fadeIn 0.3s ease;
`;

export const LightboxImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.4rem;
  animation: zoomIn 0.3s ease;
  cursor: default;
`;
```

---

## TUI样式组件

Blog命令的TUI模式专用样式：

```typescript
// 统一列表容器
export const TuiUnifiedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

// 焦点指示器
export const TuiFocusIndicator = styled.span<{ $visible?: boolean }>`
  width: 1.2rem;
  color: ${({ theme }) => theme.colors?.accent};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

// 标签
export const TuiTag = styled.span<{ $active?: boolean; $focused?: boolean }>`
  padding: 0 0.25rem;
  border-radius: 2px;
  background: ${({ $active, $focused, theme }) => {
    if ($active && $focused) return theme.colors?.accent;
    return "transparent";
  }};
  color: ${({ $active, $focused, theme }) => {
    if ($active && $focused) return theme.colors?.bg;
    if ($active) return theme.colors?.accent;
    if ($focused) return theme.colors?.accent;
    return theme.colors?.text[100];
  }};
  transition: all 0.15s ease;
`;

// 分页行
export const TuiPaginationRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

// 操作说明
export const TuiInstructions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text[300]};

  span {
    color: ${({ theme }) => theme.colors?.text[200]};
  }
`;
```

---

## 相册样式

Projects命令的图片相册样式：

### 布局系统

支持4种布局模式：

```typescript
export const AlbumGrid = styled.div`
  display: grid;
  gap: 0.6rem;
  flex: 1;

  &.layout-3h {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
  }

  &.layout-3v {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  }

  &.layout-2h1v {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  &.layout-1h2v {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;
```

### 图片项

```typescript
export const AlbumImage = styled(GalleryItem)`
  min-height: 140px;
  cursor: pointer;

  img {
    height: 100%;
  }

  /* 渐变叠加效果 */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(96, 78, 255, 0.25),
      rgba(18, 229, 195, 0.15)
    );
    mix-blend-mode: screen;
    pointer-events: none;
  }

  &:hover img {
    transform: scale(1.05);
    filter: saturate(1);
  }
`;
```

---

## 主题切换

### 在App.tsx中处理

```typescript
// 更新meta标签颜色
useEffect(() => {
  const themeColor = theme.colors?.body;
  if (!themeColor) return;

  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", themeColor);
  document
    .querySelector("meta[name='msapplication-TileColor']")
    ?.setAttribute("content", themeColor);
  document
    .querySelector("link[rel='mask-icon']")
    ?.setAttribute("color", themeColor);
}, [selectedTheme, theme]);
```

### LocalStorage持久化

```typescript
// 保存
setToLS('tsn-theme', theme.name);

// 读取
const localThemeName = getFromLS('tsn-theme');
```

---

## 字体系统

### 主字体

```
IBM Plex Mono
```

### 字重

- Normal: 400
- Medium: 500 (body默认)

### 字体加载

通过Google Fonts或本地引入。

---

## 动画

### 关键帧动画

```typescript
// 脉冲动画
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

// 淡入
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// 缩放进入
const zoomIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;
```

---

## 响应式断点

### 移动端优先

```css
/* 默认移动端样式 */
.Component { ... }

/* 平板及以上 */
@media (min-width: 550px) {
  .Component { ... }
}

/* 桌面 */
@media (min-width: 640px) {
  .Component { ... }
}
```

### 隐藏元素

```css
@media (min-width: 550px) {
  .mobile-only {
    display: none;
  }
}

@media (max-width: 549px) {
  .desktop-only {
    display: none;
  }
}
```
