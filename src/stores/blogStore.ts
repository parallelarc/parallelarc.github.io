import { create } from "zustand";
import type { BlogPost, GitHubConfig } from "../types/github";
import { fetchBlogPosts } from "../utils/github";

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  source: string;
  loaded: boolean;
  load: (config: GitHubConfig, refresh?: boolean) => Promise<BlogPost[]>;
}

const pending = new Map<string, Promise<BlogPost[]>>();
export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  loading: true,
  error: null,
  source: "",
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
}));
