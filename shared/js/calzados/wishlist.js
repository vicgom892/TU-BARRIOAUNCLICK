// Sistema de Lista de Deseos
class WishlistSystem {
    constructor() {
        this.storageKey = 'elegance_wishlist';
        this.wishlist = this.loadWishlist();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateWishlistCount();
        console.log('❤️ Sistema de Favoritos inicializado');
    }

    loadWishlist() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (error) {
            console.error('Error cargando lista de deseos:', error);
            return [];
        }
    }

    saveWishlist() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
        } catch (error) {
            console.error('Error guardando lista de deseos:', error);
        }
    }

    setupEventListeners() {
        // Event delegation para botones de favoritos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-btn') || e.target.closest('[data-wishlist]')) {
                const button = e.target.closest('.wishlist-btn') || e.target.closest('[data-wishlist]');
                const productId = parseInt(button.dataset.productId);
                this.toggleFavorite(productId, button);
            }
        });
    }

    toggleFavorite(productId, button = null) {
        const product = this.findProductById(productId);
        if (!product) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }

        const isInWishlist = this.isInWishlist(productId);

        if (isInWishlist) {
            this.removeFromWishlist(productId);
            this.showNotification(`${product.name} removido de favoritos`, 'info');
        } else {
            this.addToWishlist(product);
            this.showNotification(`${product.name} agregado a favoritos`, 'success');
        }

        // Actualizar UI
        this.updateWishlistCount();
        this.updateButtonUI(button, !isInWishlist);

        // Actualizar en vista rápida si está abierta
        this.updateQuickViewUI(productId, !isInWishlist);
    }

    findProductById(productId) {
        return window.eleganceShoes?.products.find(p => p.id === productId) || 
               window.eleganceShoes?.kidsProducts?.find(p => p.id === productId);
    }

    addToWishlist(product) {
        if (this.isInWishlist(product.id)) return;

        this.wishlist.push({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            category: product.category,
            addedAt: new Date().toISOString()
        });

        this.saveWishlist();
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    updateWishlistCount() {
        const count = this.wishlist.length;
        const countElements = document.querySelectorAll('.wishlist-count');
        
        countElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });
    }

    updateButtonUI(button, isFavorite) {
        if (!button) return;

        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        }

        button.classList.toggle('favorited', isFavorite);
        button.title = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
    }

    updateQuickViewUI(productId, isFavorite) {
        const quickViewBtn = document.querySelector(`#quickViewContent .favorite-btn`);
        if (quickViewBtn && window.quickView?.currentProduct?.id === productId) {
            const icon = quickViewBtn.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            }
            quickViewBtn.classList.toggle('favorited', isFavorite);
        }
    }

    getWishlist() {
        return this.wishlist;
    }

    clearWishlist() {
        if (this.wishlist.length === 0) return;

        if (confirm('¿Estás segura de que quieres vaciar tu lista de deseos?')) {
            this.wishlist = [];
            this.saveWishlist();
            this.updateWishlistCount();
            this.updateAllButtonsUI();
            this.showNotification('Lista de deseos vaciada', 'info');
        }
    }

    updateAllButtonsUI() {
        // Actualizar todos los botones de favoritos en la página
        document.querySelectorAll('.wishlist-btn, [data-wishlist]').forEach(button => {
            const productId = parseInt(button.dataset.productId);
            const isFavorite = this.isInWishlist(productId);
            this.updateButtonUI(button, isFavorite);
        });
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
        }, 4000);
    }

    // Debug
    debug() {
        console.log('❤️ Lista de deseos:', this.wishlist);
        console.log('📊 Total de favoritos:', this.wishlist.length);
    }
}

// Inicializar sistema de favoritos
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistSystem = new WishlistSystem();
});