import { Anchor, Button, Center, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { shortenAddress } from "../../utils/shortenAddr";
import { useWalletContext } from "../../contexts/useWalletContext";

const WalletReadyModal = (props: {
	accountAddress: string;
	setIsWalletOpen: (isOpen: boolean) => void;
}) => {
	const { saveAccountAddress } = useWalletContext();
	const [opened, setOpened] = useState(true);

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
					mt={30}
					mb={20}
					style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px" }}
					mx={5}
				>
					Your wallet was successfully created! 🎉
				</Text>
				<Center mb={50}>
					<Stack gap={30}>
						<Text mr={5} style={{ fontSize: "17px" }}>
							Address:{" "}
							<Anchor
								ml={2}
								href={
									"https://sepolia.scrollscan.com/address/" +
									props.accountAddress
								}
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "underline" }}
							>
								{shortenAddress(props.accountAddress)}
							</Anchor>
						</Text>

						<Button
							style={{ textAlign: "center" }}
							color="green"
							onClick={() => {
								saveAccountAddress(props.accountAddress, true);
								props.setIsWalletOpen(true);
							}}
						>
							Go to Wallet Page
						</Button>
					</Stack>
				</Center>
			</Modal>
		</>
	);
};

export default WalletReadyModal;
