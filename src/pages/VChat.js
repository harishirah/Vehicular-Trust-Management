import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import useChat from "../hooks/useChat";

function VChat() {
	const { username, room } = useParams();
	const socket = useSocket();
	const { messages, addMessage } = useChat();
	const [message, setMessage] = useState("");
	const [users, setUsers] = useState([]);

	useEffect(() => {
		socket.on("message", (msg) => {
			if (msg)
				addMessage(msg.text, "message", msg.username, msg.createdAt);
			console.log(msg);
		});
	}, [socket, addMessage]);
	useEffect(() => {
		socket.on("roomData", ({ users }) => setUsers(users));
	}, [socket]);
	const sendMessage = (e) => {
		e.preventDefault();
		socket.emit("sendMessage", message, () => null);
		setMessage("");
	};

	const sendLocation = () => {
		addMessage(message, "location", username);
	};

	return (
		<>
			<div className="chat">
				<div className="chat__sidebar" id="sidebar">
					<h2 className="room-title">{room}</h2>
					<h3 className="list-title">Users</h3>
					<ul className="users">
						{users &&
							users.length > 0 &&
							users.map(({ username, id, room: r }, idx) => {
								if (room === r)
									return (
										<li
											style={{ color: "aquamarine" }}
											key={idx}
										>
											{username}
										</li>
									);
								return <li key={idx}></li>;
							})}
					</ul>
				</div>
				<div className="chat__main">
					<h1 style={{ margin: 20 }}>V2V Chat</h1>
					<div id="messages" className="chat__messages">
						{messages &&
							messages.length > 0 &&
							messages.map(
								({ text, type, createdAt, user }, idx) => (
									<div className="message" key={idx}>
										<p>
											<span className="message__name">
												{user}
											</span>
											<span className="message__meta">
												{" "}
												{createdAt}
											</span>
										</p>
										{type === "message" ? (
											<p>{text}</p>
										) : (
											<p>
												<a
													href={text}
													target="_blank"
													rel="noreferrer"
												>
													My Current Location
												</a>
											</p>
										)}
									</div>
								)
							)}
					</div>

					<div className="compose">
						<form id="message-form" onSubmit={sendMessage}>
							<input
								name="message"
								value={message}
								placeholder="Type here"
								onChange={(e) => setMessage(e.target.value)}
								required
								autoComplete="off"
							/>
							<button type="submit">Send</button>
						</form>

						<button id="send-location" onClick={sendLocation}>
							Send Location
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default VChat;
