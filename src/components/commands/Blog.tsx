/**
 * 博客 TUI 组件
 * 类 Claude Code /status 风格的交互式博客界面
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ReactMarkdown from "react-markdown";
import { useGitHubIssues } from "../../hooks/useGitHubIssues";
import type { BlogPost, BlogView } from "../../types/github";
import {
  formatDate,
  formatRelativeTime,
} from "../../utils/github";
import {
  BlogContainer,
  MenuBar,
  MenuItem,
  TabContainer,
  Tab,
  TabBadge,
  MainContent,
  SearchContainer,
  SearchInput,
  PostList,
  PostItem,
  PostTitle,
  PostMeta,
  PostLabel,
  Divider,
  DetailHeader,
  BackButton,
  OpenLinkButton,
  ArticleTitle,
  ArticleMeta,
  MetaItem,
  ArticleContent,
  StatusBar,
  StatusBarLeft,
  StatusBarRight,
  StatusItem,
  ShortcutHint,
  Shortcut,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorText,
  RetryButton,
  EmptyContainer,
  EmptyIcon,
  EmptyText,
  StatsContainer,
  StatItem,
  Pagination,
  PageButton,
  PageInfo,
} from "../styles/Blog.styled";

// GitHub 配置
// Token 可通过环境变量 VITE_GITHUB_TOKEN 设置（推荐）
// 获取 Token: https://github.com/settings/tokens
const GITHUB_CONFIG = {
  owner: "parallelarc",
  repo: "parallelarc.github.io",
  token: import.meta.env.VITE_GITHUB_TOKEN || undefined,
  labels: ["blog"],
};

// 菜单项配置
const MENU_ITEMS = [
  { id: "blog", label: "Blog", shortcut: "1" },
  { id: "posts", label: "Posts", shortcut: "2" },
  { id: "search", label: "Search", shortcut: "3" },
  { id: "config", label: "Config", shortcut: "4" },
  { id: "usage", label: "Usage", shortcut: "5" },
];

// 获取标签颜色
const getLabelColor = (labelName: string): string => {
  const colors: Record<string, string> = {
    技术: "#1f6feb",
    tech: "#1f6feb",
    生活: "#3fb950",
    life: "#3fb950",
    笔记: "#a371f7",
    notes: "#a371f7",
    默认: "#8b949e",
  };
  return colors[labelName] || colors["默认"];
};

// 格式化分类显示名称
const formatCategoryName = (name: string): string => {
  const displayNames: Record<string, string> = {
    All: "All Posts",
    技术: "技术",
    tech: "Tech",
    生活: "生活",
    life: "Life",
    笔记: "笔记",
    notes: "Notes",
  };
  return displayNames[name] || name;
};

// 加载状态组件
const LoadingView: React.FC = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>Loading blog posts...</LoadingText>
  </LoadingContainer>
);

// 错误状态组件
const ErrorView: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <ErrorContainer>
    <ErrorIcon>X</ErrorIcon>
    <ErrorText>{error}</ErrorText>
    <RetryButton onClick={onRetry}>Retry</RetryButton>
  </ErrorContainer>
);

// 空状态组件
const EmptyView: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <EmptyContainer>
    <EmptyIcon>📝</EmptyIcon>
    <EmptyText>
      {searchQuery
        ? `No posts found for "${searchQuery}"`
        : "No blog posts yet"}
    </EmptyText>
  </EmptyContainer>
);

// 文章列表视图
const PostListView: React.FC<{
  posts: BlogPost[];
  selectedIndex: number;
  categoryStats: { name: string; count: number; isActive: boolean }[];
  activeCategory: string;
  searchQuery: string;
  onSelectCategory: (category: string) => void;
  onSelectPost: (post: BlogPost) => void;
  onSearchChange: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  currentPage: number;
  totalPages: number;
}> = ({
  posts,
  selectedIndex,
  categoryStats,
  activeCategory,
  searchQuery,
  onSelectCategory,
  onSelectPost,
  onSearchChange,
  onNext,
  onPrev,
  currentPage,
  totalPages,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  // 聚焦搜索框
  useEffect(() => {
    const handleSlash = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleSlash);
    return () => document.removeEventListener("keydown", handleSlash);
  }, []);

  return (
    <>
      {/* 分类 Tab */}
      <TabContainer>
        {categoryStats.map((stat) => (
          <Tab
            key={stat.name}
            $isActive={stat.name === activeCategory}
            onClick={() => onSelectCategory(stat.name)}
          >
            {formatCategoryName(stat.name)}
            <TabBadge>{stat.count}</TabBadge>
          </Tab>
        ))}
      </TabContainer>

      <MainContent>
        {/* 搜索栏 */}
        <SearchContainer>
          <SearchInput
            ref={searchRef}
            type="text"
            placeholder="Search posts... (press / to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchContainer>

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <>
            <PostList>
              {posts.map((post, index) => (
                <PostItem
                  key={post.id}
                  $isSelected={index === selectedIndex}
                  onClick={() => onSelectPost(post)}
                >
                  <PostTitle>
                    {post.labels.length > 0 && (
                      <PostLabel
                        $color={getLabelColor(post.labels[0])}
                        style={{ marginRight: 8 }}
                      >
                        {post.labels[0]}
                      </PostLabel>
                    )}
                    {post.title}
                  </PostTitle>
                  <PostMeta>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                    <span>•</span>
                    <span>{post.commentsCount} comments</span>
                  </PostMeta>
                </PostItem>
              ))}
            </PostList>

            {/* 分页 */}
            {totalPages > 1 && (
              <Pagination>
                <PageButton
                  onClick={onPrev}
                  disabled={currentPage <= 1}
                >
                  Prev
                </PageButton>
                <PageInfo>
                  {currentPage} / {totalPages}
                </PageInfo>
                <PageButton
                  onClick={onNext}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </PageButton>
              </Pagination>
            )}

            {/* 统计信息 */}
            <StatsContainer>
              {categoryStats.slice(1).map((stat) => (
                <StatItem key={stat.name}>
                  <PostLabel $color={getLabelColor(stat.name)}>
                    {formatCategoryName(stat.name)}
                  </PostLabel>
                  <span>{stat.count}</span>
                </StatItem>
              ))}
            </StatsContainer>
          </>
        ) : (
          <EmptyView searchQuery={searchQuery} />
        )}
      </MainContent>
    </>
  );
};

