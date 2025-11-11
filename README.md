# CashNDrive AI Voice Assistant

Inteligentní AI hlasový asistent pro automatické zpracování zákaznických hovorů s využitím Azure služeb.

## 🎯 Přehled Projektu

Tato aplikace implementuje komplexní AI hlasového asistenta, který:
- ✅ Automaticky přijímá příchozí hovory
- ✅ Vede přirozený dialog v češtině
- ✅ Rozumí kontextu a poskytuje relevantní odpovědi
- ✅ Vytváří automatická shrnutí hovorů
- ✅ Běží na Azure infrastruktuře

## 🏗️ Architektura

### Frontend
- **Statické HTML/CSS/JS stránky**
- Responzivní design
- Real-time zobrazení přepisů
- Rozhraní pro ovládání hovorů

### Backend (Azure Functions)
- **chat.js** - Zpracování konverzace s AI
- **summary.js** - Generování shrnutí hovorů
- **token.js** - Poskytování bezpečných tokenů pro ACS
- **speech-config.js** - Konfigurace Azure Speech Services

### Azure Služby
1. **Azure Communication Services** - Webové hovory
2. **Azure AI Foundry** - AI asistent a generování odpovědí
3. **Azure Speech Services** - Speech-to-Text a Text-to-Speech
4. **Azure Functions** - Serverless backend
5. **Azure Static Web Apps** - Hosting frontendu

## 📋 Požadavky

- Node.js 18+ (pro lokální vývoj)
- Azure účet s přístupem k:
  - Azure Communication Services
  - Azure AI Foundry
  - Azure Speech Services
  - Azure Functions

## 🚀 Instalace

### 1. Klonování repozitáře
```bash
git clone https://github.com/malonitest/zpawebcc.git
cd zpawebcc
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Konfigurace prostředí
Vytvořte soubor `.env` na základě `.env.example`:

```bash
cp .env.example .env
```

Vyplňte následující hodnoty:

```env
# Azure Communication Services
ACS_CONNECTION_STRING=endpoint=https://...;accesskey=...
ACS_PHONE_NUMBER=+420...

# Azure AI Foundry
AZURE_AI_ENDPOINT=https://...openai.azure.com/
AZURE_AI_KEY=your_key_here
AZURE_AI_DEPLOYMENT=gpt-4

# Azure Speech Services
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=westeurope

# Server
PORT=3000
```

### 4. Spuštění aplikace

**Lokální vývoj:**
```bash
npm start
```

Aplikace bude dostupná na `http://localhost:3000`

## 📁 Struktura Projektu

```
zpawebcc/
├── public/                    # Frontend soubory
│   ├── index.html            # Domovská stránka
│   ├── call.html             # Demo hovoru
│   ├── transcripts.html      # Přepisy hovorů
│   ├── contact.html          # Kontaktní formulář
│   ├── styles.css            # Styling
│   ├── call.js               # Logika hovorů
│   ├── transcripts.js        # Zobrazení přepisů
│   └── contact.js            # Kontaktní formulář
├── backend/                   # Backend Azure Functions
│   ├── ai-assistant.js       # AI konfigurace a prompty
│   ├── functions/
│   │   ├── chat.js           # Endpoint pro konverzaci
│   │   ├── summary.js        # Endpoint pro shrnutí
│   │   ├── token.js          # Endpoint pro tokeny
│   │   └── speech-config.js  # Endpoint pro Speech config
│   └── host.json             # Azure Functions konfigurace
├── server.js                  # Express server pro dev
├── package.json              # NPM dependencies
├── .env.example              # Příklad konfigurace
└── README.md                 # Dokumentace
```

## 🤖 AI Asistent - Chování

### Systémový Prompt
AI asistent je nakonfigurován s detailním systémovým promptem, který definuje:

1. **Roli**: Profesionální mužský asistent (cca 30 let)
2. **Osobnost**: Klidný, profesionální, empatický
3. **Komunikační styl**: Jasný, krátké věty, neutrální čeština
4. **Průběh hovoru**:
   - Pozdrav a představení
   - Zjištění důvodu volání
   - Aktivní naslouchání
   - Poskytování řešení
   - Shrnutí a rozloučení

### Hlasové Nastavení
- **Hlas**: `cs-CZ-AntoninNeural` (Azure Neural Voice)
- **Rychlost řeči**: Normální (1.0)
- **Výška hlasu**: Normální
- **Jazyk**: Čeština (cs-CZ)

