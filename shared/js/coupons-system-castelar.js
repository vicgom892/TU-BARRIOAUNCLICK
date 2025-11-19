// coupons-system.js - SISTEMA MULTILOCALIDAD COMPLETO
class CouponsSystem {
    constructor() {
        console.log('🎪 Inicializando Sistema de Cupones Multilocalidad...');
        this.couponsData = [];
        this.currentLocalidad = this.detectLocalidad();
        this.localidadesConfig = this.getLocalidadesConfig();
        console.log(`📍 Localidad detectada: ${this.currentLocalidad}`);
        this.init();
    }

    // CONFIGURACIÓN COMPLETA DE LOCALIDADES
    getLocalidadesConfig() {
        return {
            'castelar': {
                displayName: 'Castelar',
                filePath: './data/cupones/castelar-cupones.json',
                color: '#FF6B6B',
                icon: '🏠'
            },
            'moron': {
                displayName: 'Morón',
                filePath: './data/cupones/moron-cupones.json', 
                color: '#4ECDC4',
                icon: '🏙️'
            },
            'ituzaingo': {
                displayName: 'Ituzaingó',
                filePath: './data/cupones/ituzaingo-cupones.json',
                color: '#45B7D1',
                icon: '🌳'
            },
            'merlo': {
                displayName: 'Merlo',
                filePath: './data/cupones/merlo-cupones.json',
                color: '#96CEB4',
                icon: '🚂'
            },
            'padua': {
                displayName: 'Padua',
                filePath: './data/cupones/padua-cupones.json',
                color: '#FFEAA7',
                icon: '🏘️'
            }
        };
    }

    // MÉTODO MEJORADO: Detectar localidad automáticamente
    detectLocalidad() {
        const path = window.location.pathname;
        const hostname = window.location.hostname;
        
        console.log('🔍 Detectando localidad...');
        console.log('📁 Path:', path);
        console.log('🌐 Hostname:', hostname);

        // Estrategia 1: De la URL path
        const pathLocalidades = ['castelar', 'moron', 'ituzaingo', 'merlo', 'padua'];
        for (const localidad of pathLocalidades) {
            if (path.includes(`/${localidad}/`) || path.includes(`/${localidad}`)) {
                console.log(`📍 Localidad detectada por PATH: ${localidad}`);
                return localidad;
            }
        }

        // Estrategia 2: Del subdominio
        for (const localidad of pathLocalidades) {
            if (hostname.includes(`${localidad}.`)) {
                console.log(`📍 Localidad detectada por SUBDOMINIO: ${localidad}`);
                return localidad;
            }
        }

        // Estrategia 3: Del contexto de la app
        if (window.APP_CONTEXT && pathLocalidades.includes(window.APP_CONTEXT)) {
            console.log(`📍 Localidad detectada por APP_CONTEXT: ${window.APP_CONTEXT}`);
            return window.APP_CONTEXT;
        }
        
        if (window.APP_CONFIG && window.APP_CONFIG.localidad && pathLocalidades.includes(window.APP_CONFIG.localidad)) {
            console.log(`📍 Localidad detectada por APP_CONFIG: ${window.APP_CONFIG.localidad}`);
            return window.APP_CONFIG.localidad;
        }

        // Estrategia 4: Del contenido de la página
        const title = document.title.toLowerCase();
        const h1 = document.querySelector('h1')?.textContent.toLowerCase() || '';
        const pageContent = title + ' ' + h1;
        
        for (const localidad of pathLocalidades) {
            if (pageContent.includes(localidad)) {
                console.log(`📍 Localidad detectada por CONTENIDO: ${localidad}`);
                return localidad;
            }
        }

        // Estrategia 5: Del body class o data attributes
        const bodyClass = document.body.className.toLowerCase();
        for (const localidad of pathLocalidades) {
            if (bodyClass.includes(localidad)) {
                console.log(`📍 Localidad detectada por BODY CLASS: ${localidad}`);
                return localidad;
            }
        }

        // Estrategia 6: Default seguro - intentar deducir del path base
        const pathParts = path.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0 && pathLocalidades.includes(pathParts[0])) {
            console.log(`📍 Localidad detectada por PATH PARTS: ${pathParts[0]}`);
            return pathParts[0];
        }

