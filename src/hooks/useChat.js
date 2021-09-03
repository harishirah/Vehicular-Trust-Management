import { useState } from "react";

export default function useChat() {
	const [messages, setMessages] = useState([]);
	const addMessage = (msgStruct, user, createdAt) => {
		const message = {
			struct: msgStruct,
			user,
			createdAt,
		};
		if (messages.lastItem === message) return messages.length - 1;
		const length = messages.length;
		setMessages((prevMessages) => [...prevMessages, message]);
		return length;
	};

	const updateStatus = (idx) => {
		setMessages((prevMessages) => {
			prevMessages[idx].struct.status = 0;
			return prevMessages;
		});
	};

	const updateResponse = (idx, resp) => {
		console.log(messages);
		console.log(idx, resp);
		setMessages((prevMessages) => {
			prevMessages[idx].struct.response = resp;
			return prevMessages;
		});
	};

	return { messages, addMessage, updateStatus, updateResponse };
}
