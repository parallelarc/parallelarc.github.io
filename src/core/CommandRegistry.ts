import { commands } from "../commands";

const byName = new Map(commands.map(command => [command.name, command]));

export const commandRegistry = {
  get: (name: string) => byName.get(name),
  getVisible: () => commands.filter(command => !command.hidden),
  resolveInput(rawInput: string) {
    const raw = rawInput.trim();
    const tokens = raw ? raw.split(/\s+/) : [];
    const isExplicitCommand = raw.startsWith("/");
    const commandName = (tokens[0] || "").toLowerCase().replace(/^\//, "");
    const commandExists = byName.has(commandName);
    return {
      raw,
      mode:
        isExplicitCommand || commandExists
          ? ("command" as const)
          : ("ai" as const),
      isExplicitCommand,
      commandName,
      args: tokens.slice(1),
      commandExists,
    };
  },
};
