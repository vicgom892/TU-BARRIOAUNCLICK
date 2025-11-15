// favorites-system.js - Sistema de Favoritos por Localidad
// Compatible con carga dinámica desde JSON - v2.1

class FavoritesSystem {
    constructor() {
        this.currentLocalidad = this.getCurrentLocalidad();
        this.storageKey = `business_favorites_${this.currentLocalidad}_v2`;
        this.favorites = this.loadFavorites();
        this.observer = null;
        this.init();
        
        console.log(`❤️ Sistema de Favoritos para: ${this.currentLocalidad}`);
    }

    // Método para detectar la localidad actual
    getCurrentLocalidad() {
        // Opción 1: Desde variable global
        if (window.APP_CONTEXT) {
            return window.APP_CONTEXT;
        }
        
        // Opción 2: Desde la URL
        const path = window.location.pathname;
        const localidadMatch = path.match(/\/([^\/]+)\/index\.html$/);
        if (localidadMatch) {
            return localidadMatch[1];
        }
        
        // Opción 3: Desde el cuerpo o datos de la página
        const bodyClasses = document.body.className.toLowerCase();
        if (bodyClasses.includes('castelar')) return 'castelar';
        if (bodyClasses.includes('moron')) return 'moron';
        if (bodyClasses.includes('haedo')) return 'haedo';
         if (bodyClasses.includes('ciudadela')) return 'ciudadela';
        if (bodyClasses.includes('ituzaingo')) return 'ituzaingo';
        if (bodyClasses.includes('merlo')) return 'merlo';
         if (bodyClasses.includes('ramos')) return 'ramos';
        if (bodyClasses.includes('padua')) return 'padua';
        if (bodyClasses.includes('marcos-paz')) return 'marcos-paz';
        
        
        // Default
        return 'castelar';
    }

    init() {
        console.log('❤️ Sistema de Favoritos inicializando...');
        this.setupFavoritesButton();
        this.setupFavoritesModal();
        this.observeBusinessLoading();
        this.updateFavoritesCount();
        
        // Escuchar eventos personalizados de main-2.js
        window.addEventListener('businessesLoaded', () => {
            console.log('🎯 Negocios cargados, agregando favoritos...');
            setTimeout(() => this.addFavoritesToAllCards(), 500);
        });
    }

    setupFavoritesButton() {
        // Crear botón en el header si no existe
        if (!document.getElementById('favoritesBtn')) {
            const favoritesBtn = document.createElement('button');
            favoritesBtn.id = 'favoritesBtn';
            favoritesBtn.className = 'favorites-btn-header';
            favoritesBtn.setAttribute('data-bs-toggle', 'modal');
            favoritesBtn.setAttribute('data-bs-target', '#favoritesModal');
            favoritesBtn.innerHTML = `
                <i class="fas fa-heart"></i>
                <span id="favoritesCount" class="favorites-count-header">0</span>
            `;
            
            // Insertar en el header - Opción 1: Junto a la campanita
            const notificationsContainer = document.querySelector('.d-flex.align-items-center.gap-3');
            if (notificationsContainer) {
                notificationsContainer.insertBefore(favoritesBtn, notificationsContainer.firstChild);
            } 
            // Opción 2: En el menú derecho
            else {
                const rightNav = document.querySelector('.d-none.d-lg-flex.align-items-center.gap-3');
                if (rightNav) {
                    rightNav.insertBefore(favoritesBtn, rightNav.firstChild);
                }
            }
            
            // Agregar funcionalidad al botón
            favoritesBtn.addEventListener('click', () => {
                this.updateFavoritesModal();
            });
        } else {
            // Si ya existe, re-asignar el evento
            document.getElementById('favoritesBtn').addEventListener('click', () => {
                this.updateFavoritesModal();
            });
        }
    }

