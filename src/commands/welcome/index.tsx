import {
  HeroContainer,
  PreImg,
  PreName,
  PreNameMobile,
  PreWrapper,
  RainbowText,
} from "../../components/styles/Commands.styled";

function Welcome() {
  return (
    <HeroContainer data-testid="welcome">
      <div className="info-section">
        <PreName>
          {String.raw`

░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░  
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ 
`}
        </PreName>
        <PreWrapper>
          <PreNameMobile>
            {String.raw`

▗▄▄▄▖ ▗▄▖ ▗▖  ▗▖
▐▌   ▐▌ ▐▌ ▝▚▞▘ 
▐▛▀▀▘▐▌ ▐▌  ▐▌  
▐▌   ▝▚▄▞▘▗▞▘▝▚▖
          `}
          </PreNameMobile>
        </PreWrapper>
        <RainbowText>
          I&apos;m a friend of AI.
          <br />
          Welcome to my terminal portfolio.
          <br />
          I enjoy philosophy and games, and care more about brain–computer
          interfaces and immortality than about living on Mars.
        </RainbowText>
      </div>
      <div className="illu-section">
        <PreImg>
          {`
          .:.
         JB#BGJ^                             .~7YGP~
        7&GPG####Y:                        ^5##GG&@#^
        B#7!P&&@&&&P^                   .7B&&&&&GY#@Y
        B#J^^P&&&&&##P^.              .?#&&&&&&P!7#&P
        ?&P^~P&&@&&#GBBJ7J5YYYYJJJY5P?G&#&&&&&B?^Y&&!
         P#?!5#&&&&&P5GBJYGGPPPPPPPG5G#B#&&&&#G7!G&G
         ^BBYYPB&&&#Y7GBYPGPPPPPPPGPG#Y5B&&&#G?~?P#!
         :&&B?!7JPB#BY5#PGPPGGPPGGGBBYPB###&&BJ!?#&.
         .&&#Y7?Y5GB##GGBPPPGGGPGGGGPGBBBG5PJ!~!5&P
          !#GYY5PPPPPPGGPPPPPPPPPPPPPGGGGBGPJ77J#&^
          :JJJ55YY55555PGPPPPPP55PPPPPPPGGGGP55YYPB7
         .J5YY5555P55555PPPPP555PPPPPPPGPPP5YYYYJ7.
         ?YYYYYYYJ?JJ!JJ5PPP5555YJYJ5YY5P55P5Y555YJ^
       .!YY5PPGPPPP5PJ!?5PPPPPP577JJ5JYYPPP55YY55555!
       ?55PB&&&&&&##GPJ5GPPPPGPJ?YPGPG#######GP55Y5557
       :YG&&&&&&&&&&&#BBGGGGGBG5?JP#&&@&@@@@@&#P555557
       :G&&&&&&&&&&&&&##BBBB#B##GP#&&&&&&&&&&&&#PY555^
       ^!5B&&&&&&&&&#&&#&#####&&&#&&&&&&&&&&&&&&#G55Y7
      .!!!7YB&&&&&&&&&&BPPPGB&&&B#&&&&&&&&&&&&&&#GYJ7!
       :77!!?5B&&&&&&&#7!~!~7#&#JG&&&&&&&&&&&&#GPJ77J~
        .7777?YB&&&&&&&5?~7JG&#PPB#&&&&&&&&&&#G5?7??J.
         .777!!?Y5#&&&&&#GB#&&&#&&&&#BPJY5JJ?7!!7????
          .~!!!!~~75#@&&&&&&&&&&&#PJ!~^~^^^~^~!!!77?7~.
            ^!!!!~~~!5GBB55GGBGY7~^^~~~^^^~~~^~!!7!7.
             .~!!~~~~~~~~^^~~~^^^~^~^~^^^~^^~~!!7!7
               .~~!!!~~~~^^~~^^~~~^^^^^~~^~!!!7!7
                  .:^^~^^~~~^~^~^~^^^~~~~!!!!!~
                         .!^~~^~~~~~^^^^~~~~!!!!^
                         ^!~~~~~~~~~^^^^~~~~~!!!:
                         7~~~~~~~~~~~~~~~~~~~!!!.
                        .7!!~~~~~~~^^~~~~~~~~!~!.
                         ^!!!!!!~~~~~~~~~!!!!!!~
                             .:^^~!~!~!!!!!~~~^.
         `}
        </PreImg>
      </div>
    </HeroContainer>
  );
}

export default Welcome;
