/**
 * Simple Express server for serving static files
 * In production, this would be replaced by Azure Static Web Apps
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple rate limiting middleware
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (requests.length >= MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    
    requests.push(now);
    rateLimitMap.set(ip, requests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
        for (const [key, value] of rateLimitMap.entries()) {
            const filtered = value.filter(time => now - time < RATE_LIMIT_WINDOW);
            if (filtered.length === 0) {
                rateLimitMap.delete(key);
            } else {
                rateLimitMap.set(key, filtered);
            }
        }
    }
    
    next();
}

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/api', rateLimit);

// API routes (mock implementations for local development)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        // Mock AI response
        const aiResponse = `Rozumím vašemu dotazu: "${message}". Jak vám mohu dále pomoci?`;
        
        res.json({
            response: aiResponse,
            conversationHistory: [
                ...conversationHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            ],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/summary', async (req, res) => {
    try {
        const { conversationHistory, callDuration } = req.body;
        
        const summary = `
SHRNUTÍ HOVORU

Základní Informace:
- Délka hovoru: ${callDuration}
- Datum a čas: ${new Date().toLocaleString('cs-CZ')}

Shrnutí Konverzace:
- Důvod volání: Demo hovor s AI asistentem
- Požadavky zákazníka: Testování funkcionality AI asistenta
- Poskytnutá řešení: AI asistent demonstroval schopnost vést konverzaci

Další Kroky:
• Zákazník byl informován o funkcích systému
• Doporučeno: Kontaktujte nás pro více informací

Poznámky:
Hovor proběhl bez problémů. Zákazník byl spokojen s ukázkou.
        `.trim();
        
        res.json({
            summary,
            duration: callDuration,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/token', async (req, res) => {
    try {
        res.json({
            token: 'mock_token_for_demo',
            expiresOn: new Date(Date.now() + 3600000).toISOString(),
            userId: 'user-' + Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/speech-config', async (req, res) => {
    try {
        res.json({
            region: process.env.AZURE_SPEECH_REGION || 'westeurope',
            voiceConfig: {
                voiceName: 'cs-CZ-AntoninNeural',
                speechRate: '1.0',
                speechPitch: '0%'
            },
            token: 'mock_speech_token'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all other routes (SPA)
// Rate limiting is applied to prevent abuse of file system access
app.get('*', rateLimit, (req, res) => {
    // Safe: path.join prevents directory traversal attacks
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
