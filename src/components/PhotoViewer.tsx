import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "../content/siteData";
import { usePhotoGestures } from "../hooks/usePhotoGestures";
import TransitionPhoto, { resolveAsset } from "./TransitionPhoto";
import {
  PhotoDialog,
  PhotoToolbar,
  PhotoStage,
  PhotoNavigation,
  PhotoThumbnails,
  PreviewImage,
  AlbumAction,
} from "./styles/ProjectAlbum.styled";

export default function PhotoViewer({
  title,
  photos,
  initialIndex,
  onClose,
}: {
  title: string;
  photos: ProjectImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const selected = photos[activeIndex];
  const isOpen = Boolean(selected);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef(
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();
  const move = (step: number) =>
    setActiveIndex(index => (index + step + photos.length) % photos.length);
  const viewerGestures = usePhotoGestures<HTMLDivElement>(
    move,
    photos.length > 1
  );
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Scroll only the thumbnail strip; the document and terminal keep their position.
    const strip = dialogRef.current?.querySelector("[data-photo-thumbnails]");
    const thumbnail = strip?.querySelector<HTMLButtonElement>(
      '[aria-current="true"]'
    );
    if (strip && thumbnail) {
      const left = thumbnail.offsetLeft - strip.clientWidth / 2 + 32;
      strip.scrollTo({ left, behavior: "auto" });
    }
  }, [activeIndex, isOpen]);

  if (!selected) return null;
  return createPortal(
    <PhotoDialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "Tab") {
          const buttons =
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)"
            );
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <PhotoToolbar>
        <h2 id={titleId}>{title} / photos</h2>
        <AlbumAction
          type="button"
          aria-label="Close photos"
          onClick={() => onClose()}
        >
          [ Close × ]
        </AlbumAction>
      </PhotoToolbar>
      <PhotoStage
        {...viewerGestures}
        onClick={event => {
          if ((event.target as HTMLElement).closest("button")) return;
          const target =
            event.currentTarget.querySelector<HTMLImageElement>(
              "img[data-current]"
            );
          if (!target) return;
          let outsideImage = false;
          if (target instanceof HTMLImageElement && target.naturalWidth > 0) {
            const rect = target.getBoundingClientRect();
            const scale = Math.min(
              rect.width / target.naturalWidth,
              rect.height / target.naturalHeight
            );
            const insetX = (rect.width - target.naturalWidth * scale) / 2;
            const insetY = (rect.height - target.naturalHeight * scale) / 2;
            outsideImage =
              event.clientX < rect.left + insetX ||
              event.clientX > rect.right - insetX ||
              event.clientY < rect.top + insetY ||
              event.clientY > rect.bottom - insetY;
          }
          if (outsideImage) {
            onClose();
          }
        }}
        onTouchStart={event => {
          const touch = event.touches[0];
          touchStart.current =
            event.touches.length === 1
              ? { x: touch.clientX, y: touch.clientY }
              : null;
        }}
        onTouchMove={event => {
          if (event.touches.length !== 1) touchStart.current = null;
        }}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
        onTouchEnd={event => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || event.touches.length > 0) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) {
            move(dx < 0 ? 1 : -1);
          }
        }}
      >
        <TransitionPhoto
          image={selected}
          onRetry={() => {
            dialogRef.current
              ?.querySelector<HTMLButtonElement>('[aria-label="Close photos"]')
              ?.focus({ preventScroll: true });
          }}
        />
      </PhotoStage>
      <PhotoNavigation aria-label="Photo navigation">
        <AlbumAction
          type="button"
          aria-label="Previous photo"
          disabled={photos.length < 2}
          onClick={() => move(-1)}
        >
          [ ← ]
        </AlbumAction>
        <span role="status" aria-live="polite" aria-atomic="true">
          {activeIndex + 1} / {photos.length}
        </span>
        <AlbumAction
          type="button"
          aria-label="Next photo"
          disabled={photos.length < 2}
          onClick={() => move(1)}
        >
          [ → ]
        </AlbumAction>
      </PhotoNavigation>
      <PhotoThumbnails data-photo-thumbnails aria-label="All photos">
        {photos.map((image, index) => (
          <PreviewImage
            key={image.id}
            type="button"
            $cover={false}
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={`Photo ${index + 1}: ${image.alt}`}
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={resolveAsset(image.src)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </PreviewImage>
        ))}
      </PhotoThumbnails>
    </PhotoDialog>,
    document.body
  );
}
