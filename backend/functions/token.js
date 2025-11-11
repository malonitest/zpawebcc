/**
 * Azure Function: Token endpoint
 * Provides secure tokens for Azure Communication Services
 */

module.exports = async function (context, req) {
    context.log('Token function processing request');

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
        // In real implementation:
        // 1. Get connection string from environment/Key Vault
        // 2. Use Azure Communication Services SDK to generate token
        // 3. Return token with expiration
        
        const token = generateToken(context);

        context.res.status = 200;
        context.res.body = {
            token: token,
            expiresOn: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            userId: 'user-' + Date.now()
        };

    } catch (error) {
        context.log.error('Error generating token:', error);
        context.res.status = 500;
        context.res.body = { 
            error: 'Failed to generate token',
            message: error.message 
        };
    }
};

function generateToken(context) {
    // Mock token generation
    // In real implementation, use Azure Communication Services Identity SDK
    
    const acsConnectionString = process.env.ACS_CONNECTION_STRING;
    
    if (!acsConnectionString) {
        context.log.warn('ACS_CONNECTION_STRING not configured');
    }

    // Return mock token for demo purposes
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.mock_token_for_demo';
}
