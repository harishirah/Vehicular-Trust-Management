import React, { useReducer, createContext } from "react";
import { rsuAddress } from "./constants";

const initialState = {
    vehicles: [],
    messages: [
        "event 1",
        "event 2",
        "event 3",
        "event 4",
        "event 5",
        "event 6",
        "event 7",
        "event 8",
        "event 9",
        "event 10",
        "event 11",
        "event 12",
        "event 13",
        "event 14",
        "event 15",
        "event 16",
        "event 17",
        "event 18",
        "event 19",
    ],
    myPublicAddress: null,
    location: null,
};

if (localStorage.getItem("rsuVehicles")) {
    const data = JSON.parse(localStorage.getItem("rsuVehicles"));
    if (data.rsuAddress !== rsuAddress) {
        localStorage.removeItem("rsuVehicles");
    } else {
        initialState.vehicles = data.vehicles;
    }
}

const MainContext = createContext(initialState);

const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_VEHICLE":
            const newVehicles = [
                ...state.vehicles.filter(
                    (vehicle) => vehicle !== action.payload
                ),
                action.payload,
            ];
            localStorage.setItem(
                "rsuVehicles",
                JSON.stringify({ rsuAddress, vehicles: newVehicles })
            );
            return {
                ...state,
                vehicles: newVehicles,
            };
        case "ADD_MESSAGE":
            return {
                ...state,
                messages: [
                    ...state.messages.filter(
                        (message) => message !== action.payload
                    ),
                    action.payload,
                ],
            };
        case "VEHICLE_LOGIN":
            return {
                ...state,
                myPublicAddress: action.payload,
            };
        case "SET_LOCATION":
            return {
                ...state,
                location: action.payload,
            };
        default:
            return state;
    }
};

function MainContextProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);

    function addVehicle(address) {
        dispatch({ type: "ADD_VEHICLE", payload: address });
    }

    function addMessage(message) {
        dispatch({ type: "ADD_MESSAGE", payload: message });
    }

    function vehicleLogin(pk) {
        dispatch({ type: "VEHICLE_LOGIN", payload: pk });
    }

    function setLocation(pos) {
        dispatch({ type: "SET_LOCATION", payload: pos });
    }

    return (
        <MainContext.Provider
            value={{
                vehicles: state.vehicles,
                messages: state.messages,
                myPublicAddress: state.myPublicAddress,
                location: state.location,
                addVehicle,
                addMessage,
                vehicleLogin,
                setLocation,
            }}
            {...props}
        />
    );
}

export { MainContext, MainContextProvider };
