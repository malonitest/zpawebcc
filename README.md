# Cash and Drive - AI Asistent

AI asistent pro zákaznickou podporu s podporou hlasových hovorů. Systém automaticky přijímá a vede hovory se zákazníky, poskytuje odpovědi v reálném čase a vytváří shrnutí po ukončení hovoru.

## 🎯 Hlavní vlastnosti

- **Automatické přijímání hovorů**: Tlačítko pro příjem a ukončení hovoru
- **Český hlas**: Mužský hlas, přibližně 30 let (Antonín Neural)
- **Inteligentní konverzace**: AI automaticky reaguje na dotazy zákazníků
- **Real-time komunikace**: Okamžité odpovědi a zpracování
- **Shrnutí hovoru**: Po ukončení hovoru se zobrazí metadata a shrnutí
- **Azure integrace**: Využívá Azure Communication Services, Speech Services a AI Foundry

## 🏗️ Architektura

### Frontend (Statický web)
- HTML/CSS/JavaScript
- Uživatelské rozhraní pro simulaci hovoru
- Zobrazení konverzace v reálném čase
- Prezentace shrnutí a metadat po hovoru

### Backend (Node.js/Express)
- RESTful API pro správu hovorů
- Integrace s Azure Speech Services (STT/TTS)
- Integrace s Azure AI Foundry pro inteligentní odpovědi
- Správa bezpečných klíčů a konfigurace
- Session management pro hovory

## 🚀 Instalace a spuštění

### Předpoklady
- Node.js 16+ a npm
- Azure účet s aktivními službami:
  - Azure Communication Services
  - Azure Speech Services
  - Azure AI Foundry (volitelné pro pokročilé AI funkce)

### Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/malonitest/zpawebcc.git
cd zpawebcc
```

2. Nainstalujte backend závislosti:
```bash
cd backend
npm install
```

3. Vytvořte `.env` soubor v kořenovém adresáři:
```bash
cp .env.example .env
```

4. Upravte `.env` soubor a doplňte vaše Azure přihlašovací údaje:
```env
AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=your_region
PORT=3000
```

### Spuštění

1. Spusťte backend server:
```bash
cd backend
npm start
```

2. Otevřete prohlížeč a přejděte na:
```
http://localhost:3000
```

## 📋 Použití

1. **Zahájení hovoru**: Klikněte na tlačítko "Přijmout hovor"
2. **Konverzace**: Píšte zprávy v textovém poli a posílejte je tlačítkem "Odeslat"
3. **Ukončení hovoru**: Klikněte na tlačítko "Ukončit hovor"
4. **Zobrazení shrnutí**: Po ukončení hovoru se automaticky zobrazí shrnutí a metadata

## 🔧 API Endpointy

### `POST /api/call/start`
Zahájí novou call session a vrátí session ID s úvodním pozdravem.

### `POST /api/call/process`
Zpracuje zprávu od uživatele a vrátí AI odpověď.
```json
{
  "sessionId": "uuid",
  "userMessage": "text zprávy"
}
```

### `POST /api/call/speech-to-text`
Konvertuje audio na text (STT).

### `POST /api/call/text-to-speech`
Konvertuje text na audio (TTS).

### `POST /api/call/end`
Ukončí hovor a vrátí shrnutí s metadaty.
```json
{
  "sessionId": "uuid"
}
```

### `GET /api/call/:sessionId`
Získá data pro konkrétní call session.

## 🛡️ Bezpečnost

- Všechny Azure klíče jsou uloženy v `.env` souboru (nikdy necommitovat!)
- Backend slouží jako secure proxy pro Azure služby
- Frontend nemá přímý přístup k API klíčům

## 🧪 Testování

Aplikace funguje ve dvou režimech:

1. **Development (mock)**: Bez Azure přihlašovacích údajů - používá simulované odpovědi
2. **Production**: S platným Azure nastavením - plná funkcionalita

## 📝 Konfigurace hlasu

Asistent používá český mužský hlas `cs-CZ-AntoninNeural` z Azure Neural TTS. 
Pro změnu hlasu upravte v `backend/services/speechService.js`:

```javascript
this.speechConfig.speechSynthesisVoiceName = 'cs-CZ-AntoninNeural';
```

Další dostupné české hlasy:
- `cs-CZ-AntoninNeural` (muž)
- `cs-CZ-VlastaNeural` (žena)

## 🤖 AI Asistent - Osobnost

**Jméno**: Jakub
**Věk**: ~30 let
**Jazyk**: Čeština
**Styl komunikace**: Profesionální, přátelský, empatický

Asistent je naprogramován:
- Představit se na začátku hovoru
- Ptát se na detaily situace zákazníka
- Poskytovat jasná a užitečná řešení
- Být trpělivý a chápavý
- Mluvit přirozeným českým jazykem

## 📊 Struktura projektu

```
zpawebcc/
├── backend/
│   ├── services/
│   │   ├── aiService.js          # AI logika a generování odpovědí
│   │   ├── speechService.js      # Azure Speech (STT/TTS)
│   │   └── callService.js        # Azure Communication Services
│   ├── server.js                 # Express server a API
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── styles.css           # Styly aplikace
│   ├── js/
│   │   └── app.js               # Frontend logika
│   └── index.html               # Hlavní HTML
├── .env.example                 # Vzorová konfigurace
├── .gitignore
└── README.md
```

## 🔄 Workflow hovoru

1. Uživatel klikne "Přijmout hovor"
2. Backend vytvoří novou session
3. Asistent se představí pozdravem
4. Uživatel píše zprávy
5. Backend zpracuje zprávy přes AI službu
6. Asistent odpovídá v reálném čase
7. Uživatel klikne "Ukončit hovor"
8. Backend generuje shrnutí
9. Frontend zobrazí metadata a shrnutí hovoru

## 🌐 Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Azure Services**:
  - Communication Services (správa hovorů)
  - Speech Services (STT/TTS, český jazyk)
  - AI Foundry (konverzační AI)

## 📄 Licence

MIT

## 👥 Autor

Cash and Drive Team

## 🆘 Podpora

Pro technickou podporu nebo dotazy kontaktujte vývojový tým.