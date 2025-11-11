/**
 * Azure Function: Summary endpoint
 * Generates call summary after conversation ends
 */

const { generateCallSummary } = require('../ai-assistant');

module.exports = async function (context, req) {
    context.log('Summary function processing request');

    // CORS headers
    context.res = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        return;
    }

    try {
        const { conversationHistory, callDuration } = req.body;

        if (!conversationHistory || conversationHistory.length === 0) {
            context.res.status = 400;
            context.res.body = { error: 'Conversation history is required' };
            return;
        }

        // Get Azure AI client
        const azureAIClient = getAzureAIClient(context);

        // Generate summary
        const summary = await generateCallSummary(conversationHistory, azureAIClient);

        // Create structured summary object
        const summaryData = {
            summary: summary,
            duration: callDuration,
            timestamp: new Date().toISOString(),
            conversationLength: conversationHistory.length,
            metadata: {
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            }
        };

        context.res.status = 200;
        context.res.body = summaryData;

    } catch (error) {
        context.log.error('Error in summary function:', error);
        context.res.status = 500;
        context.res.body = { 
            error: 'Failed to generate summary',
            message: error.message 
        };
    }
};

function getAzureAIClient(context) {
    // In real implementation, initialize Azure AI client with credentials
    // Mock implementation for demonstration
    return {
        chat: {
            completions: {
                create: async (params) => {
                    return {
                        choices: [{
                            message: {
                                content: `SHRNUTÍ HOVORU\n\nDůvod volání: Zákazník volal s dotazem ohledně služeb.\n\nPožadavky zákazníka:\n- Obecné informace o službách\n- Pomoc s řešením dotazu\n\nPoskytnutá řešení:\n- Zákazník byl informován o dostupných možnostech\n- Byly poskytnuty relevantní odpovědi\n\nDoporučené další kroky:\n- Follow-up e-mail s dalšími informacemi\n- Případný kontakt s příslušným oddělením`
                            }
                        }]
                    };
                }
            }
        }
    };
}
