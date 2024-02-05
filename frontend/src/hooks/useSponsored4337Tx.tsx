import { useState } from "react";
import { useWalletContext } from "../contexts/useWalletContext";
import { ethers } from "ethers";

// https://docs.pimlico.io/paymaster/verifying-paymaster/how-to/sponsor-a-user-operation
// https://dashboard.pimlico.io/sponsorship-policies/edit/sp_lazy_typhoid_mary

const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const pimlicoApiKey = "YOUR_PIMLICO_API_KEY_HERE";
const chain = "scroll"; // find the list of supported chains at https://docs.pimlico.io/bundler
const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${pimlicoApiKey}`;
const pimlicoProvider = new ethers.JsonRpcProvider(pimlicoEndpoint);

type txResult = {
	result: boolean;
	txHash: string;
	reason?: string;
};

const empTxResult = {
	result: false,
	txHash: "",
};

type Use4337TxType = {
	methodIndex: number;
	timeLock: number;
	pendingNewOwner?: string;
	secretWord?: string;
	threshold?: number;
	guardians?: string[];
};

const useSponsored4337Tx = (onOpen: () => void) => {
	const { accountAddress } = useWalletContext();

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [result, setResult] = useState<boolean>(false);

	async function sendSponsoredTx(params: Use4337TxType) {
		setErrorMessage("");
		setLoading(true);

		const userOperation = "";
		const result = await pimlicoProvider.send("pm_sponsorUserOperation", [
			userOperation,
			{ entryPoint: entryPoint },
		]);

		const paymasterAndData = result.paymasterAndData;

		let ret: txResult = empTxResult;

		/*

		const root = await generateOTPProof("0", "0", "0", [], "0", "0");
		console.log("root: ", root);
		console.log("root: ", root);
		*/

		console.log("ret: ", ret);
		if (ret.result) {
			setResult(true);
		} else if (!ret.result && ret.txHash === "") {
			console.log("ret.result: ", ret.result);
			setErrorMessage("Something went wrong");
			setLoading(false);
			return;
		}
		setTxHash(ret.txHash);
		onOpen();
		setLoading(false);
	}

	return {
		loading,
		errorMessage,
		txHash,
		result,
		setErrorMessage,
		sendSponsoredTx,
	};
};

export default useSponsored4337Tx;
