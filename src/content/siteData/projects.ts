import type { ProjectsContent } from "./types";

export const PROJECTS_CONTENT: ProjectsContent = {
  intro: "Some things I've made, and moments they passed through.",
  images: [
    {
      id: "husky",
      src: "/profile-media/project_vbot/husky.jpg",
      alt: "Husky robot companion bounding through fresh snow",
    },
    {
      id: "labrador",
      src: "/profile-media/project_vbot/labrador.jpg",
      alt: "Labrador-like robot strolling beside guests",
    },
    {
      id: "peafowl",
      src: "/profile-media/project_vbot/peafowl.jpg",
      alt: "Peafowl spreading feathers in the courtyard",
    },
    {
      id: "branchestower",
      src: "/profile-media/project_vbot/branchestower.jpg",
      alt: "Tree branches and tower wrapped in snowfall",
    },
    {
      id: "deer",
      src: "/profile-media/project_vbot/deer.jpg",
      alt: "Deer sculpture showcasing Vbot's environmental sensors",
    },
    {
      id: "dessert",
      src: "/profile-media/project_vbot/dessert.jpg",
      alt: "Dessert platter prepared for Vbot's guests",
    },
    {
      id: "marmot",
      src: "/profile-media/project_vbot/marmot.jpg",
      alt: "Marmot resting near the patio heaters",
    },
    {
      id: "staff",
      src: "/profile-media/project_vbot/staff.png",
      alt: "Staff members configuring Vbot's control tablet",
    },
    {
      id: "avatar",
      src: "/profile-media/project_vbot/avatar.jpg",
      alt: "TV wall looping Vbot telemetry visualizations",
    },
  ],
  items: [
    {
      id: 1,
      title: "Terminal Portfolio",
      desc: `This project. A minimalist terminal interface pretending to be a portfolio.
No buttons, no noise - just commands, output, and a trace of how I think.`,
      url: "https://github.com/parallelarc/parallelarc.github.io",
    },
    {
      id: 2,
      title: "Vbot",
      desc: "Vbot is a robot pet designed for family and outdoor life. During Beijing's first snow in 2025, it walked through Purple Jade Villas, meeting friends along the way.",
      url: "https://space.bilibili.com/3546948055337693",
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
