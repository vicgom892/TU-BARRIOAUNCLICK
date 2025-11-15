// form.js - Versión Segura con Protección Mejorada

// 🔒 CONFIGURACIÓN DE SEGURIDAD PARA FORMULARIOS
class FormSecurity {
    constructor() {
        this.maxLengths = {
            name: 100,
            email: 100,
            message: 1000,
            question: 200
        };
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupInputSanitization();
        console.log('✅ Seguridad de formularios inicializada');
    }

    setupFormValidation() {
        // Validación en tiempo real para inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"], textarea')) {
                this.validateInputLength(e.target);
            }
        });

        // Validación de email en tiempo real
        document.addEventListener('blur', (e) => {
            if (e.target.type === 'email') {
                this.validateEmail(e.target);
            }
        });
    }

    setupInputSanitization() {
        // Sanitización automática en inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                const originalValue = e.target.value;
                const sanitizedValue = this.sanitizeInput(originalValue);
                if (originalValue !== sanitizedValue) {
                    e.target.value = sanitizedValue;
                }
            }
        });
    }

    validateInputLength(input) {
        const maxLength = this.maxLengths[input.id] || this.maxLengths.question;
        if (input.value.length > maxLength) {
            input.value = input.value.substring(0, maxLength);
            this.showInputWarning(input, `Máximo ${maxLength} caracteres`);
        }
    }

    validateEmail(input) {
        const email = input.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.showInputWarning(input, 'Email no válido');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showInputWarning(input, message) {
        // Remover advertencia anterior
        const existingWarning = input.parentNode.querySelector('.input-warning');
        if (existingWarning) {
            existingWarning.remove();
        }

        // Crear nueva advertencia
        const warning = document.createElement('div');
        warning.className = 'input-warning';
        warning.textContent = message;
        warning.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;

        input.parentNode.appendChild(warning);

        // Remover después de 3 segundos
        setTimeout(() => {
            if (warning.parentNode) {
                warning.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => warning.remove(), 300);
            }
        }, 3000);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remover scripts y etiquetas HTML
        let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        
        // Remover caracteres potencialmente peligrosos
        sanitized = sanitized.replace(/[<>]/g, '');
        
        // Limitar caracteres especiales excesivos
        sanitized = sanitized.replace(/([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\1{3,}/g, '$1$1');
        
        return sanitized;
    }

    validateFormData(formData) {
        const errors = [];

        // Validar nombre
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (formData.name.length > this.maxLengths.name) {
            errors.push(`El nombre es demasiado largo (máximo ${this.maxLengths.name} caracteres)`);
        }

        // Validar email
        if (!formData.email) {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(formData.email)) {
            errors.push('El email no tiene un formato válido');
        }

        // Validar mensaje
        if (!formData.message || formData.message.trim().length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
        }

        if (formData.message.length > this.maxLengths.message) {
            errors.push(`El mensaje es demasiado largo (máximo ${this.maxLengths.message} caracteres)`);
        }

        return errors;
    }
}

// Inicializar seguridad de formularios
const formSecurity = new FormSecurity();

// 🎯 FUNCIONES PRINCIPALES DEL FORMULARIO
function showQuestionsPrompt() {
    const category = document.getElementById('category').value;
    const questionsPrompt = document.getElementById('questions-prompt');
    
    if (category) {
        questionsPrompt.style.display = 'block';
    } else {
        questionsPrompt.style.display = 'none';
        document.getElementById('questions-section').classList.remove('show');
    }
}

function showQuestions(accept) {
    const category = document.getElementById('category').value;
    const questionsSection = document.getElementById('questions-section');
    questionsSection.innerHTML = '';

    if (!accept || !category) {
        questionsSection.classList.remove('show');
        return;
    }

    let questions = [];
    if (category === 'Sugerencia') {
        questions = [
            { 
                id: 'q1', 
                label: '¿Qué nueva funcionalidad te gustaría ver?', 
                type: 'text',
                maxLength: 200,
                placeholder: 'Ej: Mapas interactivos, reservas online...'
            },
            { 
                id: 'q2', 
                label: '¿Qué rubro te interesa más?', 
                type: 'select', 
                options: ['Panadería', 'Farmacia', 'Kiosco', 'Barbería', 'Verdulería', 'Carnicería', 'Otro'] 
            }
        ];
    } else if (category === 'Reclamo') {
        questions = [
            { 
                id: 'q1', 
                label: '¿En qué rubro ocurrió el problema?', 
                type: 'select', 
                options: ['Panadería', 'Farmacia', 'Kiosco', 'Barbería', 'Verdulería', 'Carnicería', 'Otro'] 
            },
            { 
                id: 'q2', 
                label: '¿Qué podemos mejorar?', 
                type: 'text',
                maxLength: 200,
                placeholder: 'Describe qué podemos hacer mejor...'
            }
        ];
    } else if (category === 'Consulta') {
        questions = [
            { 
                id: 'q1', 
                label: '¿Sobre qué rubro es tu consulta?', 
                type: 'select', 
                options: ['Panadería', 'Farmacia', 'Kiosco', 'Barbería', 'Verdulería', 'Carnicería', 'Otro'] 
            },
            { 
                id: 'q2', 
                label: '¿Necesitas ayuda con algo específico?', 
                type: 'text',
                maxLength: 200,
                placeholder: 'Ej: Cómo registrar mi negocio, cómo usar la app...'
            }
        ];
    }

    // 🆕 CREAR PREGUNTAS DE FORMA SEGURA
    questions.forEach(q => {
        const div = document.createElement('div');
        div.classList.add('question-option');
        
        if (q.type === 'text') {
            div.innerHTML = `
                <label for="${q.id}">${q.label}</label>
                <input type="text" 
                       id="${q.id}" 
                       placeholder="${q.placeholder || 'Tu respuesta'}"
                       maxlength="${q.maxLength || 200}"
                       oninput="validateQuestionInput(this)">
                <div class="char-counter" style="font-size: 0.8rem; color: #666; text-align: right; margin-top: 0.25rem;">
                    <span id="counter-${q.id}">0</span>/${q.maxLength || 200}
                </div>
            `;
        } else if (q.type === 'select') {
            let options = q.options.map(opt => 
                `<option value="${formSecurity.sanitizeInput(opt)}">${opt}</option>`
            ).join('');
            
            div.innerHTML = `
                <label for="${q.id}">${q.label}</label>
                <select id="${q.id}">
                    <option value="">Selecciona una opción</option>
                    ${options}
                </select>
            `;
        }
        questionsSection.appendChild(div);
    });

    // 🆕 CONFIGURAR CONTADORES DE CARACTERES
    questions.filter(q => q.type === 'text').forEach(q => {
        const input = document.getElementById(q.id);
        const counter = document.getElementById(`counter-${q.id}`);
        
        if (input && counter) {
            input.addEventListener('input', function() {
                counter.textContent = this.value.length;
                
                // Cambiar color cuando se acerca al límite
                if (this.value.length > (q.maxLength * 0.8)) {
                    counter.style.color = '#ff6b35';
                } else {
                    counter.style.color = '#666';
                }
            });
        }
    });

    questionsSection.classList.add('show');
}

// 🆕 FUNCIÓN PARA VALIDAR INPUTS DE PREGUNTAS
function validateQuestionInput(input) {
    const maxLength = input.maxLength || 200;
    if (input.value.length > maxLength) {
        input.value = input.value.substring(0, maxLength);
        formSecurity.showInputWarning(input, `Máximo ${maxLength} caracteres permitidos`);
    }
    
    // Actualizar contador
    const counter = document.getElementById(`counter-${input.id}`);
    if (counter) {
        counter.textContent = input.value.length;
    }
}

function submitForm() {
    // 🔒 VERIFICACIÓN DE SEGURIDAD PRINCIPAL
    if (!window.appSecurity) {
        console.error('🔒 Sistema de seguridad no disponible');
        showErrorModal('Error de seguridad. Por favor, recarga la página.');
        return;
    }

    // 🆕 OBTENER Y SANITIZAR DATOS
    const name = window.appSecurity.sanitizeInput(document.getElementById('name').value.trim());
    const email = window.appSecurity.sanitizeInput(document.getElementById('email').value.trim());
    const category = window.appSecurity.sanitizeInput(document.getElementById('category').value);
    const message = window.appSecurity.sanitizeInput(document.getElementById('message').value.trim());
    const questionsSection = document.getElementById('questions-section');

    // 🆕 VALIDACIÓN COMPLETA DE DATOS
    const formData = { name, email, category, message };
    const validationErrors = formSecurity.validateFormData(formData);

    if (validationErrors.length > 0) {
        showErrorModal(validationErrors.join('\n'));
        return;
    }

    // 🆕 RECOPILAR RESPUESTAS DE PREGUNTAS DE FORMA SEGURA
    const questions = [];
    if (questionsSection.classList.contains('show')) {
        const inputs = questionsSection.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.value && input.value.trim()) {
                const label = input.previousElementSibling ? 
                    input.previousElementSibling.textContent : 'Pregunta adicional';
                const sanitizedLabel = window.appSecurity.sanitizeInput(label);
                const sanitizedValue = window.appSecurity.sanitizeInput(input.value);
                questions.push({
                    question: sanitizedLabel,
                    answer: sanitizedValue
                });
            }
        });
    }

    // 🆕 CREAR OBJETO DE DATOS COMPLETO
    const completeFormData = {
        ...formData,
        questions,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100), // Limitar longitud
        source: 'contact_form_castelar',
        version: 'v1.0'
    };

    // 🆕 GUARDAR EN LOCALSTORAGE DE FORMA SEGURA
    try {
        let feedback = JSON.parse(localStorage.getItem('feedback')) || [];
        
        // Limitar a 50 entradas máximo
        if (feedback.length >= 50) {
            feedback = feedback.slice(-49); // Mantener las 49 más recientes
        }
        
        feedback.push(completeFormData);
        localStorage.setItem('feedback', JSON.stringify(feedback));
        console.log('✅ Formulario guardado en localStorage');
    } catch (error) {
        console.error('❌ Error guardando en localStorage:', error);
        // Continuar aunque falle el localStorage
    }

    // 🆕 PREPARAR Y ENVIAR MENSAJE DE WHATSAPP SEGURO
    const whatsappMessage = `
Nuevo mensaje de contacto 📧

*Nombre:* ${name}
*Correo:* ${email}
*Categoría:* ${category}
*Mensaje:* ${message}
${questions.length > 0 ? `*Respuestas:*\n${questions.map(q => `• ${q.question}: ${q.answer}`).join('\n')}` : ''}

---
*Enviado desde:* Tu Barrio a un Clik - Castelar
*Fecha:* ${new Date().toLocaleString('es-AR')}
*Navegador:* ${navigator.userAgent.split(' ')[0]}
    `.trim();

    // 🆕 USAR LA FUNCIÓN SEGURA DE WHATSAPP
    openWhatsAppSecure('5491157194796', whatsappMessage);

    // 🆕 MOSTRAR MODAL DE ÉXITO MEJORADO
    showSuccessModal();

    // 🆕 LIMPIAR FORMULARIO COMPLETAMENTE
    resetForm();

    // 🆕 LOG DE SEGURIDAD
    window.appSecurity.logSecurityEvent('form_submitted', {
        category: category,
        hasQuestions: questions.length > 0,
        questionsCount: questions.length
    });
}

