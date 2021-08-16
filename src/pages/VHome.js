import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import useChat from "../hooks/useChat";
import "./Chat.css";

function VHome() {
	const [username, setUsername] = useState("");
	const [room, setRoom] = useState("");
	const { addMessage } = useChat();
	const socket = useSocket();
	const history = useHistory();
	const joinRoom = (e) => {
		e.preventDefault();
		if (username !== "" && room !== "") {
			socket.emit("join", { username, room }, (error) => {
				if (error) {
					alert("Username and Room are required!!", error);
					history.push("/v2v");
				}
				socket.on("message", (msg) => {
					addMessage(msg.text, "message", msg.username);
				});
			});
			history.push(`/chat/${room}/${username}`);
		}
	};

	return (
		<div className="centered-form">
			<div className="centered-form__box">
				<h1>Join</h1>
				<form onSubmit={joinRoom}>
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