    updateFavoritesCount() {
        const count = Object.keys(this.favorites).length;
        const countElement = document.getElementById('favoritesCount');
        const favoritesBtn = document.getElementById('favoritesBtn');
        
        if (countElement) {
            countElement.textContent = count;
            // Animación
            countElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                countElement.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Agregar clase cuando hay favoritos
        if (favoritesBtn) {
            if (count > 0) {
                favoritesBtn.classList.add('has-favorites');
            } else {
                favoritesBtn.classList.remove('has-favorites');
            }
        }
    }

    setupFavoritesModal() {
        // Crear modal si no existe
        if (!document.getElementById('favoritesModal')) {
            const modalHTML = `
                <div class="modal fade favorites-modal" id="favoritesModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">❤️ Tus Comercios Favoritos - ${this.currentLocalidad.charAt(0).toUpperCase() + this.currentLocalidad.slice(1)}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div id="favoritesList">
                                    <div class="text-center text-muted py-4" id="emptyFavorites">
                                        <i class="fas fa-heart fa-2x mb-3"></i>
                                        <p>No tienes comercios favoritos en ${this.currentLocalidad}</p>
                                        <small>Haz clic en el ❤️ de los comercios que te gusten</small>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="button" class="btn btn-danger" id="clearAllFavorites">
                                    <i class="fas fa-trash"></i> Limpiar Todos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Evento para limpiar todos los favoritos - CORREGIDO
            document.getElementById('clearAllFavorites').addEventListener('click', () => {
                this.clearAllFavorites();
            });
        }
    }

    observeBusinessLoading() {
        // Estrategia 1: Esperar a que window.businesses esté disponible
        const checkBusinesses = () => {
            if (window.businesses && window.businesses.length > 0) {
                console.log('✅ Negocios detectados, agregando botones de favorito...');
                setTimeout(() => this.addFavoritesToAllCards(), 1000);
            } else {
                setTimeout(checkBusinesses, 1000);
            }
        };
        
        // Estrategia 2: Observer para nuevas tarjetas
        this.setupCardsObserver();
        
        // Iniciar verificación
        checkBusinesses();
    }

    setupCardsObserver() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Verificar si es una tarjeta de negocio
                        if (node.classList && node.classList.contains('business-card')) {
                            setTimeout(() => this.addFavoriteButtonToCard(node), 100);
                        }
                        // Verificar contenedores que puedan tener tarjetas
                        else if (node.querySelector && node.querySelector('.business-card')) {
                            node.querySelectorAll('.business-card').forEach(card => {
                                setTimeout(() => this.addFavoriteButtonToCard(card), 100);
                            });
                        }
                    }
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addFavoritesToAllCards() {
        console.log('🔄 Agregando botones de favorito a todas las tarjetas...');
        const cards = document.querySelectorAll('.business-card');
        console.log(`📊 Encontradas ${cards.length} tarjetas para procesar`);
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                this.addFavoriteButtonToCard(card);
            }, index * 50); // Espaciar para mejor performance
        });
    }

    addFavoriteButtonToCard(card) {
        // Evitar duplicados
        if (card.querySelector('.favorite-toggle')) {
            return;
        }

        const img = card.querySelector('.clickable-image');
        if (!img || !img.dataset.business) {
            return;
        }

        try {
            const businessData = JSON.parse(img.dataset.business);
            const businessId = this.generateBusinessId(businessData);
            
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = `favorite-toggle ${this.isFavorite(businessId) ? 'favorited' : ''}`;
            favoriteBtn.innerHTML = this.isFavorite(businessId) ? 
                '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
            favoriteBtn.setAttribute('data-business-id', businessId);
            favoriteBtn.setAttribute('title', this.isFavorite(businessId) ? 
                'Quitar de favoritos' : 'Agregar a favoritos');
            
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(businessId, businessData, favoriteBtn);
            });

            // Posicionar el botón
            const imgContainer = card.querySelector('.position-relative') || 
                                img.parentElement || 
                                card;
            
            imgContainer.style.position = 'relative';
            favoriteBtn.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(255, 255, 255, 0.95);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                font-size: 16px;
            `;

            imgContainer.appendChild(favoriteBtn);
            console.log(`✅ Botón de favorito agregado a: ${businessData.nombre}`);

        } catch (error) {
            console.warn('❌ No se pudo agregar favorito a tarjeta:', error);
        }
    }

    toggleFavorite(businessId, businessData, button) {
        if (this.isFavorite(businessId)) {
            this.removeFavorite(businessId);
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('favorited');
            button.setAttribute('title', 'Agregar a favoritos');
            this.showNotification(`"${businessData.nombre}" removido de favoritos`, 'info');
        } else {
            this.addFavorite(businessId, businessData);
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.classList.add('favorited');
            button.setAttribute('title', 'Quitar de favoritos');
            this.showNotification(`"${businessData.nombre}" agregado a favoritos`, 'success');
        }
        
        this.updateFavoritesCount();
        
        // Actualizar modal si está abierto
        if (document.getElementById('favoritesModal') && document.getElementById('favoritesModal').classList.contains('show')) {
            this.updateFavoritesModal();
        }
    }

    addFavorite(businessId, businessData) {
        this.favorites[businessId] = {
            id: businessId,
            nombre: businessData.nombre,
            imagen: businessData.imagen,
            direccion: businessData.direccion,
            horario: businessData.horario,
            telefono: businessData.telefono,
            whatsapp: businessData.whatsapp,
            categoria: businessData.categoria || businessData.category,
            localidad: this.currentLocalidad, // Localidad específica
            addedAt: Date.now()
        };
        this.saveFavorites();
        
        console.log(`⭐ Favorito agregado en ${this.currentLocalidad}: ${businessData.nombre}`);
    }

    removeFavorite(businessId) {
        if (this.favorites[businessId]) {
            delete this.favorites[businessId];
            this.saveFavorites();
        }
    }

    isFavorite(businessId) {
        return this.favorites.hasOwnProperty(businessId);
    }

    generateBusinessId(businessData) {
        // ID único basado en nombre y localidad actual
        return `${this.currentLocalidad}-${businessData.nombre}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\-]/g, '');
    }

    updateFavoritesModal() {
        const favoritesList = document.getElementById('favoritesList');
        const emptyFavorites = document.getElementById('emptyFavorites');
        const favorites = Object.values(this.favorites);
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="text-center text-muted py-4" id="emptyFavorites">
                    <i class="fas fa-heart fa-2x mb-3"></i>
                    <p>No tienes comercios favoritos en ${this.currentLocalidad}</p>
                    <small>Haz clic en el ❤️ de los comercios que te gusten</small>
                </div>
            `;
            return;
        }

        // Ordenar por fecha de agregado (más recientes primero)
        favorites.sort((a, b) => b.addedAt - a.addedAt);

        favoritesList.innerHTML = favorites.map(fav => `
            <div class="favorite-item" data-business-id="${fav.id}">
                <div class="favorite-item-localidad">${fav.localidad}</div>
                <img src="${fav.imagen}" alt="${fav.nombre}" 
                     onerror="this.src='../shared/img/fallback-image.png'">
                <div class="favorite-item-info">
                    <h6 class="mb-1">${fav.nombre}</h6>
                    <p class="text-muted mb-1 small">
                        <i class="fas fa-map-marker-alt"></i> ${fav.direccion || 'Dirección no disponible'}
                    </p>
                    <p class="text-muted mb-1 small">
                        <i class="fas fa-clock"></i> ${fav.horario || 'Horario no disponible'}
                    </p>
                    <span class="badge bg-secondary">${fav.categoria || 'General'}</span>
                </div>
                <div class="favorite-item-actions">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="window.favoritesSystem.openBusiness('${fav.id}')"
                            title="Abrir detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="window.favoritesSystem.removeFavoriteFromModal('${fav.id}')"
                            title="Quitar de favoritos">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openBusiness(businessId) {
        const favorite = this.favorites[businessId];
        if (!favorite) return;

        // Buscar la tarjeta correspondiente y simular click
        const cards = document.querySelectorAll('.business-card');
        for (let card of cards) {
            const img = card.querySelector('.clickable-image');
            if (img && img.dataset.business) {
                try {
                    const businessData = JSON.parse(img.dataset.business);
                    const cardBusinessId = this.generateBusinessId(businessData);
                    if (cardBusinessId === businessId) {
                        img.click(); // Abrir modal de negocio
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        // Cerrar modal de favoritos
        const modal = bootstrap.Modal.getInstance(document.getElementById('favoritesModal'));
        if (modal) modal.hide();
    }

    removeFavoriteFromModal(businessId) {
        const favorite = this.favorites[businessId];
        if (favorite) {
            this.removeFavorite(businessId);
            this.updateFavoritesModal();
            this.updateFavoritesCount();
            this.showNotification(`"${favorite.nombre}" removido de favoritos`, 'info');
            
            // Actualizar botón en la tarjeta si existe
            const favoriteBtn = document.querySelector(`.favorite-toggle[data-business-id="${businessId}"]`);
            if (favoriteBtn) {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.setAttribute('title', 'Agregar a favoritos');
            }
        }
    }

    clearAllFavorites() {
        if (Object.keys(this.favorites).length === 0) {
            this.showNotification('No hay favoritos para eliminar', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres eliminar todos tus favoritos de ' + this.currentLocalidad + '?')) {
            // Limpiar el objeto de favoritos
            this.favorites = {};
            
            // Guardar cambios en localStorage
            this.saveFavorites();
            
            // Actualizar la interfaz
            this.updateFavoritesModal();
            this.updateFavoritesCount();
            
            // Actualizar todos los botones en las tarjetas
            document.querySelectorAll('.favorite-toggle').forEach(btn => {
                btn.innerHTML = '<i class="far fa-heart"></i>';
                btn.classList.remove('favorited');
                btn.setAttribute('title', 'Agregar a favoritos');
            });
            
            this.showNotification(`Todos los favoritos de ${this.currentLocalidad} han sido eliminados`, 'warning');
            
            // Cerrar modal después de un breve delay
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('favoritesModal'));
                if (modal) {
                    modal.hide();
                }
            }, 1500);
        }
    }

    showNotification(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `favorite-toast favorite-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const favorites = stored ? JSON.parse(stored) : {};
            console.log(`📂 Favoritos cargados para ${this.currentLocalidad}:`, Object.keys(favorites).length);
            return favorites;
        } catch (error) {
            console.warn('❌ Error cargando favoritos:', error);
            return {};
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            console.log(`💾 Favoritos guardados para ${this.currentLocalidad}:`, Object.keys(this.favorites).length);
        } catch (error) {
            console.error('❌ Error guardando favoritos:', error);
        }
    }

