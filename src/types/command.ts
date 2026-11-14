import type { ComponentType } from "react";

export interface Command {
  name: string;
  description: string;
  hidden?: boolean;
  acceptsArgs?: boolean;
  component: ComponentType;
}
