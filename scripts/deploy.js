const { ethers } = require("ethers");

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require("fs");
const { abi, bytecode } = JSON.parse(fs.readFileSync("../src/RSU.json"));

const deploy = async () => {
    // Configuring the connection to an Ethereum node
    const provider = new ethers.providers.InfuraProvider(
        process.env.REACT_APP_ETHEREUM_NETWORK,
        process.env.REACT_APP_PROJECT_ID
    );
    // Creating a signing account from a private key
    const signer = new ethers.Wallet(
        process.env.REACT_APP_TRANSPORT_ADMIN,
        provider
    );
    // Using the signing account to deploy the contract
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy();
    console.log("Mining transaction...");
    console.log(
        `https://${process.env.REACT_APP_ETHEREUM_NETWORK}.etherscan.io/tx/${contract.deployTransaction.hash}`
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
