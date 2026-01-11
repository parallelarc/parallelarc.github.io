import styled, { css, keyframes } from "styled-components";

// --- Shared ---

export const Cmd = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
  margin-right: 0.75rem;
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
    const textColors = theme.colors?.text;
    if ($variant === "muted") return textColors?.[300] || "rgba(255, 255, 255, 0.5)";
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
  line-height: 1.1;

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

// --- Blog ---

export const BlogContainer = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.875rem;
`;

export const BlogIntro = styled.div`
  margin-bottom: 1rem;
  line-height: 1.5rem;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  border-radius: 0.25rem;
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors?.text[100]};
  font-family: inherit;
  font-size: inherit;
  flex: 1;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors?.text[300]};
  }
`;

export const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  color: ${({ theme }) => theme.colors?.text[100]};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.text[300]};
    border-radius: 2px;
  }
`;

export const CategoryTab = styled.button<{ $active?: boolean; $focused?: boolean }>`
  background: ${({ $active, $focused, theme }) => {
    if ($focused) return `${theme.colors?.primary}30`;
    return $active ? theme.colors?.primary : 'transparent';
  }};
  color: ${({ $active, $focused, theme }) => {
    if ($focused) return theme.colors?.primary;
    return $active ? theme.colors?.body : theme.colors?.text[100];
  }};
  border: 1px solid
    ${({ $active, $focused, theme }) => {
      if ($focused) return theme.colors?.primary;
      return $active ? theme.colors?.primary : theme.colors?.text[300];
    }};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
  }
`;

export const BlogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const BlogPostCard = styled.article`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  border-radius: 0.4rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
  }
`;

export const PostHeader = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
`;

export const PostNumber = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
  font-weight: 600;
  font-size: 0.875rem;
`;

export const PostTitle = styled(Link)`
  font-weight: 600;
  display: inline;
`;

export const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const PostExcerpt = styled.p`
  margin: 0.5rem 0;
  color: ${({ theme }) => theme.colors?.text[200]};
  line-height: 1.5;
`;

export const PostLabels = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

export const PostLabel = styled.span`
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  background: ${({ theme }) => theme.colors?.text[300]};
  border-radius: 0.2rem;
  color: ${({ theme }) => theme.colors?.body};
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};
`;

export const PageInfo = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.875rem;
`;

export const NavButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const NavButton = styled.button<{ $disabled?: boolean }>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  color: ${({ theme }) => theme.colors?.text[100]};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  font-family: inherit;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors?.primary};
  }
`;

export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

// --- TUI (Terminal User Interface) Styles ---

export const TuiHeader = styled.div`
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text[100]};
`;

export const TuiDivider = styled.div`
  margin: 0.5rem 0;
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors?.text[300]};
  opacity: 0.35;
`;

export const TuiFooter = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text[300]};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const TuiKeyHint = styled.span`
  padding: 0.1rem 0.35rem;
  background: ${({ theme }) => theme.colors?.text[300]};
  border-radius: 0.2rem;
  color: ${({ theme }) => theme.colors?.body};
  font-family: monospace;
  font-size: 0.75rem;
`;

export const TuiList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const TuiListItem = styled.article<{ $focused?: boolean }>`
  padding: 0.75rem;
  border: 1px solid
    ${({ $focused, theme }) =>
      $focused ? theme.colors?.primary : theme.colors?.text[300]};
  border-radius: 0.4rem;
  background: ${({ $focused, theme }) =>
    $focused ? `${theme.colors?.primary}10` : "transparent"};
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
  }
`;

export const TuiListTitle = styled.div<{ $focused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${({ $focused, theme }) =>
    $focused ? theme.colors?.primary : theme.colors?.text[100]};
`;

export const TuiListMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const TuiPageIndicator = styled.span<{ $focused?: boolean }>`
  padding: 0.25rem 0.5rem;
  border: 1px solid
    ${({ $focused, theme }) =>
      $focused ? theme.colors?.primary : theme.colors?.text[300]};
  border-radius: 0.25rem;
  color: ${({ $focused, theme }) =>
    $focused ? theme.colors?.primary : theme.colors?.text[100]};
  font-size: 0.875rem;
`;

// --- Unified TUI List Components ---

// Block cursor character - inverts the character color like terminal cursor
export const TuiCursorChar = styled.span<{ $focused?: boolean }>`
  background-color: ${({ theme }) => theme.colors?.text[100] || "#ffffff"};
  color: ${({ theme }) => theme.colors?.body || "#000000"};
  display: inline-block;
  min-width: 0.6em;
  text-align: center;
`;

export const TuiUnifiedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TuiFocusIndicator = styled.span<{ $visible?: boolean }>`
  display: inline-block;
  width: 1.2rem;
  color: ${({ theme }) => theme.colors?.accent};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

export const TuiUnifiedItem = styled.div<{ $focused?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: ${({ $focused, theme }) =>
    $focused ? theme.colors?.accent : theme.colors?.text[100]};
  transition: color 0.15s ease;
`;

export const TuiSearchInput = styled.span<{ $focused?: boolean; $hasValue?: boolean }>`
  flex: 1;
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors?.text[100] : theme.colors?.text[300]};
`;

export const TuiTagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
`;

export const TuiTag = styled.span<{ $active?: boolean; $focused?: boolean }>`
  padding: 0 0.25rem;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const TuiPostTitle = styled.span`
  flex: 1;
`;

export const TuiPostMeta = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text[300]};
  white-space: nowrap;
`;

export const TuiPaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const TuiPageNumber = styled.span<{ $active?: boolean }>`
  padding: 0 0.25rem;
  border-radius: 2px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors?.accent : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors?.bg : theme.colors?.text[300]};
  transition: all 0.15s ease;
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
