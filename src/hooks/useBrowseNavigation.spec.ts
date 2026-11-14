import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "../utils/test-utils";
import { parseBrowseRoute, useBrowseNavigation } from "./useBrowseNavigation";

describe("browse navigation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, "", "#/");
    window.scrollTo = vi.fn();
  });

  it("parses shareable article and section URLs", () => {
    expect(parseBrowseRoute("#/blogs/12")).toEqual({
      section: "blogs",
      article: 12,
      path: "#/blogs/12",
    });
    expect(parseBrowseRoute("#/projects/")).toEqual({
      section: "projects",
      path: "#/projects",
    });
    expect(parseBrowseRoute("").section).toBe("home");
    expect(parseBrowseRoute("").implicit).toBe(true);
    expect(parseBrowseRoute("#/").implicit).toBeUndefined();
  });

  it("distinguishes the desktop default from an explicitly chosen browse home", () => {
    window.history.replaceState(null, "", window.location.pathname);
    const { result } = renderHook(() => useBrowseNavigation());
    expect(result.current.route.implicit).toBe(true);
    act(() => result.current.navigate("#/"));
    expect(window.location.hash).toBe("#/");
    expect(result.current.route.implicit).toBeUndefined();
    act(() => {
      window.history.replaceState(null, "", window.location.pathname);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.route.implicit).toBe(true);
  });

  it("returns a directly opened terminal to browse home", () => {
    window.history.replaceState(null, "", "#/terminal");
    const { result } = renderHook(() => useBrowseNavigation());
    act(() => result.current.closeTerminal());
    expect(window.location.hash).toBe("#/");
    expect(result.current.route.implicit).toBeUndefined();
  });

  it.each([
    "#/blogs/0",
    "#/blogs/nope",
    "#/blogs/99999999999999999999",
    "#/unknown",
  ])("handles invalid link %s", hash => {
    expect(parseBrowseRoute(hash).section).toBe("not-found");
  });

  it("records the list position before opening an article and restores it on browser back", () => {
    const { result } = renderHook(() => useBrowseNavigation());
    act(() => result.current.navigate("#/blogs"));
    vi.spyOn(window, "scrollY", "get").mockReturnValue(640);
    act(() => result.current.navigate("#/blogs/12"));
    expect(window.history.state.portfolioFrom).toBe("#/blogs");
    vi.spyOn(window, "scrollY", "get").mockReturnValue(200);
    act(() => {
      window.history.replaceState(null, "", "#/blogs");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.route.section).toBe("blogs");
    act(() => result.current.restoreScroll());
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 640);
    vi.restoreAllMocks();
  });

  it("returns a freshly opened article to the blog list without leaving the site", () => {
    window.history.replaceState(null, "", "#/blogs/12");
    const { result } = renderHook(() => useBrowseNavigation());
    act(() => result.current.backToBlogs());
    expect(window.location.hash).toBe("#/blogs");
    expect(result.current.route.section).toBe("blogs");
  });
});
