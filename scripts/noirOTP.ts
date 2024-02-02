import { authenticator } from "otplib";
import { Authenticator, AuthenticatorOptions } from "@otplib/core";
import { MerkleTree } from "./utils/merkle";
import { pedersenHash } from "./utils/pedersen";
import QRCode from "qrcode";
import { Fr } from "@aztec/bb.js";

// user flow
// deployment
// - provide user_id
// - generate secret
// - generate otps
//

export class NoirOTP {
	user_id: string; // email or precomputed acc addr
	secret: string;
	step: number = 180; // 180 as default
	period: number = 4; // 4 as default => 12 mins
	initial_epoch: number;
	authenticator: Authenticator;

	constructor(_user_id: string, _period?: number) {
		this.user_id = _user_id;
		// this.initial_epoch = Math.floor(Date.now() / this.step);
		// const current_epoch = Date.now();
		const current_epoch = 1706885658032;
		this.initial_epoch = current_epoch;
		this.generateSecret();

		authenticator.options = {
			epoch: current_epoch,
			step: this.step,
		} as AuthenticatorOptions;

		this.authenticator = authenticator;

		if (_period) {
			this.period = _period;
		}
	}

	generateSecret() {
		// this.secret = authenticator.generateSecret();
		this.secret = "F5RFCUCZEIMQ65BC";
	}

	// return
	// root
	// ipfs storage id?
	async generateMerkleRoot(): Promise<string> {
		let otp_nodes: Fr[] = [];
		for (let i = 0; i < this.period; i++) {
			console.log("");

			const one_step = i * this.step * 1000;
			const next_epoch = one_step + this.initial_epoch;
			this.authenticator.options = {
				epoch: next_epoch,
			};

			const otp = this.authenticator.generate(this.secret);
			console.log("otp; ", otp);
			console.log("epoch; ", next_epoch.toString());

			otp_nodes[i] = await this.getNode(Number(otp), next_epoch);
			console.log("otp_node; ", otp_nodes[i].toString());
			/*
			-- wierd Fr conversion in pedersenHash -- 
			epoch:  1706884353467
			otp:  220619
			...
			inputArray: [ Fr { value: 2229785n }, Fr { value: 25316823356230n } ]
			*/
		}

		//console.log("otp_nodes; ", otp_nodes);
		const merkle = new MerkleTree(this.calculateDepth(otp_nodes.length));
		await merkle.initialize(otp_nodes);
		return merkle.root().toString();
	}

	async getNode(_otp: number, _epoch: number) {
		const timestep = this.calcuTimestep(_epoch);
		console.log("timestep; ", timestep);

		const otp = `0x${_otp.toString(16).padStart(6, "0")}`;
		const epoch = `0x${timestep.toString(16).padStart(6, "0")}`;

		console.log("otp; ", otp);
		console.log("epoch; ", epoch);

		return Fr.fromString(await pedersenHash([otp, epoch]));
	}

	// getters

	getQRCode(): string {
		return QRCode.toDataURL(
			authenticator.keyuri(this.user_id, "NoirOTP", this.secret)
		);
	}

	calculateDepth(numLeaves: number): number {
		return Math.ceil(Math.log2(numLeaves));
	}

	calcuTimestep(_epoch: number): number {
		return Math.floor(_epoch / 1000 / this.step);
	}

	getCurrentTimestep(_epoch: number): number {
		return this.calcuTimestep(Date.now());
	}

	async getNullifier(
		leaf: string,
		otp: string,
		timestep: string
	): Promise<string> {
		return await pedersenHash([leaf, otp, timestep]);
	}
}