// 🆕 FUNCIÓN SEGURA PARA WHATSAPP
function openWhatsAppSecure(phone, message = '') {
    // Verificar seguridad primero
    if (!window.appSecurity) {
        console.warn('⚠️ Seguridad no disponible, usando método alternativo');
        openWhatsAppFallback(phone, message);
        return;
    }

    // Validar y sanitizar el número
    const safePhone = window.appSecurity.validatePhoneNumber(phone);
    
    if (!safePhone) {
        console.error('🔒 No se pudo validar el número de WhatsApp:', phone);
        showErrorModal('El número de WhatsApp no es válido.');
        return;
    }

    // Codificar mensaje de forma segura
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${safePhone}?text=${encodedMessage}`;
    
    // Abrir de forma segura
    window.appSecurity.openExternalLink(whatsappUrl);
    
    // Log de seguridad
    window.appSecurity.logSecurityEvent('whatsapp_opened', {
        phone: safePhone,
        messageLength: message.length,
        source: 'contact_form'
    });
}

// 🆕 FUNCIÓN DE RESPALDO PARA WHATSAPP
function openWhatsAppFallback(phone, message = '') {
    try {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('❌ Error abriendo WhatsApp:', error);
        showErrorModal('Error al abrir WhatsApp. Por favor, intenta manualmente.');
    }
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR MODAL DE ÉXITO
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    modal.classList.add('show');
    
    // 🆕 CERRAR AUTOMÁTICAMENTE DESPUÉS DE 5 SEGUNDOS
    setTimeout(() => {
        closeModal();
    }, 5000);
}

// 🆕 FUNCIÓN PARA MOSTRAR ERRORES
function showErrorModal(message) {
    // Crear modal de error si no existe
    let errorModal = document.getElementById('error-modal');
    
    if (!errorModal) {
        errorModal = document.createElement('div');
        errorModal.id = 'error-modal';
        errorModal.className = 'modal-1';
        errorModal.innerHTML = `
            <div class="modal-content">
                <h3 style="color: #dc3545;">❌ Error</h3>
                <p id="error-message">${message}</p>
                <button onclick="closeErrorModal()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(errorModal);
    }

    document.getElementById('error-message').textContent = message;
    errorModal.style.display = 'flex';
}

