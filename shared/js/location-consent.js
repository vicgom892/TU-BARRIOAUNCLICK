// location-consent.js - Sistema de Consentimiento de Ubicación con Indicadores de Distancia
// Versión: 2.1 - Corregido error de contexto

console.log('📍 Cargando sistema de consentimiento de ubicación con indicadores...');

// =============================================
// SISTEMA DE CONSENTIMIENTO DE UBICACIÓN MEJORADO
// =============================================

class LocationConsentManager {
    constructor() {
        this.isModalOpen = false;
        this.userLocation = null;
        this.modal = null;
        this.isInitialized = false;
        this.distanceUpdateInterval = null;
        
        // 🔧 CORRECCIÓN: Bind de métodos para mantener el contexto
        this.init = this.init.bind(this);
        this.createConsentModal = this.createConsentModal.bind(this);
        this.showConsentModal = this.showConsentModal.bind(this);
        this.requestLocation = this.requestLocation.bind(this);
        this.handleLocationSuccess = this.handleLocationSuccess.bind(this);
        this.handleLocationError = this.handleLocationError.bind(this);
    }

    init() {
        if (this.isInitialized) {
            console.log('⚠️ Sistema de ubicación ya inicializado');
            return;
        }

        console.log('📍 Inicializando sistema de ubicación con indicadores...');
        
        // Verificar dependencias
        if (typeof bootstrap === 'undefined') {
            console.error('❌ Bootstrap no está disponible');
            this.retryInit();
            return;
        }

        this.createConsentModal();
        this.bindEvents();
        this.checkExistingConsent();
        this.addDistanceStyles();
        this.isInitialized = true;
        
        console.log('✅ Sistema de ubicación con indicadores inicializado correctamente');
    }

