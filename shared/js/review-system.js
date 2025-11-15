// Sistema de Reseñas Centralizado - Tu Barrio a un Clic
class ReviewSystem {
    constructor() {
        this.reviews = {};
        this.ratings = {};
        this.firebaseAvailable = false;
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            console.log('📥 Intentando conectar con Firebase...');
            
            const connectivityTest = await this.testFirebaseConnectivity();
            
            if (connectivityTest.success) {
                console.log('✅ Firebase disponible, cargando desde la nube...');
                await this.loadFromFirebase();
                this.firebaseAvailable = true;
            } else {
                throw new Error('Firebase no disponible');
            }
            
        } catch (error) {
            console.warn('❌ Usando modo offline:', error.message);
            this.firebaseAvailable = false;
            this.loadFromLocalStorage();
        }
        
        this.updateAllCardsUI();
    }

    async testFirebaseConnectivity() {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({ success: false, message: 'Timeout' });
            }, 5000);

            try {
                db.collection('reviews').limit(1).get()
                    .then(() => {
                        clearTimeout(timeout);
                        resolve({ success: true, message: 'Conectado' });
                    })
                    .catch(error => {
                        clearTimeout(timeout);
                        resolve({ success: false, message: error.message });
                    });
            } catch (error) {
                clearTimeout(timeout);
                resolve({ success: false, message: error.message });
            }
        });
    }

    async loadFromFirebase() {
        try {
            const reviewsSnapshot = await db.collection('reviews').get();
            this.reviews = {};
            reviewsSnapshot.forEach(doc => {
                const review = doc.data();
                const professionalId = review.professionalId;
                if (!this.reviews[professionalId]) {
                    this.reviews[professionalId] = [];
                }
                this.reviews[professionalId].push({ id: doc.id, ...review });
            });
            this.calculateAllRatings();
            console.log('✅ Reseñas cargadas correctamente desde Firebase');
        } catch (error) {
            throw new Error(`Error cargando desde Firebase: ${error.message}`);
        }
    }

    loadFromLocalStorage() {
        this.reviews = JSON.parse(localStorage.getItem('professionalReviews') || '{}');
        this.ratings = JSON.parse(localStorage.getItem('professionalRatings') || '{}');
        console.log('📱 Reseñas cargadas desde almacenamiento local');
    }

    async addReview(professionalId, rating, comment, userName = 'Anónimo') {
        const reviewData = {
            professionalId: professionalId,
            userName: userName,
            rating: rating,
            comment: comment,
            timestamp: new Date().toISOString(),
            verified: true
        };

        this.addReviewLocally(professionalId, reviewData);
        
        if (this.firebaseAvailable) {
            try {
                await this.syncWithFirebase(professionalId, reviewData);
                return { success: true, message: '✅ Reseña guardada en la nube' };
            } catch (error) {
                console.warn('⚠️ No se pudo sincronizar con Firebase:', error);
                this.firebaseAvailable = false;
                return { success: true, message: '📱 Reseña guardada localmente' };
            }
        } else {
            return { success: true, message: '📱 Reseña guardada localmente' };
        }
    }

    addReviewLocally(professionalId, reviewData) {
        const reviewId = 'review_' + Date.now();
        const review = { id: reviewId, ...reviewData };
        
        if (!this.reviews[professionalId]) {
            this.reviews[professionalId] = [];
        }
        this.reviews[professionalId].push(review);
        localStorage.setItem('professionalReviews', JSON.stringify(this.reviews));
        this.updateProfessionalRating(professionalId);
    }

    async syncWithFirebase(professionalId, reviewData) {
        try {
            await db.collection('reviews').add(reviewData);
            console.log('✅ Reseña sincronizada con Firebase');
        } catch (error) {
            throw new Error(`Error sincronizando con Firebase: ${error.message}`);
        }
    }

    calculateAllRatings() {
        this.ratings = {};
        Object.keys(this.reviews).forEach(professionalId => {
            const reviews = this.reviews[professionalId];
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;
            this.ratings[professionalId] = {
                averageRating: parseFloat(averageRating),
                totalReviews: reviews.length,
                lastUpdated: new Date().toISOString()
            };
        });
        localStorage.setItem('professionalRatings', JSON.stringify(this.ratings));
    }

    getReviews(professionalId) {
        return this.reviews[professionalId] || [];
    }

    async updateProfessionalRating(professionalId) {
        const reviews = this.getReviews(professionalId);
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;
        this.ratings[professionalId] = {
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('professionalRatings', JSON.stringify(this.ratings));
        this.updateProfessionalCardUI(professionalId, averageRating, reviews.length);
    }

    updateProfessionalCardUI(professionalId, rating, totalReviews) {
        const cards = document.querySelectorAll(`[data-professional-id="${professionalId}"]`);
        
        cards.forEach(card => {
            const ratingElement = card.querySelector('.professional-rating');
            if (ratingElement) {
                ratingElement.innerHTML = this.generateStarRating(rating, totalReviews);
            }
        });
        
        const modalContent = document.getElementById('modalCardContent');
        if (modalContent && modalContent.querySelector('.professional-rating')) {
            const currentModalProfessional = modalContent.querySelector('[data-professional-id]');
            if (currentModalProfessional && currentModalProfessional.dataset.professionalId === professionalId) {
                const modalRatingElement = modalContent.querySelector('.professional-rating');
                modalRatingElement.innerHTML = this.generateStarRating(rating, totalReviews);
                
                const reviewsSection = modalContent.querySelector('.reviews-section');
                if (reviewsSection) {
                    const reviewsHTML = this.generateReviewsHTML(professionalId);
                    reviewsSection.innerHTML = `<h5>Reseñas de Clientes</h5>${reviewsHTML}`;
                }
            }
        }
    }

    updateAllCardsUI() {
        console.log('🔄 Actualizando UI de todas las tarjetas...');
        
        Object.keys(this.ratings).forEach(professionalId => {
            const rating = this.ratings[professionalId];
            this.updateProfessionalCardUI(professionalId, rating.averageRating, rating.totalReviews);
        });
        
        const allProfessionalIds = [...new Set(Object.values(this.reviews).flat().map(r => r.professionalId))];
        allProfessionalIds.forEach(professionalId => {
            if (!this.ratings[professionalId]) {
                this.updateProfessionalCardUI(professionalId, 0, 0);
            }
        });
    }

    generateStarRating(rating, totalReviews) {
        const numericRating = parseFloat(rating);
        
        if (totalReviews === 0) {
            return '<span class="text-muted">Sin reseñas aún</span>';
        }
        
        const stars = [];
        const fullStars = Math.floor(numericRating);
        const hasHalfStar = numericRating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star text-warning"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt text-warning"></i>');
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="far fa-star text-warning"></i>');
        }
        
        return `${stars.join('')} <span class="text-muted ms-2">${numericRating.toFixed(1)} • ${totalReviews} ${totalReviews === 1 ? 'reseña' : 'reseñas'}</span>`;
    }

    generateReviewsHTML(professionalId) {
        const reviews = this.getReviews(professionalId);
        if (reviews.length === 0) {
            return '<div class="no-reviews">Aún no hay reseñas para este profesional.</div>';
        }
        const sortedReviews = reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return sortedReviews.map(review => {
            let reviewHTML = `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-author">${review.userName}</span>
                        <span class="review-date">${new Date(review.timestamp).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div class="review-rating">
                        ${this.generateStarRating(review.rating, 0).replace(/<span class="text-muted ms-2">.*?<\/span>/, '')}
                    </div>`;
            if (review.comment) {
                reviewHTML += `<div class="review-comment">${review.comment}</div>`;
            }
            reviewHTML += `</div>`;
            return reviewHTML;
        }).join('');
    }

    // Función para resetear reseñas
    resetAllReviews() {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las reseñas? Esto no se puede deshacer.')) {
            this.reviews = {};
            this.ratings = {};
            localStorage.removeItem('professionalReviews');
            localStorage.removeItem('professionalRatings');
            
            this.updateAllCardsUI();
            alert('✅ Todas las reseñas han sido eliminadas');
            location.reload();
        }
    }
}

// Inicialización global
let reviewSystem;

document.addEventListener('DOMContentLoaded', function() {
    reviewSystem = new ReviewSystem();
    window.reviewSystem = reviewSystem;
});