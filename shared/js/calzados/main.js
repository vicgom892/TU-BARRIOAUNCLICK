// Main JavaScript para Elegance Shoes
class EleganceShoes {
    constructor() {
        this.products = [];
        this.cart = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupOfferTimer();
        this.loadKidsProducts();
        console.log('🛍️ Elegance Shoes inicializado');
    }
 
    // En la clase EleganceShoes, agregar:
loadKidsProducts() {
    this.kidsProducts = [
        {
            id: 101,
            name: "Zapato Infantil Brillante",
            category: "Kids",
            price: 29.99,
            originalPrice: 39.99,
            image: "../img/icon-192x192.png",
            badge: "Nuevo",
            rating: 4.9,
            sizes: [25, 26, 27, 28, 29],
            colors: ["Rosa", "Azul", "Blanco"],
            age: "3-6 años"
        },
        {
            id: 102,
            name: "Botita Infantil Invierno",
            category: "Kids",
            price: 34.99,
            originalPrice: 44.99,
            image: "../img/icon-192x192.png",
            badge: "Oferta",
            rating: 4.8,
            sizes: [26, 27, 28, 29, 30],
            colors: ["Rojo", "Negro", "Marrón"],
            age: "4-7 años"
        },
        {
            id: 103,
            name: "Sandalias Infantiles Verano",
            category: "Kids",
            price: 19.99,
            originalPrice: 24.99,
            image: "../img/icon-192x192.png",
            badge: "Verano",
            rating: 4.7,
            sizes: [24, 25, 26, 27],
            colors: ["Amarillo", "Celeste", "Rosa"],
            age: "2-5 años"
        },
        {
            id: 104,
            name: "Zapato Infantil Brillante",
            category: "Kids",
            price: 29.99,
            originalPrice: 39.99,
            image: "../img/icon-192x192.png",
            badge: "Nuevo",
            rating: 4.9,
            sizes: [25, 26, 27, 28, 29],
            colors: ["Rosa", "Azul", "Blanco"],
            age: "3-6 años"
        },
        {
            id: 105,
            name: "Botita Infantil Invierno",
            category: "Kids",
            price: 34.99,
            originalPrice: 44.99,
            image: "../img/icon-192x192.png",
            badge: "Oferta",
            rating: 4.8,
            sizes: [26, 27, 28, 29, 30],
            colors: ["Rojo", "Negro", "Marrón"],
            age: "4-7 años"
        },
        {
            id: 106,
            name: "Sandalias Infantiles Verano",
            category: "Kids",
            price: 19.99,
            originalPrice: 24.99,
            image: "../img/icon-192x192.png",
            badge: "Verano",
            rating: 4.7,
            sizes: [24, 25, 26, 27],
            colors: ["Amarillo", "Celeste", "Rosa"],
            age: "2-5 años"
        }
    ];

    this.renderKidsProducts();
}

// También actualizar renderKidsProducts de manera similar
renderKidsProducts() {
    const grid = document.getElementById('kidsProductsGrid');
    if (!grid || !this.kidsProducts) return;

    grid.innerHTML = this.kidsProducts.map(product => {
        const isFavorite = window.wishlistSystem?.isInWishlist(product.id) || false;
        
        return `
            <div class="col-lg-4 col-md-6">
                <div class="product-card kids-product">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder-kids.jpg'">
                        <span class="product-badge">${product.badge}</span>
                        <div class="product-age-badge">${product.age}</div>
                        <div class="product-actions">
                            <button class="btn quick-view-btn" data-product-id="${product.id}" title="Vista rápida">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn quick-view-btn" data-product-id="${product.id}" title="Vista rápida">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn wishlist-btn ${isFavorite ? 'favorited' : ''}" 
                                    data-product-id="${product.id}" 
                                    title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="btn" onclick="eleganceShoes.addToCart(${product.id})" title="Agregar al carrito">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">$${product.price}</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="original-price">$${product.originalPrice}</span>
                                 <span class="discount">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` 
                                : ''
                            }
                        </div>
                        <div class="product-rating">
                            ${this.generateStars(product.rating)}
                            <span class="rating-value">${product.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


    loadProducts() {
        // Productos de ejemplo - en producción vendrían de una API
        this.products = [
            {
                id: 1,
                name: "Tacón Aguja Elegante",
                category: "Tacones",
                price: 89.99,
                originalPrice: 119.99,
                image: "../img/icon-192x192.png",
                badge: "Nuevo",
                rating: 4.8,
                sizes: [35, 36, 37, 38, 39],
                colors: ["Negro", "Rojo", "Nude"]
            },
            {
                id: 2,
                name: "Ballet Flat Clásico",
                category: "Planos",
                price: 49.99,
                originalPrice: 69.99,
                image: "../img/icon-192x192.png",
                badge: "Oferta",
                rating: 4.6,
                sizes: [35, 36, 37, 38],
                colors: ["Negro", "Beige", "Rojo"]
            },
            {
                id: 3,
                name: "Bota de Cuero",
                category: "Botas",
                price: 129.99,
                originalPrice: 159.99,
                image: "../img/icon-192x192.png",
                badge: "Popular",
                rating: 4.9,
                sizes: [36, 37, 38, 39, 40],
                colors: ["Marrón", "Negro", "Café"]
            },
            {
                id: 4,
                name: "Sneaker Deportivo",
                category: "Deportivos",
                price: 59.99,
                originalPrice: 79.99,
                image: "../img/icon-192x192.png",
                badge: "Trending",
                rating: 4.7,
                sizes: [35, 36, 37, 38, 39],
                colors: ["Blanco", "Negro", "Rosa"]
            },
            {
                id: 5,
                name: "Sandalia Verano",
                category: "Planos",
                price: 39.99,
                originalPrice: 49.99,
                image: "../img/icon-192x192.png",
                badge: "Verano",
                rating: 4.5,
                sizes: ["35", "36", "37", "38", "39"],
                colors: ["Dorado", "Plateado", "Beige"]
            },
            {
                id: 6,
                name: "Tacón Block Moderno",
                category: "Tacones",
                price: 79.99,
                originalPrice: 99.99,
                image: "../img/icon-192x192.png",
                badge: "Exclusivo",
                rating: 4.8,
                sizes: ["35", "36", "37", "38", "39"],
                colors: ["Azul", "Negro", "Rojo"]
            }
        ];

        this.renderProducts();
    }

    // En la clase EleganceShoes, actualizar el renderProducts:
renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = this.products.map(product => {
        const isFavorite = window.wishlistSystem?.isInWishlist(product.id) || false;
        
        return `
            <div class="col-lg-4 col-md-6">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder-shoe.jpg'">
                        <span class="product-badge">${product.badge}</span>
                        <div class="product-actions">
                            <button class="btn quick-view-btn" data-product-id="${product.id}" title="Vista rápida">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn wishlist-btn ${isFavorite ? 'favorited' : ''}" 
                                    data-product-id="${product.id}" 
                                    title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="btn" onclick="eleganceShoes.addToCart(${product.id})" title="Agregar al carrito">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">$${product.price}</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="original-price">$${product.originalPrice}</span>
                                 <span class="discount">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` 
                                : ''
                            }
                        </div>
                        <div class="product-rating">
                            ${this.generateStars(product.rating)}
                            <span class="rating-value">${product.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

    setupEventListeners() {
        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Carrito
        document.getElementById('cartButton')?.addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.toggleCart());

        // Formulario de contacto
        document.querySelector('.contact-form')?.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }

    setupScrollEffects() {
        // Header sticky
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            const backToTop = document.getElementById('backToTop');
            
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                backToTop?.classList.add('show');
            } else {
                navbar.classList.remove('scrolled');
                backToTop?.classList.remove('show');
            }
        });

        // Back to top
        document.getElementById('backToTop')?.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Animaciones al scroll
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.category-card, .product-card, .testimonial-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupOfferTimer() {
        const timerElement = document.getElementById('offerTimer');
        if (!timerElement) return;

        const endTime = new Date();
        endTime.setHours(23, 59, 59); // Termina hoy a media noche

        const updateTimer = () => {
            const now = new Date();
            const difference = endTime - now;

            if (difference <= 0) {
                timerElement.textContent = '00:00:00';
                return;
            }

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }

     // En main.js, mantener la función addToCart simple:
addToCart(productId) {
    console.log('🛍️ Intentando agregar producto:', productId);
    
    const product = this.products.find(p => p.id === productId) || 
                   this.kidsProducts?.find(p => p.id === productId);
    
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        this.showNotification('Producto no encontrado', 'error');
        return;
    }

    if (window.shoppingCart) {
        window.shoppingCart.addItem(product);
        console.log('✅ Producto agregado al carrito:', product.name);
    } else {
        console.error('❌ shoppingCart no disponible');
        this.showNotification('Error al agregar al carrito', 'error');
    }
}

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar?.classList.toggle('active');
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartBody = document.getElementById('cartBody');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount) {
            cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        if (cartBody) {
            cartBody.innerHTML = this.cart.length === 0 ? 
                '<p class="text-center text-muted py-4">Tu carrito está vacío</p>' :
                this.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" width="60">
                        <div class="cart-item-info">
                            <h6>${item.name}</h6>
                            <small>Talla: ${item.selectedSize} | Color: ${item.selectedColor}</small>
                            <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="eleganceShoes.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
        }

        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2);
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
    }

    toggleWishlist(productId) {
        // Implementar funcionalidad de lista de deseos
        this.showNotification('Funcionalidad en desarrollo', 'info');
    }

    quickView(productId) {
        // Implementar vista rápida de producto
        this.showNotification('Vista rápida en desarrollo', 'info');
    }

    handleContactSubmit(e) {
        e.preventDefault();
        this.showNotification('Mensaje enviado correctamente', 'success');
        e.target.reset();
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
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

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.eleganceShoes = new EleganceShoes();
});

// Manejar errores de imágenes
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'images/placeholder-shoe.jpg';
    }
}, true);