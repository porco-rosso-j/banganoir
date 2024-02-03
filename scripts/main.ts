import {
	NoirOTP,
	getNullifier,
	generateOTPProof,
	calculateDepth,
	padAndConvertToHexStr,
} from "./noirOTP";
import { ethers } from "ethers";
import NoirOTPArtifact from "../out/NoirOTP.sol/NoirOTP.json";
import { MerkleTree } from "./utils/merkle";
import { readFile, writeFile, promises } from "fs";
import { Fr } from "@aztec/bb.js";
import * as dotenv from "dotenv";
dotenv.config();

const filePath = "./scripts/otpNodes.json";
const user = "porcorossoj89@gmail.com";
const step = 180;

const verifierAddr = "0xb60D7F7Ec0a92da8Deb34E8255c31AcE45Faedf4";
const noirOTPAddr = "0x8cCC32010332cC5e9B2Fff7BDd19Ab8f8a43700C";

const provider = new ethers.JsonRpcProvider(
	"https://rpc.ankr.com/scroll_sepolia_testnet"
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// instantiate otp contract
const noirOTPContract = new ethers.Contract(
	noirOTPAddr,
	NoirOTPArtifact.abi,
	wallet
);

async function setup() {
	const noirOTP = new NoirOTP();
	noirOTP.generateSecret();
	noirOTP.initAuthenticator();
	console.log("noirOTP: ", noirOTP);

	const root = await noirOTP.generateOTPNodesAndRoot();
	console.log("root: ", root);

	console.log("getQRCode: ", await noirOTP.getQRCode(user));

	const OTPNodes = JSON.stringify(noirOTP.otpNodes, null, 2);

	writeFile(filePath, OTPNodes, (err) => {
		if (err) {
			console.error("e: ", err);
			return;
		}
	});

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
	const otpNodes: string[] = await readNodes();

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

async function readNodes(): Promise<string[]> {
	let nodes = [];
	const data = await promises.readFile(filePath, "utf8");

	// console.log("JSON.parse(data): ", JSON.parse(data));
	nodes = JSON.parse(data);

	// console.log("nodes: ", nodes);
	return nodes;
}

//setup();
verify(164444);

async function main() {
	// console.log(calculateDepth(64)); // 6
	const currentTime = Math.floor(Date.now() / 1000);
	console.log("currentTime: ", currentTime);
	const bloclkNum = await provider.getBlockNumber();
	const block = await provider.getBlock(bloclkNum);
	console.log("timestamp: ", block.timestamp);

	const ret = await noirOTPContract.getTimestep();
	console.log("ret: ", ret);
}
//main();
