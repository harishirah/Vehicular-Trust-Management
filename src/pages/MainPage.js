import React, { useState } from "react";
import { ethers } from "ethers";
import "../App.css";

import RSU from "../artifacts/contracts/RSU.sol/RSU.json";

const rsuAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

function MainPage() {
  const [adminName, setAdminName] = useState();

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
    <div className="App">
      <div>
        <button onClick={fetchAdminName}>Get Admin Name</button>
        {adminName && <h4>{adminName}</h4>}
      </div>
      <div>
        <input
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="Enter new Admin name here..."
        />
        <button onClick={setAdmin}>Set Admin Name</button>
      </div>
    </div>
  );
}

export default MainPage;
