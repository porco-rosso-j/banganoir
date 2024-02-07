import { useState } from "react";
import { noir, provider } from "../utils/constants";
import AccArtifact from "../utils/artifacts/Account.json";
import { getOTPNodesIPFS } from "../utils/storeOTPNodes";
import { useWalletContext } from "../contexts/useWalletContext";
import { ethers } from "ethers";
import { NoirOTP } from "@porco/noir-otp-lib";
import { authenticator } from "@otplib/preset-browser";
import { testVerify } from "../utils/testVerify";

export default function useSendETH() {
	const { accountAddress } = useWalletContext();
	const [sendStatus, setSendStatus] = useState<number>(0);

	const accContract = new ethers.Contract(
		accountAddress,
		AccArtifact.abi,
		provider
	);

	async function generateProof(otp: string) {
		console.log("otp: ", otp);

		const ipfsCID = await accContract.ipfsHash();
		console.log("ipfsCID: ", ipfsCID);
		// const otpNodes = await getOTPNodes(root);
		const otpNodes = await getOTPNodesIPFS(ipfsCID);
		console.log("otpNodes: ", otpNodes);

		const auth = authenticator;
		console.log("auth: ", auth);
		//const noirOTP = new NoirOTP(authenticator);
		const noirOTP = new NoirOTP(noir, authenticator);
		console.log("noirOTP: ", noirOTP);

		setSendStatus(1); // proof generation
		console.log("noirOTP: ", noirOTP);
		// await noirOTP.noir.init();
		console.log("otp!!: ", otp);

		const root = await accContract.merkleRoot();
		console.log("root: ", root);
		const proofData = await noirOTP.generateOTPProof(root, otp, otpNodes);
		console.log("proofData: ", proofData);

		// await testVerify(proofData);
	}

	async function sendTX(tx: any): Promise<string> {
		return "";
	}

	return {
		generateProof,
		sendTX,
	};
}
