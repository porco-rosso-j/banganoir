import { Image, Modal } from "@mantine/core";
import { useState } from "react";

const QRCodeModal = (props: {
	qrCode: string;
	setQRCode: (code: string) => void;
}) => {
	const [opened, setOpened] = useState(true);

	return (
		<>
			{/* <Button onClick={() => setOpened(true)}>Show QR Code</Button> */}
			<Modal
				opened={opened}
				onClose={() => {
					props.setQRCode("");
					setOpened(false);
				}}
				title="Scan this QR Code in your Authenticator App"
				centered
			>
				<Image
					src={props.qrCode}
					alt="QR Code"
					fit="contain"
					width="100%"
					height={200}
				/>
			</Modal>
		</>
	);
};

export default QRCodeModal;
