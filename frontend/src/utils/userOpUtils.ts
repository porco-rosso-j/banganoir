import {
	GetUserOperationReceiptReturnType,
	getUserOperationHash,
	signUserOperationHashWithECDSA,
	estimateUserOperationGas,
	UserOperation,
} from "permissionless";
import {
	bundlerClient,
	dummySig,
	nonce,
	pimlicoPaymasterClientV1,
} from "./constants";
import { entryPoint, scrollSepliaChainId } from "./constants";
import { Address, Hex } from "viem";

/*
export type EstimateUserOperationGasReturnType = {
    preVerificationGas: bigint
    verificationGasLimit: bigint
    callGasLimit: bigint
}
*/

export async function getGas() {
	const gas = await bundlerClient.getUserOperationGasPrice();
	return gas.standard.maxFeePerGas;
}

export async function getUserOpGas(userOp: any) {
	const ret = await bundlerClient.estimateUserOperationGas({
		userOperation: userOp,
		entryPoint,
	});
	console.log("ret: ", ret);

	return ret;
}

// export async function getUserOpGasNoError(userOp: any) {
// 	const validUserOp = await toValidStrUserOp(userOp);
// 	const ret = await pimlicoPaymasterClientV1.request({
// 		// @ts-ignore
// 		method: "eth_estimateUserOperationGas",
// 		params: [validUserOp, entryPoint],
// 	});
// 	console.log("ret: ", ret);

// 	return ret;
// }

export async function getUserOpHash(
	sender: string,
	calldata: string,
	gas: bigint
) {
	const userOperation = await getUserOp(sender, calldata, gas);

	const userOp = await toValidStrUserOp(userOperation);

	const ret = getUserOperationHash({
		userOperation: userOp,
		entryPoint,
		chainId: scrollSepliaChainId,
	});

	console.log("ret: ", ret);
	return ret;
}

export async function getUserOp(
	sender: string,
	calldata: string,
	gas?: bigint
) {
	// const gas = await getGas();
	// console.log("gas: ", gas);

	return {
		sender: sender,
		nonce: await nonce(sender),
		initCode: "0x",
		callData: calldata,
		maxFeePerGas: gas,
		maxPriorityFeePerGas: gas,
		paymasterAndData: "0x",
		callGasLimit: 150000n,
		verificationGasLimit: 1000000n,
		preVerificationGas: 200000n,
		signature: "0x",
	};
}

export async function toValidStrUserOp(userOp: UserOperationPartial) {
	return {
		sender: userOp.sender as `0x${string}`,
		nonce: userOp.nonce as bigint,
		initCode: userOp.initCode as `0x${string}`,
		callData: userOp.callData as `0x${string}`,
		maxFeePerGas: userOp.maxFeePerGas as bigint,
		maxPriorityFeePerGas: userOp.maxPriorityFeePerGas as bigint,
		signature: userOp.signature as `0x${string}`,
		paymasterAndData: userOp.paymasterAndData as `0x${string}`,
		callGasLimit: userOp.callGasLimit as bigint,
		verificationGasLimit: userOp.verificationGasLimit as bigint,
		preVerificationGas: userOp.preVerificationGas as bigint,
	};
}

export async function toJsonUserOp(userOp: UserOperationPartial) {
	return {
		sender: userOp.sender as `0x${string}`,
		nonce: fromBigintToHex(userOp.nonce as bigint),
		initCode: userOp.initCode as `0x${string}`,
		callData: userOp.callData as `0x${string}`,
		maxFeePerGas: fromBigintToHex(userOp.maxFeePerGas as bigint),
		maxPriorityFeePerGas: fromBigintToHex(
			userOp.maxPriorityFeePerGas as bigint
		),
		signature: userOp.signature as `0x${string}`,
		paymasterAndData: userOp.paymasterAndData as `0x${string}`,
		callGasLimit: fromBigintToHex(userOp.callGasLimit as bigint),
		verificationGasLimit: fromBigintToHex(
			userOp.verificationGasLimit as bigint
		),
		preVerificationGas: fromBigintToHex(userOp.preVerificationGas as bigint),
	};
}

export const fromBigintToHex = (value: bigint): Hex => {
	return `0x${value.toString(16)}` as `0x${string}`;
};

export const fromStrToHex = (value: string): Hex => {
	return value as `0x${string}`;
};

type UserOperationPartial = {
	sender?: string;
	nonce?: bigint;
	initCode?: string;
	callData?: string;
	callGasLimit?: bigint;
	verificationGasLimit?: bigint;
	preVerificationGas?: bigint;
	maxFeePerGas?: bigint;
	maxPriorityFeePerGas?: bigint;
	paymasterAndData?: string;
	signature?: string;
};
