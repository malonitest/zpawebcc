// ===== Transcripts Page - Správa přepisů =====

let allTranscripts = [];
let filteredTranscripts = [];

// ===== Inicializace při načtení stránky =====
document.addEventListener('DOMContentLoaded', function() {
    loadTranscripts();
});

// ===== Načtení přepisů =====
function loadTranscripts() {
    allTranscripts = Storage.getTranscripts();
    filteredTranscripts = [...allTranscripts];
    
    displayTranscripts();
}

// ===== Zobrazení přepisů =====
function displayTranscripts() {
    const transcriptsList = document.getElementById('transcriptsList');
    const emptyState = document.getElementById('emptyState');

    if (filteredTranscripts.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        // Vymazat existující karty
        const existingCards = transcriptsList.querySelectorAll('.transcript-card');
        existingCards.forEach(card => card.remove());
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // Vymazat existující karty
    const existingCards = transcriptsList.querySelectorAll('.transcript-card');
    existingCards.forEach(card => card.remove());

    // Vytvořit karty pro každý přepis
    filteredTranscripts.forEach(transcript => {
        const card = createTranscriptCard(transcript);
        transcriptsList.appendChild(card);
    });
}

// ===== Vytvoření karty přepisu =====
function createTranscriptCard(transcript) {
    const card = document.createElement('div');
    card.className = 'transcript-card';
    card.onclick = () => openTranscriptDetail(transcript);

    const preview = getTranscriptPreview(transcript);
    const tags = getTranscriptTags(transcript);

    card.innerHTML = `
        <div class="transcript-header">
            <div class="transcript-date">${formatDate(transcript.timestamp)}</div>
            <div class="transcript-duration">${formatDuration(transcript.duration)}</div>
        </div>
        <div class="transcript-preview">${preview}</div>
        <div class="transcript-footer">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;

    return card;
}

// ===== Získání náhledu přepisu =====
function getTranscriptPreview(transcript) {
    if (transcript.summary && transcript.summary.reason) {
        return `<strong>Důvod volání:</strong> ${transcript.summary.reason}`;
    }

    if (transcript.messages && transcript.messages.length > 0) {
        const firstUserMessage = transcript.messages.find(m => m.type === 'user');
        if (firstUserMessage) {
            const preview = firstUserMessage.text.substring(0, 100);
            return `${preview}${firstUserMessage.text.length > 100 ? '...' : ''}`;
        }
    }

    return 'Přepis konverzace';
}

// ===== Získání tagů =====
function getTranscriptTags(transcript) {
    const tags = [];

    if (transcript.summary) {
        if (transcript.summary.sentiment) {
            tags.push(transcript.summary.sentiment);
        }
        if (transcript.duration < 60) {
            tags.push('Krátký hovor');
        } else if (transcript.duration > 300) {
            tags.push('Dlouhý hovor');
        }
    }

    if (transcript.messages) {
        tags.push(`${transcript.messages.length} zpráv`);
    }

    return tags;
}

// ===== Otevření detailu přepisu =====
function openTranscriptDetail(transcript) {
    const modal = document.getElementById('transcriptModal');
    const modalBody = document.getElementById('modalBody');

    let conversationHTML = '';
    if (transcript.messages) {
        conversationHTML = transcript.messages.map(msg => `
            <div class="transcript-message ${msg.type}">
                <div class="speaker">${msg.speaker}</div>
                <div class="text">${msg.text}</div>
            </div>
        `).join('');
    }

    modalBody.innerHTML = `
        <h2>Detail hovoru</h2>
        
        <div class="summary-section">
            <h4>📊 Základní informace</h4>
            <p><strong>Datum:</strong> ${formatDate(transcript.timestamp)}</p>
            <p><strong>Délka hovoru:</strong> ${formatDuration(transcript.duration)}</p>
            ${transcript.summary && transcript.summary.sentiment ? 
                `<p><strong>Nálada:</strong> ${transcript.summary.sentiment}</p>` : ''}
        </div>

        ${transcript.summary ? `
            <div class="summary-section">
                <h4>📝 Důvod volání</h4>
                <p>${transcript.summary.reason || 'Nespecifikováno'}</p>
            </div>

            ${transcript.summary.customerNeeds && transcript.summary.customerNeeds.length > 0 ? `
                <div class="summary-section">
                    <h4>✅ Potřeby zákazníka</h4>
                    <ul>
                        ${transcript.summary.customerNeeds.map(need => `<li>${need}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${transcript.summary.aiActions && transcript.summary.aiActions.length > 0 ? `
                <div class="summary-section">
                    <h4>🤖 Kroky asistenta</h4>
                    <ul>
                        ${transcript.summary.aiActions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${transcript.summary.followUp ? `
                <div class="summary-section">
                    <h4>🔄 Follow-up</h4>
                    <p>${transcript.summary.followUp}</p>
                </div>
            ` : ''}
        ` : ''}

        <div class="summary-section">
            <h4>💬 Kompletní přepis</h4>
            <div class="transcript-box">
                ${conversationHTML || '<p>Žádné zprávy k zobrazení</p>'}
            </div>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="closeModal()">Zavřít</button>
        </div>
    `;

    modal.style.display = 'flex';

    // Zavřít při kliknutí mimo
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// ===== Zavření modalu =====
function closeModal() {
    const modal = document.getElementById('transcriptModal');
    modal.style.display = 'none';
}

// ===== Filtrování přepisů =====
function filterTranscripts() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    filteredTranscripts = allTranscripts.filter(transcript => {
        // Textové vyhledávání
        let matchesSearch = true;
        if (searchText) {
            const searchableText = JSON.stringify(transcript).toLowerCase();
            matchesSearch = searchableText.includes(searchText);
        }

        // Filtrování podle data
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const transcriptDate = new Date(transcript.timestamp);
            const now = new Date();

            switch(dateFilter) {
                case 'today':
                    matchesDate = transcriptDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = transcriptDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = transcriptDate >= monthAgo;
                    break;
            }
        }

        return matchesSearch && matchesDate;
    });

    displayTranscripts();
}

// ===== Vymazání všech přepisů (pro testování) =====
function clearAllTranscripts() {
    if (confirm('Opravdu chcete smazat všechny přepisy?')) {
        Storage.clearTranscripts();
        loadTranscripts();
    }
}

console.log('Transcripts.js loaded');
