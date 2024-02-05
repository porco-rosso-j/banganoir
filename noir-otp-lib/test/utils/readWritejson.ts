import { readFile, writeFile } from "fs/promises";

const filePath = `./test/otpNodes.json`;

export async function write(OTPNodes: string) {
	try {
		writeFile(filePath, OTPNodes);
		console.log("File was written successfully");
	} catch (err) {
		console.error("An error occurred:", err);
	}
}

export async function read(): Promise<string[]> {
	let nodes = [];
	try {
		const data = await readFile(filePath, "utf8");
		nodes = JSON.parse(data);
		console.log("File was written successfully");
	} catch (err) {
		console.error("An error occurred:", err);
	}
	return nodes;
}
