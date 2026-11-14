import { afterEach, describe, expect, it, vi } from "vitest";
import { streamLlmResponse } from "./llm";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe("LLM proxy", () => {
  it("streams proxy tokens and forwards cancellation without provider credentials", async () => {
    vi.stubEnv("VITE_LLM_PROXY_URL", "https://proxy.example/llm");
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n\n'
        )
      );
    const onToken = vi.fn();
    const signal = new AbortController().signal;
    const response = await streamLlmResponse({
      messages: [{ role: "user", content: "Hi" }],
      signal,
      onToken,
    });
    expect(response.text).toBe("Hello");
    expect(onToken).toHaveBeenCalledWith("Hello");
    expect(fetch).toHaveBeenCalledWith(
      "https://proxy.example/llm",
      expect.objectContaining({
        signal,
        headers: { "Content-Type": "application/json" },
      })
    );
  });
  it("reports an upstream failure", async () => {
    vi.stubEnv("VITE_LLM_PROXY_URL", "https://proxy.example/llm");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Unavailable", { status: 503 })
    );
    await expect(
      streamLlmResponse({ messages: [], onToken: vi.fn() })
    ).rejects.toThrow("503");
  });
  it("requires a proxy URL", async () => {
    vi.stubEnv("VITE_LLM_PROXY_URL", "");
    const fetch = vi.spyOn(globalThis, "fetch");
    await expect(
      streamLlmResponse({ messages: [], onToken: vi.fn() })
    ).rejects.toThrow("VITE_LLM_PROXY_URL");
    expect(fetch).not.toHaveBeenCalled();
  });
});
