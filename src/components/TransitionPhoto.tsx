import { useEffect, useState } from "react";
import type { ProjectImage } from "../content/siteData";
import {
  PhotoLayers,
  PhotoStatus,
  AlbumAction,
} from "./styles/ProjectAlbum.styled";

const assetBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
export const resolveAsset = (src: string) =>
  `${assetBase}${src.startsWith("/") ? src : `/${src}`}`;

export default function TransitionPhoto({
  image,
  lazy = false,
  onRetry,
}: {
  image: ProjectImage;
  lazy?: boolean;
  onRetry?: () => void;
}) {
  const [loaded, setLoaded] = useState<ProjectImage | null>(null);
  const [previous, setPrevious] = useState<ProjectImage | null>(null);
  const [loadState, setLoadState] = useState<{
    key: string;
    status: "ready" | "error";
  }>({ key: "", status: "ready" });
  const [attempt, setAttempt] = useState(0);
  const loadKey = `${image.src}:${attempt}`;
  const status = loadState.key === loadKey ? loadState.status : "loading";
  const fallback = status === "ready" ? previous : loaded;

  useEffect(() => {
    if (status !== "ready") return;
    const timer = window.setTimeout(() => setPrevious(null), 240);
    return () => window.clearTimeout(timer);
  }, [loadKey, status]);

  return (
    <PhotoLayers data-photo-layers data-ready={status === "ready"}>
      {fallback && fallback.src !== image.src && (
        <img
          data-previous
          src={resolveAsset(fallback.src)}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
      <img
        key={loadKey}
        data-current
        src={resolveAsset(image.src)}
        alt={image.alt}
        loading={lazy ? "lazy" : undefined}
        decoding="async"
        draggable={false}
        onLoad={() => {
          setPrevious(loaded);
          setLoaded(image);
          setLoadState({ key: loadKey, status: "ready" });
        }}
        onError={() => setLoadState({ key: loadKey, status: "error" })}
      />
      {status !== "ready" && !lazy && (
        <PhotoStatus role={status === "error" ? "alert" : "status"}>
          {status === "error" ? "Unable to load this photo." : "Loading photo…"}
          {status === "error" && (
            <AlbumAction
              type="button"
              onClick={() => {
                onRetry?.();
                setAttempt(value => value + 1);
              }}
            >
              [ Retry ]
            </AlbumAction>
          )}
        </PhotoStatus>
      )}
    </PhotoLayers>
  );
}
