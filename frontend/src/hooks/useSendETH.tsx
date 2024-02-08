import { useState } from "react";
import {
	entryPoint,
	noir,
	nonce,
	pimlicoPaymasterClient,
	pimlicoPaymasterClientV1,
	pimlicoProvider,
	provider,
} from "../utils/constants";
import AccArtifact from "../utils/artifacts/Account.json";
import { getOTPNodesIPFS } from "../utils/storeOTPNodes";
import { useWalletContext } from "../contexts/useWalletContext";
import { ethers } from "ethers";
import { NoirOTP } from "@porco/noir-otp-lib";
import { authenticator } from "@otplib/preset-browser";
import { testVerify } from "../utils/testVerify";
import { ProofData } from "@noir-lang/backend_barretenberg";
import { GetUserOperationReceiptReturnType } from "permissionless";

type GenProofResultType = {
	proofData: ProofData;
	timestep: number;
};

export default function useSendETH() {
	const { accountAddress } = useWalletContext();
	const [sendStatus, setSendStatus] = useState<number>(0);

	const [userOpHash, setUserOpHash] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [txResult, setTxResult] = useState<boolean>(false);

	const accContract = new ethers.Contract(
		accountAddress,
		AccArtifact.abi,
		provider
	);

	const sendStatusMsg = [
		"Generating Proof. It may take more than a minute... (1/3)",
		"Creating Transaction... (2/3)",
		"Broadcasting Transaction... (3/3)",
		txResult
			? "Done! Your tx was successfully sent!"
			: "Failed. Something went wrong.",
	];

	async function generateProof(otp: string): Promise<GenProofResultType> {
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

		const timestep = noirOTP.calcuTimestep(Date.now());

		setSendStatus(1); // proof generation
		console.log("noirOTP: ", noirOTP);
		console.log("otp!!: ", otp);

		const root = await accContract.merkleRoot();
		console.log("root: ", root);
		const proofData = await noirOTP.generateOTPProof(root, otp, otpNodes);
		console.log("proofData: ", proofData);

		// await testVerify(proofData);
		return { proofData, timestep };
	}

	async function sendTX(
		amount: number,
		recipient: string,
		proof: Uint8Array,
		nullifier: string,
		timestep: number
	) {
		setSendStatus(2); // constructing userOp tx

		const tx = await accContract.execute.populateTransaction(
			recipient,
			ethers.parseEther(amount.toString()),
			"0x"
		);
		console.log("tx: ", tx);

		// const verificaiton = await accContract.verifyOTP.staticCallResult(
		// 	proof,
		// 	nullifier,
		// 	timestep
		// );
		// console.log("verificaiton: ", verificaiton);

		console.log("proof: ", proof);
		console.log("nullifier: ", nullifier);
		console.log("timestep: ", timestep);
		const encoder = ethers.AbiCoder.defaultAbiCoder();
		const signature = encoder.encode(
			["bytes", "bytes32", "uint"],
			[proof, nullifier, timestep]
		);

		console.log("signature: ", signature);

		const userOperation = {
			sender: accountAddress,
			nonce: await nonce(accountAddress),
			initCode: "0x",
			callData: tx.data,
			maxFeePerGas: 7500000n,
			maxPriorityFeePerGas: 7500000n,
			signature: signature,
		};

		const result = await pimlicoPaymasterClient.sponsorUserOperation({
			userOperation: userOperation,
			entryPoint: entryPoint,
			// sponsorshipPolicyId: pimlicoSponsorPolicyId,
		});

		console.log("userOp result: ", result);

		const jsonUserOp = {
			...result,
			nonce: toValidStr(result.nonce),
			callGasLimit: toValidStr(result.callGasLimit),
			maxFeePerGas: toValidStr(result.maxFeePerGas),
			maxPriorityFeePerGas: toValidStr(result.maxPriorityFeePerGas),
			preVerificationGas: toValidStr(result.preVerificationGas),
			verificationGasLimit: toValidStr(result.verificationGasLimit),
		};

		console.log("jsonUserOp: ", jsonUserOp);
		console.log("pimlicoProvider: ", pimlicoProvider);

		const userOpHash = await pimlicoPaymasterClientV1.request({
			// @ts-ignore
			method: "eth_sendUserOperation",
			params: [jsonUserOp, entryPoint],
		});

		setUserOpHash(userOpHash as string);
		setSendStatus(3); // broadcasting userOps

		console.log("userOpHash: ", userOpHash);

		let receipt = null;
		while (receipt === null) {
			receipt = (await pimlicoPaymasterClientV1.request({
				// @ts-ignore
				method: "eth_getUserOperationReceipt",
				params: [userOpHash as `0x${string}`],
			})) as GetUserOperationReceiptReturnType;
			if (receipt) {
				console.log(receipt);
				console.log("receipt: ", receipt);
				setTxHash(receipt.receipt.transactionHash);

				if (receipt.success) {
					setTxResult(true);
				} else {
					setTxResult(false);
				}
			}
		}

		setSendStatus(4);
	}

	const toValidStr = (value: bigint) => {
		return `0x${value.toString(16)}` as `0x${string}`;
	};

	return {
		userOpHash,
		txHash,
		sendStatus,
		sendStatusMsg,
		setSendStatus,
		setTxHash,
		setUserOpHash,
		generateProof,
		sendTX,
	};
}
