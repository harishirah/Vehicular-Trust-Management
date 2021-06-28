import React, { useState } from "react";
import "../App.css";
import { ethers } from "ethers";
import Greeter from "../artifacts/contracts/Greeter.sol/Greeter.json";

const greeterAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

function TestPage() {
  const [greeting, setGreetingValue] = useState();

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const fetchGreeting = async () => {
    if (typeof window.ethereum === undefined) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
    try {
      const data = await contract.greet();
      if (data) setGreetingValue(data);
      console.log("Data : ", data);
    } catch (err) {
      console.log("Error : ", err);
    }
  };

  const setGreeting = async () => {
    if (!greeting) return;
    if (typeof window.ethereum === undefined) return;
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
    const transaction = await contract.setGreeting(greeting);
    await transaction.wait();
    fetchGreeting();
  };

  return (
    <div className="App">
      <div>
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        {greeting && <h4>{greeting}</h4>}
      </div>
      <div>
        <button onClick={setGreeting}>Set Greeting</button>
        <input
          onChange={(e) => setGreetingValue(e.target.value)}
          placeholder="Set Greeting"
        />
      </div>
    </div>
  );
}

export default TestPage;
