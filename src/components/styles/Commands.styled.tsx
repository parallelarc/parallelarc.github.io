import styled, { css, keyframes } from "styled-components";

export const Link = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: inherit;
  white-space: nowrap;
  border-bottom: 2px dashed ${({ theme }) => theme.colors?.secondary};

  &:hover {
    border-bottom-style: solid;
  }
`;

// --- About ---

export const AboutWrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  p {
    margin-top: 0.5rem;
    line-height: 1.5rem;
  }
`;

export const HighlightSpan = styled.span`
  font-weight: 700;
`;

// --- Help ---

export const HelpWrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
`;

export const CmdList = styled.div`
  margin-bottom: 0.65rem;
  line-height: 1.7rem;
`;

export const CmdLink = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: inherit;
  white-space: nowrap;
  border-bottom: 2px dashed ${({ theme }) => theme.colors?.secondary};
  font-weight: 600;

  &:hover,
  &:focus-visible {
    border-bottom-style: solid;
  }
`;

export const CmdDesc = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  margin-bottom: 0.75rem;

  @media (max-width: 550px) {
    display: block;
  }
`;

export const StatusText = styled.p<{ $variant?: "error" | "muted" }>`
  font-size: 0.85rem;
  margin: 0;
  color: ${({ $variant, theme }) => {
    if ($variant === "error") return "#ff8ba7";
    const textColors = theme.colors?.text;
    if ($variant === "muted")
      return textColors?.[300] || "rgba(255, 255, 255, 0.5)";
    return textColors?.[200] || "rgba(255, 255, 255, 0.7)";
  }};
`;

export const LoadingDots = styled.span`
  display: inline-block;
  animation: pulse 1s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.4;
    }
  }
`;

export const ProjectsIntro = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  line-height: 1.5rem;
`;

export const ProjectTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
  line-height: 1.5rem;
`;

export const ProjectDesc = styled.div`
  color: ${({ theme }) => theme.colors?.text[200]};
  text-align: justify;
  line-height: 1.5rem;
  max-width: 500px;
`;

export const ProjectLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

export const TextPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProjectGallery = styled.div`
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  grid-auto-rows: 120px;
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    grid-auto-rows: 140px;
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    grid-auto-rows: 150px;
  }
`;

const GalleryItem = styled.figure`
  position: relative;
  border-radius: 0.4rem;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  background: ${({ theme }) => theme.colors?.body};
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    background: ${({ theme }) => theme.colors?.body};
    transition: transform 0.5s ease, filter 0.4s ease;
    filter: saturate(0.95);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(96, 78, 255, 0.25),
      rgba(18, 229, 195, 0.15)
    );
    mix-blend-mode: screen;
    pointer-events: none;
  }

  &:hover img {
    transform: scale(1.05);
    filter: saturate(1);
  }

  &.orientation-portrait {
    grid-row: span 2;
  }

  &.orientation-landscape {
    grid-column: span 2;
  }

  &.orientation-panorama {
    grid-column: span 2;
    grid-row: span 2;
  }

  @media (max-width: 479px) {
    &.orientation-landscape,
    &.orientation-panorama {
      grid-column: span 1;
    }

    &.orientation-panorama {
      grid-row: span 3;
    }
  }
`;

export const ContactGallery = styled(ProjectGallery)`
  display: inline-grid;
  justify-content: flex-start;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  grid-auto-rows: auto;
  gap: 0.5rem;
`;

export const ContactGalleryItem = styled(GalleryItem)`
  min-height: unset;
  cursor: pointer;

  img {
    height: auto;
    max-height: 260px;
    object-fit: contain;
  }
`;

// --- Welcome ---

const rainbowShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const rainbowTextStyles = css`
  display: inline-block;
  background: linear-gradient(
    120deg,
    #ff6b6b,
    #f7b733,
    #51cf66,
    #1e90ff,
    #845ef7
  );
  background-size: 280% 280%;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${rainbowShift} 12s ease infinite;
`;

export const HeroContainer = styled.div`
  display: flex;
  flex-wrap: wrap-reverse;

  @media (max-width: 932px) {
    margin-bottom: 1.5rem;
  }

  div {
    @media (min-width: 1024px) {
      flex-basis: 50%;
    }
  }
