import { NoirOTP } from "./noirOTP";

const user = "porcorossoj89@gmail.com";

async function main() {
	const noirOTP = new NoirOTP(user);
	console.log("noirOTP: ", noirOTP);

	const root = await noirOTP.generateMerkleRoot();
	console.log("root: ", root);

	const nullifier = await noirOTP.getNullifier(
		"0x20f83dbd2f5dfa91443296faac9df460c5e18c04e7003aca7aa86022eccc98f1",
		"0x09c0af",
		"0x90b1ca"
	);

	console.log("nullifier: ", nullifier.toString());
}

main();
