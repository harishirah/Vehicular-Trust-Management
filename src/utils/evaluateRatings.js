import { ethers } from "ethers";
import EthCrypto from "eth-crypto";
import RSU from "../RSU.json";

const { abi } = RSU;
const provider = new ethers.providers.InfuraProvider(
    process.env.REACT_APP_ETHEREUM_NETWORK,
    process.env.REACT_APP_PROJECT_ID
);

const calculateCredibility = (location, tValueFrac) => {
    console.log(tValueFrac);
    let alpha = 0.6,
        beta = 0.4,
        x = 0;
    // let d = Math.sqrt(location.latitude ** 2 + location.longitude ** 2);
    let d = 1;
    const distPortion = Math.exp(-x * d);
    return alpha * distPortion + beta * tValueFrac;
};

export const evaluateRatings = async (batch, key) => {
    if (batch.hasOwnProperty(key) === false) return;
    // console.log("hello wrold");
    const { location, message } = JSON.parse(key);
    const eventHash = EthCrypto.hash.keccak256(key).substr(0, 8);
    // console.log("event hash :", eventHash);
    // Ethereum Transaction
    let countYes = 0,
        countNo = 0;
    for (const pk in batch[key]) {
        if (batch[key][pk] === 1) countYes++;
        else if (batch[key][pk] === 2) countNo++;
    }
    const P_E = Math.max(0, (countYes - countNo) / (countYes + countNo));

    const signer = new ethers.Wallet(sessionStorage.getItem("sK"), provider);
    // Creating a Contract instance connected to the signer
    const contract = new ethers.Contract(
        // Replace this with the address of your deployed contract
        process.env.REACT_APP_RSU,
        abi,
        signer
    );
    let trustValues = {},
        maxTrustValue = -1000;
    for (const pk in batch[key]) {
        const addr = EthCrypto.publicKey.toAddress(pk);
        try {
            const data = await contract.getTrustValue(addr);
            if (!data) {
                continue;
            }
            trustValues[pk] = data.toNumber();
            maxTrustValue = Math.max(maxTrustValue, data.toNumber());
        } catch (err) {
            console.log(err);
        }
    }
    if (maxTrustValue === -1000) {
        console.log("MaxTrustValue ERROR");
    }
    let P_CE = 1,
        P_CNE = 1;
    for (const pk in batch[key]) {
        // TODO : send location of individual vehicle
        let C = calculateCredibility(location, trustValues[pk] / maxTrustValue);
        // console.log("C", C);
        P_CE *= C;
        P_CNE *= 1 - C;
    }
    let ratings = [];
    const P_EC = (P_E * P_CE) / (P_E * P_CE + (1 - P_E) * P_CNE);
    // console.log("PEC", P_EC);
    // console.log("PE", P_E);
    // console.log("PCE", P_CE);
    // console.log("PCNE", P_CNE);
    const factor = P_EC >= 0.5 ? 1 : -1;
    for (const pk in batch[key]) {
        const addr = EthCrypto.publicKey.toAddress(pk);
        const r = batch[key][pk] === 1 ? 1 : -1;
        ratings.push([addr, factor * r]);
    }
    // console.log("Event Hash", eventHash);
    // console.log("message", message);
    console.log("Ratings", ratings);
    const transaction = await contract.sendRatings(
        ratings,
        eventHash,
        message,
        new Date().getTime()
    );
    await transaction.wait();
};
