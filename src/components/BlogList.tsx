import { useEffect, useState } from "react";
import { BLOG_CONFIG } from "../config/blog";
import { useBlogData } from "../hooks/useBlogData";
import { POSTS_PER_PAGE } from "../hooks/useGitHubIssues";
import { calculateCategoryStats, formatDate } from "../utils/github";
import {
  ArticleList,
  BrowseAction,
  BrowseHeading,
  BrowseState,
  CategoryBar,
  CategorySelect,
  ListFooter,
} from "./styles/Mobile.styled";
const LIST_KEY = "foxiv-blog-list-v1";
function readListState(): { category: string; count: number } {
  try {
    const value = JSON.parse(sessionStorage.getItem(LIST_KEY) || "null");
    if (
      typeof value?.category === "string" &&
      Number.isSafeInteger(value?.count) &&
      value.count >= POSTS_PER_PAGE
    ) {
      return { category: value.category, count: Math.min(value.count, 10000) };
    }
  } catch {
    /* Start with the default filter if storage is unavailable. */
  }
  return { category: "All", count: POSTS_PER_PAGE };
}

export default function BlogList({
  follow,
}: {
  follow: import("../hooks/useBrowseNavigation").BrowseNavigation["follow"];
}) {
  const { posts, loading, error, refresh } = useBlogData(BLOG_CONFIG);
  const categoryStats = calculateCategoryStats(posts);
  const [list, setList] = useState(readListState);
  const filtered =
    list.category === "All"
      ? posts
      : posts.filter(post => post.labels.includes(list.category));
  const visible = filtered.slice(0, list.count);
  useEffect(() => {
    try {
      sessionStorage.setItem(LIST_KEY, JSON.stringify(list));
    } catch {
      /* Storage may be disabled. */
    }
  }, [list]);

  return (
    <section aria-label="Blog posts" data-testid="browse-blog-list">
      <BrowseHeading>
        <h1>Blog</h1>
        <p>Interview notes, technical writing, and a few thoughts.</p>
      </BrowseHeading>
      <CategoryBar>
        <label htmlFor="blog-category">Category</label>
        <CategorySelect>
          <select
            id="blog-category"
            value={list.category}
            onChange={event => {
              setList({
                category: event.target.value,
                count: POSTS_PER_PAGE,
              });
              window.scrollTo(0, 0);
            }}
          >
            {categoryStats.map(category => (
              <option key={category.name} value={category.name}>
                {category.name === "All" ? "All posts" : category.name} ·{" "}
                {category.count}
              </option>
            ))}
          </select>
        </CategorySelect>
      </CategoryBar>
      {loading && posts.length === 0 ? (
        <BrowseState role="status">Loading posts…</BrowseState>
      ) : error && posts.length === 0 ? (
        <BrowseState>
          <p role="alert">Unable to load posts. Please try again.</p>
          <BrowseAction type="button" onClick={() => void refresh()}>
            [retry]
          </BrowseAction>
        </BrowseState>
      ) : (
        <>
          <ArticleList>
            {visible.map(item => (
              <a
                key={item.id}
                href={`#/blogs/${item.number}`}
                onClick={event => follow(event, `#/blogs/${item.number}`)}
              >
                <h2>
                  <span aria-hidden="true">›</span>
                  {item.title}
                </h2>
                <p>
                  <time dateTime={item.createdAt}>
                    {formatDate(item.createdAt)}
                  </time>{" "}
                  ·{" "}
                  {item.labels
                    .filter(label => label.toLowerCase() !== "blog")
                    .join(" / ") || "Post"}
                </p>
              </a>
            ))}
          </ArticleList>
          <ListFooter>
            {visible.length < filtered.length ? (
              <BrowseAction
                type="button"
                onClick={() =>
                  setList(previous => ({
                    ...previous,
                    count: previous.count + POSTS_PER_PAGE,
                  }))
                }
              >
                [ Load more ↓ ]
              </BrowseAction>
            ) : (
              <p>
                {filtered.length
                  ? "— You’re all caught up —"
                  : "No posts in this category yet."}
              </p>
            )}
            <p role="status">
              Showing {visible.length} of {filtered.length}
            </p>
          </ListFooter>
          {error && (
            <p role="alert">
              Unable to refresh posts. Showing previously loaded content.
            </p>
          )}
        </>
      )}
    </section>
  );
}
