import Carousel from "./carousel.js";
import Box from "./Box.js";

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
        new Box({
            track: "#Bigtrack3D",
            next: "#next3D",
            prev: "#prev3D",
            space: 32,
            time: 500,
            porcentgeX: .10,
            porcentgez: .417,
            mask: "carousel__item--mask",
        })
    }
};
