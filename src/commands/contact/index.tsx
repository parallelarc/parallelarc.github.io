import React, { useCallback, useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaSteam, FaXTwitter } from "react-icons/fa6";
import styled from "styled-components";
import {
  ContactGallery,
  ContactGalleryItem,
  ProjectsIntro,
  LightboxOverlay,
  LightboxImage,
  CmdDesc,
  CmdLink,
  CmdList,
  HelpWrapper,
} from "../../components/styles/Commands.styled";

type ContactLink = {
  title: string;
  url: string;
  desc?: string;
  icon: React.ComponentType<{ size?: number }>;
  gallery?: {
    src: string;
    alt: string;
  }[];
};

const CONTACTS: ContactLink[] = [
  {
    title: "Email",
    url: "mailto:jvren42@gmail.com",
    desc: "ping me",
    icon: FaEnvelope,
  },
  {
    title: "GitHub",
    url: "https://github.com/parallelarc",
    icon: FaGithub,
  },
  {
    title: "X (Twitter)",
    url: "https://x.com/jvren42",
    icon: FaXTwitter,
  },
  {
    title: "Steam",
    url: "https://steamcommunity.com/id/parallelarc",
    icon: FaSteam,
    gallery: [
      {
        src: "/profile-media/steam_mosaic.jpg",
        alt: "Steam library collage",
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

function Contact() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = (image: { src: string; alt: string }) => {
    setSelectedImage(image);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, closeLightbox]);

  return (
    <HelpWrapper data-testid="contact">
      <ProjectsIntro>Ping me via email or find me online</ProjectsIntro>
      {CONTACTS.map(({ title, url, desc, gallery, icon: Icon }) => (
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
              {gallery.map((image) => (
                <ContactGalleryItem key={image.src} onClick={() => openLightbox(image)}>
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
      ))}

      {selectedImage && (
        <LightboxOverlay onClick={closeLightbox}>
          <LightboxImage
            src={selectedImage.src}
            alt={selectedImage.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </LightboxOverlay>
      )}
    </HelpWrapper>
  );
}

export default Contact;
