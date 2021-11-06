import React from "react";
import EthCrypto from "eth-crypto";
import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { MainContext } from "../context";
import { RestorePageSharp } from "@material-ui/icons";

function ProtectedRoute({ component: Component, ...rest }) {
    const { myPublicAddress } = useContext(MainContext);
    const addr = EthCrypto.publicKey.toAddress(myPublicAddress);
    const rops = "0x31C853cdCCa1e74723293ba58bDD3B17DD68CDCA";
    return (
        <Route
            {...rest}
            render={(props) => {
                if (addr.toLowerCase() === rops.toLowerCase()) {
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
