type ItemDom = HTMLElement | null;

type Settings = {
	track: string;
	arrowNext: string;
	arrowPrevious: string;
	time: number;
    moveItems: number;
    enabledPagination: boolean;
    itemPagintion?: boolean;
    secondTrack: string;
    itemClass?: string;
    isVertical?: boolean;
    enabledTouch?: boolean;
};

class Carousel {

    /* eslint-disable no-multi-spaces */
    private arrowNext: ItemDom = null;          // Selector para la flecha de siguiente
    private arrowPrevious: ItemDom = null;      // Selector para la flecha de anterior
    private endPoint: number = 0;               // Valor del desplazamiento máximo permitido
    private itemSize: number = 0;               // Tamaño de un elemento del carrusel, incluyendo el gap
    private moveItems: number = 0;              // Número de elementos a mover por cada acción de "anterior" o "siguiente"
    private oldTrack: number = 0;               // Almacena el ancho del carrusel
    private pixels: number = 0;                 // Valor del desplazamiento actual en píxeles
    private scroll: number = 0;                 // Almacena el scroll máximo permitido
    private time: number = 0;                   // Duración de la animación de transición
    private track: ItemDom = null;              // Selector para el contenedor que contiene los elementos del carrusel
    private secondTrack: ItemDom = null;        // Selector para el contenedor que contiene los elementos del carrusel
    private viewItems: number = 0;              // Número de elementos visibles dentro del carrusel
    private enabledPagination: boolean = false; // Permite la creación de botones de navegación
    private buttonList: Array<ItemDom> = [];    // Lista de botones del carrusel
    private buttonPanel: ItemDom = null;        // Referencia al contenedor de los botones
    private counter: number = 0;                // Contador de posicion del carrusel
    private itemPagintion: boolean = false;     // Habilita la paginación de los elementos
    private itemClass: string = "";             // Clase de los items del carrusel
    private isVertical: boolean = false;        // Indica si el carrusel es vertical
    private startAxis: number = 0;
    private isDragging: boolean = false;
    private enabledTouch: boolean = false;
    private observation:any = null;

