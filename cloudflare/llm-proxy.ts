export interface Env {
  "OPENAI_API_KEY"?: string;
  "ANTHROPIC_API_KEY"?: string;
  "ANTHROPIC_COMPAT_API_KEY"?: string;
  "DEFAULT_PROVIDER"?: "openai" | "anthropic" | "anthropic-compatible";
  "OPENAI_MODEL"?: string;
  "ANTHROPIC_MODEL"?: string;
  "ANTHROPIC_COMPAT_MODEL"?: string;
  "ANTHROPIC_COMPAT_BASE_URL"?: string;
  "ANTHROPIC_COMPAT_AUTH_MODE"?: "x-api-key" | "bearer";
  "ANTHROPIC_COMPAT_VERSION"?: string;
  "ALLOWED_ORIGINS"?: string;
}

type Provider = "openai" | "anthropic" | "anthropic-compatible";
type Role = "system" | "user" | "assistant";

interface LlmMessage {
  role: Role;
  content: string;
}

interface ProxyRequestBody {
  provider?: Provider;
  model?: string;
  stream?: boolean;
  messages?: LlmMessage[];
}

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-sonnet-latest";
const DEFAULT_ANTHROPIC_COMPAT_MODEL = "claude-3-5-sonnet-latest";

function parseAllowedOrigins(raw: string | undefined): Set<string> {
  if (!raw || raw.trim().length === 0) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function resolveCorsOrigin(origin: string | null, env: Env): string | null {
  const allowlist = parseAllowedOrigins(env["ALLOWED_ORIGINS"]);
  if (allowlist.size === 0) {
    return origin || "*";
  }

  if (!origin || !allowlist.has(origin)) {
    return null;
  }

  return origin;
}

function setCorsHeaders(headers: Headers, allowedOrigin: string): void {
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  headers.set("Access-Control-Max-Age", "86400");
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  allowedOrigin: string | null
): Response {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  if (allowedOrigin) {
    setCorsHeaders(headers, allowedOrigin);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function normalizeProvider(input: string | undefined, env: Env): Provider {
  if (
    input === "anthropic" ||
    input === "openai" ||
    input === "anthropic-compatible"
  ) {
    return input;
  }

  if (env["DEFAULT_PROVIDER"] === "anthropic-compatible") {
    return "anthropic-compatible";
  }

  if (env["DEFAULT_PROVIDER"] === "anthropic") {
    return "anthropic";
  }
  return "openai";
}

function buildMessagesEndpoint(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (normalized.length === 0) {
    return normalized;
  }
  if (normalized.endsWith("/v1/messages") || normalized.endsWith("/messages")) {
    return normalized;
  }
  if (normalized.endsWith("/v1")) {
    return `${normalized}/messages`;
  }
  return `${normalized}/v1/messages`;
}

async function proxyToOpenAI(
  body: ProxyRequestBody,
  env: Env
): Promise<Response> {
  if (!env["OPENAI_API_KEY"]) {
    return new Response("Missing OPENAI_API_KEY in Worker secrets.", { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${env["OPENAI_API_KEY"]}`,
    },
    body: JSON.stringify({
      model: body.model || env["OPENAI_MODEL"] || DEFAULT_OPENAI_MODEL,
      stream: true,
      temperature: 0.4,
      messages: body.messages,
    }),
  });

  return response;
}

async function proxyToAnthropic(
  body: ProxyRequestBody,
  env: Env
): Promise<Response> {
  if (!env["ANTHROPIC_API_KEY"]) {
    return new Response("Missing ANTHROPIC_API_KEY in Worker secrets.", { status: 500 });
  }

  const messages = body.messages || [];
  const systemPrompt = messages
    .filter((item) => item.role === "system")
    .map((item) => item.content)
    .join("\n\n");

  const conversation = messages
    .filter((item) => item.role !== "system")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "x-api-key": env["ANTHROPIC_API_KEY"],
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: body.model || env["ANTHROPIC_MODEL"] || DEFAULT_ANTHROPIC_MODEL,
      stream: true,
      "max_tokens": 1024,
      temperature: 0.4,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: conversation,
    }),
  });

  return response;
}

async function proxyToAnthropicCompatible(
  body: ProxyRequestBody,
  env: Env
): Promise<Response> {
  if (!env["ANTHROPIC_COMPAT_API_KEY"]) {
    return new Response("Missing ANTHROPIC_COMPAT_API_KEY in Worker secrets.", {
      status: 500,
    });
  }

  const baseUrl = env["ANTHROPIC_COMPAT_BASE_URL"];
  if (!baseUrl) {
    return new Response("Missing ANTHROPIC_COMPAT_BASE_URL in Worker vars.", {
      status: 500,
    });
  }

  const endpoint = buildMessagesEndpoint(baseUrl);
  if (!endpoint) {
    return new Response("Invalid ANTHROPIC_COMPAT_BASE_URL.", { status: 500 });
  }

  const messages = body.messages || [];
  const systemPrompt = messages
    .filter((item) => item.role === "system")
    .map((item) => item.content)
    .join("\n\n");

  const conversation = messages
    .filter((item) => item.role !== "system")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  const authMode = env["ANTHROPIC_COMPAT_AUTH_MODE"] || "bearer";
  if (authMode === "x-api-key") {
    headers["x-api-key"] = env["ANTHROPIC_COMPAT_API_KEY"];
  } else {
    headers.Authorization = `Bearer ${env["ANTHROPIC_COMPAT_API_KEY"]}`;
  }

  const version = env["ANTHROPIC_COMPAT_VERSION"];
  if (version) {
    headers["anthropic-version"] = version;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: body.model || env["ANTHROPIC_COMPAT_MODEL"] || DEFAULT_ANTHROPIC_COMPAT_MODEL,
      stream: true,
      "max_tokens": 1024,
      temperature: 0.4,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: conversation,
    }),
  });

  return response;
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  const allowedOrigin = resolveCorsOrigin(origin, env);

  if (request.method === "OPTIONS") {
    if (!allowedOrigin) {
      return jsonResponse({ error: "Origin not allowed." }, 403, null);
    }

    const headers = new Headers();
    setCorsHeaders(headers, allowedOrigin);
    return new Response(null, { status: 204, headers });
  }

  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        service: "llm-proxy",
      },
      200,
      allowedOrigin
    );
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, allowedOrigin);
  }

  if (!allowedOrigin) {
    return jsonResponse({ error: "Origin not allowed." }, 403, null);
  }

  let body: ProxyRequestBody;
  try {
    body = (await request.json()) as ProxyRequestBody;
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON payload." }, 400, allowedOrigin);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonResponse({ error: "messages is required." }, 400, allowedOrigin);
  }

  if (!body.messages.every((item) => item && typeof item.content === "string")) {
    return jsonResponse({ error: "messages must contain valid content strings." }, 400, allowedOrigin);
  }

  const provider = normalizeProvider(body.provider, env);
  const upstream =
    provider === "anthropic"
      ? await proxyToAnthropic(body, env)
      : provider === "anthropic-compatible"
        ? await proxyToAnthropicCompatible(body, env)
        : await proxyToOpenAI(body, env);

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text();
    return jsonResponse(
      {
        error: `${provider} upstream error`,
        detail: errorText || upstream.statusText,
      },
      upstream.status || 500,
      allowedOrigin
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("Content-Type") || "text/event-stream; charset=utf-8"
  );
  headers.set("Cache-Control", "no-cache");
  setCorsHeaders(headers, allowedOrigin);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown worker error.";
      return jsonResponse({ error: message }, 500, request.headers.get("Origin"));
    }
  },
};
