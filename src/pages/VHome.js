import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import EthCrypto from "eth-crypto";
import { useSocket } from "../context/SocketProvider";
import useChat from "../hooks/useChat";
import useLocation from "../hooks/useLocation";
import "./Chat.css";
import { useContext } from "react";
import { MainContext } from "../context";

function VHome() {
    const [sk, setSK] = useState("");
    const { addMessage } = useChat();
    const { getCurrentLocation } = useLocation();
    const { location, setLocation, vehicleLogin } = useContext(MainContext);
    const socket = useSocket();
    const history = useHistory();

    const updateLocation = () => {
        const pos = getCurrentLocation();
        if (pos && pos.latitude && pos.longitude) {
            pos.latitude = Math.round(pos.latitude * 100) / 100;
            pos.longitude = Math.round(pos.longitude * 100) / 100;
            setLocation(pos);
        }
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!location) return updateLocation();
        const room = Math.round(location.latitude + location.longitude) + "";
        socket.on("session_key", async ({ keys }) => {
            var decrypted = await EthCrypto.decryptWithPrivateKey(sk, keys);
            const { pK, sK } = JSON.parse(decrypted);
            sessionStorage.setItem("sPK", pK);
            sessionStorage.setItem("sSK", sK);
        });
        if (sk !== "" && room !== "") {
            const pk = EthCrypto.publicKeyByPrivateKey(sk);
            vehicleLogin(pk);
            sessionStorage.setItem("sK", sk);
            sessionStorage.setItem("pK", pk);
            socket.emit("join", { username: pk, room }, (error) => {
                if (error) {
                    alert("Provide a valid Private Key", error);
                    history.push("/");
                }
                socket.on("admin", (msg) => {
                    console.log("VHOME");
                    var struct = { message: msg.text, status: 0 };
                    addMessage(struct, msg.username, msg.createdAt);
                });
            });
            history.push(`/chat/${room}/${pk}`);
        }
    };

    return (
        <div className="centered-form">
            <div className="centered-form__box">
                <h1>Join</h1>
                <form onSubmit={joinRoom}>
                    <label>Enter Private Key</label>
                    <input
                        type="text"
                        value={sk}
                        onChange={(e) => setSK(e.target.value)}
                        name="sk"
                        placeholder="Don't worry this key will not escape your device"
                        required
                    />
                    <button type="submit">Join</button>
                </form>
            </div>
        </div>
    );
}

export default VHome;
