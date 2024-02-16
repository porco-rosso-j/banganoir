import { createContext, useContext, useState, ReactNode } from "react";

const WalletContext = createContext<WalletContextState | null>(null);

export const WalletContextProvider = WalletContext.Provider;

interface WalletContextState {
	moduleAddress: string;
	accountAddress: string;
	qrData: string;
	saveModuleAddress: (address: string) => void;
	saveAccountAddress: (address: string, store?: boolean) => void;
	saveQrData: (qrData: string) => void;
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
	const [qrData, setQrData] = useState<string>("");

	const removeAddresses = () => {
		setModuleAddress("");
		setAccountAddress("");
		setQrData("");
		localStorage.removeItem(`module_address`);
		localStorage.removeItem(`account_address`);
		localStorage.removeItem(`qr_data`);
	};

	// for safe module based account
	const saveModuleAddress = (_moduleAddress: string) => {
		setModuleAddress(_moduleAddress);
		localStorage.setItem(`module_address`, JSON.stringify(_moduleAddress));
	};

	const saveAccountAddress = (_accountAddress: string, store?: boolean) => {
		setAccountAddress(_accountAddress);
		if (store) {
			localStorage.setItem(`account_address`, JSON.stringify(_accountAddress));
		}
	};

	const saveQrData = (_qrData: string) => {
		setQrData(_qrData);
		localStorage.setItem(`qr_data`, JSON.stringify(_qrData));
	};

	const contextValue: WalletContextState = {
		qrData,
		moduleAddress,
		accountAddress,
		saveModuleAddress,
		saveAccountAddress,
		saveQrData,
		removeAddresses,
	};
	return (
		<WalletContextProvider value={contextValue}>
			{children}
		</WalletContextProvider>
	);
};
