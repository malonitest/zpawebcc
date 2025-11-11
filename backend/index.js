// Azure Functions v4 Entry Point
// This file imports and registers all function handlers

require('./GetAIResponse');
require('./GenerateSummary');
require('./GetSpeechToken');
require('./HandleIncomingCall');

console.log('All Azure Functions registered successfully');
