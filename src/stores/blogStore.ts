import { create } from "zustand";
import type { BlogPost, GitHubConfig } from "../types/github";
import { fetchBlogPosts, fetchBlogSearch } from "../utils/github";

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  source: string;
  searchLoading: boolean;
  searchError: string | null;
  loadSearch: (config: GitHubConfig) => Promise<void>;
  loaded: boolean;
  load: (config: GitHubConfig, refresh?: boolean) => Promise<BlogPost[]>;
}

const pendingSearch = new Map<string, Promise<void>>();
const pending = new Map<string, Promise<BlogPost[]>>();
export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  loading: true,
  error: null,
  source: "",
  searchLoading: false,
  searchError: null,
  loaded: false,
  load(config, refresh = false) {
    const source = JSON.stringify(config);
    const state = get();
    const existing = pending.get(source);
    if (existing) return existing;
    if (!refresh && state.loaded && state.source === source)
      return Promise.resolve(state.posts);
    set({
      source,
      loading: true,
      error: null,
      searchError: null,
      searchLoading: false,
      ...(state.source === source ? {} : { loaded: false, posts: [] }),
    });
    const request = fetchBlogPosts(config)
      .then(posts => {
        if (get().source === source)
          set({ posts, loaded: true, loading: false });
        return posts;
      })
      .catch((error: unknown) => {
        if (get().source === source)
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch blog posts",
          });
        throw error;
      })
      .finally(() => pending.delete(source));
    pending.set(source, request);
    return request;
  },
  async loadSearch(config) {
    await get().load(config);
    const source = JSON.stringify(config);
    const state = get();
    if (state.source !== source) return;
    const url = state.posts.find(post => post.searchUrl)?.searchUrl;
    if (
      !url ||
      state.posts.every(
        post => !post.searchUrl || post.searchContent !== undefined
      )
    )
      return;
    const searchKey = source + url;
    const existing = pendingSearch.get(searchKey);
    if (existing) return existing;
    set({ searchLoading: true, searchError: null });
    const request = fetchBlogSearch(url)
      .then(index => {
        if (
          get().source !== source ||
          !get().posts.some(post => post.searchUrl === url)
        )
          return;
        if (
          get().posts.some(
            post => post.searchUrl === url && !index.has(post.number)
          )
        )
          throw new Error("Search data does not match the blog index.");
        set({
          posts: get().posts.map(post =>
            post.searchUrl === url
              ? { ...post, searchContent: index.get(post.number) }
              : post
          ),
          searchLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (
          get().source === source &&
          get().posts.some(post => post.searchUrl === url)
        )
          set({
            searchLoading: false,
            searchError:
              error instanceof Error ? error.message : "Unable to load search.",
          });
        throw error;
      })
      .finally(() => pendingSearch.delete(searchKey));
    pendingSearch.set(searchKey, request);
    return request;
  },
}));
