import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { ethers } from "ethers";
import Paper from "@material-ui/core/Paper";
import { useContext } from "react";
import { MainContext } from "../context";
import { rsuAddress } from "../constants";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";

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
        margin: theme.spacing(0.5, 0),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export default function SelectRatings() {
    const classes = useStyles();
    const { vehicles, messages } = useContext(MainContext);
    const [checked, setChecked] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const [left, setLeft] = React.useState(vehicles);
    const [right, setRight] = React.useState([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const requestAccount = async () => {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    };

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const sendRatings = async () => {
        if (!message) return;
        let arr = [];
        left.forEach((item) => {
            let curr = { vId: item, rating: 1 };
            arr.push(curr);
        });
        right.forEach((item) => {
            let curr = { vId: item, rating: -1 };
            arr.push(curr);
        });
        if (arr.length <= 0) return;
        if (typeof window.ethereum === undefined) return;
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
        const transaction = await contract.sendRatings(arr, message);
        await transaction.wait();
        console.log(arr);
        console.log(transaction);
        console.log("Trust Values Updated");
    };

    const customList = (items) => (
        <Paper className={classes.paper}>
            <List dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-item-${value}-label`;

                    return (
                        <ListItem
                            key={value}
                            role="listitem"
                            button
                            onClick={handleToggle(value)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ "aria-labelledby": labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                primary={`Vehicle ${value + 1}`}
                            />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Paper>
    );

    return (
        <Grid
            container
            spacing={2}
            justify="center"
            alignItems="center"
            className={classes.root}
        >
            <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">Message</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                >
                    {messages.map((message, idx) => (
                        <MenuItem key={idx} value={message}>
                            {message}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Grid item center alignItems="center">
                <h3 style={{ textAlign: "center" }}>Rate +1</h3>
                {customList(left)}
            </Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleAllRight}
                        disabled={left.length === 0}
                        aria-label="move all right"
                    >
                        ≫
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleAllLeft}
                        disabled={right.length === 0}
                        aria-label="move all left"
                    >
                        ≪
                    </Button>
                </Grid>
            </Grid>
            <Grid item>
                <h3 style={{ textAlign: "center" }}>Rate -1</h3>
                {customList(right)}
            </Grid>
            <div style={{ marginLeft: 30 }} onClick={sendRatings}>
                <Button variant="contained">Send Ratings</Button>
            </div>
        </Grid>
    );
}
