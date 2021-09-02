import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import EthCrypto from "eth-crypto";
import useChat from "../hooks/useChat";
import { MainContext } from "../context";

function VChat() {
  const { room } = useParams();
  const socket = useSocket();
  const chatRef = useRef(null);
  const { messages, addMessage, updateStatus } = useChat();
  const { location } = useContext(MainContext);
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
      const msgStruct = JSON.parse(data);
      msgStruct["status"] = 1; // 1 for mutable, 2 freezed
      msgStruct["response"] = 0; // 0 for don't know, 1 for yes and 2 for No
      const idx = addMessage(msgStruct, msg.username, msg.createdAt);
      setTimeout(() => {
        updateStatus(idx);
      }, 15000);
    });
    return () => socket.off("message");
  }, [socket, addMessage, updateStatus, messages]);

  useEffect(() => {
    socket.on("admin", (msg) => {
      console.log("VCHAt");
      if (!msg) return;
      var struct = { message: msg.text, status: 0 };
      addMessage(struct, msg.username);
    });
    return () => socket.off("admin");
  }, [socket, addMessage]);

  // useEffect(() => {
  //   socket.on("locationMessage", (msg) => {
  //     if (msg) {
  //       addMessage(msg.url, "location", msg.username, msg.createdAt);
  //     }
  //   });
  //   return () => socket.off("locationMessage");
  // }, [socket, addMessage]);

  useEffect(() => {
    socket.on("roomData", ({ users }) => setUsers(users));
    return () => socket.off("roomData");
  }, [socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const msgStruct = JSON.stringify({
      message: message,
      coordinates: location,
      numberOfVehicles: users.length,
      vPublicAddress: sessionStorage.getItem("pK"),
    });
    const messageHash = EthCrypto.hash.keccak256(msgStruct);
    const sk = sessionStorage.getItem("sK");
    const sPK = sessionStorage.getItem("sPK");
    const signature = EthCrypto.sign(sk, messageHash);
    console.log(sPK);
    const encrypted = await EthCrypto.encryptWithPublicKey(sPK, msgStruct);
    const packet = { cipher: encrypted, sign: signature };
    socket.emit("sendMessage", JSON.stringify(packet), () => null);
    setMessage("");
  };

  // const sendLocation = () => {
  //   let pos = getCurrentLocation();
  //   if (pos && pos.latitude && pos.longitude)
  //     socket.emit("sendLocation", pos, () => {});
  // };

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
                      {username.substr(0, 15) + "..."}
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
              messages.map(({ struct, createdAt, user }, idx) => (
                <div className="message" key={idx}>
                  <p>
                    <span className="message__name">
                      {user.substr(0, 15) + "..."}
                    </span>
                    <span className="message__meta"> {createdAt}</span>
                  </p>
                  <p>{struct.message}</p>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default VChat;
