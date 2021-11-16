import React, { useEffect } from "react";
import * as queryString from "query-string";
import { useHistory } from "react-router-dom";
import EthCrypto from "eth-crypto";
import { useSocket } from "../context/SocketProvider";
import useChat from "../hooks/useChat";
import "./Chat.css";
import { useContext } from "react";
import { MainContext } from "../context";
import { randomPoint } from "../utils/location";

function VHome() {
    const socket = useSocket();
    const history = useHistory();
    useEffect(() => {
        const qString = window.location.search;
        const { sk, prob, type, duration } = queryString.parse(qString);
        sessionStorage.setItem("prob", prob);
        sessionStorage.setItem("type", type);
        sessionStorage.setItem("crash", 0);
        sessionStorage.setItem(
            "time",
            Date.now() + (Number(duration) + 1) * 60 * 1000
        );
        const location = randomPoint(1000);
        const pos = location;
        pos.latitude = Math.round(pos.latitude * 1000) / 1000;
        pos.longitude = Math.round(pos.longitude * 1000) / 1000;
        // console.log(location);
        console.log(pos);
        setLocation(pos);
        joinRoom(sk, location);
    }, [socket]);

    const { addMessage } = useChat();
    const { setLocation, vehicleLogin } = useContext(MainContext);

    const joinRoom = (sk, location) => {
        if (!socket) return;
        const room =
            Math.round((location.latitude + location.longitude) * 10) + "";
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
                <h1>Please Wait....</h1>
            </div>
        </div>
    );
}

export default VHome;
