import type { ContactContent } from "./types";

export const CONTACT_CONTENT: ContactContent = {
  intro: "Ping me via email or find me online",
  items: [
    {
      kind: "email",
      title: "Email",
      url: "mailto:jvren42@gmail.com",
      desc: "ping me",
    },
    {
      kind: "github",
      title: "GitHub",
      url: "https://github.com/parallelarc",
    },
    {
      kind: "x",
      title: "X (Twitter)",
      url: "https://x.com/jvren42",
    },
    {
      kind: "steam",
      title: "Steam",
      url: "https://steamcommunity.com/id/parallelarc",
      gallery: [
        {
          src: "/profile-media/steam_mosaic.jpg",
          alt: "Steam library collage",
        },
      ],
    },
  ],
};
