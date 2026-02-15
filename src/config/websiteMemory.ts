const ABOUT_MEMORY = [
  "Name: Foxiv (also referenced as foxgod in this site context).",
  "Focus: robotics, algorithms, and AI systems.",
  "Current role: algorithm engineer at a robotics company.",
  "Previous affiliation: IIIS, Tsinghua University; collaborations with Xiaomi Auto and Li Auto.",
];

const PROJECT_MEMORY = [
  "Terminal Portfolio: minimalist command-driven personal site.",
  "Vbot: robot pet for family/outdoor scenarios.",
  "Jarvis: gesture-based interface controlling 3D objects on 2D screens.",
];

const BLOG_MEMORY = [
  "Blog content is sourced from GitHub issues with label 'blog'.",
  "Users can browse blog posts with /blogs interactive mode.",
];

export const WEBSITE_MEMORY_PROMPT = `
Website memory (always available context):

[about]
${ABOUT_MEMORY.map((item) => `- ${item}`).join("\n")}

[projects]
${PROJECT_MEMORY.map((item) => `- ${item}`).join("\n")}

[blog]
${BLOG_MEMORY.map((item) => `- ${item}`).join("\n")}
`.trim();
