import React, { useState } from "react";
import { FaEnvelope, FaGithub, FaSteam, FaXTwitter } from "react-icons/fa6";
import styled from "styled-components";
import {
  ContactGallery,
  ContactGalleryItem,
  ProjectsIntro,
  CmdDesc,
  CmdLink,
  CmdList,
  HelpWrapper,
} from "../../components/styles/Commands.styled";
import PhotoViewer from "../../components/PhotoViewer";
import {
  CONTACT_CONTENT,
  type ContactKind,
  type ProjectImage,
} from "../../content/siteData";

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

const CONTACT_ICONS: Record<
  ContactKind,
  React.ComponentType<{ size?: number }>
> = {
  email: FaEnvelope,
  github: FaGithub,
  x: FaXTwitter,
  steam: FaSteam,
};

function Contact() {
  const [album, setAlbum] = useState<{
    title: string;
    photos: ProjectImage[];
    initialIndex: number;
  } | null>(null);

  return (
    <HelpWrapper data-testid="contact">
      <ProjectsIntro>{CONTACT_CONTENT.intro}</ProjectsIntro>
      {CONTACT_CONTENT.items.map(({ kind, title, url, desc, gallery }) => {
        const Icon = CONTACT_ICONS[kind];

        return (
          <div key={title}>
            <CmdList>
              <IconBubble aria-hidden="true">
                <Icon />
              </IconBubble>
              <CmdLink href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </CmdLink>
              {desc && <CmdDesc> – {desc}</CmdDesc>}
            </CmdList>
            {gallery && (
              <ContactGallery aria-label={`${title} collection preview`}>
                {gallery.map((image, index) => (
                  <ContactGalleryItem
                    as="button"
                    type="button"
                    aria-label={`Open ${title} photos`}
                    key={image.src}
                    onClick={() =>
                      setAlbum({
                        title,
                        photos: gallery.map(item => ({
                          ...item,
                          id: item.src,
                        })),
                        initialIndex: index,
                      })
                    }
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </ContactGalleryItem>
                ))}
              </ContactGallery>
            )}
          </div>
        );
      })}

      {album && <PhotoViewer {...album} onClose={() => setAlbum(null)} />}
    </HelpWrapper>
  );
}

export default Contact;
