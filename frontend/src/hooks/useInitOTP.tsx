import { useEffect, useState } from "react";
import { useWalletContext } from "../contexts/useWalletContext";
import { ethers } from "ethers";
import { wallet as sponsor } from "../utils/constants";
import AccFacArtifact from "../utils/artifacts/AccountFactory.json";
import { NoirOTP, generateOTPProof } from "@porco/noir-otp-lib";
import { authenticator } from "@otplib/preset-browser";

const facAddr = "0xa527e0029e720D5f31c8798DF7b107Fad54f40E6";
// instantiate otp contract
const accFacContract = new ethers.Contract(
	facAddr,
	AccFacArtifact.abi,
	sponsor
);

const loadingMsgs = ["pre-generating otp...", "deploying wallet..."];

export default function useInitOTP() {
	const { accountAddress } = useWalletContext();

	console.log("sponsor: ", sponsor);

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [loadingMessage, setLoadingMessage] = useState<string>("");
	const [loadingMessageId, setLoadingMessageId] = useState<number>(0);

	const [txHash, setTxHash] = useState<string>("");
	const [result, setResult] = useState<boolean>(false);

	const [qrCode, setQRCode] = useState<string>("");

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

	async function initOTP(user: string) {
		setErrorMessage("");
		setLoading(true);
		setLoadingMessageId(1);

		// let authenticator = window.otplib.authenticator;
		console.log("authenticator: ", authenticator);
		const auth = authenticator;
		console.log("auth: ", auth);
		//const noirOTP = new NoirOTP(authenticator);
		const noirOTP = new NoirOTP(authenticator);
		console.log("noirOTP: ", noirOTP.authenticator);
		console.log("noirOTP: ", noirOTP.secret);
		// const root = await noirOTP.generateOTPNodesAndRoot();
		// console.log("root: ", root);

		// const root = await generateOTPProof("0", "0", "0", [], "0", "0");
		// console.log("root: ", root);
		// console.log("root: ", root);

		const root = await noirOTP.initialize();
		console.log("root: ", root);
		console.log("root: ", root);

		const qr = await noirOTP.getQRCode("poro");
		console.log("qr: ", qr);
		setQRCode(qr);
		console.log("qrCode: ", qrCode);

		// store them in local storage

		setLoading(false);
	}

	async function verifyOTP(otp: number) {
		setErrorMessage("");
		setLoading(true);
		// deploy wallet

		setLoading(false);
	}

	async function deployAccount(params: any) {
		setErrorMessage("");
		setLoading(true);
		// deploy wallet
		const tx = await accFacContract.createAccount();
		const result = await tx.wait();
		console.log("result: ", result);

		setLoading(false);
	}

	return {
		loading,
		errorMessage,
		loadingMessage,
		txHash,
		result,
		qrCode,
		setQRCode,
		setErrorMessage,
		initOTP,
		verifyOTP,
		deployAccount,
	};
}