    retryInit() {
        console.log('🔄 Reintentando inicialización en 1 segundo...');
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    createConsentModal() {
        console.log('🔄 Creando modal de consentimiento...');
        
        // Si el modal ya existe, no hacer nada
        if (document.getElementById('locationConsentModal')) {
            console.log('✅ Modal de ubicación ya existe');
            this.modal = new bootstrap.Modal(document.getElementById('locationConsentModal'));
            return;
        }

        const modalHTML = `
        <div class="modal fade" id="locationConsentModal" tabindex="-1" aria-labelledby="locationConsentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <div class="location-modal-icon">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="location-modal-pulse"></div>
                        </div>
                        <h5 class="modal-title ms-3" id="locationConsentModalLabel">Activar Ubicación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-0">
                        <p class="mb-3">Para mostrarte los negocios más cercanos y calcular distancias exactas, necesitamos acceder a tu ubicación.</p>
                        
                        <div class="consent-benefits">
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <span class="small">Ver distancias exactas a cada comercio</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <span class="small">Descubrir negocios cercanos a tu posición</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <span class="small">Rutas optimizadas hacia los locales</span>
                            </div>
                        </div>

                        <div class="privacy-notice mt-4 p-3 bg-light rounded">
                            <i class="fas fa-shield-alt text-muted me-2"></i>
                            <span class="small text-muted">
                                Tu ubicación es 100% privada. Solo se usa para calcular distancias y no se almacena en nuestros servidores.
                            </span>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" id="denyLocationBtn">
                            <i class="fas fa-times me-2"></i>No permitir
                        </button>
                        <button type="button" class="btn btn-primary" id="allowLocationBtn">
                            <i class="fas fa-check me-2"></i>Permitir ubicación
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = new bootstrap.Modal(document.getElementById('locationConsentModal'));
        this.addModalStyles();
        
        console.log('✅ Modal de ubicación creado exitosamente');
    }

    addModalStyles() {
        if (document.querySelector('#locationConsentStyles')) {
            return;
        }

        const styles = `
        <style id="locationConsentStyles">
            .location-modal-icon {
                position: relative;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .location-modal-icon i {
                font-size: 1.5rem;
                color: #007bff;
                z-index: 2;
                position: relative;
            }
            .location-modal-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                background: #007bff;
                border-radius: 50%;
                opacity: 0.2;
                animation: modalPulse 2s infinite;
            }
            @keyframes modalPulse {
                0% { transform: scale(0.8); opacity: 0.2; }
                50% { transform: scale(1.1); opacity: 0.1; }
                100% { transform: scale(0.8); opacity: 0.2; }
            }
            .consent-benefits {
                background: rgba(0, 123, 255, 0.05);
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #007bff;
            }
            .privacy-notice {
                border-left: 3px solid #28a745;
            }
            #allowLocationBtn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    addDistanceStyles() {
        const styles = `
        <style id="locationDistanceStyles">
            /* Indicadores de distancia */
            .distance-indicator {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: rgba(59, 130, 246, 0.1);
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                color: #1e40af;
                border: 1px solid rgba(59, 130, 246, 0.2);
            }

            .distance-walking {
                background: rgba(34, 197, 94, 0.1);
                color: #166534;
                border-color: rgba(34, 197, 94, 0.2);
            }

            .distance-near {
                background: rgba(34, 197, 94, 0.1);
                color: #166534;
            }

            .distance-medium {
                background: rgba(245, 158, 11, 0.1);
                color: #92400e;
            }

            .distance-far {
                background: rgba(239, 68, 68, 0.1);
                color: #991b1b;
            }

            .walking-icon {
                animation: walk 1s ease-in-out infinite;
            }

            @keyframes walk {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(2px) rotate(-5deg); }
                75% { transform: translateX(-2px) rotate(5deg); }
            }

            /* Badge de distancia en tarjetas */
            .distance-badge {
                position: absolute;
                top: 110%;
                left: 2px;
                z-index: 10;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 4px 8px;
                font-size: 0.7rem;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                border: 1px solid rgba(255, 255, 255, 0.8);
            }

            /* Indicador en el modal */
            .modal-distance {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                font-size: 0.85rem;
            }

            /* Sección de ubicación activa */
            .location-active-section {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
                border: 1px solid #bae6fd;
            }

            .location-active-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .location-active-header i {
                color: #059669;
                font-size: 1.2rem;
            }

            .distance-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin-top: 12px;
            }

            .distance-stat {
                text-align: center;
                padding: 8px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .distance-stat-value {
                font-weight: bold;
                font-size: 1.1rem;
                color: #1e40af;
            }

            .distance-stat-label {
                font-size: 0.7rem;
                color: #64748b;
                margin-top: 2px;
            }
        </style>
        `;

        if (!document.querySelector('#locationDistanceStyles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    bindEvents() {
        console.log('🔗 Vinculando eventos...');
        
        // Botón principal de activar ubicación
        this.setupActivateButton();
        
        // Botones del modal
        this.setupModalButtons();
        
        // Eventos del modal
        this.setupModalEvents();
    }

    setupActivateButton() {
        const setupButton = () => {
            const activateBtn = document.getElementById('activateLocationBtn');
            if (activateBtn) {
                console.log('✅ Botón de ubicación encontrado');
                
                // Remover event listeners existentes
                activateBtn.replaceWith(activateBtn.cloneNode(true));
                
                // Volver a obtener el botón
                const newBtn = document.getElementById('activateLocationBtn');
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 Botón de ubicación clickeado');
                    this.showConsentModal();
                });
                
                return true;
            }
            return false;
        };

        // Intentar configurar inmediatamente
        if (!setupButton()) {
            // Reintentar después de un tiempo
            console.log('⏳ Botón no encontrado, reintentando...');
            setTimeout(() => {
                if (!setupButton()) {
                    console.error('❌ No se pudo encontrar el botón activateLocationBtn');
                }
            }, 2000);
        }
    }

    setupModalButtons() {
        // Botón Permitir
        document.addEventListener('click', (e) => {
            if (e.target.id === 'allowLocationBtn') {
                console.log('✅ Usuario permitió ubicación');
                this.requestLocation();
            } else if (e.target.id === 'denyLocationBtn') {
                console.log('❌ Usuario denegó ubicación');
                this.handleLocationDenied();
            }
        });
    }

    setupModalEvents() {
        const modalElement = document.getElementById('locationConsentModal');
        if (modalElement) {
            modalElement.addEventListener('show.bs.modal', () => {
                this.isModalOpen = true;
                console.log('🔄 Modal de ubicación mostrándose');
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                this.isModalOpen = false;
                console.log('🔒 Modal de ubicación cerrado');
            });
        }
    }

    showConsentModal() {
        console.log('🔄 Mostrando modal de consentimiento...');
        
        if (!this.modal) {
            console.log('🔄 Modal no inicializado, creando...');
            this.createConsentModal();
        }

        if (this.isModalOpen) {
            console.log('⚠️ Modal ya está abierto');
            return;
        }

        try {
            this.modal.show();
            console.log('✅ Modal de ubicación mostrado correctamente');
        } catch (error) {
            console.error('❌ Error al mostrar modal:', error);
            this.showFallbackConsent();
        }
    }

    showFallbackConsent() {
        const userConsent = confirm(
            '¿Permites que esta aplicación acceda a tu ubicación para mostrarte negocios cercanos?\n\n' +
            'Tu ubicación es 100% privada y solo se usa para calcular distancias.'
        );

        if (userConsent) {
            this.requestLocation();
        } else {
            this.handleLocationDenied();
        }
    }

    hideConsentModal() {
        if (this.modal) {
            this.modal.hide();
        }
    }

    async requestLocation() {
        console.log('📍 Solicitando ubicación...');
        this.showLoadingState();

        try {
            const position = await this.getCurrentPosition();
            this.handleLocationSuccess(position);
        } catch (error) {
            this.handleLocationError(error);
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 600000
            });
        });
    }

    handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        this.userLocation = { latitude, longitude };
        
        console.log('✅ Ubicación obtenida:', this.userLocation);
        
        // Guardar en localStorage
        localStorage.setItem('locationConsent', 'granted');
        localStorage.setItem('lastKnownLocation', JSON.stringify(this.userLocation));
        
        this.hideConsentModal();
        this.showSuccessNotification();
        this.updateUIWithLocation();
        this.calculateBusinessDistances();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('locationUpdated', {
            detail: this.userLocation
        }));
    }

    handleLocationError(error) {
        console.error('❌ Error de ubicación:', error);
        
        let errorMessage = 'No se pudo obtener tu ubicación. ';
        switch(error.code) {
            case 1:
                errorMessage += 'Has denegado el permiso de ubicación.';
                localStorage.setItem('locationConsent', 'denied');
                break;
            case 2:
                errorMessage += 'La información de ubicación no está disponible.';
                break;
            case 3:
                errorMessage += 'La solicitud de ubicación ha expirado.';
                break;
            default:
                errorMessage += 'Ha ocurrido un error desconocido.';
        }
        
        this.showErrorNotification(errorMessage);
        this.hideConsentModal();
    }

    handleLocationDenied() {
        console.log('🚫 Usuario denegó la ubicación');
        localStorage.setItem('locationConsent', 'denied');
        this.hideConsentModal();
        this.showDeniedNotification();
    }

    showLoadingState() {
        const allowBtn = document.getElementById('allowLocationBtn');
        if (!allowBtn) return;
        
        const originalText = allowBtn.innerHTML;
        allowBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Buscando...';
        allowBtn.disabled = true;

        // Restaurar después de 10 segundos
        setTimeout(() => {
            allowBtn.innerHTML = originalText;
            allowBtn.disabled = false;
        }, 10000);
    }

    showSuccessNotification() {
        this.showNotification('¡Ubicación activada!', 'Ahora puedes ver los negocios más cercanos a ti.', 'success');
    }

    showErrorNotification(message) {
        this.showNotification('Error de ubicación', message, 'error');
    }

    showDeniedNotification() {
        this.showNotification(
            'Ubicación no activada', 
            'Puedes activarla más tarde desde este mismo botón si cambias de opinión.', 
            'warning'
        );
    }

    showNotification(title, message, type = 'info') {
        // Intentar usar sistema existente de notificaciones
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback: crear toast básico
        try {
            const toastId = 'toast-' + Date.now();
            const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'warning'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${title}</strong><br>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
            `;

            const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
            toastContainer.insertAdjacentHTML('beforeend', toastHTML);
            
            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
            toast.show();

            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        } catch (error) {
            console.error('Error mostrando notificación:', error);
            // Último recurso
            alert(`${title}: ${message}`);
        }
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    updateUIWithLocation() {
        const activateBtn = document.getElementById('activateLocationBtn');
        if (!activateBtn) return;
        
        activateBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Ubicación Activada';
        activateBtn.classList.remove('btn-primary');
        activateBtn.classList.add('btn-success');
        activateBtn.disabled = true;
        
        // Ocultar el texto anterior si existe
        const existingText = activateBtn.parentNode.querySelector('.location-active-text');
        if (existingText) {
            existingText.remove();
        }
    }

    calculateBusinessDistances() {
        if (!this.userLocation) return;
        
        console.log('📏 Calculando distancias a negocios...');
        
        // Integrar con el sistema existente de negocios
        if (window.businesses && Array.isArray(window.businesses)) {
            let nearbyCount = 0;
            let totalDistance = 0;
            
            window.businesses.forEach(business => {
                if (business.latitude && business.longitude) {
                    business.distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        business.latitude,
                        business.longitude
                    );
                    
                    if (business.distance <= 5) { // Dentro de 5km
                        nearbyCount++;
                        totalDistance += business.distance;
                    }
                }
            });
            
            // Ordenar por distancia
            window.businesses.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            
            // Actualizar indicadores de distancia
            this.updateDistanceIndicators();
            
            // Iniciar actualización periódica
            this.startDistanceUpdates();
            
            console.log(`✅ ${nearbyCount} negocios cercanos encontrados, distancia promedio: ${(totalDistance/nearbyCount || 0).toFixed(1)}km`);
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
    }

    updateDistanceIndicators() {
        if (!this.userLocation) return;

        console.log('🔄 Actualizando indicadores de distancia...');

        // 1. Actualizar tarjetas de negocios
        this.updateBusinessCardsDistance();

        // 2. Actualizar modal de negocio si está abierto
        this.updateModalDistance();

        // 3. Actualizar lista de negocios en el mapa
        this.updateBusinessListDistance();

        // 4. Actualizar sección de ubicación activa
        this.updateLocationActiveSection();
    }

    updateBusinessCardsDistance() {
        const businessCards = document.querySelectorAll('.business-card');
        
        businessCards.forEach(card => {
            const img = card.querySelector('.clickable-image');
            if (!img) return;

            try {
                const negocio = JSON.parse(img.dataset.business);
                if (negocio.latitud && negocio.longitud) {
                    const distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        negocio.latitud,
                        negocio.longitud
                    );

                    // Remover badge anterior si existe
                    const existingBadge = card.querySelector('.distance-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }

                    // Crear nuevo badge de distancia
                    const distanceBadge = document.createElement('div');
                    distanceBadge.className = `distance-badge ${this.getDistanceClass(distance)}`;
                    distanceBadge.innerHTML = this.getDistanceIcon(distance);
                    
                    card.querySelector('.position-relative').appendChild(distanceBadge);
                }
            } catch (error) {
                console.warn('Error actualizando distancia en tarjeta:', error);
            }
        });
    }

    updateModalDistance() {
        const modal = document.getElementById('businessModal');
        if (!modal || !modal.classList.contains('show')) return;

        const modalImage = document.getElementById('modalImage');
        if (!modalImage) return;

        try {
            const negocio = JSON.parse(modalImage.dataset.business || '{}');
            if (negocio.latitud && negocio.longitud) {
                const distance = this.calculateDistance(
                    this.userLocation.latitude,
                    this.userLocation.longitude,
                    negocio.latitud,
                    negocio.longitud
                );

                // Actualizar o crear indicador de distancia en el modal
                let distanceElement = document.getElementById('modalDistance');
                if (!distanceElement) {
                    distanceElement = document.createElement('div');
                    distanceElement.id = 'modalDistance';
                    distanceElement.className = 'modal-distance';
                    
                    // Insertar después del horario
                    const hoursElement = document.getElementById('modalHours');
                    if (hoursElement && hoursElement.parentNode) {
                        hoursElement.parentNode.insertBefore(distanceElement, hoursElement.nextSibling);
                    }
                }

                distanceElement.innerHTML = `
                    <i class="fas fa-walking walking-icon ${this.getDistanceClass(distance)}"></i>
                    <span class="${this.getDistanceClass(distance)}">A ${this.formatDistance(distance)} de tu ubicación</span>
                    <small class="text-muted">(${this.getWalkingTime(distance)})</small>
                `;
            }
        } catch (error) {
            console.warn('Error actualizando distancia en modal:', error);
        }
    }

    updateBusinessListDistance() {
        // Implementar según sea necesario
    }

    updateLocationActiveSection() {
        let locationSection = document.getElementById('locationActiveSection');
        
        if (!locationSection) {
            // Crear sección de ubicación activa si no existe
            const activateBtn = document.getElementById('activateLocationBtn');
            if (activateBtn && activateBtn.parentNode) {
                locationSection = document.createElement('div');
                locationSection.id = 'locationActiveSection';
                locationSection.className = 'location-active-section';
                activateBtn.parentNode.insertBefore(locationSection, activateBtn.nextSibling);
            } else {
                return;
            }
        }

        // Calcular estadísticas
        const stats = this.calculateLocationStats();
        
        locationSection.innerHTML = `
            <div class="location-active-header">
                <i class="fas fa-check-circle"></i>
                <h6 class="mb-0">Ubicación Activada</h6>
            </div>
            <p class="mb-2 small">Viendo negocios ordenados por distancia desde tu ubicación actual.</p>
            
            <div class="distance-stats">
                <div class="distance-stat">
                    <div class="distance-stat-value">${stats.nearbyCount}</div>
                    <div class="distance-stat-label">Cercanos</div>
                </div>
                <div class="distance-stat">
                    <div class="distance-stat-value">${stats.closestDistance}</div>
                    <div class="distance-stat-label">Más cercano</div>
                </div>
                <div class="distance-stat">
                    <div class="distance-stat-value">${stats.avgDistance}</div>
                    <div class="distance-stat-label">Distancia avg</div>
                </div>
            </div>
        `;
    }

    calculateLocationStats() {
        if (!window.businesses || !this.userLocation) {
            return { nearbyCount: 0, closestDistance: '0 km', avgDistance: '0 km' };
        }

        const nearbyBusinesses = window.businesses.filter(b => 
            b.latitude && b.longitude && b.distance <= 5
        );

        const closest = nearbyBusinesses[0];
        const totalDistance = nearbyBusinesses.reduce((sum, b) => sum + b.distance, 0);
        const avgDistance = nearbyBusinesses.length > 0 ? totalDistance / nearbyBusinesses.length : 0;

        return {
            nearbyCount: nearbyBusinesses.length,
            closestDistance: closest ? this.formatDistance(closest.distance) : '0 km',
            avgDistance: this.formatDistance(avgDistance)
        };
    }

    getDistanceClass(distance) {
        if (distance < 1) return 'distance-near';
        if (distance < 3) return 'distance-medium';
        return 'distance-far';
    }

    getDistanceIcon(distance) {
        if (distance < 0.5) {
            return '<i class="fas fa-walking walking-icon"></i> ' + this.formatDistance(distance);
        } else if (distance < 1) {
            return '<i class="fas fa-walking"></i> ' + this.formatDistance(distance);
        } else if (distance < 2) {
            return '<i class="fas fa-map-marker-alt"></i> ' + this.formatDistance(distance);
        } else {
            return '<i class="fas fa-car"></i> ' + this.formatDistance(distance);
        }
    }

    formatDistance(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        }
        return `${km.toFixed(1)} km`;
    }

    getWalkingTime(distance) {
        const walkingSpeed = 5; // km/h
        const minutes = Math.round((distance / walkingSpeed) * 60);
        
        if (minutes < 1) return '1 min caminando';
        if (minutes < 60) return `${minutes} min caminando`;
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min caminando`;
    }

    startDistanceUpdates() {
        // Actualizar cada 30 segundos
        this.stopDistanceUpdates();
        
        this.distanceUpdateInterval = setInterval(() => {
            if (this.userLocation) {
                this.updateDistanceIndicators();
            }
        }, 30000);
    }

    stopDistanceUpdates() {
        if (this.distanceUpdateInterval) {
            clearInterval(this.distanceUpdateInterval);
            this.distanceUpdateInterval = null;
        }
    }

    checkExistingConsent() {
        const hasConsent = localStorage.getItem('locationConsent') === 'granted';
        if (hasConsent) {
            console.log('🔄 Consentimiento previo encontrado');
        }
    }

    cleanupDistanceIndicators() {
        this.stopDistanceUpdates();
        
        // Remover badges de distancia
        document.querySelectorAll('.distance-badge').forEach(badge => {
            badge.remove();
        });
        
        // Remover sección de ubicación activa
        const locationSection = document.getElementById('locationActiveSection');
        if (locationSection) {
            locationSection.remove();
        }
        
        // Remover indicador del modal
        const modalDistance = document.getElementById('modalDistance');
        if (modalDistance) {
            modalDistance.remove();
        }
    }
}

