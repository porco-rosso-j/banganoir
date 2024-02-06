import { Stepper, Paper, Box, Center } from "@mantine/core";

function DeploymentSteps(props: { setupState: number; accountAddr: string }) {
	const active = props.setupState - 1;

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
							label="Deploy Wallet"
							description={
								active == 2
									? "Your account is being deployed on Scroll Testnet..."
									: ""
							}
						></Stepper.Step>
						<Stepper.Step label="Your Wallet is ready"></Stepper.Step>
					</Stepper>
				</Paper>
			</Center>
		</Box>
	);
}

export default DeploymentSteps;
