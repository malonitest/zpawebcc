# Architektura CashNDrive AI Voice Assistant

## Přehled Architektury

```
┌─────────────────────────────────────────────────────────────────┐
│                         Uživatel                                 │
│                    (Webový prohlížeč)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (Frontend)                    │
│  ┌──────────┬──────────┬──────────────┬─────────────────────┐  │
│  │ index.   │  call.   │ transcripts. │    contact.html     │  │
│  │  html    │   html   │     html     │                     │  │
│  └──────────┴──────────┴──────────────┴─────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              JavaScript (call.js, etc.)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   Token     │  │    Chat     │  │   Summary    │
│  Endpoint   │  │  Endpoint   │  │  Endpoint    │
└─────────────┘  └─────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Azure Functions (Backend)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Assistant Logic                           │  │
│  │  • Conversation Management                                │  │
│  │  • System Prompt                                          │  │
│  │  • Context Tracking                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐
│   Azure     │  │   Azure     │  │  Azure   │  │   Azure    │
│ Communi-    │  │     AI      │  │  Speech  │  │   Key      │
│  cation     │  │  Foundry    │  │ Services │  │   Vault    │
│  Services   │  │ (OpenAI)    │  │          │  │ (Optional) │
└─────────────┘  └─────────────┘  └──────────┘  └────────────┘
      │                 │              │
      │                 │              │
      ▼                 ▼              ▼
  Web Calls        AI Responses    STT/TTS
  (Audio)          (Text)          (Audio/Text)
```

## Komponenty Systému

### 1. Frontend Layer (Static Web Apps)

#### **Stránky**
- **index.html**: Domovská stránka s přehledem funkcí
- **call.html**: Hlavní rozhraní pro interakci s AI asistentem
- **transcripts.html**: Zobrazení přepisů hovorů
- **contact.html**: Kontaktní formulář

#### **JavaScript Moduly**
- **call.js**: Správa hovorů, WebRTC komunikace
- **transcripts.js**: Zobrazení a správa přepisů
- **contact.js**: Zpracování kontaktního formuláře

#### **Styling**
- **styles.css**: Responzivní design, moderní UI

### 2. Backend Layer (Azure Functions)

#### **API Endpointy**

##### `/api/token` (GET)
- Generuje bezpečný token pro Azure Communication Services
- Vrací token s expirací
- Input: Žádný
- Output: `{ token, expiresOn, userId }`

##### `/api/chat` (POST)
- Zpracovává konverzaci s AI asistentem
- Udržuje kontext hovoru
- Input: `{ message, conversationHistory }`
- Output: `{ response, conversationHistory, timestamp }`

##### `/api/summary` (POST)
- Generuje shrnutí po ukončení hovoru
- Analyzuje celou konverzaci
- Input: `{ conversationHistory, callDuration }`
- Output: `{ summary, duration, timestamp }`

##### `/api/speech-config` (GET)
- Poskytuje konfiguraci pro Azure Speech Services
- Vrací token pro STT/TTS
- Input: Žádný
- Output: `{ region, voiceConfig, token }`

#### **Backend Logika**
- **ai-assistant.js**: 
  - Systémový prompt
  - AI konfigurace
  - Generování odpovědí
  - Vytváření shrnutí

### 3. Azure Services Layer

#### **Azure Communication Services (ACS)**
```
┌─────────────────────────────────────┐
│  Azure Communication Services       │
│  ┌───────────────────────────────┐ │
│  │  Call Client                  │ │
│  │  • WebRTC Connection          │ │
│  │  • Audio Streaming            │ │
│  │  • Call Controls              │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funkce:**
- Ustanovení a správa webových hovorů
- Real-time audio streaming
- Ovládání hovoru (přijetí, ukončení)

#### **Azure AI Foundry (OpenAI)**
```
┌─────────────────────────────────────┐
│  Azure AI Foundry                   │
│  ┌───────────────────────────────┐ │
│  │  GPT-4 Model                  │ │
│  │  • Conversation Understanding │ │
│  │  • Context Management         │ │
│  │  • Response Generation        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Konfigurace:**
- Model: GPT-4
- Temperature: 0.7
- Max Tokens: 500
- Systémový prompt: Definovaný v ai-assistant.js

#### **Azure Speech Services**
```
┌─────────────────────────────────────┐
│  Azure Speech Services              │
│  ┌────────────┐   ┌──────────────┐ │
│  │ Speech-to- │   │ Text-to-     │ │
│  │ Text (STT) │   │ Speech (TTS) │ │
│  │            │   │              │ │
│  │ cs-CZ      │   │ cs-CZ-       │ │
│  │            │   │ AntoninNeural│ │
│  └────────────┘   └──────────────┘ │
└─────────────────────────────────────┘
```

