import Carousel from "./Carousel.js";
import Axis3D from "./Axis3D.js";

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        new Carousel().init({
            arrowPrevious:"#card-by-card-previous",
            arrowNext:"#card-by-card-next",
            track:"#card-by-card-track",
            moveItems: 1,
        });

        new Carousel().init({
            arrowPrevious:"#fluid-previous",
            arrowNext:"#fluid-next",
            track:"#fluid-track",
        });

        new Carousel().init({
            arrowPrevious:"#full-previous",
            arrowNext:"#full-next",
            track:"#full-track",
        });

        new Carousel().init({
            arrowPrevious:"#full-pagination-previous",
            arrowNext:"#full-pagination-next",
            track:"#full-pagination-track",
            enabledPagination: true,
        });

        new Carousel().init({
            arrowNext: "#master-next",
            arrowPrevious: "#master-previous",
            track: "#master-track",
            secondTrack: "#slave-track",
            itemClass: "mask",
        });

        new Carousel().init({
            track: "#slave-track",
            moveItems:1,
            itemPagintion: true,
            time: 300,
            itemClass: "mask",
        });

        new Axis3D({
            track: "#axis-track",
            arrowNext: "#axis-next",
            arrowPrevious: "#axis-prev",
            space: 32,
            time: 500,
            porcentgeX: .10,
            porcentgeZ: .417,
            mask: "carousel__item--mask",
            advance: 0,
        });
    }
};
