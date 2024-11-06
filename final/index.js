import Carousel from "./carousel.js";

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {

        new Carousel({
            arrowPrevious: "#previous",
            arrowNext: "#next",
            track: "#track",
        });

        new Carousel({
            arrowPrevious: "#Bigprevious",
            arrowNext: "#Bignext",
            track: "#Bigtrack",
            moveItems: 1,
        });
    }
};