**STT Konfigurace:**
- Jazyk: cs-CZ
- Continuous recognition
- Profanity filtering: Masked

**TTS Konfigurace:**
- Hlas: cs-CZ-AntoninNeural
- Rychlost: 1.0 (normální)
- Výška: 0% (normální)

## Data Flow

### Scénář 1: Zahájení Hovoru

```
1. Uživatel → [Klikne "Zahájit Hovor"]
2. Frontend → GET /api/token
3. Backend → Azure ACS (získá token)
4. Backend → Frontend (vrátí token)
5. Frontend → Azure ACS (inicializace hovoru)
6. Frontend → POST /api/chat (první zpráva)
7. Backend → Azure AI (generování pozdravu)
8. Backend → Frontend (AI odpověď)
9. Frontend → Azure Speech (TTS - přehrání pozdravu)
```

### Scénář 2: Konverzace

```
1. Uživatel → [Mluví do mikrofonu]
2. Frontend → Azure Speech STT (převod řeči na text)
3. Frontend → POST /api/chat { message, history }
4. Backend → Azure AI (zpracování, generování odpovědi)
5. Backend → Frontend (AI odpověď v textu)
6. Frontend → Azure Speech TTS (převod textu na řeč)
7. Frontend → [Přehrání audio odpovědi]
8. Frontend → [Zobrazení v přepisu]
```

### Scénář 3: Ukončení Hovoru

```
1. Uživatel → [Klikne "Ukončit Hovor"]
2. Frontend → Azure ACS (ukončení audio streamu)
3. Frontend → POST /api/summary { history, duration }
4. Backend → Azure AI (generování shrnutí)
5. Backend → Frontend (strukturované shrnutí)
6. Frontend → [Zobrazení shrnutí]
7. Frontend → SessionStorage (uložení přepisu)
```

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│            Security Layers                      │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  1. HTTPS/TLS Encryption                │  │
│  │     • All communication encrypted       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  2. Token-based Authentication          │  │
│  │     • Short-lived tokens                │  │
│  │     • No keys on frontend               │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  3. Environment Variables               │  │
│  │     • Keys in Azure config              │  │
│  │     • Optional Key Vault integration    │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  4. CORS Configuration                  │  │
│  │     • Restricted origins                │  │
│  │     • Method whitelisting               │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌──────────────────────────────────────────────┐
│        Application Insights                  │
│  ┌────────────────────────────────────────┐ │
│  │  • Request/Response tracking           │ │
│  │  • Error logging                       │ │
│  │  • Performance metrics                 │ │
│  │  • Custom events                       │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│           Log Analytics                      │
│  • Query logs                                │
│  • Create alerts                             │
│  • Dashboard visualization                   │
└──────────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling
- **Azure Functions**: Automatické škálování podle zátěže
- **Static Web Apps**: CDN distribuce globálně
- **Azure Services**: Elastické škálování

### Performance Optimizations
- Caching tokenů
- Connection pooling
- Async/await pro non-blocking operace
- Lazy loading frontend assets

## Disaster Recovery

### Backup Strategy
- Konfigurace uložena v Git repository
- Azure resource templates (ARM/Bicep)
- Pravidelné snapshoty konfigurace

### High Availability
- Azure Services mají 99.9% SLA
- Multi-region deployment možnost
- Automatic failover

## Cost Optimization

### Resource Usage
- **Functions**: Consumption plan (pay per execution)
- **Static Web Apps**: Free tier pro low traffic
- **AI Services**: Pouze při aktivním použití
- **Speech Services**: Pay per transaction

### Estimated Monthly Costs
- Low traffic (100 calls/month): ~$20
- Medium traffic (1000 calls/month): ~$100
- High traffic (10000 calls/month): ~$500

## Future Enhancements

### Phase 2
- [ ] Database integration pro persistentní ukládání
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] CRM integration

### Phase 3
- [ ] Multi-tenant architecture
- [ ] Custom voice training
- [ ] Sentiment analysis
- [ ] Real-time transcription improvements

## Development Workflow

```
Developer → Git Push → GitHub Actions
                          ↓
                    Build & Test
                          ↓
                    ┌─────┴─────┐
                    ▼           ▼
            Azure Functions  Static Web App
                    │           │
                    └─────┬─────┘
                          ▼
                    Production
```

## Testing Strategy

### Unit Tests
- Backend functions
- Frontend utilities
- AI prompt validation

### Integration Tests
- API endpoint testing
- Azure service connectivity
- End-to-end call flow

### Performance Tests
- Load testing (concurrent calls)
- Speech service latency
- AI response time

---

**Dokumentace aktuální k:** 2024-11-11
