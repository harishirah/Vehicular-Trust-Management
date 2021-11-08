import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import React, { useContext, useState } from "react";
import EthCrypto from "eth-crypto";
import { ethers } from "ethers";

import MessagePopup from "../components/MessagePopup";
import credentials from "../credentials";
import { MainContext } from "../context";
import RSU from "../RSU.json";

const { abi } = RSU;

function AdminPage() {
    const [address, setAddress] = useState();
    const [message, setMessage] = useState();
    const [severity, setSeverity] = useState();
    const [popupMessage, setPopupMessage] = useState();
    const [officialProb, setOfficialProb] = useState(0.0);
    const [open, setOpen] = useState(false);
    const [prob, setProb] = useState(0.0);
    const [trustValue, setTrustValue] = useState();
    const [trustAddr, setTrustAddr] = useState();
    const { addVehicle, addMessage } = useContext(MainContext);

    const provider = new ethers.providers.InfuraProvider(
        process.env.REACT_APP_ETHEREUM_NETWORK,
        process.env.REACT_APP_PROJECT_ID
    );

    // Creating a signing account from a private key
    const signer = new ethers.Wallet(
        process.env.REACT_APP_TRANSPORT_ADMIN,
        provider
    );
    // Creating a Contract instance connected to the signer
    const contract = new ethers.Contract(
        // Replace this with the address of your deployed contract
        process.env.REACT_APP_RSU,
        abi,
        signer
    );

    const fetchTrustValue = async () => {
        console.log("Provider:", provider);
        console.log("Contract:", contract);
        try {
            const data = await contract.getTrustValue(trustAddr);
            setTrustValue(data.toNumber());
        } catch (err) {
            console.log(err);
        }
    };

    const addNewVehicle = async () => {
        if (!address) return;
        const transaction = await contract.addVehicle(address);
        await transaction.wait();
        const vId = await contract.getVehicleId(address);
        addVehicle({ vId: vId.toNumber(), address });
        console.log("Vehicle Added");
    };

    const addNewMessage = async () => {
        if (!message) return;
        const transaction = await contract.addMsg(message);
        await transaction.wait();
        addMessage(message);
        console.log("Message Added");
    };

    const encodeQuery = (data) => {
        let query = "";
        for (let d in data)
            query +=
                encodeURIComponent(d) + "=" + encodeURIComponent(data[d]) + "&";
        return query.slice(0, -1);
    };

    const openTabs = async (e) => {
        for (let key of credentials) {
            // const pk = EthCrypto.publicKeyByPrivateKey(key);
            // const addr = EthCrypto.publicKey.toAddress(pk);
            // await contract.addVehicle(addr);
            var yesProb;
            if (Math.random() >= prob) {
                yesProb = 0.6 + Math.random() * 0.4;
            } else {
                yesProb = 0.4 - Math.random() * 0.4;
            }
            const data = {
                sk: key,
                prob: yesProb,
                type: Math.random() < officialProb,
                duration: 10, // simulation duration iN minutes
            };
            window.open(`http://localhost:3000/vehicle?${encodeQuery(data)}`);
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
                <p>Probability of Malicious Vehicle</p>
                <input
                    type="number"
                    title="Probability of Malicious Vehicle"
                    id="rate"
                    value={prob}
                    min="0.00"
                    step="0.01"
                    max="1.00"
                    presicion={2} //very important
                    onChange={(e) => setProb(e.target.value)}
                />
            </div>
            <div style={{ margin: "50px 0" }}>
                <p>Probability of Official Vehicle</p>
                <input
                    type="number"
                    title="Probability of Official Vehicle"
                    id="rate"
                    value={officialProb}
                    min="0.00"
                    step="0.01"
                    max="1.00"
                    presicion={2} //very important
                    onChange={(e) => setOfficialProb(e.target.value)}
                />
            </div>
            <div style={{ margin: "50px 0" }}>
                <TextField
                    style={{ width: "60%" }}
                    label="Enter Vehicle Address"
                    helperText="Enter Public Address.."
                    value={trustAddr}
                    onChange={(e) => setTrustAddr(e.target.value)}
                />
                <Button
                    onClick={fetchTrustValue}
                    variant="contained"
                    color="primary"
                >
                    Get Trust Value
                </Button>
                {trustValue && <div>{trustValue}</div>}
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
                <Button onClick={openTabs} variant="contained" color="primary">
                    Open Vehicle Tab
                </Button>
            </div>
            {/* <div style={{ margin: "50px 0" }}>
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
			</div> */}
        </Container>
    );
}

export default AdminPage;
