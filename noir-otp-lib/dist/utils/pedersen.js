import { Barretenberg, Fr } from "@aztec/bb.js";
export async function pedersenHash(inputs) {
    const bb = await Barretenberg.new();
    const inputArray = inputs.map((str) => Fr.fromString(str));
    // console.log("inputArray:] ", inputArray);
    return (await bb.pedersenHashWithHashIndex(inputArray, 0)).toString();
}
