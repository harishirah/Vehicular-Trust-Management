import React from "react";
import { useParams } from "react-router";
import { useState } from "react";

function VChat() {
	const { username, room } = useParams();
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState("hakjfds");
	const [createdAt, setCreatedAt] = useState("23/12/10");

	const setCurrentTime = () => {
		var time = new Date().toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
		setCreatedAt(time);
	};

	const sendMessage = (e) => {
		e.preventDefault();
		setCurrentTime();
		setMessages((prevMessages) => [
			...prevMessages,
			{ message: message, type: "message" },
		]);
		setMessage("");
	};

	const sendLocation = () => {
		setCurrentTime();
		setMessages((prevMessages) => [
			...prevMessages,
			{ message: "https://www.google.com/", type: "location" },
		]);
	};

	return (
		<>
			<div className="chat">
				<div className="chat__sidebar" id="sidebar">
					<h2 className="room-title">{room}</h2>
					<h3 className="list-title">Users</h3>
					<ul className="users">
						<li>{username}</li>
					</ul>
				</div>
				<div className="chat__main">
					<h1 style={{ margin: 20 }}>V2V Chat</h1>
					<div id="messages" className="chat__messages">
						{messages.map(({ message, type }) => (
							<div className="message">
								<p>
									<span className="message__name">
										{username}
									</span>
									<span className="message__meta">
										{" "}
										{createdAt}
									</span>
								</p>
								{type == "message" ? (
									<p>{message}</p>
								) : (
									<p>
										<a href={message} target="_blank">
											My Current Location
										</a>
									</p>
								)}
							</div>
						))}
					</div>

					<div className="compose">
						<form id="message-form" onSubmit={sendMessage}>
							<input
								name="message"
								value={message}
								placeholder="Type here"
								onChange={(e) => setMessage(e.target.value)}
								required
								autocomplete="off"
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
