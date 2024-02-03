import { authenticator } from "otplib";
import { Authenticator, AuthenticatorOptions } from "@otplib/core";
import { MerkleTree } from "./utils/merkle";
import { pedersenHash } from "./utils/pedersen";
import QRCode from "qrcode";
import { Fr } from "@aztec/bb.js";
import { ProofData } from "@noir-lang/types";
import {
	BarretenbergBackend,
	CompiledCircuit,
} from "@noir-lang/backend_barretenberg";
import otpCircuit from "../circuit/target/otp.json";
import { Noir } from "@noir-lang/noir_js";

export class NoirOTP {
	secret: string;
	step: number = 180; // 180 as default
	period: number = 64; // 64 as default => 3.2hrs ((2^6) * 3hr / 60mins)
	initial_epoch: number;
	authenticator: Authenticator;
	otpNodes: string[] = [];

	constructor(_step?: number, _period?: number) {
		if (_step) {
			this.step = _step;
		}
		if (_period) {
			this.period = _period;
		}
	}

	generateSecret() {
		this.secret = authenticator.generateSecret();
	}

	initAuthenticator() {
		const current_epoch = Date.now();
		this.initial_epoch = current_epoch;

		authenticator.options = {
			epoch: current_epoch,
			step: this.step,
		} as AuthenticatorOptions;

		this.authenticator = authenticator;
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

		//console.log("otp_nodes; ", otp_nodes);
		const merkle = new MerkleTree(calculateDepth(otp_nodes.length));
		await merkle.initialize(otp_nodes);
		return merkle.root().toString();
	}

	async getQRCode(_user_id: string): Promise<string> {
		return await QRCode.toDataURL(
			authenticator.keyuri(_user_id, "NoirOTP", this.secret)
		);
	}

	async getNode(_otp: number, _epoch: number) {
		const timestep = this.calcuTimestep(_epoch);
		// console.log("timestep; ", timestep);

		// const otp = `0x${_otp.toString(16).padStart(6, "0")}`;
		// const epoch = `0x${timestep.toString(16).padStart(6, "0")}`;
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
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

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

	return proof;
}

export function calculateDepth(numLeaves: number): number {
	return Math.ceil(Math.log2(numLeaves));
}

export function padAndConvertToHexStr(value: number) {
	return `0x${value.toString(16).padStart(6, "0")}`;
}

// export async function getNode(_otp: number, _epoch: number) {
// 	const timestep = calcuTimestep(_epoch);
// 	console.log("timestep; ", timestep);

// 	// const otp = `0x${_otp.toString(16).padStart(6, "0")}`;
// 	// const epoch = `0x${timestep.toString(16).padStart(6, "0")}`;
// 	const otp = padAndConvertToHexStr(_otp);
// 	const epoch = padAndConvertToHexStr(timestep);

// 	console.log("otp; ", otp);
// 	console.log("epoch; ", epoch);

// 	return Fr.fromString(await pedersenHash([otp, epoch]));
// }
