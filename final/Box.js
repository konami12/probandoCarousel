class Box {
    constructor(settings) {
        this.track = document.querySelector(settings.track) || null;
        this.next = document.querySelector(settings.next) || null;
        this.prev = document.querySelector(settings.prev) || null;
        this.mask = settings.mask || "";
        this.space = settings.space || 32;
        this.cors = [];
        this.count = 0;
        this.cors2 = [];
        this.init();
    }

    init() {
        //conseguimos la perspectiva
        let perspective = getComputedStyle(this.track.parentNode).perspective;
        perspective = parseInt(perspective);

        this.axisX = Math.floor(perspective * .10);
        this.axisZ = Math.floor(perspective * .417);
        this.tx = this.space + this.axisZ;
        this.itemSize = this.track.children[0].offsetWidth;
        this.track.style.transform = `translate3d(${this.tx}px, 0 ,0)`;

        for (let item = 0; item < this.track.children.length; item++) {
            const ITEMS = this.track.children[item];
            this.cors.push({
                x: this.axisX * item,
                z: this.axisZ * -item
            });
            ITEMS.style.transform = `translate3d(${this.axisX * item}px, 0 ,-${this.axisZ * item}px)`;
            ITEMS.dataset.index = item;

            ITEMS.querySelector("span:first-of-type")
            .addEventListener("click", (e) => {
                console.clear();
                const DEMO = parseInt(ITEMS.dataset.index);
                const run = Math.abs(DEMO) - this.count;
                const isNext = DEMO > 0;
                for (let i = 0; i < Math.abs(run); i++) {
                    this.moveArray(isNext);
                }
            });

            if (item > 0) {
                ITEMS.classList.toggle(this.mask);
            }
        }
        this.prev.addEventListener("click", () => this.moveArray(false));
        this.next.addEventListener("click", () => this.moveArray(true));
    }

    moveArray(isNext = false) {
        let old = this.cors[this.count];
        const INDEX = this.count;
        let news = {};

        if (isNext && this.count < this.track.children.length - 1) {
            this.count++;
            this.tx = this.tx - this.itemSize;
            const { x, z } = this.cors[this.count];
            news = { x: -1*x  , z };
            this.cors2.unshift(news)
        } else if (!isNext && this.count > 0) {
            this.count--;
            this.tx = this.tx + this.itemSize;
            const { x, z } = this.cors[this.count];
            news = { x: -1*x  , z };
            this.cors2.shift();
        }
        console.log(this.count)
        this.cors[INDEX] = news;
        this.cors[this.count] = old;
        this.track.style.transform = `translate3d(${this.tx}px, 0 ,0)`;
        this.track.style.transition = "transform 500ms";
        let aux = 0;

        for (let index = 0; index < this.track.children.length; index++) {
            const ITEM = this.track.children[index];

            const {x ,z} = index < this.cors2.length ? this.cors2[index] : this.cors[index];
            aux += index > this.cors2.length ? 1 : 0;
            ITEM.classList.remove(this.mask);
            const STYLE = index < this.cors2.length ? `translate3d(${x}px, 0 ,${z}px)` : `translate3d(${x == 0 ? 0 : (aux*this.axisX)}px, 0 ,${z === 0 ? z : (-aux*this.axisZ)}px)`;
            ITEM.style.transition = "transform 500ms";
            ITEM.style.transform = STYLE;

            if (x !== 0) {
                ITEM.dataset.index = (x < 0) ? -index : index;
                ITEM.classList.toggle(this.mask);
            }
        }
    }
}

export default Box;