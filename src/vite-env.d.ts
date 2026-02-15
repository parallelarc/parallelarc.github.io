/// <reference types="vite/client" />

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    id: string;
    name: string;
    colors: {
      body: string;
      scrollHandle: string;
      scrollHandleHover: string;
      primary: string;
      secondary: string;
      accent: string;
      bg: string;
      text: {
        100: string;
        200: string;
        300: string;
        400: string;
      };
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_LLM_PROVIDER?: "openai" | "anthropic" | "anthropic-compatible";
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_LLM_ANTHROPIC_COMPAT_API_KEY?: string;
  readonly VITE_LLM_PROXY_URL?: string;
  readonly VITE_LLM_OPENAI_BASE_URL?: string;
  readonly VITE_LLM_ANTHROPIC_BASE_URL?: string;
  readonly VITE_LLM_ANTHROPIC_COMPAT_BASE_URL?: string;
  readonly VITE_LLM_ANTHROPIC_COMPAT_AUTH_MODE?: "x-api-key" | "bearer";
  readonly VITE_LLM_ANTHROPIC_COMPAT_VERSION?: string;
  readonly VITE_LLM_OPENAI_MODEL?: string;
  readonly VITE_LLM_ANTHROPIC_MODEL?: string;
  readonly VITE_LLM_ANTHROPIC_COMPAT_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
