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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.6rem;
`;

export const GalleryItem = styled.figure`
  position: relative;
  border-radius: 0.4rem;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  background: ${({ theme }) => theme.colors?.body};
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    transition: transform 0.5s ease, filter 0.4s ease;
    filter: saturate(0.85);
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
`;
