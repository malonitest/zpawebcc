# Užitečné příkazy - CashNDrive AI Asistent

Sbírka často používaných příkazů pro práci s projektem.

---

## 🚀 Development

### Spuštění lokálně

```bash
# Backend (Azure Functions)
cd backend
npm start
# nebo
func start --verbose

# Frontend (Python HTTP server)
cd frontend
python -m http.server 8000

# Frontend (Node.js http-server)
npx http-server frontend -p 8000
```

### Instalace dependencies

```bash
# Backend
cd backend
npm install

# Aktualizace všech packages
npm update

# Audit security issues
npm audit
npm audit fix
```

---

## ☁️ Azure CLI

### Resource Group

```bash
# Vytvoření
az group create --name cashndrive-rg --location westeurope

# Zobrazení
az group show --name cashndrive-rg

# Smazání (POZOR!)
az group delete --name cashndrive-rg --yes
```

### Communication Services

```bash
# Získání connection string
az communication list-key \
  --name cashndrive-communication \
  --resource-group cashndrive-rg

# Zobrazení detailů
az communication show \
  --name cashndrive-communication \
  --resource-group cashndrive-rg
```

### Speech Services

```bash
# Vytvoření
az cognitiveservices account create \
  --name cashndrive-speech \
  --resource-group cashndrive-rg \
  --kind SpeechServices \
  --sku S0 \
  --location westeurope \
  --yes

# Získání klíčů
az cognitiveservices account keys list \
  --name cashndrive-speech \
  --resource-group cashndrive-rg
```

### Azure OpenAI

```bash
# Vytvoření
az cognitiveservices account create \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --kind OpenAI \
  --sku S0 \
  --location westeurope

# Získání endpoint
az cognitiveservices account show \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --query "properties.endpoint" \
  --output tsv

# Získání klíče
az cognitiveservices account keys list \
  --name cashndrive-openai \
  --resource-group cashndrive-rg \
  --query "key1" \
  --output tsv
```

### Azure Functions

```bash
# Vytvoření Storage Account
az storage account create \
  --name cashndrivestorage \
  --resource-group cashndrive-rg \
  --location westeurope \
  --sku Standard_LRS

# Vytvoření Function App
az functionapp create \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account cashndrivestorage \
  --os-type Linux

# Seznam funkcí
az functionapp function list \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Zobrazení logů
az functionapp log tail \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Nastavení environment variables
az functionapp config appsettings set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --settings KEY=VALUE

# Zobrazení všech nastavení
az functionapp config appsettings list \
  --name cashndrive-functions \
  --resource-group cashndrive-rg
```

### Static Web Apps

```bash
# Vytvoření
az staticwebapp create \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --location westeurope \
  --source https://github.com/malonitest/zpawebcc \
  --branch main \
  --app-location "frontend" \
  --api-location "backend"

# Získání URL
az staticwebapp show \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --query "defaultHostname" \
  --output tsv

# Seznam deploymentů
az staticwebapp environment list \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg
```

### Key Vault

```bash
# Vytvoření
az keyvault create \
  --name cashndrive-keyvault \
  --resource-group cashndrive-rg \
  --location westeurope

# Uložení secret
az keyvault secret set \
  --vault-name cashndrive-keyvault \
  --name SECRET-NAME \
  --value "secret-value"

# Získání secret
az keyvault secret show \
  --vault-name cashndrive-keyvault \
  --name SECRET-NAME \
  --query "value" \
  --output tsv

# Seznam secrets
az keyvault secret list \
  --vault-name cashndrive-keyvault
```

---

## 📦 Deployment

### Backend deployment

```bash
cd backend

# Deploy na Azure
func azure functionapp publish cashndrive-functions

# Deploy s verbose výstupem
func azure functionapp publish cashndrive-functions --verbose

# Deploy specifické funkce
func azure functionapp publish cashndrive-functions \
  --function-name GetAIResponse
```

### Frontend deployment

```bash
# Pomocí Azure CLI
az staticwebapp deploy \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --app-location frontend

# Pomocí GitHub (automaticky po push)
git add .
git commit -m "Update"
git push origin main
```

---

## 🔍 Monitoring & Debugging

### Application Insights

```bash
# Vytvoření
az monitor app-insights component create \
  --app cashndrive-insights \
  --resource-group cashndrive-rg \
  --location westeurope \
  --application-type web

# Získání Instrumentation Key
az monitor app-insights component show \
  --app cashndrive-insights \
  --resource-group cashndrive-rg \
  --query "instrumentationKey" \
  --output tsv

# Live metrics
az monitor app-insights component show \
  --app cashndrive-insights \
  --resource-group cashndrive-rg
```

### Query Application Insights

```bash
# Pomocí Azure CLI
az monitor app-insights query \
  --app cashndrive-insights \
  --resource-group cashndrive-rg \
  --analytics-query "requests | where timestamp > ago(1h) | summarize count() by name"
```

### Function App logs

```bash
# Real-time logs
az functionapp log tail \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Download logs
az functionapp log download \
  --name cashndrive-functions \
  --resource-group cashndrive-rg
```

---

