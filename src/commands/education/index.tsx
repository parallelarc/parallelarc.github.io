import { EduIntro, EduList } from "../../components/styles/Commands.styled";
import { Wrapper } from "../../components/styles/Output.styled";

const EDUCATION_DATA = [
  {
    title: "B.Eng. & M.Eng. in Information and Communication Engineering",
    desc: "Beijing University of Posts and Telecommunications (BUPT) | 2017 ~ 2024",
  },
];

function Education() {
  return (
    <Wrapper data-testid="education">
      <EduIntro>I rarely showed up in class.</EduIntro>
      {EDUCATION_DATA.map(({ title, desc }) => (
        <EduList key={title}>
          <div className="title">{title}</div>
          <div className="desc">{desc}</div>
        </EduList>
      ))}
    </Wrapper>
  );
}

export default Education;
