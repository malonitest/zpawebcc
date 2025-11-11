# Azure Configuration - CashNDrive AI Assistant

Tento soubor obsahuje konfiguraci pro všechny Azure služby použité v projektu.

## 1. Azure Communication Services

### Účel
Zpracování webových hovorů a real-time komunikace mezi zákazníkem a AI asistentem.

### Konfigurace
```json
{
  "serviceName": "cashndrive-communication",
  "connectionString": "endpoint=https://xxxxx.communication.azure.com/;accesskey=xxxxx",
  "endpoint": "https://xxxxx.communication.azure.com",
  "features": [
    "Calling",
    "Audio Streaming",
    "WebRTC"
  ]
}
```

### Potřebné kroky
1. Vytvořit Communication Services resource v Azure Portal
2. Získat connection string
3. Nastavit webhook pro příchozí hovory
4. Nakonfigurovat audio streaming

## 2. Azure Speech Services

### Účel
- **Speech-to-Text (STT)**: Převod hlasu zákazníka na text
- **Text-to-Speech (TTS)**: Převod AI odpovědí na hlas

### Konfigurace
```json
{
  "serviceName": "cashndrive-speech",
  "region": "westeurope",
  "subscriptionKey": "xxxxx",
  "language": "cs-CZ",
  "ttsVoice": "cs-CZ-AntoninNeural",
  "sttSettings": {
    "continuous": true,
    "interimResults": true,
    "profanityFilter": "Masked"
  },
  "ttsSettings": {
    "voiceStyle": "professional",
    "rate": "0.95",
    "pitch": "0.9"
  }
}
```

### Supported Czech Voices
- **cs-CZ-AntoninNeural** (Male) - ✅ POUŽITÝ
- cs-CZ-VlastaNeural (Female)

### Potřebné kroky
1. Vytvořit Speech Service v Azure Portal
2. Vybrat region: West Europe (nejblíže ČR)
3. Získat subscription key
4. Otestovat český hlas cs-CZ-AntoninNeural
5. Nakonfigurovat custom pronunciation pokud je potřeba

## 3. Azure AI Foundry (OpenAI)

### Účel
Zpracování konverzace a generování inteligentních odpovědí.

### Konfigurace
```json
{
  "serviceName": "cashndrive-ai",
  "endpoint": "https://xxxxx.openai.azure.com/",
  "apiKey": "xxxxx",
  "deploymentName": "gpt-4",
  "apiVersion": "2024-02-15-preview",
  "modelParameters": {
    "temperature": 0.7,
    "max_tokens": 500,
    "top_p": 0.95,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  }
}
```

### Doporučené modely
- **GPT-4** (nejlepší pro češtinu a konverzaci) - ✅ DOPORUČENÝ
- GPT-4-Turbo (rychlejší, ale dražší)
- GPT-3.5-Turbo (levnější, ale horší čeština)

### System Prompt
Viz `system-prompt.md` pro kompletní instrukce pro AI.

### Potřebné kroky
1. Vytvořit Azure OpenAI resource
2. Požádat o přístup (pokud není povolen)
3. Nasadit GPT-4 model
4. Získat endpoint a API key
5. Nastavit rate limiting podle potřeby

## 4. Azure Functions

### Účel
Backend API pro zpracování hovorů, AI komunikaci a správu dat.

### Konfigurace
```json
{
  "runtime": "node",
  "version": "18",
  "region": "westeurope",
  "functions": [
    "GetSpeechToken",
    "GetAIResponse",
    "GenerateSummary",
    "HandleIncomingCall"
  ]
}
```

### Environment Variables
```env
AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING=endpoint=https://xxxxx
AZURE_SPEECH_KEY=xxxxx
AZURE_SPEECH_REGION=westeurope
AZURE_AI_ENDPOINT=https://xxxxx.openai.azure.com/
AZURE_AI_KEY=xxxxx
AZURE_AI_DEPLOYMENT_NAME=gpt-4
```

### Potřebné kroky
1. Vytvořit Function App v Azure Portal
2. Nakonfigurovat Application Settings
3. Nastavit CORS pro frontend
4. Povolit Managed Identity pro bezpečnější přístup
5. Nakonfigurovat Application Insights pro monitoring

## 5. Azure Static Web Apps (volitelné)

### Účel
Hosting statického frontendu.

### Konfigurace
```json
{
  "name": "cashndrive-frontend",
  "location": "westeurope",
  "sku": "Free",
  "buildConfiguration": {
    "appLocation": "frontend",
    "apiLocation": "backend",
    "outputLocation": "frontend"
  }
}
```

### Potřebné kroky
1. Vytvořit Static Web App
2. Připojit GitHub repository
3. Nakonfigurovat automatické nasazení
4. Nastavit custom domain (volitelné)

## 6. Security Best Practices

### Klíče a přístup
- ❌ Nikdy neukládejte klíče v kódu
- ✅ Používejte Azure Key Vault
- ✅ Používejte Managed Identity kde je to možné
- ✅ Rotujte klíče pravidelně

### CORS
```json
{
  "allowedOrigins": [
    "https://cashndrive.azurestaticapps.net",
    "https://www.cashndrive.cz"
  ],
  "allowedMethods": ["GET", "POST"],
  "allowedHeaders": ["Content-Type", "Authorization"],
  "maxAge": 3600
}
```

### Rate Limiting
- Communication Services: Max 100 concurrent calls
- Speech Services: Max 20 concurrent STT streams
- OpenAI: Max 10 requests/second

## 7. Cenové odhady (měsíčně)

### Azure Communication Services
- Calling: $0.004/min
- 1000 hovorů (5 min průměr) = ~$20

### Azure Speech Services
- STT: $1/hour
- TTS: $16/1M characters
- Odhad: ~$50-100

### Azure OpenAI (GPT-4)
- Input: $0.03/1K tokens
- Output: $0.06/1K tokens
- Odhad: ~$100-200

### Azure Functions
- Consumption: První 1M spuštění zdarma
- Odhad: ~$10-20

**Celkem: ~$180-340/měsíc** (pro střední provoz)

## 8. Monitoring a Diagnostika

### Application Insights
```json
{
  "instrumentationKey": "xxxxx",
  "enableAutoCollect": true,
  "sampling": {
    "isEnabled": true,
    "maxTelemetryItemsPerSecond": 20
  }
}
```

### Metriky ke sledování
- Počet hovorů (celkem, úspěšné, neúspěšné)
- Průměrná délka hovoru
- STT/TTS latence
- AI response time
- Error rate
- User satisfaction (sentiment analysis)

## 9. Backup a Disaster Recovery

### Strategie
- Přepisy hovorů: Backup do Azure Storage
- Konfigurace: Infrastructure as Code (Terraform/Bicep)
- Multi-region fallback pro kritické služby

## 10. Deployment Pipeline

### CI/CD s GitHub Actions
```yaml
trigger: main branch
steps:
  1. Build frontend
  2. Deploy Static Web App
  3. Build backend
  4. Deploy Azure Functions
  5. Run integration tests
  6. Smoke tests
```

## Kontaktní informace pro support
- Azure Support Portal
- Dokumentace: https://docs.microsoft.com/azure
