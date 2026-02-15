# Cloudflare LLM Proxy

This Worker keeps provider API keys server-side and exposes a single streaming endpoint for the frontend.

Supported providers:
- `anthropic-compatible` (recommended)
- `anthropic`
- `openai`

## Endpoint

- `POST /` (or your Worker root URL)
- Request body:

```json
{
  "provider": "anthropic-compatible",
  "model": "claude-3-5-sonnet-latest",
  "stream": true,
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

## Local Dev

```bash
npm run cf:worker:dev
```

## Deploy

1. Login once:

```bash
npx wrangler login
```

2. Set secrets:

```bash
npx wrangler secret put ANTHROPIC_COMPAT_API_KEY
# optional if you also use these providers:
# npx wrangler secret put OPENAI_API_KEY
# npx wrangler secret put ANTHROPIC_API_KEY
```

3. Set vars in `wrangler.toml` (or dashboard):
- `DEFAULT_PROVIDER=anthropic-compatible`
- `ANTHROPIC_COMPAT_BASE_URL=https://your-compatible-provider.example/v1`
- `ANTHROPIC_COMPAT_AUTH_MODE=x-api-key` (or `bearer`)
- `ANTHROPIC_COMPAT_VERSION=2023-06-01` (optional)
- `ANTHROPIC_COMPAT_MODEL=claude-3-5-sonnet-latest`

Notes:
- If your provider base URL is like `https://open.bigmodel.cn/api/anthropic`, the proxy auto-appends `/v1/messages`.
- If your base URL already ends with `/v1` or `/v1/messages`, it will be used directly.

4. Deploy:

```bash
npm run cf:worker:deploy
```

## CORS

Set `ALLOWED_ORIGINS` as comma-separated origins in `wrangler.toml` (or dashboard vars), for example:

```toml
ALLOWED_ORIGINS = "https://your-site.pages.dev,https://your-domain.com"
```

If empty, the Worker allows any origin.

## Frontend Env

Set:

- `VITE_LLM_PROXY_URL=https://your-worker.workers.dev`
- `VITE_LLM_PROVIDER=anthropic-compatible`
- `VITE_LLM_ANTHROPIC_COMPAT_MODEL=claude-3-5-sonnet-latest`

Do not set provider API keys on the frontend.
