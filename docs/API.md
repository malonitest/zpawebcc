# API Documentation - CashNDrive Backend

REST API dokumentace pro Azure Functions backend.

**Base URL:** `https://cashndrive-functions.azurewebsites.net/api`

---

## Endpoints

### 1. GetSpeechToken

Vrací autorizační token pro Azure Speech Services.

**Endpoint:** `GET /GetSpeechToken`

**Request:**
```http
GET /api/GetSpeechToken HTTP/1.1
Host: cashndrive-functions.azurewebsites.net
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "region": "westeurope",
  "expiresIn": 600
}
```

**Status Codes:**
- `200 OK` - Token úspěšně vygenerován
- `500 Internal Server Error` - Chyba při generování tokenu

**Použití:**
```javascript
const response = await fetch(`${API_ENDPOINT}/GetSpeechToken`);
const { token, region } = await response.json();

// Použít token pro Speech SDK
const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
```

---

### 2. GetAIResponse

Zpracovává uživatelský vstup a vrací odpověď od AI asistenta.

**Endpoint:** `POST /GetAIResponse`

**Request:**
```http
POST /api/GetAIResponse HTTP/1.1
Host: cashndrive-functions.azurewebsites.net
Content-Type: application/json

{
  "userMessage": "Dobrý den, jaké máte ceny?",
  "conversationHistory": [
    {
      "type": "ai",
      "text": "Dobrý den, jak vám mohu pomoci?",
      "timestamp": "2025-11-11T10:00:00Z"
    }
  ]
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userMessage | string | Yes | Zpráva od uživatele |
| conversationHistory | array | No | Historie konverzace (pro kontext) |

**Response:**
```json
{
  "response": "Naše cenové nabídky se liší podle požadavků. Základní balíček začíná od 5000 Kč měsíčně. O jakou službu máte zájem?",
  "timestamp": "2025-11-11T10:00:05Z"
}
```

**Status Codes:**
- `200 OK` - Odpověď úspěšně vygenerována
- `400 Bad Request` - Chybějící userMessage
- `500 Internal Server Error` - Chyba AI služby

**Použití:**
```javascript
const response = await fetch(`${API_ENDPOINT}/GetAIResponse`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: "Dobrý den",
    conversationHistory: []
  })
});

const { response: aiResponse } = await response.json();
```

---

### 3. GenerateSummary

Generuje shrnutí hovoru na základě přepisu konverzace.

**Endpoint:** `POST /GenerateSummary`

**Request:**
```http
POST /api/GenerateSummary HTTP/1.1
Host: cashndrive-functions.azurewebsites.net
Content-Type: application/json

{
  "messages": [
    {
      "speaker": "AI Asistent",
      "text": "Dobrý den, jak vám mohu pomoci?",
      "timestamp": "2025-11-11T10:00:00Z",
      "type": "ai"
    },
    {
      "speaker": "Zákazník",
      "text": "Potřebuji informace o cenách",
      "timestamp": "2025-11-11T10:00:05Z",
      "type": "user"
    }
  ],
  "duration": 180
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messages | array | Yes | Pole zpráv z konverzace |
| duration | number | Yes | Délka hovoru v sekundách |

**Response:**
```json
{
  "timestamp": "2025-11-11T10:03:00Z",
  "duration": 180,
  "reason": "Cenová poptávka",
  "customerNeeds": [
    "Cenová nabídka",
    "Podrobné informace"
  ],
  "aiActions": [
    "Poskytnutí základních informací o službách",
    "Odpovědi na dotazy zákazníka",
    "Navržení dalších kroků"
  ],
  "followUp": "Zaslání cenové nabídky emailem",
  "sentiment": "Pozitivní",
  "messageCount": 12,
  "userMessageCount": 6,
  "aiMessageCount": 6
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | ISO 8601 timestamp |
| duration | number | Délka hovoru v sekundách |
| reason | string | Důvod volání |
| customerNeeds | array | Identifikované potřeby zákazníka |
| aiActions | array | Kroky provedené asistentem |
| followUp | string | Doporučený follow-up |
| sentiment | string | Nálada hovoru (Pozitivní/Negativní/Neutrální) |
| messageCount | number | Celkový počet zpráv |
| userMessageCount | number | Počet zpráv od zákazníka |
| aiMessageCount | number | Počet zpráv od AI |

**Status Codes:**
- `200 OK` - Shrnutí úspěšně vygenerováno
- `400 Bad Request` - Chybějící nebo neplatná data
- `500 Internal Server Error` - Chyba při generování

**Použití:**
```javascript
const response = await fetch(`${API_ENDPOINT}/GenerateSummary`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: conversationMessages,
    duration: 180
  })
});

