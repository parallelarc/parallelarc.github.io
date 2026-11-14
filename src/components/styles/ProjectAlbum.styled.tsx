import styled from "styled-components";
import { TerminalAction } from "./Commands.styled";

export const Album = styled.section`
  width: 100%;
  max-width: 720px;
  min-width: 0;
`;

export const AlbumPreview = styled.div<{ $thumbnails: number }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: ${({ $thumbnails }) =>
      $thumbnails ? "3fr 1fr" : "1fr"};
    grid-template-rows: repeat(
      ${({ $thumbnails }) => Math.max(1, $thumbnails)},
      minmax(0, 1fr)
    );
    aspect-ratio: 2;
    max-height: 360px;
  }
`;

export const PreviewImage = styled.button<{ $cover: boolean }>`
  position: relative;
  display: block;
  min-width: 0;
  min-height: 44px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  border-radius: 3px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors?.body};
  color: ${({ theme }) => theme.colors?.text[100]};
  cursor: ${({ $cover }) => ($cover ? "grab" : "pointer")};
  user-select: none;
  font: inherit;
  aspect-ratio: 4 / 3;
  grid-column: ${({ $cover }) => ($cover ? "1 / -1" : "auto")};
  touch-action: manipulation;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
  }

  &:active {
    cursor: ${({ $cover }) => ($cover ? "grabbing" : "pointer")};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 3px;
  }

  @media (min-width: 640px) {
    aspect-ratio: auto;
    grid-column: ${({ $cover }) => ($cover ? "1" : "2")};
    grid-row: ${({ $cover }) => ($cover ? "1 / -1" : "auto")};
  }
`;

export const MorePhotos = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  font-size: 1.5rem;
`;

export const PhotoCount = styled.span`
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 3px 6px;
  color: #fff;
  background: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  line-height: 1.5;
`;

export const AlbumAction = styled(TerminalAction)`
  padding: 8px 10px;
  min-width: 44px;
  min-height: 44px;
  color: ${({ theme }) => theme.colors?.primary};
`;

export const PhotoDialog = styled.dialog`
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  margin: 0;
  width: 100%;
  max-width: none;
  height: 100dvh;
  max-height: none;
  padding: max(12px, env(safe-area-inset-top, 0px))
    max(12px, env(safe-area-inset-right, 0px))
    max(12px, env(safe-area-inset-bottom, 0px))
    max(12px, env(safe-area-inset-left, 0px));
  border: 0;
  color: ${({ theme }) => theme.colors?.text[100]};
  background: rgba(14, 21, 28, 0.35);
  font: inherit;
  overflow: hidden;

  &[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    gap: 8px;
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
`;

export const PhotoLayers = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;

  img[data-current] {
    opacity: 0;
  }

  img[data-previous] {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &[data-ready="true"] img[data-current] {
    animation: photo-enter 220ms ease-out both;
  }

  &[data-ready="true"] img[data-previous] {
    animation: photo-exit 220ms ease-out both;
  }

  @keyframes photo-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes photo-exit {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-ready="true"] img[data-current] {
      animation: none;
      opacity: 1;
    }
    &[data-ready="true"] img[data-previous] {
      animation: none;
      opacity: 0;
    }
  }
`;

export const PhotoToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
`;

export const PhotoStage = styled.div`
  position: relative;
  min-width: 0;
  min-height: 0;
  touch-action: pan-y pinch-zoom;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const PhotoStatus = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
`;

export const PhotoNavigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

export const PhotoThumbnails = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  padding: 4px;
  overscroll-behavior-x: contain;

  button {
    flex: 0 0 64px;
    height: 48px;
    aspect-ratio: auto;
    grid-area: auto;
  }

  button[aria-current="true"] {
    border: 2px solid ${({ theme }) => theme.colors?.primary};
  }
`;
