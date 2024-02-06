export async function storeOTPNodes(root: string, otpNodes: string[]) {
	localStorage.setItem(`${root}`, JSON.stringify(otpNodes));
}

export async function getOTPNodes(root: string): Promise<string[]> {
	const otpNodes = localStorage.getItem(`${root}`);
	const nodes = otpNodes ? JSON.parse(otpNodes) : [];
	return nodes;
}

// ipfs logic wip...
