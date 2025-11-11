# Deployment Guide - CashNDrive AI Asistent

Kompletní návod pro nasazení aplikace do produkčního prostředí Azure.

---

## Předpoklady

Před deploymentem se ujistěte, že máte:

- ✅ Dokončený [Azure Setup](AZURE_SETUP.md)
- ✅ Všechny Azure služby nakonfigurovány
- ✅ Environment variables připraveny
- ✅ GitHub repository připraveno
- ✅ Azure CLI nainstalované
- ✅ Azure Functions Core Tools

---

## Strategie nasazení

Projekt používá **kontinuální nasazení (CI/CD)** s GitHub Actions:

```
GitHub Push → GitHub Actions → Azure Deployment
```

---

## 1. Příprava projektu

### Kontrola struktury

```bash
# Ověření struktury
tree -L 2

zpawebcc/
├── frontend/
├── backend/
├── config/
├── docs/
└── README.md
```

### Kontrola dependencies

```bash
cd backend
npm install
npm audit fix  # Opravit případné security issues
```

---

## 2. Konfigurace Environment Variables

### Production settings

Vytvořte `.env.production` (NIKDY necommitujte do Gitu!):

```env
AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING=endpoint=https://...
AZURE_SPEECH_KEY=xxxxx
AZURE_SPEECH_REGION=westeurope
AZURE_AI_ENDPOINT=https://cashndrive-openai.openai.azure.com/
AZURE_AI_KEY=xxxxx
AZURE_AI_DEPLOYMENT_NAME=gpt-4
```

### Nastavení v Azure

```bash
# Načíst proměnné z .env.production
source .env.production

# Nastavit v Function App
az functionapp config appsettings set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --settings \
    AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING="$AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING" \
    AZURE_SPEECH_KEY="$AZURE_SPEECH_KEY" \
    AZURE_SPEECH_REGION="$AZURE_SPEECH_REGION" \
    AZURE_AI_ENDPOINT="$AZURE_AI_ENDPOINT" \
    AZURE_AI_KEY="$AZURE_AI_KEY" \
    AZURE_AI_DEPLOYMENT_NAME="$AZURE_AI_DEPLOYMENT_NAME"
```

---

## 3. Deployment Backend (Azure Functions)

### Metoda 1: Azure CLI

```bash
cd backend

# Build (pokud potřeba)
npm run build

# Deploy
func azure functionapp publish cashndrive-functions

# Ověření
func azure functionapp list-functions cashndrive-functions
```

### Metoda 2: VS Code

1. Nainstalujte **Azure Functions extension**
2. Otevřete `backend` folder
3. Pravé tlačítko na folder → **Deploy to Function App**
4. Vyberte `cashndrive-functions`
5. Potvrďte deployment

### Ověření backend

```bash
# Test GetSpeechToken
curl https://cashndrive-functions.azurewebsites.net/api/GetSpeechToken

# Test GetAIResponse
curl -X POST https://cashndrive-functions.azurewebsites.net/api/GetAIResponse \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Ahoj","conversationHistory":[]}'
```

---

## 4. Deployment Frontend (Static Web Apps)

### Příprava frontendu

1. **Aktualizovat API endpoint** v `frontend/js/main.js`:

```javascript
const CONFIG = {
    API_ENDPOINT: 'https://cashndrive-functions.azurewebsites.net/api',
    // Pro Static Web Apps s API integration:
    // API_ENDPOINT: '/api',
};
```

### Metoda 1: GitHub Actions (Doporučeno)

Static Web Apps automaticky nasadí při push do GitHub.

1. **Vytvořit GitHub repository**:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/malonitest/zpawebcc.git
git push -u origin main
```

2. **Automatický deployment workflow**:

GitHub Actions workflow je vytvořen automaticky při vytvoření Static Web App.

Soubor: `.github/workflows/azure-static-web-apps-xxx.yml`

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "frontend"
          api_location: ""
          output_location: ""
```

3. **Push pro trigger deployment**:

```bash
git push origin main
```

4. **Sledovat deployment**:
   - GitHub: **Actions** tab
   - Azure Portal: Static Web App → **GitHub Action runs**

### Metoda 2: Manuální deployment

