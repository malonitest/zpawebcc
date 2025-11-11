/**
 * Azure Function: Chat endpoint
 * Handles real-time conversation with AI assistant
 */

const { generateAIResponse } = require('../ai-assistant');

module.exports = async function (context, req) {
    context.log('Chat function processing request');

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
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            context.res.status = 400;
            context.res.body = { error: 'Message is required' };
            return;
        }

        // Add user message to history
        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // Get Azure AI client (would be initialized from environment variables)
        const azureAIClient = getAzureAIClient(context);

        // Generate AI response
        const aiResponse = await generateAIResponse(updatedHistory, azureAIClient);

        // Add AI response to history
        updatedHistory.push({ role: 'assistant', content: aiResponse });

        context.res.status = 200;
        context.res.body = {
            response: aiResponse,
            conversationHistory: updatedHistory,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        context.log.error('Error in chat function:', error);
        context.res.status = 500;
        context.res.body = { 
            error: 'Failed to generate response',
            message: error.message 
        };
    }
};

function getAzureAIClient(context) {
    // In real implementation, initialize Azure AI client with credentials
    // from environment variables or Key Vault
    
    // Mock implementation for demonstration
    return {
        chat: {
            completions: {
                create: async (params) => {
                    // Simulate AI response
                    const lastMessage = params.messages[params.messages.length - 1];
                    return {
                        choices: [{
                            message: {
                                content: `Rozumím vašemu dotazu. Jak vám mohu dále pomoci?`
                            }
                        }]
                    };
                }
            }
        }
    };
}