// =============================================
// FUNCIONES GLOBALES MEJORADAS
// =============================================

window.calcularDistancia = function(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
};

window.obtenerUbicacionUsuario = function() {
    const ubicacionGuardada = localStorage.getItem('lastKnownLocation');
    return ubicacionGuardada ? JSON.parse(ubicacionGuardada) : null;
};

window.ubicacionEstaActiva = function() {
    return localStorage.getItem('locationConsent') === 'granted';
};

window.formatearDistancia = function(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
};

// =============================================
// INICIALIZACIÓN
// =============================================

// Inicializar cuando el DOM esté listo
function initializeLocationSystem() {
    console.log('🚀 Iniciando sistema de ubicación con indicadores...');
    
    if (typeof bootstrap === 'undefined') {
        console.log('⏳ Esperando Bootstrap...');
        setTimeout(initializeLocationSystem, 500);
        return;
    }
    
    window.locationManager = new LocationConsentManager();
    window.locationManager.init();
    
    console.log('🎉 Sistema de ubicación con indicadores listo');
}

// Función global para activar ubicación
window.activarUbicacion = function() {
    if (window.locationManager) {
        window.locationManager.showConsentModal();
    } else {
        console.error('Sistema de ubicación no disponible');
        // Reintentar inicialización
        initializeLocationSystem();
        setTimeout(() => {
            if (window.locationManager) {
                window.locationManager.showConsentModal();
            }
        }, 1000);
    }
};

// Inicialización automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLocationSystem);
} else {
    initializeLocationSystem();
}

console.log('✅ location-consent.js con indicadores cargado correctamente');