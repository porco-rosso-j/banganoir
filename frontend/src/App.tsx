import "@mantine/core/styles.css";
import { MantineProvider, AppShell } from "@mantine/core";
import { WalletContextProviderComponent } from "./contexts/useWalletContext";
import Onboard from "./components/Onboard";
import Header from "./components/Header";

export default function App() {
	return (
		<MantineProvider>
			<WalletContextProviderComponent>
				<AppShell
					bg={"linear-gradient(rgba(255,0,255,0.01), #7cc15e)"}
					withBorder
				>
					<AppShell.Main>
						<Header />
						<Onboard />
					</AppShell.Main>
				</AppShell>
			</WalletContextProviderComponent>
		</MantineProvider>
	);
}
