import { useEffect, useState } from "react";
import { Button, Container, Center, Text, Box } from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import useInitOTP from "../hooks/useInitOTP";
import QRCodeModal from "./Modals/QRCode";
import DeploymentSteps from "./DeploymentSteps";
import { NoirOTP } from "@porco/noir-otp-lib";

export default function Onboard() {
	const [noirOTP, setNoirOTP] = useState<NoirOTP>();
	const [root, setRoot] = useState<string>("");
	const [deployed, setDeployed] = useState(false);

	const handleNoirOTP = (noirOTP: NoirOTP) => {
		setNoirOTP(noirOTP);
	};

	const { qrCode, qrVerified, setQRCode, initOTP, verifyOTP, deployAccount } =
		useInitOTP(noirOTP, handleNoirOTP, root, setRoot);

	const { accountAddress, moduleAddress, saveAccountAddress } =
		useWalletContext();

	const [loadingCreate, setLoadingCreate] = useState(false);
	const [setupState, setSetupState] = useState(0);

	useEffect(() => {
		if (qrVerified && !deployed) {
			setSetupState(3);
			handleDeploy();
		}
	});

	async function handleCreateAccount() {
		setLoadingCreate(true);
		setSetupState(1);
		await initOTP("test");
		setSetupState(2);
	}

	async function handleVerifyOTP(otp: string): Promise<boolean> {
		return verifyOTP(otp);
	}

	async function handleDeploy() {
		const accAddr = await deployAccount();
		saveAccountAddress(accAddr);
		setDeployed(true);
		setSetupState(5);
		setLoadingCreate(false);
	}

	return (
		<>
			<Container mt={100}>
				<Box mb={50}>
					<Text
						style={{
							marginTop: 50,
							fontSize: "35px",
							textAlign: "center",
						}}
					>
						Welcome to Banganoir
					</Text>
					<Text
						style={{
							marginTop: 20,
							fontSize: "20px",
							textAlign: "center",
						}}
						mx={40}
						mb={20}
					>
						Banganoir is an ERC4337 Wallet controlled by your Aadhaar identity.{" "}
						<br />
						Noir's zkOTP provides an additional layer of security for your
						funds.
					</Text>
				</Box>
				{accountAddress && moduleAddress ? (
					<Text style={{ textAlign: "center" }}>
						A new wallet was successfully created! <br />
						address: {accountAddress}
					</Text>
				) : (
					<Center style={{ flexDirection: "column" }}>
						<Button
							style={{
								textAlign: "center",
								fontSize: "18px",
							}}
							color="green"
							onClick={handleCreateAccount}
							loading={loadingCreate}
							disabled={setupState == 5 ? true : false}
						>
							Create wallet
						</Button>
					</Center>
				)}
			</Container>
			<DeploymentSteps setupState={setupState} accountAddr={accountAddress} />

			{qrCode !== "" ? (
				<QRCodeModal
					qrCode={qrCode}
					setQRCode={setQRCode}
					handleVerifyOTP={handleVerifyOTP}
				/>
			) : null}
		</>
	);
}
