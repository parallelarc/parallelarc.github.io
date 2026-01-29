import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProjectsIntro,
  ProjectTitle,
  ProjectLayout,
  TextPanel,
  ProjectDesc,
  AlbumSection,
  AlbumGroups,
  AlbumGroup,
  AlbumGrid,
  AlbumImage,
  LightboxOverlay,
  LightboxImage,
  Link,
} from "../../components/styles/Commands.styled";

type ImageOrientation = "landscape" | "portrait" | "square";

type GroupLayout = "3h" | "3v" | "2h1v" | "1h2v";

type ProjectImage = {
  id: string;
  src: string;
  alt: string;
};

type Project = {
  id: number;
  title: string;
  desc: string;
  url: string;
  albumGroups?: {
    id: string;
    title: string;
    imageIds: string[];
  }[];
};

type AlbumLayout = {
  layout: GroupLayout;
  gridAreas: string[];
};

const assetBase = (() => {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
})();

function resolveAsset(src: string): string {
  const srcNormalized = src.startsWith("/") ? src : `/${src}`;
  return `${assetBase}${srcNormalized}`;
}

function getOrientationFromSize(
  naturalWidth: number,
  naturalHeight: number
): ImageOrientation {
  if (naturalWidth > naturalHeight * 1.2) return "landscape";
  if (naturalHeight > naturalWidth * 1.2) return "portrait";
  return "square";
}

function detectGroupLayout(orientations: ImageOrientation[]): GroupLayout {
  if (orientations.length !== 3) return "3v";

  const landscapeCount = orientations.filter((o) => o === "landscape").length;
  const portraitCount = orientations.filter((o) => o === "portrait").length;

  if (landscapeCount === 3) return "3h";
  if (portraitCount === 3) return "3v";
  if (landscapeCount === 2 && portraitCount === 1) return "2h1v";
  if (landscapeCount === 1 && portraitCount === 2) return "1h2v";

  return "3v";
}

function getGridPositions(
  layout: GroupLayout,
  orientations: ImageOrientation[]
): string[] {
  if (layout === "3h") return ["1 / 1 / 2 / 2", "2 / 1 / 3 / 2", "3 / 1 / 4 / 2"];
  if (layout === "3v") return ["1 / 1 / 2 / 2", "1 / 2 / 2 / 3", "1 / 3 / 2 / 4"];

  if (layout === "2h1v") {
    const portraitIndex = orientations.findIndex((o) => o === "portrait");
    const positions = ["", "", ""];
    let hIndex = 0;

    orientations.forEach((_, idx) => {
      if (idx === portraitIndex) {
        positions[idx] = "1 / 2 / 3 / 3";
      } else {
        hIndex++;
        positions[idx] = `${hIndex} / 1 / ${hIndex + 1} / 2`;
      }
    });
    return positions;
  }

  if (layout === "1h2v") {
    const landscapeIndex = orientations.findIndex((o) => o === "landscape");
    const positions = ["", "", ""];
    let vCol = 0;

    orientations.forEach((_, idx) => {
      if (idx === landscapeIndex) {
        positions[idx] = "1 / 1 / 2 / 3";
      } else {
        vCol++;
        positions[idx] = `2 / ${vCol} / 3 / ${vCol + 1}`;
      }
    });
    return positions;
  }

  return ["", "", ""];
}

function buildLayout(orientations: ImageOrientation[]): AlbumLayout {
  const layout = detectGroupLayout(orientations);
  return { layout, gridAreas: getGridPositions(layout, orientations) };
}

function loadImageOrientation(src: string): Promise<ImageOrientation> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(getOrientationFromSize(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => resolve("square");
    img.src = resolveAsset(src);
  });
}

function useAlbumLayouts(groups: { id: string; images: ProjectImage[] }[]) {
  const [layouts, setLayouts] = useState<Record<string, AlbumLayout>>({});

  const groupsKey = useMemo(
    () => groups.map((g) => `${g.id}:${g.images.map((i) => i.src).join(",")}`).join("|"),
    [groups]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLayouts = async () => {
      const entries = await Promise.all(
        groups.map(async (group) => {
          const orientations = await Promise.all(
            group.images.map((image) => loadImageOrientation(image.src))
          );

          return [group.id, buildLayout(orientations)] as const;
        })
      );

      if (!cancelled) {
        setLayouts(Object.fromEntries(entries));
      }
    };

    loadLayouts();

    return () => {
      cancelled = true;
    };
  }, [groupsKey]);

  return layouts;
}

