import { EduIntro, EduList } from "../../components/styles/Commands.styled";
import { Wrapper } from "../../components/styles/Output.styled";
import { EDUCATION_CONTENT } from "../../content/siteData";

function Education() {
  return (
    <Wrapper data-testid="education">
      <EduIntro>{EDUCATION_CONTENT.intro}</EduIntro>
      {EDUCATION_CONTENT.items.map(({ title, desc }) => (
        <EduList key={title}>
          <div className="title">{title}</div>
          <div className="desc">{desc}</div>
        </EduList>
      ))}
    </Wrapper>
  );
}

export default Education;
