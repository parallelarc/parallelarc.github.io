export type LlmProvider = "openai" | "anthropic" | "anthropic-compatible";

export type LlmRole = "system" | "user" | "assistant";

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface StreamLlmOptions {
  provider?: LlmProvider;
  model?: string;
  apiKey?: string;
  messages: LlmMessage[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

export interface StreamLlmResult {
  provider: LlmProvider;
  model: string;
  text: string;
}

type StreamEvent = {
  event?: string;
  data: string;
};

function readEnvProvider(value?: string): LlmProvider {
  if (value === "anthropic-compatible") return "anthropic-compatible";
  return value === "anthropic" ? "anthropic" : "openai";
}

function getDefaultModel(provider: LlmProvider): string {
  if (provider === "anthropic-compatible") {
    return (
      import.meta.env.VITE_LLM_ANTHROPIC_COMPAT_MODEL ||
      import.meta.env.VITE_LLM_ANTHROPIC_MODEL ||
      "claude-3-5-sonnet-latest"
    );
  }
  if (provider === "anthropic") {
    return (
      import.meta.env.VITE_LLM_ANTHROPIC_MODEL || "claude-3-5-sonnet-latest"
    );
  }
  return import.meta.env.VITE_LLM_OPENAI_MODEL || "gpt-4o-mini";
}

function getDefaultBaseUrl(provider: LlmProvider): string {
  if (provider === "anthropic-compatible") {
    return import.meta.env.VITE_LLM_ANTHROPIC_COMPAT_BASE_URL || "";
  }
  if (provider === "anthropic") {
    return (
      import.meta.env.VITE_LLM_ANTHROPIC_BASE_URL ||
      "https://api.anthropic.com/v1"
    );
  }
  return (
    import.meta.env.VITE_LLM_OPENAI_BASE_URL || "https://api.openai.com/v1"
  );
}

function getAnthropicCompatAuthMode(): "x-api-key" | "bearer" {
  return import.meta.env.VITE_LLM_ANTHROPIC_COMPAT_AUTH_MODE === "x-api-key"
    ? "x-api-key"
    : "bearer";
}

function getAnthropicCompatVersion(): string {
  return import.meta.env.VITE_LLM_ANTHROPIC_COMPAT_VERSION || "2023-06-01";
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

function parseSseEventBlock(block: string): StreamEvent | null {
  const lines = block
    .split(/\r?\n/)
    .map(line => line.replace(/\r$/, ""))
    .filter(line => line.length > 0);

  if (lines.length === 0) return null;

  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.replace(/^data:\s?/, ""));
    }
  }

  if (dataLines.length === 0) return null;

  return { event, data: dataLines.join("\n") };
}

function extractTokenFromJson(payload: unknown, eventName?: string): string {
  if (!payload || typeof payload !== "object") return "";

  const maybeRecord = payload as Record<string, unknown>;
  const directToken = maybeRecord.token;
  if (typeof directToken === "string") return directToken;

  const directDelta = maybeRecord.delta;
  if (typeof directDelta === "string") return directDelta;

  const choices = maybeRecord.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const choice = choices[0] as Record<string, unknown>;
    const delta = choice?.delta as Record<string, unknown> | undefined;
    if (delta && typeof delta.content === "string") {
      return delta.content;
    }
  }

  const type = maybeRecord.type;
  if (eventName === "content_block_delta") {
    const deltaFromEvent = maybeRecord.delta as
      | Record<string, unknown>
      | undefined;
    if (deltaFromEvent && typeof deltaFromEvent.text === "string") {
      return deltaFromEvent.text;
    }
  }

  if (type === "content_block_delta") {
    const anthropicDelta = maybeRecord.delta as
      | Record<string, unknown>
      | undefined;
    if (anthropicDelta && typeof anthropicDelta.text === "string") {
      return anthropicDelta.text;
    }
  }

  return "";
}

function extractStreamError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const maybeRecord = payload as Record<string, unknown>;

  const directError = maybeRecord.error;
  if (typeof directError === "string" && directError.trim()) {
    return directError;
  }

  if (directError && typeof directError === "object") {
    const errorObject = directError as Record<string, unknown>;
    const message = errorObject.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    const detail = errorObject.error;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  const type = maybeRecord.type;
  if (type === "error") {
    const message = maybeRecord.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return null;
}

async function consumeSseStream(
  response: Response,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!response.body) {
    throw new Error("Stream response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reading = true;
  const frameSeparator = /\r?\n\r?\n/;

  while (reading) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const { done, value } = await reader.read();
    if (done) {
      reading = false;
      continue;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(frameSeparator);
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const parsed = parseSseEventBlock(chunk);
      if (parsed) {
        onEvent(parsed);
      }
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const parsed = parseSseEventBlock(tail);
    if (parsed) {
      onEvent(parsed);
    }
  }
}

async function streamViaProxy(
  proxyUrl: string,
  provider: LlmProvider,
  model: string,
  apiKey: string | undefined,
  messages: LlmMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      provider,
      model,
      stream: true,
      messages,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `LLM proxy error (${response.status}): ${text || response.statusText}`
    );
  }

  let fullText = "";
  await consumeSseStream(
    response,
    event => {
      if (event.data === "[DONE]") return;
      let payload: unknown;
      try {
        payload = JSON.parse(event.data) as unknown;
      } catch (_error) {
        return;
      }
      const streamError = extractStreamError(payload);
      if (streamError) {
        throw new Error(streamError);
      }
      const token = extractTokenFromJson(payload, event.event);
      if (token) {
        fullText += token;
        onToken(token);
      }
    },
    signal
  );

  return fullText;
}

