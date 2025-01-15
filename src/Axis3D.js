class Axis3D {
    /**
     * Inicializa una nueva instancia de la clase Carousel.
     *
     * @param {Settings} setting - configuración del carrusel
     */
    constructor(setting) {
        this.coordinates = {
            previus: [],
            next: [],
        };
        this.counter = 0; // Contador de elementos
        this.axisZ = 0; // Eje Z
        this.axisX = 0; // Eje X
        this.translateX = 0; // Valor de la transformación en el eje X
        this.itemSize = 0; // Tamaño de los elementos del carrusel
        const { track = "empty", arrowNext = "empty", arrowPrevious = "empty", mask = "", space = 32, time = 500, porcentgeX = .10, porcentgeZ = .417, advance = 0, } = setting;
        this.track = document.querySelector(track) || null;
        this.arrowNext = document.querySelector(arrowNext) || null;
        this.arrowPrevious = document.querySelector(arrowPrevious) || null;
        this.mask = mask;
        this.space = space;
        this.time = `transform ${time}ms`;
        this.porcentgeX = porcentgeX;
        this.porcentgeZ = porcentgeZ;
        this.setup();
        this.jumpTo(advance);
    }
    /**
     * Configura el carrusel inicializando las propiedades necesarias.
     *
     * @private
     * @param {boolean} [reset=false] - Restablece la posición del carrusel a su estado inicial.
     * @returns {void}
     */
    setup() {
        if (this.track && this.arrowNext && this.arrowPrevious) {
            if (this.track.parentNode) {
                const VALUE = getComputedStyle(this.track.parentNode).perspective || "0";
                const PERSPECTIVE = parseInt(VALUE, 10);
                // Calculos
                this.axisZ = Math.floor(PERSPECTIVE * this.porcentgeZ);
                this.axisX = Math.floor(PERSPECTIVE * this.porcentgeX);
                this.translateX = this.space + this.axisZ;
                this.itemSize = this.track.children[0].clientWidth;
                this.applyTransform(this.track, this.translateX, 0);
                //primera corrida
                for (let item = 0; item < this.track.children.length; item++) {
                    const ITEM = this.track.children[item];
                    this.coordinates.next.push({
                        x: this.axisX * item,
                        z: this.axisZ * -item,
                    });
                    const AXIS_X = this.axisX * item;
                    const AXIS_Z = (this.axisZ * item) * -1;
                    this.applyTransform(ITEM, AXIS_X, AXIS_Z);
                    ITEM.dataset.index = item.toString();
                    this.setActionMask(ITEM);
                    if (item > 0)
                        ITEM.classList.toggle(this.mask);
                }
                this.bindEvents();
            }
        }
    }
    /**
     * Establece la acción de los botones de navegación.
     *
     * @private
     * @param {HTMLElement} item - Elemento HTML al que se le asignará la acción.
     * @returns {void}
     */
    setActionMask(item) {
        if (item) {
            const MASK = item.querySelector("span:first-of-type");
            if (MASK) {
                MASK.addEventListener("click", () => {
                    var _a;
                    const INDEX = parseInt(((_a = item === null || item === void 0 ? void 0 : item.dataset) === null || _a === void 0 ? void 0 : _a.index) || "0", 10);
                    this.jumpTo(INDEX);
                });
            }
        }
    }
    /**
     * Desplaza el carrusel a un elemento específico.
     *
     * @param {number} item - Elemento al que se desplazará el carrusel.
     * @returns {void}
     */
    jumpTo(item) {
        var _a;
        const SIZE = ((_a = this.track) === null || _a === void 0 ? void 0 : _a.children.length) || 0;
        const MOVE_TO = Math.abs(item) > SIZE ? SIZE : item;
        const RUN = Math.abs(MOVE_TO) - this.counter;
        const IS_NEXT = MOVE_TO > 0;
        for (let index = 0; index < Math.abs(RUN); index++) {
            this.move(IS_NEXT);
        }
    }
    /**
     * Vincula los eventos de click a los botones de navegación.
     * Asigna los eventos para los botones "siguiente" y "anterior".
     *
     * @private
     * @returns {void}
     */
    bindEvents() {
        if (this.arrowNext && this.arrowPrevious) {
            this.arrowNext.addEventListener("click", () => this.move(true));
            this.arrowPrevious.addEventListener("click", () => this.move());
        }
    }
    /**
     * Desplaza los elementos del carrusel aplicando una transformación 3D.
     * Utiliza la propiedad `translate3d` para mover el contenedor del carrusel horizontalmente.
     *
     * @private
     * @param {boolean} isNext - Permite identificar en que direccion se genera el movimiento.
     * @returns {void}
     */
    move(isNext = false) {
        if (this.track) {
            const INDEX = this.counter;
            let oldCoordinates = this.coordinates.next[this.counter];
            let newsCoordinates = { x: 0, z: 0 };
            let auxiliar = 0;
            if (isNext && this.counter < this.track.children.length - 1) {
                this.counter++;
                this.translateX = this.translateX - this.itemSize;
                const { z, x } = this.coordinates.next[this.counter];
                newsCoordinates = { x: -1 * x, z };
                this.coordinates.previus.unshift(newsCoordinates);
            }
            else if (!isNext && this.counter > 0) {
                this.counter--;
                this.translateX = this.translateX + this.itemSize;
                const { z, x } = this.coordinates.next[this.counter];
                newsCoordinates = { x: -1 * x, z };
                this.coordinates.previus.shift();
            }
            this.coordinates.next[INDEX] = newsCoordinates;
            this.coordinates.next[this.counter] = oldCoordinates;
            this.applyTransform(this.track, this.translateX, 0);
            for (let index = 0; index < this.track.children.length; index++) {
                const ITEM = this.track.children[index];
                const { x, z } = index < this.coordinates.previus.length ? this.coordinates.previus[index] : this.coordinates.next[index];
                auxiliar += index > this.coordinates.previus.length ? 1 : 0;
                ITEM.classList.remove(this.mask);
                ITEM.style.transition = this.time;
                ITEM.style.transform = index < this.coordinates.previus.length
                    ? `translate3d(${x}px, 0 ,${z}px)`
                    : `translate3d(${x == 0 ? 0 : (auxiliar * this.axisX)}px, 0 ,${z === 0 ? z : (-auxiliar * this.axisZ)}px)`;
                if (x !== 0) {
                    ITEM.dataset.index = ((x < 0) ? -index : index).toString();
                    ITEM.classList.toggle(this.mask);
                }
            }
        }
    }
    /**
     * permite cambiar la los estilos para la transformación 3D.
     *
     * @param   {HTMLElement}  element  Elemento al que se le aplicará la transformación.
     * @param   {number}       x        Valor para el eje X
     * @param   {number}       z        Valor para el eje Z
     *
     * @return  {void}
     */
    applyTransform(element, x, z) {
        element.style.transform = `translate3d(${x}px, 0 ,${z}px)`;
        element.style.transition = this.time;
    }
}
export default Axis3D;
