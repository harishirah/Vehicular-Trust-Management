const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const { abi, bytecode } = JSON.parse(
    fs.readFileSync(path.resolve(__dirname + "/../src/RSU.json"))
);

const deploy = async () => {
    // Configuring the connection to an Ethereum node
    const provider = new ethers.providers.InfuraProvider(
        "ropsten",
        "b5a4ea846a654ad6b1ea34b9ecaa668d"
    );
    // Creating a signing account from a private key
    const signer = new ethers.Wallet(
        "6b36ad3ce272c86c99fd45238f3a4a3da13e316db1aa78d7882a321f553f8e98",
        provider
    );
    // Using the signing account to deploy the contract
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy();
    console.log("Mining transaction...");
    console.log(
        `https://ropsten.etherscan.io/tx/${contract.deployTransaction.hash}`
    );
    // Waiting for the transaction to be mined
    await contract.deployTransaction.wait();
    // The contract is now deployed on chain!
    console.log(`Contract deployed at ${contract.address}`);
    console.log(
        `You can update DEMO_CONTRACT in .env to use the new contract address`
    );
};

deploy();
