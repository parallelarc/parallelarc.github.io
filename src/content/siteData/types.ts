export interface AboutContent {
  displayName: string;
  introPrefix: string;
  paragraphs: string[];
}

export interface WelcomeContent {
  headline: string;
  intro: string;
  philosophy: string;
  exploreCommand: string;
  askExamples: string[];
  tryCommands: string[];
}

export interface ProjectImage {
  id: string;
  src: string;
  alt: string;
}

export interface ProjectAlbumGroup {
  id: string;
  title: string;
  imageIds: string[];
}

export interface ProjectItem {
  id: number;
  title: string;
  desc: string;
  url: string;
  previewImageIds?: string[];
  albumGroups?: ProjectAlbumGroup[];
}

export interface ProjectsContent {
  intro: string;
  images: ProjectImage[];
  items: ProjectItem[];
}

export type ContactKind = "email" | "github" | "x" | "steam";

export interface ContactGalleryImage {
  src: string;
  alt: string;
}

export interface ContactItem {
  kind: ContactKind;
  title: string;
  url: string;
  desc?: string;
  gallery?: ContactGalleryImage[];
}

export interface ContactContent {
  intro: string;
  items: ContactItem[];
}

export interface SiteContent {
  welcome: WelcomeContent;
  about: AboutContent;
  projects: ProjectsContent;
  contact: ContactContent;
}
