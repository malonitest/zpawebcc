// Contact form handling
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.formMessage = document.getElementById('formMessage');
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        try {
            // In real implementation, this would send to backend
            await this.submitForm(formData);
            this.showMessage('Děkujeme! Vaše zpráva byla úspěšně odeslána.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showMessage('Chyba při odesílání zprávy. Zkuste to prosím znovu.', 'error');
        }
    }

    async submitForm(formData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', formData);
                resolve();
            }, 1000);
        });
    }

    showMessage(message, type) {
        this.formMessage.textContent = message;
        this.formMessage.className = `form-message ${type}`;
        this.formMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            this.formMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormManager();
});
