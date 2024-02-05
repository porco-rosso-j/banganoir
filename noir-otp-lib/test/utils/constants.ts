import { ethers } from "ethers";
import NoirOTPArtifact from "../../../out/NoirOTP.sol/NoirOTP.json" assert { type: "json" };
import * as dotenv from "dotenv";
dotenv.config();

export const noirOTPAddr = "0x8cCC32010332cC5e9B2Fff7BDd19Ab8f8a43700C";
export const user = "porcorossoj89@gmail.com";
const step = 180;
export const provider = new ethers.JsonRpcProvider(
	"https://rpc.ankr.com/scroll_sepolia_testnet"
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

// instantiate otp contract
export const noirOTPContract = new ethers.Contract(
	noirOTPAddr,
	NoirOTPArtifact.abi,
	wallet
);
