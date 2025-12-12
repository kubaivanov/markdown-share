# 🤖 Cursor AI Setup Prompt

## Ako použiť tento súbor

1. Otvor tento projekt v **Cursor IDE**
2. Skopíruj celý text pod "📋 PROMPT PRE CURSOR AI" (vrátane toho textu)
3. V Cursori otvor chat (Cmd+L alebo Ctrl+L)
4. Vlož skopírovaný text
5. Cursor ťa krok za krokom prevedie nastavením

---

## 📋 PROMPT PRE CURSOR AI

**Skopíruj nasledujúci text a vlož ho do Cursor chat:**

---

Ahoj! Potrebujem pomoc s nastavením tohto Next.js projektu "MD Share" - aplikácie na zdieľanie markdown súborov. 

**Čo je toto za projekt:**
- Next.js 16 aplikácia s TypeScript
- Používa Vercel Blob Storage pre ukladanie markdown súborov
- Používa Vercel KV Database pre metadata
- Vyžaduje dva API kľúče: API_SECRET_KEY (pre upload API) a ADMIN_KEY (pre admin rozhranie)
- Má shell script `scripts/share.sh` pre upload súborov z terminálu

**Čo potrebujem:**
Pomôž mi nastaviť tento projekt step-by-step. Postupuj podľa README.md a pre každý krok:
1. Vysvetli, čo robíme a prečo
2. Ukáž mi presné príkazy, ktoré mám spustiť
3. Počkaj na moje potvrdenie pred prechodom na ďalší krok
4. Skontroluj výsledok každého kroku (napr. či sú súbory vytvorené, či príkazy prešli)

**Začni tým, že:**
1. Prečítaj si README.md súbor a pochop štruktúru projektu
2. Skontroluj, či mám nainštalovaný Node.js (18+) a npm
3. Potom ma postupne prevedieš nastavením:
   - Lokálne spustenie projektu (ak to chcem)
   - Alebo deploy na Vercel (ak to chcem)
   - Nastavenie Vercel Storage (Blob + KV)
   - Nastavenie environment premenných
   - Nastavenie share.sh scriptu

**Dôležité:**
- Vždy ma pýtaj, či chcem pokračovať ďalej
- Ak niečo nefunguje, pomôž mi to vyriešiť
- Vysvetľuj kroky jednoducho, som menej technický používateľ
- Ak potrebujem niečo nastaviť vo Vercel Dashboard, vysvetli presne, kde to nájdem

Začni prosím tým, že prečítaš README.md a potom mi povieš, čo je prvá vec, ktorú mám urobiť.

---

**Koniec promptu pre skopírovanie**

---

## 💡 Ďalšie tipy pre kolegov

### Ak už máš projekt naklonovaný

Ak už máš projekt naklonovaný a chceš len nastaviť lokálne spustenie, použij tento kratší prompt:

```
Pomôž mi nastaviť lokálne spustenie tohto Next.js projektu. 
Prečítaj si README.md a potom ma prevedieť krok za krokom:
1. Inštalácia závislostí (npm install)
2. Nastavenie Vercel CLI a linkovanie projektu
3. Stiahnutie environment premenných
4. Kontrola, či sú všetky potrebné premenné nastavené
5. Spustenie development servera

Po každom kroku počkaj na moje potvrdenie.
```

### Ak chceš len deploy na Vercel

```
Pomôž mi nasadiť tento Next.js projekt na Vercel. 
Postupuj podľa README.md a prevedieť ma krok za krokom cez:
1. Vytvorenie Vercel projektu
2. Vytvorenie Blob Storage
3. Vytvorenie KV Database
4. Nastavenie environment premenných
5. Prvé nasadenie

Vždy mi vysvetli, kde konkrétne v Vercel Dashboard mám kliknúť alebo čo mám zadať.
```

### Ak máš problém

```
Mám problém s [popíš problém]. 
Pomôž mi to vyriešiť. Možno je to problém s:
- Environment premennými
- Vercel Storage pripojením
- Build chybami
- Alebo niečo iné

Najprv skontroluj README.md a potom mi pomôž diagnostikovať problém.
```

---

## 🎯 Čo očakávať od Cursor AI

Cursor by mal:
- ✅ Prečítať README.md a pochopiť projekt
- ✅ Postupovať krok za krokom
- ✅ Čakať na tvoje potvrdenie
- ✅ Kontrolovať výsledky každého kroku
- ✅ Vysvetľovať, čo a prečo robíš
- ✅ Pomáhať riešiť problémy

Ak Cursor preskočí kroky alebo ide príliš rýchlo, povedz mu:
> "Spomal, prosím. Chcem prejsť každý krok zvlášť a potvrdiť ho pred tým, ako prejdeme ďalej."

---

**Vytvorené pre jednoduchšie onboarding kolegov** 👥
