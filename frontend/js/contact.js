// ===== Contact Form Handler =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form initialized');
});

// ===== Odeslání kontaktního formuláře =====
async function submitContactForm(event) {
    event.preventDefault();

    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    // Získat data z formuláře
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        consent: document.getElementById('consent').checked,
        timestamp: new Date().toISOString()
    };

    // Validace
    if (!formData.consent) {
        showFormMessage('Musíte souhlasit se zpracováním osobních údajů.', 'error');
        return;
    }

    // Deaktivovat tlačítko během odesílání
    submitButton.disabled = true;
    submitButton.textContent = 'Odesílám...';

    try {
        // V produkci: odeslat na backend API
        // await APIClient.post('/contact', formData);
        
        // Pro demo: simulace odeslání
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Form submitted:', formData);

        // Zobrazit úspěšnou zprávu
        showFormMessage('Děkujeme za vaši zprávu! Budeme vás kontaktovat co nejdříve.', 'success');

        // Vymazat formulář
        form.reset();

    } catch (error) {
        console.error('Form submission failed:', error);
        showFormMessage('Omlouvám se, nepodařilo se odeslat zprávu. Zkuste to prosím znovu.', 'error');
    } finally {
        // Aktivovat tlačítko zpět
        submitButton.disabled = false;
        submitButton.textContent = 'Odeslat zprávu';
    }
}

// ===== Zobrazení zprávy u formuláře =====
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    // Automaticky skrýt po 5 sekundách
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// ===== Validace emailu =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== Validace telefonu =====
function isValidPhone(phone) {
    if (!phone) return true; // Telefon je nepovinný
    const phoneRegex = /^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
}

console.log('Contact.js loaded');
