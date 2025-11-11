// Simple Express server for local development without Azure Functions Core Tools
const express = require('express');
const cors = require('cors');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const config = require('./config');

const app = express();
const PORT = 7071;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Azure Functions context
const createContext = () => {
  const log = (...args) => console.log('[LOG]', ...args);
  log.error = (...args) => console.error('[ERROR]', ...args);
  log.warn = (...args) => console.warn('[WARN]', ...args);
  
  return { log };
};

// GetSpeechToken endpoint
app.get('/api/GetSpeechToken', async (req, res) => {
  const context = createContext();
  context.log('Getting Speech token...');

  try {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION || 'westeurope';

    res.status(200).json({
      token: 'DEMO_TOKEN',
      region: speechRegion,
      expiresIn: 600
    });
  } catch (error) {
    context.log.error('Error getting speech token:', error);
    res.status(500).json({ error: 'Failed to get speech token' });
  }
});

// GetAIResponse endpoint
app.post('/api/GetAIResponse', async (req, res) => {
  const context = createContext();
  context.log('Processing AI request with GPT-4o...');

  try {
    const { userMessage, conversationHistory } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Try to use GPT-4o
    let aiResponse;
    try {
      aiResponse = await getGPT4oResponse(userMessage, conversationHistory, context);
    } catch (aiError) {
      context.log.error('GPT-4o error, using demo response:', aiError.message);
      aiResponse = generateDemoResponse(userMessage);
    }

    res.status(200).json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    context.log.error('Error processing AI request:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// GenerateSummary endpoint
app.post('/api/GenerateSummary', async (req, res) => {
  const context = createContext();
  context.log('Generating call summary with GPT-4o...');

  try {
    const { messages, duration } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Try AI-powered summary first
    let summary;
    try {
      summary = await generateAISummary(messages, duration || 0, context);
    } catch (aiError) {
      context.log.error('AI summary failed, using rule-based:', aiError.message);
      summary = analyzMessages(messages, duration || 0);
    }
    
    res.status(200).json(summary);
  } catch (error) {
    context.log.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// HandleIncomingCall endpoint
app.post('/api/HandleIncomingCall', async (req, res) => {
  const context = createContext();
  context.log('Handling incoming call...');

  try {
    const { callId, from, to } = req.body;
    context.log(`Call received: ${callId} from ${from} to ${to}`);

    res.status(200).json({
      message: 'Call accepted',
      callId: callId,
      status: 'connected'
    });
  } catch (error) {
    context.log.error('Error handling call:', error);
    res.status(500).json({ error: 'Failed to handle call' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CashNDrive Backend is running' });
});

// Helper functions

/**
 * Systémový prompt pro AI asistenta
 */
function getSystemPrompt() {
  return `Jsi profesionální AI hlasový asistent pro společnost CashNDrive. 

TVOJE ROLE:
- Jsi mužský asistent, přibližně 30 let
- Mluvíš přirozeně česky, jasně a stručně
- Jsi klidný, profesionální a empatický
- Pomáháš zákazníkům s jejich dotazy a požadavky

CHOVÁNÍ:
1. Pozdravi zákazníka profesionálně
2. Představ se jako AI asistent CashNDrive
3. Zjisti důvod volání zákazníka
4. Pokládej relevantní otázky pro upřesnění požadavků
5. Poskytuj jasné a srozumitelné odpovědi
6. Navrhuj konkrétní řešení nebo další kroky
7. Na konci shrň, co bylo domluveno
8. Ověř, zda zákazník potřebuje ještě něco dalšího
9. Rozluč se zdvořile

CO DĚLAT:
- Udržuj přirozený dialog
- Používej krátké věty (10-20 slov)
- Buď konkrétní a věcný
- Pamatuj si kontext celé konverzace
- Buď trpělivý a ochotný vysvětlit znovu

CO NEDĚLAT:
- Neuvádět technické interní informace
- Neříkat "jsem jen AI model"
- Nepoužívat robotické nebo formální fráze
- Nedávat rady mimo kompetence
- Neposkytovat osobní údaje zákazníků

INFORMACE O SLUŽBÁCH:
- Nabízíme AI řešení pro zákaznickou podporu
- Automatické přijímání hovorů 24/7
- Přirozená konverzace v češtině
- Integrace s Azure službami
- Demo je dostupné zdarma na webu

KONTAKTY:
- Email: info@cashndrive.cz
- Telefon: +420 XXX XXX XXX (Po-Pá 9-17)
- Web: demo dostupné kdykoliv

Odpovídej vždy v češtině, přirozeně a profesionálně. Udržuj odpovědi krátké - ideálně 1-3 věty.`;
}

/**
 * Získat odpověď od GPT-4o
 */
async function getGPT4oResponse(userMessage, conversationHistory, context) {
  const aiEndpoint = config.AZURE_AI_ENDPOINT;
  const aiKey = config.AZURE_AI_KEY;
  const deploymentName = config.AZURE_AI_DEPLOYMENT_NAME;

  if (!aiEndpoint || !aiKey) {
    throw new Error('AI credentials not configured');
  }

  const client = new OpenAIClient(aiEndpoint, new AzureKeyCredential(aiKey));

  // Připravit zprávy
  const messages = [
    { role: 'system', content: getSystemPrompt() }
  ];

  // Přidat historii
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }

  // Přidat aktuální zprávu
  messages.push({
    role: 'user',
    content: userMessage
  });

  context.log(`Calling GPT-4o with ${messages.length} messages`);

  const result = await client.getChatCompletions(
    deploymentName,
    messages,
    {
      maxTokens: 500,
      temperature: 0.7,
      topP: 0.95
    }
  );

  return result.choices[0].message.content;
}

/**
 * Generovat AI shrnutí pomocí GPT-4o
 */
async function generateAISummary(messages, duration, context) {
  const aiEndpoint = config.AZURE_AI_ENDPOINT;
  const aiKey = config.AZURE_AI_KEY;
  const deploymentName = config.AZURE_AI_DEPLOYMENT_NAME;

  if (!aiEndpoint || !aiKey) {
    throw new Error('AI credentials not configured');
  }

  const client = new OpenAIClient(aiEndpoint, new AzureKeyCredential(aiKey));

  const conversationText = messages
    .map(m => `${m.type === 'user' ? 'Zákazník' : 'AI Asistent'}: ${m.text}`)
    .join('\n');

  const analysisPrompt = `Analyzuj následující hovor mezi zákazníkem a AI asistentem a vytvoř strukturované shrnutí.

KONVERZACE:
${conversationText}

DÉLKA HOVORU: ${duration} sekund

Vytvoř JSON s následující strukturou:
{
  "reason": "Stručný důvod hovoru (max 50 znaků)",
  "customerNeeds": ["seznam identifikovaných potřeb zákazníka"],
  "aiActions": ["co AI asistent udělal během hovoru"],
  "followUp": "doporučené další kroky",
  "sentiment": "Pozitivní/Neutrální/Negativní",
  "keyPoints": ["3-5 klíčových bodů z hovoru"]
}

Odpověz pouze validním JSON bez dalšího textu.`;

  const result = await client.getChatCompletions(
    deploymentName,
    [
      { role: 'system', content: 'Jsi expert na analýzu zákaznických hovorů. Vytváříš strukturovaná shrnutí v JSON formátu.' },
      { role: 'user', content: analysisPrompt }
    ],
    {
      maxTokens: 800,
      temperature: 0.3,
      responseFormat: { type: 'json_object' }
    }
  );

  const aiSummary = JSON.parse(result.choices[0].message.content);
  
  return {
    timestamp: new Date().toISOString(),
    duration: duration,
    reason: aiSummary.reason,
    customerNeeds: aiSummary.customerNeeds,
    aiActions: aiSummary.aiActions,
    followUp: aiSummary.followUp,
    sentiment: aiSummary.sentiment,
    keyPoints: aiSummary.keyPoints || [],
    messageCount: messages.length,
    userMessageCount: messages.filter(m => m.type === 'user').length,
    aiMessageCount: messages.filter(m => m.type === 'ai').length,
    generatedBy: 'GPT-4o'
  };
}

function generateDemoResponse(userMessage) {
  const lowerText = userMessage.toLowerCase();

  if (lowerText.includes('dobrý den') || lowerText.includes('ahoj') || lowerText.includes('zdravím')) {
    return 'Dobrý den! Jsem AI asistent CashNDrive. Rád vám pomohu. Čím vás mohu dnes obsloužit?';
  } else if (lowerText.includes('cena') || lowerText.includes('kolik')) {
    return 'Naše cenové nabídky se liší podle vašich konkrétních potřeb. Rád vám připravím kalkulaci. Můžete mi říct, o jakou službu máte zájem?';
  } else if (lowerText.includes('kontakt') || lowerText.includes('email')) {
    return 'Můžete nás kontaktovat na emailu info@cashndrive.cz nebo zavoláte na +420 XXX XXX XXX. Kancelář je otevřená v pracovní dny od 9 do 17 hodin. Preferujete email nebo telefon?';
  } else if (lowerText.includes('funguje') || lowerText.includes('jak to')) {
    return 'Náš systém automaticky přijímá hovory a vede s vámi přirozenou konverzaci. Běží na Azure platformě s AI a Speech službami. Chcete vědět něco konkrétního?';
  } else if (lowerText.includes('děkuji') || lowerText.includes('díky')) {
    return 'Není zač, rád jsem pomohl. Potřebujete ještě něco dalšího, nebo můžeme hovor ukončit?';
  } else if (lowerText.includes('ne') && (lowerText.includes('nic') || lowerText.includes('stačí'))) {
    return 'Výborně. Shrnu náš hovor: probírali jsme vaše dotazy a doporučil jsem další kroky. Přeji vám pěkný den!';
  } else {
    return 'Rozumím. Můžete mi prosím poskytnout více informací? Potřebuji vědět konkrétně, s čím vám mám pomoci.';
  }
}

function analyzMessages(messages, duration) {
  const userMessages = messages.filter(m => m.type === 'user');
  const aiMessages = messages.filter(m => m.type === 'ai');
  const allText = messages.map(m => m.text.toLowerCase()).join(' ');

  let reason = 'Obecný dotaz';
  if (allText.includes('cena') || allText.includes('kolik')) {
    reason = 'Cenová poptávka';
  } else if (allText.includes('info') || allText.includes('informace')) {
    reason = 'Žádost o informace';
  } else if (allText.includes('kontakt') || allText.includes('email')) {
    reason = 'Žádost o kontaktní údaje';
  }

  const customerNeeds = [];
  if (allText.includes('cena')) customerNeeds.push('Cenová nabídka');
  if (allText.includes('info') || allText.includes('jak')) customerNeeds.push('Podrobné informace');
  if (allText.includes('kontakt') || allText.includes('email')) customerNeeds.push('Kontaktní údaje');
  if (customerNeeds.length === 0) customerNeeds.push('Základní informace');

  const aiActions = [
    'Poskytnutí základních informací o službách',
    'Odpovědi na dotazy zákazníka',
    'Navržení dalších kroků'
  ];

  let followUp = 'Žádný specifický follow-up';
  if (allText.includes('email') || allText.includes('pošlete')) {
    followUp = 'Zaslání informací emailem';
  }

  let sentiment = 'Neutrální';
  if (allText.includes('děkuji') || allText.includes('super')) {
    sentiment = 'Pozitivní';
  }

  return {
    timestamp: new Date().toISOString(),
    duration: duration,
    reason: reason,
    customerNeeds: customerNeeds,
    aiActions: aiActions,
    followUp: followUp,
    sentiment: sentiment,
    messageCount: messages.length,
    userMessageCount: userMessages.length,
    aiMessageCount: aiMessages.length
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CashNDrive Backend Server is running!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/GetSpeechToken`);
  console.log(`   POST http://localhost:${PORT}/api/GetAIResponse`);
  console.log(`   POST http://localhost:${PORT}/api/GenerateSummary`);
  console.log(`   POST http://localhost:${PORT}/api/HandleIncomingCall`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`\n✨ Ready for requests!\n`);
});
