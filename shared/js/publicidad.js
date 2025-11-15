
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar el slider con autoplay
            const swiper = new Swiper('.swiper', {
                loop: true, // Slider infinito
                autoplay: {
                    delay: 4000, // 4 segundos entre transiciones
                    disableOnInteraction: false, // Continúa después de interacción del usuario
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                },
                navigation: {
                    nextEl: '#publicidadNext',
                    prevEl: '#publicidadPrev',
                },
                speed: 800, // Velocidad de transición en ms
            });
            
            // Elementos del DOM
            const publicidadToggle = document.getElementById('publicidadToggle');
            const publicidadOverlay = document.getElementById('publicidadOverlay');
            const cerrarPublicidad = document.getElementById('cerrarPublicidad');
            const pauseAutoplay = document.getElementById('pauseAutoplay');
            const playAutoplay = document.getElementById('playAutoplay');
            
            // Abrir publicidad
            publicidadToggle.addEventListener('click', function() {
                publicidadOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevenir scroll del body
                
                // Reiniciar autoplay cuando se abre
                swiper.autoplay.start();
                updateAutoplayButtons(true);
            });
            
            // Cerrar publicidad
            cerrarPublicidad.addEventListener('click', function() {
                publicidadOverlay.classList.remove('active');
                document.body.style.overflow = 'auto'; // Restaurar scroll del body
                
                // Pausar autoplay cuando se cierra
                swiper.autoplay.stop();
            });
            
            // Cerrar publicidad al hacer clic fuera del slider
            publicidadOverlay.addEventListener('click', function(e) {
                if (e.target === publicidadOverlay) {
                    publicidadOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    swiper.autoplay.stop();
                }
            });
            
            // Cerrar publicidad con tecla Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && publicidadOverlay.classList.contains('active')) {
                    publicidadOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    swiper.autoplay.stop();
                }
            });
            
            // Control de autoplay - Pausar
            pauseAutoplay.addEventListener('click', function() {
                swiper.autoplay.stop();
                updateAutoplayButtons(false);
            });
            
            // Control de autoplay - Reproducir
            playAutoplay.addEventListener('click', function() {
                swiper.autoplay.start();
                updateAutoplayButtons(true);
            });
            
            // Función para actualizar los botones de autoplay
            function updateAutoplayButtons(isPlaying) {
                if (isPlaying) {
                    pauseAutoplay.style.display = 'flex';
                    playAutoplay.style.display = 'none';
                } else {
                    pauseAutoplay.style.display = 'none';
                    playAutoplay.style.display = 'flex';
                }
            }
            
            // Inicializar estado de los botones
            updateAutoplayButtons(true);
            
            // Pausar autoplay cuando el usuario interactúa con el slider
            swiper.on('touchStart', function() {
                swiper.autoplay.stop();
                updateAutoplayButtons(false);
            });
            
            // Reanudar autoplay después de un tiempo si el usuario no interactúa más
            swiper.on('touchEnd', function() {
                setTimeout(() => {
                    if (publicidadOverlay.classList.contains('active')) {
                        swiper.autoplay.start();
                        updateAutoplayButtons(true);
                    }
                }, 5000); // Reanuda después de 5 segundos de inactividad
            });
        });
    