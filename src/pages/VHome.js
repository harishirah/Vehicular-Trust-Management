import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Chat.css";

function VHome() {
	const [username, setUsername] = useState();
	const [room, setRoom] = useState();
	const history = useHistory();
	return (
		<div className="centered-form">
			<div className="centered-form__box">
				<h1>Join</h1>
				<form
					onSubmit={() => history.push(`/chat/${room}/${username}`)}
				>
					<label>Display Name</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						name="username"
						placeholder="display name"
						required
					/>
					<label>Room</label>
					<input
						type="text"
						name="room"
						value={room}
						onChange={(e) => setRoom(e.target.value)}
						placeholder="Room"
						required
					/>
					<button type="submit">Join</button>
				</form>
			</div>
		</div>
	);
}

export default VHome;
