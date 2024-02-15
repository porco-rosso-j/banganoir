import { Group, Text, Button, Anchor } from "@mantine/core";
import { useWalletContext } from "../contexts/useWalletContext";
import imgGithub from "../../public/github-mark.png";

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
			<Group>
				<Anchor
					href="https://github.com/porco-rosso-j/noir-otp"
					target="_blank"
					rel="noreferrer"
					mt={8}
					mr={10}
				>
					<img src={imgGithub} alt="github" style={{ width: 25, height: 25 }} />
				</Anchor>
				<Button
					onClick={removeAddresses}
					mr={30}
					style={{ backgroundColor: "gray" }}
				>
					Leave
				</Button>
			</Group>
		</Group>
	);
}
