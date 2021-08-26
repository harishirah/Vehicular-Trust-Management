import React from "react";
import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { MainContext } from "../context";

function ProtectedRoute({ component: Component, ...rest }) {
	const { myPublicAddress } = useContext(MainContext);
	return (
		<Route
			{...rest}
			render={(props) => {
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
