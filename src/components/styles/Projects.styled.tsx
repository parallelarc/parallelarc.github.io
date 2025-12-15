import styled from "styled-components";

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

export const ContactGallery = styled(ProjectGallery)`
  display: inline-grid;
  justify-content: flex-start;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  grid-auto-rows: auto;
  gap: 0.5rem;
`;

export const ContactGalleryItem = styled(GalleryItem)`
  min-height: unset;

  img {
    height: auto;
    max-height: 260px;
    object-fit: contain;
  }
`;
