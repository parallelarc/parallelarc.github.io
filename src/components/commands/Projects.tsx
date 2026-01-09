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
} from "../styles/Commands.styled";

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
  images?: ProjectImage[];
};

type AlbumGroup = {
  id: string;
  title: string;
  imageIds: string[];
};

type AlbumLayout = {
  layout: GroupLayout;
  gridAreas: string[];
};

const assetBase = (() => {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
})();

const resolveAsset = (src: string) => {
  const srcNormalized = src.startsWith("/") ? src : `/${src}`;
  return `${assetBase}${srcNormalized}`;
};

const getOrientationFromSize = (
  naturalWidth: number,
  naturalHeight: number
): ImageOrientation => {
  if (naturalWidth > naturalHeight * 1.2) return "landscape";
  if (naturalHeight > naturalWidth * 1.2) return "portrait";
  return "square";
};

const detectGroupLayout = (orientations: ImageOrientation[]): GroupLayout => {
  if (orientations.length !== 3) return "3v";

  const landscapeCount = orientations.filter(o => o === "landscape").length;
  const portraitCount = orientations.filter(o => o === "portrait").length;

  if (landscapeCount === 3) return "3h";
  if (portraitCount === 3) return "3v";
  if (landscapeCount === 2 && portraitCount === 1) return "2h1v";
  if (landscapeCount === 1 && portraitCount === 2) return "1h2v";

  return "3v";
};

const getGridPositions = (
  layout: GroupLayout,
  orientations: ImageOrientation[]
): string[] => {
  if (layout === "3h") return ["1 / 1 / 2 / 2", "2 / 1 / 3 / 2", "3 / 1 / 4 / 2"];
  if (layout === "3v") return ["1 / 1 / 2 / 2", "1 / 2 / 2 / 3", "1 / 3 / 2 / 4"];

  if (layout === "2h1v") {
    // 左侧2横图竖直堆叠, 右侧1竖图跨2行
    const portraitIndex = orientations.findIndex(o => o === "portrait");
    const positions = ["", "", ""];
    let hIndex = 0;

    orientations.forEach((_, idx) => {
      if (idx === portraitIndex) {
        // 竖图: 第1行开始, 第2列, 跨2行
        positions[idx] = "1 / 2 / 3 / 3";
      } else {
        // 横图: 第1或2行, 第1列
        hIndex++;
        positions[idx] = `${hIndex} / 1 / ${hIndex + 1} / 2`;
      }
    });
    return positions;
  }

  if (layout === "1h2v") {
    // 上方1横图占满宽度, 下方2竖图并排
    const landscapeIndex = orientations.findIndex(o => o === "landscape");
    const positions = ["", "", ""];
    let vCol = 0;

    orientations.forEach((_, idx) => {
      if (idx === landscapeIndex) {
        // 横图: 第1行, 跨2列
        positions[idx] = "1 / 1 / 2 / 3";
      } else {
        // 竖图: 第2行, 第1或2列
        vCol++;
        positions[idx] = `2 / ${vCol} / 3 / ${vCol + 1}`;
      }
    });
    return positions;
  }

  return ["", "", ""];
};

const buildLayout = (orientations: ImageOrientation[]): AlbumLayout => {
  const layout = detectGroupLayout(orientations);
  return { layout, gridAreas: getGridPositions(layout, orientations) };
};

const loadImageOrientation = (src: string): Promise<ImageOrientation> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve(getOrientationFromSize(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => resolve("square");
    img.src = resolveAsset(src);
  });

const useAlbumLayouts = (groups: { id: string; images: ProjectImage[] }[]) => {
  const [layouts, setLayouts] = useState<Record<string, AlbumLayout>>({});

  // Create a stable key based on group IDs and image sources to prevent unnecessary reloads
  const groupsKey = useMemo(
    () => groups.map(g => `${g.id}:${g.images.map(i => i.src).join(',')}`).join('|'),
    [groups]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLayouts = async () => {
      const entries = await Promise.all(
        groups.map(async group => {
          const orientations = await Promise.all(
            group.images.map(image => loadImageOrientation(image.src))
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
  }, [groupsKey]); // Use stable key instead of groups object

  return layouts;
};

const Projects: React.FC = () => {
  const project = projects[0];
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);

  const resolvedImages = useMemo(
    () => projectImages.map(image => ({ ...image, src: resolveAsset(image.src) })),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const imageMap = useMemo(
    () => Object.fromEntries(resolvedImages.map(image => [image.id, image])),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const resolvedGroups = useMemo(
    () =>
      albumGroups.map(group => ({
        ...group,
        images: group.imageIds
          .map(id => imageMap[id])
          .filter(Boolean) as ProjectImage[],
      })),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const layouts = useAlbumLayouts(resolvedGroups);

  const openLightbox = (image: ProjectImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // 监听ESC键关闭灯箱
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

  return (
    <div data-testid="projects">
      <ProjectsIntro>
        Some things I've made, and moments they passed through.
      </ProjectsIntro>

      <ProjectLayout>
        <TextPanel>
          <ProjectTitle>{`${project.id}. ${project.title}`}</ProjectTitle>
          <ProjectDesc>{project.desc}</ProjectDesc>
        </TextPanel>

        <AlbumSection>
          <AlbumGroups>
            {resolvedGroups.map(group => {
              const layout = layouts[group.id]?.layout ?? "3v";
              const gridPositions = layouts[group.id]?.gridAreas ?? [];
              
              // 根据布局类型设置宽度比例
              // 2h1v: 3份宽度 (2个横图 + 1个竖图)
              // 1h2v: 2份宽度 (1个横图 + 2个竖图)
              // 3h 和 3v: 1份宽度 (基础宽度)
              const getFlexRatio = (layoutType: GroupLayout): number => {
                if (layoutType === "2h1v") {
                  return 3; // 3份宽度
                }
                if (layoutType === "1h2v") {
                  return 2; // 2份宽度
                }
                return 1; // 基础宽度 (3h 和 3v)
              };
              
              const flexRatio = getFlexRatio(layout);

              return (
                <AlbumGroup key={group.id} flexRatio={flexRatio}>
                  <AlbumGrid className={`layout-${layout}`}>
                    {group.images.map((image, index) => (
                      <AlbumImage
                        key={image.src}
                        style={{
                          gridArea: gridPositions[index] || "auto",
                        }}
                        onClick={() => openLightbox(image)}
                      >
                        <img
                          src={image.src}
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
      </ProjectLayout>

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
};

const projectImages: ProjectImage[] = [
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
    alt: "Deer sculpture showcasing Vbot’s environmental sensors",
  },
  {
    id: "dessert",
    src: "/profile-media/project_vbot/dessert.jpg",
    alt: "Dessert platter prepared for Vbot’s guests",
  },
  {
    id: "marmot",
    src: "/profile-media/project_vbot/marmot.jpg",
    alt: "Marmot resting near the patio heaters",
  },
  {
    id: "staff",
    src: "/profile-media/project_vbot/staff.png",
    alt: "Staff members configuring Vbot’s control tablet",
  },
  {
    id: "avatar",
    src: "/profile-media/project_vbot/avatar.jpg",
    alt: "TV wall looping Vbot telemetry visualizations",
  },
];

const projects: Project[] = [
  {
    id: 1,
    title: "Vbot",
    desc:
      "Vbot is a robot pet designed for family and outdoor life. During Beijing’s first snow in 2025, it walked through Purple Jade Villas, meeting friends along the way.",
    url: "https://example.com/vbot",
    images: projectImages,
  },
];

const albumGroups: AlbumGroup[] = [
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
];

export default Projects;
