class Carousel {

    #arrowNext = "";       // Selector para la flecha de siguiente
    #arrowPrevious = "";   // Selector para la flecha de anterior
    #endPoint = 0;         // Valor del desplazamiento máximo permitido
    #itemSize = 0;         // Tamaño de un elemento del carrusel, incluyendo el gap
    #moveItems = 0;        // Número de elementos a mover por cada acción de "anterior" o "siguiente"
    #oldTrack = 0;         // Almacena el ancho del carrusel
    #pixels = 0;           // Valor del desplazamiento actual en píxeles
    #scroll = 0;           // Almacena el scroll máximo permitido
    #time = 0;             // Duración de la animación de transición
    #track = "";           // Selector para el contenedor que contiene los elementos del carrusel
    #viewItems = 0;        // Número de elementos visibles dentro del carrusel
    #enabledPoint = false; // Permite la creación de botones de navegación

    /**
     * Inicializa una nueva instancia de la clase Carousel.
     *
     * @param {Object} setting - configuración del carrusel
     * @returns {void}
     */
    constructor(setting){
        this.#track = document.querySelector(setting?.track || "empty") || null;
        this.#arrowNext = document.querySelector(setting?.arrowNext || "empty") || null;
        this.#arrowPrevious = document.querySelector(setting?.arrowPrevious || "empty") || null;
        this.#time = setting?.time || 500;
        this.#moveItems = setting?.moveItems || 0;
        this.#enabledPoint = setting?.enabledPoint || false;
        this.#setup();
        this.#bindEvents();
        this.#createPointer();
        window.addEventListener("resize", this.#debounce(() => {
            if (this.#oldTrack !== this.#track.offsetWidth)
                this.#setup(true)
        }, 200));
    }

    /**
     * Controla el desplazamiento de los elementos del carrusel.
     * Desplaza hacia adelante o atrás según el valor del parámetro `isNext`.
     *
     * @private
     * @param {boolean} [isNext=false] - Indica si el movimiento es hacia adelante (true) o hacia atrás (false).
     * @returns {void}
     */
    #action(isNext = false) {
        const MOVEMENT_SIZE = (this.#itemSize * this.#viewItems);
        this.#pixels = isNext
        ? Math.min(this.#pixels + MOVEMENT_SIZE, this.#endPoint)
        : Math.max(this.#pixels - MOVEMENT_SIZE, 0);

        console.log(this.#pixels);
        this.#move();
    };

    /**
     * Vincula los eventos de click a los botones de navegación.
     * Asigna los eventos para los botones "siguiente" y "anterior".
     *
     * @private
     * @returns {void}
     */
    #bindEvents() {
        if (this.#arrowNext && this.#arrowPrevious) {
            this.#arrowNext.addEventListener("click", () => this.#action(true));
            this.#arrowPrevious.addEventListener("click", () => this.#action());
        }
    }

    /**
     * Función que implementa un mecanismo de debounce.
     * Evita la ejecución repetida de una función en un corto intervalo de tiempo.
     *
     * @private
     * @param {Function} func - Función a la que se le aplica el debounce.
     * @param {number} delay - Tiempo de retraso en milisegundos.
     * @returns {Function} - Devuelve la función original con debounce aplicado.
     */
    #debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Verifica si el dispositivo es de tipo desktop.
     * Comprueba la presencia de un puntero de precisión y la ausencia de soporte táctil.
     *
     * @private
     * @returns {boolean} - Devuelve `true` si es un dispositivo de escritorio, de lo contrario `false`.
     */
    #isDesktop() {
        const HAS_FINE_POINTER = window.matchMedia("(pointer: fine)").matches;
        const HAS_TOUCH_SUPPORT = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return HAS_FINE_POINTER && !HAS_TOUCH_SUPPORT;
    }

    /**
     * Desplaza los elementos del carrusel aplicando una transformación 3D.
     * Utiliza la propiedad `translate3d` para mover el contenedor del carrusel horizontalmente.
     *
     * @private
     * @returns {void}
     */
    #move() {
        if (!this.#track) return;
        this.#track.style.transform = `translate3d(-${Math.min(this.#pixels, this.#endPoint)}px, 0px, 0px)`;
        this.#track.style.transition = `transform ${this.#time}ms ease`;
        this.#updateArrowVisibility();
    }

    /**
     * Configura el carrusel dependiendo del tamaño de la ventana.
     * En dispositivos de escritorio, ajusta el número de ítems visibles y su desplazamiento.
     * En dispositivos móviles, habilita el desplazamiento automático.
     *
     * @private
     * @param {boolean} [reset=false] - Restablece la posición del carrusel a su estado inicial.
     * @returns {void}
     */
    #setup(reset = false) {
        if (this.#track && this.#isDesktop()) {
            const { children = [], offsetWidth: trackWidth } = this.#track;
            if (!children || children.length === 0) return;

            const { offsetWidth: itemWidth } = children[0];
            const AUX = document.defaultView.getComputedStyle(this.#track)?.gap || 0
            const GAP = parseInt(AUX, 10);
            this.#viewItems = Math.floor(trackWidth/(itemWidth));
            this.#itemSize = itemWidth + GAP;
            this.#scroll = GAP + trackWidth;
            this.#endPoint = (children.length * this.#itemSize) - trackWidth - GAP;
            this.#scroll = (this.#endPoint - this.#scroll) + this.#itemSize;
            this.#moveItems = (this.#moveItems === 0 || this.#moveItems > this.#viewItems) ? this.#viewItems : this.#moveItems;
            const isActive = this.#viewItems < children.length;
            this.#track.style.overflow = "initial";
            this.#pixels = (reset && this.#pixels > 0) ? 0 : this.#pixels;
            this.#oldTrack = trackWidth;
            if (isActive) this.#move();
        }
        else {
            this.#track.style.overflow = "auto";
            this.#updateArrowVisibility(true);
        }
    }

    /**
     * Actualiza la visibilidad de las flechas de navegación.
     * Muestra u oculta las flechas de navegación dependiendo de la posición del carrusel.
     *
     * @private
     * @param  {boolean} [normal=false] - Si es `true`, muestra las flechas sin evaluar la posición.
     * @return {void}
     */
    #updateArrowVisibility(normal = false) {
        if (!this.#arrowNext || !this.#arrowPrevious) return;
        const DISPLAY_VALUE = normal ? "" : "block";
        this.#arrowPrevious.style.display = normal || this.#pixels === 0 ? "none" : DISPLAY_VALUE;
        this.#arrowNext.style.display = normal || this.#pixels >= this.#endPoint ? "none" : DISPLAY_VALUE;
    }

    /**
     * Crea y gestiona los botones indicadores (puntos) del carrusel.
     *
     * @private
     * @returns {void}
     */
    #createPointer() {
        if (this.#enabledPoint) {
            const $BUTTONS_PANEL = document.createElement("div");
            $BUTTONS_PANEL.classList.add("carousel__buttons");
            $BUTTONS_PANEL.dataset.item = 0;

            const $FRAGMENT = document.createDocumentFragment();

            const { children = [] } = this.#track;
            const BUTTONS = [];

            for (let index = 0; index < children.length; index++) {
                const $BUTTON = document.createElement("button");
                $BUTTON.dataset.index = index;
                BUTTONS.push($BUTTON);
                if (index === 0) $BUTTON.classList.add("carousel__button--active");
                $FRAGMENT.appendChild($BUTTON);
            }

            $BUTTONS_PANEL.appendChild($FRAGMENT);
            this.#track.parentNode.appendChild($BUTTONS_PANEL);

            $BUTTONS_PANEL.addEventListener("click", (event) => {
                const BUTTON = event.target.closest("button");
                if (!BUTTON) return;

                const index = parseInt(BUTTON.dataset.index, 10);
                const OLD_ITEM = parseInt($BUTTONS_PANEL.dataset.item, 0);
                this.#updateActiveButton(BUTTONS, $BUTTONS_PANEL, OLD_ITEM, index);
            });
        }
    }

    /**
     * Actualiza el botón activo, los datos asociados y realiza el movimiento.
     *
     * @private
     * @param {Array} buttons - Lista de botones del carrusel
     * @param {HTMLElement} container - Contenedor de los botones
     * @param {number} oldIndex - Índice del botón previamente activo
     * @param {number} newIndex - Índice del nuevo botón a activar
     * @returns {void}
     */
    #updateActiveButton(buttons, container, oldIndex, newIndex) {
        buttons[oldIndex].classList.remove("carousel__button--active");
        buttons[newIndex].classList.add("carousel__button--active");

        container.dataset.item = newIndex;
        this.#pixels = this.#itemSize * newIndex;
        this.#move();
    }

}

export default Carousel;
