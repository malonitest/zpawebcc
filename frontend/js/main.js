// ===== Globální konfigurace =====
const CONFIG = (() => {
    // If running on localhost or 127.x, point to local backend on port 7071
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host.startsWith('127.') || host === '0.0.0.0';
    const apiHost = isLocal ? `http://${host}:7071` : 'https://cashndrive-functions.azurewebsites.net';

    return {
        API_ENDPOINT: `${apiHost}/api`,
        COMMUNICATION_SERVICES_ENDPOINT: '', // Vyplní se z Azure
        AI_ENDPOINT: '', // Vyplní se z Azure
    };
})();

// ===== Utility funkce =====
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(date).toLocaleDateString('cs-CZ', options);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ===== Local Storage Management =====
const Storage = {
    saveTranscript(transcript) {
        const transcripts = this.getTranscripts();
        transcripts.unshift(transcript);
        localStorage.setItem('call_transcripts', JSON.stringify(transcripts));
    },

    getTranscripts() {
        const data = localStorage.getItem('call_transcripts');
        return data ? JSON.parse(data) : [];
    },

    clearTranscripts() {
        localStorage.removeItem('call_transcripts');
    }
};

// ===== API Communication =====
class APIClient {
    static async post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_ENDPOINT}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_ENDPOINT}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
}

// ===== Error Handling =====
function showError(message) {
    console.error(message);
    alert(`Chyba: ${message}`);
}

function showSuccess(message) {
    console.log(message);
}

// ===== Page Navigation =====
function navigateTo(page) {
    window.location.href = page;
}

// ===== Export pro použití v jiných souborech =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, formatDate, formatDuration, Storage, APIClient, showError, showSuccess };
}

console.log('CashNDrive AI Assistant - Main.js loaded');
