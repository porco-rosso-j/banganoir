import { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextInput,
	Text,
	Group,
	Center,
	Stack,
	CopyButton,
	Anchor,
	Loader,
} from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import { shortenAddress, shortenTxHash } from "../utils/shortenAddr";
import { provider, wallet } from "../utils/constants";
import { ethers } from "ethers";
import useSendETH from "../hooks/useSendETH";
import OTPModal from "./Modals/OTP";

export default function WalletPage() {
	const [isModalOpen, setModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const { accountAddress } = useWalletContext();
	const {
		userOpHash,
		txHash,
		sendStatus,
		sendStatusMsg,
		setSendStatus,
		setTxHash,
		setUserOpHash,
		generateProof,
		sendTX,
	} = useSendETH();

	const [etherBalance, setEtherBalance] = useState<number>(0);
	const [sendAmount, setSendAmount] = useState<number>(0);
	const [recepient, setRecepient] = useState<string>("");

	const [faucetClicked, setFacuetClicked] = useState(false);

	const getETHBalance = async () => {
		let rawBalance = await provider.getBalance(accountAddress);
		let balance = Number(rawBalance) / 10 ** 18;
		setEtherBalance(balance);
	};

	useEffect(() => {
		const timeOutId = setTimeout(async () => {
			await getETHBalance();
		});
		return () => clearTimeout(timeOutId);
	}, []);

	async function handleFaucet() {
		setFacuetClicked(true);
		if (accountAddress) {
			const tx = await wallet.sendTransaction({
				to: accountAddress,
				value: ethers.parseEther("0.01"),
			});
			await tx.wait();
			await getETHBalance();
		} else {
			console.log("address not found");
		}
		setFacuetClicked(false);
	}

	async function sendETH(otp: string) {
		setLoading(true);
		setSendStatus(0);
		setTxHash("");
		setUserOpHash("");

		let genProofResult;
		try {
			setModalOpen(false);
			genProofResult = await generateProof(otp);
		} catch (e) {
			console.log("e: ", e);
			setErrorMessage("Something went wrong");
		}

		if (genProofResult) {
			try {
				const witnessArray: string[] = Array.from(
					genProofResult.proofData.publicInputs.values()
				);
				await sendTX(
					sendAmount,
					recepient,
					genProofResult.proofData.proof,
					witnessArray[1],
					genProofResult.timestep
				);

				await getETHBalance();
			} catch (e) {
				console.log("e: ", e);
				setErrorMessage("Something went wrong");
				setLoading(false);
			}
		} else {
			setErrorMessage("poof not found");
		}

		setLoading(false);
	}

	return (
		<>
			<Box
				style={{
					maxWidth: "650px",
					padding: "50px",
					margin: "auto",
					marginTop: "3.5rem",
					marginBottom: "1.5rem",
					boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
					borderRadius: "1.37rem",
					backgroundColor: "white",
				}}
			>
				<Stack align="center" gap="md">
					<Stack gap={1}>
						<Text style={{ textAlign: "center" }} size="lg">
							{shortenAddress(accountAddress)}
						</Text>
						<Group gap={2} style={{ fontSize: "11px" }}>
							<CopyButton value={accountAddress}>
								{({ copied, copy }) => (
									<Button
										variant="outline"
										color={copied ? "green" : "gray"}
										style={{
											fontSize: "13px",
											backgroundColor: "transparent",
											borderColor: "transparent",
										}}
										onClick={copy}
									>
										{copied ? "Copied 📋" : "Copy"}
									</Button>
								)}
							</CopyButton>
							<Text mb={2}>
								<Anchor
									href={
										"https://sepolia.scrollscan.com/address/" + accountAddress
									}
									target="_blank"
									ml={5}
									rel="noopener noreferrer"
									style={{
										textDecoration: "underline",
										color: "gray",
										fontSize: "13px",
									}}
								>
									Explorer
								</Anchor>
							</Text>
						</Group>
					</Stack>
					<Stack mt={40} gap={3}>
						<Text style={{ textAlign: "center" }} size="xl">
							Current Balance
						</Text>
						<Text style={{ textAlign: "center", fontSize: "40px" }} size="xl">
							{etherBalance} ETH
						</Text>
					</Stack>
					<Stack mt={20} align="center" style={{ boxShadow: "1rm" }}>
						<Text style={{ textAlign: "center" }} size="lg"></Text>
						<TextInput
							style={{
								width: "350px",
								backgroundColor: "transparent",
							}}
							variant="filled"
							radius="md"
							description={
								<div
									style={{
										textAlign: "left",
										marginLeft: "10px",
									}}
								>
									recipient address
								</div>
							}
							placeholder="0x123.."
							size="sm"
							onChange={(event) => setRecepient(event.currentTarget.value)}
						/>
						<TextInput
							style={{
								width: "350px",
								backgroundColor: "transparent",
							}}
							variant="filled"
							radius="md"
							description={
								<div
									style={{
										textAlign: "left",
										marginLeft: "10px",
									}}
								>
									amount
								</div>
							}
							placeholder="0.01"
							size="sm"
							onChange={(event) =>
								setSendAmount(Number(event.currentTarget.value))
							}
						/>

						<Button
							mt={20}
							color="green"
							size="md"
							loading={loading}
							disabled={loading}
							onClick={() => {
								setErrorMessage("");
								if (recepient && sendAmount) {
									setModalOpen(true);
								} else {
									setErrorMessage("Inputs not defined");
								}
							}}
						>
							Send
						</Button>
						<Stack gap={5} mt={5}>
							<Text style={{ textAlign: "center", color: "red" }}>
								{errorMessage}
							</Text>
							{loading && sendStatus !== 0 ? (
								<Text mb={5} style={{ fontSize: "16px" }}>
									[Status] {sendStatusMsg[sendStatus - 1]}
								</Text>
							) : null}
							{sendStatus === 4 && userOpHash !== "" ? (
								<Center>
									<Text style={{ fontSize: "14px" }}>
										UserOperation Hash:{" "}
										<Anchor
											ml={2}
											href={"https://app.jiffyscan.xyz/"}
											target="_blank"
											rel="noopener noreferrer"
											style={{ fontSize: "14px", textDecoration: "underline" }}
										>
											{shortenTxHash(userOpHash)}
										</Anchor>
									</Text>
								</Center>
							) : null}
							{sendStatus === 4 && txHash !== "" ? (
								<Center>
									<Text style={{ fontSize: "14px" }}>
										Transaction Hash:{" "}
										<Anchor
											ml={2}
											href={"https://sepolia.scrollscan.com/tx/" + txHash}
											target="_blank"
											rel="noopener noreferrer"
											style={{ fontSize: "14px", textDecoration: "underline" }}
										>
											{shortenAddress(txHash)}
										</Anchor>
									</Text>
								</Center>
							) : null}
						</Stack>
					</Stack>
				</Stack>
			</Box>
			<Center>
				<Group>
					<Text
						mt={10}
						size="md"
						style={{
							color: faucetClicked ? "green" : "grey",
							textDecoration: "underline",
							cursor: "pointer",
						}}
						onClick={handleFaucet}
					>
						Get faucet ETH
					</Text>
					{faucetClicked ? <Loader mt={11} color="green" size={"xs"} /> : null}
				</Group>
			</Center>

			{isModalOpen ? <OTPModal sendETH={sendETH} /> : null}
		</>
	);
}