        console.warn('⚠️ No se pudo detectar la localidad, usando "castelar" por defecto');
        return 'castelar';
    }

    // MÉTODO: Obtener configuración de la localidad actual
    getCurrentLocalidadConfig() {
        const config = this.localidadesConfig[this.currentLocalidad];
        if (!config) {
            console.warn(`⚠️ Configuración no encontrada para ${this.currentLocalidad}, usando Castelar`);
            return this.localidadesConfig.castelar;
        }
        return config;
    }

    // MÉTODO: Obtener ruta del archivo según localidad
    getCouponsFilePath() {
        const config = this.getCurrentLocalidadConfig();
        console.log(`📁 Ruta de cupones para ${this.currentLocalidad}: ${config.filePath}`);
        return config.filePath;
    }

    // MÉTODO: Obtener nombre display de la localidad
    getLocalidadDisplayName() {
        const config = this.getCurrentLocalidadConfig();
        return config.displayName;
    }

    // MÉTODO: Obtener color de la localidad
    getLocalidadColor() {
        const config = this.getCurrentLocalidadConfig();
        return config.color;
    }

    // MÉTODO: Obtener icono de la localidad
    getLocalidadIcon() {
        const config = this.getCurrentLocalidadConfig();
        return config.icon;
    }

    async init() {
        await this.loadCouponsData();
        this.waitForBusinessCards();
    }

    async loadCouponsData() {
        try {
            const filePath = this.getCouponsFilePath();
            const localidadName = this.getLocalidadDisplayName();
            const localidadIcon = this.getLocalidadIcon();
            
            console.log(`📥 Cargando cupones para ${localidadIcon} ${localidadName}...`);
            console.log(`📁 Desde: ${filePath}`);
            
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - No se pudo cargar ${filePath}`);
            }
            
            const data = await response.json();
            console.log(`📊 Datos crudos para ${localidadName}:`, data);
            
            // Convertir a array plano
            this.couponsData = this.flattenCoupons(data);
            console.log(`✅ ${this.couponsData.length} cupones cargados para ${localidadIcon} ${localidadName}`);
            
        } catch (error) {
            console.error(`❌ Error cargando cupones para ${this.currentLocalidad}:`, error);
            this.showLocalidadError();
            this.couponsData = [];
        }
    }

    // MÉTODO: Mostrar error específico por localidad
    showLocalidadError() {
        const localidadName = this.getLocalidadDisplayName();
        const localidadIcon = this.getLocalidadIcon();
        const localidadColor = this.getLocalidadColor();
        
        const errorHTML = `
            <div class="alert alert-warning mt-4" role="alert" style="border-left: 4px solid ${localidadColor}">
                <h4 class="alert-heading">${localidadIcon} Cupones no disponibles</h4>
                <p>Actualmente no hay cupones disponibles para <strong>${localidadName}</strong>.</p>
                <hr>
                <p class="mb-0">Los cupones estarán disponibles próximamente. Mientras tanto, puedes explorar los comercios locales.</p>
            </div>
        `;
        
        const couponsSection = document.getElementById('cupones-section') || this.createCouponsSection();
        const container = document.getElementById('cupones-container');
        if (container) {
            container.innerHTML = errorHTML;
        }
    }

    flattenCoupons(data) {
        const allCoupons = [];
        for (const [category, coupons] of Object.entries(data)) {
            if (Array.isArray(coupons)) {
                coupons.forEach(coupon => {
                    coupon.id = coupon.id || `${category}_${Math.random().toString(36).substr(2, 9)}`;
                    coupon.category = category;
                    coupon.localidad = this.currentLocalidad;
                    coupon.localidadIcon = this.getLocalidadIcon();
                    coupon.localidadColor = this.getLocalidadColor();
                    allCoupons.push(coupon);
                });
            }
        }
        return allCoupons;
    }

    waitForBusinessCards() {
        console.log('⏳ Esperando tarjetas de negocios...');
        
        const maxAttempts = 10;
        let attempts = 0;
        
        const tryInject = () => {
            attempts++;
            const cards = this.findBusinessCards();
            
            console.log(`🔍 Intento ${attempts}: ${cards.length} tarjetas encontradas`);
            
            if (cards.length > 0) {
                console.log('🎯 Tarjetas encontradas, inyectando cupones...');
                this.injectAllCoupons(cards);
            } else if (attempts < maxAttempts) {
                setTimeout(tryInject, 1000);
            } else {
                console.warn('⚠️ No se encontraron tarjetas después de', maxAttempts, 'intentos');
            }
        };
        
        tryInject();
    }

    findBusinessCards() {
        const selectors = [
            '.business-card',
            '.card-business',
            '.card',
            '.business-item',
            '[data-category]',
            '.col-md-4', '.col-md-6',
            '.cards-container .card',
            '.negocio-card',
            '.comercio-card'
        ];
        
        let allCards = [];
        selectors.forEach(selector => {
            const cards = document.querySelectorAll(selector);
            if (cards.length > 0) {
                console.log(`📍 Selector "${selector}": ${cards.length} elementos`);
                allCards = [...allCards, ...cards];
            }
        });
        
        return [...new Set(allCards)];
    }

    injectAllCoupons(cards) {
        console.log(`🃏 Procesando ${cards.length} tarjetas...`);
        
        let injectedCount = 0;
        
        cards.forEach(card => {
            const businessName = this.extractBusinessName(card);
            if (businessName) {
                const hasCoupon = this.injectCouponToCard(card, businessName);
                if (hasCoupon) injectedCount++;
            }
        });
        
        console.log(`✅ ${injectedCount}/${cards.length} tarjetas con cupones`);
        
        this.createCouponsSection();
    }

    extractBusinessName(card) {
        const strategies = [
            () => card.dataset.name || card.dataset.business || card.dataset.businessName,
            
            () => {
                const titleSelectors = ['.card-title', 'h4', 'h5', 'h6', 'strong', 'b'];
                for (const selector of titleSelectors) {
                    const element = card.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element.textContent.trim();
                    }
                }
                return null;
            },
            
            () => {
                const cardBody = card.querySelector('.card-body');
                if (cardBody) {
                    const firstText = cardBody.querySelector('h1, h2, h3, h4, h5, h6, strong, b');
                    return firstText ? firstText.textContent.trim() : null;
                }
                return null;
            }
        ];
        
        for (const strategy of strategies) {
            const name = strategy();
            if (name && name.length > 2) {
                console.log(`🏪 Nombre encontrado: "${name}"`);
                return name;
            }
        }
        
        console.log('❌ No se pudo extraer nombre de:', card);
        return null;
    }

    injectCouponToCard(card, businessName) {
        const coupons = this.findCouponsForBusiness(businessName);
        
        if (coupons.length === 0) {
            return false;
        }
        
        console.log(`🎫 ${coupons.length} cupones para "${businessName}"`);
        
        const badge = this.createCouponBadge(coupons.length, businessName);
        const container = card.querySelector('.card-body') || card.querySelector('.card-img-overlay') || card;
        
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        if (!container.querySelector('.coupon-badge')) {
            container.appendChild(badge);
            return true;
        }
        
        return false;
    }

    findCouponsForBusiness(businessName) {
        if (!businessName) return [];
        
        return this.couponsData.filter(coupon => {
            const couponBusiness = coupon.nombreNegocio || coupon.business;
            if (!couponBusiness) return false;
            
            const name1 = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const name2 = couponBusiness.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            return name1.includes(name2) || name2.includes(name1);
        });
    }

    createCouponBadge(count, businessName) {
        const localidadColor = this.getLocalidadColor();
        const localidadIcon = this.getLocalidadIcon();
        
        const badge = document.createElement('div');
        badge.className = 'coupon-badge';
        badge.innerHTML = `${localidadIcon} ${count}`;
        badge.title = `${count} cupón(es) en ${businessName} - ${this.getLocalidadDisplayName()}`;
        
        badge.style.cssText = `
            position: absolute;
            top: 20px;
            right: 2px;
            background: linear-gradient(135deg, ${localidadColor}, #ee5a52);
            color: white;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            animation: pulse 2s infinite;
            font-family: system-ui, sans-serif;
        `;
        
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showBusinessCoupons(businessName);
        });
        
        return badge;
    }

    createCouponsSection() {
        if (document.getElementById('cupones-section')) {
            this.updateCouponsSectionEvents();
            return document.getElementById('cupones-section');
        }
        
        const localidadName = this.getLocalidadDisplayName();
        const localidadIcon = this.getLocalidadIcon();
        const localidadColor = this.getLocalidadColor();
        
        const sectionHTML = `
            <section id="cupones-section" class="my-5 py-5 bg-light">
                <div class="container">
                    <div class="row">
                        <div class="col-12 text-center mb-5">
                            <h2 class="display-5 fw-bold" style="color: ${localidadColor}">
                                ${localidadIcon} Cupones de ${localidadName}
                            </h2>
                            <p class="lead text-muted">
                                Ofertas exclusivas en comercios de ${localidadName}
                            </p>
                            <div class="badge text-white fs-6" style="background: ${localidadColor}">
                                ${localidadIcon} Localidad: ${localidadName}
                            </div>
                        </div>
                    </div>
                    <div class="row" id="cupones-container">
                        ${this.couponsData.length > 0 ? this.couponsData.map(coupon => `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100 shadow-sm border-0 coupon-card" data-coupon-id="${coupon.id}">
                                    <div class="card-header bg-white border-0 pb-0">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="badge text-white fs-6" style="background: ${coupon.localidadColor || localidadColor}">
                                                ${coupon.descuento || coupon.title}
                                            </span>
                                            <span class="badge bg-warning">${coupon.localidadIcon || localidadIcon}</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title text-dark">${coupon.titulo || coupon.title}</h5>
                                        <p class="card-text text-muted mb-2">
                                            <i class="fas fa-store me-1"></i>
                                            <strong>${coupon.nombreNegocio || coupon.business}</strong>
                                        </p>
                                        <p class="card-text text-secondary small">${coupon.descripcion || coupon.description}</p>
                                        
                                        <div class="coupon-meta mt-3">
                                            <div class="d-flex justify-content-between align-items-center small text-muted">
                                                <span><i class="fas fa-calendar me-1"></i> ${coupon.validoHasta || coupon.validUntil}</span>
                                                <span><i class="fas fa-user me-1"></i> ${coupon.usos || '1 uso'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-footer bg-white border-0 pt-0">
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-primary view-coupon-btn" data-coupon-id="${coupon.id}">
                                                👀 Ver Cupón
                                            </button>
                                            <button class="btn btn-outline-success claim-coupon-btn" data-coupon-id="${coupon.id}">
                                                🎟️ Reclamar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="col-12 text-center py-5">
                                <i class="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
                                <h4 class="text-muted">No hay cupones disponibles en ${localidadName}</h4>
                                <p class="text-muted">Vuelve a consultar más tarde</p>
                            </div>
                        `}
                    </div>
                </div>
            </section>
        `;
        
        const footer = document.querySelector('footer');
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', sectionHTML);
        }
        
        setTimeout(() => {
            this.updateCouponsSectionEvents();
        }, 100);
        
        return document.getElementById('cupones-section');
    }

    // ... (los demás métodos se mantienen igual, pero usan las nuevas configuraciones de localidad)

    showBusinessCoupons(businessName) {
        const coupons = this.findCouponsForBusiness(businessName);
        const localidadColor = this.getLocalidadColor();
        const localidadIcon = this.getLocalidadIcon();
        
        if (coupons.length === 0) return;
        
        const modalHTML = `
            <div class="modal fade" id="businessCouponsModal" tabindex="-1" aria-labelledby="businessCouponsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header text-white" style="background: ${localidadColor}">
                            <h5 class="modal-title" id="businessCouponsModalLabel">
                                ${localidadIcon} Cupones de ${businessName}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                ${coupons.map(coupon => `
                                    <div class="col-md-6 mb-3">
                                        <div class="card h-100 border-warning">
                                            <div class="card-header text-white d-flex justify-content-between align-items-center" style="background: ${coupon.localidadColor || localidadColor}">
                                                <strong>${coupon.descuento || coupon.title}</strong>
                                                <span class="badge bg-success">ACTIVO</span>
                                            </div>
                                            <div class="card-body">
                                                <h6 class="card-title">${coupon.titulo || coupon.title}</h6>
                                                <p class="card-text small">${coupon.descripcion || coupon.description}</p>
                                                
                                                <div class="coupon-details mt-3">
                                                    <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
                                                        <span><i class="fas fa-calendar"></i> ${coupon.validoHasta || coupon.validUntil}</span>
                                                        <span><i class="fas fa-user"></i> ${coupon.usos || '1 uso'}</span>
                                                    </div>
                                                    
                                                    ${coupon.code ? `
                                                    <div class="coupon-code-section mt-3 p-3 bg-light rounded">
                                                        <label class="form-label small text-muted mb-1">Código del cupón:</label>
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <code class="fs-5 text-primary">${coupon.code}</code>
                                                            <button class="btn btn-sm btn-outline-primary copy-coupon-code" data-code="${coupon.code}">
                                                                📋 Copiar
                                                            </button>
                                                        </div>
                                                    </div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                            <div class="card-footer bg-transparent">
                                                <div class="d-grid gap-2">
                                                    <button class="btn btn-success btn-sm claim-coupon-btn" data-coupon-id="${coupon.id}">
                                                        🎟️ Reclamar Cupón
                                                    </button>
                                                    <button class="btn btn-outline-secondary btn-sm view-coupon-details" data-coupon-id="${coupon.id}">
                                                        📖 Ver Detalles
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn text-white" style="background: ${localidadColor}" onclick="window.couponsSystem.showAllCoupons()">
                                📜 Ver Todos los Cupones
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('businessCouponsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('businessCouponsModal'));
        modal.show();
        
        document.getElementById('businessCouponsModal').addEventListener('shown.bs.modal', () => {
            this.setupModalEvents();
        });
    }
setupModalEvents() {
        document.querySelectorAll('.copy-coupon-code').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.target.dataset.code;
                this.copyToClipboard(code);
            });
        });
        
        document.querySelectorAll('.claim-coupon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.dataset.couponId;
                this.claimCoupon(couponId);
                const modal = bootstrap.Modal.getInstance(document.getElementById('businessCouponsModal'));
                modal.hide();
            });
        });
        
        document.querySelectorAll('.view-coupon-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.dataset.couponId;
                this.showCouponDetails(couponId);
            });
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('✅ Código copiado al portapapeles', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('✅ Código copiado', 'success');
        });
    }

    showCouponDetails(couponId) {
        const coupon = this.couponsData.find(c => c.id === couponId);
        if (!coupon) return;
        
        const modalHTML = `
            <div class="modal fade" id="couponDetailsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">📖 Detalles del Cupón</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <div class="coupon-visual p-4 border rounded bg-light">
                                    <div class="h4 text-primary">${coupon.nombreNegocio || coupon.business}</div>
                                    <div class="h2 text-success my-3">${coupon.descuento || coupon.title}</div>
                                    <div class="h5">${coupon.titulo || coupon.title}</div>
                                </div>
                            </div>
                            
                            <div class="coupon-info">
                                <h6>Descripción</h6>
                                <p class="mb-3">${coupon.descripcion || coupon.description}</p>
                                
                                <div class="row">
                                    <div class="col-6">
                                        <strong><i class="fas fa-calendar"></i> Válido hasta:</strong>
                                        <br>${coupon.validoHasta || coupon.validUntil}
                                    </div>
                                    <div class="col-6">
                                        <strong><i class="fas fa-user"></i> Usos:</strong>
                                        <br>${coupon.usos || '1 uso por persona'}
                                    </div>
                                </div>
                                
                                ${coupon.code ? `
                                <div class="mt-3 p-3 bg-warning rounded">
                                    <strong>Código:</strong>
                                    <div class="h4 mt-1">${coupon.code}</div>
                                    <button class="btn btn-sm btn-primary mt-2 copy-coupon-code" data-code="${coupon.code}">
                                        📋 Copiar Código
                                    </button>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" onclick="window.couponsSystem.claimCoupon('${coupon.id}')">
                                🎟️ Reclamar Este Cupón
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('couponDetailsModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('couponDetailsModal'));
        modal.show();
    }

    showAllCoupons() {
        const currentModal = bootstrap.Modal.getInstance(document.getElementById('businessCouponsModal'));
        if (currentModal) currentModal.hide();
        
        this.createCouponsSection();
        
        const couponsSection = document.getElementById('cupones-section');
        if (couponsSection) {
            couponsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    claimCoupon(couponId) {
        const coupon = this.couponsData.find(c => c.id === couponId);
        if (!coupon) return;
        
        console.log('🎟️ Reclamando cupón:', coupon);
        this.showToast(`🎉 ¡Cupón reclamado! ${coupon.titulo || coupon.title}`, 'success');
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    updateCouponsSectionEvents() {
        document.querySelectorAll('.view-coupon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.dataset.couponId;
                this.showCouponDetailsModal(couponId);
            });
        });
        
        document.querySelectorAll('.claim-coupon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.dataset.couponId;
                this.claimCouponFromSection(couponId);
            });
        });
    }

    showCouponDetailsModal(couponId) {
        const coupon = this.couponsData.find(c => c.id === couponId);
        if (!coupon) return;
        
        const modalHTML = `
            <div class="modal fade" id="couponDetailsModal" tabindex="-1" aria-labelledby="couponDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient-primary text-white">
                            <h5 class="modal-title" id="couponDetailsModalLabel">
                                🎟️ Detalles del Cupón
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-5 text-center">
                                    <div class="coupon-visual p-4 border rounded bg-light h-100">
                                        <div class="coupon-business h4 text-primary mb-3">
                                            <i class="fas fa-store"></i><br>
                                            ${coupon.nombreNegocio || coupon.business}
                                        </div>
                                        <div class="coupon-discount h1 text-success my-4">
                                            ${coupon.descuento || coupon.title}
                                        </div>
                                        <div class="coupon-title h5 text-dark">
                                            ${coupon.titulo || coupon.title}
                                        </div>
                                        
                                        ${coupon.code ? `
                                        <div class="coupon-code-section mt-4 p-3 bg-warning rounded">
                                            <label class="form-label small text-dark mb-2">Código del cupón:</label>
                                            <div class="coupon-code-display">
                                                <code class="fs-4 fw-bold text-dark">${coupon.code}</code>
                                            </div>
                                            <button class="btn btn-sm btn-dark mt-2 w-100 copy-coupon-btn" data-code="${coupon.code}">
                                                📋 Copiar Código
                                            </button>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="col-md-7">
                                    <div class="coupon-details">
                                        <h6 class="text-primary mb-3">📖 Descripción</h6>
                                        <p class="mb-4">${coupon.descripcion || coupon.description}</p>
                                        
                                        <div class="details-grid">
                                            <div class="detail-item mb-3 p-3 bg-light rounded">
                                                <div class="d-flex align-items-center">
                                                    <i class="fas fa-calendar text-primary me-3 fs-5"></i>
                                                    <div>
                                                        <strong>Válido hasta</strong><br>
                                                        <span class="text-muted">${coupon.validoHasta || coupon.validUntil}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="detail-item mb-3 p-3 bg-light rounded">
                                                <div class="d-flex align-items-center">
                                                    <i class="fas fa-user text-primary me-3 fs-5"></i>
                                                    <div>
                                                        <strong>Usos permitidos</strong><br>
                                                        <span class="text-muted">${coupon.usos || '1 uso por persona'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="detail-item p-3 bg-light rounded">
                                                <div class="d-flex align-items-center">
                                                    <i class="fas fa-tag text-primary me-3 fs-5"></i>
                                                    <div>
                                                        <strong>Categoría</strong><br>
                                                        <span class="badge bg-secondary">${coupon.category || 'General'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="usage-instructions mt-4 p-3 bg-info text-white rounded">
                                            <h6><i class="fas fa-info-circle me-2"></i>Instrucciones de uso</h6>
                                            <small>
                                                Presenta este cupón en <strong>${coupon.nombreNegocio || coupon.business}</strong> para canjear tu descuento.
                                                ${coupon.code ? `Muestra el código <strong>${coupon.code}</strong> al personal.` : ''}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Cerrar
                            </button>
                            <button type="button" class="btn btn-success" onclick="window.couponsSystem.claimCouponFromModal('${coupon.id}')">
                                🎟️ Reclamar Este Cupón
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('couponDetailsModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('couponDetailsModal'));
        modal.show();
        
        document.getElementById('couponDetailsModal').addEventListener('shown.bs.modal', () => {
            const copyBtn = document.querySelector('.copy-coupon-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    const code = e.target.dataset.code;
                    this.copyToClipboard(code);
                });
            }
        });
    }

    claimCouponFromSection(couponId) {
        const coupon = this.couponsData.find(c => c.id === couponId);
        if (!coupon) return;
        
        this.showClaimConfirmationModal(coupon);
    }

    claimCouponFromModal(couponId) {
        const coupon = this.couponsData.find(c => c.id === couponId);
        if (!coupon) return;
        
        const currentModal = bootstrap.Modal.getInstance(document.getElementById('couponDetailsModal'));
        if (currentModal) currentModal.hide();
        
        this.showClaimConfirmationModal(coupon);
    }

    showClaimConfirmationModal(coupon) {
        const modalHTML = `
            <div class="modal fade" id="claimConfirmationModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">🎉 ¡Cupón Reclamado!</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-3">
                                <i class="fas fa-check-circle text-success fa-3x"></i>
                            </div>
                            <h6 class="text-success">${coupon.titulo || coupon.title}</h6>
                            <p class="small text-muted mb-2">${coupon.nombreNegocio || coupon.business}</p>
                            
                            ${coupon.code ? `
                            <div class="coupon-code-confirmation p-3 bg-light rounded mt-3">
                                <label class="small text-muted mb-1">Tu código:</label>
                                <div class="h5 text-primary">${coupon.code}</div>
                                <button class="btn btn-sm btn-outline-primary copy-coupon-confirm" data-code="${coupon.code}">
                                    📋 Copiar
                                </button>
                            </div>
                            ` : ''}
                            
                            <div class="alert alert-info mt-3 small">
                                <i class="fas fa-info-circle me-1"></i>
                                Presenta este cupón en el comercio para canjearlo
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success w-100" data-bs-dismiss="modal">
                                ✅ Entendido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('claimConfirmationModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('claimConfirmationModal'));
        modal.show();
        
        document.getElementById('claimConfirmationModal').addEventListener('shown.bs.modal', () => {
            const copyBtn = document.querySelector('.copy-coupon-confirm');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    const code = e.target.dataset.code;
                    this.copyToClipboard(code);
                    
                    e.target.innerHTML = '✅ Copiado';
                    e.target.disabled = true;
                    setTimeout(() => {
                        e.target.innerHTML = '📋 Copiar';
                        e.target.disabled = false;
                    }, 2000);
                });
            }
        });
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM listo, iniciando sistema de cupones multilocalidad...');
    window.couponsSystem = new CouponsSystem();
});

window.addEventListener('load', function() {
    console.log('📄 Página completamente cargada');
    if (!window.couponsSystem) {
        window.couponsSystem = new CouponsSystem();
    }
});