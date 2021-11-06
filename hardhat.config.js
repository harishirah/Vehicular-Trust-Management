require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
	const accounts = await ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const ROPSTEN_PRIVATE_KEY =
	"75fdd6789152c980f8d8b38c863e0405a03db118e2c07fabc4f27d7a4e29adf6";

module.exports = {
	solidity: "0.8.4",
	paths: {
		artifacts: "./src/artifacts",
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		ropsten: {
			url: "https://eth-ropsten.alchemyapi.io/v2/JqF5DjS081ny1pMcb4GSgtwtcRT0JXUs",
			accounts: [`${ROPSTEN_PRIVATE_KEY}`],
			gas: 6000000,
			gasPrice: 10000000000,
		},
		kovan: {
			url: "https://eth-kovan.alchemyapi.io/v2/6kgGSWRJUm27kJMD4ynvfC4XzamiWoRJ",
			accounts: [`${ROPSTEN_PRIVATE_KEY}`],
			gas: 6000000,
			gasPrice: 10000000000,
		},
	},
};
