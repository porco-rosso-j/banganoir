/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_ENV: string;
	readonly VITE_PRIVATE_KEY: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "@otplib/preset-browser";
