import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

export type BrowseSection =
  | "home"
  | "blogs"
  | "projects"
  | "about"
  | "contact"
  | "terminal"
  | "not-found";
export type BrowseRoute = {
  section: BrowseSection;
  path: string;
  article?: number;
  implicit?: boolean;
};
const SCROLL_KEY = "foxiv-browse-scroll-v1";

export function parseBrowseRoute(hash: string): BrowseRoute {
  if (!hash) return { section: "home", path: "#/", implicit: true };
  const path = hash || "#/";
  if (path === "#/" || path === "#") return { section: "home", path: "#/" };
  const article = /^#\/blogs\/([1-9]\d*)\/?$/.exec(path);
  if (article && Number.isSafeInteger(Number(article[1])))
    return {
      section: "blogs",
      article: Number(article[1]),
      path: `#/blogs/${Number(article[1])}`,
    };
  const section = /^#\/(blogs|projects|about|contact|terminal)\/?$/.exec(
    path
  )?.[1] as BrowseSection | undefined;
  return section
    ? { section, path: `#/${section}` }
    : { section: "not-found", path };
}

function readScrollPositions(): Record<string, number> {
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(SCROLL_KEY) || "{}"
    );
    if (!saved || typeof saved !== "object") return {};
    return Object.fromEntries(
      Object.entries(saved).filter(
        ([, value]) =>
          typeof value === "number" && Number.isFinite(value) && value >= 0
      )
    );
  } catch {
    return {};
  }
}

/** Hash URLs work on GitHub Pages without server-side route rewrites. */
export function useBrowseNavigation() {
  const [route, setRoute] = useState(() =>
    parseBrowseRoute(window.location.hash)
  );
  const current = useRef(route);
  const positions = useRef(readScrollPositions());

  const remember = useCallback(() => {
    positions.current[current.current.path] = window.scrollY;
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(positions.current));
    } catch {
      /* Storage may be disabled. */
    }
  }, []);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const sync = () => {
      const next = parseBrowseRoute(window.location.hash);
      if (
        next.path === current.current.path &&
        next.implicit === current.current.implicit
      )
        return;
      remember();
      current.current = next;
      setRoute(next);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("pagehide", remember);
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("pagehide", remember);
    };
  }, [remember]);

  const navigate = useCallback(
    (path: string, replace = false) => {
      const next = parseBrowseRoute(path);
      if (
        next.path === current.current.path &&
        next.implicit === current.current.implicit
      )
        return;
      remember();
      const state = {
        ...window.history.state,
        portfolioFrom: current.current.path,
      };
      window.history[replace ? "replaceState" : "pushState"](
        state,
        "",
        next.path
      );
      current.current = next;
      setRoute(next);
    },
    [remember]
  );

  const follow = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, path: string) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      navigate(path);
    },
    [navigate]
  );

  const backToBlogs = useCallback(() => {
    if (window.history.state?.portfolioFrom === "#/blogs")
      window.history.back();
    else navigate("#/blogs", true);
  }, [navigate]);

  const restoreScroll = useCallback(() => {
    window.scrollTo(0, positions.current[current.current.path] || 0);
  }, []);

  const closeTerminal = useCallback(() => {
    if (window.history.state?.portfolioFrom) window.history.back();
    else navigate("#/", true);
  }, [navigate]);

  return { route, navigate, follow, backToBlogs, restoreScroll, closeTerminal };
}

export type BrowseNavigation = ReturnType<typeof useBrowseNavigation>;
