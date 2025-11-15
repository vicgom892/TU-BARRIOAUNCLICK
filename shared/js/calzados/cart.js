// js/cart.js - Versión simplificada sin botones +/-
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('elegance_cart')) || [];
        this.isOpen = false;
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupCartEvents();
        this.renderCartItems();
        console.log('🛒 Carrito inicializado con', this.cart.length, 'productos');
    }

    setupCartEvents() {
        // Botón de abrir/cerrar carrito
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            cartButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCart();
            });
        }

        // Botón de cerrar carrito
        const closeCart = document.getElementById('closeCart');
        if (closeCart) {
            closeCart.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
        }

        // Overlay para cerrar carrito
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCart();
            });
        }

        // Botón de enviar por WhatsApp
        const sendWhatsApp = document.getElementById('sendWhatsApp');
        if (sendWhatsApp) {
            sendWhatsApp.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendOrderViaWhatsApp();
            });
        }

        // Botón limpiar carrito
        const clearCart = document.getElementById('clearCart');
        if (clearCart) {
            clearCart.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCart();
            });
        }

        // Cerrar carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });

        console.log('🎯 Eventos del carrito configurados');
    }

    openCart() {
        console.log('📖 Abriendo carrito...');
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && overlay) {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
            this.isOpen = true;
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            console.log('✅ Carrito abierto');
        } else {
            console.error('❌ No se encontraron elementos del carrito');
        }
    }

    closeCart() {
        console.log('📕 Cerrando carrito...');
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && overlay) {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
            this.isOpen = false;
            
            // Restaurar scroll del body
            document.body.style.overflow = '';
            
            console.log('✅ Carrito cerrado');
        }
    }

   // En cart.js, en addItem - asegurar que los talles sean strings:
addItem(product, quantity = 1, size = null, color = null) {
    // Convertir todo a strings para consistencia
    const selectedSize = String(size || product.sizes?.[0] || 'Única');
    const selectedColor = String(color || product.colors?.[0] || 'Estándar');
    const productId = parseInt(product.id);
    
    console.log('➕ Agregando producto con talle:', selectedSize, 'y color:', selectedColor);
    
    // Buscar si ya existe el producto exacto
    const existingItemIndex = this.cart.findIndex(item => 
        item.id === productId && 
        String(item.selectedSize) === selectedSize && 
        String(item.selectedColor) === selectedColor
    );

    if (existingItemIndex !== -1) {
        // Si ya existe, aumentar cantidad
        this.cart[existingItemIndex].quantity += quantity;
    } else {
        // Si no existe, agregar nuevo item
        this.cart.push({
            ...product,
            id: productId,
            quantity,
            selectedSize: selectedSize,
            selectedColor: selectedColor,
            addedAt: new Date().toISOString()
        });
    }

    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
    this.showAddToCartAnimation(product);
}

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('elegance_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.getItemCount();
        const countElements = document.querySelectorAll('.cart-count');
        
        countElements.forEach(element => {
            element.textContent = count;
            element.style.display = 'flex';
            element.style.visibility = count > 0 ? 'visible' : 'hidden';
        });
    }

    renderCartItems() {
        const cartBody = document.getElementById('cartBody');
        const cartTotal = document.getElementById('cartTotal');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotalCount = document.getElementById('cartTotalCount');
        
        if (!cartBody) {
            console.error('❌ No se encontró cartBody');
            return;
        }

        if (this.cart.length === 0) {
            cartBody.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-shopping-bag fa-3x mb-3"></i>
                    <p>Tu carrito está vacío</p>
                    <small>Agrega productos para comenzar</small>
                </div>
            `;
        } else {
            cartBody.innerHTML = this.cart.map((item, index) => `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" 
                             onerror="this.src='images/placeholder-shoe.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h6 class="cart-item-title">${item.name}</h6>
                        <div class="cart-item-meta">
                            <span class="cart-item-size">Talla: ${item.selectedSize}</span>
                            <span class="cart-item-color">Color: ${item.selectedColor}</span>
                            <span class="cart-item-quantity-badge">Cantidad: ${item.quantity}</span>
                        </div>
                        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <small class="text-muted">$${item.price} c/u</small>
                    </div>
                </div>
            `).join('');
        }

        // Actualizar totales
        const total = this.getTotal();
        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
        }
        
        if (cartSubtotal) {
            cartSubtotal.textContent = total.toFixed(2);
        }
        
        if (cartTotalCount) {
            cartTotalCount.textContent = this.getItemCount();
        }
    }

    sendOrderViaWhatsApp() {
        console.log('📤 Enviando pedido por WhatsApp...');
        
        if (this.cart.length === 0) {
            this.showNotification('El carrito está vacío', 'warning');
            return;
        }

        const phoneNumber = "5491112345678"; // Reemplazar con número real
        let message = "¡Hola! Quiero realizar el siguiente pedido:%0A%0A";
        
        this.cart.forEach((item, index) => {
            message += `*${index + 1}. ${item.name}*%0A`;
            message += `• Talla: ${item.selectedSize}%0A`;
            message += `• Color: ${item.selectedColor}%0A`;
            message += `• Cantidad: ${item.quantity}%0A`;
            message += `• Precio: $${item.price} c/u%0A`;
            message += `• Subtotal: $${(item.price * item.quantity).toFixed(2)}%0A%0A`;
        });

        message += `*TOTAL: $${this.getTotal().toFixed(2)}*%0A%0A`;
        message += "Por favor, confirmen disponibilidad y formas de pago. ¡Gracias!";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        this.showNotification('Pedido enviado por WhatsApp', 'success');
        
        // Cerrar carrito después de enviar
        this.closeCart();
    }

    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('¿Estás segura de que quieres vaciar el carrito?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            this.showNotification('Carrito vaciado', 'info');
        }
    }

    showAddToCartAnimation(product) {
        const anim = document.createElement('div');
        anim.className = 'add-to-cart-animation';
        anim.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <i class="fas fa-check"></i>
        `;
        
        document.body.appendChild(anim);

        setTimeout(() => anim.classList.add('active'), 100);
        setTimeout(() => {
            anim.classList.remove('active');
            setTimeout(() => {
                if (anim.parentNode) {
                    anim.parentNode.removeChild(anim);
                }
            }, 300);
        }, 2000);
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

// Inicializar carrito inmediatamente
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = new ShoppingCart();
    console.log('🛒 Carrito global disponible como window.shoppingCart');
});