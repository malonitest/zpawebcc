/**
 * Configuration loader for Azure settings
 * Handles both local.settings.json and environment variables
 */

const fs = require('fs');
const path = require('path');

function loadConfig() {
  let config = {};

  // Try to load from local.settings.json
  const settingsPath = path.join(__dirname, 'local.settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      config = settings.Values || {};
      console.log('✓ Loaded configuration from local.settings.json');
    } catch (error) {
      console.warn('⚠ Failed to parse local.settings.json:', error.message);
    }
  }

  // Environment variables override local settings
  const envConfig = {
    AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING: process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
    AZURE_AI_ENDPOINT: process.env.AZURE_AI_ENDPOINT,
    AZURE_AI_KEY: process.env.AZURE_AI_KEY,
    AZURE_AI_DEPLOYMENT_NAME: process.env.AZURE_AI_DEPLOYMENT_NAME
  };

  // Merge with priority to environment variables
  return {
    AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING: 
      envConfig.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING || 
      config.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING,
    AZURE_SPEECH_KEY: 
      envConfig.AZURE_SPEECH_KEY || 
      config.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: 
      envConfig.AZURE_SPEECH_REGION || 
      config.AZURE_SPEECH_REGION,
    AZURE_AI_ENDPOINT: 
      envConfig.AZURE_AI_ENDPOINT || 
      config.AZURE_AI_ENDPOINT,
    AZURE_AI_KEY: 
      envConfig.AZURE_AI_KEY || 
      config.AZURE_AI_KEY,
    AZURE_AI_DEPLOYMENT_NAME: 
      envConfig.AZURE_AI_DEPLOYMENT_NAME || 
      config.AZURE_AI_DEPLOYMENT_NAME || 'gpt-4'
  };
}

module.exports = loadConfig();
