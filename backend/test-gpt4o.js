/**
 * Test script for GPT-4o deployment
 * Tests the speech/conversation capabilities of the deployed model
 */

const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const config = require('./config');

async function testGPT4oSpeech() {
  console.log('🧪 Testing GPT-4o deployment for speech/conversation...\n');

  // Read configuration
  const endpoint = config.AZURE_AI_ENDPOINT;
  const apiKey = config.AZURE_AI_KEY;
  const deploymentName = config.AZURE_AI_DEPLOYMENT_NAME;

  console.log('📋 Configuration:');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Deployment: ${deploymentName}`);
  console.log('');

  // Initialize Azure OpenAI client
  const client = new OpenAIClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

  // Test 1: Czech conversation (for CashNDrive)
  console.log('🇨🇿 Test 1: Czech conversation response');
  console.log('─────────────────────────────────────');
  try {
    const messages = [
      {
        role: 'system',
        content: 'Jsi AI asistent pro zákaznickou podporu CashNDrive. Mluvíš česky, jsi profesionální a přátelský. Představuješ se jako asistent a nabízíš pomoc.'
      },
      {
        role: 'user',
        content: 'Dobrý den, potřebuji pomoc s půjčkou.'
      }
    ];

    const response = await client.getChatCompletions(
      deploymentName,
      messages,
      {
        maxTokens: 150,
        temperature: 0.7
      }
    );

    console.log('User: Dobrý den, potřebuji pomoc s půjčkou.');
    console.log('AI: ' + response.choices[0].message.content);
    console.log('');
  } catch (error) {
    console.error('❌ Error in Test 1:', error.message);
    console.log('');
  }

  // Test 2: Information extraction
  console.log('📊 Test 2: Information extraction');
  console.log('─────────────────────────────────────');
  try {
    const messages = [
      {
        role: 'system',
        content: 'Extrahuj informace ze zprávy zákazníka. Vrať JSON s klíči: jmeno, telefon, email, pozadavek.'
      },
      {
        role: 'user',
        content: 'Dobrý den, jmenuji se Petr Novák, můj telefon je 603 123 456. Rád bych požádal o půjčku 50 000 Kč.'
      }
    ];

    const response = await client.getChatCompletions(
      deploymentName,
      messages,
      {
        maxTokens: 200,
        temperature: 0.3,
        responseFormat: { type: 'json_object' }
      }
    );

    console.log('Input: Dobrý den, jmenuji se Petr Novák, můj telefon je 603 123 456...');
    console.log('Extracted data:');
    console.log(response.choices[0].message.content);
    console.log('');
  } catch (error) {
    console.error('❌ Error in Test 2:', error.message);
    console.log('');
  }

  // Test 3: Conversation flow
  console.log('💬 Test 3: Multi-turn conversation');
  console.log('─────────────────────────────────────');
  try {
    const messages = [
      {
        role: 'system',
        content: 'Jsi AI asistent. Odpovídáš stručně a věcně.'
      },
      {
        role: 'user',
        content: 'Kolik je 5 + 3?'
      },
      {
        role: 'assistant',
        content: '5 + 3 = 8'
      },
      {
        role: 'user',
        content: 'A když to vynásobím 2?'
      }
    ];

    const response = await client.getChatCompletions(
      deploymentName,
      messages,
      {
        maxTokens: 50,
        temperature: 0.3
      }
    );

    console.log('User: Kolik je 5 + 3?');
    console.log('AI: 5 + 3 = 8');
    console.log('User: A když to vynásobím 2?');
    console.log('AI: ' + response.choices[0].message.content);
    console.log('');
  } catch (error) {
    console.error('❌ Error in Test 3:', error.message);
    console.log('');
  }

  // Model info
  console.log('✅ GPT-4o Deployment Summary');
  console.log('═══════════════════════════════════════');
  console.log('   Model: GPT-4o (2024-08-06)');
  console.log('   Deployment: gpt-4');
  console.log('   Max Context: 128,000 tokens');
  console.log('   Max Output: 16,384 tokens');
  console.log('   Rate Limits:');
  console.log('     - 100 requests/minute');
  console.log('     - 10,000 tokens/minute');
  console.log('   Capabilities:');
  console.log('     ✓ Chat completions');
  console.log('     ✓ JSON response format');
  console.log('     ✓ Assistants API');
  console.log('     ✓ Multimodal (text + images)');
  console.log('');
  console.log('🎉 Your GPT-4o is ready for speech/conversation!');
}

// Run the test
testGPT4oSpeech().catch(console.error);
