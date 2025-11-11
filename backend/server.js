require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const speechService = require('./services/speechService');
const aiService = require('./services/aiService');
const callService = require('./services/callService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

// In-memory storage for call sessions
const callSessions = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'cashndrive-ai-assistant' });
});

// Initialize a new call session
app.post('/api/call/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      messages: [],
      transcript: [],
      status: 'active'
    };
    
    callSessions.set(sessionId, session);
    
    // Initial greeting from the AI assistant
    const greeting = 'Dobrý den, jmenuji se Jakub a jsem váš virtuální asistent pro Cash and Drive. Jak vám mohu dnes pomoci?';
    session.messages.push({
      role: 'assistant',
      text: greeting,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      sessionId,
      greeting,
      status: 'started'
    });
  } catch (error) {
    console.error('Error starting call:', error);
    res.status(500).json({ error: 'Failed to start call session' });
  }
});

// Handle speech-to-text conversion
app.post('/api/call/speech-to-text', async (req, res) => {
  try {
    const { sessionId, audioData } = req.body;
    
    if (!callSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const text = await speechService.convertSpeechToText(audioData);
    const session = callSessions.get(sessionId);
    
    session.messages.push({
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    });
    
    res.json({ text });
  } catch (error) {
    console.error('Error in speech-to-text:', error);
    res.status(500).json({ error: 'Speech-to-text conversion failed' });
  }
});

// Process user message and get AI response
app.post('/api/call/process', async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    
    if (!callSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = callSessions.get(sessionId);
    
    // Add user message if provided
    if (userMessage) {
      session.messages.push({
        role: 'user',
        text: userMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get AI response based on conversation history
    const aiResponse = await aiService.generateResponse(session.messages);
    
    session.messages.push({
      role: 'assistant',
      text: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      response: aiResponse,
      sessionId
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Convert text to speech
app.post('/api/call/text-to-speech', async (req, res) => {
  try {
    const { text, sessionId } = req.body;
    
    if (!callSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const audioData = await speechService.convertTextToSpeech(text);
    
    res.json({ audioData });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    res.status(500).json({ error: 'Text-to-speech conversion failed' });
  }
});

// End call and generate summary
app.post('/api/call/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!callSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = callSessions.get(sessionId);
    session.status = 'completed';
    session.endTime = new Date().toISOString();
    
    // Calculate call duration
    const duration = Math.round(
      (new Date(session.endTime) - new Date(session.startTime)) / 1000
    );
    
    // Generate call summary using AI
    const summary = await aiService.generateCallSummary(session.messages);
    
    const metadata = {
      sessionId: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      messageCount: session.messages.length,
      summary: summary
    };
    
    // Keep session in memory for retrieval but mark as completed
    session.metadata = metadata;
    
    res.json({ metadata });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// Get call session data
app.get('/api/call/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!callSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = callSessions.get(sessionId);
  res.json(session);
});

// Start server
app.listen(PORT, () => {
  console.log(`Cash and Drive AI Assistant Backend running on port ${PORT}`);
  console.log(`Frontend accessible at http://localhost:${PORT}`);
});
