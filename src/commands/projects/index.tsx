import {
  ProjectsIntro,
  ProjectTitle,
  ProjectLayout,
  TextPanel,
  ProjectDesc,
  Link,
} from "../../components/styles/Commands.styled";
import ProjectAlbum from "../../components/ProjectAlbum";
import { PROJECTS_CONTENT, type ProjectImage } from "../../content/siteData";

function Projects() {
  return (
    <div data-testid="projects">
      <ProjectsIntro>{PROJECTS_CONTENT.intro}</ProjectsIntro>
      {PROJECTS_CONTENT.items.map(project => {
        const imageIds = [
          ...new Set(
            project.albumGroups?.flatMap(group => group.imageIds) || []
          ),
        ];
        const images = imageIds
          .map(id => PROJECTS_CONTENT.images.find(image => image.id === id))
          .filter((image): image is ProjectImage => Boolean(image));

        return (
          <ProjectLayout key={project.id}>
            <TextPanel>
              <ProjectTitle>
                {`${project.id}. `}
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.title}
                </Link>
              </ProjectTitle>
              <ProjectDesc>{project.desc}</ProjectDesc>
            </TextPanel>
            {images.length > 0 && (
              <ProjectAlbum
                title={project.title}
                images={images}
                previewImageIds={project.previewImageIds}
              />
            )}
          </ProjectLayout>
        );
      })}
    </div>
  );
}

export default Projects;
