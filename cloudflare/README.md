# Cloudflare LLM Proxy

This Worker keeps provider API keys server-side and exposes a single streaming endpoint for the frontend.

The frontend can be hosted on GitHub Pages or Cloudflare Pages independently of
this Worker. See [CONTRIBUTING.md](../CONTRIBUTING.md) for frontend setup and
deployment workflow responsibilities.

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

Create ignored `.dev.vars` from `.dev.vars.example` if it does not exist, then
configure the provider credentials there. Create frontend `.env.local` from
`.env.local.example` as needed; set `VITE_LLM_PROXY_URL` to the local Worker URL
(normally `http://127.0.0.1:8787`). Keep an existing local configuration intact.

```bash
npm run cf:worker:dev
```

In another terminal, run the frontend with the checked-in blog snapshot:

```bash
VITE_BLOG_DATA_SOURCE=static npm run dev
```

Set `ALLOWED_ORIGINS` to the actual frontend origin, including its port. The
example allows `localhost:5173` and `127.0.0.1:5173`; adjust it if Vite uses a
different port. Routine UI tests can mock streaming responses without a live
provider.

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

Model names here are configuration examples, not a claim about current provider
availability. Select a model supported by the configured upstream service.

For GitHub Actions builds, set frontend values in repository Variables and
rebuild the frontend after changing them. Deploying the Worker alone does not
update a previously built frontend. Use the Worker's actual endpoint;
`/api/llm` requires separately configured routing and is not created by the
deployment workflows.

Do not set provider API keys on the frontend. This repository exposes both
`VITE_` and `OPENAI_` prefixes through Vite; keep secrets in `.dev.vars` locally
and Worker secrets in production.

## Verification

A successful frontend build or deployment does not verify provider credentials.
When checking AI end to end, distinguish CORS/endpoint failures, Worker
configuration errors, and upstream authentication/model errors. Report those
separately from frontend UI checks. Never put credentials or authorization
headers in committed examples, screenshots, or logs.
