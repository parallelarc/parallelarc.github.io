import type { ProjectsContent } from "./types";

export const PROJECTS_CONTENT: ProjectsContent = {
  intro: "Some things I've made, and moments they passed through.",
  images: [
    {
      id: "husky",
      src: "/profile-media/project_vbot/husky.jpg",
      alt: "A dog sitting beside Vbot in the snow",
    },
    {
      id: "labrador",
      src: "/profile-media/project_vbot/labrador.jpg",
      alt: "A dog sitting beside Vbot on the grass",
    },
    {
      id: "peafowl",
      src: "/profile-media/project_vbot/peafowl.jpg",
      alt: "A shop entrance decorated with stuffed animals",
    },
    {
      id: "branchestower",
      src: "/profile-media/project_vbot/branchestower.jpg",
      alt: "A building across a pond, framed by bare branches",
    },
    {
      id: "deer",
      src: "/profile-media/project_vbot/deer.jpg",
      alt: "A deer beside Vbot among trees in the snow",
    },
    {
      id: "dessert",
      src: "/profile-media/project_vbot/dessert.jpg",
      alt: "A dessert stand and a Vbot-branded cookie",
    },
    {
      id: "marmot",
      src: "/profile-media/project_vbot/marmot.jpg",
      alt: "A marmot standing in an indoor enclosure",
    },
    {
      id: "staff",
      src: "/profile-media/project_vbot/staff.png",
      alt: "A dog beside a badge marked Staff",
    },
    {
      id: "avatar",
      src: "/profile-media/project_vbot/avatar.jpg",
      alt: "Vbot beside two people in the snow, with a screen showing the same scene below",
    },
  ],
  items: [
    {
      id: 1,
      title: "Terminal Portfolio",
      desc: `This project. A minimalist terminal interface pretending to be a portfolio.
No noise - just commands, output, clickable navigation, and a trace of how I think.`,
      url: "https://github.com/parallelarc/parallelarc.github.io",
    },
    {
      id: 2,
      title: "Vbot",
      desc: "Vbot is a robot pet designed for family and outdoor life. During Beijing's first snow in 2025, it walked through Purple Jade Villas, meeting friends along the way.",
      url: "https://space.bilibili.com/3546948055337693",
      previewImageIds: ["husky", "labrador", "deer", "avatar"],
      albumGroups: [
        {
          id: "snow-companions",
          title: "Snow companions",
          imageIds: ["avatar", "staff", "branchestower"],
        },
        {
          id: "friends-met",
          title: "Friends met on the walk",
          imageIds: ["labrador", "marmot", "peafowl"],
        },
        {
          id: "behind-the-scenes",
          title: "Behind the scenes",
          imageIds: ["dessert", "deer", "husky"],
        },
      ],
    },
    {
      id: 3,
      title: "Jarvis",
      desc: "Jarvis is a gesture-based interface for controlling 3D objects on 2D screens. A new interaction for personal AI assistants. No AI involved, for now.",
      url: "https://github.com/parallelarc/Jarvis",
    },
  ],
};
