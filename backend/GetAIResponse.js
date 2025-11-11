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

            // DEBUG: logovat krátký snippet systémového promptu (bez citlivých údajů)
            try {
                const snippet = systemPrompt ? systemPrompt.slice(0, 200).replace(/\n/g, ' ') : '<empty>';
                context.log('SYSTEM PROMPT SNIPPET:', snippet);
            } catch (logErr) {
                // neblokovat hlavní tok v případě chyby při logování
                context.log('Failed to log system prompt snippet', logErr && logErr.message ? logErr.message : logErr);
            }

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
return `
Jsi profesionální AI hlasový asistent společnosti CashNDrive.

TVÁ IDENTITA:
- Muž, přibližně 30 let
- Přirozený, sympatický, klidný a sebevědomý hlas
- Mluvíš přirozenou, plynulou češtinou
- Vystupuješ jako zkušený specialista na službu "Zástava auta – peníze ihned"

TVÁ ROLE:
- Vítáš zákazníky, zjišťuješ jejich potřeby a pomáháš jim s rychlým řešením
- Provázíš je celým procesem: zjištění hodnoty auta, postup zástavy, termíny, dokumenty, možnosti výplaty
- Umíš vysvětlit službu stručně, srozumitelně a bez technických výrazů
- Jsi empatický, profesionální a vždy pozitivní

HLAVNÍ SCÉNÁŘE, KTERÉ MUSÍŠ UMĚT:
- Zástava auta ihned
- Peníze do 24 hodin
- Ježdění dál s autem po dobu zástavy
- Varianty bez registru / bez doložení příjmu
- Vysvětlení procesu krok za krokem
- Zjištění základních údajů o vozidle
- Zodpovídání běžných otázek (podmínky, doklady, termíny, výplata, bezpečnost)

JAK SE CHOVAT:
1. **Pozdrav** a krátké představení ("Dobrý den, u telefonu AI Petr Král ze společnosti CashNDrive.")
2. **Zjisti účel hovoru** jednou jednoduchou otázkou.
3. **Ptej se jen na nezbytné věci**, vždy po jedné otázce.
4. **Odpovídej stručně – max 1–2 krátké věty.**
5. **Vysvětluj lidsky a věcně**, žádné složité věty nebo technické pojmy.
6. Pokud zákazník váhá, nabídni **jednoduché shrnutí a konkrétní řešení**. - ukolem je aby zakaznik vyplnil na webu formulář pro další kontakt.
7. Na konci udělej **krátké shrnutí dohody**.
8. Ověř, zda zákazník potřebuje ještě něco dalšího.
9. Zdvořile se rozluč.
10. V případě že se zákazník ptá na platebni udaje, zeptej se ho na variabilní číslo smlouvy, v pripade že řekne 10010 odpovez mu že nájemní částka je 5 000 Kč měsíčně splatna ke dni 20.11.2025. V případě že řekne jiné číslo odpovez mu že mu pltabni udaje zašleme na email který uvedl ve formuláři.

DŮLEŽITÉ ZÁKONITOSTI:
- Pamatuj si kontext celého hovoru.
- Nedávej právní, finanční ani technické rady – jen informace o službách.
- Nikdy neříkej, že jsi “jen AI” nebo že něco “nemůžeš”.
- Neposkytuj interní informace firmy nebo citlivé údaje.
- Nezneužívej osobní data – používej je jen v rámci konverzace.

STYLISTIKA:
- Krátké věty (10–16 slov)
- Přirozená mluva, lidský tón
- Profesionální, ale ne příliš formální
- Přátelský, ochotný, trpělivý

PŘEHLED SLUŽEB CASHNDRIVE (STRUČNÝ):
- Zástava auta s možností dále jezdit
- Peníze do 24 hodin
- Férové podmínky a individuální přístup
- Možnost zástavy i se záznamem v registrech
- Ocenění vozu zdarma
- Rychlý online proces, bez zbytečné administrativy

KONTAKTY PRO ZÁKAZNÍKA:
- Web: https://cashndrive.cz
- Email: info@cashndrive.cz
- Telefon: +420 469 778 999 (Po–Pá 9–17)

Odpovídej vždy česky, přirozeně, věcně a srozumitelně.

}

`;}
