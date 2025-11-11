const { app } = require('@azure/functions');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const config = require('./config');

/**
 * Azure Function: GenerateSummary
 * Generuje shrnutí hovoru na základě přepisu konverzace
 * Nyní používá Azure OpenAI GPT-4o pro inteligentní shrnutí
 */
app.http('GenerateSummary', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Generating call summary with GPT-4o...');

        try {
            const body = await request.json();
            const { messages, duration } = body;

            if (!messages || !Array.isArray(messages)) {
                return {
                    status: 400,
                    jsonBody: {
                        error: 'messages array is required'
                    }
                };
            }

            // Zkusit použít GPT-4o pro inteligentní shrnutí
            let summary;
            try {
                summary = await generateAISummary(messages, duration, context);
            } catch (aiError) {
                context.log.error('AI summary failed, using rule-based summary:', aiError.message);
                summary = analyzMessages(messages, duration);
            }

            return {
                status: 200,
                jsonBody: summary
            };

        } catch (error) {
            context.log.error('Error generating summary:', error);
            return {
                status: 500,
                jsonBody: {
                    error: 'Failed to generate summary',
                    details: error.message
                }
            };
        }
    }
});

/**
 * Generuje AI-powered shrnutí pomocí GPT-4o
 */
async function generateAISummary(messages, duration, context) {
    const aiEndpoint = config.AZURE_AI_ENDPOINT;
    const aiKey = config.AZURE_AI_KEY;
    const deploymentName = config.AZURE_AI_DEPLOYMENT_NAME;

    if (!aiEndpoint || !aiKey) {
        throw new Error('AI credentials not configured');
    }

    const client = new OpenAIClient(aiEndpoint, new AzureKeyCredential(aiKey));

    // Připravit konverzaci pro analýzu
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
    
    // Doplnit statistiky
    return {
        timestamp: new Date().toISOString(),
        duration: duration || 0,
        reason: aiSummary.reason,
        customerNeeds: aiSummary.customerNeeds,
        aiActions: aiSummary.aiActions,
        followUp: aiSummary.followUp,
        sentiment: aiSummary.sentiment,
        keyPoints: aiSummary.keyPoints,
        messageCount: messages.length,
        userMessageCount: messages.filter(m => m.type === 'user').length,
        aiMessageCount: messages.filter(m => m.type === 'ai').length,
        generatedBy: 'GPT-4o'
    };
}

/**
 * Analyzuje zprávy a vytvoří shrnutí (rule-based fallback)
 */
function analyzMessages(messages, duration) {
    const userMessages = messages.filter(m => m.type === 'user');
    const aiMessages = messages.filter(m => m.type === 'ai');

    // Detekce důvodu volání
    let reason = 'Obecný dotaz';
    const allText = messages.map(m => m.text.toLowerCase()).join(' ');

    if (allText.includes('cena') || allText.includes('kolik')) {
        reason = 'Cenová poptávka';
    } else if (allText.includes('info') || allText.includes('informace')) {
        reason = 'Žádost o informace';
    } else if (allText.includes('kontakt') || allText.includes('email')) {
        reason = 'Žádost o kontaktní údaje';
    } else if (allText.includes('problém') || allText.includes('nefunguje')) {
        reason = 'Technický problém';
    } else if (allText.includes('objednávka') || allText.includes('koupit')) {
        reason = 'Objednávka služby';
    }

    // Identifikace potřeb zákazníka
    const customerNeeds = [];
    if (allText.includes('cena')) customerNeeds.push('Cenová nabídka');
    if (allText.includes('info') || allText.includes('jak')) customerNeeds.push('Podrobné informace');
    if (allText.includes('kontakt') || allText.includes('email')) customerNeeds.push('Kontaktní údaje');
    if (allText.includes('demo') || allText.includes('vyzkoušet')) customerNeeds.push('Ukázka produktu');
    if (customerNeeds.length === 0) customerNeeds.push('Základní informace');

    // AI akce
    const aiActions = [
        'Poskytnutí základních informací o službách',
        'Odpovědi na dotazy zákazníka',
        'Navržení dalších kroků'
    ];

    // Follow-up
    let followUp = 'Žádný specifický follow-up';
    if (allText.includes('email') || allText.includes('pošlete')) {
        followUp = 'Zaslání informací emailem';
    } else if (allText.includes('zavolat') || allText.includes('telefon')) {
        followUp = 'Telefonický kontakt';
    } else if (allText.includes('demo') || allText.includes('vyzkoušet')) {
        followUp = 'Poskytnutí přístupu k demo';
    }

    // Sentiment analýza
    let sentiment = 'Neutrální';
    if (allText.includes('děkuji') || allText.includes('super') || allText.includes('výborně')) {
        sentiment = 'Pozitivní';
    } else if (allText.includes('problém') || allText.includes('nefunguje') || allText.includes('nespokojen')) {
        sentiment = 'Negativní';
    }

    return {
        timestamp: new Date().toISOString(),
        duration: duration || 0,
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
