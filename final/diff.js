class Carousel {
    /* Valores privados */
    #arrowNext = "";
    #arrowPrevious = "";
    #track = "";
    #time = 0;
    #itemSize = 0;
    #scroll = 0;
    #viewItems = 0;
    #endPoint = 0;
    #moveItems = 0;
    #pixels = 0;
    #isTransitioning = false;
    #gap = 0;

    constructor(setting) {
        this.#track = document.querySelector(setting?.track || "empty") || null;
        this.#arrowNext = document.querySelector(setting?.arrowNext || "empty") || null;
        this.#arrowPrevious = document.querySelector(setting?.arrowPrevious || "empty") || null;
        this.#time = setting?.time || 500;
        this.#moveItems = setting?.moveItems || 0;

        this.#setup();
        this.#bindEvents();
    }

    #setup() {
        if (this.#track && this.#isDesktop()) {
            const { children, offsetWidth: trackWidth } = this.#track;
            if (!children || children.length === 0) return;

            const { offsetWidth: itemWidth } = children[0];
            // Cachear el gap solo una vez
            this.#gap = parseInt(document.defaultView.getComputedStyle(this.#track).gap, 10) || 0;
            
            this.#viewItems = Math.floor(trackWidth / itemWidth);
            this.#itemSize = itemWidth + this.#gap;
            this.#scroll = this.#gap + trackWidth;
            this.#endPoint = (children.length * this.#itemSize) - trackWidth - this.#gap;
            this.#scroll = (this.#endPoint - this.#scroll) + this.#itemSize;

            // Si no se especifica el número de items a mover, mover el número visible
            this.#moveItems = (this.#moveItems === 0 || this.#moveItems > this.#viewItems) ? this.#viewItems : this.#moveItems;

            const isActive = (this.#itemSize * this.#viewItems) > trackWidth;
            if (isActive) this.#move();
            
            // El overflow solo se setea una vez
            this.#track.style.overflow = "initial";
        } else {
            this.#track.style.overflow = "auto";
        }
    }

    #bindEvents() {
        if (this.#arrowNext && this.#arrowPrevious) {
            this.#arrowNext.addEventListener("click", this.#debounce(() => this.#action(true), this.#time));
            this.#arrowPrevious.addEventListener("click", this.#debounce(() => this.#action(), this.#time));
        }
    }

    #move() {
        if (!this.#isTransitioning) {
            this.#isTransitioning = true;

            // Usamos requestAnimationFrame para mejorar la animación
            requestAnimationFrame(() => {
                this.#track.style.transform = `translate3d(-${this.#pixels}px, 0px, 0px)`;
                this.#track.style.transition = `transform ${this.#time}ms ease`;

                this.#arrowPrevious.style.display = this.#pixels === 0 ? "none" : "block";
                this.#arrowNext.style.display = this.#pixels >= this.#endPoint ? "none" : "block";

                setTimeout(() => { // Esperar que termine la transición
                    this.#isTransitioning = false;
                }, this.#time);
            });
        }
    }

    #action(isNext = false) {
        const MOVE_TO = (this.#itemSize * this.#moveItems);
        this.#pixels = isNext
            ? Math.min(this.#pixels + MOVE_TO, this.#endPoint)
            : Math.max(this.#pixels - MOVE_TO, 0);
        
        this.#move();
    }

    #isDesktop() {
        // Cachear el resultado del matchMedia para no recalcular constantemente
        const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return hasFinePointer && !hasTouchSupport;
    }

    #debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

export default Carousel;
