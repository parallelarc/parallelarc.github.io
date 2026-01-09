import styled, { css, keyframes } from "styled-components";

// --- Shared ---

export const Cmd = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
`;

export const Link = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: 1.5rem;
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

export const Divider = styled.div`
  margin: 0.75rem 0;
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors?.text[300]};
  opacity: 0.35;
`;

export const HighlightSpan = styled.span`
  font-weight: 700;
`;

export const HighlightAlt = styled.span`
  font-weight: 700;
`;

// --- Education ---

export const EduIntro = styled.div`
  margin-bottom: 0.75rem;
`;

export const EduList = styled.div`
  margin-bottom: 1rem;

  .title {
    font-weight: 700;
    margin-bottom: 0.275rem;
  }

  .desc {
    color: ${({ theme }) => theme.colors?.text[200]};
  }
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
  line-height: 1.5rem;
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

export const KeyContainer = styled.div`
  font-size: 0.875rem;
  margin-top: 1rem;

  @media (max-width: 550px) {
    display: none;
  }

  div {
    margin-top: 0.25rem;
  }
`;

// --- Hi ---

export const HiContainer = styled.div`
  margin: 0.25rem 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

export const ChatLine = styled.div<{ $role: "assistant" | "user" }>`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: ${({ $role }) =>
    $role === "assistant" ? "rgba(255, 255, 255, 0.02)" : "transparent"};
  border-left: 2px solid
    ${({ $role, theme }) =>
      $role === "user"
        ? theme.colors?.primary || theme.colors?.text[100]
        : theme.colors?.text[300]};
`;

export const RoleTag = styled.span<{ role: "assistant" | "user" }>`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ role, theme }) =>
    role === "user"
      ? theme.colors?.primary || theme.colors?.text[100]
      : theme.colors?.text[300]};
`;

export const MessageText = styled.p<{ $role: "assistant" | "user" }>`
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  color: ${({ $role, theme }) =>
    $role === "user" ? theme.colors?.text[100] : theme.colors?.text[200]};
`;

export const StatusText = styled.p<{ $variant?: "error" | "muted" }>`
  font-size: 0.85rem;
  margin: 0;
  color: ${({ $variant, theme }) => {
    if ($variant === "error") return "#ff8ba7";
    if ($variant === "muted") return theme.colors.text[300];
    return theme.colors.text[200];
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

// --- Projects ---

export const ProjectContainer = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.875rem;
`;

export const ProjectsIntro = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  line-height: 1.5rem;
`;

export const ProjectTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
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

export const AlbumSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const AlbumGroups = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.85rem;
  align-items: stretch;
`;

export const AlbumGroup = styled.div<{ flexRatio?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: ${props => props.flexRatio ?? 1};
`;

export const AlbumGrid = styled.div`
  display: grid;
  gap: 0.6rem;
  flex: 1;

  &.layout-3h {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
  }

  &.layout-3v {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  }

  &.layout-2h1v {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  &.layout-1h2v {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

export const ProjectGallery = styled.div`
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

export const GalleryItem = styled.figure`
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

export const AlbumImage = styled(GalleryItem)`
  min-height: 140px;
  cursor: pointer;

  img {
    height: 100%;
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

export const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const LightboxImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.4rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s ease;
  cursor: default;

  @keyframes zoomIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// --- Themes ---

export const ThemesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const ThemeSpan = styled.span`
  margin-right: 0.875rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
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
  ${rainbowTextStyles};

  @media (min-width: 550px) {
    display: none;
  }
`;

export const PreImg = styled.pre`
  @media (max-width: 550px) {
    display: none;
  }
`;

export const Seperator = styled.div`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const Instruction = styled.p`
  margin-top: 0.75rem;
  line-height: 1.6;
  font-weight: 500;
`;

export const RainbowText = styled.p`
  margin-top: 0.75rem;
  line-height: 1.6;
  font-weight: 500;
  ${rainbowTextStyles};
`;
