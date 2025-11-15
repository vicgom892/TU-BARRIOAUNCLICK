// Formulario de contacto con WhatsApp
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupVoucherForm();
    }

    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit(e.target);
        });
    }

    setupVoucherForm() {
        const voucherForm = document.getElementById('voucherForm');
        if (!voucherForm) return;

        voucherForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVoucherSubmit(e.target);
        });
    }

    handleContactSubmit(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name') || document.getElementById('contactName')?.value,
            email: formData.get('email') || document.getElementById('contactEmail')?.value,
            subject: formData.get('subject') || document.getElementById('contactSubject')?.value,
            message: formData.get('message') || document.getElementById('contactMessage')?.value
        };

        // Validar datos
        if (!data.name || !data.email || !data.message) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'warning');
            return;
        }

        // Enviar por WhatsApp
        this.sendContactViaWhatsApp(data);
        
        // Limpiar formulario
        form.reset();
    }

    handleVoucherSubmit(form) {
        const formData = new FormData(form);
        const fileInput = document.getElementById('voucherFile');
        const file = fileInput.files[0];

        if (!file) {
            this.showNotification('Por favor, selecciona un comprobante', 'warning');
            return;
        }

        // Validar tamaño del archivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('El archivo debe ser menor a 5MB', 'warning');
            return;
        }

        const data = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            orderNumber: document.getElementById('orderNumber').value,
            message: document.getElementById('customerMessage').value,
            fileName: file.name,
            fileSize: this.formatFileSize(file.size)
        };

        // Enviar por WhatsApp
        this.sendVoucherViaWhatsApp(data);
        
        // Aquí normalmente enviarías el archivo a un servidor
        // Por ahora solo mostramos mensaje de éxito
        this.showNotification('Comprobante enviado correctamente. Nos contactaremos pronto.', 'success');
        form.reset();
    }

    sendContactViaWhatsApp(data) {
        const phoneNumber = "5491112345678";
        let message = "Nuevo mensaje de contacto:%0A%0A";
        message += `*Nombre:* ${data.name}%0A`;
        message += `*Email:* ${data.email}%0A`;
        message += `*Asunto:* ${data.subject}%0A`;
        message += `*Mensaje:*%0A${data.message}%0A%0A`;
        message += "Por favor, responder a la brevedad.";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        this.showNotification('Mensaje enviado por WhatsApp', 'success');
    }

    sendVoucherViaWhatsApp(data) {
        const phoneNumber = "5491112345678";
        let message = "Nuevo comprobante de pago:%0A%0A";
        message += `*Cliente:* ${data.name}%0A`;
        message += `*Email:* ${data.email}%0A`;
        message += `*N° de Pedido:* ${data.orderNumber || 'No especificado'}%0A`;
        message += `*Archivo:* ${data.fileName} (${data.fileSize})%0A`;
        
        if (data.message) {
            message += `*Mensaje:*%0A${data.message}%0A`;
        }
        
        message += "%0APor favor, verificar el pago y contactar al cliente.";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 1060;
            min-width: 300px;
        `;
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Función para copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Mostrar notificación de copiado
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 1060;
            min-width: 200px;
        `;
        notification.innerHTML = `
            ¡Copiado al portapapeles!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// Inicializar formularios
document.addEventListener('DOMContentLoaded', () => {
    window.contactForm = new ContactForm();
});