```bash
# Build (pokud je build krok)
cd frontend
# npm run build (pokud používáte build process)

# Deploy pomocí Azure CLI
az staticwebapp deploy \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --app-location frontend
```

### Ověření frontendu

1. Získat URL:

```bash
az staticwebapp show \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --query "defaultHostname" \
  --output tsv
```

2. Otevřít v prohlížeči
3. Otestovat demo hovoru

---

## 5. Konfigurace DNS a Custom Domain

### Přidání custom domain

1. **V Azure Portal**:
   - Otevřít Static Web App
   - **Custom domains** → **Add**
   - Zadat: `www.cashndrive.cz`

2. **U DNS providera** (např. Cloudflare, GoDaddy):

Přidat CNAME záznam:
```
Type: CNAME
Name: www
Target: [static-web-app-url].azurestaticapps.net
TTL: 3600
```

3. **Validace v Azure Portal**:
   - Kliknout **Validate + Configure**
   - Počkat na DNS propagaci (může trvat 24-48h)

### SSL Certifikát

Azure Static Web Apps automaticky poskytuje SSL certifikát zdarma.

---

## 6. Monitoring a Logging

### Application Insights

#### Ověření integrace

```bash
# Zkontrolovat Instrumentation Key
az functionapp config appsettings list \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --query "[?name=='APPINSIGHTS_INSTRUMENTATIONKEY'].value" \
  --output tsv
```

#### Přístup k logům

1. Azure Portal → **Application Insights** → `cashndrive-insights`
2. **Logs** (KQL queries):

```kql
// Všechny requesty za poslední hodinu
requests
| where timestamp > ago(1h)
| summarize count() by name

// Chyby
exceptions
| where timestamp > ago(24h)
| project timestamp, message, operation_Name

// Výkon funkcí
requests
| summarize avg(duration) by name
| order by avg_duration desc
```

### Nastavení alertů

```bash
# Alert pro vysokou error rate
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group cashndrive-rg \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/cashndrive-rg/providers/Microsoft.Web/sites/cashndrive-functions" \
  --condition "count exceptions > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@cashndrive.cz
```

---

## 7. Testing Production

### End-to-End Test

1. **Otevřít produkční URL**
2. **Testovat všechny stránky**:
   - [ ] Domovská stránka načtena
   - [ ] Demo stránka funguje
   - [ ] Přepisy zobrazeny
   - [ ] Kontaktní formulář odeslán

3. **Test hovoru**:
   - [ ] "Zahájit hovor" tlačítko
   - [ ] Mikrofon povolen
   - [ ] AI odpovídá
   - [ ] Přepis se zobrazuje
   - [ ] Hovor lze ukončit
   - [ ] Shrnutí se zobrazí

4. **Test performance**:
   - [ ] Stránka načtena < 3s
   - [ ] STT latence < 500ms
   - [ ] AI odpověď < 2s
   - [ ] TTS přehrávání plynulé

### Load Testing (volitelné)

```bash
# Použití Azure Load Testing
az load test create \
  --name cashndrive-loadtest \
  --resource-group cashndrive-rg \
  --location westeurope

# Nahrát test skript
# Test 100 concurrent users po dobu 5 minut
```

---

## 8. Rollback strategie

### Když něco selže

#### Rollback Function App

```bash
# Seznam deploymentů
az functionapp deployment list \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Rollback na předchozí verzi
az functionapp deployment source show \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --deployment-id [previous-deployment-id]
```

#### Rollback Static Web App

Static Web Apps uchovává historii deploymentů:

1. Azure Portal → Static Web App
2. **Environments** → Najít předchozí deployment
3. **Promote** → Aktivovat starší verzi

#### Rollback přes Git

```bash
# Vrátit se na předchozí commit
git revert HEAD
git push origin main

# Nebo použít specifický commit
git revert [commit-hash]
git push origin main
```

---

## 9. Optimalizace Production

### Caching

#### Frontend

Přidat do `staticwebapp.config.json`:

```json
{
  "routes": [
    {
      "route": "/css/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/js/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

#### Backend

Přidat caching pro AI odpovědi:

```javascript
// V GetAIResponse.js
const cache = new Map();

