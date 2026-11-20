import { useEffect, useLayoutEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "../types/github";
import { fetchBlogContent, formatDate } from "../utils/github";
import {
  ArticleBody,
  BrowseAction,
  ReaderFooter,
  ReaderHeader,
} from "./styles/Mobile.styled";

type Props = {
  post: BlogPost;
  onBack: () => void;
  onReady: () => void;
  onRefresh?: () => Promise<void>;
};

function ArticleReader({ post, onBack, onReady, onRefresh }: Props) {
  const [content, setContent] = useState<string | null>(
    post.contentUrl ? null : post.content
  );
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    setContent(post.contentUrl ? null : post.content);
    void fetchBlogContent(post)
      .then(body => {
        if (active) setContent(body);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [post, attempt]);
  useLayoutEffect(() => {
    if (content !== null) onReady();
  }, [content, onReady]);
  const [copyStatus, setCopyStatus] = useState("");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Copy the link from your browser’s address bar.");
    }
  };

  return (
    <article data-testid="article-reader" lang="zh-CN">
      <ReaderHeader>
        <div>
          <BrowseAction type="button" onClick={onBack}>
            ← Back to blog
          </BrowseAction>
          <BrowseAction type="button" onClick={() => void copyLink()}>
            Copy link
          </BrowseAction>
        </div>
        <h1>{post.title}</h1>
        <p>
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> ·{" "}
          {post.labels
            .filter(label => label.toLowerCase() !== "blog")
            .join(" / ") || "Post"}
        </p>
        {copyStatus && <p role="status">{copyStatus}</p>}
      </ReaderHeader>
      {error ? (
        <div>
          <p role="alert">Unable to load this article. Please try again.</p>
          <BrowseAction
            type="button"
            onClick={() =>
              void (async () => {
                await onRefresh?.();
                setAttempt(value => value + 1);
              })()
            }
          >
            [retry]
          </BrowseAction>
        </div>
      ) : content === null ? (
        <p role="status">Loading article…</p>
      ) : (
        <ArticleBody>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, id, title }) => (
                <a
                  id={id}
                  title={title}
                  href={href}
                  target={href?.startsWith("#") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={event => {
                    if (href?.startsWith("#")) {
                      event.preventDefault();
                      const id = href.slice(1);
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ block: "start" });
                    }
                  }}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt, title, width, height }) => (
                <img
                  src={src}
                  alt={alt}
                  title={title}
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </ArticleBody>
      )}
      <ReaderFooter>
        <BrowseAction type="button" onClick={onBack}>
          ← Back to blog
        </BrowseAction>
        <BrowseAction
          as="a"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub ↗
        </BrowseAction>
      </ReaderFooter>
    </article>
  );
}

export default ArticleReader;
