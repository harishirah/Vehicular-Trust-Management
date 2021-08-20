const EthCrypto = require("eth-crypto");

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

const sendKeys = async (msg, key) => {
  const encrypted = await EthCrypto.encryptWithPublicKey(key, msg);
  console.log("Running");
  return {
    keys: encrypted,
    createdAt: getCurrentTime(),
  };
};

module.exports = {
  generateMessages,
  generateLocationMessage,
  sendKeys,
};
