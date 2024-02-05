import { ethers } from "ethers";
import AccFacArtifact from "../utils/artifacts/AccountFactory.json";

const provider = new ethers.JsonRpcProvider(
	"https://rpc.ankr.com/scroll_sepolia_testnet"
);

const wallet = new ethers.Wallet(
	import.meta.env.VITE_PRIVATE_KEY as string,
	provider
);

const factoryAddr = "0xE7041b79BBa3BbeCF6F8eDb78A53dD1FbdC75e6C";

const accFacContract = new ethers.Contract(
	factoryAddr,
	AccFacArtifact.abi,
	wallet
);

export { provider, wallet, factoryAddr, accFacContract };
