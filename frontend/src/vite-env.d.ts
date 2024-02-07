/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_ENV: string;
	readonly VITE_PRIVATE_KEY: string;
	readonly VITE_PINATA_API_KEY: string;
	readonly VITE_PINATA_API_SECRET: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "@otplib/preset-browser";
