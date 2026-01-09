import { UsageDiv } from "./styles/Output.styled";

type Props = {
  marginY?: boolean;
};

const arg = {
  themes: { placeholder: "theme-name", example: "ubuntu" },
};

const Usage: React.FC<Props> = ({ marginY = false }) => {
  const action = "set";
  return (
    <UsageDiv data-testid="themes-invalid-arg" marginY={marginY}>
      Usage: themes {action} &#60;{arg.themes.placeholder}&#62; <br />
      eg: themes {action} {arg.themes.example}
    </UsageDiv>
  );
};

export default Usage;
