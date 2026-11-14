import { useState } from "react";
import type { ProjectImage } from "../content/siteData";
import { usePhotoGestures } from "../hooks/usePhotoGestures";
import TransitionPhoto from "./TransitionPhoto";
import PhotoViewer from "./PhotoViewer";
import {
  Album,
  AlbumAction,
  AlbumPreview,
  MorePhotos,
  PhotoCount,
  PreviewImage,
} from "./styles/ProjectAlbum.styled";
type Props = {
  title: string;
  images: ProjectImage[];
  previewImageIds?: string[];
};

function ProjectAlbum({ title, images, previewImageIds = [] }: Props) {
  const preferred = previewImageIds
    .map(id => images.find(image => image.id === id))
    .filter((image): image is ProjectImage => Boolean(image));
  const photos = [
    ...new Map(
      [...preferred, ...images].map(image => [image.id, image])
    ).values(),
  ];
  const [previewIndex, setPreviewIndex] = useState(0);
  const preview = photos
    .slice(0, Math.min(4, photos.length))
    .map((_, offset) => photos[(previewIndex + offset) % photos.length]);
  const remaining = photos.length - preview.length;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const previewGestures = usePhotoGestures<HTMLButtonElement>(step => {
    setPreviewIndex(index => (index + step + photos.length) % photos.length);
  }, photos.length > 1);
  if (photos.length === 0) return null;

  return (
    <Album aria-label={`${title} photos`}>
      <AlbumPreview $thumbnails={preview.length - 1}>
        {preview.map((image, index) => (
          <PreviewImage
            key={index}
            type="button"
            $cover={index === 0}
            aria-label={`Open photo ${
              ((previewIndex + index) % photos.length) + 1
            } of ${photos.length}: ${image.alt}`}
            {...(index === 0 ? previewGestures : {})}
            onClick={() => {
              setActiveIndex((previewIndex + index) % photos.length);
            }}
          >
            <TransitionPhoto image={image} lazy />
            {index === 0 && (
              <PhotoCount aria-hidden="true">
                {previewIndex + 1} / {photos.length}
              </PhotoCount>
            )}
            {index === preview.length - 1 && remaining > 0 && (
              <MorePhotos aria-hidden="true">+{remaining}</MorePhotos>
            )}
          </PreviewImage>
        ))}
      </AlbumPreview>
      <AlbumAction
        type="button"
        onClick={() => {
          setActiveIndex(previewIndex);
        }}
      >
        [ View all {photos.length} {photos.length === 1 ? "photo" : "photos"} →
        ]
      </AlbumAction>

      {activeIndex !== null && (
        <PhotoViewer
          title={title}
          photos={photos}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </Album>
  );
}

export default ProjectAlbum;
