import React from "react";
import EthCrypto from "eth-crypto";
import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { MainContext } from "../context";

function ProtectedRoute({ component: Component, ...rest }) {
	const { myPublicAddress } = useContext(MainContext);
	const addr = EthCrypto.publicKey.toAddress(myPublicAddress);
	const givenAddress = "0xC9c98CCc7B408271d65c70A1b72A4D5317393918";
	return (
		<Route
			{...rest}
			render={(props) => {
				if (addr.toLowerCase() === givenAddress.toLowerCase()) {
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
