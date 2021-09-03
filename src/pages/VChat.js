import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import { makeStyles } from "@material-ui/core/styles";
import EthCrypto from "eth-crypto";
import Button from "@material-ui/core/Button";
import useChat from "../hooks/useChat";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { MainContext } from "../context";
import Message from "../components/Message";
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
    const HandleResponse = async (idx, resp) => {
        const msgStruct = JSON.stringify({
            message: messages[idx].struct.message,
            type: resp, // 1 for yes and 0 for no
            coordinates: location,
            numberOfVehicles: users.length,
            vPublicAddress: sessionStorage.getItem("pK"),
        });
        const messageHash = EthCrypto.hash.keccak256(msgStruct);

        updateResponse(idx, resp);
        const sk = sessionStorage.getItem("sK");
        const sPK = sessionStorage.getItem("sPK");
        const signature = EthCrypto.sign(sk, messageHash);
        const encrypted = await EthCrypto.encryptWithPublicKey(sPK, msgStruct);
        const packet = { cipher: encrypted, sign: signature };
        socket.emit("sendMessage", JSON.stringify(packet), () => null);
    };

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
        let t1_id = null,
            t2_id = null;
        socket.on("message", async (msg) => {
            if (!msg) return;
            const sSK = sessionStorage.getItem("sSK");
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

            console.log("OWN", own);
            console.log("KEY", key);
            if (own.has(key)) return;
            console.log("BACTH", batch);
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
            msgStruct["status"] = 1; // 1 for mutable, 2 freezed
            msgStruct["response"] = 0; // 0 for don't know, 1 for yes and 2 for No
            const idx = addMessage(msgStruct, msg.username, msg.createdAt);
            t1_id = setTimeout(() => {
                updateStatus(idx);
                setTemp(idx);
            }, 30000);
            t2_id = setTimeout(() => {
                setTemp(idx);
                console.log(msgRef.current, idx);
                if (msgRef.current[idx].struct.response === 0) {
                    //Handle sending to RSU part
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
    }, [socket, addMessage, updateStatus, messages, batch, own]);

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

    // useEffect(() => {
    //   socket.on("locationMessage", (msg) => {
    //     if (msg) {
    //       addMessage(msg.url, "location", msg.username, msg.createdAt);
    //     }
    //   });
    //   return () => socket.off("locationMessage");
    // }, [socket, addMessage]);

    useEffect(() => {
        socket.on("locationMessage", (msg) => {
            if (msg) {
                addMessage(msg.url, "location", msg.username, msg.createdAt);
            }
        });
        return () => socket.off("locationMessage");
    }, [socket, addMessage]);

    const sendMessage = async (e) => {
        e.preventDefault();
        // TODO: Check if this message is already in existing messages on which are still avialable to respond
        const msgStruct = JSON.stringify({
            message: message,
            type: 1, // 1 for yes and 0 for no
            coordinates: location,
            numberOfVehicles: users.length,
            vPublicAddress: sessionStorage.getItem("pK"),
        });
        const messageHash = EthCrypto.hash.keccak256(msgStruct);
        const sk = sessionStorage.getItem("sK");
        const sPK = sessionStorage.getItem("sPK");
        const signature = EthCrypto.sign(sk, messageHash);
        const encrypted = await EthCrypto.encryptWithPublicKey(sPK, msgStruct);
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
                console.log(prevOwn);
                if (prevOwn.has(key)) prevOwn.delete(key);
                console.log("AFter Remove", prevOwn);
                return prevOwn;
            });
        }, 40000);
        setMessage("");
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
                                    updateResponse={HandleResponse}
                                    struct={struct}
                                    createdAt={createdAt}
                                    user={user}
                                    key={idx}
                                    idx={idx}
                                    setTemp={setTemp}
                                />
                            ))}
                    </div>

                    <div className="compose">
                        <form id="message-form" onSubmit={sendMessage}>
                            <FormControl className={classes.formControl}>
                                <InputLabel id="demo-simple-select-label">
                                    Select Message
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={message}
                                    required
                                    onChange={(e) => setMessage(e.target.value)}
                                >
                                    {rsuMessages.map((message, idx) => (
                                        <MenuItem
                                            key={idx}
                                            idx={idx}
                                            value={message}
                                        >
                                            {message}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button type="submit">Send Message</Button>
                        </form>
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
