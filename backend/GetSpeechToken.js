const { app } = require('@azure/functions');

/**
 * Azure Function: GetSpeechToken
 * Vrací autorizační token pro Azure Speech Services
 */
app.http('GetSpeechToken', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Getting Speech token...');

        try {
            const speechKey = process.env.AZURE_SPEECH_KEY;
            const speechRegion = process.env.AZURE_SPEECH_REGION;

            if (!speechKey || !speechRegion) {
                return {
                    status: 500,
                    jsonBody: {
                        error: 'Speech Service credentials not configured'
                    }
                };
            }

            // V produkci: získat token z Azure Speech Services
            // const tokenResponse = await fetch(
            //     `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            //     {
            //         method: 'POST',
            //         headers: {
            //             'Ocp-Apim-Subscription-Key': speechKey
            //         }
            //     }
            // );

            return {
                status: 200,
                jsonBody: {
                    token: 'DEMO_TOKEN', // V produkci: skutečný token
                    region: speechRegion,
                    expiresIn: 600 // 10 minut
                }
            };

        } catch (error) {
            context.log.error('Error getting speech token:', error);
            return {
                status: 500,
                jsonBody: {
                    error: 'Failed to get speech token'
                }
            };
        }
    }
});