`;

export const PreName = styled.pre`
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  font-family: "Cascadia Code", "SF Mono", "Fira Code", "Consolas",
    "Lucida Console", "Courier New", monospace;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
  -webkit-font-variant-ligatures: none;
  line-height: 1.05;
  letter-spacing: 0;
  padding: 0;
  ${rainbowTextStyles};

  @media (max-width: 550px) {
    display: none;
  }
`;

export const PreWrapper = styled.div`
  text-align: center;
`;

export const PreNameMobile = styled.pre`
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  font-family: "Cascadia Code", "SF Mono", "Fira Code", "Consolas",
    "Lucida Console", "Courier New", monospace;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
  -webkit-font-variant-ligatures: none;
  line-height: 1.05;
  letter-spacing: 0;
  padding: 0;
  ${rainbowTextStyles};

  @media (min-width: 550px) {
    display: none;
  }
`;

export const PreImg = styled.pre`
  font-family: "Cascadia Code", "SF Mono", "Fira Code", "Consolas",
    "Lucida Console", "Courier New", monospace;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
  -webkit-font-variant-ligatures: none;
  line-height: 1.05;
  letter-spacing: 0;
  padding: 0;

  @media (max-width: 550px) {
    display: none;
  }
`;

export const RainbowText = styled.p`
  margin-top: 0.75rem;
  line-height: 1.6;
  font-weight: 500;
  ${rainbowTextStyles};
  display: block;
`;

export const WelcomeInstructions = styled(RainbowText)`
  margin-top: 1.5rem;
  line-height: 2.75rem;
`;

export const TerminalAction = styled.button`
  box-sizing: border-box;
  min-height: 44px;
  padding: 0.35rem 0.5rem;
  background: transparent;
  color: ${({ theme }) => theme.colors?.primary};
  font: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    border-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors?.text[300]};
    cursor: default;
  }
`;

export const CommandShortcut = styled(TerminalAction)`
  display: inline;
  min-height: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  line-height: inherit;
  color: ${({ theme }) => theme.colors?.secondary};
  font-weight: 700;
  text-decoration: underline dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;

  &:hover:not(:disabled) {
    border-color: transparent;
    text-decoration-style: solid;
  }
`;

// --- Blog ---

export const BlogContainer = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.875rem;
  min-width: 0;

  &:focus {
    outline: none;
  }
`;

export const BlogToolbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.text[300]};
  background: ${({ theme }) => theme.colors?.body};
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.875rem;
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};
`;

export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const TuiUnifiedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TuiFocusIndicator = styled.span<{ $visible?: boolean }>`
  display: inline-block;
  width: 1.2rem;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors?.accent};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

export const TuiUnifiedItem = styled.a<{ $focused?: boolean }>`
  display: flex;
  align-items: baseline;
  min-width: 0;
  min-height: 44px;
  padding: 0.5rem 0;
  box-sizing: border-box;
  text-decoration: none;
  background: transparent;
  color: ${({ $focused, theme }) =>
    $focused ? theme.colors?.accent : theme.colors?.text[100]};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors?.accent};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

export const TuiTagsRow = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0;
`;

export const TuiTag = styled(TerminalAction)<{
  $active?: boolean;
  $focused?: boolean;
}>`
  max-width: 100%;
  overflow-wrap: anywhere;
  border-radius: 2px;
  font-size: 0.875rem;
  background: ${({ $active, $focused, theme }) => {
    if ($active && $focused) return theme.colors?.accent;
    return "transparent";
  }};
  color: ${({ $active, $focused, theme }) => {
    if ($active && $focused) return theme.colors?.bg;
    if ($active) return theme.colors?.accent;
    if ($focused) return theme.colors?.accent;
    return theme.colors?.text[100];
  }};
  transition: all 0.15s ease;
`;

export const TuiPostContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
`;

export const TuiPostTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const TuiPostMeta = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text[200]};
  overflow-wrap: anywhere;

  @media (min-width: 641px) {
    flex: 0 1 40%;
    text-align: right;
  }
`;

export const TuiPaginationRow = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const TuiSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors?.text[300]};
  opacity: 0.35;
  margin: 0.5rem 0;
`;

export const TuiInstructions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text[300]};

  span {
    color: ${({ theme }) => theme.colors?.text[200]};
  }
`;
