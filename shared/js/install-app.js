// install-app.js - Versión OFICIAL + Periodic Sync (CORREGIDA)
// ========================================================================

let deferredPrompt = null;

// === DETECCIÓN DE DISPOSITIVO ===
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// === FUNCIÓN: ¿LA PWA YA ESTÁ INSTALADA? ===
function checkIfPWAInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    if (window.navigator.standalone === true) {
        return true;
    }
    if (document.referrer.includes('android-app://') || 
        navigator.userAgent.includes('wv') || 
        navigator.userAgent.includes('Android') && 
        window.matchMedia('(display-mode: browser)').matches === false) {
        return true;
    }
    return false;
}

// === MODAL: INSTRUCCIONES MANUALES ===
function showManualInstallInstructions() {
    let installModal = document.getElementById('manualInstallModal');
    
    if (!installModal) {
        installModal = document.createElement('div');
        installModal.id = 'manualInstallModal';
        installModal.className = 'modal fade';
        installModal.tabIndex = -1;
        installModal.setAttribute('role', 'dialog'); // CORREGIDO: era "installModal role ="
        installModal.innerHTML = `
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-mobile-alt me-2"></i>Instalar Tu Barrio A Un Clik
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fab fa-android text-success me-2"></i>Android / Chrome</h6>
                                <ol class="small">
                                    <li>Tocá el menú <strong>(tres puntos)</strong> en la esquina superior derecha</li>
                                    <li>Seleccioná <strong>"Agregar a pantalla de inicio"</strong></li>
                                    <li>Confirmá con <strong>"Agregar"</strong></li>
                                </ol>
                                <div class="alert alert-info small mt-2">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Si no ves la opción, buscá "Instalar app" o "Add to Home Screen"
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fab fa-apple text-dark me-2"></i>iPhone / Safari</h6>
                                <ol class="small">
                                    <li>Tocá el ícono de <strong>compartir (cuadrado con flecha)</strong></li>
                                    <li>Deslizá hacia abajo y seleccioná <strong>"Agregar a pantalla de inicio"</strong></li>
                                    <li>Confirmá con <strong>"Agregar"</strong></li>
                                </ol>
                                <div class="alert alert-info small mt-2">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Asegurate de usar <strong>Safari</strong>, no otros navegadores
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-light rounded text-center">
                            <h6 class="mb-3">¿Por qué instalar la app?</h6>
                            <div class="row text-center small">
                                <div class="col-4">
                                    <i class="fas fa-bolt text-warning fa-2x mb-1"></i>
                                    <div><strong>Más rápida</strong></div>
                                </div>
                                <div class="col-4">
                                    <i class="fas fa-bell text-primary fa-2x mb-1"></i>
                                    <div><strong>Notificaciones</strong></div>
                                </div>
                                <div class="col-4">
                                    <i class="fas fa-wifi text-success fa-2x mb-1"></i>
                                    <div><strong>Funciona offline</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="checkInstallationStatus()">
                            <i class="fas fa-sync me-1"></i>Verificar instalación
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(installModal);
    }
    
    const modal = new bootstrap.Modal(installModal);
    modal.show();
}

// === VERIFICAR ESTADO DE INSTALACIÓN ===
function checkInstallationStatus() {
    const installButton = document.getElementById('botonInstalar') || 
                         document.getElementById('botonInstalarMobile');
    
    if (checkIfPWAInstalled()) {
        if (installButton) {
            installButton.innerHTML = '<i class="fas fa-check me-1"></i>¡App Instalada!';
            installButton.className = installButton.className.replace('btn-success', 'btn-secondary');
            installButton.disabled = true;
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('manualInstallModal'));
        if (modal) modal.hide();
        
        showToast('¡La app ya está instalada en tu dispositivo!', 'success');
    } else {
        showToast('La app aún no está instalada. Seguí las instrucciones.', 'warning');
    }
}

// === TOAST PERSONALIZADO ===
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.role = "alert";
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// === MANEJAR INSTALACIÓN PWA ===
async function handlePWAInstallation(installButton) {
    if (!deferredPrompt) {
        console.log('No hay prompt de instalación disponible');
        showManualInstallInstructions();
        return;
    }
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`Usuario ${outcome} la instalación`);
        
        if (outcome === 'accepted') {
            installButton.innerHTML = '<i class="fas fa-check me-1"></i>¡App Instalada!';
            installButton.className = installButton.className.replace('btn-success', 'btn-secondary');
            installButton.disabled = true;
            showToast('¡App instalada correctamente!', 'success');
        } else {
            showToast('Instalación cancelada. Podés intentarlo más tarde.', 'warning');
            setTimeout(() => {
                if (!checkIfPWAInstalled()) {
                    installButton.innerHTML = '<i class="fas fa-download me-1"></i>Instalar App';
                    installButton.disabled = false;
                }
            }, 3000);
        }
        
        deferredPrompt = null;
    } catch (error) {
        console.error('Error durante la instalación:', error);
        showManualInstallInstructions();
    }
}

// === INICIALIZAR BOTONES DE INSTALACIÓN ===
function initInstallButton() {
    const installButton = document.getElementById('botonInstalar');
    const mobileInstallButton = document.getElementById('botonInstalarMobile');
    const installButtons = [];
    
    if (installButton) installButtons.push(installButton);
    if (mobileInstallButton) installButtons.push(mobileInstallButton);
    
    if (installButtons.length === 0) return;
    
    if (checkIfPWAInstalled()) {
        installButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-check me-1"></i>¡App Instalada!';
            btn.className = btn.className.replace('btn-success', 'btn-secondary');
            btn.disabled = true;
        });
        return;
    }
    
    installButtons.forEach(btn => {
        if (isIOS) {
            btn.innerHTML = '<i class="fas fa-plus-circle me-1"></i>Agregar a pantalla de inicio';
            btn.addEventListener('click', e => {
                e.preventDefault();
                showManualInstallInstructions();
            });
        } else {
            btn.addEventListener('click', () => handlePWAInstallation(btn));
        }
    });
}

// === NUEVO: REGISTRAR PERIODIC SYNC ===
async function registerPeriodicSync() {
    if (!('serviceWorker' in navigator) || !('PeriodicSyncManager' in window)) {
        console.log('Periodic Background Sync no soportado');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.periodicSync.register('update-offers', {
            minInterval: 6 * 60 * 60 * 1000 // 6 horas
        });
        console.log('Periodic Sync registrado: update-offers');
        showToast('Ofertas se actualizarán automáticamente', 'info');
    } catch (error) {
        if (error.name !== 'InvalidStateError') {
            console.error('Error en Periodic Sync:', error);
        }
    }
}

// === EVENTO: beforeinstallprompt ===
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;
    
    const installButtons = [
        document.getElementById('botonInstalar'),
        document.getElementById('botonInstalarMobile')
    ];
    
    installButtons.forEach(btn => {
        if (btn && !checkIfPWAInstalled()) {
            btn.style.display = 'block';
            btn.disabled = false;
        }
    });
    
    setTimeout(() => {
        if (deferredPrompt && !checkIfPWAInstalled()) {
            showToast('¡Podés instalar la app en tu dispositivo!', 'info');
        }
    }, 2000);
});

// === EVENTO: appinstalled ===
window.addEventListener('appinstalled', () => {
    console.log('Tu Barrio A Un Click instalada');
    deferredPrompt = null;
    
    const installButtons = [
        document.getElementById('botonInstalar'),
        document.getElementById('botonInstalarMobile')
    ];
    
    installButtons.forEach(btn => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check me-1"></i>¡App Instalada!';
            btn.className = btn.className.replace('btn-success', 'btn-secondary');
            btn.disabled = true;
        }
    });
    
    // CORREGIDO: era "show Tost"
    showToast('¡App instalada! Accedé desde tu pantalla de inicio.', 'success');
    
    // Registrar sync después de instalar
    setTimeout(registerPeriodicSync, 1000);
});

// === MONITOREO PERIÓDICO ===
function monitorInstallationStatus() {
    setInterval(() => {
        if (checkIfPWAInstalled()) {
            const installButtons = [
                document.getElementById('botonInstalar'),
                document.getElementById('botonInstalarMobile')
            ];
            installButtons.forEach(btn => {
                if (btn && !btn.disabled) {
                    btn.innerHTML = '<i class="fas fa-check me-1"></i>¡App Instalada!';
                    btn.className = btn.className.replace('btn-success', 'btn-secondary');
                    btn.disabled = true;
                }
            });
        }
    }, 5000);
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    initInstallButton();
    monitorInstallationStatus();
    
    setTimeout(() => {
        if (checkIfPWAInstalled()) {
            console.log('La app ya está instalada');
            registerPeriodicSync();
        }
    }, 1000);
});

// === EXPORTAR FUNCIONES GLOBALES ===
window.installApp = {
    checkInstallationStatus,
    showManualInstallInstructions,
    checkIfPWAInstalled,
    registerPeriodicSync
};