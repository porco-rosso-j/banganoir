import { Group, Text, Button } from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";

export default function Header() {
	const { removeAddresses } = useWalletContext();
	return (
		<Group py={5} mt={10} justify="space-between">
			<Text
				size="25px"
				ml={35}
				style={{ color: "black", fontFamily: "Verdana, sans-serif" }}
			>
				Banganoir
			</Text>
			<Button
				onClick={removeAddresses}
				mr={35}
				style={{ backgroundColor: "gray" }}
			>
				Leave
			</Button>
		</Group>
	);
}
