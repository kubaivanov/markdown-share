#!/bin/bash

# MD Share - Upload Script
# Použitie: ./share.sh <subor.md|subor.html> [vlastny-slug]

# Konfigurácia - uprav tieto hodnoty!
API_URL="${MD_SHARE_URL:-https://your-app.vercel.app}/api/upload"
API_KEY="${MD_SHARE_API_KEY:-your-api-key-here}"

# Farby pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kontrola argumentov
if [ -z "$1" ]; then
    echo -e "${RED}❌ Použitie: ./share.sh <subor.md|subor.html> [vlastny-slug]${NC}"
    exit 1
fi

FILE="$1"
CUSTOM_SLUG="$2"

# Kontrola či súbor existuje
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ Súbor '$FILE' neexistuje${NC}"
    exit 1
fi

# Kontrola prípony
if [[ ! "$FILE" == *.md && ! "$FILE" == *.html && ! "$FILE" == *.htm ]]; then
    echo -e "${YELLOW}⚠️  Súbor nemá príponu .md ani .html, pokračujem...${NC}"
fi

FILENAME=$(basename "$FILE")
echo -e "${BLUE}📤 Uploadujem: ${FILENAME}${NC}"

# Vytvorenie request
if [ -n "$CUSTOM_SLUG" ]; then
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $API_KEY" \
        -F "file=@$FILE" \
        -F "slug=$CUSTOM_SLUG")
else
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $API_KEY" \
        -F "file=@$FILE")
fi

# Parsovanie odpovede
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true')

if [ -n "$SUCCESS" ]; then
    URL=$(echo "$RESPONSE" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
    
    echo -e "${GREEN}✅ Úspešne uploadované!${NC}"
    echo -e "${GREEN}🔗 URL: ${URL}${NC}"
    
    # Kopírovanie do schránky (macOS)
    if command -v pbcopy &> /dev/null; then
        echo -n "$URL" | pbcopy
        echo -e "${BLUE}📋 Skopírované do schránky!${NC}"
    # Kopírovanie do schránky (Linux s xclip)
    elif command -v xclip &> /dev/null; then
        echo -n "$URL" | xclip -selection clipboard
        echo -e "${BLUE}📋 Skopírované do schránky!${NC}"
    fi
else
    ERROR=$(echo "$RESPONSE" | sed -n 's/.*"error":"\([^"]*\)".*/\1/p')
    echo -e "${RED}❌ Upload zlyhal: ${ERROR:-Neznáma chyba}${NC}"
    echo -e "${YELLOW}Response: $RESPONSE${NC}"
    exit 1
fi