### Shrnutí Hovoru
Po ukončení každého hovoru AI vytvoří strukturované shrnutí obsahující:
- Důvod volání
- Požadavky zákazníka
- Poskytnutá řešení
- Doporučené další kroky
- Poznámky

## 🌐 Stránky Aplikace

### 1. Domovská Stránka (`index.html`)
- Přehled funkcí AI asistenta
- Call-to-action tlačítka
- Informace o tom, jak systém funguje

### 2. Demo Hovoru (`call.html`)
- Rozhraní pro zahájení a ukončení hovoru
- Real-time přepis konverzace
- Zobrazení trvání hovoru
- Automatické shrnutí po ukončení

### 3. Přepisy (`transcripts.html`)
- Zobrazení všech přepisů z aktuální relace
- Historie konverzací
- Poznámka: Přepisy nejsou trvale ukládány

### 4. Kontakt (`contact.html`)
- Kontaktní formulář jako fallback
- Alternativní způsob komunikace

## 🔧 Konfigurace Azure Služeb

### Azure Communication Services
1. Vytvořte ACS resource v Azure Portal
2. Získejte Connection String
3. Nakonfigurujte telefonní číslo (volitelné)

### Azure AI Foundry
1. Vytvořte Azure OpenAI resource
2. Nasaďte model (např. GPT-4)
3. Získejte endpoint a klíč

### Azure Speech Services
1. Vytvořte Speech Services resource
2. Získejte klíč a region
3. Ověřte dostupnost českého hlasu `cs-CZ-AntoninNeural`

### Azure Functions
1. Vytvořte Function App v Azure Portal
2. Nakonfigurujte Application Settings s potřebnými klíči
3. Nasaďte funkce z adresáře `backend/functions/`

### Azure Static Web Apps
1. Vytvořte Static Web App
2. Propojte s GitHub repository
3. Nakonfigurujte build (public folder)

## 🔐 Bezpečnost

- **Klíče a tokeny**: Všechny citlivé údaje jsou uloženy v environment variables
- **Azure Key Vault**: Doporučeno pro produkční prostředí
- **CORS**: Nakonfigurován pro zabezpečení API
- **Token expiration**: Tokeny mají omezenou platnost
- **No client-side keys**: API klíče nejsou vystaveny na frontend

## 📊 Monitorování

- **Application Insights**: Sledování výkonu a chyb
- **Logs**: Detailní logování v Azure Functions
- **Metrics**: Tracking volání, trvání, úspěšnosti

## 🧪 Testování

Pro lokální testování:
```bash
npm start
```

Otevřete `http://localhost:3000` a:
1. Klikněte na "Demo Hovoru"
2. Zahajte hovor
3. Sledujte přepis v reálném čase
4. Ukončete hovor a prohlédněte si shrnutí

## 🚀 Nasazení

### Pomocí Azure CLI
```bash
# Nasazení Functions
cd backend
func azure functionapp publish <your-function-app-name>

# Nasazení Static Web App
cd ..
az staticwebapp create \
  --name cashndrive-ai-assistant \
  --resource-group <your-resource-group> \
  --source .
```

### Pomocí GitHub Actions
Repozitář obsahuje workflow pro automatické nasazení při push do main branch.

## 📝 Další Vývoj

### Plánované Funkce
- [ ] Integrace s databází pro ukládání přepisů
- [ ] Dashboard pro analýzu hovorů
- [ ] Multi-tenant podpora
- [ ] Rozšířené analytiky
- [ ] Integrace s CRM systémy

## 🐛 Řešení Problémů

### Hovor se nespouští
- Zkontrolujte, zda jsou všechny Azure služby správně nakonfigurovány
- Ověřte platnost tokenů
- Zkontrolujte console v prohlížeči pro chybové hlášky

### AI neodpovídá správně
- Upravte systémový prompt v `backend/ai-assistant.js`
- Zkontrolujte nastavení modelu (temperature, max_tokens)

### Hlas nezní správně
- Ověřte dostupnost hlasu `cs-CZ-AntoninNeural` ve vašem regionu
- Upravte speech konfiguraci v `backend/ai-assistant.js`

## 📄 Licence

MIT

## 👥 Podpora

Pro podporu a dotazy kontaktujte prostřednictvím kontaktního formuláře v aplikaci.

---

**Postaveno s ❤️ pomocí Azure AI Services**