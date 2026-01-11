/**
 * Blog Command
 * Displays blog posts from GitHub Issues with search, filtering, and pagination
 */

import { useContext, useEffect, useCallback } from "react";
import { termContext } from "../../components/Terminal";
import { useGitHubIssues } from "../../hooks/useGitHubIssues";
import type { GitHubConfig } from "../../types/github";
import {
  BlogContainer,
  BlogIntro,
  SearchBar,
  SearchInput,
  RefreshButton,
  CategoryTabs,
  CategoryTab,
  BlogList,
  BlogPostCard,
  PostHeader,
  PostNumber,
  PostTitle,
  PostMeta,
  PostExcerpt,
  PostLabels,
  PostLabel,
  Pagination,
  PageInfo,
  NavButtons,
  NavButton,
  EmptyState,
  Link,
  Cmd,
  LoadingDots,
  StatusText,
} from "../../components/styles/Commands.styled";
import { formatRelativeTime } from "../../utils/github";

const BLOG_CONFIG: GitHubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "parallelarc",
  repo: import.meta.env.VITE_GITHUB_BLOG_REPO || "blog",
  token: import.meta.env.VITE_GITHUB_TOKEN,
  // Optional: filter by label (set in .env as VITE_GITHUB_BLOG_LABEL)
  labels: import.meta.env.VITE_GITHUB_BLOG_LABEL
    ? [import.meta.env.VITE_GITHUB_BLOG_LABEL]
    : undefined,
};

const REPO_URL = `https://github.com/${BLOG_CONFIG.owner}/${BLOG_CONFIG.repo}`;

function Blog() {
  const { arg } = useContext(termContext);

  const {
    posts,
    loading,
    error,
    listState,
    categoryStats,
    refresh,
    setActiveCategory,
    setSearchQuery,
    nextPage,
    prevPage,
  } = useGitHubIssues(BLOG_CONFIG);

  // Support command-line arguments: `blog search term` or `blog tag:xxx`
  useEffect(() => {
    if (arg.length > 0) {
      const searchTerm = arg.join(" ");
      if (searchTerm.startsWith("tag:")) {
        setActiveCategory(searchTerm.slice(4));
      } else {
        setSearchQuery(searchTerm);
      }
    }
  }, [arg, setActiveCategory, setSearchQuery]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
    },
    [setActiveCategory]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <BlogContainer data-testid="blog">
        <StatusText>
          <LoadingDots>Loading posts</LoadingDots>
        </StatusText>
      </BlogContainer>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <BlogContainer data-testid="blog">
        <StatusText $variant="error">Error: {error}</StatusText>
      </BlogContainer>
    );
  }

  const currentPosts = listState.filteredPosts;
  const { currentPage, totalPages, searchQuery } = listState;
  const startIndex = (currentPage - 1) * 10;

  return (
    <BlogContainer data-testid="blog">
      <BlogIntro>
        Thoughts, notes, and explorations.{" "}
        <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
          View repository
        </Link>
        .
      </BlogIntro>

      {/* Search Bar */}
      <SearchBar>
        <Cmd>/</Cmd>
        <SearchInput
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          {loading ? "..." : "Refresh"}
        </RefreshButton>
      </SearchBar>

      {/* Category Tabs */}
      {categoryStats.length > 1 && (
        <CategoryTabs>
          {categoryStats.map((cat) => (
            <CategoryTab
              key={cat.name}
              $active={cat.name === listState.activeCategory}
              onClick={() => handleCategoryChange(cat.name)}
            >
              {cat.name} ({cat.count})
            </CategoryTab>
          ))}
        </CategoryTabs>
      )}

      {/* Error message (non-blocking) */}
      {error && (
        <StatusText $variant="error" style={{ marginBottom: "1rem" }}>
          {error}
        </StatusText>
      )}

      {/* Blog Posts */}
      <BlogList>
        {currentPosts.length === 0 ? (
          <EmptyState>
            {posts.length === 0
              ? "No blog posts found. Check your GitHub repository configuration."
              : "No posts match your search criteria."}
          </EmptyState>
        ) : (
          currentPosts.map((post, index) => (
            <BlogPostCard key={post.id}>
              <PostHeader>
                <PostNumber>{startIndex + index + 1}.</PostNumber>
                <PostTitle
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post.title}
                </PostTitle>
              </PostHeader>
              <PostMeta>
                <span>{formatRelativeTime(post.createdAt)}</span>
                {post.commentsCount > 0 && (
                  <span>· 💬 {post.commentsCount} comments</span>
                )}
              </PostMeta>
              {post.excerpt && <PostExcerpt>{post.excerpt}</PostExcerpt>}
              {post.labels.length > 0 && (
                <PostLabels>
                  {post.labels.map((label) => (
                    <PostLabel key={label}>{label}</PostLabel>
                  ))}
                </PostLabels>
              )}
            </BlogPostCard>
          ))
        )}
      </BlogList>

      {/* Pagination */}
      {totalPages > 1 && currentPosts.length > 0 && (
        <Pagination>
          <PageInfo>
            Page {currentPage} of {totalPages} · {currentPosts.length} posts
          </PageInfo>
          <NavButtons>
            <NavButton
              $disabled={currentPage === 1}
              onClick={prevPage}
              aria-label="Previous page"
            >
              ← Prev
            </NavButton>
            <NavButton
              $disabled={currentPage === totalPages}
              onClick={nextPage}
              aria-label="Next page"
            >
              Next →
            </NavButton>
          </NavButtons>
        </Pagination>
      )}
    </BlogContainer>
  );
}

export default Blog;
