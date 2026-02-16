import { siteContent } from "../../content/siteData";
import type { SiteContent } from "../../content/siteData";
import type { BlogPost } from "../../types/github";

export interface SectionTokenBudget {
  welcome: number;
  about: number;
  projects: number;
  contact: number;
  education: number;
  blog: number;
}

export interface BuildWebsiteContextOptions {
  content?: SiteContent;
  blogPosts?: BlogPost[];
  budget?: Partial<SectionTokenBudget>;
  maxBlogPosts?: number;
}

export const DEFAULT_WEBSITE_CONTEXT_BUDGET: SectionTokenBudget = {
  welcome: 180,
  about: 250,
  projects: 900,
  contact: 200,
  education: 200,
  blog: 650,
};

const DEFAULT_MAX_BLOG_POSTS = 20;

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

function clipLineToBudget(line: string, budget: number): string {
  const maxChars = Math.max(8, budget * 4);
  if (line.length <= maxChars) return line;
  if (maxChars <= 3) return line.slice(0, maxChars);
  return `${line.slice(0, maxChars - 3)}...`;
}

function fitSectionToBudget(
  header: string,
  lines: string[],
  sectionBudget: number
): string {
  const allLines = [header, ...lines];
  const fullText = allLines.join("\n");
  if (estimateTokenCount(fullText) <= sectionBudget) {
    return fullText;
  }

  const kept = [header];

  for (const line of lines) {
    const next = [...kept, line].join("\n");
    if (estimateTokenCount(next) > sectionBudget) {
      break;
    }
    kept.push(line);
  }

  if (kept.length === 1) {
    const fallback = lines[0] || "- unavailable";
    kept.push(clipLineToBudget(fallback, Math.max(1, sectionBudget - 8)));
    return kept.join("\n");
  }

  if (kept.length < allLines.length) {
    kept.push("- ...");
  }

  return kept.join("\n");
}

function buildAboutLines(content: SiteContent): string[] {
  const lines = [`- Name: ${content.about.displayName}`];
  content.about.paragraphs.forEach((paragraph) => {
    lines.push(`- ${paragraph}`);
  });
  return lines;
}

function buildWelcomeLines(content: SiteContent): string[] {
  return [
    `- ${content.welcome.headline}`,
    `- ${content.welcome.intro}`,
    `- ${content.welcome.philosophy}`,
    `- Explore command: ${content.welcome.exploreCommand}`,
    `- Ask examples: ${content.welcome.askExamples.join(" / ")}`,
    `- Suggested commands: ${content.welcome.tryCommands.join(", ")}`,
  ];
}

function buildProjectsLines(content: SiteContent): string[] {
  return content.projects.items.map(
    (project) =>
      `- ${project.id}. ${project.title}: ${project.desc} (link: ${project.url})`
  );
}

function buildContactLines(content: SiteContent): string[] {
  return content.contact.items.map((item) => {
    const descSuffix = item.desc ? ` | note: ${item.desc}` : "";
    return `- ${item.title}: ${item.url}${descSuffix}`;
  });
}

function buildEducationLines(content: SiteContent): string[] {
  return content.education.items.map(
    (item) => `- ${item.title} | ${item.desc}`
  );
}

function formatBlogDate(dateText: string): string {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return "unknown-date";
  }
  return date.toISOString().slice(0, 10);
}

function buildBlogLines(
  posts: BlogPost[] | undefined,
  maxBlogPosts: number
): string[] {
  if (!posts || posts.length === 0) {
    return ["- No blog snapshot available right now."];
  }

  return posts.slice(0, maxBlogPosts).map((post) => {
    const tags = post.labels.filter((label) => label.toLowerCase() !== "blog");
    const tagsText = tags.length > 0 ? tags.join(", ") : "none";
    return `- ${formatBlogDate(post.createdAt)} | ${post.title} | tags: ${tagsText}`;
  });
}

function toSectionPrompt(
  header: string,
  lines: string[],
  budget: number
): string {
  return fitSectionToBudget(header, lines, budget);
}

export function buildWebsiteContextPrompt(
  options: BuildWebsiteContextOptions = {}
): string {
  const content = options.content ?? siteContent;
  const budget = {
    ...DEFAULT_WEBSITE_CONTEXT_BUDGET,
    ...(options.budget || {}),
  };
  const maxBlogPosts = options.maxBlogPosts ?? DEFAULT_MAX_BLOG_POSTS;

  const welcome = toSectionPrompt(
    "[welcome]",
    buildWelcomeLines(content),
    budget.welcome
  );
  const about = toSectionPrompt("[about]", buildAboutLines(content), budget.about);
  const projects = toSectionPrompt(
    "[projects]",
    buildProjectsLines(content),
    budget.projects
  );
  const contact = toSectionPrompt(
    "[contact]",
    buildContactLines(content),
    budget.contact
  );
  const education = toSectionPrompt(
    "[education]",
    buildEducationLines(content),
    budget.education
  );
  const blog = toSectionPrompt(
    "[blog]",
    buildBlogLines(options.blogPosts, maxBlogPosts),
    budget.blog
  );

  return [
    "Website memory (derived from site content):",
    "",
    welcome,
    "",
    about,
    "",
    projects,
    "",
    contact,
    "",
    education,
    "",
    blog,
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toBlogPost(candidate: unknown): BlogPost | null {
  if (!isRecord(candidate)) return null;

  const id = asNumber(candidate.id);
  if (id === 0) return null;

  const createdAt = asString(candidate.createdAt);
  if (!createdAt) return null;

  const content = asString(candidate.content);

  return {
    id,
    number: asNumber(candidate.number, id),
    title: asString(candidate.title, "Untitled"),
    content,
    createdAt,
    updatedAt: asString(candidate.updatedAt, createdAt),
    author: asString(candidate.author, "unknown"),
    authorAvatar: asString(candidate.authorAvatar),
    authorUrl: asString(candidate.authorUrl),
    labels: asStringArray(candidate.labels),
    url: asString(candidate.url),
    commentsCount: asNumber(candidate.commentsCount),
    excerpt: asString(candidate.excerpt, content.slice(0, 150)),
  };
}

export async function loadStaticBlogPostsSnapshot(
  staticUrl = "/blog.json",
  signal?: AbortSignal
): Promise<BlogPost[]> {
  try {
    const response = await fetch(staticUrl, { signal });
    if (!response.ok) return [];

    const raw = await response.json();
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => toBlogPost(item))
      .filter((item): item is BlogPost => Boolean(item));
  } catch (_error) {
    return [];
  }
}
