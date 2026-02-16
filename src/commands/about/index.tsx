import { AboutWrapper, HighlightSpan } from "../../components/styles/Commands.styled";
import { ABOUT_CONTENT } from "../../content/siteData";

function About() {
  return (
    <AboutWrapper data-testid="about">
      <p>
        {ABOUT_CONTENT.introPrefix} <HighlightSpan>{ABOUT_CONTENT.displayName}</HighlightSpan>.
      </p>
      {ABOUT_CONTENT.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </AboutWrapper>
  );
}

export default About;
