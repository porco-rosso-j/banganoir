import { Button, Center, Modal, PinInput, Stack, Text } from "@mantine/core";
import { useState } from "react";

const OTPModal = (props: { sendETH: (otp: string) => void }) => {
	const [opened, setOpened] = useState(true);
	const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true);
	const [input, setInput] = useState<string>("");
	const [nums, setNums] = useState<number[]>();
	const numLen = 6;

	const [errorMessage, setErrorMessage] = useState<string>("");

	function handleInput(input: string) {
		setErrorMessage("");
		console.log("handleInput input: ", input);
		if (input.length != numLen) setConfirmDisabled(true);
		setInput(input);
	}

	function handleFilledNums(input: string) {
		const inputNums = input.split("").map(Number);
		console.log("handleFilledNums input: ", input);
		setConfirmDisabled(false);
		setNums(inputNums);
	}

	async function handleConfirm() {
		if (!nums) return;
		const num = nums.join("");
		console.log(num);
		props.sendETH(num);
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={() => {
					setOpened(false);
				}}
				withCloseButton={false}
			>
				<Text
					style={{ textAlign: "center", fontWeight: "bold" }}
					mx={10}
					my={10}
				>
					Open your Authenticator App and enter given one-time password below
				</Text>
				<Center mt={30}>
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
							disabled={confirmDisabled}
							mb={5}
						>
							Confirm
						</Button>
						<Text style={{ color: "red" }}>{errorMessage}</Text>
					</Stack>
				</Center>
			</Modal>
		</>
	);
};

export default OTPModal;
