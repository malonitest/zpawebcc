/**
 * Cash and Drive AI Assistant - Frontend Application
 */

class CallManager {
    constructor() {
        this.sessionId = null;
        this.isCallActive = false;
        this.timerInterval = null;
        this.startTime = null;
        this.apiBaseUrl = window.location.origin + '/api';
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Buttons
        this.startCallBtn = document.getElementById('start-call-btn');
        this.endCallBtn = document.getElementById('end-call-btn');
        this.sendBtn = document.getElementById('send-btn');
        
        // Status elements
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.statusDot = this.statusIndicator.querySelector('.status-dot');
        
        // Timer
        this.callTimer = document.getElementById('call-timer');
        this.timerDisplay = document.getElementById('timer-display');
        
        // Conversation
        this.conversationSection = document.getElementById('conversation-section');
        this.conversationBox = document.getElementById('conversation-box');
        this.userInput = document.getElementById('user-input');
        
        // Summary
        this.summarySection = document.getElementById('summary-section');
        this.summaryContent = document.getElementById('summary-content');
    }

    attachEventListeners() {
        this.startCallBtn.addEventListener('click', () => this.startCall());
        this.endCallBtn.addEventListener('click', () => this.endCall());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async startCall() {
        try {
            this.startCallBtn.disabled = true;
            this.showMessage('assistant', 'Navazuji spojení...', true);
            
            const response = await fetch(`${this.apiBaseUrl}/call/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Nepodařilo se zahájit hovor');
            }

            const data = await response.json();
            this.sessionId = data.sessionId;
            this.isCallActive = true;
            
            // Update UI
            this.updateCallStatus('active', 'Hovor aktivní');
            this.startCallBtn.style.display = 'none';
            this.endCallBtn.disabled = false;
            this.conversationSection.style.display = 'block';
            this.summarySection.style.display = 'none';
            this.userInput.disabled = false;
            this.sendBtn.disabled = false;
            
            // Clear conversation box
            this.conversationBox.innerHTML = '';
            
            // Show greeting from assistant
            this.showMessage('assistant', data.greeting);
            
            // Start timer
            this.startTimer();
            
            console.log('Hovor zahájen:', this.sessionId);
        } catch (error) {
            console.error('Chyba při zahájení hovoru:', error);
            alert('Nepodařilo se zahájit hovor. Zkuste to prosím znovu.');
            this.startCallBtn.disabled = false;
        }
    }

    async endCall() {
        if (!this.isCallActive || !this.sessionId) {
            return;
        }

        try {
            this.endCallBtn.disabled = true;
            
            const response = await fetch(`${this.apiBaseUrl}/call/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId: this.sessionId })
            });

            if (!response.ok) {
                throw new Error('Nepodařilo se ukončit hovor');
            }

            const data = await response.json();
            
            // Update UI
            this.updateCallStatus('inactive', 'Neaktivní');
            this.isCallActive = false;
            this.userInput.disabled = true;
            this.sendBtn.disabled = true;
            
            // Stop timer
            this.stopTimer();
            
            // Show summary
            this.displaySummary(data.metadata);
            
            // Reset for next call
            setTimeout(() => {
                this.startCallBtn.style.display = 'flex';
                this.startCallBtn.disabled = false;
                this.endCallBtn.disabled = true;
                this.conversationSection.style.display = 'none';
            }, 500);
            
            console.log('Hovor ukončen');
        } catch (error) {
            console.error('Chyba při ukončení hovoru:', error);
            alert('Nepodařilo se ukončit hovor korektně.');
            this.endCallBtn.disabled = false;
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || !this.isCallActive) {
            return;
        }

        // Show user message
        this.showMessage('user', message);
        this.userInput.value = '';
        this.sendBtn.disabled = true;

        try {
            // Show typing indicator
            this.showTypingIndicator();

            const response = await fetch(`${this.apiBaseUrl}/call/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userMessage: message
                })
            });

            if (!response.ok) {
                throw new Error('Nepodařilo se zpracovat zprávu');
            }

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Show assistant response
            this.showMessage('assistant', data.response);
            
        } catch (error) {
            console.error('Chyba při odesílání zprávy:', error);
            this.removeTypingIndicator();
            this.showMessage('assistant', 'Omlouvám se, vyskytla se chyba. Zkuste to prosím znovu.');
        } finally {
            this.sendBtn.disabled = false;
        }
    }

    showMessage(role, text, isSystem = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const roleLabel = role === 'user' ? 'Vy' : 'Asistent Jakub';
        const time = new Date().toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-role">${roleLabel}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.conversationBox.appendChild(messageDiv);
        this.conversationBox.scrollTop = this.conversationBox.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.conversationBox.appendChild(indicator);
        this.conversationBox.scrollTop = this.conversationBox.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateCallStatus(status, text) {
        this.statusText.textContent = text;
        this.statusDot.className = `status-dot ${status}`;
    }

    startTimer() {
        this.startTime = Date.now();
        this.callTimer.style.display = 'block';
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.callTimer.style.display = 'none';
    }

    displaySummary(metadata) {
        this.summarySection.style.display = 'block';
        
        let topicsHtml = '';
        if (metadata.summary.topicsDiscussed && metadata.summary.topicsDiscussed.length > 0) {
            topicsHtml = `
                <div class="summary-item">
                    <div class="summary-label">Diskutovaná témata:</div>
                    <div class="summary-value">${metadata.summary.topicsDiscussed.join(', ')}</div>
                </div>
            `;
        }

        let keyPointsHtml = '';
        if (metadata.summary.keyPoints && metadata.summary.keyPoints.length > 0) {
            keyPointsHtml = `
                <div class="summary-item">
                    <div class="summary-label">Klíčové body:</div>
                    <ul class="summary-list">
                        ${metadata.summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        this.summaryContent.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">ID hovoru:</div>
                <div class="summary-value">${metadata.sessionId}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Začátek hovoru:</div>
                <div class="summary-value">${new Date(metadata.startTime).toLocaleString('cs-CZ')}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Konec hovoru:</div>
                <div class="summary-value">${new Date(metadata.endTime).toLocaleString('cs-CZ')}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Délka hovoru:</div>
                <div class="summary-value">${metadata.duration}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Počet zpráv:</div>
                <div class="summary-value">${metadata.messageCount}</div>
            </div>
            
            ${topicsHtml}
            
            <div class="summary-item">
                <div class="summary-label">Výsledek:</div>
                <div class="summary-value">${metadata.summary.outcome}</div>
            </div>
            
            ${keyPointsHtml}
        `;
        
        // Scroll to summary
        this.summarySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const callManager = new CallManager();
    console.log('Cash and Drive AI Assistant inicializován');
});