## 🧪 Testing

### Lokální testování API

```bash
# Test GetSpeechToken
curl http://localhost:7071/api/GetSpeechToken

# Test GetAIResponse
curl -X POST http://localhost:7071/api/GetAIResponse \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Ahoj","conversationHistory":[]}'

# Test GenerateSummary
curl -X POST http://localhost:7071/api/GenerateSummary \
  -H "Content-Type: application/json" \
  -d '{"messages":[],"duration":60}'
```

### Produkční testování

```bash
# Test GetSpeechToken
curl https://cashndrive-functions.azurewebsites.net/api/GetSpeechToken

# Test GetAIResponse
curl -X POST https://cashndrive-functions.azurewebsites.net/api/GetAIResponse \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Dobrý den","conversationHistory":[]}'
```

---

## 🔐 Security

### CORS nastavení

```bash
# Přidat CORS origin
az functionapp cors add \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --allowed-origins "https://www.cashndrive.cz"

# Zobrazit CORS origins
az functionapp cors show \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Odebrat CORS origin
az functionapp cors remove \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --allowed-origins "http://localhost:8000"
```

### Managed Identity

```bash
# Povolit Managed Identity
az functionapp identity assign \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

# Získat Principal ID
az functionapp identity show \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --query principalId \
  --output tsv

# Udělit přístup k Key Vault
az keyvault set-policy \
  --name cashndrive-keyvault \
  --object-id <principal-id> \
  --secret-permissions get list
```

---

## 💰 Cost Management

### Zobrazení nákladů

```bash
# Current month costs
az consumption usage list \
  --start-date 2025-11-01 \
  --end-date 2025-11-30

# Budget creation
az consumption budget create \
  --amount 300 \
  --budget-name cashndrive-budget \
  --resource-group cashndrive-rg \
  --time-grain Monthly

# Cost analysis
az costmanagement query \
  --type Usage \
  --scope "subscriptions/{subscription-id}/resourceGroups/cashndrive-rg" \
  --timeframe MonthToDate
```

---

## 🗑️ Cleanup

### Smazání resourceů

```bash
# Smazat celou resource group (POZOR!)
az group delete --name cashndrive-rg --yes --no-wait

# Smazat specifický resource
az functionapp delete \
  --name cashndrive-functions \
  --resource-group cashndrive-rg

az staticwebapp delete \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg
```

---

## 📝 Git příkazy

### Základní workflow

```bash
# Inicializace
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/malonitest/zpawebcc.git
git push -u origin main

# Běžný workflow
git add .
git commit -m "Update feature"
git push

# Vytvoření větve
git checkout -b feature/new-feature
git push -u origin feature/new-feature

# Merge
git checkout main
git merge feature/new-feature
git push
```

### Revert změn

```bash
# Revert poslední commit
git revert HEAD
git push

# Revert specifický commit
git revert <commit-hash>
git push

# Reset (POZOR! Ztráta změn)
git reset --hard HEAD~1
git push --force
```

---

## 🔧 Užitečné one-liners

```bash
# Najít process na portu
lsof -i :7071

# Zabít process na portu
kill -9 $(lsof -t -i:7071)

# Zkontrolovat Azure login
az account show

# Změnit Azure subscription
az account set --subscription "subscription-name"

# Zobrazit všechny resource groups
az group list --output table

# Zobrazit všechny resources v group
az resource list --resource-group cashndrive-rg --output table

# Export ARM template
az group export \
  --name cashndrive-rg \
  --output-file cashndrive-template.json

# Rychlý JSON query
az functionapp show \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  | jq '.defaultHostName'
```

---

## 📊 Performance profiling

```bash
# Function execution stats
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/cashndrive-rg/providers/Microsoft.Web/sites/cashndrive-functions \
  --metric "FunctionExecutionCount" \
  --start-time 2025-11-11T00:00:00Z \
  --end-time 2025-11-11T23:59:59Z

# Average response time
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/cashndrive-rg/providers/Microsoft.Web/sites/cashndrive-functions \
  --metric "AverageResponseTime"
```

---

## 🔄 Backup & Restore

```bash
# Backup Function App
az functionapp config backup create \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --storage-account-url "https://cashndrivestorage.blob.core.windows.net/backups"

# Restore Function App
az functionapp config backup restore \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --backup-name "backup-name"
```

---

## 📖 Dokumentace

```bash
# Otevřít Azure dokumentaci
open https://docs.microsoft.com/azure/

# Otevřít Functions dokumentaci
open https://docs.microsoft.com/azure/azure-functions/

# Otevřít OpenAI dokumentaci
open https://learn.microsoft.com/azure/ai-services/openai/
```

---

**Tip:** Uložte si tyto příkazy do `~/.bashrc` nebo `~/.zshrc` jako aliasy pro rychlejší použití!

```bash
# Příklad aliasů
alias cdn-start-backend="cd ~/zpawebcc/backend && func start"
alias cdn-start-frontend="cd ~/zpawebcc/frontend && python -m http.server 8000"
alias cdn-deploy="cd ~/zpawebcc/backend && func azure functionapp publish cashndrive-functions"
```
