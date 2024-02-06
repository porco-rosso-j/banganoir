import { Authenticator } from "./types/authenticator";
import { Noir, ProofData } from "@noir-lang/noir_js";
import { Fr } from "@aztec/bb.js";
import QRCode from "qrcode";
import { MerkleTree, pedersenHash } from "./utils";

export class NoirOTP {
	noir: Noir;
	authenticator: Authenticator;

	secret: string;
	step: number = 180; // 180 as default
	period: number = 64; // 64 as default => 3.2hrs ((2^6) * 3hr / 60mins)
	initial_epoch: number;
	otpNodes: string[];

	constructor(noir: Noir, authenticator: Authenticator) {
		this.noir = noir;
		this.authenticator = authenticator;
		this.secret = "";
		this.initial_epoch = 0;
		this.otpNodes = [];
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

			// can be optimized w/ timestep array
			// const timestep = Math.floor(this.initial_epoch / this.step)
			// const timesteps: number[] = Array.from({ length: this.period }, (_, index) => timestep + index);
			const one_step = i * this.step * 1000;
			const next_epoch = one_step + this.initial_epoch;

			this.authenticator.options = {
				epoch: next_epoch,
			};

			const otp = this.authenticator.generate(this.secret);
			// console.log("otp; ", otp);
			// console.log("epoch; ", next_epoch.toString());

			otp_nodes[i] = await this.getNode(otp, this.calcuTimestep(next_epoch));

			this.otpNodes[i] = otp_nodes[i].toString();
			// console.log("otp_node; ", otp_nodes[i].toString());
		}

		// console.log("otp_nodes; ", otp_nodes);
		const merkle = new MerkleTree(getDepth(otp_nodes.length));
		await merkle.initialize(otp_nodes);
		return merkle.root().toString();
	}

	async getQRCode(_user_id: string): Promise<string> {
		return await QRCode.toDataURL(
			this.authenticator.keyuri(_user_id, "NoirOTP", this.secret)
		);
	}

	async getNode(_otp: string, _timestep: number) {
		// const timestep = this.calcuTimestep(_epoch);
		// console.log("timestep; ", timestep);

		const otp = padToHexStr(_otp);
		const epoch = padToHexStr(_timestep.toString());
		// console.log("otp; ", otp);
		// console.log("epoch; ", epoch);
		return Fr.fromString(await pedersenHash([otp, epoch]));
	}

	async generateOTPProof(
		root: string,
		otp: string,
		otpNodes: string[]
	): Promise<ProofData> {
		const otpNodesFr = strToFrArray(otpNodes);

		const merkle = new MerkleTree(getDepth(otpNodes.length));
		await merkle.initialize(otpNodesFr);
		console.log("merkle: ", merkle);

		const timestep = this.calcuTimestep(Date.now());

		const leaf = await this.getNode(otp, timestep);
		console.log("leaf: ", leaf);
		const index = merkle.getIndex(leaf);
		console.log("index: ", index);
		const merkleProof = await merkle.proof(index);
		console.log("merkleProof.pathElements: ", merkleProof.pathElements);

		const hash_path = frToStrArray(merkleProof.pathElements);

		// hexilify otp and timestep
		const hexOTP = padToHexStr(otp);
		const hexTimeStep = padToHexStr(timestep.toString());
		console.log("hexOTP: ", hexOTP);
		console.log("hexTimeStep: ", hexTimeStep);

		const nullifier = await getNullifier(leaf.toString(), hexOTP, hexTimeStep);
		console.log("nullifier: ", nullifier.toString());

		const input = {
			root: root,
			nullifierHash: nullifier,
			index: index,
			hash_path: hash_path,
			otp: hexOTP,
			timestep: hexTimeStep,
		};

		console.log("input: ", input);
		await this.noir.init();
		const proof: ProofData = await this.noir.generateFinalProof(input);
		console.log("proof: ", proof);

		const result = await this.noir.verifyFinalProof(proof);
		console.log("result: ", result);

		return proof;
		// return { proof: null, publicInputs: null };
	}

	updateEpoch() {
		this.authenticator.options = {
			epoch: Date.now(),
		};
	}

	verifyOTP(_otp: string): boolean {
		try {
			return this.authenticator.verify({
				token: _otp,
				secret: this.secret,
			});
		} catch (err) {
			console.error(err);
		}
	}

	calcuTimestep(_epoch: number): number {
		return Math.floor(_epoch / 1000 / this.step);
	}

	// getCurrentTimestep(): number {
	// 	return this.calcuTimestep(Date.now());
	// }
}

export async function getNullifier(
	leaf: string,
	otp: string,
	timestep: string
): Promise<string> {
	return await pedersenHash([leaf, otp, timestep]);
}

export function getDepth(numLeaves: number): number {
	return Math.ceil(Math.log2(numLeaves));
}

// export function padToHexStr(value: number) {
// 	return `0x${value.toString(16).padStart(6, "0")}`;
// }

export function padToHexStr(value: string) {
	let hex = parseInt(value, 10).toString(16);

	// Check if the hex string length is odd
	if (hex.length % 2 !== 0) {
		// Pad with '0' at the beginning if the length is odd
		hex = "0" + hex;
	}

	return `0x${hex}`;
}

export function strToFrArray(array: string[]): Fr[] {
	return array.map((str) => Fr.fromString(str));
}

export function frToStrArray(array: Fr[]): string[] {
	return array.map((str) => str.toString());
}

/*
node --loader ts-node/esm --experimental-specifier-resolution=node ./test/main.ts --no-warnings
*/
