import {
	convertBigIntToByteArray,
	decompressByteArray,
	extractPhoto,
} from "@anon-aadhaar/core";
import { buildPoseidon } from "circomlibjs";

export async function copmuteUserNullifier(qrData: string): Promise<bigint> {
	const QRDataBigInt = BigInt(qrData);

	const QRDataBytes = convertBigIntToByteArray(QRDataBigInt);
	const QRDataDecode = decompressByteArray(QRDataBytes);

	const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256);

	const { photo } = extractPhoto(Array.from(signedData));

	// console.log("sha256Pad: ", sha256Pad);
	const [paddedMsg] = sha256Pad(signedData, 512 * 3);

	const poseidon = await buildPoseidon();

	let photoHash = new Uint8Array();
	for (let i = 0; i < photo.length; ++i) {
		photoHash = poseidon([photoHash, BigInt(photo[i])]);
	}

	const offset = -3;
	const four_digit = paddedMsg.slice(5 + offset, 9 + offset);
	const userNullifier = poseidon([...four_digit, photoHash]);
	console.log("userNullifier: ", userNullifier);

	const witnessUserNullifier = BigInt(poseidon.F.toString(userNullifier));
	console.log("witnessUserNullifier: ", witnessUserNullifier);

	return witnessUserNullifier;
}

// -----
// copy&paste utility funcs from @zk-email/helper to use sha256Pad() instead of installing it
// due to git fetch problem of the forked snarkjs
// https://github.com/sampritipanda/snarkjs/tree/master/src
//

// Works only on 32 bit sha text lengths
export function int64toBytes(num: number): Uint8Array {
	let arr = new ArrayBuffer(8); // an Int32 takes 4 bytes
	let view = new DataView(arr);
	view.setInt32(4, num, false); // byteOffset = 0; litteEndian = false
	return new Uint8Array(arr);
}

export function mergeUInt8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array {
	// sum of individual array lengths
	var mergedArray = new Uint8Array(a1.length + a2.length);
	mergedArray.set(a1);
	mergedArray.set(a2, a1.length);
	return mergedArray;
}

// Works only on 32 bit sha text lengths
export function int8toBytes(num: number): Uint8Array {
	let arr = new ArrayBuffer(1); // an Int8 takes 4 bytes
	let view = new DataView(arr);
	view.setUint8(0, num); // byteOffset = 0; litteEndian = false
	return new Uint8Array(arr);
}

export function assert(cond: boolean, errorMessage: string) {
	if (!cond) {
		throw new Error(errorMessage);
	}
}

// Puts an end selector, a bunch of 0s, then the length, then fill the rest with 0s.
export function sha256Pad(
	prehash_prepad_m: Uint8Array,
	maxShaBytes: number
): [Uint8Array, number] {
	let length_bits = prehash_prepad_m.length * 8; // bytes to bits
	let length_in_bytes = int64toBytes(length_bits);
	prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(2 ** 7)); // Add the 1 on the end, length 505
	// while ((prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !== 0) {
	while (
		(prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !==
		0
	) {
		prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(0));
	}
	prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, length_in_bytes);
	assert(
		(prehash_prepad_m.length * 8) % 512 === 0,
		"Padding did not complete properly!"
	);
	let messageLen = prehash_prepad_m.length;
	while (prehash_prepad_m.length < maxShaBytes) {
		prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int64toBytes(0));
	}
	assert(
		prehash_prepad_m.length === maxShaBytes,
		`Padding to max length did not complete properly! Your padded message is ${prehash_prepad_m.length} long but max is ${maxShaBytes}!`
	);
	return [prehash_prepad_m, messageLen];
}
