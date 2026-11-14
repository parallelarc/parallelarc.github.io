import Ai from "./ai";
import About from "./about";
import Contact from "./contact";
import Projects from "./projects";
import Welcome from "./welcome";
import Blog from "./blog";
import Clear from "./clear";
import type { Command } from "../types/command";

export const commands: Command[] = [
  {
    name: "ai",
    description: "internal ai conversation handler",
    hidden: true,
    acceptsArgs: true,
    component: Ai,
  },
  {
    name: "about",
    description: "about me",
    component: About,
  },
  {
    name: "contact",
    description: "feel free to reach out",
    component: Contact,
  },
  {
    name: "projects",
    description: "some work, in no particular order",
    acceptsArgs: true,
    component: Projects,
  },
  {
    name: "welcome",
    description: "display hero section",
    component: Welcome,
  },
  {
    name: "blogs",
    description: "open blog interface",
    acceptsArgs: true, // Support: `blog search term` or `blog tag:xxx`
    component: Blog,
  },
  {
    name: "clear",
    description: "clear the terminal",
    component: Clear,
  },
];
