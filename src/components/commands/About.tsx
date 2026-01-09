import { AboutWrapper, Divider, HighlightSpan, Link } from "../styles/Commands.styled";

const About: React.FC = () => {
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
        Previously a researcher in{" "}
        <Link
          href="https://group.iiis.tsinghua.edu.cn/~marslab/#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MARS Lab
        </Link>{" "}
        at IIIS, Tsinghua University, working with Prof. Hang Zhao. I
        collaborated with Xiaomi Auto and Li Auto.
      </p>
    </AboutWrapper>
  );
};

export default About;
