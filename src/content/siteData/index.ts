import { ABOUT_CONTENT } from "./about";
import { CONTACT_CONTENT } from "./contact";
import { PROJECTS_CONTENT } from "./projects";
import { WELCOME_CONTENT } from "./welcome";
import type { SiteContent } from "./types";

export * from "./types";
export { ABOUT_CONTENT } from "./about";
export { CONTACT_CONTENT } from "./contact";
export { PROJECTS_CONTENT } from "./projects";
export { WELCOME_CONTENT } from "./welcome";

export const siteContent: SiteContent = {
  welcome: WELCOME_CONTENT,
  about: ABOUT_CONTENT,
  projects: PROJECTS_CONTENT,
  contact: CONTACT_CONTENT,
};
