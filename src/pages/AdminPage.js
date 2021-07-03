import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import React, { useContext, useState } from "react";
import { ethers } from "ethers";

import { rsuAddress } from "../constants";
import MessagePopup from "../components/MessagePopup";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";
import MessageList from "../components/MessageList";
import { MainContext } from "../context";

function AdminPage() {
    const [address, setAddress] = useState();
    const [message, setMessage] = useState();
    const [severity, setSeverity] = useState();
    const [popupMessage, setPopupMessage] = useState();
    const [open, setOpen] = useState(false);
    const [getInfoAddr, setGetInfoAddr] = useState();
    const [vInfo, setVInfo] = useState([]);
    const { addVehicle, addMessage } = useContext(MainContext);

    const requestAccount = async () => {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    };

    const addNewVehicle = async () => {
        if (!address) return;
        if (typeof window.ethereum === undefined) return;
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
        const transaction = await contract.addVehicle(address);
        await transaction.wait();
        addVehicle(address);
        console.log("Vehicle Added");
    };

    const addNewMessage = async () => {
        if (!message) return;
        if (typeof window.ethereum === undefined) return;
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
        const transaction = await contract.addMsg(message);
        await transaction.wait();
        addMessage(message);
        console.log("Message Added");
    };

    const getVehicleInfo = async () => {
        if (typeof window.ethereum === undefined) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(rsuAddress, RSU.abi, provider);
        try {
            const data = await contract.getVehicleInfo(getInfoAddr);
            if (data) setVInfo(data);
            console.log("Data : ", data);
        } catch (err) {
            setSeverity("error");
            setPopupMessage(err.message);
            setOpen(true);
            console.log("Error : ", err);
        }
    };

    return (
        <Container
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <MessagePopup
                open={open}
                setOpen={setOpen}
                message={popupMessage}
                severity={severity}
                loading={false}
            />
            ;
            <div style={{ margin: "50px 0" }}>
                <TextField
                    style={{ width: "60%" }}
                    label="Vehicle Address"
                    helperText="Enter Public Address.."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <Button
                    onClick={addNewVehicle}
                    variant="contained"
                    color="primary"
                >
                    Add Vehicle
                </Button>
            </div>
            <div style={{ margin: "50px 0" }}>
                <TextField
                    style={{ width: "60%" }}
                    label="New Message"
                    helperText="Enter New Message.."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                    onClick={addNewMessage}
                    variant="contained"
                    color="primary"
                >
                    Add Message
                </Button>
            </div>
            <div style={{ margin: "50px 0" }}>
                <TextField
                    style={{ width: "60%" }}
                    label="Get Vehicle Info"
                    helperText="Enter Vehicle Address.."
                    value={getInfoAddr}
                    onChange={(e) => setGetInfoAddr(e.target.value)}
                />
                <Button
                    onClick={getVehicleInfo}
                    variant="contained"
                    color="primary"
                >
                    Get Info
                </Button>
                {vInfo && vInfo.length && (
                    <div style={{ border: "1px solid gray", padding: 20 }}>
                        <p style={{ fontWeight: "bold" }}>Vehicle Info</p>
                        <p>Vehicle Address : "{vInfo[0]}"</p>
                        <p>Trust Value : {vInfo[1].toNumber()}</p>
                        <p>Is Revoked? : {vInfo[2] ? "Yes" : "No"}</p>
                    </div>
                )}
            </div>
            <div style={{ margin: "50px 0" }}>
                <MessageList rsuAddress={rsuAddress} />
            </div>
        </Container>
    );
}

export default AdminPage;
