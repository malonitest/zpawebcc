# Průvodce Nastavením CashNDrive AI Voice Assistant

Tento průvodce vás provede kompletním nastavením aplikace od začátku.

## Krok 1: Předpoklady

### Vytvořte Azure účet
1. Přejděte na [Azure Portal](https://portal.azure.com)
2. Zaregistrujte se nebo se přihlaste
3. Ujistěte se, že máte aktivní subscription

### Nainstalujte nástroje
```bash
# Node.js (verze 18 nebo vyšší)
node --version

# Azure CLI
az --version

# Azure Functions Core Tools
func --version
```

## Krok 2: Vytvoření Azure Resources

### 2.1 Resource Group
```bash
az group create \
  --name cashndrive-rg \
  --location westeurope
```

### 2.2 Azure Communication Services

**Prostřednictvím Azure Portal:**
1. Vyhledejte "Communication Services"
2. Klikněte na "Create"
3. Vyplňte:
   - Resource group: `cashndrive-rg`
   - Name: `cashndrive-acs`
   - Data location: `Europe`
4. Vytvořte resource
5. Přejděte do "Keys" a zkopírujte Connection String

**Prostřednictvím CLI:**
```bash
az communication create \
  --name cashndrive-acs \
  --resource-group cashndrive-rg \
  --data-location Europe
```

### 2.3 Azure AI Foundry (Azure OpenAI)

**Prostřednictvím Azure Portal:**
1. Vyhledejte "Azure OpenAI"
2. Klikněte na "Create"
3. Vyplňte:
   - Resource group: `cashndrive-rg`
   - Name: `cashndrive-openai`
   - Region: `West Europe`
   - Pricing tier: `Standard S0`
4. Po vytvoření přejděte do resource
5. V "Keys and Endpoint" zkopírujte:
   - Endpoint URL
   - Key 1

**Nasazení modelu:**
1. V Azure OpenAI resource přejděte do "Model deployments"
2. Klikněte "Create new deployment"
3. Vyberte model: `gpt-4` nebo `gpt-35-turbo`
4. Pojmenujte deployment: `gpt-4-cashndrive`
5. Nasaďte model

### 2.4 Azure Speech Services

**Prostřednictvím Azure Portal:**
1. Vyhledejte "Speech Services"
2. Klikněte na "Create"
3. Vyplňte:
   - Resource group: `cashndrive-rg`
   - Name: `cashndrive-speech`
   - Region: `West Europe`
   - Pricing tier: `Standard S0`
4. Po vytvoření zkopírujte:
   - Key 1
   - Region

**Prostřednictvím CLI:**
```bash
az cognitiveservices account create \
  --name cashndrive-speech \
  --resource-group cashndrive-rg \
  --kind SpeechServices \
  --sku S0 \
  --location westeurope
```

### 2.5 Azure Functions

**Prostřednictvím Azure Portal:**
1. Vyhledejte "Function App"
2. Klikněte na "Create"
3. Vyplňte:
   - Resource group: `cashndrive-rg`
   - Function App name: `cashndrive-functions`
   - Runtime stack: `Node.js`
   - Version: `18 LTS`
   - Region: `West Europe`
   - Operating System: `Linux`
   - Plan type: `Consumption (Serverless)`
4. Vytvořte Function App

### 2.6 Azure Static Web Apps

**Prostřednictvím Azure Portal:**
1. Vyhledejte "Static Web Apps"
2. Klikněte na "Create"
3. Vyplňte:
   - Resource group: `cashndrive-rg`
   - Name: `cashndrive-webapp`
   - Region: `West Europe`
   - Deployment source: `GitHub`
   - GitHub repository: Vyberte váš fork
   - Build presets: `Custom`
   - App location: `/public`
4. Vytvořte resource

## Krok 3: Konfigurace Aplikace

### 3.1 Lokální prostředí

Vytvořte soubor `.env`:
```bash
cp .env.example .env
```

Vyplňte hodnoty z Azure resources:
```env
# Z Azure Communication Services
ACS_CONNECTION_STRING=endpoint=https://cashndrive-acs.communication.azure.com/;accesskey=...

# Z Azure OpenAI
AZURE_AI_ENDPOINT=https://cashndrive-openai.openai.azure.com/
AZURE_AI_KEY=your_openai_key_here
AZURE_AI_DEPLOYMENT=gpt-4-cashndrive

# Z Azure Speech Services
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=westeurope

# Server
PORT=3000
```

### 3.2 Azure Functions Configuration

V Azure Portal přejděte do vaší Function App:
1. Klikněte na "Configuration"
2. Přidejte Application Settings:
   - `ACS_CONNECTION_STRING`
   - `AZURE_AI_ENDPOINT`
   - `AZURE_AI_KEY`
   - `AZURE_AI_DEPLOYMENT`
   - `AZURE_SPEECH_KEY`
   - `AZURE_SPEECH_REGION`

## Krok 4: Instalace a Spuštění

### 4.1 Instalace závislostí
```bash
npm install
```

### 4.2 Lokální testování
```bash
npm start
```

Otevřete prohlížeč na `http://localhost:3000`

### 4.3 Testování Functions lokálně
```bash
cd backend
npm install
func start
```

## Krok 5: Nasazení

### 5.1 Nasazení Azure Functions

```bash
cd backend
func azure functionapp publish cashndrive-functions
```

### 5.2 Nasazení Static Web App

**Automatické (GitHub Actions):**
- Push do main branch automaticky nasadí aplikaci

**Manuální:**
```bash
az staticwebapp create \
  --name cashndrive-webapp \
  --resource-group cashndrive-rg \
  --source . \
  --location westeurope \
  --branch main
```

## Krok 6: Ověření

### 6.1 Test Azure Functions
Otestujte endpointy:
```bash
# Token endpoint
curl https://cashndrive-functions.azurewebsites.net/api/token

# Speech config
curl https://cashndrive-functions.azurewebsites.net/api/speech-config

# Chat endpoint (POST)
curl -X POST https://cashndrive-functions.azurewebsites.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ahoj", "conversationHistory": []}'
```

### 6.2 Test webové aplikace
1. Otevřete vaši Static Web App URL
2. Klikněte na "Demo Hovoru"
3. Zahajte hovor
4. Ověřte, že:
   - Hovor se spustí
   - Zobrazí se přepis
   - Po ukončení se zobrazí shrnutí

## Krok 7: Monitoring a Ladění

### 7.1 Application Insights
1. V Azure Portal přejděte do Function App
2. Klikněte na "Application Insights"
3. Prohlédněte si logs a metriky

### 7.2 Log Stream
```bash
# Sledování logs v reálném čase
func azure functionapp logstream cashndrive-functions
```

## Krok 8: Optimalizace

### 8.1 Přizpůsobení AI promptu
Upravte `backend/ai-assistant.js`:
```javascript
const AI_SYSTEM_PROMPT = `
Upravte systémový prompt podle vašich potřeb...
`;
```

### 8.2 Nastavení hlasu
Upravte SPEECH_CONFIG v `backend/ai-assistant.js`:
```javascript
const SPEECH_CONFIG = {
    voiceName: 'cs-CZ-AntoninNeural', // Změňte hlas
    speechRate: '1.0', // Upravte rychlost
    speechPitch: '0%' // Upravte výšku
};
```

### 8.3 Styling
Upravte `public/styles.css` pro změnu vzhledu aplikace.

## Řešení Běžných Problémů

### Problem: "Function app not found"
**Řešení:** Ujistěte se, že Function App existuje a máte správné permissions.

### Problem: "Unauthorized" při volání API
**Řešení:** Zkontrolujte, že Application Settings obsahují správné klíče.

### Problem: Hlas není k dispozici
**Řešení:** Ověřte, že vybraný hlas je dostupný ve vašem regionu.

### Problem: AI neodpovídá v češtině
**Řešení:** Zkontrolujte systémový prompt a ujistěte se, že specifikuje český jazyk.

## Bezpečnostní Doporučení

1. **Nikdy necommitujte .env soubor**
2. **Používejte Azure Key Vault** pro produkční klíče
3. **Nastavte CORS** správně pro produkční URL
4. **Rotujte klíče pravidelně**
5. **Monitorujte usage** Azure služeb

## Náklady

Orientační měsíční náklady (při nízkém využití):
- Azure Communication Services: ~$0-50
- Azure OpenAI: ~$10-100 (závisí na použití)
- Azure Speech Services: ~$1-20 (first 500,000 chars free)
- Azure Functions: Free tier pokrývá většinu potřeb
- Azure Static Web Apps: Free tier pro základní použití

**Total: ~$11-170/měsíc** (závisí na trafficu)

## Další Kroky

1. Prozkoumejte [Azure Communication Services dokumentaci](https://docs.microsoft.com/azure/communication-services/)
2. Přečtěte si o [Azure AI best practices](https://docs.microsoft.com/azure/ai-services/)
3. Implementujte vlastní business logiku
4. Přidejte databázové ukládání pro přepisy
5. Nastavte monitoring a alerting

## Podpora

Pro technickou podporu:
- Azure Portal Support
- GitHub Issues v tomto repository
- Stack Overflow s tagem `azure-communication-services`

---

**Úspěšné nasazení! 🎉**