const summary = await response.json();
```

---

### 4. HandleIncomingCall

Zpracovává příchozí hovory z Azure Communication Services webhook.

**Endpoint:** `POST /HandleIncomingCall`

**Request:**
```http
POST /api/HandleIncomingCall HTTP/1.1
Host: cashndrive-functions.azurewebsites.net
Content-Type: application/json

{
  "callId": "aHR0cHM6Ly9...",
  "from": "+420123456789",
  "to": "+420987654321"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| callId | string | Yes | Jedinečné ID hovoru |
| from | string | Yes | Číslo volajícího |
| to | string | Yes | Číslo volaného |

**Response:**
```json
{
  "message": "Call accepted",
  "callId": "aHR0cHM6Ly9...",
  "status": "connected"
}
```

**Status Codes:**
- `200 OK` - Hovor přijat
- `500 Internal Server Error` - Chyba při přijímání hovoru

**Použití:**
Tento endpoint je volán automaticky Azure Communication Services při příchozím hovoru.

---

## Error Handling

Všechny endpointy vrací chyby v jednotném formátu:

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

### Běžné chybové kódy

| Status Code | Význam |
|-------------|--------|
| 400 | Bad Request - Neplatná data v požadavku |
| 401 | Unauthorized - Chybějící autorizace |
| 403 | Forbidden - Nedostatečná oprávnění |
| 404 | Not Found - Endpoint neexistuje |
| 429 | Too Many Requests - Rate limit překročen |
| 500 | Internal Server Error - Chyba serveru |
| 503 | Service Unavailable - Služba dočasně nedostupná |

---

## Rate Limiting

### Limity
- **Speech Token**: 100 requestů/minutu
- **AI Response**: 20 requestů/minutu
- **Generate Summary**: 50 requestů/minutu

### Response Headers
```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1699704000
```

---

## Authentication

V současné verzi API používá `authLevel: 'anonymous'` pro demo účely.

### Pro produkci doporučujeme:

#### 1. Function Key Authentication
```javascript
const response = await fetch(`${API_ENDPOINT}/GetAIResponse?code=YOUR_FUNCTION_KEY`, {
  method: 'POST',
  // ...
});
```

#### 2. Azure AD Authentication
```javascript
const token = await getAzureADToken();
const response = await fetch(`${API_ENDPOINT}/GetAIResponse`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  // ...
});
```

---

## CORS

Povolené origins jsou nakonfigurovány v Azure Function App:

```javascript
// Povolené origins
const allowedOrigins = [
  'http://localhost:8000',
  'https://cashndrive-frontend.azurestaticapps.net',
  'https://www.cashndrive.cz'
];
```

---

## Webhooks

### Communication Services Webhook

Azure Communication Services posílá události na webhook endpoint.

**Webhook URL:**
```
https://cashndrive-functions.azurewebsites.net/api/HandleIncomingCall
```

**Typy událostí:**
- `Microsoft.Communication.CallConnected`
- `Microsoft.Communication.CallDisconnected`
- `Microsoft.Communication.CallTransferAccepted`
- `Microsoft.Communication.CallTransferFailed`

**Příklad payload:**
```json
{
  "id": "unique-event-id",
  "topic": "/subscriptions/.../providers/Microsoft.Communication/communicationServices/...",
  "subject": "calling/callConnections/...",
  "eventType": "Microsoft.Communication.CallConnected",
  "eventTime": "2025-11-11T10:00:00Z",
  "data": {
    "callConnectionId": "...",
    "serverCallId": "...",
    "correlationId": "..."
  }
}
```

---

## SDK Integration Examples

### JavaScript/TypeScript

```typescript
// API Client
class CashNDriveAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getSpeechToken(): Promise<{ token: string; region: string }> {
    const response = await fetch(`${this.baseURL}/GetSpeechToken`);
    if (!response.ok) throw new Error('Failed to get speech token');
    return response.json();
  }

  async getAIResponse(
    userMessage: string,
    conversationHistory: any[]
  ): Promise<string> {
    const response = await fetch(`${this.baseURL}/GetAIResponse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, conversationHistory })
    });
    
    if (!response.ok) throw new Error('Failed to get AI response');
    const data = await response.json();
    return data.response;
  }

  async generateSummary(
    messages: any[],
    duration: number
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/GenerateSummary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, duration })
    });
    
    if (!response.ok) throw new Error('Failed to generate summary');
    return response.json();
  }
}

