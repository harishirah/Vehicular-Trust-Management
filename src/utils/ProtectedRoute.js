import React from "react";
import EthCrypto from "eth-crypto";
import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { MainContext } from "../context";

function ProtectedRoute({ component: Component, ...rest }) {
    const { myPublicAddress } = useContext(MainContext);
    const addr = EthCrypto.publicKey.toAddress(myPublicAddress);
    return (
        <Route
            {...rest}
            render={(props) => {
                if (
                    addr.toLowerCase() ===
                    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
                ) {
                    return <Redirect to="/main" />;
                }
                return !myPublicAddress ? (
                    <Redirect to="/" />
                ) : (
                    <Component {...props} />
                );
            }}
        />
    );
}

export default ProtectedRoute;
