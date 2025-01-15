import Box from "./Box.js";

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
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


