import { useState } from "react";

export default function useChat() {
	const [messages, setMessages] = useState([]);

	const addMessage = (text, type, user, createdAt) => {
		setMessages((prevMessages) =>
			setMessages([
				...prevMessages,
				{
					text,
					user,
					type,
					createdAt: createdAt !== "" ? getCurrentTime() : createdAt,
				},
			])
		);
	};

	return { messages, addMessage, getCurrentTime };
}
