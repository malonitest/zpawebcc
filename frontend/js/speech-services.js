// ===== Speech Services - Azure Speech-to-Text & Text-to-Speech =====

let speechRecognizer = null;
let speechSynthesizer = null;
let isListening = false;

// ===== Inicializace Speech Services =====
async function initializeSpeechServices() {
    console.log('Initializing Azure Speech Services...');
    
    try {
        // V produkci: inicializace Azure Speech SDK
        // const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
        // speechConfig.speechRecognitionLanguage = 'cs-CZ';
        
        // Pro demo: použijeme Web Speech API jako fallback
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            speechRecognizer = new SpeechRecognition();
            
            speechRecognizer.continuous = true;
            speechRecognizer.interimResults = true;
            speechRecognizer.lang = 'cs-CZ';
            
            setupRecognitionHandlers();
            console.log('Speech Recognition initialized (Web Speech API)');
        } else {
            console.warn('Speech Recognition not supported in this browser');
        }

        // Inicializace Speech Synthesis
        if ('speechSynthesis' in window) {
            console.log('Speech Synthesis initialized');
        } else {
            console.warn('Speech Synthesis not supported in this browser');
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize Speech Services:', error);
        throw error;
    }
}

// ===== Nastavení handlerů pro rozpoznávání řeči =====
function setupRecognitionHandlers() {
    if (!speechRecognizer) return;

    speechRecognizer.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Aktualizovat indikátor mluvení
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            if (interimTranscript) {
                speakingIndicator.textContent = `Naslouchám: "${interimTranscript}"`;
            } else if (finalTranscript) {
                speakingIndicator.textContent = 'Zpracovávám...';
            }
        }

        // Když máme finální text
        if (finalTranscript) {
            console.log('User said:', finalTranscript);
            handleUserSpeech(finalTranscript);
        }
    };

    speechRecognizer.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
        } else if (event.error === 'not-allowed') {
            showError('Přístup k mikrofonu byl zamítnut. Povolte prosím mikrofon v nastavení prohlížeče.');
            endCall();
        } else {
            showError(`Chyba rozpoznávání řeči: ${event.error}`);
        }
    };

    speechRecognizer.onend = () => {
        if (isListening && isCallActive) {
            // Automaticky restartovat pokud je hovor aktivní
            speechRecognizer.start();
        }
    };
}

// ===== Spuštění naslouchání =====
function startListening() {
    if (!speechRecognizer) {
        console.warn('Speech recognizer not available');
        return;
    }

    try {
        isListening = true;
        speechRecognizer.start();
        console.log('Started listening...');
        
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            speakingIndicator.textContent = 'Naslouchám...';
        }
    } catch (error) {
        console.error('Failed to start listening:', error);
    }
}

// ===== Zastavení naslouchání =====
function stopListening() {
    if (!speechRecognizer) return;

    try {
        isListening = false;
        speechRecognizer.stop();
        console.log('Stopped listening');
        
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            speakingIndicator.textContent = '';
        }
    } catch (error) {
        console.error('Failed to stop listening:', error);
    }
}

// ===== Zpracování uživatelské řeči =====
async function handleUserSpeech(text) {
    // Přidat do přepisu
    addUserMessage(text);

    // Poslat do AI pro získání odpovědi
    const aiResponse = await getAIResponse(text);

    // Přidat AI odpověď do přepisu
    addAIMessage(aiResponse);

    // Přečíst AI odpověď
    await speakText(aiResponse);
}

// ===== Získání odpovědi od AI =====
async function getAIResponse(userText) {
    try {
        // V produkci: volání Azure AI Foundry API
        console.log('Getting AI response for:', userText);

        // Call backend AI function (GetAIResponse)
        const payload = {
            userMessage: userText,
            conversationHistory: window.callMessages || []
        };

        const result = await APIClient.post('/GetAIResponse', payload);

        // Backend returns { response: '...', timestamp: '...' }
        if (result && result.response) {
            return result.response;
        }

        // fallback
        return 'Omlouvám se, nedostal jsem odpověď od AI. Zkuste to prosím znovu.';

    } catch (error) {
        console.error('Failed to get AI response:', error);
        return 'Omlouvám se, vyskytla se chyba při zpracování vaší žádosti. Můžete prosím zopakovat?';
    }
}

