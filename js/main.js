/**
 * SIGETOTAL - Lógica de Interacciones y Animaciones
 */

// 1. Configuración de Animaciones al hacer Scroll (IntersectionObserver)
function initScrollAnimations() {
    // Detectar si el navegador soporta IntersectionObserver (navegadores modernos)
    if (!('IntersectionObserver' in window)) {
        // Si no lo soporta, mostramos todo de una vez
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.remove('animate-on-scroll');
        });
        return;
    }

    // Configuración del observador
    const observerOptions = {
        root: null, // usa el viewport
        rootMargin: '0px 0px -80px 0px', // se activa 80px antes de que el elemento entre totalmente
        threshold: 0.1 // el 10% del elemento debe ser visible
    };

    // Creación del observador
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Agregar clase que dispara la animación CSS
                entry.target.classList.add('is-visible');
                // Dejar de observar una vez animado para mejorar rendimiento
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seleccionar elementos a animar
    // Títulos de sección
    document.querySelectorAll('.section-title, .section-subtitle').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Tarjetas (con efecto staggered/cascada)
    const gridContainers = document.querySelectorAll('.grid-3, .grid-2, .grid-4, .pricing-grid, .video-carousel, .contacto-grid');
    gridContainers.forEach(container => {
        const items = container.querySelectorAll('.card, .list-group, .partner-card, .video-card, .info-item, .contacto-accion');
        items.forEach((item, index) => {
            item.classList.add('animate-on-scroll');
            // Añadir retraso basado en el índice (máximo 4 para no exagerar)
            const delayClass = `delay-${(index % 4) + 1}`;
            item.classList.add(delayClass);
            observer.observe(item);
        });
    });
    
    // Elementos sueltos
    document.querySelectorAll('.custom-plan, .logos-marquee').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}



// 3. Función del Acordeón de FAQ
function initAccordion() {
    const accordions = document.querySelectorAll('.accordion-header');
    
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            // Cerrar los otros abiertos (opcional, para modo "solo uno a la vez")
            const currentActive = document.querySelector('.accordion-header.active');
            if(currentActive && currentActive !== this) {
                currentActive.classList.remove('active');
                currentActive.nextElementSibling.style.maxHeight = null;
            }

            // Alternar clase activa para girar la flechita
            this.classList.toggle('active');
            
            // Obtener el div que contiene la respuesta
            const content = this.nextElementSibling;
            
            // Lógica para abrir/cerrar suavemente usando scrollHeight
            if (content.style.maxHeight) {
                content.style.maxHeight = null; // Cierra
            } else {
                content.style.maxHeight = content.scrollHeight + "px"; // Abre midiendo el contenido real
            }
        });
    });
}

// 4. Cargador de Componentes HTML (Header/Footer)
async function loadComponent(elementId, filePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Error al cargar ${filePath}: ${response.status}`);
        const html = await response.text();
        placeholder.innerHTML = html;
        
        // Retornar true indicando éxito para la promesa
        return true; 
        
    } catch (error) {
        console.error("Hubo un problema cargando el componente:", error);
        placeholder.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error al cargar ${filePath}</p>`;
        return false;
    }
}

// Función para el Header Dinámico
function initDynamicHeader() {
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section, footer');

    if (!header) return;

    const handleScroll = () => {
        let currentSection = null;
        const scrollPos = window.scrollY;

        // ESTADO 1: Cima de la página (Pegado debajo de la barra de contacto)
        if (scrollPos < 50) {
            header.classList.remove('is-floating', 'theme-light', 'theme-dark');
            return;
        }

        // ESTADO 2: Flotando
        header.classList.add('is-floating');
        
        const detectionPoint = 80; 

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= detectionPoint && rect.bottom > detectionPoint) {
                currentSection = section;
            }
        });

        if (currentSection) {
            const bgColor = window.getComputedStyle(currentSection).backgroundColor;
            
            const lightBackgrounds = [
                'rgba(0, 0, 0, 0)',    
                'rgb(255, 255, 255)',  
                'rgb(248, 249, 250)',  
                'rgb(253, 253, 253)'   
            ];

            if (lightBackgrounds.includes(bgColor)) {
                header.classList.add('theme-dark');
                header.classList.remove('theme-light');
            } else {
                header.classList.add('theme-light');
                header.classList.remove('theme-dark');
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
}

function initDraggableCarousel() {
    const slider = document.getElementById('clientes-carousel');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoSlideTimer;
    let direction = 1; // 1 para derecha, -1 para izquierda

    // --- Lógica de Arrastre (Drag) ---
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        stopAutoSlide();
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoSlide();
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoSlide();
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });

    // --- Lógica de Auto-Slide con Efecto Rebote ---
    function startAutoSlide() {
        stopAutoSlide(); // Limpiamos cualquier timer previo por seguridad
        
        autoSlideTimer = setInterval(() => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            const step = 340; // Ancho de la tarjeta + gap

            // Si va hacia la derecha y llega al final
            if (direction === 1 && slider.scrollLeft >= maxScroll - 10) {
                direction = -1;
            } 
            // Si va hacia la izquierda y llega al inicio
            else if (direction === -1 && slider.scrollLeft <= 10) {
                direction = 1;
            }

            // Ejecuta el movimiento según la dirección actual
            slider.scrollBy({ 
                left: step * direction, 
                behavior: 'smooth' 
            });
            
        }, 2000); // Lo bajé a 3 segundos para que sea más fluido
    }

    function stopAutoSlide() {
        clearInterval(autoSlideTimer);
    }

    startAutoSlide();
}

function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    const localVideo = document.getElementById('modalLocalVideo');
    const closeBtn = document.querySelector('.close-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    // Seleccionamos tanto las tarjetas de clientes como las de partners
    const allCards = document.querySelectorAll('.video-card, .partner-card');

    allCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Caso A: Es un partner con video local (.mp4)
            const internalVideo = this.querySelector('video source');
            if (internalVideo) {
                localVideo.src = internalVideo.src;
                localVideo.style.display = 'block';
                iframe.style.display = 'none';
                iframe.src = ''; 
                localVideo.play(); // Inicia con sonido automáticamente
            } 
            
            // Caso B: Es un cliente de YouTube (link externo)
            else {
                const url = this.getAttribute('href');
                const videoId = extractVideoID(url);
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    iframe.style.display = 'block';
                    localVideo.style.display = 'none';
                    localVideo.pause();
                }
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; 
        });
    });

    function closeModal() {
        modal.style.display = 'none';
        iframe.src = '';
        localVideo.pause(); // Detenemos el video local
        localVideo.src = ''; 
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    function extractVideoID(url) {
        if(!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}

// Arranque de la aplicación (A prueba de fallos)
document.addEventListener('DOMContentLoaded', async () => {
    // 1. INICIALIZAR EL VIDEO PRIMERO (Para que funcione de inmediato)
    initVideoModal();

    // 2. Inicializar animaciones y carrusel (que están en el index.html principal)
    initScrollAnimations(); 
    initDraggableCarousel();
    
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        await loadComponent('header-placeholder', 'header.html');
        initDynamicHeader(); 
    }

    // 4. Cargar el Footer (Donde están las FAQs)
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        await loadComponent('footer-placeholder', 'footer.html');
        
        // ¡MOVER AQUÍ! Solo inicializamos el acordeón 
        // DESPUÉS de que el footer terminó de cargar.
        initAccordion(); 
    }
});