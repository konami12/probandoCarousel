class Carousel {
    constructor() {
        /* eslint-disable no-multi-spaces */
        this.arrowNext = null; // Selector para la flecha de siguiente
        this.arrowPrevious = null; // Selector para la flecha de anterior
        this.endPoint = 0; // Valor del desplazamiento máximo permitido
        this.itemSize = 0; // Tamaño de un elemento del carrusel, incluyendo el gap
        this.moveItems = 0; // Número de elementos a mover por cada acción de "anterior" o "siguiente"
        this.oldTrack = 0; // Almacena el ancho del carrusel
        this.pixels = 0; // Valor del desplazamiento actual en píxeles
        this.scroll = 0; // Almacena el scroll máximo permitido
        this.time = 0; // Duración de la animación de transición
        this.track = null; // Selector para el contenedor que contiene los elementos del carrusel
        this.secondTrack = null; // Selector para el contenedor que contiene los elementos del carrusel
        this.viewItems = 0; // Número de elementos visibles dentro del carrusel
        this.enabledPagination = false; // Permite la creación de botones de navegación
        this.buttonList = []; // Lista de botones del carrusel
        this.buttonPanel = null; // Referencia al contenedor de los botones
        this.counter = 0; // Contador de posicion del carrusel
        this.itemPagintion = false; // Habilita la paginación de los elementos
    }
    /**
     * Inicializa una nueva instancia de la clase Carousel.
     *
     * @param {Settings} setting - configuración del carrusel
     * @returns {void}
     */
    init(setting) {
        const { track = "empty", secondTrack = "empty", arrowNext = "empty", arrowPrevious = "empty", time = 500, moveItems = 0, enabledPagination = false, itemPagintion = false, } = setting;
        this.track = document.querySelector(track) || null;
        this.secondTrack = document.querySelector(secondTrack) || null;
        this.arrowNext = document.querySelector(arrowNext) || null;
        this.arrowPrevious = document.querySelector(arrowPrevious) || null;
        this.time = time;
        this.moveItems = moveItems;
        this.enabledPagination = enabledPagination;
        this.itemPagintion = itemPagintion;
        this.setup();
        this.bindEvents();
        this.createPointer();
        window.addEventListener("resize", this.debounce(() => {
            if (this.track) {
                if (this.oldTrack !== this.track.offsetWidth)
                    this.setup(true);
            }
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
    action(isNext = false) {
        const MOVEMENT_SIZE = (this.itemSize * this.moveItems);
        this.pixels = isNext
            ? Math.min(this.pixels + MOVEMENT_SIZE, this.endPoint)
            : Math.max(this.pixels - MOVEMENT_SIZE, 0);
        this.counter += isNext ? 1 : -1;
        if (this.enabledPagination) {
            const OLD = (isNext) ? this.counter - 1 : this.counter + 1;
            this.updateActiveButton(OLD, this.counter);
            this.move();
        }
        if (this.secondTrack) {
            const SECOND_SON = Array.from(this.secondTrack.children);
            SECOND_SON[this.counter].click();
        }
        this.move();
    }
    ;
    /**
     * Vincula los eventos de click a los botones de navegación.
     * Asigna los eventos para los botones "siguiente" y "anterior".
     *
     * @private
     * @returns {void}
     */
    bindEvents() {
        if (this.arrowNext && this.arrowPrevious) {
            this.arrowNext.addEventListener("click", () => this.action(true));
            this.arrowPrevious.addEventListener("click", () => this.action());
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
    debounce(func, delay) {
        let timeout;
        return (...args) => {
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
    isDesktop() {
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
    move() {
        if (!this.track)
            return;
        this.track.style.transform = `translate3d(-${Math.min(this.pixels, this.endPoint)}px, 0px, 0px)`;
        this.track.style.transition = `transform ${this.time}ms ease`;
        this.track.dataset.position = (this.counter + 1).toString();
        this.updateArrowVisibility();
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
    setup(reset = false) {
        var _a;
        if (this.track && this.isDesktop()) {
            const { children = [], offsetWidth: trackWidth } = this.track;
            if (!children || children.length === 0)
                return;
            const { offsetWidth: itemWidth } = children[0];
            const AUX = document.defaultView ? (_a = document.defaultView.getComputedStyle(this.track)) === null || _a === void 0 ? void 0 : _a.gap : "0";
            const GAP = parseInt(AUX, 10);
            this.viewItems = Math.floor(trackWidth / (itemWidth));
            this.itemSize = itemWidth + GAP;
            this.scroll = GAP + trackWidth;
            this.endPoint = (children.length * this.itemSize) - trackWidth - GAP;
            this.scroll = (this.endPoint - this.scroll) + this.itemSize;
            this.moveItems = (this.moveItems === 0 || this.moveItems > this.viewItems) ? this.viewItems : this.moveItems;
            const isActive = this.viewItems < children.length;
            this.track.style.overflow = "initial";
            this.pixels = (reset && this.pixels > 0) ? 0 : this.pixels;
            this.oldTrack = trackWidth;
            if (isActive) {
                this.move();
                const CHILDREN = Array.from(children);
                this.paginationItem(CHILDREN);
            }
            this.activeSecondSlider();
        }
        else {
            if (this.track) {
                this.track.style.overflow = "auto";
            }
            this.updateArrowVisibility(true);
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
    updateArrowVisibility(normal = false) {
        if (!this.arrowNext || !this.arrowPrevious)
            return;
        const DISPLAY_VALUE = normal ? "" : "block";
        this.arrowPrevious.style.display = normal || this.pixels === 0 ? "none" : DISPLAY_VALUE;
        this.arrowNext.style.display = normal || this.pixels >= this.endPoint ? "none" : DISPLAY_VALUE;
    }
    /**
     * Crea y gestiona los botones indicadores (puntos) del carrusel.
     *
     * @private
     * @returns {void}
     */
    createPointer() {
        var _a, _b;
        if (this.enabledPagination && this.track) {
            this.buttonPanel = document.createElement("div");
            this.buttonPanel.classList.add("carousel__buttons");
            this.buttonPanel.dataset.item = "0";
            const $FRAGMENT = document.createDocumentFragment();
            const children = this.track.children;
            for (let index = 0; index < children.length; index++) {
                const $BUTTON = document.createElement("button");
                $BUTTON.dataset.index = index.toString();
                this.buttonList.push($BUTTON);
                if (index === 0)
                    $BUTTON.classList.add("carousel__button--active");
                $FRAGMENT.appendChild($BUTTON);
            }
            this.buttonPanel.appendChild($FRAGMENT);
            (_b = (_a = this === null || this === void 0 ? void 0 : this.track) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.appendChild(this.buttonPanel);
            this.buttonPanel.addEventListener("click", (event) => {
                var _a, _b;
                const BUTTON = ((_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.closest("button")) || null;
                if (!BUTTON)
                    return;
                const DATA_INDEX = BUTTON.dataset.index || "0";
                const OLD_ITEM = ((_b = this.buttonPanel) === null || _b === void 0 ? void 0 : _b.dataset.item) || "0";
                this.updateActiveButton(parseInt(OLD_ITEM, 10), parseInt(DATA_INDEX, 10));
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
    updateActiveButton(oldIndex, newIndex) {
        if (this.buttonList[oldIndex] && this.buttonList[newIndex] && this.buttonPanel) {
            this.buttonList[oldIndex].classList.remove("carousel__button--active");
            this.buttonList[newIndex].classList.add("carousel__button--active");
            this.buttonPanel.dataset.item = newIndex.toString();
            this.pixels = this.itemSize * newIndex;
            this.counter = newIndex;
            this.move();
        }
    }
    /**
     * Permite que los items del carrusel puedan mover el carousel.
     *
     * @param   {Array<Element>}  children  Listado de los items disponibles en el carrusel.
     *
     * @returns  {void}
     */
    paginationItem(children) {
        if (this.itemPagintion && this.moveItems === 1) {
            Array.from(children).forEach((child, index) => {
                const element = child;
                element.dataset.index = String(index);
                element.addEventListener("click", () => {
                    const AUX = this.itemSize * Number(element.dataset.index);
                    this.pixels = Math.min(AUX, this.endPoint);
                    this.move();
                });
            });
        }
    }
    /**
     * Permite manipular el segundo carrusel desde el carousel padre
     *
     * @return  {void}
     */
    activeSecondSlider() {
        if (this.secondTrack) {
            const SECOND_SON = Array.from(this.secondTrack.children);
            this.secondTrack.addEventListener("click", (event) => {
                const TARGET = event.target;
                let INDEX = SECOND_SON.indexOf(TARGET); // Encuentra la posición del elemento clickeado
                const AUX = this.itemSize * INDEX;
                this.pixels = Math.min(AUX, this.endPoint);
                this.counter = INDEX;
                this.move();
            });
        }
    }
    /**
     * Devuelve la posición actual del carrusel.
     *
     * @returns {number} - Posición actual del carrusel.
     */
    get position() {
        return this.counter;
    }
}
export default Carousel;