// 文章详情视图
const PostDetailView: React.FC<{
  post: BlogPost;
  onBack: () => void;
}> = ({ post, onBack }) => {
  // ESC 返回
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onBack]);

  return (
    <MainContent>
      {/* 头部 */}
      <DetailHeader>
        <BackButton onClick={onBack}>← Back</BackButton>
        <OpenLinkButton
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in GitHub
        </OpenLinkButton>
      </DetailHeader>

      {/* 标题 */}
      <ArticleTitle>{post.title}</ArticleTitle>

      {/* 元信息 */}
      <ArticleMeta>
        <MetaItem>
          <span>By</span>
          <a
            href={post.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#58a6ff", marginLeft: 4 }}
          >
            {post.author}
          </a>
        </MetaItem>
        <MetaItem>{formatDate(post.createdAt)}</MetaItem>
        <MetaItem>{post.commentsCount} comments</MetaItem>
      </ArticleMeta>

      {/* 标签 */}
      {post.labels.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          {post.labels.map((label) => (
            <PostLabel key={label} $color={getLabelColor(label)}>
              {label}
            </PostLabel>
          ))}
        </div>
      )}

      <Divider />

      {/* 文章内容 */}
      <ArticleContent>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </ArticleContent>
    </MainContent>
  );
};

// 主组件
const Blog: React.FC = () => {
  // 使用自定义 Hook 获取数据
  const {
    posts,
    loading,
    error,
    lastUpdated,
    listState,
    categoryStats,
    refresh,
    setActiveCategory,
    setSearchQuery,
    nextPost,
    prevPost,
    nextPage,
    prevPage,
    selectPost,
    clearSelection,
  } = useGitHubIssues(GITHUB_CONFIG);

  // 视图状态
  const [view, setView] = useState<BlogView>("list");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeMenu, setActiveMenu] = useState("posts");

  // 当前显示的文章列表（根据分页）
  const displayPosts = useMemo(() => {
    const POSTS_PER_PAGE = 10;
    const start = (listState.currentPage - 1) * POSTS_PER_PAGE;
    return listState.filteredPosts.slice(
      start,
      start + POSTS_PER_PAGE
    );
  }, [listState.filteredPosts, listState.currentPage]);

  // 选择文章
  const handleSelectPost = useCallback(
    (post: BlogPost) => {
      setSelectedPost(post);
      setView("detail");
    },
    []
  );

  // 返回列表
  const handleBack = useCallback(() => {
    setView("list");
    setSelectedPost(null);
    clearSelection();
  }, [clearSelection]);

  // 键盘导航
  useEffect(() => {
    if (view !== "list") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          nextPost();
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          prevPost();
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          {
            const currentIndex = categoryStats.findIndex(
              (s) => s.name === listState.activeCategory
            );
            if (
              currentIndex < categoryStats.length - 1
            ) {
              setActiveCategory(categoryStats[currentIndex + 1].name);
            }
          }
          break;
        case "ArrowLeft":
        case "h":
          e.preventDefault();
          {
            const currentIndex = categoryStats.findIndex(
              (s) => s.name === listState.activeCategory
            );
            if (currentIndex > 0) {
              setActiveCategory(categoryStats[currentIndex - 1].name);
            }
          }
          break;
        case "n":
          e.preventDefault();
          nextPage();
          break;
        case "p":
          e.preventDefault();
          prevPage();
          break;
        case "Enter":
          e.preventDefault();
          if (displayPosts[listState.selectedIndex]) {
            handleSelectPost(displayPosts[listState.selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleBack();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [
    view,
    listState.selectedIndex,
    listState.activeCategory,
    displayPosts,
    categoryStats,
    nextPost,
    prevPost,
    nextPage,
    prevPage,
    setActiveCategory,
    handleSelectPost,
    handleBack,
  ]);

  // 渲染加载状态
  if (loading) {
    return (
      <BlogContainer>
        <LoadingView />
      </BlogContainer>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <BlogContainer>
        <ErrorView error={error} onRetry={refresh} />
      </BlogContainer>
    );
  }

  return (
    <BlogContainer>
      {/* 顶部菜单栏 */}
      <MenuBar>
        {MENU_ITEMS.map((item) => (
          <MenuItem
            key={item.id}
            $isActive={activeMenu === item.id}
            onClick={() => setActiveMenu(item.id)}
          >
            {item.label}
            {item.shortcut && (
              <span style={{ marginLeft: 8, opacity: 0.6 }}>
                ({item.shortcut})
              </span>
            )}
          </MenuItem>
        ))}
      </MenuBar>

      {/* 根据视图显示不同内容 */}
      {view === "detail" && selectedPost ? (
        <PostDetailView post={selectedPost} onBack={handleBack} />
      ) : (
        <PostListView
          posts={displayPosts}
          selectedIndex={listState.selectedIndex}
          categoryStats={categoryStats}
          activeCategory={listState.activeCategory}
          searchQuery={listState.searchQuery}
          onSelectCategory={setActiveCategory}
          onSelectPost={handleSelectPost}
          onSearchChange={setSearchQuery}
          onNext={nextPost}
          onPrev={prevPost}
          currentPage={listState.currentPage}
          totalPages={listState.totalPages}
        />
      )}

      {/* 底部状态栏 */}
      <StatusBar>
        <StatusBarLeft>
          <StatusItem>
            Total: {posts.length} posts
          </StatusItem>
          <StatusItem>
            Updated:{" "}
            {lastUpdated
              ? formatRelativeTime(lastUpdated.toISOString())
              : "never"}
          </StatusItem>
        </StatusBarLeft>
        <StatusBarRight>
          <StatusItem>blog</StatusItem>
        </StatusBarRight>
      </StatusBar>

      {/* 快捷键提示 */}
      {view === "list" && (
        <ShortcutHint>
          <span>
            <Shortcut>↑</Shortcut>
            <Shortcut>↓</Shortcut>
            Navigate
          </span>
          <span>
            <Shortcut>←</Shortcut>
            <Shortcut>→</Shortcut>
            Categories
          </span>
          <span>
            <Shortcut>Enter</Shortcut>
            Read
          </span>
          <span>
            <Shortcut>/</Shortcut>
            Search
          </span>
          <span>
            <Shortcut>Esc</Shortcut>
            Back
          </span>
        </ShortcutHint>
      )}

      {view === "detail" && (
        <ShortcutHint>
          <span>
            <Shortcut>Esc</Shortcut>
            Back
          </span>
          <span>
            <Shortcut>/</Shortcut>
            Search
          </span>
        </ShortcutHint>
      )}
    </BlogContainer>
  );
};

export default Blog;
