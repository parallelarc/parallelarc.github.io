import { useCallback, useEffect } from "react";
import { useBlogStore } from "../stores/blogStore";
import type { GitHubConfig } from "../types/github";

export function useBlogData(config: GitHubConfig) {
  const { posts, loading, error, load } = useBlogStore();
  useEffect(() => {
    void load(config).catch(() => undefined);
  }, [config, load]);
  const refresh = useCallback(
    () =>
      load(config, true)
        .then(() => undefined)
        .catch(() => undefined),
    [config, load]
  );
  return { posts, loading, error, refresh };
}
