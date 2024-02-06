import { ethers } from "ethers";
import { wallet } from "./constants";
import VerifierArtifact from "../utils/artifacts/UltraVerifier.json";
import { ProofData } from "@noir-lang/backend_barretenberg";

const verifier = "0xb60D7F7Ec0a92da8Deb34E8255c31AcE45Faedf4";

export async function testVerify(proof: ProofData) {
	const verifierContract = new ethers.Contract(
		verifier,
		VerifierArtifact.abi,
		wallet
	);

	for (const witness of proof.publicInputs.values()) {
		console.log(witness);
	}

	// If you need to collect the values into an array
	const witnessArray: string[] = Array.from(proof.publicInputs.values());
	console.log("witnessArray: ", witnessArray);
	const result = await verifierContract.verify(proof.proof, witnessArray);
	console.log("result: ", result);
}
