import { ethers } from "ethers";
import EthCrypto from "eth-crypto";
import RSU from "../artifacts/contracts/RSU.sol/RSU.json";
import { rsuAddress } from "../constants";

const calculateCredibility = (location, tValueFrac) => {
    let alpha = 0.6,
        beta = 0.4,
        x = 0;
    let d = Math.sqrt(location.latitude ** 2 + location.longitude ** 2);
    const distPortion = Math.exp(-x * d);
    return alpha * distPortion + beta * tValueFrac;
};

const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
};

export const evaluateRatings = async (batch, key) => {
    if (typeof window.ethereum === undefined) return;
    await requestAccount();
    if (batch.hasOwnProperty(key) === false) return;
    console.log("hello wrold");
    const { location, message } = JSON.parse(key);
    const eventHash = EthCrypto.hex.compress(key, true);
    console.log("event hash :", eventHash);
    // Ethereum Transaction
    let countYes = 0,
        countNo = 0;
    for (const pk in batch[key]) {
        if (batch[key][pk] === 1) countYes++;
        else if (batch[key][pk] === 2) countNo++;
    }
    const P_E = Math.max(0, (countYes - countNo) / (countYes + countNo));

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(rsuAddress, RSU.abi, signer);
    let trustValues = {},
        maxTrustValue = -1000;
    for (const pk in batch[key]) {
        const addr = EthCrypto.publicKey.toAddress(pk);
        try {
            const data = await contract.getTrustValue(addr);
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
        P_CE *= C;
        P_CNE *= 1 - C;
    }
    let ratings = [];
    const P_EC = (P_E * P_CE) / (P_E * P_CE + (1 - P_E) * P_CNE);
    const factor = P_EC >= 0.5 ? 1 : -1;
    for (const pk in batch[key]) {
        const addr = EthCrypto.publicKey.toAddress(pk);
        const r = batch[key][pk] === 1 ? 1 : -1;
        ratings.push([addr, factor * r]);
    }
    const transaction = await contract.sendRatings(
        ratings,
        eventHash,
        message,
        new Date().getTime()
    );
    await transaction.wait();
};