    // Método para cambiar de localidad
    changeLocalidad(newLocalidad) {
        if (newLocalidad !== this.currentLocalidad) {
            console.log(`🔄 Cambiando favoritos de ${this.currentLocalidad} a ${newLocalidad}`);
            this.currentLocalidad = newLocalidad;
            this.storageKey = `business_favorites_${this.currentLocalidad}_v2`;
            this.favorites = this.loadFavorites();
            this.updateFavoritesCount();
            
            // Actualizar título del modal
            const modalTitle = document.querySelector('#favoritesModal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = `❤️ Tus Comercios Favoritos - ${this.currentLocalidad.charAt(0).toUpperCase() + this.currentLocalidad.slice(1)}`;
            }
            
            // Re-aplicar botones a las tarjetas actuales
            setTimeout(() => this.addFavoritesToAllCards(), 500);
        }
    }

    // Método para debug
    debug() {
        console.log('🛠️ FAVORITOS POR LOCALIDAD:');
        console.log(`📍 Localidad actual: ${this.currentLocalidad}`);
        console.log(`🔑 Storage key: ${this.storageKey}`);
        console.log(`📊 Total de favoritos: ${Object.keys(this.favorites).length}`);
        console.log('❤️ Favoritos actuales:', this.favorites);
        
        // Mostrar todas las claves de favoritos en localStorage
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('business_favorites_'));
        console.log('🗂️ Todas las claves de favoritos:', allKeys);
    }
}

