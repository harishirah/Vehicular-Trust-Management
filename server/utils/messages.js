const getCurrentTime = () => {
	var time = new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	return time;
};

const generateMessages = (username, text) => {
	return {
		username,
		text,
		createdAt: getCurrentTime(),
	};
};

const generateLocationMessage = (username, url) => {
	return {
		username,
		url,
		createdAt: getCurrentTime(),
	};
};

module.exports = {
	generateMessages,
	generateLocationMessage,
};
