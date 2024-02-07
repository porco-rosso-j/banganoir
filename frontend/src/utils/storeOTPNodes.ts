import { CID } from "multiformats/cid";
import pinataSDK, { PinataPinOptions, PinataPinResponse } from "@pinata/sdk";

const gatewayUrl = `https://gateway.pinata.cloud/ipfs/`;

const pinata = new pinataSDK({
	pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
	pinataSecretApiKey: import.meta.env.VITE_PINATA_API_SECRET,
});

let options: PinataPinOptions = {
	pinataMetadata: {
		name: "test",
	},
	pinataOptions: {
		cidVersion: 0,
	},
};

export async function storeOTPNodesIPFS(otpNodes: string[]): Promise<string> {
	let response;

	const nodes = { nodes: JSON.stringify(otpNodes) };

	try {
		response = await pinata.pinJSONToIPFS(nodes, options);
	} catch (e) {
		console.error(e);
	}

	console.log("response: ", response);
	if (response) {
		return response.IpfsHash;
	} else {
		console.log("response undefined");
		return "";
	}
}

// // cid should be stored in prod
// localStorage.setItem(`cid`, JSON.stringify(response?.IpfsHash));
// const _cid = localStorage.getItem(`cid`);
// const cid = _cid ? JSON.parse(_cid) : undefined;

export async function getOTPNodesIPFS(cid: string): Promise<string[]> {
	const cidFromStr = CID.parse(cid);
	console.log("cidFromStr: ", cidFromStr);

	let data;
	try {
		const response = await fetch(gatewayUrl + cid);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}

		console.log("response:", response);

		data = await response.json();
		console.log("Retrieved data:", data);
	} catch (error) {
		console.error("Error retrieving data from IPFS:", error);
	}
	console.log("data: ", data);
	return JSON.parse(data.nodes);
}

// local storage
export async function storeOTPNodes(root: string, otpNodes: string[]) {
	localStorage.setItem(`${root}`, JSON.stringify(otpNodes));
}

export async function getOTPNodes(root: string): Promise<string[]> {
	const otpNodes = localStorage.getItem(`${root}`);
	const nodes = otpNodes ? JSON.parse(otpNodes) : [];
	return nodes;
}

// export async function storeOTPNodesIPFS(otpNodes: string[]) {
// 	const helia = await createHelia();
// 	const j = json(helia);
// 	const myImmutableAddress = await j.add({
// 		nodes: JSON.stringify(otpNodes),
// 	});

// 	console.log("cid", myImmutableAddress);
// 	helia.pins.add(myImmutableAddress);
// 	console.log("isPinned", await helia.pins.isPinned(myImmutableAddress));
// 	console.log("get", await j.get(myImmutableAddress));
// 	const CIDStr = myImmutableAddress.toString();
// 	console.log("cid str: ", CIDStr);

// 	// cid should be stored in prod
// 	localStorage.setItem(`cid`, JSON.stringify(CIDStr));

// 	console.log("isPinned", await helia.pins.isPinned(myImmutableAddress));
// 	helia.stop();
// }

// export async function getOTPNodesIPFS(root: string): Promise<string[]> {
// 	// in test
// 	const _cid = localStorage.getItem(`cid`);
// 	const cid = _cid ? JSON.parse(_cid) : undefined;
// 	//

// 	console.log("cid: ", cid);
// 	const helia = await createHelia();
// 	console.log("helia: ", helia);
// 	console.log("helia: ", helia.libp2p.peerId.toString());
// 	const j = json(helia);

// 	console.log("heliaJson: ", j);

// 	const cidFromStr = CID.parse(cid);
// 	console.log("isPinned", await helia.pins.isPinned(cidFromStr));

// 	console.log("cidFromStr: ", cidFromStr);
// 	const data = await j.get(cidFromStr);
// 	console.log("data: ", data);

// 	helia.stop();
// 	// @ts-ignore
// 	return JSON.parse(data.nodes);
// }