// Función para ver todos los favoritos de todas las localidades
function debugAllFavorites() {
    const allFavorites = {};
    const localidades = ['castelar', 'moron', 'haedo', 'ciudadela' , 'ituzaingo', 'merlo', 'padua', 'ramos'];
    
    localidades.forEach(localidad => {
        const key = `business_favorites_${localidad}_v2`;
        const favs = JSON.parse(localStorage.getItem(key) || '{}');
        allFavorites[localidad] = {
            count: Object.keys(favs).length,
            items: favs
        };
    });
    
    console.log('🗂️ FAVORITOS POR LOCALIDAD:', allFavorites);
    return allFavorites;
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.favoritesSystem = new FavoritesSystem();
    window.debugAllFavorites = debugAllFavorites;
    
    console.log('❤️ Sistema de Favoritos por localidad inicializado correctamente');
    
    // Debug inicial después de 2 segundos
    setTimeout(() => {
        window.favoritesSystem.debug();
    }, 2000);
});

// Escuchar cambios de página/localidad
window.addEventListener('popstate', () => {
    if (window.favoritesSystem) {
        const newLocalidad = window.favoritesSystem.getCurrentLocalidad();
        window.favoritesSystem.changeLocalidad(newLocalidad);
    }
});

// Exportar para uso global
window.FavoritesSystem = FavoritesSystem;