    /**
     * Inicializa una nueva instancia de la clase Carousel.
     *
     * @param {Settings} setting - configuración del carrusel
     * @returns {void}
     */
    init(setting: Settings) {
        const {
            track = "empty",
            secondTrack = "empty",
            arrowNext = "empty",
            arrowPrevious = "empty",
            time = 500,
            moveItems = 0,
            enabledPagination = false,
            itemPagintion = false,
            itemClass = "",
            isVertical = false,
            enabledTouch = true,
        } = setting;

        this.track = document.querySelector(track) || null;
        this.secondTrack = document.querySelector(secondTrack) || null;
        this.arrowNext = document.querySelector(arrowNext) || null;
        this.arrowPrevious = document.querySelector(arrowPrevious) || null;
        this.time = time;
        this.moveItems = moveItems;
        this.enabledPagination = enabledPagination;
        this.itemPagintion = itemPagintion;
        this.itemClass = itemClass;
        this.isVertical = isVertical;
        this.enabledTouch = enabledTouch;
        this.setup();
        this.bindEvents();
        this.createPointer();
        window.addEventListener("resize", this.debounce(() => {
            if (this.track) {
                if (this.oldTrack !== this.track.offsetWidth)
                    this.setup(true)
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
    private action(isNext:boolean = false): void {
        const MOVEMENT_SIZE: number = (this.itemSize * this.moveItems);
        this.pixels = isNext
        ? Math.min(this.pixels + MOVEMENT_SIZE, this.endPoint)
        : Math.max(this.pixels - MOVEMENT_SIZE, 0);
        this.counter += isNext ? 1 : -1;
        if (this.enabledPagination) {
            const OLD = (isNext) ? this.counter-1 : this.counter+1;
            this.updateActiveButton(OLD, this.counter);
            this.move();
        }
        if (this.secondTrack) {
            const SECOND_SON = Array.from(this.secondTrack.children);
            this.secondTrack.querySelector(`.${this.itemClass}`)?.classList.remove(this.itemClass);
            (SECOND_SON[this.counter] as HTMLElement).click();
        }

        this.move();
    };

    /**
     * Vincula los eventos de click a los botones de navegación.
     * Asigna los eventos para los botones "siguiente" y "anterior".
     *
     * @private
     * @returns {void}
     */
    private bindEvents(): void {
        if (this.arrowNext && this.arrowPrevious) {
            this.arrowNext.addEventListener("click", () => this.action(true));
            this.arrowPrevious.addEventListener("click", () => this.action());
        }

        if (this.track && this.enabledTouch && !this.isDesktop()) {
            this.track.addEventListener("touchstart", this.handleTouchStart.bind(this));
            this.track.addEventListener("touchmove", this.handleTouchMove.bind(this));
            this.track.addEventListener("touchend", this.handleTouchEnd.bind(this));
//            if (this.track) {
//                this.track.style.overflow = "auto";
//                this.track.style.scrollSnapType = `${this.isVertical ? "y" : "x"} mandatory`;
//            }

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
    private debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: any[]) => {
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
    private isDesktop(): boolean {
        const HAS_FINE_POINTER: boolean = window.matchMedia("(pointer: fine)").matches;
        const HAS_TOUCH_SUPPORT: boolean = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return HAS_FINE_POINTER && !HAS_TOUCH_SUPPORT;
    }

    /**
     * Desplaza los elementos del carrusel aplicando una transformación 3D.
     * Utiliza la propiedad `translate3d` para mover el contenedor del carrusel horizontalmente.
     *
     * @private
     * @returns {void}
     */
    private move(): void {
        if (!this.track) return;
        const AXIS = this.isVertical ? `0, -${Math.min(this.pixels, this.endPoint)}px` : `-${Math.min(this.pixels, this.endPoint)}px, 0`;
        this.track.style.transform = `translate3d(${AXIS}, 0)`;
        this.track.style.transition = `transform ${this.time}ms ease`;
        this.track.dataset.position = (this.counter +1).toString();

        if (this.isDesktop()) this.updateArrowVisibility();
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
    private setup(reset: boolean = false): void {
        if (this.track) {
            const { children = [], offsetWidth: trackWidth, offsetHeight: trackHight } = this.track;
            if (!children || children.length === 0) return;
            const { offsetWidth: itemWidth, offsetHeight: itemHight } = children[0] as HTMLElement;
            const ITEM_SIZE = this.isVertical ? itemHight : itemWidth;
            const TRACK_SIZE = this.isVertical ? trackHight : trackWidth;
            const AUX = document.defaultView ? document.defaultView.getComputedStyle(this.track)?.gap : "0";
            const GAP = parseInt(AUX, 10);
            this.viewItems = Math.floor(TRACK_SIZE/(ITEM_SIZE));
            this.itemSize = ITEM_SIZE + GAP;
            this.scroll = GAP + TRACK_SIZE;
            this.endPoint = (children.length * this.itemSize) - TRACK_SIZE - GAP;
            this.scroll = (this.endPoint - this.scroll) + this.itemSize;
            this.moveItems = (this.moveItems === 0 || this.moveItems > this.viewItems) ? this.viewItems : this.moveItems;
            const isActive = this.viewItems < children.length;
            //this.track.style.overflow = "initial";
            this.pixels = (reset && this.pixels > 0) ? 0 : this.pixels;
            this.oldTrack = TRACK_SIZE;
            if (isActive) {
                this.move();
                const CHILDREN = Array.from(children);
                this.paginationItem(CHILDREN)
            }
            this.activeSecondSlider();
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
    private updateArrowVisibility(normal = false): void {
        if (!this.arrowNext || !this.arrowPrevious) return;
        const DISPLAY_VALUE: string = normal ? "" : "block";
        this.arrowPrevious.style.display = normal || this.pixels === 0 ? "none" : DISPLAY_VALUE;
        this.arrowNext.style.display = normal || this.pixels >= this.endPoint ? "none" : DISPLAY_VALUE;
    }

    /**
     * Crea y gestiona los botones indicadores (puntos) del carrusel.
     *
     * @private
     * @returns {void}
     */
    private createPointer(): void {
        if (this.enabledPagination && this.track) {
            this.buttonPanel = document.createElement("div");
            this.buttonPanel.classList.add("carousel__buttons");
            this.buttonPanel.dataset.item = "0";

            const $FRAGMENT = document.createDocumentFragment();

            const children: HTMLCollection = this.track.children;
            for (let index = 0; index < children.length; index++) {
                const $BUTTON = document.createElement("button");
                $BUTTON.dataset.index = index.toString();
                this.buttonList.push($BUTTON);
                if (index === 0) $BUTTON.classList.add("carousel__button--active");
                $FRAGMENT.appendChild($BUTTON);
            }

            this.buttonPanel.appendChild($FRAGMENT);
            this?.track?.parentNode?.appendChild(this.buttonPanel);

            this.buttonPanel.addEventListener("click", (event) => {
                const BUTTON = (event?.target as Element)?.closest("button") || null;
                if (!BUTTON) return;
                const DATA_INDEX: string = BUTTON.dataset.index || "0";
                const OLD_ITEM:string = this.buttonPanel?.dataset.item || "0";
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
    private updateActiveButton(oldIndex: number, newIndex:number): void {
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
    private paginationItem(children: Array<Element>): void {
        if (this.itemPagintion && this.moveItems === 1 && this.track) {
            Array.from(children).forEach((child, index) => {
                const element = child as HTMLElement;
                element.dataset.index = String(index);
                if (index === 0 && this.itemClass) element.classList.add(this.itemClass);
                element.addEventListener("click", () => {
                    if (this.itemClass) {
                        this.track?.querySelector(`.${this.itemClass}`)?.classList.remove(this.itemClass);
                        element.classList.add(this.itemClass);
                    }
                    const AUX =this.itemSize * Number(element.dataset.index);
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
    private activeSecondSlider(): void {
        if (this.secondTrack) {
            const SECOND_SON = Array.from(this.secondTrack.children);
            this.secondTrack.addEventListener("click", (event) => {
                const TARGET = event.target as Element;
                let INDEX = SECOND_SON.indexOf(TARGET);  // Encuentra la posición del elemento clickeado
                const AUX =this.itemSize * INDEX;
                this.pixels = Math.min(AUX, this.endPoint);
                this.counter = INDEX;
                this.move();
            });
        }
    }

    private handleTouchStart(event: TouchEvent): void {
        this.isDragging = true;
        this.startAxis = this.isVertical ? event.touches[0].clientY : event.touches[0].clientX;
    }

    private handleTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return;
        const AXIS = this.isVertical ? event.touches[0].clientY : event.touches[0].clientX
        const deltaAxis = this.startAxis - AXIS;
        if (Math.abs(deltaAxis) > 30) {
            this.action(deltaAxis > 0);
            this.isDragging = false;
        }
    }

    private handleTouchEnd(): void {
        this.isDragging = false;
    }

    /**
     * Devuelve la posición actual del carrusel.
     *
     * @returns {number} - Posición actual del carrusel.
     */
	get position(): number {
        return this.counter;
    }
}

export default Carousel;