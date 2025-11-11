# Quick Start Guide - CashNDrive AI Asistent

Rychlý průvodce pro spuštění projektu během 10 minut.

---

## 🚀 Rychlý start (Local Development)

### 1. Prerekvizity

Zkontrolujte, že máte nainstalováno:
```bash
node --version  # v18 nebo novější
npm --version
```

Pokud ne, stáhněte: https://nodejs.org/

---

### 2. Klonování projektu

```bash
git clone https://github.com/malonitest/zpawebcc.git
cd zpawebcc
```

---

### 3. Instalace backend dependencies

```bash
cd backend
npm install
cd ..
```

---

### 4. Konfigurace (Demo mode)

Pro rychlé testování můžete použít demo mode, který funguje bez Azure služeb.

Backend již obsahuje `local.settings.json` s demo nastavením.

---

### 5. Spuštění backend

```bash
cd backend
npm start
# Nebo: func start
```

✅ Backend běží na `http://localhost:7071`

Nechejte tento terminál otevřený.

---

### 6. Spuštění frontend

Otevřete **nový terminál**:

```bash
cd frontend

# Metoda 1: Python (doporučeno)
python -m http.server 8000

# Metoda 2: Node.js http-server
npx http-server -p 8000

# Metoda 3: Přímo otevřít index.html v prohlížeči
```

✅ Frontend běží na `http://localhost:8000`

---

### 7. Otevření v prohlížeči

1. Otevřete: `http://localhost:8000`
2. Klikněte na **"Demo hovoru"**
3. Klikněte **"Zahájit hovor"**
4. Povolte přístup k mikrofonu
5. Řekněte: "Dobrý den"

🎉 **Gratulujeme! Aplikace funguje!**

---

## 🔧 Co dělat dál?

### Pro testování s reálnými Azure službami:

1. **Vytvořte Azure účet**
   - Jděte na: https://azure.microsoft.com/free/
   - Získáte $200 credit zdarma

2. **Nastavte Azure služby**
   - Následujte: `docs/AZURE_SETUP.md`
   - Získejte klíče pro Speech a AI

3. **Aktualizujte konfiguraci**
   
Upravte `backend/local.settings.json`:
```json
{
  "Values": {
    "AZURE_SPEECH_KEY": "your-actual-key",
    "AZURE_SPEECH_REGION": "westeurope",
    "AZURE_AI_ENDPOINT": "https://your-resource.openai.azure.com/",
    "AZURE_AI_KEY": "your-actual-key",
    "AZURE_AI_DEPLOYMENT_NAME": "gpt-4"
  }
}
```

4. **Restartujte backend**
```bash
cd backend
npm start
```

---

## 🎯 Demo scénáře

Vyzkoušejte tyto konverzace s AI asistentem:

### Scénář 1: Základní dotaz
**Vy:** "Dobrý den, co nabízíte?"  
**AI:** Představí služby a zeptá se na detaily

### Scénář 2: Cenová poptávka
**Vy:** "Kolik to stojí?"  
**AI:** Poskytne cenové informace a nabídne kalkulaci

### Scénář 3: Kontaktní údaje
**Vy:** "Jak vás mohu kontaktovat?"  
**AI:** Poskytne email, telefon a další kontakty

### Scénář 4: Rozloučení
**Vy:** "Děkuji, to je vše."  
**AI:** Shrne hovor a zdvořile se rozloučí

---

## 📱 Jak to funguje?

```
┌─────────────┐
│   Mluvíte   │ (mikrofon)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Web Speech  │ Speech-to-Text
│     API     │ (převod na text)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     AI      │ Zpracování textu
│  Response   │ (generování odpovědi)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Speech    │ Text-to-Speech
│  Synthesis  │ (převod na hlas)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Slyšíte    │ (reproduktor)
│  odpověď    │
└─────────────┘
```

---

## 🐛 Řešení problémů

### Mikrofon nefunguje?
- Zkontrolujte oprávnění v prohlížeči (ikona zámku v adresním řádku)
- Zkuste jiný prohlížeč (Chrome/Edge doporučené)
- Ujistěte se, že mikrofon funguje v jiných aplikacích

### Backend nereaguje?
```bash
# Zkontrolujte, že běží na port 7071
netstat -an | grep 7071

# Restartujte backend
cd backend
npm start
```

### "CORS error"?
- Ujistěte se, že frontend běží na `localhost:8000`
- Zkontrolujte, že backend běží na `localhost:7071`
- Restartujte oba servery

### AI neodpovídá správně?
V demo režimu AI používá předpřipravené odpovědi. Pro lepší výsledky:
1. Nastavte Azure OpenAI
2. Aktualizujte konfiguraci
3. Restartujte backend

---

## 📚 Další dokumentace

- [Kompletní README](../README.md)
- [Azure Setup Guide](AZURE_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md)

---

## 💡 Tipy pro vývoj

### Hot Reload
Backend podporuje automatické načítání změn:
```bash
cd backend
func start --verbose
```

### Debug Mode
```bash
# Zobrazit detailní logy
cd backend
func start --verbose --debug
```

### Testování bez mikrofonu
Můžete testovat pouze textový chat v konzoli:
```javascript
// V browser console
const response = await fetch('http://localhost:7071/api/GetAIResponse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'Dobrý den',
    conversationHistory: []
  })
});
const data = await response.json();
console.log(data.response);
```

---

## 🎨 Úprava vzhledu

Všechny styly jsou v `frontend/css/styles.css`.

Změna barevného schématu:
```css
:root {
    --primary-color: #0078d4;  /* Změňte na vaši barvu */
    --secondary-color: #50e6ff;
    /* ... */
}
```

---

## 🔄 Aktualizace projektu

```bash
# Stáhnout nejnovější změny
git pull origin main

# Aktualizovat dependencies
cd backend
npm update

# Restartovat
npm start
```

---

## ❓ Potřebujete pomoc?

- 📧 Email: info@cashndrive.cz
- 🐛 GitHub Issues: https://github.com/malonitest/zpawebcc/issues
- 📖 Dokumentace: `docs/` složka

---

## ⏱️ Časový plán pro kompletní setup

| Krok | Čas |
|------|-----|
| Klonování + instalace | 5 min |
| Local development start | 2 min |
| První test hovoru | 1 min |
| **CELKEM** | **~10 min** |

**S Azure setupem:**
| Krok | Čas |
|------|-----|
| Vytvoření Azure účtu | 10 min |
| Azure služby setup | 30 min |
| Konfigurace projektu | 10 min |
| Testing | 10 min |
| **CELKEM** | **~60 min** |

---

**Hodně štěstí s vývojem! 🚀**
