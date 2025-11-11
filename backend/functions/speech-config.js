/**
 * Azure Function: Speech Configuration endpoint
 * Provides Azure Speech Services configuration
 */

const { SPEECH_CONFIG } = require('../ai-assistant');

module.exports = async function (context, req) {
    context.log('Speech config function processing request');

    // CORS headers
    context.res = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        return;
    }

    try {
        // Get Speech key and region from environment
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;

        if (!speechKey || !speechRegion) {
            context.log.warn('Speech configuration not complete');
        }

        // Return configuration (in production, use token instead of key)
        context.res.status = 200;
        context.res.body = {
            region: speechRegion || 'westeurope',
            voiceConfig: SPEECH_CONFIG,
            // In production, generate and return authorization token
            // instead of exposing the key
            token: generateSpeechToken(speechKey, speechRegion)
        };

    } catch (error) {
        context.log.error('Error getting speech config:', error);
        context.res.status = 500;
        context.res.body = { 
            error: 'Failed to get speech configuration',
            message: error.message 
        };
    }
};

function generateSpeechToken(key, region) {
    // In real implementation, exchange subscription key for authorization token
    // using Speech Services token endpoint
    
    // Mock token for demo
    return 'mock_speech_token';
}
