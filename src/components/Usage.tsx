import { UsageDiv } from "./styles/Output.styled";

type Props = {
  marginY?: boolean;
};

function Usage({ marginY = false }: Props) {
  return (
    <UsageDiv data-testid="themes-invalid-arg" marginY={marginY}>
      Usage: themes set &lt;theme-name&gt; <br />
      eg: themes set ubuntu
    </UsageDiv>
  );
}

export default Usage;
