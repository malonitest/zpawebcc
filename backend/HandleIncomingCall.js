const { app } = require('@azure/functions');

/**
 * Azure Function: HandleIncomingCall
 * Zpracovává příchozí hovory z Azure Communication Services
 */
app.http('HandleIncomingCall', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Handling incoming call...');

        try {
            const body = await request.json();
            const { callId, from, to } = body;

            context.log(`Call received: ${callId} from ${from} to ${to}`);

            // V produkci: zpracování Azure Communication Services webhook
            // - Přijmout hovor automaticky
            // - Inicializovat audio stream
            // - Připojit AI asistenta

            return {
                status: 200,
                jsonBody: {
                    message: 'Call accepted',
                    callId: callId,
                    status: 'connected'
                }
            };

        } catch (error) {
            context.log.error('Error handling call:', error);
            return {
                status: 500,
                jsonBody: {
                    error: 'Failed to handle call',
                    details: error.message
                }
            };
        }
    }
});
