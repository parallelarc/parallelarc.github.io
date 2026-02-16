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
import { PROJECTS_CONTENT, type ProjectImage } from "../../content/siteData";

type ImageOrientation = "landscape" | "portrait" | "square";

type GroupLayout = "3h" | "3v" | "2h1v" | "1h2v";

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
    PROJECTS_CONTENT.items.forEach((project) => {
      if (project.albumGroups) {
        project.albumGroups.forEach((group) => {
          const resolvedImages = group.imageIds
            .map((id) => PROJECTS_CONTENT.images.find((img) => img.id === id))
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
      <ProjectsIntro>{PROJECTS_CONTENT.intro}</ProjectsIntro>

      {PROJECTS_CONTENT.items.map((project) => (
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
                    .map((id) => PROJECTS_CONTENT.images.find((img) => img.id === id))
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
