// Sistema de Vista Rápida - Versión Mejorada
class QuickView {
    constructor() {
        this.modal = null;
        this.currentProduct = null;
        this.selectedSize = null;
        this.selectedColor = null;
        this.quantity = 1;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Vista Rápida</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="quickViewContent">
                            <!-- Contenido se carga dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
    }

    setupEventListeners() {
        // Event delegation para botones de vista rápida
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-view-btn') || e.target.closest('[data-quick-view]')) {
                const button = e.target.closest('.quick-view-btn') || e.target.closest('[data-quick-view]');
                const productId = parseInt(button.dataset.productId);
                this.showProduct(productId);
            }
        });
    }

    showProduct(productId) {
        const product = window.eleganceShoes?.products.find(p => p.id === productId) || 
                       window.eleganceShoes?.kidsProducts?.find(p => p.id === productId);
        
        if (!product) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }

        this.currentProduct = product;
        // Resetear selecciones
        this.selectedSize = product.sizes?.[0] || 'Única';
        this.selectedColor = product.colors?.[0] || 'Estándar';
        this.quantity = 1;
        
        this.renderProductDetails();
        this.modal.show();
    }

   // En quick-view.js, modificar renderProductDetails:
renderProductDetails() {
    const content = document.getElementById('quickViewContent');
    if (!content || !this.currentProduct) return;

    const product = this.currentProduct;
    const isFavorite = window.wishlistSystem?.isInWishlist(product.id) || false;

    content.innerHTML = `
        <div class="row g-4">
            <!-- COLUMNA IZQUIERDA - IMAGEN -->
            <div class="col-lg-4">
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}" 
                         class="img-fluid rounded" 
                         onerror="this.src='images/placeholder-shoe.jpg'">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    ${product.age ? `<span class="product-age-badge">${product.age}</span>` : ''}
                </div>
            </div>

            <!-- COLUMNA CENTRAL - INFORMACIÓN Y OPCIONES -->
            <div class="col-lg-4">
                <div class="quick-view-details">
                    <!-- INFORMACIÓN DEL PRODUCTO -->
                    <div class="product-info-section mb-4">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        
                        <div class="product-rating mb-3">
                            ${this.generateStars(product.rating)}
                            <span class="rating-value">${product.rating}</span>
                            <span class="rating-count">(24 reseñas)</span>
                        </div>

                        <div class="product-price mb-3">
                            <span class="current-price">$${product.price}</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="original-price">$${product.originalPrice}</span>
                                 <span class="discount">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` 
                                : ''
                            }
                        </div>

                        <p class="product-description">
                            ${this.getProductDescription(product)}
                        </p>
                    </div>

                    <!-- OPCIONES DE PRODUCTO -->
                    <div class="product-options-section">
                        ${product.sizes && product.sizes.length > 0 ? `
                            <div class="option-group mb-3">
                                <label class="form-label fw-bold">Talle:</label>
                                <div class="size-options">
                                    ${product.sizes.map(size => `
                                        <label class="size-option ${this.selectedSize === size ? 'selected' : ''}">
                                            <input type="radio" name="size" value="${size}" 
                                                   ${this.selectedSize === size ? 'checked' : ''}
                                                   onchange="quickView.handleSizeChange('${size}')">
                                            <span class="size-label">${size}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${product.colors && product.colors.length > 0 ? `
                            <div class="option-group mb-3">
                                <label class="form-label fw-bold">Color:</label>
                                <div class="color-options">
                                    ${product.colors.map(color => `
                                        <label class="color-option ${this.selectedColor === color ? 'selected' : ''}">
                                            <input type="radio" name="color" value="${color}" 
                                                   ${this.selectedColor === color ? 'checked' : ''}
                                                   onchange="quickView.handleColorChange('${color}')">
                                            <span class="color-label" style="background-color: ${this.getColorCode(color)}" title="${color}"></span>
                                            <span class="color-name">${color}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- COLUMNA DERECHA - ACCIONES Y CANTIDAD -->
            <div class="col-lg-4">
                <div class="quick-view-actions">
                    <!-- PRECIO Y CANTIDAD -->
                    <div class="action-header mb-4 p-3 bg-light rounded">
                        <div class="total-price text-center mb-3">
                            <div class="price-label text-muted small">Total</div>
                            <div class="price-amount h3 text-primary fw-bold">
                                $${(product.price * this.quantity).toFixed(2)}
                            </div>
                        </div>

                        <!-- SELECTOR DE CANTIDAD -->
                        <div class="quantity-selector">
                            <label class="form-label fw-bold mb-2">Cantidad:</label>
                            <div class="quantity-controls">
                                <button type="button" class="btn btn-outline-secondary" onclick="quickView.decreaseQuantity()">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center" value="${this.quantity}" min="1" max="10" 
                                       onchange="quickView.handleQuantityChange(this.value)" id="quickViewQuantity">
                                <button type="button" class="btn btn-outline-secondary" onclick="quickView.increaseQuantity()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- BOTONES DE ACCIÓN -->
                    <div class="actions-section">
                        <div class="action-buttons mb-3">
                            <button class="btn btn-primary btn-lg w-100 mb-2" onclick="quickView.addToCartFromQuickView()">
                                <i class="fas fa-shopping-bag"></i>
                                <p>Agregar al Carrito</p>
                            </button>
                            <button class="btn btn-danger btn-lg w-100 favorite-btn ${isFavorite ? 'favorited' : ''}" 
                                    onclick="quickView.toggleFavorite()">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                                ${isFavorite ? 'En Favoritos' : '<p>Agregar a Favoritos</p>'}
                            </button>
                        </div>
                        
                        <div class="whatsapp-section">
                            <button class="btn btn-success btn-lg w-100" onclick="quickView.buyNow()">
                                <i class="fab fa-whatsapp"></i>
                                Comprar por WhatsApp
                            </button>
                        </div>
                    </div>

                    <!-- CARACTERÍSTICAS RÁPIDAS -->
                    <div class="quick-features mt-4">
                        <div class="feature-item d-flex align-items-center mb-2">
                            <i class="fas fa-shipping-fast text-success me-2"></i>
                            <small>Envío gratis +$50</small>
                        </div>
                        <div class="feature-item d-flex align-items-center mb-2">
                            <i class="fas fa-undo text-info me-2"></i>
                            <small>30 días devolución</small>
                        </div>
                        <div class="feature-item d-flex align-items-center">
                            <i class="fas fa-shield-alt text-warning me-2"></i>
                            <small>Garantía incluida</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

  // Manejar cambios de talle
    handleSizeChange(size) {
        this.selectedSize = size;
        console.log('📏 Talle seleccionado:', size);
        
        // Actualizar UI
        document.querySelectorAll('.size-option').forEach(option => {
            option.classList.toggle('selected', option.querySelector('input').value === size);
        });
    }

    // Manejar cambios de color
    handleColorChange(color) {
        this.selectedColor = color;
        console.log('🎨 Color seleccionado:', color);
        
        // Actualizar UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.querySelector('input').value === color);
        });
    }

    // Manejar cambios de cantidad
    handleQuantityChange(newQuantity) {
        const quantity = parseInt(newQuantity) || 1;
        if (quantity >= 1 && quantity <= 10) {
            this.quantity = quantity;
            this.updateAddToCartButton();
        }
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
            document.getElementById('quickViewQuantity').value = this.quantity;
            this.updateAddToCartButton();
        }
    }

    increaseQuantity() {
        if (this.quantity < 10) {
            this.quantity++;
            document.getElementById('quickViewQuantity').value = this.quantity;
            this.updateAddToCartButton();
        }
    }

    updateAddToCartButton() {
        const addToCartBtn = document.querySelector('#quickViewContent .btn-primary');
        if (addToCartBtn && this.currentProduct) {
            const total = (this.currentProduct.price * this.quantity).toFixed(2);
            addToCartBtn.innerHTML = `<i class="fas fa-shopping-bag"></i> Agregar al Carrito - $${total}`;
        }
    }

    addToCartFromQuickView() {
        if (!this.currentProduct) return;

        console.log('🛒 Agregando al carrito desde vista rápida:', {
            producto: this.currentProduct.name,
            talle: this.selectedSize,
            color: this.selectedColor,
            cantidad: this.quantity
        });

        // Agregar al carrito
        for (let i = 0; i < this.quantity; i++) {
            window.shoppingCart?.addItem(this.currentProduct, 1, this.selectedSize, this.selectedColor);
        }

        this.showNotification(`${this.currentProduct.name} agregado al carrito`, 'success');
        this.modal.hide();
    }

    // Nueva función: Comprar ahora por WhatsApp
    buyNow() {
        if (!this.currentProduct) return;

        console.log('🚀 Comprar ahora:', {
            producto: this.currentProduct.name,
            talle: this.selectedSize,
            color: this.selectedColor,
            cantidad: this.quantity
        });

        const phoneNumber = "5491112345678"; // Reemplazar con número real
        let message = "¡Hola! Me interesa este producto:%0A%0A";
        
        message += `*${this.currentProduct.name}*%0A`;
        message += `• Talle: ${this.selectedSize}%0A`;
        message += `• Color: ${this.selectedColor}%0A`;
        message += `• Cantidad: ${this.quantity}%0A`;
        message += `• Precio: $${this.currentProduct.price} c/u%0A`;
        message += `• Total: $${(this.currentProduct.price * this.quantity).toFixed(2)}%0A%0A`;
        message += "Por favor, confirmen disponibilidad y formas de pago. ¡Gracias!";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        this.showNotification('Redirigiendo a WhatsApp', 'success');
        this.modal.hide();
    }

    toggleFavorite() {
        if (!this.currentProduct) return;

        if (window.wishlistSystem) {
            window.wishlistSystem.toggleFavorite(this.currentProduct.id);
            
            // Actualizar botón en el modal
            const favoriteBtn = document.querySelector('#quickViewContent .favorite-btn');
            const isFavorite = window.wishlistSystem.isInWishlist(this.currentProduct.id);
            
            if (favoriteBtn) {
                favoriteBtn.classList.toggle('favorited', isFavorite);
                favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
            }
        } else {
            this.showNotification('Sistema de favoritos no disponible', 'warning');
        }
    }

    getProductDescription(product) {
        const descriptions = {
            'Tacones': 'Tacón elegante y cómodo, perfecto para ocasiones especiales. Diseño moderno que combina estilo y confort para largas horas de uso.',
            'Planos': 'Calzado plano ideal para el día a día. Máximo confort y estilo casual que se adapta a cualquier ocasión.',
            'Botas': 'Bota de calidad premium, diseñada para brindar protección y estilo durante la temporada de frío.',
            'Deportivos': 'Zapatilla deportiva con tecnología de amortiguación para máximo confort en actividades físicas.',
            'Kids': 'Calzado infantil diseñado para el correcto desarrollo de los pies, con materiales seguros y diseños divertidos.'
        };

        return descriptions[product.category] || 'Producto de alta calidad, diseñado para brindar comodidad y estilo en cada uso.';
    }

    getColorCode(color) {
        const colorMap = {
            'Negro': '#000000',
            'Rojo': '#dc3545',
            'Nude': '#f4a460',
            'Beige': '#f5f5dc',
            'Marrón': '#8b4513',
            'Café': '#a52a2a',
            'Blanco': '#ffffff',
            'Rosa': '#ff69b4',
            'Azul': '#007bff',
            'Amarillo': '#ffc107',
            'Celeste': '#87ceeb',
            'Dorado': '#ffd700',
            'Plateado': '#c0c0c0'
        };

        return colorMap[color] || '#6c757d';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 1070;
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
}

// Inicializar vista rápida
document.addEventListener('DOMContentLoaded', () => {
    window.quickView = new QuickView();
});