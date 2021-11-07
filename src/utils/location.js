import randomLocation from "random-location";
const center = {
    latitude: process.env.REACT_APP_LATITUDE,
    longitude: process.env.REACT_APP_LONGITUDE,
};

export const randomPoint = (radius) => {
    return randomLocation.randomCirclePoint(center, radius);
};
