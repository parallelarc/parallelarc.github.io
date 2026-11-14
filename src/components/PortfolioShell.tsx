import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { BLOG_CONFIG } from "../config/blog";
import { commandRegistry } from "../core/CommandRegistry";
import { useBlogData } from "../hooks/useBlogData";
import type { BrowseNavigation } from "../hooks/useBrowseNavigation";
import BlogList from "./BlogList";
import Welcome from "../commands/welcome";
import About from "../commands/about";
import Contact from "../commands/contact";
import Projects from "../commands/projects";
import Terminal from "./Terminal";
import {
  BrowseAction,
  BrowseHeader,
  BrowseHeading,
  BrowseMain,
  BrowseNav,
  BrowseShell,
  BrowseState,
  MobileHome,
} from "./styles/Mobile.styled";

const ArticleReader = lazy(() => import("./ArticleReader"));
type Props = { navigation: BrowseNavigation; compact: boolean };
const tabs = [
  { path: "#/", label: "Home", command: "home", section: "home" },
  { path: "#/blogs", label: "Blog", command: "blog", section: "blogs" },
  {
    path: "#/projects",
    label: "Projects",
    command: "projects",
    section: "projects",
  },
  { path: "#/about", label: "About", command: "about", section: "about" },
];

function PortfolioShell({ navigation, compact }: Props) {
  const { route, navigate, follow, backToBlogs, restoreScroll, closeTerminal } =
    navigation;
  const { posts, loading, error, refresh } = useBlogData(BLOG_CONFIG);
  const post = posts.find(item => item.number === route.article);
  const terminal =
    route.section === "terminal" || (!compact && route.implicit === true);
  const terminalHref = terminal
    ? window.history.state?.portfolioFrom || "#/"
    : "#/terminal";

  useLayoutEffect(() => {
    if (route.section !== "blogs" || !loading) restoreScroll();
  }, [route.path, route.section, loading, restoreScroll]);

  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);
  useEffect(() => {
    const title =
      (terminal ? "Terminal" : post?.title) ||
      {
        home: "Home",
        blogs: "Blog",
        projects: "Projects",
        about: "About",
        contact: "Contact",
        terminal: "Terminal",
        "not-found": "Page not found",
      }[route.section];
    document.title = `${title} · Foxiv`;
  }, [route.section, post?.title, terminal]);

  const openBrowseSection = (input: string) => {
    const resolved = commandRegistry.resolveInput(input);
    if (resolved.args.length > 0) return false;
    const paths: Record<string, string> = {
      welcome: "#/",
      about: "#/about",
      contact: "#/contact",
      projects: "#/projects",
      blogs: "#/blogs",
    };
    const path = paths[resolved.commandName];
    if (!path) return false;
    navigate(path);
    return true;
  };

  const pathLabel = terminal
    ? "~/terminal"
    : route.section === "home"
    ? "~/foxiv"
    : `~/${route.section === "blogs" ? "blog" : route.section}${
        route.article ? `/${route.article}` : ""
      }`;

  return (
    <BrowseShell $terminal={terminal} data-testid="browse-shell">
      <BrowseHeader $terminal={terminal}>
        <div>
          <span>❯ {pathLabel}</span>
          <BrowseAction
            as="a"
            href="https://github.com/parallelarc/parallelarc.github.io/blob/main/docs/READING_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            For agents
          </BrowseAction>
          <BrowseAction
            as="a"
            href={terminalHref}
            aria-label={terminal ? "Back to browsing" : "Open terminal"}
            onClick={event => {
              if (
                terminal &&
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                event.preventDefault();
                closeTerminal();
              } else follow(event, terminalHref);
            }}
          >
            {terminal ? "← browse" : ">_ terminal"}
          </BrowseAction>
        </div>
      </BrowseHeader>
      <BrowseMain $terminal={terminal}>
        {route.section === "home" && !terminal && (
          <MobileHome>
            <BrowseAction
              as="a"
              href="#/blogs"
              onClick={event => follow(event, "#/blogs")}
            >
              [ Read the blog → ]
            </BrowseAction>
            <Welcome onCommand={openBrowseSection} />
          </MobileHome>
        )}
        {route.section === "blogs" &&
          (route.article ? (
            loading && !post ? (
              <BrowseState role="status">Loading article…</BrowseState>
            ) : post ? (
              <Suspense
                fallback={
                  <BrowseState role="status">Opening article…</BrowseState>
                }
              >
                <ArticleReader
                  key={post.number}
                  post={post}
                  onBack={backToBlogs}
                  onReady={restoreScroll}
                />
              </Suspense>
            ) : (
              <BrowseState>
                <p role={error ? "alert" : undefined}>
                  {error
                    ? "Unable to load this article. Please try again."
                    : "Article not found."}
                </p>
                {error && (
                  <BrowseAction type="button" onClick={() => void refresh()}>
                    [retry]
                  </BrowseAction>
                )}
                <BrowseAction type="button" onClick={backToBlogs}>
                  ← Back to blog
                </BrowseAction>
              </BrowseState>
            )
          ) : (
            <BlogList follow={follow} />
          ))}
        {route.section === "projects" && (
          <section aria-label="Projects">
            <BrowseHeading>
              <h1>Projects</h1>
            </BrowseHeading>
            <Projects />
          </section>
        )}
        {route.section === "about" && (
          <section aria-label="About">
            <BrowseHeading>
              <h1>About</h1>
            </BrowseHeading>
            <About showGreeting={!compact} />
            <Contact />
          </section>
        )}
        {route.section === "contact" && (
          <section aria-label="Contact">
            <BrowseHeading>
              <h1>Contact</h1>
            </BrowseHeading>
            <Contact />
          </section>
        )}
        {terminal && <Terminal embedded touchMode={compact} />}
        {route.section === "not-found" && (
          <BrowseState>
            <p>Page not found.</p>
            <BrowseAction
              as="a"
              href="#/blogs"
              onClick={event => follow(event, "#/blogs")}
            >
              Back to blog →
            </BrowseAction>
          </BrowseState>
        )}
      </BrowseMain>
      {!terminal && (
        <BrowseNav aria-label="Main navigation">
          <div>
            {tabs.map(tab => (
              <a
                key={tab.section}
                href={tab.path}
                aria-label={tab.label}
                aria-current={
                  route.section === tab.section ||
                  (tab.section === "about" && route.section === "contact")
                    ? "page"
                    : undefined
                }
                onClick={event => follow(event, tab.path)}
              >
                /{tab.command}
              </a>
            ))}
          </div>
        </BrowseNav>
      )}
    </BrowseShell>
  );
}

export default PortfolioShell;
