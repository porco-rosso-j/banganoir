import {
	convertBigIntToByteArray,
	decompressByteArray,
	extractPhoto,
} from "@anon-aadhaar/core";
import { sha256Pad } from "@zk-email/helpers/dist/shaHash";
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
