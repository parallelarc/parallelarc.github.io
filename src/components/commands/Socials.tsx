import { ProjectsIntro } from "../styles/Projects.styled";
import { Cmd, CmdDesc, CmdLink, CmdList, HelpWrapper } from "../styles/Help.styled";

type SocialLink = {
  id: number;
  title: string;
  url: string;
  desc?: string;
};

const Socials: React.FC = () => {
  return (
    <HelpWrapper data-testid="socials">
      <ProjectsIntro>Here are my social links</ProjectsIntro>
      {socials.map(({ id, title, url, desc }) => (
        <CmdList key={title}>
          <Cmd>{id}.</Cmd>{" "}
          <CmdLink href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </CmdLink>
          {desc && <CmdDesc> – {desc}</CmdDesc>}
        </CmdList>
      ))}
    </HelpWrapper>
  );
};

const socials: SocialLink[] = [
  {
    id: 1,
    title: "GitHub",
    url: "https://github.com/parallelarc",
  },
  {
    id: 2,
    title: "Steam",
    url: "https://steamcommunity.com/id/parallelarc",
  },
];

export default Socials;
