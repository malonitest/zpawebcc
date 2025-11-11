// ===== Call Handler - Správa hovorového rozhraní =====

let currentCall = null;
let callStartTime = null;
let callMessages = [];
let isCallActive = false;
// Expose callMessages to global so other modules (speech-services) can access conversation history
window.callMessages = callMessages;

// ===== Inicializace při načtení stránky =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Call Handler initialized');
    setupCallInterface();
});

function setupCallInterface() {
    // Reset UI
    updateCallStatus('Připraven k hovoru', 'ready');
    document.getElementById('startCallBtn').disabled = false;
    document.getElementById('endCallBtn').disabled = true;
}

// ===== Zahájení hovoru =====
async function startCall() {
    try {
        updateCallStatus('Navazování spojení...', 'connecting');
        document.getElementById('startCallBtn').disabled = true;
        
        // Požádat o přístup k mikrofonu
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');

        // Inicializovat Azure Communication Services
        await initializeCommunicationServices();

        // Inicializovat Speech Services (STT/TTS)
        await initializeSpeechServices();

        // Spustit hovor
        isCallActive = true;
        callStartTime = Date.now();
        callMessages = [];

        updateCallStatus('Hovor aktivní', 'active');
        document.getElementById('endCallBtn').disabled = false;
        
        // Zobrazit vizualizaci
        document.getElementById('callVisualization').style.display = 'block';
        document.getElementById('transcriptContainer').style.display = 'block';

        // Simulace úvodního pozdravu od AI (v reálné aplikaci přijde z Azure AI)
        setTimeout(() => {
            addAIMessage('Dobrý den, u telefonu Petr Král ze společnosti CashNDrive. Jak vám mohu dnes pomoci?');
            speakText('Dobrý den, u telefonu Petr Král ze společnosti CashNDrive. Jak vám mohu dnes pomoci?');
        }, 1500);

        // Začít naslouchat uživateli
        startListening();

    } catch (error) {
        console.error('Failed to start call:', error);
        showError('Nepodařilo se zahájit hovor. Zkontrolujte přístup k mikrofonu.');
        resetCallInterface();
    }
}

// ===== Ukončení hovoru =====
async function endCall() {
    if (!isCallActive) return;

    try {
        updateCallStatus('Ukončování hovoru...', 'ending');
        
        // Zastavit naslouchání
        stopListening();

        // Ukončit Azure Communication Services
        await terminateCommunicationServices();

        // Vypočítat délku hovoru
        const callDuration = Math.floor((Date.now() - callStartTime) / 1000);

        // Vygenerovat shrnutí hovoru
        const summary = await generateCallSummary(callMessages, callDuration);

        // Zobrazit shrnutí
        displayCallSummary(summary);

        // Uložit přepis
        saveCallTranscript(callMessages, summary, callDuration);

        isCallActive = false;
        document.getElementById('callVisualization').style.display = 'none';
        document.getElementById('transcriptContainer').style.display = 'none';
        document.getElementById('summaryContainer').style.display = 'block';
        
        updateCallStatus('Hovor ukončen', 'ended');
        document.getElementById('endCallBtn').disabled = true;

    } catch (error) {
        console.error('Error ending call:', error);
        showError('Chyba při ukončování hovoru');
        resetCallInterface();
    }
}

// ===== Reset demo =====
function resetDemo() {
    document.getElementById('summaryContainer').style.display = 'none';
    document.getElementById('transcriptBox').innerHTML = '';
    callMessages = [];
    setupCallInterface();
}

// ===== Aktualizace statusu hovoru =====
function updateCallStatus(text, status) {
    const statusElement = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    
    if (statusElement) {
        statusElement.textContent = text;
    }

    if (statusDot) {
        statusDot.className = 'status-dot';
        switch(status) {
            case 'active':
                statusDot.style.backgroundColor = 'var(--success-color)';
                break;
            case 'connecting':
            case 'ending':
                statusDot.style.backgroundColor = 'var(--warning-color)';
                break;
            case 'ended':
                statusDot.style.backgroundColor = 'var(--danger-color)';
                break;
            default:
                statusDot.style.backgroundColor = 'var(--success-color)';
        }
    }
}

