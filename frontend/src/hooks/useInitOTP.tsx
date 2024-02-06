import { useState } from "react";
import { accFacContract, noir } from "../utils/constants";
import { NoirOTP } from "@porco/noir-otp-lib";
import { authenticator } from "@otplib/preset-browser";
import { storeOTPNodes } from "../utils/storeOTPNodes";

export default function useInitOTP(
	noirOTP: NoirOTP | undefined,
	handleNoirOTP: (noirOTP: NoirOTP) => void,
	root: string,
	setRoot: (root: string) => void
) {
	const [qrCode, setQRCode] = useState<string>("");
	const [qrVerified, setQRVerified] = useState<boolean>(false);

	async function initOTP(user: string) {
		// let authenticator = window.otplib.authenticator;
		console.log("authenticator: ", authenticator);
		const auth = authenticator;
		console.log("auth: ", auth);
		//const noirOTP = new NoirOTP(authenticator);
		const noirOTP = new NoirOTP(noir, authenticator);
		console.log("noirOTP: ", noirOTP);
		handleNoirOTP(noirOTP);

		const root = await noirOTP.initialize();
		console.log("root: ", root);
		setRoot(root);

		await storeOTPNodes(root, noirOTP.otpNodes);

		const qr = await noirOTP.getQRCode(user);
		console.log("qr: ", qr);
		setQRCode(qr);
		console.log("qrCode: ", qrCode);
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
		qrCode,
		qrVerified,
		setQRCode,
		initOTP,
		verifyOTP,
		deployAccount,
	};
}
