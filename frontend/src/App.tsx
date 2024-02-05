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
					bg={"linear-gradient(rgba(255,0,255,0.01),rgba(180,0,1,0.5))"}
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
