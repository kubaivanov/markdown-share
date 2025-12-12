# 📝 MD Share

Jednoduchá webová aplikácia na zdieľanie markdown súborov s integráciou pre Cursor IDE a ľubovoľný terminál.

## ✨ Funkcie

- 📄 **Zdieľanie markdown súborov** - upload a zdieľanie cez jednoduché URL
- 🎨 **Krásne renderovanie** - syntax highlighting, GFM podpora
- 🤖 **AI integrácia** - otvorenie obsahu priamo v ChatGPT, Claude alebo Gemini
- 📥 **Download** - stiahnutie pôvodného .md súboru
- 🔒 **Súkromie** - noindex pre všetky stránky, možnosť zrušiť zdieľanie
- ⚡ **Cursor/Terminál integrácia** - jednoduchý upload cez shell script
- 🔐 **Zabezpečenie** - API kľúče pre upload a admin rozhranie

---

## 📋 Obsah

0. [🤖 Pomoc s Cursor AI](#-pomoc-s-cursor-ai) - **NOVÉ kolegom!**
1. [Požiadavky](#-požiadavky)
2. [Lokálne spustenie](#-lokálne-spustenie)
3. [Deploy na Vercel](#-deploy-na-vercel)
4. [GitHub integrácia a automatické deploy](#-github-integrácia-a-automatické-deploy)
5. [Nastavenie share scriptu](#-nastavenie-share-scriptu)
6. [Použitie](#-použitie)
7. [Štruktúra projektu](#-štruktúra-projektu)
8. [API Endpoints](#-api-endpoints)
9. [Bezpečnosť](#-bezpečnosť)

---

## 🤖 Pomoc s Cursor AI

**Noví kolegovia:** Ak používaš Cursor IDE a chceš, aby ťa AI prevedieť nastavením projektu krok za krokom, pozri si súbor [`CURSOR.MD`](./CURSOR.MD).

V tomto súbore nájdeš:
- ✅ Ready-to-use prompt, ktorý môžeš skopírovať a vložiť do Cursor chat
- ✅ Návod, ako použiť Cursor AI na nastavenie projektu
- ✅ Tipy na rôzne scenáre (lokálne spustenie, Vercel deploy, riešenie problémov)

**Ako to funguje:**
1. Otvor `CURSOR.MD` v projekte
2. Skopíruj hlavný prompt
3. Vlož ho do Cursor chat (Cmd+L / Ctrl+L)
4. Cursor ťa prevedie nastavením step-by-step

---

## 🔧 Požiadavky

- **Node.js** 18+ a npm
- **Vercel účet** (bezplatný tier stačí)
- **GitHub účet** (pre automatické deploy)
- **Terminál** s prístupom k `curl` (pre upload script)

---

## 🛠️ Lokálne spustenie

### Krok 1: Klonovanie repozitára

```bash
git clone https://github.com/paulus-tom/md-share.git
cd markdown-sharing
```

### Krok 2: Inštalácia závislostí

```bash
npm install
```

### Krok 3: Nastavenie Vercel CLI

Ak ešte nemáš Vercel CLI nainštalované:

```bash
npm install -g vercel
```

Prihlás sa do Vercel účtu:

```bash
vercel login
```

### Krok 4: Linkovanie projektu s Vercel projektom

```bash
vercel link
```

Počas procesu:
- Vyber existujúci projekt alebo vytvor nový
- Vyber organizáciu
- Potvrď nastavenia

### Krok 5: Stiahnutie environment premenných

```bash
vercel env pull .env.local
```

Tento príkaz stiahne všetky environment premenné z Vercel projektu do lokálneho `.env.local` súboru.

**Dôležité:** `.env.local` je v `.gitignore`, takže sa nebude commitať do repozitára.

### Krok 6: Kontrola environment premenných

Skontroluj, či máš v `.env.local` nastavené tieto premenné:

```bash
# API kľúč pre upload operácie (používa share.sh script)
API_SECRET_KEY=...

# Admin kľúč pre prístup do admin rozhrania
ADMIN_KEY=...

# Voliteľné: Base URL pre aplikáciu
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Ak tieto premenné nemáš nastavené vo Vercel projekte, nastav ich najprv tam (viď [Deploy na Vercel](#-deploy-na-vercel)).

### Krok 7: Spustenie development servera

```bash
npm run dev
```

Aplikácia bude dostupná na `http://localhost:3000`

### Krok 8: Testovanie

1. Otvor `http://localhost:3000/admin` v prehliadači
2. Prihlás sa pomocou `ADMIN_KEY` hodnoty z `.env.local`
3. Máš byť presmerovaný na admin rozhranie so zoznamom súborov

---

## 🚀 Deploy na Vercel

### Krok 1: Fork alebo klonovanie repozitára

```bash
git clone https://github.com/paulus-tom/md-share.git
cd markdown-sharing
```

### Krok 2: Vytvorenie Vercel projektu

1. Choď na [vercel.com](https://vercel.com) a prihlás sa
2. Klikni na **"Add New..."** → **"Project"**
3. Importuj projekt z GitHubu:
   - Ak máš repozitár v GitHub, vyber ho zo zoznamu
   - Ak nie, najprv ho pushni do GitHubu
4. V nastaveniach projektu:
   - **Framework Preset:** Next.js (detekuje sa automaticky)
   - **Root Directory:** `./` (ak je root repozitára)
   - **Build Command:** `npm run build` (predvolené)
   - **Output Directory:** `.next` (predvolené)

### Krok 3: Vytvorenie Vercel Storage (Blob)

1. V Vercel Dashboard → **Storage** → **Create**
2. Vyber **Blob** storage
3. Zadaj názov (napr. `md-share-blob`)
4. Vyber región (napr. `eu-west-1`)
5. Klikni **Create**

### Krok 4: Vytvorenie Vercel KV Database

1. V Vercel Dashboard → **Storage** → **Create**
2. Vyber **KV** database
3. Zadaj názov (napr. `md-share-kv`)
4. Vyber región (rovnaký ako Blob, napr. `eu-west-1`)
5. Klikni **Create**

### Krok 5: Pridanie Storage do projektu

1. V projekte → **Settings** → **Storage**
2. Klikni **Connect** pri Blob store a pripoj `md-share-blob`
3. Klikni **Connect** pri KV database a pripoj `md-share-kv`

**Dôležité:** Po pripojení storage sa automaticky nastavia environment premenné `BLOB_READ_WRITE_TOKEN` a `KV_*`, ktoré aplikácia používa.

### Krok 6: Generovanie API kľúčov

Vygeneruj dva bezpečné kľúče:

```bash
# API kľúč pre upload operácie (pre share.sh script)
openssl rand -hex 32

# Admin kľúč pre admin rozhranie
openssl rand -hex 32
```

Ulož si oba kľúče - budú sa ti hodiť pre nastavenie environment premenných.

### Krok 7: Nastavenie Environment Variables

1. V projekte → **Settings** → **Environment Variables**
2. Pridaj tieto premenné:

| Variable | Value | Environmenty |
|----------|-------|--------------|
| `API_SECRET_KEY` | `[vygenerovaný kľúč z kroku 6]` | Production, Preview, Development |
| `ADMIN_KEY` | `[vygenerovaný kľúč z kroku 6]` | Production, Preview, Development |
| `NEXT_PUBLIC_BASE_URL` | `https://tvoj-projekt.vercel.app` | Production, Preview, Development |

**Poznámka:** Pre každý environment (Production, Preview, Development) môžeš mať iné hodnoty. Pre lokálny vývoj použiješ `.env.local`.

### Krok 8: Prvé nasadenie

Ak máš projekt už napojený na GitHub:

1. Pushni zmeny do main branchu:
   ```bash
   git push origin main
   ```

2. Vercel automaticky detekuje push a začne deploy

Alebo manuálne cez Vercel CLI:

```bash
vercel --prod
```

### Krok 9: Overenie deployu

1. Po skončení deployu si skopíruj URL projektu (napr. `https://tvoj-projekt.vercel.app`)
2. Otvor `/admin` endpoint
3. Prihlás sa pomocou `ADMIN_KEY`
4. Mala by sa zobraziť prázdna stránka (zatiaľ žiadne súbory)

---

## 🔄 GitHub integrácia a automatické deploy

Vercel automaticky nasadzuje zmeny z GitHub repozitára.

### Ako to funguje

1. **Automatický deploy pri pushi:**
   - Každý push do `main` branchu spustí deploy do **Production**
   - Každý push do iných branchov vytvorí **Preview deployment**

2. **Pull Request Preview:**
   - Pre každý Pull Request sa vytvorí unikátna preview URL
   - Môžeš testovať zmeny pred mergnutím

3. **Automatické buildy:**
   - Vercel detekuje Next.js projekt
   - Spustí `npm install` a `npm run build`
   - Automaticky nasadí aplikáciu

### Konfigurácia automatického deployu

Automatické deployy sú **predvolene zapnuté**. Môžeš ich nakonfigurovať:

1. V projekte → **Settings** → **Git**
2. Tu môžeš:
   - Zapnúť/vypnúť automatické deployy pre rôzne branchy
   - Nastaviť build command a output directory
   - Nakonfigurovať preview deployments

### Workflow pre nové zmeny

```bash
# 1. Vytvor novú branch
git checkout -b feature/nova-funkcia

# 2. Urob zmeny a commit
git add .
git commit -m "Pridaná nová funkcia"

# 3. Pushni branch
git push origin feature/nova-funkcia

# 4. Vercel automaticky vytvorí preview deployment
# 5. Vytvor Pull Request v GitHub
# 6. Po merge do main sa automaticky nasadí do Production
```

### Environment premenné pre rôzne branchy

Môžeš mať rôzne environment premenné pre Production, Preview a Development:

1. V projekte → **Settings** → **Environment Variables**
2. Pri pridávaní/upravovaní premenných vyber, pre ktoré environmenty má byť dostupná
3. Preview deployments použijú Preview environment premenné

---

## ⚙️ Nastavenie share scriptu

Script `share.sh` umožňuje jednoduchý upload markdown súborov z terminálu.

### Krok 1: Skopírovanie scriptu

Skopíruj `scripts/share.sh` na miesto, kde ho chceš používať:

```bash
# Možnosť 1: Do systému PATH (odporúčané)
cp scripts/share.sh ~/.local/bin/share.sh
chmod +x ~/.local/bin/share.sh

# Možnosť 2: Do aktuálneho projektu
cp scripts/share.sh ./share.sh
chmod +x ./share.sh
```

### Krok 2: Nastavenie environment premenných

Pridaj do `~/.zshrc` alebo `~/.bashrc`:

```bash
# MD Share konfigurácia
export MD_SHARE_URL="https://tvoj-projekt.vercel.app"
export MD_SHARE_API_KEY="[tvoj API_SECRET_KEY z Vercel]"
```

Načítaj zmeny:

```bash
source ~/.zshrc  # alebo source ~/.bashrc
```

### Krok 3: Vytvorenie aliasu (voliteľné)

Pre jednoduchšie používanie pridaj alias:

```bash
# Do ~/.zshrc alebo ~/.bashrc
alias share="~/.local/bin/share.sh"
```

### Krok 4: Testovanie

```bash
# Vytvor testovací súbor
echo "# Test" > test.md

# Upload súboru
share test.md

# Alebo ak nemáš alias:
~/.local/bin/share.sh test.md

# S vlastným slug:
share test.md moj-test
```

**Očakávaný výstup:**
```
📤 Uploadujem: test.md
✅ Úspešne uploadované!
🔗 URL: https://tvoj-projekt.vercel.app/moj-test
📋 Skopírované do schránky!
```

---

## 📖 Použitie

### Upload súboru cez script

```bash
# Základný upload (slug sa vygeneruje z názvu súboru)
./share.sh dokument.md

# S vlastným slug (URL)
./share.sh dokument.md moj-dokument

# S aliasom
share dokument.md
```

### Upload cez API (manuálne)

```bash
curl -X POST https://tvoj-projekt.vercel.app/api/upload \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -F "file=@dokument.md" \
  -F "slug=moj-dokument"
```

### Admin rozhranie

1. Otvor `https://tvoj-projekt.vercel.app/admin` v prehliadači
2. Zadaj `ADMIN_KEY` do poľa pre prihlásenie
3. Zobrazí sa zoznam všetkých uploadnutých súborov
4. Môžeš:
   - Zobraziť súbor (kliknutie na názov)
   - Zrušiť zdieľanie (Delete tlačidlo)
   - Skopírovať URL súboru

### Zdieľané súbory

Každý uploadnutý súbor je dostupný na:

```
https://tvoj-projekt.vercel.app/[slug]
```

Príklad:
- Upload `README.md` → `https://tvoj-projekt.vercel.app/readme`
- Upload `README.md` s slug `dokumentacia` → `https://tvoj-projekt.vercel.app/dokumentacia`

### Zobrazenie súboru

Na stránke súboru môžeš:
- **Prezrieť** renderovaný markdown s syntax highlighting
- **Stiahnuť** pôvodný .md súbor
- **Zdieľať** obsah do ChatGPT, Claude alebo Gemini
- **Kopírovať** URL

---

## 📁 Štruktúra projektu

```
markdown-sharing/
├── scripts/
│   └── share.sh              # Upload script pre terminál
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx      # Admin rozhranie (zoznam súborov)
│   │   ├── [slug]/
│   │   │   └── page.tsx      # Detail stránka súboru
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts  # Autentifikácia admin
│   │   │   ├── upload/
│   │   │   │   └── route.ts  # Upload endpoint
│   │   │   └── files/
│   │   │       ├── route.ts  # Zoznam súborov
│   │   │       └── [slug]/
│   │   │           └── route.ts  # GET/DELETE súboru
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage (redirect na /admin)
│   │   └── globals.css       # Globálne štýly
│   ├── components/
│   │   ├── FileList.tsx      # Zoznam súborov komponent
│   │   ├── MarkdownRenderer.tsx  # Markdown renderer
│   │   └── ShareButtons.tsx  # Zdieľacie tlačidlá
│   ├── lib/
│   │   ├── auth.ts           # Autentifikačné funkcie
│   │   └── storage.ts        # Vercel Blob/KV operácie
│   └── types/
│       └── index.ts          # TypeScript typy
├── .gitignore
├── next.config.ts            # Next.js konfigurácia
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 API Endpoints

### Upload súboru

```http
POST /api/upload
Authorization: Bearer {API_SECRET_KEY}
Content-Type: multipart/form-data

file: File
slug?: string (voliteľné)
```

**Odpoveď:**
```json
{
  "success": true,
  "url": "https://tvoj-projekt.vercel.app/slug",
  "slug": "slug",
  "filename": "soubor.md"
}
```

### Zoznam súborov

```http
GET /api/files
X-Admin-Key: {ADMIN_KEY}
```

**Odpoveď:**
```json
[
  {
    "id": "...",
    "slug": "slug",
    "filename": "soubor.md",
    "blobUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isActive": true
  }
]
```

### Detail súboru

```http
GET /api/files/[slug]
```

**Odpoveď:**
```json
{
  "id": "...",
  "slug": "slug",
  "filename": "soubor.md",
  "blobUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

### Raw markdown

```http
GET /api/files/[slug]?raw=true
```

**Odpoveď:** Plain text markdown súboru

### Zmazanie súboru

```http
DELETE /api/files/[slug]
X-Admin-Key: {ADMIN_KEY}
```

**Odpoveď:**
```json
{
  "success": true
}
```

### Autentifikácia admin

```http
POST /api/auth
Content-Type: application/json

{
  "adminKey": "{ADMIN_KEY}"
}
```

**Odpoveď:**
```json
{
  "success": true,
  "message": "Přihlášení úspěšné"
}
```

---

## 🔐 Bezpečnosť

### Zabezpečenie

- ✅ Všetky stránky majú `noindex, nofollow` meta tagy (neindexované vyhľadávačmi)
- ✅ API endpointy vyžadujú autorizáciu pomocou API kľúča (`API_SECRET_KEY`)
- ✅ Admin rozhranie vyžaduje admin kľúč (`ADMIN_KEY`)
- ✅ Soft delete - zmazané súbory sú označené ako neaktívne, nie fyzicky zmazané
- ✅ Oveľa uploadné súbory sa validujú (len `.md` súbory)

### Odporúčania

1. **Nepoužívaj jednoduché kľúče:**
   - Vždy použij `openssl rand -hex 32` pre generovanie kľúčov
   - Nikdy necommituj kľúče do Git repozitára

2. **Environment premenné:**
   - Udržiavaj `.env.local` v `.gitignore`
   - Používaj rôzne kľúče pre Production a Development

3. **Storage:**
   - Pravidelne kontroluj používanie Vercel Blob storage
   - Vercel má limity na free tier

4. **Admin kľúč:**
   - Zdieľaj `ADMIN_KEY` len s dôveryhodnými ľuďmi
   - `API_SECRET_KEY` je potrebný len pre upload script

---

## 📄 Licencia

MIT

---

## 🤝 Podpora

Ak máš otázky alebo problémy:

1. Skontroluj, či máš správne nastavené environment premenné
2. Over, či máš pripojené Vercel Storage (Blob a KV)
3. Skontroluj logy v Vercel Dashboard → Deployments → [deployment] → Functions
4. Otvor issue v GitHub repozitári

---

**Vytvorené s ❤️ pre jednoduché zdieľanie dokumentácie**
