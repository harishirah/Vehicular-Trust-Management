import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { ethers } from "ethers";
import "../App.css";

import RSU from "../artifacts/contracts/RSU.sol/RSU.json";
import RsuPage from "./RsuPage";
import VehiclesPage from "./VehiclesPage";
import AdminPage from "./AdminPage";

const rsuAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

function LinkTab(props) {
  return (
    <Tab
      component="a"
      onClick={(event) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

function MainPage() {
  const [adminName, setAdminName] = useState();
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const fetchAdminName = async () => {
    if (typeof window.ethereum === undefined) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(rsuAddress, RSU.abi, provider);
    try {
      const data = await contract.getAdmin();
      if (data) setAdminName(data);
      console.log("Data : ", data);
    } catch (err) {
      console.log("Error : ", err);
    }
  };

  const setAdmin = async () => {
    if (!adminName) return;
    if (typeof window.ethereum === undefined) return;
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
    const transaction = await contract.setAdminName(adminName);
    await transaction.wait();
    fetchAdminName();
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
        >
          <LinkTab label="RSU" href="/drafts" {...a11yProps(0)} />
          <LinkTab label="Vehicle" href="/trash" {...a11yProps(1)} />
          <LinkTab
            label="Transport Administrator"
            href="/spam"
            {...a11yProps(2)}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <RsuPage />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <VehiclesPage />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AdminPage />
      </TabPanel>
    </div>
  );
}

export default MainPage;
