import React, { useReducer, createContext } from "react";

const initialState = {
    vehicles: [],
    messages: [
        "traffic jam",
        "accident",
        "construction work",
        "road damaged",
        "safe",
        "red light",
    ],
};

const MainContext = createContext(initialState);

const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_VEHICLE":
            return {
                ...state,
                vehicles: [
                    ...state.vehicles.filter(
                        (vehicle) => vehicle !== action.payload
                    ),
                    action.payload,
                ],
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

    return (
        <MainContext.Provider
            value={{
                vehicles: state.vehicles,
                messages: state.messages,
                addVehicle,
                addMessage,
            }}
            {...props}
        />
    );
}

export { MainContext, MainContextProvider };
