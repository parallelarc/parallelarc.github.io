import { FaEnvelope, FaGithub, FaSteam } from "react-icons/fa6";
import styled from "styled-components";
import {
  GalleryItem,
  ProjectGallery,
  ProjectsIntro,
} from "../styles/Projects.styled";
import { CmdDesc, CmdLink, CmdList, HelpWrapper } from "../styles/Help.styled";

const Contact: React.FC = () => {
  return (
    <HelpWrapper data-testid="contact">
      <ProjectsIntro>Ping me via email or find me online</ProjectsIntro>
      {contacts.map(({ title, url, desc, gallery, icon }) => (
        <div key={title}>
          <CmdList>
            <IconBubble aria-hidden="true">{icon}</IconBubble>
            <CmdLink href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </CmdLink>
            {desc && <CmdDesc> – {desc}</CmdDesc>}
          </CmdList>
          {gallery && (
            <ProjectGallery aria-label={`${title} collection preview`}>
              {gallery.map(image => (
                <GalleryItem key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </GalleryItem>
              ))}
            </ProjectGallery>
          )}
        </div>
      ))}
    </HelpWrapper>
  );
};

type ContactLink = {
  title: string;
  url: string;
  desc?: string;
  icon: React.ReactNode;
  gallery?: {
    src: string;
    alt: string;
  }[];
};

const contacts: ContactLink[] = [
  {
    title: "Email",
    url: "mailto:jvren42@gmail.com",
    desc: "ping me",
    icon: <FaEnvelope />,
  },
  {
    title: "GitHub",
    url: "https://github.com/parallelarc",
    icon: <FaGithub />,
  },
  {
    title: "Steam",
    url: "https://steamcommunity.com/id/parallelarc",
    icon: <FaSteam />,
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
        alt: "Neon-lit cyberpunk cityscape poster",
      },
      {
        src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80",
        alt: "Minimal low-poly landscape artwork",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        alt: "Space station floating near a planet",
      },
    ],
  },
];

const IconBubble = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.65rem;
  vertical-align: middle;

  svg {
    width: 1.1rem;
    height: 1.1rem;
    display: block;
  }
`;

export default Contact;
