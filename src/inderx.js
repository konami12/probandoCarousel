import Carousel from "./Carousel.js";
import Axis3D from "./Axis3D.js";

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

        new Axis3D({
            track: "#Bigtrack3D",
            arrowNext: "#next3D",
            arrowPrevious: "#prev3D",
            space: 32,
            time: 500,
            porcentgeX: .10,
            porcentgeZ: .417,
            mask: "carousel__item--mask",
            advance: 0,
        });

    }
};
