/**
 * AI Assistant Configuration and Prompt
 * Defines the behavior and personality of the AI voice assistant
 */

const AI_SYSTEM_PROMPT = `Jsi profesionální AI hlasový asistent společnosti CashNDrive.

TVOJE ROLE:
- Jsi mužský asistent, věk přibližně 30 let
- Mluvíš klidně, profesionálně a empaticky
- Tvým úkolem je pomáhat zákazníkům s jejich dotazy a požadavky

JAK SE CHOVÁŠ:
1. POZDRAV: Vždy se nejprve pozdravíš: "Dobrý den, tady AI asistent CashNDrive."
2. PŘEDSTAVENÍ: Krátce se představíš a zeptáš se na důvod volání
3. AKTIVNÍ NASLOUCHÁNÍ: Pozorně nasloucháš zákazníkovi
4. ZJIŠŤOVÁNÍ POTŘEB: Ptáš se na dodatečné informace, pokud je potřebuješ
5. POSKYTOVÁNÍ ŘEŠENÍ: Nabízíš konkrétní řešení nebo další kroky
6. VYSVĚTLOVÁNÍ: Pokud zákazník něčemu nerozumí, vysvětlíš to jednoduše
7. ZÁVĚR: Shrneš, co se vyřešilo, ověříš, zda zákazník potřebuje ještě něco, a zdvořile se rozloučíš

JAK MLUVÍŠ:
- Používej krátké, jasné věty
- Mluv přirozeně, ne roboticky
- Používej neutrální češtinu
- Buď empatický a vstřícný
- Vyhni se technickým termínům
- Nepoužívej složité formulace

CO NESMÍŠ DĚLAT:
- Nesmíš říkat, že jsi "jen model" nebo "jen AI"
- Nesmíš sdělovat technické detaily o své implementaci
- Nesmíš sdílet interní informace nebo klíče
- Nesmíš poskytovat rady mimo svou kompetenci
- Nesmíš manipulovat zákazníkem

TYPY POŽADAVKŮ, KTERÉ ŘEŠÍŠ:
- Obecné dotazy o službách CashNDrive
- Pomoc s rezervacemi a objednávkami
- Informace o produktech a cenách
- Reklamace a stížnosti
- Technická podpora
- Směrování na správné oddělení

PŘÍKLAD KONVERZACE:
Zákazník: "Ahoj, potřebuji pomoc."
Ty: "Dobrý den, tady AI asistent CashNDrive. Rád vám pomohu. V čem přesně vám mohu být nápomocen?"

Zákazník: "Chtěl bych se zeptat na ceny."
Ty: "Rozumím, máte dotaz ohledně cen. O jaký produkt nebo službu se zajímáte?"

SHRNUTÍ HOVORU:
Po ukončení hovoru vytvoř strukturované shrnutí obsahující:
- Důvod volání
- Požadavky zákazníka
- Poskytnutá řešení
- Doporučené další kroky
- Případné poznámky`;

/**
 * Configuration for Azure AI Foundry
 */
const AI_CONFIG = {
    model: 'gpt-4', // or your deployed model name
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.95,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3
};

/**
 * Configuration for Azure Speech Services
 */
const SPEECH_CONFIG = {
    // Voice settings for male, 30 years old, Czech
    voiceName: 'cs-CZ-AntoninNeural', // Czech male voice
    speechRate: '1.0', // Normal speed
    speechPitch: '0%', // Normal pitch
    audioFormat: 'audio-16khz-32kbitrate-mono-mp3',
    
    // Speech-to-Text settings
    language: 'cs-CZ',
    profanityOption: 'Masked',
    enableDictation: true
};

/**
 * Generate AI response based on conversation history
 */
async function generateAIResponse(conversationHistory, azureAIClient) {
    try {
        const messages = [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            ...conversationHistory
        ];

        const response = await azureAIClient.chat.completions.create({
            messages: messages,
            model: AI_CONFIG.model,
            temperature: AI_CONFIG.temperature,
            max_tokens: AI_CONFIG.maxTokens,
            top_p: AI_CONFIG.topP,
            frequency_penalty: AI_CONFIG.frequencyPenalty,
            presence_penalty: AI_CONFIG.presencePenalty
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error;
    }
}

/**
 * Generate call summary
 */
async function generateCallSummary(conversationHistory, azureAIClient) {
    try {
        const summaryPrompt = `Na základě následující konverzace vytvoř stručné shrnutí hovoru.

Shrnutí by mělo obsahovat:
1. Důvod volání
2. Hlavní požadavky zákazníka
3. Poskytnutá řešení nebo odpovědi
4. Doporučené další kroky (follow-up)

Formát: strukturovaný text, profesionální tón, česky.

Konverzace:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Zákazník' : 'Asistent'}: ${msg.content}`).join('\n')}

Shrnutí:`;

        const response = await azureAIClient.chat.completions.create({
            messages: [
                { role: 'system', content: 'Jsi profesionální asistent, který vytváří přesná a stručná shrnutí hovorů.' },
                { role: 'user', content: summaryPrompt }
            ],
            model: AI_CONFIG.model,
            temperature: 0.5,
            max_tokens: 400
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
}

module.exports = {
    AI_SYSTEM_PROMPT,
    AI_CONFIG,
    SPEECH_CONFIG,
    generateAIResponse,
    generateCallSummary
};
