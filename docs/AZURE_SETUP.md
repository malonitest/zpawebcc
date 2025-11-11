# Azure Setup Guide - Detailní návod

Tento návod vás provede komplétním nastavením všech Azure služeb potřebných pro provoz CashNDrive AI Asistenta.

## Předpoklady

- Azure účet ([vytvořit zdarma](https://azure.microsoft.com/free/))
- Azure CLI nainstalované
- Práva na vytváření Azure resources
- Credit card pro ověření (i pro free tier)

---

## 1. Vytvoření Resource Group

Resource group seskupí všechny související zdroje.

```bash
# Přihlášení do Azure
az login

# Vytvoření resource group
az group create \
  --name cashndrive-rg \
  --location westeurope

# Ověření
az group show --name cashndrive-rg
```

---

## 2. Azure Communication Services

### Vytvoření přes Portal

1. Přejděte na [Azure Portal](https://portal.azure.com)
2. Klikněte na **Create a resource**
3. Vyhledejte **Communication Services**
4. Klikněte **Create**

**Nastavení:**
- **Subscription**: Váš subscription
- **Resource group**: `cashndrive-rg`
- **Resource name**: `cashndrive-communication`
- **Region**: `Europe` nebo `Global`
- **Data location**: `Europe`

5. Klikněte **Review + create** → **Create**

### Získání Connection String

```bash
# Získání connection string
az communication list-key \
  --name cashndrive-communication \
  --resource-group cashndrive-rg

# Zkopírujte primaryConnectionString
```

**Uložte connection string do `backend/local.settings.json`:**
```json
"AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING": "endpoint=https://...;accesskey=..."
```

### Konfigurace Calling

1. V Azure Portal otevřete váš Communication Services resource
2. V levém menu: **Phone numbers** (volitelné pro real phone calling)
3. V levém menu: **Keys** → zkopírujte connection string

---

## 3. Azure Speech Services

### Vytvoření Speech Service

```bash
az cognitiveservices account create \
  --name cashndrive-speech \
  --resource-group cashndrive-rg \
  --kind SpeechServices \
  --sku S0 \
  --location westeurope \
  --yes
```

### Získání klíčů

```bash
# Získání subscription key
az cognitiveservices account keys list \
  --name cashndrive-speech \
  --resource-group cashndrive-rg

# Zkopírujte key1
```

**Uložte do `backend/local.settings.json`:**
```json
"AZURE_SPEECH_KEY": "your-key-here",
"AZURE_SPEECH_REGION": "westeurope"
```

### Testování českého hlasu

1. Přejděte na [Speech Studio](https://speech.microsoft.com/portal)
2. Přihlaste se s Azure účtem
3. Vyberte **Text-to-Speech**
4. Nastavte:
   - Language: `Czech (Czech Republic)`
   - Voice: `cs-CZ-AntoninNeural` (Male)
5. Zadejte testovací text: "Dobrý den, jsem AI asistent."
6. Klikněte **Play** pro poslech

---

## 4. Azure OpenAI (AI Foundry)

### Vytvoření Azure OpenAI Resource

**⚠️ Poznámka:** Azure OpenAI vyžaduje schválení. Proces:
1. Vyplňte [žádost o přístup](https://aka.ms/oai/access)
2. Počkejte na schválení (může trvat několik dní)

Po schválení:

```bash
az cognitiveservices account create \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --kind OpenAI \
  --sku S0 \
  --location westeurope
```

### Deployment GPT-4 modelu

1. Přejděte na [Azure OpenAI Studio](https://oai.azure.com/)
2. Vyberte váš resource `cashndrive-openai`
3. V levém menu: **Deployments** → **Create new deployment**
4. Nastavte:
   - **Model**: `gpt-4`
   - **Deployment name**: `gpt-4`
   - **Model version**: Latest
   - **Deployment type**: Standard
5. Klikněte **Create**

### Získání endpoint a klíče

```bash
# Endpoint
az cognitiveservices account show \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --query "properties.endpoint" \
  --output tsv

# Key
az cognitiveservices account keys list \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --query "key1" \
  --output tsv
```

**Uložte do `backend/local.settings.json`:**
```json
"AZURE_AI_ENDPOINT": "https://cashndrive-openai.openai.azure.com/",
"AZURE_AI_KEY": "your-key-here",
"AZURE_AI_DEPLOYMENT_NAME": "gpt-4"
```

---

## 5. Azure Functions

### Vytvoření Function App

```bash
# Nejdříve vytvořte storage account
az storage account create \
  --name cashndrivestorage \
  --resource-group cashndrive-rg \
  --location westeurope \
  --sku Standard_LRS

# Vytvořte Function App
az functionapp create \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account cashndrivestorage \
  --os-type Linux
```

### Nastavení Application Settings

```bash
# Nastavte environment variables
az functionapp config appsettings set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --settings \
    AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING="your-connection-string" \
    AZURE_SPEECH_KEY="your-speech-key" \
    AZURE_SPEECH_REGION="westeurope" \
    AZURE_AI_ENDPOINT="your-ai-endpoint" \
    AZURE_AI_KEY="your-ai-key" \
    AZURE_AI_DEPLOYMENT_NAME="gpt-4"
```

### Konfigurace CORS

```bash
# Povolit CORS pro local development a production
az functionapp cors add \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --allowed-origins \
    "http://localhost:8000" \
    "https://cashndrive-frontend.azurestaticapps.net"
```

---

## 6. Azure Static Web Apps (Frontend Hosting)

### Vytvoření Static Web App

```bash
az staticwebapp create \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --location westeurope \
  --source https://github.com/malonitest/zpawebcc \
  --branch main \
  --app-location "frontend" \
  --api-location "backend" \
  --login-with-github
```

### Konfigurace Custom Domain (volitelné)

1. V Azure Portal otevřete Static Web App
2. V levém menu: **Custom domains**
3. Klikněte **Add**
4. Zadejte doménu: `www.cashndrive.cz`
5. Přidejte CNAME záznam u vašeho DNS providera
6. Klikněte **Validate + Configure**

---

## 7. Application Insights (Monitoring)

### Vytvoření Application Insights

```bash
az monitor app-insights component create \
  --app cashndrive-insights \
  --resource-group cashndrive-rg \
  --location westeurope \
  --application-type web
```

### Propojení s Function App

```bash
# Získání Instrumentation Key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app cashndrive-insights \
  --resource-group cashndrive-rg \
  --query "instrumentationKey" \
  --output tsv)

# Nastavení v Function App
az functionapp config appsettings set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

---

## 8. Azure Key Vault (Bezpečné ukládání secrets)

### Vytvoření Key Vault

```bash
az keyvault create \
  --name cashndrive-keyvault \
  --resource-group cashndrive-rg \
  --location westeurope
```

### Uložení secrets

```bash
# Uložit Speech key
az keyvault secret set \
  --vault-name cashndrive-keyvault \
  --name AZURE-SPEECH-KEY \
  --value "your-speech-key"

# Uložit AI key
az keyvault secret set \
  --vault-name cashndrive-keyvault \
  --name AZURE-AI-KEY \
  --value "your-ai-key"
```

### Povolit přístup Function App

```bash
# Povolit Managed Identity
az functionapp identity assign \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Získat Principal ID
PRINCIPAL_ID=$(az functionapp identity show \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --query principalId \
  --output tsv)

# Udělit přístup k Key Vault
az keyvault set-policy \
  --name cashndrive-keyvault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

---

## 9. Ověření konfigurace

### Kontrolní seznam

- [ ] Resource group vytvořena
- [ ] Communication Services nakonfigurována
- [ ] Speech Services s českým hlasem
- [ ] Azure OpenAI s GPT-4 deployment
- [ ] Function App běží
- [ ] Static Web App nasazena
- [ ] Application Insights aktivní
- [ ] Key Vault nakonfigurován
- [ ] Všechny secrets uloženy
- [ ] CORS správně nastaveno

### Test služeb

```bash
# Test Function App
curl https://cashndrive-functions.azurewebsites.net/api/GetSpeechToken

# Očekávaný výstup: JSON s tokenem
```

---

## 10. Cenové odhady

| Služba | Tier | Cena/měsíc |
|--------|------|-----------|
| Communication Services | Pay-as-you-go | ~$20 |
| Speech Services | S0 | ~$75 |
| Azure OpenAI | S0 | ~$150 |
| Azure Functions | Consumption | ~$15 |
| Static Web Apps | Free | $0 |
| Application Insights | Pay-as-you-go | ~$10 |
| Key Vault | Standard | ~$5 |
| **CELKEM** | | **~$275/měsíc** |

### Snížení nákladů

1. **Použít Free Tier** kde je možné:
   - Static Web Apps: Free tier (100 GB bandwidth/měsíc)
   - Azure Functions: 1M free executions/měsíc
   
2. **Optimalizovat AI volání**:
   - Cache častých odpovědí
   - Použít GPT-3.5-Turbo pro jednodušší dotazy
   
3. **Nastavit budgety**:
   ```bash
   # Nastavit alert při 80% rozpočtu
   az consumption budget create \
     --amount 300 \
     --budget-name cashndrive-budget \
     --resource-group cashndrive-rg \
     --time-grain Monthly
   ```

---

## 11. Další kroky

Po dokončení Azure setup:

1. **Aktualizujte konfiguraci** v `backend/local.settings.json`
2. **Nasaďte backend**: `func azure functionapp publish cashndrive-functions`
3. **Otestujte aplikaci**: Otevřete Static Web App URL
4. **Nastavte monitoring**: Zkontrolujte Application Insights
5. **Konfigurujte alerting**: Nastavte alerty pro chyby

---

## Troubleshooting

### "Access denied" při vytváření OpenAI
- Ujistěte se, že máte schválený přístup k Azure OpenAI
- Vyplňte žádost na https://aka.ms/oai/access

### "Quota exceeded"
- Zkontrolujte limity vašeho subscription
- Požádejte o zvýšení kvóty v Azure Portal

### Speech Services nefunguje
- Ověřte správný region (westeurope)
- Zkontrolujte, že je vybrán S0 tier (free F0 má omezení)

### Function App se nenasadí
- Zkontrolujte Azure Functions Core Tools verzi
- Ujistěte se, že `backend/package.json` je správně

---

## Kontakt a podpora

- **Azure Support**: https://azure.microsoft.com/support/
- **Dokumentace**: https://docs.microsoft.com/azure/
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/

---

**Gratulujeme! Azure setup je hotový. 🎉**

Pokračujte na [Deployment Guide](DEPLOYMENT.md) pro nasazení aplikace.
