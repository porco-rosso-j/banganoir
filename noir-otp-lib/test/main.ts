import { Fr } from "@aztec/bb.js";
import {
	NoirOTP,
	getNullifier,
	generateOTPProof,
	calculateDepth,
	padAndConvertToHexStr,
} from "../src/noirOTP";
import { write, read } from "./utils/readWritejson";
import { user, noirOTPContract, provider } from "./utils/constants";
import { MerkleTree } from "../src/utils/merkle";
import { verifierAddr } from "../src/utils/constants";

async function setup() {
	const noirOTP = new NoirOTP();
	const root = await noirOTP.initialize();
	console.log("noirOTP: ", noirOTP);
	console.log("root: ", root);

	console.log("getQRCode: ", await noirOTP.getQRCode(user));

	const OTPNodes = JSON.stringify(noirOTP.otpNodes, null, 2);
	await write(OTPNodes);

	// init contract
	const tx = await noirOTPContract.initalzieNoirOTP(
		verifierAddr,
		root,
		noirOTP.step
	);
	const result = await tx.wait();
	console.log("result: ", result);
}

async function verify(otp: number) {
	// re-constrcut merkle tree out of leaves
	const otpNodes: string[] = await read();

	// console.log("otpNodes: ", otpNodes);
	const otpNodesFr = otpNodes.map((str) => Fr.fromString(str));
	// console.log("otpNodesFr: ", otpNodesFr);

	const merkle = new MerkleTree(calculateDepth(otpNodes.length));
	await merkle.initialize(otpNodesFr);

	//console.log("merkle: ", merkle);

	const noirOTP = new NoirOTP();

	// get a leave from otp and current time stamp
	const currentTime = Date.now();
	provider.getBlockNumber();
	const leaf = await noirOTP.getNode(otp, currentTime);
	console.log("leaf: ", leaf.toString());

	// hexilify otp and timestep
	const hexOTP = padAndConvertToHexStr(otp);
	const hexTimeStep = padAndConvertToHexStr(noirOTP.calcuTimestep(currentTime));
	console.log("hexOTP: ", hexOTP);
	console.log("hexTimeStep: ", hexTimeStep);

	// create nullifier
	const nullifier = await getNullifier(leaf.toString(), hexOTP, hexTimeStep);
	console.log("nullifier: ", nullifier.toString());

	const index = merkle.getIndex(leaf);
	console.log("index: ", index);
	const merkleProof = await merkle.proof(index);
	console.log("merkleProof.pathElements: ", merkleProof.pathElements);

	const hash_path = merkleProof.pathElements.map((str) => str.toString());

	// generate proof
	const proof = await generateOTPProof(
		merkle.root().toString(),
		nullifier,
		index.toString(),
		hash_path,
		hexOTP,
		hexTimeStep
	);

	console.log("pub inputs: ", proof.publicInputs);

	// verify on-chain
	const tx = await noirOTPContract.verifyOTP(proof.proof, nullifier, {
		gasLimit: 1000000,
	});
	const result = await tx.wait();
	console.log("result: ", result);
}

setup();
// verify(164444);

async function main() {
	// console.log(calculateDepth(64)); // 6
	const currentTime = Math.floor(Date.now() / 1000);
	console.log("currentTime: ", currentTime);
	const bloclkNum = await provider.getBlockNumber();
	const block = await provider.getBlock(bloclkNum);
	console.log("timestamp: ", block?.timestamp);

	const ret = await noirOTPContract.getTimestep();
	console.log("ret: ", ret);
}
//main();
