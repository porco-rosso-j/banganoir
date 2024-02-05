import { useEffect, useState } from "react";
import { Button, Container, Center, Text, Box } from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import useInitOTP from "../hooks/useInitOTP";
import QRCodeModal from "./Modals/QRCode";

export default function Onboard() {
	const { qrCode, setQRCode, initOTP } = useInitOTP();
	const {
		accountAddress,
		moduleAddress,
		saveAccountAddress,
		saveModuleAddress,
	} = useWalletContext();

	const [loadingCreate, setLoadingCreate] = useState(false);

	async function handleCreateAccount() {
		setLoadingCreate(true);

		// create otp
		await initOTP("test");
		// deploy

		saveAccountAddress("0xAAAA");
		saveModuleAddress("0xBBBB");
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
						AadhaarOTP Wallet
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
						AadhaarOTP Wallet is a Safe Wallet controlled by your Aadhaar
						identity with OTP.
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
						>
							Create wallet
						</Button>
					</Center>
				)}
			</Container>

			{qrCode !== "" ? (
				<QRCodeModal qrCode={qrCode} setQRCode={setQRCode} />
			) : null}
		</>
	);
}
