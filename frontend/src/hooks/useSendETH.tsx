import { useContext, useEffect, useState } from "react";
import {
	entryPoint,
	noir,
	pimlicoPaymasterClientV1,
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
import {
	getGas,
	getUserOp,
	getUserOpHash,
	toJsonUserOp,
} from "../utils/userOpUtils";
import {
	AnonAadhaarContext,
	useAnonAadhaar,
} from "../anon-aadhaar-react/hooks/useAnonAadhaar";
import { processAadhaarArgs } from "../anon-aadhaar-react";
import { AnonAadhaarCore, packGroth16Proof } from "@anon-aadhaar/core";
import { GetUserOperationReceiptReturnType } from "permissionless";

type GenProofResultType = {
	proofData: ProofData;
	timestep: number;
};

export default function useSendETH() {
	const { state, startReq, useTestAadhaar } = useContext(AnonAadhaarContext);
	const [anonAadhaar] = useAnonAadhaar();
	const [anonAadhaarCore, setAnonAadhaarCore] = useState<AnonAadhaarCore>();
	const { qrData, accountAddress } = useWalletContext();
	const [sendStatus, setSendStatus] = useState<number>(0);
	const [txGas, setTxGas] = useState<bigint>(0n);

	const [userOpHash, setUserOpHash] = useState<string>("");
	const [calldata, setCalldata] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [txResult, setTxResult] = useState<boolean>(false);

	const accContract = new ethers.Contract(
		accountAddress,
		AccArtifact.abi,
		provider
	);

	const sendStatusMsg = [
		"Generating AnonAadhaar Proof. It may take a few mins... (1/4)",
		"Generating NoirOTP Proof. It may take more than a minute... (2/4)",
		"Creating Transaction... (3/4)",
		"Broadcasting Transaction... (4/4)",
		txResult
			? "Done! Your tx was successfully sent!"
			: "Failed. Something went wrong.",
	];

	useEffect(() => {
		if (anonAadhaar.status === "logged-in" && !anonAadhaarCore)
			setAnonAadhaarCore(anonAadhaar.anonAadhaarProof);
	}, [anonAadhaar, anonAadhaarCore]);

	console.log("status: ", anonAadhaar.status);
	console.log("anonAadhaar.anonAadhaarProof: ", anonAadhaarCore?.proof);

	async function createUserOp(
		amount: number,
		recipient: string
	): Promise<string> {
		const tx = await accContract.execute.populateTransaction(
			recipient,
			ethers.parseEther(amount.toString()),
			"0x"
		);
		console.log("tx: ", tx);
		setCalldata(tx.data);

		const gas = await getGas();
		setTxGas(gas);
		const userOpHash = await getUserOpHash(accountAddress, tx.data, gas);
		console.log("userOpHash: ", userOpHash);
		setUserOpHash(userOpHash);

		return userOpHash;
	}

	async function generateAnonAadahaarProof(
		amount: number,
		recipient: string
	): Promise<any> {
		const userOpHash = await createUserOp(amount, recipient);

		if (qrData === null) throw new Error("Missing application Id!");

		const args = await processAadhaarArgs(qrData, useTestAadhaar, userOpHash);
		console.log("args: ", args);

		startReq({ type: "login", args });
	}

	async function generateNoirOTPProof(
		otp: string
	): Promise<GenProofResultType> {
		// proof generation
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

		console.log("noirOTP: ", noirOTP);
		console.log("otp!!: ", otp);

		const root = await accContract.merkleRoot();
		console.log("root: ", root);
		// await noirOTP.noir.init();
		const proofData = await noirOTP.generateOTPProof(root, otp, otpNodes);
		console.log("proofData: ", proofData);

		// await testVerify(proofData);
		return { proofData, timestep };
	}

	async function sendTX(
		noirProof: Uint8Array,
		noirNullifier: string,
		timestep: number,
		amount?: number,
		recipient?: string
	) {
		if (!calldata) {
			await createUserOp(amount!, recipient!);
		}

		setSendStatus(3); // constructing userOp tx

		console.log("proof: ", noirProof);
		console.log("noirNullifier: ", noirNullifier);
		console.log("timestep: ", timestep);
		const encoder = ethers.AbiCoder.defaultAbiCoder();

		let signature;
		if (anonAadhaarCore) {
			const packedGroth16Proof = packGroth16Proof(
				anonAadhaarCore.proof.groth16Proof
			);

			console.log(
				"identityNullifier: ",
				BigInt(anonAadhaarCore.proof.identityNullifier)
			);
			console.log("timestep: ", Number(anonAadhaarCore?.proof.timestamp));
			console.log("signalHash: ", BigInt(anonAadhaarCore?.proof.signalHash));
			console.log("packedGroth16Proof: ", packedGroth16Proof);

			signature = encoder.encode(
				["uint", "uint", "uint", "uint[8]", "bytes", "bytes32", "uint"],
				[
					BigInt(anonAadhaarCore.proof.identityNullifier),
					Number(anonAadhaarCore?.proof.timestamp),
					BigInt(userOpHash),
					packedGroth16Proof,
					noirProof,
					noirNullifier,
					timestep,
				]
			);
		}

		let userOperation = await getUserOp(accountAddress, calldata, txGas);
		userOperation.signature = signature as string;
		const validUserOp = await toJsonUserOp(userOperation!);

		const finalUserOpHash = await pimlicoPaymasterClientV1.request({
			// @ts-ignore
			method: "eth_sendUserOperation",
			params: [validUserOp, entryPoint],
		});

		setSendStatus(4); // broadcasting userOps

		console.log("finalUserOpHash: ", finalUserOpHash);

		let receipt = null;
		while (receipt === null) {
			receipt = (await pimlicoPaymasterClientV1.request({
				// @ts-ignore
				method: "eth_getUserOperationReceipt",
				params: [finalUserOpHash as `0x${string}`],
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

		startReq({ type: "logout" });
		setSendStatus(5);
	}

	return {
		anonAadhaarCore,
		userOpHash,
		txHash,
		sendStatus,
		sendStatusMsg,
		setSendStatus,
		setTxHash,
		setUserOpHash,
		generateNoirOTPProof,
		generateAnonAadahaarProof,
		sendTX,
	};
}
