import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import { makeStyles } from "@material-ui/core/styles";
import EthCrypto from "eth-crypto";
import { ethers } from "ethers";
import useChat from "../hooks/useChat";
import { MainContext } from "../context";
import Message from "../components/Message";
import { evaluateRatings } from "../utils/evaluateRatings";
import RSU from "../RSU.json";

const { abi } = RSU;
const provider = new ethers.providers.InfuraProvider(
    process.env.REACT_APP_ETHEREUM_NETWORK,
    process.env.REACT_APP_PROJECT_ID
);

// import useLocation from "../hooks/useLocation";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "auto",
    },
    paper: {
        width: 300,
        height: 230,
        overflow: "auto",
    },
    button: {
        // margin: theme.spacing(0, 0),
        padding: 0,
    },
    formControl: {
        margin: theme.spacing(2),
        minWidth: "80%",
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
        padding: 10,
    },
}));

function VChat() {
    const { room } = useParams();
    const socket = useSocket();
    const classes = useStyles();
    const chatRef = useRef(null);
    const { messages, addMessage, updateStatus, updateResponse } = useChat();
    const { messages: rsuMessages, location } = useContext(MainContext);
    // const { getCurrentLocation } = useLocation();
    const [temp, setTemp] = useState("");
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [batch, setBatch] = useState({});
    const [own, setOwn] = useState(new Set());

    const msgRef = useRef(messages);
    msgRef.current = messages;

    useEffect(() => {
        const sendMessage = async () => {
            if (Number(sessionStorage.getItem("time")) < Date.now()) {
                const Trust = await fetchTrustValue();
                socket.emit(
                    "summary",
                    JSON.stringify({
                        trust: Trust,
                        prob: sessionStorage.getItem("prob"),
                    }),
                    () => null
                );
                window.close();
            }
            const idx = Math.floor(Math.random() * rsuMessages.length);
            console.log(rsuMessages[idx]);
            await fetchTrustValue();
            const msgStruct = JSON.stringify({
                message: rsuMessages[idx],
                type: Number(sessionStorage.getItem("prob")) > 0.5 ? 1 : 0, // 1 for yes and 0 for no
                coordinates: location,
                numberOfVehicles: users.length,
                vPublicAddress: sessionStorage.getItem("pK"),
            });
            const messageHash = EthCrypto.hash.keccak256(msgStruct);
            const sk = sessionStorage.getItem("sK");
            const sPK = sessionStorage.getItem("sPK");
            const signature = EthCrypto.sign(sk, messageHash);
            const encrypted = await EthCrypto.encryptWithPublicKey(
                sPK,
                msgStruct
            );
            const packet = { cipher: encrypted, sign: signature };
            socket.emit("sendMessage", JSON.stringify(packet), () => null);
            const key = JSON.stringify({
                location: location,
                message: message,
            });
            addMessage(
                JSON.parse(msgStruct),
                sessionStorage.getItem("pK"),
                getCurrentTime()
            );
            setOwn((prevOwn) => {
                prevOwn.add(key);
                return prevOwn;
            });
            setTimeout(() => {
                setOwn((prevOwn) => {
                    // console.log(prevOwn);
                    if (prevOwn.has(key)) prevOwn.delete(key);
                    // console.log("AFter Remove", prevOwn);
                    return prevOwn;
                });
            }, 40000);
            setMessage("");
        };
        let timer = setInterval(sendMessage, 60000);
        return () => clearInterval(timer); // cleanup the timer
    }, []);

    const fetchTrustValue = async () => {
        const signer = new ethers.Wallet(
            sessionStorage.getItem("sK"),
            provider
        );
        const contract = new ethers.Contract(
            process.env.REACT_APP_RSU,
            abi,
            signer
        );
        const trustAddr = EthCrypto.publicKey.toAddress(
            sessionStorage.getItem("pK")
        );
        try {
            const data = await contract.getTrustValue(trustAddr);
            console.log("Trust Value", data.toNumber());
            return data.toNumber();
        } catch (err) {
            console.log(err);
            socket.emit(
                "summary",
                JSON.stringify({
                    trust: 0,
                    prob: sessionStorage.getItem("prob"),
                }),
                () => null
            );
            window.close();
        }
    };
    useEffect(() => {
        let t1_id = null;
        socket.on("message", async (msg) => {
            if (!msg) return;
            await fetchTrustValue();
            const sSK = sessionStorage.getItem("sSK");
            const sk = sessionStorage.getItem("sK");
            const sPK = sessionStorage.getItem("sPK");
            const { cipher, sign } = JSON.parse(msg.text);
            const data = await EthCrypto.decryptWithPrivateKey(sSK, cipher);
            const messageHash = EthCrypto.hash.keccak256(data);
            const signer = EthCrypto.recoverPublicKey(sign, messageHash);
            if (signer !== msg.username) return;
            const msgStruct = JSON.parse(data);

            const key = JSON.stringify({
                location: msgStruct.coordinates,
                message: msgStruct.message,
            });

            // console.log("OWN", own);
            // console.log("KEY", key);
            if (own.has(key)) return;
            // console.log("BACTH", batch);
            if (batch.hasOwnProperty(key)) {
                setBatch((prevBatch) => {
                    prevBatch[key][msgStruct.vPublicAddress] = msgStruct.type;
                    return prevBatch;
                });
                return;
            }
            setBatch((prevBatch) => {
                var init = {};
                init[msgStruct.vPublicAddress] = msgStruct.type;
                prevBatch[key] = init;
                return prevBatch;
            });
            msgStruct["status"] = 2; // 1 for mutable, 2 freezed
            if (Math.random() >= 0.6) msgStruct["response"] = 0;
            // 0 for don't know, 1 for yes and 2 for No
            else if (Math.random() >= Number(sessionStorage.getItem("prob")))
                msgStruct["response"] = 2;
            else msgStruct["response"] = 1;
            if (msgStruct["response"]) {
                const Hsh = EthCrypto.hash.keccak256(JSON.stringify(msgStruct));
                const signe = EthCrypto.sign(sk, Hsh);
                const encryp = await EthCrypto.encryptWithPublicKey(
                    sPK,
                    JSON.stringify(msgStruct)
                );
                const packet = { cipher: encryp, sign: signe };
                socket.emit("sendMessage", JSON.stringify(packet), () => null);
                return;
            }
            const idx = addMessage(msgStruct, msg.username, msg.createdAt);
            t1_id = setTimeout(async () => {
                setTemp(idx);
                // console.log(msgRef.current, idx);
                if (msgRef.current[idx].struct.response === 0) {
                    //Handle sending to RSU part
                    await evaluateRatings(batch, key);
                    console.log("sent to RSU");
                }
                if (batch.hasOwnProperty(key)) {
                    setBatch((prevBatch) => {
                        delete prevBatch[key];
                        return prevBatch;
                    });
                }
            }, 31000);
        });
        return () => {
            socket.off("message");
            // clearTimeout(t1_id);
            // clearTimeout(t2_id);
        };
    }, [socket, addMessage, messages, batch, own]);

    useEffect(() => {
        socket.on("roomData", ({ users }) => setUsers(users));
        return () => socket.off("roomData");
    }, [socket]);

    useEffect(() => {
        socket.on("admin", (msg) => {
            if (!msg) return;
            var struct = { message: msg.text, status: 0 };
            addMessage(struct, msg.username, msg.createdAt);
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
                                        <li
                                            style={{ color: "aquamarine" }}
                                            key={idx}
                                        >
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
                                <Message
                                    struct={struct}
                                    createdAt={createdAt}
                                    user={user}
                                    key={idx}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default VChat;

const getCurrentTime = () => {
    var time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    return time;
};
