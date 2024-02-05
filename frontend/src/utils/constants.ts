import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
	"https://rpc.ankr.com/scroll_sepolia_testnet"
);

const wallet = new ethers.Wallet(
	import.meta.env.VITE_PRIVATE_KEY as string,
	provider
);

export { provider, wallet };
