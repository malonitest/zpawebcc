/**
 * AI Service for generating intelligent responses
 * Uses Azure AI Foundry for conversation logic
 */
class AIService {
  constructor() {
    this.systemPrompt = `Jsi Jakub, virtuální asistent pro Cash and Drive. Jsi muž ve věku přibližně 30 let.
Tvým úkolem je pomáhat zákazníkům s jejich dotazy a problémy profesionálním a přátelským způsobem.

Základní informace:
- Vždy se na začátku hovoru představíš
- Ptáš se zákazníka na detaily jejich situace
- Poskytuj jasná a užitečná řešení
- Buď trpělivý a empatický
- Mluv přirozeným českým jazykem
- Pokud něco nevíš, přiznej to a nabídni alternativní řešení nebo spojení s lidským operátorem

Možné oblasti pomoci:
- Informace o službách Cash and Drive
- Řešení problémů s objednávkami
- Dotazy ohledně plateb a fakturace
- Technická podpora
- Obecné dotazy o firmě`;
  }

  /**
   * Generate AI response based on conversation history
   * @param {Array} messages - Conversation history
   * @returns {Promise<string>} - AI generated response
   */
  async generateResponse(messages) {
    try {
      // In production, this would call Azure AI Foundry API
      // For now, we'll use a simple rule-based system with Czech responses

      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .pop();

      if (!lastUserMessage) {
        return 'Dobrý den, jmenuji se Jakub a jsem váš virtuální asistent pro Cash and Drive. Jak vám mohu dnes pomoci?';
      }

      const messageText = lastUserMessage.text.toLowerCase();

      // Simple keyword-based responses for demonstration
      if (messageText.includes('pomoc') || messageText.includes('problém')) {
        return 'Rozumím, že potřebujete pomoc. Můžete mi prosím popsat podrobněji, s čím konkrétně máte problém? Rád vám pomohu najít řešení.';
      }

      if (messageText.includes('objednávka') || messageText.includes('objednat')) {
        return 'Jistě, pomohu vám s objednávkou. Můžete mi prosím sdělit, co byste chtěl objednat a jaké jsou vaše požadavky?';
      }

      if (messageText.includes('platba') || messageText.includes('faktura') || messageText.includes('zaplatit')) {
        return 'Ohledně platby vám rád pomohu. Máte nějaký konkrétní dotaz týkající se faktury nebo způsobu platby?';
      }

      if (messageText.includes('informace') || messageText.includes('služba')) {
        return 'Rád vám poskytnu informace o našich službách. Cash and Drive nabízí širokou škálu služeb. O čem konkrétně byste chtěl vědět více?';
      }

      if (messageText.includes('děkuji') || messageText.includes('díky')) {
        return 'Není zač! Jsem rád, že jsem mohl pomoci. Máte ještě nějaký další dotaz?';
      }

      if (messageText.includes('ano') || messageText.includes('jo')) {
        return 'Výborně, jak vám tedy mohu dále pomoci?';
      }

      if (messageText.includes('ne') || messageText.includes('nic')) {
        return 'Dobře, pokud budete potřebovat jakoukoli pomoc, jsem tu pro vás. Přeji vám hezký den!';
      }

      // Default response for unrecognized queries
      return 'Rozumím. Můžete mi prosím poskytnout více detailů, abych vám mohl lépe poradit? Nebo pokud preferujete, mohu vás spojit s lidským operátorem.';

    } catch (error) {
      console.error('AI Response Error:', error);
      return 'Omlouvám se, vyskytla se technická chyba. Můžete to zkusit zopakovat?';
    }
  }

  /**
   * Generate call summary from conversation history
   * @param {Array} messages - Conversation history
   * @returns {Promise<Object>} - Call summary with key points
   */
  async generateCallSummary(messages) {
    try {
      const userMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');

      // Extract topics discussed
      const topics = new Set();
      userMessages.forEach(msg => {
        const text = msg.text.toLowerCase();
        if (text.includes('objednávka')) topics.add('Objednávky');
        if (text.includes('platba') || text.includes('faktura')) topics.add('Platby');
        if (text.includes('problém')) topics.add('Technické problémy');
        if (text.includes('informace') || text.includes('služba')) topics.add('Informace o službách');
      });

      return {
        title: 'Shrnutí hovoru',
        topicsDiscussed: Array.from(topics),
        messageCount: messages.length,
        userQueries: userMessages.length,
        assistantResponses: assistantMessages.length,
        outcome: topics.size > 0 ? 'Dotaz vyřešen' : 'Obecný dotaz',
        keyPoints: [
          `Celkem ${messages.length} zpráv vyměněno`,
          `Diskutovány témata: ${Array.from(topics).join(', ') || 'Obecný rozhovor'}`,
          'Asistent poskytl relevantní odpovědi'
        ]
      };
    } catch (error) {
      console.error('Summary Generation Error:', error);
      return {
        title: 'Shrnutí hovoru',
        topicsDiscussed: [],
        outcome: 'Hovor ukončen',
        keyPoints: ['Hovor proběhl']
      };
    }
  }
}

module.exports = new AIService();
