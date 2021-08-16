import { useState } from "react";

export default function useChat() {
	const [messages, setMessages] = useState([]);
	const addMessage = (text, type, user, createdAt) => {
		const message = {
			text,
			user,
			type,
			createdAt,
		};
		if (messages.lastItem === message) return;
		setMessages((prevMessages) => [...prevMessages, message]);
	};

	return { messages, addMessage };
}
