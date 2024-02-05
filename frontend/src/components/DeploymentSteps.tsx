import {
	Stepper,
	Text,
	Paper,
	Box,
	Center,
	Anchor,
	Stack,
} from "@mantine/core";

function DeploymentSteps(props: { setupState: number; accountAddr: string }) {
	const active = props.setupState - 1;

	function shortenAddress(address: string) {
		return (
			address.substring(0, 7) + "..." + address.substring(address.length - 6)
		);
	}

	return (
		<Box>
			<Center
				style={{
					marginLeft: "90px",
					marginTop: "20px",
					width: "100vw",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Paper
					style={{
						alignItems: "center",
						padding: "30px",
						shadow: "xs",
						width: "600px",
						backgroundColor: "transparent",
					}}
				>
					<Stepper
						active={active}
						style={{
							breakpoint: "sm",
						}}
						color="#15d10e"
						orientation="vertical"
						iconSize={25}
					>
						<Stepper.Step
							label="Generate One-Time Passwords"
							description={
								active == 0 ? "OTPs pre-generation takes about a minute..." : ""
							}
						></Stepper.Step>
						<Stepper.Step
							label="Scan QR code and verify"
							description={
								active == 1
									? "Open your Authenticator App, e.g. Google Authenticator"
									: ""
							}
						></Stepper.Step>
						<Stepper.Step
							label="Deploying Wallet"
							description={
								active == 2
									? "Your account is being deployed on Scroll Testnet..."
									: ""
							}
						></Stepper.Step>
						<Stepper.Step label="Your Wallet is ready">
							<Stack>
								<Text mr={5}>
									Congrats! Here is your account address:{" "}
									<Anchor
										ml={2}
										href={
											"https://sepolia.scrollscan.com/address/" +
											props.accountAddr
										}
										target="_blank"
										rel="noopener noreferrer"
										style={{ textDecoration: "underline" }}
									>
										{shortenAddress(props.accountAddr)}
									</Anchor>
								</Text>

								<Text>Got to wallet page?</Text>
							</Stack>
						</Stepper.Step>
					</Stepper>
				</Paper>
			</Center>
			{active === 4 && props.accountAddr !== "" ? (
				<Center>
					<Stack>
						<Text mr={5} style={{ fontSize: "17px" }}>
							Your account address:{" "}
							<Anchor
								ml={2}
								href={
									"https://sepolia.scrollscan.com/address/" + props.accountAddr
								}
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "underline" }}
							>
								{shortenAddress(props.accountAddr)}
							</Anchor>
						</Text>

						<Text style={{ textAlign: "center" }}>Got to wallet page?</Text>
					</Stack>
				</Center>
			) : null}
		</Box>
	);
}

export default DeploymentSteps;
