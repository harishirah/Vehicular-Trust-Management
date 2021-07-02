import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";

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
        if (typeof window.ethereum === undefined) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(rsuAddress, RSU.abi, provider);
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
            <Button onClick={getMessage}>Get Messages</Button>
            {message && (
                <Typography>
                    Message No. {index} : {message}
                </Typography>
            )}
        </div>
    );
}

export default MessageList;
