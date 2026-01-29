import { AboutWrapper, HighlightSpan } from "../../components/styles/Commands.styled";

function About() {
  return (
    <AboutWrapper data-testid="about">
      <p>
        Hi, my name is <HighlightSpan>Foxiv</HighlightSpan>.
      </p>
      <p>
        My work focuses on robotics, algorithms, and AI systems. I am currently
        an algorithm engineer at a cool robotics company.
      </p>
      <p>
        Previously a researcher at IIIS, Tsinghua University. I
        collaborated with Xiaomi Auto and Li Auto.
      </p>
    </AboutWrapper>
  );
}

export default About;
