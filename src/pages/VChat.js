import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import EthCrypto from "eth-crypto";
import useChat from "../hooks/useChat";
import useLocation from "../hooks/useLocation";

function VChat() {
  const { room } = useParams();
  const socket = useSocket();
  const chatRef = useRef(null);
  const { messages, addMessage } = useChat();
  const { getCurrentLocation } = useLocation();
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  //   const custom = async () => {
  //     const address = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  //     const sk =
  //       "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  //     const pk = EthCrypto.publicKeyByPrivateKey(sk);
  //     console.log("Address", address);
  //     console.log("PublicKey", pk);
  //     console.log("SecretKey", sk);
  //     const message = "Not that old  Hello World shit like every body else";
  //     const messageHash = EthCrypto.hash.keccak256(message);
  //     const signature = EthCrypto.sign(sk, messageHash);
  //     console.log("Signature", signature);
  //     const signer = EthCrypto.recoverPublicKey(signature, messageHash);
  //     console.log("Signer", signer);
  //     const encrypted = await EthCrypto.encryptWithPublicKey(pk, message);
  //     const decrypted = await EthCrypto.decryptWithPrivateKey(sk, encrypted);
  //     console.log("Encryped", encrypted);
  //     console.log("Decrypted", decrypted);
  //   };

  useEffect(() => {
    if (chatRef) {
      chatRef.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    socket.on("message", async (msg) => {
      if (!msg) return;
      const sSK = sessionStorage.getItem("sSK");
      const { cipher, sign } = JSON.parse(msg.text);
      const data = await EthCrypto.decryptWithPrivateKey(sSK, cipher);
      const messageHash = EthCrypto.hash.keccak256(data);
      const signer = EthCrypto.recoverPublicKey(sign, messageHash);
      if (signer !== msg.username) return;
      addMessage(data, "message", msg.username, msg.createdAt);
    });
    return () => socket.off("message");
  }, [socket, addMessage]);

  useEffect(() => {
    socket.on("admin", (msg) => {
      console.log("VCHAt");
      if (!msg) return;
      addMessage(msg.text, "message", msg.username);
    });
    return () => socket.off("admin");
  }, [socket, addMessage]);

  useEffect(() => {
    socket.on("locationMessage", (msg) => {
      if (msg) {
        addMessage(msg.url, "location", msg.username, msg.createdAt);
      }
    });
    return () => socket.off("locationMessage");
  }, [socket, addMessage]);

  useEffect(() => {
    socket.on("roomData", ({ users }) => setUsers(users));
    return () => socket.off("roomData");
  }, [socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const messageHash = EthCrypto.hash.keccak256(message);
    const sk = sessionStorage.getItem("sK");
    const sPK = sessionStorage.getItem("sPK");
    const signature = EthCrypto.sign(sk, messageHash);
    console.log(sPK);
    const encrypted = await EthCrypto.encryptWithPublicKey(sPK, message);
    const packet = { cipher: encrypted, sign: signature };
    socket.emit("sendMessage", JSON.stringify(packet), () => null);
    setMessage("");
  };

  const sendLocation = () => {
    let pos = getCurrentLocation();
    if (pos && pos.latitude && pos.longitude)
      socket.emit("sendLocation", pos, () => {});
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
                    <li style={{ color: "aquamarine" }} key={idx}>
                      {username}
                    </li>
                  );
                return <li key={idx}></li>;
              })}
          </ul>
        </div>
        <div className="chat__main">
          <h1 style={{ margin: 20 }}>V2V Chat</h1>
          <div id="messages" className="chat__messages" ref={chatRef}>
            {messages &&
              messages.length > 0 &&
              messages.map(({ text, type, createdAt, user }, idx) => (
                <div className="message" key={idx}>
                  <p>
                    <span className="message__name">{user}</span>
                    <span className="message__meta"> {createdAt}</span>
                  </p>
                  {type === "message" ? (
                    <p>{text}</p>
                  ) : (
                    <p>
                      <a href={text} target="_blank" rel="noreferrer">
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
