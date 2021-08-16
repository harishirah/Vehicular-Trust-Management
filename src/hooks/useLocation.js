import { useState } from "react";

export default function useLocation() {
	const [position, setPosition] = useState({});
	const getCurrentLocation = () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition((position) => {
				let lat = position.coords.latitude,
					long = position.coords.longitude;
				setPosition({
					latitude: lat,
					longitude: long,
				});
			});
			if (position) return position;
		} else {
			console.log("Geolocation not enabled!!");
		}
	};
	return { getCurrentLocation };
}
