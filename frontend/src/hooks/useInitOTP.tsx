import { useEffect, useState } from "react";
import { useWalletContext } from "../contexts/useWalletContext";
import { accFacContract } from "../utils/constants";
import { NoirOTP } from "@porco/noir-otp-lib";
import { authenticator } from "@otplib/preset-browser";

import { Noir, ProofData, CompiledCircuit } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import otpCircuit from "./otp.json"; // should be moved to otp-lib

// instantiate otp contract

const loadingMsgs = ["pre-generating otp...", "deploying wallet..."];

type InitOTPResult = {
	noirOTP: NoirOTP;
	root: string;
};

// type useInitOTP = {
// 	noirOTP: NoirOTP;
// 	handleNoirOTP: (noirOTP: NoirOTP) => void;
// };

export default function useInitOTP(
	noirOTP: NoirOTP | undefined,
	handleNoirOTP: (noirOTP: NoirOTP) => void,
	root: string,
	setRoot: (root: string) => void
) {
	// const { accountAddress, saveAccountAddress } = useWalletContext();

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [loadingMessage, setLoadingMessage] = useState<string>("");
	const [loadingMessageId, setLoadingMessageId] = useState<number>(0);

	const [txHash, setTxHash] = useState<string>("");
	const [result, setResult] = useState<boolean>(false);

	const [qrCode, setQRCode] = useState<string>("");
	const [qrVerified, setQRVerified] = useState<boolean>(false);

	useEffect(() => {
		if (loading && loadingMessageId !== 0) {
			setLoadingMessage(loadingMsgs[loadingMessageId]);
		}
	});

	useEffect(() => {
		if (qrCode) {
			setLoadingMessage(loadingMsgs[loadingMessageId]);
		}
	});

	async function initOTP(user: string): Promise<InitOTPResult> {
		setErrorMessage("");
		setLoading(true);
		setLoadingMessageId(1);

		// let authenticator = window.otplib.authenticator;
		console.log("authenticator: ", authenticator);
		const auth = authenticator;
		console.log("auth: ", auth);
		//const noirOTP = new NoirOTP(authenticator);

		const program = otpCircuit as CompiledCircuit;
		const backend = new BarretenbergBackend(program, { threads: 8 });
		console.log("backend: ", backend);
		const noir = new Noir(program, backend);
		console.log("noir: ", noir);

		const noirOTP = new NoirOTP(noir, authenticator);
		console.log("noirOTP: ", noirOTP.authenticator);
		console.log("noirOTP: ", noirOTP);
		handleNoirOTP(noirOTP);

		const root = await noirOTP.initialize();
		console.log("root: ", root);
		setRoot(root);

		const qr = await noirOTP.getQRCode(user);
		console.log("qr: ", qr);
		setQRCode(qr);
		console.log("qrCode: ", qrCode);

		// store them in local storage
		// setNoirOTP(noirOTP);
		setLoading(false);
		return { noirOTP, root };
	}

	async function verifyOTP(otp: string): Promise<boolean> {
		if (noirOTP) {
			noirOTP.updateEpoch();

			if (noirOTP.verifyOTP(otp)) {
				console.log("otp: ", otp);
				setQRVerified(true);
				return true;
			} else {
				setQRVerified(false);
				return false;
			}
		} else {
			console.log("noirOTP undefined ");
			return false;
		}
	}

	// async function deployAccount(
	// 	noirOTP: NoirOTP,
	// 	root: string
	// ): Promise<string> {
	async function deployAccount(): Promise<string> {
		let accAddr = "";
		if (noirOTP && root) {
			try {
				accAddr = await accFacContract.getAccountAddress(root, noirOTP.step, 0);
				console.log("accAddr: ", accAddr);

				console.log("root: ", root);
				console.log("noirOTP.step: ", noirOTP.step);

				// deploy wallet
				const tx = await accFacContract.createAccount(root, noirOTP.step, 0);
				console.log("tx: ", tx);
				const result = await tx.wait();
				console.log("result: ", result);
			} catch (e) {
				console.log("e: ", e);
			}
		}
		return accAddr;
	}

	return {
		loading,
		errorMessage,
		loadingMessage,
		txHash,
		result,
		qrCode,
		qrVerified,
		setQRCode,
		setErrorMessage,
		initOTP,
		verifyOTP,
		deployAccount,
	};
}
