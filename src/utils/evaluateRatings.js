import { ethers } from "ethers";
import { NonceManager } from "@ethersproject/experimental";
import EthCrypto from "eth-crypto";
import RSU from "../RSU.json";

const { abi } = RSU;
const provider = new ethers.providers.InfuraProvider(
	process.env.REACT_APP_ETHEREUM_NETWORK,
	process.env.REACT_APP_PROJECT_ID
);

const calculateCredibility = (location, tValueFrac) => {
	// console.log(tValueFrac);
	let alpha = 0.6,
		beta = 0.7,
		theta = 0;
	// let d = Math.sqrt(location.latitude ** 2 + location.longitude ** 2);
	let d = 1;
	const distPortion = Math.exp(-theta * d);
	return alpha * distPortion + beta * tValueFrac;
};

const isTransactionMined = async (transactionHash) => {
	const txReceipt = await provider.getTransactionReceipt(transactionHash);
	if (txReceipt && txReceipt.blockNumber) {
		return txReceipt;
	}
};

const decompress = (key) => {
	var arr = key.split("@");
	var obj = { message: arr[0] };
	const lat = arr[1].split(",")[0];
	const long = arr[1].split(",")[1];
	var loc = { latitude: lat, longitude: long };
	obj["location"] = loc;
	return obj;
};

const sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

const calculatePriorProbability = (lambda) => {
	return lambda * Math.exp(-lambda); // Poisson Distribution
};

export const evaluateRatings = async (batch, key) => {
	try {
		// await sleep(Math.round(10000 * Math.random()));
		if (batch.hasOwnProperty(key) === false) return;
		// console.log("hello wrold");
		const { location, message } = decompress(key);
		const eventHash = EthCrypto.hash.keccak256(key).substr(0, 8);
		// console.log("event hash :", eventHash);
		// Ethereum Transaction
		// let countYes = 0,
		// 	countNo = 0;
		// for (const pk in batch[key]) {
		// 	if (batch[key][pk] === 1) countYes++;
		// 	else if (batch[key][pk] === 2) countNo++;
		// }
		const P_E = calculatePriorProbability(1 + Math.random());

		// using ethers to fetch trust value
		const signer = new ethers.Wallet(
			sessionStorage.getItem("sK"),
			provider
		);
		const contract = new ethers.Contract(
			process.env.REACT_APP_RSU,
			abi,
			signer
		);
		const nonceManager = new NonceManager(signer);
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
		let P_BE = 1,
			P_BNE = 1;
		let B_min = 10000,
			B_max = -10000;
		const B_values = {};
		for (const pk in batch[key]) {
			// TODO : send location of individual vehicle
			let B_curr = calculateCredibility(
				location,
				trustValues[pk] / maxTrustValue
			);
			B_values[pk] = B_curr;
			B_min = Math.min(B_min, B_curr);
			B_max = Math.max(B_max, B_curr);
		}
		for (const pk in batch[key]) {
			const B_curr = (B_values[pk] - B_min) / (B_max - B_min);
			if (batch[key][pk] == 1) {
				P_BE *= B_curr;
				P_BNE *= 1 - B_curr;
			} else if (batch[key] == 2) {
				P_BE *= 1 - B_curr;
				P_BNE *= B_curr;
			}
		}
		let ratings = [];
		const P_EB = (P_E * P_BE) / (P_E * P_BE + (1 - P_E) * P_BNE);
		// console.log("PEC", P_EC);
		// console.log("PE", P_E);
		// console.log("PCE", P_CE);
		// console.log("PCNE", P_CNE);
		const factor = P_EB >= 0.5 ? 1 : -1;
		for (const pk in batch[key]) {
			const addr = EthCrypto.publicKey.toAddress(pk);
			const r = batch[key][pk] === 1 ? 1 : -1;
			ratings.push([addr, factor * r]);
		}
		// console.log("Event Hash", eventHash);
		// console.log("message", message);
		const identifier = Math.random();
		console.log(ratings.length, " Ratings:", ratings);
		const transaction = await contract.sendRatings(
			ratings,
			eventHash,
			message,
			new Date().getTime()
		);
		console.log(identifier, 1, await nonceManager.getTransactionCount());
		nonceManager.incrementTransactionCount();
		console.log(identifier, 2, await nonceManager.getTransactionCount());
		await transaction.wait();
		console.log(identifier, 3, await nonceManager.getTransactionCount());
		nonceManager.setTransactionCount(
			(await nonceManager.getTransactionCount()) - 1
		);
		console.log(identifier, 4, await nonceManager.getTransactionCount());
	} catch (err) {
		sessionStorage.setItem(
			"crash",
			Number(sessionStorage.getItem("crash")) + 1
		);
	}
};
