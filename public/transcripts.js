// Transcripts display
class TranscriptsManager {
    constructor() {
        this.transcriptsList = document.getElementById('transcriptsList');
        this.loadTranscripts();
    }

    loadTranscripts() {
        const transcripts = JSON.parse(sessionStorage.getItem('transcripts') || '[]');
        
        if (transcripts.length === 0) {
            this.showNoTranscripts();
            return;
        }

        this.displayTranscripts(transcripts);
    }

    showNoTranscripts() {
        this.transcriptsList.innerHTML = `
            <div class="no-transcripts">
                <p>Zatím nejsou k dispozici žádné přepisy.</p>
                <p>Zahajte hovor v <a href="call.html">demo sekci</a> pro vytvoření přepisu.</p>
            </div>
        `;
    }

    displayTranscripts(transcripts) {
        this.transcriptsList.innerHTML = '';
        
        // Display transcripts in reverse order (newest first)
        transcripts.reverse().forEach((transcript, index) => {
            const transcriptItem = this.createTranscriptItem(transcript, index);
            this.transcriptsList.appendChild(transcriptItem);
        });
    }

    createTranscriptItem(transcript, index) {
        const item = document.createElement('div');
        item.className = 'transcript-item';
        
        const date = new Date(transcript.date);
        const dateStr = date.toLocaleString('cs-CZ');
        
        const header = document.createElement('div');
        header.className = 'transcript-header';
        header.innerHTML = `
            <h3>Hovor #${index + 1}</h3>
            <div class="transcript-date">${dateStr} | Délka: ${transcript.duration}</div>
        `;
        
        const content = document.createElement('div');
        content.className = 'transcript-content';
        
        transcript.messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `transcript-message ${msg.speaker}`;
            
            const speaker = document.createElement('strong');
            speaker.textContent = msg.speaker === 'assistant' ? 'AI Asistent: ' : 
                                  msg.speaker === 'user' ? 'Zákazník: ' : 
                                  'Systém: ';
            
            msgDiv.appendChild(speaker);
            msgDiv.appendChild(document.createTextNode(msg.message));
            content.appendChild(msgDiv);
        });
        
        item.appendChild(header);
        item.appendChild(content);
        
        return item;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TranscriptsManager();
});