// 🆕 FUNCIÓN PARA CERRAR MODAL DE ERROR
function closeErrorModal() {
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
        errorModal.style.display = 'none';
    }
}

function closeModal() {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.classList.remove('show');
    }
}

// 🆕 FUNCIÓN MEJORADA PARA LIMPIAR FORMULARIO
function resetForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.reset();
    }
    
    // Limpiar sección de preguntas
    const questionsSection = document.getElementById('questions-section');
    if (questionsSection) {
        questionsSection.innerHTML = '';
        questionsSection.classList.remove('show');
    }
    
    // Ocultar prompt de preguntas
    const questionsPrompt = document.getElementById('questions-prompt');
    if (questionsPrompt) {
        questionsPrompt.style.display = 'none';
    }
    
    // 🆕 RESETEAR CONTADORES DE CARACTERES
    document.querySelectorAll('.char-counter').forEach(counter => {
        const span = counter.querySelector('span');
        if (span) {
            span.textContent = '0';
            span.style.color = '#666';
        }
    });
}

// 🆕 CONFIGURACIÓN DE EVENT LISTENERS MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal con tecla Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeErrorModal();
        }
    });

    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        const successModal = document.getElementById('success-modal');
        if (successModal && e.target === successModal) {
            closeModal();
        }
        
        const errorModal = document.getElementById('error-modal');
        if (errorModal && e.target === errorModal) {
            closeErrorModal();
        }
    });

    // 🆕 PREVENIR ENVÍO POR ENTER EN FORMULARIO
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }

    console.log('✅ Form.js seguro inicializado correctamente');
});

// 🆕 ESTILOS CSS PARA MEJORAR LA EXPERIENCIA
const formStyles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
}

.input-warning {
    animation: fadeIn 0.3s ease;
}

.char-counter {
    transition: color 0.3s ease;
}

.question-option {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
}

.question-option label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
}

.question-option input,
.question-option select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.question-option input:focus,
.question-option select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
`;

// 🆕 INYECTAR ESTILOS SI NO EXISTEN
if (!document.getElementById('form-security-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'form-security-styles';
    styleSheet.textContent = formStyles;
    document.head.appendChild(styleSheet);
}