async function streamFromOpenAI(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: LlmMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.4,
      messages,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${text || response.statusText}`
    );
  }

  let fullText = "";
  await consumeSseStream(
    response,
    event => {
      if (event.data === "[DONE]") return;
      let payload: unknown;
      try {
        payload = JSON.parse(event.data) as unknown;
      } catch (_error) {
        return;
      }
      const streamError = extractStreamError(payload);
      if (streamError) {
        throw new Error(streamError);
      }
      const token = extractTokenFromJson(payload, event.event);
      if (token) {
        fullText += token;
        onToken(token);
      }
    },
    signal
  );

  return fullText;
}

async function streamFromAnthropic(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: LlmMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const systemPrompt = messages
    .filter(msg => msg.role === "system")
    .map(msg => msg.content)
    .join("\n\n");

  const conversation = messages
    .filter(msg => msg.role !== "system")
    .map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      stream: true,
      ["max_tokens"]: 1024,
      temperature: 0.4,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: conversation,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Anthropic API error (${response.status}): ${text || response.statusText}`
    );
  }

  let fullText = "";
  await consumeSseStream(
    response,
    event => {
      if (event.data === "[DONE]") return;
      let payload: unknown;
      try {
        payload = JSON.parse(event.data) as unknown;
      } catch (_error) {
        return;
      }
      const streamError = extractStreamError(payload);
      if (streamError) {
        throw new Error(streamError);
      }
      const token = extractTokenFromJson(payload, event.event);
      if (token) {
        fullText += token;
        onToken(token);
      }
    },
    signal
  );

  return fullText;
}

async function streamFromAnthropicCompatible(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: LlmMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const endpoint = buildMessagesEndpoint(baseUrl);
  if (!endpoint) {
    throw new Error("VITE_LLM_ANTHROPIC_COMPAT_BASE_URL is required.");
  }

  const systemPrompt = messages
    .filter(msg => msg.role === "system")
    .map(msg => msg.content)
    .join("\n\n");

  const conversation = messages
    .filter(msg => msg.role !== "system")
    .map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (getAnthropicCompatAuthMode() === "x-api-key") {
    headers["x-api-key"] = apiKey;
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const version = getAnthropicCompatVersion();
  if (version) {
    headers["anthropic-version"] = version;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      stream: true,
      ["max_tokens"]: 1024,
      temperature: 0.4,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: conversation,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Anthropic-compatible API error (${response.status}): ${
        text || response.statusText
      }`
    );
  }

  let fullText = "";
  await consumeSseStream(
    response,
    event => {
      if (event.data === "[DONE]") return;
      let payload: unknown;
      try {
        payload = JSON.parse(event.data) as unknown;
      } catch (_error) {
        return;
      }
      const streamError = extractStreamError(payload);
      if (streamError) {
        throw new Error(streamError);
      }
      const token = extractTokenFromJson(payload, event.event);
      if (token) {
        fullText += token;
        onToken(token);
      }
    },
    signal
  );

  return fullText;
}

export async function streamLlmResponse(
  options: StreamLlmOptions
): Promise<StreamLlmResult> {
  const provider =
    options.provider || readEnvProvider(import.meta.env.VITE_LLM_PROVIDER);
  const model = options.model || getDefaultModel(provider);
  const baseUrl = getDefaultBaseUrl(provider);
  const apiKey =
    options.apiKey ||
    import.meta.env.VITE_LLM_ANTHROPIC_COMPAT_API_KEY ||
    import.meta.env.VITE_LLM_API_KEY;
  const proxyUrl = import.meta.env.VITE_LLM_PROXY_URL;

  let text = "";
  if (proxyUrl) {
    text = await streamViaProxy(
      proxyUrl,
      provider,
      model,
      apiKey,
      options.messages,
      options.onToken,
      options.signal
    );
  } else {
    if (!apiKey) {
      throw new Error(
        "LLM key is missing. Set VITE_LLM_API_KEY (direct mode) or VITE_LLM_PROXY_URL (recommended)."
      );
    }

    if (provider === "anthropic") {
      text = await streamFromAnthropic(
        baseUrl,
        model,
        apiKey,
        options.messages,
        options.onToken,
        options.signal
      );
    } else if (provider === "anthropic-compatible") {
      text = await streamFromAnthropicCompatible(
        baseUrl,
        model,
        apiKey,
        options.messages,
        options.onToken,
        options.signal
      );
    } else {
      text = await streamFromOpenAI(
        baseUrl,
        model,
        apiKey,
        options.messages,
        options.onToken,
        options.signal
      );
    }
  }

  return {
    provider,
    model,
    text,
  };
}
