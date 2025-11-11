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
        
        // Create elements safely without innerHTML to prevent XSS
        const roleDiv = document.createElement('div');
        roleDiv.className = 'message-role';
        roleDiv.textContent = roleLabel;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;
        
        messageDiv.appendChild(roleDiv);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeDiv);
        
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
        
        // Clear previous content
        this.summaryContent.innerHTML = '';
        
        // Helper function to create summary item
        const createSummaryItem = (label, value) => {
            const item = document.createElement('div');
            item.className = 'summary-item';
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'summary-label';
            labelDiv.textContent = label;
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'summary-value';
            valueDiv.textContent = value;
            
            item.appendChild(labelDiv);
            item.appendChild(valueDiv);
            return item;
        };
        
        // Add summary items
        this.summaryContent.appendChild(createSummaryItem('ID hovoru:', metadata.sessionId));
        this.summaryContent.appendChild(createSummaryItem('Začátek hovoru:', new Date(metadata.startTime).toLocaleString('cs-CZ')));
        this.summaryContent.appendChild(createSummaryItem('Konec hovoru:', new Date(metadata.endTime).toLocaleString('cs-CZ')));
        this.summaryContent.appendChild(createSummaryItem('Délka hovoru:', metadata.duration));
        this.summaryContent.appendChild(createSummaryItem('Počet zpráv:', metadata.messageCount.toString()));
        
        // Add topics if available
        if (metadata.summary.topicsDiscussed && metadata.summary.topicsDiscussed.length > 0) {
            this.summaryContent.appendChild(createSummaryItem('Diskutovaná témata:', metadata.summary.topicsDiscussed.join(', ')));
        }
        
        // Add outcome
        this.summaryContent.appendChild(createSummaryItem('Výsledek:', metadata.summary.outcome));
        
        // Add key points if available
        if (metadata.summary.keyPoints && metadata.summary.keyPoints.length > 0) {
            const item = document.createElement('div');
            item.className = 'summary-item';
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'summary-label';
            labelDiv.textContent = 'Klíčové body:';
            
            const ul = document.createElement('ul');
            ul.className = 'summary-list';
            
            metadata.summary.keyPoints.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                ul.appendChild(li);
            });
            
            item.appendChild(labelDiv);
            item.appendChild(ul);
            this.summaryContent.appendChild(item);
        }
        
        // Scroll to summary
        this.summarySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const callManager = new CallManager();
    console.log('Cash and Drive AI Assistant inicializován');
});
