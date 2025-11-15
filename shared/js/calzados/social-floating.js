// Botón flotante de redes sociales
class SocialFloating {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createFloatingButton();
        this.setupEventListeners();
    }

    createFloatingButton() {
        const floatingHTML = `
            <div class="social-floating">
                <button class="social-floating-main" id="socialFloatingMain">
                    <i class="fas fa-share-alt"></i>
                </button>
                <div class="social-floating-buttons">
                    <a href="https://wa.me/5491112345678" class="social-floating-btn whatsapp" target="_blank" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="https://instagram.com/eleganceshoes" class="social-floating-btn instagram" target="_blank" title="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="https://facebook.com/eleganceshoes" class="social-floating-btn facebook" target="_blank" title="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://tiktok.com/@eleganceshoes" class="social-floating-btn tiktok" target="_blank" title="TikTok">
                        <i class="fab fa-tiktok"></i>
                    </a>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', floatingHTML);
    }

    setupEventListeners() {
        const mainButton = document.getElementById('socialFloatingMain');
        const socialButtons = document.querySelector('.social-floating-buttons');

        mainButton.addEventListener('click', () => {
            this.toggleSocialButtons();
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.social-floating') && this.isOpen) {
                this.closeSocialButtons();
            }
        });

        // Animación de entrada escalonada
        socialButtons.querySelectorAll('.social-floating-btn').forEach((btn, index) => {
            btn.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    toggleSocialButtons() {
        const socialButtons = document.querySelector('.social-floating-buttons');
        const mainButton = document.getElementById('socialFloatingMain');
        
        if (this.isOpen) {
            this.closeSocialButtons();
        } else {
            this.openSocialButtons();
        }
    }

    openSocialButtons() {
        const socialButtons = document.querySelector('.social-floating-buttons');
        const mainButton = document.getElementById('socialFloatingMain');
        
        socialButtons.classList.add('open');
        mainButton.classList.add('open');
        this.isOpen = true;
    }

    closeSocialButtons() {
        const socialButtons = document.querySelector('.social-floating-buttons');
        const mainButton = document.getElementById('socialFloatingMain');
        
        socialButtons.classList.remove('open');
        mainButton.classList.remove('open');
        this.isOpen = false;
    }
}

// Inicializar botón flotante
document.addEventListener('DOMContentLoaded', () => {
    window.socialFloating = new SocialFloating();
});