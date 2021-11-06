import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import RSU from "../RSU.json";
const fs = require("fs");

const { abi } = JSON.parse(fs.readFileSync("../RSU.json"));
const provider = new ethers.providers.InfuraProvider(
    process.env.REACT_APP_ETHEREUM_NETWORK,
    process.env.REACT_APP_PROJECT_ID
);

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        margin: theme.spacing(4, 0, 2),
    },
}));

function MessageList({ rsuAddress }) {
    const [message, setMessage] = useState();
    const [index, setIndex] = useState();
    const classes = useStyles();

    const getMessage = async () => {
        if (!index) return;
        const signer = new ethers.Wallet(
            sessionStorage.getItem("sK"),
            provider
        );
        // Creating a Contract instance connected to the signer
        const contract = new ethers.Contract(
            // Replace this with the address of your deployed contract
            process.env.REACT_APP_RSU,
            abi,
            signer
        );
        try {
            const numberOfMessages = (
                await contract.numberOfMessages()
            ).toNumber();
            if (index <= 0 || index > numberOfMessages) {
                console.log("Inappropriate Index");
            }
            let data = await contract.msgs(index);
            if (data) setMessage(data);
        } catch (err) {
            console.log("Error : ", err);
        }
    };
    return (
        <div className={classes.root}>
            <TextField
                style={{ width: "60%" }}
                label="Enter Message Index"
                helperText="Enter 1 or 2 or 3 etc."
                value={index}
                onChange={(e) => setIndex(e.target.value)}
            />
            <Button onClick={getMessage} variant="contained">
                Get Messages
            </Button>
            {message && (
                <Typography>
                    Message No. {index} : {message}
                </Typography>
            )}
        </div>
    );
}

export default MessageList;
