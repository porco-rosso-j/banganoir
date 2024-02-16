import { useEffect, useMemo, useState } from "react";
import { Button, Container, Center, Text, Box } from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import useInitOTP from "../hooks/useInitOTP";
import QRCodeModal from "./Modals/QRCode";
import DeploymentSteps from "./DeploymentSteps";
import { NoirOTP } from "@porco/noir-otp-lib";
import WalletPage from "./WalletPage";
import { AadhaarQRValidation } from "../anon-aadhaar-react/interface";
import { icon } from "../anon-aadhaar-react/components/ButtonLogo";
import { ProveModal } from "../anon-aadhaar-react/components/ProveModal";
import WalletReadyModal from "./Modals/WalletReady";

export default function Onboard() {
	// context
	const { qrData, accountAddress, saveAccountAddress } = useWalletContext();
	console.log("accountAddress: ", accountAddress);
	console.log("qrData: ", qrData);

	// basic state
	const [accDeployedAddr, setDeployedAccAddr] = useState<string>("");
	const [deployed, setDeployed] = useState(false);
	const [isWalletOpen, setIsWalletOpen] = useState(false);
	const [loadingCreate, setLoadingCreate] = useState(false);
	const [setupState, setSetupState] = useState(0);

	// anon aadhaar state
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null);
	const [userDataHash, setUserDataHash] = useState<bigint | null>(0n);
	const blob = new Blob([icon], { type: "image/svg+xml" });
	const anonAadhaarLogo = useMemo(() => URL.createObjectURL(blob), [icon]);

	// noir otp state
	const [noirOTP, setNoirOTP] = useState<NoirOTP>();
	const [root, setRoot] = useState<string>("");
	const [ipfsCID, setIpfsCID] = useState<string>("");

	const handleNoirOTP = (noirOTP: NoirOTP) => {
		setNoirOTP(noirOTP);
	};
	const { qrCode, qrVerified, setQRCode, initOTP, verifyOTP, deployAccount } =
		useInitOTP(
			noirOTP,
			handleNoirOTP,
			root,
			setRoot,
			ipfsCID,
			setIpfsCID,
			userDataHash
		);

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setErrorMessage(null);
		setQrStatus(null);
	};

	useEffect(() => {
		if (!accountAddress) {
			const addr = localStorage.getItem("account_address");
			saveAccountAddress(addr ? JSON.parse(addr) : "");
		}
	}, [accountAddress]);

	useEffect(() => {
		const initOTPsetup = async () => {
			if (qrData && userDataHash) {
				closeModal();
				setSetupState(2);
				await initOTP(userDataHash.toString().slice(0, 5));
				setSetupState(3);
			}
		};

		initOTPsetup();
	}, [qrData, userDataHash]);

	useEffect(() => {
		if (qrVerified && !deployed) {
			setSetupState(4);
			handleDeploy();
			setDeployed(true);
		}
	}, [qrVerified, deployed]);

	async function handleCreateAccount() {
		setLoadingCreate(true);
		setSetupState(1);
		openModal();
	}

	async function handleVerifyOTP(otp: string): Promise<boolean> {
		return verifyOTP(otp);
	}

	async function handleDeploy() {
		const accAddr = await deployAccount();
		setDeployedAccAddr(accAddr);
		setSetupState(6);
		setLoadingCreate(false);
	}

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
			{setupState === 6 && accDeployedAddr !== "" ? (
				<WalletReadyModal
					accountAddress={accDeployedAddr}
					setIsWalletOpen={setIsWalletOpen}
				/>
			) : null}
			{qrCode !== "" ? (
				<QRCodeModal
					qrCode={qrCode}
					setQRCode={setQRCode}
					handleVerifyOTP={handleVerifyOTP}
				/>
			) : null}
			{isModalOpen ? (
				<ProveModal
					isOpen={isModalOpen}
					onClose={closeModal}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
					logo={anonAadhaarLogo}
					qrStatus={qrStatus}
					setQrStatus={setQrStatus}
					userDataHash={userDataHash}
					setUserDataHash={setUserDataHash}
				/>
			) : null}
		</>
	);
}
