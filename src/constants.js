const { ethers } = require("ethers");
const fs = require("fs");

const { abi } = JSON.parse(fs.readFileSync("RSU.json"));
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
export const contract = new ethers.Contract(
    // Replace this with the address of your deployed contract
    process.env.REACT_APP_RSU,
    abi,
    signer
);

// const tx = await contract.addVehicle(address);
// console.log("Mining transaction...");
// console.log(`https://${network}.etherscan.io/tx/${tx.hash}`);
// // Waiting for the transaction to be mined
// const receipt = await tx.wait();
// // The transaction is now on chain!
// console.log(`Mined in block ${receipt.blockNumber}`);
