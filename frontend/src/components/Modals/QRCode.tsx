import {
	Button,
	Center,
	Image,
	Modal,
	PinInput,
	Stack,
	Text,
} from "@mantine/core";
import { useState } from "react";

const QRCodeModal = (props: {
	qrCode: string;
	setQRCode: (code: string) => void;
	handleVerifyOTP: (otp: string) => Promise<boolean>;
}) => {
	const [opened, setOpened] = useState(true);
	const [verifyDisabled, setVerifyDisabled] = useState<boolean>(true);
	const [input, setInput] = useState<string>("");
	const [nums, setNums] = useState<number[]>();
	const numLen = 6;

	const [errorMessage, setErrorMessage] = useState<string>("");

	function handleInput(input: string) {
		setErrorMessage("");
		console.log("handleInput input: ", input);
		if (input.length != numLen) setVerifyDisabled(true);
		setInput(input);
	}

	function handleFilledNums(input: string) {
		const inputNums = input.split("").map(Number);
		console.log("handleFilledNums input: ", input);
		setVerifyDisabled(false);
		setNums(inputNums);
	}

	async function handleConfirm() {
		if (!nums) return;

		// setLoading(true);
		const num = nums.join("");
		console.log(num);

		const ret = await props.handleVerifyOTP(num);

		if (ret) {
			setOpened(false);
		} else {
			setErrorMessage("Invalid OTP");
		}
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={() => {
					props.setQRCode("");
					setOpened(false);
				}}
				withCloseButton={false}
			>
				<Text style={{ textAlign: "center", fontWeight: "bold" }} mx={5} my={5}>
					Scan QR Code in your Authenticator app <br /> and enter given one-time
					password below
				</Text>
				<Image
					src={props.qrCode}
					alt="QR Code"
					fit="contain"
					width="100%"
					height={150}
					style={{ marginBottom: "20px" }}
				/>
				<Center>
					<PinInput
						type={/^[0-9]*$/}
						inputType="number"
						inputMode="numeric"
						autoFocus={true}
						value={input}
						onChange={handleInput}
						length={numLen}
						size="md"
						onComplete={handleFilledNums}
						mb={20}
					/>
				</Center>
				<Center mt={10} mb={10}>
					<Stack>
						<Button
							variant="filled"
							onClick={handleConfirm}
							disabled={verifyDisabled}
							mb={5}
						>
							Verify
						</Button>
						<Text style={{ color: "red" }}>{errorMessage}</Text>
					</Stack>
				</Center>
			</Modal>
		</>
	);
};

export default QRCodeModal;
