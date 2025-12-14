import { useContext, useEffect } from "react";
import { checkRedirect, getCurrentCmdArry, isArgInvalid } from "../../utils/funcs";
import {
  ProjectContainer,
  ProjectDesc,
  ProjectsIntro,
  ProjectTitle,
  ProjectGallery,
  GalleryItem,
} from "../styles/Projects.styled";
import { termContext } from "../Terminal";
import Usage from "../Usage";

const Projects: React.FC = () => {
  const { arg, history, rerender } = useContext(termContext);

  /* ===== get current command ===== */
  const currentCommand = getCurrentCmdArry(history);

  /* ===== check current command is redirect ===== */
  useEffect(() => {
    if (checkRedirect(rerender, currentCommand, "projects", [1, 2, 3, 4])) {
      projects.forEach(({ id, url }) => {
        id === parseInt(arg[1]) && window.open(url, "_blank");
      });
    }
  }, [arg, rerender, currentCommand]);

  /* ===== check arg is valid ===== */
  const checkArg = () =>
    isArgInvalid(arg, "go", ["1", "2", "3", "4"]) ? (
      <Usage cmd="projects" />
    ) : null;

  return arg.length > 0 || arg.length > 2 ? (
    checkArg()
  ) : (
    <div data-testid="projects">
      <ProjectsIntro>
        “Talk is cheap. Show me the code”? I got you. <br />
        Here are some of my projects you shouldn't misss
      </ProjectsIntro>
      {projects.map(({ id, title, desc, images }) => (
        <ProjectContainer key={id}>
          <ProjectTitle>{`${id}. ${title}`}</ProjectTitle>
          <ProjectDesc>{desc}</ProjectDesc>
          {images && images.length > 0 && (
            <ProjectGallery>
              {images.map(image => (
                <GalleryItem key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </GalleryItem>
              ))}
            </ProjectGallery>
          )}
        </ProjectContainer>
      ))}
      <Usage cmd="projects" marginY />
    </div>
  );
};

type Project = {
  id: number;
  title: string;
  desc: string;
  url: string;
  images?: {
    src: string;
    alt: string;
  }[];
};

const projects: Project[] = [
  {
    id: 1,
    title: "Sat Naing's Blog",
    desc: "My personal blog where I can write down my thoughts and experiences.",
    url: "https://satnaing.dev/blog/",
    images: [
      {
        src: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=900&q=80",
        alt: "Blog dashboard with terminal aesthetic",
      },
      {
        src: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=900&q=80",
        alt: "Markdown editor preview",
      },
      {
        src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
        alt: "Code snippets powering the blog",
      },
    ],
  },
  {
    id: 2,
    title: "Haru Fashion",
    desc: "An ecommerce web application where users can browse various products and make purchases.",
    url: "https://haru-fashion.vercel.app/",
    images: [
      {
        src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
        alt: "Fashion storefront UI",
      },
      {
        src: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
        alt: "Product grid with hover states",
      },
    ],
  },
  {
    id: 3,
    title: "Haru API",
    desc: "A RESTful API developed for the Haru fashion ecommerce project.",
    url: "https://satnaing.github.io/haru-api/",
    images: [
      {
        src: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
        alt: "API metrics and monitoring dashboard",
      },
    ],
  },
  {
    id: 4,
    title: "AstroPaper Blog Theme",
    desc: "A minimal, accessible and SEO-friendly Astro blog theme.",
    url: "https://astro-paper.pages.dev/",
    images: [
      {
        src: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=80",
        alt: "Theme typography showcase",
      },
      {
        src: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=900&q=80",
        alt: "Light and dark mode preview",
      },
    ],
  },
];

export default Projects;