// Použití
const api = new CashNDriveAPI('https://cashndrive-functions.azurewebsites.net/api');
const token = await api.getSpeechToken();
const response = await api.getAIResponse('Dobrý den', []);
```

### Python

```python
import requests
from typing import List, Dict

class CashNDriveAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_speech_token(self) -> Dict:
        response = requests.get(f"{self.base_url}/GetSpeechToken")
        response.raise_for_status()
        return response.json()
    
    def get_ai_response(self, user_message: str, 
                       conversation_history: List[Dict] = None) -> str:
        payload = {
            "userMessage": user_message,
            "conversationHistory": conversation_history or []
        }
        response = requests.post(
            f"{self.base_url}/GetAIResponse",
            json=payload
        )
        response.raise_for_status()
        return response.json()["response"]
    
    def generate_summary(self, messages: List[Dict], duration: int) -> Dict:
        payload = {
            "messages": messages,
            "duration": duration
        }
        response = requests.post(
            f"{self.base_url}/GenerateSummary",
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Použití
api = CashNDriveAPI("https://cashndrive-functions.azurewebsites.net/api")
token = api.get_speech_token()
response = api.get_ai_response("Dobrý den")
```

---

## Performance

### Očekávané response times

| Endpoint | Average | p95 | p99 |
|----------|---------|-----|-----|
| GetSpeechToken | 50ms | 100ms | 200ms |
| GetAIResponse | 1500ms | 3000ms | 5000ms |
| GenerateSummary | 800ms | 1500ms | 2500ms |
| HandleIncomingCall | 100ms | 200ms | 400ms |

### Optimalizace

1. **Caching**: Implementujte caching pro opakované dotazy
2. **Batching**: Zpracujte více requestů najednou
3. **Compression**: Používejte gzip kompresi
4. **CDN**: Využijte Azure CDN pro statický obsah

---

## Monitoring

### Application Insights Queries

```kql
// API call volume
requests
| where timestamp > ago(1h)
| summarize count() by name
| order by count_ desc

// Error rate
requests
| where timestamp > ago(24h)
| summarize 
    total = count(),
    errors = countif(success == false)
| extend errorRate = (errors * 100.0) / total

// Response time percentiles
requests
| where timestamp > ago(1h)
| summarize 
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99)
by name
```

---

## Changelog

### v1.0.0 (2025-11-11)
- ✨ Initial release
- ✅ GetSpeechToken endpoint
- ✅ GetAIResponse endpoint
- ✅ GenerateSummary endpoint
- ✅ HandleIncomingCall endpoint

---

## Support

Pro podporu a bug reporty:
- Email: api-support@cashndrive.cz
- GitHub Issues: https://github.com/malonitest/zpawebcc/issues
- Dokumentace: https://docs.cashndrive.cz

---

**API Version:** 1.0.0  
**Last Updated:** November 11, 2025
