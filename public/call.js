// Call management and AI assistant interaction
class CallManager {
    constructor() {
        this.callActive = false;
        this.callStartTime = null;
        this.durationInterval = null;
        this.transcript = [];
        this.conversationHistory = [];
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.startCallBtn = document.getElementById('startCallBtn');
        this.endCallBtn = document.getElementById('endCallBtn');
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.callDuration = document.getElementById('callDuration');
        this.transcriptContainer = document.getElementById('transcriptContainer');
        this.summarySection = document.getElementById('summarySection');
        this.summaryContainer = document.getElementById('summaryContainer');
    }

    attachEventListeners() {
        this.startCallBtn.addEventListener('click', () => this.startCall());
        this.endCallBtn.addEventListener('click', () => this.endCall());
    }

    async startCall() {
        try {
            this.callActive = true;
            this.callStartTime = Date.now();
            this.transcript = [];
            this.conversationHistory = [];
            
            // Update UI
            this.startCallBtn.disabled = true;
            this.endCallBtn.disabled = false;
            this.statusText.textContent = 'Probíhá hovor';
            this.statusIndicator.classList.add('active');
            this.transcriptContainer.innerHTML = '';
            this.summarySection.style.display = 'none';
            
            // Start duration counter
            this.startDurationCounter();
            
            // Initialize call with backend
            await this.initializeCallWithBackend();
            
            // AI greeting
            await this.aiGreeting();
            
        } catch (error) {
            console.error('Error starting call:', error);
            this.addTranscriptMessage('system', 'Chyba při zahájení hovoru. Zkuste to prosím znovu.');
            this.endCall();
        }
    }

    async initializeCallWithBackend() {
        // Initialize Azure Communication Services call
        // This would connect to the backend API
        console.log('Initializing call with Azure Communication Services...');
        
        // In a real implementation, this would:
        // 1. Get token from backend
        // 2. Initialize CallClient
        // 3. Setup audio streams
        // 4. Connect Speech-to-Text
        // 5. Connect Text-to-Speech
    }

    async aiGreeting() {
        // Simulate AI greeting
        const greeting = "Dobrý den, tady AI asistent CashNDrive. Jak vám mohu dnes pomoci?";
        await this.simulateAIResponse(greeting);
    }

    async simulateAIResponse(text) {
        this.addTranscriptMessage('assistant', text);
        this.conversationHistory.push({ role: 'assistant', content: text });
        
        // In real implementation, this would use Azure Text-to-Speech
        // to convert text to audio and play it
        await this.speakText(text);
    }

    async speakText(text) {
        // Simulate TTS delay
        return new Promise(resolve => {
            setTimeout(resolve, text.length * 50); // Simulate speaking time
        });
    }

    addTranscriptMessage(speaker, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `transcript-message ${speaker}`;
        
        const speakerSpan = document.createElement('div');
        speakerSpan.className = 'speaker';
        speakerSpan.textContent = speaker === 'assistant' ? 'AI Asistent:' : 
                                   speaker === 'user' ? 'Zákazník:' : 
                                   'Systém:';
        
        const messageSpan = document.createElement('div');
        messageSpan.textContent = message;
        
        messageDiv.appendChild(speakerSpan);
        messageDiv.appendChild(messageSpan);
        
        this.transcriptContainer.appendChild(messageDiv);
        this.transcriptContainer.scrollTop = this.transcriptContainer.scrollHeight;
        
        this.transcript.push({ speaker, message, timestamp: new Date() });
    }

    startDurationCounter() {
        this.durationInterval = setInterval(() => {
            if (this.callStartTime) {
                const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.callDuration.textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }

    async endCall() {
        if (!this.callActive) return;
        
        this.callActive = false;
        
        // Update UI
        this.startCallBtn.disabled = false;
        this.endCallBtn.disabled = true;
        this.statusText.textContent = 'Hovor ukončen';
        this.statusIndicator.classList.remove('active');
        
        // Stop duration counter
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
            this.durationInterval = null;
        }
        
        // Generate summary
        await this.generateSummary();
        
        // Save transcript to session storage for transcripts page
        this.saveTranscriptToSession();
    }

    async generateSummary() {
        this.summarySection.style.display = 'block';
        this.summaryContainer.innerHTML = '<p>Generování shrnutí...</p>';
        
        // Simulate summary generation
        // In real implementation, this would call Azure AI Foundry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const summary = this.createCallSummary();
        this.summaryContainer.innerHTML = summary;
    }

    createCallSummary() {
        const duration = this.callDuration.textContent;
        
        return `
            <div class="summary-content">
                <h4>Základní Informace</h4>
                <p><strong>Délka hovoru:</strong> ${duration}</p>
                <p><strong>Datum a čas:</strong> ${new Date().toLocaleString('cs-CZ')}</p>
                
                <h4>Shrnutí Konverzace</h4>
                <p><strong>Důvod volání:</strong> Demo hovor s AI asistentem</p>
                <p><strong>Požadavky zákazníka:</strong> Testování funkcionality AI asistenta</p>
                <p><strong>Poskytnutá řešení:</strong> AI asistent demonstroval schopnost vést konverzaci</p>
                
                <h4>Další Kroky</h4>
                <p>• Zákazník byl informován o funkcích systému</p>
                <p>• Doporučeno: Kontaktujte nás pro více informací</p>
                
                <h4>Poznámky</h4>
                <p>Hovor proběhl bez problémů. Zákazník byl spokojen s ukázkou.</p>
            </div>
        `;
    }

    saveTranscriptToSession() {
        const transcripts = JSON.parse(sessionStorage.getItem('transcripts') || '[]');
        transcripts.push({
            date: new Date().toISOString(),
            duration: this.callDuration.textContent,
            messages: this.transcript
        });
        sessionStorage.setItem('transcripts', JSON.stringify(transcripts));
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CallManager();
});
