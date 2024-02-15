import "@mantine/core/styles.css";
import { MantineProvider, AppShell } from "@mantine/core";
import { AnonAadhaarProvider } from "./anon-aadhaar-react/provider/AnonAadhaarProvider";
import { WalletContextProviderComponent } from "./contexts/useWalletContext";
import Onboard from "./components/Onboard";
import Header from "./components/Header";

export default function App() {
	return (
		<MantineProvider>
			<AppShell
				bg={"linear-gradient(rgba(255,0,255,0.01), #7cc15e)"}
				withBorder
			>
				<AppShell.Main>
					<WalletContextProviderComponent>
						<AnonAadhaarProvider
							_useTestAadhaar={true}
							_fetchArtifactsFromServer={false}
						>
							<Header />
							<Onboard />
						</AnonAadhaarProvider>
					</WalletContextProviderComponent>
				</AppShell.Main>
			</AppShell>
		</MantineProvider>
	);
}
