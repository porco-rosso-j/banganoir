import { ethers } from "ethers";
import AccFacArtifact from "../utils/artifacts/AccountFactory.json";
import {
	BarretenbergBackend,
	CompiledCircuit,
} from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import otpCircuit from "./artifacts/circuits/otp.json";

const provider = new ethers.JsonRpcProvider(
	"https://rpc.ankr.com/scroll_sepolia_testnet"
);

const wallet = new ethers.Wallet(
	import.meta.env.VITE_PRIVATE_KEY as string,
	provider
);

const factoryAddr = "0xF75B637Eb1D3fb14Fb9bEF9892E991679D9831e6";

const accFacContract = new ethers.Contract(
	factoryAddr,
	AccFacArtifact.abi,
	wallet
);

const program = otpCircuit as CompiledCircuit;
const backend = new BarretenbergBackend(program, { threads: 8 });
const noir = new Noir(program, backend);

export { provider, wallet, factoryAddr, accFacContract, noir };