function getCachedResponse(key) {
  return cache.get(key);
}

function setCachedResponse(key, value, ttl = 3600) {
  cache.set(key, { value, expiry: Date.now() + ttl * 1000 });
}
```

### CDN

Static Web Apps používá Azure CDN automaticky.

Ověření:
```bash
curl -I https://www.cashndrive.cz
# Hledat: x-azure-ref (potvrzuje CDN)
```

---

## 10. Security Hardening

### Zabezpečení Function App

```bash
# Povolit HTTPS only
az functionapp update \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --set httpsOnly=true

# Zakázat FTP
az functionapp config set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --ftps-state Disabled
```

### IP Restrictions (volitelné)

```bash
# Omezit přístup jen z určitých IP
az functionapp config access-restriction add \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --rule-name "Allow-Office" \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100
```

### Secrets Management

Přesunout secrets do Key Vault (viz Azure Setup).

---

## 11. Backup a Disaster Recovery

### Backup strategie

1. **Kód**: Git repository (GitHub)
2. **Konfigurace**: Infrastructure as Code
3. **Data**: Přepisy hovorů do Azure Storage

```bash
# Backup do Azure Storage
az storage blob upload-batch \
  --destination backups \
  --source ./data \
  --account-name cashndrivestorage
```

### Disaster Recovery Plan

1. **RTO** (Recovery Time Objective): 1 hodina
2. **RPO** (Recovery Point Objective): 24 hodin

**Recovery kroky:**
1. Obnovit Function App z Gitu
2. Obnovit Static Web App z Gitu
3. Obnovit environment variables z Key Vault
4. Obnovit data z Azure Storage backup

---

## 12. Maintenance

### Pravidelné úkoly

#### Týdně
- [ ] Zkontrolovat Application Insights pro errory
- [ ] Zkontrolovat využití služeb (costs)
- [ ] Backup dat

#### Měsíčně
- [ ] Aktualizovat dependencies (`npm update`)
- [ ] Zkontrolovat security advisories
- [ ] Analyzovat usage patterns
- [ ] Optimalizovat náklady

#### Čtvrtletně
- [ ] Review system prompt (zlepšení AI)
- [ ] Load testing
- [ ] Security audit
- [ ] Disaster recovery test

---

## 13. Deployment Checklist

Před production deploymentem:

### Pre-deployment
- [ ] Všechny testy prošly
- [ ] Code review dokončen
- [ ] Environment variables nastaveny
- [ ] CORS správně nakonfigurováno
- [ ] SSL certifikát aktivní
- [ ] Monitoring nakonfigurován
- [ ] Backup strategie připravena

### During deployment
- [ ] Backend nasazen
- [ ] Frontend nasazen
- [ ] Health checks úspěšné
- [ ] Smoke tests prošly

### Post-deployment
- [ ] End-to-end test
- [ ] Performance test
- [ ] Monitoring funkční
- [ ] Dokumentace aktualizována
- [ ] Team notifikován

---

## 14. Troubleshooting Common Issues

### "Function not found"
```bash
# Zkontrolovat deployment
func azure functionapp list-functions cashndrive-functions
```

### "CORS error"
```bash
# Přidat CORS origin
az functionapp cors add \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --allowed-origins "https://www.cashndrive.cz"
```

### "AI not responding"
- Zkontrolovat GPT-4 deployment
- Ověřit API key v Key Vault
- Zkontrolovat quota limits

### "High costs"
```bash
# Zkontrolovat current costs
az consumption usage list \
  --start-date 2025-11-01 \
  --end-date 2025-11-30
```

---

## 15. Kontakty pro Support

### Azure Support
- Portal: https://portal.azure.com → Support
- Telefon: +420 228 882 400 (ČR)

### Dokumentace
- Azure Functions: https://docs.microsoft.com/azure/azure-functions/
- Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- OpenAI: https://learn.microsoft.com/azure/ai-services/openai/

---

## Závěr

**Gratulujeme! Vaše aplikace je nasazena v produkci. 🚀**

Další kroky:
1. Monitorujte Application Insights
2. Sbírejte feedback od uživatelů
3. Iterujte a vylepšujte

**Happy deploying!**
