# CashNDrive - AI Hlasový Asistent

**Inteligentní AI asistent pro automatickou zákaznickou podporu s přirozenou konverzací v češtině.**

![Azure](https://img.shields.io/badge/Azure-0078D4?style=flat&logo=microsoft-azure&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 📋 Obsah

- [O projektu](#o-projektu)
- [Funkce](#funkce)
- [Architektura](#architektura)
- [Technologie](#technologie)
- [Instalace](#instalace)
- [Konfigurace](#konfigurace)
- [Spuštění](#spuštění)
- [Použití](#použití)
- [Deployment do Azure](#deployment-do-azure)
- [Struktura projektu](#struktura-projektu)

---

## 🎯 O projektu

CashNDrive je komplexní řešení pro automatickou zákaznickou podporu využívající AI. Projekt umožňuje:

- ✅ **Automatické přijímání hovorů** po stisknutí tlačítka
- ✅ **Přirozenou konverzaci** v češtině s mužským hlasem
- ✅ **Real-time zpracování** řeči zákazníka
- ✅ **Inteligentní odpovědi** pomocí Azure AI Foundry
- ✅ **Automatické shrnutí** po ukončení hovoru
- ✅ **Kompletní přepisy** všech konverzací

---

## 🚀 Funkce

### Hovorové funkce
- Příjem webových hovorů přes Azure Communication Services
- Obousměrné audio streaming
- Vizualizace průběhu hovoru
- Možnost manuálního ukončení

### AI Asistent
- Mluví přirozeně česky
- Mužský hlas (30 let)
- Vede kompletní konverzaci
- Sbírá potřebné údaje
- Poskytuje odpovědi a řešení
- Rozpoznává záměr zákazníka

### Speech Services
- **STT (Speech-to-Text)**: Převod řeči na text v reálném čase
- **TTS (Text-to-Speech)**: Přirozený mužský český hlas
- Podpora pro průběžné rozpoznávání
- Nízká latence

### Webové rozhraní
- Domovská stránka s informacemi
- Demo rozhraní pro testování asistenta
- Zobrazení přepisů hovorů
- Kontaktní formulář

---

## 🏗️ Architektura

```
┌─────────────┐
│   Zákazník  │
└──────┬──────┘
       │ Hovor
       ▼
┌──────────────────────────────────────┐
│      Azure Communication Services     │
│     (Webové hovory, Audio stream)     │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   Speech     │  │   Speech    │
│   Services   │  │   Services  │
│     (STT)    │  │    (TTS)    │
└──────┬───────┘  └──────▲──────┘
       │                 │
       │   ┌─────────────┘
       ▼   │
┌────────────────┐
│  Azure AI      │
│   Foundry      │
│  (GPT-4)       │
└────────┬───────┘
         │
         ▼
┌─────────────────┐
│ Azure Functions │
│    (Backend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│  (Static Web)   │
└─────────────────┘
```

---

## 🛠️ Technologie

### Frontend
- **HTML5/CSS3**: Responzivní design
- **JavaScript (Vanilla)**: Bez frameworků pro jednoduchost
- **Web Speech API**: Fallback pro STT/TTS

### Backend
- **Azure Functions**: Serverless backend
- **Node.js 18+**: Runtime environment
- **Azure SDK**: Integrace s Azure službami

### Azure služby
- **Azure Communication Services**: Hovorová infrastruktura
- **Azure Speech Services**: STT/TTS (cs-CZ-AntoninNeural)
- **Azure AI Foundry (OpenAI)**: GPT-4 pro konverzaci
- **Azure Static Web Apps**: Hosting frontendu
- **Application Insights**: Monitoring a analytics

---

## 📦 Instalace

### Prerekvizity
- Node.js 18+ ([stáhnout](https://nodejs.org/))
- Azure účet ([vytvořit](https://azure.microsoft.com/free/))
- Azure CLI ([instalace](https://docs.microsoft.com/cli/azure/install-azure-cli))
- Azure Functions Core Tools ([instalace](https://docs.microsoft.com/azure/azure-functions/functions-run-local))

### 1. Klonování repository
```bash
git clone https://github.com/malonitest/zpawebcc.git
cd zpawebcc
```

### 2. Instalace backend dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Konfigurace Azure služeb
Následujte kroky v `docs/AZURE_SETUP.md` pro vytvoření a konfiguraci Azure zdrojů.

---

## ⚙️ Konfigurace

### 1. Environment variables (Backend)

Vytvořte `backend/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING": "your-connection-string",
    "AZURE_SPEECH_KEY": "your-speech-key",
    "AZURE_SPEECH_REGION": "westeurope",
    "AZURE_AI_ENDPOINT": "https://your-resource.openai.azure.com/",
    "AZURE_AI_KEY": "your-ai-key",
    "AZURE_AI_DEPLOYMENT_NAME": "gpt-4"
  }
}
```

### 2. Frontend konfigurace

Upravte `frontend/js/main.js`:
```javascript
const CONFIG = {
    API_ENDPOINT: 'http://localhost:7071/api', // Pro local development
    // API_ENDPOINT: '/api', // Pro production
};
```

---

## 🚀 Spuštění

### Local Development

#### 1. Spustit backend (Azure Functions)
```bash
cd backend
func start
```
Backend běží na `http://localhost:7071`

#### 2. Spustit frontend
Otevřete `frontend/index.html` v prohlížeči, nebo použijte local server:

```bash
# Použití Python
cd frontend
python -m http.server 8000

# Nebo Node.js http-server
npx http-server frontend -p 8000
```

Frontend běží na `http://localhost:8000`

#### 3. Otestovat aplikaci
1. Otevřete `http://localhost:8000`
2. Přejděte na "Demo hovoru"
3. Klikněte na "Zahájit hovor"
4. Povolte přístup k mikrofonu
5. Mluvte česky s AI asistentem

---

## 💻 Použití

### Demo režim
1. **Domovská stránka**: Informace o projektu
2. **Demo hovoru**: Otestujte AI asistenta
   - Klikněte "Zahájit hovor"
   - Povolte mikrofon
   - Mluvte s asistentem
   - Sledujte přepis v reálném čase
   - Po ukončení se zobrazí shrnutí
3. **Přepisy**: Historie všech hovorů
4. **Kontakt**: Kontaktní formulář

### Příklady konverzace

**Zákazník**: "Dobrý den, jaké máte ceny?"  
**Asistent**: "Dobrý den! Naše cenové nabídky se liší podle požadavků. Rád vám připravím kalkulaci. O jakou službu máte zájem?"

**Zákazník**: "Potřebuji informace o AI asistentovi"  
**Asistent**: "Náš AI asistent automaticky přijímá hovory a vede přirozenou konverzaci v češtině. Běží 24/7. Co konkrétně by vás zajímalo?"

---

## 🌐 Deployment do Azure

### 1. Příprava

```bash
# Přihlášení do Azure
az login

# Vytvoření resource group
az group create --name cashndrive-rg --location westeurope
```

### 2. Deployment backendu (Azure Functions)

```bash
cd backend

# Vytvoření Function App
az functionapp create \
  --resource-group cashndrive-rg \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name cashndrive-functions \
  --storage-account cashndrivestorage

# Nastavení environment variables
az functionapp config appsettings set \
  --name cashndrive-functions \
  --resource-group cashndrive-rg \
  --settings @appsettings.json

# Deploy
func azure functionapp publish cashndrive-functions
```

### 3. Deployment frontendu (Static Web Apps)

```bash
# Vytvoření Static Web App
az staticwebapp create \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --location westeurope \
  --source https://github.com/malonitest/zpawebcc \
  --branch main \
  --app-location "frontend" \
  --api-location "backend"
```

### 4. Konfigurace Custom Domain (volitelné)

```bash
# Přidání custom domain
az staticwebapp hostname set \
  --name cashndrive-frontend \
  --resource-group cashndrive-rg \
  --hostname www.cashndrive.cz
```

---

## 📁 Struktura projektu

```
zpawebcc/
├── frontend/                    # Webový frontend
│   ├── index.html              # Domovská stránka
│   ├── demo.html               # Demo rozhraní hovoru
│   ├── transcripts.html        # Historie přepisů
│   ├── contact.html            # Kontaktní formulář
│   ├── css/
│   │   └── styles.css          # Kompletní styly
│   └── js/
│       ├── main.js             # Hlavní konfigurace
│       ├── call-handler.js     # Správa hovorů
│       ├── speech-services.js  # STT/TTS integrace
│       ├── transcripts.js      # Správa přepisů
│       └── contact.js          # Kontaktní formulář
│
├── backend/                     # Azure Functions backend
│   ├── GetSpeechToken.js       # Token pro Speech Services
│   ├── GetAIResponse.js        # AI konverzace
│   ├── GenerateSummary.js      # Shrnutí hovoru
│   ├── HandleIncomingCall.js   # Příchozí hovory
│   ├── host.json               # Functions konfigurace
│   ├── local.settings.json     # Local environment
│   └── package.json            # Dependencies
│
├── config/                      # Konfigurační soubory
│   ├── system-prompt.md        # AI systémový prompt
│   └── azure-config.md         # Azure konfigurace
│
├── docs/                        # Dokumentace
│   ├── AZURE_SETUP.md          # Azure setup guide
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── API.md                  # API dokumentace
│
└── README.md                    # Tento soubor
```

---

## 📚 Dokumentace

### Detailní návody
- [Azure Setup Guide](docs/AZURE_SETUP.md) - Nastavení Azure služeb
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment do produkce
- [API Documentation](docs/API.md) - Backend API reference
- [System Prompt](config/system-prompt.md) - AI instrukce
- [Azure Configuration](config/azure-config.md) - Azure služby

### Klíčové koncepty

#### AI Asistent
AI asistent je nakonfigurován s detailním systémovým promptem (viz `config/system-prompt.md`). Klíčové charakteristiky:
- Mužský hlas, 30 let
- Profesionální a empatický
- Krátké, jasné odpovědi (1-3 věty)
- Rozumí kontextu celé konverzace

#### Průběh hovoru
1. Úvodní pozdrav
2. Zjištění důvodu volání
3. Poskytnutí informací/řešení
4. Sbírání údajů (pokud potřeba)
5. Shrnutí a rozloučení

---

## 🔧 Troubleshooting

### Mikrofon nefunguje
- Zkontrolujte oprávnění prohlížeče
- Použijte HTTPS (Chrome/Edge vyžadují secure context)
- Zkuste jiný prohlížeč (Chrome/Edge doporučené)

### Azure Functions selže
- Zkontrolujte `local.settings.json`
- Ověřte, že máte správné klíče a connection strings
- Zkontrolujte Azure Function logs v portálu

### TTS/STT nefunguje
- Ověřte Azure Speech key a region
- Zkontrolujte, že je vybrán český jazyk (cs-CZ)
- Otestujte Speech Services v Azure Portal

### AI neodpovídá správně
- Zkontrolujte system prompt v `config/system-prompt.md`
- Ověřte deployment GPT-4 modelu
- Zvyšte `max_tokens` pokud jsou odpovědi krátké

---

## 💰 Cenové odhady

Pro střední provoz (1000 hovorů/měsíc, 5 min průměr):

| Služba | Cena/měsíc |
|--------|-----------|
| Communication Services | ~$20 |
| Speech Services | ~$75 |
| Azure OpenAI (GPT-4) | ~$150 |
| Azure Functions | ~$15 |
| Static Web Apps | Zdarma |
| **CELKEM** | **~$260** |

*Ceny jsou orientační a závisí na skutečném využití.*

---

## 🔐 Bezpečnost

### Best Practices
- ✅ Nikdy neukládejte klíče v kódu
- ✅ Používejte Azure Key Vault pro secrets
- ✅ Používejte Managed Identity
- ✅ Nastavte správné CORS politiky
- ✅ Implementujte rate limiting
- ✅ Pravidelně aktualizujte dependencies

---

## 📈 Monitoring

### Application Insights
- Počet hovorů (celkem, úspěšné, neúspěšné)
- Průměrná délka hovoru
- STT/TTS latence
- AI response time
- Error rate
- User satisfaction

### Metriky
Všechny metriky jsou dostupné v Azure Portal → Application Insights.

---

## 🤝 Přispívání

1. Fork repository
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

---

## 📄 Licence

Tento projekt je licencován pod MIT License.

---

## 📞 Kontakt

**CashNDrive Team**
- Email: info@cashndrive.cz
- Web: [www.cashndrive.cz](https://www.cashndrive.cz)
- GitHub: [@malonitest](https://github.com/malonitest)

---

## 🙏 Poděkování

- Microsoft Azure za skvělé cloud služby
- Azure AI Foundry team za GPT-4
- Azure Speech Services za kvalitní české hlasy
- OpenAI za GPT technologii

---

**Vytvořeno s ❤️ pro lepší zákaznickou zkušenost**