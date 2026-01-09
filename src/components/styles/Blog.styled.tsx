/**
 * 博客 TUI 组件样式定义
 * 类 Claude Code /status 风格
 */

import styled, { css, keyframes } from "styled-components";

// 全屏容器
export const BlogContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0d1117;
  color: #c9d1d9;
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.5;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// 顶部菜单栏
export const MenuBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  gap: 24px;
  flex-shrink: 0;
`;

export const MenuItem = styled.button<{ $isActive?: boolean }>`
  background: ${(props) =>
    props.$isActive ? "#238636" : "transparent"};
  color: ${(props) =>
    props.$isActive ? "#ffffff" : "#8b949e"};
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$isActive ? "#238636" : "#21262d"};
    color: #c9d1d9;
  }
`;

// 分类 Tab 导航
export const TabContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #0d1117;
  border-bottom: 1px solid #21262d;
  gap: 4px;
  flex-shrink: 0;
`;

export const Tab = styled.button<{ $isActive?: boolean }>`
  background: ${(props) =>
    props.$isActive ? "#1f6feb" : "transparent"};
  color: ${(props) =>
    props.$isActive ? "#ffffff" : "#8b949e"};
  border: 1px solid
    ${(props) => (props.$isActive ? "#1f6feb" : "transparent")};
  padding: 6px 14px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: 4px;

  &:hover {
    background: ${(props) =>
      props.$isActive ? "#1f6feb" : "#21262d"};
    color: #c9d1d9;
  }
`;

export const TabBadge = styled.span`
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 6px;
`;

// 主内容区域
export const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

// 搜索栏
export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 13px;

  &::placeholder {
    color: #484f58;
  }

  &:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
  }
`;

// 文章列表
export const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const PostItem = styled.div<{ $isSelected?: boolean }>`
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
  border: 1px solid
    ${(props) => (props.$isSelected ? "#58a6ff" : "transparent")};
  background: ${(props) =>
    props.$isSelected
      ? "rgba(88, 166, 255, 0.1)"
      : "transparent"};
  margin-bottom: 2px;

  &:hover {
    background: ${(props) =>
      props.$isSelected
        ? "rgba(88, 166, 255, 0.1)"
        : "#161b22"};
  }
`;

export const PostTitle = styled.div`
  color: #c9d1d9;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
`;

export const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8b949e;
  font-size: 12px;
`;

export const PostLabel = styled.span<{ $color?: string }>`
  background: ${(props) =>
    props.$color
      ? `rgba(${parseInt(props.$color.slice(1, 3), 16)}, ${parseInt(props.$color.slice(3, 5), 16)}, ${parseInt(props.$color.slice(5, 7), 16)}, 0.15)`
      : "#21262d"};
  color: ${(props) => props.$color || "#58a6ff"};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

// 分割线
export const Divider = styled.div`
  height: 1px;
  background: #21262d;
  margin: 12px 0;
`;

// 文章详情头部
export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #21262d;
`;

export const BackButton = styled.button`
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: #21262d;
    color: #c9d1d9;
  }
`;

export const OpenLinkButton = styled.a`
  background: #238636;
  color: #ffffff;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.15s ease;

  &:hover {
    background: #2ea043;
  }
`;

// 文章详情标题
export const ArticleTitle = styled.h1`
  color: #c9d1d9;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

export const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #8b949e;
  font-size: 13px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 文章内容（Markdown 渲染）
export const ArticleContent = styled.div`
  color: #c9d1d9;
  font-size: 14px;
  line-height: 1.7;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #c9d1d9;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  h1 {
    font-size: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid #21262d;
  }

  h2 {
    font-size: 18px;
  }

  p {
    margin: 12px 0;
  }

  a {
    color: #58a6ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  code {
    background: #21262d;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: "SF Mono", "Fira Code", Consolas, monospace;
  }

  pre {
    background: #161b22;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;

    code {
      background: transparent;
      padding: 0;
    }
  }

  ul,
  ol {
    padding-left: 24px;
    margin: 12px 0;
  }

  li {
    margin: 4px 0;
  }

  blockquote {
    border-left: 3px solid #30363d;
    padding-left: 16px;
    margin: 16px 0;
    color: #8b949e;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;

    th,
    td {
      border: 1px solid #30363d;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #161b22;
      font-weight: 600;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #21262d;
    margin: 24px 0;
  }

  strong {
    color: #c9d1d9;
  }

  em {
    color: #8b949e;
  }
`;

// 底部状态栏
export const StatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #161b22;
  border-top: 1px solid #30363d;
  color: #8b949e;
  font-size: 12px;
  flex-shrink: 0;
`;

export const StatusBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatusBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatusItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 快捷键提示
export const ShortcutHint = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #0d1117;
  border-top: 1px solid #21262d;
  color: #8b949e;
  font-size: 12px;
  flex-shrink: 0;
`;

export const Shortcut = styled.span`
  background: #21262d;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: "SF Mono", "Fira Code", Consolas, monospace;
  font-size: 11px;
  margin-right: 4px;
`;

// 加载状态
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8b949e;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #21262d;
  border-top-color: #58a6ff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 12px;
`;

export const LoadingText = styled.div`
  font-size: 13px;
`;

// 错误状态
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #f85149;
  text-align: center;
  padding: 16px;
`;

export const ErrorIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

export const ErrorText = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
`;

export const RetryButton = styled.button`
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  margin-top: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: #30363d;
  }
`;

// 空状态
export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8b949e;
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

export const EmptyText = styled.div`
  font-size: 14px;
`;

// 统计信息
export const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #21262d;
`;

export const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 页码导航
export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #21262d;
`;

export const PageButton = styled.button<{ $isActive?: boolean }>`
  background: ${(props) =>
    props.$isActive ? "#1f6feb" : "transparent"};
  color: ${(props) =>
    props.$isActive ? "#ffffff" : "#8b949e"};
  border: 1px solid
    ${(props) => (props.$isActive ? "#1f6feb" : "#30363d")};
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$isActive ? "#1f6feb" : "#21262d"};
    color: #c9d1d9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageInfo = styled.span`
  color: #8b949e;
  font-size: 12px;
  padding: 0 8px;
`;
