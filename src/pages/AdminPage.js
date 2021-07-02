import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import React, { useState } from "react";
import { ethers } from "ethers";

import { rsuAddress } from "../constants";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";
import MessageList from "../components/MessageList";

function AdminPage() {
    const [address, setAddress] = useState();
    const [message, setMessage] = useState();

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
        console.log("Vehicle Added");
    };

    const addMessage = async () => {
        if (!message) return;
        if (typeof window.ethereum === undefined) return;
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
        const transaction = await contract.addMsg(message);
        await transaction.wait();
        console.log("Message Added");
    };

    return (
        <Container
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div>
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
            <div>
                <TextField
                    style={{ width: "60%" }}
                    label="New Message"
                    helperText="Enter New Message.."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                    onClick={addMessage}
                    variant="contained"
                    color="primary"
                >
                    Add Message
                </Button>
            </div>
            <MessageList rsuAddress={rsuAddress} />
        </Container>
    );
}

export default AdminPage;
