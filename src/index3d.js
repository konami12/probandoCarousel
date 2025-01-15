import Axis3D from "./Axis3D.js";
document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
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