// ===== Demo AI odpovědi =====
function generateDemoAIResponse(userText) {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('dobrý den') || lowerText.includes('ahoj') || lowerText.includes('zdravím')) {
        return 'Dobrý den! Jsem rád, že jste se ozvali. Čím vám mohu pomoci?';
    } else if (lowerText.includes('cena') || lowerText.includes('kolik stojí')) {
        return 'Naše cenové nabídky se liší podle konkrétních požadavků. Rád vám poskytnu detailní kalkulaci. Můžete mi říct, o jakou službu máte zájem?';
    } else if (lowerText.includes('kontakt') || lowerText.includes('email') || lowerText.includes('telefon')) {
        return 'Samozřejmě. Můžete nás kontaktovat na emailu info@cashndrive.cz nebo telefonicky na +420 XXX XXX XXX. Preferujete nějaký konkrétní způsob komunikace?';
    } else if (lowerText.includes('dostupnost') || lowerText.includes('kdy') || lowerText.includes('otevírací')) {
        return 'Jsem k dispozici 24 hodin denně, 7 dní v týdnu. Pro osobní konzultaci je naše kancelář otevřena v pracovní dny od 9 do 17 hodin. Co byste potřebovali vyřešit?';
    } else if (lowerText.includes('děkuji') || lowerText.includes('díky') || lowerText.includes('sbohem') || lowerText.includes('nashledanou')) {
        return 'Nemáte zač, rád jsem vám pomohl. Pokud budete potřebovat cokoliv dalšího, neváhejte se ozvat. Přeji vám pěkný den!';
    } else if (lowerText.includes('info') || lowerText.includes('informace') || lowerText.includes('co nabízíte')) {
        return 'Nabízíme komplexní AI řešení pro zákaznickou podporu s automatickým přijímáním hovorů a přirozenou konverzací v češtině. O které konkrétní oblasti máte zájem?';
    } else {
        return 'Rozumím vašemu dotazu. Můžete mi prosím poskytnout více detailů, abych vám mohl lépe poradit?';
    }
}

// ===== Text-to-Speech - přečtení textu =====
async function speakText(text) {
    try {
        // V produkci: Azure Text-to-Speech s mužským hlasem cs-CZ-AntoninNeural
        console.log('Speaking:', text);

        if ('speechSynthesis' in window) {
            // Zastavit aktuální syntézu
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'cs-CZ';
            utterance.rate = 0.95;
            utterance.pitch = 0.9;

            // Pokusit se najít český mužský hlas
            const voices = window.speechSynthesis.getVoices();
            const czechVoice = voices.find(voice => 
                voice.lang.startsWith('cs') && voice.name.includes('Male')
            ) || voices.find(voice => voice.lang.startsWith('cs'));

            if (czechVoice) {
                utterance.voice = czechVoice;
            }

            // Aktualizovat UI během mluvení
            utterance.onstart = () => {
                const speakingIndicator = document.getElementById('speakingIndicator');
                if (speakingIndicator) {
                    speakingIndicator.textContent = '🤖 AI Asistent mluví...';
                }
            };

            utterance.onend = () => {
                const speakingIndicator = document.getElementById('speakingIndicator');
                if (speakingIndicator && isCallActive) {
                    speakingIndicator.textContent = 'Naslouchám...';
                }
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
            };

            window.speechSynthesis.speak(utterance);

            // Čekání na dokončení
            return new Promise((resolve) => {
                utterance.onend = resolve;
                utterance.onerror = resolve;
            });
        } else {
            console.warn('Speech synthesis not available');
            return Promise.resolve();
        }
    } catch (error) {
        console.error('Failed to speak text:', error);
        return Promise.resolve();
    }
}

// ===== Načtení hlasů při startu =====
if ('speechSynthesis' in window) {
    // Načíst hlasy (některé prohlížeče to vyžadují)
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
    };
}

console.log('Speech Services loaded');
