import { describe, it, expect, vi } from "vitest";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { render, screen, userEvent } from "../utils/test-utils";
import Terminal, { commands } from "../components/Terminal";

// setup function
function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const allCmds = commands.map(cmdObj => cmdObj.cmd);

describe("Terminal Component", () => {
  let terminalInput: HTMLInputElement;
  let user: UserEvent;

  beforeEach(() => {
    const termSetup = setup(<Terminal />);
    user = termSetup.user;
    terminalInput = screen.getByTitle("terminal-input");
  });

  describe("Input Features & Initial State", () => {
    it("should display welcome cmd by default", () => {
      expect(screen.getByTestId("input-command").textContent).toBe("welcome");
    });

    it("should change input value", async () => {
      await user.type(terminalInput, "demo");
      expect(terminalInput.value).toBe("demo");
    });

    it("should clear input value when click enter", async () => {
      await user.type(terminalInput, "demo{enter}");
      expect(terminalInput.value).toBe("");
    });
  });

  describe("Input Commands", () => {
    it("should return 'command not found' when input value is invalid", async () => {
      await user.type(terminalInput, "demo{enter}");
      expect(screen.getByTestId("not-found-0").innerHTML).toBe(
        "command not found: demo"
      );
    });

    it("should ignore whitespace-only input", async () => {
      await user.type(terminalInput, "    {enter}");
      expect(screen.queryByTestId("not-found-0")).toBeNull();
      expect(screen.getAllByTestId("input-command").length).toBe(1);
    });

    it("should display cmd history when user type 'history' cmd", async () => {
      await user.type(terminalInput, "about{enter}");
      await user.type(terminalInput, "history{enter}");

      const commands =
        screen.getByTestId("latest-output").firstChild?.childNodes;

      expect(commands?.length).toBe(3);

      const typedCommands: string[] = [];
      commands?.forEach(cmd => {
        typedCommands.push(cmd.textContent || "");
      });

      expect(typedCommands).toEqual(["welcome", "about", "history"]);
    });

    it("should clear everything when user type 'clear' cmd", async () => {
      await user.type(terminalInput, "clear{enter}");
      expect(screen.getByTestId("terminal-wrapper").children.length).toBe(1);
    });

    it("should render Welcome component when user type 'welcome' cmd", async () => {
      await user.type(terminalInput, "clear{enter}");
      await user.type(terminalInput, "welcome{enter}");
      expect(screen.getByTestId("welcome")).toBeInTheDocument();
    });

    const otherCmds = [
      "about",
      "contact",
      "education",
      "help",
      "history",
      "projects",
    ];
    otherCmds.forEach(cmd => {
      it(`should render ${cmd} component when user type '${cmd}' cmd`, async () => {
        await user.type(terminalInput, `${cmd}{enter}`);
        expect(screen.getByTestId(`${cmd}`)).toBeInTheDocument();
      });
    });
  });

  describe("Projects command behavior", () => {
    beforeEach(() => {
      window.open = vi.fn();
    });

    it("should not redirect when user type 'projects go 1' cmd", async () => {
      await user.type(terminalInput, "projects go 1{enter}");
      expect(window.open).not.toHaveBeenCalled();
    });

    it("should still render projects output even when args are provided", async () => {
      await user.type(terminalInput, "projects go 1{enter}");
      expect(await screen.findByTestId("projects")).toBeInTheDocument();
      expect(screen.queryByTestId("projects-invalid-arg")).toBeNull();
    });
  });

  describe("Export and env commands", () => {
    it("should block modifying OPENAI_SYSTEM_PROMPT from export", async () => {
      await user.type(terminalInput, "export OPENAI_SYSTEM_PROMPT=custom{enter}");
      const exportOutput = await screen.findByTestId("export");
      expect(exportOutput.textContent).toContain(
        "OPENAI_SYSTEM_PROMPT cannot be modified from this terminal."
      );
    });

    it("should be silent when setting OPENAI_API_KEY", async () => {
      await user.type(terminalInput, "clear{enter}");
      await user.type(terminalInput, "export OPENAI_API_KEY=test-key{enter}");
      expect(screen.queryByTestId("export")).toBeNull();
      expect(screen.queryByTestId("usage-output")).toBeNull();
    });

    it("should list environment variables with env command", async () => {
      await user.type(terminalInput, "env{enter}");
      const envOutput = await screen.findByTestId("env");
      const content = envOutput.textContent || "";
      expect(content).toContain("OPENAI_API_KEY");
      expect(content).toContain("OPENAI_BASE_URL");
      expect(content).toContain("OPENAI_MODEL");
      expect(content).toContain("OPENAI_SYSTEM_PROMPT");
    });
  });

  describe("Invalid Arguments", () => {
    const usageCmds = allCmds.filter(
      cmd => !["export"].includes(cmd)
    );

    usageCmds.forEach(cmd => {
      it(`should return usage component for ${cmd} cmd with invalid arg`, async () => {
        await user.type(terminalInput, `${cmd} sth{enter}`);
        expect(screen.getByTestId("usage-output").innerHTML).toBe(
          `Usage: ${cmd}`
        );
      });
    });
  });

  describe("Keyboard shortcuts", () => {
    const autocompleteCmds = allCmds;

    autocompleteCmds.forEach(cmd => {
      it(`should autocomplete '${cmd}' when 'Tab' is pressed`, async () => {
        await user.type(terminalInput, cmd.slice(0, 2));
        await user.tab();
        expect(terminalInput.value).toBe(cmd);
      });
    });

    autocompleteCmds.forEach(cmd => {
      it(`should autocomplete '${cmd}' when 'Ctrl + i' is pressed`, async () => {
        await user.type(terminalInput, cmd.slice(0, 2));
        await user.keyboard("{Control>}i{/Control}");
        expect(terminalInput.value).toBe(cmd);
      });
    });

    it("should clear when 'Ctrl + l' is pressed", async () => {
      await user.type(terminalInput, "history{enter}");
      await user.keyboard("{Control>}l{/Control}");
      expect(screen.getByTestId("terminal-wrapper").children.length).toBe(1);
    });

    it("should go to previous back and forth when 'Up & Down Arrow' is pressed", async () => {
      await user.type(terminalInput, "about{enter}");
      await user.type(terminalInput, "help{enter}");
      await user.type(terminalInput, "clear{enter}");
      await user.keyboard("{arrowup>3}");
      expect(terminalInput.value).toBe("about");
      await user.keyboard("{arrowup>2}");
      expect(terminalInput.value).toBe("welcome");
      await user.keyboard("{arrowdown>2}");
      expect(terminalInput.value).toBe("help");
      await user.keyboard("{arrowdown}");
      expect(terminalInput.value).toBe("clear");
      await user.keyboard("{arrowdown}");
      expect(terminalInput.value).toBe("");
    });
  });
});
