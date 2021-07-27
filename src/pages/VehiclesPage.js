import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { rsuAddress } from "../constants";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";
import SelectRatings from "../components/SelectRatings";

function VehiclesPage() {
  const [trustValue, setTrustValue] = useState();
  const [trustAddr, setTrustAddr] = useState();

  useEffect(() => {
    if (typeof window.ethereum === undefined) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(rsuAddress, RSU.abi, provider);
    contract.on("broadcast", (from, location, message) =>
      console.log(from, location, message)
    );
  }, []);

  const fetchTrustValue = async () => {
    if (typeof window.ethereum === undefined) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(rsuAddress, RSU.abi, provider);
    try {
      const data = await contract.getTrustValue(trustAddr);
      console.log(data.toNumber());
      setTrustValue(data.toNumber());
    } catch (err) {
      console.log(err);
    }
  };

  const emitMsg = async () => {
    if (typeof window.ethereum === undefined) return;
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
    try {
      console.log("Started");
      const data = await contract.broadCast("safe", "JodhPur");
      console.log(data);
      console.log("done");
    } catch (err) {
      console.log(err);
    }
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
          label="Enter Vehicle Address"
          helperText="Enter Public Address.."
          value={trustAddr}
          onChange={(e) => setTrustAddr(e.target.value)}
        />
        <Button onClick={fetchTrustValue} variant="contained" color="primary">
          Get Trust Value
        </Button>
        <Button onClick={emitMsg} variant="contained" color="primary">
          Send Msg
        </Button>
        {trustValue && <div>{trustValue}</div>}
      </div>
      <SelectRatings />
    </Container>
  );
}

export default VehiclesPage;
