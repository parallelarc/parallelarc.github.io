import {
  ProjectContainer,
  ProjectDesc,
  ProjectsIntro,
  ProjectTitle,
  ProjectGallery,
  GalleryItem,
} from "../styles/Projects.styled";

const Projects: React.FC = () => (
  <div data-testid="projects">
    <ProjectsIntro>
      Some things I’ve made, and moments they passed through.
    </ProjectsIntro>
    {projects.map(({ id, title, desc, images }) => (
      <ProjectContainer key={id}>
        <ProjectTitle>{`${id}. ${title}`}</ProjectTitle>
        <ProjectDesc>{desc}</ProjectDesc>
        {images && images.length > 0 && (
          <ProjectGallery>
            {images.map(image => (
              <GalleryItem
                key={image.src}
                className={image.orientation ? `orientation-${image.orientation}` : undefined}
                data-orientation={image.orientation}
              >
                <img
                  src={resolveAsset(image.src)}
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
  </div>
);

type Project = {
  id: number;
  title: string;
  desc: string;
  url: string;
  images?: {
    src: string;
    alt: string;
    orientation?: "portrait" | "landscape" | "panorama";
  }[];
};

const resolveAsset = (src: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const baseNormalized = base.endsWith("/") ? base.slice(0, -1) : base;
  const srcNormalized = src.startsWith("/") ? src : `/${src}`;
  return `${baseNormalized}${srcNormalized}`;
};

const projects: Project[] = [
  {
    id: 1,
    title: "Vbot",
    desc:
      "Vbot is a robot pet designed for family and outdoor life. During Beijing’s first snow in 2025, it walked through Purple Jade Villas, meeting friends along the way.",
    url: "https://example.com/vbot",
    images: [
      {
        src: "/profile-media/project_vbot/husky.jpg",
        alt: "Husky robot companion bounding through fresh snow",
        orientation: "panorama",
      },
      {
        src: "/profile-media/project_vbot/labrador.jpg",
        alt: "Labrador-like robot strolling beside guests",
        orientation: "landscape",
      },
      {
        src: "/profile-media/project_vbot/peafowl.jpg",
        alt: "Peafowl spreading feathers in the courtyard",
        orientation: "portrait",
      },
      {
        src: "/profile-media/project_vbot/branchestower.jpg",
        alt: "Tree branches and tower wrapped in snowfall",
        orientation: "landscape",
      },
      {
        src: "/profile-media/project_vbot/deer.jpg",
        alt: "Deer sculpture showcasing Vbot’s environmental sensors",
        orientation: "landscape",
      },
      {
        src: "/profile-media/project_vbot/dessert.jpg",
        alt: "Dessert platter prepared for Vbot’s guests",
        orientation: "portrait",
      },
      {
        src: "/profile-media/project_vbot/marmot.jpg",
        alt: "Marmot resting near the patio heaters",
        orientation: "portrait",
      },
      {
        src: "/profile-media/project_vbot/staff.png",
        alt: "Staff members configuring Vbot’s control tablet",
        orientation: "portrait",
      },
      {
        src: "/profile-media/project_vbot/avatar.jpg",
        alt: "TV wall looping Vbot telemetry visualizations",
        orientation: "portrait",
      },
    ],
  },
];

export default Projects;