// ===== Přidání zprávy do přepisu =====
function addUserMessage(text) {
    const message = {
        speaker: 'Zákazník',
        text: text,
        timestamp: new Date().toISOString(),
        type: 'user'
    };
    callMessages.push(message);
    // sync global reference
    window.callMessages = callMessages;
    displayMessage(message);
}

function addAIMessage(text) {
    const message = {
        speaker: 'AI Asistent',
        text: text,
        timestamp: new Date().toISOString(),
        type: 'ai'
    };
    callMessages.push(message);
    // sync global reference
    window.callMessages = callMessages;
    displayMessage(message);
}

function displayMessage(message) {
    const transcriptBox = document.getElementById('transcriptBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `transcript-message ${message.type}`;
    
    messageDiv.innerHTML = `
        <div class="speaker">${message.speaker}</div>
        <div class="text">${message.text}</div>
    `;
    
    transcriptBox.appendChild(messageDiv);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

// ===== Generování shrnutí hovoru =====
async function generateCallSummary(messages, duration) {
    // V produkci se volá Azure AI API pro generování shrnutí
    // Pro demo vytváříme strukturované shrnutí
    
    try {
        // Simulace volání API (v reálné aplikaci by bylo skutečné API)
        const summary = {
            duration: duration,
            timestamp: new Date().toISOString(),
            reason: 'Dotaz na služby',
            customerNeeds: [
                'Informace o dostupnosti',
                'Cenová nabídka',
                'Možnosti kontaktu'
            ],
            aiActions: [
                'Poskytnutí základních informací',
                'Vysvětlení cenových podmínek',
                'Nabídka dalších kontaktních možností'
            ],
            followUp: 'Zaslání cenové nabídky e-mailem',
            sentiment: 'Pozitivní'
        };

        return summary;

    } catch (error) {
        console.error('Error generating summary:', error);
        return {
            duration: duration,
            timestamp: new Date().toISOString(),
            reason: 'Neidentifikováno',
            customerNeeds: [],
            aiActions: [],
            followUp: 'Žádný',
            sentiment: 'Neutrální'
        };
    }
}

// ===== Zobrazení shrnutí =====
function displayCallSummary(summary) {
    const summaryBox = document.getElementById('summaryBox');
    
    summaryBox.innerHTML = `
        <div class="summary-section">
            <h4>📊 Základní informace</h4>
            <p><strong>Datum:</strong> ${formatDate(summary.timestamp)}</p>
            <p><strong>Délka hovoru:</strong> ${formatDuration(summary.duration)}</p>
            <p><strong>Nálada hovoru:</strong> ${summary.sentiment}</p>
        </div>

        <div class="summary-section">
            <h4>📝 Důvod volání</h4>
            <p>${summary.reason}</p>
        </div>

        <div class="summary-section">
            <h4>✅ Potřeby zákazníka</h4>
            <ul>
                ${summary.customerNeeds.map(need => `<li>${need}</li>`).join('')}
            </ul>
        </div>

        <div class="summary-section">
            <h4>🤖 Kroky asistenta</h4>
            <ul>
                ${summary.aiActions.map(action => `<li>${action}</li>`).join('')}
            </ul>
        </div>

        <div class="summary-section">
            <h4>🔄 Doporučený follow-up</h4>
            <p>${summary.followUp}</p>
        </div>
    `;
}

// ===== Uložení přepisu =====
function saveCallTranscript(messages, summary, duration) {
    const transcript = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        duration: duration,
        messages: messages,
        summary: summary
    };

    Storage.saveTranscript(transcript);
    console.log('Transcript saved:', transcript);
}

// ===== Azure Communication Services =====
async function initializeCommunicationServices() {
    // V produkci: inicializace Azure Communication Services SDK
    console.log('Initializing Azure Communication Services...');
    
    // Simulace pro demo
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Azure Communication Services initialized');
            resolve();
        }, 1000);
    });
}

async function terminateCommunicationServices() {
    console.log('Terminating Azure Communication Services...');
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Azure Communication Services terminated');
            resolve();
        }, 500);
    });
}

// ===== Reset rozhraní =====
function resetCallInterface() {
    isCallActive = false;
    document.getElementById('startCallBtn').disabled = false;
    document.getElementById('endCallBtn').disabled = true;
    document.getElementById('callVisualization').style.display = 'none';
    updateCallStatus('Připraven k hovoru', 'ready');
}

console.log('Call Handler loaded');
