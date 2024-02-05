// import { authenticator } from "otplib";
// import type { Authenticator } from "@otplib/preset-browser";
// import { Authenticator, AuthenticatorOptions } from "@otplib/core";
import { Noir, ProofData, CompiledCircuit } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Fr } from "@aztec/bb.js";
import QRCode from "qrcode";
import { MerkleTree, pedersenHash } from "./utils";
//import otpCircuit from "./artifacts/otp.json" assert { type: "json" };
import otpCircuit from "./artifacts/otp.json";

declare global {
	interface Window {
		otplib: any;
	}
}

export class NoirOTP {
	secret: string;
	step: number = 180; // 180 as default
	period: number = 64; // 64 as default => 3.2hrs ((2^6) * 3hr / 60mins)
	initial_epoch: number;
	authenticator: any = {} as any;
	otpNodes: string[];

	constructor(authenticator: any) {
		this.secret = "";
		this.initial_epoch = 0;
		this.otpNodes = [];
		this.authenticator = authenticator;
	}

	async initialize() {
		await this.initAuthenticator();
		await this.generateSecret();
		return await this.generateOTPNodesAndRoot();
	}

	async initAuthenticator() {
		const current_epoch = Date.now();
		this.initial_epoch = current_epoch;

		this.authenticator.options = {
			epoch: current_epoch,
			step: this.step,
		};
	}

	async generateSecret() {
		this.secret = this.authenticator.generateSecret();
	}

	async generateOTPNodesAndRoot(): Promise<string> {
		let otp_nodes: Fr[] = [];
		for (let i = 0; i < this.period; i++) {
			// console.log("");

			const one_step = i * this.step * 1000;
			const next_epoch = one_step + this.initial_epoch;
			this.authenticator.options = {
				epoch: next_epoch,
			};

			const otp = this.authenticator.generate(this.secret);
			// console.log("otp; ", otp);
			// console.log("epoch; ", next_epoch.toString());

			otp_nodes[i] = await this.getNode(Number(otp), next_epoch);
			this.otpNodes[i] = otp_nodes[i].toString();
			// console.log("otp_node; ", otp_nodes[i].toString());
		}

		console.log("otp_nodes; ", otp_nodes);
		const merkle = new MerkleTree(calculateDepth(otp_nodes.length));
		await merkle.initialize(otp_nodes);
		return merkle.root().toString();
	}

	async getQRCode(_user_id: string): Promise<string> {
		return await QRCode.toDataURL(
			this.authenticator.keyuri(_user_id, "NoirOTP", this.secret)
		);
	}

	async getNode(_otp: number, _epoch: number) {
		const timestep = this.calcuTimestep(_epoch);
		// console.log("timestep; ", timestep);

		const otp = padAndConvertToHexStr(_otp);
		const epoch = padAndConvertToHexStr(timestep);
		// console.log("otp; ", otp);
		// console.log("epoch; ", epoch);
		return Fr.fromString(await pedersenHash([otp, epoch]));
	}

	calcuTimestep(_epoch: number): number {
		return Math.floor(_epoch / 1000 / this.step);
	}

	getCurrentTimestep(): number {
		return this.calcuTimestep(Date.now());
	}
}

export async function getNullifier(
	leaf: string,
	otp: string,
	timestep: string
): Promise<string> {
	return await pedersenHash([leaf, otp, timestep]);
}

export async function generateOTPProof(
	root: string,
	nullifier: string,
	index: string,
	hash_path: string[],
	otp: string,
	timestep: string
): Promise<ProofData> {
	const program = otpCircuit as CompiledCircuit;
	console.log("program: ", program);

	// const program = await loadOtpCircuit();
	const backend = new BarretenbergBackend(program, { threads: 8 });
	console.log("backend: ", backend);

	// hereeee
	const noir = new Noir(program, backend);
	console.log("noir: ", noir);

	const input = {
		root: root,
		nullifierHash: nullifier,
		index: index,
		hash_path: hash_path,
		otp: otp,
		timestep: timestep,
	};

	console.log("input: ", input);

	const proof: ProofData = await noir.generateFinalProof(input);
	console.log("proof: ", proof);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

	// return proof;
	return { proof: null, publicInputs: null };
}

export function calculateDepth(numLeaves: number): number {
	return Math.ceil(Math.log2(numLeaves));
}

export function padAndConvertToHexStr(value: number) {
	return `0x${value.toString(16).padStart(6, "0")}`;
}

async function loadOtpCircuit() {
	const circuit = await fetch("./artifacts/otp.json").then((res) => res.json());
	console.log("circuit: ", circuit);
	return circuit as CompiledCircuit;
}
