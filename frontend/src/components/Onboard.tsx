import { useEffect, useState } from "react";
import {
	Button,
	Container,
	Center,
	Text,
	Box,
	Stack,
	Anchor,
} from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import useInitOTP from "../hooks/useInitOTP";
import QRCodeModal from "./Modals/QRCode";
import DeploymentSteps from "./DeploymentSteps";
import { NoirOTP } from "@porco/noir-otp-lib";
import { shortenAddress } from "../utils/shortenAddr";
import WalletPage from "./WalletPage";

export default function Onboard() {
	const [noirOTP, setNoirOTP] = useState<NoirOTP>();
	const [root, setRoot] = useState<string>("");
	const [ipfsCID, setIpfsCID] = useState<string>("");
	const [accDeployedAddr, setDeployedAccAddr] = useState<string>("");
	const [deployed, setDeployed] = useState(false);
	const [isWalletOpen, setIsWalletOpen] = useState(false);

	const handleNoirOTP = (noirOTP: NoirOTP) => {
		setNoirOTP(noirOTP);
	};

	const { qrCode, qrVerified, setQRCode, initOTP, verifyOTP, deployAccount } =
		useInitOTP(noirOTP, handleNoirOTP, root, setRoot, ipfsCID, setIpfsCID);

	const { accountAddress, saveAccountAddress } = useWalletContext();

	const [loadingCreate, setLoadingCreate] = useState(false);
	const [setupState, setSetupState] = useState(0);

	useEffect(() => {
		if (qrVerified && !deployed) {
			setSetupState(3);
			handleDeploy();
			setDeployed(true);
		}
	});

	useEffect(() => {
		if (!accountAddress) {
			const addr = localStorage.getItem("contract_address");
			saveAccountAddress(addr ? JSON.parse(addr) : "");
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
		// saveAccountAddress(accAddr);
		setDeployedAccAddr(accAddr);
		// setDeployed(true);
		setSetupState(5);
		setLoadingCreate(false);
	}

	console.log("isWalletOpen: ", isWalletOpen);
	return isWalletOpen || accountAddress ? (
		<WalletPage />
	) : (
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
			</Container>
			<DeploymentSteps setupState={setupState} accountAddr={accDeployedAddr} />
			{setupState === 5 && accDeployedAddr !== "" ? (
				<Center>
					<Stack gap={30}>
						<Text mr={5} style={{ fontSize: "17px" }}>
							Address:{" "}
							<Anchor
								ml={2}
								href={
									"https://sepolia.scrollscan.com/address/" + accDeployedAddr
								}
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "underline" }}
							>
								{shortenAddress(accDeployedAddr)}
							</Anchor>
						</Text>

						<Button
							style={{ textAlign: "center" }}
							color="blue"
							onClick={() => {
								setIsWalletOpen(true);
								saveAccountAddress(accDeployedAddr);
							}}
						>
							Go to Wallet Page
						</Button>
					</Stack>
				</Center>
			) : null}
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
