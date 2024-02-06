import { createContext, useContext, useState, ReactNode } from "react";

const WalletContext = createContext<WalletContextState | null>(null);

export const WalletContextProvider = WalletContext.Provider;

interface WalletContextState {
	moduleAddress: string;
	accountAddress: string;
	saveModuleAddress: (address: string) => void;
	saveAccountAddress: (address: string) => void;
	removeAddresses: () => void;
}

export const useWalletContext = () => {
	const context = useContext(WalletContext);
	if (!context) {
		throw new Error(
			"useWalletContext must be used within a WalletContextProvider"
		);
	}
	return context;
};

interface WalletContextProps {
	children: ReactNode;
}

export const WalletContextProviderComponent: React.FC<WalletContextProps> = ({
	children,
}) => {
	const [moduleAddress, setModuleAddress] = useState<string>("");
	const [accountAddress, setAccountAddress] = useState<string>("");

	const removeAddresses = () => {
		setModuleAddress("");
		setAccountAddress("");
		localStorage.removeItem(`module_address`);
		localStorage.removeItem(`contract_address`);
	};

	const saveModuleAddress = (_moduleAddress: string) => {
		setModuleAddress(_moduleAddress);
		localStorage.setItem(`module_address`, JSON.stringify(_moduleAddress));
	};

	const saveAccountAddress = (_accountAddress: string) => {
		setAccountAddress(_accountAddress);
		localStorage.setItem(`contract_address`, JSON.stringify(_accountAddress));
	};
	const contextValue: WalletContextState = {
		moduleAddress,
		accountAddress,
		saveModuleAddress,
		saveAccountAddress,
		removeAddresses,
	};
	return (
		<WalletContextProvider value={contextValue}>
			{children}
		</WalletContextProvider>
	);
};
