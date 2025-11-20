// chat.js - VERSIÓN COMPLETA OPTIMIZADA CON SISTEMA DE VOZ MEJORADO
document.addEventListener('DOMContentLoaded', function() {
  // === VARIABLES GLOBALES ===
  let negociosData = [];
  let ofertasData = [];
  let conversationHistory = [];
  let userPreferences = {};
  let isClearing = false;

  // === NUEVAS VARIABLES PARA CACHE ===
  let negociosCache = null;
  let lastLoadTime = 0;
  const CACHE_DURATION = 30000; // 30 segundos de cache

  // === VARIABLES PARA SISTEMA DE VOZ ===
  let recognition = null;
  let synthesis = null;
  let isListening = false;
  let voiceEnabled = false;
  let isSpeaking = false; // Control de estado de habla

  // === ELEMENTOS DEL DOM ===
  const chatbotBtn = document.getElementById('chatbotBtn');
  const chatContainer = document.getElementById('chatContainer');
  const closeChat = document.getElementById('closeChat');
  const chatBody = document.getElementById('chatBody');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');

  // === SISTEMA DE INTELIGENCIA MEJORADO ===
  const intelligentResponses = {
    greetings: {
      patterns: [
        /hola|buen(os|as)|saludos|hey|hi|qué tal|como estás/i,
        /buen día|buena tarde|buena noche/i,
        /empezar|comenzar|inicio/i
      ],
      responses: [
        "¡Hola! 👋 Soy tu asistente inteligente de *Tu Barrio A Un Clik*. ¡Estoy aquí para ayudarte a descubrir todo lo que tu barrio tiene para ofrecer!",
        "¡Hola! 😊 Me alegra verte. Tengo información actualizada de comercios, ofertas y servicios en tu zona. ¿En qué te puedo ayudar hoy?",
        "¡Buen día! 🌟 Soy tu guía virtual del barrio. Puedo mostrarte comercios, ofertas especiales y conectarte con emprendedores locales."
      ]
    },
    help: {
      patterns: [
        /ayuda|qué puedes hacer|funciones|opciones|comandos/i,
        /cómo funciona|qué ofrece|para qué sirves/i
      ],
      responses: [
        `🛠️ **Puedo ayudarte con:**\n\n• 🏪 **NEGOCIOS**: Ver todos los comercios con info completa\n• 🎁 **OFERTAS**: Promociones y descuentos activos\n• 🛠️ **OFICIOS**: Profesionales y servicios locales\n• 💡 **EMPRENDIMIENTOS**: Ideas y proyectos innovadores\n• 📝 **INSCRIPCIÓN**: Registrar tu negocio\n• 💬 **SOPORTE**: Contactar directamente\n\n¿Qué te interesa explorar?`,
        "Soy tu asistente multipropósito. Puedo mostrarte comercios locales, ofertas exclusivas, conectar con profesionales, emprendimientos y mucho más. ¡Solo dime qué necesitas!",
        "Mis funciones principales:\n• Directorio comercial inteligente\n• Ofertas y promociones\n• Servicios profesionales\n• Emprendimientos locales\n• Soporte inmediato\n\n¿Por dónde quieres empezar?"
      ]
    },
    thanks: {
      patterns: [
        /gracias|grac|agradecido|agradecimiento|thank you|thanks/i,
        /genial|increíble|fantástico|excelente|perfecto|maravilloso/i
      ],
      responses: [
        "¡De nada! 😊 Me alegra poder ayudarte. ¿Necesitas algo más?",
        "¡Es un placer! 🌟 No dudes en consultarme si necesitas otra cosa.",
        "¡Para eso estoy! 💫 Recuerda que siempre estoy aquí para ayudarte."
      ]
    },
    goodbye: {
      patterns: [
        /chau|adiós|bye|nos vemos|hasta luego|terminar|salir/i,
        /hasta pronto|hasta la próxima|me voy/i
      ],
      responses: [
        "¡Hasta luego! 👋 ¡Que tengas un excelente día!",
        "¡Chau! 😊 Vuelve cuando necesites ayuda con los comercios del barrio.",
        "¡Nos vemos! 🌟 Recuerda que estoy aquí para ayudarte cuando lo necesites."
      ]
    }
  };

  // === CATEGORÍAS AMPLIADAS ===
  const categoryKeywords = {
    'Panadería': ['panadería', 'panaderias', 'pan', 'panes', 'pastel', 'torta', 'bizcocho', 'medialuna', 'factura', 'molino', 'horno', 'repostería', 'dulces'],
    'Fábrica de Pastas': ['fábrica de pastas', 'fabrica de pastas', 'pasta', 'ravioles', 'ñoquis', 'tallarines', 'macarrones', 'canelones', 'lasaña', 'pastas caseras'],
    'Verdulería': ['verdulería', 'verdulerias', 'verdura', 'fruta', 'hortaliza', 'mercado', 'frutería', 'fruterias', 'vegetales', 'legumbres'],
    'Fiambrería': ['fiambrería', 'fiambrerias', 'fiambre', 'embutido', 'queso', 'jamón', 'mortadela', 'salame', 'chorizo', 'longaniza', 'quesos', 'embutidos'],
    'Kiosco': ['kiosco', 'quiosco', 'cigarrillos', 'golosinas', 'revistas', 'bebida', 'chicles', 'azúcar', 'papel', 'lápiz', 'diarios', 'golosina'],
    'Mascotas': ['mascota', 'mascotas', 'perro', 'gato', 'alimento animal', 'veterinario', 'peluquería canina', 'tienda de mascotas', 'accesorios mascotas', 'veterinaria'],
    'Calzados': [
      'calzado', 'calzados', 'zapato', 'zapatos', 'zapatilla', 'zapatillas',
      'bota', 'botas', 'botín', 'botines', 'sandalia', 'sandalias',
      'ojota', 'ojotas', 'chancleta', 'chancletas', 'pantufla', 'pantuflas',
      'tacones', 'tacón', 'deportivo', 'deportivos', 'tenis', 'calzado deportivo',
      'calzado casual', 'calzado formal', 'calzado infantil', 'calzado para hombre',
      'calzado para mujer', 'calzado para niño', 'calzado escolar', 'calzado de trabajo',
      'calzado de seguridad', 'calzado ortopédico', 'calzado cómodo', 'calzado elegante',
      'marcas de zapatos', 'venta de zapatos', 'zapatería', 'zapaterías'
    ],
    'Barbería': ['barbería', 'barberias', 'corte de pelo', 'barbero', 'peluquería hombre', 'peluqueria hombre', 'afeitado', 'bigote', 'barba', 'estilista'],
    'Ferretería': ['ferretería', 'ferreterias', 'herramientas', 'clavo', 'tornillo', 'cable', 'electricidad', 'llave', 'martillo', 'serrucho', 'materiales'],
    'Ropa': ['ropa', 'tienda de ropa', 'camisa', 'pantalón', 'zapatillas', 'moda', 'prendas', 'vestimenta', 'calzado', 'accesorios', 'indumentaria'],
    'Servicios': ['servicio', 'reparación', 'taller', 'mantenimiento', 'limpieza', 'electricista', 'plomero', 'fontanero', 'cerrajero', 'albañil', 'técnico'],
    'Farmacia': ['farmacia', 'farmacias', 'droguería', 'droguerias', 'medicamento', 'remedio', 'pastilla', 'analgésico', 'paracetamol', 'ibuprofeno', 'vitaminas', 'antibiótico'],
    'Cafetería': ['cafetería', 'cafeterias', 'café', 'desayuno', 'espresso', 'latte', 'tostadas', 'croissant', 'bombón', 'helado', 'merienda'],
    'Taller Mecánico': ['taller mecánico', 'taller mecanico', 'mecánico', 'mecanico', 'auto', 'coche', 'neumático', 'neumatico', 'repuesto', 'aceite', 'batería', 'bateria'],
    'Librería': ['librería', 'librerias', 'libro', 'cuaderno', 'escritura', 'papel', 'lapicera', 'bolígrafo', 'boligrafo', 'regla', 'goma', 'útiles'],
    'Mates': ['mate', 'yerba', 'termo', 'bombilla', 'mate cocido', 'maté', 'cebador', 'agua caliente', 'yerba mate'],
    'Florería': ['florería', 'florerias', 'flor', 'rosa', 'ramo', 'flores', 'regalo', 'cumpleaños', 'aniversario', 'bouquet', 'arreglos'],
    'Carnicería': ['carnicería', 'carnicerias', 'carne', 'pollo', 'cerdo', 'vacuno', 'bife', 'churrasco', 'costilla', 'molleja', 'hígado', 'carnes'],
    'Granjas': ['granja', 'granjas', 'agricultura', 'campo', 'productor', 'hortalizas', 'cultivo', 'ganadería', 'animal', 'pollitos', 'huevos', 'leche', 'queso artesanal', 'productos frescos'],
    'Muebles': ['mueble', 'muebles', 'silla', 'mesa', 'sofá', 'armario', 'cómoda', 'cama', 'estante', 'mobiliario', 'decoración', 'hogar', 'juego de sala', 'comedor', 'living'],
    'Uñas': ['uñas', 'esmaltado', 'manicura', 'pedicura', 'uñas acrílicas', 'uñas gel', 'salón de uñas', 'nail', 'bellas artes', 'decoración de uñas', 'extensión de uñas'],
    'Comidas': ['comida', 'comidas', 'restaurante', 'comedor', 'comida rápida', 'delivery', 'almuerzo', 'cena', 'menú', 'plato', 'cocina', 'gastronomía', 'picada', 'asado', 'parrilla', 'comida casera', 'comida argentina'],
    'Oficios': [
      'oficio', 'oficios', 'albañil', 'albañiles', 'cerrajero', 'cerrajeros', 'electricista', 'electricistas',
      'herrero', 'herreros', 'jardinero', 'jardineros', 'limpieza', 'limpiador', 'mecánico', 'mecánicos',
      'pintor', 'pintores', 'plomero', 'plomeros', 'fontanero', 'transporte', 'camión', 'flete', 'delivery local'
    ],
    'Emprendimientos': [
      'emprendimiento', 'emprendimientos', 'gastronomía', 'gastronomico', 'artesanía', 'artesanal', 'moda',
      'tecnología', 'servicios', 'belleza', 'educación', 'hogar', 'mascotas', 'manualidades', 'diseño', 'cosmética',
      'cursos', 'talleres', 'decoración', 'ropa artesanal', 'comida casera', 'emprendedor'
    ]
  };

  // === FUNCIONES AUXILIARES ===
  function normalizeString(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
  }

  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  function findCategoryByQuery(query) {
    const normalizedQuery = normalizeString(query);
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        const normalizedKeyword = normalizeString(keyword);
        if (normalizedQuery === normalizedKeyword || 
            normalizedQuery.includes(normalizedKeyword) || 
            normalizedKeyword.includes(normalizedQuery)) {
          return category;
        }
      }
    }
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        const normalizedKeyword = normalizeString(keyword);
        if (calculateSimilarity(normalizedQuery, normalizedKeyword) > 0.8) {
          return category;
        }
      }
    }
    
    return null;
  }

  // === SISTEMA DE VOZ COMPLETO MEJORADO ===

  // === INICIALIZACIÓN DEL SISTEMA DE VOZ ===
  function initVoiceSystem() {
    initSpeechRecognition();
    initSpeechSynthesis();
  }

  // === RECONOCIMIENTO DE VOZ (HABLAR AL CHATBOT) ===
  function initSpeechRecognition() {
    try {
      // Verificar compatibilidad del navegador
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configuración
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        recognition.maxAlternatives = 1;
        
        // Eventos
        recognition.onstart = function() {
          console.log('🎤 Reconocimiento de voz iniciado');
          isListening = true;
          updateMicButton();
          showVoiceListeningIndicator();
        };
        
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          console.log('📝 Texto reconocido:', transcript);
          
          // Mostrar texto reconocido
          showRecognizedText(transcript);
          
          // Procesar después de un pequeño delay
          setTimeout(() => {
            messageInput.value = transcript;
            handleSendMessage();
          }, 500);
        };
        
        recognition.onerror = function(event) {
          console.error('❌ Error en reconocimiento de voz:', event.error);
          isListening = false;
          updateMicButton();
          hideVoiceListeningIndicator();
          
          let errorMessage = 'Error en el micrófono: ';
          switch(event.error) {
            case 'not-allowed':
            case 'permission-denied':
              errorMessage += 'Permiso denegado. Por favor, permite el acceso al micrófono.';
              break;
            case 'no-speech':
              errorMessage += 'No se detectó voz. Intenta nuevamente.';
              break;
            case 'audio-capture':
              errorMessage += 'No se pudo acceder al micrófono.';
              break;
            case 'network':
              errorMessage += 'Error de red.';
              break;
            default:
              errorMessage += event.error;
          }
          
          addMessage(`❌ ${errorMessage}`, 'bot');
        };
        
        recognition.onend = function() {
          console.log('🔴 Reconocimiento de voz finalizado');
          isListening = false;
          updateMicButton();
          hideVoiceListeningIndicator();
        };
        
      } else {
        console.warn('⚠️ El reconocimiento de voz no es compatible con este navegador');
        addMessage('❌ Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.', 'bot');
      }
    } catch (error) {
      console.error('❌ Error al inicializar reconocimiento de voz:', error);
      addMessage('❌ Error al configurar el micrófono. Intenta recargar la página.', 'bot');
    }
  }

  // === SÍNTESIS DE VOZ (CHATBOT HABLA) ===
  function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      synthesis = window.speechSynthesis;
      console.log('✅ Síntesis de voz disponible');
    } else {
      console.warn('⚠️ La síntesis de voz no es compatible');
    }
  }

  // === FUNCIÓN PARA HABLAR TEXTO - VERSIÓN MEJORADA ===
  function speakText(text) {
    if (!voiceEnabled || !synthesis) return;
    
    try {
      // Limpiar texto (remover emojis y formato)
      const cleanText = text
        .replace(/[^\w\s¡!¿?.,;:áéíóúÁÉÍÓÚñÑ()\-]/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .trim();
      
      if (!cleanText) return;
      
      // Esperar un momento antes de cancelar para evitar interrupciones bruscas
      setTimeout(() => {
        // Solo cancelar si hay algo reproduciéndose
        if (synthesis.speaking) {
          synthesis.cancel();
        }
        
        // Pequeña pausa antes de empezar a hablar
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          
          // Configuración de voz en español
          utterance.lang = 'es-ES';
          utterance.rate = 0.9; // Un poco más lento para mejor comprensión
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          // Seleccionar voz en español si está disponible
          const voices = synthesis.getVoices();
          const spanishVoice = voices.find(voice => 
            voice.lang.includes('es') && voice.localService === false
          );
          
          if (spanishVoice) {
            utterance.voice = spanishVoice;
          }
          
          // Eventos de la síntesis - CON MANEJO DE ERRORES MEJORADO
          utterance.onstart = function() {
            console.log('🔊 Reproduciendo audio...');
            isSpeaking = true;
          };
          
          utterance.onend = function() {
            console.log('✅ Audio finalizado correctamente');
            isSpeaking = false;
          };
          
          utterance.onerror = function(event) {
            isSpeaking = false;
            // Ignorar errores "interrupted" ya que son normales
            if (event.error !== 'interrupted') {
              console.error('❌ Error en síntesis de voz:', event.error);
            } else {
              console.log('⏸️ Audio interrumpido (normal al cambiar mensajes)');
            }
          };
          
          // Reproducir con manejo de errores
          try {
            synthesis.speak(utterance);
          } catch (error) {
            console.warn('⚠️ Error al reproducir audio:', error);
          }
          
        }, 100); // Pequeña pausa
      }, 50);
      
    } catch (error) {
      console.error('❌ Error general en speakText:', error);
    }
  }

  // === TOGGLE VOZ MEJORADO ===
  function toggleVoiceResponse() {
    voiceEnabled = !voiceEnabled;
    updateVoiceButton();
    
    if (voiceEnabled) {
      addMessage('🔊 **Voz activada** - Ahora escucharás las respuestas por audio', 'bot');
      // Pequeño delay antes de hablar para evitar conflictos
      setTimeout(() => {
        speakText('Voz activada. Ahora escucharás las respuestas por audio.');
      }, 500);
    } else {
      addMessage('🔇 **Voz desactivada** - Respuestas solo en texto', 'bot');
      // Detener cualquier audio en reproducción de forma suave
      if (synthesis && synthesis.speaking) {
        setTimeout(() => {
          synthesis.cancel();
        }, 100);
      }
    }
  }

  // === CONTROL DEL MICRÓFONO ===
  function toggleVoiceRecognition() {
    if (!recognition) {
      initSpeechRecognition();
      // Esperar un momento para la inicialización
      setTimeout(() => {
        if (recognition) {
          startVoiceRecognition();
        }
      }, 100);
      return;
    }
    
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  }

  function startVoiceRecognition() {
    try {
      recognition.start();
    } catch (error) {
      console.error('❌ Error al iniciar reconocimiento:', error);
      addMessage('❌ Error al activar el micrófono. Intenta nuevamente.', 'bot');
    }
  }

  function stopVoiceRecognition() {
    try {
      recognition.stop();
    } catch (error) {
      console.error('❌ Error al detener reconocimiento:', error);
    }
  }

  // === ACTUALIZAR ESTADO DE BOTONES ===
  function updateMicButton() {
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      if (isListening) {
        micBtn.classList.add('listening');
        micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        micBtn.title = 'Detener grabación';
      } else {
        micBtn.classList.remove('listening');
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        micBtn.title = 'Hablar con el chatbot';
      }
    }
  }

  function updateVoiceButton() {
    const voiceBtn = document.getElementById('voiceToggleBtn');
    if (voiceBtn) {
      if (voiceEnabled) {
        voiceBtn.classList.add('active');
        voiceBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        voiceBtn.title = 'Desactivar respuesta por voz';
      } else {
        voiceBtn.classList.remove('active');
        voiceBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        voiceBtn.title = 'Activar respuesta por voz';
      }
    }
  }

  // === INDICADOR VISUAL DE GRABACIÓN ===
  function showVoiceListeningIndicator() {
    let indicator = document.getElementById('voiceListeningIndicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'voiceListeningIndicator';
      indicator.className = 'voice-listening-indicator';
      indicator.innerHTML = `
        <div class="listening-animation">
          <div class="pulse"></div>
          <div class="pulse"></div>
          <div class="pulse"></div>
        </div>
        <span>Escuchando... Habla ahora</span>
      `;
      
      const chatBody = document.getElementById('chatBody');
      if (chatBody) {
        chatBody.appendChild(indicator);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
    
    indicator.style.display = 'flex';
  }

  function hideVoiceListeningIndicator() {
    const indicator = document.getElementById('voiceListeningIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  function showRecognizedText(text) {
    let recognizedText = document.getElementById('recognizedText');
    
    if (!recognizedText) {
      recognizedText = document.createElement('div');
      recognizedText.id = 'recognizedText';
      recognizedText.className = 'recognized-text-indicator';
      
      const chatBody = document.getElementById('chatBody');
      if (chatBody) {
        chatBody.appendChild(recognizedText);
      }
    }
    
    recognizedText.innerHTML = `
      <div class="recognized-text">
        <i class="fas fa-microphone"></i>
        <strong>Dijiste:</strong> "${text}"
      </div>
    `;
    recognizedText.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      recognizedText.style.display = 'none';
    }, 3000);
  }

  // === FUNCIONES DE MENSAJES ===
  function formatMessageLinks(message) {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let processedMessage = message.replace(markdownLinkRegex, (match, text, url) => {
      const cleanUrl = url.trim().replace(/\s+/g, '');
      
      if (cleanUrl.includes('inscripcion.html')) {
        return `<a href="inscripcion.html" target="_blank" class="chat-link">${text}</a>`;
      }
      
      if (cleanUrl.includes('wa.me') || cleanUrl.includes('whatsapp')) {
        return `<a href="https://wa.me/5491157194796" target="_blank" class="chat-link">${text}</a>`;
      }
      
      return `<a href="${cleanUrl}" target="_blank" class="chat-link">${text}</a>`;
    });

    const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:!?])/g;
    processedMessage = processedMessage.replace(urlRegex, url => {
      const cleanUrl = url.trim().replace(/\s+/g, '');
      return `<a href="${cleanUrl}" target="_blank" class="chat-link">${url}</a>`;
    });

    return processedMessage;
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender} message-animation`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessageLinks(text);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'bot') {
      const aiDiv = document.createElement('div');
      aiDiv.className = 'ai-indicator';
      aiDiv.innerHTML = `
        <span class="ai-dot"></span>
        <span class="ai-dot"></span>
        <span class="ai-dot"></span>
        <small>Asistente Inteligente</small>
      `;
      messageDiv.appendChild(aiDiv);
      
      // Reproducir audio si la voz está activada - CON DELAY MEJORADO
      if (voiceEnabled && text) {
        setTimeout(() => {
          // Esperar un poco más si ya se está hablando
          const delay = isSpeaking ? 1000 : 500;
          setTimeout(() => {
            speakText(text);
          }, delay);
        }, 500);
      }
    }
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatBody.appendChild(messageDiv);
    
    if (sender === 'user') {
      const existingQuickReplies = document.querySelector('.quick-replies');
      if (existingQuickReplies) {
        existingQuickReplies.remove();
      }
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'typing-dots';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      dotsDiv.appendChild(dot);
    }
    
    typingDiv.appendChild(dotsDiv);
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  // === FUNCIÓN DE BORRAR BÚSQUEDAS CORREGIDA ===
  function clearSearchHistory() {
    if (isClearing) {
      console.log('⚠️ Limpieza ya en progreso...');
      return;
    }
    
    isClearing = true;
    console.log('🧹 Iniciando limpieza del historial...');
    
    try {
      conversationHistory = [];
      userPreferences = {};
      
      localStorage.removeItem('last_search_query');
      localStorage.removeItem('search_history');
      
      const chatBody = document.getElementById('chatBody');
      
      if (!chatBody) {
        throw new Error('No se encontró el chat body');
      }
      
      const clearBtn = document.getElementById('headerClearBtn');
      if (clearBtn) {
        clearBtn.disabled = true;
        clearBtn.style.opacity = '0.5';
        clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }
      
      const botMessages = chatBody.querySelectorAll('.message-bot');
      let welcomeMessage = null;
      
      for (let i = 0; i < botMessages.length; i++) {
        const message = botMessages[i];
        if (!message.id || message.id !== 'typingIndicator') {
          const content = message.querySelector('.message-content');
          if (content && content.textContent.includes('¡Hola!')) {
            welcomeMessage = message;
            break;
          }
        }
      }
      
      chatBody.innerHTML = '';
      
      if (welcomeMessage) {
        chatBody.appendChild(welcomeMessage);
      } else {
        addMessage('¡Hola! 👋 Soy tu asistente inteligente de *Tu Barrio A Un Clik*. ¿En qué puedo ayudarte?', 'bot');
      }
      
      addMessage('🗑️ **Historial limpiado**\n\nTodas las búsquedas anteriores han sido eliminadas. ¿En qué puedo ayudarte ahora?', 'bot');
      
      const quickReplies = createEnhancedQuickReplies();
      chatBody.appendChild(quickReplies);
      
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 100);
      
      console.log('✅ Historial limpiado correctamente');
      
    } catch (error) {
      console.error('❌ Error al limpiar el historial:', error);
      addMessage('❌ **Error**\n\nNo se pudo limpiar el historial. Por favor, intenta nuevamente.', 'bot');
    } finally {
      setTimeout(() => {
        const clearBtn = document.getElementById('headerClearBtn');
        if (clearBtn) {
          clearBtn.disabled = false;
          clearBtn.style.opacity = '1';
          clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        }
        isClearing = false;
      }, 1000);
    }
  }

  // === BOTÓN DE LIMPIEZA EN HEADER ===
  function addClearButtonToHeader() {
    const chatHeader = document.querySelector('.chat-header');
    
    const existingClearBtn = document.getElementById('headerClearBtn');
    if (existingClearBtn) return;
    
    const clearBtn = document.createElement('button');
    clearBtn.id = 'headerClearBtn';
    clearBtn.className = 'clear-header-btn';
    clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    clearBtn.title = 'Limpiar historial de búsquedas';
    clearBtn.onclick = clearSearchHistory;
    
    const closeBtn = document.querySelector('.close-btn');
    chatHeader.insertBefore(clearBtn, closeBtn);
  }

  // === BOTONES DE ACCESO RÁPIDO ===
  function createEnhancedQuickReplies() {
    const quickReplies = document.createElement('div');
    quickReplies.className = 'quick-replies enhanced';
    
    const buttons = [
      { 
        text: '🏪 NEGOCIOS', 
        query: 'mostrar todos los comercios',
        icon: 'fas fa-store',
        color: '#4285F4'
      },
      { 
        text: '🎁 OFERTAS', 
        query: 'ofertas activas',
        icon: 'fas fa-tag',
        color: '#EB6420'
      },
      { 
        text: '🛠️ OFICIOS', 
        query: 'oficios profesionales',
        icon: 'fas fa-tools',
        color: '#34A853'
      },
      { 
        text: '💡 EMPRENDIMIENTOS', 
        query: 'emprendimientos locales',
        icon: 'fas fa-lightbulb',
        color: '#FBBC05'
      },
      { 
        text: '📝 INSCRIPCIÓN', 
        query: 'inscripción de negocios',
        icon: 'fas fa-edit',
        color: '#9C27B0'
      },
      { 
        text: '💬 SOPORTE', 
        query: 'soporte inmediato',
        icon: 'fab fa-whatsapp',
        color: '#25D366'
      }
    ];

    buttons.forEach(button => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn enhanced-btn metallic-neon';
      btn.style.background = button.color;
      btn.innerHTML = `
        <i class="${button.icon}"></i>
        <span>${button.text}</span>
      `;
      btn.onclick = () => sendQuickReply(button.query);
      quickReplies.appendChild(btn);
    });

    return quickReplies;
  }

  // === FUNCIÓN SEND QUICK REPLY ===
  window.sendQuickReply = function(text) {
    console.log('📨 Quick reply enviado:', text);
    
    addMessage(text, 'user');
    
    if (messageInput) {
      messageInput.value = '';
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateIntelligentResponse(text);
      addMessage(response, 'bot');
      
      const quickReplies = createEnhancedQuickReplies();
      chatBody.appendChild(quickReplies);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
  };

  // === FUNCIONES OPTIMIZADAS DE CARGA ===
  async function cargarNegociosOptimizado() {
    if (negociosCache && Date.now() - lastLoadTime < CACHE_DURATION) {
      console.log('✅ Usando negocios desde caché');
      negociosData = negociosCache;
      return;
    }

    try {
      console.log('🔄 Cargando negocios...');
      
      if (window.businesses && Array.isArray(window.businesses) && window.businesses.length > 0) {
        negociosData = window.businesses;
        negociosCache = window.businesses;
        lastLoadTime = Date.now();
        console.log(`✅ Chatbot usando ${negociosData.length} negocios desde window.businesses`);
        return;
      }

      const cachedData = localStorage.getItem('businesses_cache_v7');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            negociosData = parsed;
            negociosCache = parsed;
            lastLoadTime = Date.now();
            console.log(`✅ Chatbot usando ${negociosData.length} negocios desde caché local`);
            return;
          }
        } catch (e) {
          localStorage.removeItem('businesses_cache_v7');
        }
      }

      await cargarNegociosDesdeEndpoint();

    } catch (error) {
      console.error('Error al cargar los negocios:', error);
      negociosData = getSampleBusinesses();
      negociosCache = getSampleBusinesses();
    }
  }

  async function cargarNegociosDesdeEndpoint() {
    try {
      // Lista de archivos JSON en la carpeta negocios
      const jsonFiles = [
        'panaderia.json', 'carniceria.json', 'verduleria.json', 'fiambreria.json',
        'kiosco.json', 'farmacia.json', 'ferreteria.json', 'ropa.json',
        'servicios.json','calzados.json','belleza.json', 'hogar.json', 'otros.json'
      ];

      negociosData = []; // Reiniciar array

      // Cargar cada archivo JSON de negocios
      for (const file of jsonFiles) {
        try {
          const response = await fetch(`negocios/${file}`);
          if (response.ok) {
            const data = await response.json();
            
            // Procesar los negocios según el formato del archivo
            let negociosDelArchivo = [];
            
            if (Array.isArray(data)) {
              negociosDelArchivo = data;
            } else if (data.negocios && Array.isArray(data.negocios)) {
              negociosDelArchivo = data.negocios;
            } else if (data.categoria && data.negocios) {
              negociosDelArchivo = [data]; // Si es un objeto individual
            }
            
            // Procesar cada negocio
            negociosDelArchivo.forEach((negocio, index) => {
              const processedNegocio = {
                name: negocio.nombre || negocio.name || 'Negocio Local',
                category: negocio.categoria || negocio.category || 'General',
                hours: negocio.horario || negocio.hours || 'Lunes a Viernes: 08:00-20:00',
                address: negocio.direccion || negocio.address || 'Dirección no disponible',
                image: negocio.imagen || negocio.image || 'img/placeholder-negocio.jpg',
                url: negocio.web || negocio.url || '#',
                latitude: negocio.latitud || negocio.latitude || -34.6037,
                longitude: negocio.longitud || negocio.longitude || -58.3816,
                telefono: negocio.telefono || negocio.phone || '1157194796',
                whatsapp: negocio.whatsapp || negocio.telefono || '5491157194796',
                promo: negocio.promo || negocio.descripcion || 'Visítanos'
              };
              negociosData.push(processedNegocio);
            });
          }
        } catch (error) {
          console.warn(`❌ Error cargando negocios/${file}:`, error);
        }
      }

      // Si no se cargaron negocios, intentar con los endpoints antiguos como fallback
      if (negociosData.length === 0) {
        const endpointsAntiguos = [
          'datos/negocios.json',
          'data/businesses.json', 
          'datos/comercios.json',
          'json/negocios.json'
        ];

        for (const endpoint of endpointsAntiguos) {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              const successfulResult = await response.json();
              const data = Array.isArray(successfulResult) ? successfulResult : 
                          (successfulResult.data || successfulResult.negocios || []);
              
              if (data.length > 0) {
                negociosData = data;
                break;
              }
            }
          } catch (error) {
            console.warn(`❌ Error cargando ${endpoint}:`, error);
          }
        }
      }

      if (negociosData.length > 0) {
        negociosCache = negociosData;
        lastLoadTime = Date.now();
        localStorage.setItem('businesses_cache_v7', JSON.stringify(negociosData));
        console.log(`✅ Negocios cargados: ${negociosData.length}`);
      } else {
        throw new Error('No hay datos disponibles');
      }

    } catch (error) {
      console.warn('No se pudieron cargar negocios desde endpoints:', error);
      throw error;
    }
  }

  async function cargarNegocios() {
    return cargarNegociosOptimizado();
  }

  // === FUNCIONES DE CARGA DE DATOS ===
  function getSampleBusinesses() {
    return [
      {
        name: "Panadería El Hornero",
        category: "Panadería",
        hours: "Lunes a Viernes: 07:00-20:00, Sábados: 07:00-14:00",
        address: "Av. San Martín 1234",
        image: "img/panaderia.jpg",
        url: "#",
        latitude: -34.6037,
        longitude: -58.3816,
        telefono: "1122334455",
        whatsapp: "5491122334455",
        promo: "Descuento 10% en pedidos web"
      }
    ];
  }

  async function cargarOfertas() {
    try {
      const cachedData = localStorage.getItem('ofertas_cache_v3');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          ofertasData = Array.isArray(parsed) ? parsed : parsed.data;
          console.log(`✅ Ofertas cargadas desde caché: ${ofertasData.length}`);
          return;
        } catch (e) {
          localStorage.removeItem('ofertas_cache_v3');
        }
      }

      // Lista de archivos JSON en la carpeta ofertas
      const jsonFiles = [
        'oferta-barberias.json',
        'oferta-carniceria.json', 
        'oferta-farmacia.json',
        'oferta-ferreteria.json',
        'oferta-fiambreria.json',
        'oferta-kiosco.json'
      ];

      ofertasData = []; // Reiniciar array

      // Cargar cada archivo JSON de ofertas
      for (const file of jsonFiles) {
        try {
          const response = await fetch(`ofertas/${file}`);
          if (response.ok) {
            const data = await response.json();
            
            // Procesar cada oferta del archivo
            if (data.ofertas && Array.isArray(data.ofertas)) {
              data.ofertas.forEach((oferta, index) => {
                const processedOferta = {
                  id: `oferta-${data.categoria}-${index}-${Date.now()}`,
                  nombre: oferta.titulo || 'Oferta especial',
                  categoria: data.categoria || 'General',
                  descuento: oferta.descuento ? `${oferta.descuento}% OFF` : "Ver detalle",
                  detalle: oferta.descripcion || 'Oferta disponible por tiempo limitado',
                  imagen: oferta.imagen || 'img/placeholder-oferta.jpg',
                  web: (oferta.web_url || oferta.tarjetaUrl || '').trim().replace(/\s+/g, '') || null,
                  instagram: null, // Los JSON de ofertas no tienen instagram
                  whatsapp: oferta.boton?.url || null,
                  botonTexto: oferta.boton?.texto || 'Contactar',
                  precioOriginal: oferta.precioOriginal,
                  precioOferta: oferta.precioOferta,
                  validez: oferta.validez,
                  condiciones: oferta.condiciones,
                  ofertaLimitada: true,
                  fechaInicio: oferta.start_date || new Date().toISOString(),
                  fechaFin: oferta.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };
                ofertasData.push(processedOferta);
              });
            }
          }
        } catch (error) {
          console.warn(`❌ Error cargando ofertas/${file}:`, error);
        }
      }

      // Si no se cargaron ofertas, intentar con los endpoints antiguos como fallback
      if (ofertasData.length === 0) {
        const endpointsAntiguos = ['datos/seccion-ofertas.json', 'data/ofertas.json', 'datos/promociones.json'];
        
        for (const endpoint of endpointsAntiguos) {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              const rawData = await response.json();
              ofertasData = Array.isArray(rawData) ? rawData.map((oferta, index) => ({
                id: oferta.id || `oferta-${index}-${Date.now()}`,
                nombre: oferta.title || oferta.nombre || 'Oferta especial',
                categoria: oferta.rubro || oferta.categoria || 'General',
                descuento: oferta.discount || oferta.descuento || "Ver detalle",
                detalle: oferta.description || oferta.detalle || 'Oferta disponible por tiempo limitado',
                imagen: oferta.image || oferta.imagen || 'img/placeholder-oferta.jpg',
                web: (oferta.web_url || oferta.web || '').trim().replace(/\s+/g, '') || null,
                instagram: (oferta.instagram_url || oferta.instagram || '').trim().replace(/\s+/g, '') || null,
                ofertaLimitada: true,
                fechaInicio: oferta.start_date || oferta.fechaInicio || new Date().toISOString(),
                fechaFin: oferta.end_date || oferta.fechaFin || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              })) : [];

              console.log(`✅ Ofertas cargadas desde endpoint antiguo: ${endpoint}`);
              break;
            }
          } catch (error) {
            console.warn(`❌ Error cargando ${endpoint}:`, error);
          }
        }
      }

      // Guardar en caché
      if (ofertasData.length > 0) {
        localStorage.setItem('ofertas_cache_v3', JSON.stringify(ofertasData));
        console.log(`✅ Ofertas transformadas: ${ofertasData.length}`);
      } else {
        // Datos de ejemplo si todo falla
        ofertasData = [{
          id: 'oferta-ejemplo-1',
          nombre: 'Descuento especial',
          categoria: 'General',
          descuento: '10% OFF',
          detalle: 'Acércate al local y menciona que viniste desde Tu Barrio A Un Clik',
          imagen: 'img/placeholder-oferta.jpg',
          web: null,
          instagram: null,
          ofertaLimitada: true
        }];
        console.warn('⚠️ Usando ofertas de ejemplo');
      }

    } catch (error) {
      console.error('Error al cargar ofertas:', error);
      ofertasData = [{
        id: 'oferta-ejemplo-1',
        nombre: 'Descuento especial',
        categoria: 'General',
        descuento: '10% OFF',
        detalle: 'Acércate al local y menciona que viniste desde Tu Barrio A Un Clik',
        imagen: 'img/placeholder-oferta.jpg',
        web: null,
        instagram: null,
        ofertaLimitada: true
      }];
    }
  }

  // === FUNCIONES DE TARJETAS ===
  function getBusinessCategoryIcon(category) {
    const icons = {
      'Panadería': '🍞', 'Fábrica de Pastas': '🍝', 'Verdulería': '🥦', 'Fiambrería': '🧀',
      'Kiosco': '🏪', 'Mascotas': '🐾', 'Calzados': '👟', 'Barbería': '✂️', 'Ferretería': '🔧', 'Ropa': '👕',
      'Servicios': '🛠️', 'Farmacia': '💊', 'Cafetería': '☕', 'Taller Mecánico': '🔧',
      'Librería': '📚', 'Mates': '🧋', 'Florería': '🌹', 'Carnicería': '🥩', 'Granjas': '🌾',
      'Muebles': '🪑', 'Uñas': '💅', 'Comidas': '🍽️'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (normalizeString(category).includes(normalizeString(key))) {
        return icon;
      }
    }
    return '🏪';
  }

  function isBusinessOpen(hoursString) {
    if (typeof window.isBusinessOpen === 'function') return window.isBusinessOpen(hoursString);
    return true;
  }

  function createEnhancedBusinessCard(negocio, index) {
    const isOpen = isBusinessOpen(negocio.hours);
    const statusText = isOpen ? 'Abierto ahora' : 'Cerrado';
    const statusIcon = isOpen ? '🟢' : '🔴';
    const categoryIcon = getBusinessCategoryIcon(negocio.category);

    const mapUrl = `https://www.google.com/maps?q=${negocio.latitude},${negocio.longitude}`;
    const webUrl = negocio.url || '#';
    const whatsappUrl = negocio.whatsapp ? `https://wa.me/${negocio.whatsapp}` : null;
    const phoneUrl = negocio.telefono ? `tel:+${negocio.telefono}` : null;

    const card = document.createElement('div');
    card.className = 'business-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div class="business-header" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
        <div style="font-size: 2rem;">${categoryIcon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${negocio.name}</div>
          <div style="font-size: 0.85rem; color: white; font-weight: 600; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 4px;">
            ${negocio.category}
          </div>
        </div>
        <div style="background: ${isOpen ? '#10B981' : '#EF4444'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          ${statusIcon} ${statusText}
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-clock" style="color: #667eea;"></i>
          <span>${negocio.hours}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-map-marker-alt" style="color: #667eea;"></i>
          <span>${negocio.address}</span>
        </div>

        <div class="action-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0;">
          <a href="${webUrl}" target="_blank" class="action-btn web">
            <i class="fas fa-globe"></i>
            <span>Sitio Web</span>
          </a>
          
          <a href="${mapUrl}" target="_blank" class="action-btn maps">
            <i class="fas fa-map-marker-alt"></i>
            <span>Google Maps</span>
          </a>
          
          ${whatsappUrl ? `
          <a href="${whatsappUrl}" target="_blank" class="action-btn whatsapp">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>` : ''}
          
          ${phoneUrl ? `
          <a href="${phoneUrl}" class="action-btn phone">
            <i class="fas fa-phone-alt"></i>
            <span>Llamar</span>
          </a>` : ''}
        </div>
      </div>
    `;

    return card;
  }

  function createEnhancedOfferCard(oferta, index) {
    const card = document.createElement('div');
    card.className = 'business-card offer-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); border-radius: 12px 12px 0 0;">
        <div style="font-size: 2rem;">🎁</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${oferta.nombre}</div>
          <div style="font-size: 0.85rem; color: white; font-weight: 600; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 4px;">
            ${oferta.categoria}
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          🔥 OFERTA
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-tag" style="color: #FF6B6B;"></i>
          <span><strong>Descuento:</strong> ${oferta.descuento}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-info-circle" style="color: #FF6B6B;"></i>
          <span>${oferta.detalle}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0;">
          ${oferta.web ? `
          <a href="${oferta.web}" target="_blank" class="action-btn web">
            <i class="fas fa-globe"></i>
            <span>Visitar Web</span>
          </a>` : ''}

          ${oferta.instagram ? `
          <a href="${oferta.instagram}" target="_blank" class="action-btn instagram">
            <i class="fab fa-instagram"></i>
            <span>Instagram</span>
          </a>` : ''}
        </div>

        <div style="text-align: center; padding: 8px; background: #FFF3E0; border-radius: 8px; margin-top: 12px;">
          <small style="color: #E65100; font-weight: 600;">
            ⏰ Oferta por tiempo limitado
          </small>
        </div>
      </div>
    `;

    return card;
  }

  // === FUNCIONES OPTIMIZADAS PARA MOSTRAR CONTENIDO ===
  function handleNegociosRequest() {
    addMessage('🏪 **CARGANDO DIRECTORIO DE NEGOCIOS**\n\nBuscando todos los comercios disponibles...', 'bot');
    
    setTimeout(() => {
      cargarNegociosOptimizado().then(() => {
        mostrarNegociosEnChat();
      });
    }, 100);
    
    return "🔍 Buscando la información más actualizada...";
  }

  function mostrarNegociosEnChat() {
    if (!negociosData || negociosData.length === 0) {
      addMessage('❌ **No se encontraron comercios**\n\nActualmente no hay comercios cargados en el sistema.', 'bot');
      return;
    }

    const openCount = negociosData.filter(n => isBusinessOpen(n.hours)).length;
    
    const messages = chatBody.querySelectorAll('.message-bot');
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.querySelector('.message-content').textContent.includes('CARGANDO')) {
      lastMessage.querySelector('.message-content').innerHTML = 
        `🏪 **DIRECTORIO DE NEGOCIOS**\n\n• 📊 Total registrados: ${negociosData.length}\n• 🟢 Abiertos ahora: ${openCount}\n• 🔴 Cerrados: ${negociosData.length - openCount}\n\n**Mostrando todos los comercios:**`;
    }

    const categorias = {};
    negociosData.forEach(n => {
      if (!categorias[n.category]) categorias[n.category] = [];
      categorias[n.category].push(n);
    });

    let index = 0;
    const categoryKeys = Object.keys(categorias);
    
    function mostrarSiguienteCategoria(i) {
      if (i >= categoryKeys.length) {
        addMessage(`✅ Se muestran todos los ${negociosData.length} comercios. ¿Necesitas información específica de alguno?`, 'bot');
        return;
      }

      const categoria = categoryKeys[i];
      const negocios = categorias[categoria];
      
      const header = document.createElement('div');
      header.className = 'business-category-header';
      header.innerHTML = `
        <h5 style="margin: 16px 0 8px 0; font-size: 14px; font-weight: 600;">
          ${getBusinessCategoryIcon(categoria)} ${categoria} (${negocios.length})
        </h5>
      `;
      chatBody.appendChild(header);

      negocios.forEach(negocio => {
        const card = createEnhancedBusinessCard(negocio, index++);
        chatBody.appendChild(card);
      });

      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => mostrarSiguienteCategoria(i + 1), 50);
    }

    mostrarSiguienteCategoria(0);
  }

  function handleOfertasRequest() {
    if (!ofertasData || ofertasData.length === 0) {
      return `🎁 **OFERTAS ACTIVAS**\n\nActualmente no hay ofertas disponibles. Te sugerimos:\n\n👉 [Ver comunidad de ofertas](comunidad-de-ofertas.html)\n\n• Contactar directamente a los comercios\n• Seguir sus redes sociales\n• Consultar nuevamente en unos días`;
    }

    addMessage(`🎁 **OFERTAS EXCLUSIVAS** (${ofertasData.length} activas)\n\n¡Aprovecha estas promociones especiales!`, 'bot');

    ofertasData.forEach((oferta, index) => {
      const card = createEnhancedOfferCard(oferta, index);
      chatBody.appendChild(card);
    });

    const communityBtn = document.createElement('div');
    communityBtn.className = 'special-action-btn';
    communityBtn.innerHTML = `
      <a href="comunidad-de-ofertas.html" target="_blank" style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
        <i class="fas fa-users"></i> Ver Comunidad Completa de Ofertas
      </a>
    `;
    chatBody.appendChild(communityBtn);

    return `✨ ${ofertasData.length} oferta(s) disponibles. ¡No te pierdas las promociones!`;
  }

  function handleOficiosRequest() {
    addMessage(`🛠️ **OFICIOS Y PROFESIONES**\n\nEncontré que estás buscando *servicios profesionales* como:\n\n• 🧱 Albañiles y construcción\n• 🔌 Electricistas\n• 🔧 Plomeros y gasistas\n• 🎨 Pintores\n• 🪴 Jardineros\n• 🚚 Fletes y transportes\n\n**Profesionales disponibles en tu zona:**`, 'bot');

    const oficiosEjemplo = [
      {
        nombre: "Electricista Profesional",
        categoria: "Electricista",
        descripcion: "Instalaciones eléctricas, reparaciones y mantenimiento",
        experiencia: "10+ años de experiencia",
        telefono: "1157194796",
        zona: "Tu barrio y zonas aledañas"
      },
      {
        nombre: "Servicio de Plomería",
        categoria: "Plomero",
        descripcion: "Reparación de cañerías, instalaciones sanitarias",
        experiencia: "8+ años de experiencia",
        telefono: "1157194796",
        zona: "Toda la zona"
      },
      {
        nombre: "Albañilería y Construcción",
        categoria: "Albañil",
        descripcion: "Construcción, remodelación y reparaciones generales",
        experiencia: "15+ años de experiencia",
        telefono: "1157194796",
        zona: "Barrio y alrededores"
      }
    ];

    oficiosEjemplo.forEach((oficio, index) => {
      const card = createOficioCard(oficio, index);
      chatBody.appendChild(card);
    });

    const oficiosBtn = document.createElement('div');
    oficiosBtn.className = 'special-action-btn';
    oficiosBtn.innerHTML = `
      <a href="oficios-profesiones.html" target="_blank" style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #34A853, #0F9D58); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
        <i class="fas fa-tools"></i> Ver Todos los Oficios Disponibles
      </a>
    `;
    chatBody.appendChild(oficiosBtn);

    return `🔧 ${oficiosEjemplo.length} profesionales listados. *Encuentra el profesional perfecto para tu proyecto*`;
  }

  function handleEmprendimientosRequest() {
    addMessage(`💡 **EMPRENDIMIENTOS LOCALES**\n\nDescubre los proyectos innovadores de tu barrio:\n\n• 🍽️ Gastronomía y comida\n• 🎨 Artesanías y manualidades\n• 👗 Moda y diseño\n• 💄 Belleza y cosmética\n• 📚 Educación y cursos\n• 🏠 Hogar y decoración\n\n**Emprendimientos destacados:**`, 'bot');

    const emprendimientosEjemplo = [
      {
        nombre: "Delicias Caseras",
        categoria: "Gastronomía",
        descripcion: "Comida casera y postres artesanales",
        producto: "Tortas, empanadas y platos tradicionales",
        contacto: "Instagram: @deliciascaseras",
        destacado: "⭐ Productos 100% naturales"
      },
      {
        nombre: "Arte en Madera",
        categoria: "Artesanías",
        descripcion: "Productos artesanales en madera",
        producto: "Muebles, decoración y regalos personalizados",
        contacto: "WhatsApp: 1157194796",
        destacado: "🎨 Diseños únicos y personalizados"
      },
      {
        nombre: "Belleza Natural",
        categoria: "Cosmética",
        descripcion: "Productos de belleza naturales",
        producto: "Jabones, cremas y aceites esenciales",
        contacto: "Facebook: Belleza Natural",
        destacado: "🌿 Ingredientes orgánicos"
      }
    ];

    emprendimientosEjemplo.forEach((emprendimiento, index) => {
      const card = createEmprendimientoCard(emprendimiento, index);
      chatBody.appendChild(card);
    });

    const emprendimientosBtn = document.createElement('div');
    emprendimientosBtn.className = 'special-action-btn';
    emprendimientosBtn.innerHTML = `
      <a href="emprendimientos.html" target="_blank" style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #FBBC05, #F4B400); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
        <i class="fas fa-lightbulb"></i> Explorar Todos los Emprendimientos
      </a>
    `;
    chatBody.appendChild(emprendimientosBtn);

    return `🚀 ${emprendimientosEjemplo.length} emprendimientos mostrados. *Apoya el talento local y descubre productos únicos*`;
  }

  function handleInscripcionRequest() {
    addMessage(`📝 **INSCRIPCIÓN DE NEGOCIOS**\n\n¿Tienes un negocio y quieres aparecer en nuestra plataforma?\n\n**Beneficios exclusivos:**\n\n• 📍 **Mayor visibilidad** en el barrio\n• 👥 **Acceso directo** a nuevos clientes\n• 🎁 **Promoción gratuita** de ofertas\n• 💬 **Soporte personalizado** 24/7\n• 📱 **Presencia digital** inmediata`, 'bot');

    const pasosInscripcion = [
      {
        paso: "1",
        titulo: "Formulario Rápido",
        descripcion: "Completa tus datos básicos en 2 minutos",
        icono: "fas fa-edit",
        color: "#9C27B0"
      },
      {
        paso: "2",
        titulo: "Verificación Instantánea",
        descripcion: "Validamos tu información automáticamente",
        icono: "fas fa-check-circle",
        color: "#4CAF50"
      },
      {
        paso: "3",
        titulo: "¡Activación Inmediata!",
        descripcion: "Tu negocio aparece en la plataforma al instante",
        icono: "fas fa-rocket",
        color: "#FF9800"
      }
    ];

    pasosInscripcion.forEach((paso, index) => {
      const card = createPasoInscripcionCard(paso, index);
      chatBody.appendChild(card);
    });

    const inscripcionBtn = document.createElement('div');
    inscripcionBtn.className = 'special-action-btn';
    inscripcionBtn.innerHTML = `
      <a href="inscripcion.html" target="_blank" style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; border: none; cursor: pointer;">
        <i class="fas fa-edit"></i> 🚀 Registrar Mi Negocio Ahora
      </a>
    `;
    chatBody.appendChild(inscripcionBtn);

    addMessage(`💫 **¡Comienza ahora!**\n\nEl proceso es 100% gratuito y toma menos de 5 minutos.\n\n*¿Listo para hacer crecer tu negocio?*`, 'bot');

    return "📞 ¿Tienes preguntas? Contáctanos por WhatsApp para ayuda inmediata.";
  }

  function handleSoporteRequest() {
    addMessage(`💬 **SOPORTE INMEDIATO**\n\n¿Necesitas ayuda personalizada? Estamos aquí para ayudarte:\n\n📞 **Opciones de contacto:**`, 'bot');

    const opcionesSoporte = [
      {
        icono: "fab fa-whatsapp",
        titulo: "Chat en WhatsApp",
        descripcion: "Respuesta inmediata",
        accion: "Escribir ahora",
        color: "#25D366",
        url: "https://wa.me/5491157194796"
      },
      {
        icono: "fas fa-envelope",
        titulo: "Correo electrónico",
        descripcion: "soporte@tubarrio.com",
        accion: "Enviar email",
        color: "#EA4335",
        url: "mailto:tubarrioaunclick@gmail.com"
      },
      {
        icono: "fas fa-clock",
        titulo: "Horario de atención",
        descripcion: "Lunes a Viernes 9:00-18:00",
        accion: "Disponible",
        color: "#4285F4",
        url: "#"
      }
    ];

    opcionesSoporte.forEach((opcion, index) => {
      const card = createSoporteCard(opcion, index);
      chatBody.appendChild(card);
    });

    const soporteBtn = document.createElement('div');
    soporteBtn.className = 'special-action-btn';
    soporteBtn.innerHTML = `
      <a href="https://wa.me/5491157194796" target="_blank" style="display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #25D366, #128C7E); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
        <i class="fab fa-whatsapp"></i> Contactar por WhatsApp Ahora
      </a>
    `;
    chatBody.appendChild(soporteBtn);

    return `🕒 *No dudes en contactarnos para cualquier consulta*`;
  }

  // === FUNCIONES PARA CREAR TARJETAS ESPECIALES ===
  function createOficioCard(oficio, index) {
    const card = document.createElement('div');
    card.className = 'business-card oficio-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #34A853, #0F9D58); border-radius: 12px 12px 0 0;">
        <div style="font-size: 2rem;">🔧</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${oficio.nombre}</div>
          <div style="font-size: 0.85rem; color: white; font-weight: 600; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 4px;">
            ${oficio.categoria}
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          PROFESIONAL
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-info-circle" style="color: #34A853;"></i>
          <span><strong>Servicio:</strong> ${oficio.descripcion}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-award" style="color: #34A853;"></i>
          <span><strong>Experiencia:</strong> ${oficio.experiencia}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-map-marker-alt" style="color: #34A853;"></i>
          <span><strong>Zona:</strong> ${oficio.zona}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0;">
          <a href="tel:+${oficio.telefono}" class="action-btn phone">
            <i class="fas fa-phone-alt"></i>
            <span>Llamar</span>
          </a>
          
          <a href="https://wa.me/549${oficio.telefono}" target="_blank" class="action-btn whatsapp">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    `;

    return card;
  }

  function createEmprendimientoCard(emprendimiento, index) {
    const card = document.createElement('div');
    card.className = 'business-card emprendimiento-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #FBBC05, #F4B400); border-radius: 12px 12px 0 0;">
        <div style="font-size: 2rem;">💡</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${emprendimiento.nombre}</div>
          <div style="font-size: 0.85rem; color: white; font-weight: 600; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 4px;">
            ${emprendimiento.categoria}
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          EMPRENDIMIENTO
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-info-circle" style="color: #FBBC05;"></i>
          <span><strong>Descripción:</strong> ${emprendimiento.descripcion}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-box" style="color: #FBBC05;"></i>
          <span><strong>Productos:</strong> ${emprendimiento.producto}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-star" style="color: #FBBC05;"></i>
          <span><strong>Destacado:</strong> ${emprendimiento.destacado}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-share-alt" style="color: #FBBC05;"></i>
          <span><strong>Contacto:</strong> ${emprendimiento.contacto}</span>
        </div>
      </div>
    `;

    return card;
  }

  function createPasoInscripcionCard(paso, index) {
    const card = document.createElement('div');
    card.className = 'business-card inscripcion-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, ${paso.color}, ${paso.color}99); border-radius: 12px 12px 0 0;">
        <div style="font-size: 1.5rem; color: white;">
          <i class="${paso.icono}"></i>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${paso.titulo}</div>
          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.9); margin-top: 2px;">
            Paso ${paso.paso}
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          ${paso.paso}/3
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-clock" style="color: ${paso.color};"></i>
          <span><strong>Duración:</strong> ${paso.descripcion}</span>
        </div>
      </div>
    `;

    return card;
  }

  function createSoporteCard(opcion, index) {
    const card = document.createElement('div');
    card.className = 'business-card soporte-card enhanced';
    card.style.animationDelay = `${index * 0.1}s`;

    const isDisabled = !opcion.url || opcion.url === '#';
    
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, ${opcion.color}, ${opcion.color}99); border-radius: 12px 12px 0 0;">
        <div style="font-size: 2rem;">
          <i class="${opcion.icono}"></i>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: white; font-size: 1.1rem;">${opcion.titulo}</div>
        </div>
        <div style="background: rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
          ${opcion.accion}
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.9rem; color: #4a5568;">
          <i class="fas fa-info-circle" style="color: ${opcion.color};"></i>
          <span>${opcion.descripcion}</span>
        </div>

        ${!isDisabled ? `
        <div style="margin: 16px 0;">
          <a href="${opcion.url}" ${opcion.url.startsWith('http') ? 'target="_blank"' : ''} class="action-btn" style="background: ${opcion.color};">
            <i class="${opcion.icono}"></i>
            <span>${opcion.accion}</span>
          </a>
        </div>
        ` : ''}
      </div>
    `;

    return card;
  }

  // === GENERADOR DE RESPUESTAS INTELIGENTES ===
  function generateIntelligentResponse(query) {
    const normalizedQuery = normalizeString(query);
    
    conversationHistory.push({ 
      query: query, 
      normalized: normalizedQuery,
      timestamp: Date.now() 
    });

    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // === PATRONES MEJORADOS PARA INSCRIPCIÓN ===
    if (normalizedQuery.includes('inscripción') || 
        normalizedQuery.includes('inscripcion') || 
        normalizedQuery.includes('registrar') || 
        normalizedQuery.includes('agregar negocio') ||
        normalizedQuery.includes('registro') ||
        normalizedQuery.includes('inscribir')) {
      return handleInscripcionRequest();
    }

    if (normalizedQuery.includes('negocios') || normalizedQuery.includes('comercios') || normalizedQuery.includes('mostrar todos')) {
      return handleNegociosRequest();
    }

    if (normalizedQuery.includes('ofertas') || normalizedQuery.includes('promociones') || normalizedQuery.includes('descuentos')) {
      return handleOfertasRequest();
    }

    if (normalizedQuery.includes('oficios') || normalizedQuery.includes('profesionales') || normalizedQuery.includes('servicios')) {
      return handleOficiosRequest();
    }

    if (normalizedQuery.includes('emprendimientos') || normalizedQuery.includes('proyectos') || normalizedQuery.includes('innovador')) {
      return handleEmprendimientosRequest();
    }

    if (normalizedQuery.includes('soporte') || normalizedQuery.includes('ayuda') || normalizedQuery.includes('contacto') || normalizedQuery.includes('whatsapp')) {
      return handleSoporteRequest();
    }

    for (const [category, data] of Object.entries(intelligentResponses)) {
      for (const pattern of data.patterns) {
        if (pattern.test(query)) {
          const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
          return randomResponse;
        }
      }
    }

    const categoryFound = findCategoryByQuery(query);
    if (categoryFound) {
      const matches = negociosData.filter(n => 
        normalizeString(n.category).includes(normalizeString(categoryFound))
      );

      if (matches.length === 0) {
        return `❌ No encontré "${categoryFound}" en nuestra base de datos. ¿Quizás te referís a otra categoría? Puedes ver todas las categorías disponibles con "NEGOCIOS".`;
      }

      const openMatches = matches.filter(n => isBusinessOpen(n.hours));
      
      if (openMatches.length > 0) {
        addMessage(`✅ Encontré ${openMatches.length} ${categoryFound.toLowerCase()} abiertas ahora`, 'bot');
        openMatches.forEach((negocio, index) => {
          const card = createEnhancedBusinessCard(negocio, index);
          chatBody.appendChild(card);
        });
        return `Mostrando ${openMatches.length} ${categoryFound.toLowerCase()}s abiertas.`;
      } else {
        addMessage(`🕒 Encontré ${matches.length} ${categoryFound.toLowerCase()}s, pero todas están cerradas ahora`, 'bot');
        matches.forEach((negocio, index) => {
          const card = createEnhancedBusinessCard(negocio, index);
          chatBody.appendChild(card);
        });
        return `Puedes contactarlas para consultar horarios.`;
      }
    }

    return `🤔 **No entendí completamente tu consulta.**\n\n**Puedo ayudarte con:**\n\n🏪 **NEGOCIOS** - Directorio completo de comercios\n🎁 **OFERTAS** - Promociones activas\n🛠️ **OFICIOS** - Servicios profesionales\n💡 **EMPRENDIMIENTOS** - Proyectos locales\n📝 **INSCRIPCIÓN** - Registrar tu negocio\n💬 **SOPORTE** - Ayuda personalizada\n\n¿Qué te interesa explorar?`;
  }

  // === FUNCIONES PRINCIPALES ===
  function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateIntelligentResponse(text);
      addMessage(response, 'bot');
      
      const quickReplies = createEnhancedQuickReplies();
      chatBody.appendChild(quickReplies);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
  }

  // === INICIALIZACIÓN MEJORADA ===
  function initChatbot() {
    if (window.chatbotInitialized) return;

    if (!document.getElementById('messageInput')) {
      setTimeout(initChatbot, 500);
      return;
    }

    window.chatbotInitialized = true;

    // Inicializar sistemas
    cargarNegocios();
    cargarOfertas();
    initVoiceSystem(); // Inicializar sistema de voz

    // Event listeners para botones de voz
    const micBtn = document.getElementById('micBtn');
    const voiceToggleBtn = document.getElementById('voiceToggleBtn');
    
    if (micBtn) {
      micBtn.addEventListener('click', toggleVoiceRecognition);
    }
    
    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener('click', toggleVoiceResponse);
    }

    // Event listeners existentes
    if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
    if (messageInput) {
      messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          handleSendMessage();
        }
      });
      
      messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      });
    }
    
    if (closeChat) closeChat.addEventListener('click', () => {
      chatContainer.classList.remove('active');
      // Detener reconocimiento de voz al cerrar
      if (isListening && recognition) {
        recognition.stop();
      }
      // Detener síntesis de voz al cerrar
      if (synthesis && synthesis.speaking) {
        synthesis.cancel();
      }
    });

    setTimeout(() => {
      if (negociosData.length > 0) {
        addMessage(`¡Hola! 👋 Soy tu asistente inteligente de *Tu Barrio A Un Clik*. \n\nTengo información de **${negociosData.length} comercios** y **${ofertasData.length} ofertas** para mostrarte. ¿En qué te puedo ayudar hoy?`, 'bot');
        
        const quickReplies = createEnhancedQuickReplies();
        chatBody.appendChild(quickReplies);
        
        addClearButtonToHeader();
        
        chatBody.scrollTop = chatBody.scrollHeight;
      } else {
        addMessage("¡Hola! 👋 Estoy cargando la información más actualizada...", 'bot');
        addClearButtonToHeader();
      }
    }, 1000);
  }

  // === EVENT LISTENERS GLOBALES ===
  if (chatbotBtn) {
    chatbotBtn.addEventListener('click', () => {
      chatContainer.classList.add('active');
      initChatbot();
    });
  }

  // === FUNCIONES GLOBALES ===
  window.waitForBusinessesData = function() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 30;

      const checkData = () => {
        attempts++;
        
        if (window.businesses && Array.isArray(window.businesses) && window.businesses.length > 0) {
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          resolve();
          return;
        }

        setTimeout(checkData, 500);
      };

      checkData();
    });
  };

  // Inicialización
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    setTimeout(initChatbot, 1000);
  }
});