function getFlexRatio(layoutType: GroupLayout): number {
  if (layoutType === "2h1v") return 3;
  if (layoutType === "1h2v") return 2;
  return 1;
}

const PROJECT_IMAGES: ProjectImage[] = [
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
];

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Terminal Portfolio",
    desc: `This project. A minimalist terminal interface pretending to be a portfolio.
No buttons, no noise — just commands, output, and a trace of how I think.`,
    url: "https://github.com/parallelarc/parallelarc.github.io",
  },
  {
    id: 2,
    title: "Vbot",
    desc:
      "Vbot is a robot pet designed for family and outdoor life. During Beijing's first snow in 2025, it walked through Purple Jade Villas, meeting friends along the way.",
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
    desc:
      "Jarvis is a gesture-based interface for controlling 3D objects on 2D screens. A new interaction for personal AI assistants. No AI involved, for now.",
    url: "https://github.com/parallelarc/Jarvis",
  },
];

function Projects() {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);

  const openLightbox = (image: ProjectImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, closeLightbox]);

  const allGroups = useMemo(() => {
    const groups: { id: string; images: ProjectImage[] }[] = [];
    PROJECTS.forEach((project) => {
      if (project.albumGroups) {
        project.albumGroups.forEach((group) => {
          const resolvedImages = group.imageIds
            .map((id) => PROJECT_IMAGES.find((img) => img.id === id))
            .filter(Boolean) as ProjectImage[];
          groups.push({ id: group.id, images: resolvedImages });
        });
      }
    });
    return groups;
  }, []);

  const layouts = useAlbumLayouts(allGroups);

  return (
    <div data-testid="projects">
      <ProjectsIntro>
        Some things I&apos;ve made, and moments they passed through.
      </ProjectsIntro>

      {PROJECTS.map((project) => (
        <ProjectLayout key={project.id}>
          <TextPanel>
            <ProjectTitle>
              {`${project.id}. `}
              <Link href={project.url} target="_blank" rel="noopener noreferrer">
                {project.title}
              </Link>
            </ProjectTitle>
            <ProjectDesc>{project.desc}</ProjectDesc>
          </TextPanel>

          {project.albumGroups && project.albumGroups.length > 0 && (
            <AlbumSection>
              <AlbumGroups>
                {project.albumGroups.map((group) => {
                  const resolvedImages = group.imageIds
                    .map((id) => PROJECT_IMAGES.find((img) => img.id === id))
                    .filter(Boolean) as ProjectImage[];

                  const layout = layouts[group.id]?.layout ?? "3v";
                  const gridPositions = layouts[group.id]?.gridAreas ?? [];

                  return (
                    <AlbumGroup key={group.id} flexRatio={getFlexRatio(layout)}>
                      <AlbumGrid className={`layout-${layout}`}>
                        {resolvedImages.map((image, index) => (
                          <AlbumImage
                            key={image.id}
                            style={{
                              gridArea: gridPositions[index] || "auto",
                            }}
                            onClick={() =>
                              openLightbox({
                                ...image,
                                src: resolveAsset(image.src),
                              })
                            }
                          >
                            <img
                              src={resolveAsset(image.src)}
                              alt={image.alt}
                              loading="lazy"
                              decoding="async"
                            />
                          </AlbumImage>
                        ))}
                      </AlbumGrid>
                    </AlbumGroup>
                  );
                })}
              </AlbumGroups>
            </AlbumSection>
          )}
        </ProjectLayout>
      ))}

      {selectedImage && (
        <LightboxOverlay onClick={closeLightbox}>
          <LightboxImage
            src={selectedImage.src}
            alt={selectedImage.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </LightboxOverlay>
      )}
    </div>
  );
}

export default Projects;
