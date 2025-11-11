const { app } = require('@azure/functions');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const config = require('./config');

/**
 * Azure Function: GetAIResponse
 * Zpracovává uživatelský vstup a vrací odpověď od AI asistenta
 * Nyní používá Azure OpenAI GPT-4o deployment
 */
app.http('GetAIResponse', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Processing AI request with GPT-4o...');

        try {
            const body = await request.json();
            const { userMessage, conversationHistory } = body;

            if (!userMessage) {
                return {
                    status: 400,
                    jsonBody: {
                        error: 'userMessage is required'
                    }
                };
            }

            // Získat AI credentials z konfigurace
            const aiEndpoint = config.AZURE_AI_ENDPOINT;
            const aiKey = config.AZURE_AI_KEY;
            const deploymentName = config.AZURE_AI_DEPLOYMENT_NAME;

            if (!aiEndpoint || !aiKey) {
                context.log.error('AI credentials not configured');
                return {
                    status: 500,
                    jsonBody: {
                        error: 'AI Service not configured'
                    }
                };
            }

            // Připravit systémový prompt
            const systemPrompt = getSystemPrompt();

            // Připravit zprávy pro AI
            const messages = [
                { role: 'system', content: systemPrompt }
            ];

            // Přidat historii konverzace
            if (conversationHistory && Array.isArray(conversationHistory)) {
                conversationHistory.forEach(msg => {
                    messages.push({
                        role: msg.type === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    });
                });
            }

            // Přidat aktuální zprávu uživatele
            messages.push({
                role: 'user',
                content: userMessage
            });

            // Volání Azure OpenAI GPT-4o
            let aiResponse;
            try {
                const client = new OpenAIClient(aiEndpoint, new AzureKeyCredential(aiKey));
                
                const result = await client.getChatCompletions(
                    deploymentName,
                    messages,
                    {
                        maxTokens: 500,
                        temperature: 0.7,
                        topP: 0.95
                    }
                );

                aiResponse = result.choices[0].message.content;
                context.log('GPT-4o response generated successfully');
                
            } catch (aiError) {
                context.log.error('Azure OpenAI API error:', aiError.message);
                // Fallback k demo odpovědi
                context.log('Falling back to demo response');
                aiResponse = generateDemoResponse(userMessage);
            }

            return {
                status: 200,
                jsonBody: {
                    response: aiResponse,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            context.log.error('Error processing AI request:', error);
            return {
                status: 500,
                jsonBody: {
                    error: 'Failed to process AI request',
                    details: error.message
                }
            };
        }
    }
});

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
 * Demo odpovědi pro testování bez Azure AI
 */
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
