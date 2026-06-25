# Cloudflare Worker deploy

Tahle varianta běží na Cloudflare Workers přes OpenNext. Uploadované `.md` a `.html` soubory jsou v R2 bucketu a metadata, nastavení a komentáře jsou v D1 databázi.

## Použité bindings

- `DB`: Cloudflare D1 databáze `markdown-share-db`
- `FILES`: Cloudflare R2 bucket `markdown-share-files`

Bindings jsou definované v `wrangler.jsonc`.

## První nastavení

1. Přihlas se do Cloudflare:

```bash
npx wrangler login
```

2. Vytvoř R2 bucket:

```bash
npx wrangler r2 bucket create markdown-share-files
```

3. Vytvoř D1 databázi:

```bash
npx wrangler d1 create markdown-share-db
```

4. Pokud Wrangler vypíše `database_id`, doplň ho do `wrangler.jsonc` do položky `d1_databases[0].database_id`. Novější Wrangler umí databázi podle názvu také auto-provisionovat, ale explicitní ID je stabilnější pro produkci.

5. Aplikuj D1 migrace:

```bash
npx wrangler d1 migrations apply markdown-share-db --remote
```

6. Nastav produkční secrets:

```bash
npx wrangler secret put API_SECRET_KEY
npx wrangler secret put ADMIN_KEY
```

7. Pokud chceš pevnou veřejnou URL místo automatického originu requestu, nastav `NEXT_PUBLIC_BASE_URL` jako Worker variable v Cloudflare dashboardu nebo ve `wrangler.jsonc`.

## Lokální preview ve Workers runtime

Pro lokální secrets vytvoř `.dev.vars` podle `.env.example`:

```bash
API_SECRET_KEY=local-api-key
ADMIN_KEY=local-admin-key
NEXT_PUBLIC_BASE_URL=http://localhost:8787
```

Pak spusť:

```bash
npm run preview
```

## Deploy

```bash
npm run deploy
```

## Cloudflare Workers Builds

Pokud deploy běží přes Cloudflare Git/Workers Builds, nastav příkazy takhle:

```bash
# Build command
npm run cf-build

# Deploy command
npx wrangler deploy
```

Nestačí `npm run build`, protože ten spouští jen `next build`. OpenNext deploy potřebuje předem vygenerovaný `.open-next` výstup z `opennextjs-cloudflare build`.

## Migrace dat z Vercelu

Tenhle commit jen přepíná runtime a storage implementaci. Existující data z Vercel KV/Blob se automaticky nepřenášejí. Pro migraci je potřeba exportovat metadata z Vercel KV, stáhnout blob soubory a zapsat je do D1/R2.
