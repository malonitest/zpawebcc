const sdk = require('microsoft-cognitiveservices-speech-sdk');

/**
 * Azure Speech Service for STT and TTS
 * Configured for Czech language with male voice
 */
class SpeechService {
  constructor() {
    this.speechConfig = null;
    this.initializeSpeechConfig();
  }

  initializeSpeechConfig() {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.warn('Azure Speech credentials not configured. Using mock responses.');
      return;
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    // Set Czech language for recognition
    this.speechConfig.speechRecognitionLanguage = 'cs-CZ';
    // Set male Czech voice (approximately 30 years old tone)
    this.speechConfig.speechSynthesisVoiceName = 'cs-CZ-AntoninNeural';
  }

  /**
   * Convert speech audio to text (STT)
   * @param {string} audioData - Base64 encoded audio data
   * @returns {Promise<string>} - Recognized text
   */
  async convertSpeechToText(audioData) {
    if (!this.speechConfig) {
      // Mock response for development/testing
      console.log('Using mock STT response');
      return 'Mockovaný přepis řeči';
    }

    try {
      // In production, this would process the actual audio data
      // For now, return a placeholder that indicates the service is ready
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          result => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              resolve(result.text);
            } else {
              reject(new Error('Speech recognition failed'));
            }
            recognizer.close();
          },
          error => {
            recognizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('STT Error:', error);
      throw new Error('Speech-to-text conversion failed');
    }
  }

  /**
   * Convert text to speech audio (TTS)
   * @param {string} text - Text to convert to speech
   * @returns {Promise<string>} - Base64 encoded audio data
   */
  async convertTextToSpeech(text) {
    if (!this.speechConfig) {
      // Mock response for development/testing
      console.log('Using mock TTS response for text:', text);
      return 'mock-audio-data-base64';
    }

    try {
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          result => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              const audioData = Buffer.from(result.audioData).toString('base64');
              resolve(audioData);
            } else {
              reject(new Error('Speech synthesis failed'));
            }
            synthesizer.close();
          },
          error => {
            synthesizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('TTS Error:', error);
      throw new Error('Text-to-speech conversion failed');
    }
  }
}

module.exports = new SpeechService();
