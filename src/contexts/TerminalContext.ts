import { createContext } from "react";

export type Term = {
  arg: string[];
  index: number;
  isLatest: boolean;
  entryId?: string;
};

export const termContext = createContext<Term>({
  arg: [],
  index: 0,
  isLatest: false,
});
