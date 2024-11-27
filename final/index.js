import Carousel from "./carousel.js";

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {

        new Carousel({
            arrowPrevious: "#previous",
            arrowNext: "#next",
            track: "#track",
        });

        new Carousel({
            arrowNext: "#Outnext",
            arrowPrevious: "#Outprevious",
            moveItems: 1,
            track: "#Outtrack",
        });

        new Carousel({
            arrowNext: "#Bignext",
            arrowPrevious: "#Bigprevious",
            enabledPoint: true,
            moveItems: 1,
            track: "#Bigtrack",
        });
    }
};
